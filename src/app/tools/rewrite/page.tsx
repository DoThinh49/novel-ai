'use client';

import { useState } from 'react';
import { RefreshCw, Copy, Check, Sparkles, Loader2, FileText } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { WRITING_STYLES } from '@/types';

export default function RewritePage() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('Nhẹ nhàng & Hài hước');
  const [instructions, setInstructions] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Vui lòng nhập đoạn văn bản cần viết lại!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tools/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style, instructions }),
      });
      const data = await res.json();
      if (res.ok) {
        setRewrittenText(data.rewrittenText);
      } else {
        alert(data.error || 'Lỗi khi viết lại văn bản.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="page-container animate-fade-in" style={{ maxWidth: 1080 }}>
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
            Viết lại văn bản (Rewrite)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Sử dụng Gemini AI để viết lại đoạn văn theo phong cách yêu cầu mà vẫn giữ nguyên ý nghĩa gốc.
          </p>
        </div>

        {/* Tools Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.0rem' }}>
          {/* Input Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Đoạn văn bản gốc</h2>
            <textarea
              className="textarea"
              placeholder="Nhập hoặc dán đoạn văn bản cần viết lại vào đây (tối thiểu 10 từ)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: '220px', fontSize: '0.925rem', lineHeight: 1.6 }}
            />

            <div>
              <label className="label">Chọn phong cách viết mới</label>
              <select className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
                {WRITING_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Yêu cầu cụ thể (Không bắt buộc)</label>
              <input
                type="text"
                className="input"
                placeholder="Ví dụ: mô tả hành động kịch tính hơn, viết lại hài hước hơn..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <button
              onClick={handleRewrite}
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={18} /> Đang viết lại...
                </>
              ) : (
                <>
                  <RefreshCw size={18} /> AI Viết lại văn bản
                </>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent-light)' }}>Kết quả viết lại</h2>
                {rewrittenText && (
                  <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                    {copied ? (
                      <>
                        <Check size={14} /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Sao chép
                      </>
                    )}
                  </button>
                )}
              </div>

              {rewrittenText ? (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.925rem',
                    lineHeight: '1.7',
                    minHeight: '220px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {rewrittenText}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '240px',
                    color: 'var(--color-text-muted)',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Sparkles size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                  <span style={{ fontSize: '0.875rem' }}>Nhập thông tin bên trái và nhấn AI Viết lại</span>
                </div>
              )}
            </div>

            {rewrittenText && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                <FileText size={12} />
                Số từ: {rewrittenText.trim().split(/\s+/).filter(Boolean).length} từ
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
