'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Pause,
  Save,
  CheckCircle,
  FileText,
  ChevronLeft,
  Users,
  Globe,
  Settings,
  BookOpen,
  Loader2,
  Download,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import type { Project, Chapter } from '@/types';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Project details state
  const [project, setProject] = useState<Project | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterOutline, setChapterOutline] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [editorStatus, setEditorStatus] = useState<'idle' | 'writing' | 'saving' | 'saved' | 'error'>('idle');
  const [autoProgress, setAutoProgress] = useState(false);

  // Computed word count
  const wordCount = chapterContent.trim().split(/\s+/).filter(Boolean).length;

  // Right sidebar toggle
  const [rightSidebar, setRightSidebar] = useState<'characters' | 'world' | 'none'>('characters');

  // Streaming ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // Load a chapter into editor
  const loadChapter = (chapter: Chapter, index: number) => {
    setActiveChapterIndex(index);
    setChapterTitle(chapter.title);
    setChapterOutline(chapter.summary); // Dàn ý chương này lưu trong summary trước khi viết
    setChapterContent(chapter.content);
    setEditorStatus('idle');
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (res.ok && data.project) {
        setProject(data.project);

        // Load first chapter or keep current
        const chaps = data.project.chapters || [];
        if (chaps.length > 0) {
          const idx = activeChapterIndex < chaps.length ? activeChapterIndex : 0;
          loadChapter(chaps[idx], idx);
        }
      } else {
        router.push('/projects');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch project details on mount
  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Save manual edits to chapter
  const saveChapterEdits = async (finalStatus?: 'completed' | 'pending') => {
    if (!project) return;
    const activeChap = project.chapters?.[activeChapterIndex];
    if (!activeChap) return;

    setEditorStatus('saving');
    try {
      const res = await fetch(`/api/projects/${project.id}/chapters`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: activeChap.chapterNumber,
          title: chapterTitle,
          content: chapterContent,
          status: finalStatus || activeChap.status,
        }),
      });

      if (res.ok) {
        setEditorStatus('saved');
        // Update local project state
        const updatedChapters = [...(project.chapters || [])];
        updatedChapters[activeChapterIndex] = {
          ...updatedChapters[activeChapterIndex],
          title: chapterTitle,
          content: chapterContent,
          status: finalStatus || activeChap.status,
        };
        setProject({
          ...project,
          chapters: updatedChapters,
        });

        setTimeout(() => setEditorStatus('idle'), 2000);
      } else {
        setEditorStatus('error');
      }
    } catch (err) {
      console.error(err);
      setEditorStatus('error');
    }
  };

  // AI Stream Chapter Writing
  const startAIWriting = async (targetIndex?: number) => {
    if (!project) return;
    const idx = targetIndex !== undefined ? targetIndex : activeChapterIndex;
    const activeChap = project.chapters?.[idx];
    if (!activeChap) return;

    setEditorStatus('writing');
    setChapterContent(''); // Reset for typewriter stream

    // Setup abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/projects/${project.id}/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: activeChap.chapterNumber,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'AI generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        streamedText += chunk;
        setChapterContent(streamedText);

        // Auto-scroll textarea
        if (editorRef.current) {
          editorRef.current.scrollTop = editorRef.current.scrollHeight;
        }
      }

      // Automatically save completed chapter
      setEditorStatus('saving');
      const saveRes = await fetch(`/api/projects/${project.id}/chapters`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: activeChap.chapterNumber,
          content: streamedText,
          status: 'completed',
        }),
      });

      if (saveRes.ok) {
        const data = await saveRes.json();
        // Update local state
        const updatedChapters = [...(project.chapters || [])];
        updatedChapters[idx] = {
          ...updatedChapters[idx],
          content: streamedText,
          status: 'completed',
          summary: data.chapter.summary, // auto generated summary
        };
        setProject({
          ...project,
          chapters: updatedChapters,
        });
        setEditorStatus('saved');
        setTimeout(() => setEditorStatus('idle'), 2000);

        // Auto-progression logic
        if (autoProgress && idx + 1 < updatedChapters.length) {
          const nextIdx = idx + 1;
          setTimeout(() => {
            loadChapter(updatedChapters[nextIdx], nextIdx);
            startAIWriting(nextIdx);
          }, 3000);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User paused the writing process
        // Save whatever text was streamed so far
        setEditorStatus('saving');
        await fetch(`/api/projects/${project.id}/chapters`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterNumber: activeChap.chapterNumber,
            content: chapterContent,
            status: 'pending',
          }),
        });
        // Update state
        const updatedChapters = [...(project.chapters || [])];
        updatedChapters[idx] = {
          ...updatedChapters[idx],
          content: chapterContent,
          status: 'pending',
        };
        setProject({
          ...project,
          chapters: updatedChapters,
        });
        setEditorStatus('idle');
      } else {
        console.error(err);
        setEditorStatus('error');
        alert(err instanceof Error ? err.message : 'Có lỗi xảy ra trong quá trình AI sáng tác.');
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Pause AI Writing
  const pauseAIWriting = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Update Project Settings
  const updateProjectSettings = async (field: string, value: string | number) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setProject({
          ...project,
          [field]: value,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Chapter to TXT
  const downloadChapter = () => {
    if (!project) return;
    const activeChap = project.chapters?.[activeChapterIndex];
    if (!activeChap) return;

    const fileContent = `--- Tên truyện: ${project.title} ---\n--- Chương ${activeChap.chapterNumber}: ${chapterTitle} ---\n\n${chapterContent}`;
    const element = document.createElement('a');
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.title}_Chuong_${activeChap.chapterNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Export Entire Story to TXT
  const downloadEntireBook = () => {
    if (!project || !project.chapters) return;
    
    let fileContent = `============================================================\n`;
    fileContent += `TÁC PHẨM: ${project.title.toUpperCase()}\n`;
    fileContent += `Thể loại: ${project.genre}\n`;
    fileContent += `Phong cách: ${project.writingStyle}\n`;
    fileContent += `============================================================\n\n`;

    if (project.worldBuilding?.worldDescription) {
      fileContent += `--- BỐI CẢNH THẾ GIỚI ---\n`;
      fileContent += `${project.worldBuilding.worldDescription}\n\n`;
      fileContent += `============================================================\n\n`;
    }

    const sortedChapters = [...project.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
    
    sortedChapters.forEach((chap) => {
      fileContent += `--- CHƯƠNG ${chap.chapterNumber}: ${chap.title || 'Không tên'} ---\n\n`;
      fileContent += `${chap.content || 'Chương này chưa viết nội dung.'}\n\n`;
      fileContent += `------------------------------------------------------------\n\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.title}_ToanBoTacPham.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="spinner spinner-lg" style={{ color: 'var(--color-accent)' }} />
        </div>
      </AppShell>
    );
  }

  if (!project) return null;
  const chapters = project.chapters || [];
  const activeChapter = chapters[activeChapterIndex];

  return (
    <AppShell>
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        {/* ================= LEFT CHAPTERS PANEL ================= */}
        <div
          style={{
            width: '260px',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-sidebar)',
            flexShrink: 0,
          }}
        >
          {/* Header Back Button */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
            <Link
              href="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                textDecoration: 'none',
                color: 'var(--color-text-secondary)',
              }}
            >
              <ChevronLeft size={16} /> Quay lại Dự án
            </Link>
          </div>

          {/* Project Overview */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 700,
                marginBottom: '0.375rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {project.title}
            </h2>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.625rem', padding: '0.125rem 0.35rem' }}>
                {project.genre}
              </span>
              <span className="badge badge-warning" style={{ fontSize: '0.625rem', padding: '0.125rem 0.35rem' }}>
                Mode: {project.contextMode}
              </span>
            </div>
          </div>

          {/* Chapters List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '0 0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              Mục lục ({chapters.length} chương)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {chapters.map((chap, idx) => {
                const isActive = idx === activeChapterIndex;
                return (
                  <button
                    key={chap.id}
                    onClick={() => loadChapter(chap, idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-bg-hover)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Status Dot */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor:
                          chap.status === 'completed'
                            ? 'var(--color-success)'
                            : chap.status === 'writing'
                              ? 'var(--color-accent)'
                              : 'var(--color-border)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        Chương {chap.chapterNumber}: {chap.title || 'Chưa đặt tên'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                        {chap.content ? `${chap.content.length} ký tự` : 'Chưa viết'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Book Button */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={downloadEntireBook}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <FileText size={14} /> Xuất toàn bộ truyện
            </button>
          </div>

          {/* Quick Settings Panel */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              <Settings size={12} /> Cấu hình ngữ cảnh AI
            </div>
            <select
              className="select"
              value={project.contextMode}
              onChange={(e) => updateProjectSettings('contextMode', e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', height: 'auto', marginBottom: '0.5rem' }}
            >
              <option value="summary">Summary Mode (Khuyên dùng)</option>
              <option value="full">Full Mode (Chi tiết nhất)</option>
              <option value="sliding_window">Sliding Window (Gần nhất)</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="autoProgress"
                checked={autoProgress}
                onChange={(e) => setAutoProgress(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="autoProgress" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                Tự động viết chương kế tiếp
              </label>
            </div>
          </div>
        </div>

        {/* ================= CENTRAL WORKSPACE ================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-primary)' }}>
          {activeChapter ? (
            <>
              {/* Workspace Header */}
              <div
                style={{
                  padding: '0.75rem 1.5rem',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent-light)' }}>
                    Chương {activeChapter.chapterNumber}:
                  </span>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="input"
                    placeholder="Nhập tiêu đề chương..."
                    style={{ border: 'none', background: 'transparent', padding: '0.25rem', fontSize: '1rem', fontWeight: 600, maxWidth: '300px' }}
                    onBlur={() => saveChapterEdits()}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {editorStatus === 'saving' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Loader2 className="spinner" size={12} /> Đang lưu...
                    </span>
                  )}
                  {editorStatus === 'saved' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={12} /> Đã lưu
                    </span>
                  )}

                  <button type="button" className="btn btn-secondary btn-sm" onClick={downloadChapter}>
                    <Download size={14} /> Tải (.txt)
                  </button>

                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => saveChapterEdits()}>
                    <Save size={14} /> Lưu
                  </button>

                  {editorStatus === 'writing' ? (
                    <button type="button" className="btn btn-danger btn-sm animate-pulse-glow" onClick={pauseAIWriting}>
                      <Pause size={14} /> Tạm dừng
                    </button>
                  ) : (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => startAIWriting()}>
                      <Play size={14} /> AI Viết tiếp
                    </button>
                  )}
                </div>
              </div>

              {/* Dàn ý / Summary info of Chapter */}
              <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    💡 Dàn ý Chương {activeChapter.chapterNumber} (Nhấn để chỉnh sửa)
                  </summary>
                  <textarea
                    className="textarea"
                    value={chapterOutline}
                    onChange={(e) => setChapterOutline(e.target.value)}
                    style={{ minHeight: '60px', marginTop: '0.5rem', fontSize: '0.8125rem', padding: '0.5rem' }}
                    onBlur={async () => {
                      // Update summary outline in database
                      await fetch(`/api/projects/${project.id}/chapters`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          chapterNumber: activeChapter.chapterNumber,
                          status: activeChapter.status,
                          summary: chapterOutline,
                        }),
                      });
                      // Update local project model
                      const updatedChapters = [...(project.chapters || [])];
                      updatedChapters[activeChapterIndex].summary = chapterOutline;
                      setProject({ ...project, chapters: updatedChapters });
                    }}
                  />
                </details>
              </div>

              {/* Text Editor Box */}
              <div style={{ flex: 1, padding: '1.5rem', position: 'relative' }}>
                {/* Writing state indicator overlay */}
                {editorStatus === 'writing' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2rem',
                      right: '2rem',
                      zIndex: 20,
                    }}
                  >
                    <div className="ai-writing-indicator">
                      <span>Gemini đang viết truyện...</span>
                      <div className="ai-writing-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}

                {chapterContent === '' && editorStatus !== 'writing' ? (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                      gap: '1rem',
                    }}
                  >
                    <BookOpen size={48} />
                    <p style={{ fontSize: '0.875rem' }}>Chương này chưa có nội dung văn bản.</p>
                    <button type="button" className="btn btn-primary" onClick={() => startAIWriting()}>
                      <Sparkles size={16} /> Bắt đầu viết bằng AI
                    </button>
                  </div>
                ) : (
                  <textarea
                    ref={editorRef}
                    className="textarea"
                    value={chapterContent}
                    onChange={(e) => setChapterContent(e.target.value)}
                    disabled={editorStatus === 'writing'}
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
                    placeholder="Nội dung chương truyện được viết tại đây..."
                    onBlur={() => saveChapterEdits()}
                  />
                )}
              </div>

              {/* Bottom status bar */}
              <div
                style={{
                  padding: '0.5rem 1.5rem',
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-sidebar)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <div>Số từ: {wordCount} từ</div>
                <div>Trạng thái chương: {activeChapter.status === 'completed' ? 'Hoàn thành ✅' : 'Đang phát triển ⏳'}</div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              Hãy tạo chương mới ở mục lục bên trái.
            </div>
          )}
        </div>

        {/* ================= RIGHT METADATA PANEL ================= */}
        <div
          style={{
            width: '280px',
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
              onClick={() => setRightSidebar('characters')}
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '0.8125rem',
                fontWeight: rightSidebar === 'characters' ? 600 : 400,
                color: rightSidebar === 'characters' ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                backgroundColor: rightSidebar === 'characters' ? 'var(--color-bg-primary)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Users size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Nhân vật
            </button>
            <button
              onClick={() => setRightSidebar('world')}
              style={{
                flex: 1,
                padding: '0.75rem',
                fontSize: '0.8125rem',
                fontWeight: rightSidebar === 'world' ? 600 : 400,
                color: rightSidebar === 'world' ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                backgroundColor: rightSidebar === 'world' ? 'var(--color-bg-primary)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Globe size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Bối cảnh
            </button>
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {rightSidebar === 'characters' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Hồ sơ nhân vật
                </h3>
                {project.characters && project.characters.length > 0 ? (
                  project.characters.map((char) => (
                    <div key={char.id} className="card" style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-card)', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{char.name}</span>
                        <span className={`badge ${char.role === 'main' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.55rem', padding: '0.1rem 0.25rem' }}>
                          {char.role === 'main' ? 'Chính' : 'Phụ'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                        <strong>Mô tả:</strong> {char.description}
                      </div>
                      {char.backstory && (
                        <div style={{ color: 'var(--color-text-muted)' }}>
                          <strong>Lý lịch:</strong> {char.backstory}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Chưa cấu hình nhân vật.</p>
                )}
              </div>
            )}

            {rightSidebar === 'world' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    Thế giới quan
                  </h3>
                  <div className="card" style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-card)', lineHeight: 1.5 }}>
                    {project.worldBuilding?.worldDescription || 'Chưa cấu hình thế giới quan.'}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    Ý tưởng cốt truyện chính
                  </h3>
                  <div className="card" style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-card)', lineHeight: 1.5 }}>
                    {project.worldBuilding?.coreIdea || 'Chưa cấu hình ý tưởng chính.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
