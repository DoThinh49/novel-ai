'use client';

import { useState } from 'react';
import {
  PenTool,
  Sparkles,
  RefreshCw,
  Wand2,
  Copy,
  Check,
  Download,
  Loader2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { WRITING_STYLES } from '@/types';

export default function FreeWritePage() {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper Panel states
  const [selectedText, setSelectedText] = useState('');
  const [helperTool, setHelperTool] = useState<'rewrite' | 'polish'>('rewrite');
  const [helperStyle, setHelperStyle] = useState('Lãng mạn & Trữ tình');
  const [helperInstructions, setHelperInstructions] = useState('');
  const [helperResult, setHelperResult] = useState('');
  const [helperLoading, setHelperLoading] = useState(false);

  // Action: Export to TXT
  const downloadTXT = () => {
    if (!content.trim()) return;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'NovelAI_SangTacTuDo.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper AI Actions
  const runHelperAI = async () => {
    if (!selectedText.trim()) {
      alert('Vui lòng điền đoạn văn bản cần xử lý ở khung phụ!');
      return;
    }

    setHelperLoading(true);
    setHelperResult('');
    try {
      const endpoint = helperTool === 'rewrite' ? '/api/tools/rewrite' : '/api/tools/polish';
      const body =
        helperTool === 'rewrite'
          ? { text: selectedText, style: helperStyle, instructions: helperInstructions }
          : { text: selectedText, instructions: helperInstructions };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setHelperResult(helperTool === 'rewrite' ? data.rewrittenText : data.polishedText);
      } else {
        alert(data.error || 'AI xử lý thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng.');
    } finally {
      setHelperLoading(false);
    }
  };

  const applyHelperResult = () => {
    if (!helperResult) return;
    // Replace selectedText in content with helperResult
    if (content.includes(selectedText)) {
      setContent(content.replace(selectedText, helperResult));
    } else {
      // Fallback: append to the end of editor
      setContent(content + '\n\n' + helperResult);
    }
    setSelectedText('');
    setHelperResult('');
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* ================= CENTRAL WRITER WORKSPACE ================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-primary)' }}>
          {/* Header Bar */}
          <div
            style={{
              padding: '0.75rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PenTool size={18} style={{ color: 'var(--color-accent-light)' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Sáng tác tự do (Standalone Free Write)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} /> : <Copy size={14} />} Sao chép
              </button>
              <button onClick={downloadTXT} className="btn btn-secondary btn-sm" disabled={!content.trim()}>
                <Download size={14} /> Tải về (.txt)
              </button>
            </div>
          </div>

          {/* Text Editor Box */}
          <div style={{ flex: 1, padding: '1.5rem' }}>
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                resize: 'none',
                outline: 'none',
                fontSize: '1rem',
                lineHeight: '1.8',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-text-primary)',
                padding: 0,
              }}
              placeholder="Bắt đầu gõ ý tưởng sáng tác tự do của bạn ở đây... 
Mẹo: Bạn có thể sao chép một đoạn văn bản bên dưới và dán vào thanh trợ lý AI bên phải để Viết lại hoặc Trau chuốt câu từ."
            />
          </div>

          {/* Word Count Footer */}
          <div
            style={{
              padding: '0.5rem 1.5rem',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-sidebar)',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div>Số từ: {content.trim().split(/\s+/).filter(Boolean).length} từ</div>
            <div>Chế độ viết tự do không lưu trữ Database</div>
          </div>
        </div>

        {/* ================= RIGHT TOOLBAR PANEL ================= */}
        <div
          style={{
            width: '320px',
            borderLeft: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-sidebar)',
            flexShrink: 0,
          }}
        >
          {/* Tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
            <button
              onClick={() => {
                setHelperTool('rewrite');
                setHelperResult('');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '0.8125rem',
                fontWeight: helperTool === 'rewrite' ? 600 : 400,
                color: helperTool === 'rewrite' ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                backgroundColor: helperTool === 'rewrite' ? 'var(--color-bg-primary)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Viết lại
            </button>
            <button
              onClick={() => {
                setHelperTool('polish');
                setHelperResult('');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '0.8125rem',
                fontWeight: helperTool === 'polish' ? 600 : 400,
                color: helperTool === 'polish' ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                backgroundColor: helperTool === 'polish' ? 'var(--color-bg-primary)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Wand2 size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Trau chuốt
            </button>
          </div>

          {/* Helper panel content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label" style={{ fontSize: '0.75rem' }}>Đoạn văn cần xử lý</label>
              <textarea
                className="textarea"
                placeholder="Dán đoạn văn bạn muốn thay thế hoặc tinh chỉnh..."
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                style={{ minHeight: '100px', fontSize: '0.75rem', padding: '0.5rem' }}
              />
            </div>

            {helperTool === 'rewrite' && (
              <div>
                <label className="label" style={{ fontSize: '0.75rem' }}>Chọn phong cách viết mới</label>
                <select
                  className="select"
                  value={helperStyle}
                  onChange={(e) => setHelperStyle(e.target.value)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', height: 'auto' }}
                >
                  {WRITING_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label" style={{ fontSize: '0.75rem' }}>Yêu cầu phụ đối với AI</label>
              <input
                type="text"
                className="input"
                placeholder="Ví dụ: mô tả chi tiết hơn..."
                value={helperInstructions}
                onChange={(e) => setHelperInstructions(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              />
            </div>

            <button onClick={runHelperAI} className="btn btn-primary btn-sm" disabled={helperLoading}>
              {helperLoading ? (
                <>
                  <Loader2 className="spinner" size={12} /> Đang xử lý...
                </>
              ) : (
                <>
                  <Sparkles size={12} /> Gửi yêu cầu trợ lý AI
                </>
              )}
            </button>

            {/* Helper Result Area */}
            {helperResult && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="label" style={{ fontSize: '0.75rem', color: 'var(--color-accent-light)' }}>AI Gợi ý kết quả:</label>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.75rem',
                    lineHeight: '1.6',
                    maxHeight: '140px',
                    overflowY: 'auto',
                  }}
                >
                  {helperResult}
                </div>
                <button onClick={applyHelperResult} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Áp dụng / Thay thế vào bài viết
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
