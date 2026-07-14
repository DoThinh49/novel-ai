"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Sparkles, BookOpen, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-100 font-sans" style={{ minHeight: "100vh" }}>
      {/* Nền phát sáng mờ phía sau Card */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

      {/* Card Đăng nhập căn giữa */}
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

        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
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
                  placeholder="name@example.com"
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
                  placeholder="••••••••"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-all cursor-pointer"
            style={{ height: '50px', marginTop: '1.25rem' }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Đăng nhập vào Studio</span>
                <Sparkles className="h-4 w-4 text-purple-200" />
              </>
            )}
          </button>
        </form>

        {/* Foot */}
        <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800/60">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </div>
  );
}
