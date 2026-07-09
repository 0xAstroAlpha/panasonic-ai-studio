export const appState = {
    username: '',
    role: '', // 'student' or 'teacher'
    nickname: '',
    avatar: '',
    generatedImages: [],
    currentModule: 'comic',
    view: 'studio', // 'studio', 'gallery', 'video'
    chatRefImages: [], // Tối đa 2 ảnh dán vào khung chat
    gallerySelectMode: false,
    gallerySelectedIndices: [],
    promptStep: 'builder', // 'builder' or 'generator'
    comparisonMode: false,
    comparisonBase: null,
    galleryTab: 'personal' // 'personal' or 'class'
};

export const CREDENTIALS = {
    // Teachers
    'giaovien1': { pass: 'risupia123', role: 'teacher' },
    'giaovien2': { pass: 'risupia123', role: 'teacher' },
    'teacher1': { pass: 'risupia123', role: 'teacher' },
    'teacher2': { pass: 'risupia123', role: 'teacher' },
    // Students
    'hocsinh1': { pass: 'risupia123', role: 'student' },
    'hocsinh2': { pass: 'risupia123', role: 'student' },
    'hocsinh3': { pass: 'risupia123', role: 'student' },
    'student1': { pass: 'risupia123', role: 'student' },
    'student2': { pass: 'risupia123', role: 'student' },
    'student3': { pass: 'risupia123', role: 'student' }
};

export const LIMITS = {
    student: { images: 10, videos: 2 },
    teacher: { images: 100, videos: 20 }
};

export const AVATARS = Array.from({length: 15}, (_, i) => 
    'https://api.dicebear.com/9.x/adventurer/svg?seed=stu' + (i+20) + '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc'
);

export const AI_LITERACY_CARDS = [
    // Cách AI hoạt động
    "🧠 AI không tự nghĩ ra ảnh mới, nó học từ hàng triệu bức tranh của các hoạ sĩ trên khắp thế giới đấy!",
    "🧠 AI giống một người bạn hoạ sĩ rất giỏi, nhưng không đọc được suy nghĩ của em — em kể càng rõ, bạn ấy vẽ càng đúng ý!",
    "🧠 AI không biết em đang nghĩ gì đâu, nó chỉ biết những gì em viết ra thôi!",
    "🧠 Cùng một câu lệnh, AI có thể vẽ ra nhiều bức khác nhau — vì mỗi lần nó lại \"tưởng tượng\" một kiểu!",
    // Bí kíp ra lệnh
    "✍️ Muốn AI vẽ đúng ý, hãy trả lời 5 câu hỏi vàng: Vẽ cái gì? – Đang làm gì? – Kiểu nào? – Ở đâu? – Cảm giác thế nào?",
    "✍️ \"Con mèo\" và \"con mèo cam đang ngủ trên sofa\" cho ra hai bức rất khác nhau. Càng rõ, càng đẹp!",
    "✍️ Chỉ cần đổi một từ trong câu lệnh, bức ảnh có thể đổi hẳn. Thử xem \"vui\" và \"buồn\" khác nhau thế nào nhé!",
    "✍️ Nếu ảnh chưa ưng, đừng tạo lại bừa — hãy sửa câu lệnh cho rõ hơn đã!",
    // AI không hoàn hảo
    "🔍 AI rất giỏi nhưng không phải lúc nào cũng đúng. Em mới là người kiểm tra cuối cùng!",
    "🔍 Trước khi khoe ảnh, hãy làm \"bác sĩ cho AI\": Đếm thử – Nhìn kỹ – Đọc chữ – Đúng ý chưa?",
    "🔍 Thử đếm số ngón tay trong ảnh AI vẽ xem — đôi khi nó vẽ thừa hoặc thiếu đấy!",
    "🔍 AI hay viết sai chữ tiếng Việt lắm! Nhớ đọc lại xem có thiếu dấu hay sai chính tả không nhé!",
    "🔍 Tìm ra lỗi của AI không phải để chê, mà để em sửa câu lệnh cho lần sau tốt hơn!",
    // An toàn
    "🛡️ Đừng bao giờ điền tên thật, trường lớp hay địa chỉ của em vào câu lệnh nhé! 🔒",
    "🛡️ Nếu thấy điều gì lạ hoặc khiến em không thoải mái, hãy nói ngay với thầy cô hoặc bố mẹ!",
    "🛡️ Sáng tạo là để vui — đừng dùng AI để tạo ảnh trêu chọc hay làm bạn buồn!",
    // Tiết kiệm tài nguyên
    "🌱 Mỗi bức ảnh AI tạo ra đều tốn điện đấy! Nghĩ kỹ rồi hãy tạo, giống như tắt đèn khi ra khỏi phòng!",
    "🌱 Sửa câu lệnh cho hay thay vì bấm tạo thật nhiều lần — vừa được ảnh đẹp, vừa đỡ lãng phí!",
    "🌱 Số lượt tạo của em là một món quà. Hãy dùng thật khéo và ý nghĩa nhé!",
    // Bản quyền
    "©️ AI học từ tranh của rất nhiều hoạ sĩ. Hãy là người sáng tạo tử tế và biết ơn họ nhé!",
    "©️ Đừng sao chép y hệt nhân vật của người khác như Elsa hay Doraemon — họ thuộc về người tạo ra chúng!",
    "©️ Bài của bạn là công sức của bạn, không lấy làm của mình nhé!",
    // Em là nhà sáng tạo
    "🎬 AI chỉ là công cụ, còn ý tưởng tuyệt vời là của em. Em mới là đạo diễn!",
    "🎬 Người giỏi dùng AI không phải người bấm nhiều nút, mà là người có ý tưởng hay!",
    "🎬 Đừng để AI nghĩ thay em. Hãy dùng nó để biến ý tưởng của em thành sự thật!"
];

export const FUNNY_WAITING_QUOTES = [
    "🤖 AI đang mài bút chì màu... Chờ tí nhé!",
    "🧠 AI đang vắt óc suy nghĩ ý tưởng của em...",
    "🎨 Đang pha màu nước... Đừng giục, đổ màu bây giờ!",
    "🖌️ AI đang vẽ nét đầu tiên... Đẹp lắm đấy!",
    "⚡ Đang truyền điện vào cọ vẽ... Bzzzt!",
    "🐾 Thêm một chút dễ thương từ Mascot...",
    "🧙‍♂️ AI đang niệm chú: Hô biến ra ảnh đẹp!",
    "🦖 Đang xin ý kiến từ chú khủng long cổ dài...",
    "🌋 Đang đợi núi lửa nguội bớt để vẽ...",
    "🍿 Tranh thủ nháy mắt hoặc uống ngụm nước đi nào!",
    "🚀 Đang bay ra ngoài vũ trụ tìm cảm hứng...",
    "🐙 AI đang vẽ bằng cả 8 vòi bạch tuộc!",
    "🕵️‍♂️ Kiểm tra xem có vẽ nhầm 6 ngón tay không...",
    "😸 Chú mèo cam đang canh máy vẽ...",
    "🧬 Đang giải mã ADN của sự sáng tạo..."
];

export const SCIENCE_TEMPLATES = [
    {
        title: '🌋 Núi lửa phun trào',
        topic: 'Núi lửa phun trào khổng lồ',
        details: 'dung nham nóng chảy màu đỏ cam rực rỡ bốc khói nghi ngút bên sườn núi đá',
        style: 'model_3d',
        context: 'nature'
    },
    {
        title: '💧 Vòng tuần hoàn nước',
        topic: 'Vòng tuần hoàn của nước',
        details: 'những đám mây mưa bốc hơi nước từ mặt biển lên trời kèm mũi tên chỉ dẫn quy trình bốc hơi ngưng tụ',
        style: 'diagram',
        context: 'nature'
    },
    {
        title: '☀️ Xe năng lượng mặt trời',
        topic: 'Xe ô tô chạy bằng năng lượng mặt trời',
        details: 'mô hình xe thiết kế hình quả dưa hấu có các tấm pin mặt trời lấp lánh trên mui xe',
        style: 'blueprint',
        context: 'lab'
    },
    {
        title: '🦕 Thế giới khủng long',
        topic: 'Thế giới khủng long cổ đại',
        details: 'chú khủng long cổ dài ăn cỏ to lớn đứng giữa thung lũng nguyên sinh xanh mát',
        style: 'watercolor',
        context: 'nature'
    },
    {
        title: '🌌 Hố đen vũ trụ',
        topic: 'Hố đen vũ trụ kỳ bí',
        details: 'vòng xoáy năng lượng khổng lồ hút các vệt sáng lấp lánh ngoài không gian bao la',
        style: 'model_3d',
        context: 'nature'
    },
    {
        title: '⚡ Sự tạo thành sấm sét',
        topic: 'Hiện tượng giông bão tạo sấm sét',
        details: 'các đám mây điện tích âm dương va chạm tạo tia sét lấp lánh phóng xuống mặt đất',
        style: 'diagram',
        context: 'nature'
    },
    {
        title: '🧬 Cấu trúc chuỗi DNA',
        topic: 'Chuỗi xoắn kép DNA sinh học',
        details: 'mô hình phân tử xoắn kép phát sáng nhiều màu sắc kết nối giữa các liên kết gen',
        style: 'model_3d',
        context: 'lab'
    },
    {
        title: '🌱 Cây xanh quang hợp',
        topic: 'Quá trình quang hợp của cây xanh',
        details: 'cây xanh hấp thụ ánh sáng mặt trời và khí carbon dioxide để tạo ra khí oxy kèm nhãn chú thích',
        style: 'diagram',
        context: 'nature'
    }
];


export function getUsageKey(type) {
    return `ai_studio_usage_${type}_${appState.username || 'unknown'}_${appState.nickname || 'unknown'}`;
}

export function getUsageCount(type) {
    const key = getUsageKey(type);
    return parseInt(localStorage.getItem(key) || '0', 10);
}

export function incrementUsageCount(type) {
    const key = getUsageKey(type);
    const count = getUsageCount(type) + 1;
    localStorage.setItem(key, count.toString());
}

export function checkLimits(type) {
    const role = appState.role || 'student';
    const limit = LIMITS[role][type];
    const count = getUsageCount(type);
    if (count >= limit) {
        alert(`Bạn đã đạt giới hạn tạo ${type === 'images' ? 'ảnh' : 'video'} (${count}/${limit}). Hãy liên hệ giáo viên để được hỗ trợ!`);
        return false;
    }
    return true;
}

export function saveSession() {
    if (appState.username) {
        localStorage.setItem('ai_studio_current_user', appState.username);
        localStorage.setItem('ai_studio_session_' + appState.username, JSON.stringify(appState));
        // Keep compatibility with Playwright tests checking for the simple key
        localStorage.setItem('ai_studio_session', JSON.stringify(appState));
    }
    if (window.updateSidebarUser) window.updateSidebarUser();
}

export function getQuotaColor(count, limit) {
    const pct = (count / limit) * 100;
    if (pct >= 80) return '#ef4444'; // Red
    if (pct >= 50) return '#ff9f1c'; // Orange
    return 'var(--primary-cyan)'; // Greenish/Cyan
}

export function getQuotaAdvice(imgCount, imgLimit, vidCount, vidLimit) {
    const imgPct = (imgCount / imgLimit) * 100;
    const vidPct = (vidCount / vidLimit) * 100;
    if (imgPct >= 80 || vidPct >= 80) {
        return 'Sắp hết lượt rồi, dùng thật tiết kiệm bé nhé! ⚠️';
    }
    return 'Hãy dùng tài nguyên tiết kiệm nhé! 🌱';
}
