/**
 * Interface thông tin tổng quát đơn hàng PhotoPackingSummary
 * Khớp 1-1 với Entity Backend PhotoPackingSummary.cs
 */
export interface PhotoPackingSummary {
  id?: number
  pO: string
  productCode: string
  productName: string
  group: string
  creator?: string
  createTime?: Date | string
  updator?: string
  updatedTime?: Date | string
  type: string
  productKey: string
  totalStep: number
  currentStep: number
  nextStep?: number
  recapture?: boolean
  notes: string
  shipDate?: number
  shipDateTime?: string
  isExpiringSoon?: boolean
  statusId: number
  /** Danh sách URL ảnh đã chụp (Image/Save) */
  photoUrls?: string[]
  /** Ảnh mẫu template đối chiếu (Image/Template) */
  samplePhotoUrl?: string
}

const STATUS_TEXT: Record<number, string> = {
  0: "Chờ chụp",
  1: "Đang chụp",
  2: "Chụp lại",
  3: "Hoàn thành",
}

const getStatusText = (statusId: number): string => {
  return STATUS_TEXT[statusId] || "Không xác định"
}

export { STATUS_TEXT, getStatusText }