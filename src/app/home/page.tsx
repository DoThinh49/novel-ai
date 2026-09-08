'use client';

import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import {
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <AppShell>
      <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 4rem)', justifyContent: 'space-between' }}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 0 3rem',
            margin: 'auto 0',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Biến Ý tưởng thành
            <br />
            Tiểu thuyết Hoàn chỉnh
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Nền tảng sáng tác tiểu thuyết & Light Novel thông minh.
            <br />
            Từ ý tưởng → nhân vật → dàn ý → tác phẩm hoàn chỉnh — chỉ với 4 bước.
          </p>

          <Link
            href="/create"
            className="btn btn-primary btn-lg"
            style={{
              fontSize: '1rem',
              padding: '0.875rem 2.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 4px 20px var(--color-accent-glow)',
            }}
          >
            <Plus size={20} />
            Bắt đầu Sáng tác
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            padding: '1.5rem 0',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            marginTop: 'auto',
          }}
        >
          NovelAI Studio — Đồ án Chuyên ngành © 2026
        </div>
      </div>
    </AppShell>
  );
}
