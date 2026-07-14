'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  PenTool,
  Sparkles,
  Settings,
  FolderOpen,
  Plus,
  RefreshCw,
  Wand2,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  Users,
} from 'lucide-react';
import { useSidebarStore, useThemeStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
  {
    group: 'Sáng tác',
    items: [
      { href: '/create', label: 'Tạo truyện mới', icon: Plus, accent: true },
      { href: '/projects', label: 'Dự án của tôi', icon: FolderOpen },
    ],
  },
  {
    group: 'Công cụ',
    items: [
      { href: '/tools/rewrite', label: 'Viết lại (Rewrite)', icon: RefreshCw },
      { href: '/tools/polish', label: 'Trau chuốt (Polish)', icon: Wand2 },
      { href: '/tools/freewrite', label: 'Sáng tác tự do', icon: PenTool },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { href: '/settings', label: 'Cài đặt', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const { theme, toggleTheme } = useThemeStore();
  const { data: session, status } = useSession();

  // Xây dựng danh sách menu động dựa trên vai trò người dùng
  const visibleNavGroups = [...navItems];
  if (session?.user && (session.user as any).role === 'ADMIN') {
    visibleNavGroups.push({
      group: 'Quản trị',
      items: [
        { href: '/admin/users', label: 'Quản lý thành viên', icon: Users },
      ],
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggle}
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        {/* Logo */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--color-accent-glow)',
              }}
            >
              <BookOpen size={20} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, var(--color-accent-light), #e879f9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NovelAI Studio
              </div>
              <div
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  }}
                >
                  Sáng tác bằng AI
                </div>
              </div>
            </Link>

            <button
              className="btn btn-icon btn-ghost"
              onClick={toggle}
              aria-label="Toggle sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
            {visibleNavGroups.map((group) => (
            <div key={group.group} style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0 0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                {group.group}
              </div>

              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive
                        ? 'var(--color-accent-light)'
                        : 'accent' in item && item.accent
                          ? 'var(--color-accent-light)'
                          : 'var(--color-text-secondary)',
                      backgroundColor: isActive
                        ? 'rgba(124, 58, 237, 0.1)'
                        : 'transparent',
                      borderLeft: isActive
                        ? '3px solid var(--color-accent)'
                        : '3px solid transparent',
                      transition: 'all 0.2s ease',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          'var(--color-bg-hover)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color =
                          'accent' in item && item.accent
                            ? 'var(--color-accent-light)'
                            : 'var(--color-text-secondary)';
                      }
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: User profile and Theme toggle */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {status === 'authenticated' && session?.user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
              }}
            >
              <div style={{ overflow: 'hidden', marginRight: '0.5rem' }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {session.user.name || 'Người dùng'}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {session.user.email}
                </div>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  color: '#f87171',
                  border: '1px solid rgba(248, 113, 113, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Thoát
              </button>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
              }}
            >
              {theme === 'dark' ? 'Giao diện Tối' : 'Giao diện Sáng'}
            </span>
            <button
              className="btn btn-icon btn-ghost"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* AI sparkle decoration */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--color-accent-light)' }} />
          Powered by Google Gemini
        </div>
      </aside>

      {/* Toggle button when sidebar is collapsed */}
      {!isOpen && (
        <button
          className="btn btn-icon btn-ghost"
          onClick={toggle}
          aria-label="Open sidebar"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 50,
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <PanelLeft size={18} />
        </button>
      )}
    </>
  );
}
