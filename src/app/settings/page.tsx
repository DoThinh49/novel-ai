'use client';

import { useState, useEffect } from 'react';
import {
  Key,
  Database,
  Loader2,
  Save,
  Info,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [keyMask, setKeyMask] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok) {
        setHasKey(data.hasGeminiKey);
        setKeyMask(data.geminiKeyMask);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() && !confirm('Bạn để trống API Key. Hệ thống sẽ quay về sử dụng biến môi trường GEMINI_API_KEY (nếu có). Tiếp tục?')) {
      return;
    }

    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: apiKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHasKey(data.hasGeminiKey);
        setKeyMask(data.geminiKeyMask);
        setApiKey('');
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="page-container animate-fade-in" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff, var(--color-text-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.25rem',
            }}
          >
            Cấu hình hệ thống
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Quản lý khóa kết nối AI và cấu hình hoạt động của ứng dụng.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="spinner spinner-lg" style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* API Key Configuration Card */}
            <div className="card" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                <Key size={18} style={{ color: 'var(--color-accent-light)' }} /> Google Gemini API Key
              </h2>

              <form onSubmit={handleSaveSettings}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="label" style={{ marginBottom: 0 }}>
                      Khóa API Key của bạn
                    </label>
                    {hasKey ? (
                      <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                        Hoạt động: {keyMask}
                      </span>
                    ) : (
                      <span className="badge badge-error" style={{ fontSize: '0.6875rem' }}>
                        Chưa thiết lập (Sử dụng ENV mặc định)
                      </span>
                    )}
                  </div>

                  <input
                    type="password"
                    className="input"
                    placeholder="Nhập khóa API mới (AIzaSy...)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    <Info size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                    Khóa API Key này sẽ được mã hóa và lưu trực tiếp trong SQLite database cục bộ của bạn, có mức ưu tiên cao hơn biến môi trường `.env`.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                  {saveStatus === 'success' && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)' }}>
                      ✓ Lưu cài đặt thành công!
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-error)' }}>
                      ⚠ Lỗi khi lưu cài đặt.
                    </span>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="spinner" size={16} /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Lưu thiết lập
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Database & Technical Info Card */}
            <div className="card" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                <Database size={18} style={{ color: 'var(--color-accent-light)' }} /> Thông tin kỹ thuật hệ thống
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Hệ quản trị Cơ sở dữ liệu:</span>
                  <span style={{ fontWeight: 600 }}>SQLite (qua Prisma ORM)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Mô hình AI mặc định:</span>
                  <span style={{ fontWeight: 600 }}>gemini-2.5-flash (200k tokens input, 8k tokens output)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Môi trường triển khai:</span>
                  <span style={{ fontWeight: 600 }}>Localhost Development Mode</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Trọng tâm đồ án:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent-light)' }}>Xây dựng nền tảng sáng tác văn bản tự động và ngữ cảnh sâu</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
