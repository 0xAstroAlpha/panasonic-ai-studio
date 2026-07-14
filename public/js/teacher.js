import { appState } from './state.js';

// ─── State ───────────────────────────────────────────────────────────────────
let activeSearchQuery = '';
let activeStudioFilter = 'all';
let activeTypeFilter = 'all';
let currentPage = 1;

// Cached stats & studios list (fetched once, survive page changes)
let cachedStats = null;
let cachedStudiosList = [];

// Current page's items (for CSV export of visible page)
let currentPageItems = [];

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Fetch one page of history from the server.
 * Stats are returned on every call but cached server-side (5 min TTL),
 * so they're fast after the first load.
 */
async function fetchPage(page = 1) {
    try {
        const response = await fetch(`/api/teacher/history?page=${page}`);
        const data = await response.json();
        return {
            items: data.data || [],
            stats: data.stats || { total: 0, images: 0, videos: 0, refUploads: 0 },
            pagination: data.pagination || { page, pageSize: 50, totalItems: 0, totalPages: 1 },
        };
    } catch (e) {
        console.error('Failed to fetch history page:', e);
        return {
            items: [],
            stats: cachedStats || { total: 0, images: 0, videos: 0, refUploads: 0 },
            pagination: { page, pageSize: 50, totalItems: 0, totalPages: 1 },
        };
    }
}

export async function deleteHistoryRecord(id) {
    if (!confirm('Bạn có chắc muốn xóa bản ghi này? Tác phẩm sẽ bị xóa khỏi lịch sử của lớp.')) return;
    try {
        const response = await fetch(`/api/teacher/history?id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) renderTeacherView();
    } catch (e) {
        console.error('Failed to delete history record:', e);
    }
}

export async function clearAllHistoryRecords() {
    if (!confirm('CẢNH BÁO: Bạn có chắc muốn xóa TOÀN BỘ lịch sử tạo ảnh/video của lớp?\nHành động này không thể hoàn tác!')) return;
    try {
        const response = await fetch('/api/teacher/history', { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            cachedStats = null;
            renderTeacherView();
        }
    } catch (e) {
        console.error('Failed to clear history:', e);
    }
}

export function downloadCSV(items) {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Mã,Thời gian,Tài khoản,Tên học sinh,Studio,Loại,Câu lệnh,Đường dẫn sản phẩm,Ảnh tham khảo\n';
    items.forEach(item => {
        const row = [
            item.id,
            new Date(item.timestamp).toLocaleString('vi-VN'),
            item.username,
            item.nickname,
            item.studio,
            item.type === 'video' ? 'Video' : 'Ảnh',
            `"${item.prompt.replace(/"/g, '""')}"`,
            item.resultUrl,
            item.refImageUrl || '',
        ].join(',');
        csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ai_studio_classroom_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ─── Client-side filter (applied on current page items only) ─────────────────
function applyFilters(items) {
    const search = activeSearchQuery.toLowerCase();
    return items.filter(item => {
        const matchSearch = !search ||
            item.prompt.toLowerCase().includes(search) ||
            item.nickname.toLowerCase().includes(search) ||
            item.username.toLowerCase().includes(search);
        const matchStudio = activeStudioFilter === 'all' || item.studio === activeStudioFilter;
        const matchType   = activeTypeFilter === 'all'   || item.type === activeTypeFilter;
        return matchSearch && matchStudio && matchType;
    });
}

// ─── Pagination bar (server-driven total) ────────────────────────────────────
function renderPaginationBar(pagination) {
    const { page, pageSize, totalItems, totalPages } = pagination;
    if (totalPages <= 1) return '';

    const from = (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, totalItems);

    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
        range.push(i);
    }
    if (page - delta > 2)           range.unshift('...');
    if (page + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    const btnBase = `min-width:36px;height:36px;border-radius:8px;border:1.5px solid var(--panel-border);background:rgba(255,255,255,0.7);cursor:pointer;font-size:0.9rem;transition:all 0.15s;padding:0 10px;`;

    const pageButtons = range.map(p => {
        if (p === '...') return `<span style="padding:0 4px;color:var(--text-muted);line-height:36px;">…</span>`;
        const isActive = p === page;
        return `<button
            data-page="${p}"
            class="teacher-page-btn"
            style="min-width:36px;height:36px;border-radius:8px;border:1.5px solid ${isActive ? 'var(--primary-blue)' : 'var(--panel-border)'};
                background:${isActive ? 'var(--primary-blue)' : 'rgba(255,255,255,0.7)'};
                color:${isActive ? '#fff' : 'var(--text-primary)'};
                font-weight:${isActive ? '700' : '500'};
                cursor:${isActive ? 'default' : 'pointer'};
                font-size:0.88rem;transition:all 0.15s;padding:0 10px;"
            ${isActive ? 'disabled' : ''}
        >${p}</button>`;
    }).join('');

    const prevDisabled = page === 1;
    const nextDisabled = page === totalPages;

    return `
        <div id="teacher-pagination" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:24px;padding:16px 20px;background:rgba(255,255,255,0.65);border-radius:14px;border:1px solid var(--panel-border);">
            <div style="font-size:0.85rem;color:var(--text-muted);font-weight:500;">
                Hiển thị <strong style="color:var(--text-primary)">${from}–${to}</strong> / <strong style="color:var(--text-primary)">${totalItems}</strong> kết quả
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <button data-page="${page - 1}" class="teacher-page-btn" ${prevDisabled ? 'disabled' : ''}
                    style="${btnBase} ${prevDisabled ? 'opacity:0.4;cursor:default;' : ''}">‹ Trước</button>
                ${pageButtons}
                <button data-page="${page + 1}" class="teacher-page-btn" ${nextDisabled ? 'disabled' : ''}
                    style="${btnBase} ${nextDisabled ? 'opacity:0.4;cursor:default;' : ''}">Sau ›</button>
            </div>
        </div>
    `;
}

function bindPaginationEvents() {
    document.querySelectorAll('.teacher-page-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const page = parseInt(btn.dataset.page);
            if (!page || btn.disabled) return;
            await goToPage(page);
            document.getElementById('teacher-history-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ─── Navigate to a server page ───────────────────────────────────────────────
async function goToPage(page) {
    currentPage = page;

    // Show skeleton while loading
    const listContainer       = document.getElementById('teacher-history-list');
    const paginationContainer = document.getElementById('teacher-pagination-wrapper');
    if (listContainer) listContainer.innerHTML = renderLoadingSkeleton();

    const { items, stats, pagination } = await fetchPage(page);

    // Update cached stats on every successful response
    if (stats) cachedStats = stats;

    // Update studios list from new page items
    const newStudios = items.map(h => h.studio).filter(Boolean);
    newStudios.forEach(s => { if (!cachedStudiosList.includes(s)) cachedStudiosList.push(s); });

    const filtered = applyFilters(items);
    currentPageItems = filtered;

    if (listContainer)       listContainer.innerHTML       = renderHistoryItems(filtered);
    if (paginationContainer) paginationContainer.innerHTML = renderPaginationBar(pagination);
    bindPaginationEvents();
}

// ─── Full teacher view (initial render) ──────────────────────────────────────
export async function renderTeacherView() {
    const playground = document.getElementById('playground-area');
    if (!playground) return;

    currentPage = 1;
    activeSearchQuery = '';
    activeStudioFilter = 'all';
    activeTypeFilter = 'all';

    playground.innerHTML = `
        <div style="display:flex;height:100%;align-items:center;justify-content:center;padding:40px;">
            <div class="loading-spinner" style="border:4px solid rgba(0,0,0,0.1);border-left-color:var(--primary-color);border-radius:50%;width:48px;height:48px;animation:spin 1s linear infinite;"></div>
        </div>
    `;

    const { items, stats, pagination } = await fetchPage(1);
    cachedStats = stats;
    cachedStudiosList = [...new Set(items.map(h => h.studio).filter(Boolean))];

    const totalCount = stats.total;
    const imgCount   = stats.images;
    const vidCount   = stats.videos;
    const refCount   = stats.refUploads;

    const filteredItems = applyFilters(items);
    currentPageItems = filteredItems;

    playground.innerHTML = `
        <div class="playground-header" style="border-bottom:1px solid var(--panel-border);padding-bottom:20px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
                <div>
                    <h1 style="display:flex;align-items:center;gap:12px;font-size:1.8rem;">
                        <span>🏫</span> Dashboard Giáo Viên
                    </h1>
                    <p style="color:var(--text-secondary);margin-top:4px;">Giám sát và quản lý toàn bộ các lượt tạo tác phẩm của học sinh lớp học.</p>
                </div>
                <div style="display:flex;gap:12px;">
                    <button id="btn-export-csv" class="btn-modern-tech" style="font-weight:700;color:#10b981;border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.08);display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 16px;border-radius:10px;">
                        📥 Xuất trang hiện tại (CSV)
                    </button>
                    <button id="btn-clear-all-history" class="btn-danger-tech" style="font-weight:700;border:none;background:#ef4444;color:white;display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 16px;border-radius:10px;box-shadow:0 4px 12px rgba(239,68,68,0.25);">
                        🗑️ Xóa toàn bộ Lịch sử
                    </button>
                </div>
            </div>

            <!-- Statistical Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-top:24px;">
                <div class="glass-panel" style="padding:16px;border-radius:12px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.4);">
                    <div style="font-size:2rem;background:rgba(0,103,217,0.1);width:50px;height:50px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--primary-blue)">📊</div>
                    <div>
                        <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">TỔNG SỐ LƯỢT TẠO</div>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--text-main);">${totalCount}</div>
                    </div>
                </div>
                <div class="glass-panel" style="padding:16px;border-radius:12px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.4);">
                    <div style="font-size:2rem;background:rgba(52,211,153,0.1);width:50px;height:50px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#10b981">📷</div>
                    <div>
                        <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">ẢNH ĐÃ VẼ</div>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--text-main);">${imgCount}</div>
                    </div>
                </div>
                <div class="glass-panel" style="padding:16px;border-radius:12px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.4);">
                    <div style="font-size:2rem;background:rgba(17,138,178,0.1);width:50px;height:50px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#118ab2">🎬</div>
                    <div>
                        <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">PHIM NGẮN ĐÃ TẠO</div>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--text-main);">${vidCount}</div>
                    </div>
                </div>
                <div class="glass-panel" style="padding:16px;border-radius:12px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.4);">
                    <div style="font-size:2rem;background:rgba(255,159,28,0.1);width:50px;height:50px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#FF9F1C">📁</div>
                    <div>
                        <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">ẢNH THAM CHIẾU</div>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--text-main);">${refCount ?? '—'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filter bar -->
        <div class="glass-panel" style="padding:16px;border-radius:16px;margin-bottom:24px;background:rgba(255,255,255,0.65);display:flex;gap:16px;align-items:center;flex-wrap:wrap;border:1px solid var(--panel-border);">
            <div style="flex:1;min-width:240px;position:relative;">
                <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted)">🔍</span>
                <input type="text" id="teacher-search" class="input-field" placeholder="Tìm theo tên học sinh, tài khoản hoặc câu lệnh (trong trang hiện tại)..." value="${activeSearchQuery}" style="padding-left:36px;font-size:0.88rem;">
            </div>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                <select id="teacher-filter-studio" class="input-field" style="padding:8px 12px;border-radius:10px;font-size:0.88rem;min-width:160px;cursor:pointer;background:white;">
                    <option value="all">-- Tất cả Xưởng (Studio) --</option>
                    ${cachedStudiosList.map(s => `<option value="${s}" ${activeStudioFilter === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
                <select id="teacher-filter-type" class="input-field" style="padding:8px 12px;border-radius:10px;font-size:0.88rem;min-width:140px;cursor:pointer;background:white;">
                    <option value="all" ${activeTypeFilter === 'all' ? 'selected' : ''}>-- Tất cả loại --</option>
                    <option value="image" ${activeTypeFilter === 'image' ? 'selected' : ''}>📷 Ảnh đã vẽ</option>
                    <option value="video" ${activeTypeFilter === 'video' ? 'selected' : ''}>🎬 Phim ngắn</option>
                </select>
            </div>
        </div>

        <!-- Main logs area -->
        <div id="teacher-history-list" style="display:flex;flex-direction:column;gap:16px;">
            ${renderHistoryItems(filteredItems)}
        </div>

        <!-- Pagination -->
        <div id="teacher-pagination-wrapper">
            ${renderPaginationBar(pagination)}
        </div>
    `;

    // Event listeners
    document.getElementById('btn-export-csv')?.addEventListener('click', () => downloadCSV(currentPageItems));
    document.getElementById('btn-clear-all-history')?.addEventListener('click', clearAllHistoryRecords);

    document.getElementById('teacher-search')?.addEventListener('input', e => {
        activeSearchQuery = e.target.value;
        const filtered = applyFilters(currentPageItems.length ? currentPageItems : []);
        // Re-filter without re-fetching
        const listEl = document.getElementById('teacher-history-list');
        if (listEl) listEl.innerHTML = renderHistoryItems(applyFilters(
            // Re-apply on current page's raw items by re-fetching would be ideal,
            // but for instant response we filter the already-rendered items
            currentPageItems
        ));
    });

    document.getElementById('teacher-filter-studio')?.addEventListener('change', e => {
        activeStudioFilter = e.target.value;
    });

    document.getElementById('teacher-filter-type')?.addEventListener('change', e => {
        activeTypeFilter = e.target.value;
    });

    bindPaginationEvents();
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function renderLoadingSkeleton() {
    return Array.from({ length: 5 }).map(() => `
        <div style="padding:16px;border-radius:16px;border:1px solid var(--panel-border);background:rgba(255,255,255,0.7);display:flex;gap:20px;animation:pulse 1.5s ease-in-out infinite;">
            <div style="width:140px;height:140px;flex-shrink:0;border-radius:12px;background:rgba(0,0,0,0.07);"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:12px;padding-top:8px;">
                <div style="height:16px;width:60%;border-radius:6px;background:rgba(0,0,0,0.07);"></div>
                <div style="height:14px;width:40%;border-radius:6px;background:rgba(0,0,0,0.05);"></div>
                <div style="height:48px;width:100%;border-radius:6px;background:rgba(0,0,0,0.04);"></div>
            </div>
        </div>
    `).join('');
}

// ─── History item renderer ────────────────────────────────────────────────────
function renderHistoryItems(items) {
    if (items.length === 0) {
        return `
            <div class="glass-panel" style="padding:60px;text-align:center;border-radius:16px;color:var(--text-muted);background:rgba(255,255,255,0.4);border:1px dashed var(--panel-border);">
                <div style="font-size:3rem;margin-bottom:12px;">📁</div>
                <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Không tìm thấy kết quả nào</h3>
                <p style="font-size:0.85rem;">Học sinh chưa tạo tác phẩm nào hoặc bộ lọc không khớp.</p>
            </div>
        `;
    }

    return items.map(item => {
        const formattedDate = new Date(item.timestamp).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric',
        });

        let badgeColor = item.type === 'video' ? '#118ab2' : '#0067d9';
        let badgeText  = item.type === 'video' ? '🎬 Phim ngắn' : '📷 Ảnh';
        if (item.isRefOnly) { badgeColor = '#FF9F1C'; badgeText = '📁 Tham chiếu'; }

        const refImgHtml = item.refImageUrl ? `
            <div style="flex-shrink:0;cursor:pointer" onclick="window.showLightbox('${item.refImageUrl}','image')">
                <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-bottom:4px">Ảnh tham khảo:</div>
                <img src="${item.refImageUrl}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid var(--panel-border);" alt="Reference">
            </div>
        ` : '';

        const thumbHtml = item.type === 'video'
            ? `<video src="${item.resultUrl}" style="width:100%;height:100%;object-fit:cover;" muted autoplay loop></video>
               <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.6);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;">▶</div>`
            : `<img src="${item.resultUrl}" style="width:100%;height:100%;object-fit:cover;" alt="Generated Result" loading="lazy">`;

        return `
            <div class="glass-panel" style="padding:16px;border-radius:16px;border:1px solid var(--panel-border);background:rgba(255,255,255,0.7);backdrop-filter:blur(16px);display:flex;gap:20px;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="position:relative;width:140px;height:140px;flex-shrink:0;background:rgba(0,0,0,0.03);border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);cursor:pointer;" onclick="window.showLightbox('${item.resultUrl}','${item.type}')">
                    ${thumbHtml}
                </div>
                <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;min-width:0;">
                    <div>
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span class="studio-badge" style="background:${badgeColor};font-size:11px;margin-left:0;">${badgeText}</span>
                                <span class="studio-badge" style="background:var(--panel-border);color:var(--text-primary);font-size:11px;margin-left:0;font-weight:700;">🏬 ${item.studio}</span>
                                <span style="font-size:0.78rem;color:var(--text-muted);">${formattedDate}</span>
                            </div>
                            <button onclick="window.deleteHistoryRecord('${item.id}')" style="background:rgba(239,68,68,0.1);border:none;color:#ef4444;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" title="Xóa bản ghi khỏi lớp" onmouseover="this.style.background='#ef4444';this.style.color='white';" onmouseout="this.style.background='rgba(239,68,68,0.1)';this.style.color='#ef4444';">🗑️</button>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;font-size:0.9rem;margin-bottom:8px;">
                            <span style="font-weight:700;color:var(--text-primary);font-size:0.95rem;">👤 ${item.nickname}</span>
                            <span style="color:var(--text-muted);font-size:0.8rem;">(@${item.username})</span>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.45;overflow-wrap:break-word;background:rgba(0,0,0,0.02);padding:8px 12px;border-radius:8px;border-left:3px solid var(--primary-blue);">
                            <strong>Câu lệnh:</strong> ${item.prompt}
                        </div>
                    </div>
                </div>
                ${refImgHtml}
            </div>
        `;
    }).join('');
}

// Bind to window to allow inline onclick handlers to run successfully
window.deleteHistoryRecord = deleteHistoryRecord;
