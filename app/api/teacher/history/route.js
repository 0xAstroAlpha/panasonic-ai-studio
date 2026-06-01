import { getHistory, deleteHistoryItem, clearAllHistory } from '../../../../lib/history';
import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

export async function GET() {
    try {
        const localHistory = getHistory();
        
        // 1. Fetch completed jobs from Vidtory SDK
        let sdkJobs = [];
        try {
            const jobsResponse = await ai.jobs.list({ status: 'COMPLETED', limit: 50 });
            sdkJobs = jobsResponse.jobs || [];
        } catch (e) {
            console.error('Failed to fetch jobs from Vidtory SDK:', e);
        }

        // 2. Fetch uploaded media files from Vidtory SDK
        let sdkMedia = [];
        try {
            sdkMedia = await ai.media.list();
        } catch (e) {
            console.error('Failed to fetch media from Vidtory SDK:', e);
        }

        // 3. Merge SDK jobs with local history logs
        const mergedHistory = [...localHistory];
        
        sdkJobs.forEach(job => {
            // Check if this generation is already logged in local history
            const alreadyLogged = localHistory.some(h => 
                h.resultUrl === job.result?.url || h.id === job.generationHistoryId || h.id === job.id
            );
            
            if (!alreadyLogged && job.result?.url) {
                // Synthesize a history entry for jobs generated elsewhere or in previous states
                mergedHistory.push({
                    id: job.generationHistoryId || job.id,
                    username: 'sdk-import',
                    nickname: 'Hệ thống (SDK)',
                    studio: job.type === 'video' ? 'Làm Phim Ngắn' : 'Tạo Ảnh',
                    timestamp: job.completedAt || job.createdAt || new Date().toISOString(),
                    prompt: job.prompt || '(Không có câu lệnh)',
                    type: job.type || 'image',
                    resultUrl: job.result.url,
                    refImageUrl: null
                });
            }
        });

        // 4. Merge uploaded reference images into history list
        sdkMedia.forEach(file => {
            const alreadyLogged = localHistory.some(h => h.refImageUrl === file.url || h.resultUrl === file.url);
            
            if (!alreadyLogged && file.url) {
                // Synthesize an entry for media uploaded directly (not part of a generation log)
                mergedHistory.push({
                    id: file.id,
                    username: 'sdk-upload',
                    nickname: file.metadata?.nickname || 'Tải lên (SDK)',
                    studio: 'Ảnh tham chiếu',
                    timestamp: file.createdAt || new Date().toISOString(),
                    prompt: `Tải lên tệp tham khảo: ${file.fileName} (${(file.fileSize / 1024).toFixed(1)} KB)`,
                    type: 'image',
                    resultUrl: file.url,
                    refImageUrl: null,
                    isRefOnly: true
                });
            }
        });

        // Sort by timestamp newest first
        mergedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return NextResponse.json({ data: mergedHistory });
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
            return NextResponse.json({ success: true, message: 'All history cleared' });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
