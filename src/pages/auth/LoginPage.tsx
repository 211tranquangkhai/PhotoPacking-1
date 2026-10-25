import { useState } from "react"
import { Camera, LogIn, Loader2, AlertCircle, User as UserIcon, ShieldCheck, Factory } from "lucide-react"
import type { User } from "@/types"
import { fetchUserById } from "@/services/userService"

interface LoginPageProps {
  onLoginSuccess: (user: User) => void
}

// Danh sách tài khoản demo tương ứng với UserList trong Backend Data.cs
const DEMO_USERS = [
  { id: 14081, name: "Trần Quang Khải", role: "User", group: "OSA" },
  { id: 14082, name: "Nguyễn Xuân Thu", role: "User", group: "OSA" },
  { id: 1221, name: "Lý Thị Huyền Châu", role: "Leader", group: "OSA" },
  { id: 1241, name: "Lê Hoàng Thuận", role: "SubLeader", group: "OSA" },
  { id: 30090, name: "Vương Thuý Kiều", role: "User", group: "LXA" },
  { id: 30123, name: "Mã Giám Sinh", role: "SubLeader", group: "LXA" },
  { id: 1840, name: "Đỗ Hải", role: "Leader", group: "LXA" },
]

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [userIdInput, setUserIdInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (idToLogin?: number) => {
    const targetId = idToLogin !== undefined ? idToLogin : Number(userIdInput.trim())

    if (!targetId || isNaN(targetId) || targetId <= 0) {
      setErrorMessage("Vui lòng nhập mã UserId hợp lệ (số nguyên dương).")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const user = await fetchUserById(targetId)
      onLoginSuccess(user)
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          `Không tìm thấy người dùng với mã UserId ${targetId}. Vui lòng thử lại.`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-400 shadow-lg shadow-blue-500/30 ring-1 ring-white/20 mb-2">
            <Camera className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Photo Packing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Hệ thống Quản lý và Kiểm tra Ảnh Quy chuẩn Đóng gói Xuất xưởng
          </p>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-slate-900/75 border border-slate-700/60 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/50 space-y-5">
          <div className="space-y-1 text-left">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">Đăng nhập bằng User ID</h2>
            <p className="text-xs text-slate-400">
              Nhập mã định danh nhân viên để tiếp tục vào hệ thống
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="user-id-input"
                className="text-xs font-semibold text-slate-300 block"
              >
                Mã người dùng (User ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="user-id-input"
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  placeholder="Ví dụ: 14081, 1221, 30090..."
                  value={userIdInput}
                  onChange={(e) => {
                    setUserIdInput(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading || !userIdInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-800"></div>
            <span className="shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Hoặc chọn tài khoản test nhanh
            </span>
            <div className="grow border-t border-slate-800"></div>
          </div>

          {/* Quick Demo Accounts */}
          <div className="space-y-3">
            {/* Phân xưởng OSA */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                <Factory className="h-3 w-3" />
                <span>Phân xưởng OSA</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_USERS.filter((u) => u.group === "OSA").map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUserIdInput(String(u.id))
                      handleLogin(u.id)
                    }}
                    disabled={isLoading}
                    className="flex flex-col items-start p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 truncate">
                        {u.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                          u.role === "Leader"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : u.role === "SubLeader"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ID: {u.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phân xưởng LXA */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                <Factory className="h-3 w-3" />
                <span>Phân xưởng LXA</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_USERS.filter((u) => u.group === "LXA").map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUserIdInput(String(u.id))
                      handleLogin(u.id)
                    }}
                    disabled={isLoading}
                    className="flex flex-col items-start p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                        {u.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                          u.role === "Leader"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : u.role === "SubLeader"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ID: {u.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Role User → OrderListPage | Leader & SubLeader → Manager Portal</span>
        </div>
      </div>
    </div>
  )
}
