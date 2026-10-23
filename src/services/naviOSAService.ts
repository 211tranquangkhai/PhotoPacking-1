import type { NaviOSA } from "@/types/NaviOSA"

export const STORAGE_KEY_NAVI_OSA = "photo_packing_master_naviosa_v1"

/**
 * Danh sách dữ liệu mẫu ban đầu theo interface NaviOSA
 */
export const INITIAL_NAVI_OSA_LIST: NaviOSA[] = [
  {
    id: 1,
    productKey: "H0090924",
    stepNo: 1,
    group: "OSA",
    imagePath: "/Image/Template/Tray.jpg",
    notes: "Kiểm tra khay xốp định hình và tem nhãn lô. Khay xốp nguyên vẹn, tem nhãn in sắc nét không bị nhòe góc.",
    creator: "NV-QUANG",
    createdTime: "2026-09-15 08:30",
    updater: "NV-10321",
    updatedTime: "2026-09-15 14:20",
  },
  {
    id: 2,
    productKey: "H0090924",
    stepNo: 2,
    group: "OSA",
    imagePath: "/Image/Template/Tray.jpg",
    notes: "Đặt linh kiện đúng chiều và niêm phong túi hút ẩm. Đặt đúng 10 linh kiện/khay, gói hút ẩm đặt góc phải trên.",
    creator: "NV-QUANG",
    createdTime: "2026-09-15 09:00",
    updater: "NV-10321",
    updatedTime: "2026-09-15 14:25",
  },
  {
    id: 3,
    productKey: "H0168277",
    stepNo: 1,
    group: "OSA",
    imagePath: "/Image/Template/Gift.jpg",
    notes: "Chụp bao bì hộp quà cao cấp và nhãn phụ. Hộp không trầy xước mép, logo hướng thẳng đứng lên trên.",
    creator: "NV-HAI",
    createdTime: "2026-09-16 08:15",
    updater: "NV-10321",
    updatedTime: "2026-09-16 09:30",
  },
  {
    id: 4,
    productKey: "H0168277",
    stepNo: 2,
    group: "OSA",
    imagePath: "/Image/Template/Gift.jpg",
    notes: "Chụp tem niêm phong hologram chống mở. Dán tem niêm phong chính giữa mép gập hộp, chụp rõ ánh quang.",
    creator: "NV-HAI",
    createdTime: "2026-09-16 08:45",
    updater: "NV-10321",
    updatedTime: "2026-09-16 09:35",
  },
  {
    id: 5,
    productKey: "H0168278",
    stepNo: 1,
    group: "OSA",
    imagePath: "/Image/Template/Box.jpg",
    notes: "Kiểm tra kích thước và kết cấu thùng carton ngoài. Thùng carton 5 lớp không móp méo, dán băng keo chính giữa.",
    creator: "NV-QUANG",
    createdTime: "2026-09-17 10:00",
    updater: "NV-10321",
    updatedTime: "2026-09-17 11:10",
  },
  {
    id: 6,
    productKey: "H0168278",
    stepNo: 2,
    group: "OSA",
    imagePath: "/Image/Template/Box.jpg",
    notes: "Xếp lớp chống sốc bóng khí đáy thùng. Lót tối thiểu 2 lớp xốp hơi chống sốc độ dày > 10mm.",
    creator: "NV-QUANG",
    createdTime: "2026-09-17 10:30",
    updater: "NV-10321",
    updatedTime: "2026-09-17 11:15",
  },
  {
    id: 7,
    productKey: "H0168278",
    stepNo: 3,
    group: "OSA",
    imagePath: "/Image/Template/Box.jpg",
    notes: "Dán tem vận chuyển và mã QR đơn hàng PO. Dán mặt hông bên phải, cách mép trên 5cm, quét thử đọc được.",
    creator: "NV-QUANG",
    createdTime: "2026-09-17 11:00",
    updater: "NV-10321",
    updatedTime: "2026-09-17 11:20",
  },
  {
    id: 8,
    productKey: "H0056352",
    stepNo: 1,
    group: "OSA",
    imagePath: "/Image/Template/Tray.jpg",
    notes: "Kiểm tra khay định hình linh kiện vi mạch KXL06075. Không bụi bẩn, không trầy nứt mép khay.",
    creator: "NV-LINH",
    createdTime: "2026-09-18 08:00",
    updater: "NV-10321",
    updatedTime: "2026-09-18 09:15",
  },
  {
    id: 9,
    productKey: "H0057444",
    stepNo: 1,
    group: "OSA",
    imagePath: "/Image/Template/Gift.jpg",
    notes: "Đóng gói hộp quà tặng linh kiện HF-KXL06100. Đặt nắp khít, tem vỡ bảo hành dán mép góc hộp.",
    creator: "NV-MINH",
    createdTime: "2026-09-18 10:00",
    updater: "NV-10321",
    updatedTime: "2026-09-18 10:45",
  },
]

/**
 * Lấy danh sách NaviOSA từ LocalStorage hoặc khởi tạo từ dữ liệu mẫu
 */
export function getNaviOSAList(): NaviOSA[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NAVI_OSA)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn("Lỗi đọc dữ liệu NaviOSA từ localStorage:", err)
  }

  saveNaviOSAList(INITIAL_NAVI_OSA_LIST)
  return INITIAL_NAVI_OSA_LIST
}

/**
 * Lưu danh sách NaviOSA vào LocalStorage
 */
export function saveNaviOSAList(list: NaviOSA[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NAVI_OSA, JSON.stringify(list))
  } catch (err) {
    console.error("Lỗi lưu dữ liệu NaviOSA vào localStorage:", err)
  }
}

/**
 * Thêm mới hoặc cập nhật một mục NaviOSA
 */
export function upsertNaviOSA(item: Partial<NaviOSA> & { productKey: string; stepNo: number; imagePath: string }): NaviOSA[] {
  const current = getNaviOSAList()
  const now = new Date().toISOString().replace("T", " ").substring(0, 16)
  let updated: NaviOSA[]

  if (item.id) {
    // Cập nhật mục đã có
    const index = current.findIndex((x) => x.id === item.id)
    if (index >= 0) {
      updated = [...current]
      updated[index] = {
        ...updated[index],
        productKey: item.productKey.trim(),
        stepNo: Number(item.stepNo) || 1,
        group: item.group || "OSA",
        imagePath: item.imagePath,
        notes: item.notes?.trim() || "",
        updater: item.updater || "NV-10321",
        updatedTime: now,
      }
    } else {
      updated = [
        {
          id: item.id,
          productKey: item.productKey.trim(),
          stepNo: Number(item.stepNo) || 1,
          group: item.group || "OSA",
          imagePath: item.imagePath,
          notes: item.notes?.trim() || "",
          creator: item.creator || "NV-10321",
          createdTime: item.createdTime || now,
          updater: item.updater || "NV-10321",
          updatedTime: now,
        },
        ...current,
      ]
    }
  } else {
    // Thêm mới
    const maxId = current.reduce((max, cur) => Math.max(max, cur.id), 0)
    const newId = maxId + 1
    const newItem: NaviOSA = {
      id: newId,
      productKey: item.productKey.trim(),
      stepNo: Number(item.stepNo) || 1,
      group: item.group || "OSA",
      imagePath: item.imagePath,
      notes: item.notes?.trim() || "",
      creator: item.creator || "NV-10321",
      createdTime: now,
      updater: "NV-10321",
      updatedTime: now,
    }
    updated = [newItem, ...current]
  }

  saveNaviOSAList(updated)
  return updated
}

/**
 * Xóa một mục NaviOSA theo ID
 */
export function deleteNaviOSA(id: number): NaviOSA[] {
  const current = getNaviOSAList()
  const updated = current.filter((x) => x.id !== id)
  saveNaviOSAList(updated)
  return updated
}

/**
 * Khôi phục danh sách NaviOSA về dữ liệu mặc định
 */
export function resetNaviOSAList(): NaviOSA[] {
  saveNaviOSAList(INITIAL_NAVI_OSA_LIST)
  return INITIAL_NAVI_OSA_LIST
}
