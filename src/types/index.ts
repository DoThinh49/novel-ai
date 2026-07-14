// ============================================================
// Core Types — AI Light Novel Platform
// ============================================================

// --- Project ---
export type ProjectStatus = 'draft' | 'in_progress' | 'completed';
export type ContextMode = 'full' | 'summary' | 'sliding_window';
export type ChapterStatus = 'pending' | 'writing' | 'completed';
export type CharacterRole = 'main' | 'supporting';

export interface Project {
  id: string;
  title: string;
  genre: string;
  hashtags: string[];
  writingStyle: string;
  status: ProjectStatus;
  contextMode: ContextMode;
  contextChapterCount: number;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
  characters?: Character[];
  outline?: Outline | null;
  worldBuilding?: WorldBuilding | null;
}

// --- Chapter ---
export interface Chapter {
  id: string;
  projectId: string;
  chapterNumber: number;
  title: string;
  content: string;
  summary: string;
  status: ChapterStatus;
  createdAt: Date;
}

// --- Character ---
export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: CharacterRole;
  description: string;
  backstory: string;
}

// --- Outline ---
export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  summary: string;
}

export interface Outline {
  id: string;
  projectId: string;
  fullOutline: string;
  chapterOutlines: ChapterOutline[];
  userRequirements: string;
  totalChapters: number;
}

// --- World Building ---
export interface WorldBuilding {
  id: string;
  projectId: string;
  worldDescription: string;
  coreIdea: string;
  settings: Record<string, string>;
}

// --- System Settings ---
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

// --- API Request/Response Types ---
export interface GenerateTitleRequest {
  genre: string;
  hashtags: string[];
  writingStyle: string;
}

export interface GenerateTitleResponse {
  titles: string[];
}

export interface GenerateCharactersRequest {
  genre: string;
  writingStyle: string;
  worldDescription: string;
  coreIdea: string;
  count: number;
  role: CharacterRole;
}

export interface GenerateOutlineRequest {
  projectId: string;
  userRequirements: string;
  totalChapters: number;
}

export interface GenerateChapterRequest {
  projectId: string;
  chapterNumber: number;
  contextMode: ContextMode;
  contextChapterCount?: number;
}

// --- Auto-Write State Machine ---
export type AutoWriteStatus = 'idle' | 'writing' | 'paused' | 'completed' | 'error';

export interface AutoWriteState {
  status: AutoWriteStatus;
  currentChapter: number;
  totalChapters: number;
  error?: string;
}

// --- Wizard Steps ---
export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardState {
  currentStep: WizardStep;
  projectId: string | null;
  isComplete: boolean;
}

// --- Genre Options ---
export const GENRES = [
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'Action',
  'Adventure',
  'Mystery',
  'Horror',
  'Slice of Life',
  'Isekai',
  'Wuxia / Tiên Hiệp',
  'Huyền Huyễn',
  'Đô Thị',
  'Lịch Sử',
  'Hài Hước',
  'Kinh Dị',
  'Trinh Thám',
] as const;

export const WRITING_STYLES = [
  'Trang trọng & Sử thi',
  'Nhẹ nhàng & Hài hước',
  'Kịch tính & Hồi hộp',
  'Lãng mạn & Trữ tình',
  'Tối tăm & Gothic',
  'Hiện đại & Đời thường',
  'Triết lý & Suy tư',
  'Hành động & Mạnh mẽ',
] as const;
