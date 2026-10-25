/**
 * Interface cho bảng cấu hình bước chụp mẫu PhotoPackingMasterNavigation
 * Khớp 1-1 với Entity Backend PhotoPacking_Backend.Entities.PhotoPackingMasterNavigation.cs
 */
export interface PhotoPackingMasterNavigation {
  id: number
  productKey: string
  stepNo: number
  group: string
  notes: string
  templatePath: string
  creator?: number | string
  createTime?: string
  createdTime?: string
  updater?: number | string
  updatedTime?: string
  delFlg?: boolean
}

export type CreateMasterNavigationParams = {
  productKey: string
  stepNo: number
  group: string
  notes?: string
  templatePath?: string
  imageBase64?: string
  imageFileName?: string
  creator?: number
}

export type UpdateMasterNavigationParams = {
  productKey?: string
  stepNo?: number
  group?: string
  notes?: string
  templatePath?: string
  imageBase64?: string
  imageFileName?: string
  updater?: number
}
