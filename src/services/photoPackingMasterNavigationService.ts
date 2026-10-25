import type {
  PhotoPackingMasterNavigation,
  CreateMasterNavigationParams,
  UpdateMasterNavigationParams,
} from "@/types"

const BASE_URL = "/api/photo-packing-master-navigation"

/**
 * Lấy danh sách cấu hình bước chụp mẫu PhotoPackingMasterNavigation từ Backend API
 */
export async function fetchMasterNavigations(
  group?: string,
  productKey?: string,
  userGroup?: string
): Promise<PhotoPackingMasterNavigation[]> {
  const params = new URLSearchParams()
  const effectiveGroup = userGroup || group
  if (effectiveGroup && effectiveGroup !== "all") {
    params.append("userGroup", effectiveGroup)
    params.append("group", effectiveGroup)
  }
  if (productKey) params.append("productKey", productKey)

  const url = `${BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Lỗi tải cấu hình bước chụp mẫu (${res.status} ${res.statusText})`)
  }

  return await res.json()
}

/**
 * Lấy chi tiết một cấu hình bước chụp theo ID
 */
export async function fetchMasterNavigationById(
  id: number
): Promise<PhotoPackingMasterNavigation> {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) {
    throw new Error(`Không tìm thấy cấu hình với ID: ${id}`)
  }
  return await res.json()
}

/**
 * Thêm mới cấu hình bước chụp mẫu PhotoPackingMasterNavigation qua API
 * Có hỗ trợ tải ảnh mẫu Base64 lưu vào thư mục Image/Template
 */
export async function createMasterNavigation(
  params: CreateMasterNavigationParams
): Promise<PhotoPackingMasterNavigation> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Lỗi khi thêm mới cấu hình bước chụp (${res.status})`)
  }

  const response = await res.json()
  return response.data || response
}

/**
 * Cập nhật cấu hình bước chụp mẫu PhotoPackingMasterNavigation qua API
 */
export async function updateMasterNavigation(
  id: number,
  params: UpdateMasterNavigationParams
): Promise<PhotoPackingMasterNavigation> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Lỗi khi cập nhật cấu hình bước chụp (${res.status})`)
  }

  const response = await res.json()
  return response.data || response
}

/**
 * Xóa cấu hình bước chụp mẫu PhotoPackingMasterNavigation qua API
 */
export async function deleteMasterNavigation(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Lỗi khi xóa cấu hình bước chụp (${res.status})`)
  }
}

/**
 * Thêm mới hoặc cập nhật một mục Master Navigation và trả về danh sách mới nhất
 */
export async function upsertMasterNavigation(
  item: Partial<PhotoPackingMasterNavigation> & {
    productKey: string
    stepNo: number
    templatePath?: string
    imageBase64?: string
  },
  group: string = "OSA"
): Promise<PhotoPackingMasterNavigation[]> {
  const targetGroup = item.group || group || "OSA"
  const templatePath = item.templatePath

  if (item.id) {
    await updateMasterNavigation(item.id, {
      productKey: item.productKey.trim(),
      stepNo: Number(item.stepNo) || 1,
      group: targetGroup,
      notes: item.notes?.trim(),
      templatePath,
      imageBase64: item.imageBase64,
      updater: typeof item.updater === "number" ? item.updater : undefined,
    })
  } else {
    await createMasterNavigation({
      productKey: item.productKey.trim(),
      stepNo: Number(item.stepNo) || 1,
      group: targetGroup,
      notes: item.notes?.trim(),
      templatePath,
      imageBase64: item.imageBase64,
      creator: typeof item.creator === "number" ? item.creator : undefined,
    })
  }

  return await fetchMasterNavigations(targetGroup)
}

/**
 * Xóa một mục Master Navigation và trả về danh sách cập nhật
 */
export async function deleteAndRefreshMasterNavigations(
  id: number,
  group: string = "OSA"
): Promise<PhotoPackingMasterNavigation[]> {
  await deleteMasterNavigation(id)
  return await fetchMasterNavigations(group)
}

