import { getHistory, deleteHistoryItem, clearAllHistory } from '../../../../lib/history';
import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

// ─── Server-side stats cache (5 min TTL) ────────────────────────────────────
// Avoids re-paginating all 800+ jobs on every page change.
let _statsCache = null;
let _statsCacheExpiry = 0;
const STATS_TTL_MS = 5 * 60 * 1000;

async function fetchAllJobStats() {
    if (_statsCache && Date.now() < _statsCacheExpiry) {
        return _statsCache;
    }

    const counts = { total: 0, videos: 0, images: 0 };
    const BATCH = 100; // max limit for usages API usually
    let offset = 0;
    
    const baseUrl = 'https://bapi.vidtory.net';
    const apiKey = process.env.VIDTORY_API_KEY;
    const headers = { 'x-api-key': apiKey, 'Content-Type': 'application/json' };

    while (true) {
        try {
            const res = await fetch(`${baseUrl}/merchant/usages?limit=${BATCH}&offset=${offset}`, { headers });
            const data = await res.json();
            
            if (!data.success || !data.data || !data.data.items || data.data.items.length === 0) {
                break;
            }

            const items = data.data.items;
            for (const item of items) {
                // Chỉ thống kê các job tạo thành công
                if (item.status === 'success') {
                    counts.total++;
                    if (item.type === 'video') counts.videos++;
                    else if (item.type === 'image') counts.images++;
                }
            }

            offset += items.length;
            
            // Nếu số lượng trả về ít hơn BATCH, nghĩa là đã đến trang cuối cùng
            if (items.length < BATCH) {
                break;
            }
        } catch (e) {
            console.error('Stats pagination error at offset', offset, e);
            break;
        }
    }

    _statsCache = counts;
    _statsCacheExpiry = Date.now() + STATS_TTL_MS;
    return counts;
}

// ─── Display page size ───────────────────────────────────────────────────────
const DISPLAY_PAGE_SIZE = 50;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const sdkOffset = (page - 1) * DISPLAY_PAGE_SIZE;

        const localHistory = getHistory();

        // Run stats and display fetch concurrently.
        // Stats uses the module-level cache so it's only slow on the very first call.
        const [sdkStats, displayRes] = await Promise.all([
            fetchAllJobStats(),
            ai.jobs.list({ status: 'COMPLETED', limit: DISPLAY_PAGE_SIZE, offset: sdkOffset })
                .catch(e => { console.error('Display fetch error:', e); return { jobs: [], total: 0 }; }),
        ]);

        const displayJobs = displayRes.jobs || [];
        const sdkTotal = displayRes.total || 0;

        // ─── Build display history for this page ──────────────────────────────
        // On page 1: prepend any localHistory entries not already in SDK results.
        // On page 2+: pure SDK jobs (no localHistory duplication).
        const mergedHistory = [];

        if (page === 1) {
            localHistory.forEach(h => {
                const coveredBySdk = displayJobs.some(j =>
                    j.result?.url === h.resultUrl || j.generationHistoryId === h.id || j.id === h.id
                );
                if (!coveredBySdk) mergedHistory.push(h);
            });
        }

        displayJobs.forEach(job => {
            if (!job.result?.url) return;
            const url = job.result.url;
            const urlInferredType = url.includes('/videos/') ? 'video' : 'image';
            const resolvedType = job.type || urlInferredType;

            mergedHistory.push({
                id: job.generationHistoryId || job.id,
                username: 'sdk-import',
                nickname: 'Hệ thống (SDK)',
                studio: resolvedType === 'video' ? 'Làm Phim Ngắn' : 'Tạo Ảnh',
                timestamp: job.completedAt || job.createdAt || new Date().toISOString(),
                prompt: job.prompt || '(Không có câu lệnh)',
                type: resolvedType,
                resultUrl: url,
                refImageUrl: null,
            });
        });

        mergedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // ─── Stats: SDK full counts + local-only entries ──────────────────────
        // local entries not covered by the SDK (edge-case; usually 0)
        const allSdkUrls = new Set(); // we don't have all SDK URLs here, approximate
        const localCreative = localHistory.filter(h => !h.isRefOnly);
        // Use sdkTotal to detect if local entries are already counted in SDK
        // Conservative: add local entries that don't appear in current display page
        const localOnly = localCreative.filter(h =>
            !displayJobs.some(j =>
                j.result?.url === h.resultUrl || j.generationHistoryId === h.id || j.id === h.id
            )
        );
        const localOnlyVideos = localOnly.filter(h => h.type === 'video').length;
        const localOnlyImages = localOnly.filter(h => h.type === 'image').length;

        const stats = {
            total: sdkStats.total + localOnlyVideos + localOnlyImages,
            videos: sdkStats.videos + localOnlyVideos,
            images: sdkStats.images + localOnlyImages,
            // refUploads: not fetched per-page (would require ai.media.list() on every call).
            // Cached from previous full load or shown as null until available.
            refUploads: _statsCache?.refUploads ?? null,
        };

        // ─── Pagination metadata ──────────────────────────────────────────────
        // Total pages based on full SDK job count (stats.total covers all creative items)
        const totalItems = stats.total;
        const totalPages = Math.max(1, Math.ceil(totalItems / DISPLAY_PAGE_SIZE));

        return NextResponse.json({
            data: mergedHistory,
            stats,
            pagination: {
                page,
                pageSize: DISPLAY_PAGE_SIZE,
                totalItems,
                totalPages,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            deleteHistoryItem(id);
            // Also try to delete from Vidtory SDK media storage if it is a media file ID
            try {
                await ai.media.delete(id);
            } catch (err) {
                // Ignore if it's not a media ID or delete is not supported
            }
            return NextResponse.json({ success: true, message: `Record ${id} deleted` });
        } else {
            clearAllHistory();
            // Invalidate stats cache so next load reflects cleared history
            _statsCache = null;
            _statsCacheExpiry = 0;
            return NextResponse.json({ success: true, message: 'All history cleared' });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
