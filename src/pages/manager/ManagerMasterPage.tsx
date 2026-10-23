import { useState, useEffect, useMemo, useRef } from "react"
import {
  Layers,
  Cpu,
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  X,
  Maximize2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react"
import type { MasterStepTemplate } from "@/types/manager"
import {
  getMasterTemplates,
  upsertMasterTemplate,
  deleteMasterTemplate,
  resetMasterTemplates,
} from "@/services/managerService"

import MasterNaviOSAPage from "./MasterNaviOSAPage"

interface ManagerMasterPageProps {
  group: "OSA" | "LXA"
}

// Danh sách các ảnh mẫu template có sẵn trong hệ thống để người dùng chọn nhanh
const AVAILABLE_TEMPLATES = [
  { name: "Box (Thùng carton chuẩn)", url: "/Image/Template/Box.jpg" },
  { name: "Tray (Khay định hình xốp)", url: "/Image/Template/Tray.jpg" },
  { name: "Gift (Hộp quà cao cấp)", url: "/Image/Template/Gift.jpg" },
  { name: "Dây điện (Cuộn cáp bó)", url: "/Image/Template/DAY DIEN.jpg" },
  { name: "KGW (Linh kiện cơ khí)", url: "/Image/Template/KGW.jpg" },
  { name: "SI (Cụm linh kiện chuẩn)", url: "/Image/Template/SI.jpg" },
]

function ManagerMasterContent({ group }: ManagerMasterPageProps) {
  // Danh sách templates của xưởng
  const [templates, setTemplates] = useState<MasterStepTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Modal Thêm / Chỉnh sửa ảnh mẫu
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MasterStepTemplate | null>(null)

  // Form State
  const [formProduct, setFormProduct] = useState("")
  const [formProductName, setFormProductName] = useState("")
  const [formStep, setFormStep] = useState<number>(1)
  const [formStepTitle, setFormStepTitle] = useState("")
  const [formImagePath, setFormImagePath] = useState("/Image/Template/Box.jpg")
  const [formDescription, setFormDescription] = useState("")
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lightbox phóng to ảnh mẫu
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  // Toast thông báo thao tác thành công
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Nạp dữ liệu Master khi đổi xưởng (OSA hoặc LXA)
  useEffect(() => {
    const data = getMasterTemplates(group)
    setTemplates(data)
  }, [group])

  // Lọc theo tìm kiếm
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return templates
    return templates.filter(
      (t) =>
        t.product.toLowerCase().includes(q) ||
        t.productName.toLowerCase().includes(q) ||
        t.stepTitle.toLowerCase().includes(q) ||
        t.standardDescription.toLowerCase().includes(q)
    )
  }, [templates, searchQuery])

  // Mở Form thêm mới
  const handleOpenAddModal = (suggestedProduct?: { code: string; name: string; nextStep?: number }) => {
    setEditingTemplate(null)
    setFormProduct(suggestedProduct ? suggestedProduct.code : (group === "OSA" ? "H0090924" : "LXA-MOD-204"))
    setFormProductName(suggestedProduct ? suggestedProduct.name : (group === "OSA" ? "HF-KXG-0630-C-PT-HN" : "Mô-đun quang học LXA"))
    setFormStep(suggestedProduct?.nextStep || 1)
    setFormStepTitle(`Bước ${suggestedProduct?.nextStep || 1}: Kiểm tra quy chuẩn đóng gói`)
    setFormImagePath(group === "OSA" ? "/Image/Template/Tray.jpg" : "/Image/Template/Box.jpg")
    setFormDescription("Ảnh chụp rõ toàn bộ tem nhãn, các góc cạnh thùng và dấu niêm phong chống mở.")
    setFormStatus("active")
    setIsFormOpen(true)
  }

  // Mở Form chỉnh sửa
  const handleOpenEditModal = (template: MasterStepTemplate) => {
    setEditingTemplate(template)
    setFormProduct(template.product)
    setFormProductName(template.productName)
    setFormStep(template.step)
    setFormStepTitle(template.stepTitle)
    setFormImagePath(template.imagePath)
    setFormDescription(template.standardDescription)
    setFormStatus(template.status)
    setIsFormOpen(true)
  }

  // Xử lý tải ảnh từ máy tính (Upload file local)
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

  // Lưu Form (Thêm mới hoặc Cập nhật)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formProduct.trim() || !formStepTitle.trim() || !formImagePath) {
      alert("Vui lòng điền đầy đủ Mã sản phẩm, Tên bước và Chọn ảnh mẫu.")
      return
    }

    const templateData: MasterStepTemplate = {
      id: editingTemplate ? editingTemplate.id : Date.now(),
      product: formProduct.trim(),
      productName: formProductName.trim() || formProduct.trim(),
      group: group,
      step: Number(formStep) || 1,
      stepTitle: formStepTitle.trim(),
      imagePath: formImagePath,
      standardDescription: formDescription.trim(),
      updatedBy: "NV-10321",
      updatedTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: formStatus,
    }

    const updated = upsertMasterTemplate(templateData)
    setTemplates(updated)
    setIsFormOpen(false)
    showToast(
      editingTemplate
        ? `Đã cập nhật ảnh mẫu bước ${templateData.step} cho sản phẩm ${templateData.product}!`
        : `Đã thêm ảnh mẫu bước ${templateData.step} mới cho sản phẩm ${templateData.product}!`
    )
  }

  // Xóa ảnh mẫu
  const handleDelete = (id: number, product: string, step: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ảnh mẫu bước ${step} của sản phẩm ${product}?`)) {
      const updated = deleteMasterTemplate(group, id)
      setTemplates(updated)
      showToast(`Đã xóa ảnh mẫu bước ${step} của sản phẩm ${product}.`)
    }
  }

  // Khôi phục dữ liệu gốc
  const handleResetDefaults = () => {
    if (window.confirm("Khôi phục danh sách ảnh mẫu về cấu hình mặc định ban đầu?")) {
      const reset = resetMasterTemplates(group)
      setTemplates(reset)
      showToast("Đã khôi phục danh sách ảnh mẫu về mặc định!")
    }
  }

  const isOSA = group === "OSA"

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= Header Trang Master ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                isOSA
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200/60"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
              }`}
            >
              {isOSA ? <Layers className="h-3.5 w-3.5" /> : <Cpu className="h-3.5 w-3.5" />}
              Master • Phân xưởng {isOSA ? "Navi OSA" : "Navi LXA"}
            </span>
            <span className="text-xs text-slate-400">• Cấu hình quy chuẩn ảnh</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Quản lý Ảnh Mẫu Sản Phẩm {isOSA ? "Navi OSA" : "Navi LXA"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nhập thông tin ảnh mẫu và quy chuẩn đóng gói từng bước (Step) cho từng sản phẩm {isOSA ? "NaviOSA" : "NaviLXA"}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Khôi phục lại dữ liệu mẫu"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Mặc định</span>
          </button>

          <button
            id="add-master-template-btn"
            type="button"
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm ảnh mẫu bước mới</span>
          </button>
        </div>
      </div>

      {/* ================= Search & Summary Bar ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Tìm kiếm theo mã sản phẩm ${isOSA ? "OSA" : "LXA"}, tên bước...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            Tổng cộng: <strong className="text-slate-900">{filteredTemplates.length}</strong> bước ảnh mẫu đã cấu hình
          </span>
          <span className="h-3 w-px bg-slate-200" />
          <span>
            Sản phẩm khác biệt:{" "}
            <strong className="text-blue-600">
              {new Set(filteredTemplates.map((t) => t.product)).size}
            </strong>
          </span>
        </div>
      </div>

      {/* ================= Templates Grid / Table ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Layers className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có ảnh mẫu nào</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Hãy nhấn nút "Thêm ảnh mẫu bước mới" bên trên để bắt đầu cấu hình ảnh mẫu cho phân xưởng này.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm bước mẫu ngay
            </button>
          </div>
        ) : (
          filteredTemplates.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header & Product Info */}
              <div className="p-4 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {item.product}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-700">
                    Bước {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-1" title={item.productName}>
                  {item.productName}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1">
                  {item.stepTitle}
                </p>
              </div>

              {/* Sample Photo Preview */}
              <div className="relative aspect-video w-full bg-slate-900/5 overflow-hidden border-y border-slate-100 flex items-center justify-center">
                <img
                  src={item.imagePath}
                  alt={`Mẫu ${item.product} bước ${item.step}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/Image/Template/Box.jpg"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(item.imagePath)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md">
                    <Maximize2 className="h-3.5 w-3.5 text-blue-600" />
                    Xem ảnh mẫu lớn
                  </span>
                </button>
              </div>

              {/* Checklist / Standard description */}
              <div className="p-4 pt-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tiêu chuẩn kiểm tra:
                  </span>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    {item.standardDescription || "Quy chuẩn đóng gói theo hướng dẫn kiểm định ISO xưởng."}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cập nhật: {item.updatedTime}</span>
                  <span className="font-medium text-slate-600">{item.updatedBy}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenAddModal({
                      code: item.product,
                      name: item.productName,
                      nextStep: item.step + 1,
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm bước {item.step + 1}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    title="Chỉnh sửa ảnh mẫu này"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.product, item.step)}
                    title="Xóa ảnh mẫu này"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL: THÊM / SỬA ẢNH MẪU MASTER ================= */}
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
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isOSA ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isOSA ? <Layers className="h-5 w-5" /> : <Cpu className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingTemplate ? "Chỉnh sửa Ảnh Mẫu Bước" : "Nhập Thông tin Ảnh Mẫu Bước Mới"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cấu hình ảnh mẫu cho phân xưởng {isOSA ? "Navi OSA" : "Navi LXA"}
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

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Hàng 1: Mã Sản Phẩm & Bước số */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã sản phẩm (Product Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isOSA ? "Ví dụ: H0090924 hoặc mã SP OSA mới" : "Ví dụ: LXA-MOD-204"}
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 font-mono font-bold focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bước số (Step) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStep}
                    onChange={(e) => setFormStep(Number(e.target.value))}
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

              {/* Hàng 2: Tên sản phẩm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên sản phẩm đầy đủ (Product Name)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: HF-KXG-0630-C-PT-HN Khay linh kiện định hình"
                  value={formProductName}
                  onChange={(e) => setFormProductName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Hàng 3: Tiêu đề bước kiểm tra */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên / Tiêu đề bước kiểm tra <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kiểm tra thùng carton & dán tem QR niêm phong"
                  value={formStepTitle}
                  onChange={(e) => setFormStepTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Hàng 4: Chọn ảnh mẫu (Upload file HOẶC chọn template có sẵn) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn ảnh mẫu (Sample Image) <span className="text-rose-500">*</span>
                </label>

                {/* Khung xem trước ảnh */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="relative h-28 w-36 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 flex items-center justify-center">
                    {formImagePath ? (
                      <img
                        src={formImagePath}
                        alt="Xem trước ảnh mẫu"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Chưa có ảnh</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* Tải ảnh từ máy tính */}
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5 text-blue-600" />
                        <span>Tải ảnh từ máy tính lên</span>
                      </button>
                      <span className="text-[11px] text-slate-400">hoặc chọn mẫu dưới đây:</span>
                    </div>

                    {/* Danh sách ảnh template có sẵn để chọn nhanh */}
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.name}
                          type="button"
                          onClick={() => setFormImagePath(tmpl.url)}
                          className={`rounded-md px-2 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                            formImagePath === tmpl.url
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {tmpl.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hàng 5: Tiêu chuẩn đóng gói / Ghi chú kỹ thuật */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả quy chuẩn đóng gói / Lưu ý kiểm định
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú chi tiết cho nhân viên kiểm tra: góc chụp thẳng đứng, không lóa sáng tem, đầy đủ thông tin mã vạch..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Footer hành động của Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {editingTemplate ? "Lưu thay đổi" : "Lưu ảnh mẫu bước"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox phóng to ảnh mẫu lớn */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-100"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-h-screen max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white pb-3">
              <span className="text-sm font-semibold">Ảnh mẫu quy chuẩn xưởng {isOSA ? "Navi OSA" : "Navi LXA"}</span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={previewImageUrl}
              alt="Ảnh mẫu lớn"
              className="max-h-[80vh] w-auto rounded-xl shadow-2xl object-contain ring-1 ring-white/10"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function ManagerMasterPage({ group }: ManagerMasterPageProps) {
  if (group === "OSA") {
    return <MasterNaviOSAPage />
  }
  return <ManagerMasterContent group={group} />
}
