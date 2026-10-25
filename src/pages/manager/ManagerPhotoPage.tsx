import { useState, useMemo, useEffect, useRef } from "react"
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCw,
  Package,
  Flame,
} from "lucide-react"
import type { PhotoPackingSummary, OrderStepDetail } from "@/types"
import { generateStepDetailsFromOrders } from "@/services/managerService"
import { fetchPhotoPackingItems } from "@/services/photoPackingItemService"
import OrderPhotoGalleryModal from "@/components/manager/OrderPhotoGalleryModal"
import TablePagination from "@/components/common/TablePagination"

interface ManagerPhotoPageProps {
  orders: PhotoPackingSummary[]
  initialTab?: "summary" | "detail"
  isLoadingOrders?: boolean
  userGroup?: string
  onRefresh?: () => Promise<void> | void
}

export default function ManagerPhotoPage({
  orders,
  initialTab = "detail",
  isLoadingOrders = false,
  userGroup,
  onRefresh,
}: ManagerPhotoPageProps) {
  // Quản lý tab: "summary" (PhotoPackingSummary) | "detail" (Chi tiết từng bước)
  const [activeTab, setActiveTab] = useState<"summary" | "detail">(initialTab)

  // Bộ lọc chung
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Phân trang cho bảng (10 bản ghi mỗi trang)
  const PAGE_SIZE = 10
  const [summaryCurrentPage, setSummaryCurrentPage] = useState<number>(1)
  const [detailCurrentPage, setDetailCurrentPage] = useState<number>(1)

  // Reset về trang 1 khi thay đổi bộ lọc tìm kiếm / trạng thái / khoảng ngày
  useEffect(() => {
    setSummaryCurrentPage(1)
    setDetailCurrentPage(1)
  }, [searchQuery, selectedStatus, startDate, endDate])

  // Trạng thái mở Popover cho Status và DatePicker
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date())

  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Đóng popovers khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false)
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  // Danh sách các trạng thái để lọc (bổ sung trạng thái Gần hết hạn)
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", dotColor: "bg-slate-300" },
    { value: "3", label: "Hoàn thành", dotColor: "bg-emerald-500" },
    { value: "2", label: "Cần chụp lại", dotColor: "bg-amber-500" },
    { value: "1", label: "Đang chụp", dotColor: "bg-blue-500" },
    { value: "0", label: "Chờ chụp", dotColor: "bg-slate-400" },
    { value: "expiring", label: "Gần hết hạn", dotColor: "bg-rose-500" },
  ]

  const currentStatusObj =
    statusOptions.find((o) => o.value === selectedStatus) || statusOptions[0]

  // Map tra cứu nhanh PO -> PhotoPackingSummary
  const ordersByPO = useMemo(() => {
    const map = new Map<string, PhotoPackingSummary>()
    for (const o of orders) {
      map.set(o.pO, o)
    }
    return map
  }, [orders])

  // Thống kê số lượng PO theo từng trạng thái (tính từ orders)
  const statusCounts = useMemo(() => {
    let pending = 0
    let inProgress = 0
    let recapture = 0
    let completed = 0
    let expiring = 0

    for (const o of orders) {
      if (o.statusId === 3) completed++
      else if (o.statusId === 2) recapture++
      else if (o.statusId === 1) inProgress++
      else pending++

      if (o.isExpiringSoon) expiring++
    }

    return {
      total: orders.length,
      pending,
      inProgress,
      recapture,
      completed,
      expiring,
    }
  }, [orders])

  // Định dạng ngày hiển thị dd/mm/yyyy
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return ""
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  // Chọn nhanh khoảng ngày theo presets
  const setDatePreset = (preset: "today" | "yesterday" | "7days" | "month" | "clear") => {
    const today = new Date()
    const formatDateVal = (d: Date) => {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      return `${yyyy}-${mm}-${dd}`
    }

    if (preset === "clear") {
      setStartDate("")
      setEndDate("")
      return
    }

    if (preset === "today") {
      const str = formatDateVal(today)
      setStartDate(str)
      setEndDate(str)
    } else if (preset === "yesterday") {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      const str = formatDateVal(y)
      setStartDate(str)
      setEndDate(str)
    } else if (preset === "7days") {
      const past = new Date(today)
      past.setDate(past.getDate() - 6)
      setStartDate(formatDateVal(past))
      setEndDate(formatDateVal(today))
    } else if (preset === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      setStartDate(formatDateVal(firstDay))
      setEndDate(formatDateVal(today))
    }
  }

  // Hàm tải lại dữ liệu của trang
  const handleReloadData = async () => {
    setIsReloading(true)
    try {
      await Promise.allSettled([
        loadStepDetails(),
        onRefresh ? Promise.resolve(onRefresh()) : Promise.resolve(),
      ])
    } finally {
      setIsReloading(false)
    }
  }

  // Hàm xóa toàn bộ bộ lọc
  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedStatus("all")
    setStartDate("")
    setEndDate("")
  }

  // Handler cho nút "Xem tất cả ảnh" (logic sẽ bổ sung sau theo yêu cầu)
  const handleViewAllPhotos = () => {
    alert("Tính năng xem tất cả ảnh đang được cập nhật!")
  }

  // Chọn ngày trực tiếp trên mini calendar tháng
  const handleSelectCalendarDay = (day: number) => {
    const y = calendarMonth.getFullYear()
    const m = String(calendarMonth.getMonth() + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    const dateStr = `${y}-${m}-${d}`

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr)
      setEndDate("")
    } else if (startDate && !endDate) {
      if (dateStr >= startDate) {
        setEndDate(dateStr)
      } else {
        setEndDate(startDate)
        setStartDate(dateStr)
      }
    }
  }

  // Thông số hiển thị của mini calendar
  const calendarYear = calendarMonth.getFullYear()
  const calendarMonthIdx = calendarMonth.getMonth()
  const daysInMonth = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate()
  const rawFirstDay = new Date(calendarYear, calendarMonthIdx, 1).getDay()
  const firstDayOfWeek = (rawFirstDay + 6) % 7 // Chuyển sang Thứ 2 = 0

  const getCalendarDayMeta = (day: number) => {
    const y = calendarYear
    const m = String(calendarMonthIdx + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    const dateStr = `${y}-${m}-${d}`

    const isStart = startDate === dateStr
    const isEnd = endDate === dateStr
    const isInRange = Boolean(startDate && endDate && dateStr > startDate && dateStr < endDate)
    const todayStr = new Date().toISOString().slice(0, 10)
    const isToday = todayStr === dateStr

    return { isStart, isEnd, isInRange, isToday, dateStr }
  }

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

      // 2. Lọc theo Trạng thái (hỗ trợ lọc Gần hết hạn)
      let matchesStatus = true
      if (selectedStatus === "expiring") {
        matchesStatus = Boolean(order.isExpiringSoon)
      } else if (selectedStatus !== "all") {
        matchesStatus = order.statusId.toString() === selectedStatus
      }

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

      // 2. Lọc theo Trạng thái bước (hỗ trợ lọc Gần hết hạn)
      let matchesStatus = true
      if (selectedStatus === "expiring") {
        const parent = ordersByPO.get(detail.poNumber)
        matchesStatus = Boolean(parent?.isExpiringSoon)
      } else if (selectedStatus !== "all") {
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
  }, [stepDetailsList, searchQuery, selectedStatus, startDate, endDate, ordersByPO])

  // Dữ liệu phân trang cho Tab Summary (10 record mỗi trang)
  const paginatedSummaryOrders = useMemo(() => {
    const start = (summaryCurrentPage - 1) * PAGE_SIZE
    return filteredSummaryOrders.slice(start, start + PAGE_SIZE)
  }, [filteredSummaryOrders, summaryCurrentPage])

  // Dữ liệu phân trang cho Tab Detail (10 record mỗi trang)
  const paginatedStepDetails = useMemo(() => {
    const start = (detailCurrentPage - 1) * PAGE_SIZE
    return filteredStepDetails.slice(start, start + PAGE_SIZE)
  }, [filteredStepDetails, detailCurrentPage])

  // Helper hiển thị huy hiệu trạng thái (bổ sung huy hiệu Gần hết hạn dựa vào isExpiringSoon)
  const renderStatusBadge = (statusId: number, isExpiringSoon?: boolean) => {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {statusId === 3 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Hoàn thành
          </span>
        )}
        {statusId === 2 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
            <AlertTriangle className="h-3.5 w-3.5" />
            Chụp lại
          </span>
        )}
        {statusId === 1 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
            <Camera className="h-3.5 w-3.5" />
            Đang chụp
          </span>
        )}
        {statusId === 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
            <Clock className="h-3.5 w-3.5" />
            Chờ chụp
          </span>
        )}

        {isExpiringSoon && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200 shadow-2xs"
            title="Đơn hàng gần đến hạn xuất xưởng nhưng chưa hoàn tất đủ ảnh!"
          >
            <Flame className="h-3 w-3 text-rose-600 animate-pulse" />
            Gần hết hạn
          </span>
        )}
      </div>
    )
  }

  // Cấu hình các thẻ tổng hợp trạng thái PO
  const statusCardConfig = [
    {
      id: "all",
      label: "Tổng PO",
      count: statusCounts.total,
      icon: Package,
      iconBg: "bg-slate-100 text-slate-700",
      activeBg: "border-slate-500 bg-slate-100 ring-2 ring-slate-400/20 text-slate-900",
      inactiveBg: "border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700",
      countColor: "text-slate-900",
    },
    {
      id: "0",
      label: "Chờ chụp",
      count: statusCounts.pending,
      icon: Clock,
      iconBg: "bg-slate-100 text-slate-600",
      activeBg: "border-slate-500 bg-slate-100 ring-2 ring-slate-400/20 text-slate-900",
      inactiveBg: "border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700",
      countColor: "text-slate-800",
    },
    {
      id: "1",
      label: "Đang chụp",
      count: statusCounts.inProgress,
      icon: Camera,
      iconBg: "bg-blue-50 text-blue-600",
      activeBg: "border-blue-400 bg-blue-50 ring-2 ring-blue-500/20 text-blue-900",
      inactiveBg: "border-slate-200/90 bg-white hover:bg-blue-50/40 text-slate-700",
      countColor: "text-blue-700",
    },
    {
      id: "2",
      label: "Chụp lại",
      count: statusCounts.recapture,
      icon: AlertTriangle,
      iconBg: "bg-amber-100/80 text-amber-700",
      activeBg: "border-amber-400 bg-amber-50 ring-2 ring-amber-500/20 text-amber-900",
      inactiveBg: "border-slate-200/90 bg-white hover:bg-amber-50/40 text-slate-700",
      countColor: "text-amber-800",
    },
    {
      id: "3",
      label: "Hoàn thành",
      count: statusCounts.completed,
      icon: CheckCircle2,
      iconBg: "bg-emerald-100/80 text-emerald-700",
      activeBg: "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/20 text-emerald-900",
      inactiveBg: "border-slate-200/90 bg-white hover:bg-emerald-50/40 text-slate-700",
      countColor: "text-emerald-700",
    },
    {
      id: "expiring",
      label: "Gần hết hạn",
      count: statusCounts.expiring,
      icon: Flame,
      iconBg: "bg-rose-100 text-rose-600",
      activeBg: "border-rose-400 bg-rose-50 ring-2 ring-rose-500/20 text-rose-900",
      inactiveBg: "border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/70 text-rose-800",
      countColor: "text-rose-700",
      isPulse: statusCounts.expiring > 0,
    },
  ]

  return (
    <div className="space-y-6 pb-16">
      {/* ================= Header Bar: Tabs Summary/Detail & Các Thẻ Tổng Hợp PO Đặt Ngang Hàng ================= */}
      <div className="sticky top-16 z-30 bg-slate-50/95 py-2.5 backdrop-blur-md -mt-2">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          {/* Nhóm Tabs Summary / Detail */}
          <div className="inline-flex items-center rounded-2xl bg-slate-200/80 p-1.5 shadow-inner border border-slate-300/70 shrink-0 self-start xl:self-center">
            <button
              id="tab-summary-btn"
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer select-none ${
                activeTab === "summary"
                  ? "bg-white text-blue-700 shadow-md shadow-slate-900/10 scale-[1.02] ring-1 ring-black/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
              }`}
            >
              <TableProperties
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeTab === "summary" ? "text-blue-600 scale-110" : "text-slate-500"
                }`}
              />
              <span>Summary</span>
            </button>

            <button
              id="tab-detail-btn"
              type="button"
              onClick={() => setActiveTab("detail")}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer select-none ${
                activeTab === "detail"
                  ? "bg-white text-blue-700 shadow-md shadow-slate-900/10 scale-[1.02] ring-1 ring-black/5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
              }`}
            >
              <Images
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeTab === "detail" ? "text-blue-600 scale-110" : "text-slate-500"
                }`}
              />
              <span>Detail</span>
            </button>
          </div>

          {/* Các thẻ tổng hợp số lượng PO của từng trạng thái (Đặt ngang hàng với tab Summary/Detail) */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            {statusCardConfig.map((card) => {
              const isSelected = selectedStatus === card.id
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setSelectedStatus((prev) => (prev === card.id ? "all" : card.id))
                  }}
                  className={`h-10 px-3 rounded-xl border transition-all flex items-center gap-2 shadow-2xs cursor-pointer select-none text-left active:scale-95 ${
                    isSelected ? card.activeBg : card.inactiveBg
                  }`}
                  title={`Lọc đơn theo: ${card.label}`}
                >
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded-lg ${card.iconBg} shrink-0`}
                  >
                    <card.icon className={`h-3.5 w-3.5 ${card.isPulse ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                      {card.label}
                    </span>
                    <span className={`text-xs font-extrabold ${card.countColor}`}>
                      {card.count}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ================= Filter & Search Bar ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* 1. Ô tìm kiếm PO (Nằm riêng bên trái, dài ra thêm 10-15px: w-52 sm:w-[225px]) */}
        <div className="relative w-52 sm:w-[225px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Nhập số PO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 focus:bg-white pl-8.5 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/15 shadow-2xs transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-md transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 2. TỔ HỢP CÒN LẠI DỒN VỀ PHÍA BÊN PHẢI (ml-auto) */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Nút xem tất cả ảnh (Nổi bật hơn nhưng phong cách vẫn nhẹ nhàng, nằm bên trái của tổ hợp này) */}
          <button
            type="button"
            onClick={handleViewAllPhotos}
            className="group h-9 px-3.5 rounded-xl border border-blue-200/90 bg-blue-50/80 hover:bg-blue-100/80 active:bg-blue-200/60 text-blue-700 text-xs font-semibold flex items-center gap-2 shadow-xs shadow-blue-500/5 hover:shadow-blue-500/15 transition-all active:scale-95 cursor-pointer"
            title="Xem tất cả ảnh (Thư viện toàn bộ ảnh)"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-blue-100 text-blue-600 transition-transform group-hover:scale-105">
              <Images className="h-3.5 w-3.5" />
            </span>
            <span>Xem tất cả ảnh</span>
          </button>

          {/* Dropdown Trạng thái (Hiện đại, bo góc mềm mại, hiển thị dot indicator trực quan) */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen((prev) => !prev)
                setIsDatePickerOpen(false)
              }}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer ${
                selectedStatus !== "all"
                  ? "border-blue-300 bg-blue-50/50 text-blue-900"
                  : "border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span className="text-slate-400 font-normal">Trạng thái:</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className={`h-2 w-2 rounded-full ${currentStatusObj.dotColor}`} />
                <span>{currentStatusObj.label}</span>
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  isStatusOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isStatusOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Lọc theo trạng thái
                </div>
                {statusOptions.map((opt) => {
                  const isSelected = selectedStatus === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(opt.value)
                        setIsStatusOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${opt.dotColor}`} />
                        <span>{opt.label}</span>
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* DatePicker (Calendar bo góc, hiện đại, hỗ trợ mini month calendar & chọn nhanh) */}
          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => {
                setIsDatePickerOpen((prev) => !prev)
                setIsStatusOpen(false)
              }}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer ${
                startDate || endDate
                  ? "border-blue-300 bg-blue-50/50 text-blue-900"
                  : "border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Calendar
                className={`h-3.5 w-3.5 ${
                  startDate || endDate ? "text-blue-600" : "text-slate-400"
                }`}
              />
              {startDate || endDate ? (
                <span className="font-semibold text-blue-700">
                  {startDate ? formatDateDisplay(startDate) : "Từ đầu"}
                  {" - "}
                  {endDate ? formatDateDisplay(endDate) : "Hiện tại"}
                </span>
              ) : (
                <span className="text-slate-700 font-medium">Lọc theo ngày</span>
              )}
              {startDate || endDate ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setStartDate("")
                    setEndDate("")
                  }}
                  className="p-0.5 rounded-md hover:bg-blue-200/60 text-blue-600 cursor-pointer transition-colors"
                  title="Xóa lọc ngày"
                >
                  <X className="h-3 w-3" />
                </span>
              ) : (
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    isDatePickerOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-80 rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-md p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 space-y-3">
                {/* Header Popover */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-blue-50 text-blue-600">
                      <Calendar className="h-3.5 w-3.5" />
                    </span>
                    Khoảng thời gian
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Chọn nhanh presets với bo góc mềm mại */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Chọn nhanh
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "today", label: "Hôm nay" },
                      { id: "yesterday", label: "Hôm qua" },
                      { id: "7days", label: "7 ngày qua" },
                      { id: "month", label: "Tháng này" },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setDatePreset(preset.id as any)
                          setIsDatePickerOpen(false)
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200/70 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-xs font-semibold text-slate-600 transition-all text-center cursor-pointer shadow-2xs active:scale-95"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini Calendar tháng bo góc hiện đại */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-slate-800">
                      Tháng {calendarMonthIdx + 1}, {calendarYear}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(new Date(calendarYear, calendarMonthIdx - 1, 1))
                        }
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Tháng trước"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(new Date(calendarYear, calendarMonthIdx + 1, 1))
                        }
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Tháng sau"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tiêu đề thứ trong tuần */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                    <span>T2</span>
                    <span>T3</span>
                    <span>T4</span>
                    <span>T5</span>
                    <span>T6</span>
                    <span>T7</span>
                    <span>CN</span>
                  </div>

                  {/* Các ô ngày trong tháng */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <span key={`blank-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const { isStart, isEnd, isInRange, isToday } = getCalendarDayMeta(day)
                      const isSelected = isStart || isEnd

                      let cellClass = "text-slate-700 hover:bg-slate-100"
                      if (isSelected) {
                        cellClass = "bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/30"
                      } else if (isInRange) {
                        cellClass = "bg-blue-50 text-blue-700 font-semibold"
                      } else if (isToday) {
                        cellClass = "text-blue-600 font-bold border border-blue-300"
                      }

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleSelectCalendarDay(day)}
                          className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center text-[11px] transition-all cursor-pointer ${cellClass}`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tùy chỉnh ngày với khung bo góc mềm mại */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 p-2 transition-all shadow-2xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent border-0 outline-none p-0 cursor-pointer"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 p-2 transition-all shadow-2xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent border-0 outline-none p-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDatePreset("clear")
                    }}
                    className="font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
                  >
                    Xóa chọn
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer shadow-xs shadow-blue-500/20 active:scale-95"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Nút reset lọc (khi có bộ lọc active) */}
          {(searchQuery || selectedStatus !== "all" || startDate || endDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}

          {/* Nút reload ở ngoài cùng bên phải (icon-only gọn gàng) */}
          <button
            type="button"
            onClick={handleReloadData}
            disabled={isReloading || isLoadingDetails || isLoadingOrders}
            className="group h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-blue-700 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            title="Tải lại dữ liệu của trang Photo"
          >
            <RotateCw
              className={`h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-transform ${
                isReloading || isLoadingDetails || isLoadingOrders ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>
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
                  paginatedSummaryOrders.map((order) => {
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
                          {renderStatusBadge(order.statusId, order.isExpiringSoon)}
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

          {/* Footer phân trang của bảng Summary (10 record/trang) */}
          <TablePagination
            currentPage={summaryCurrentPage}
            totalItems={filteredSummaryOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setSummaryCurrentPage}
            itemLabel="đơn hàng PO"
          />
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
                    paginatedStepDetails.map((detail) => {
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
                            <div className="flex flex-wrap items-center gap-1.5">
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

                              {ordersByPO.get(detail.poNumber)?.isExpiringSoon && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200 shadow-2xs"
                                  title="Đơn hàng gần đến hạn xuất xưởng nhưng chưa hoàn tất đủ ảnh!"
                                >
                                  <Flame className="h-3 w-3 text-rose-600 animate-pulse" />
                                  Gần hết hạn
                                </span>
                              )}
                            </div>
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

            {/* Footer phân trang của bảng Detail (10 record/trang) */}
            <TablePagination
              currentPage={detailCurrentPage}
              totalItems={filteredStepDetails.length}
              pageSize={PAGE_SIZE}
              onPageChange={setDetailCurrentPage}
              itemLabel="dòng bước chụp"
            />
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
