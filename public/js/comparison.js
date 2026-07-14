import { appState } from './state.js';

export function enterComparisonMode() {
    const lastImg = [...appState.generatedImages].reverse().find(img => img.type === 'image');
    if (!lastImg) {
        alert("Bé hãy tạo ít nhất một bức ảnh trước khi bật chế độ so sánh nhé! 📷");
        return;
    }
    appState.comparisonMode = true;
    appState.comparisonBase = {
        url: lastImg.url,
        prompt: lastImg.prompt || document.getElementById('final-prompt')?.value.trim() || 'Câu lệnh gốc',
        module: appState.currentModule
    };
    if (window.renderPlayground) window.renderPlayground();
    alert("Đã bật chế độ so sánh! Hãy thay đổi 1 chi tiết bên trái (nhập ô chữ hoặc chọn dropdown khác) và bấm 'Sinh ảnh AI' để xem sự khác biệt.");
}

export function exitComparisonMode() {
    appState.comparisonMode = false;
    appState.comparisonBase = null;
    if (window.renderPlayground) window.renderPlayground();
}

export function getPromptDiffHtml(oldPrompt, newPrompt) {
    if (!oldPrompt || !newPrompt) return newPrompt || '';
    const oldWords = oldPrompt.toLowerCase().split(/\s+/);
    const newWords = newPrompt.split(/\s+/);
    
    return newWords.map(word => {
        // Strip common punctuation for word comparison
        const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        if (cleanWord && !oldWords.includes(cleanWord)) {
            return `<span style="background: rgba(183, 233, 49, 0.45); color: #2d4a00; font-weight: bold; padding: 2px 4px; border-radius: 4px; border: 1px solid rgba(183,233,49,0.6);">${word}</span>`;
        }
        return word;
    }).join(' ');
}

export function renderComparisonView(newImageUrl, newPrompt) {
    const box = document.getElementById('result-display');
    if (!box) return;
    
    const base = appState.comparisonBase;
    if (!base) return;

    const diffHtml = getPromptDiffHtml(base.prompt, newPrompt);
    
    box.innerHTML = `
        <div class="comparison-container" style="display: flex; gap: 20px; width: 100%; height: 100%; min-height: 380px; flex-direction: row; margin-top: 10px;">
            <div class="comparison-column" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                <h4 style="margin: 0; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                    <span>⬅️ Ảnh trước khi đổi</span>
                </h4>
                <div style="flex: 1; border-radius: 16px; overflow: hidden; border: 1px solid var(--panel-border); background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; position: relative; min-height: 240px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);">
                    <img src="${base.url}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.showLightbox('${base.url}', 'image', '${(base.prompt || '').replace(/'/g, "\\'")}')">
                </div>
                <div class="live-prompt-box" style="font-size: 0.85rem; min-height: unset; padding: 12px; background: rgba(255,255,255,0.7); line-height: 1.5; border-radius: 12px;">
                    ${base.prompt}
                </div>
            </div>
            <div class="comparison-column" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
                <h4 style="margin: 0; color: var(--primary-blue); font-size: 0.85rem; text-transform: uppercase; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                    <span>➡️ Ảnh sau khi đổi (Mới)</span>
                </h4>
                <div style="flex: 1; border-radius: 16px; overflow: hidden; border: 2.5px solid var(--primary-lime); background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; position: relative; min-height: 240px; box-shadow: 0 8px 24px rgba(183, 233, 49, 0.15);">
                    <img src="${newImageUrl}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.showLightbox('${newImageUrl}', 'image', '${(newPrompt || '').replace(/'/g, "\\'")}')">
                </div>
                <div class="live-prompt-box" style="font-size: 0.85rem; min-height: unset; padding: 12px; background: rgba(255,255,255,0.9); line-height: 1.5; border-radius: 12px; border-color: var(--primary-lime);">
                    ${diffHtml}
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px; width: 100%;">
            <button class="btn-lime" onclick="window.exitComparisonMode()" style="flex: 1; height: 44px; font-size: 0.95rem; font-weight: 700; color: #002060; border-radius: 12px; border: none; cursor: pointer;">Thoát chế độ so sánh</button>
            <button class="btn-modern-tech" onclick="window.enterComparisonMode()" style="flex: 1; height: 44px; font-size: 0.95rem; font-weight: 700; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">🔄 Tiếp tục so sánh</button>
        </div>
    `;
}

// Bind to window
window.enterComparisonMode = enterComparisonMode;
window.exitComparisonMode = exitComparisonMode;
