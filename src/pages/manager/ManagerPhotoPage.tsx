import { useState, useMemo, useEffect } from "react"
import {
  Images,
  TableProperties,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  User,
  Calendar,
  X,
  RotateCcw,
  AlertCircle,
} from "lucide-react"
import type { PhotoPackingSummary, OrderStepDetail } from "@/types"
import { generateStepDetailsFromOrders } from "@/services/managerService"
import { fetchPhotoPackingItems } from "@/services/photoPackingItemService"
import OrderPhotoGalleryModal from "@/components/manager/OrderPhotoGalleryModal"

interface ManagerPhotoPageProps {
  orders: PhotoPackingSummary[]
  initialTab?: "summary" | "detail"
  isLoadingOrders?: boolean
  userGroup?: string
}

export default function ManagerPhotoPage({
  orders,
  initialTab = "detail",
  isLoadingOrders = false,
  userGroup,
}: ManagerPhotoPageProps) {
  // Quản lý tab: "summary" (PhotoPackingSummary) | "detail" (Chi tiết từng bước)
  const [activeTab, setActiveTab] = useState<"summary" | "detail">(initialTab)

  // Bộ lọc chung
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // State xem ảnh của một PO (mở Modal)
  const [selectedOrderForGallery, setSelectedOrderForGallery] =
    useState<PhotoPackingSummary | null>(null)
  const [selectedGalleryStep, setSelectedGalleryStep] = useState<number>(1)

  // Mở modal xem ảnh cho một bước cụ thể trong Tab Detail
  const handleOpenStepPhoto = (detail: OrderStepDetail) => {
    const parent = orders.find((o) => o.pO === detail.poNumber)
    if (parent) {
      setSelectedOrderForGallery(parent)
    } else {
      setSelectedOrderForGallery({
        pO: detail.poNumber,
        productCode: detail.productCode,
        productName: detail.productName,
        group: detail.group,
        creator: typeof detail.creator === "number" ? `NV-${detail.creator}` : String(detail.creator || "NV-QUANG"),
        createTime: detail.createTime,
        updator: typeof detail.updater === "number" ? `NV-${detail.updater}` : "NV-10321",
        updatedTime: detail.updatedTime || detail.createTime,
        type: "Box",
        productKey: detail.productKey || "BOX",
        totalStep: detail.totalStep || 2,
        currentStep: detail.stepNo,
        notes: detail.notes || "",
        statusId: detail.reCapture ? 2 : detail.imagePath ? 3 : 0,
        photoUrls: detail.imagePath ? [detail.imagePath] : [],
        samplePhotoUrl: detail.sampleUrl,
      })
    }
    setSelectedGalleryStep(detail.stepNo)
  }

  const [apiStepDetails, setApiStepDetails] = useState<OrderStepDetail[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  // Tải chi tiết từng bước chụp thực tế từ Backend API
  const loadStepDetails = async () => {
    setIsLoadingDetails(true)
    setDetailsError(null)
    try {
      const items = await fetchPhotoPackingItems(undefined, userGroup, userGroup)
      setApiStepDetails(items as OrderStepDetail[])
    } catch (err: any) {
      setDetailsError(err.message || "Không thể tải chi tiết bước chụp từ Backend API.")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  useEffect(() => {
    loadStepDetails()
  }, [userGroup])

  // Tạo danh sách dữ liệu chi tiết từng bước cho tab Detail (ưu tiên dữ liệu từ API)
  const stepDetailsList: OrderStepDetail[] = useMemo(() => {
    if (apiStepDetails.length > 0) return apiStepDetails
    return generateStepDetailsFromOrders(orders)
  }, [apiStepDetails, orders])

  // Kiểm tra một mốc thời gian có nằm trong khoảng từ ngày ... đến ngày ... hay không
  const isDateInRange = (dateVal?: string | Date) => {
    if (!startDate && !endDate) return true
    if (!dateVal) return false
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return true
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const dateStr = `${yyyy}-${mm}-${dd}`
    if (startDate && dateStr < startDate) return false
    if (endDate && dateStr > endDate) return false
    return true
  }

  // Lọc dữ liệu cho Tab Summary
  const filteredSummaryOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return orders.filter((order) => {
      // 1. Lọc theo tìm kiếm (PO, Mã SP, Tên SP, Người tạo)
      const matchesSearch =
        !query ||
        order.pO.toLowerCase().includes(query) ||
        (order.productCode && order.productCode.toLowerCase().includes(query)) ||
        (order.productName && order.productName.toLowerCase().includes(query)) ||
        (order.creator && order.creator.toLowerCase().includes(query))

      // 2. Lọc theo Trạng thái
      const matchesStatus =
        selectedStatus === "all" || order.statusId.toString() === selectedStatus

      // 3. Lọc theo Khoảng ngày (Từ ngày ... Đến ngày ...)
      const matchesDate = isDateInRange(order.updatedTime || order.createTime)

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, searchQuery, selectedStatus, startDate, endDate])

  // Lọc dữ liệu cho Tab Detail
  const filteredStepDetails = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return stepDetailsList.filter((detail) => {
      // 1. Lọc theo tìm kiếm
      const matchesSearch =
        !query ||
        detail.poNumber.toLowerCase().includes(query) ||
        detail.productCode.toLowerCase().includes(query) ||
        detail.productName.toLowerCase().includes(query) ||
        (detail.creator && String(detail.creator).toLowerCase().includes(query)) ||
        `bước ${detail.stepNo}`.includes(query) ||
        (detail.notes && detail.notes.toLowerCase().includes(query))

      // 2. Lọc theo Trạng thái bước
      let matchesStatus = true
      if (selectedStatus !== "all") {
        const isCompleted = !detail.reCapture && Boolean(detail.imagePath)
        const isRecapture = detail.reCapture
        const isPending = !detail.imagePath && !detail.reCapture

        if (selectedStatus === "3") matchesStatus = isCompleted
        else if (selectedStatus === "2") matchesStatus = isRecapture
        else if (selectedStatus === "0" || selectedStatus === "1")
          matchesStatus = isPending
      }

      // 3. Lọc theo Khoảng ngày (Từ ngày ... Đến ngày ...)
      const matchesDate = isDateInRange(detail.updatedTime || detail.createTime)

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [stepDetailsList, searchQuery, selectedStatus, startDate, endDate])

  // Helper hiển thị huy hiệu trạng thái
  const renderStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 3:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Hoàn thành
          </span>
        )
      case 2:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
            <AlertTriangle className="h-3.5 w-3.5" />
            Chụp lại
          </span>
        )
      case 1:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
            <Camera className="h-3.5 w-3.5" />
            Đang chụp
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
            <Clock className="h-3.5 w-3.5" />
            Chờ chụp
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* ================= 2 Tabs Card Container: Cố định khi scroll (Sticky) ================= */}
      <div className="sticky top-16 z-30 bg-slate-50/95 py-3 backdrop-blur-md -mt-2">
        <div className="inline-flex items-center rounded-2xl bg-slate-200/80 p-1.5 shadow-inner border border-slate-300/70">
          <button
            id="tab-summary-btn"
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out cursor-pointer select-none ${activeTab === "summary"
              ? "bg-white text-blue-700 shadow-md shadow-slate-900/10 scale-[1.02] ring-1 ring-black/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
              }`}
          >
            <TableProperties
              className={`h-4 w-4 transition-transform duration-200 ${activeTab === "summary" ? "text-blue-600 scale-110" : "text-slate-500"
                }`}
            />
            <span>Summary</span>
          </button>

          <button
            id="tab-detail-btn"
            type="button"
            onClick={() => setActiveTab("detail")}
            className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ease-in-out cursor-pointer select-none ${activeTab === "detail"
              ? "bg-white text-blue-700 shadow-md shadow-slate-900/10 scale-[1.02] ring-1 ring-black/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
              }`}
          >
            <Images
              className={`h-4 w-4 transition-transform duration-200 ${activeTab === "detail" ? "text-blue-600 scale-110" : "text-slate-500"
                }`}
            />
            <span>Detail</span>
          </button>
        </div>
      </div>

      {/* ================= Filter & Search Bar ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Nhập số PO"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-md transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Các bộ lọc dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc Trạng thái */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="0">Chờ chụp</option>
              <option value="1">Đang chụp</option>
              <option value="2">Cần chụp lại</option>
              <option value="3">Hoàn thành</option>
            </select>
          </div>

          {/* Lọc Từ ngày */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500 whitespace-nowrap">Từ ngày:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer hover:border-slate-300 transition-colors"
            />
          </div>

          {/* Lọc Đến ngày */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500 whitespace-nowrap">Đến ngày:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer hover:border-slate-300 transition-colors"
            />
          </div>

          {/* Nút reset lọc */}
          {(searchQuery || selectedStatus !== "all" || startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSelectedStatus("all")
                setStartDate("")
                setEndDate("")
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: SUMMARY TABLE ================= */}
      {activeTab === "summary" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 pl-4 pr-3">PO</th>
                  <th className="py-3.5 px-3">Product</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">NV Packing</th>
                  <th className="py-3.5 px-3">Thời gian chụp</th>
                  <th className="py-3.5 px-3">Tiến độ</th>
                  <th className="py-3.5 px-3">Trạng thái</th>
                  <th className="py-3.5 pr-4 pl-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingOrders ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-slate-400">
                      <RotateCcw className="h-8 w-8 mx-auto text-blue-500 animate-spin mb-3" />
                      <p className="font-semibold text-slate-700">Đang tải danh sách đơn hàng từ Backend API...</p>
                      <p className="text-xs text-slate-400 mt-1">Vui lòng chờ trong giây lát</p>
                    </td>
                  </tr>
                ) : filteredSummaryOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Images className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Không tìm thấy đơn hàng nào</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSummaryOrders.map((order) => {
                    const totalStep = order.totalStep || 2
                    const currentStep = order.currentStep || 0

                    return (
                      <tr
                        key={order.pO}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        {/* Số PO */}
                        <td className="py-3.5 pl-4 pr-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForGallery(order)
                              setSelectedGalleryStep(1)
                            }}
                            title="Nhấn để xem ảnh đơn hàng này"
                            className="bg-slate-100 hover:bg-blue-100/80 text-slate-900 hover:text-blue-900 px-2.5 py-1 rounded-md transition-all font-mono font-bold text-xs cursor-pointer inline-flex items-center gap-1 border border-transparent hover:border-blue-300"
                          >
                            {order.pO}
                          </button>
                        </td>

                        {/* Sản phẩm */}
                        <td className="py-3.5 px-3 min-w-44 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">
                            {order.productName || "Chưa có tên SP"}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate">
                            {order.productCode || "—"}
                          </div>
                        </td>

                        {/* Loại bao bì */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {order.type || "Box"}
                          </span>
                        </td>

                        {/* Người chụp / tạo */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>{order.creator || "NV-QUANG"}</span>
                          </div>
                        </td>

                        {/* Thời gian */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>
                              {order.updatedTime
                                ? new Date(order.updatedTime).toLocaleString("vi-VN")
                                : order.createTime
                                  ? new Date(order.createTime).toLocaleString("vi-VN")
                                  : "—"}
                            </span>
                          </div>
                        </td>

                        {/* Tiến độ bước */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span>
                                {currentStep}/{totalStep}
                              </span>
                              <span className="text-slate-400 font-normal">
                                {Math.round((currentStep / totalStep) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${order.statusId === 3
                                  ? "bg-emerald-500"
                                  : order.statusId === 2
                                    ? "bg-amber-500"
                                    : "bg-blue-600"
                                  }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (currentStep / totalStep) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderStatusBadge(order.statusId)}
                        </td>

                        {/* Cột Thao tác: Bấm nút Xem ảnh để xem */}
                        <td className="py-3.5 pr-4 pl-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForGallery(order)
                              setSelectedGalleryStep(1)
                            }}
                            title="Xem tất cả ảnh PO"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 active:scale-95 transition-all cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer tổng kết của bảng Summary */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
            <span>
              Hiển thị <strong>{filteredSummaryOrders.length}</strong> / <strong>{orders.length}</strong> đơn hàng PhotoPackingSummary
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Hoàn thành: {orders.filter((o) => o.statusId === 3).length}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Cần chụp lại: {orders.filter((o) => o.statusId === 2).length}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Đang chụp: {orders.filter((o) => o.statusId === 1).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DETAIL TABLE (CHI TIẾT TỪNG BƯỚC) ================= */}
      {activeTab === "detail" && (
        <div className="space-y-4">
          {detailsError && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>{detailsError}</span>
              </div>
              <button
                type="button"
                onClick={loadStepDetails}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 pl-4 pr-3">PO</th>
                    <th className="py-3.5 px-3">Tên sản phẩm</th>
                    <th className="py-3.5 px-3 font-extrabold text-slate-900">Bước</th>
                    <th className="py-3.5 px-3 font-extrabold text-slate-900">Người chụp</th>
                    <th className="py-3.5 px-3 font-extrabold text-slate-900">Thời gian chụp</th>
                    <th className="py-3.5 px-3">Trạng thái</th>
                    <th className="py-3.5 px-3">Notes</th>
                    <th className="py-3.5 pr-4 pl-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingDetails ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-400">
                        <RotateCcw className="h-8 w-8 mx-auto text-blue-500 animate-spin mb-3" />
                        <p className="font-semibold text-slate-700">Đang tải danh sách các bước chụp từ API...</p>
                        <p className="text-xs text-slate-400 mt-1">Vui lòng chờ trong giây lát</p>
                      </td>
                    </tr>
                  ) : filteredStepDetails.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Images className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">Không tìm thấy bước chụp nào phù hợp</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Hãy thử điều chỉnh bộ lọc bước hoặc từ khóa tìm kiếm
                        </p>
                      </td>
                    </tr>
                  ) : (
                  filteredStepDetails.map((detail) => {
                    return (
                      <tr
                        key={detail.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        {/* Số PO */}
                        <td className="py-3.5 pl-4 pr-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenStepPhoto(detail)}
                            title="Xem ảnh bước này"
                            className="bg-slate-100 hover:bg-blue-100/80 text-slate-900 hover:text-blue-900 px-2.5 py-1 rounded-md transition-all font-mono font-bold text-xs cursor-pointer inline-flex items-center gap-1 border border-transparent hover:border-blue-300"
                          >
                            {detail.poNumber}
                          </button>
                        </td>

                        {/* Sản phẩm */}
                        <td className="py-3.5 px-3 min-w-44 max-w-xs">
                          <div className="font-bold text-slate-800 line-clamp-1">
                            {detail.productName || "Sản phẩm tiêu chuẩn"}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {detail.productCode}
                          </div>
                        </td>

                        {/* Bước chụp (Highlight theo yêu cầu) */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenStepPhoto(detail)}
                            title={`Xem ảnh Bước ${detail.stepNo}`}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800 px-2.5 py-1 text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Bước {detail.stepNo}
                          </button>
                        </td>

                        {/* Người chụp (Highlight theo yêu cầu) */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            <span>
                              {typeof detail.creator === "number"
                                ? `NV-${detail.creator}`
                                : detail.creator || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Thời gian chụp (Highlight theo yêu cầu) */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-600 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {detail.createTime
                                ? new Date(detail.createTime).toLocaleString("vi-VN")
                                : "—"}
                            </span>
                          </div>
                        </td>

                        {/* Trạng thái bước */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {detail.reCapture ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Cần chụp lại
                            </span>
                          ) : detail.imagePath ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đã chụp đạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              Chưa chụp
                            </span>
                          )}
                        </td>

                        {/* Ghi chú */}
                        <td className="py-3.5 px-3 min-w-40 text-slate-500">
                          {detail.notes ? (
                            <span className="text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded px-2 py-0.5 text-[11px] block">
                              {detail.notes}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Đúng quy chuẩn</span>
                          )}
                        </td>

                        {/* Cột Thao tác: Chỉ hiển thị icon, khi hover hiện title của nút */}
                        <td className="py-3.5 pr-4 pl-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            title="Xem ảnh"
                            onClick={() => handleOpenStepPhoto(detail)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 active:scale-95 transition-all cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer tổng kết của bảng Detail */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
            <span>
              Tổng cộng: <strong>{filteredStepDetails.length}</strong> dòng bước chụp chi tiết
            </span>
            <div className="flex items-center gap-4">
              <span>Đạt: <strong className="text-emerald-700">{filteredStepDetails.filter((d) => !d.reCapture && Boolean(d.imagePath)).length}</strong></span>
              <span>Cần chụp lại: <strong className="text-amber-700">{filteredStepDetails.filter((d) => d.reCapture).length}</strong></span>
              <span>Chưa chụp: <strong className="text-slate-700">{filteredStepDetails.filter((d) => !d.imagePath && !d.reCapture).length}</strong></span>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Modal xem ảnh (OrderPhotoGalleryModal) khi click "Xem ảnh" tại Summary hoặc nút icon tại Detail */}
      {selectedOrderForGallery && (
        <OrderPhotoGalleryModal
          order={selectedOrderForGallery}
          initialStep={selectedGalleryStep}
          onClose={() => setSelectedOrderForGallery(null)}
        />
      )}
    </div>
  )
}
