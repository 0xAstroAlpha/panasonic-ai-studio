export const SVG_ICONS = {
    comic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    game: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect><path d="M6 12h4"></path><path d="M8 10v4"></path><path d="M15 13h.01"></path><path d="M18 11h.01"></path></svg>',
    character: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path></svg>',
    science: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-8 14h16l-8-14z"></path><circle cx="12" cy="12" r="2"></circle></svg>',
    info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    logout: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    sketch: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
    video: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
    gallery: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
};

export function getOptionIcon(id) {
    const icons = {
        '1 panel': '🖼️', '2 panels': '📖', '4 panels': '📚', '6 panels': '⚡',
        'manga': '🌸', 'webtoon': '📱', 'marvel_dc': '🦸', 'pop_art': '🎨',
        'neon_city': '🏙️', 'cyberpunk_alley': '🛣️', 'space_battle': '🚀', 'magical_forest': '🌲',
        'pixel_art': '👾', 'low_poly': '💎', 'aaa_realistic': '🎮', 'cel_shaded': '✏️',
        'nam': '👦', 'nu': '👧', 'khac': '🧸',
        'vietnam': '🇻🇳', 'korea': '🇰🇷', 'japan': '🇯🇵', 'usa': '🇺🇸', 'europe': '🇪🇺',
        'child': '👶', 'teen': '🧑', 'young_adult': '🧑‍🎓', 'adult': '👨', 'elderly': '🧓',
        'mascot_cute': '🦊', 'chibi_3d': '🧸', 'crayon_hand': '🖍️', 'anime_chibi': '💫',
        'diagram': '📊', 'model_3d': '🪐', 'watercolor': '🎨', 'blueprint': '📐',
        'lab': '🔬', 'nature': '🌍', 'book': '📖',
        'dreamy': '✨', 'mysterious': '🔍', 'epic': '🌋', 'nostalgic': '⏳',
        'english': '🇬🇧', 'vietnamese': '🇻🇳', 'japanese': '🇯🇵', 'korean': '🇰🇷',
        '16:9': '📺', '9:16': '📱', '--ar 1:1': '⬜', '--ar 16:9': '📺', '--ar 9:16': '📱',
        'anime': '🌸', 'colored_pencil': '🖍️', 'realistic': '📷'
    };
    return icons[id] || '🔹';
}
