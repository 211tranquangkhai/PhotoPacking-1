/**
 * Interface thông tin người dùng User
 * Khớp 1-1 với Entity Backend PhotoPacking_Backend.Entities.User.cs
 */
export interface User {
  id: number
  userName: string
  role: "User" | "SubLeader" | "Leader" | string
  group: "OSA" | "LXA" | string
}
