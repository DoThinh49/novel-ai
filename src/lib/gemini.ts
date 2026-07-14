// ============================================================
// Google Gemini AI Client — Server-side only
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get Gemini API key from environment or database settings.
 * Priority: DB setting > Environment variable
 */
async function getApiKey(): Promise<string> {
  // Try to load key from DB
  try {
    const { prisma } = await import('@/lib/prisma');
    const dbKey = await prisma.systemSetting.findUnique({
      where: { key: 'GEMINI_API_KEY' },
    });
    if (dbKey?.value) {
      const val = dbKey.value.trim();
      if (/[^\x00-\x7F]/.test(val)) {
        throw new Error('Khóa API Key chứa ký tự tiếng Việt hoặc Unicode không hợp lệ. Vui lòng tắt Unikey/EVKey (chuyển sang chế độ chữ E) và lưu lại cài đặt.');
      }
      return val;
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unicode')) {
      throw err;
    }
    console.error('Failed to load API key from database, falling back to environment:', err);
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set it in environment variables or system settings.'
    );
  }
  const val = key.trim();
  if (/[^\x00-\x7F]/.test(val)) {
    throw new Error('Khóa API Key trong .env chứa ký tự Unicode không hợp lệ. Vui lòng kiểm tra lại tệp .env.');
  }
  return val;
}

/**
 * Create a configured GoogleGenerativeAI instance.
 * This should only be called from API routes (server-side).
 */
export async function createGeminiClient(): Promise<GoogleGenerativeAI> {
  const apiKey = await getApiKey();
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Default model to use for generation.
 * gemini-3.1-flash-lite: Ultra-efficient, fast stable model
 * gemini-2.5-pro/3.5: Higher quality, better for complex creative writing
 */
export const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

/**
 * System instruction for novel writing context.
 * This sets the "personality" and constraints for the AI.
 */
export const NOVEL_SYSTEM_INSTRUCTION = `Bạn là một nhà văn chuyên nghiệp với kinh nghiệm sáng tác tiểu thuyết và Light Novel. 
Bạn có khả năng:
- Sáng tác nội dung sáng tạo, hấp dẫn, giàu cảm xúc
- Xây dựng nhân vật có chiều sâu tâm lý
- Tạo thế giới quan phong phú và nhất quán
- Duy trì tính liên tục và logic xuyên suốt câu chuyện
- Viết bằng tiếng Việt tự nhiên, trôi chảy, phù hợp phong cách yêu cầu

Quy tắc:
- Luôn viết hoàn toàn bằng tiếng Việt (trừ tên riêng nước ngoài nếu có)
- Không sử dụng ngôn ngữ AI/robot, phải viết như một tác giả thực thụ
- Tuân thủ phong cách viết được yêu cầu
- Đảm bảo tính nhất quán về tên nhân vật, địa danh, và các chi tiết trong truyện`;

/**
 * Get a configured generative model instance.
 */
export async function getModel(options?: {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const client = await createGeminiClient();
  return client.getGenerativeModel({
    model: options?.model || process.env.GEMINI_MODEL || DEFAULT_MODEL,
    systemInstruction: options?.systemInstruction || NOVEL_SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: options?.temperature ?? 0.8,
      maxOutputTokens: options?.maxOutputTokens ?? 8192,
    },
  });
}

/**
 * Generate content with streaming support.
 * Returns an async iterable of text chunks.
 */
export async function* generateStream(
  prompt: string,
  options?: {
    model?: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }
) {
  const model = await getModel(options);
  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

/**
 * Generate content without streaming (single response).
 * Use for shorter outputs like title suggestions, summaries, etc.
 */
export async function generateContent(
  prompt: string,
  options?: {
    model?: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  const model = await getModel({
    ...options,
    maxOutputTokens: options?.maxOutputTokens ?? 4096,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Count tokens for a given text.
 * Useful for context window management in Auto-Write.
 */
export async function countTokens(text: string, modelName?: string): Promise<number> {
  const model = await getModel({ model: modelName });
  const result = await model.countTokens(text);
  return result.totalTokens;
}
