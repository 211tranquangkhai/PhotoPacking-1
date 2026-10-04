import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react"
import { scanBarcodeFromCanvas } from "@/services/barcodeScanner"
import {
  RotateCcw,
  AlertCircle,
  SwitchCamera,
  ScanLine,
  X,
  Zap,
  ZapOff,
  Sun,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { processScannedBarcodeResult } from "@/services/poLookup"
import { submitPhoto, confirmStep } from "@/services/photoPackingApi"
import type { SubmitPhotoResult, ConfirmStepResult } from "@/services/photoPackingApi"
import { fetchStepItemApi } from "@/services/photoPackingService"
import { ConfirmPODialog } from "@/components/ConfirmPODialog"
import { PhotoResultDialog } from "@/components/PhotoResultDialog"
import { NotifyResultDialog } from "@/components/NotifyResultDialog"
import type { PhotoPackingSummary } from "@/types/photoPackingSummary"
import type { PhotoPackingItem } from "@/types/photoPackingItem"

/**
 * Các bước trong luồng chụp ảnh theo sơ đồ flowchart:
 * preview → scanning → confirm-po → uploading → result → confirming → done
 */
type CameraFlowStep =
  | "preview"     // Camera live, chờ người dùng chụp
  | "scanning"    // Đã chụp, đang quét barcode trên ảnh
  | "confirm-po"  // Phát hiện PO, hiển thị dialog xác nhận
  | "uploading"   // Đang gửi ảnh lên API (Send API lần 1)
  | "result"      // API trả kết quả, hiển thị ảnh chụp + ảnh mẫu đối chiếu
  | "confirming"  // Đang gọi API xác nhận hoàn tất (Send API lần 2)
  | "done"        // Hoàn tất, hiển thị thông báo thành công

interface CameraPageProps {
  targetOrder?: PhotoPackingSummary | null
  scannedPO?: PhotoPackingSummary | null
  scannedCodeMeta?: { format?: string; codeType?: "barcode" | "qrcode" } | null
  onBack: () => void
}

type ResolutionKey = "720p" | "1080p" | "4k"

const RESOLUTION_CONFIG: Record<
  ResolutionKey,
  { label: string; width: number; height: number }
> = {
  "720p": { label: "720p (HD)", width: 1280, height: 720 },
  "1080p": { label: "1080p (FHD)", width: 1920, height: 1080 },
  "4k": { label: "4K (UHD)", width: 3840, height: 2160 },
}

export default function CameraPage({
  targetOrder,
  scannedPO,
  scannedCodeMeta,
  onBack,
}: CameraPageProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [detectedCodeMeta, setDetectedCodeMeta] = useState<{
    format?: string
    codeType?: "barcode" | "qrcode"
  } | null>(scannedCodeMeta || null)

  // Flash / Torch state
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [hasTorchSupport, setHasTorchSupport] = useState(false)
  const [flashNotice, setFlashNotice] = useState<string | null>(null)

  // Zoom state
  const [zoom, setZoom] = useState<number>(1)
  const [availableZoomLevels, setAvailableZoomLevels] = useState<number[]>([0.5, 1, 2])
  const [supportsHardwareZoom, setSupportsHardwareZoom] = useState(false)

  // Brightness / Exposure state (-2 to +2)
  const [exposure, setExposure] = useState<number>(0)
  const [showExposureControl, setShowExposureControl] = useState(false)

  // Resolution state
  const [resolution, setResolution] = useState<ResolutionKey>("1080p")
  const [showResolutionMenu, setShowResolutionMenu] = useState(false)

  // Sample photo dialog
  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false)

  // Chi tiết bước chụp và ảnh mẫu đối chiếu (lấy on-demand từ API)
  const [activeStepItem, setActiveStepItem] = useState<PhotoPackingItem | null>(null)

  // === Luồng chụp ảnh theo sơ đồ flowchart ===
  const [flowStep, setFlowStep] = useState<CameraFlowStep>("preview")
  const [detectedPO, setDetectedPO] = useState<PhotoPackingSummary | null>(
    scannedPO || targetOrder || null
  )
  const [apiResult, setApiResult] = useState<SubmitPhotoResult | null>(null)
  const [confirmResult, setConfirmResult] = useState<ConfirmStepResult | null>(null)
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isCameraActiveRef = useRef(false)
  const cameraRequestIdRef = useRef(0)

  // Tải thông tin bước và ảnh mẫu đối chiếu on-demand từ API
  useEffect(() => {
    const currentPO = detectedPO || scannedPO || targetOrder
    if (currentPO) {
      const nextStep =
        currentPO.totalStep > 0
          ? Math.min(currentPO.totalStep, currentPO.currentStep + 1)
          : currentPO.currentStep || 1

      fetchStepItemApi(currentPO.pO, nextStep).then((item) => {
        if (item) setActiveStepItem(item)
      })
    }
  }, [detectedPO, scannedPO, targetOrder])

  // Ảnh mẫu đối chiếu (lấy từ activeStepItem vừa tải hoặc fallback ảnh mẫu chất lượng cao)
  const samplePhotoUrl =
    activeStepItem?.samplePhotoUrl ||
    detectedPO?.samplePhotoUrl ||
    targetOrder?.samplePhotoUrl ||
    scannedPO?.samplePhotoUrl ||
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80"

  // Cập nhật capabilities của camera (flash, zoom, exposure)
  const inspectTrackCapabilities = useCallback((track: MediaStreamTrack) => {
    try {
      const caps = (track.getCapabilities?.() || {}) as any

      // 1. Kiểm tra Flash/Torch
      const torchSupported = Boolean(caps.torch)
      setHasTorchSupport(torchSupported)

      // 2. Kiểm tra Zoom
      if (caps.zoom) {
        setSupportsHardwareZoom(true)
        const min = Number(caps.zoom.min) || 1
        const max = Number(caps.zoom.max) || 1
        const levels: number[] = []

        if (min <= 0.6) levels.push(0.5)
        levels.push(1)
        if (max >= 2) levels.push(2)
        if (max >= 3 && !levels.includes(2)) levels.push(3)
        if (max >= 5) levels.push(5)

        setAvailableZoomLevels(levels.length > 1 ? levels : [0.5, 1, 2])
      } else {
        setSupportsHardwareZoom(false)
        setAvailableZoomLevels([0.5, 1, 2])
      }
    } catch (e) {
      console.warn("Unable to inspect track capabilities:", e)
      setHasTorchSupport(false)
      setAvailableZoomLevels([0.5, 1, 2])
    }
  }, [])

  // Khởi động Camera khi vào trang hoặc đổi chế độ/độ phân giải
  const startCamera = useCallback(
    async (
      mode: "environment" | "user" = facingMode,
      resKey: ResolutionKey = resolution
    ) => {
      const requestId = ++cameraRequestIdRef.current
      isCameraActiveRef.current = true

      try {
        setCameraError(null)
        setIsFlashOn(false)

        // Dừng và giải phóng stream cũ nếu đang hoạt động
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            try {
              track.enabled = false
              track.stop()
            } catch {}
          })
          streamRef.current = null
        }
        if (videoRef.current) {
          try {
            videoRef.current.pause()
          } catch {}
          videoRef.current.srcObject = null
        }

        const resConfig = RESOLUTION_CONFIG[resKey]
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: resConfig.width },
            height: { ideal: resConfig.height },
          },
          audio: false,
        })

        // Nếu người dùng đã đóng trang hoặc có một request mở camera mới hơn
        if (!isCameraActiveRef.current || requestId !== cameraRequestIdRef.current) {
          newStream.getTracks().forEach((track) => {
            try {
              track.enabled = false
              track.stop()
            } catch {}
          })
          return
        }

        streamRef.current = newStream
        setStream(newStream)

        const videoTrack = newStream.getVideoTracks()[0]
        if (videoTrack) {
          inspectTrackCapabilities(videoTrack)
        }

        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }
      } catch (err) {
        if (!isCameraActiveRef.current || requestId !== cameraRequestIdRef.current) {
          return
        }
        console.error("Camera access error:", err)
        setCameraError(
          "Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera trong trình duyệt hoặc sử dụng tính năng tải ảnh bên dưới."
        )
      }
    },
    [facingMode, resolution, inspectTrackCapabilities]
  )

  // Dừng Camera và giải phóng toàn bộ phần cứng thiết bị (tắt đèn camera)
  const stopCamera = useCallback(() => {
    isCameraActiveRef.current = false
    cameraRequestIdRef.current++

    // 1. Tắt torch (flash) và giải phóng mọi media track trong streamRef
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          const caps = (track.getCapabilities?.() || {}) as any
          if (caps.torch) {
            (track.applyConstraints as any)({
              advanced: [{ torch: false }],
            }).catch(() => {})
          }
        } catch {}
        try {
          track.enabled = false
          track.stop()
        } catch {}
      })
      streamRef.current = null
    }

    // 2. Ngắt kết nối và giải phóng video element
    if (videoRef.current) {
      try {
        videoRef.current.pause()
      } catch {}
      if (videoRef.current.srcObject) {
        try {
          const srcStream = videoRef.current.srcObject as MediaStream
          srcStream.getTracks?.().forEach((track) => {
            try {
              track.enabled = false
              track.stop()
            } catch {}
          })
        } catch {}
        videoRef.current.srcObject = null
      }
    }

    setStream(null)
    setIsFlashOn(false)
  }, [])

  // Đóng trang Camera: Dừng triệt để camera phần cứng rồi mới quay về
  const handleClose = useCallback(() => {
    stopCamera()
    onBack()
  }, [stopCamera, onBack])

  // Chuyển camera trước / sau
  const toggleCameraFacing = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment"
    setFacingMode(nextMode)
    setZoom(1)
    setExposure(0)
    setIsFlashOn(false)
    startCamera(nextMode, resolution)
  }

  // Bật / Tắt Flash (Torch) thật trên thiết bị Android
  const toggleFlash = async () => {
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    if (!track) return

    try {
      const caps = (track.getCapabilities?.() || {}) as any
      if (caps.torch) {
        const nextTorch = !isFlashOn
        await (track.applyConstraints as any)({
          advanced: [{ torch: nextTorch }],
        })
        setIsFlashOn(nextTorch)
      } else {
        setFlashNotice("Thiết bị hoặc camera hiện tại không hỗ trợ đèn Flash.")
        setTimeout(() => setFlashNotice(null), 3000)
      }
    } catch (err) {
      console.warn("Flash toggle error:", err)
      setFlashNotice("Không thể điều khiển Flash trên trình duyệt này.")
      setTimeout(() => setFlashNotice(null), 3000)
    }
  }

  // Điều chỉnh tiêu cự (Zoom)
  const handleZoomChange = async (targetZoom: number) => {
    setZoom(targetZoom)
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    if (!track) return

    try {
      const caps = (track.getCapabilities?.() || {}) as any
      if (caps.zoom) {
        const min = Number(caps.zoom.min) || 1
        const max = Number(caps.zoom.max) || 1
        const clamped = Math.min(Math.max(targetZoom, min), max)
        await (track.applyConstraints as any)({
          advanced: [{ zoom: clamped }],
        })
      }
    } catch (err) {
      console.warn("Hardware zoom apply error:", err)
    }
  }

  // Điều chỉnh độ sáng (Exposure / Brightness)
  const handleExposureChange = async (val: number) => {
    setExposure(val)
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    if (!track) return

    try {
      const caps = (track.getCapabilities?.() || {}) as any
      if (caps.exposureCompensation) {
        const min = Number(caps.exposureCompensation.min) || -2
        const max = Number(caps.exposureCompensation.max) || 2
        const clamped = Math.min(Math.max(val, min), max)
        await (track.applyConstraints as any)({
          advanced: [{ exposureCompensation: clamped }],
        })
      }
    } catch (err) {
      console.warn("Exposure hardware apply error:", err)
    }
  }

  // Đổi độ phân giải
  const handleResolutionChange = (newRes: ResolutionKey) => {
    setResolution(newRes)
    setShowResolutionMenu(false)
    startCamera(facingMode, newRes)
  }

  // Effect khởi động và dọn dẹp camera
  useEffect(() => {
    isCameraActiveRef.current = true
    setCapturedImage(null)
    setFlowStep("preview")
    setDetectedPO(scannedPO || targetOrder || null)
    startCamera(facingMode, resolution)

    const handleBeforeUnload = () => {
      stopCamera()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (videoRef.current && stream && !capturedImage) {
      videoRef.current.srcObject = stream
    }
  }, [stream, capturedImage])

  // Quét mã Barcode & QR Code từ canvas ảnh chụp → Detect PO → Chuyển sang bước Confirm
  const processQRCode = (canvas: HTMLCanvasElement) => {
    setFlowStep("scanning")
    setScanErrorMessage(null)

    // Đợi 700ms để hiển thị hiệu ứng laser quét mã sinh động
    setTimeout(async () => {
      try {
        // Luôn quét đồng thời cả Barcode 1D và QR Code 2D ("both")
        const scanResult = await scanBarcodeFromCanvas(canvas, "both")

        if (scanResult?.text?.trim()) {
          // Bắt mã đầu tiên phát hiện được và xử lý theo quy tắc nghiệp vụ
          const processed = processScannedBarcodeResult(scanResult)

          if (!processed.success) {
            // Mã không hợp lệ (ví dụ: QR không chứa PO 12 ký tự số hoặc barcode không khớp)
            setCapturedImage(null)
            setFlowStep("preview")
            setScanErrorMessage(
              processed.errorMessage || "Mã quét không hợp lệ. Vui lòng thử lại."
            )
            setTimeout(() => setScanErrorMessage(null), 5000)
            return
          }

          // Nhận diện mã hợp lệ thành công
          setDetectedCodeMeta({
            format: processed.format,
            codeType: processed.codeType,
          })
          setDetectedPO(processed.poSummary!)
          setFlowStep("confirm-po")
          return
        }

        // Trường hợp không phát hiện mã nào trong ảnh chụp:
        // Nếu trước đó đã có đơn hàng được chọn từ trước (targetOrder hoặc scannedPO)
        let fallbackPO = scannedPO || targetOrder || null
        if (fallbackPO) {
          setDetectedPO(fallbackPO)
          setFlowStep("confirm-po")
        } else {
          // Không tìm thấy mã nào và cũng không có đơn hàng chọn sẵn
          setCapturedImage(null)
          setFlowStep("preview")
          setScanErrorMessage(
            "Không phát hiện mã Barcode hoặc QR Code trong ảnh. Vui lòng căn chỉnh rõ nét và chụp lại."
          )
          setTimeout(() => setScanErrorMessage(null), 5000)
        }
      } catch {
        setCapturedImage(null)
        setFlowStep("preview")
        setScanErrorMessage("Lỗi khi phân tích mã. Vui lòng thử lại.")
        setTimeout(() => setScanErrorMessage(null), 4000)
      }
    }, 700)
  }

  // Chụp ảnh từ Video preview + Đóng dấu thời gian ở góc dưới bên phải (dd/MM/yyyy HH:mm)
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video.videoWidth === 0 || video.videoHeight === 0) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 1. Áp dụng độ sáng nếu có
    if (exposure !== 0) {
      ctx.filter = `brightness(${1 + exposure * 0.25})`
    } else {
      ctx.filter = "none"
    }

    // 2. Vẽ hình ảnh từ video sang canvas (có crop nếu dùng digital zoom)
    if (!supportsHardwareZoom && zoom !== 1) {
      const sw = video.videoWidth / zoom
      const sh = video.videoHeight / zoom
      const sx = (video.videoWidth - sw) / 2
      const sy = (video.videoHeight - sh) / 2
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    // Tắt filter để vẽ text và watermark rõ nét
    ctx.filter = "none"

    // 3. ĐÓNG DẤU THỜI GIAN VÀO GÓC DƯỚI BÊN PHẢI (dd/MM/yyyy HH:mm)
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const timestampText = `${day}/${month}/${year} ${hours}:${minutes}`

    // Tính kích thước chữ tỉ lệ theo độ phân giải ảnh
    const fontSize = Math.max(18, Math.round(canvas.width * 0.024))
    ctx.font = `bold ${fontSize}px "Segoe UI", Roboto, -apple-system, sans-serif`
    const textMetrics = ctx.measureText(timestampText)
    const padX = fontSize * 0.65
    const padY = fontSize * 0.4
    const boxW = textMetrics.width + padX * 2
    const boxH = fontSize + padY * 2
    const margin = Math.max(16, Math.round(canvas.width * 0.025))
    const boxX = canvas.width - boxW - margin
    const boxY = canvas.height - boxH - margin

    // Vẽ nền mờ phía sau text
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)"
    if (typeof (ctx as any).roundRect === "function") {
      ctx.beginPath()
      ;(ctx as any).roundRect(boxX, boxY, boxW, boxH, fontSize * 0.35)
      ctx.fill()
    } else {
      ctx.fillRect(boxX, boxY, boxW, boxH)
    }

    // Vẽ chữ thời gian màu trắng
    ctx.fillStyle = "#ffffff"
    ctx.textBaseline = "middle"
    ctx.fillText(timestampText, boxX + padX, boxY + boxH / 2)

    // Xuất ra base64
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
    setCapturedImage(dataUrl)

    // Tiến hành quét QR
    processQRCode(canvas)
  }

  // Tải ảnh từ thiết bị (fallback)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canvasRef.current) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current!
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.drawImage(img, 0, 0)
        setCapturedImage(event.target?.result as string)
        processQRCode(canvas)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Chụp lại — reset toàn bộ trạng thái về preview
  const handleRetake = () => {
    setCapturedImage(null)
    setFlowStep("preview")
    setDetectedPO(scannedPO || targetOrder || null)
    setApiResult(null)
    setConfirmResult(null)
    setScanErrorMessage(null)
    setDetectedCodeMeta(null)

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    } else {
      startCamera(facingMode, resolution)
    }
  }

  // Xác nhận PO → gửi ảnh lên API (Send API lần 1)
  const handleConfirmPO = async () => {
    if (!detectedPO || !capturedImage) return
    setFlowStep("uploading")

    try {
      const nextStep =
        detectedPO.totalStep > 0
          ? Math.min(detectedPO.totalStep, detectedPO.currentStep + 1)
          : detectedPO.currentStep || 1

      const result = await submitPhoto({
        po: detectedPO.pO,
        stepNumber: nextStep,
        imageBase64: capturedImage,
        productName: detectedPO.productName,
      })
      setApiResult(result)
      setFlowStep("result")
    } catch {
      setApiResult({
        success: false,
        message: "Lỗi kết nối server. Vui lòng kiểm tra mạng và thử lại.",
      })
      setFlowStep("result")
    }
  }

  // Xác nhận kết quả OK → gọi API lần 2 (Confirm Step)
  const handleConfirmResult = async () => {
    if (!detectedPO) return
    setFlowStep("confirming")

    try {
      const nextStep =
        detectedPO.totalStep > 0
          ? Math.min(detectedPO.totalStep, detectedPO.currentStep + 1)
          : detectedPO.currentStep || 1

      const result = await confirmStep({
        po: detectedPO.pO,
        stepNumber: nextStep,
        totalStep: detectedPO.totalStep,
      })
      if (result.success) {
        setConfirmResult(result)
        setFlowStep("done")
      } else {
        setApiResult({ success: false, message: result.message })
        setFlowStep("result")
      }
    } catch {
      setApiResult({
        success: false,
        message: "Lỗi khi xác nhận. Vui lòng thử lại.",
      })
      setFlowStep("result")
    }
  }

  // Tiếp tục chụp bước tiếp theo sau khi đã hoàn tất bước hiện tại
  const handleContinueNextStep = () => {
    if (!detectedPO) return

    // Bước vừa hoàn tất
    const completedStep =
      detectedPO.totalStep > 0
        ? Math.min(detectedPO.totalStep, detectedPO.currentStep + 1)
        : (detectedPO.currentStep || 0) + 1

    // Cập nhật detectedPO sang bước mới để useEffect tự động tải template ảnh mẫu mới
    const updatedPO: PhotoPackingSummary = {
      ...detectedPO,
      currentStep: completedStep,
      statusId: 1, // Đang chụp
    }

    setDetectedPO(updatedPO)
    setCapturedImage(null)
    setApiResult(null)
    setConfirmResult(null)
    setScanErrorMessage(null)
    setDetectedCodeMeta(null)
    setFlowStep("preview")

    // Đảm bảo luồng camera tiếp tục hoạt động
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    } else {
      startCamera(facingMode, resolution)
    }
  }

  // Thử lại upload ảnh khi API lần 1 thất bại
  const handleRetryUpload = () => {
    handleConfirmPO()
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col justify-between font-sans select-none overflow-hidden max-w-md mx-auto sm:border-x sm:border-slate-800 shadow-2xl">
      {/* Hidden Canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input for fallback upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ========================================================= */}
      {/* TOP HEADER BAR                                           */}
      {/* - Góc trái: Bật/tắt Flash (Torch)                        */}
      {/* - Ở giữa: Giữ nguyên thông tin đơn hàng / scanner        */}
      {/* - Góc phải: Nút Close (icon X) gọi onBack()             */}
      {/* ========================================================= */}
      <header className="z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent">
        {/* Nút Bật/Tắt Flash (Góc trên bên trái) */}
        {!capturedImage ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFlash}
            className={`rounded-full size-10 transition-colors ${
              isFlashOn
                ? "bg-amber-400/25 text-amber-300 ring-2 ring-amber-400/50"
                : "text-white hover:bg-white/15"
            }`}
            title={
              isFlashOn
                ? "Tắt đèn Flash"
                : hasTorchSupport
                ? "Bật đèn Flash"
                : "Đèn Flash (Cần thiết bị hỗ trợ)"
            }
          >
            {isFlashOn ? (
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
            ) : (
              <ZapOff className="w-5 h-5 text-slate-300" />
            )}
          </Button>
        ) : (
          <div className="size-10" />
        )}

        {/* Thông tin ở giữa */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <ScanLine className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-sm tracking-wide text-slate-200">
              {detectedPO
                ? `Đơn #${detectedPO.pO}`
                : targetOrder
                ? `Đơn #${targetOrder.pO}`
                : scannedPO
                ? `PO #${scannedPO.pO.slice(-6)}`
                : capturedImage
                ? flowStep === "scanning"
                  ? "Đang phân tích ảnh..."
                  : "Ảnh đã chụp"
                : "Photo Packing Scanner"}
            </span>
          </div>
          {(detectedPO || targetOrder || scannedPO) && (
            <span className="text-[11px] text-cyan-300">
              {detectedPO
                ? `${detectedPO.productCode} • Step ${Math.min(
                    detectedPO.totalStep || 1,
                    detectedPO.currentStep + 1
                  )}/${detectedPO.totalStep || 1}`
                : targetOrder
                ? `${targetOrder.productCode} • Step ${targetOrder.currentStep}/${
                    targetOrder.totalStep || 1
                  }`
                : scannedPO
                ? `${scannedPO.productCode} • Step ${scannedPO.currentStep + 1}/${
                    scannedPO.totalStep || 1
                  }`
                : ""}
            </span>
          )}
        </div>

        {/* Nút Close (icon X) ở góc trên bên phải */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/15 rounded-full size-10"
          title="Đóng camera"
        >
          <X className="w-5 h-5" />
        </Button>
      </header>

      {/* Thông báo toast khi bật/tắt flash nếu thiết bị không hỗ trợ */}
      {flashNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur border border-amber-400/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-full shadow-lg text-center max-w-[85%]">
          {flashNotice}
        </div>
      )}

      {/* Toast thông báo lỗi phát hiện PO */}
      {scanErrorMessage && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 bg-red-950/90 backdrop-blur border border-red-500/40 text-red-300 text-xs px-4 py-2 rounded-full shadow-lg text-center max-w-[90%]">
          {scanErrorMessage}
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN VIDEO PREVIEW AREA                                  */}
      {/* ========================================================= */}
      <div className="relative flex-1 flex items-center justify-center p-3 overflow-hidden">
        <div className="relative w-full h-full max-h-[75vh] rounded-3xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-800/80 shadow-2xl">
          {!capturedImage ? (
            <>
              {cameraError ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-amber-400/80" />
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xs">{cameraError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  >
                    Tải ảnh từ thiết bị
                  </Button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    filter: exposure !== 0 ? `brightness(${1 + exposure * 0.25})` : undefined,
                    transform:
                      !supportsHardwareZoom && zoom !== 1 ? `scale(${zoom})` : undefined,
                  }}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              )}

              {/* Viewfinder Target Guidelines */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-12">
                <div className="relative w-64 h-64 max-w-[70vw] max-h-[70vw]">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />
                </div>
              </div>

              {/* ========================================================= */}
              {/* THANH ĐIỀU CHỈNH ĐỘ SÁNG & ĐỘ PHÂN GIẢI (Bên trong preview) */}
              {/* ========================================================= */}
              <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 z-10">
                {/* Nút Độ phân giải */}
                <button
                  type="button"
                  onClick={() => {
                    setShowResolutionMenu(!showResolutionMenu)
                    setShowExposureControl(false)
                  }}
                  className="bg-black/60 backdrop-blur-md border border-white/20 hover:border-cyan-400 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md active:scale-95 transition-all"
                  title="Đổi độ phân giải"
                >
                  <Maximize2 className="w-3 h-3 text-cyan-300" />
                  <span>{resolution.toUpperCase()}</span>
                </button>

                {/* Menu chọn độ phân giải */}
                {showResolutionMenu && (
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-1.5 flex flex-col gap-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    {(Object.keys(RESOLUTION_CONFIG) as ResolutionKey[]).map((resKey) => (
                      <button
                        key={resKey}
                        type="button"
                        onClick={() => handleResolutionChange(resKey)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg text-left font-medium transition-colors ${
                          resolution === resKey
                            ? "bg-cyan-500 text-black font-bold"
                            : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {RESOLUTION_CONFIG[resKey].label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Nút Độ sáng */}
                <button
                  type="button"
                  onClick={() => {
                    setShowExposureControl(!showExposureControl)
                    setShowResolutionMenu(false)
                  }}
                  className={`bg-black/60 backdrop-blur-md border text-white text-[11px] font-semibold p-1.5 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all ${
                    exposure !== 0
                      ? "border-amber-400 text-amber-300 bg-amber-400/20"
                      : "border-white/20 hover:border-amber-300"
                  }`}
                  title="Điều chỉnh độ sáng"
                >
                  <Sun className="w-4 h-4 text-amber-300" />
                </button>

                {/* Thanh chọn độ sáng */}
                {showExposureControl && (
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-2 flex flex-col items-center gap-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <span className="text-[10px] text-amber-300 font-bold">
                      {exposure > 0 ? `+${exposure}` : exposure} EV
                    </span>
                    <div className="flex flex-col gap-1">
                      {[-2, -1, 0, 1, 2].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleExposureChange(val)}
                          className={`text-[10px] w-7 h-6 rounded flex items-center justify-center font-bold transition-colors ${
                            exposure === val
                              ? "bg-amber-400 text-black"
                              : "text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {val > 0 ? `+${val}` : val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* CĂN CHỈNH TIÊU CỰ (0.5x / 1x / 2x ...)                    */}
              {/* NẰM Ở GIỮA PHÍA DƯỚI, BÊN TRONG VIDEO PREVIEW            */}
              {/* ========================================================= */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-lg">
                {availableZoomLevels.map((lvl) => {
                  const isSelected = zoom === lvl
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleZoomChange(lvl)}
                      className={`min-w-8 h-7 px-2 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-white text-black font-bold shadow-sm scale-105"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {lvl}x
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured frame"
                className="w-full h-full object-cover"
              />

              {/* Hiệu ứng Scanning laser */}
              {flowStep === "scanning" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                  <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] animate-grid-glow" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_3px_#22d3ee] animate-scan-laser" />

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs px-4 py-2 rounded-full shadow-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                      </span>
                      <span>Đang nhận diện mã Barcode / QR Code...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM SHUTTER & CONTROLS BAR                             */}
      {/* - Góc dưới bên trái: Ảnh mẫu thu nhỏ (nếu có)            */}
      {/* - Ở giữa: Nút chụp ảnh (Shutter)                          */}
      {/* - Góc dưới bên phải: Đổi camera trước / sau               */}
      {/* ========================================================= */}
      <footer className="z-20 px-6 py-5 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center space-y-3">
        {!capturedImage ? (
          <div className="w-full flex items-center justify-between px-2">
            {/* Ảnh mẫu thu nhỏ (nếu có) nằm ở góc dưới bên trái */}
            <div className="w-14 flex items-center justify-start">
              {samplePhotoUrl ? (
                <button
                  type="button"
                  onClick={() => setIsSampleDialogOpen(true)}
                  className="relative size-12 rounded-xl overflow-hidden border-2 border-white/80 shadow-lg active:scale-95 transition-transform group"
                  title="Xem ảnh mẫu"
                >
                  <img
                    src={samplePhotoUrl}
                    alt="Ảnh mẫu"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 py-0.5 text-[8px] font-bold text-center text-cyan-300 uppercase tracking-tighter">
                    Mẫu
                  </div>
                </button>
              ) : (
                <div className="size-12 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center text-slate-500">
                  <ImageIcon className="w-5 h-5 opacity-40" />
                </div>
              )}
            </div>

            {/* Shutter Button (Chính giữa) */}
            <button
              onClick={handleCapture}
              className="group relative flex items-center justify-center size-20 rounded-full border-4 border-white/90 p-1 transition-all duration-200 active:scale-90 hover:scale-105 shadow-xl"
              title="Chụp ảnh"
            >
              <div className="size-full rounded-full bg-white transition-all duration-150 group-hover:bg-cyan-400 group-active:scale-95 shadow-lg" />
            </button>

            {/* Đổi camera trước / sau (Góc dưới bên phải) */}
            <div className="w-14 flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCameraFacing}
                className="text-white hover:bg-white/15 rounded-full size-12 shadow-sm"
                title="Đổi camera trước / sau"
              >
                <SwitchCamera className="w-6 h-6 text-slate-200" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <Button
              onClick={handleRetake}
              disabled={flowStep === "scanning" || flowStep === "uploading" || flowStep === "confirming"}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Chụp Lại
            </Button>
          </div>
        )}
      </footer>

      {/* ========================================================= */}
      {/* DIALOG XEM ẢNH MẪU ĐÓNG GÓI                               */}
      {/* ========================================================= */}
      <Dialog open={isSampleDialogOpen} onOpenChange={setIsSampleDialogOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md rounded-2xl p-5 shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Ảnh Mẫu Đóng Gói
              </DialogTitle>
              {targetOrder && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold">
                  Đơn #{targetOrder.pO}
                </span>
              )}
            </div>
            {targetOrder && (
              <DialogDescription className="text-xs text-slate-400">
                Sản phẩm: <span className="text-slate-200 font-medium">{targetOrder.productCode}</span> • {targetOrder.type || "Đóng gói tiêu chuẩn"}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="py-2">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
              {samplePhotoUrl && (
                <img
                  src={samplePhotoUrl}
                  alt="Ảnh mẫu đóng gói"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>

          <DialogFooter className="pt-1">
            <Button
              variant="outline"
              onClick={() => setIsSampleDialogOpen(false)}
              className="w-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Loading Overlay khi đang gửi ảnh hoặc xác nhận === */}
      {(flowStep === "uploading" || flowStep === "confirming") && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
          <div className="relative">
            <div className="size-14 border-[3px] border-slate-700 rounded-full" />
            <div className="absolute inset-0 size-14 border-[3px] border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-medium text-white">
              {flowStep === "uploading"
                ? "Đang gửi ảnh lên hệ thống..."
                : "Đang xác nhận hoàn tất bước..."}
            </p>
            <p className="text-xs text-slate-400">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      )}

      {/* Dialog xác nhận PO đã phát hiện (Confirm detected PO) */}
      {detectedPO && capturedImage && (
        <ConfirmPODialog
          open={flowStep === "confirm-po"}
          detectedPO={detectedPO}
          capturedImage={capturedImage}
          samplePhotoUrl={samplePhotoUrl || undefined}
          stepNotes={activeStepItem?.notes}
          codeMeta={detectedCodeMeta}
          onConfirm={handleConfirmPO}
          onRetake={handleRetake}
        />
      )}

      {/* Dialog kết quả upload ảnh + ảnh mẫu đối chiếu (Show message + template img) */}
      {detectedPO && apiResult && capturedImage && (
        <PhotoResultDialog
          open={flowStep === "result"}
          success={apiResult.success}
          message={apiResult.message}
          capturedImage={capturedImage}
          detectedPO={detectedPO}
          samplePhotoUrl={samplePhotoUrl || undefined}
          onConfirmOK={handleConfirmResult}
          onRetake={handleRetake}
          onRetryUpload={!apiResult.success ? handleRetryUpload : undefined}
        />
      )}

      {/* Dialog thông báo hoàn tất thành công (Notify result) */}
      {detectedPO && confirmResult && (
        <NotifyResultDialog
          open={flowStep === "done"}
          detectedPO={detectedPO}
          message={confirmResult.message}
          confirmResult={confirmResult}
          onBackToList={handleClose}
          onContinueNextStep={handleContinueNextStep}
        />
      )}
    </div>
  )
}
