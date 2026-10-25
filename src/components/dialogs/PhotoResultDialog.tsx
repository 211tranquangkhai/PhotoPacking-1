import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, RotateCcw, Check, RefreshCw } from "lucide-react"
import type { PhotoPackingSummary } from "@/types"

interface PhotoResultDialogProps {
  open: boolean
  success: boolean
  message: string
  capturedImage: string
  detectedPO: PhotoPackingSummary
  samplePhotoUrl?: string
  onConfirmOK: () => void
  onRetake: () => void
  onRetryUpload?: () => void
}

/**
 * Dialog hiển thị kết quả sau khi gửi ảnh lên API (Send API lần 1)
 * - Thành công: Hiển thị ảnh vừa chụp (trên) + ảnh mẫu template (dưới) để đối chiếu
 * - Thất bại: Hiển thị lỗi + nút thử lại
 */
export function PhotoResultDialog({
  open,
  success,
  message,
  capturedImage,
  detectedPO,
  samplePhotoUrl,
  onConfirmOK,
  onRetake,
  onRetryUpload,
}: PhotoResultDialogProps) {
  const nextStep =
    detectedPO.totalStep > 0
      ? Math.min(detectedPO.totalStep, detectedPO.currentStep + 1)
      : detectedPO.currentStep || 1

  const templateImageUrl =
    samplePhotoUrl ||
    detectedPO.samplePhotoUrl ||
    `/Image/Template/${detectedPO.type || "Box"}.jpg`

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onRetake()}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            {success ? (
              <div className="size-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
            ) : (
              <div className="size-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
                <AlertCircle className="size-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-base font-bold text-white">
                {success ? "Ảnh đã được ghi nhận" : "Gửi ảnh thất bại"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                {success
                  ? `${
                      detectedPO.totalStep > 0
                        ? `Bước ${nextStep}/${detectedPO.totalStep}`
                        : `Bước ${nextStep}`
                    } • PO ${detectedPO.pO}`
                  : "Đã xảy ra lỗi khi tải ảnh lên hệ thống"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Thông báo kết quả */}
          <div
            className={`text-sm px-3.5 py-2.5 rounded-xl border ${
              success
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/40 border-red-500/30 text-red-300"
            }`}
          >
            {message}
          </div>

          {success && (
            <>
              {/* Ảnh vừa chụp (đặt trên) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                    Ảnh vừa chụp
                  </span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/95 border border-cyan-500/40 shadow-inner flex items-center justify-center p-1">
                  <img
                    src={capturedImage}
                    alt="Ảnh vừa chụp"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Ảnh mẫu đối chiếu (đặt dưới) */}
              {templateImageUrl && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                      Ảnh mẫu đối chiếu (Template)
                    </span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/95 border border-amber-500/40 shadow-inner flex items-center justify-center p-1">
                    <img
                      src={templateImageUrl}
                      alt="Ảnh mẫu đối chiếu"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-2 pt-2">
          {success ? (
            <>
              <Button
                onClick={onRetake}
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 h-11"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Chụp lại
              </Button>
              <Button
                onClick={onConfirmOK}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-11 shadow-lg shadow-emerald-950/50"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Xác nhận OK
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onRetake}
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 h-11"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Chụp lại
              </Button>
              {onRetryUpload && (
                <Button
                  onClick={onRetryUpload}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium h-11"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Thử lại
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
