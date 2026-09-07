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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12 select-none" style={{ minHeight: "100vh" }}>
      {/* 1. Full-screen Anime Fantasy Background Image */}
      <img
        src="/bg-anime.jpg"
        alt="Anime Fantasy Background"
        className="fixed inset-0 h-full w-full object-cover object-center z-0 transition-transform duration-1000 scale-105"
      />

      {/* 2. Soft Dark Vignette & Glass Blur Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/80 backdrop-blur-[6px] pointer-events-none" />

      {/* 3. Glowing Ambient Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none z-0" />

      {/* 4. Translucent Glassmorphism Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900/65 p-8 md:p-10 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.6)] animate-fade-in"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
      >
        
        {/* Title Screen Logo */}
        <div className="flex flex-col items-center justify-center text-center" style={{ gap: '0.75rem' }}>
          <Link href="/" className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/25 transition-transform duration-300 hover:scale-105">
            <BookOpen className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-6" />
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="block text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200" style={{ fontFamily: "var(--font-heading)" }}>
              NovelAI Studio
            </span>
            <span className="block text-[11px] text-emerald-300/80 uppercase tracking-widest font-semibold">
              Sáng tác bằng AI
            </span>
          </div>
        </div>

        {/* Tab Selector for Login / Register */}
        <div className="flex rounded-xl p-1 bg-slate-950/70 border border-emerald-800/40">
          <Link href="/login" className="flex-1 text-center py-2.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all">
            Đăng nhập
          </Link>
          <div className="flex-1 text-center py-2.5 text-xs font-semibold rounded-lg bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow-sm">
            Đăng ký
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-4 text-xs text-red-200 flex items-center gap-3 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-green-500/20 border border-green-500/40 p-4 text-xs text-green-200 flex items-center gap-3 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-green-400 shrink-0 animate-ping" />
            <span className="leading-relaxed">Đăng ký thành công! Đang chuyển hướng sang Đăng nhập...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Name Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="block text-xs font-bold text-emerald-200/80 uppercase tracking-wider">
                Họ và tên
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <User className="h-5 w-5 text-emerald-400/60" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-emerald-800/60 bg-slate-950/70 pr-4 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-sm transition-all"
                  style={{ height: '46px', padding: '10px 16px 10px 48px' }}
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="block text-xs font-bold text-emerald-200/80 uppercase tracking-wider">
                Địa chỉ Email
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <Mail className="h-5 w-5 text-emerald-400/60" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-emerald-800/60 bg-slate-950/70 pr-4 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-sm transition-all"
                  style={{ height: '46px', padding: '10px 16px 10px 48px' }}
                  placeholder="ten@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="block text-xs font-bold text-emerald-200/80 uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <Lock className="h-5 w-5 text-emerald-400/60" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-emerald-800/60 bg-slate-950/70 pr-4 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-sm transition-all"
                  style={{ height: '46px', padding: '10px 16px 10px 48px' }}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="block text-xs font-bold text-emerald-200/80 uppercase tracking-wider">
                Xác nhận mật khẩu
              </label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ height: '100%', left: '16px' }}>
                  <Lock className="h-5 w-5 text-emerald-400/60" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-emerald-800/60 bg-slate-950/70 pr-4 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 text-sm transition-all"
                  style={{ height: '46px', padding: '10px 16px 10px 48px' }}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 transition-all cursor-pointer"
            style={{ height: '48px', marginTop: '0.75rem' }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <>
                <span>Tạo tài khoản</span>
                <Sparkles className="h-4 w-4 text-emerald-200" />
              </>
            )}
          </button>
        </form>

        {/* Foot */}
        <div className="text-center text-xs text-slate-300/80 pt-3 border-t border-slate-700/50">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-emerald-300 hover:text-emerald-200 transition-colors underline underline-offset-4">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
