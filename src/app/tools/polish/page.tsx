'use client';

import { useState } from 'react';
import { Wand2, Copy, Check, Sparkles, Loader2, FileText } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

export default function PolishPage() {
  const [text, setText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [polishedText, setPolishedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePolish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Vui lòng nhập đoạn văn bản cần trau chuốt!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tools/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, instructions }),
      });
      const data = await res.json();
      if (res.ok) {
        setPolishedText(data.polishedText);
      } else {
        alert(data.error || 'Lỗi khi trau chuốt văn bản.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!polishedText) return;
    navigator.clipboard.writeText(polishedText);
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
            Trau chuốt văn bản (Polish)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Sửa lỗi chính tả, tối ưu hóa câu từ, làm cho đoạn văn mượt mà và tự nhiên hơn mà không đổi giọng văn gốc.
          </p>
        </div>

        {/* Tools Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.0rem' }}>
          {/* Input Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Đoạn văn bản gốc</h2>
            <textarea
              className="textarea"
              placeholder="Nhập hoặc dán đoạn văn bản cần trau chuốt lỗi ngữ pháp, chính tả..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: '260px', fontSize: '0.925rem', lineHeight: 1.6 }}
            />

            <div>
              <label className="label">Yêu cầu đặc biệt (Không bắt buộc)</label>
              <input
                type="text"
                className="input"
                placeholder="Ví dụ: chú ý lỗi lặp từ, dùng nhiều từ hán việt trang trọng hơn..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <button
              onClick={handlePolish}
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={18} /> Đang trau chuốt...
                </>
              ) : (
                <>
                  <Wand2 size={18} /> AI Trau chuốt văn bản
                </>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent-light)' }}>Đoạn văn đã trau chuốt</h2>
                {polishedText && (
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

              {polishedText ? (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.925rem',
                    lineHeight: '1.7',
                    minHeight: '260px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {polishedText}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '280px',
                    color: 'var(--color-text-muted)',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Sparkles size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                  <span style={{ fontSize: '0.875rem' }}>Nhập đoạn văn bản bên trái và nhấn AI Trau chuốt</span>
                </div>
              )}
            </div>

            {polishedText && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                <FileText size={12} />
                Số từ: {polishedText.trim().split(/\s+/).filter(Boolean).length} từ
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
