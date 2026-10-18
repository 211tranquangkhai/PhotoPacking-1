import type { PhotoPackingSummary } from "@/types/photoPackingSummary"
import type {
  MasterStepTemplate,
  OrderStepDetail,
  DashboardMetrics,
  ManagerProfile,
} from "@/types/manager"
import { fetchOrdersFromApi } from "./photoPackingService"

/**
 * Thông tin Manager mặc định
 */
export const DEFAULT_MANAGER_PROFILE: ManagerProfile = {
  employeeId: "NV-10321",
  fullName: "Trần Văn Khải",
  role: "Quản lý Đóng gói & QA",
  department: "Phòng Quản lý Chất lượng & Xuất hàng",
}

/**
 * Danh sách đơn hàng cơ sở (bổ sung cả xưởng OSA và LXA)
 */
export const INITIAL_SUMMARY_ORDERS: PhotoPackingSummary[] = [
  {
    pO: "101008468010",
    productCode: "H0090924",
    productName: "HF-KXG-0630-C-PT-HN",
    group: "OSA",
    creator: "NV-QUANG",
    createTime: "2026-09-20T08:30:00Z",
    updator: "NV-10321",
    updatedTime: "2026-09-20T09:15:00Z",
    type: "Tray",
    productKey: "TRAY",
    totalStep: 2,
    currentStep: 2,
    notes: "Đã hoàn tất đóng gói 2 bước khay định hình linh kiện OSA",
    statusId: 3,
    samplePhotoUrl: "/Image/Template/Tray.jpg",
    photoUrls: [
      "/Image/Save/101008468010_1.jpg",
      "/Image/Save/101008468010_2.jpg",
    ],
  },
  {
    pO: "101008467994",
    productCode: "H0168277",
    productName: "HF-KXL06-C-HNC-SUS",
    group: "OSA",
    creator: "NV-HAI",
    createTime: "2026-09-21T10:00:00Z",
    updator: "12653",
    updatedTime: "2026-09-21T10:30:00Z",
    type: "Gift",
    productKey: "GIFT",
    totalStep: 2,
    currentStep: 1,
    notes: "Đã chụp bước 1 ảnh tổng thể, chuẩn bị bước 2 chụp tem niêm phong",
    statusId: 1,
    samplePhotoUrl: "/Image/Template/Gift.jpg",
    photoUrls: ["/Image/Save/101008467994_1.jpg"],
  },
  {
    pO: "101008468015",
    productCode: "H0168278",
    productName: "HF-KXL06-F-HNC-SUS",
    group: "OSA",
    creator: "NV-QUANG",
    createTime: "2026-09-22T07:15:00Z",
    updator: "NV-10321",
    updatedTime: "2026-09-22T07:15:00Z",
    type: "Box",
    productKey: "BOX",
    totalStep: 3,
    currentStep: 0,
    notes: "Chờ chụp bước 1: kiểm tra quy chuẩn thùng carton",
    statusId: 0,
    samplePhotoUrl: "/Image/Template/Box.jpg",
    photoUrls: [],
  },
  {
    pO: "101008468022",
    productCode: "H0056352",
    productName: "KXL06075-ORGOP4-HNB",
    group: "OSA",
    creator: "NV-LINH",
    createTime: "2026-09-22T08:00:00Z",
    updator: "NV-10321",
    updatedTime: "2026-09-22T08:45:00Z",
    type: "Tray",
    productKey: "TRAY",
    totalStep: 3,
    currentStep: 1,
    notes: "Đã xong bước 1, chuẩn bị chụp bước 2 khay linh kiện",
    statusId: 1,
    samplePhotoUrl: "/Image/Template/Tray.jpg",
    photoUrls: ["/Image/Save/101008257282_1.jpg"],
  },
  {
    pO: "101008468033",
    productCode: "H0057444",
    productName: "HF-KXL06100-CW-HNB",
    group: "OSA",
    creator: "NV-MINH",
    createTime: "2026-09-22T08:30:00Z",
    updator: "12653",
    updatedTime: "2026-09-22T09:10:00Z",
    type: "Gift",
    productKey: "GIFT",
    totalStep: 2,
    currentStep: 1,
    notes: "Ảnh bước 1 bị mờ góc tem nhãn, yêu cầu chụp lại góc thẳng rõ nét",
    statusId: 2,
    samplePhotoUrl: "/Image/Template/Gift.jpg",
    photoUrls: ["/Image/Save/101008273522_1.jpg"],
  },
  {
    pO: "101008348773",
    productCode: "LXA-MOD-204",
    productName: "Mô-đun quang học LXA Optical Transceiver",
    group: "LXA",
    creator: "NV-THANH",
    createTime: "2026-09-22T08:10:00Z",
    updator: "NV-10321",
    updatedTime: "2026-09-22T09:40:00Z",
    type: "Box",
    productKey: "BOX",
    totalStep: 4,
    currentStep: 4,
    notes: "Hoàn tất 4 bước kiểm tra đóng gói túi ESD và tem niêm phong LXA",
    statusId: 3,
    samplePhotoUrl: "/Image/Template/Box.jpg",
    photoUrls: [
      "/Image/Save/101008348773_1.jpg",
      "/Image/Save/101008348773_2.jpg",
      "/Image/Save/101008348773_3.jpg",
      "/Image/Save/101008348773_4.jpg",
    ],
  },
  {
    pO: "101008277127",
    productCode: "LXA-CIR-550",
    productName: "Bảng mạch điều khiển LXA High-Speed Controller",
    group: "LXA",
    creator: "NV-DUC",
    createTime: "2026-09-22T09:00:00Z",
    updator: "NV-10321",
    updatedTime: "2026-09-22T10:15:00Z",
    type: "Tray",
    productKey: "TRAY",
    totalStep: 5,
    currentStep: 3,
    notes: "Đang tiến hành bước 4 dán tem QA Pass",
    statusId: 1,
    samplePhotoUrl: "/Image/Template/Tray.jpg",
    photoUrls: [
      "/Image/Save/101008277127_1.jpg",
      "/Image/Save/101008277127_2.jpg",
      "/Image/Save/101008277127_3.jpg",
    ],
  },
  {
    pO: "101008258379",
    productCode: "H0057443",
    productName: "HF-KXL06075-CW-HNB Cơ khí chuẩn",
    group: "OSA",
    creator: "NV-HA",
    createTime: "2026-09-22T09:10:00Z",
    updator: "NV-10321",
    updatedTime: "2026-09-22T09:55:00Z",
    type: "Box",
    productKey: "BOX",
    totalStep: 3,
    currentStep: 3,
    notes: "Đã chụp đủ 3 bước thùng carton và phụ kiện đi kèm",
    statusId: 3,
    samplePhotoUrl: "/Image/Template/Box.jpg",
    photoUrls: [
      "/Image/Save/101008258379_1.jpg",
      "/Image/Save/101008258379_2.jpg",
      "/Image/Save/101008258379_3.jpg",
    ],
  },
  {
    pO: "101008841520",
    productCode: "LXA-CAB-880",
    productName: "Cáp quang phân luồng tín hiệu LXA Bus",
    group: "LXA",
    creator: "NV-THANH",
    createTime: "2026-09-22T10:00:00Z",
    updator: "12653",
    updatedTime: "2026-09-22T10:00:00Z",
    type: "DAY DIEN",
    productKey: "DAY_DIEN",
    totalStep: 3,
    currentStep: 0,
    notes: "Chờ chụp bước 1 quy chuẩn cuộn cáp và nhãn bảo hành",
    statusId: 0,
    samplePhotoUrl: "/Image/Template/DAY DIEN.jpg",
    photoUrls: [],
  },
  {
    pO: "101008468088",
    productCode: "TR-MED-7710",
    productName: "Khay phụ tùng y tế vô trùng OSA",
    group: "OSA",
    creator: "NV-QUANG",
    createTime: "2026-09-22T09:30:00Z",
    updator: "12653",
    updatedTime: "2026-09-22T10:20:00Z",
    type: "Tray",
    productKey: "TRAY",
    totalStep: 3,
    currentStep: 2,
    notes: "Tem nhãn bước 2 bị che khuất mã QR, yêu cầu chụp lại rõ thông tin",
    statusId: 2,
    samplePhotoUrl: "/Image/Template/Tray.jpg",
    photoUrls: [
      "/Image/Save/101008295274_1.jpg",
      "/Image/Save/101008295274_2.jpg",
    ],
  },
]

/**
 * Danh sách mẫu ảnh mặc định cho Navi OSA
 */
const DEFAULT_OSA_TEMPLATES: MasterStepTemplate[] = [
  {
    id: 101,
    product: "H0090924",
    productName: "HF-KXG-0630-C-PT-HN",
    group: "OSA",
    step: 1,
    stepTitle: "Kiểm tra khay xốp định hình và tem nhãn lô",
    imagePath: "/Image/Template/Tray.jpg",
    standardDescription: "Khay xốp nguyên vẹn, tem nhãn in sắc nét không bị nhòe góc.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-15 14:20",
    status: "active",
  },
  {
    id: 102,
    product: "H0090924",
    productName: "HF-KXG-0630-C-PT-HN",
    group: "OSA",
    step: 2,
    stepTitle: "Đặt linh kiện đúng chiều và niêm phong túi hút ẩm",
    imagePath: "/Image/Template/Tray.jpg",
    standardDescription: "Đặt đúng 10 linh kiện/khay, gói hút ẩm đặt góc phải trên.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-15 14:25",
    status: "active",
  },
  {
    id: 103,
    product: "H0168277",
    productName: "HF-KXL06-C-HNC-SUS",
    group: "OSA",
    step: 1,
    stepTitle: "Chụp bao bì hộp quà cao cấp và nhãn phụ",
    imagePath: "/Image/Template/Gift.jpg",
    standardDescription: "Hộp không trầy xước mép, logo hướng thẳng đứng lên trên.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-16 09:30",
    status: "active",
  },
  {
    id: 104,
    product: "H0168277",
    productName: "HF-KXL06-C-HNC-SUS",
    group: "OSA",
    step: 2,
    stepTitle: "Chụp tem niêm phong hologram chống mở",
    imagePath: "/Image/Template/Gift.jpg",
    standardDescription: "Dán tem niêm phong chính giữa mép gập hộp, chụp rõ ánh quang.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-16 09:35",
    status: "active",
  },
  {
    id: 105,
    product: "H0168278",
    productName: "HF-KXL06-F-HNC-SUS",
    group: "OSA",
    step: 1,
    stepTitle: "Kiểm tra kích thước và kết cấu thùng carton ngoài",
    imagePath: "/Image/Template/Box.jpg",
    standardDescription: "Thùng carton 5 lớp không móp méo, dán băng keo chính giữa.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-17 11:10",
    status: "active",
  },
  {
    id: 106,
    product: "H0168278",
    productName: "HF-KXL06-F-HNC-SUS",
    group: "OSA",
    step: 2,
    stepTitle: "Xếp lớp chống sốc bóng khí đáy thùng",
    imagePath: "/Image/Template/Box.jpg",
    standardDescription: "Lót tối thiểu 2 lớp xốp hơi chống sốc độ dày > 10mm.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-17 11:15",
    status: "active",
  },
  {
    id: 107,
    product: "H0168278",
    productName: "HF-KXL06-F-HNC-SUS",
    group: "OSA",
    step: 3,
    stepTitle: "Dán tem vận chuyển và mã QR đơn hàng PO",
    imagePath: "/Image/Template/Box.jpg",
    standardDescription: "Dán mặt hông bên phải, cách mép trên 5cm, quét thử đọc được.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-17 11:20",
    status: "active",
  },
]

/**
 * Danh sách mẫu ảnh mặc định cho Navi LXA
 */
const DEFAULT_LXA_TEMPLATES: MasterStepTemplate[] = [
  {
    id: 201,
    product: "LXA-MOD-204",
    productName: "Mô-đun quang học LXA Optical Transceiver",
    group: "LXA",
    step: 1,
    stepTitle: "Kiểm tra nắp chụp bảo vệ đầu quang LC",
    imagePath: "/Image/Template/Box.jpg",
    standardDescription: "Đầu quang có nắp cao su chống bụi màu đen cài chặt.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-18 10:00",
    status: "active",
  },
  {
    id: 202,
    product: "LXA-MOD-204",
    productName: "Mô-đun quang học LXA Optical Transceiver",
    group: "LXA",
    step: 2,
    stepTitle: "Đóng gói túi nhôm chống tĩnh điện ESD Shielding",
    imagePath: "/Image/Template/Box.jpg",
    standardDescription: "Túi nhôm ép nhiệt kín miệng, có nhãn cảnh báo ESD.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-18 10:05",
    status: "active",
  },
  {
    id: 203,
    product: "LXA-MOD-204",
    productName: "Mô-đun quang học LXA Optical Transceiver",
    group: "LXA",
    step: 3,
    stepTitle: "Đặt khay định hình 20 chiếc và thẻ kiểm tra chất lượng",
    imagePath: "/Image/Template/Tray.jpg",
    standardDescription: "Xếp đủ 20 chiếc cùng chiều connector, kèm phiếu QC pass ký tên.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-18 10:10",
    status: "active",
  },
  {
    id: 204,
    product: "LXA-MOD-204",
    productName: "Mô-đun quang học LXA Optical Transceiver",
    group: "LXA",
    step: 4,
    stepTitle: "Dán tem niêm phong bảo đảm xanh xưởng LXA",
    imagePath: "/Image/Template/Box.jpg",
    standardDescription: "Dán tem tròn LXA Security seal tại mép hộp.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-18 10:15",
    status: "active",
  },
  {
    id: 205,
    product: "LXA-CIR-550",
    productName: "Bảng mạch điều khiển LXA High-Speed Controller",
    group: "LXA",
    step: 1,
    stepTitle: "Kiểm tra ngoại quan bo mạch và chân cắm mạ vàng",
    imagePath: "/Image/Template/Tray.jpg",
    standardDescription: "Không trầy xước đường mạch, không cong vênh chân cắm PIN.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-19 13:00",
    status: "active",
  },
  {
    id: 206,
    product: "LXA-CAB-880",
    productName: "Cáp quang phân luồng tín hiệu LXA Bus",
    group: "LXA",
    step: 1,
    stepTitle: "Kiểm tra cuộn cáp đường kính tiêu chuẩn R > 150mm",
    imagePath: "/Image/Template/DAY DIEN.jpg",
    standardDescription: "Cáp cuộn tròn đều bằng dây velcro đai dán, không gấp khúc nhọn.",
    updatedBy: "NV-10321",
    updatedTime: "2026-09-19 15:30",
    status: "active",
  },
]

const STORAGE_KEY_OSA = "photo_packing_master_osa_v1"
const STORAGE_KEY_LXA = "photo_packing_master_lxa_v1"

/**
 * Lấy danh sách mẫu Master từ LocalStorage (hoặc nạp mặc định)
 */
export function getMasterTemplates(group: "OSA" | "LXA"): MasterStepTemplate[] {
  try {
    const key = group === "OSA" ? STORAGE_KEY_OSA : STORAGE_KEY_LXA
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (err) {
    console.warn("Lỗi đọc master templates:", err)
  }

  const defaults = group === "OSA" ? DEFAULT_OSA_TEMPLATES : DEFAULT_LXA_TEMPLATES
  saveMasterTemplates(group, defaults)
  return defaults
}

/**
 * Lưu toàn bộ danh sách mẫu Master cho 1 nhóm
 */
export function saveMasterTemplates(
  group: "OSA" | "LXA",
  templates: MasterStepTemplate[]
) {
  try {
    const key = group === "OSA" ? STORAGE_KEY_OSA : STORAGE_KEY_LXA
    localStorage.setItem(key, JSON.stringify(templates))
  } catch (err) {
    console.error("Lỗi lưu master templates:", err)
  }
}

/**
 * Thêm hoặc Cập nhật một mẫu bước Master
 */
export function upsertMasterTemplate(template: MasterStepTemplate): MasterStepTemplate[] {
  const current = getMasterTemplates(template.group)
  let updated: MasterStepTemplate[]
  const existingIndex = current.findIndex((item) => item.id === template.id)

  if (existingIndex >= 0) {
    updated = [...current]
    updated[existingIndex] = {
      ...template,
      updatedTime: new Date().toISOString().replace("T", " ").substring(0, 16),
    }
  } else {
    const newId = Date.now()
    updated = [
      {
        ...template,
        id: newId,
        updatedTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      },
      ...current,
    ]
  }

  saveMasterTemplates(template.group, updated)
  return updated
}

/**
 * Xóa một mẫu bước Master
 */
export function deleteMasterTemplate(
  group: "OSA" | "LXA",
  templateId: number
): MasterStepTemplate[] {
  const current = getMasterTemplates(group)
  const updated = current.filter((item) => item.id !== templateId)
  saveMasterTemplates(group, updated)
  return updated
}

/**
 * Khôi phục lại mẫu Master mặc định
 */
export function resetMasterTemplates(group: "OSA" | "LXA"): MasterStepTemplate[] {
  const defaults = group === "OSA" ? DEFAULT_OSA_TEMPLATES : DEFAULT_LXA_TEMPLATES
  saveMasterTemplates(group, defaults)
  return defaults
}

/**
 * Lấy danh sách chi tiết các bước chụp (Detail steps) từ danh sách PO Summary
 */
export function generateStepDetailsFromOrders(
  orders: PhotoPackingSummary[]
): OrderStepDetail[] {
  const details: OrderStepDetail[] = []

  const stepTitlesMap: Record<number, string> = {
    1: "Bước 1: Chụp tem thùng carton & bao bì ngoài",
    2: "Bước 2: Chụp khay xốp định hình linh kiện",
    3: "Bước 3: Chụp niêm phong seal chống mở",
    4: "Bước 4: Chụp dán tem kiểm định QA Pass",
    5: "Bước 5: Chụp đóng gói hoàn chỉnh xuất xưởng",
  }

  orders.forEach((order) => {
    const totalStep = order.totalStep || 2
    const currentStep = order.currentStep || 0
    const photos = order.photoUrls || []
    const isRecapture = order.statusId === 2

    for (let step = 1; step <= totalStep; step++) {
      let status: "completed" | "recapture" | "pending" = "pending"
      let photoUrl: string | undefined = undefined
      let capturedTime = "—"
      let photographer = order.creator || "NV-QUANG"

      if (step <= currentStep) {
        if (isRecapture && step === currentStep) {
          status = "recapture"
        } else {
          status = "completed"
        }
        photoUrl = photos[step - 1] || `/Image/Save/${order.pO}_${step}.jpg`
        capturedTime = order.updatedTime
          ? new Date(order.updatedTime).toLocaleString("vi-VN")
          : "Vừa cập nhật"
      } else {
        status = "pending"
        photographer = "—"
      }

      details.push({
        id: `${order.pO}-step-${step}`,
        po: order.pO,
        productCode: order.productCode,
        productName: order.productName,
        group: (order.group as "OSA" | "LXA") || "OSA",
        stepNumber: step,
        totalStep: totalStep,
        stepTitle: stepTitlesMap[step] || `Bước ${step}: Chụp kiểm tra chất lượng`,
        photographer: photographer,
        capturedTime: capturedTime,
        rawTime: order.updatedTime
          ? String(order.updatedTime)
          : order.createTime
          ? String(order.createTime)
          : undefined,
        photoUrl: photoUrl,
        samplePhotoUrl: order.samplePhotoUrl || `/Image/Template/${order.type || "Box"}.jpg`,
        status: status,
        notes: isRecapture && step === currentStep ? order.notes : undefined,
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
 * Tải toàn bộ đơn hàng (kết hợp API backend và bổ sung nếu thiếu dữ liệu mẫu)
 */
export async function loadManagerOrders(): Promise<PhotoPackingSummary[]> {
  try {
    const apiResult = await fetchOrdersFromApi()
    const allApiOrders = [...apiResult.pending, ...apiResult.completed]
    if (allApiOrders.length > 0) {
      // Kết hợp đơn hàng từ API với các đơn bổ sung LXA để quản lý xem đầy đủ cả 2 phân xưởng
      const existingPOs = new Set(allApiOrders.map((o) => o.pO))
      const extraOrders = INITIAL_SUMMARY_ORDERS.filter((o) => !existingPOs.has(o.pO))
      return [...allApiOrders, ...extraOrders]
    }
  } catch (error) {
    console.warn("Backend API chưa khả dụng, sử dụng bộ dữ liệu mẫu dự phòng:", error)
  }

  return INITIAL_SUMMARY_ORDERS
}
