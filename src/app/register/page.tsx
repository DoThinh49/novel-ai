"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Sparkles, BookOpen, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đã xảy ra lỗi đăng ký.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-100 font-sans" style={{ minHeight: "100vh" }}>
      {/* Nền phát sáng mờ phía sau Card */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

      {/* Card Đăng ký căn giữa */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-10 backdrop-blur-xl shadow-2xl z-10" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Logo */}
        <div className="flex flex-col items-center justify-center text-center" style={{ gap: '0.75rem' }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-lg shadow-purple-500/20">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="block text-2xl font-bold tracking-tight text-white bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              NovelAI Studio
            </span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Sáng tác bằng AI
            </span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 animate-ping" />
            <span className="leading-relaxed">Đăng ký thành công! Đang chuyển hướng...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Name Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Họ và tên
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border border-slate-800 bg-slate-950/60 pr-4 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                  style={{ height: '50px', padding: '12px 16px 12px 48px' }}
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Địa chỉ Email
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-slate-800 bg-slate-950/60 pr-4 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                  style={{ height: '50px', padding: '12px 16px 12px 48px' }}
                  placeholder="ten@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-slate-800 bg-slate-950/60 pr-4 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                  style={{ height: '50px', padding: '12px 16px 12px 48px' }}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Xác nhận mật khẩu
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-slate-800 bg-slate-950/60 pr-4 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                  style={{ height: '50px', padding: '12px 16px 12px 48px' }}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-all cursor-pointer"
            style={{ height: '50px', marginTop: '1.25rem' }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Tạo tài khoản</span>
                <Sparkles className="h-4 w-4 text-purple-200" />
              </>
            )}
          </button>
        </form>

        {/* Foot */}
        <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800/60">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
