import { appState, LIMITS, SCIENCE_TEMPLATES, AI_LITERACY_CARDS, FUNNY_WAITING_QUOTES, checkLimits, incrementUsageCount, saveSession } from './state.js';
import { SVG_ICONS, getOptionIcon } from './icons.js';
import { checkPromptSafety } from './safety.js';
import { renderComparisonView } from './comparison.js';
import { pushToClassGallery } from './gallery.js';

// Initialize global variables on window
window.currentBlocks = {};
window.uploadedRefImage = null;
window.currentAspectRatio = '--ar 1:1';

export const MODULES = [
    { id: 'comic', name: 'Xưởng Truyện Tranh', desc: 'Sáng tạo truyện tranh của riêng em', icon: SVG_ICONS.comic, refText: 'Tải lên nhân vật hoặc bối cảnh' },
    { id: 'character', name: 'Tạo Nhân Vật', desc: 'Tạo hình chú Mascot dễ thương của riêng em', icon: SVG_ICONS.character, refText: 'Tải lên mẫu nhân vật tham khảo' },
    { id: 'science', name: 'Xưởng Khoa Học Vui', desc: 'Minh họa hiện tượng và phát minh khoa học bằng AI', icon: SVG_ICONS.science, refText: 'Tải lên hình ảnh sơ đồ tham chiếu' },
    { id: 'sketch', name: 'Vẽ tranh cùng AI', desc: 'Tô màu và hoàn thiện nét vẽ phác thảo của em bằng AI', icon: SVG_ICONS.sketch, refText: 'Tải lên bản vẽ phác thảo của em' },
    { id: 'infographic', name: 'Sáng tạo Infographic', desc: 'Thiết kế sơ đồ thông tin trực quan sinh động bằng AI', icon: SVG_ICONS.infographic, refText: 'Tải lên sơ đồ hoặc bố cục tham khảo' }
];

export const CHIP_POOL = {
    comicPanels: [
        { id: '1 panel', label: '1 ô hình (Mô tả chính)', vn: 'phân cảnh 1 ô' },
        { id: '2 panels', label: '2 ô hình (Kép)', vn: 'phân cảnh 2 ô' },
        { id: '4 panels', label: '4 ô hình (Tiêu chuẩn)', vn: 'phân cảnh 4 ô' },
        { id: '6 panels', label: '6 ô hình (Nhanh)', vn: 'phân cảnh 6 ô' }
    ],
    comicStyle: [
        { id: 'manga', label: 'Truyện tranh Nhật Bản (Manga)', vn: 'phong cách Manga' },
        { id: 'webtoon', label: 'Truyện tranh Hàn Quốc (Webtoon)', vn: 'phong cách Webtoon' },
        { id: 'marvel_dc', label: 'Siêu anh hùng truyện tranh Mỹ', vn: 'phong cách truyện tranh Marvel DC' },
        { id: 'pop_art', label: 'Nghệ thuật Pop Art màu sắc', vn: 'phong cách Pop Art' }
    ],
    comicContext: [
        { id: 'neon_city', label: 'Thành phố phát sáng (Neon)', vn: 'thành phố Neon rực rỡ' },
        { id: 'cyberpunk_alley', label: 'Hẻm nhỏ hiện đại', vn: 'hẻm phố hiện đại' },
        { id: 'space_battle', label: 'Chiến đấu ngoài vũ trụ', vn: 'trận chiến vũ trụ' },
        { id: 'magical_forest', label: 'Khu rừng phép thuật', vn: 'khu rừng ma thuật' }
    ],
    gameStyle: [
        { id: 'pixel_art', label: 'Điểm ảnh cổ điển (Pixel Art)', vn: 'phong cách đồ họa Pixel Art hoài cổ' },
        { id: 'low_poly', label: 'Hình khối 3D (Low Poly)', vn: 'phong cách đồ họa Low Poly 3D độc đáo' },
        { id: 'aaa_realistic', label: 'Đồ họa 3D sắc nét tả thực', vn: 'phong cách game 3D tả thực AAA chất lượng cao' },
        { id: 'cel_shaded', label: 'Hoạt hình viền đen (Cel-Shaded)', vn: 'phong cách hoạt hình Cel-Shaded độc đáo' }
    ],
    gender: [
        { id: 'nam', label: 'Nam', vn: 'nhân vật nam' },
        { id: 'nu', label: 'Nữ', vn: 'nhân vật nữ' },
        { id: 'khac', label: 'Khác', vn: 'nhân vật' }
    ],
    country: [
        { id: 'vietnam', label: 'Việt Nam', vn: 'phong cách Việt Nam' },
        { id: 'korea', label: 'Hàn Quốc', vn: 'phong cách Hàn Quốc' },
        { id: 'japan', label: 'Nhật Bản', vn: 'phong cách Nhật Bản' },
        { id: 'usa', label: 'Mỹ', vn: 'phong cách Mỹ' },
        { id: 'europe', label: 'Châu Âu', vn: 'phong cách Âu Mỹ' }
    ],
    age: [
        { id: 'child', label: 'Trẻ em', vn: 'độ tuổi trẻ em' },
        { id: 'teen', label: 'Thiếu niên', vn: 'độ tuổi thiếu niên' },
        { id: 'young_adult', label: 'Thanh niên', vn: 'độ tuổi thanh niên' },
        { id: 'adult', label: 'Người lớn', vn: 'độ tuổi trung niên' },
        { id: 'elderly', label: 'Người cao tuổi', vn: 'độ tuổi lớn tuổi' }
    ],
    characterStyle: [
        { id: 'mascot_cute', label: 'Mascot hoạt hình dễ thương', vn: 'phong cách mascot dễ thương thương hiệu (cute cartoon mascot)' },
        { id: 'chibi_3d', label: '3D Chibi đáng yêu', vn: 'phong cách 3D chibi đáng yêu (cute 3D chibi style)' },
        { id: 'crayon_hand', label: 'Vẽ tay màu sáp trẻ em', vn: 'phong cách tranh vẽ màu sáp trẻ em (childlike crayon drawing style)' },
        { id: 'anime_chibi', label: 'Chibi hoạt hình ngọt ngào', vn: 'phong cách hoạt hình chibi (anime chibi style)' }
    ],
    scienceStyle: [
        { id: 'diagram', label: 'Sơ đồ khoa học có chú thích', vn: 'phong cách sơ đồ khoa học giáo dục trực quan có chú thích (educational science diagram illustration)' },
        { id: 'model_3d', label: 'Mô hình khoa học 3D sinh động', vn: 'phong cách mô hình khoa học 3D cắt lớp sinh động trực quan (vibrant 3D scientific model showcase)' },
        { id: 'watercolor', label: 'Tranh vẽ màu nước tinh tế', vn: 'phong cách vẽ màu nước giáo dục tinh tế (artistic educational watercolor scientific illustration)' },
        { id: 'blueprint', label: 'Bản vẽ kỹ thuật vui nhộn', vn: 'phong cách bản vẽ phác thảo kỹ thuật cơ khí vui nhộn (fun engineering blueprint drawing)' }
    ],
    scienceContext: [
        { id: 'lab', label: 'Trong phòng thí nghiệm bác học', vn: 'trong phòng thí nghiệm khoa học hiện đại chứa nhiều dụng cụ kính hiển vi ống nghiệm' },
        { id: 'nature', label: 'Ngoài thiên nhiên kỳ thú', vn: 'ngoài môi trường tự nhiên sinh thái hoang dã hoặc không gian vũ trụ bao la' },
        { id: 'book', label: 'Trên trang sách RiSuPia', vn: 'được trình bày đẹp mắt trên trang sách giáo khoa khoa học của RiSuPia' }
    ],
    generalAtmosphere: [
        { id: 'dreamy', label: 'Mộng mơ', vn: 'bầu không khí mộng mơ kỳ ảo' },
        { id: 'mysterious', label: 'Bí ẩn', vn: 'bầu không khí bí ẩn tò mò' },
        { id: 'epic', label: 'Kỳ vĩ, tráng lệ', vn: 'bầu không khí tráng lệ hùng vĩ' },
        { id: 'nostalgic', label: 'Hoài cổ, xưa cũ', vn: 'bầu không khí hoài cổ ấm áp đầy kỷ niệm' }
    ],
    textLanguage: [
        { id: 'english', label: 'Chữ tiếng Anh', vn: 'chữ viết hiển thị bằng tiếng Anh (English text)' },
        { id: 'vietnamese', label: 'Chữ tiếng Việt', vn: 'chữ viết hiển thị bằng tiếng Việt (Vietnamese text)' },
        { id: 'japanese', label: 'Chữ tiếng Nhật', vn: 'chữ viết hiển thị bằng tiếng Nhật (Japanese text)' },
        { id: 'korean', label: 'Chữ tiếng Hàn', vn: 'chữ viết hiển thị bằng tiếng Hàn (Korean text)' }
    ],
    sketchStyle: [
        { id: 'colored_pencil', label: 'Tô màu chì sáp tinh nghịch', vn: 'phong cách tô vẽ màu chì sáp tinh nghịch đầy màu sắc (colorful crayon and colored pencil drawing style)' },
        { id: 'anime', label: 'Hoạt hình Nhật Bản (Anime)', vn: 'phong cách hoạt hình Anime Nhật Bản sinh động (vibrant Japanese anime style)' },
        { id: 'watercolor', label: 'Màu nước truyền thống nghệ thuật', vn: 'phong cách màu nước loang mềm mại đậm tính nghệ thuật (soft artistic watercolor painting style)' },
        { id: 'model_3d', label: 'Mô hình hoạt hình 3D sinh động', vn: 'phong cách hoạt hình 3D sinh động bóng bẩy (vibrant 3D cartoon render style)' },
        { id: 'realistic', label: 'Tranh sắc nét tả thực', vn: 'phong cách tả thực sắc nét chi tiết hoàn thiện (detailed realistic rendering style)' }
    ],
    infoLayout: [
        { id: 'timeline', label: 'Dòng thời gian (Timeline)', vn: 'bố cục dòng thời gian (timeline structure)' },
        { id: 'comparison', label: 'So sánh đối chiếu (Comparison)', vn: 'bố cục biểu đồ so sánh đối chiếu' },
        { id: 'mindmap', label: 'Bản đồ tư duy (Mindmap)', vn: 'bố cục bản đồ tư duy (mindmap structure)' },
        { id: 'hierarchical', label: 'Sơ đồ cây phân cấp (Hierarchy)', vn: 'bố cục sơ đồ cây phân cấp' }
    ],
    infoStyle: [
        { id: 'flat_design', label: 'Phẳng hiện đại (Flat Design)', vn: 'phong cách thiết kế phẳng hiện đại (clean flat design infographic style)' },
        { id: 'cartoon_doodle', label: 'Vẽ tay ngộ nghĩnh (Cartoon Doodle)', vn: 'phong cách vẽ tay hoạt hình doodle ngộ nghĩnh' },
        { id: 'isometric_3d', label: 'Không gian 3D giả lập (Isometric 3D)', vn: 'phong cách 3D isometric trực quan sinh động' },
        { id: 'minimalist', label: 'Tối giản thanh lịch (Minimalist)', vn: 'phong cách tối giản tinh tế thanh lịch' }
    ]
};

// Add "Bỏ chọn" dynamically
for (const key in CHIP_POOL) {
    if (key !== 'comicPanels' && key !== 'vidRatio') {
        // Prevent duplicate "-- Bỏ chọn --" items if studio.js is reloaded
        if (!CHIP_POOL[key].some(c => c.id === 'none')) {
            CHIP_POOL[key].unshift({ id: 'none', label: '-- Bỏ chọn --' });
        }
    }
}

export const MODULE_FIELDS = {
    'comic': [
        { type: 'text', id: 'comic-char-name', title: '1. Tên nhân vật (Nếu muốn)', placeholder: 'Ví dụ: Dế Mèn, Thỏ Ngọc...' },
        { type: 'text', id: 'comic-char-desc', title: '2. Vẽ cái gì? Ai là nhân vật? (Bắt buộc)', placeholder: 'Ví dụ: một chú mèo máy mập mạp màu xanh da trời...' },
        { type: 'text', id: 'comic-action', title: '3. Đang làm gì? (Bắt buộc)', placeholder: 'Ví dụ: đang bay bằng chong chóng tre trên bầu trời...' },
        { type: 'select', category: 'comicPanels', title: '4. Chia làm mấy ô hình?' },
        { type: 'select', category: 'comicStyle', title: '5. Vẽ theo kiểu nào?' },
        { type: 'select', category: 'comicContext', title: '6. Ở đâu? Lúc nào?' },
        { type: 'select', category: 'generalAtmosphere', title: '7. Cảm giác thế nào?' },
        { type: 'select', category: 'textLanguage', title: '8. Có chữ tiếng gì?' }
    ],
    'game': [
        { type: 'text', id: 'game-char-name', title: '1. Tên nhân vật / Vật phẩm (Nếu muốn)', placeholder: 'Ví dụ: Kiếm Sấm Sét, Khiên Ánh Sáng...' },
        { type: 'text', id: 'game-desc', title: '2. Vẽ cái gì? Chi tiết trang bị? (Bắt buộc)', placeholder: 'Ví dụ: kiếm rực lửa với chuôi bằng sừng rồng...' },
        { type: 'select', category: 'gameStyle', title: '3. Vẽ theo kiểu nào?' },
        { type: 'select', category: 'comicContext', title: '4. Ở đâu? Lúc nào?' },
        { type: 'select', category: 'gender', title: '5. Giới tính nhân vật?' },
        { type: 'select', category: 'country', title: '6. Quốc gia / Khu vực?' },
        { type: 'select', category: 'age', title: '7. Độ tuổi nhân vật?' },
        { type: 'select', category: 'generalAtmosphere', title: '8. Cảm giác thế nào?' },
        { type: 'select', category: 'textLanguage', title: '9. Có chữ tiếng gì?' }
    ],
    'character': [
        { type: 'text', id: 'char-name', title: '1. Tên nhân vật (Nếu muốn)', placeholder: 'Ví dụ: Gấu Bông, Rồng Con...' },
        { type: 'text', id: 'char-shape', title: '2. Con vật hoặc hình dáng gì? (Bắt buộc)', placeholder: 'Ví dụ: chú gấu trúc tròn xoe béo ú...' },
        { type: 'text', id: 'char-outfit', title: '3. Trang phục & phụ kiện? (Bắt buộc)', placeholder: 'Ví dụ: đội mũ bảo hiểm phi hành gia, đeo balo đỏ...' },
        { type: 'text', id: 'char-action', title: '4. Đang làm gì? (Bắt buộc)', placeholder: 'Ví dụ: đang ngồi gặm kẹo mút cười tít mắt...' },
        { type: 'select', category: 'characterStyle', title: '5. Vẽ theo kiểu nào?' },
        { type: 'select', category: 'comicContext', title: '6. Ở đâu? Lúc nào?' },
        { type: 'select', category: 'generalAtmosphere', title: '7. Cảm giác thế nào?' },
        { type: 'select', category: 'textLanguage', title: '8. Có chữ tiếng gì?' }
    ],
    'science': [
        { type: 'text', id: 'science-topic', title: '1. Tên hiện tượng / Phát minh khoa học (Bắt buộc)', placeholder: 'Ví dụ: vòng tuần hoàn của nước, xe ô tô năng lượng mặt trời...' },
        { type: 'text', id: 'science-details', title: '2. Chi tiết vẽ? (Bắt buộc)', placeholder: 'Ví dụ: mặt trời chiếu nắng làm nước bốc hơi thành mây, kèm mũi tên quy trình...' },
        { type: 'select', category: 'scienceStyle', title: '3. Vẽ theo kiểu nào?' },
        { type: 'select', category: 'scienceContext', title: '4. Ở đâu? Lúc nào?' },
        { type: 'select', category: 'generalAtmosphere', title: '5. Cảm giác thế nào?' },
        { type: 'select', category: 'textLanguage', title: '6. Có chữ tiếng gì?' }
    ],
    'sketch': [
        { type: 'file', id: 'sketch-upload', title: '1. Bản phác thảo của em (Bắt buộc)', placeholder: 'Chụp ảnh nét vẽ trên giấy của em rồi tải lên đây nhé!' },
        { type: 'text', id: 'sketch-desc', title: '2. Bức tranh vẽ gì? Ý tưởng? (Bắt buộc)', placeholder: 'Ví dụ: chú thỏ con ôm củ cà rốt, phi thuyền bay giữa vũ trụ...' },
        { type: 'select', category: 'sketchStyle', title: '3. Vẽ theo kiểu nào? (Bắt buộc)' },
        { type: 'select', category: 'comicContext', title: '4. Ở đâu? Lúc nào?' },
        { type: 'select', category: 'generalAtmosphere', title: '5. Cảm giác thế nào?' },
        { type: 'select', category: 'textLanguage', title: '6. Có chữ tiếng gì?' }
    ],
    'infographic': [
        { type: 'text', id: 'info-topic', title: '1. Tên chủ đề / Tên Infographic (Nếu muốn)', placeholder: 'Ví dụ: Lịch sử loài người, Sự phát triển của loài ong...' },
        { type: 'text', id: 'info-details', title: '2. Nội dung / Thông tin muốn vẽ? (Bắt buộc)', placeholder: 'Ví dụ: các mốc thời gian phát triển, sơ đồ giải thích quy trình thụ phấn...' },
        { type: 'select', category: 'infoLayout', title: '3. Bố cục thông tin như thế nào?' },
        { type: 'select', category: 'infoStyle', title: '4. Vẽ theo kiểu phong cách nào?' },
        { type: 'select', category: 'generalAtmosphere', title: '5. Cảm giác thế nào?' },
        { type: 'select', category: 'textLanguage', title: '6. Có chữ tiếng gì?' }
    ]
};

export const BLOCK_NAMES = {
    comicPanels: 'Số ô truyện',
    comicStyle: 'Phong cách truyện tranh',
    comicContext: 'Bối cảnh',
    gameStyle: 'Phong cách Đồ họa',
    characterStyle: 'Phong cách tạo nhân vật',
    scienceStyle: 'Phong cách sơ đồ',
    scienceContext: 'Bối cảnh khoa học',
    sketchStyle: 'Phong cách vẽ',
    gender: 'Giới tính',
    country: 'Quốc gia/Khu vực',
    age: 'Độ tuổi',
    generalAtmosphere: 'Cảm xúc',
    textLanguage: 'Ngôn ngữ chữ viết',
    infoLayout: 'Bố cục Infographic',
    infoStyle: 'Phong cách Infographic'
};

export function updateMasterPrompt() {
    const finalPrompt = document.getElementById('final-prompt');
    if (!finalPrompt) return;

    let templateText = "";
    let templateHtml = "";
    let formulaText = "";
    const module = appState.currentModule;

    if (module === 'comic') {
        const charName = document.getElementById('comic-char-name')?.value.trim() || "";
        const charDesc = document.getElementById('comic-char-desc')?.value.trim() || "";
        const action = document.getElementById('comic-action')?.value.trim() || "đang đứng";
        let charStr = "";
        if (charName && charDesc) charStr = `nhân vật ${charName} (${charDesc})`;
        else if (charDesc) charStr = `nhân vật ${charDesc}`;
        else if (charName) charStr = `nhân vật ${charName}`;
        else charStr = "một nhân vật";
        
        templateText = `Tranh truyện tranh vẽ ${charStr} ${action}, [comicPanels], [comicStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        templateHtml = `Tranh truyện tranh vẽ <span class="prompt-token tag-subject">${charStr}</span> <span class="prompt-token tag-action">${action}</span>, [comicPanels], [comicStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        formulaText = "📝 Công thức: [Nhân vật] + [Hành động] + [Chia ô] + [Phong cách] + [Bối cảnh]";

    } else if (module === 'game') {
        const name = document.getElementById('game-char-name')?.value.trim() || "";
        const desc = document.getElementById('game-desc')?.value.trim() || "nhân vật";
        let subjectStr = "";
        if (name) subjectStr = `nhân vật game tên '${name}' (${desc})`;
        else subjectStr = `nhân vật game ${desc}`;
        
        templateText = `Bản vẽ concept art game của ${subjectStr} [gender] [country] [age], [gameStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        templateHtml = `Bản vẽ concept art game của <span class="prompt-token tag-subject">${subjectStr}</span> [gender] [country] [age], [gameStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        formulaText = "🎮 Công thức: [Nhân vật/Vật phẩm] + [Mô tả trang bị] + [Kiểu đồ họa] + [Môi trường]";

    } else if (module === 'character') {
        const name = document.getElementById('char-name')?.value.trim() || "";
        const shape = document.getElementById('char-shape')?.value.trim() || "một chú mascot";
        const outfit = document.getElementById('char-outfit')?.value.trim() || "";
        const action = document.getElementById('char-action')?.value.trim() || "";
        
        let charStr = shape;
        if (name) charStr = `nhân vật mascot tên '${name}' hình dạng ${shape}`;
        let outfitStr = outfit ? `, mặc ${outfit}` : "";
        let actionStr = action ? `, đang ${action}` : "";
        
        templateText = `Bản vẽ thiết kế nhân vật mascot hoạt hình tinh nghịch dễ thương về ${charStr}${outfitStr}${actionStr}, [characterStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        templateHtml = `Bản vẽ thiết kế nhân vật mascot hoạt hình tinh nghịch dễ thương về <span class="prompt-token tag-subject">${charStr}</span><span class="prompt-token tag-action">${outfitStr}${actionStr}</span>, [characterStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        formulaText = "🧸 Công thức: [Nhân vật] + [Hình dáng] + [Trang phục] + [Hành động] + [Phong cách]";

    } else if (module === 'science') {
        const topic = document.getElementById('science-topic')?.value.trim() || "hiện tượng khoa học";
        const details = document.getElementById('science-details')?.value.trim() || "";
        let detailStr = details ? `, mô tả chi tiết ${details}` : "";
        
        templateText = `Tranh minh họa khoa học giáo dục trực quan sinh động về đề tài '${topic}'${detailStr}, [scienceStyle], bối cảnh [scienceContext], [generalAtmosphere], [textLanguage]`;
        templateHtml = `Tranh minh họa khoa học giáo dục trực quan sinh động về đề tài <span class="prompt-token tag-subject">'${topic}'</span><span class="prompt-token tag-action">${detailStr}</span>, [scienceStyle], bối cảnh [scienceContext], [generalAtmosphere], [textLanguage]`;
        formulaText = "🔬 Công thức: [Hiện tượng/Phát minh] + [Chi tiết vẽ] + [Phong cách vẽ] + [Bối cảnh]";
    } else if (module === 'sketch') {
        const idea = document.getElementById('sketch-desc')?.value.trim() || "bức tranh phác thảo";
        templateText = `Tranh vẽ hoàn thiện tô màu sinh động từ bản vẽ phác thảo mô tả về ${idea}, [sketchStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        templateHtml = `Tranh vẽ hoàn thiện tô màu sinh động từ bản vẽ phác thảo mô tả về <span class="prompt-token tag-subject">${idea}</span>, [sketchStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;
        formulaText = "🎨 Công thức: [Bản phác thảo] + [Ý tưởng] + [Phong cách] + [Bối cảnh]";
    } else if (module === 'infographic') {
        const topic = document.getElementById('info-topic')?.value.trim() || "chủ đề thông tin";
        const details = document.getElementById('info-details')?.value.trim() || "";
        let detailStr = details ? `, mô tả chi tiết nội dung ${details}` : "";
        
        templateText = `Thiết kế sơ đồ thông tin trực quan sinh động Infographic về '${topic}'${detailStr}, [infoLayout], [infoStyle], [generalAtmosphere], [textLanguage]`;
        templateHtml = `Thiết kế sơ đồ thông tin trực quan sinh động Infographic về <span class="prompt-token tag-subject">'${topic}'</span><span class="prompt-token tag-action">${detailStr}</span>, [infoLayout], [infoStyle], [generalAtmosphere], [textLanguage]`;
        formulaText = "📊 Công thức: [Tên Infographic] + [Nội dung chi tiết] + [Bố cục] + [Phong cách]";
    }

    const blocksList = [
        'comicPanels', 'comicStyle', 'comicContext', 'gameStyle', 'characterStyle', 'scienceStyle', 'scienceContext', 'sketchStyle',
        'gender', 'country', 'age', 'generalAtmosphere', 'textLanguage', 'infoLayout', 'infoStyle'
    ];
    
    const BLOCK_TAGS = {
        comicStyle: 'tag-style',
        gameStyle: 'tag-style',
        characterStyle: 'tag-style',
        scienceStyle: 'tag-style',
        sketchStyle: 'tag-style',
        infoStyle: 'tag-style',
        comicContext: 'tag-context',
        scienceContext: 'tag-context',
        infoLayout: 'tag-context',
        generalAtmosphere: 'tag-vibe',
        comicPanels: 'tag-subject',
        gender: 'tag-subject',
        country: 'tag-subject',
        age: 'tag-subject',
        textLanguage: 'tag-vibe'
    };

    blocksList.forEach(block => {
        const val = window.currentBlocks[block];
        if (val && val !== 'none') {
            const chipsData = CHIP_POOL[block];
            const selectedChip = chipsData ? chipsData.find(c => c.id === val) : null;
            let vnVal = selectedChip ? (selectedChip.vn || selectedChip.label) : val;
            if (block === 'textLanguage' && !selectedChip) {
                vnVal = `chữ viết hiển thị bằng ${val.toLowerCase()} (text in ${val.toLowerCase()})`;
            }
            templateText = templateText.replace(`[${block}]`, vnVal);
            
            const tagClass = BLOCK_TAGS[block];
            const htmlVal = tagClass ? `<span class="prompt-token ${tagClass}">${vnVal}</span>` : vnVal;
            templateHtml = templateHtml.replace(`[${block}]`, htmlVal);
        } else {
            templateText = templateText.replace(`[${block}]`, '');
            templateHtml = templateHtml.replace(`[${block}]`, '');
        }
    });

    templateText = templateText.replace(/,(\s*,)+/g, ',').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim().replace(/,\s*$/, '');
    templateHtml = templateHtml.replace(/,(\s*,)+/g, ',').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim().replace(/,\s*$/, '');
    
    finalPrompt.value = templateText;
    
    const livePreview = document.getElementById('live-prompt-preview');
    if (livePreview) {
        livePreview.innerHTML = templateHtml || `<span style="color:var(--text-muted)">Bắt đầu nhập liệu để thấy câu lệnh hình thành...</span>`;
    }
    const formulaBadge = document.getElementById('prompt-formula-badge');
    if (formulaBadge) {
        formulaBadge.innerHTML = formulaText;
    }
}

export function applyScienceTemplate(idx) {
    const t = SCIENCE_TEMPLATES[idx];
    if (!t) return;
    const topicInput = document.getElementById('science-topic');
    const detailsInput = document.getElementById('science-details');
    if (topicInput) topicInput.value = t.topic;
    if (detailsInput) detailsInput.value = t.details;
    
    // Auto-select dropdown items if template specifies style/context
    if (t.style) {
        window.currentBlocks['scienceStyle'] = t.style;
        const select = document.querySelector(`.custom-select[data-category="scienceStyle"]`);
        if (select) {
            const item = select.querySelector(`.option-item[data-val="${t.style}"]`);
            if (item) {
                select.querySelectorAll('.option-item').forEach(o => o.classList.remove('selected'));
                item.classList.add('selected');
                const label = item.querySelector('.option-label').innerText;
                select.querySelector('.trigger-text').innerText = label;
                select.querySelector('.trigger-text').style.color = 'var(--primary-color)';
            }
        }
    }

    if (t.context) {
        window.currentBlocks['scienceContext'] = t.context;
        const select = document.querySelector(`.custom-select[data-category="scienceContext"]`);
        if (select) {
            const item = select.querySelector(`.option-item[data-val="${t.context}"]`);
            if (item) {
                select.querySelectorAll('.option-item').forEach(o => o.classList.remove('selected'));
                item.classList.add('selected');
                const label = item.querySelector('.option-label').innerText;
                select.querySelector('.trigger-text').innerText = label;
                select.querySelector('.trigger-text').style.color = 'var(--primary-color)';
            }
        }
    }

    window.updateMasterPrompt();
}

export function validateStudioInputs() {
    const module = appState.currentModule;
    if (module === 'comic') {
        const descVal = document.getElementById('comic-char-desc')?.value.trim();
        const actionVal = document.getElementById('comic-action')?.value.trim();
        if (!descVal) {
            alert('Vui lòng nhập mục "2. Vẽ cái gì? Ai là nhân vật? (Bắt buộc)"!');
            document.getElementById('comic-char-desc')?.focus();
            return false;
        }
        if (!actionVal) {
            alert('Vui lòng nhập mục "3. Đang làm gì? (Bắt buộc)"!');
            document.getElementById('comic-action')?.focus();
            return false;
        }
    } else if (module === 'game') {
        const descVal = document.getElementById('game-desc')?.value.trim();
        if (!descVal) {
            alert('Vui lòng nhập mục "2. Vẽ cái gì? Chi tiết trang bị? (Bắt buộc)"!');
            document.getElementById('game-desc')?.focus();
            return false;
        }
    } else if (module === 'character') {
        const shapeVal = document.getElementById('char-shape')?.value.trim();
        const outfitVal = document.getElementById('char-outfit')?.value.trim();
        const actionVal = document.getElementById('char-action')?.value.trim();
        if (!shapeVal) {
            alert('Vui lòng nhập mục "2. Con vật hoặc hình dáng gì? (Bắt buộc)"!');
            document.getElementById('char-shape')?.focus();
            return false;
        }
        if (!outfitVal) {
            alert('Vui lòng nhập mục "3. Trang phục & phụ kiện? (Bắt buộc)"!');
            document.getElementById('char-outfit')?.focus();
            return false;
        }
        if (!actionVal) {
            alert('Vui lòng nhập mục "4. Đang làm gì? (Bắt buộc)"!');
            document.getElementById('char-action')?.focus();
            return false;
        }
    } else if (module === 'science') {
        const topicVal = document.getElementById('science-topic')?.value.trim();
        const detailsVal = document.getElementById('science-details')?.value.trim();
        if (!topicVal) {
            alert('Vui lòng nhập mục "1. Tên hiện tượng / Phát minh khoa học (Bắt buộc)"!');
            document.getElementById('science-topic')?.focus();
            return false;
        }
        if (!detailsVal) {
            alert('Vui lòng nhập mục "2. Chi tiết vẽ? (Bắt buộc)"!');
            document.getElementById('science-details')?.focus();
            return false;
        }
    } else if (module === 'sketch') {
        if (!window.uploadedRefImage) {
            alert('Vui lòng tải lên bức phác thảo của em ở mục "1. Bản phác thảo của em" nhé!');
            return false;
        }
        const descVal = document.getElementById('sketch-desc')?.value.trim();
        if (!descVal) {
            alert('Vui lòng nhập mục "2. Bức tranh vẽ gì? Ý tưởng? (Bắt buộc)"!');
            document.getElementById('sketch-desc')?.focus();
            return false;
        }
        const styleVal = window.currentBlocks['sketchStyle'];
        if (!styleVal || styleVal === 'none') {
            alert('Vui lòng chọn mục "3. Vẽ theo kiểu nào? (Bắt buộc)"!');
            return false;
        }
    }
    return true;
}

export function showResultsCard() {
    const tipsCard = document.getElementById('edu-tips-card');
    const resultsCard = document.getElementById('result-display-card');
    if (tipsCard) tipsCard.style.display = 'none';
    if (resultsCard) resultsCard.style.display = 'flex';
}

export function showTipsCard() {
    const tipsCard = document.getElementById('edu-tips-card');
    const resultsCard = document.getElementById('result-display-card');
    if (tipsCard) tipsCard.style.display = 'block';
    if (resultsCard) resultsCard.style.display = 'none';
}

export function renderResultGrid() {
    const box = document.getElementById('result-display');
    if (!box) return;
    
    if (appState.generatedImages.length === 0) {
        box.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color: var(--text-secondary); font-weight: 500; font-size: 1.1rem;">Khu vực hiển thị kết quả (Chưa có ảnh nào)</div>';
        return;
    }

    const imagesHtml = [...appState.generatedImages].reverse().map((img, idx) => {
        if (img.type === 'video') {
            return `<div class="result-item" onclick="window.showLightbox('${img.url}', 'video')" style="cursor: pointer;"><video src="${img.url}" autoplay loop muted></video></div>`;
        }
        return `<div class="result-item" onclick="window.showLightbox('${img.url}', 'image')" style="cursor: pointer;"><img src="${img.url}" alt="AI Gen"></div>`;
    }).join('');
    
    // Add "Đổi 1 chi tiết & so sánh" button at the top of results if we have at least one image
    const lastImg = [...appState.generatedImages].reverse().find(img => img.type === 'image');
    let comparisonBtnHtml = '';
    if (lastImg && !appState.comparisonMode) {
        comparisonBtnHtml = `
            <button class="btn-modern-tech" id="btn-enter-comparison" onclick="window.enterComparisonMode()" style="margin-bottom: 12px; width: 100%; font-weight: 700; color: var(--primary-blue); display: flex; align-items: center; justify-content: center; gap: 8px;">
                🔄 Đổi 1 chi tiết & xem khác biệt
            </button>
        `;
    }
    
    box.innerHTML = comparisonBtnHtml + '<div class="result-grid">' + imagesHtml + '</div>';
    box.scrollTop = 0;
}

export async function generateAction(isImg2Vid) {
    if (isImg2Vid) {
        if (!checkLimits('videos')) return;
    } else {
        if (!checkLimits('images')) return;
    }

    let promptText = '';
    
    if (isImg2Vid) {
        promptText = document.getElementById('vid-prompt').value.trim();
        if (!window.uploadedRefImage) {
            alert('Vui lòng chọn hoặc dán ảnh tĩnh để làm đầu vào video!');
            return;
        }
    } else {
        const isValid = validateStudioInputs();
        if (!isValid) return;

        promptText = document.getElementById('final-prompt').value.trim();
        if (!promptText && !window.uploadedRefImage && appState.chatRefImages.length === 0) {
            alert('Vui lòng nhập lệnh mô tả ảnh hoặc thêm ảnh tham khảo!');
            return;
        }
    }

    // Safety Filters checking
    const safety = checkPromptSafety(promptText, appState.currentModule, isImg2Vid);
    if (!safety.ok) {
        alert(safety.message);
        return;
    }

    showResultsCard();
    const resultBox = document.getElementById('result-display');
    const initialText = isImg2Vid ? 'Cùng chờ đón video nhé' : 'AI đang sáng tạo...';
    const loadingHtml = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px; padding: 40px 0;"><div class="loading-spinner" style="border: 4px solid rgba(0,0,0,0.1); border-left-color: var(--primary-color); border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite;"></div><span id="loading-message" style="color:var(--primary-color); font-weight: 500;">${initialText}</span></div>`;
    
    // Inject loading indicator above the grid
    resultBox.innerHTML = loadingHtml + resultBox.innerHTML;

    // Cycle waiting messages to keep students engaged after a delay to ensure initial text is visible
    let quoteIndex = 0;
    const timeoutId = setTimeout(() => {
        const intervalId = setInterval(() => {
            const span = document.getElementById('loading-message');
            if (span) {
                span.innerText = FUNNY_WAITING_QUOTES[quoteIndex];
                quoteIndex = (quoteIndex + 1) % FUNNY_WAITING_QUOTES.length;
            } else {
                clearInterval(intervalId);
            }
        }, 10000);
        // Store interval/timeout or just let it clear if node is removed
    }, 4500);
    
    try {
        if (isImg2Vid) {
            const bodyPayload = {
                prompt: promptText,
                aspectRatio: document.querySelector('.custom-select[data-category="vidRatio"] .option-item.selected')?.getAttribute('data-val') || '16:9'
            };
            if (window.uploadedRefImage && window.uploadedRefImage.startsWith('data:image')) {
                bodyPayload.refImageBase64 = window.uploadedRefImage;
            } else if (window.uploadedRefImage) {
                bodyPayload.refImageUrl = window.uploadedRefImage;
            }

            const response = await fetch('/api/generate/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const newVid = { url: data.url, type: 'video', prompt: promptText };
            appState.generatedImages.push(newVid);
            incrementUsageCount('videos');
            saveSession();
            
            // Push to Classroom Gallery as well
            pushToClassGallery(data.url, 'video', promptText);

            renderResultGrid();
        } else {
            let finalStr = promptText;
            
            // Backend prompt engineering for Comic Studio
            if (appState.currentModule === 'comic') {
                const panels = window.currentBlocks['comicPanels'] || '4 panels';
                finalStr = `(comic book page layout, ${panels}, narrative sequence: ${finalStr})`;
            }

            if (window.uploadedRefImage || appState.chatRefImages.length > 0) finalStr += ', (with reference image styling)';
            
            const bodyPayload = {
                prompt: finalStr,
                aspectRatio: window.currentAspectRatio
            };
            if (window.uploadedRefImage && window.uploadedRefImage.startsWith('data:image')) {
                bodyPayload.refImageBase64 = window.uploadedRefImage;
            } else if (window.uploadedRefImage) {
                bodyPayload.refImageUrl = window.uploadedRefImage;
            }

            const response = await fetch('/api/generate/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Preload image
            const img = new Image();
            img.onload = () => {
                const newImg = { url: data.url, type: 'image', prompt: promptText };
                appState.generatedImages.push(newImg);
                incrementUsageCount('images');
                saveSession();
                
                // Push to Classroom Gallery as well
                pushToClassGallery(data.url, 'image', promptText);

                if (appState.comparisonMode && appState.comparisonBase) {
                    renderComparisonView(data.url, promptText);
                } else {
                    renderResultGrid();
                }
            };
            img.onerror = () => {
                resultBox.innerHTML = `<div style="text-align:center; padding: 20px;"><span style="color:#ef4444; font-size:1.1rem">⚠️ Máy chủ AI từ chối tạo ảnh này.</span><br><br><span style="color:var(--text-muted); font-size:0.9rem">Nguyên nhân có thể do mạng, hoặc câu lệnh của bạn vô tình chứa từ khóa nhạy cảm bị bộ lọc của hệ thống AI chặn (VD: bạo lực, người lớn). Hãy đổi câu lệnh và thử lại nhé!</span></div>`;
            };
            img.src = data.url;
        }
    } catch (e) {
        console.error(e);
        resultBox.innerHTML = '<span style="color: #ef4444;">Lỗi tạo file: ' + e.message + '</span>';
    }
}

export function setupChatPaste() {
    const finalPrompt = document.getElementById('final-prompt');
    const container = document.getElementById('pinned-refs-container');
    if (!finalPrompt || !container) return;

    const renderPinned = () => {
        container.innerHTML = appState.chatRefImages.map((src, i) => `
            <div class="pinned-ref-item">
                <img src="${src}">
                <button onclick="window.removeChatRef(${i})">X</button>
            </div>
        `).join('');
    };

    window.removeChatRef = (index) => {
        appState.chatRefImages.splice(index, 1);
        renderPinned();
    };

    finalPrompt.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.items) {
            for (let i = 0; i < e.clipboardData.items.length; i++) {
                if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
                    if (appState.chatRefImages.length >= 2) {
                        alert('Bạn chỉ được dán tối đa 2 ảnh tham khảo ở đây!');
                        break;
                    }
                    const file = e.clipboardData.items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        appState.chatRefImages.push(ev.target.result);
                        renderPinned();
                    };
                    reader.readAsDataURL(file);
                    e.preventDefault(); 
                    break;
                }
            }
        }
    });
}

export function setupReferenceUpload() {
    const zone = document.getElementById('ref-upload-zone');
    const fileInput = document.getElementById('ref-file');
    const previewContainer = document.getElementById('ref-preview-container');
    const previewImg = document.getElementById('ref-preview-img');
    const btnRemove = document.getElementById('btn-remove-ref');
    if (!zone || !fileInput) return;

    zone.addEventListener('click', () => fileInput.click());

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    if (btnRemove) {
        btnRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            window.uploadedRefImage = null;
            previewContainer.style.display = 'none';
            zone.style.display = 'flex';
            fileInput.value = '';
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        
        // Safety check for face photos
        if (!confirm("Lưu ý an toàn: Hình ảnh tải lên KHÔNG ĐƯỢC có chứa mặt người thật hoặc trẻ em. Bé đã kiểm tra kỹ chưa? 📷")) {
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            window.uploadedRefImage = ev.target.result;
            previewImg.src = window.uploadedRefImage;
            zone.style.display = 'none';
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

export function setupSketchUpload() {
    const fileInput = document.getElementById('sketch-upload');
    const zone = document.getElementById('sketch-upload-zone');
    if (!fileInput || !zone) return;

    const uploadText = document.getElementById('sketch-upload-text');
    const previewContainer = document.getElementById('sketch-preview-container');
    const previewImg = document.getElementById('sketch-preview-img');
    const removeBtn = document.getElementById('btn-remove-sketch');

    zone.addEventListener('click', (e) => {
        if (e.target !== fileInput && e.target !== removeBtn) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleSketchFile(e.target.files[0]);
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.uploadedRefImage = null;
            fileInput.value = '';
            previewContainer.style.display = 'none';
            uploadText.style.display = 'block';
            
            const uploadIcon = zone.querySelector('.sketch-upload-icon');
            const uploadSub = zone.querySelector('.sketch-upload-sub');
            if (uploadIcon) uploadIcon.style.display = 'block';
            if (uploadSub) uploadSub.style.display = 'block';
            
            updateMasterPrompt();
        });
    }

    function handleSketchFile(file) {
        if (!file.type.startsWith('image/')) return;

        if (file.size > 20 * 1024 * 1024) {
            alert('Kích thước ảnh phác thảo vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn!');
            return;
        }

        if (!confirm("Lưu ý an toàn: Hình ảnh tải lên KHÔNG ĐƯỢC có chứa mặt người thật hoặc trẻ em. Bé đã kiểm tra kỹ chưa? 📷")) {
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            window.uploadedRefImage = event.target.result;
            previewImg.src = event.target.result;
            previewContainer.style.display = 'block';
            uploadText.style.display = 'none';
            
            const uploadIcon = zone.querySelector('.sketch-upload-icon');
            const uploadSub = zone.querySelector('.sketch-upload-sub');
            if (uploadIcon) uploadIcon.style.display = 'none';
            if (uploadSub) uploadSub.style.display = 'none';
            
            updateMasterPrompt();
        };
        reader.readAsDataURL(file);
    }
}

export function setupPromptBuilderLogic(isImg2Vid) {
    const finalPrompt = document.getElementById('final-prompt');

    if (finalPrompt) {
        finalPrompt.addEventListener('input', () => {
            finalPrompt.style.height = 'auto';
            finalPrompt.style.height = Math.min(finalPrompt.scrollHeight, 120) + 'px';
        });
    }

    document.querySelectorAll('.block-text-input').forEach(input => {
        input.addEventListener('input', () => updateMasterPrompt());
        input.addEventListener('change', () => updateMasterPrompt());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateMasterPrompt();
            }
        });
    });

    // Custom Select Dropdown logic
    document.querySelectorAll('.custom-select').forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelector('.select-options');
        const triggerText = select.querySelector('.trigger-text');
        const isAspectRatio = select.id === 'aspect-ratio-select';

        if (!trigger || !options) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.select-options').forEach(opt => {
                if (opt !== options) opt.classList.remove('show');
            });
            options.classList.toggle('show');
        });

        select.querySelectorAll('.option-item').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                select.querySelectorAll('.option-item').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                const val = option.getAttribute('data-val');
                const label = option.querySelector('.option-label').innerText;
                const category = option.getAttribute('data-category');

                const isNone = val === 'none';
                triggerText.innerText = isNone ? `-- Chọn ${BLOCK_NAMES[category] || ''} --` : label;
                triggerText.style.color = isNone ? 'inherit' : 'var(--primary-color)';
                options.classList.remove('show');

                const customInput = document.querySelector(`.block-custom-input[data-category="${category}"]`);

                if (isAspectRatio) {
                    window.currentAspectRatio = val;
                } else if (finalPrompt) {
                    if (val === 'custom') {
                        if (customInput) {
                            customInput.style.display = 'block';
                            customInput.focus();
                            window.currentBlocks[category] = customInput.value.trim() ? customInput.value.trim() : null;
                        }
                    } else {
                        if (customInput) {
                            customInput.style.display = 'none';
                            customInput.value = '';
                        }
                        if (val === 'none') {
                            window.currentBlocks[category] = null;
                        } else {
                            window.currentBlocks[category] = val;
                        }
                    }
                    updateMasterPrompt();
                }
            });
        });
    });

    // Handle Custom Inputs
    document.querySelectorAll('.block-custom-input').forEach(input => {
        input.addEventListener('input', (e) => {
            input.style.opacity = '1';
            const category = e.target.getAttribute('data-category');
            const val = e.target.value.trim();
            
            if (finalPrompt) {
                window.currentBlocks[category] = val ? val : null;
                updateMasterPrompt();
            }
        });

        const updateCustomText = (e) => {
            const val = e.target.value.trim();
            const category = e.target.getAttribute('data-category');
            if (finalPrompt) {
                window.currentBlocks[category] = val ? val : null;
                updateMasterPrompt();
            }
        };

        input.addEventListener('change', updateCustomText);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateCustomText(e);
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.select-options').forEach(opt => opt.classList.remove('show'));
    });

    if (document.getElementById('btn-generate')) {
        document.getElementById('btn-generate').addEventListener('click', () => generateAction(isImg2Vid));
    }
}

export function renderPlayground() {
    const mod = MODULES.find(m => m.id === appState.currentModule) || MODULES[0];

    let dropdownsHtml = '';
    const fields = MODULE_FIELDS[appState.currentModule] || MODULE_FIELDS['comic'];
    
    // Quick-select template buttons for Fun Science Lab (Xưởng Khoa Học Vui)
    if (appState.currentModule === 'science') {
        let templatesHtml = '';
        SCIENCE_TEMPLATES.forEach((t, i) => {
            templatesHtml += `<button onclick="window.applyScienceTemplate(${i})" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 8px; border: 1px solid rgba(0, 103, 217, 0.25); background: rgba(0, 103, 217, 0.07); color: #0067d9; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;">${t.title}</button>`;
        });
        dropdownsHtml += `
            <div class="block-group" style="margin-bottom: 12px;">
                <div class="block-title">💡 Gợi ý chủ đề khoa học</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                    ${templatesHtml}
                </div>
            </div>
        `;
    }

    const mainFields = fields.filter(f => f.type === 'text' || f.type === 'file');
    const selectFields = fields.filter(f => f.type === 'select');

    let mainFieldsHtml = '';
    mainFields.forEach(field => {
        if (field.type === 'file') {
            mainFieldsHtml += `
                <div class="block-group" style="margin-bottom: 12px;">
                    <div class="block-title" style="font-size:0.82rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">${field.title}</div>
                    <div class="sketch-upload-area" id="sketch-upload-zone" style="border: 2px dashed rgba(0, 103, 217, 0.3); background: rgba(0, 103, 217, 0.03); border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative;">
                        <input type="file" id="${field.id}" accept="image/*" style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;">
                        <div class="sketch-upload-icon" style="font-size: 1.5rem; margin-bottom: 4px;">📝</div>
                        <div class="sketch-upload-text" id="sketch-upload-text" style="font-size: 0.82rem; color: var(--primary-blue); font-weight: 600;">${field.placeholder}</div>
                        <div class="sketch-upload-sub" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Hỗ trợ ảnh JPG, PNG dưới 20MB</div>
                        
                        <!-- Sketch image preview -->
                        <div class="sketch-preview-container" id="sketch-preview-container" style="display: none; margin-top: 8px; position: relative; width: 100%; max-height: 150px; border-radius: 8px; overflow: hidden; border: 1px solid var(--panel-border);">
                            <img id="sketch-preview-img" src="" alt="Sketch Preview" style="max-width: 100%; max-height: 150px; object-fit: contain; display: block; margin: 0 auto;">
                            <button type="button" id="btn-remove-sketch" style="position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.9); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">X</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (field.type === 'text') {
            mainFieldsHtml += `
                <div class="block-group" style="margin-bottom: 12px;">
                    <div class="block-title" style="font-size:0.82rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">${field.title}</div>
                    <input type="text" id="${field.id}" class="input-field block-text-input" placeholder="${field.placeholder}" style="width: 100%; font-size: 0.85rem; padding: 10px;">
                </div>
            `;
        }
    });

    let selectFieldsHtml = '';
    selectFields.forEach(field => {
        const category = field.category;
        const chipsData = CHIP_POOL[category];
        if (!chipsData) return;
        
        let optionsList = chipsData.map(c => 
            `<div class="option-item" data-category="${category}" data-val="${c.id}"><span style="margin-right: 8px;">${getOptionIcon(c.id)}</span><span class="option-label">${c.label}</span></div>`
        ).join('');
        
        const hasCustomInput = category !== 'comicPanels' && category !== 'gender' && category !== 'country' && category !== 'age' && category !== 'characterStyle' && category !== 'scienceStyle' && category !== 'scienceContext' && category !== 'infoLayout' && category !== 'infoStyle';
        
        if (hasCustomInput) {
            optionsList += `<div class="option-item" data-category="${category}" data-val="custom"><span style="margin-right: 8px;">✏️</span><span class="option-label" style="font-weight: 600; color: var(--primary-color);">Ý tưởng tự viết...</span></div>`;
        }

        const customInputHtml = hasCustomInput ? `<input type="text" class="input-field block-custom-input" data-category="${category}" style="margin-top:8px; font-size: 0.85rem; padding: 10px; display: none;" placeholder="Nhập ${field.title.split('. ')[1].toLowerCase()} và nhấn Enter...">` : '';

        selectFieldsHtml += `
            <div class="block-group" style="margin-bottom: 12px;">
                <div class="block-title" style="font-size:0.82rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">${field.title}</div>
                <div class="custom-select" data-category="${category}">
                    <div class="select-trigger" style="padding: 10px 12px; font-size: 0.85rem;">
                        <span class="trigger-text">-- Chọn ${field.title.split('. ')[1]} --</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <div class="select-options">
                        ${optionsList}
                    </div>
                </div>
                ${customInputHtml}
            </div>`;
    });

    dropdownsHtml += `
        <div class="input-group-panel main-idea-group" style="background: rgba(255, 255, 255, 0.45); border: 1px solid rgba(0, 103, 217, 0.08); border-radius: 16px; padding: 14px; margin-bottom: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="font-weight: 700; color: var(--primary-color); margin-bottom: 12px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed rgba(0, 103, 217, 0.15); padding-bottom: 6px;">
                <span>💡</span> Ý TƯỞNG CỦA EM
            </div>
            ${mainFieldsHtml}
        </div>
        <div class="input-group-panel style-custom-group" style="background: rgba(255, 255, 255, 0.45); border: 1px solid rgba(0, 103, 217, 0.08); border-radius: 16px; padding: 14px; margin-bottom: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="font-weight: 700; color: var(--primary-color); margin-bottom: 12px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed rgba(0, 103, 217, 0.15); padding-bottom: 6px;">
                <span>🎨</span> PHONG CÁCH & BỐI CẢNH
            </div>
            ${selectFieldsHtml}
        </div>
    `;

    const playground = document.getElementById('playground-area');
    if (!playground) return;

    // AI Literacy card selection
    const randomFact = AI_LITERACY_CARDS[Math.floor(Math.random() * AI_LITERACY_CARDS.length)];

    playground.innerHTML = `
        <div class="playground-header">
            <h1>${mod.icon} ${mod.name}</h1>
            <p>${mod.desc}</p>
        </div>
        <div class="playground-content">
            <!-- Cột 1: Builder Form (Left side) -->
            <div class="glass-panel builder-area" id="col-builder-form">
                ${dropdownsHtml}
            </div>

            <!-- Cột 2: Prompt Board & Outputs (Right side) -->
            <div class="output-area" style="flex: 1; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; padding-right: 4px;">
                <!-- Comparison Info Banner if comparisonMode is active -->
                ${appState.comparisonMode ? `
                <div class="comparison-banner" style="background: var(--primary-lime); color: #002060; padding: 12px; border-radius: 12px; font-size: 0.88rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(183, 233, 49, 0.2);">
                    <span>🔄 Đang ở chế độ so sánh! Đổi 1 thông tin bên trái và bấm Sinh ảnh AI.</span>
                    <button onclick="window.exitComparisonMode()" style="background: rgba(0,0,0,0.08); border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; font-weight: 700; color: #002060;">Hủy so sánh</button>
                </div>
                ` : ''}

                <!-- Card 1: Bảng Câu Lệnh -->
                <div class="prompt-board-card" style="margin-bottom: 0;">
                    <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between;">
                        <span>✍️ Câu lệnh của em đang thành hình…</span>
                    </h2>
                    
                    <div class="prompt-formula-badge" id="prompt-formula-badge" style="background: rgba(183, 233, 49, 0.12); border: 1px solid rgba(183, 233, 49, 0.25); padding: 8px 12px; border-radius: 8px; font-size: 0.82rem; color: #456100; font-weight: 600; margin-top: 6px;"></div>

                    <div class="live-prompt-box" id="live-prompt-preview" style="margin-top: 8px;">
                        <span style="color:var(--text-muted)">Bắt đầu nhập liệu để thấy câu lệnh hình thành...</span>
                    </div>
                    
                    <!-- Inline Settings & Generate -->
                    <div class="prompt-board-settings">
                        <!-- Custom Select Aspect Ratio -->
                        <div class="custom-select" id="aspect-ratio-select" style="width: 160px; z-index: 101;">
                            <div class="select-trigger" style="padding: 8px 12px; font-size: 0.85rem; height: 38px;">
                                <span class="trigger-text">1:1 (Vuông)</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                            <div class="select-options">
                                <div class="option-item selected" data-val="--ar 1:1"><span style="margin-right: 8px;">⬜</span><span class="option-label">1:1 (Vuông)</span></div>
                                <div class="option-item" data-val="--ar 16:9"><span style="margin-right: 8px;">📺</span><span class="option-label">16:9 (Ngang)</span></div>
                                <div class="option-item" data-val="--ar 9:16"><span style="margin-right: 8px;">📱</span><span class="option-label">9:16 (Dọc)</span></div>
                            </div>
                        </div>

                        <!-- Inline Upload Trigger -->
                        <div class="inline-upload-trigger" id="ref-upload-zone" style="${appState.currentModule === 'sketch' ? 'display: none;' : ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <span style="font-size: 0.85rem;">Ảnh tham khảo (Tùy chọn)</span>
                            <input type="file" id="ref-file" hidden accept="image/*">
                        </div>

                        <!-- Reference Image Preview -->
                        <div class="ref-preview-container" id="ref-preview-container" style="display: none; height: 38px; max-width: 120px; border-radius: 8px; border: 1px solid var(--panel-border); overflow: hidden; position: relative;">
                            <img id="ref-preview-img" src="" alt="Reference" style="height: 100%; width: 100%; object-fit: cover;">
                            <button class="btn-remove-ref" id="btn-remove-ref" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); border: none; color: white; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 9px; line-height: 1;">X</button>
                        </div>

                        <button id="btn-generate" class="btn-primary" style="margin-left: auto; height: 38px; padding: 0 24px; border-radius: 12px; font-size: 0.95rem; font-weight: 700; color: #002060;">✨ Sinh ảnh AI</button>
                    </div>
                </div>

                <!-- Card 2A: Mẹo viết Prompt (Mặc định hiện) -->
                <div class="edu-tips-box" id="edu-tips-card">
                    <h3>💡 Bí kíp ra lệnh cho AI</h3>
                    <p style="margin-bottom: 12px;">Một câu lệnh hoàn chỉnh sẽ giống như một công thức ghép các khối màu sắc lại với nhau:</p>
                    <div class="edu-tip-item"><span class="edu-bullet subject"></span> <span><strong>Vẽ cái gì? Ai là nhân vật? (Chủ thể):</strong> Tên nhân vật, con vật, hình dạng, trang phục.</span></div>
                    <div class="edu-tip-item"><span class="edu-bullet action"></span> <span><strong>Đang làm gì? (Hành động):</strong> Tư thế chạy nhảy, bay lượn, gặm kẹo.</span></div>
                    <div class="edu-tip-item"><span class="edu-bullet style"></span> <span><strong>Vẽ theo kiểu nào? (Phong cách):</strong> Tranh vẽ màu sáp, hoạt hình 3D, truyện tranh Manga.</span></div>
                    <div class="edu-tip-item"><span class="edu-bullet context"></span> <span><strong>Ở đâu? Lúc nào? (Bối cảnh):</strong> Ngoài vũ trụ, trong phòng thí nghiệm, hẻm nhỏ.</span></div>
                    <div class="edu-tip-item"><span class="edu-bullet vibe"></span> <span><strong>Cảm giác thế nào? (Cảm xúc):</strong> Bầu không khí mộng mơ, vui tươi, huyền bí.</span></div>
                    
                    <!-- AI Literacy fact card -->
                    <div class="ai-literacy-card" style="margin-top: 16px; background: rgba(0, 103, 217, 0.08); border: 1px dashed var(--primary-blue); padding: 12px; border-radius: 12px; color: var(--primary-blue); font-weight: 500; font-size: 0.85rem; line-height: 1.4;">
                        <strong>Em có biết? 🧠</strong> <span id="random-ai-fact">${randomFact}</span>
                    </div>
                </div>

                <!-- Card 2B: Vùng kết quả (Mặc định ẩn) -->
                <div class="result-display-card" id="result-display-card" style="display: none; flex: 1; flex-direction: column;">
                    <h3>🖼️ Kết quả sáng tạo</h3>
                    <div class="result-display" id="result-display" style="flex: 1; border: none; box-shadow: none; padding: 0; min-height: unset; background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; display: flex; flex-direction: column;"></div>
                </div>
            </div>
            
            <!-- Hidden containers for code compatibility -->
            <textarea id="final-prompt" style="display: none;"></textarea>
            <div class="pinned-refs" id="pinned-refs-container" style="display: none;"></div>
        </div>
    `;

    setupPromptBuilderLogic(false);
    setupReferenceUpload();
    setupSketchUpload();
    setupChatPaste();
    renderResultGrid();
    
    // Always default to showing tips card
    showTipsCard();

    // Trigger initial master prompt update to populate formula badge and live preview dynamically
    updateMasterPrompt();
}

// Bind functions to window
window.updateMasterPrompt = updateMasterPrompt;
window.applyScienceTemplate = applyScienceTemplate;
window.renderPlayground = renderPlayground;
window.renderResultGrid = renderResultGrid;
