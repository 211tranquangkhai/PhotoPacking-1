import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowLeft, Camera, PauseCircle, PackageCheck } from "lucide-react"
import type { PhotoPackingSummary, ConfirmStepResult } from "@/types"

interface NotifyResultDialogProps {
  open: boolean
  detectedPO: PhotoPackingSummary
  message: string
  confirmResult?: ConfirmStepResult | null
  onBackToList: () => void
  onContinueNextStep?: () => void
}

/**
 * Dialog thông báo hoàn tất thành công bước chụp ảnh PO
 * Hiển thị sau khi API lần 2 xác nhận OK:
 * - Nếu còn bước tiếp theo: Cung cấp tùy chọn "Chụp tiếp bước X" hoặc "Tạm dừng & Về danh sách"
 * - Nếu đã hoàn tất tất cả các bước: Hiển thị thông báo hoàn thành 100% kèm nút "Về danh sách PO"
 */
export function NotifyResultDialog({
  open,
  detectedPO,
  message,
  confirmResult,
  onBackToList,
  onContinueNextStep,
}: NotifyResultDialogProps) {
  const currentCompletedStep =
    detectedPO.totalStep > 0
      ? Math.min(detectedPO.totalStep, detectedPO.currentStep + 1)
      : detectedPO.currentStep || 1

  const totalStep = confirmResult?.totalStep || detectedPO.totalStep || 3

  const hasNextStep =
    confirmResult?.hasNextStep !== undefined
      ? confirmResult.hasNextStep
      : currentCompletedStep < totalStep

  const nextStepNumber =
    confirmResult?.nextStepNumber || (hasNextStep ? currentCompletedStep + 1 : undefined)

  const isCompleted =
    confirmResult?.isCompleted !== undefined ? confirmResult.isCompleted : !hasNextStep

  const progressPercent =
    totalStep > 0
      ? Math.min(100, Math.round((currentCompletedStep / totalStep) * 100))
      : 100

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onBackToList()
      }}
    >
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-4 text-center">
          {/* Success icon */}
          <div className="flex justify-center">
            {isCompleted ? (
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 animate-in zoom-in-50 duration-300">
                <PackageCheck className="size-9" />
              </div>
            ) : (
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="size-9" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-bold text-white">
              {isCompleted
                ? "Hoàn tất quy trình đóng gói!"
                : `Hoàn tất bước ${currentCompletedStep}!`}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              {message}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {/* Thông tin đơn hàng & tiến độ */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Mã PO</span>
              <span className="font-mono font-bold text-cyan-300">
                {detectedPO.pO}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Sản phẩm</span>
              <span className="text-slate-200 font-medium truncate ml-4 text-right">
                {detectedPO.productCode} {detectedPO.productName ? `• ${detectedPO.productName}` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Bước hoàn tất</span>
              <span className="font-semibold text-emerald-400">
                {totalStep > 0
                  ? `${currentCompletedStep} / ${totalStep}`
                  : `Bước ${currentCompletedStep}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Trạm</span>
              <span className="text-slate-300">
                #{detectedPO.updator || "#84920"} (Xưởng {detectedPO.group || "OSA"})
              </span>
            </div>

            {/* Thanh tiến độ */}
            <div className="pt-1">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>{isCompleted ? "Đã xong 100%" : `Đã hoàn thành ${currentCompletedStep}/${totalStep} bước`}</span>
                <span className="font-semibold text-emerald-400">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Banner thông báo trạng thái tiếp theo */}
          {hasNextStep && (
            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3.5 flex items-start gap-3">
              <div className="size-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="size-4" />
              </div>
              <div className="space-y-0.5 text-xs text-left">
                <p className="font-semibold text-cyan-200">
                  Còn bước {nextStepNumber}/{totalStep} cần chụp
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Bạn có thể chụp tiếp ngay trên camera hoặc tạm dừng để lưu tiến độ và quay lại sau.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer hành động: Chụp tiếp hoặc Tạm dừng */}
        <DialogFooter className="pt-2">
          {hasNextStep && onContinueNextStep ? (
            <div className="w-full flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBackToList}
                className="flex-1 h-11 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl order-2 sm:order-1"
              >
                <PauseCircle className="w-4 h-4 mr-1.5 text-amber-400" />
                Tạm dừng & Về danh sách
              </Button>
              <Button
                type="button"
                onClick={onContinueNextStep}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-950/50 order-1 sm:order-2"
              >
                <Camera className="w-4 h-4 mr-1.5" />
                Chụp tiếp bước {nextStepNumber}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={onBackToList}
              className="w-full h-11 bg-[#1b365d] hover:bg-[#132742] text-white font-medium rounded-xl shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Hoàn tất & Về danh sách PO
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

