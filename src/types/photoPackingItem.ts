/**
 * Interface chi tiết từng bước chụp ảnh PhotoPackingItem
 * Khớp 1-1 với Entity Backend PhotoPacking_Backend.Entities.PhotoPackingItem.cs
 */
export interface PhotoPackingItem {
  id: number | string
  poNumber: string
  productCode: string
  productName: string
  group: string
  stepNo: number
  syncNasStatusId?: number
  imagePath: string
  image?: string
  sampleUrl: string
  reCapture: boolean
  productKey?: string
  notes?: string
  creator?: number | string
  createTime?: string
  updater?: number | string
  updatedTime?: string
  delFlg?: boolean
}

export type SavePhotoPackingItemParams = {
  poNumber: string
  stepNo: number
  productCode?: string
  productName?: string
  group?: string
  imageBase64?: string
  sampleUrl?: string
  reCapture?: boolean
  productKey?: string
  notes?: string
  creator?: number
  updater?: number
}
