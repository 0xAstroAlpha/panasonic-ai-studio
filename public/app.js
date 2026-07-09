import {
    appState,
    CREDENTIALS,
    LIMITS,
    AVATARS,
    getUsageCount,
    saveSession,
    getQuotaColor,
    getQuotaAdvice
} from './js/state.js';

import { SVG_ICONS } from './js/icons.js';
import { MODULES, renderPlayground, handleGlobalPaste } from './js/studio.js';
import { renderVideoStudio } from './js/video.js';
import { renderGalleryView } from './js/gallery.js';
import { renderTeacherView } from './js/teacher.js';

const $ = id => document.getElementById(id);
const appContainer = $('app-container');

function init() {
    const currentUser = localStorage.getItem('ai_studio_current_user');
    if (currentUser) {
        const saved = localStorage.getItem('ai_studio_session_' + currentUser);
        if (saved) {
            Object.assign(appState, JSON.parse(saved));
            if (appState.generatedImages.length > 0 && typeof appState.generatedImages[0] === 'string') {
                appState.generatedImages = appState.generatedImages.map(url => ({ url, type: 'image' }));
            }
            renderMainLayout();
            checkOnboarding();
            return;
        }
    }
    renderLanding();
}

function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn thoát?\nToàn bộ tác phẩm chưa tải xuống sẽ bị xóa mất hoàn toàn!')) {
        const currentUser = localStorage.getItem('ai_studio_current_user') || appState.username;
        if (currentUser) {
            localStorage.removeItem('ai_studio_session_' + currentUser);
        }
        localStorage.removeItem('ai_studio_current_user');
        localStorage.removeItem('ai_studio_session'); // clear compatibility copy
        appState.username = ''; appState.nickname = ''; appState.avatar = ''; appState.generatedImages = [];
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

function renderLanding() {
    document.body.classList.add('landing-mode');
    const landingModules = [
        { id: 'comic', name: 'Xưởng Truyện Tranh', role: ['Họa sĩ truyện tranh', 'Nhà thiết kế đồ họa', 'Storyteller'], style: 'card-blue', img: 'images/floating_ai_comic_vn.jpg' },
        { id: 'character', name: 'Tạo Nhân Vật', role: ['Thiết kế Mascot', 'Hoạt họa viên', 'Nhà sáng tạo nhân vật'], style: 'card-purple', img: 'images/floating_ai_character_vn.jpg' },
        { id: 'science', name: 'Xưởng Khoa Học Vui', role: ['Giáo viên khoa học', 'Nhà nghiên cứu', 'Truyền thông khoa học'], style: 'card-green', img: 'images/hero_science_vn.jpg' },
        { id: 'sketch', name: 'Vẽ tranh cùng AI', role: ['Họa sĩ phác thảo', 'Minh họa viên', 'Thiết kế mỹ thuật'], style: 'card-teal', img: 'images/hero_art_vn.jpg' },
        { id: 'infographic', name: 'Sáng tạo Infographic', role: ['Nhà giáo dục', 'Báo chí số', 'Thiết kế thông tin'], style: 'card-blue', img: 'images/hero_infographic_vn.jpg' }
    ];

    const gridHtml = landingModules.map((m, index) => `
        <div class="feature-card ${m.style} reveal delay-${(index % 5) + 1}" onclick="document.getElementById('btn-start-landing').click()">
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
                    <!-- Ambient Background Blobs -->
                    <div class="ambient-blob blob-1"></div>
                    <div class="ambient-blob blob-2"></div>
                    <div class="ambient-blob blob-3"></div>
                    <div class="ambient-blob blob-4"></div>

                    <!-- Galaxy Sparkles & Bubbles -->
                    <div class="sparkle sp-1"></div>
                    <div class="sparkle sp-2"></div>
                    <div class="sparkle sp-3"></div>
                    <div class="sparkle sp-4"></div>
                    <div class="sparkle sp-5"></div>
                    <div class="glass-bubble"></div>

                    <div class="hero-text-col reveal">
                        <div class="hero-logos-pill reveal">
                            <img src="images/Panasonic.png" alt="Panasonic Logo" class="logo-panasonic">
                            <span class="logo-divider"></span>
                            <img src="images/vidtory_logo.png" alt="Vidtory Logo" class="logo-vidtory">
                        </div>
                        <h1 class="hero-title" style="white-space: nowrap;"><span style="white-space: nowrap;">KHÁM PHÁ TIỀM NĂNG</span><br>CỦA <span style="color: #0077FF;">AI</span> <span style="color: #00C853;">SÁNG TẠO</span></h1>
                        <p class="hero-subtitle">Trải nghiệm những công cụ AI mới nhất,<br>giúp em hiện thực hoá ước mơ sáng tạo của bản thân</p>
                        <div class="hero-actions">
                            <button id="btn-start-landing" class="btn-lime">Trải nghiệm ngay <span style="margin-left:8px; font-weight: bold;">➔</span></button>
                        </div>
                        <div class="hero-features reveal delay-1">
                            <div class="feature-item">
                                <div class="feature-icon"><img src="images/icon-ai.svg" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2310b981\\' stroke-width=\\'2\\'><path d=\\'M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2zm12 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2zM12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z\\'/></svg>'" alt="AI"></div>
                                <span>Công cụ AI<br>hiện đại</span>
                            </div>
                            <div class="feature-divider"></div>
                            <div class="feature-item">
                                <div class="feature-icon"><img src="images/icon-shield.svg" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2310b981\\' stroke-width=\\'2\\'><path d=\\'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\\'/></svg>'" alt="Shield"></div>
                                <span>An toàn<br>& bảo mật</span>
                            </div>
                            <div class="feature-divider"></div>
                            <div class="feature-item">
                                <div class="feature-icon"><img src="images/icon-edu.svg" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2310b981\\' stroke-width=\\'2\\'><path d=\\'M22 10v6M2 10l10-5 10 5-10 5z\\'/><path d=\\'M6 12v5c3 3 9 3 12 0v-5\\'/></svg>'" alt="Edu"></div>
                                <span>Hỗ trợ học tập<br>sáng tạo</span>
                            </div>
                        </div>
                    </div>
                    <div class="hero-visuals-col reveal delay-2">
                        <div class="floating-card fc-1">
                            <div class="fc-img-wrapper"><img src="images/floating_ai_comic_vn.jpg" alt="Comic"></div>
                            <div class="fc-info">
                                <div class="fc-icon" style="background:#dcfce7; color:#16a34a;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
                                <div><h4>Xưởng Truyện Tranh</h4><p>Kể chuyện bằng tranh ảnh</p></div>
                            </div>
                        </div>
                        <div class="floating-card fc-2">
                            <div class="fc-img-wrapper"><img src="images/floating_ai_character_vn.jpg" alt="Character"></div>
                            <div class="fc-info">
                                <div class="fc-icon" style="background:#dcfce7; color:#16a34a;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h8"/></svg></div>
                                <div><h4>Tạo Nhân Vật</h4><p>Thiết kế Mascot dễ thương</p></div>
                            </div>
                        </div>
                        <div class="floating-card fc-3">
                            <div class="fc-img-wrapper"><img src="images/hero_science_vn.jpg" alt="Science"></div>
                            <div class="fc-info">
                                <div class="fc-icon" style="background:#dcfce7; color:#16a34a;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21h6M12 17v4M12 17a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v6a4 4 0 0 0 4 4z"/></svg></div>
                                <div><h4>Khoa Học Vui</h4><p>Minh họa hiện tượng lý thú</p></div>
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
                    <img src="images/Panasonic.png" alt="Panasonic Logo" style="height: 65px; object-fit: contain;">
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
        if (loginView) loginView.classList.add('active');
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
        if (profileView) profileView.classList.add('active');
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
    const renderSidebarUser = ({ currentRoleName, currentImgCount, currentImgLimit, currentVidCount, currentVidLimit }) => `
        <div class="sidebar-profile">
            <img src="${appState.avatar}" alt="Avatar">
            <div class="sidebar-profile-copy">
                <h3>${appState.nickname}</h3>
                <span class="studio-badge sidebar-role-badge">${currentRoleName}</span>
            </div>
        </div>
        <div class="sidebar-quota">
            <div class="quota-item">
                <div class="quota-row">
                    <span>📷 Ảnh đã vẽ</span>
                    <span>${currentImgCount}/${currentImgLimit}</span>
                </div>
                <div class="quota-bar-track">
                    <div class="quota-bar-fill fill-images" style="width: ${Math.min(100, (currentImgCount/currentImgLimit)*100)}%; background: ${getQuotaColor(currentImgCount, currentImgLimit)};"></div>
                </div>
            </div>
            <div class="quota-item">
                <div class="quota-row">
                    <span>🎬 Phim ngắn</span>
                    <span>${currentVidCount}/${currentVidLimit}</span>
                </div>
                <div class="quota-bar-track">
                    <div class="quota-bar-fill fill-videos" style="width: ${Math.min(100, (currentVidCount/currentVidLimit)*100)}%; background: ${getQuotaColor(currentVidCount, currentVidLimit)};"></div>
                </div>
            </div>
            <div class="quota-advice">
                ${getQuotaAdvice(currentImgCount, currentImgLimit, currentVidCount, currentVidLimit)}
            </div>
        </div>
    `;

    appContainer.innerHTML = `
        <div class="main-layout">
            <aside class="sidebar glass-panel" id="main-sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logos">
                        <img src="images/Panasonic.png" alt="Panasonic Logo" class="sidebar-logo-panasonic">
                        <span class="sidebar-logo-divider"></span>
                        <img src="images/vidtory_logo.png" alt="Vidtory Logo" class="sidebar-logo-vidtory">
                    </div>
                </div>
                <nav class="sidebar-menu">
                    <div class="sidebar-category-header">Studio Sáng Tạo</div>
                    ${navItems}
                    <div class="sidebar-category-header sidebar-category-spaced">Công cụ</div>
                    <div class="nav-item ${appState.view === 'video' ? 'active' : ''}" data-view="video">
                        <span class="icon">${SVG_ICONS.video}</span><span class="nav-item-text">Làm Phim Ngắn</span>
                    </div>
                    <div class="nav-item ${appState.view === 'gallery' ? 'active' : ''}" data-view="gallery">
                        <span class="icon">${SVG_ICONS.gallery}</span><span class="nav-item-text">Thư viện</span>
                    </div>
                    ${role === 'teacher' ? `
                    <div class="sidebar-category-header sidebar-category-spaced">Giáo viên</div>
                    <div class="nav-item ${appState.view === 'teacher' ? 'active' : ''}" data-view="teacher">
                        <span class="icon">${SVG_ICONS.teacher}</span><span class="nav-item-text">Quản lý Lớp học</span>
                    </div>
                    ` : ''}
                </nav>
                <div class="sidebar-footer">
                    <div class="sidebar-user">
                        ${renderSidebarUser({
                            currentRoleName: roleName,
                            currentImgCount: imgCount,
                            currentImgLimit: imgLimit,
                            currentVidCount: vidCount,
                            currentVidLimit: vidLimit
                        })}
                    </div>
                    <button class="nav-item sidebar-logout" onclick="window.handleLogout()" aria-label="Đăng xuất" title="Đăng xuất">
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

        sidebarUser.innerHTML = renderSidebarUser({
            currentRoleName,
            currentImgCount,
            currentImgLimit,
            currentVidCount,
            currentVidLimit
        });
    };

    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.currentTarget.hasAttribute('onclick')) return;
            document.querySelectorAll('.sidebar .nav-item').forEach(n => n.classList.remove('active'));
            const el = e.currentTarget;
            el.classList.add('active');

            if (el.hasAttribute('data-id')) {
                appState.currentModule = el.getAttribute('data-id');
                appState.view = 'studio';
                appState.promptStep = 'builder';
                appState.comparisonMode = false;
                appState.comparisonBase = null;
                window.currentBlocks = {};
                window.uploadedRefImage = null;
                appState.chatRefImages = [];
                window.currentAspectRatio = '--ar 1:1';
                renderPlayground();
            } else if (el.hasAttribute('data-view')) {
                appState.view = el.getAttribute('data-view');
                appState.comparisonMode = false;
                appState.comparisonBase = null;
                if (appState.view === 'video') renderVideoStudio();
                else if (appState.view === 'gallery') renderGalleryView();
                else if (appState.view === 'teacher') renderTeacherView();
            }
        });
    });

    if (appState.view === 'studio') renderPlayground();
    else if (appState.view === 'video') renderVideoStudio();
    else if (appState.view === 'gallery') renderGalleryView();
    else if (appState.view === 'teacher') renderTeacherView();
}

window.handleLogout = handleLogout;

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
@keyframes microphone-pulse {
    0% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 20px rgba(0, 180, 216, 0.4); }
    100% { transform: scale(1); opacity: 0.9; }
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
            <div class="lightbox-close" onclick="window.closeLightbox()">&times;</div>
            <div class="lightbox-content"></div>
        `;
        document.body.appendChild(lightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                window.closeLightbox();
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

// Global handlers for reference image pasting
document.addEventListener('paste', handleGlobalPaste);
