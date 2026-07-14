'use client';

import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import {
  Plus,
  BookOpen,
  Sparkles,
  PenTool,
  RefreshCw,
  Wand2,
  ArrowRight,
  Zap,
  Brain,
  FileText,
} from 'lucide-react';

const quickActions = [
  {
    href: '/create',
    icon: Plus,
    title: 'Tạo Truyện Mới',
    description: 'Bắt đầu sáng tác tiểu thuyết mới với AI hỗ trợ qua 4 bước',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    primary: true,
  },
  {
    href: '/tools/freewrite',
    icon: PenTool,
    title: 'Sáng tác Tự do',
    description: 'Viết nội dung tự do không theo quy trình',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  },
  {
    href: '/tools/rewrite',
    icon: RefreshCw,
    title: 'Viết lại Văn bản',
    description: 'AI viết lại đoạn văn với phong cách mới',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
  {
    href: '/tools/polish',
    icon: Wand2,
    title: 'Trau chuốt Văn bản',
    description: 'Cải thiện ngữ pháp và câu từ tự động',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
  },
];

const features = [
  {
    icon: Brain,
    title: 'Ngữ cảnh Thông minh',
    description: 'Gemini AI nhớ toàn bộ diễn biến truyện, đảm bảo tính nhất quán qua mỗi chương.',
  },
  {
    icon: Zap,
    title: 'Sáng tác Tự động',
    description: 'Viết liên tục từng chương với hệ thống Bắt đầu / Tạm dừng / Viết tiếp.',
  },
  {
    icon: FileText,
    title: 'Xuất Đa định dạng',
    description: 'Export tác phẩm ra TXT, DOCX hoặc PDF chỉ với một cú click.',
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="page-container animate-fade-in">
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 0 2rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              fontSize: '0.8125rem',
              color: 'var(--color-accent-light)',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={14} />
            Powered by Google Gemini AI
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent-light) 50%, #e879f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
              margin: '0 auto 2rem',
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
            }}
          >
            <Plus size={20} />
            Bắt đầu Sáng tác
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Quick Actions Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="card"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Gradient accent top bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: action.gradient,
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    paddingTop: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: action.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} color="white" />
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {action.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Features Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '2rem',
              color: 'var(--color-text-primary)',
            }}
          >
            <BookOpen
              size={24}
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: '0.5rem',
                color: 'var(--color-accent-light)',
              }}
            />
            Tại sao chọn NovelAI Studio?
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card"
                  style={{ textAlign: 'center', padding: '2rem 1.5rem' }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'rgba(124, 58, 237, 0.1)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <Icon size={24} style={{ color: 'var(--color-accent-light)' }} />
                  </div>
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: '1.0625rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            padding: '2rem 0',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
          }}
        >
          NovelAI Studio — Đồ án Chuyên ngành © 2026
        </div>
      </div>
    </AppShell>
  );
}
