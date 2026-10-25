import { useState, useEffect, useMemo, useRef } from "react"
import {
  Layers,
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  X,
  RotateCcw,
  CheckCircle2,
  Eye,
  User,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
} from "lucide-react"
import type { PhotoPackingMasterNavigation, User as UserType } from "@/types"
import {
  fetchMasterNavigations,
  upsertMasterNavigation,
  deleteAndRefreshMasterNavigations,
} from "@/services/photoPackingMasterNavigationService"

// Danh sách các ảnh mẫu template có sẵn trong hệ thống để chọn nhanh
const AVAILABLE_TEMPLATES = [
  { name: "Khay định hình (Tray)", url: "/Image/Template/Tray.jpg" },
  { name: "Thùng carton chuẩn (Box)", url: "/Image/Template/Box.jpg" },
  { name: "Hộp quà cao cấp (Gift)", url: "/Image/Template/Gift.jpg" },
  { name: "Dây điện cuộn (DAY DIEN)", url: "/Image/Template/DAY_DIEN.jpg" },
  { name: "Linh kiện cơ khí (KGW)", url: "/Image/Template/KGW.jpg" },
  { name: "Cụm chuẩn (SI)", url: "/Image/Template/SI.jpg" },
]

interface MasterNavigationPageProps {
  group?: "OSA" | "LXA" | string
  currentUser?: UserType | null
}

export default function MasterNavigationPage({
  group = "OSA",
  currentUser,
}: MasterNavigationPageProps) {
  const activeGroup = group || currentUser?.group || "OSA"

  // Dữ liệu danh sách Master Navigation
  const [items, setItems] = useState<PhotoPackingMasterNavigation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modal Thêm / Chỉnh sửa
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PhotoPackingMasterNavigation | null>(null)

  // Form Fields
  const [formProductKey, setFormProductKey] = useState("")
  const [formStepNo, setFormStepNo] = useState<number>(1)
  const [formGroup, setFormGroup] = useState(activeGroup)
  const [formImagePath, setFormImagePath] = useState("/Image/Template/Tray.jpg")
  const [formNotes, setFormNotes] = useState("")
  const [formCreator, setFormCreator] = useState(currentUser ? String(currentUser.id) : "NV-10321")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal Xóa
  const [deletingItem, setDeletingItem] = useState<PhotoPackingMasterNavigation | null>(null)

  // Modal Xem chi tiết ảnh mẫu & thông tin record Master Navigation (80% màn hình)
  const [viewingItem, setViewingItem] = useState<PhotoPackingMasterNavigation | null>(null)
  const [imageZoom, setImageZoom] = useState<number>(1)
  const [imageRotation, setImageRotation] = useState<number>(0)
  const [isViewingImageLoading, setIsViewingImageLoading] = useState<boolean>(true)

  // Đặt lại zoom và góc xoay về mặc định khi mở modal hoặc đổi ảnh xem
  useEffect(() => {
    if (viewingItem) {
      setImageZoom(1)
      setImageRotation(0)
      setIsViewingImageLoading(true)
    }
  }, [viewingItem])

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Load danh sách dữ liệu từ Backend API khi mount hoặc khi activeGroup thay đổi
  const loadData = async (targetGroup: string = activeGroup) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const data = await fetchMasterNavigations(targetGroup)
      setItems(data)
    } catch (err: any) {
      setErrorMessage(err.message || `Không thể kết nối đến Backend API để lấy danh sách Master Navigation cho xưởng ${targetGroup}.`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(activeGroup)
    setFormGroup(activeGroup)
  }, [activeGroup])

  // Danh sách các mã sản phẩm duy nhất để lọc
  const uniqueProducts = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.productKey) set.add(item.productKey)
    })
    return Array.from(set).sort()
  }, [items])

  // Lọc dữ liệu chỉ theo ProductKey
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.productKey.toLowerCase().includes(q))
  }, [items, searchQuery])

  // Mở modal thêm mới
  const handleOpenAdd = (suggestedProductKey?: string, nextStep?: number) => {
    setEditingItem(null)
    setFormProductKey(suggestedProductKey || (activeGroup === "LXA" ? "LXA-MOD-204" : "H0090924"))
    setFormStepNo(nextStep || 1)
    setFormGroup(activeGroup)
    setFormImagePath("/Image/Template/Tray.jpg")
    setFormNotes(`Kiểm tra quy chuẩn đóng gói sản phẩm phân xưởng ${activeGroup}.`)
    setFormCreator(currentUser ? String(currentUser.id) : "NV-10321")
    setIsFormOpen(true)
  }

  // Mở modal chỉnh sửa
  const handleOpenEdit = (item: PhotoPackingMasterNavigation) => {
    setEditingItem(item)
    setFormProductKey(item.productKey)
    setFormStepNo(item.stepNo)
    setFormGroup(item.group || activeGroup)
    setFormImagePath(item.templatePath || "/Image/Template/Tray.jpg")
    setFormNotes(item.notes)
    setFormCreator(String(item.creator ?? (currentUser ? currentUser.id : "NV-10321")))
    setIsFormOpen(true)
  }

  // Tải file ảnh từ máy tính (Local upload base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormImagePath(reader.result)
          showToast("Đã tải ảnh mẫu lên thành công!")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Lưu Form Thêm mới / Cập nhật qua Backend API
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formProductKey.trim()) {
      alert("Vui lòng nhập Mã sản phẩm (productKey)")
      return
    }

    try {
      setIsLoading(true)
      const saved = await upsertMasterNavigation(
        {
          id: editingItem ? editingItem.id : undefined,
          productKey: formProductKey.trim(),
          stepNo: Number(formStepNo) || 1,
          group: formGroup.trim() || activeGroup,
          templatePath: formImagePath,
          notes: formNotes.trim(),
          creator: formCreator.trim() ? (Number(formCreator.trim()) || undefined) : undefined,
          updater: currentUser ? currentUser.id : undefined,
        },
        activeGroup
      )

      setItems(saved)
      setIsFormOpen(false)
      showToast(
        editingItem
          ? `Đã cập nhật bước ${formStepNo} của sản phẩm ${formProductKey} thành công!`
          : `Đã thêm mới bước ${formStepNo} cho sản phẩm ${formProductKey} thành công!`
      )
    } catch (err: any) {
      alert("Lỗi khi lưu lên server: " + (err.message || "Không thể lưu dữ liệu"))
    } finally {
      setIsLoading(false)
    }
  }

  // Xác nhận xóa qua Backend API
  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    try {
      setIsLoading(true)
      const saved = await deleteAndRefreshMasterNavigations(deletingItem.id, activeGroup)
      setItems(saved)
      showToast(`Đã xóa bước ${deletingItem.stepNo} của sản phẩm ${deletingItem.productKey}.`)
      setDeletingItem(null)
    } catch (err: any) {
      alert("Lỗi khi xóa trên server: " + (err.message || "Không thể xóa"))
    } finally {
      setIsLoading(false)
    }
  }

  // Làm mới dữ liệu từ Backend API
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchMasterNavigations(activeGroup)
      setItems(data)
      setErrorMessage(null)
      showToast(`Đã làm mới dữ liệu Master Navigation xưởng ${activeGroup} từ server!`)
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi khi kết nối đến API server.")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= Tiêu đề Master Navigation theo Group người dùng ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-md ${
              activeGroup === "LXA"
                ? "bg-linear-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20"
                : "bg-linear-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/20"
            }`}
          >
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Master Navigation
              </h1>
              <span
                className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                  activeGroup === "LXA"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                Phân xưởng {activeGroup}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý danh sách cấu hình và ảnh mẫu quy chuẩn các bước chụp của xưởng {activeGroup}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Tổng số bước: <span className="font-bold text-slate-700">{items.length}</span>
        </div>
      </div>

      {/* ================= Toolbar: Tìm kiếm ProductKey (thu nhỏ) & Nút Thêm mới + Refresh ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Ô tìm kiếm thu nhỏ chỉ tìm ProductKey */}
        <div className="relative w-64 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo ProductKey..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-9 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-md"
              title="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Hai nút: Thêm mới (trái) và Refresh (bên phải nút thêm mới, chỉ cần icon) */}
        <div className="flex items-center gap-2">
          <button
            id="add-naviosa-btn"
            type="button"
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm mới</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            title="Làm mới dữ liệu"
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Thông báo lỗi khi gọi API thất bại */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadData()
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ================= DATA TABLE (BẢNG CRUD DỮ LIỆU NAVIOSA - ĐÃ BỎ CỘT ẢNH MẪU) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-4 pr-2 text-center w-12">#</th>
                <th className="py-3.5 px-3">Mã sản phẩm (productKey)</th>
                <th className="py-3.5 px-3 text-center">Bước (stepNo)</th>
                <th className="py-3.5 px-3 text-center">Nhóm (group)</th>
                <th className="py-3.5 px-3 min-w-72">Ghi chú kiểm tra (notes)</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Người tạo & Ngày tạo</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Cập nhật lần cuối</th>
                <th className="py-3.5 pr-4 pl-3 text-center whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RotateCcw className="h-8 w-8 mx-auto text-blue-500 animate-spin mb-3" />
                    <p className="font-semibold text-slate-700">Đang tải dữ liệu từ Backend API...</p>
                    <p className="text-xs text-slate-400 mt-1">Vui lòng chờ trong giây lát</p>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <Layers className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Không tìm thấy ảnh mẫu NaviOSA nào</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Hãy điều chỉnh bộ lọc hoặc bấm nút "Thêm ảnh mẫu bước mới" bên dưới.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAdd()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-xs"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm bước mẫu ngay</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Cột 1: STT / ID */}
                    <td className="py-3.5 pl-4 pr-2 text-center font-mono text-slate-400 text-[11px]">
                      {index + 1}
                    </td>

                    {/* Cột 2: productKey */}
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="bg-slate-100 group-hover:bg-blue-100/70 text-slate-900 group-hover:text-blue-900 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-slate-200/60 group-hover:border-blue-200 transition-colors">
                          {item.productKey}
                        </span>
                      </div>
                    </td>

                    {/* Cột 3: stepNo */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-200/60 text-indigo-700 px-2.5 py-0.5 text-xs font-extrabold">
                        Bước {item.stepNo}
                      </span>
                    </td>

                    {/* Cột 4: group */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {item.group || "OSA"}
                      </span>
                    </td>

                    {/* Cột 5: notes (Ghi chú tiêu chuẩn) */}
                    <td className="py-3.5 px-3 min-w-72 max-w-lg">
                      <p className="text-slate-700 text-xs leading-relaxed line-clamp-2" title={item.notes}>
                        {item.notes || <span className="text-slate-400 italic">Chưa có ghi chú</span>}
                      </p>
                    </td>

                    {/* Cột 6: creator & createdTime */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{item.creator || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <Calendar className="h-3 w-3" />
                          <span>{item.createdTime || item.createTime || "—"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 7: updater & updatedTime */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-700">{item.updater || "—"}</span>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <Clock className="h-3 w-3" />
                          <span>{item.updatedTime || "—"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 8: Thao tác (Xem ảnh mẫu, Sửa, Xóa) */}
                    <td className="py-3.5 pr-4 pl-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Nút Xem ảnh mẫu: Mở modal view 80% màn hình với 2 phần */}
                        <button
                          type="button"
                          onClick={() => setViewingItem(item)}
                          title="Xem ảnh mẫu & thông tin record"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Nút Sửa */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Chỉnh sửa bước này"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-amber-200 bg-white text-amber-600 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Nút Xóa */}
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          title="Xóa bước này"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 hover:border-rose-400 hover:text-rose-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tổng kết bảng */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5 text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredItems.length}</strong> / <strong>{items.length}</strong> dòng bước ảnh mẫu NaviOSA
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span>
              Tổng sản phẩm: <strong className="text-blue-700 font-bold">{uniqueProducts.length}</strong> mã SP
            </span>
            <span className="h-3 w-px bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Phân xưởng: <strong className="text-indigo-700">Navi OSA</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= MODAL XEM CHI TIẾT NAVIOSA (VIEW MODAL - 80% MÀN HÌNH, 2 PHẦN) ================= */}
      {viewingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setViewingItem(null)}
        >
          <div
            className="relative flex flex-col md:flex-row w-[82vw] h-[82vh] max-w-7xl max-h-[92vh] bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/10 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng Modal ở góc trên bên phải */}
            <button
              type="button"
              onClick={() => setViewingItem(null)}
              className="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="h-5 w-5" />
            </button>

            {/* ================= PHẦN BÊN TRÁI: HIỂN THỊ ẢNH MẪU ================= */}
            <div className="relative w-full md:w-[58%] lg:w-[60%] h-1/2 md:h-full bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-8 select-none overflow-hidden">
              {/* Badge góc trên của ảnh */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1 text-xs font-bold text-blue-700 shadow-md backdrop-blur-md">
                  <Layers className="h-3.5 w-3.5 text-blue-600" />
                  Ảnh mẫu Bước {viewingItem.stepNo}
                </span>
                <span className="inline-flex items-center rounded-lg bg-slate-800/80 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-200 backdrop-blur-md border border-white/10">
                  {viewingItem.productKey}
                </span>
              </div>

              {/* Khung chứa ảnh mẫu lớn với zoom và xoay */}
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {isViewingImageLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200">
                    <div className="relative flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                      <Loader2 className="absolute h-5 w-5 text-blue-400 animate-spin" />
                    </div>
                    <span className="mt-3 text-xs font-semibold text-slate-300 tracking-wide animate-pulse">
                      Đang tải ảnh mẫu...
                    </span>
                  </div>
                )}
                <img
                  src={viewingItem.templatePath}
                  alt={`Mẫu ${viewingItem.productKey} - Bước ${viewingItem.stepNo}`}
                  onLoad={() => setIsViewingImageLoading(false)}
                  onError={(e) => {
                    setIsViewingImageLoading(false)
                    ;(e.target as HTMLImageElement).src = "/Image/Template/Tray.jpg"
                  }}
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  className={`max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none transition-opacity duration-300 ${
                    isViewingImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                />
              </div>

              {/* Thanh điều khiển Zoom / Rotate nổi phía dưới (bỏ hoàn toàn đường dẫn & nút mở ảnh gốc) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl text-white">
                {/* Zoom Out */}
                <button
                  type="button"
                  onClick={() => setImageZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                  disabled={imageZoom <= 0.5}
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
                  className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                  title="Đặt lại 100%"
                >
                  {Math.round(imageZoom * 100)}%
                </button>

                {/* Zoom In */}
                <button
                  type="button"
                  onClick={() => setImageZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  disabled={imageZoom >= 3}
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
                  className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all cursor-pointer text-slate-200 hover:text-white"
                  title="Xoay ngược chiều kim đồng hồ (90°)"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Xoay phải */}
                <button
                  type="button"
                  onClick={() => setImageRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all cursor-pointer text-slate-200 hover:text-white"
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
                      className="px-2 py-0.5 rounded-full bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Khôi phục kích thước và góc quay ban đầu"
                    >
                      Đặt lại
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ================= PHẦN BÊN PHẢI: THÔNG TIN RECORD NAVIOSA ================= */}
            <div className="w-full md:w-[42%] lg:w-[40%] h-1/2 md:h-full bg-white flex flex-col justify-between overflow-y-auto p-6 sm:p-8 border-t md:border-t-0 md:border-l border-slate-200">
              <div className="space-y-5">
                {/* Header thông tin Record */}
                <div className="border-b border-slate-100 pb-4 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      <Layers className="h-3.5 w-3.5" />
                      Phân xưởng {viewingItem.group || "Navi OSA"}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Record ID: #{viewingItem.id}</span>
                  </div>

                  <div className="mt-2.5 flex items-baseline gap-3">
                    <h2 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {viewingItem.productKey}
                    </h2>
                    <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-extrabold text-blue-700">
                      Bước {viewingItem.stepNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Cấu hình quy chuẩn ảnh mẫu đóng gói kiểm tra sản phẩm.
                  </p>
                </div>

                {/* Tiêu chuẩn kiểm tra (notes) */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Tiêu chuẩn kiểm tra (notes)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                    {viewingItem.notes || (
                      <span className="text-slate-400 italic">Chưa có ghi chú kiểm tra cho bước này.</span>
                    )}
                  </p>
                </div>

                {/* Đường dẫn ảnh mẫu (templatePath) */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Đường dẫn tệp ảnh mẫu (templatePath)
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-700">
                    <span className="truncate">{viewingItem.templatePath}</span>
                  </div>
                </div>

                {/* Nhóm & Bước số */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Nhóm / Xưởng (group)</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{viewingItem.group || "OSA"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Bước số (stepNo)</span>
                    <span className="text-xs font-bold text-indigo-700">Bước {viewingItem.stepNo}</span>
                  </div>
                </div>

                {/* Lịch sử Tạo & Cập nhật */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Người tạo */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Người tạo (creator):</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                      <span>{viewingItem.creator}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>{viewingItem.createdTime || viewingItem.createTime || "—"}</span>
                    </div>
                  </div>

                  {/* Cập nhật lần cuối */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Cập nhật lần cuối:</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <User className="h-3.5 w-3.5 text-amber-600" />
                      <span>{viewingItem.updater || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{viewingItem.updatedTime || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer của panel bên phải: Nút thao tác */}
              <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = viewingItem
                    setViewingItem(null)
                    handleOpenEdit(itemToEdit)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Chỉnh sửa bước này</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM MỚI / CHỈNH SỬA NAVIOSA ================= */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingItem
                      ? `Chỉnh sửa Ảnh Mẫu Bước ${editingItem.stepNo} - ${editingItem.productKey}`
                      : "Thêm Mới Ảnh Mẫu Bước NaviOSA"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cấu hình ảnh mẫu quy chuẩn đóng gói theo interface NaviOSA
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Row 1: productKey & stepNo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã sản phẩm (productKey) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: H0090924, H0168277..."
                    value={formProductKey}
                    onChange={(e) => setFormProductKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-hidden"
                  />
                  {uniqueProducts.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span>Gợi ý:</span>
                      {uniqueProducts.slice(0, 4).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormProductKey(p)}
                          className="hover:text-blue-700 font-mono underline cursor-pointer"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bước số (stepNo) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStepNo}
                    onChange={(e) => setFormStepNo(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 font-bold focus:border-blue-500 focus:outline-hidden cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        Bước {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: group & creator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phân xưởng / Nhóm (group)
                  </label>
                  <input
                    type="text"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 font-semibold focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Người tạo (creator)
                  </label>
                  <input
                    type="text"
                    value={formCreator}
                    onChange={(e) => setFormCreator(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: imagePath Selection & Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ảnh mẫu quy chuẩn (imagePath) <span className="text-rose-500">*</span>
                </label>

                {/* Preview và Upload button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="relative h-24 w-36 overflow-hidden rounded-lg border border-slate-300 bg-slate-200 flex-shrink-0">
                    <img
                      src={formImagePath}
                      alt="Ảnh mẫu preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/Image/Template/Tray.jpg"
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                      >
                        <Upload className="h-3.5 w-3.5 text-blue-600" />
                        <span>Tải ảnh từ máy tính</span>
                      </button>
                      <span className="text-[11px] text-slate-400">hoặc chọn mẫu bên dưới</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Nhập đường dẫn URL ảnh hoặc chọn mẫu..."
                      value={formImagePath}
                      onChange={(e) => setFormImagePath(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Template mẫu có sẵn */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Chọn nhanh ảnh mẫu template có sẵn:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {AVAILABLE_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.url}
                        type="button"
                        onClick={() => setFormImagePath(tmpl.url)}
                        className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          formImagePath === tmpl.url
                            ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <img
                          src={tmpl.url}
                          alt={tmpl.name}
                          className="h-10 w-full object-cover rounded-md mb-1"
                        />
                        <span className="text-[10px] font-semibold text-slate-700 line-clamp-1">
                          {tmpl.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: notes (Ghi chú / Quy chuẩn kiểm tra) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú tiêu chuẩn kiểm tra (notes)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú chi tiết yêu cầu góc chụp, tem nhãn, lớp xốp bảo vệ, dấu niêm phong..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                >
                  {editingItem ? "Lưu thay đổi" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA ================= */}
      {deletingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setDeletingItem(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa ảnh mẫu</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa ảnh mẫu <strong>Bước {deletingItem.stepNo}</strong> của sản phẩm{" "}
              <strong className="font-mono text-slate-900">{deletingItem.productKey}</strong> không?
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Hành động này sẽ loại bỏ quy chuẩn ảnh mẫu này khỏi hệ thống.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
