import type {
  PhotoPackingItem,
  SavePhotoPackingItemParams,
} from "@/types"

const BASE_URL = "/api/photo-packing-item"

/**
 * Lấy danh sách toàn bộ các bước chụp thực tế PhotoPackingItem từ Backend API
 */
export async function fetchPhotoPackingItems(
  po?: string,
  group?: string,
  userGroup?: string
): Promise<PhotoPackingItem[]> {
  const params = new URLSearchParams()
  if (po) params.append("po", po.trim())
  const effectiveGroup = userGroup || group
  if (effectiveGroup && effectiveGroup !== "all") {
    params.append("userGroup", effectiveGroup)
    params.append("group", effectiveGroup)
  }

  const url = `${BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Lỗi tải danh sách chi tiết các bước chụp (${res.status} ${res.statusText})`)
  }

  return await res.json()
}

/**
 * Lấy danh sách các bước chụp chi tiết của một đơn hàng theo PO
 */
export async function fetchItemsByPO(po: string): Promise<PhotoPackingItem[]> {
  const cleanPO = po.trim()
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(cleanPO)}`)

  if (!res.ok) {
    throw new Error(`Lỗi tải các bước chụp của đơn hàng PO ${cleanPO} (${res.status})`)
  }

  return await res.json()
}

/**
 * Lưu hoặc cập nhật kết quả bước chụp PhotoPackingItem qua API
 */
export async function savePhotoPackingItem(
  params: SavePhotoPackingItemParams
): Promise<PhotoPackingItem> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Lỗi khi lưu kết quả bước chụp (${res.status})`)
  }

  const response = await res.json()
  return response.data || response
}
