import { useState, useMemo } from "react"
import {
  Package,
  Clock,
  Camera,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Layers,
  Cpu,
  Eye,
  Sparkles,
  BarChart3,
  ShieldAlert,
} from "lucide-react"
import type { PhotoPackingSummary } from "@/types/photoPackingSummary"
import { calculateDashboardMetrics } from "@/services/managerService"
import OrderPhotoGalleryModal from "@/components/manager/OrderPhotoGalleryModal"

interface ManagerDashboardProps {
  orders: PhotoPackingSummary[]
  onNavigateToPhoto: (tab?: "summary" | "detail") => void
  onNavigateToMaster: (group: "OSA" | "LXA") => void
}

export default function ManagerDashboard({
  orders,
  onNavigateToPhoto,
  onNavigateToMaster,
}: ManagerDashboardProps) {
  // Bộ lọc xưởng trên Dashboard: "all" | "OSA" | "LXA"
  const [selectedGroup, setSelectedGroup] = useState<"all" | "OSA" | "LXA">("all")
  const [viewingOrder, setViewingOrder] = useState<PhotoPackingSummary | null>(null)

  // Lọc danh sách theo xưởng được chọn
  const filteredOrders = useMemo(() => {
    if (selectedGroup === "all") return orders
    return orders.filter((o) => (o.group || "OSA") === selectedGroup)
  }, [orders, selectedGroup])

  // Tính toán số liệu thống kê
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(filteredOrders)
  }, [filteredOrders])

  // Danh sách các đơn hàng cần chú ý đặc biệt (Đơn cần chụp lại & đơn đang dở dang)
  const urgentOrders = useMemo(() => {
    return filteredOrders
      .filter((o) => o.statusId === 2 || o.statusId === 1)
      .slice(0, 5)
  }, [filteredOrders])

  // Phân bổ đơn hàng theo loại đóng gói
  const packageTypeStats = useMemo(() => {
    const typeCount: Record<string, number> = {}
    filteredOrders.forEach((o) => {
      const type = o.type || "Khác"
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / (filteredOrders.length || 1)) * 100),
    }))
  }, [filteredOrders])

  return (
    <div className="space-y-6 pb-12">
      {/* ================= Top Banner & Filter ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Bảng điều khiển Quản lý
            </span>
            <span className="text-xs text-slate-400">• Cập nhật thời gian thực</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Tổng quan Hoạt động Chụp ảnh Đóng gói
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi tiến độ kiểm tra ảnh chụp PO, tỷ lệ hoàn tất và xử lý các đơn yêu cầu chụp lại.
          </p>
        </div>

        {/* Bộ chọn phân xưởng */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setSelectedGroup("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedGroup === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả xưởng ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGroup("OSA")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedGroup === "OSA"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Navi OSA ({orders.filter((o) => o.group === "OSA").length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedGroup("LXA")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedGroup === "LXA"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            Navi LXA ({orders.filter((o) => o.group === "LXA").length})
          </button>
        </div>
      </div>

      {/* ================= 6 Metric Cards ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Tổng đơn hàng */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng đơn PO</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{metrics.totalOrders}</span>
            <span className="text-xs text-slate-400 font-medium">đơn</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Toàn bộ đơn theo dõi</p>
        </div>

        {/* 2. Đơn chưa chụp (Chờ chụp) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Chưa chụp</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-700">{metrics.pendingOrders}</span>
            <span className="text-xs text-slate-400 font-medium">đơn</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Chờ nhân viên quét & chụp</p>
        </div>

        {/* 3. Đang chụp dở dang */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-blue-600 text-xs font-medium">
            <span>Đang chụp</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Camera className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-600">{metrics.inProgressOrders}</span>
            <span className="text-xs text-slate-400 font-medium">đơn</span>
          </div>
          <p className="text-[11px] text-blue-600/80 mt-1">Đã chụp 1 phần các bước</p>
        </div>

        {/* 4. Cần chụp lại */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 bg-amber-50/20 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Cần chụp lại</span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{metrics.recaptureOrders}</span>
            <span className="text-xs text-amber-600 font-medium">cần xử lý</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Ảnh mờ hoặc sai quy chuẩn</p>
        </div>

        {/* 5. Đã hoàn thành */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Đã hoàn thành</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">{metrics.completedOrders}</span>
            <span className="text-xs text-emerald-600 font-medium">đơn</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Đủ 100% ảnh đạt chuẩn</p>
        </div>

        {/* 6. Tỷ lệ hoàn thành */}
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md shadow-blue-500/10">
          <div className="flex items-center justify-between text-blue-100 text-xs font-medium">
            <span>Tỷ lệ hoàn thành</span>
            <TrendingUp className="h-4 w-4 text-blue-200" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">{metrics.completionRate}%</span>
          </div>
          {/* Progress bar nhỏ */}
          <div className="mt-2 w-full bg-blue-900/40 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= Middle Section: Urgent Orders & Breakdown ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái (2 phần): Bảng đơn hàng cần lưu ý (Urgent Orders) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Đơn hàng Cần chú ý & Chụp lại
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các đơn hàng bị yêu cầu chụp lại hoặc đang dở dang các bước đóng gói
                </p>
              </div>

              <button
                onClick={() => onNavigateToPhoto("summary")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>Xem tất cả tại Photo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bảng danh sách đơn hàng cần chú ý */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3 pl-2">Số PO</th>
                    <th className="pb-3">Sản phẩm</th>
                    <th className="pb-3">Xưởng</th>
                    <th className="pb-3">Tiến độ</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3 text-right pr-2">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {urgentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Tuyệt vời! Không có đơn hàng nào cần chụp lại trong xưởng này.
                      </td>
                    </tr>
                  ) : (
                    urgentOrders.map((order) => (
                      <tr key={order.pO} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pl-2 font-mono font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            title="Xem chi tiết ảnh PO này"
                            className="bg-slate-100 hover:bg-blue-100 text-slate-900 hover:text-blue-900 px-2 py-0.5 rounded-md font-mono text-xs cursor-pointer border border-transparent hover:border-blue-300 transition-colors"
                          >
                            {order.pO}
                          </button>
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-slate-800 line-clamp-1">
                            {order.productName || order.productCode}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {order.productCode}
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              order.group === "LXA"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-indigo-50 text-indigo-700"
                            }`}
                          >
                            {order.group || "OSA"}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-slate-700">
                            {order.currentStep}/{order.totalStep} bước
                          </span>
                        </td>
                        <td className="py-3">
                          {order.statusId === 2 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                              <AlertTriangle className="h-3 w-3" />
                              Chụp lại
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                              <Camera className="h-3 w-3" />
                              Đang chụp
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Xem ảnh</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị {urgentOrders.length} đơn hàng ưu tiên xử lý
            </span>
            <button
              type="button"
              onClick={() => onNavigateToPhoto("detail")}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Chuyển sang xem Bảng Chi tiết từng bước →
            </button>
          </div>
        </div>

        {/* Cột phải (1 phần): Phân bổ loại đóng gói & Lối tắt Master */}
        <div className="space-y-6">
          {/* Phân bổ theo loại bao bì đóng gói */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Phân loại Quy chuẩn Đóng gói
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Tỷ trọng đơn hàng theo mẫu template kiểm tra
            </p>

            <div className="space-y-3">
              {packageTypeStats.map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{item.type}</span>
                    <span className="text-slate-500">
                      {item.count} đơn ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lối tắt quản lý Master */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              Cấu hình Ảnh Mẫu Master
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Thiết lập ảnh mẫu chuẩn từng bước cho các sản phẩm tại phân xưởng Navi OSA và Navi LXA.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigateToMaster("OSA")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold text-white transition-colors border border-white/10 cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5 text-indigo-300" />
                <span>Navi OSA</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToMaster("LXA")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-semibold text-white transition-colors border border-white/10 cursor-pointer"
              >
                <Cpu className="h-3.5 w-3.5 text-emerald-300" />
                <span>Navi LXA</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal xem tất cả ảnh nếu nhấn "Xem ảnh" từ bảng Dashboard */}
      {viewingOrder && (
        <OrderPhotoGalleryModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  )
}
