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
        { id: 'comic', name: 'Xưởng Truyện Tranh', role: ['Họa sĩ truyện tranh', 'Nhà thiết kế đồ họa', 'Storyteller'], style: 'card-blue', img: 'images/floating_ai_comic.png' },
        { id: 'character', name: 'Tạo Nhân Vật', role: ['Thiết kế Mascot', 'Hoạt họa viên', 'Nhà sáng tạo nhân vật'], style: 'card-purple', img: 'images/floating_ai_character.png' },
        { id: 'science', name: 'Xưởng Khoa Học Vui', role: ['Giáo viên khoa học', 'Nhà nghiên cứu', 'Truyền thông khoa học'], style: 'card-green', img: 'images/hero_science.png' },
        { id: 'sketch', name: 'Vẽ tranh cùng AI', role: ['Họa sĩ phác thảo', 'Minh họa viên', 'Thiết kế mỹ thuật'], style: 'card-teal', img: 'images/hero_art.png' },
        { id: 'infographic', name: 'Sáng tạo Infographic', role: ['Nhà giáo dục', 'Báo chí số', 'Thiết kế thông tin'], style: 'card-blue', img: 'images/hero_infographic.png' }
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
                                <div><h4>Xưởng Truyện Tranh</h4><p>Kể chuyện bằng tranh ảnh</p></div>
                                <div class="fc-arrow">➔</div>
                            </div>
                        </div>
                        <div class="floating-card fc-2">
                            <img src="images/floating_ai_character.png" alt="Character">
                            <div class="fc-info">
                                <div><h4>Tạo Nhân Vật</h4><p>Thiết kế Mascot dễ thương</p></div>
                                <div class="fc-arrow">➔</div>
                            </div>
                        </div>
                        <div class="floating-card fc-3">
                            <img src="images/hero_science.png" alt="Science">
                            <div class="fc-info">
                                <div><h4>Khoa Học Vui</h4><p>Minh họa hiện tượng lý thú</p></div>
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

    appContainer.innerHTML = `
        <div class="main-layout">
            <aside class="sidebar glass-panel" id="main-sidebar">
                <div class="sidebar-logos" style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px; padding: 8px 0 12px 0; border-bottom: 1px solid var(--panel-border);">
                    <img src="images/risupia_logo.png" alt="Risupia Logo" style="height: 28px; object-fit: contain;">
                    <span style="font-size: 1.2rem; color: rgba(19, 32, 58, 0.2); font-weight: bold;">|</span>
                    <img src="images/vidtory_logo.png" alt="Vidtory Logo" style="height: 22px; object-fit: contain;">
                </div>
                <div class="sidebar-user">
                    <img src="${appState.avatar}" alt="Avatar">
                    <h3 style="margin-bottom:2px;">${appState.nickname}</h3>
                    <span class="studio-badge" style="margin-left:0; margin-bottom:4px; background:var(--primary-blue); font-size:11px;">${roleName}</span>
                    <div class="quota-container" style="width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
                        <div class="quota-item">
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">
                                <span>📷 Ảnh đã vẽ</span>
                                <span style="font-weight: 600;">${imgCount}/${imgLimit}</span>
                            </div>
                            <div class="quota-bar-track" style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; width: 100%;">
                                <div class="quota-bar-fill fill-images" style="height: 100%; width: ${Math.min(100, (imgCount/imgLimit)*100)}%; background: ${getQuotaColor(imgCount, imgLimit)}; border-radius: 3px; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        <div class="quota-item">
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">
                                <span>🎬 Phim ngắn</span>
                                <span style="font-weight: 600;">${vidCount}/${vidLimit}</span>
                            </div>
                            <div class="quota-bar-track" style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; width: 100%;">
                                <div class="quota-bar-fill fill-videos" style="height: 100%; width: ${Math.min(100, (vidCount/vidLimit)*100)}%; background: ${getQuotaColor(vidCount, vidLimit)}; border-radius: 3px; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        <div class="quota-advice" style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; text-align: center; margin-top: 4px;">
                            ${getQuotaAdvice(imgCount, imgLimit, vidCount, vidLimit)}
                        </div>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    <div class="sidebar-category-header">Studio Sáng Tạo</div>
                    ${navItems}
                    <div class="sidebar-category-header" style="margin-top: 8px;">Khác</div>
                    <div class="nav-item ${appState.view === 'video' ? 'active' : ''}" data-view="video">
                        <span class="icon">${SVG_ICONS.video}</span><span class="nav-item-text">Làm Phim Ngắn</span>
                    </div>
                    <div class="nav-item ${appState.view === 'gallery' ? 'active' : ''}" data-view="gallery">
                        <span class="icon">${SVG_ICONS.gallery}</span><span class="nav-item-text">Thư viện</span>
                    </div>
                    ${role === 'teacher' ? `
                    <div class="sidebar-category-header" style="margin-top: 8px;">Giáo viên</div>
                    <div class="nav-item ${appState.view === 'teacher' ? 'active' : ''}" data-view="teacher">
                        <span class="icon">${SVG_ICONS.teacher}</span><span class="nav-item-text">Quản lý Lớp học</span>
                    </div>
                    ` : ''}
                </nav>
                <div style="margin-top: auto; padding: 16px;">
                    <button class="nav-item" onclick="window.handleLogout()" style="width: 100%; border: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; justify-content: flex-start; cursor: pointer;">
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
            <div class="quota-container" style="width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
                <div class="quota-item">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">
                        <span>📷 Ảnh đã vẽ</span>
                        <span style="font-weight: 600;">${currentImgCount}/${currentImgLimit}</span>
                    </div>
                    <div class="quota-bar-track" style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; width: 100%;">
                        <div class="quota-bar-fill fill-images" style="height: 100%; width: ${Math.min(100, (currentImgCount/currentImgLimit)*100)}%; background: ${getQuotaColor(currentImgCount, currentImgLimit)}; border-radius: 3px; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div class="quota-item">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">
                        <span>🎬 Phim ngắn</span>
                        <span style="font-weight: 600;">${currentVidCount}/${currentVidLimit}</span>
                    </div>
                    <div class="quota-bar-track" style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; width: 100%;">
                        <div class="quota-bar-fill fill-videos" style="height: 100%; width: ${Math.min(100, (currentVidCount/currentVidLimit)*100)}%; background: ${getQuotaColor(currentVidCount, currentVidLimit)}; border-radius: 3px; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div class="quota-advice" style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; text-align: center; margin-top: 4px;">
                    ${getQuotaAdvice(currentImgCount, currentImgLimit, currentVidCount, currentVidLimit)}
                </div>
            </div>
        `;
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
