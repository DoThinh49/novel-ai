'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit2,
  Plus,
  Check,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { GENRES, WRITING_STYLES } from '@/types';
import type { Character } from '@/types';

export default function CreateProjectPage() {
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [wizardError, setWizardError] = useState<string | null>(null);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [writingStyle, setWritingStyle] = useState('Trang trọng & Sử thi');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [suggestedTitles, setSuggestedTitles] = useState<{ title: string; reason: string }[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

  // Step 2: Detail Setup
  const [worldDescription, setWorldDescription] = useState('');
  const [coreIdea, setCoreIdea] = useState('');
  const [characters, setCharacters] = useState<Partial<Character>[]>([]);

  // Character Form Modal/Fields
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState<'main' | 'supporting'>('main');
  const [charDesc, setCharDesc] = useState('');
  const [charBackstory, setCharBackstory] = useState('');
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  const [showCharForm, setShowCharForm] = useState(false);

  // Step 3: Outline
  const [totalChapters, setTotalChapters] = useState(10);
  const [userRequirements, setUserRequirements] = useState('');
  const [chapterOutlines, setChapterOutlines] = useState<{ chapterNumber: number; title: string; summary: string }[]>([]);

  // Tag Manager for Step 1
  const addHashtag = () => {
    const trimmed = hashtagInput.trim().replace(/^#/, '');
    if (trimmed && !hashtags.includes(trimmed)) {
      setHashtags([...hashtags, trimmed]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  // Step 1: AI Title Generator
  const generateTitles = async () => {
    if (!genre || !writingStyle) return;
    setLoading(true);
    setLoadingText('Gemini đang suy nghĩ tên truyện phù hợp...');
    setWizardError(null);
    try {
      const res = await fetch('/api/generate/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, hashtags, writingStyle }),
      });
      const data = await res.json();
      if (res.ok && data.titles) {
        setSuggestedTitles(data.titles);
        setShowTitleSuggestions(true);
      } else {
        setWizardError(data.error || 'Có lỗi xảy ra khi gợi ý tên truyện.');
      }
    } catch (err) {
      console.error(err);
      setWizardError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit and Create Project
  const handleStep1Submit = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập hoặc chọn tên truyện!');
      return;
    }
    setLoading(true);
    setLoadingText('Đang khởi tạo dự án truyện...');
    setWizardError(null);
    try {
      const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
      const method = projectId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, hashtags, writingStyle }),
      });
      const data = await res.json();
      if (res.ok) {
        const id = projectId || data.project.id;
        setProjectId(id);
        setStep(2);
      } else {
        setWizardError(data.error || 'Có lỗi xảy ra khi tạo dự án.');
      }
    } catch (err) {
      console.error(err);
      setWizardError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: AI World Builder Suggestion
  const generateWorld = async () => {
    setLoading(true);
    setLoadingText('Gemini đang thiết lập thế giới quan...');
    setWizardError(null);
    try {
      const res = await fetch('/api/generate/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, writingStyle, title }),
      });
      const data = await res.json();
      if (res.ok && data.worldDescription) {
        setWorldDescription(data.worldDescription);
      } else {
        setWizardError(data.error || 'Có lỗi xảy ra khi thiết lập thế giới quan.');
      }
    } catch (err) {
      console.error(err);
      setWizardError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: AI Plot Idea Suggestion
  const generatePlotIdea = async () => {
    setLoading(true);
    setLoadingText('Gemini đang phác thảo cốt truyện chính...');
    setWizardError(null);
    try {
      const res = await fetch('/api/generate/plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          writingStyle,
          title,
          worldDescription,
          characters: characters.map((c) => ({ name: c.name, description: c.description })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.plotIdea) {
        setCoreIdea(data.plotIdea);
      } else {
        setWizardError(data.error || 'Có lỗi xảy ra khi gợi ý cốt truyện.');
      }
    } catch (err) {
      console.error(err);
      setWizardError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: AI Character Generator
  const generateCharacterAI = async (role: 'main' | 'supporting') => {
    setLoading(true);
    setLoadingText(`Gemini đang kiến tạo nhân vật ${role === 'main' ? 'chính' : 'phụ'}...`);
    setWizardError(null);
    try {
      const res = await fetch('/api/generate/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          writingStyle,
          worldDescription,
          coreIdea,
          count: 1,
          role,
          existingCharacters: characters,
        }),
      });
      const data = await res.json();
      if (res.ok && data.characters && data.characters.length > 0) {
        setCharacters([...characters, ...data.characters]);
      } else {
        setWizardError(data.error || 'Có lỗi xảy ra khi gợi ý nhân vật.');
      }
    } catch (err) {
      console.error(err);
      setWizardError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Character CRUD
  const saveCharacter = () => {
    if (!charName.trim()) {
      alert('Tên nhân vật không được để trống!');
      return;
    }
    const newChar = { name: charName, role: charRole, description: charDesc, backstory: charBackstory };

    if (editingCharIndex !== null) {
      const updated = [...characters];
      updated[editingCharIndex] = newChar;
      setCharacters(updated);
      setEditingCharIndex(null);
    } else {
      setCharacters([...characters, newChar]);
    }

    setCharName('');
    setCharDesc('');
    setCharBackstory('');
    setShowCharForm(false);
  };

  const editCharacter = (index: number) => {
    const target = characters[index];
    setCharName(target.name || '');
    setCharRole(target.role || 'main');
    setCharDesc(target.description || '');
    setCharBackstory(target.backstory || '');
    setEditingCharIndex(index);
    setShowCharForm(true);
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  // Step 2: Submit to Setup API
  const handleStep2Submit = async () => {
    if (!projectId) return;
    setLoading(true);
    setLoadingText('Đang lưu thông tin nhân vật và bối cảnh...');
    try {
      const res = await fetch(`/api/projects/${projectId}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldDescription,
          coreIdea,
          characters,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        alert(data.error || 'Lỗi khi lưu thiết lập chi tiết.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: AI Generate Outline
  const generateOutline = async () => {
    if (!projectId) return;
    setLoading(true);
    setLoadingText('Gemini đang phân tích bối cảnh và tạo dàn ý chi tiết...');
    setWizardError(null);
    try {
      const res = await fetch('/api/generate/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userRequirements,
          totalChapters,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChapterOutlines(data.outline.chapterOutlines);
      } else {
        setWizardError(data.error || 'Có lỗi xảy ra khi tạo dàn ý.');
      }
    } catch (err) {
      console.error(err);
      setWizardError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Edit Chapter Outline
  const updateChapterOutline = (index: number, field: 'title' | 'summary', value: string) => {
    const updated = [...chapterOutlines];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setChapterOutlines(updated);
  };

  // Step 3: Submit and Proceed
  const handleStep3Submit = async () => {
    if (!projectId) return;
    if (chapterOutlines.length === 0) {
      alert('Vui lòng tạo dàn ý trước khi đi tiếp!');
      return;
    }

    setLoading(true);
    setLoadingText('Đang hoàn tất lưu dàn ý...');
    try {
      // Save the modified chapter outlines
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'in_progress', // Set project to in progress
        }),
      });

      // Update the outline model directly
      await fetch(`/api/generate/outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userRequirements,
          totalChapters,
        }),
      });

      if (res.ok) {
        setStep(4);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Finished Wizard
  const handleFinishWizard = () => {
    if (projectId) {
      router.push(`/projects/${projectId}`);
    } else {
      router.push('/projects');
    }
  };

  return (
    <AppShell>
      <div className="page-container" style={{ maxWidth: 960 }}>
        {/* Glowing header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff, var(--color-text-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            Sáng tác tác phẩm mới
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Hệ thống hỗ trợ sáng tác 4 bước giúp biến ý tưởng của bạn thành tiểu thuyết hoàn chỉnh.
          </p>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="stepper card" style={{ padding: '1.25rem 2rem', marginBottom: '2.5rem' }}>
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 1 ? <Check size={16} /> : '1'}</div>
            <div className="step-label">Thông tin chung</div>
          </div>
          <div className={`step-connector ${step > 1 ? 'active' : ''}`} />

          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 2 ? <Check size={16} /> : '2'}</div>
            <div className="step-label">Chi tiết & Nhân vật</div>
          </div>
          <div className={`step-connector ${step > 2 ? 'active' : ''}`} />

          <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 3 ? <Check size={16} /> : '3'}</div>
            <div className="step-label">Dàn ý (Outline)</div>
          </div>
          <div className={`step-connector ${step > 3 ? 'active' : ''}`} />

          <div className={`step ${step === 4 ? 'active' : ''} ${step === 4 ? 'completed' : ''}`}>
            <div className="step-circle">4</div>
            <div className="step-label">Khởi chạy AI</div>
          </div>
        </div>

        {/* Wizard step panels */}
        <div className="card animate-fade-in" style={{ minHeight: '400px', padding: '2rem', position: 'relative' }}>
          {/* Spinner overlay */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(10, 10, 15, 0.85)',
                zIndex: 30,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <Loader2 className="spinner" size={48} style={{ color: 'var(--color-accent)' }} />
              <div
                style={{
                  color: 'var(--color-accent-light)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {loadingText}
              </div>
            </div>
          )}

          {wizardError && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.75rem 1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.8125rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ <strong>Lỗi kết nối AI:</strong> {wizardError}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{
                  color: '#ef4444',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                }}
                onClick={() => setWizardError(null)}
              >
                Đóng
              </button>
            </div>
          )}

          {/* ================= STEP 1: BASIC INFO ================= */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Bước 1: Khai báo thông tin cơ bản
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Title and AI button */}
                <div>
                  <label className="label">Tên tác phẩm / Tiểu thuyết</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Nhập tên truyện hoặc dùng AI gợi ý bên cạnh..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={generateTitles}
                      style={{ padding: '0.625rem 1rem' }}
                    >
                      <Sparkles size={16} /> Gợi ý
                    </button>
                  </div>

                  {/* Title Suggestions Dropdown */}
                  {showTitleSuggestions && suggestedTitles.length > 0 && (
                    <div className="card" style={{ marginTop: '0.75rem', padding: '1rem', border: '1px solid var(--color-accent)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent-light)' }}>AI GỢI Ý TÊN TRUYỆN:</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.25rem' }}
                          onClick={() => setShowTitleSuggestions(false)}
                        >
                          Đóng
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {suggestedTitles.map((t, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setTitle(t.title);
                              setShowTitleSuggestions(false);
                            }}
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-bg-tertiary)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: '1px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-accent)';
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'transparent';
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                            }}
                          >
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Genre & Style */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Thể loại chính</label>
                    <select
                      className="select"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                    >
                      {GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Phong cách sáng tác</label>
                    <select
                      className="select"
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                    >
                      {WRITING_STYLES.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hashtags Input */}
                <div>
                  <label className="label">Tags / Hashtags / Chủ đề phụ</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ví dụ: trọng sinh, harem, tu tiên (nhấn Enter để thêm)"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addHashtag();
                        }
                      }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={addHashtag}>
                      Thêm
                    </button>
                  </div>

                  {/* Render Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.75rem',
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-primary" onClick={handleStep1Submit}>
                  Tiếp tục <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: DETAILS & CHARACTERS ================= */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                Bước 2: Xây dựng bối cảnh & Nhân vật
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* World Building Card */}
                <div className="card" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="label" style={{ marginBottom: 0 }}>Thế giới quan (World Description)</label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={generateWorld}>
                      <Sparkles size={14} /> AI Tạo bối cảnh
                    </button>
                  </div>
                  <textarea
                    className="textarea"
                    placeholder="Mô tả các quốc gia, lục địa, luật lệ, hay hệ thống sức mạnh trong truyện..."
                    value={worldDescription}
                    onChange={(e) => setWorldDescription(e.target.value)}
                    style={{ minHeight: '120px' }}
                  />
                </div>

                {/* Core Idea Card */}
                <div className="card" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="label" style={{ marginBottom: 0 }}>Ý tưởng cốt truyện chính (Plot Idea)</label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={generatePlotIdea}>
                      <Sparkles size={14} /> AI Gợi ý cốt truyện
                    </button>
                  </div>
                  <textarea
                    className="textarea"
                    placeholder="Tóm tắt mạch truyện, mâu thuẫn chính hay kết cục mong muốn..."
                    value={coreIdea}
                    onChange={(e) => setCoreIdea(e.target.value)}
                    style={{ minHeight: '120px' }}
                  />
                </div>

                {/* Characters Section */}
                <div className="card" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Hồ sơ nhân vật</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => generateCharacterAI('main')}>
                        <Sparkles size={14} /> + AI Nhân vật chính
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => generateCharacterAI('supporting')}>
                        <Sparkles size={14} /> + AI Nhân vật phụ
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditingCharIndex(null);
                          setCharName('');
                          setCharDesc('');
                          setCharBackstory('');
                          setCharRole('main');
                          setShowCharForm(true);
                        }}
                      >
                        <Plus size={14} /> Thêm thủ công
                      </button>
                    </div>
                  </div>

                  {/* Character Form (inline popup/collapsible) */}
                  {showCharForm && (
                    <div className="card" style={{ border: '1px solid var(--color-accent)', marginBottom: '1.5rem', padding: '1rem' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        {editingCharIndex !== null ? 'Chỉnh sửa hồ sơ nhân vật' : 'Tạo nhân vật mới'}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label className="label">Tên nhân vật</label>
                          <input
                            type="text"
                            className="input"
                            value={charName}
                            onChange={(e) => setCharName(e.target.value)}
                            placeholder="Tên nhân vật..."
                          />
                        </div>
                        <div>
                          <label className="label">Vai trò</label>
                          <select
                            className="select"
                            value={charRole}
                            onChange={(e) => setCharRole(e.target.value as 'main' | 'supporting')}
                          >
                            <option value="main">Nhân vật chính</option>
                            <option value="supporting">Nhân vật phụ</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label className="label">Mô tả ngoại hình & Tính cách</label>
                        <input
                          type="text"
                          className="input"
                          value={charDesc}
                          onChange={(e) => setCharDesc(e.target.value)}
                          placeholder="Miêu tả ngắn gọn..."
                        />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Lý lịch / Quá khứ (Backstory)</label>
                        <textarea
                          className="textarea"
                          value={charBackstory}
                          onChange={(e) => setCharBackstory(e.target.value)}
                          placeholder="Hoàn cảnh sống, động lực..."
                          style={{ minHeight: '60px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setShowCharForm(false)}
                        >
                          Hủy
                        </button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={saveCharacter}>
                          Lưu nhân vật
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Character list grid */}
                  {characters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      Chưa có nhân vật nào được tạo. Hãy nhấn nút để AI gợi ý hoặc tự điền thủ công.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                      {characters.map((char, idx) => (
                        <div key={idx} className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{char.name}</span>
                              <span className={`badge ${char.role === 'main' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.625rem', padding: '0.125rem 0.35rem' }}>
                                {char.role === 'main' ? 'Chính' : 'Phụ'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '0.25rem' }}
                                onClick={() => editCharacter(idx)}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '0.25rem', color: 'var(--color-error)' }}
                                onClick={() => removeCharacter(idx)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            <strong>Mô tả:</strong> {char.description || 'Chưa điền'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <strong>Quá khứ:</strong> {char.backstory ? (char.backstory.length > 80 ? char.backstory.substring(0, 80) + '...' : char.backstory) : 'Chưa điền'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button type="button" className="btn btn-primary" onClick={handleStep2Submit}>
                  Tiếp tục <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: OUTLINE (DÀN Ý) ================= */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                Bước 3: Tạo Dàn ý chi tiết cho tác phẩm
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Configuration inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div>
                    <label className="label">Số chương truyện dự kiến</label>
                    <input
                      type="number"
                      className="input"
                      min={1}
                      max={50}
                      value={totalChapters}
                      onChange={(e) => setTotalChapters(Math.max(1, parseInt(e.target.value) || 10))}
                    />
                  </div>
                  <div>
                    <label className="label">Yêu cầu đặc biệt của bạn đối với mạch truyện</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ví dụ: Kết thúc có hậu, có nhiều cú twist bất ngờ ở chương cuối..."
                      value={userRequirements}
                      onChange={(e) => setUserRequirements(e.target.value)}
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={generateOutline}
                    style={{ minWidth: '240px' }}
                  >
                    <Sparkles size={18} /> Phác thảo Dàn ý tự động
                  </button>
                </div>

                {/* Outlines List */}
                {chapterOutlines.length > 0 && (
                  <div className="card" style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-accent-light)' }}>
                      Mạch phân chia chương truyện (Bạn có thể tinh chỉnh tại đây)
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {chapterOutlines.map((co, idx) => (
                        <div key={idx} className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                            Chương {co.chapterNumber}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input
                              type="text"
                              className="input"
                              value={co.title}
                              onChange={(e) => updateChapterOutline(idx, 'title', e.target.value)}
                              placeholder="Tiêu đề chương..."
                              style={{ padding: '0.5rem' }}
                            />
                            <textarea
                              className="textarea"
                              value={co.summary}
                              onChange={(e) => updateChapterOutline(idx, 'summary', e.target.value)}
                              placeholder="Tóm tắt sự kiện xảy ra trong chương..."
                              style={{ minHeight: '60px', padding: '0.5rem' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <button type="button" className="btn btn-primary" onClick={handleStep3Submit}>
                  Tiếp tục <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: INITIATE / CONFIRMATION ================= */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-success), #059669)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  marginBottom: '1.5rem',
                }}
              >
                <Check size={36} />
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                Thiết lập Tác phẩm Hoàn tất!
              </h2>

              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: '560px',
                  margin: '0 auto 2rem auto',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                Tác phẩm <strong>{title}</strong> của bạn đã được khởi tạo thành công với cấu trúc thế giới,
                hồ sơ nhân vật cùng dàn ý chi tiết. Giờ đây, bạn có thể chuyển hướng đến không gian làm việc để tiến hành sáng tác tự động cùng Gemini AI.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button type="button" className="btn btn-primary btn-lg" onClick={handleFinishWizard}>
                  Vào không gian sáng tác <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
