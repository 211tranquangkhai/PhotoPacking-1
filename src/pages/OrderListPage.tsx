import { useState, useMemo, useEffect } from "react"
import {
  RotateCcw,
  X,
  Eye,
  Loader2,
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
import { OrderListSkeleton } from "@/components/OrderCardSkeleton"
import type { PhotoPackingSummary } from "@/types/photoPackingSummary"
import { fetchOrdersFromApi, fetchPhotosForOrderApi } from "@/services/photoPackingService"

interface OrderListPageProps {
  onOpenOrderCamera: (po: string) => void
  onOpenScanCamera: () => void
  isLoading?: boolean
  onRefresh?: () => Promise<void> | void
}

export default function OrderListPage({
  onOpenOrderCamera,
  onOpenScanCamera,
  isLoading: propIsLoading,
  onRefresh,
}: OrderListPageProps) {
  // Quản lý 2 Tab chính: "pending" (Chờ chụp) | "completed" (Đã hoàn tất)
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending")

  // Bộ lọc tìm kiếm
  const [searchQuery, setSearchQuery] = useState("")

  // Đơn hàng đang chọn để xem ảnh chi tiết
  const [viewingOrder, setViewingOrder] = useState<PhotoPackingSummary | null>(null)
  const [viewingOrderPhotos, setViewingOrderPhotos] = useState<string[]>([])
  const [isFetchingPhotos, setIsFetchingPhotos] = useState(false)

  // Danh sách đơn hàng nhận từ API
  const [pendingOrders, setPendingOrders] = useState<PhotoPackingSummary[]>([])
  const [completedOrders, setCompletedOrders] = useState<PhotoPackingSummary[]>([])

  // Quản lý trạng thái loading khi chờ dữ liệu trả về từ API
  const [internalLoading, setInternalLoading] = useState(true)
  const isLoading = propIsLoading !== undefined ? propIsLoading : internalLoading

  // Hiệu ứng làm mới danh sách (vòng xoay của nút refresh)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Gọi API tải danh sách PO khi trang được khởi tạo
  useEffect(() => {
    let isMounted = true

    async function loadInitialOrders() {
      setInternalLoading(true)
      try {
        const data = await fetchOrdersFromApi()
        if (isMounted) {
          setPendingOrders(data.pending)
          setCompletedOrders(data.completed)
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu PO từ API:", error)
      } finally {
        if (isMounted) {
          setInternalLoading(false)
        }
      }
    }

    loadInitialOrders()

    return () => {
      isMounted = false
    }
  }, [])

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredPendingOrders = useMemo(() => {
    if (!searchQuery.trim()) return pendingOrders
    const q = searchQuery.toLowerCase().trim()
    return pendingOrders.filter(
      (item) =>
        item.pO.toLowerCase().includes(q) ||
        item.productCode.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    )
  }, [searchQuery, pendingOrders])

  const filteredCompletedOrders = useMemo(() => {
    if (!searchQuery.trim()) return completedOrders
    const q = searchQuery.toLowerCase().trim()
    return completedOrders.filter(
      (item) =>
        item.pO.toLowerCase().includes(q) ||
        item.productCode.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    )
  }, [searchQuery, completedOrders])

  // Nút làm mới danh sách - kích hoạt lại trạng thái loading chờ API
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setInternalLoading(true)
    try {
      if (onRefresh) {
        await onRefresh()
      } else {
        const data = await fetchOrdersFromApi()
        setPendingOrders(data.pending)
        setCompletedOrders(data.completed)
      }
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu từ API:", error)
    } finally {
      setIsRefreshing(false)
      setInternalLoading(false)
    }
  }

  // Xử lý mở xem ảnh theo yêu cầu on-demand từ API
  const handleOpenPhotoViewer = async (order: PhotoPackingSummary) => {
    setViewingOrder(order)
    setViewingOrderPhotos([])
    setIsFetchingPhotos(true)
    try {
      const result = await fetchPhotosForOrderApi(order.pO)
      setViewingOrderPhotos(result.photoUrls)
    } catch (error) {
      console.error("Lỗi khi tải ảnh on-demand:", error)
    } finally {
      setIsFetchingPhotos(false)
    }
  }

  return (
    <div className="bg-surface w-full text-on-surface h-screen h-dvh flex flex-col overflow-hidden">
      <div className="pwa-container w-full h-full flex flex-col overflow-hidden relative">
        {/* ========================================================= */}
        {/* PHẦN 1 CỐ ĐỊNH: TopAppBar (Header trạm kiểm soát)       */}
        {/* ========================================================= */}
        <header className="shrink-0 h-14 w-full bg-surface/95 backdrop-blur border-b border-outline-variant flex justify-between items-center px-4 z-30 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-primary tracking-tight">Photo Packing</h1>
          </div>
          <div className="px-3 py-1 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shadow-sm">
            <span className="text-[12px] font-bold text-primary tracking-wider">#84920</span>
          </div>
        </header>

        {/* ========================================================= */}
        {/* PHẦN 2 CỐ ĐỊNH: Search Bar & 2 Thẻ Tab Chuyển Đổi       */}
        {/* NẰM YÊN Ở TRÊN CÙNG KHI SCROLL DANH SÁCH                  */}
        {/* ========================================================= */}
        <div className="shrink-0 space-y-3 px-4 pt-3 pb-3 bg-surface z-20 border-b border-outline-variant/40 shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
          {/* Thanh tìm kiếm (Search bar) */}
          <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-secondary text-[20px] mr-2 shrink-0">
              search
            </span>
            <input
              className="w-full bg-transparent border-0 p-0 text-[13px] text-on-surface placeholder:text-gray-400 focus:ring-0 focus:outline-none"
              placeholder="Tìm kiếm PO, mã sản phẩm..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full text-secondary hover:text-primary mr-1"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              className="flex items-center justify-center p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors shrink-0 active:scale-95"
              title="Quét mã barcode/QR"
              type="button"
              onClick={onOpenScanCamera}
            >
              <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
            </button>
          </div>

          {/* Thống kê tổng quan (2 Thẻ đóng vai trò 2 Tab bấm chuyển đổi) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Thẻ 1: Chờ chụp */}
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`text-left p-3.5 rounded-xl flex flex-col justify-between shadow-sm min-h-[92px] transition-all duration-200 active:scale-[0.98] ${
                activeTab === "pending"
                  ? "bg-[#1b365d] text-white ring-2 ring-primary/20 shadow-md"
                  : "bg-surface-container-high border border-outline-variant hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[12px] font-medium ${
                    activeTab === "pending" ? "text-slate-200" : "text-secondary"
                  }`}
                >
                  Chờ chụp
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeTab === "pending" ? "text-amber-300" : "text-secondary"
                  }`}
                >
                  schedule
                </span>
              </div>
              <div>
                {isLoading ? (
                  <div
                    className={`h-8 w-11 rounded-lg animate-pulse my-0.5 ${
                      activeTab === "pending" ? "bg-white/25" : "bg-slate-300"
                    }`}
                  />
                ) : (
                  <p
                    className={`text-3xl font-bold tracking-tight leading-none ${
                      activeTab === "pending" ? "text-white" : "text-primary"
                    }`}
                  >
                    {pendingOrders.length.toString().padStart(2, "0")}
                  </p>
                )}
              </div>
            </button>

            {/* Thẻ 2: Đã hoàn tất */}
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`text-left p-3.5 rounded-xl flex flex-col justify-between shadow-sm min-h-[92px] transition-all duration-200 active:scale-[0.98] ${
                activeTab === "completed"
                  ? "bg-[#1b365d] text-white ring-2 ring-primary/20 shadow-md"
                  : "bg-surface-container-high border border-outline-variant hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[12px] font-medium ${
                    activeTab === "completed" ? "text-slate-200" : "text-secondary"
                  }`}
                >
                  Đã hoàn tất
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    activeTab === "completed" ? "text-emerald-400" : "text-emerald-600"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div>
                {isLoading ? (
                  <div
                    className={`h-8 w-11 rounded-lg animate-pulse my-0.5 ${
                      activeTab === "completed" ? "bg-white/25" : "bg-slate-300"
                    }`}
                  />
                ) : (
                  <p
                    className={`text-3xl font-bold tracking-tight leading-none ${
                      activeTab === "completed" ? "text-white" : "text-primary"
                    }`}
                  >
                    {completedOrders.length.toString().padStart(2, "0")}
                  </p>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PHẦN 3: DANH SÁCH ĐƠN HÀNG ĐƯỢC CUỘN ĐỘC LẬP           */}
        {/* ========================================================= */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-3.5 pb-28 scroll-smooth">
          {isLoading ? (
            <OrderListSkeleton
              count={4}
              message={
                activeTab === "pending"
                  ? "Đang tải danh sách PO chờ chụp từ máy chủ..."
                  : "Đang tải danh sách PO đã hoàn tất từ máy chủ..."
              }
            />
          ) : (
            <>
              {/* TAB 1: Danh sách Đơn hàng Chờ chụp (gồm Chờ chụp, Đang chụp, Chụp lại) */}
              {activeTab === "pending" && (
                <>
                  {filteredPendingOrders.length === 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center space-y-2">
                      <span className="material-symbols-outlined text-secondary text-4xl">inbox</span>
                      <p className="text-sm font-medium text-primary">Không tìm thấy đơn hàng</p>
                      <p className="text-xs text-secondary">
                        Không có đơn hàng nào khớp với từ khóa "{searchQuery}"
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-xs"
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  ) : (
                    filteredPendingOrders.map((order) => {
                      const isRetake = order.statusId === 2
                      const isInProgress = order.statusId === 1

                      return (
                        <div
                          key={order.pO}
                          className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform duration-150"
                        >
                          <div className="p-4 space-y-2.5">
                            <div className="flex justify-between items-start">
                              <h3 className="text-[18px] text-primary font-bold">
                                Đơn hàng #{order.pO}
                              </h3>

                              {isRetake ? (
                                <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[11px] rounded-full font-semibold tracking-wide flex items-center gap-1 shadow-sm">
                                  <span className="material-symbols-outlined text-[13px]">error</span>
                                  Chụp lại
                                </span>
                              ) : isInProgress ? (
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] rounded-full font-semibold tracking-wide flex items-center gap-1 shadow-sm">
                                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                                  Đang chụp
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 bg-surface-container-high text-secondary border border-outline-variant text-[11px] rounded-full font-semibold tracking-wide shadow-sm">
                                  Chờ chụp
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 text-secondary text-[13px]">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px]">assignment</span>
                                  <span>
                                    Step: {order.currentStep}/{order.totalStep}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                <span className="truncate">
                                  Product: {order.productCode} {order.productName ? `• ${order.productName}` : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-2.5 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
                            <span className="text-[13px] text-secondary italic">
                              {order.type || "Đóng gói tiêu chuẩn"}
                            </span>

                            {isRetake ? (
                              <button
                                onClick={() => onOpenOrderCamera(order.pO)}
                                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center p-2 rounded-lg active:opacity-90 transition-colors shadow-sm"
                                title="Chụp lại"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[20px]">replay</span>
                              </button>
                            ) : isInProgress ? (
                              <button
                                onClick={() => onOpenOrderCamera(order.pO)}
                                className="bg-primary hover:bg-[#1b365d] text-white flex items-center justify-center p-2 rounded-lg active:opacity-90 transition-colors shadow-sm"
                                title="Tiếp tục"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenOrderCamera(order.pO)}
                                className="bg-primary hover:bg-[#1b365d] text-white flex items-center justify-center p-2 rounded-lg active:opacity-90 transition-colors shadow-sm"
                                title="Bắt đầu"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </>
              )}

              {/* TAB 2: Danh sách Đơn hàng Đã hoàn tất (chỉ hiển thị Step: currentStep) */}
              {activeTab === "completed" && (
                <>
                  {filteredCompletedOrders.length === 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center space-y-2">
                      <span className="material-symbols-outlined text-secondary text-4xl">inbox</span>
                      <p className="text-sm font-medium text-primary">Không tìm thấy đơn hàng</p>
                      <p className="text-xs text-secondary">
                        Không có đơn hàng nào khớp với từ khóa "{searchQuery}"
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-xs"
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  ) : (
                    filteredCompletedOrders.map((order, idx) => (
                      <div
                        key={`${order.pO}-${order.currentStep}-${idx}`}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform duration-150"
                      >
                        <div className="p-4 space-y-2.5">
                          <div className="flex justify-between items-start">
                            <h3 className="text-[18px] text-primary font-bold">
                              Đơn hàng #{order.pO}
                            </h3>
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] rounded-full font-semibold tracking-wide flex items-center gap-1 shadow-sm">
                              <span
                                className="material-symbols-outlined text-[13px] text-emerald-600"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                check_circle
                              </span>
                              Hoàn thành
                            </span>
                          </div>

                          <div className="space-y-1 text-secondary text-[13px]">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">assignment</span>
                                {/* THEO YÊU CẦU: Các thẻ PO trong tab đã hoàn tất chỉ hiển thị Step: currentStep */}
                                <span className="font-medium text-on-surface">
                                  Step: {order.currentStep}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                              <span className="truncate">
                                Product: {order.productCode} {order.productName ? `• ${order.productName}` : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-2.5 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
                          <span className="text-[13px] text-secondary italic">
                            {order.type || "Đóng gói tiêu chuẩn"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenPhotoViewer(order)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant text-primary rounded-lg text-[12px] font-semibold transition-colors shadow-sm active:scale-95"
                              title="Xem ảnh đã chụp"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>Xem</span>
                            </button>
                            <button
                              onClick={() => onOpenOrderCamera(order.pO)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-high hover:bg-slate-200 border border-outline-variant text-secondary hover:text-primary rounded-lg text-[12px] font-semibold transition-colors shadow-sm active:scale-95"
                              title="Chụp lại ảnh"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">replay</span>
                              <span>Chụp lại</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* ========================================================= */}
        {/* PHẦN 4 CỐ ĐỊNH: Nút nổi FAB ở góc dưới bên phải         */}
        {/* ========================================================= */}
        <div className="absolute right-5 bottom-20 flex flex-col items-center gap-3 z-40">
          {/* Refresh FAB */}
          <button
            className={`w-11 h-11 bg-surface-container-lowest text-primary border border-outline-variant rounded-full shadow-md flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all ${
              isLoading || isRefreshing ? "opacity-75 cursor-not-allowed" : ""
            }`}
            onClick={handleRefresh}
            title={isLoading ? "Đang tải danh sách..." : "Làm mới danh sách"}
            type="button"
            disabled={isLoading || isRefreshing}
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-transform duration-500 ${
                isRefreshing || isLoading ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
          </button>

          {/* Photo FAB */}
          <button
            onClick={onOpenScanCamera}
            className="w-14 h-14 bg-primary hover:bg-[#1b365d] text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all ring-2 ring-white/50"
            title="Chụp ảnh đóng gói"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_a_photo
            </span>
          </button>
        </div>
      </div>

      {/* Modal Xem Ảnh Đã Chụp (Preview Dialog khi bấm nút 'Xem' - LẤY ẢNH TỪ API ON-DEMAND) */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="bg-white text-slate-900 border-slate-200 sm:max-w-md rounded-2xl p-5 shadow-2xl">
          {viewingOrder && (
            <>
              <DialogHeader className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold text-primary flex items-center gap-2">
                    <Eye className="w-5 h-5 text-emerald-600" />
                    Ảnh Đơn hàng #{viewingOrder.pO}
                  </DialogTitle>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full font-semibold">
                    Hoàn thành (Step {viewingOrder.currentStep})
                  </span>
                </div>
                <DialogDescription className="text-xs text-secondary">
                  Sản phẩm: <span className="font-semibold text-slate-700">{viewingOrder.productCode}</span> {viewingOrder.productName ? `• ${viewingOrder.productName}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="py-2 space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
                  {isFetchingPhotos ? (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs">Đang tải ảnh từ server...</span>
                    </div>
                  ) : (
                    <img
                      src={
                        viewingOrderPhotos[0] ||
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={`Đơn hàng #${viewingOrder.pO}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur rounded text-white text-[11px] font-mono">
                    {typeof viewingOrder.updatedTime === "string"
                      ? viewingOrder.updatedTime.slice(0, 10)
                      : "22/09/2026"} • {viewingOrder.updator || "#84920"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Trạm kiểm soát</span>
                    <span className="font-medium text-slate-800">
                      {viewingOrder.updator || "#84920"} (Xưởng {viewingOrder.group || "OSA"})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bước hoàn tất</span>
                    <span className="font-medium text-emerald-600 font-bold">
                      Bước {viewingOrder.currentStep}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setViewingOrder(null)}
                  className="flex-1 text-slate-700 border-slate-300"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    const order = viewingOrder
                    setViewingOrder(null)
                    onOpenOrderCamera(order.pO)
                  }}
                  className="flex-1 bg-[#1b365d] hover:bg-[#132742] text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Chụp Lại
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
