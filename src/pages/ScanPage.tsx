import { useState, useRef, useEffect, useCallback } from "react"
import { X, ScanLine, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { processScannedBarcodeResult } from "@/services/poLookup"
import { scanBarcodeFromCanvas } from "@/services/barcodeScanner"
interface ScanPageProps {
  onPODetected: (
    po: string,
    codeMeta?: { format?: string; codeType?: "barcode" | "qrcode" }
  ) => void
  onBack: () => void
}

/**
 * Trang quét mã vạch Barcode (1D) & QR Code (2D) real-time
 * Tự động nhận diện cả 2 loại mã.
 * Bắt mã đầu tiên phát hiện được; nếu là QR Code sẽ tách chuỗi theo dấu ";" và lấy PO là phần đầu.
 * Nếu PO không phải chuỗi 12 ký tự số thì trả lỗi.
 */
export default function ScanPage({ onPODetected, onBack }: ScanPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<number | null>(null)
  const isDetectedRef = useRef(false)
  const isProcessingFrameRef = useRef(false)
  const cooldownUntilRef = useRef<number>(0)
  const onPODetectedRef = useRef(onPODetected)

  const [isDetected, setIsDetected] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [detectedMessage, setDetectedMessage] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  // Cập nhật ref khi callback thay đổi
  useEffect(() => {
    onPODetectedRef.current = onPODetected
  }, [onPODetected])

  // Trạng thái hiển thị hướng dẫn (derive từ state)
  const scanStatus =
    detectedMessage || "Hướng camera vào mã vạch Barcode hoặc QR Code..."

  // Dọn dẹp tài nguyên camera và interval
  const stopAll = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
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
      if (videoRef.current.srcObject) {
        try {
          const srcStream = videoRef.current.srcObject as MediaStream
          srcStream.getTracks?.().forEach((t) => {
            try {
              t.enabled = false
              t.stop()
            } catch {}
          })
        } catch {}
        videoRef.current.srcObject = null
      }
    }
  }, [])

  const handleClose = useCallback(() => {
    stopAll()
    onBack()
  }, [stopAll, onBack])

  // Khởi động Camera và bộ quét Barcode & QR Code liên tục
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        // Vòng lặp quét frame định kỳ mỗi 200ms
        scanIntervalRef.current = window.setInterval(async () => {
          if (isDetectedRef.current || isProcessingFrameRef.current) return
          if (!videoRef.current || !canvasRef.current) return

          const video = videoRef.current
          const canvas = canvasRef.current
          if (video.readyState !== video.HAVE_ENOUGH_DATA) return

          isProcessingFrameRef.current = true

          try {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d", { willReadFrequently: true })
            if (!ctx) return

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            // Quét mã Barcode 1D & QR Code 2D
            const scanResult = await scanBarcodeFromCanvas(canvas)

            if (scanResult && scanResult.text.trim()) {
              // Nếu đang trong thời gian cooldown sau khi báo lỗi thì bỏ qua frame này
              if (Date.now() < cooldownUntilRef.current) {
                return
              }

              // Xử lý mã đầu tiên bắt được theo quy tắc nghiệp vụ
              const processed = processScannedBarcodeResult(scanResult)

              if (!processed.success) {
                // Trả lỗi nếu QR không có PO 12 số hoặc barcode không khớp PO
                setLastError(processed.errorMessage || "Mã quét không hợp lệ")
                // Đặt cooldown 2.5s để người dùng kịp đọc thông báo lỗi và tránh spam
                cooldownUntilRef.current = Date.now() + 2500
                setTimeout(() => setLastError(null), 3500)
                return
              }

              // Mã hợp lệ: Đã tìm thấy PO thành công
              const poCode = (processed.poCode || processed.poSummary?.pO || scanResult.text.trim())
              isDetectedRef.current = true
              setIsDetected(true)
              const tagLabel =
                processed.codeType === "qrcode"
                  ? "QR Code"
                  : processed.format || "Barcode"
              setDetectedMessage(`Đã nhận diện [${tagLabel}]: PO ${poCode}`)
              setTimeout(() => {
                onPODetectedRef.current(poCode, {
                  format: processed.format,
                  codeType: processed.codeType,
                })
              }, 500)
            }
          } catch {
            // Bỏ qua lỗi quét frame này
          } finally {
            isProcessingFrameRef.current = false
          }
        }, 200)
      } catch {
        if (mounted) {
          setCameraError(
            "Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera trong trình duyệt."
          )
        }
      }
    }

    init()

    const handleBeforeUnload = () => {
      stopAll()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      mounted = false
      stopAll()
    }
  }, [stopAll])

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans select-none overflow-hidden max-w-md mx-auto sm:border-x sm:border-slate-800 shadow-2xl">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent">
        {/* Spacer để căn giữa tiêu đề cân đối với nút đóng bên phải */}
        <div className="size-10" />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <ScanLine className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-sm tracking-wide text-slate-200">
              Quét Barcode & QR Code
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            Đọc cả hai (Barcode 1D & QR Code 2D)
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/15 rounded-full size-10"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </Button>
      </header>

      {/* Toast thông báo lỗi khi PO không hợp lệ hoặc không phải 12 chữ số */}
      {lastError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-red-950/95 backdrop-blur border border-red-500/60 text-red-200 text-xs px-4 py-2.5 rounded-xl shadow-2xl text-center max-w-[92%] flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-medium leading-snug">{lastError}</span>
        </div>
      )}

      {/* Khung video chính */}
      <div className="relative flex-1 flex items-center justify-center p-3 overflow-hidden">
        <div className="relative w-full h-full max-h-[75vh] rounded-3xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-800/80 shadow-2xl">
          {cameraError ? (
            <div className="flex flex-col items-center p-6 text-center space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                {cameraError}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Viewfinder hướng dẫn căn chỉnh cho cả Barcode và QR Code */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative border-2 border-emerald-400 rounded-2xl w-72 h-56 shadow-[0_0_25px_rgba(52,211,153,0.35)] transition-all duration-300">
              {/* 4 góc căn chỉnh chuyên nghiệp */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg border-emerald-300" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg border-emerald-300" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg border-emerald-300" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg border-emerald-300" />

              {/* Đường tâm hỗ trợ căn barcode chuẩn xác */}
              <div className="absolute top-1/2 left-4 right-4 h-px border-t border-dashed border-emerald-400/40" />

              {/* Nhãn chế độ bên trong khung */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/80 backdrop-blur border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold whitespace-nowrap shadow-md">
                Khung quét Barcode & QR Code
              </div>
            </div>
          </div>

          {/* Laser quét liên tục */}
          {!cameraError && !isDetected && (
            <div className="absolute left-0 right-0 h-0.5 shadow-lg pointer-events-none animate-scan-laser bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_2px_#34d399]" />
          )}
        </div>
      </div>

      {/* Footer: Trạng thái quét + nút hủy */}
      <footer className="z-20 px-6 py-4 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-300 text-center px-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="truncate">{scanStatus}</span>
        </div>

        <Button
          onClick={handleClose}
          variant="outline"
          className="w-full h-11 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-xl"
        >
          Hủy quét
        </Button>
      </footer>
    </div>
  )
}

