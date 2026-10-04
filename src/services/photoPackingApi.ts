import {
  MOCK_PENDING_SUMMARIES,
  MOCK_PHOTO_PACKING_SUMMARIES,
} from "@/data/mockPhotoPacking"

export interface SubmitPhotoParams {
  po: string
  stepNumber: number
  imageBase64: string
  productName?: string
}

export interface SubmitPhotoResult {
  success: boolean
  message: string
}

export interface ConfirmStepParams {
  po: string
  stepNumber: number
  totalStep?: number
}

export interface ConfirmStepResult {
  success: boolean
  message: string
  hasNextStep?: boolean
  nextStepNumber?: number
  totalStep?: number
  isCompleted?: boolean
}

/**
 * Giả lập API gửi ảnh chụp lên server (Send API lần 1)
 * Trả về kết quả thành công hoặc thất bại sau khoảng thời gian xử lý
 */
export async function submitPhoto(
  params: SubmitPhotoParams
): Promise<SubmitPhotoResult> {
  // Giả lập network delay từ server backend
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // 95% success rate cho demo
  const isSuccess = Math.random() > 0.05

  if (isSuccess) {
    return {
      success: true,
      message: `Ảnh chụp bước ${params.stepNumber} cho PO ${params.po} đã được hệ thống ghi nhận thành công.`,
    }
  }

  return {
    success: false,
    message: "Lỗi kết nối server. Vui lòng kiểm tra mạng và thử lại.",
  }
}

/**
 * Giả lập API xác nhận hoàn tất bước chụp (Send API lần 2)
 * Gọi sau khi người dùng so sánh ảnh chụp với ảnh mẫu và bấm xác nhận.
 * Trả về thông tin bước tiếp theo (nếu còn) để client điều hướng chụp tiếp hoặc tạm dừng.
 */
export async function confirmStep(
  params: ConfirmStepParams
): Promise<ConfirmStepResult> {
  // Giả lập network delay từ server backend
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Tra cứu đơn hàng trong mock data để xác định chính xác totalStep và cập nhật tiến độ
  const cleanPO = params.po.trim().toLowerCase()
  const found =
    MOCK_PENDING_SUMMARIES.find(
      (item) => item.pO.trim().toLowerCase() === cleanPO
    ) ||
    MOCK_PHOTO_PACKING_SUMMARIES.find(
      (item) => item.pO.trim().toLowerCase() === cleanPO
    )

  const totalStep = params.totalStep || found?.totalStep || 3
  const isCompleted = params.stepNumber >= totalStep
  const hasNextStep = !isCompleted
  const nextStepNumber = hasNextStep ? params.stepNumber + 1 : undefined

  // Cập nhật trạng thái trong dữ liệu mẫu để đồng bộ khi người dùng quay về OrderListPage
  if (found) {
    found.currentStep = params.stepNumber
    found.statusId = isCompleted ? 3 : 1 // 3: Hoàn tất, 1: Đang chụp
    found.updatedTime = new Date().toISOString()
  }

  return {
    success: true,
    message: isCompleted
      ? `Đã hoàn tất toàn bộ quy trình đóng gói (${params.stepNumber}/${totalStep} bước) cho PO ${params.po}!`
      : `Bước ${params.stepNumber}/${totalStep} cho PO ${params.po} đã được xác nhận hoàn tất thành công.`,
    hasNextStep,
    nextStepNumber,
    totalStep,
    isCompleted,
  }
}

