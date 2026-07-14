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
        {children}
      </main>
    </div>
  );
}
