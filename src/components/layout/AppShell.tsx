'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useSidebarStore, useThemeStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore();
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setHasGeminiKey(data.hasGeminiKey);
        }
      } catch (err) {
        console.error('Failed to check API Key configuration:', err);
      }
    };
    checkApiKey();
  }, [pathname]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className={`main-content ${!isOpen ? 'expanded' : ''}`}>
        {hasGeminiKey === false && pathname !== '/settings' && (
          <div
            className="alert-banner animate-fade-in"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-error)',
              fontSize: '0.8125rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ <strong>Cảnh báo hệ thống:</strong> Google Gemini API Key chưa được thiết lập. Vui lòng thêm key để kích hoạt các tính năng tạo nội dung bằng AI.
            </span>
            <Link
              href="/settings"
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
              }}
            >
              Cấu hình ngay
            </Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
