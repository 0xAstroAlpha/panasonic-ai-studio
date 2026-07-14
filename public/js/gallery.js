import { appState, saveSession, checkLimits, checkAndReserveLimits, incrementUsageCount, decrementUsageCount } from './state.js';

const MOCK_CLASS_GALLERY = [];

export function getClassGallery() {
    let list = localStorage.getItem('ai_studio_class_exhibition');
    if (!list) {
        localStorage.setItem('ai_studio_class_exhibition', JSON.stringify(MOCK_CLASS_GALLERY));
        return MOCK_CLASS_GALLERY;
    }
    return JSON.parse(list);
}

export function saveClassGallery(list) {
    localStorage.setItem('ai_studio_class_exhibition', JSON.stringify(list));
}

export function pushToClassGallery(url, type, prompt) {
    const list = getClassGallery();
    list.push({
        url,
        type,
        nickname: appState.nickname || 'Ẩn danh',
        prompt,
        reported: false
    });
    saveClassGallery(list);
}

export function toggleGallerySelectMode() {
    appState.gallerySelectMode = !appState.gallerySelectMode;
    appState.gallerySelectedIndices = [];
    renderGalleryView();
}

export function toggleItemSelect(index) {
    if (appState.gallerySelectedIndices.includes(index)) {
        appState.gallerySelectedIndices = appState.gallerySelectedIndices.filter(i => i !== index);
    } else {
        appState.gallerySelectedIndices.push(index);
    }
    renderGalleryView();
}

export function deleteItem(index) {
    if (confirm('Bạn có chắc muốn xóa tác phẩm này?')) {
        appState.generatedImages.splice(index, 1);
        saveSession();
        renderGalleryView();
    }
}

export function deleteSelected() {
    if (confirm(`Bạn có chắc muốn xóa ${appState.gallerySelectedIndices.length} tác phẩm đã chọn?`)) {
        const sorted = [...appState.gallerySelectedIndices].sort((a,b) => b-a);
        sorted.forEach(idx => appState.generatedImages.splice(idx, 1));
        appState.gallerySelectedIndices = [];
        appState.gallerySelectMode = false;
        saveSession();
        renderGalleryView();
    }
}

export async function downloadSelected() {
    const sorted = [...appState.gallerySelectedIndices].sort((a,b) => b-a);
    for (let idx of sorted) {
        const item = appState.generatedImages[idx];
        const ext = item.type === 'video' ? 'mp4' : 'jpg';
        await downloadFile(item.url, `ai_studio_${idx}.${ext}`);
    }
    appState.gallerySelectedIndices = [];
    appState.gallerySelectMode = false;
    renderGalleryView();
}

export async function downloadAll() {
    if (appState.generatedImages.length === 0) return;
    if (confirm(`Tải xuống toàn bộ ${appState.generatedImages.length} tác phẩm? (Trình duyệt sẽ tải lần lượt từng file)`)) {
        for (let idx = 0; idx < appState.generatedImages.length; idx++) {
            const item = appState.generatedImages[idx];
            const ext = item.type === 'video' ? 'mp4' : 'jpg';
            await downloadFile(item.url, `ai_studio_all_${idx}.${ext}`);
        }
    }
}

export async function downloadFile(url, filename) {
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
}

export async function turnIntoVideo(index) {
    // Reserve slot ngay (pessimistic) — chặn race condition
    if (!checkAndReserveLimits('videos')) return;

    const itemEl = document.getElementById('gal-item-' + index);
    if (!itemEl) return;

    itemEl.innerHTML += `
        <div style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; flex-direction:column; justify-content:center; align-items:center; border-radius:12px; z-index:10;">
            <div class="loading-spinner" style="border: 3px solid rgba(255,255,255,0.1); border-left-color: var(--secondary-color); border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom: 8px"></div>
            <div style="color:white; font-size: 0.85rem; font-weight:600;">Cùng chờ đón video nhé</div>
        </div>
    `;

    try {
        const item = appState.generatedImages[index];

        // Timeout 2 phút cho video generation
        const videoAbortCtrl = new AbortController();
        const videoTimeoutId = setTimeout(() => videoAbortCtrl.abort('timeout'), 2 * 60 * 1000);
        let response;
        try {
            response = await fetch('/api/generate/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: 'Subtle dynamic motion, cinematic',
                    refImageUrl: item.url,
                    aspectRatio: '16:9'
                }),
                signal: videoAbortCtrl.signal
            });
        } finally {
            clearTimeout(videoTimeoutId);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        appState.generatedImages.push({
            url: data.url,
            type: 'video',
            prompt: 'Chuyển động từ ảnh: ' + (item.prompt || 'Không có mô tả')
        });
        // Slot đã được reserve trước — không increment lại
        saveSession();
        renderGalleryView();
    } catch (e) {
        console.error('[gallery/video] Error:', e);
        // Hoàn trả slot đã reserve vì API thất bại (kể cả timeout)
        decrementUsageCount('videos');
        const isTimeout = e?.name === 'AbortError' || e?.message === 'timeout';
        const itemEl = document.getElementById('gal-item-' + index);
        if (itemEl) {
            const overlay = itemEl.querySelector('div[style*="position:absolute"]');
            if (overlay) overlay.remove();
            const msg = isTimeout
                ? '<div style="color:#ef4444;font-size:0.8rem;text-align:center;padding:8px">⏱️ Quá 2 phút — thử lại nhé!</div>'
                : '<div style="color:#ef4444;font-size:0.8rem;text-align:center;padding:8px">⚠️ Lỗi tạo video, thử lại sau!</div>';
            itemEl.insertAdjacentHTML('beforeend', msg);
            setTimeout(() => renderGalleryView(), 3000);
        } else {
            renderGalleryView();
        }
    }
}

export function selectGalImage(el, url) {
    document.querySelectorAll('.gal-select-item').forEach(img => img.style.borderColor = 'transparent');
    el.style.borderColor = 'var(--primary-color)';
    window.uploadedRefImage = url;
    const previewImg = document.getElementById('ref-preview-img');
    const uploadZone = document.getElementById('ref-upload-zone');
    const previewContainer = document.getElementById('ref-preview-container');
    if (previewImg) previewImg.src = url;
    if (uploadZone) uploadZone.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'block';
}

export function reportClassExhibitionItem(idx) {
    if (confirm("Em có chắc chắn muốn báo cáo tác phẩm này chưa phù hợp với lớp học không? 🚩")) {
        const list = getClassGallery();
        if (list[idx]) {
            list[idx].reported = true;
            saveClassGallery(list);
            alert("Đã gửi báo cáo nội dung này tới giáo viên! Cảm ơn em đã giữ lớp học an toàn. 🚩");
            renderGalleryView();
        }
    }
}

export function deleteClassExhibitionItem(idx) {
    if (confirm("Thầy/Cô có chắc chắn muốn xóa tác phẩm này khỏi triển lãm của lớp không? 🗑️")) {
        const list = getClassGallery();
        list.splice(idx, 1);
        saveClassGallery(list);
        renderGalleryView();
    }
}

export function renderGalleryView() {
    const playground = document.getElementById('playground-area');
    if (!playground) return;
    const isMultiSelect = appState.gallerySelectMode;
    const activeTab = 'personal';

    // Tabs switcher HTML (classroom exhibition hidden)
    const tabsHtml = '';

    let headerActions = "";
    if (activeTab === 'personal') {
        if (isMultiSelect) {
            headerActions = `
                <button class="btn-modern-tech" onclick="window.downloadAll()">
                    📥 Tải tất cả
                </button>
                <button class="btn-modern-tech-primary" onclick="window.toggleGallerySelectMode()">
                    ❌ Hủy chọn
                </button>
            `;
        } else {
            headerActions = `
                <button class="btn-modern-tech" onclick="window.downloadAll()">
                    📥 Tải tất cả
                </button>
                <button class="btn-modern-tech-primary" onclick="window.toggleGallerySelectMode()">
                    ☑️ Chọn nhiều
                </button>
            `;
        }
    }

    let itemsHtml = '';
    let multiActionsHtml = '';

    if (activeTab === 'personal') {
        itemsHtml = appState.generatedImages.map((item, index) => {
            const isSelected = appState.gallerySelectedIndices.includes(index);
            const selClass = isSelected ? 'selected' : '';
            const clickHandler = isMultiSelect ? `onclick="window.toggleItemSelect(${index})"` : `onclick="window.showLightbox('${item.url}', '${item.type}')"`;

            let actionsHtml = '';
            if (!isMultiSelect) {
                if (item.type === 'video') {
                    actionsHtml = `
                        <span style="color:white; font-size:12px; background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px">Video</span>
                        <button class="btn-icon" onclick="event.stopPropagation(); window.downloadFile('${item.url}', 'video_${index}.mp4')" title="Tải xuống">📥</button>
                        <button class="btn-icon" onclick="event.stopPropagation(); window.deleteItem(${index})" title="Xóa">🗑️</button>
                    `;
                } else {
                    actionsHtml = `
                        <div>
                            <button class="btn-icon" onclick="event.stopPropagation(); window.downloadFile('${item.url}', 'image_${index}.jpg')" title="Tải xuống">📥</button>
                            <button class="btn-icon" onclick="event.stopPropagation(); window.deleteItem(${index})" title="Xóa">🗑️</button>
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

        if (isMultiSelect && appState.gallerySelectedIndices.length > 0) {
            multiActionsHtml = `
                <div class="gallery-multi-actions" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; background: rgba(0,32,96,0.95); padding: 12px 24px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); color: white; align-items: center; z-index: 1000;">
                    <span style="font-weight:600; color: white;">Đã chọn ${appState.gallerySelectedIndices.length}</span>
                    <button class="btn-multi-download" onclick="window.downloadSelected()" style="background: var(--primary-lime); border: none; border-radius: 8px; color: #002060; padding: 8px 16px; font-weight: 700; cursor: pointer;">Tải xuống</button>
                    <button class="btn-multi-delete" onclick="window.deleteSelected()" style="background: #ef4444; border: none; border-radius: 8px; color: white; padding: 8px 16px; font-weight: 700; cursor: pointer;">Xóa</button>
                </div>
            `;
        }
    } else {
        // Classroom exhibition
        const classItems = getClassGallery();
        itemsHtml = classItems.map((item, index) => {
            const clickHandler = `onclick="window.showLightbox('${item.url}', '${item.type}')"`;
            const contentHtml = item.type === 'video' ? `<video src="${item.url}" autoplay loop muted></video>` : `<img src="${item.url}" alt="Art">`;

            // Moderator controls for teacher, Report for student
            let ctrlHtml = '';
            if (appState.role === 'teacher') {
                ctrlHtml = `
                    <button class="btn-danger-tech" onclick="event.stopPropagation(); window.deleteClassExhibitionItem(${index})" style="padding: 6px 12px; border-radius: 8px; border: none; background: #ef4444; color: white; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                        🗑️ Xóa khỏi triển lãm
                    </button>
                `;
            } else {
                ctrlHtml = `
                    <button class="btn-modern-tech" onclick="event.stopPropagation(); window.reportClassExhibitionItem(${index})" style="padding: 6px 12px; border-radius: 8px; border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.08); color: #ef4444; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                        🚩 Báo cáo không phù hợp
                    </button>
                `;
            }

            // Reported badge
            const reportedBadge = item.reported ? `
                <div class="reported-badge" style="position: absolute; top: 12px; left: 12px; background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; z-index: 5; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">
                    🚩 Báo cáo vi phạm
                </div>
            ` : '';

            return `
            <div class="gallery-item" id="class-gal-item-${index}" ${clickHandler} style="cursor: pointer; position: relative;">
                ${reportedBadge}
                ${contentHtml}
                <div style="position: absolute; bottom: 0; left:0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.85)); padding: 12px; display: flex; flex-direction: column; gap: 6px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; opacity: 0; transition: opacity 0.3s;" class="class-gallery-overlay">
                    <span style="color: var(--primary-lime); font-size: 0.85rem; font-weight: 700;">✍️ Tác giả: ${item.nickname}</span>
                    <span style="color: white; font-size: 0.75rem; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${item.prompt}</span>
                    <div style="margin-top: 4px; display: flex; gap: 8px;">
                        ${ctrlHtml}
                    </div>
                </div>
            </div>`;
        }).reverse().join('');

        // Inject hover rule to style sheet if needed
        if (!document.getElementById('class-gallery-hover-style')) {
            const classHoverStyle = document.createElement('style');
            classHoverStyle.id = 'class-gallery-hover-style';
            classHoverStyle.innerHTML = `
                .gallery-item:hover .class-gallery-overlay {
                    opacity: 1 !important;
                }
            `;
            document.head.appendChild(classHoverStyle);
        }
    }

    playground.innerHTML = `
        <div class="playground-header" style="display:flex; justify-content:space-between; align-items:center">
            <div>
                <h1>${activeTab === 'personal' ? 'Thư viện cá nhân của em' : 'Triển lãm lớp học 🏫'}</h1>
                <p>${activeTab === 'personal' ? 'Nơi lưu trữ mọi tuyệt tác AI em đã vẽ.' : 'Chiêm ngưỡng những bức ảnh tuyệt đẹp của các bạn cùng lớp.'}</p>
            </div>
            <div style="display:flex; gap: 12px">
                ${headerActions}
            </div>
        </div>
        <div class="glass-panel" style="padding: 24px 32px; flex: 1; overflow-y: auto; position:relative; display: flex; flex-direction: column;">
            ${tabsHtml}
            ${itemsHtml ? `<div class="gallery-grid" style="flex: 1; overflow-y: auto; padding-bottom: 20px;">${itemsHtml}</div>` : `<div style="text-align:center; padding: 60px; color:var(--text-secondary); font-weight: 500;">Chưa có tác phẩm nào ở đây cả.</div>`}
            ${multiActionsHtml}
        </div>
    `;
}

window.setGalleryTab = (tab) => {
    appState.galleryTab = tab;
    renderGalleryView();
};

// Bind functions to window object
window.toggleGallerySelectMode = toggleGallerySelectMode;
window.toggleItemSelect = toggleItemSelect;
window.deleteItem = deleteItem;
window.deleteSelected = deleteSelected;
window.downloadSelected = downloadSelected;
window.downloadAll = downloadAll;
window.downloadFile = downloadFile;
window.turnIntoVideo = turnIntoVideo;
window.selectGalImage = selectGalImage;
window.reportClassExhibitionItem = reportClassExhibitionItem;
window.deleteClassExhibitionItem = deleteClassExhibitionItem;
