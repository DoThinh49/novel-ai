// ============================================================
// Prompt Templates — Versioned prompt engineering
// ============================================================

/**
 * v1 — Gợi ý tên truyện (Step 1)
 */
export function buildTitleSuggestionPrompt(params: {
  genre: string;
  hashtags: string[];
  writingStyle: string;
}): string {
  return `Bạn là chuyên gia đặt tên tiểu thuyết/Light Novel. Hãy gợi ý 5 tên truyện hấp dẫn, sáng tạo và phù hợp với thông tin sau:

**Thể loại:** ${params.genre}
**Chủ đề/Hashtag:** ${params.hashtags.join(', ')}
**Phong cách viết:** ${params.writingStyle}

Yêu cầu:
- Tên truyện phải bằng tiếng Việt, ngắn gọn (3-10 từ), dễ nhớ
- Phải gợi lên cảm xúc và sự tò mò
- Phù hợp với thể loại và phong cách
- Mỗi tên phải độc đáo, không giống nhau

Trả về CHÍNH XÁC theo định dạng JSON sau, KHÔNG có markdown code block:
[
  {"title": "Tên truyện 1", "reason": "Lý do gợi ý ngắn gọn"},
  {"title": "Tên truyện 2", "reason": "Lý do gợi ý ngắn gọn"},
  {"title": "Tên truyện 3", "reason": "Lý do gợi ý ngắn gọn"},
  {"title": "Tên truyện 4", "reason": "Lý do gợi ý ngắn gọn"},
  {"title": "Tên truyện 5", "reason": "Lý do gợi ý ngắn gọn"}
]`;
}

/**
 * v2 — Gợi ý nhân vật (Step 2)
 */
export function buildCharacterSuggestionPrompt(params: {
  genre: string;
  writingStyle: string;
  worldDescription: string;
  coreIdea: string;
  count: number;
  role: 'main' | 'supporting';
  existingCharacters?: { name?: string; role?: string; description?: string }[];
}): string {
  const roleLabel = params.role === 'main' ? 'nhân vật chính' : 'nhân vật phụ';
  
  const existingList = params.existingCharacters?.length
    ? `\n**Các nhân vật đã tồn tại trong truyện (KHÔNG ĐƯỢC tạo trùng lặp với họ):**\n${params.existingCharacters
        .map((c) => `- Tên: ${c.name} (${c.role === 'main' ? 'Chính' : 'Phụ'}) - Mô tả: ${c.description}`)
        .join('\n')}\n`
    : '';
  
  return `Hãy tạo ${params.count} ${roleLabel} MỚI độc đáo cho tiểu thuyết với thông tin sau:
Command: Tạo nhân vật mới độc nhất không trùng lặp.

**Thể loại:** ${params.genre}
**Phong cách:** ${params.writingStyle}
**Thế giới quan:** ${params.worldDescription || 'Chưa có — hãy tự sáng tạo phù hợp'}
**Ý tưởng cốt truyện:** ${params.coreIdea || 'Chưa có — hãy tự sáng tạo phù hợp'}
${existingList}
Yêu cầu cho mỗi nhân vật:
- Tên mới (tiếng Việt hoặc phù hợp thế giới quan, KHÔNG trùng với các nhân vật đã có ở trên)
- Mô tả ngắn về ngoại hình và tính cách mới (2-3 câu)
- Lý lịch/Backstory mới ngắn gọn (3-5 câu)
- Vai trò trong câu chuyện (đảm bảo độc đáo và không trùng lặp)

Trả về CHÍNH XÁC theo định dạng JSON sau, KHÔNG có markdown code block:
[
  {
    "name": "Tên nhân vật mới",
    "description": "Mô tả ngoại hình và tính cách mới",
    "backstory": "Lý lịch và quá khứ mới",
    "role": "${params.role}"
  }
]`;
}

/**
 * v2 — Gợi ý thế giới quan (Step 2)
 */
export function buildWorldSuggestionPrompt(params: {
  genre: string;
  writingStyle: string;
  title?: string;
}): string {
  return `Hãy tạo một thế giới quan chi tiết cho tiểu thuyết ${params.genre}.

${params.title ? `**Tên truyện:** ${params.title}` : ''}
**Phong cách viết:** ${params.writingStyle}

Hãy mô tả thế giới quan bao gồm:
1. Bối cảnh tổng quan (thời đại, địa lý, xã hội)
2. Hệ thống sức mạnh/phép thuật (nếu có)
3. Cấu trúc xã hội và chính trị
4. Các phe phái/thế lực chính
5. Những quy luật đặc biệt của thế giới

Viết dưới dạng đoạn văn mô tả tự nhiên, 200-400 từ.`;
}

/**
 * v2 — Gợi ý ý tưởng cốt truyện (Step 2)
 */
export function buildPlotIdeaSuggestionPrompt(params: {
  genre: string;
  writingStyle: string;
  title?: string;
  worldDescription?: string;
  characters?: { name: string; description: string }[];
}): string {
  const characterInfo = params.characters?.length
    ? `**Nhân vật:** \n${params.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}`
    : '';

  return `Hãy gợi ý một ý tưởng cốt truyện hấp dẫn cho tiểu thuyết.

**Thể loại:** ${params.genre}
**Phong cách viết:** ${params.writingStyle}
${params.title ? `**Tên truyện:** ${params.title}` : ''}
${params.worldDescription ? `**Thế giới quan:** ${params.worldDescription}` : ''}
${characterInfo}

Ý tưởng cốt truyện cần bao gồm:
1. Xung đột chính (Central Conflict)
2. Mục tiêu của nhân vật chính
3. Các thử thách và trở ngại
4. Twist/Điểm ngoặt tiềm năng
5. Hướng kết thúc (mở hoặc đóng)

Viết dưới dạng đoạn văn mô tả, 200-400 từ. Phải hấp dẫn và tạo sự tò mò.`;
}

/**
 * v3 — Tạo dàn ý truyện (Step 3)
 */
export function buildOutlinePrompt(params: {
  genre: string;
  writingStyle: string;
  title: string;
  worldDescription: string;
  coreIdea: string;
  characters: { name: string; role: string; description: string }[];
  totalChapters: number;
  userRequirements?: string;
}): string {
  const characterList = params.characters
    .map(c => `- **${c.name}** (${c.role === 'main' ? 'Chính' : 'Phụ'}): ${c.description}`)
    .join('\n');

  return `Hãy tạo dàn ý chi tiết cho tiểu thuyết gồm ${params.totalChapters} chương.

**Tên truyện:** ${params.title}
**Thể loại:** ${params.genre}
**Phong cách viết:** ${params.writingStyle}

**Thế giới quan:**
${params.worldDescription}

**Ý tưởng cốt truyện:**
${params.coreIdea}

**Nhân vật:**
${characterList}

${params.userRequirements ? `**Yêu cầu riêng của tác giả:**\n${params.userRequirements}` : ''}

Yêu cầu cho dàn ý:
- Tổng cộng ${params.totalChapters} chương
- Mỗi chương cần có: số thứ tự, tiêu đề hấp dẫn, và tóm tắt nội dung (50-100 từ)
- Cốt truyện phải logic, có cao trào, và kết thúc thỏa mãn
- Đảm bảo phát triển nhân vật xuyên suốt
- Có ít nhất 2-3 điểm ngoặt (plot twists)
- Nhịp độ phù hợp: giới thiệu (20%), phát triển (50%), cao trào (20%), kết thúc (10%)

Trả về CHÍNH XÁC theo định dạng JSON sau, KHÔNG có markdown code block:
[
  {
    "chapterNumber": 1,
    "title": "Tiêu đề chương 1",
    "summary": "Tóm tắt nội dung chương 1 (50-100 từ)"
  },
  {
    "chapterNumber": 2,
    "title": "Tiêu đề chương 2",
    "summary": "Tóm tắt nội dung chương 2 (50-100 từ)"
  }
]`;
}

/**
 * v4 — Sáng tác chương (Step 4 — Auto-Write)
 */
export function buildChapterWritingPrompt(params: {
  genre: string;
  writingStyle: string;
  title: string;
  worldDescription: string;
  characters: { name: string; role: string; description: string; backstory: string }[];
  chapterNumber: number;
  chapterTitle: string;
  chapterOutline: string;
  previousContext: string; // Could be full text, summaries, or last N chapters
  contextMode: string;
  totalChapters: number;
}): string {
  const characterInfo = params.characters
    .map(c => `- **${c.name}** (${c.role === 'main' ? 'Chính' : 'Phụ'}): ${c.description}. ${c.backstory}`)
    .join('\n');

  const contextSection = params.previousContext
    ? `\n**Nội dung các chương trước (${params.contextMode}):**\n${params.previousContext}\n`
    : '\n**Đây là chương đầu tiên của truyện.**\n';

  return `Hãy viết Chương ${params.chapterNumber}/${params.totalChapters} của tiểu thuyết.

**Tên truyện:** ${params.title}
**Thể loại:** ${params.genre}
**Phong cách viết:** ${params.writingStyle}

**Thế giới quan:**
${params.worldDescription}

**Nhân vật:**
${characterInfo}
${contextSection}
**Dàn ý Chương ${params.chapterNumber} — "${params.chapterTitle}":**
${params.chapterOutline}

Yêu cầu viết:
- Viết đầy đủ, chi tiết, ít nhất 2000-3000 từ
- Tuân thủ phong cách "${params.writingStyle}"
- Đảm bảo TÍNH NHẤT QUÁN với các chương trước (tên nhân vật, sự kiện, chi tiết)
- Có mở đầu hấp dẫn, phát triển mạch lạc, và kết chương tạo sự tò mò
- Sử dụng đối thoại tự nhiên, mô tả sinh động
- KHÔNG lặp lại nội dung đã viết ở các chương trước
- KHÔNG tóm tắt hay rút gọn — viết đầy đủ như một chương tiểu thuyết thực sự
- Bắt đầu viết ngay nội dung chương, KHÔNG viết tiêu đề chương`;
}

/**
 * Tóm tắt chương (dùng cho Summary Context Mode)
 */
export function buildChapterSummaryPrompt(params: {
  chapterNumber: number;
  chapterTitle: string;
  chapterContent: string;
}): string {
  return `Hãy tóm tắt nội dung chương sau thành 150-200 từ, bao gồm:
- Các sự kiện chính xảy ra
- Sự phát triển của nhân vật
- Các chi tiết quan trọng cần nhớ cho các chương sau
- Trạng thái cảm xúc của nhân vật cuối chương

**Chương ${params.chapterNumber} — "${params.chapterTitle}":**
${params.chapterContent}

Viết tóm tắt ngắn gọn, súc tích, tập trung vào thông tin cần thiết.`;
}

/**
 * Viết lại (Rewrite) — Cụm B
 */
export function buildRewritePrompt(params: {
  text: string;
  style?: string;
  instructions?: string;
}): string {
  return `Hãy viết lại đoạn văn sau với phong cách mới, giữ nguyên ý chính nhưng cải thiện chất lượng văn bản.

${params.style ? `**Phong cách mới:** ${params.style}` : ''}
${params.instructions ? `**Yêu cầu cụ thể:** ${params.instructions}` : ''}

**Đoạn văn gốc:**
${params.text}

Yêu cầu:
- Giữ nguyên nội dung và ý nghĩa cốt lõi
- Cải thiện câu từ, ngữ pháp, và cách diễn đạt
- Làm cho văn bản hấp dẫn và sinh động hơn
- Chỉ trả về đoạn văn đã viết lại, KHÔNG giải thích`;
}

/**
 * Trau chuốt (Polish) — Cụm B
 */
export function buildPolishPrompt(params: {
  text: string;
  instructions?: string;
}): string {
  return `Hãy trau chuốt đoạn văn sau — sửa lỗi ngữ pháp, cải thiện câu từ, nhưng giữ nguyên phong cách và giọng văn gốc.

${params.instructions ? `**Yêu cầu cụ thể:** ${params.instructions}` : ''}

**Đoạn văn cần trau chuốt:**
${params.text}

Yêu cầu:
- Sửa lỗi chính tả và ngữ pháp
- Cải thiện cách diễn đạt cho mượt mà hơn
- KHÔNG thay đổi phong cách viết hay giọng văn gốc
- KHÔNG thêm thông tin mới hay thay đổi nội dung
- Chỉ trả về đoạn văn đã trau chuốt, KHÔNG giải thích`;
}
