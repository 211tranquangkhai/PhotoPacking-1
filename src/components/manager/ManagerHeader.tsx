import { useState, useRef, useEffect } from "react"
import {
  Camera,
  LayoutDashboard,
  Images,
  FolderKanban,
  ChevronDown,
  Layers,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import type { ManagerProfile } from "@/types/manager"

export type ManagerNavTab = "dashboard" | "photo" | "master-osa" | "master-lxa"

interface ManagerHeaderProps {
  currentTab: ManagerNavTab
  onSelectTab: (tab: ManagerNavTab) => void
  profile: ManagerProfile
  onSwitchToOperator?: () => void
  onRefreshAll?: () => void
  isRefreshing?: boolean
}

export default function ManagerHeader({
  currentTab,
  onSelectTab,
  profile,
  onSwitchToOperator,
  onRefreshAll,
  isRefreshing = false,
}: ManagerHeaderProps) {
  const [isMasterOpen, setIsMasterOpen] = useState(false)
  const masterDropdownRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        masterDropdownRef.current &&
        !masterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMasterOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isMasterActive =
    currentTab === "master-osa" || currentTab === "master-lxa"

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 w-full max-w-[98%] items-center justify-between px-3 sm:px-4 lg:px-6">
        
        {/* ================= 1. App Logo & Brand ================= */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => onSelectTab("dashboard")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-blue-700 via-indigo-600 to-sky-500 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Photo Packing
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Hệ thống Quản lý Đóng gói
              </span>
            </div>
          </div>

          {/* ================= 2. Horizontal Navigation Menu ================= */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {/* Tab: Dashboard */}
            <button
              id="nav-dashboard-btn"
              onClick={() => {
                onSelectTab("dashboard")
                setIsMasterOpen(false)
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                currentTab === "dashboard"
                  ? "bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            {/* Tab: Photo */}
            <button
              id="nav-photo-btn"
              onClick={() => {
                onSelectTab("photo")
                setIsMasterOpen(false)
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                currentTab === "photo"
                  ? "bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Images className="h-4 w-4" />
              <span>Photo</span>
              <span className="inline-flex items-center rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                Summary & Detail
              </span>
            </button>

            {/* Tab: Master (Dropdown với Navi OSA & Navi LXA) */}
            <div className="relative" ref={masterDropdownRef}>
              <button
                id="nav-master-dropdown-btn"
                type="button"
                onClick={() => setIsMasterOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isMasterActive
                    ? "bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-haspopup="true"
                aria-expanded={isMasterOpen}
              >
                <FolderKanban className="h-4 w-4" />
                <span>Master</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    isMasterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Master Dropdown Menu */}
              {isMasterOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Cấu hình Ảnh mẫu
                  </div>

                  {/* Navi OSA */}
                  <button
                    id="nav-master-osa-item"
                    role="menuitem"
                    onClick={() => {
                      onSelectTab("master-osa")
                      setIsMasterOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      currentTab === "master-osa"
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-md ${
                        currentTab === "master-osa"
                          ? "bg-blue-700 text-white"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">Navi OSA</span>
                      <span
                        className={`text-[11px] ${
                          currentTab === "master-osa"
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        Ảnh mẫu sản phẩm OSA
                      </span>
                    </div>
                  </button>

                  {/* Navi LXA */}
                  <button
                    id="nav-master-lxa-item"
                    role="menuitem"
                    onClick={() => {
                      onSelectTab("master-lxa")
                      setIsMasterOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      currentTab === "master-lxa"
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-md ${
                        currentTab === "master-lxa"
                          ? "bg-blue-700 text-white"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">Navi LXA</span>
                      <span
                        className={`text-[11px] ${
                          currentTab === "master-lxa"
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        Ảnh mẫu sản phẩm LXA
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* ================= 3. Right Corner: Manager Profile (NO AVATAR) ================= */}
        <div className="flex items-center gap-3">
          {/* Nút Làm mới dữ liệu */}
          {onRefreshAll && (
            <button
              onClick={onRefreshAll}
              disabled={isRefreshing}
              title="Làm mới toàn bộ dữ liệu"
              className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              />
            </button>
          )}

          {/* Nút chuyển chế độ công nhân (Operator Mode) nếu cần kiểm tra quy trình chụp ảnh */}
          {onSwitchToOperator && (
            <button
              onClick={onSwitchToOperator}
              title="Chuyển sang chế độ Chụp ảnh / Quét mã nhân viên thao tác"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Chế độ Chụp ảnh (Operator)</span>
            </button>
          )}

          {/* Profile Manager: Mã nhân viên và Tên (ĐẶC BIỆT: KHÔNG CÓ AVATAR THEO YÊU CẦU) */}
          <div
            id="manager-profile-box"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 shadow-2xs"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                {profile.fullName}
              </span>
              <div className="flex items-center justify-end gap-1.5">
                <span className="inline-flex items-center rounded-sm bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                  {profile.employeeId}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Manager
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
