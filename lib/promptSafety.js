const UNSAFE_PROMPT_KEYWORDS = [
    'sexy', 'nude', 'sex', 'khoa than', 'khỏa thân', 'khieu dam', 'khiêu dâm', 'doi truy', 'đồi trụy',
    'bikini', 'do lot', 'đồ lót', 'noi y', 'nội y', 'ao lot', 'áo lót', 'quan lot', 'quần lót',
    'do ngu goi cam', 'đồ ngủ gợi cảm', 'anh nguoi lon', 'ảnh người lớn', 'hinh nguoi lon', 'hình người lớn',
    'phim nguoi lon', 'phim người lớn', 'noi dung nguoi lon', 'nội dung người lớn',
    'nguoi mau goi cam', 'người mẫu gợi cảm', 'hot girl', 'gai sexy', 'gái sexy', 'trai sexy',
    'goi duc', 'gợi dục', 'goi cam qua muc', 'gợi cảm quá mức',
    'porn', 'erotic', 'hentai', 'breast', 'naked', 'underwear', 'lingerie', 'bra', 'panties',
    'thong', 'g string', 'adult image', 'adult photo', 'adult content', 'playboy', 'onlyfans',
    'sexualized', 'seductive', 'provocative'
];

const CHILD_SAFETY_BYPASS_KEYWORDS = [
    'vuot qua an toan', 'vượt qua an toàn', 'bo qua an toan', 'bỏ qua an toàn',
    'lach kiem duyet', 'lách kiểm duyệt', 'khong kiem duyet', 'không kiểm duyệt',
    'bo qua bo loc', 'bỏ qua bộ lọc', 'vuot bo loc', 'vượt bộ lọc',
    'khong can an toan tre em', 'không cần an toàn trẻ em',
    'bypass safety', 'ignore safety', 'ignore child safety', 'disable safety',
    'no safety filter', 'unfiltered', 'jailbreak'
];

const RAW_UNSAFE_PATTERNS = [
    /\b18\s*\+/i,
    /\bnsfw\b/i,
    /\bonly\s*fans\b/i,
    /\bg[\s-]*string\b/i
];

function normalizePromptText(text = '') {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function containsKeyword(normalizedPrompt, keyword) {
    const normalizedKeyword = normalizePromptText(keyword);
    return normalizedKeyword && normalizedPrompt.includes(` ${normalizedKeyword} `);
}

export function checkServerPromptSafety(promptText = '') {
    const normalizedPrompt = ` ${normalizePromptText(promptText)} `;
    const hasUnsafeAdultContent = RAW_UNSAFE_PATTERNS.some(pattern => pattern.test(promptText)) ||
        UNSAFE_PROMPT_KEYWORDS.some(keyword => containsKeyword(normalizedPrompt, keyword));
    const hasSafetyBypass = CHILD_SAFETY_BYPASS_KEYWORDS.some(keyword => containsKeyword(normalizedPrompt, keyword));

    if (!hasUnsafeAdultContent && !hasSafetyBypass) {
        return { ok: true };
    }

    return {
        ok: false,
        reason: hasSafetyBypass ? 'safety_bypass' : 'adult_content',
        message: 'Prompt chưa phù hợp với môi trường học sinh. Vui lòng tránh nội dung người lớn, trang phục nhạy cảm hoặc yêu cầu vượt qua bộ lọc an toàn.'
    };
}
