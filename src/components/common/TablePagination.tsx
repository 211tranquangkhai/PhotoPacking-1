import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

export interface TablePaginationProps {
  currentPage: number
  totalItems: number
  pageSize?: number
  onPageChange: (page: number) => void
  itemLabel?: string
  className?: string
  disabled?: boolean
}

export default function TablePagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = "bản ghi",
  className = "",
  disabled = false,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
  const endIndex = Math.min(totalItems, safeCurrentPage * pageSize)

  // Tạo danh sách các số trang hiển thị thông minh (có dấu ...)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []

    if (safeCurrentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages)
    } else if (safeCurrentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/90 bg-slate-50/90 px-4 sm:px-6 py-3 text-xs text-slate-500 select-none ${className}`}
    >
      {/* Thông tin số lượng hiển thị */}
      <div className="flex items-center gap-1.5">
        <span>Hiển thị</span>
        <strong className="font-bold text-slate-800">
          {totalItems === 0 ? 0 : `${startIndex} - ${endIndex}`}
        </strong>
        <span>trong tổng số</span>
        <strong className="font-bold text-slate-800">{totalItems}</strong>
        <span>{itemLabel}</span>
      </div>

      {/* Cụm nút chuyển trang */}
      <div className="flex items-center gap-1">
        {/* Nút về trang đầu */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={disabled || safeCurrentPage <= 1}
          title="Trang đầu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Nút trang trước */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={disabled || safeCurrentPage <= 1}
          title="Trang trước"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Danh sách các số trang */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex h-8 min-w-7 items-center justify-center text-slate-400 font-bold"
                >
                  ...
                </span>
              )
            }

            const pageNum = p as number
            const isActive = pageNum === safeCurrentPage

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={disabled}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs border border-blue-600"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-2xs"
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Nút trang sau */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={disabled || safeCurrentPage >= totalPages}
          title="Trang sau"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Nút đến trang cuối */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || safeCurrentPage >= totalPages}
          title="Trang cuối"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
