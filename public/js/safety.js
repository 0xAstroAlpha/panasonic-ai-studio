import { appState } from './state.js';

const BLACKLIST = [
    // Tiếng Việt (Bạo lực / Vũ khí cực đoan)
    'máu', 'chết', 'giết', 'súng', 'chém giết', 'đâm chém', 'đâm người', 'đánh đập', 'bom', 'mìn', 'lựu đạn', 'đầu độc', 'tự tử', 'tự sát',
    
    // Tiếng Việt (Người lớn / Nhạy cảm cực đoan)
    'sexy', 'nude', 'sex', '18+', 'khỏa thân', 'khiêu dâm', 'đồi trụy',
    
    // Tiếng Việt (Chất gây nghiện cực đoan)
    'ma túy', 'cần sa', 'heroin', 'thuốc phiện',
    
    // Tiếng Việt (Thô tục)
    'đm', 'vcl', 'chửi',
    
    // English (Extreme Violence / Weapons)
    'blood', 'kill', 'dead', 'death', 'gun', 'bomb', 'suicide',
    
    // English (Adult / Sensitive)
    'porn', 'erotic', 'hentai', 'breast', 'naked',
    
    // English (Extreme Substances)
    'cocaine', 'heroin', 'ecstasy',
    
    // English (Profanity)
    'swear', 'curse', 'insult'
];

const PERSONAL_INFO_KEYWORDS = [
    'trường', 'địa chỉ', 'nhà ở', 'số điện thoại', 'tên tôi là', 'tên em là', 'tên tớ là', 'học ở', 'lớp mấy'
];

export function checkPromptSafety(promptText, currentModule, isImg2Vid) {
    const normalizeStr = str => str.toLowerCase().normalize('NFC');
    const cleanPrompt = ' ' + promptText.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim() + ' ';

    // Replace safe phrases containing "trường" to avoid false positives (e.g., "môi trường")
    let testPrompt = cleanPrompt;
    const safePhrases = [
        'môi trường',
        'từ trường',
        'điện trường',
        'trường hợp',
        'thị trường',
        'quảng trường',
        'chiến trường',
        'trọng trường',
        'trường thành',
        'vạn lý trường thành'
    ];
    safePhrases.forEach(phrase => {
        testPrompt = testPrompt.split(phrase).join('safe_word');
    });

    // 1. Check personal info
    const hasPersonalInfo = PERSONAL_INFO_KEYWORDS.some(keyword => {
        const normalizedKeyword = normalizeStr(keyword);
        return testPrompt.includes(normalizedKeyword);
    });

    if (hasPersonalInfo) {
        return {
            ok: false,
            message: "Hãy giữ an toàn bằng cách không nhập tên thật, trường học hoặc địa chỉ của mình vào câu lệnh nhé! 🔒"
        };
    }

    // 2. Check blacklist
    const hasBadWord = BLACKLIST.some(word => {
        const normalizedWord = normalizeStr(word);
        return cleanPrompt.includes(' ' + normalizedWord + ' ') || cleanPrompt.includes(' ' + normalizedWord + ',') || cleanPrompt.includes(' ' + normalizedWord + '.');
    });

    if (hasBadWord) {
        let suggestion = "";
        if (isImg2Vid) {
            suggestion = "cánh cổng vũ trụ mở ra lấp lánh";
        } else {
            switch (currentModule) {
                case 'comic':
                    suggestion = "một chú mèo máy đeo balo đang đi học";
                    break;
                case 'game':
                    suggestion = "một chú khủng long xanh lá đang cầm gậy phép thuật pha lê";
                    break;
                case 'character':
                    suggestion = "chú gấu trúc béo ú mặc áo phao đỏ";
                    break;
                case 'science':
                    suggestion = "vòng tuần hoàn của nước với những giọt nước cười vui";
                    break;
                case 'sketch':
                    suggestion = "một con tàu vũ trụ đang bay giữa các vì sao lấp lánh";
                    break;
                default:
                    suggestion = "một chú cún dễ thương";
            }
        }
        return {
            ok: false,
            message: `Ý tưởng này chưa phù hợp với lớp học của chúng mình rồi. Hãy thử những ý tưởng dễ thương khác xem sao nhé! Gợi ý: '${suggestion}'`
        };
    }

    return { ok: true };
}
