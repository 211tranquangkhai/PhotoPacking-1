import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  RotateCcw,
  Package,
  Image as ImageIcon,
  Barcode,
  QrCode,
  AlertTriangle,
  AlertCircle,
} from "lucide-react"
import type { PhotoPackingSummary, POValidationResult } from "@/types"

interface ConfirmPODialogProps {
  open: boolean
  detectedPO: PhotoPackingSummary
  capturedImage: string
  samplePhotoUrl?: string
  stepNotes?: string
  codeMeta?: { format?: string; codeType?: "barcode" | "qrcode" } | null
  poValidation?: POValidationResult | null
  onConfirm: () => void
  onRetake: () => void
}

/**
 * Dialog xác nhận gửi ảnh lên hệ thống
 * Hiển thị thông tin PO, loại mã nhận diện, kết quả kiểm tra PO trên ảnh,
 * ảnh vừa chụp (ở trên) và ảnh mẫu đối chiếu (ở dưới).
 */
export function ConfirmPODialog({
  open,
  detectedPO,
  capturedImage,
  samplePhotoUrl,
  stepNotes,
  codeMeta,
  poValidation,
  onConfirm,
  onRetake,
}: ConfirmPODialogProps) {
  const nextStep =
    detectedPO.totalStep > 0
      ? Math.min(detectedPO.totalStep, detectedPO.currentStep + 1)
      : detectedPO.currentStep || 1

  const templateImageUrl =
    samplePhotoUrl ||
    detectedPO.samplePhotoUrl ||
    (detectedPO.type ? `/Image/Template/${detectedPO.type}.jpg` : undefined)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onRetake()}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Xác nhận gửi ảnh lên hệ thống
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Kiểm tra tính rõ nét của PO và đối chiếu ảnh trước khi gửi
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* ========================================================= */}
          {/* KHỐI KẾT QUẢ KIỂM TRA MÃ PO TRÊN ẢNH CHỤP                 */}
          {/* ========================================================= */}
          {poValidation && (
            <div
              className={`rounded-xl p-3 border flex items-start gap-3 transition-colors ${
                poValidation.status === "matched"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : poValidation.status === "mismatched"
                  ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-200"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {poValidation.status === "matched" ? (
                  <CheckCircle2 className="size-5 text-emerald-400" />
                ) : poValidation.status === "mismatched" ? (
                  <AlertTriangle className="size-5 text-rose-400" />
                ) : (
                  <AlertCircle className="size-5 text-amber-400" />
                )}
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[13px]">
                    {poValidation.status === "matched"
                      ? "Đã nhận diện rõ mã PO trên ảnh"
                      : poValidation.status === "mismatched"
                      ? "Cảnh báo: Lệch số PO trên ảnh!"
                      : "Chưa phát hiện rõ tem PO trên ảnh"}
                  </span>
                  {poValidation.status !== "not_found" && poValidation.codeType && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 border border-current/20">
                      {poValidation.codeType}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {poValidation.message}
                </p>
              </div>
            </div>
          )}

          {/* Thông tin PO tóm tắt + Badge loại mã vạch / QR code */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400 shrink-0">Mã PO</span>
              <span className="font-mono text-xs font-bold text-cyan-300 break-all text-right">
                {detectedPO.pO}
              </span>
            </div>
            {detectedPO.productCode && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 shrink-0">Sản phẩm</span>
                <span className="text-slate-200 font-medium truncate text-right">
                  {detectedPO.productCode} {detectedPO.productName ? `• ${detectedPO.productName}` : ""}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bước chụp</span>
              <span className="font-semibold text-amber-300">
                {detectedPO.totalStep > 0
                  ? `Bước ${nextStep} / ${detectedPO.totalStep}`
                  : `Bước ${detectedPO.currentStep || 1}`}
              </span>
            </div>
            {codeMeta && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Định dạng mã</span>
                {codeMeta.codeType === "qrcode" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
                    <QrCode className="size-3" />
                    QR Code {codeMeta.format ? `(${codeMeta.format})` : ""}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px]">
                    <Barcode className="size-3" />
                    Barcode {codeMeta.format ? `(${codeMeta.format})` : "1D"}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 1. Ảnh vừa chụp (ở trên) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cyan-400 inline-block animate-pulse" />
                Ảnh vừa chụp
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {detectedPO.pO.includes(";") ? detectedPO.pO.split(";")[0] : detectedPO.pO}
              </span>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/95 border border-cyan-500/40 shadow-inner flex items-center justify-center p-1">
              <img
                src={capturedImage}
                alt="Ảnh vừa chụp"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {/* 2. Ảnh mẫu đối chiếu (ở dưới) - lấy on-demand */}
          {templateImageUrl ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="size-3 text-amber-400" />
                  Ảnh mẫu đối chiếu
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  MẪU BƯỚC {nextStep}
                </span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/95 border border-amber-500/40 shadow-inner flex items-center justify-center p-1">
                <img
                  src={templateImageUrl}
                  alt="Ảnh mẫu đối chiếu"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              {/* Hướng dẫn/Ghi chú của bước chụp nếu có */}
              {(stepNotes || detectedPO.notes) && (
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-2 text-[11px] text-slate-400 space-y-0.5">
                  <p className="font-semibold text-slate-300">
                    Hướng dẫn kiểm tra bước {nextStep}
                  </p>
                  <p className="line-clamp-2">{stepNotes || detectedPO.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-3 text-center text-xs text-slate-500">
              Không có ảnh mẫu cho bước này
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-2 pt-2">
          <Button
            onClick={onRetake}
            variant="outline"
            className="flex-1 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 h-11"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Chụp lại
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-11 shadow-lg shadow-emerald-950/50"
          >
            <Package className="w-4 h-4 mr-1.5" />
            Xác nhận gửi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
