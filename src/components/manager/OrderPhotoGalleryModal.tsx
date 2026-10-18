import { useState, useEffect } from "react"
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Layers,
  ZoomIn,
  Eye,
  Maximize2,
} from "lucide-react"
import type { PhotoPackingSummary } from "@/types/photoPackingSummary"

interface OrderPhotoGalleryModalProps {
  order: PhotoPackingSummary | null
  initialStep?: number
  onClose: () => void
}

export default function OrderPhotoGalleryModal({
  order,
  initialStep = 1,
  onClose,
}: OrderPhotoGalleryModalProps) {
  if (!order) return null

  const totalStep = order.totalStep || 2
  const currentStep = order.currentStep || 0
  const photos = order.photoUrls || []

  // Bước đang được chọn xem trong danh sách (mặc định theo initialStep)
  const [selectedStep, setSelectedStep] = useState<number>(initialStep || 1)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  useEffect(() => {
    if (initialStep) {
      setSelectedStep(initialStep)
    }
  }, [initialStep, order])

  // Danh sách các bước của đơn hàng
  const stepItems = Array.from({ length: totalStep }, (_, index) => {
    const stepNum = index + 1
    const hasPhoto = stepNum <= currentStep
    const photoUrl = photos[stepNum - 1] || `/Image/Save/${order.pO}_${stepNum}.jpg`
    const isRecapture = order.statusId === 2 && stepNum === currentStep
    const isCompleted = hasPhoto && !isRecapture

    return {
      stepNum,
      hasPhoto,
      photoUrl,
      isRecapture,
      isCompleted,
      isPending: !hasPhoto,
      photographer: hasPhoto ? order.creator || "NV-QUANG" : "Chưa thực hiện",
      captureTime: hasPhoto
        ? order.updatedTime
          ? new Date(order.updatedTime).toLocaleString("vi-VN")
          : "Đã ghi nhận"
        : "—",
      sampleUrl: order.samplePhotoUrl || `/Image/Template/${order.type || "Box"}.jpg`,
    }
  })

  const currentStepData = stepItems[selectedStep - 1] || stepItems[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Xem tất cả ảnh PO: <span className="text-blue-600 font-mono">{order.pO}</span>
                </h3>
                <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {order.group || "OSA"}
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200/60">
                  {order.type || "Box"}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {order.productCode} — {order.productName || "Không có tên sản phẩm"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Cột trái: Danh sách các bước chụp (Step Selector List) */}
          <div className="w-full md:w-80 shrink-0 bg-slate-50/50 p-4 overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 pb-1">
              <span>Tiến trình các bước ({currentStep}/{totalStep})</span>
              <span className="text-blue-600">
                {Math.round((currentStep / totalStep) * 100)}%
              </span>
            </div>

            {stepItems.map((step) => {
              const isSelected = selectedStep === step.stepNum
              return (
                <div
                  key={step.stepNum}
                  onClick={() => setSelectedStep(step.stepNum)}
                  className={`group relative flex items-start gap-3 rounded-xl p-3 border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-white shadow-md ring-2 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100/60"
                  }`}
                >
                  {/* Thumbnail bước */}
                  <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    {step.hasPhoto ? (
                      <img
                        src={step.photoUrl}
                        alt={`Bước ${step.stepNum}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback nếu ảnh file chưa sẵn sàng
                          ;(e.target as HTMLImageElement).src = step.sampleUrl
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                        Chờ
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                      B{step.stepNum}
                    </span>
                  </div>

                  {/* Thông tin bước */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        Bước {step.stepNum}
                      </span>
                      {step.isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đạt
                        </span>
                      )}
                      {step.isRecapture && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Chụp lại
                        </span>
                      )}
                      {step.isPending && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          Chờ
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {step.hasPhoto ? `Chụp: ${step.photographer}` : "Chưa chụp"}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{step.captureTime}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Ghi chú tổng quát của đơn hàng */}
            {order.notes && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 mt-4 text-xs">
                <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Ghi chú đơn hàng:
                </span>
                <p className="text-amber-900 leading-relaxed">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Cột phải: Chi tiết bước đang chọn (So sánh ảnh thực tế và ảnh mẫu) */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Chi tiết ảnh Bước {currentStepData.stepNum} / {totalStep}</span>
                  {currentStepData.isCompleted && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Đã chụp hoàn thành
                    </span>
                  )}
                  {currentStepData.isRecapture && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      Yêu cầu chụp lại
                    </span>
                  )}
                  {currentStepData.isPending && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      Chưa chụp
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Người chụp: <strong className="text-slate-700">{currentStepData.photographer}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Thời gian: <strong className="text-slate-700">{currentStepData.captureTime}</strong>
                  </span>
                </div>
              </div>

              {/* Nút phóng to */}
              {currentStepData.hasPhoto && (
                <button
                  type="button"
                  onClick={() => setEnlargedImage(currentStepData.photoUrl)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-blue-600" />
                  Xem kích thước lớn
                </button>
              )}
            </div>

            {/* Khung so sánh: [Ảnh chụp thực tế] vs [Ảnh mẫu đối chiếu] */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              
              {/* Ảnh chụp thực tế */}
              <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 border-b border-slate-200">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Eye className="h-4 w-4" />
                    Ảnh thực tế đã chụp (PO: {order.pO})
                  </span>
                  {currentStepData.hasPhoto && (
                    <span className="text-[10px] text-slate-500">
                      Bước {currentStepData.stepNum}
                    </span>
                  )}
                </div>

                <div className="relative flex min-h-64 items-center justify-center p-3 bg-slate-950/5">
                  {currentStepData.hasPhoto ? (
                    <div
                      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-sm"
                      onClick={() => setEnlargedImage(currentStepData.photoUrl)}
                    >
                      <img
                        src={currentStepData.photoUrl}
                        alt={`Ảnh thực tế bước ${currentStepData.stepNum}`}
                        className="max-h-72 w-auto rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = currentStepData.sampleUrl
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                          <Maximize2 className="h-3.5 w-3.5" />
                          Nhấn để phóng to
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <Clock className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold">Chưa có ảnh cho bước này</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Công nhân chưa tiến hành chụp ảnh bước {currentStepData.stepNum}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ảnh mẫu quy chuẩn đối chiếu */}
              <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 border-b border-slate-200">
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <Layers className="h-4 w-4" />
                    Ảnh mẫu chuẩn ({order.type || "Quy chuẩn"})
                  </span>
                  <span className="text-[10px] text-slate-500">Mẫu kiểm tra</span>
                </div>

                <div className="relative flex min-h-64 items-center justify-center p-3 bg-slate-950/5">
                  <div
                    className="group relative cursor-pointer overflow-hidden rounded-lg shadow-sm"
                    onClick={() => setEnlargedImage(currentStepData.sampleUrl)}
                  >
                    <img
                      src={currentStepData.sampleUrl}
                      alt="Ảnh mẫu đối chiếu"
                      className="max-h-72 w-auto rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow">
                        <Maximize2 className="h-3.5 w-3.5" />
                        Xem mẫu chuẩn
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Hướng dẫn quy chuẩn bước */}
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-slate-700">
              <span className="font-bold text-blue-900 block mb-1">
                Tiêu chuẩn kiểm tra bước {currentStepData.stepNum}:
              </span>
              <p className="leading-relaxed text-blue-950">
                Đảm bảo ảnh chụp rõ nét, bao gồm toàn bộ tem nhãn và mã vạch PO, linh kiện được sắp xếp đồng hướng theo đúng quy chuẩn đóng gói ISO xưởng {order.group || "OSA"}.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div className="text-xs text-slate-500">
            Tổng cộng: <strong className="text-slate-800">{totalStep} bước</strong> • Đã thực hiện: <strong className="text-blue-600">{currentStep} bước</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>

      {/* Lightbox phóng to ảnh cực đại */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-100"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-h-screen max-w-5xl">
            <button
              type="button"
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={enlargedImage}
              alt="Phóng to ảnh"
              className="max-h-[85vh] w-auto rounded-lg shadow-2xl object-contain ring-1 ring-white/10"
            />
          </div>
        </div>
      )}
    </div>
  )
}
