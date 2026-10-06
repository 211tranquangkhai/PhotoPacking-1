import type { PhotoPackingSummary } from "@/types/photoPackingSummary"
import { getCachedOrders } from "@/services/photoPackingService"

export interface ProcessScannedCodeResult {
  success: boolean
  poCode?: string
  poSummary?: PhotoPackingSummary
  codeType: "barcode" | "qrcode"
  format?: string
  rawText: string
  errorMessage?: string
}

/**
 * Kết quả đối chiếu mã quét trên ảnh chụp với mã PO mục tiêu
 */
export type POValidationResult =
  | {
      status: "matched"
      detectedPO: string
      codeType?: "barcode" | "qrcode"
      format?: string
      message: string
    }
  | {
      status: "mismatched"
      detectedPO: string
      targetPO: string
      codeType?: "barcode" | "qrcode"
      format?: string
      message: string
    }
  | {
      status: "not_found"
      targetPO: string
      message: string
    }

/**
 * Trích xuất mã PO từ chuỗi thô (nếu là QR Code hoặc Barcode phân tách bằng dấu chấm phẩy)
 */
export function extractPOCode(rawText: string): string {
  if (!rawText) return ""
  const trimmed = rawText.trim()
  if (trimmed.includes(";")) {
    return (trimmed.split(";")[0] ?? "").trim()
  }
  return trimmed
}

/**
 * Đối chiếu mã phát hiện được trên ảnh chụp (Canvas) với PO đang chụp
 */
export function validateImagePO(
  scanResult: { text: string; format?: string; codeType?: "barcode" | "qrcode" } | null,
  targetPO: string
): POValidationResult {
  if (!scanResult || !scanResult.text?.trim()) {
    return {
      status: "not_found",
      targetPO,
      message:
        "Không phát hiện thấy mã vạch PO trên ảnh chụp (ảnh có thể bị mờ, lóa sáng hoặc góc chụp không có tem nhãn).",
    }
  }

  const detectedPO = extractPOCode(scanResult.text)
  const cleanDetected = detectedPO.replace(/\s+/g, "").toLowerCase()
  const cleanTarget = (targetPO || "").replace(/\s+/g, "").toLowerCase()

  const isMatch =
    cleanDetected === cleanTarget ||
    (cleanDetected.length >= 6 && cleanTarget.includes(cleanDetected)) ||
    (cleanTarget.length >= 6 && cleanDetected.includes(cleanTarget))

  if (isMatch) {
    return {
      status: "matched",
      detectedPO: extractPOCode(scanResult.text),
      codeType: scanResult.codeType,
      format: scanResult.format,
      message: `Đã phát hiện rõ tem PO #${extractPOCode(scanResult.text)} trên ảnh chụp (Khớp chính xác với đơn đang chụp).`,
    }
  }

  return {
    status: "mismatched",
    detectedPO: extractPOCode(scanResult.text),
    targetPO,
    codeType: scanResult.codeType,
    format: scanResult.format,
    message: `Cảnh báo: Mã nhận diện trên ảnh là #${extractPOCode(scanResult.text)}, khác với đơn đang chụp #${targetPO}! Vui lòng kiểm tra lại tem hàng.`,
  }
}

/**
 * Tra cứu PO theo mã barcode/QR đã quét từ danh sách đơn hàng đã tải về
 */
export function lookupPOByBarcode(barcodeValue: string): PhotoPackingSummary | null {
  if (!barcodeValue) return null
  const normalized = barcodeValue.trim().toLowerCase()
  const orders = getCachedOrders()

  const found = orders.find((item) => {
    const itemPO = item.pO.trim().toLowerCase()

    // 1. Khớp chính xác
    if (itemPO === normalized) return true

    // 2. Tách các thành phần cách nhau bằng dấu chấm phẩy (PO;Mã hàng;Số lô;Số lượng)
    const poParts = itemPO.split(";").map((p) => p.trim()).filter(Boolean)
    const scannedParts = normalized.split(";").map((p) => p.trim()).filter(Boolean)

    // Khớp số PO chính (phần đầu tiên trước dấu ;)
    if (poParts.length > 0 && poParts[0] === normalized) return true
    if (scannedParts.length > 0 && poParts[0] === scannedParts[0]) return true

    // Khớp bất kỳ phần tử nào trong chuỗi mã vạch
    if (poParts.includes(normalized)) return true
    if (scannedParts.some((part) => poParts.includes(part))) return true

    // 3. Khớp chuỗi con nếu mã quét có độ dài từ 4 ký tự trở lên
    if (normalized.length >= 4 && (itemPO.includes(normalized) || normalized.includes(itemPO))) {
      return true
    }

    return false
  }) ?? null

  if (found) return found

  // Nếu là mã PO 12 chữ số hợp lệ nhưng chưa có sẵn trong danh sách tải trước đó,
  // tự động tạo đối tượng PO cơ bản để phục vụ quy trình tiếp tục
  if (/^\d{12}$/.test(normalized)) {
    return {
      pO: normalized,
      productCode: `PRD-${normalized.slice(-4)}`,
      productName: `Sản phẩm đơn hàng #${normalized}`,
      group: "OSA",
      creator: "SCANNER",
      createTime: new Date().toISOString(),
      updator: "#SCAN",
      updatedTime: new Date().toISOString(),
      type: "Box",
      productKey: "BOX",
      totalStep: 3,
      currentStep: 0,
      notes: "Đơn hàng nhận diện tự động từ mã QR/Barcode",
      statusId: 0,
      samplePhotoUrl: "/Image/Template/Box.jpg",
      photoUrls: [],
    }
  }

  return null
}

/**
 * Xử lý kết quả quét mã đầu tiên bắt được (Barcode hoặc QR Code).
 *
 * Quy tắc nghiệp vụ:
 * 1. Ứng dụng đọc mã đầu tiên bắt được.
 * 2. Nếu là QRCode:
 *    - Tách chuỗi theo ký tự ";"
 *    - Lấy PO là phần đầu tiên sau khi tách.
 *    - Nếu PO không phải là chuỗi 12 ký tự số (/^\d{12}$/) -> Trả lỗi.
 * 3. Nếu là Barcode 1D:
 *    - Lấy chuỗi mã vạch hoặc phần trước dấu ";".
 *    - Nếu là chuỗi 12 chữ số -> Hợp lệ ngay.
 *    - Tra cứu PO trong danh sách đơn hàng đã tải.
 */
export function processScannedBarcodeResult(scanResult: {
  text: string
  format?: string
  codeType: "barcode" | "qrcode"
}): ProcessScannedCodeResult {
  const rawText = scanResult.text.trim()
  const codeType = scanResult.codeType

  // Trường hợp 1: Mã QR Code 2D
  if (codeType === "qrcode") {
    const parts = rawText.split(";")
    const poCandidate = (parts[0] ?? "").trim()

    // Kiểm tra: PO phải là chuỗi 12 ký tự số
    const is12DigitNumber = /^\d{12}$/.test(poCandidate)
    if (!is12DigitNumber) {
      return {
        success: false,
        codeType: "qrcode",
        format: scanResult.format,
        rawText,
        poCode: poCandidate,
        errorMessage: `Mã QR không hợp lệ: PO phải là chuỗi 12 ký tự số (nhận được: "${poCandidate || rawText}").`,
      }
    }

    const poSummary = lookupPOByBarcode(poCandidate)
    return {
      success: true,
      codeType: "qrcode",
      format: scanResult.format,
      rawText,
      poCode: poCandidate,
      poSummary: poSummary || undefined,
    }
  }

  // Trường hợp 2: Mã vạch Barcode 1D
  const poCandidate = extractPOCode(rawText)
  const is12DigitNumber = /^\d{12}$/.test(poCandidate)

  if (is12DigitNumber) {
    const poSummary = lookupPOByBarcode(poCandidate)
    return {
      success: true,
      codeType: "barcode",
      format: scanResult.format,
      rawText,
      poCode: poCandidate,
      poSummary: poSummary || undefined,
    }
  }

  const poSummary = lookupPOByBarcode(rawText)
  if (!poSummary) {
    return {
      success: false,
      codeType: "barcode",
      format: scanResult.format,
      rawText,
      errorMessage: `Mã Barcode "${rawText.length > 25 ? rawText.slice(0, 25) + "..." : rawText}" không khớp PO 12 số hợp lệ.`,
    }
  }

  return {
    success: true,
    codeType: "barcode",
    format: scanResult.format,
    rawText,
    poCode: poSummary.pO,
    poSummary,
  }
}
