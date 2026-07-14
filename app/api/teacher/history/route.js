import { getHistory, deleteHistoryItem, clearAllHistory } from '../../../../lib/history';
import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

// ─── Server-side stats cache (5 min TTL) ────────────────────────────────────
// Avoids re-paginating all usages on every page change.
let _statsCache = null;
let _statsCacheExpiry = 0;
const STATS_TTL_MS = 5 * 60 * 1000;

async function fetchAllJobStats() {
    if (_statsCache && Date.now() < _statsCacheExpiry) {
        return _statsCache;
    }

    const counts = { total: 0, videos: 0, images: 0 };
    const allUsages = []; // Keep track of all successful usages for pagination
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
                // Chỉ thống kê và list các job tạo thành công
                if (item.status === 'success') {
                    counts.total++;
                    if (item.type === 'video') counts.videos++;
                    else if (item.type === 'image') counts.images++;
                    allUsages.push(item);
                }
            }

            offset += items.length;
            
            if (items.length < BATCH) {
                break;
            }
        } catch (e) {
            console.error('Stats pagination error at offset', offset, e);
            break;
        }
    }

    const cacheData = { counts, usages: allUsages };
    _statsCache = cacheData;
    _statsCacheExpiry = Date.now() + STATS_TTL_MS;
    return cacheData;
}

// ─── Display page size ───────────────────────────────────────────────────────
const DISPLAY_PAGE_SIZE = 50;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const sdkOffset = (page - 1) * DISPLAY_PAGE_SIZE;

        const localHistory = getHistory();

        // 1. Fetch usages from cache or network
        const statsData = await fetchAllJobStats();
        const sdkStats = statsData.counts;
        const allUsages = statsData.usages || [];

        // 2. Paginate usages array directly
        const pageUsages = allUsages.slice(sdkOffset, sdkOffset + DISPLAY_PAGE_SIZE);

        const mergedHistory = [];

        // On page 1: prepend any localHistory entries not present in allUsages
        if (page === 1) {
            localHistory.forEach(h => {
                const coveredBySdk = allUsages.some(u => u.jobId === h.id || u.id === h.id);
                if (!coveredBySdk) mergedHistory.push(h);
            });
        }

        // 3. Resolve details for the page's usages
        const resolvedJobs = await Promise.all(pageUsages.map(async usage => {
            // Check local history first (saves API call)
            const localMatch = localHistory.find(h => h.id === usage.jobId || h.id === usage.id);
            if (localMatch && localMatch.resultUrl) {
                return {
                    id: usage.jobId,
                    type: usage.type,
                    url: localMatch.resultUrl,
                    prompt: localMatch.prompt,
                    studio: localMatch.studio,
                    createdAt: usage.createdAt,
                    missing: false
                };
            }

            // Fetch from Vidtory SDK
            try {
                const res = await ai.jobs.getStatus(usage.jobId);
                const jobData = res.data || res;
                return {
                    id: usage.jobId,
                    type: jobData.type || usage.type,
                    url: jobData.result?.url || '',
                    prompt: jobData.prompt,
                    studio: null, // Default
                    createdAt: jobData.completedAt || jobData.createdAt || usage.createdAt,
                    missing: !jobData.result?.url
                };
            } catch (e) {
                return {
                    id: usage.jobId,
                    type: usage.type,
                    url: '',
                    prompt: '(Tác phẩm không tìm thấy hoặc đã bị xóa)',
                    studio: null,
                    createdAt: usage.createdAt,
                    missing: true
                };
            }
        }));

        resolvedJobs.forEach(job => {
            if (!job) return;
            const urlInferredType = job.url?.includes('/videos/') ? 'video' : 'image';
            const resolvedType = job.type || urlInferredType;

            mergedHistory.push({
                id: job.id,
                username: 'sdk-import',
                nickname: 'Hệ thống (SDK)',
                studio: job.studio || (resolvedType === 'video' ? 'Làm Phim Ngắn' : 'Tạo Ảnh'),
                timestamp: job.createdAt || new Date().toISOString(),
                prompt: job.prompt || '(Không có câu lệnh)',
                type: resolvedType,
                resultUrl: job.url,
                refImageUrl: null,
            });
        });

        // Ensure chronological order for merged history
        mergedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // ─── Stats: SDK full counts + local-only entries ──────────────────────
        const localCreative = localHistory.filter(h => !h.isRefOnly);
        const localOnly = localCreative.filter(h =>
            !allUsages.some(u => u.jobId === h.id || u.id === h.id)
        );
        const localOnlyVideos = localOnly.filter(h => h.type === 'video').length;
        const localOnlyImages = localOnly.filter(h => h.type === 'image').length;

        const stats = {
            total: sdkStats.total + localOnlyVideos + localOnlyImages,
            videos: sdkStats.videos + localOnlyVideos,
            images: sdkStats.images + localOnlyImages,
            refUploads: _statsCache?.counts?.refUploads ?? null,
        };

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
            try {
                await ai.media.delete(id);
            } catch (err) {}
            return NextResponse.json({ success: true, message: `Record ${id} deleted` });
        } else {
            clearAllHistory();
            _statsCache = null;
            _statsCacheExpiry = 0;
            return NextResponse.json({ success: true, message: 'All history cleared' });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
