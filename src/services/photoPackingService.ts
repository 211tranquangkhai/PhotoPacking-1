import type { PhotoPackingSummary } from "@/types/photoPackingSummary"

// Bộ nhớ đệm danh sách đơn hàng đã tải từ server Backend
let cachedOrders: PhotoPackingSummary[] = []

export function getCachedOrders(): PhotoPackingSummary[] {
  return cachedOrders
}

export function setCachedOrders(orders: PhotoPackingSummary[]) {
  cachedOrders = orders
}

/**
 * Gọi lấy danh sách đơn hàng PO từ server Backend API (/api/orders)
 * Phân loại thành 2 danh sách: Chờ chụp (pending) và Đã hoàn tất (completed).
 */
export async function fetchOrdersFromApi(): Promise<{
  pending: PhotoPackingSummary[]
  completed: PhotoPackingSummary[]
}> {
  const res = await fetch("/api/orders")
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

  // Lưu vào bộ nhớ đệm phục vụ tra cứu nhanh khi quét mã
  setCachedOrders([...pending, ...completed])

  return { pending, completed }
}

/**
 * Gọi API on-demand: Lấy danh sách ảnh lưu (Image/Save) và ảnh mẫu (Image/Template) của 1 PO
 */
export async function fetchPhotosForOrderApi(
  po: string
): Promise<{ photoUrls: string[]; samplePhotoUrl?: string }> {
  try {
    const res = await fetch(`/api/photos/${encodeURIComponent(po)}`)
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
 * Tra cứu thông tin chi tiết một PO từ Backend API (/api/orders/{po})
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
    const res = await fetch(`/api/orders/${encodeURIComponent(cleanPO)}`)
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
  // (Server vẫn trả về PhotoPackingSummary nếu không tìm thấy PO, chỉ không có thông tin Sản phẩm và ảnh mẫu)
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
