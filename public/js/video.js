import { appState } from './state.js';
import { setupReferenceUpload, setupPromptBuilderLogic, convertToJpeg } from './studio.js';

export function handleImg2VidPaste(e) {
    if (appState.view !== 'video') return;
    if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
            if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
                const file = e.clipboardData.items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => {
                    convertToJpeg(ev.target.result, (jpegDataUrl) => {
                        window.uploadedRefImage = jpegDataUrl;
                        const previewImg = document.getElementById('ref-preview-img');
                        const uploadZone = document.getElementById('ref-upload-zone');
                        const previewContainer = document.getElementById('ref-preview-container');
                        if (previewImg) previewImg.src = window.uploadedRefImage;
                        if (uploadZone) uploadZone.style.display = 'none';
                        if (previewContainer) previewContainer.style.display = 'block';
                    });
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    }
}

export function renderVideoStudio() {
    window.uploadedRefImage = null;
    const playground = document.getElementById('playground-area');
    if (!playground) return;
    
    const galleryImages = appState.generatedImages.filter(i => i.type === 'image');
    let selectorHtml = '';
    if (galleryImages.length > 0) {
        selectorHtml = `<div class="block-title" style="margin-top:16px">Chọn ảnh từ Thư viện của em</div><div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-top:8px">`;
        galleryImages.forEach(img => {
            selectorHtml += `<img src="${img.url}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; cursor:pointer; border: 2px solid transparent" class="gal-select-item" onclick="window.selectGalImage(this, '${img.url}')" onerror="this.style.display='none'">`;
        });
        selectorHtml += `</div>`;
    }

    playground.innerHTML = `
        <div class="playground-header">
            <h1>🎬 Làm Phim Ngắn</h1>
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
                    <div class="ref-preview-container" id="ref-preview-container" style="display: none;">
                        <img id="ref-preview-img" src="" alt="Reference">
                        <button class="btn-remove-ref" id="btn-remove-ref">
                            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    ${selectorHtml}
                </div>

                <div class="block-group" style="margin-top:16px">
                    <div class="block-title">Mô tả Chuyển động (Lệnh tạo chuyển động)</div>
                    <input type="text" id="vid-prompt" class="input-field" placeholder="Ví dụ: camera zoom xích lại gần, mái tóc bay nhẹ trong gió...">
                </div>
                
                <div class="block-group" style="margin-top:16px">
                    <div class="block-title">Khung hình video</div>
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
}
