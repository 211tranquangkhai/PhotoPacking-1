export interface SubmitPhotoParams {
  po: string
  stepNumber: number
  imageBase64: string
  productName?: string
}

export interface SubmitPhotoResult {
  success: boolean
  message: string
  hasNextStep?: boolean
  nextStepNumber?: number
  totalStep?: number
  isCompleted?: boolean
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
 * Gửi ảnh chụp lên server Backend API (/api/photo/submit)
 * Server .NET sẽ lưu ảnh vào thư mục Image/Save với tên file là PO_Step.jpg
 */
export async function submitPhoto(
  params: SubmitPhotoParams
): Promise<SubmitPhotoResult> {
  const res = await fetch("/api/photo/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Lỗi server khi lưu ảnh (${res.status})`)
  }

  const data = await res.json()
  return {
    success: data.success ?? true,
    message: data.message || `Đã lưu ảnh bước ${params.stepNumber} cho PO ${params.po}.`,
    hasNextStep: data.hasNextStep,
    nextStepNumber: data.nextStepNumber,
    totalStep: data.totalStep,
    isCompleted: data.isCompleted,
  }
}

/**
 * Xác nhận hoàn tất bước chụp (Send API lần 2)
 * Gọi sau khi người dùng so sánh ảnh chụp với ảnh mẫu và bấm xác nhận.
 * Server .NET cập nhật trạng thái đơn hàng và chuyển bước tiếp theo
 */
export async function confirmStep(
  params: ConfirmStepParams
): Promise<ConfirmStepResult> {
  const res = await fetch("/api/photo/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Lỗi server khi xác nhận bước (${res.status})`)
  }

  return await res.json()
}
