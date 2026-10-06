import { useState } from "react"
import OrderListPage from "@/pages/OrderListPage"
import CameraPage from "@/pages/CameraPage"
import ScanPage from "@/pages/ScanPage"

/**
 * App Component - Điều phối giữa Trang Danh sách Đơn hàng, Trang Quét mã và Trang Chụp ảnh Camera
 */
export default function App() {
  const [view, setView] = useState<"orders" | "camera" | "scan">("orders")
  const [activePO, setActivePO] = useState<string | null>(null)

  const [scannedCodeMeta, setScannedCodeMeta] = useState<{
    format?: string
    codeType?: "barcode" | "qrcode"
  } | null>(null)

  // Mở camera từ danh sách đơn hàng cho một PO cụ thể
  const handleOpenOrderCamera = (po: string) => {
    setActivePO(po)
    setScannedCodeMeta(null)
    setView("camera")
  }

  // Mở Scan View (từ nút quét barcode trên thanh tìm kiếm hoặc nút nổi)
  const handleOpenScanCamera = () => {
    setActivePO(null)
    setScannedCodeMeta(null)
    setView("scan")
  }

  // PO được phát hiện từ Scan View → chuyển sang Camera View kèm PO (chuỗi 12 số) và loại mã
  const handlePODetected = (
    po: string,
    codeMeta?: { format?: string; codeType?: "barcode" | "qrcode" }
  ) => {
    setActivePO(po)
    setScannedCodeMeta(codeMeta || null)
    setView("camera")
  }

  // Quay lại trang danh sách đơn hàng
  const handleBackToOrders = () => {
    setActivePO(null)
    setScannedCodeMeta(null)
    setView("orders")
  }

  if (view === "scan") {
    return (
      <ScanPage
        onPODetected={handlePODetected}
        onBack={handleBackToOrders}
      />
    )
  }

  if (view === "camera" && activePO) {
    return (
      <CameraPage
        po={activePO}
        scannedCodeMeta={scannedCodeMeta}
        onBack={handleBackToOrders}
      />
    )
  }

  return (
    <OrderListPage
      onOpenOrderCamera={handleOpenOrderCamera}
      onOpenScanCamera={handleOpenScanCamera}
    />
  )
}
