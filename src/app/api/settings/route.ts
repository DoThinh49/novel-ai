// ============================================================
// API Route: System Settings
// GET    /api/settings       — Check setting status
// POST   /api/settings       — Save setting key/values
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const geminiKey = await prisma.systemSetting.findUnique({
      where: { key: 'GEMINI_API_KEY' },
    });

    return NextResponse.json({
      hasGeminiKey: !!geminiKey?.value,
      geminiKeyMask: geminiKey?.value
        ? `${geminiKey.value.substring(0, 7)}...${geminiKey.value.substring(geminiKey.value.length - 4)}`
        : '',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { geminiApiKey } = body;

    if (geminiApiKey === undefined) {
      return NextResponse.json(
        { error: 'geminiApiKey is required' },
        { status: 400 }
      );
    }

    const sanitizedKey = geminiApiKey.trim();
    if (/[^\x00-\x7F]/.test(sanitizedKey)) {
      return NextResponse.json(
        { error: 'Khóa API Key không được chứa ký tự tiếng Việt hoặc ký tự Unicode ngoài ASCII. Vui lòng tắt Unikey/EVKey (chuyển sang chế độ tiếng Anh E) và nhập lại.' },
        { status: 400 }
      );
    }

    // Upsert the API Key setting
    const setting = await prisma.systemSetting.upsert({
      where: { key: 'GEMINI_API_KEY' },
      update: { value: sanitizedKey },
      create: {
        key: 'GEMINI_API_KEY',
        value: sanitizedKey,
      },
    });

    return NextResponse.json({
      success: true,
      hasGeminiKey: !!setting.value,
      geminiKeyMask: setting.value
        ? `${setting.value.substring(0, 7)}...${setting.value.substring(setting.value.length - 4)}`
        : '',
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    const message = error instanceof Error ? error.message : 'Failed to save settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
