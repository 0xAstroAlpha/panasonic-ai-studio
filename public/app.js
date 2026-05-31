// Dữ liệu ứng dụng
const appState = {
    username: '',
    role: '', // 'student' or 'teacher'
    nickname: '',
    avatar: '',
    generatedImages: [],
    currentModule: 'comic',
    view: 'studio', // 'studio', 'gallery', 'video'
    chatRefImages: [], // Tối đa 2 ảnh dán vào khung chat
    gallerySelectMode: false,
    gallerySelectedIndices: []
};

const CREDENTIALS = {
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

const LIMITS = {
    student: { images: 20, videos: 4 },
    teacher: { images: 100, videos: 20 }
};

function getUsageKey(type) {
    const key = `ai_studio_usage_${type}_${appState.username || 'unknown'}_${appState.nickname || 'unknown'}`;
    return key;
}

function getUsageCount(type) {
    const key = getUsageKey(type);
    return parseInt(localStorage.getItem(key) || '0', 10);
}

function incrementUsageCount(type) {
    const key = getUsageKey(type);
    const count = getUsageCount(type) + 1;
    localStorage.setItem(key, count.toString());
}

function checkLimits(type) {
    const role = appState.role || 'student';
    const limit = LIMITS[role][type];
    const count = getUsageCount(type);
    if (count >= limit) {
        alert(`Bạn đã đạt giới hạn tạo ${type === 'images' ? 'ảnh' : 'video'} (${count}/${limit}). Hãy liên hệ giáo viên để được hỗ trợ!`);
        return false;
    }
    return true;
}

const AVATARS = Array.from({length: 15}, (_, i) => 
    'https://api.dicebear.com/9.x/adventurer/svg?seed=stu' + (i+20) + '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc'
);

const SVG_ICONS = {
    comic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    fashion: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a8.86 8.86 0 0 1-3.63 1.5M4.88 4.6l-1.5.5"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M4 12V6.62c0-.52.26-1 .69-1.28L8 3.5"></path></svg>',
    film: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>',
    game: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>',
    book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    social: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    interior: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    logout: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
};

const MODULES = [
    { id: 'comic', name: 'Comic Studio', desc: 'Sáng tạo truyện tranh', icon: SVG_ICONS.comic, refText: 'Tải lên nhân vật hoặc bối cảnh' },
    { id: 'fashion', name: 'Fashion Studio', desc: 'Thiết kế thời trang', icon: SVG_ICONS.fashion, refText: 'Mô tả chủ thể hoặc tải lên ảnh sản phẩm của bạn' },
    { id: 'film', name: 'Film Poster', desc: 'Làm poster phim', icon: SVG_ICONS.film, refText: 'Tải lên cảnh phác thảo' },
    { id: 'game', name: 'Game Studio', desc: 'Thiết kế nhân vật', icon: SVG_ICONS.game, refText: 'Tải lên concept art' },
    { id: 'book', name: 'Book Cover', desc: 'Làm bìa sách', icon: SVG_ICONS.book, refText: 'Tải lên bản vẽ minh họa' },
    { id: 'social', name: 'Social Post', desc: 'Làm ảnh Marketing', icon: SVG_ICONS.social, refText: 'Dán (Ctrl+V) hoặc tải lên ảnh sản phẩm/phong cách bạn muốn tham chiếu để kết quả tốt hơn' },
    { id: 'interior', name: 'Interior Studio', desc: 'Thiết kế nội thất', icon: SVG_ICONS.interior, refText: 'Tải lên ảnh phòng thô' }
];

const CHIP_POOL = {
    comicPanels: [
        { id: '1 panel', label: '1 Ô truyện (Splash Page)', vn: 'phân cảnh 1 ô' },
        { id: '2 panels', label: '2 Ô truyện (Phân cảnh kép)', vn: 'phân cảnh 2 ô' },
        { id: '4 panels', label: '4 Ô truyện (Tiêu chuẩn)', vn: 'phân cảnh 4 ô' },
        { id: '6 panels', label: '6 Ô truyện (Hành động nhanh)', vn: 'phân cảnh 6 ô' }
    ],
    comicStyle: [
        { id: 'manga', label: 'Manga', vn: 'phong cách Manga' },
        { id: 'webtoon', label: 'Webtoon', vn: 'phong cách Webtoon' },
        { id: 'marvel_dc', label: 'Marvel / DC Comics', vn: 'phong cách truyện tranh Marvel/DC' },
        { id: 'pop_art', label: 'Pop Art', vn: 'phong cách Pop Art' }
    ],
    comicContext: [
        { id: 'neon_city', label: 'Neon City (Thành phố Neon)', vn: 'thành phố Neon rực rỡ' },
        { id: 'cyberpunk_alley', label: 'Cyberpunk Alley (Hẻm Cyberpunk)', vn: 'hẻm phố Cyberpunk' },
        { id: 'space_battle', label: 'Space Battle (Chiến đấu không gian)', vn: 'trận chiến vũ trụ' },
        { id: 'magical_forest', label: 'Magical Forest (Rừng ma thuật)', vn: 'khu rừng ma thuật' }
    ],
    fashionStyle: [
        { id: 'streetwear', label: 'Streetwear', vn: 'phong cách thời trang đường phố (streetwear)' },
        { id: 'haute_couture', label: 'Haute Couture', vn: 'phong cách thời trang cao cấp (haute couture)' },
        { id: 'vintage_90s', label: 'Vintage 90s', vn: 'phong cách thời trang cổ điển thập niên 90 (vintage 90s)' },
        { id: 'techwear', label: 'Techwear', vn: 'phong cách thời trang techwear hiện đại' }
    ],
    fashionContext: [
        { id: 'fashion_runway', label: 'Fashion Runway (Sàn diễn)', vn: 'trên sàn diễn thời trang hoành tráng' },
        { id: 'urban_street', label: 'Urban Street (Đường phố)', vn: 'trên đường phố đô thị nhộn nhịp' },
        { id: 'studio_lighting', label: 'White Studio Lighting', vn: 'trong phòng studio với ánh sáng trắng chuyên nghiệp' }
    ],
    filmGenre: [
        { id: 'sci_fi', label: 'Sci-Fi (Viễn tưởng)', vn: 'thể loại viễn tưởng (Sci-Fi)' },
        { id: 'horror', label: 'Horror (Kinh dị)', vn: 'thể loại kinh dị' },
        { id: 'action', label: 'Action (Hành động)', vn: 'thể loại hành động kịch tính' },
        { id: 'romance', label: 'Romance (Tình cảm)', vn: 'thể loại tình cảm lãng mạn' }
    ],
    filmStyle: [
        { id: 'cinematic', label: 'Cinematic Lighting', vn: 'ánh sáng điện ảnh cinematic' },
        { id: 'noir', label: 'Noir (Trắng đen)', vn: 'phong cách phim đen trắng Noir' },
        { id: 'cyberpunk', label: 'Cyberpunk', vn: 'phong cách tương lai Cyberpunk' },
        { id: 'ghibli', label: 'Ghibli Anime Vibe', vn: 'phong cách hoạt hình Studio Ghibli thơ mộng' },
        { id: 'marvel', label: 'Marvel Superhero Vibe', vn: 'phong cách siêu anh hùng Marvel hoành tráng' },
        { id: 'pixar', label: 'Pixar 3D Animation', vn: 'phong cách hoạt hình 3D Pixar sinh động' },
        { id: 'disney_classic', label: 'Disney Classic Vibe', vn: 'phong cách hoạt hình cổ điển Disney hoài niệm' },
        { id: 'wes_anderson', label: 'Wes Anderson Aesthetic', vn: 'phong cách đối xứng nghệ thuật Wes Anderson với tông màu pastel' },
        { id: 'nolan_dark', label: 'Christopher Nolan Dark Cinematic', vn: 'phong cách điện ảnh tối tăm kịch tính đặc trưng Christopher Nolan' },
        { id: 'shinkai_vibe', label: 'Makoto Shinkai Vibe', vn: 'phong cách vẽ rực rỡ và lấp lánh kiểu Makoto Shinkai' },
        { id: 'star_wars', label: 'Star Wars Sci-Fi Space Opera', vn: 'phong cách viễn tưởng vũ trụ sử thi Star Wars' }
    ],
    gameStyle: [
        { id: 'pixel_art', label: 'Pixel Art', vn: 'phong cách đồ họa Pixel Art hoài cổ' },
        { id: 'low_poly', label: 'Low Poly 3D', vn: 'phong cách đồ họa Low Poly 3D độc đáo' },
        { id: 'aaa_realistic', label: 'AAA Realistic', vn: 'phong cách game 3D tả thực AAA chất lượng cao' },
        { id: 'cel_shaded', label: 'Cel-Shaded', vn: 'phong cách hoạt hình Cel-Shaded độc đáo' }
    ],
    bookGenre: [
        { id: 'fantasy', label: 'Fantasy (Kỳ ảo)', vn: 'thể loại kỳ ảo (fantasy)' },
        { id: 'thriller', label: 'Thriller (Giật gân)', vn: 'thể loại giật gân (thriller)' },
        { id: 'children', label: 'Children Book (Thiếu nhi)', vn: 'truyện thiếu nhi vẽ hoạt họa dễ thương' }
    ],
    bookColor: [
        { id: 'pastel', label: 'Tông màu Pastel nhã nhặn', vn: 'tông màu pastel nhã nhặn' },
        { id: 'dark_neon', label: 'Tông màu Neon tối bí ẩn', vn: 'tông màu neon tối bí ẩn' },
        { id: 'vintage', label: 'Tông màu Vintage cổ điển', vn: 'tông màu vintage cổ điển' },
        { id: 'gold_luxury', label: 'Tông màu Vàng kim sang trọng', vn: 'tông màu vàng kim sang trọng' },
        { id: 'bright_vibrant', label: 'Tông màu Sáng rực rỡ', vn: 'tông màu sáng rực rỡ' },
        { id: 'monochrome', label: 'Tông màu Trắng đen tối giản', vn: 'tông màu trắng đen tối giản' }
    ],
    gender: [
        { id: 'nam', label: 'Nam (Male)', vn: 'nhân vật nam' },
        { id: 'nu', label: 'Nữ (Female)', vn: 'nhân vật nữ' },
        { id: 'khac', label: 'Khác (Other)', vn: 'nhân vật' }
    ],
    country: [
        { id: 'vietnam', label: 'Việt Nam', vn: 'phong cách Việt Nam' },
        { id: 'korea', label: 'Hàn Quốc (Korea)', vn: 'phong cách Hàn Quốc' },
        { id: 'japan', label: 'Nhật Bản (Japan)', vn: 'phong cách Nhật Bản' },
        { id: 'usa', label: 'Mỹ (USA)', vn: 'phong cách Mỹ' },
        { id: 'europe', label: 'Châu Âu (Western)', vn: 'phong cách Âu Mỹ' }
    ],
    age: [
        { id: 'child', label: 'Trẻ em (Child)', vn: 'độ tuổi trẻ em' },
        { id: 'teen', label: 'Thiếu niên (Teenager)', vn: 'độ tuổi thiếu niên' },
        { id: 'young_adult', label: 'Thanh niên (Young Adult)', vn: 'độ tuổi thanh niên' },
        { id: 'adult', label: 'Trung niên (Adult)', vn: 'độ tuổi trung niên' },
        { id: 'elderly', label: 'Người lớn tuổi (Elderly)', vn: 'độ tuổi lớn tuổi' }
    ],
    interiorStyle: [
        { id: 'minimalist', label: 'Minimalist (Tối giản)', vn: 'phong cách tối giản (minimalist)' },
        { id: 'mid_century', label: 'Mid-Century Modern', vn: 'phong cách hiện đại giữa thế kỷ (Mid-Century Modern)' },
        { id: 'industrial', label: 'Industrial (Công nghiệp)', vn: 'phong cách công nghiệp (industrial)' },
        { id: 'bohemian', label: 'Bohemian', vn: 'phong cách Bohemian tự do' }
    ],
    generalAtmosphere: [
        { id: 'dreamy', label: 'Dreamy & Ethereal (Mộng mơ)', vn: 'bầu không khí mộng mơ' },
        { id: 'mysterious', label: 'Mysterious (Bí ẩn)', vn: 'bầu không khí bí ẩn' },
        { id: 'epic', label: 'Epic & Majestic (Hùng tráng)', vn: 'bầu không khí hùng vĩ và tráng lệ' },
        { id: 'nostalgic', label: 'Nostalgic (Hoài cổ)', vn: 'bầu không khí hoài niệm cổ điển' }
    ],
    textLanguage: [
        { id: 'english', label: 'Tiếng Anh (English)', vn: 'chữ viết hiển thị bằng tiếng Anh (English text)' },
        { id: 'vietnamese', label: 'Tiếng Việt (Vietnamese)', vn: 'chữ viết hiển thị bằng tiếng Việt (Vietnamese text)' },
        { id: 'japanese', label: 'Tiếng Nhật (Japanese)', vn: 'chữ viết hiển thị bằng tiếng Nhật (Japanese text)' },
        { id: 'korean', label: 'Tiếng Hàn (Korean)', vn: 'chữ viết hiển thị bằng tiếng Hàn (Korean text)' }
    ]
};

// Add "Bỏ chọn" dynamically
for(const key in CHIP_POOL) {
    if(key !== 'comicPanels') {
        CHIP_POOL[key].unshift({ id: 'none', label: '-- Bỏ chọn --' });
    }
}

const MODULE_FIELDS = {
    'comic': [
        { type: 'text', id: 'comic-char-name', title: '1. Tên nhân vật (Tùy chọn)', placeholder: 'Ví dụ: Superman, Dế Mèn...' },
        { type: 'text', id: 'comic-char-desc', title: '2. Mô tả ngoại hình nhân vật', placeholder: 'Ví dụ: mặc áo choàng đỏ, giáp xanh...' },
        { type: 'text', id: 'comic-action', title: '3. Hành động / Cốt truyện (Bắt buộc)', placeholder: 'Ví dụ: đang bay lượn trên thành phố cứu người...' },
        { type: 'select', category: 'comicPanels', title: '4. Bố cục ô truyện' },
        { type: 'select', category: 'comicStyle', title: '5. Phong cách vẽ' },
        { type: 'select', category: 'comicContext', title: '6. Bối cảnh' },
        { type: 'select', category: 'generalAtmosphere', title: '7. Cảm xúc (Vibe)' },
        { type: 'select', category: 'textLanguage', title: '8. Ngôn ngữ chữ viết' }
    ],
    'fashion': [
        { type: 'text', id: 'fashion-outfit', title: '1. Thiết kế / Trang phục (Bắt buộc)', placeholder: 'Ví dụ: Váy lụa đỏ thướt tha, áo hoodie nỉ...' },
        { type: 'text', id: 'fashion-model-desc', title: '2. Mô tả người mẫu (Tùy chọn)', placeholder: 'Ví dụ: Người mẫu tóc vàng, phong thái lạnh lùng...' },
        { type: 'select', category: 'fashionStyle', title: '3. Phong cách BST' },
        { type: 'select', category: 'fashionContext', title: '4. Bối cảnh chụp' },
        { type: 'select', category: 'gender', title: '5. Giới tính' },
        { type: 'select', category: 'country', title: '6. Quốc gia/Khu vực' },
        { type: 'select', category: 'age', title: '7. Độ tuổi' },
        { type: 'select', category: 'generalAtmosphere', title: '8. Cảm xúc (Vibe)' },
        { type: 'select', category: 'textLanguage', title: '9. Ngôn ngữ chữ viết' }
    ],
    'film': [
        { type: 'text', id: 'film-title', title: '1. Tên bộ phim (Tùy chọn)', placeholder: 'Ví dụ: Chiến Binh Ngân Hà, Ký Ức Tuổi Thơ...' },
        { type: 'text', id: 'film-director', title: '2. Tên đạo diễn (Tùy chọn)', placeholder: 'Ví dụ: Christopher Nolan, Hayao Miyazaki...' },
        { type: 'text', id: 'film-char-desc', title: '3. Mô tả chi tiết nhân vật (Bắt buộc)', placeholder: 'Mô tả chi tiết ngoại hình, trang phục, biểu cảm nhân vật...' },
        { type: 'text', id: 'film-scene', title: '4. Bối cảnh / Phân cảnh (Bắt buộc)', placeholder: 'Ví dụ: giữa sa mạc hoang tàn dưới bầu trời đỏ rực...' },
        { type: 'select', category: 'filmGenre', title: '5. Thể loại phim' },
        { type: 'select', category: 'filmStyle', title: '6. Tone màu / Vibe điện ảnh' },
        { type: 'select', category: 'generalAtmosphere', title: '7. Cảm xúc (Vibe)' },
        { type: 'select', category: 'textLanguage', title: '8. Ngôn ngữ chữ viết' }
    ],
    'game': [
        { type: 'text', id: 'game-char-name', title: '1. Tên nhân vật / Vật phẩm (Tùy chọn)', placeholder: 'Ví dụ: Chiến binh rồng, Kiếm thần thoại...' },
        { type: 'text', id: 'game-desc', title: '2. Mô tả ngoại hình / Vũ khí (Bắt buộc)', placeholder: 'Ví dụ: Chiến binh cầm kiếm phát sáng, giáp vàng cổ đại...' },
        { type: 'select', category: 'gameStyle', title: '3. Phong cách đồ họa' },
        { type: 'select', category: 'comicContext', title: '4. Môi trường game' },
        { type: 'select', category: 'gender', title: '5. Giới tính' },
        { type: 'select', category: 'country', title: '6. Quốc gia/Khu vực' },
        { type: 'select', category: 'age', title: '7. Độ tuổi' },
        { type: 'select', category: 'generalAtmosphere', title: '8. Cảm xúc (Vibe)' },
        { type: 'select', category: 'textLanguage', title: '9. Ngôn ngữ chữ viết' }
    ],
    'book': [
        { type: 'text', id: 'book-title', title: '1. Tên sách (Bắt buộc)', placeholder: 'Ví dụ: Dế Mèn Phiêu Lưu Ký' },
        { type: 'text', id: 'book-author', title: '2. Tên tác giả (Bắt buộc)', placeholder: 'Ví dụ: Tô Hoài' },
        { type: 'text', id: 'book-desc', title: '3. Mô tả bìa sách (Tùy chọn)', placeholder: 'Ví dụ: Một chú dế mèn đang đứng trên ngọn cỏ...' },
        { type: 'select', category: 'bookGenre', title: '4. Thể loại sách' },
        { type: 'select', category: 'bookColor', title: '5. Màu chủ đạo' },
        { type: 'select', category: 'generalAtmosphere', title: '6. Cảm xúc (Vibe)' },
        { type: 'select', category: 'textLanguage', title: '7. Ngôn ngữ chữ viết' }
    ],
    'social': [
        { type: 'text', id: 'social-prod-name', title: '1. Tên sản phẩm / Dịch vụ (Bắt buộc)', placeholder: 'Ví dụ: Trà sữa Matcha Latte, Giày Sneaker...' },
        { type: 'text', id: 'social-ad-desc', title: '2. Mô tả bối cảnh quảng cáo (Bắt buộc)', placeholder: 'Ví dụ: đặt trên bàn đá sang trọng, ánh sáng dịu...' },
        { type: 'text', id: 'social-brand-text', title: '3. Tên thương hiệu hoặc chữ trên ảnh (Tùy chọn)', placeholder: 'Ví dụ: Panasonic, Mua 1 Tặng 1...' },
        { type: 'select', category: 'generalAtmosphere', title: '4. Cảm xúc (Vibe)' },
        { type: 'select', category: 'textLanguage', title: '5. Ngôn ngữ chữ viết' }
    ],
    'interior': [
        { type: 'text', id: 'interior-room', title: '1. Loại phòng (Bắt buộc)', placeholder: 'Ví dụ: Phòng khách, Phòng ngủ nhỏ...' },
        { type: 'text', id: 'interior-details', title: '2. Mô tả chi tiết thiết kế (Tùy chọn)', placeholder: 'Ví dụ: có cửa kính lớn nhìn ra vườn, nội thất gỗ màu ấm...' },
        { type: 'select', category: 'interiorStyle', title: '3. Phong cách nội thất' },
        { type: 'select', category: 'generalAtmosphere', title: '4. Cảm xúc (Vibe)' },
        { type: 'select', category: 'textLanguage', title: '5. Ngôn ngữ chữ viết' }
    ]
};

window.updateMasterPrompt = function() {
    const finalPrompt = document.getElementById('final-prompt');
    if (!finalPrompt) return;

    let template = "";
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
        
        template = `Tranh truyện tranh vẽ ${charStr} ${action}, [comicPanels], [comicStyle], bối cảnh [comicContext], [generalAtmosphere], [textLanguage]`;

    } else if (module === 'fashion') {
        const outfit = document.getElementById('fashion-outfit')?.value.trim() || "trang phục thời trang";
        const modelDesc = document.getElementById('fashion-model-desc')?.value.trim() || "";
        let subjectStr = "";
        if (modelDesc) subjectStr = `người mẫu ${modelDesc} mặc ${outfit}`;
        else subjectStr = `trang phục ${outfit}`;
        
        template = `Ảnh chụp thời trang [gender] [country] [age] ${subjectStr}, [fashionStyle], chụp tại [fashionContext], [generalAtmosphere], [textLanguage]`;

    } else if (module === 'film') {
        const title = document.getElementById('film-title')?.value.trim() || "";
        const director = document.getElementById('film-director')?.value.trim() || "";
        const charDesc = document.getElementById('film-char-desc')?.value.trim() || "";
        const scene = document.getElementById('film-scene')?.value.trim() || "";
        
        let subjectStr = "Poster phim điện ảnh";
        if (title && director) subjectStr += ` '${title}' đạo diễn bởi ${director}`;
        else if (title) subjectStr += ` '${title}'`;
        else if (director) subjectStr += ` đạo diễn bởi ${director}`;
        
        let contentStr = "";
        if (charDesc && scene) contentStr = `đặc tả nhân vật (${charDesc}) trong bối cảnh ${scene}`;
        else if (charDesc) contentStr = `đặc tả nhân vật (${charDesc})`;
        else if (scene) contentStr = `mô tả bối cảnh ${scene}`;
        else contentStr = "một phân cảnh kịch tính";
        
        template = `${subjectStr} ${contentStr}, [filmGenre], [filmStyle], [generalAtmosphere], [textLanguage]`;

    } else if (module === 'game') {
        const name = document.getElementById('game-char-name')?.value.trim() || "";
        const desc = document.getElementById('game-desc')?.value.trim() || "nhân vật";
        let subjectStr = "";
        if (name) subjectStr = `nhân vật game tên '${name}' (${desc})`;
        else subjectStr = `nhân vật game ${desc}`;
        
        template = `Bản vẽ concept art game của ${subjectStr} [gender] [country] [age], [gameStyle], môi trường [comicContext], [generalAtmosphere], [textLanguage]`;

    } else if (module === 'book') {
        const title = document.getElementById('book-title')?.value.trim() || "";
        const author = document.getElementById('book-author')?.value.trim() || "";
        const desc = document.getElementById('book-desc')?.value.trim() || "";
        let subjectStr = "";
        if (desc) subjectStr = `Bìa sách minh họa ${desc}, tên sách là '${title}' của tác giả '${author}'`;
        else subjectStr = `Bìa sách minh họa nghệ thuật, tên sách là '${title}' của tác giả '${author}'`;
        
        template = `${subjectStr}, [bookGenre], [bookColor], [generalAtmosphere], [textLanguage]`;

    } else if (module === 'social') {
        const name = document.getElementById('social-prod-name')?.value.trim() || "sản phẩm";
        const desc = document.getElementById('social-ad-desc')?.value.trim() || "";
        const brandText = document.getElementById('social-brand-text')?.value.trim() || "";
        
        let subjectStr = `${name}`;
        if (desc) subjectStr += ` ${desc}`;
        
        let brandStr = "";
        if (brandText) {
            brandStr = `, kèm theo chữ viết hiển thị tên thương hiệu hoặc thông điệp '${brandText}'`;
        }
        
        template = `Ảnh chụp quảng cáo sản phẩm chuyên nghiệp về ${subjectStr}${brandStr} dùng cho bài đăng marketing, [generalAtmosphere], [textLanguage]`;

    } else if (module === 'interior') {
        const room = document.getElementById('interior-room')?.value.trim() || "căn phòng";
        const details = document.getElementById('interior-details')?.value.trim() || "";
        let subjectStr = room;
        if (details) subjectStr += ` ${details}`;
        
        template = `Thiết kế nội thất của ${subjectStr}, [interiorStyle], [generalAtmosphere], [textLanguage]`;
    } else {
        template = `Hình ảnh vẽ về một bối cảnh, [comicStyle], [generalAtmosphere], [textLanguage]`;
    }

    const blocksList = [
        'comicPanels', 'comicStyle', 'comicContext', 'fashionStyle', 'fashionContext', 
        'filmGenre', 'filmStyle', 'gameStyle', 'bookGenre', 'bookColor', 
        'gender', 'country', 'age', 'interiorStyle', 'generalAtmosphere', 'textLanguage'
    ];
    blocksList.forEach(block => {
        const val = currentBlocks[block];
        if (val && val !== 'none') {
            const chipsData = CHIP_POOL[block];
            const selectedChip = chipsData ? chipsData.find(c => c.id === val) : null;
            let vnVal = selectedChip ? (selectedChip.vn || selectedChip.label) : val;
            if (block === 'textLanguage' && !selectedChip) {
                vnVal = `chữ viết hiển thị bằng ${val.toLowerCase()} (text in ${val.toLowerCase()})`;
            }
            template = template.replace(`[${block}]`, vnVal);
        } else {
            template = template.replace(`[${block}]`, '');
        }
    });

    template = template.replace(/,(\s*,)+/g, ',').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim().replace(/,\s*$/, '');
    finalPrompt.value = template;
    
    // Auto-adjust prompt height
    finalPrompt.style.height = 'auto';
    finalPrompt.style.height = Math.min(finalPrompt.scrollHeight, 120) + 'px';
};

const BLOCK_NAMES = {
    comicPanels: 'Số ô truyện',
    comicStyle: 'Phong cách truyện tranh',
    comicContext: 'Bối cảnh',
    fashionStyle: 'Phong cách thời trang',
    fashionContext: 'Bối cảnh chụp',
    filmGenre: 'Thể loại phim',
    filmStyle: 'Tone màu / Vibe điện ảnh',
    gameStyle: 'Phong cách Đồ họa',
    bookGenre: 'Thể loại sách',
    bookColor: 'Màu chủ đạo',
    gender: 'Giới tính',
    country: 'Quốc gia/Khu vực',
    age: 'Độ tuổi',
    interiorStyle: 'Phong cách Nội thất',
    generalAtmosphere: 'Cảm xúc (Vibe)',
    textLanguage: 'Ngôn ngữ chữ viết'
};

const BLACKLIST = [
    // Tiếng Việt (Bạo lực / Vũ khí)
    'máu', 'chết', 'giết', 'súng', 'bắn', 'chém', 'đâm', 'đánh nhau', 'đánh đập', 'bạo lực', 'tấn công', 
    'vũ khí', 'bom', 'mìn', 'lựu đạn', 'dao găm', 'kiếm', 'đầu độc', 'tự tử', 'tự sát', 'con dao', 'lưỡi dao',
    
    // Tiếng Việt (Người lớn / Nhạy cảm)
    'sexy', 'nude', 'sex', '18+', 'khỏa thân', 'khiêu dâm', 'đồi trụy', 'hôn nhau', 'ôm nhau',
    
    // Tiếng Việt (Chất kích thích / Tệ nạn)
    'ma túy', 'thuốc lá', 'rượu', 'bia', 'cần sa', 'heroin', 'thuốc phiện', 'hút thuốc', 'uống rượu',
    
    // Tiếng Việt (Thô tục)
    'đm', 'vcl', 'chửi',
    
    // English (Violence / Weapons)
    'blood', 'kill', 'dead', 'death', 'shoot', 'gun', 'knife', 'sword', 'bomb', 'suicide', 'violence', 'attack', 'weapon', 'fight',
    
    // English (Adult / Sensitive)
    'porn', 'erotic', 'hentai', 'breast', 'naked',
    
    // English (Substances)
    'drug', 'cocaine', 'alcohol', 'beer', 'smoke', 'weed', 'cigarette',
    
    // English (Profanity)
    'swear', 'curse', 'insult', 'abuse'
];

const $ = id => document.getElementById(id);
const appContainer = $('app-container');

let currentBlocks = {}; 
let uploadedRefImage = null;
let currentAspectRatio = '--ar 1:1';

function init() {
    const saved = localStorage.getItem('ai_studio_session');
    if (saved) {
        Object.assign(appState, JSON.parse(saved));
        if (appState.generatedImages.length > 0 && typeof appState.generatedImages[0] === 'string') {
            appState.generatedImages = appState.generatedImages.map(url => ({ url, type: 'image' }));
        }
        updateHeader();
        renderMainLayout();
        checkOnboarding();
    } else {
        renderLanding();
    }

    // Sidebar toggle removed

    // Old nav event listeners removed
}

function handleLogout() {
    if(confirm('Bạn có chắc chắn muốn thoát?\nToàn bộ tác phẩm chưa tải xuống sẽ bị xóa mất hoàn toàn!')) {
        localStorage.removeItem('ai_studio_session');
        appState.username = ''; appState.nickname = ''; appState.avatar = ''; appState.generatedImages = [];
        updateHeader();
        renderLogin();
    }
}

function checkOnboarding() {
    if (!localStorage.getItem('ai_studio_onboarded')) {
        const overlay = document.createElement('div');
        overlay.className = 'onboarding-overlay';
        overlay.innerHTML = `
            <div class="onboarding-modal">
                <h2>Chào mừng đến với AI Studio!</h2>
                <div class="onboarding-steps">
                    <p><span class="step-num">1</span> <span>Chọn Studio bạn muốn trải nghiệm ở thanh menu trái.</span></p>
                    <p><span class="step-num">2</span> <span>Tùy chỉnh phong cách ở các Dropdown.</span></p>
                    <p><span class="step-num">3</span> <span>Nhập ý tưởng hoặc dán (Ctrl+V) ảnh tham khảo vào ô Lệnh.</span></p>
                    <p><span class="step-num">4</span> <span>Bấm <strong>Sinh Ảnh AI</strong> và chiêm ngưỡng thành quả.</span></p>
                </div>
                <button class="btn-primary" id="btn-close-onboard" style="width:100%">Đã hiểu, Bắt đầu sáng tạo!</button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        $('btn-close-onboard').addEventListener('click', () => {
            localStorage.setItem('ai_studio_onboarded', 'true');
            overlay.remove();
        });
    }
}

function updateNavState() {
    // Không cần xử lý top-nav nữa
}

function saveSession() {
    localStorage.setItem('ai_studio_session', JSON.stringify(appState));
    updateHeader();
    if (window.updateSidebarUser) window.updateSidebarUser();
}

function updateHeader() {
    // Header removed, no need to update
}

// ================= VIEWS =================

function renderLanding() {
    // Hide navigation, make header transparent, and remove top padding
    document.body.classList.add('landing-mode');
    const landingModules = [
        { id: 'comic', name: 'Comic Studio', role: ['Họa sĩ truyện tranh', 'Nhà thiết kế đồ họa', 'Storyteller'], style: 'card-blue', img: 'images/floating_ai_comic.png' },
        { id: 'fashion', name: 'Fashion Studio', role: ['Nhà thiết kế thời trang', 'Stylist', 'Brand marketing'], style: 'card-purple', img: 'images/floating_ai_fashion.png' },
        { id: 'film', name: 'Film Poster', role: ['Đạo diễn', 'Nhà thiết kế poster', 'Marketing phim'], style: 'card-teal', img: 'images/floating_ai_film.png' },
        { id: 'game', name: 'Game Studio', role: ['Game designer', 'Concept artist', '3D artist'], style: 'card-green', img: 'images/floating_ai_game.png' },
        { id: 'book', name: 'Book Cover', role: ['Thiết kế bìa sách', 'Nhà xuất bản', 'Illustrator'], style: 'card-blue', img: 'images/hero_art.png' },
        { id: 'social', name: 'Social Post', role: ['Content creator', 'Social marketer', 'Nhà quảng cáo'], style: 'card-purple', img: 'images/floating_ai_social.png' },
        { id: 'interior', name: 'Interior Studio', role: ['Kiến trúc sư nội thất', 'Thiết kế không gian', '3D Visualizer'], style: 'card-teal', img: 'images/hero_vr.png' },
        { id: 'info', name: 'Infographic', role: ['Nhà giáo dục', 'Báo chí', 'Data designer'], style: 'card-green', img: 'images/hero_science.png' }
    ];

    const gridHtml = landingModules.map((m, index) => `
        <div class="feature-card ${m.style} reveal delay-${(index % 4) + 1}" onclick="document.getElementById('btn-start-landing').click()">
            <h3>${m.name}</h3>
            <ul>
                ${m.role.map(r => `<li>${r}</li>`).join('')}
            </ul>
            <div class="btn-arrow-circle">➔</div>
            <img class="card-img-placeholder" src="${m.img}" alt="Preview">
        </div>
    `).join('');

    appContainer.innerHTML = `
        <div class="landing-view">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="hero-container">
                    <div class="hero-text-col reveal">
                        <div class="hero-logos reveal" style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px;">
                            <img src="images/risupia_logo.png" alt="Risupia Logo" style="height: 60px; object-fit: contain;">
                            <span style="font-size: 2rem; color: rgba(255,255,255,0.4);">|</span>
                            <img src="images/vidtory_logo.png" alt="Vidtory Logo" style="height: 50px; object-fit: contain;">
                        </div>
                        <h1 class="hero-title" style="white-space: nowrap;"><span style="white-space: nowrap;">KHÁM PHÁ TIỀM NĂNG</span><br>CỦA <span class="highlight-yellow">AI SÁNG TẠO</span></h1>
                        <p class="hero-subtitle">Trải nghiệm thực tế cách AI tạo ảnh được ứng dụng trong các ngành nghề khác nhau. Phát triển tư duy và kỹ năng qua prompt.</p>
                        <div class="hero-actions">
                            <button id="btn-start-landing" class="btn-lime">Trải nghiệm ngay <span style="background:white; border-radius:50%; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; margin-left:8px; color:black; font-size:14px">➔</span></button>
                        </div>
                    </div>
                    <div class="hero-visuals-col reveal delay-2">
                        <div class="floating-card fc-1">
                            <img src="images/floating_ai_comic.png" alt="Comic">
                            <div class="fc-info">
                                <div><h4>Comic Studio</h4><p>Sáng tạo truyện tranh</p></div>
                                <div class="fc-arrow">➔</div>
                            </div>
                        </div>
                        <div class="floating-card fc-2">
                            <img src="images/floating_ai_fashion.png" alt="Fashion">
                            <div class="fc-info">
                                <div><h4>Fashion Studio</h4><p>Thiết kế thời trang</p></div>
                                <div class="fc-arrow">➔</div>
                            </div>
                        </div>
                        <div class="floating-card fc-3">
                            <img src="images/floating_ai_game.png" alt="Game">
                            <div class="fc-info">
                                <div><h4>Game Concept</h4><p>Xây dựng thế giới</p></div>
                                <div class="fc-arrow">➔</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Soft Gradient Transition -->
                <div class="hero-transition"></div>
            </div>
            
            <!-- Adventure Grid -->
            <div class="adventure-section">
                <div class="section-label reveal">KHÁM PHÁ HÀNH TRÌNH</div>
                <h2 class="section-title reveal">Chọn Trải Nghiệm Của Bạn</h2>
                <p class="section-desc reveal">Đắm mình vào những thế giới học tập thú vị, khơi dậy trí tò mò và sáng tạo.</p>
                <div class="modules-grid">
                    ${gridHtml}
                </div>
            </div>
        </div>
    `;

    $('btn-start-landing').addEventListener('click', () => {
        renderLogin();
    });

    // Scroll Animation Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function renderLogin() {
    document.body.classList.add('landing-mode');
    appContainer.innerHTML = `
        <div class="auth-wrapper" style="width: 100%; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--gradient-hero); padding: 24px;">
            <style>.auth-wrapper input::placeholder { color: #94a3b8; }</style>
            <div class="glass-panel login-view reveal" style="padding: 48px; border-radius: 24px; box-shadow: 0 24px 48px rgba(0,50,100,0.15); border: 1px solid rgba(255,255,255,0.6); background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); width: 100%; max-width: 480px;">
                
                <div class="hero-logos" style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 32px;">
                    <img src="images/risupia_logo.png" alt="Risupia Logo" style="height: 48px; object-fit: contain;">
                    <span style="font-size: 1.5rem; color: rgba(19, 32, 58, 0.3);">|</span>
                    <img src="images/vidtory_logo.png" alt="Vidtory Logo" style="height: 40px; object-fit: contain;">
                </div>
                
                <h2 style="font-size: 2.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Đăng nhập</h2>
                <p style="margin-bottom: 36px; color: var(--text-secondary); font-size: 0.95rem;">Học sinh sử dụng tài khoản do giáo viên cấp.</p>
                
                <div style="text-align: left; margin-bottom: 20px;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">Tên đăng nhập</label>
                    <input type="text" id="login-user" class="input-field" placeholder="Nhập tên đăng nhập" style="width: 100%; background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.15); color: var(--text-primary); padding: 14px 16px; border-radius: 12px; transition: all 0.3s;">
                </div>
                
                <div style="text-align: left; margin-bottom: 32px;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">Mật khẩu</label>
                    <input type="password" id="login-pass" class="input-field" placeholder="••••••••" style="width: 100%; background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.15); color: var(--text-primary); padding: 14px 16px; border-radius: 12px; transition: all 0.3s;">
                </div>
                
                <button id="btn-login" class="btn-lime" style="width: 100%; padding: 16px; font-size: 1.1rem; border-radius: 12px; font-weight: 700; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: #002060;">
                    Vào Studio Sáng Tạo <span>➔</span>
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        document.querySelectorAll('.login-view .input-field').forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = 'var(--primary-blue)';
                input.style.background = '#FFFFFF';
                input.style.boxShadow = '0 0 0 4px rgba(0, 103, 217, 0.15)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'rgba(0,0,0,0.15)';
                input.style.background = 'rgba(255,255,255,0.8)';
                input.style.boxShadow = 'none';
            });
        });
        const loginView = document.querySelector('.login-view');
        if(loginView) loginView.classList.add('active');
    }, 50);

    $('btn-login').addEventListener('click', () => {
        const user = $('login-user').value.trim();
        const pass = $('login-pass').value.trim();
        if (!user) {
            alert('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!pass) {
            alert('Vui lòng nhập mật khẩu');
            return;
        }

        const account = CREDENTIALS[user.toLowerCase()];
        if (account && account.pass === pass) {
            appState.username = user;
            appState.role = account.role;
            renderProfileSetup();
        } else {
            alert('Tên đăng nhập hoặc mật khẩu không chính xác!');
        }
    });
}

function renderProfileSetup() {
    document.body.classList.add('landing-mode');
    const avatarHtml = AVATARS.map((url, idx) => 
        '<img src="' + url + '" class="avatar-option" data-idx="' + idx + '" alt="Avatar ' + idx + '" style="cursor: pointer; border: 3px solid transparent; border-radius: 50%; transition: all 0.3s;">'
    ).join('');

    appContainer.innerHTML = `
        <div class="auth-wrapper" style="width: 100%; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--gradient-hero); padding: 24px;">
            <div class="glass-panel profile-view reveal" style="padding: 48px; border-radius: 24px; box-shadow: 0 24px 48px rgba(0,50,100,0.15); border: 1px solid rgba(255,255,255,0.6); background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); width: 100%; max-width: 540px;">
                
                <h2 style="font-size: 2.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Hồ sơ của bạn</h2>
                <p style="margin-bottom: 32px; color: var(--text-secondary); font-size: 0.95rem;">Chọn tên gọi và ảnh đại diện đậm chất Tech.</p>
                
                <div style="text-align: left; margin-bottom: 32px;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">Tên gọi (Nickname)</label>
                    <input type="text" id="profile-nick" class="input-field" placeholder="Ví dụ: AI Master" style="width: 100%; background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.15); color: var(--text-primary); padding: 14px 16px; border-radius: 12px; transition: all 0.3s;">
                </div>
                
                <label style="display: block; font-size: 0.85rem; color: var(--text-primary); margin-bottom: 12px; font-weight: 600; text-align: left;">Chọn Ảnh đại diện</label>
                <div class="avatar-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 40px;">
                    ${avatarHtml}
                </div>
                
                <button id="btn-finish-profile" class="btn-lime" style="width: 100%; padding: 16px; font-size: 1.1rem; border-radius: 12px; font-weight: 700; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: #002060;">
                    Bắt đầu Khám Phá <span>🚀</span>
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const nickInput = $('profile-nick');
        if (nickInput) {
            nickInput.addEventListener('focus', () => {
                nickInput.style.borderColor = 'var(--primary-blue)';
                nickInput.style.background = '#FFFFFF';
                nickInput.style.boxShadow = '0 0 0 4px rgba(0, 103, 217, 0.15)';
            });
            nickInput.addEventListener('blur', () => {
                nickInput.style.borderColor = 'rgba(0,0,0,0.15)';
                nickInput.style.background = 'rgba(255,255,255,0.8)';
                nickInput.style.boxShadow = 'none';
            });
        }
        const profileView = document.querySelector('.profile-view');
        if(profileView) profileView.classList.add('active');
    }, 50);

    let selectedAvatar = null;
    document.querySelectorAll('.avatar-option').forEach(img => {
        img.addEventListener('click', (e) => {
            document.querySelectorAll('.avatar-option').forEach(el => {
                el.classList.remove('selected');
                el.style.borderColor = 'transparent';
                el.style.transform = 'scale(1)';
                el.style.boxShadow = 'none';
            });
            e.target.classList.add('selected');
            e.target.style.borderColor = 'var(--primary-lime)';
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 8px 16px rgba(183,233,49,0.5)';
            selectedAvatar = e.target.src;
        });
    });

    $('btn-finish-profile').addEventListener('click', () => {
        const nick = $('profile-nick').value.trim();
        if (!nick || !selectedAvatar) {
            alert('Vui lòng nhập nickname và chọn 1 avatar!');
            return;
        }
        appState.nickname = nick;
        appState.avatar = selectedAvatar;
        saveSession();
        appState.view = 'studio';
        document.body.classList.remove('landing-mode');
        updateNavState();
        renderMainLayout();
        checkOnboarding();
    });
}

function renderMainLayout() {
    const navItems = MODULES.map(m => 
        '<div class="nav-item ' + (appState.currentModule === m.id && appState.view === 'studio' ? 'active' : '') + '" data-id="' + m.id + '"><span class="icon">' + m.icon + '</span><span class="nav-item-text">' + m.name + '</span></div>'
    ).join('');

    const role = appState.role || 'student';
    const roleName = role === 'teacher' ? 'Giáo viên' : 'Học sinh';
    const imgCount = getUsageCount('images');
    const imgLimit = LIMITS[role].images;
    const vidCount = getUsageCount('videos');
    const vidLimit = LIMITS[role].videos;

    appContainer.innerHTML = `
        <div class="main-layout">
            <aside class="sidebar glass-panel" id="main-sidebar">
                <div class="sidebar-logos" style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; padding: 12px 0 16px 0; border-bottom: 1px solid var(--panel-border);">
                    <img src="images/risupia_logo.png" alt="Risupia Logo" style="height: 32px; object-fit: contain;">
                    <span style="font-size: 1.2rem; color: rgba(19, 32, 58, 0.2); font-weight: bold;">|</span>
                    <img src="images/vidtory_logo.png" alt="Vidtory Logo" style="height: 26px; object-fit: contain;">
                </div>
                <div class="sidebar-user">
                    <img src="${appState.avatar}" alt="Avatar">
                    <h3 style="margin-bottom:4px;">${appState.nickname}</h3>
                    <span class="studio-badge" style="margin-left:0; margin-bottom:8px; background:var(--primary-blue); font-size:11px;">${roleName}</span>
                    <span style="font-size:0.85rem; color:var(--text-muted); display:block;">📷 Ảnh: ${imgCount}/${imgLimit}</span>
                    <span style="font-size:0.85rem; color:var(--text-muted); display:block; margin-top:2px;">🎬 Video: ${vidCount}/${vidLimit}</span>
                </div>
                <nav class="sidebar-nav">
                    <div style="padding: 8px 12px; font-size: 0.8rem; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Studio Sáng Tạo</div>
                    ${navItems}
                    <div style="padding: 16px 12px 8px 12px; font-size: 0.8rem; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Khác</div>
                    <div class="nav-item ${appState.view === 'video' ? 'active' : ''}" data-view="video">
                        <span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg></span><span class="nav-item-text">Tạo Video</span>
                    </div>
                    <div class="nav-item ${appState.view === 'gallery' ? 'active' : ''}" data-view="gallery">
                        <span class="icon">🖼️</span><span class="nav-item-text">Thư viện</span>
                    </div>
                </nav>
                <div style="margin-top: auto; padding: 16px;">
                    <button class="nav-item" onclick="handleLogout()" style="width: 100%; border: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; justify-content: flex-start; cursor: pointer;">
                        <span class="icon">${SVG_ICONS.logout}</span>
                        <span class="nav-item-text">Đăng xuất</span>
                    </button>
                </div>
            </aside>
            <div class="playground" id="playground-area"></div>
        </div>`;

    window.updateSidebarUser = () => {
        const sidebarUser = document.querySelector('.sidebar-user');
        if (!sidebarUser) return;
        
        const currentRole = appState.role || 'student';
        const currentRoleName = currentRole === 'teacher' ? 'Giáo viên' : 'Học sinh';
        const currentImgCount = getUsageCount('images');
        const currentImgLimit = LIMITS[currentRole].images;
        const currentVidCount = getUsageCount('videos');
        const currentVidLimit = LIMITS[currentRole].videos;
        
        sidebarUser.innerHTML = `
            <img src="${appState.avatar}" alt="Avatar">
            <h3 style="margin-bottom:4px;">${appState.nickname}</h3>
            <span class="studio-badge" style="margin-left:0; margin-bottom:8px; background:var(--primary-blue); font-size:11px;">${currentRoleName}</span>
            <span style="font-size:0.85rem; color:var(--text-muted); display:block;">📷 Ảnh: ${currentImgCount}/${currentImgLimit}</span>
            <span style="font-size:0.85rem; color:var(--text-muted); display:block; margin-top:2px;">🎬 Video: ${currentVidCount}/${currentVidLimit}</span>
        `;
    };

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if(e.currentTarget.hasAttribute('onclick')) return;
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            const el = e.currentTarget;
            el.classList.add('active');
            
            if (el.hasAttribute('data-id')) {
                appState.currentModule = el.getAttribute('data-id');
                appState.view = 'studio';
                renderPlayground();
            } else if (el.hasAttribute('data-view')) {
                appState.view = el.getAttribute('data-view');
                if (appState.view === 'video') renderVideoStudio();
                else if (appState.view === 'gallery') renderGalleryView();
            }
        });
    });

    if(appState.view === 'studio') renderPlayground();
    else if(appState.view === 'video') renderVideoStudio();
    else renderGalleryView();
}

function renderPlayground() {
    const mod = MODULES.find(m => m.id === appState.currentModule) || MODULES[0];
    
    currentBlocks = {};
    uploadedRefImage = null;
    appState.chatRefImages = [];
    currentAspectRatio = '--ar 1:1';

    let dropdownsHtml = '';
    const fields = MODULE_FIELDS[appState.currentModule] || MODULE_FIELDS['comic'];
    
    fields.forEach(field => {
        if (field.type === 'text') {
            dropdownsHtml += `
                <div class="block-group">
                    <div class="block-title">${field.title}</div>
                    <input type="text" id="${field.id}" class="input-field block-text-input" placeholder="${field.placeholder}">
                </div>
            `;
        } else if (field.type === 'select') {
            const category = field.category;
            const chipsData = CHIP_POOL[category];
            if(!chipsData) return;
            
            let optionsList = chipsData.map(c => 
                `<div class="option-item" data-category="${category}" data-val="${c.id}"><span class="option-label">${c.label}</span></div>`
            ).join('');
            
            const hasCustomInput = category !== 'comicPanels' && category !== 'gender' && category !== 'country' && category !== 'age' && category !== 'bookColor';
            const customInputHtml = hasCustomInput ? `<input type="text" class="input-field block-custom-input" data-category="${category}" style="margin-top:8px; font-size: 0.85rem; padding: 10px;" placeholder="Nhập ${field.title.split('. ')[1].toLowerCase()} và nhấn Enter...">` : '';

            dropdownsHtml += `
                <div class="block-group">
                    <div class="block-title">${field.title}</div>
                    <div class="custom-select" data-category="${category}">
                        <div class="select-trigger">
                            <span class="trigger-text">-- Chọn ${field.title.split('. ')[1]} --</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="select-options">
                            ${optionsList}
                        </div>
                    </div>
                    ${customInputHtml}
                </div>`;
        }
    });

    const playground = $('playground-area');
    playground.innerHTML = `
        <div class="playground-header">
            <h1>${mod.icon} ${mod.name}</h1>
            <p>${mod.desc}</p>
        </div>
        <div class="playground-content">
            <div class="glass-panel builder-area">
                <div class="block-group">
                    <div class="block-title">Ảnh tham khảo (Tùy chọn)</div>
                    <div class="upload-zone" id="ref-upload-zone">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p style="font-size: 0.9rem">${mod.refText}</p>
                        <p style="font-size: 0.8rem; color: var(--text-light)">Nhấp để tải lên</p>
                        <input type="file" id="ref-file" hidden accept="image/*">
                    </div>
                    <div class="ref-preview-container" id="ref-preview-container">
                        <img id="ref-preview-img" src="" alt="Reference">
                        <button class="btn-remove-ref" id="btn-remove-ref">
                            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                ${dropdownsHtml}
            </div>

            <div class="output-area">
                <div class="result-display" id="result-display"></div>

                <div class="glass-panel prompt-dock">
                    <div class="prompt-dock-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <p style="font-size: 0.85rem; color: var(--primary-color); margin: 0; font-weight: 500;">Mẹo: Ctrl+V để dán ảnh tham khảo trực tiếp vào ô bên dưới.</p>
                        <div class="custom-select" id="aspect-ratio-select" style="width: 160px;">
                            <div class="select-trigger" style="padding: 6px 12px; font-size: 0.85rem; height: 32px;">
                                <span class="trigger-text">1:1 (Vuông)</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                            <div class="select-options">
                                <div class="option-item selected" data-val="--ar 1:1"><span class="option-label">1:1 (Vuông)</span></div>
                                <div class="option-item" data-val="--ar 16:9"><span class="option-label">16:9 (Ngang)</span></div>
                                <div class="option-item" data-val="--ar 9:16"><span class="option-label">9:16 (Dọc)</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="prompt-dock-input">
                        <textarea id="final-prompt" placeholder="Nhập lệnh để bắt đầu sáng tạo..." style="flex:1; height: 48px; background: rgba(255,255,255,0.7); border: 1px solid var(--panel-border); padding: 12px 16px; border-radius: 12px; font-size: 0.95rem; resize: none; font-family: inherit; color: var(--text-main); outline: none; transition: border 0.3s;"></textarea>
                        <button id="btn-generate" class="btn-primary" style="padding: 0 24px; flex-shrink: 0; font-size: 1rem; height: 48px; border-radius: 12px;">✨ Generate</button>
                    </div>

                    <div class="pinned-refs" id="pinned-refs-container"></div>
                </div>
            </div>
        </div>
    `;

    setupPromptBuilderLogic(false);
    setupReferenceUpload();
    setupChatPaste();
    window.renderResultGrid();
}

window.renderResultGrid = () => {
    const box = $('result-display');
    if(!box) return;
    
    if(appState.generatedImages.length === 0) {
        box.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; color: var(--text-secondary); font-weight: 500; font-size: 1.1rem;">Khu vực hiển thị kết quả (Chưa có ảnh nào)</div>';
        return;
    }

    const imagesHtml = [...appState.generatedImages].reverse().map((img, idx) => {
        if(img.type === 'video') {
            return `<div class="result-item" onclick="showLightbox('${img.url}', 'video')" style="cursor: pointer;"><video src="${img.url}" autoplay loop muted></video></div>`;
        }
        return `<div class="result-item" onclick="showLightbox('${img.url}', 'image')" style="cursor: pointer;"><img src="${img.url}" alt="AI Gen"></div>`;
    }).join('');
    
    box.innerHTML = '<div class="result-grid">' + imagesHtml + '</div>';
    
    // Scroll to bottom (which is conceptually the top since it's reversed)
    box.scrollTop = 0;
};

function setupChatPaste() {
    const finalPrompt = $('final-prompt');
    const container = $('pinned-refs-container');

    const renderPinned = () => {
        container.innerHTML = appState.chatRefImages.map((src, i) => `
            <div class="pinned-ref-item">
                <img src="${src}">
                <button onclick="removeChatRef(${i})">X</button>
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

function setupPromptBuilderLogic(isImg2Vid) {
    const finalPrompt = $('final-prompt');

    if (finalPrompt) {
        finalPrompt.addEventListener('input', () => {
            finalPrompt.style.height = 'auto';
            finalPrompt.style.height = Math.min(finalPrompt.scrollHeight, 120) + 'px';
        });
    }

    document.querySelectorAll('.block-text-input').forEach(input => {
        input.addEventListener('input', () => window.updateMasterPrompt());
        input.addEventListener('change', () => window.updateMasterPrompt());
        input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                window.updateMasterPrompt();
            }
        });
    });

    // Xử lý Custom Select Dropdown logic "Độc quyền"
    document.querySelectorAll('.custom-select').forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelector('.select-options');
        const triggerText = select.querySelector('.trigger-text');
        const isAspectRatio = select.id === 'aspect-ratio-select';

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.select-options').forEach(opt => {
                if(opt !== options) opt.classList.remove('show');
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

                if (isAspectRatio) {
                    currentAspectRatio = val;
                } else if (finalPrompt) {
                    if (val === 'none') {
                        currentBlocks[category] = null;
                    } else {
                        currentBlocks[category] = val;
                        
                        // Xóa ở ô tự nhập
                        const customInput = document.querySelector(`.block-custom-input[data-category="${category}"]`);
                        if(customInput) {
                            customInput.value = '';
                            customInput.style.opacity = '0.5';
                        }
                    }
                    window.updateMasterPrompt();
                }
            });
        });
    });

    // Handle Custom Inputs logic "Độc quyền" & Enter
    document.querySelectorAll('.block-custom-input').forEach(input => {
        input.addEventListener('input', (e) => {
            input.style.opacity = '1';
            const category = e.target.getAttribute('data-category');
            const val = e.target.value.trim();
            
            // Reset Select Dropdown
            const select = document.querySelector(`.custom-select[data-category="${category}"]`);
            if(select) {
                select.querySelectorAll('.option-item').forEach(o => o.classList.remove('selected'));
                select.querySelector('.trigger-text').innerText = `-- Chọn ${BLOCK_NAMES[category]} --`;
                select.querySelector('.trigger-text').style.color = 'inherit';
            }
            
            if (finalPrompt) {
                currentBlocks[category] = val ? val : null;
                window.updateMasterPrompt();
            }
        });

        const updateCustomText = (e) => {
            const val = e.target.value.trim();
            const category = e.target.getAttribute('data-category');
            if (finalPrompt) {
                currentBlocks[category] = val ? val : null;
                window.updateMasterPrompt();
            }
        };

        input.addEventListener('change', updateCustomText);
        input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                updateCustomText(e);
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.select-options').forEach(opt => opt.classList.remove('show'));
    });

    if($('btn-generate')) $('btn-generate').addEventListener('click', () => generateAction(isImg2Vid));
}

function setupReferenceUpload() {
    const zone = $('ref-upload-zone');
    const fileInput = $('ref-file');
    const previewContainer = $('ref-preview-container');
    const previewImg = $('ref-preview-img');
    const btnRemove = $('btn-remove-ref');
    if(!zone) return;

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
        if(e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    btnRemove.addEventListener('click', () => {
        uploadedRefImage = null;
        previewContainer.style.display = 'none';
        zone.style.display = 'flex';
        fileInput.value = '';
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            uploadedRefImage = ev.target.result;
            previewImg.src = uploadedRefImage;
            zone.style.display = 'none';
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function generateAction(isImg2Vid) {
    if (isImg2Vid) {
        if (!checkLimits('videos')) return;
    } else {
        if (!checkLimits('images')) return;
    }

    let promptText = '';
    
    if(isImg2Vid) {
        promptText = $('vid-prompt').value.trim();
        if(!uploadedRefImage) {
            alert('Vui lòng chọn hoặc dán ảnh tĩnh để làm đầu vào video!');
            return;
        }
    } else {
        promptText = $('final-prompt').value.trim();
        if (!promptText && !uploadedRefImage && appState.chatRefImages.length === 0) {
            alert('Vui lòng nhập lệnh mô tả ảnh hoặc thêm ảnh tham khảo!');
            return;
        }
    }

    const normalizeStr = str => str.toLowerCase().normalize('NFC');
    // Replace all non-alphanumeric and non-space characters with space, collapse spaces, and wrap with spaces
    const cleanPrompt = ' ' + promptText.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim() + ' ';
    
    const hasBadWord = BLACKLIST.some(word => {
        const normalizedWord = normalizeStr(word);
        return cleanPrompt.includes(' ' + normalizedWord + ' ');
    });
    
    if (hasBadWord) {
        alert('Ý tưởng này chưa phù hợp, thử mô tả khác nhé!');
        return;
    }

    const resultBox = $('result-display');
    const loadingHtml = '<div style="display:flex;flex-direction:column;align-items:center;gap:16px; padding: 40px 0;"><div class="loading-spinner" style="border: 4px solid rgba(0,0,0,0.1); border-left-color: var(--primary-color); border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite;"></div><span style="color:var(--primary-color); font-weight: 500;">' + (isImg2Vid ? 'Cùng chờ đón video nhé' : 'AI đang sáng tạo...') + '</span></div>';
    
    // Inject loading indicator above the grid
    resultBox.innerHTML = loadingHtml + resultBox.innerHTML;
    
    try {
        if (isImg2Vid) {
            const bodyPayload = {
                prompt: promptText,
                aspectRatio: document.querySelector('.custom-select[data-category="vidRatio"] .option-item.selected')?.getAttribute('data-val') || '16:9'
            };
            if (uploadedRefImage && uploadedRefImage.startsWith('data:image')) {
                bodyPayload.refImageBase64 = uploadedRefImage;
            } else if (uploadedRefImage) {
                bodyPayload.refImageUrl = uploadedRefImage;
            }

            const response = await fetch('/api/generate/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            appState.generatedImages.push({ url: data.url, type: 'video' });
            incrementUsageCount('videos');
            saveSession();
            window.renderResultGrid();
        } else {
            let finalStr = promptText;
            
            // Backend prompt engineering for Comic Studio
            if (appState.currentModule === 'comic') {
                const panels = currentBlocks['comicPanels'] || '4 panels';
                finalStr = `(comic book page layout, ${panels}, narrative sequence: ${finalStr})`;
            }

            if(uploadedRefImage || appState.chatRefImages.length > 0) finalStr += ', (with reference image styling)';
            
            const response = await fetch('/api/generate/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: finalStr,
                    aspectRatio: currentAspectRatio
                })
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Preload image to ensure it is valid before saving
            const img = new Image();
            img.onload = () => {
                appState.generatedImages.push({ url: data.url, type: 'image' });
                incrementUsageCount('images');
                saveSession();
                
                window.renderResultGrid();
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

function renderVideoStudio() {
    uploadedRefImage = null;
    const playground = $('playground-area');
    
    const galleryImages = appState.generatedImages.filter(i => i.type === 'image');
    let selectorHtml = '';
    if(galleryImages.length > 0) {
        selectorHtml = `<div class="block-title" style="margin-top:16px">Chọn ảnh từ Thư viện</div><div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-top:8px">`;
        galleryImages.forEach(img => {
            selectorHtml += `<img src="${img.url}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; cursor:pointer; border: 2px solid transparent" class="gal-select-item" onclick="selectGalImage(this, '${img.url}')" onerror="this.style.display='none'">`;
        });
        selectorHtml += `</div>`;
    }

    playground.innerHTML = `
        <div class="playground-header">
            <h1><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>Image to Video</h1>
            <p>Tải lên một bức ảnh và thêm chuyển động để tạo video.</p>
        </div>
        <div class="playground-content">
            <div class="glass-panel builder-area" style="flex: 1; max-width: 600px;">
                <div class="block-group">
                    <div class="block-title">Ảnh đầu vào (Bắt buộc)</div>
                    <div class="upload-zone" id="ref-upload-zone">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p style="font-size: 0.9rem">Tải lên hoặc dán (Ctrl+V) bức ảnh tĩnh</p>
                        <input type="file" id="ref-file" hidden accept="image/*">
                    </div>
                    <div class="ref-preview-container" id="ref-preview-container">
                        <img id="ref-preview-img" src="" alt="Reference">
                        <button class="btn-remove-ref" id="btn-remove-ref">
                            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    ${selectorHtml}
                </div>

                <div class="block-group" style="margin-top:16px">
                    <div class="block-title">Mô tả Chuyển động (Prompt)</div>
                    <input type="text" id="vid-prompt" class="input-field" placeholder="Ví dụ: camera zoom in, mái tóc bay nhẹ trong gió...">
                </div>
                
                <div class="block-group" style="margin-top:16px">
                    <div class="block-title">Khung hình</div>
                    <div class="custom-select" data-category="vidRatio">
                        <div class="select-trigger">
                            <span class="trigger-text">16:9 (Ngang)</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="select-options">
                            <div class="option-item selected" data-val="16:9"><span class="option-label">16:9 (Ngang)</span></div>
                            <div class="option-item" data-val="9:16"><span class="option-label">9:16 (Dọc)</span></div>
                        </div>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--primary-color); margin-top:8px">Lưu ý: Thời lượng video mặc định là 8 giây.</p>
                </div>

                <button id="btn-generate" class="btn-lime" style="width: 100%; height: 56px; padding: 0 32px; border-radius: 999px; font-weight: 700; font-size: 1.1rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; color: #13203A; box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: transform 0.2s; flex-shrink: 0;">🎬 Bắt đầu tạo Video</button>
            </div>
            
            <div class="output-area">
                <div class="result-display" id="result-display">
                    <span style="color: var(--text-muted); font-size: 1.1rem;">Video sẽ hiển thị tại đây</span>
                </div>
            </div>
        </div>
    `;

    setupReferenceUpload();
    setupPromptBuilderLogic(true);
    document.addEventListener('paste', handleImg2VidPaste);
}

function handleImg2VidPaste(e) {
    if(appState.view !== 'video') return;
    if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
            if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
                const file = e.clipboardData.items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => {
                    uploadedRefImage = ev.target.result;
                    $('ref-preview-img').src = uploadedRefImage;
                    $('ref-upload-zone').style.display = 'none';
                    $('ref-preview-container').style.display = 'block';
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    }
}

window.selectGalImage = (el, url) => {
    document.querySelectorAll('.gal-select-item').forEach(img => img.style.borderColor = 'transparent');
    el.style.borderColor = 'var(--primary-color)';
    uploadedRefImage = url;
    $('ref-preview-img').src = uploadedRefImage;
    $('ref-upload-zone').style.display = 'none';
    $('ref-preview-container').style.display = 'block';
};

function renderGalleryView() {
    const playground = $('playground-area');
    const isMultiSelect = appState.gallerySelectMode;
    
    let headerActions = "";
    if (isMultiSelect) {
        headerActions = `
            <button class="btn-modern-tech" onclick="downloadAll()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải tất cả
            </button>
            <button class="btn-modern-tech-primary" onclick="toggleGallerySelectMode()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Hủy chọn
            </button>
        `;
    } else {
        headerActions = `
            <button class="btn-modern-tech" onclick="downloadAll()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải tất cả
            </button>
            <button class="btn-modern-tech-primary" onclick="toggleGallerySelectMode()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
                Chọn nhiều
            </button>
        `;
    }

    const itemsHtml = appState.generatedImages.map((item, index) => {
        const isSelected = appState.gallerySelectedIndices.includes(index);
        const selClass = isSelected ? 'selected' : '';
        const clickHandler = isMultiSelect ? `onclick="toggleItemSelect(${index})"` : `onclick="showLightbox('${item.url}', '${item.type}')"`;
        
        let actionsHtml = '';
        if(!isMultiSelect) {
            if (item.type === 'video') {
                actionsHtml = `
                    <span style="color:white; font-size:12px; background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px">Video</span>
                    <button class="btn-icon" onclick="event.stopPropagation(); downloadFile('${item.url}', 'video_${index}.mp4')" title="Tải xuống">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); deleteItem(${index})" title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn-gen-video" onclick="event.stopPropagation(); turnIntoVideo(${index})">🎬 Tạo video</button>
                    <div>
                        <button class="btn-icon" onclick="event.stopPropagation(); downloadFile('${item.url}', 'image_${index}.jpg')" title="Tải xuống">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                        <button class="btn-icon" onclick="event.stopPropagation(); deleteItem(${index})" title="Xóa">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            }
        }

        const contentHtml = item.type === 'video' ? `<video src="${item.url}" autoplay loop muted></video>` : `<img src="${item.url}" alt="Art" onerror="this.src='https://placehold.co/400x400/1e293b/ef4444?text=L%E1%BB%97i+c%C5%A9'">`;

        return `
        <div class="gallery-item ${selClass}" id="gal-item-${index}" ${clickHandler} style="cursor: pointer;">
            ${contentHtml}
            <div class="gallery-actions" style="display: ${isMultiSelect ? 'none' : 'flex'}">
                ${actionsHtml}
            </div>
        </div>`;
    }).reverse().join('');

    // Handle floating multi-actions
    let multiActionsHtml = '';
    if(isMultiSelect && appState.gallerySelectedIndices.length > 0) {
        multiActionsHtml = `
            <div class="gallery-multi-actions">
                <span style="font-weight:600">Đã chọn ${appState.gallerySelectedIndices.length}</span>
                <button class="btn-multi-download" onclick="downloadSelected()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Tải xuống
                </button>
                <button class="btn-multi-delete" onclick="deleteSelected()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Xóa
                </button>
            </div>
        `;
    }

    playground.innerHTML = `
        <div class="playground-header" style="display:flex; justify-content:space-between; align-items:center">
            <div>
                <h1>Thư viện cá nhân của bạn</h1>
                <p>Nơi lưu trữ mọi tuyệt tác AI bạn đã tạo ra.</p>
            </div>
            <div style="display:flex; gap: 12px">
                ${headerActions}
            </div>
        </div>
        <div class="glass-panel" style="padding: 32px; flex: 1; overflow-y: auto; position:relative">
            ${itemsHtml ? `<div class="gallery-grid">${itemsHtml}</div>` : `<div style="text-align:center; padding: 60px; color:var(--text-secondary); font-weight: 500;">Chưa có tác phẩm nào. Hãy vào Studio để sáng tạo nhé!</div>`}
            ${multiActionsHtml}
        </div>
    `;
}

window.toggleGallerySelectMode = () => {
    appState.gallerySelectMode = !appState.gallerySelectMode;
    appState.gallerySelectedIndices = [];
    renderGalleryView();
};

window.toggleItemSelect = (index) => {
    if(appState.gallerySelectedIndices.includes(index)) {
        appState.gallerySelectedIndices = appState.gallerySelectedIndices.filter(i => i !== index);
    } else {
        appState.gallerySelectedIndices.push(index);
    }
    renderGalleryView();
};

window.deleteItem = (index) => {
    if(confirm('Bạn có chắc muốn xóa tác phẩm này?')) {
        appState.generatedImages.splice(index, 1);
        saveSession();
        renderGalleryView();
    }
};

window.deleteSelected = () => {
    if(confirm(`Bạn có chắc muốn xóa ${appState.gallerySelectedIndices.length} tác phẩm đã chọn?`)) {
        // Sort descending to avoid index shifting when deleting
        const sorted = [...appState.gallerySelectedIndices].sort((a,b) => b-a);
        sorted.forEach(idx => appState.generatedImages.splice(idx, 1));
        appState.gallerySelectedIndices = [];
        appState.gallerySelectMode = false;
        saveSession();
        renderGalleryView();
    }
};

window.downloadSelected = async () => {
    const sorted = [...appState.gallerySelectedIndices].sort((a,b) => b-a);
    for (let idx of sorted) {
        const item = appState.generatedImages[idx];
        const ext = item.type === 'video' ? 'mp4' : 'jpg';
        await window.downloadFile(item.url, `ai_studio_${idx}.${ext}`);
    }
    appState.gallerySelectedIndices = [];
    appState.gallerySelectMode = false;
    renderGalleryView();
};

window.downloadAll = async () => {
    if(appState.generatedImages.length === 0) return;
    if(confirm(`Tải xuống toàn bộ ${appState.generatedImages.length} tác phẩm? (Trình duyệt sẽ tải lần lượt từng file)`)) {
        for (let idx = 0; idx < appState.generatedImages.length; idx++) {
            const item = appState.generatedImages[idx];
            const ext = item.type === 'video' ? 'mp4' : 'jpg';
            await window.downloadFile(item.url, `ai_studio_all_${idx}.${ext}`);
        }
    }
};

window.downloadFile = async (url, filename) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (e) {
        alert("Có lỗi xảy ra khi tải file xuống.");
    }
};

window.turnIntoVideo = async (index) => {
    if (!checkLimits('videos')) return;

    const itemEl = $('gal-item-' + index);
    if(!itemEl) return;
    
    itemEl.innerHTML += `
        <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <div class="loading-spinner" style="border: 3px solid rgba(255,255,255,0.1); border-left-color: var(--secondary-color); border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom: 8px"></div>
            <div style="color:white; font-size: 0.85rem; font-weight:600;">Cùng chờ đón video nhé</div>
        </div>
    `;

    try {
        const item = appState.generatedImages[index];
        const response = await fetch('/api/generate/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: 'Subtle dynamic motion, cinematic',
                refImageUrl: item.url,
                aspectRatio: '16:9'
            })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        appState.generatedImages.push({
            url: data.url,
            type: 'video'
        });
        incrementUsageCount('videos');
        saveSession();
        renderGalleryView();
    } catch (e) {
        console.error(e);
        alert('Lỗi tạo video: ' + e.message);
        renderGalleryView();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

window.showLightbox = function(url, type) {
    let lightbox = document.getElementById('global-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'global-lightbox';
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-close" onclick="closeLightbox()">&times;</div>
            <div class="lightbox-content"></div>
        `;
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    const content = lightbox.querySelector('.lightbox-content');
    if (type === 'video') {
        content.innerHTML = `<video src="${url}" controls autoplay loop class="lightbox-media"></video>`;
    } else {
        content.innerHTML = `<img src="${url}" class="lightbox-media" alt="Lightbox Media">`;
    }
    
    lightbox.classList.add('show');
};

window.closeLightbox = function() {
    const lightbox = document.getElementById('global-lightbox');
    if (lightbox) {
        lightbox.classList.remove('show');
        setTimeout(() => {
            const content = lightbox.querySelector('.lightbox-content');
            if (content) content.innerHTML = '';
        }, 300);
    }
};
