import type { PhotoPackingSummary } from "./photoPackingSummary"

/**
 * Các bước trong luồng chụp ảnh theo sơ đồ flowchart:
 * preview → scanning → confirm-po → uploading → result → confirming → done
 */
export type CameraFlowStep =
  | "preview" // Camera live, chờ người dùng chụp
  | "scanning" // Đã chụp, đang quét barcode trên ảnh
  | "confirm-po" // Phát hiện PO, hiển thị dialog xác nhận
  | "uploading" // Đang gửi ảnh lên API (Send API lần 1)
  | "result" // API trả kết quả, hiển thị ảnh chụp + ảnh mẫu đối chiếu
  | "confirming" // Đang gọi API xác nhận hoàn tất (Send API lần 2)
  | "done" // Hoàn tất, hiển thị thông báo thành công

export type ResolutionKey = "720p" | "1080p" | "4k"

export interface ResolutionConfig {
  label: string
  width: number
  height: number
}

export const RESOLUTION_CONFIG: Record<ResolutionKey, ResolutionConfig> = {
  "720p": { label: "720p (HD)", width: 1280, height: 720 },
  "1080p": { label: "1080p (FHD)", width: 1920, height: 1080 },
  "4k": { label: "4K (UHD)", width: 3840, height: 2160 },
}

export interface SubmitPhotoParams {
  po: string
  stepNumber: number
  imageBase64: string
  productName?: string
}

export interface SubmitPhotoResult {
  success: boolean
  message: string
  hasNextStep?: boolean
  nextStepNumber?: number
  totalStep?: number
  isCompleted?: boolean
}

export interface ConfirmStepParams {
  po: string
  stepNumber: number
  totalStep?: number
}

export interface ConfirmStepResult {
  success: boolean
  message: string
  hasNextStep?: boolean
  nextStepNumber?: number
  totalStep?: number
  isCompleted?: boolean
}

export interface ProcessScannedCodeResult {
  success: boolean
  poCode?: string
  poSummary?: PhotoPackingSummary
  codeType: "barcode" | "qrcode"
  format?: string
  rawText: string
  errorMessage?: string
}

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
