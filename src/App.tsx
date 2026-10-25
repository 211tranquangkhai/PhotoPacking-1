import { useState, useEffect, useCallback, useMemo } from "react"
import ManagerHeader, { type ManagerNavTab } from "@/components/manager/ManagerHeader"
import ManagerDashboard from "@/pages/manager/ManagerDashboard"
import ManagerPhotoPage from "@/pages/manager/ManagerPhotoPage"
import MasterNavigationPage from "@/pages/manager/MasterNavigationPage"
import OrderListPage from "@/pages/operator/OrderListPage"
import CameraPage from "@/pages/operator/CameraPage"
import ScanPage from "@/pages/operator/ScanPage"
import LoginPage from "@/pages/auth/LoginPage"
import type { PhotoPackingSummary, User, ManagerProfile } from "@/types"
import { loadManagerOrders } from "@/services/managerService"
import { ArrowLeft, AlertCircle } from "lucide-react"

const USER_STORAGE_KEY = "photo_packing_user"

/**
 * App Component - Điều phối:
 * 1. Màn hình Đăng nhập (LoginPage)
 * 2. Chế độ Nhân viên Thao tác (Operator Mode - dành cho Role User)
 * 3. Chế độ Quản lý (Manager Portal - dành cho Role Leader & SubLeader)
 * 4. Tự động truyền nhận và lọc dữ liệu theo userGroup
 */
export default function App() {
  // Người dùng hiện tại (lưu và khôi phục từ localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Chế độ xem: "manager" | "operator"
  const [appMode, setAppMode] = useState<"manager" | "operator">(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY)
      if (saved) {
        const u = JSON.parse(saved)
        return u.role === "User" ? "operator" : "manager"
      }
    } catch {
      // ignore
    }
    return "manager"
  })

  // Tab điều hướng của Manager: "dashboard" | "photo" | "master-navigation"
  const [managerTab, setManagerTab] = useState<ManagerNavTab>("dashboard")
  const [photoSubTab, setPhotoSubTab] = useState<"summary" | "detail">("detail")

  // Dữ liệu đơn hàng PO tải từ Backend API (theo group của user)
  const [orders, setOrders] = useState<PhotoPackingSummary[]>([])
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // Nhóm phân xưởng của người dùng (OSA hoặc LXA)
  const userGroup = currentUser?.group || "OSA"

  // Tải danh sách đơn hàng từ Backend API theo group của user
  const refreshOrders = useCallback(async () => {
    if (!currentUser) return
    setIsRefreshing(true)
    setApiError(null)
    try {
      const data = await loadManagerOrders(currentUser.group)
      setOrders(data)
    } catch (error: any) {
      console.warn("Lỗi khi làm mới đơn hàng từ API:", error)
      setApiError(error.message || "Không thể kết nối đến Backend API để tải dữ liệu đơn hàng.")
    } finally {
      setIsRefreshing(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      refreshOrders()
    }
  }, [currentUser, refreshOrders])

  // Xử lý đăng nhập thành công
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user)
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } catch (err) {
      console.error("Lỗi khi lưu thông tin user vào localStorage:", err)
    }

    // Điều hướng theo Role:
    // Role "User" -> OrderListPage (chế độ Operator)
    // Role "Leader" & "SubLeader" -> Manager
    if (user.role === "User") {
      setAppMode("operator")
      setOperatorView("orders")
    } else {
      setAppMode("manager")
      setManagerTab("dashboard")
    }
  }

  // Xử lý đăng xuất
  const handleLogout = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch (err) {
      console.error("Lỗi khi xóa user khỏi localStorage:", err)
    }
    setOrders([])
    setAppMode("manager")
  }

  // Profile cho ManagerHeader
  const managerProfile: ManagerProfile = useMemo(() => {
    if (!currentUser) {
      return {
        employeeId: "NV-10321",
        fullName: "Quản lý",
        role: "Leader",
      }
    }
    return {
      employeeId: `${currentUser.id}`,
      fullName: currentUser.userName,
      role: currentUser.role,
    }
  }, [currentUser])

  // Điều hướng từ Dashboard sang Photo
  const handleNavigateToPhoto = (tab: "summary" | "detail" = "detail") => {
    setPhotoSubTab(tab)
    setManagerTab("photo")
  }

  // Điều hướng từ Dashboard sang Master Navigation
  const handleNavigateToMaster = () => {
    setManagerTab("master-navigation")
  }

  // ================= State cho Chế độ Công nhân (Operator) =================
  const [operatorView, setOperatorView] = useState<"orders" | "camera" | "scan">("orders")
  const [activePO, setActivePO] = useState<string | null>(null)
  const [scannedCodeMeta, setScannedCodeMeta] = useState<{
    format?: string
    codeType?: "barcode" | "qrcode"
  } | null>(null)

  const handleOpenOrderCamera = (po: string) => {
    setActivePO(po)
    setScannedCodeMeta(null)
    setOperatorView("camera")
  }

  const handleOpenScanCamera = () => {
    setActivePO(null)
    setScannedCodeMeta(null)
    setOperatorView("scan")
  }

  const handlePODetected = (
    po: string,
    codeMeta?: { format?: string; codeType?: "barcode" | "qrcode" }
  ) => {
    setActivePO(po)
    setScannedCodeMeta(codeMeta || null)
    setOperatorView("camera")
  }

  const handleBackToOrders = () => {
    setActivePO(null)
    setScannedCodeMeta(null)
    setOperatorView("orders")
  }

  // ================= 1. CHƯA ĐĂNG NHẬP: HIỂN THỊ LOGIN PAGE =================
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // ================= 2. RENDER OPERATOR MODE (ROLE "USER" HOẶC CHUYỂN QUA) =================
  if (appMode === "operator") {
    const isManagerRole = currentUser.role === "Leader" || currentUser.role === "SubLeader"

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Thanh bar quay lại chế độ Manager (chỉ hiển thị cho Leader / SubLeader) */}
        {isManagerRole && (
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">
                Đang ở Chế độ Thao tác Chụp ảnh (Xem thử nghiệm)
              </span>
            </div>
            <button
              onClick={() => setAppMode("manager")}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1 font-bold text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Giao diện Quản lý</span>
            </button>
          </div>
        )}

        <div className="flex-1">
          {operatorView === "scan" ? (
            <ScanPage onPODetected={handlePODetected} onBack={handleBackToOrders} />
          ) : operatorView === "camera" && activePO ? (
            <CameraPage
              po={activePO}
              scannedCodeMeta={scannedCodeMeta}
              onBack={handleBackToOrders}
            />
          ) : (
            <OrderListPage
              onOpenOrderCamera={handleOpenOrderCamera}
              onOpenScanCamera={handleOpenScanCamera}
              userGroup={userGroup}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    )
  }

  // ================= 3. RENDER MANAGER MODE (LEADER & SUBLEADER) =================
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 antialiased font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 1. Header bao gồm Logo Photo Packing, menu ngang (Dashboard, Photo, Master) & Profile + Logout */}
      <ManagerHeader
        currentTab={managerTab}
        onSelectTab={(tab) => {
          setManagerTab(tab)
          if (tab === "photo") {
            setPhotoSubTab("detail")
          }
        }}
        profile={managerProfile}
        userGroup={userGroup}
        onLogout={handleLogout}
        onSwitchToOperator={() => setAppMode("operator")}
        onRefreshAll={refreshOrders}
        isRefreshing={isRefreshing}
      />

      {/* 2. Main Content Body */}
      <main className="mx-auto w-full max-w-[98%] flex-1 px-3 sm:px-4 lg:px-6 pt-5 space-y-4">
        {apiError && (
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              type="button"
              onClick={refreshOrders}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Trang 1: Dashboard (Số liệu tổng quát theo Group của User) */}
        {managerTab === "dashboard" && (
          <ManagerDashboard
            orders={orders}
            isLoading={isRefreshing && orders.length === 0}
            onNavigateToPhoto={handleNavigateToPhoto}
            onNavigateToMaster={handleNavigateToMaster}
          />
        )}

        {/* Trang 2: Photo (2 tab Summary và Detail theo dạng bảng, lọc theo group) */}
        {managerTab === "photo" && (
          <ManagerPhotoPage
            orders={orders}
            userGroup={userGroup}
            isLoadingOrders={isRefreshing && orders.length === 0}
            initialTab={photoSubTab}
          />
        )}

        {/* Trang 3: Master Navigation (Hiển thị dữ liệu theo Group người dùng với giao diện bảng của Navi OSA) */}
        {(managerTab === "master-navigation" ||
          managerTab === "master-osa" ||
          managerTab === "master-lxa") && (
            <MasterNavigationPage group={userGroup} currentUser={currentUser} />
          )}
      </main>
    </div>
  )
}
