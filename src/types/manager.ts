import type { PhotoPackingMasterNavigation } from "./photoPackingMasterNavigation"
import type { PhotoPackingItem } from "./photoPackingItem"

/**
 * Kiểu dữ liệu Master Template ảnh mẫu từng bước
 * Đồng nhất hoàn toàn với PhotoPackingMasterNavigation từ Backend
 */
export type MasterStepTemplate = PhotoPackingMasterNavigation

/**
 * Chi tiết từng bước chụp của đơn hàng PO (Dành cho Tab Detail tại trang Photo)
 * Đồng nhất hoàn toàn với PhotoPackingItem từ Backend
 */
export type OrderStepDetail = PhotoPackingItem & {
  totalStep?: number
}

/**
 * Số liệu tổng hợp Dashboard
 */
export interface DashboardMetrics {
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  recaptureOrders: number
  completedOrders: number
  completionRate: number
  osaOrders: number
  lxaOrders: number
}

/**
 * Profile của Quản lý (Manager)
 */
export interface ManagerProfile {
  employeeId: string 
  fullName: string   
  role: string       
}
