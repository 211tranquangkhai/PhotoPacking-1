/**
 * Kiểu dữ liệu Master Template ảnh mẫu từng bước cho Navi OSA và Navi LXA
 */
export interface MasterStepTemplate {
  id: number
  product: string
  productName: string
  group: "OSA" | "LXA"
  step: number
  stepTitle: string
  imagePath: string
  standardDescription: string
  updatedBy: string
  updatedTime: string
  status: "active" | "inactive"
}

/**
 * Chi tiết từng bước chụp của đơn hàng PO (Dành cho Tab Detail tại trang Photo)
 */
export interface OrderStepDetail {
  id: string
  po: string
  productCode: string
  productName: string
  group: "OSA" | "LXA"
  stepNumber: number
  totalStep: number
  stepTitle: string
  photographer: string      // Người chụp
  capturedTime: string      // Thời gian chụp
  rawTime?: string          // Chuỗi thời gian gốc dùng lọc ngày (ISO hoặc timestamp)
  photoUrl?: string         // URL ảnh thực tế đã chụp
  samplePhotoUrl?: string   // URL ảnh mẫu đối chiếu
  status: "completed" | "recapture" | "pending"
  notes?: string
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
  employeeId: string // Mã nhân viên
  fullName: string   // Tên quản lý
  role: string       // Chức danh
  department: string // Bộ phận
}
