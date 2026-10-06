# Hướng Dẫn Chi Tiết: ScanPage & CameraPage cho Người Mới Học React TypeScript

> **Đối tượng**: Bạn vừa bắt đầu học React + TypeScript và chưa từng làm việc với camera / quét mã vạch trên trình duyệt.
>
> **Mục tiêu**: Sau khi đọc xong tài liệu này, bạn sẽ hiểu từng dòng code trong hai trang `ScanPage.tsx` và `CameraPage.tsx`, biết cách clone và chạy dự án, cũng như có thể tự viết tính năng camera tương tự.

---

## Mục Lục

1. [Cách clone & chạy dự án](#1-cách-clone--chạy-dự-án)
2. [Kiến thức nền tảng cần biết trước](#2-kiến-thức-nền-tảng-cần-biết-trước)
3. [Tổng quan kiến trúc ứng dụng](#3-tổng-quan-kiến-trúc-ứng-dụng)
4. [ScanPage — Quét mã real-time (Chi tiết từng dòng)](#4-scanpage--quét-mã-real-time)
5. [CameraPage — Chụp ảnh + quét mã + gửi API (Chi tiết từng dòng)](#5-camerapage--chụp-ảnh--quét-mã--gửi-api)
6. [Các service hỗ trợ](#6-các-service-hỗ-trợ)
7. [Bảng thuật ngữ](#7-bảng-thuật-ngữ)
8. [Bài tập thực hành gợi ý](#8-bài-tập-thực-hành-gợi-ý)

---

## 1. Cách clone & chạy dự án

```bash
# 1. Clone repository
git clone <url-repo> DemoWithAI
cd DemoWithAI

# 2. Cài dependencies
npm install

# 3. Chạy dev server
npm run dev

# 4. Mở trình duyệt tại http://localhost:5173
```

> **⚠️ LƯU Ý QUAN TRỌNG:**
> **Camera chỉ hoạt động trên HTTPS hoặc `localhost`.**
> Trình duyệt web chặn API `navigator.mediaDevices.getUserMedia()` trên HTTP thường.
> Nếu bạn cần test trên điện thoại qua mạng LAN, cần cấu hình HTTPS cho Vite.

### Thư viện chính được dùng

| Thư viện | Dùng để làm gì |
|---|---|
| `react` (18+) | Framework giao diện |
| `typescript` | Kiểu dữ liệu an toàn (type-safe) |
| `@zxing/library` | Engine đọc mã vạch Barcode 1D (Code 128, EAN-13...) và QR Code 2D |
| `jsqr` | Engine đọc QR Code chuyên biệt (fallback khi ZXing không nhận diện được) |
| `lucide-react` | Bộ icon đẹp (X, ScanLine, Zap, SwitchCamera...) |
| `tailwindcss` | Styling bằng class CSS tiện lợi |

---

## 2. Kiến thức nền tảng cần biết trước

### 2.1. Web API: `navigator.mediaDevices.getUserMedia()`

Đây là API của trình duyệt cho phép JavaScript truy cập **camera** và **microphone** của thiết bị.

```typescript
// Yêu cầu trình duyệt mở camera sau
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "environment",   // "environment" = camera sau, "user" = camera trước
    width: { ideal: 1920 },      // Yêu cầu độ phân giải mong muốn
    height: { ideal: 1080 },
  },
  audio: false,                  // Không cần microphone
})
```

**Kết quả trả về**: một đối tượng `MediaStream` — dòng dữ liệu video liên tục từ camera.

### 2.2. Hiển thị camera lên `<video>` element

```typescript
// Gán stream vào thẻ <video> để hiển thị hình ảnh camera lên màn hình
const videoElement = document.querySelector("video")
videoElement.srcObject = stream       // Kết nối stream ↔ video element
await videoElement.play()             // Bắt đầu phát video
```

### 2.3. Chụp một frame từ video bằng `<canvas>`

`<canvas>` là một tấm bảng vẽ trong HTML. Ta "chụp" bằng cách sao chép frame hiện tại từ `<video>` sang `<canvas>`:

```typescript
const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

// Đặt kích thước canvas bằng kích thước video
canvas.width = video.videoWidth     // ví dụ: 1920
canvas.height = video.videoHeight   // ví dụ: 1080

// Vẽ frame hiện tại từ video sang canvas
ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

// Xuất canvas thành ảnh JPEG dạng base64
const imageBase64 = canvas.toDataURL("image/jpeg", 0.95)
// Kết quả: "data:image/jpeg;base64,/9j/4AAQ..."
```

### 2.4. React Hooks quan trọng

| Hook | Ý nghĩa | Ví dụ trong dự án |
|---|---|---|
| `useState` | Lưu trữ trạng thái, khi thay đổi → component tự render lại | `const [stream, setStream] = useState(null)` |
| `useRef` | Lưu trữ giá trị **không gây render lại** khi thay đổi. Dùng để tham chiếu DOM element hoặc giữ biến giữa các lần render | `const videoRef = useRef<HTMLVideoElement>(null)` |
| `useEffect` | Chạy side-effect (mở camera, gọi API...) **sau khi** component mount/update | Khởi động camera khi vào trang |
| `useCallback` | Tạo hàm **ổn định** (không bị tạo lại mỗi lần render) để tránh vòng lặp vô hạn trong `useEffect` | `const stopAll = useCallback(() => {...}, [])` |

### 2.5. Tại sao dùng `useRef` thay vì `useState` cho một số biến?

Đây là điểm quan trọng nhất mà người mới hay nhầm lẫn:

```typescript
// ❌ SAI: Dùng useState → mỗi lần setIsProcessing sẽ re-render toàn bộ component
const [isProcessing, setIsProcessing] = useState(false)

// ✅ ĐÚNG: Dùng useRef → thay đổi giá trị MÀ KHÔNG gây re-render
const isProcessingRef = useRef(false)
isProcessingRef.current = true   // Thay đổi nhưng không render lại
```

**Lý do**: Trong vòng lặp quét mã `setInterval` chạy mỗi 200ms, nếu dùng `useState` sẽ khiến component render lại **5 lần mỗi giây** → giật lag! Dùng `useRef` để lưu cờ trạng thái bên trong vòng lặp mà không ảnh hưởng hiệu năng.

---

## 3. Tổng quan kiến trúc ứng dụng

### 3.1. Sơ đồ điều hướng giữa các trang

```
OrderListPage ──(Bấm nút quét mã)──→ ScanPage ──(Tìm PO)──→ CameraPage
      │                                   │                        │
      │                                   └──(Bấm Hủy quét)──→ OrderListPage
      │
      └──(Bấm vào đơn hàng cụ thể)──→ CameraPage ──(Hoàn tất/Đóng)──→ OrderListPage
```

### 3.2. File `App.tsx` — Bộ điều phối trung tâm

`App.tsx` sử dụng một biến `view` để quyết định hiển thị trang nào:

```typescript
const [view, setView] = useState<"orders" | "camera" | "scan">("orders")
//                                  ↑ Có 3 giá trị, tương ứng 3 trang

if (view === "scan")   return <ScanPage ... />
if (view === "camera") return <CameraPage ... />
return <OrderListPage ... />
```

**Quan hệ giữa ScanPage và CameraPage:**
- `ScanPage` chỉ **quét mã** (không chụp ảnh). Khi tìm thấy PO → gọi `onPODetected(po)` → App chuyển sang `CameraPage`.
- `CameraPage` **chụp ảnh** + quét mã trên ảnh chụp + gửi lên server.

---

## 4. ScanPage — Quét mã real-time

> **File**: `src/pages/ScanPage.tsx` (~310 dòng)
>
> **Chức năng**: Mở camera → liên tục quét mỗi 200ms → phát hiện mã vạch/QR → chuyển sang CameraPage

### 4.1. Sơ đồ luồng hoạt động

```
Vào ScanPage
    ↓
Mở camera (getUserMedia)
    ↓
Bắt đầu setInterval mỗi 200ms
    ↓ (lặp lại)
Frame video sẵn sàng? ──(Không)──→ Bỏ qua, chờ frame tiếp
    │ (Có)
    ↓
Vẽ frame lên canvas (ctx.drawImage)
    ↓
Quét mã trên canvas (scanBarcodeFromCanvas)
    ↓
Tìm thấy mã? ──(Không)──→ Quay lại chờ frame tiếp
    │ (Có)
    ↓
processScannedBarcodeResult() → Mã hợp lệ?
    │                              │
    │ (Không)                      │ (Có)
    ↓                              ↓
Hiển thị lỗi               Dừng quét + Gọi onPODetected()
Cooldown 2.5s                      ↓
    ↓                       Chuyển sang CameraPage
Quay lại chờ frame tiếp
```

### 4.2. Props — Dữ liệu đầu vào

```typescript
interface ScanPageProps {
  // Callback khi tìm thấy PO hợp lệ. App.tsx sẽ dùng hàm này để chuyển sang CameraPage.
  onPODetected: (
    po: PhotoPackingSummary,                                    // Thông tin đơn hàng
    codeMeta?: { format?: string; codeType?: "barcode" | "qrcode" }  // Loại mã đã quét
  ) => void

  // Callback khi người dùng bấm "Hủy quét" hoặc nút đóng
  onBack: () => void
}
```

### 4.3. Các biến `useRef` — Giải thích chi tiết

```typescript
const videoRef = useRef<HTMLVideoElement | null>(null)
// ↑ Tham chiếu đến thẻ <video> trong HTML. Giống document.getElementById("video")
//   nhưng theo cách React. Giá trị .current trỏ đến DOM element thật.

const canvasRef = useRef<HTMLCanvasElement | null>(null)
// ↑ Tham chiếu đến thẻ <canvas> ẩn. Ta dùng canvas để "chụp" frame từ video
//   và phân tích ảnh bằng thư viện quét mã.

const streamRef = useRef<MediaStream | null>(null)
// ↑ Lưu đối tượng MediaStream (luồng video camera) để sau này có thể dừng camera:
//   streamRef.current.getTracks().forEach(track => track.stop())

const scanIntervalRef = useRef<number | null>(null)
// ↑ Lưu ID của setInterval (vòng lặp quét mã mỗi 200ms).
//   Khi rời trang, ta cần clearInterval(scanIntervalRef.current) để dừng quét.

const isDetectedRef = useRef(false)
// ↑ Cờ boolean: "Đã phát hiện mã thành công chưa?"
//   Khi = true → vòng lặp quét sẽ bỏ qua (return ngay), không quét nữa.
//   Dùng useRef thay useState vì thay đổi cờ này KHÔNG cần render lại giao diện.

const isProcessingFrameRef = useRef(false)
// ↑ Cờ "đang xử lý frame hay không?". Ngăn 2 frame bị xử lý đồng thời.
//   Tưởng tượng: frame A đang quét (mất 150ms) → interval gọi frame B.
//   Nếu không có cờ này, 2 frame sẽ quét cùng lúc → lãng phí tài nguyên.

const cooldownUntilRef = useRef<number>(0)
// ↑ Timestamp (mili-giây): "Không quét cho đến thời điểm này".
//   Sau khi hiển thị lỗi, ta đặt cooldown 2.5s để:
//   - Tránh spam lỗi liên tục (vì camera sẽ nhìn thấy cùng mã sai mỗi 200ms)
//   - Cho người dùng kịp đọc thông báo lỗi

const onPODetectedRef = useRef(onPODetected)
// ↑ Lưu callback onPODetected vào ref. Tại sao?
//   Vì hàm trong setInterval giữ tham chiếu từ thời điểm tạo interval (closure).
//   Nếu parent re-render và truyền onPODetected mới, hàm trong setInterval
//   vẫn gọi phiên bản cũ. Dùng ref để luôn gọi phiên bản mới nhất.
```

### 4.4. Hàm `stopAll()` — Dọn dẹp tài nguyên

```typescript
const stopAll = useCallback(() => {
  // 1. Dừng vòng lặp quét frame
  if (scanIntervalRef.current) {
    clearInterval(scanIntervalRef.current)  // Hủy setInterval
    scanIntervalRef.current = null
  }

  // 2. Dừng tất cả media track (= tắt camera phần cứng)
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => {
      track.enabled = false   // Vô hiệu hóa track
      track.stop()            // Giải phóng phần cứng camera (đèn camera tắt)
    })
    streamRef.current = null
  }

  // 3. Ngắt kết nối video element
  if (videoRef.current) {
    videoRef.current.pause()            // Dừng phát video
    videoRef.current.srcObject = null   // Ngắt luồng stream
  }
}, [])
// ↑ Mảng dependency rỗng [] = hàm này được tạo 1 lần duy nhất, không bao giờ thay đổi
```

> **⚠️ CẢNH BÁO:**
> **Luôn phải gọi `track.stop()`** khi rời trang! Nếu không, camera phần cứng vẫn hoạt động
> (đèn LED trên laptop vẫn sáng), gây tốn pin và ảnh hưởng bảo mật.

### 4.5. Hàm `init()` — Khởi động camera và vòng lặp quét

Đây là phần cốt lõi nhất. Nó nằm bên trong `useEffect` và được gọi khi component mount (hiển thị lần đầu):

```typescript
useEffect(() => {
  let mounted = true
  // ↑ Biến cờ để kiểm tra component còn mount hay không.
  //   Giải quyết vấn đề: getUserMedia() mất 1-2 giây.
  //   Nếu người dùng rời trang trong khi đang chờ → stream trả về
  //   nhưng component đã unmount → gán stream sẽ gây lỗi.

  async function init() {
    // Bước 1: Yêu cầu quyền camera
    const stream = await navigator.mediaDevices.getUserMedia({...})

    // Bước 2: Kiểm tra component còn sống không
    if (!mounted) {
      stream.getTracks().forEach(track => track.stop())  // Giải phóng ngay
      return
    }

    // Bước 3: Gán stream vào <video> element
    streamRef.current = stream
    videoRef.current.srcObject = stream
    await videoRef.current.play()

    // Bước 4: Bắt đầu vòng lặp quét mỗi 200ms
    scanIntervalRef.current = window.setInterval(async () => {
      // Kiểm tra các điều kiện dừng
      if (isDetectedRef.current) return       // Đã phát hiện mã → dừng
      if (isProcessingFrameRef.current) return // Frame trước chưa xử lý xong

      isProcessingFrameRef.current = true     // Đánh dấu "đang xử lý"

      try {
        // a. Vẽ frame video hiện tại lên canvas (ẩn)
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // b. Quét mã trên canvas (Barcode 1D & QR Code 2D)
        const scanResult = await scanBarcodeFromCanvas(canvas)

        if (scanResult && scanResult.text.trim()) {
          // c. Kiểm tra cooldown (tránh spam lỗi)
          if (Date.now() < cooldownUntilRef.current) return

          // d. Xử lý mã theo quy tắc nghiệp vụ
          const processed = processScannedBarcodeResult(scanResult)

          if (!processed.success) {
            // Mã không hợp lệ → hiển thị lỗi + đặt cooldown
            setLastError(processed.errorMessage)
            cooldownUntilRef.current = Date.now() + 2500  // 2.5 giây
            return
          }

          // e. Mã hợp lệ → dừng quét + gọi callback
          isDetectedRef.current = true
          setIsDetected(true)
          setTimeout(() => {
            onPODetectedRef.current(po, { format, codeType })
          }, 500)  // Chờ 500ms để hiệu ứng "Đã nhận diện" hiển thị
        }
      } finally {
        isProcessingFrameRef.current = false  // Đánh dấu "xử lý xong"
      }
    }, 200)  // ← 200ms = 5 lần quét mỗi giây
  }

  init()

  // Cleanup function: Chạy khi component unmount (rời trang)
  return () => {
    mounted = false
    stopAll()  // Dừng camera + interval
  }
}, [stopAll])
```

### 4.6. Phần JSX — Giao diện người dùng

```
┌──────────────────────────────────────┐
│ [Icon]    Quét Barcode & QR Code  [X]│  ← Header
│        Đọc cả hai (1D & 2D)         │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Khung quét Barcode & QR Code │  │  ← Nhãn chế độ
│  │ ┌──                        ──┐│  │
│  │ │                            ││  │  ← Viewfinder với 4 góc
│  │ │     VIDEO CAMERA LIVE      ││  │
│  │ │ - - - - - - - - - - - - - -││  │  ← Đường tâm hỗ trợ căn
│  │ │                            ││  │
│  │ └──                        ──┘│  │
│  │ ═══════════════════════════════│  │  ← Laser quét (animation)
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  ● Hướng camera vào mã vạch...       │  ← Trạng thái quét
│  [         Hủy quét           ]      │  ← Nút hủy
└──────────────────────────────────────┘
```

**Canvas ẩn**: Trong HTML có `<canvas ref={canvasRef} className="hidden" />`. Canvas này không hiển thị trên giao diện — nó chỉ dùng "bên trong" để vẽ frame video và phân tích ảnh.

---

## 5. CameraPage — Chụp ảnh + quét mã + gửi API

> **File**: `src/pages/CameraPage.tsx` (~1127 dòng)
>
> **Chức năng**: Hiển thị camera → chụp ảnh → quét mã trong ảnh → xác nhận PO → gửi ảnh lên server

### 5.1. Sơ đồ luồng chụp ảnh (FlowStep State Machine)

```
  ┌──────────┐     Bấm nút     ┌──────────┐  Tìm thấy PO   ┌─────────────┐
  │ preview  │────chụp────────→│ scanning │──hợp lệ────────→│ confirm-po  │
  │(camera   │                 │(hiệu ứng │                 │(dialog xác  │
  │ live)    │←──Mã lỗi────── │ laser)   │                 │ nhận gửi)   │
  └──────────┘                 └──────────┘                 └──────┬──────┘
       ↑                                                          │
       │                                                   Bấm "Xác nhận"
       │ Bấm                                                      │
       │ "Chụp lại"                                                ↓
       │                                                    ┌─────────────┐
       │                                                    │  uploading  │
       │                                                    │(gửi ảnh lên │
       │                                                    │ server)     │
       │                                                    └──────┬──────┘
       │                                                           │
       │                                                    API trả kết quả
       │                                                           │
       │                                                           ↓
       │                                                    ┌─────────────┐
       ├──────────── Bấm "Chụp lại" ──────────────────────│   result    │
       │                                                    │(hiển thị ảnh│
       │                                                    │chụp + mẫu) │
       │                                                    └──────┬──────┘
       │                                                           │
       │                                                    Bấm "OK"
       │                                                           │
       │                                                           ↓
       │                                                    ┌─────────────┐
       │                                                    │ confirming  │
       │                                                    │(gọi API xác │
       │                                                    │ nhận)       │
       │                                                    └──────┬──────┘
       │                                                           │
       │                                                     Thành công
       │                                                           │
       │                                                           ↓
       │                                                    ┌─────────────┐
       └────────────────────────────────────────────────────│    done     │
                                                            │(thông báo   │
                                                            │ hoàn tất)   │
                                                            └─────────────┘
```

**7 bước trong luồng** (type `CameraFlowStep`):

| Bước | Tên | Mô tả |
|------|-----|-------|
| 1 | `preview` | Camera live, chờ người dùng bấm chụp |
| 2 | `scanning` | Đã chụp, hiệu ứng laser đang quét mã trên ảnh (~700ms) |
| 3 | `confirm-po` | Dialog hiển thị ảnh chụp + thông tin PO, hỏi "Có gửi không?" |
| 4 | `uploading` | Đang gọi API gửi ảnh lên server (loading spinner) |
| 5 | `result` | Server trả kết quả, hiển thị ảnh chụp + ảnh mẫu đối chiếu |
| 6 | `confirming` | Đang gọi API xác nhận bước hoàn tất (loading spinner) |
| 7 | `done` | Thành công! Hiển thị thông báo: nếu còn bước thì cho phép "Chụp tiếp bước tiếp theo" hoặc "Tạm dừng", nếu đã hết bước thì "Hoàn tất & Về danh sách" |

### 5.2. Props — Dữ liệu đầu vào

```typescript
interface CameraPageProps {
  targetOrder?: PhotoPackingSummary | null
  // ↑ Đơn hàng cụ thể (khi người dùng bấm vào đơn hàng từ danh sách)

  scannedPO?: PhotoPackingSummary | null
  // ↑ PO tìm thấy từ ScanPage (khi quét mã rồi chuyển sang)

  scannedCodeMeta?: { format?: string; codeType?: "barcode" | "qrcode" } | null
  // ↑ Thông tin loại mã đã quét (Barcode hay QR, định dạng nào)

  onBack: () => void
  // ↑ Callback quay về trang danh sách
}
```

**Hai cách vào CameraPage:**
1. Từ **OrderListPage**: Bấm vào đơn hàng cụ thể → `targetOrder` có giá trị
2. Từ **ScanPage**: Quét mã thành công → `scannedPO` + `scannedCodeMeta` có giá trị

### 5.3. Các nhóm state quan trọng

```typescript
// ═══════ NHÓM 1: Camera hardware ═══════
const [stream, setStream] = useState<MediaStream | null>(null)
// ↑ Luồng video từ camera. Khi thay đổi → cập nhật <video>.srcObject

const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
// ↑ Camera trước hay sau. "environment" = sau (mặc định cho quét mã)

// ═══════ NHÓM 2: Ảnh đã chụp ═══════
const [capturedImage, setCapturedImage] = useState<string | null>(null)
// ↑ Base64 string của ảnh vừa chụp (null = chưa chụp, đang ở preview)

// ═══════ NHÓM 3: Điều khiển camera nâng cao ═══════
const [isFlashOn, setIsFlashOn] = useState(false)     // Đèn flash bật/tắt
const [zoom, setZoom] = useState<number>(1)             // Mức zoom (0.5x, 1x, 2x)
const [exposure, setExposure] = useState<number>(0)     // Độ sáng (-2 đến +2)
const [resolution, setResolution] = useState<ResolutionKey>("1080p")  // Độ phân giải

// ═══════ NHÓM 4: Luồng chụp ảnh (Flow) ═══════
const [flowStep, setFlowStep] = useState<CameraFlowStep>("preview")
// ↑ BIẾN QUAN TRỌNG NHẤT: Quyết định giao diện hiển thị gì

const [detectedPO, setDetectedPO] = useState<PhotoPackingSummary | null>(...)
// ↑ Thông tin PO đã phát hiện (từ quét mã hoặc từ props)

const [apiResult, setApiResult] = useState<SubmitPhotoResult | null>(null)
// ↑ Kết quả từ API lần 1 (gửi ảnh)

const [confirmResult, setConfirmResult] = useState<ConfirmStepResult | null>(null)
// ↑ Kết quả từ API lần 2 (xác nhận hoàn tất)
```

### 5.4. Hàm `startCamera()` — Khởi động camera

```typescript
const startCamera = useCallback(async (mode, resKey) => {
  const requestId = ++cameraRequestIdRef.current
  // ↑ Mỗi lần gọi startCamera, tăng requestId lên 1.
  //   Nếu người dùng bấm "Đổi camera" liên tục, chỉ request cuối cùng mới có hiệu lực.
  //   Request cũ sẽ bị bỏ qua khi kiểm tra: requestId !== cameraRequestIdRef.current

  // 1. Dừng stream cũ (nếu có)
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop())
  }

  // 2. Mở stream mới
  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: mode, width: { ideal: resConfig.width }, ... }
  })

  // 3. Kiểm tra race condition (người dùng đã rời trang hoặc đổi camera lần nữa)
  if (!isCameraActiveRef.current || requestId !== cameraRequestIdRef.current) {
    newStream.getTracks().forEach(track => track.stop())  // Hủy stream vừa mở
    return
  }

  // 4. Gán stream mới
  streamRef.current = newStream
  videoRef.current.srcObject = newStream

  // 5. Kiểm tra khả năng phần cứng (flash, zoom, exposure)
  inspectTrackCapabilities(newStream.getVideoTracks()[0])
}, [facingMode, resolution, inspectTrackCapabilities])
```

### 5.5. Hàm `inspectTrackCapabilities()` — Kiểm tra phần cứng camera

```typescript
const inspectTrackCapabilities = useCallback((track: MediaStreamTrack) => {
  const caps = track.getCapabilities()
  // ↑ API trình duyệt trả về object mô tả phần cứng camera hỗ trợ gì:
  // {
  //   torch: true,               ← Có đèn flash
  //   zoom: { min: 1, max: 10 }, ← Hỗ trợ zoom từ 1x đến 10x
  //   exposureCompensation: { min: -2, max: 2 }  ← Điều chỉnh sáng
  // }

  // Kiểm tra Flash
  setHasTorchSupport(Boolean(caps.torch))

  // Kiểm tra Zoom → tính các mức zoom khả dụng (0.5x, 1x, 2x, 5x...)
  if (caps.zoom) {
    setSupportsHardwareZoom(true)
    const levels = []
    if (caps.zoom.min <= 0.6) levels.push(0.5)
    levels.push(1)
    if (caps.zoom.max >= 2) levels.push(2)
    // ...
    setAvailableZoomLevels(levels)
  }
}, [])
```

### 5.6. Hàm `handleCapture()` — Chụp ảnh

```typescript
const handleCapture = () => {
  const video = videoRef.current
  const canvas = canvasRef.current

  // 1. Đặt canvas bằng kích thước video
  canvas.width = video.videoWidth    // ví dụ: 1920
  canvas.height = video.videoHeight  // ví dụ: 1080

  // 2. Áp dụng bộ lọc độ sáng (nếu người dùng đã chỉnh)
  const ctx = canvas.getContext("2d")
  ctx.filter = exposure !== 0 ? `brightness(${1 + exposure * 0.25})` : "none"

  // 3. Vẽ frame video lên canvas (có crop nếu dùng digital zoom)
  if (!supportsHardwareZoom && zoom !== 1) {
    // Digital zoom: cắt phần giữa rồi phóng to
    const sw = video.videoWidth / zoom
    const sh = video.videoHeight / zoom
    const sx = (video.videoWidth - sw) / 2
    const sy = (video.videoHeight - sh) / 2
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  } else {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  }

  // 4. ĐÓNG DẤU THỜI GIAN vào góc dưới bên phải (dd/MM/yyyy HH:mm)
  ctx.filter = "none"
  const timestampText = "02/10/2026 06:37"
  ctx.font = `bold ${fontSize}px "Segoe UI", Roboto, sans-serif`
  // Vẽ nền mờ đen → vẽ chữ trắng lên trên
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)"
  ctx.fillRect(boxX, boxY, boxW, boxH)
  ctx.fillStyle = "#ffffff"
  ctx.fillText(timestampText, boxX + padX, boxY + boxH / 2)

  // 5. Xuất canvas thành ảnh JPEG base64
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
  setCapturedImage(dataUrl)

  // 6. Tiến hành quét mã trên ảnh vừa chụp
  processScannedCode(canvas)
}
```

### 5.7. Hàm `processScannedCode()` — Quét mã trên ảnh chụp

```typescript
const processScannedCode = (canvas: HTMLCanvasElement) => {
  setFlowStep("scanning")      // Chuyển sang bước "đang quét"
  setScanErrorMessage(null)

  // Đợi 700ms để hiển thị hiệu ứng laser quét mã sinh động
  setTimeout(async () => {
    // 1. Quét mã trên canvas (cả Barcode 1D và QR Code 2D)
    const scanResult = await scanBarcodeFromCanvas(canvas)

    if (scanResult?.text?.trim()) {
      // 2. Xử lý theo quy tắc nghiệp vụ
      const processed = processScannedBarcodeResult(scanResult)

      if (!processed.success) {
        // Mã không hợp lệ (QR không có PO 12 số / Barcode không khớp)
        setCapturedImage(null)       // Xóa ảnh vừa chụp
        setFlowStep("preview")       // Quay lại preview để chụp lại
        setScanErrorMessage(processed.errorMessage)
        return
      }

      // 3. Mã hợp lệ → chuyển sang dialog xác nhận
      setDetectedCodeMeta({ format, codeType })
      setDetectedPO(processed.poSummary)
      setFlowStep("confirm-po")
      return
    }

    // 4. Không tìm thấy mã nào → dùng PO đã chọn sẵn (nếu có)
    const fallbackPO = scannedPO || targetOrder || null
    if (fallbackPO) {
      setDetectedPO(fallbackPO)
      setFlowStep("confirm-po")
    } else {
      setCapturedImage(null)
      setFlowStep("preview")
      setScanErrorMessage("Không phát hiện mã trong ảnh. Vui lòng chụp lại.")
    }
  }, 700)
}
```

### 5.8. Luồng gọi API (2 lần)

```typescript
// ═══ API LẦN 1: Gửi ảnh lên server ═══
const handleConfirmPO = async () => {
  setFlowStep("uploading")
  const result = await submitPhoto({
    po: detectedPO.pO,
    stepNumber: nextStep,
    imageBase64: capturedImage,    // Ảnh JPEG base64 (~500KB - 2MB)
    productName: detectedPO.productName,
  })
  setApiResult(result)
  setFlowStep("result")
}

// ═══ API LẦN 2: Xác nhận bước hoàn tất ═══
const handleConfirmResult = async () => {
  setFlowStep("confirming")
  const result = await confirmStep({
    po: detectedPO.pO,
    stepNumber: nextStep,
    totalStep: detectedPO.totalStep,
  })
  if (result.success) {
    setConfirmResult(result)
    setFlowStep("done")           // Hoàn tất! Mở NotifyResultDialog
  } else {
    setApiResult({ success: false, message: result.message })
    setFlowStep("result")         // Quay lại màn kết quả để thử lại
  }
}

// ═══ CHỤP TIẾP BƯỚC TIẾP THEO (NẾU CÒN BƯỚC) ═══
// Khi bấm "Chụp tiếp bước X" trong NotifyResultDialog:
const handleContinueNextStep = () => {
  setDetectedPO({
    ...detectedPO,
    currentStep: nextStep,
    statusId: 1, // Đang chụp
  })
  setCapturedImage(null)
  setFlowStep("preview") // Quay lại camera live để chụp bước mới ngay lập tức
}

```

### 5.9. So sánh ScanPage vs CameraPage

| Tiêu chí | ScanPage | CameraPage |
|---|---|---|
| **Mục đích** | Chỉ quét mã, không chụp ảnh | Chụp ảnh + quét mã + gửi API |
| **Cách quét** | Quét liên tục real-time (setInterval 200ms) | Quét 1 lần trên ảnh đã chụp |
| **Khi nào quét** | Tự động, từ lúc mở camera | Khi người dùng bấm nút chụp |
| **Kết quả** | Gọi `onPODetected()` → chuyển sang CameraPage | Hiển thị dialog xác nhận → gửi API |
| **Điều khiển camera** | Đơn giản (chỉ mở camera sau) | Đầy đủ (flash, zoom, exposure, resolution, đổi camera) |
| **Dòng code** | ~310 dòng | ~1127 dòng |

---

## 6. Các service hỗ trợ

### 6.1. `barcodeScanner.ts` — Engine quét mã 3 lớp

```
┌─────────────────────────────────────────────────────┐
│ scanBarcodeFromCanvas(canvas)                       │
│                                                     │
│  Lớp 1: BarcodeDetector (native trình duyệt)       │
│  ↓ Nếu thất bại                                    │
│  Lớp 2: @zxing/library (JavaScript engine)          │
│  ↓ Nếu thất bại                                    │
│  Lớp 3: jsQR (chỉ cho QR Code, fallback cuối cùng) │
│                                                     │
│  → Trả về: { text, format, codeType } hoặc null    │
└─────────────────────────────────────────────────────┘
```

Hệ thống tự động quét nhận diện đồng thời cả **Barcode 1D** và **QR Code 2D** trên cùng một khung hình hoặc ảnh chụp.

### 6.2. `poLookup.ts` — Xử lý mã + kiểm tra hợp lệ

Hàm `processScannedBarcodeResult()` là trung tâm xử lý nghiệp vụ:

```
Đầu vào: { text: "101008296575;H0090924;LOT01;50", codeType: "qrcode" }

Bước 1: Kiểm tra codeType === "qrcode"? → Có
Bước 2: Tách theo ";" → ["101008296575", "H0090924", "LOT01", "50"]
Bước 3: Lấy parts[0] = "101008296575"
Bước 4: Kiểm tra regex /^\d{12}$/ → "101008296575" có 12 chữ số → ✅ HỢP LỆ
Bước 5: Tra cứu PO "101008296575" trong database
Bước 6: Trả về { success: true, poSummary: {...} }
```

**Trường hợp lỗi:**
```
Đầu vào: { text: "8715;PKG-8810-EL;1", codeType: "qrcode" }

Bước 3: parts[0] = "8715"
Bước 4: /^\d{12}$/.test("8715") → false (chỉ có 4 ký tự, không phải 12)
→ Trả về { success: false, errorMessage: "PO phải là chuỗi 12 ký tự số" }
```

---

## 7. Bảng thuật ngữ

| Thuật ngữ | Ý nghĩa |
|---|---|
| **MediaStream** | Luồng dữ liệu video/audio liên tục từ camera hoặc microphone |
| **MediaStreamTrack** | Một "rãnh" bên trong MediaStream (có thể là video track hoặc audio track) |
| **Canvas** | Phần tử HTML dùng để vẽ đồ họa 2D. Trong dự án này, dùng làm "bảng chụp" ẩn |
| **Base64** | Cách mã hóa dữ liệu nhị phân (ảnh) thành chuỗi ký tự để gửi qua JSON |
| **Barcode 1D** | Mã vạch sọc dọc (Code 128, EAN-13...) — các sọc đen trắng xếp hàng ngang |
| **QR Code 2D** | Mã vuông với các chấm đen trắng — chứa nhiều thông tin hơn Barcode 1D |
| **PO** | Purchase Order (Đơn đặt hàng) — mã định danh đơn hàng trong hệ thống |
| **Torch** | Đèn LED (flash) trên camera điện thoại |
| **facingMode** | Hướng camera: `"environment"` = camera sau, `"user"` = camera trước (selfie) |
| **Capabilities** | Khả năng phần cứng mà camera hỗ trợ (zoom, flash, exposure...) |
| **Cooldown** | Khoảng thời gian chờ sau khi lỗi, tránh lặp lại cùng lỗi liên tục |
| **Race condition** | Tình huống 2 tác vụ bất đồng bộ "chạy đua" gây xung đột (ví dụ: gọi startCamera 2 lần liên tiếp) |
| **Closure** | Hàm JavaScript "nhớ" biến từ phạm vi bên ngoài tại thời điểm nó được tạo |

---

## 8. Bài tập thực hành gợi ý

### Mức cơ bản

1. **Hiển thị camera đơn giản**: Tạo một component React chỉ mở camera và hiển thị video lên màn hình. Không cần quét mã.
2. **Chụp ảnh**: Thêm nút "Chụp". Khi bấm, lưu frame hiện tại thành ảnh và hiển thị bên dưới video.
3. **Thêm timestamp**: Sau khi chụp, vẽ thêm ngày giờ vào góc ảnh bằng Canvas API.

### Mức trung bình

4. **Tích hợp jsQR**: Cài `npm install jsqr` và thử quét QR Code từ ảnh chụp (không cần real-time).
5. **Quét real-time**: Dùng `setInterval` để quét liên tục từ video stream, hiển thị kết quả khi phát hiện QR.
6. **Đổi camera trước/sau**: Thêm nút đổi `facingMode` giữa `"environment"` và `"user"`.

### Mức nâng cao

7. **Zoom và Flash**: Dùng `track.getCapabilities()` và `track.applyConstraints()` để điều khiển zoom và đèn flash.
8. **State Machine**: Tạo luồng chụp ảnh 3 bước (preview → captured → uploaded) dùng `useState` với union type.
9. **Xử lý race condition**: Viết hàm `startCamera()` an toàn với `requestId` để tránh xung đột khi đổi camera liên tục.
