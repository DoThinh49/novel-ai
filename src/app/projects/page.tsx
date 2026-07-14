'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  Plus,
  Trash2,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import type { Project } from '@/types';

export default function ProjectsDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dự án truyện này? Hành động này sẽ xóa toàn bộ chương và nhân vật liên quan.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      } else {
        alert('Không thể xóa dự án.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AppShell>
      <div className="page-container animate-fade-in" style={{ maxWidth: 1080 }}>
        {/* Header Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
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
              Dự án sáng tác của tôi
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Danh sách các tiểu thuyết đang sáng tác và lưu trữ.
            </p>
          </div>

          <Link href="/create" className="btn btn-primary">
            <Plus size={16} /> Tạo tác phẩm mới
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ display: 'flex', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="spinner spinner-lg" style={{ color: 'var(--color-accent)' }} />
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent-light)',
              }}
            >
              <FolderOpen size={32} />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Chưa có tác phẩm nào</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Bạn chưa tạo bất cứ tác phẩm tiểu thuyết nào. Hãy khởi tạo một câu chuyện mới để bắt đầu sáng tạo cùng Gemini AI.
            </p>
            <Link href="/create" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={16} /> Bắt đầu ngay
            </Link>
          </div>
        ) : (
          /* Projects Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {projects.map((project) => {
              const projData = project as unknown as { _count?: { chapters?: number; characters?: number } };
              const chapterCount = projData._count?.chapters || 0;
              const characterCount = projData._count?.characters || 0;

              return (
                <div
                  key={project.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--color-bg-card)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Status Indicator Top Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor:
                        project.status === 'completed'
                          ? 'var(--color-success)'
                          : project.status === 'in_progress'
                            ? 'var(--color-accent)'
                            : 'var(--color-border)',
                    }}
                  />

                  {/* Body Content */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>
                        {project.genre}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color:
                            project.status === 'completed'
                              ? 'var(--color-success)'
                              : project.status === 'in_progress'
                                ? 'var(--color-accent-light)'
                                : 'var(--color-text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        {project.status === 'completed'
                          ? 'Hoàn thành'
                          : project.status === 'in_progress'
                            ? 'Đang viết'
                            : 'Bản thảo'}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {project.title || 'Dự án không tên'}
                    </h3>

                    {/* Metadata counters */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '1rem',
                      }}
                    >
                      <span>
                        📚 <strong>{chapterCount}</strong> Chương
                      </span>
                      <span>
                        👥 <strong>{characterCount}</strong> Nhân vật
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '1rem',
                      marginTop: '1rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.6875rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <Calendar size={12} /> {formatDate(project.updatedAt)}
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => deleteProject(project.id)}
                        disabled={deletingId === project.id}
                        style={{ color: 'var(--color-error)', padding: '0.5rem' }}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="spinner" size={14} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>

                      <Link href={`/projects/${project.id}`} className="btn btn-secondary btn-sm">
                        Mở <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
