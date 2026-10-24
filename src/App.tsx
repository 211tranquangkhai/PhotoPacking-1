import { useState, useEffect, useCallback } from "react"
import ManagerHeader, { type ManagerNavTab } from "@/components/manager/ManagerHeader"
import ManagerDashboard from "@/pages/manager/ManagerDashboard"
import ManagerPhotoPage from "@/pages/manager/ManagerPhotoPage"
import ManagerMasterPage from "@/pages/manager/ManagerMasterPage"
import MasterNaviOSAPage from "@/pages/manager/MasterNaviOSAPage"
import OrderListPage from "@/pages/OrderListPage"
import CameraPage from "@/pages/CameraPage"
import ScanPage from "@/pages/ScanPage"
import type { PhotoPackingSummary } from "@/types/photoPackingSummary"
import {
  DEFAULT_MANAGER_PROFILE,
  INITIAL_SUMMARY_ORDERS,
  loadManagerOrders,
} from "@/services/managerService"
import { ArrowLeft } from "lucide-react"

/**
 * App Component - Điều phối giao diện Quản lý (Manager Portal) & Chế độ Công nhân (Operator Mode)
 */
export default function App() {
  // Chế độ xem chính: "manager" (Mặc định cho Quản lý) | "operator" (Chế độ chụp ảnh máy quét)
  const [appMode, setAppMode] = useState<"manager" | "operator">("manager")

  // Tab điều hướng của Manager: "dashboard" | "photo" | "master-osa" | "master-lxa"
  const [managerTab, setManagerTab] = useState<ManagerNavTab>("photo")
  const [photoSubTab, setPhotoSubTab] = useState<"summary" | "detail">("detail")

  // Dữ liệu đơn hàng PO
  const [orders, setOrders] = useState<PhotoPackingSummary[]>(INITIAL_SUMMARY_ORDERS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Tải danh sách đơn hàng từ Backend API hoặc Fallback
  const refreshOrders = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const data = await loadManagerOrders()
      setOrders(data)
    } catch (error) {
      console.warn("Lỗi khi làm mới đơn hàng:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refreshOrders()
  }, [refreshOrders])

  // Điều hướng từ Dashboard sang Photo
  const handleNavigateToPhoto = (tab: "summary" | "detail" = "detail") => {
    setPhotoSubTab(tab)
    setManagerTab("photo")
  }

  // Điều hướng từ Dashboard sang Master
  const handleNavigateToMaster = (group: "OSA" | "LXA") => {
    setManagerTab(group === "OSA" ? "master-osa" : "master-lxa")
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

  // ================= RENDER OPERATOR MODE =================
  if (appMode === "operator") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Thanh bar quay lại chế độ Manager */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Đang ở Chế độ Nhân viên Thao tác (Mobile Mode)</span>
          </div>
          <button
            onClick={() => setAppMode("manager")}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1 font-bold text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại Giao diện Quản lý (Manager)</span>
          </button>
        </div>

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
            />
          )}
        </div>
      </div>
    )
  }

  // ================= RENDER MANAGER MODE =================
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 antialiased font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 1. Header bao gồm Logo Photo Packing, menu ngang (Dashboard, Photo, Master) & Profile Manager không avatar */}
      <ManagerHeader
        currentTab={managerTab}
        onSelectTab={(tab) => {
          setManagerTab(tab)
          if (tab === "photo") {
            setPhotoSubTab("detail")
          }
        }}
        profile={DEFAULT_MANAGER_PROFILE}
        onSwitchToOperator={() => setAppMode("operator")}
        onRefreshAll={refreshOrders}
        isRefreshing={isRefreshing}
      />

      {/* 2. Main Content Body */}
      <main className="mx-auto w-full max-w-[98%] flex-1 px-3 sm:px-4 lg:px-6 pt-5">
        {/* Trang 1: Dashboard (Số liệu tổng quát, đơn chưa chụp, đã chụp, tỷ lệ hoàn tất) */}
        {managerTab === "dashboard" && (
          <ManagerDashboard
            orders={orders}
            onNavigateToPhoto={handleNavigateToPhoto}
            onNavigateToMaster={handleNavigateToMaster}
          />
        )}

        {/* Trang 2: Photo (2 tab Summary và Detail theo dạng bảng) */}
        {managerTab === "photo" && (
          <ManagerPhotoPage
            orders={orders}
            initialTab={photoSubTab}
          />
        )}

        {/* Trang 3: Master - Navi OSA (Giao diện CRUD dạng bảng với NaviOSA) */}
        {managerTab === "master-osa" && (
          <MasterNaviOSAPage />
        )}

        {/* Trang 3: Master - Navi LXA */}
        {managerTab === "master-lxa" && (
          <ManagerMasterPage group="LXA" />
        )}
      </main>
    </div>
  )
}
