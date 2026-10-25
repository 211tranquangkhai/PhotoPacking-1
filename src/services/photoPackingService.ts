import type { PhotoPackingSummary } from "@/types"

const BASE_URL = "/api/photo-packing-summary"

// Bộ nhớ đệm danh sách đơn hàng đã tải từ server Backend
let cachedOrders: PhotoPackingSummary[] = []

export function getCachedOrders(): PhotoPackingSummary[] {
  return cachedOrders
}

export function setCachedOrders(orders: PhotoPackingSummary[]) {
  cachedOrders = orders
}

/**
 * Gọi lấy danh sách đơn hàng PO từ server Backend API (/api/photo-packing-summary)
 * Phân loại thành 2 danh sách: Chờ chụp (pending) và Đã hoàn tất (completed).
 */
export async function fetchOrdersFromApi(
  group?: string,
  poNumber?: string,
  statusId?: number,
  userGroup?: string
): Promise<{
  pending: PhotoPackingSummary[]
  completed: PhotoPackingSummary[]
  total: number
  data: PhotoPackingSummary[]
}> {
  const params = new URLSearchParams()
  const effectiveGroup = userGroup || group
  if (effectiveGroup && effectiveGroup !== "all") {
    params.append("userGroup", effectiveGroup)
    params.append("group", effectiveGroup)
  }
  if (poNumber) params.append("poNumber", poNumber)
  if (statusId !== undefined) params.append("statusId", String(statusId))

  const url = `${BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Lỗi kết nối Backend API: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const pending: PhotoPackingSummary[] = (data.pending || []).map((item: PhotoPackingSummary) => ({
    ...item,
    photoUrls: item.photoUrls || [],
  }))

  const completed: PhotoPackingSummary[] = (data.completed || []).map((item: PhotoPackingSummary) => ({
    ...item,
    photoUrls: item.photoUrls || [],
  }))

  const allOrders = data.data || [...pending, ...completed]

  // Lưu vào bộ nhớ đệm phục vụ tra cứu nhanh khi quét mã
  setCachedOrders(allOrders)

  return {
    pending,
    completed,
    total: data.total || allOrders.length,
    data: allOrders,
  }
}

/**
 * Gọi API on-demand: Lấy danh sách ảnh lưu (Image/Save) và ảnh mẫu (Image/Template) của 1 PO
 */
export async function fetchPhotosForOrderApi(
  po: string
): Promise<{ photoUrls: string[]; samplePhotoUrl?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(po)}/photos`)
    if (res.ok) {
      const data = await res.json()
      return {
        photoUrls: data.photoUrls || [],
        samplePhotoUrl: data.samplePhotoUrl,
      }
    }
  } catch (err) {
    console.warn(`Lỗi khi tải ảnh cho PO ${po}:`, err)
  }

  return { photoUrls: [] }
}

/**
 * Tra cứu thông tin chi tiết một PO từ Backend API (/api/photo-packing-summary/{poNumber})
 */
export async function fetchOrderByPOApi(
  po: string
): Promise<PhotoPackingSummary> {
  const cleanPO = (po || "").trim()
  const lowerPO = cleanPO.toLowerCase()

  // 1. Kiểm tra trong cache trước
  const foundInCache = cachedOrders.find(
    (item) => item.pO.trim().toLowerCase() === lowerPO
  )
  if (foundInCache) return foundInCache

  // 2. Gọi trực tiếp API
  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(cleanPO)}`)
    if (res.ok) {
      const item: PhotoPackingSummary = await res.json()
      if (item && item.pO) {
        cachedOrders.push(item)
        return item
      }
    }
  } catch (err) {
    console.warn(`Lỗi khi tra cứu PO ${cleanPO} từ Backend API:`, err)
  }

  // 3. Fallback: Nếu PO chưa có trong CSDL, trả về đối tượng cơ bản
  const defaultPO: PhotoPackingSummary = {
    pO: cleanPO,
    productCode: "",
    productName: "",
    group: "OSA",
    creator: "SYSTEM",
    createTime: new Date().toISOString(),
    updator: "#AUTO",
    updatedTime: new Date().toISOString(),
    type: "Box",
    productKey: "",
    totalStep: 3,
    currentStep: 0,
    notes: "",
    statusId: 0,
    photoUrls: [],
  }

  cachedOrders.push(defaultPO)
  return defaultPO
}
