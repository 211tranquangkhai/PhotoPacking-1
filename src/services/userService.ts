import type { User } from "@/types"

const BASE_URL = "/api/user"

/**
 * Lấy thông tin người dùng theo UserId (dùng cho luồng đăng nhập)
 */
export async function fetchUserById(userId: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/${userId}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Không tìm thấy người dùng với mã ID: ${userId}`)
  }
  return res.json()
}

/**
 * Đăng nhập bằng UserId
 */
export async function loginWithUserId(userId: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Đăng nhập thất bại với mã ID: ${userId}`)
  }
  return res.json()
}

/**
 * Lấy danh sách người dùng (hỗ trợ lọc theo role hoặc group)
 */
export async function fetchUsers(params?: { role?: string; group?: string }): Promise<User[]> {
  const query = new URLSearchParams()
  if (params?.role) query.append("role", params.role)
  if (params?.group) query.append("group", params.group)

  const url = query.toString() ? `${BASE_URL}?${query.toString()}` : BASE_URL
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Không thể tải danh sách người dùng")
  }
  return res.json()
}
