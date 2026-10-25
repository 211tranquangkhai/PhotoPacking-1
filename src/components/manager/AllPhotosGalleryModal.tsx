import { useState, useEffect } from "react"
import {
  X,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import type { PhotoPackingItem } from "@/types"

interface AllPhotosGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  items: PhotoPackingItem[]
  initialIndex?: number
}

export default function AllPhotosGalleryModal({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
}: AllPhotosGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex)
  const [imageZoom, setImageZoom] = useState<number>(1)
  const [imageRotation, setImageRotation] = useState<number>(0)
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true)

  // Cập nhật currentIndex khi initialIndex hoặc items thay đổi
  useEffect(() => {
    if (isOpen) {
      const validIndex =
        initialIndex >= 0 && initialIndex < items.length ? initialIndex : 0
      setCurrentIndex(validIndex)
      setIsImageLoading(true)
    }
  }, [isOpen, initialIndex, items.length])

  // Reset zoom, góc xoay và bật loading mỗi khi chuyển sang item khác
  useEffect(() => {
    setImageZoom(1)
    setImageRotation(0)
    setIsImageLoading(true)
  }, [currentIndex])

  // Điều hướng bằng phím mũi tên và phím Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, items.length, onClose])

  if (!isOpen || items.length === 0) return null

  const currentItem = items[currentIndex] || items[0]
  const currentImageSrc =
    currentItem.imagePath ||
    currentItem.image ||
    currentItem.sampleUrl ||
    "/Image/Template/Tray.jpg"

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col md:flex-row w-[82vw] h-[82vh] max-w-7xl max-h-[92vh] bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/10 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút Đóng Modal ở góc trên bên phải */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ================= PHẦN BÊN TRÁI: HIỂN THỊ ẢNH & CAROUSEL ================= */}
        <div className="relative w-full md:w-[58%] lg:w-[60%] h-1/2 md:h-full bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-8 select-none overflow-hidden">
          {/* Badge góc trên của ảnh */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap max-w-[calc(100%-80px)]">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1 text-xs font-bold text-blue-700 shadow-md backdrop-blur-md">
              <Layers className="h-3.5 w-3.5 text-blue-600" />
              Ảnh Bước {currentItem.stepNo}
            </span>
            <span className="inline-flex items-center rounded-lg bg-slate-800/80 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-200 backdrop-blur-md border border-white/10">
              {currentItem.poNumber}
            </span>
            <span className="inline-flex items-center rounded-lg bg-blue-600/90 px-2.5 py-1 text-[11px] font-mono font-bold text-white shadow-md backdrop-blur-md">
              {currentIndex + 1} / {items.length}
            </span>
            {currentItem.imagePath ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md shadow-xs">
                Ảnh chụp thực tế
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-600/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md shadow-xs">
                Ảnh mẫu
              </span>
            )}
          </div>

          {/* Nút Carousel Previous */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex <= 0 || isImageLoading}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/70 hover:bg-slate-800 text-white backdrop-blur-md border border-white/15 shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer group ${
              isImageLoading ? "opacity-30 cursor-not-allowed" : ""
            }`}
            title="Xem ảnh liền trước (Phím mũi tên ←)"
          >
            <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Nút Carousel Next */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= items.length - 1 || isImageLoading}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/70 hover:bg-slate-800 text-white backdrop-blur-md border border-white/15 shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:pointer-events-none cursor-pointer group ${
              isImageLoading ? "opacity-30 cursor-not-allowed" : ""
            }`}
            title="Xem ảnh liền sau (Phím mũi tên →)"
          >
            <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Khung chứa ảnh với zoom và xoay */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Hiệu ứng loading spinner khi đang tải ảnh từ server/API */}
            {isImageLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <Loader2 className="absolute h-5 w-5 text-blue-400 animate-spin" />
                </div>
                <span className="mt-3 text-xs font-semibold text-slate-300 tracking-wide animate-pulse">
                  Đang tải ảnh từ máy chủ...
                </span>
              </div>
            )}

            <img
              src={currentImageSrc}
              alt={`PO ${currentItem.poNumber} - Bước ${currentItem.stepNo}`}
              onLoad={() => setIsImageLoading(false)}
              onError={(e) => {
                setIsImageLoading(false)
                ;(e.target as HTMLImageElement).src =
                  currentItem.sampleUrl || "/Image/Template/Tray.jpg"
              }}
              style={{
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              className={`max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          {/* Thanh điều khiển Zoom / Rotate nổi phía dưới */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl text-white">
            {/* Zoom Out */}
            <button
              type="button"
              onClick={() =>
                setImageZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))
              }
              disabled={imageZoom <= 0.5 || isImageLoading}
              className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer text-slate-200 hover:text-white"
              title="Thu nhỏ (-25%)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            {/* Phím bấm % Zoom / Reset */}
            <button
              type="button"
              onClick={() => {
                setImageZoom(1)
                setImageRotation(0)
              }}
              disabled={isImageLoading}
              className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white hover:bg-white/20 rounded-md transition-colors cursor-pointer disabled:opacity-30"
              title="Đặt lại 100%"
            >
              {Math.round(imageZoom * 100)}%
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={() =>
                setImageZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))
              }
              disabled={imageZoom >= 3 || isImageLoading}
              className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer text-slate-200 hover:text-white"
              title="Phóng to (+25%)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <span className="w-px h-3.5 bg-white/20 mx-0.5" />

            {/* Xoay trái */}
            <button
              type="button"
              onClick={() => setImageRotation((r) => (r - 90 + 360) % 360)}
              disabled={isImageLoading}
              className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 disabled:opacity-30 transition-all cursor-pointer text-slate-200 hover:text-white"
              title="Xoay ngược chiều kim đồng hồ (90°)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Xoay phải */}
            <button
              type="button"
              onClick={() => setImageRotation((r) => (r + 90) % 360)}
              disabled={isImageLoading}
              className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 disabled:opacity-30 transition-all cursor-pointer text-slate-200 hover:text-white"
              title="Xoay theo chiều kim đồng hồ (90°)"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Nút Đặt lại khi có thay đổi */}
            {(imageZoom !== 1 || imageRotation !== 0) && (
              <>
                <span className="w-px h-3.5 bg-white/20 mx-0.5" />
                <button
                  type="button"
                  onClick={() => {
                    setImageZoom(1)
                    setImageRotation(0)
                  }}
                  disabled={isImageLoading}
                  className="px-2 py-0.5 rounded-full bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-30"
                  title="Khôi phục kích thước và góc quay ban đầu"
                >
                  Đặt lại
                </button>
              </>
            )}
          </div>
        </div>

        {/* ================= PHẦN BÊN PHẢI: THÔNG TIN RECORD BƯỚC CHỤP ================= */}
        <div className="w-full md:w-[42%] lg:w-[40%] h-1/2 md:h-full bg-white flex flex-col justify-between overflow-y-auto p-6 sm:p-8 border-t md:border-t-0 md:border-l border-slate-200">
          <div className="space-y-5">
            {/* Header thông tin Record */}
            <div className="border-b border-slate-100 pb-4 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Layers className="h-3.5 w-3.5" />
                  Phân xưởng {currentItem.group || "OSA"}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Record ID: #{currentItem.id}
                </span>

                {/* Trạng thái bước */}
                {currentItem.reCapture ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Cần chụp lại
                  </span>
                ) : currentItem.imagePath ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Hoàn thành
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
                    <Clock className="h-3.5 w-3.5" />
                    Chờ chụp
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex items-baseline gap-3 flex-wrap">
                <h2 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {currentItem.poNumber}
                </h2>
                <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-extrabold text-blue-700">
                  Bước {currentItem.stepNo}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {currentItem.productName || "Sản phẩm đóng gói"}
                {currentItem.productCode && (
                  <span className="text-slate-400 font-mono ml-2">
                    ({currentItem.productCode})
                  </span>
                )}
              </p>
            </div>

            {/* Tiêu chuẩn kiểm tra (notes) */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Tiêu chuẩn kiểm tra (notes)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                {currentItem.notes || (
                  <span className="text-slate-400 italic">
                    Chưa có ghi chú kiểm tra cho bước này.
                  </span>
                )}
              </p>
            </div>

            {/* Đường dẫn ảnh chụp thực tế (imagePath) */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Đường dẫn ảnh chụp thực tế (imagePath)
              </span>
              <div className="flex items-center justify-between gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-700">
                <span className="truncate">
                  {currentItem.imagePath || "Chưa có ảnh chụp thực tế"}
                </span>
              </div>
            </div>

            {/* Đường dẫn ảnh mẫu quy chuẩn (sampleUrl) */}
            {currentItem.sampleUrl && (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Đường dẫn ảnh mẫu quy chuẩn (sampleUrl)
                </span>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-700">
                  <span className="truncate">{currentItem.sampleUrl}</span>
                </div>
              </div>
            )}

            {/* Nhóm & Bước số & Mã khuôn */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Nhóm / Xưởng (group)
                </span>
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {currentItem.group || "OSA"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Bước số (stepNo)
                </span>
                <span className="text-xs font-bold text-indigo-700">
                  Bước {currentItem.stepNo}
                </span>
              </div>
            </div>

            {/* Lịch sử Chụp / Tạo & Cập nhật */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Người chụp / tạo */}
              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Người chụp / tạo:
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    {typeof currentItem.creator === "number"
                      ? `NV-${currentItem.creator}`
                      : currentItem.creator || "NV-QUANG"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>
                    {currentItem.createTime
                      ? new Date(currentItem.createTime).toLocaleString("vi-VN")
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Cập nhật lần cuối */}
              <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Cập nhật lần cuối:
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <User className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    {typeof currentItem.updater === "number"
                      ? `NV-${currentItem.updater}`
                      : currentItem.updater || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>
                    {currentItem.updatedTime
                      ? new Date(currentItem.updatedTime).toLocaleString("vi-VN")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer của panel bên phải: Nút điều hướng Carousel & Nút Đóng */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex <= 0 || isImageLoading}
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-2xs ${
                  isImageLoading ? "opacity-30 cursor-not-allowed" : ""
                }`}
                title="Ảnh liền trước"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Trước</span>
              </button>

              <span className="px-2 text-xs font-mono font-bold text-slate-600">
                {currentIndex + 1} / {items.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= items.length - 1 || isImageLoading}
                className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-2xs ${
                  isImageLoading ? "opacity-30 cursor-not-allowed" : ""
                }`}
                title="Ảnh liền sau"
              >
                <span>Sau</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
