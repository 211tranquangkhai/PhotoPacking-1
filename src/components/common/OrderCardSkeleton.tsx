interface OrderCardSkeletonProps {
  hasAvatars?: boolean
  isRetake?: boolean
}

/**
 * Component Skeleton Card đại diện cho 1 đơn hàng PO trong danh sách đang tải
 * Hiệu ứng shimmer gradient chuyển động mang lại cảm giác mượt mà và trực quan
 */
export function OrderCardSkeleton({
  hasAvatars = false,
  isRetake = false,
}: OrderCardSkeletonProps) {
  return (
    <div
      className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm"
      aria-hidden="true"
    >
      <div className="p-4 space-y-3">
        {/* Header: Mã Đơn hàng PO + Huy hiệu trạng thái */}
        <div className="flex justify-between items-start">
          <div className="h-5 w-36 bg-slate-200/90 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>

          <div
            className={`h-5 w-20 rounded-full relative overflow-hidden ${
              isRetake ? "bg-red-100" : "bg-slate-200/80"
            }`}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        </div>

        {/* Thông tin chi tiết: Bước chụp + Sản phẩm */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200/90 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
            <div className="h-3.5 w-24 bg-slate-200/80 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200/90 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
            <div className="h-3.5 w-44 bg-slate-200/80 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Card: Quy cách đóng gói/Avatars + Nút hành động */}
      <div className="px-4 py-2.5 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
        {hasAvatars ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              </div>
            </div>
            <div className="h-3.5 w-24 bg-slate-200/80 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          </div>
        ) : (
          <div className="h-3.5 w-28 bg-slate-200/80 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        )}

        <div className="w-9 h-9 rounded-lg bg-slate-200/90 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
      </div>
    </div>
  )
}

interface OrderListSkeletonProps {
  count?: number
  message?: string
}

/**
 * Khung hiển thị danh sách Skeleton hiệu ứng loading trong khi chờ API trả dữ liệu PO
 */
export function OrderListSkeleton({
  count = 4,
  message = "Đang tải dữ liệu danh sách PO từ hệ thống...",
}: OrderListSkeletonProps) {
  return (
    <div className="space-y-3.5" role="status" aria-label="Đang tải danh sách đơn hàng">
      {/* Banner thông báo trạng thái tải dữ liệu */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-high/60 border border-outline-variant/60 rounded-xl text-xs text-secondary shadow-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#1b365d] animate-spin">
            progress_activity
          </span>
          <span className="font-medium text-primary">{message}</span>
        </div>
        <span className="text-[11px] font-semibold text-[#1b365d] bg-white px-2 py-0.5 rounded-full border border-outline-variant/40 shadow-2xs">
          Đang tải
        </span>
      </div>

      {/* Danh sách các card PO giả lập dạng shimmer */}
      {Array.from({ length: count }).map((_, idx) => (
        <OrderCardSkeleton
          key={idx}
          hasAvatars={idx % 2 === 1}
          isRetake={idx === 1}
        />
      ))}
    </div>
  )
}

export default OrderListSkeleton
