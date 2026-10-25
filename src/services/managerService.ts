import type { PhotoPackingSummary } from "@/types/photoPackingSummary"
import type {
  OrderStepDetail,
  DashboardMetrics,
  ManagerProfile,
} from "@/types/manager"
import { fetchOrdersFromApi } from "./photoPackingService"
import { fetchPhotoPackingItems } from "./photoPackingItemService"

/**
 * Thông tin Manager mặc định
 */
export const DEFAULT_MANAGER_PROFILE: ManagerProfile = {
  employeeId: "NV-10321",
  fullName: "Trần Quang Khải",
  role: "Leader",
}

/**
 * Danh sách rỗng ban đầu thay thế cho mock data cũ
 */
export const INITIAL_SUMMARY_ORDERS: PhotoPackingSummary[] = []

/**
 * Lấy danh sách chi tiết các bước chụp (Detail steps) từ Backend API (/api/photo-packing-item)
 */
export async function fetchOrderStepDetails(
  po?: string,
  group?: string,
  userGroup?: string
): Promise<OrderStepDetail[]> {
  const items = await fetchPhotoPackingItems(po, group, userGroup)
  return items as OrderStepDetail[]
}

/**
 * Hàm hỗ trợ tạo StepDetails từ danh sách PO Summary khi chưa tải xong Items từ API
 */
export function generateStepDetailsFromOrders(
  orders: PhotoPackingSummary[]
): OrderStepDetail[] {
  const details: OrderStepDetail[] = []

  orders.forEach((order) => {
    const totalStep = order.totalStep || 2
    const currentStep = order.currentStep || 0
    const photos = order.photoUrls || []
    const isRecapture = order.statusId === 2

    for (let step = 1; step <= totalStep; step++) {
      const isDone = step <= currentStep
      const isStepRecapture = isRecapture && step === currentStep
      const photoUrl = isDone ? (photos[step - 1] || `/Image/Save/${order.pO}_${step}.jpg`) : ""

      details.push({
        id: `${order.pO}-step-${step}`,
        poNumber: order.pO,
        productCode: order.productCode,
        productName: order.productName,
        group: (order.group as "OSA" | "LXA") || "OSA",
        stepNo: step,
        totalStep: totalStep,
        imagePath: photoUrl,
        sampleUrl: order.samplePhotoUrl || `/Image/Template/${order.type || "Box"}.jpg`,
        reCapture: isStepRecapture,
        notes: isStepRecapture ? order.notes : "",
        creator: order.creator || "NV-QUANG",
        createTime: order.updatedTime
          ? String(order.updatedTime)
          : order.createTime
          ? String(order.createTime)
          : undefined,
      })
    }
  })

  return details
}

/**
 * Tính toán số liệu Dashboard từ danh sách đơn hàng
 */
export function calculateDashboardMetrics(
  orders: PhotoPackingSummary[]
): DashboardMetrics {
  const total = orders.length
  const pending = orders.filter((o) => o.statusId === 0).length
  const inProgress = orders.filter((o) => o.statusId === 1).length
  const recapture = orders.filter((o) => o.statusId === 2).length
  const completed = orders.filter((o) => o.statusId === 3).length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const osa = orders.filter((o) => o.group === "OSA").length
  const lxa = orders.filter((o) => o.group === "LXA").length

  return {
    totalOrders: total,
    pendingOrders: pending,
    inProgressOrders: inProgress,
    recaptureOrders: recapture,
    completedOrders: completed,
    completionRate,
    osaOrders: osa,
    lxaOrders: lxa,
  }
}

/**
 * Tải toàn bộ danh sách đơn hàng hoàn toàn từ Backend API (/api/photo-packing-summary)
 */
export async function loadManagerOrders(userGroup?: string): Promise<PhotoPackingSummary[]> {
  const apiResult = await fetchOrdersFromApi(undefined, undefined, undefined, userGroup)
  return apiResult.data || [...apiResult.pending, ...apiResult.completed]
}
