import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';
import { logGeneration } from '../../../../lib/history';
import { checkServerPromptSafety } from '../../../../lib/promptSafety';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

// Failover chain: veo-3.1-fast-generate-001 (SDK default) → veo_3_1
const VIDEO_PRIMARY_MODEL = 'veo-3.1-fast-generate-001';
const VIDEO_FALLBACK_MODEL = 'veo_3_1';

export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, aspectRatio, refImageBase64, refImageUrl: directUrl, username, nickname, studio } = body;
        const safety = checkServerPromptSafety(prompt);
        if (!safety.ok) {
            return NextResponse.json({ error: safety.message, reason: safety.reason }, { status: 400 });
        }
        
        let refImageUrl = directUrl || null;
        if (refImageBase64) {
            const base64Data = refImageBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const media = await ai.media.upload({
                file: buffer,
                fileName: 'ref-image.jpg',
                metadata: { category: 'reference' },
            });
            refImageUrl = media.url;
        }

        const params = { prompt, duration: 8 };
        if (refImageUrl) {
            params.mode = 'i2v';
            params.refImageUrl = refImageUrl;
        }
        if (aspectRatio) {
            if (aspectRatio === '16:9' || aspectRatio === '--ar 16:9') params.aspectRatio = 'VIDEO_ASPECT_RATIO_LANDSCAPE';
            else if (aspectRatio === '9:16' || aspectRatio === '--ar 9:16') params.aspectRatio = 'VIDEO_ASPECT_RATIO_PORTRAIT';
            else params.aspectRatio = 'VIDEO_ASPECT_RATIO_SQUARE';
        }

        let response;
        let usedModel = VIDEO_PRIMARY_MODEL;

        // --- Primary attempt ---
        try {
            console.log(`[generate/video] Trying primary model: ${VIDEO_PRIMARY_MODEL}`);
            response = await ai.models.generateVideo({ ...params, modelId: VIDEO_PRIMARY_MODEL });
        } catch (primaryErr) {
            // --- Failover to veo_3_1 ---
            console.warn(`[generate/video] Primary model "${VIDEO_PRIMARY_MODEL}" failed: ${primaryErr?.message}. Failing over to ${VIDEO_FALLBACK_MODEL}.`);
            usedModel = VIDEO_FALLBACK_MODEL;
            response = await ai.models.generateVideo({ ...params, modelId: VIDEO_FALLBACK_MODEL });
        }

        console.log(`[generate/video] Success with model: ${usedModel}`);

        try {
            logGeneration({
                username,
                nickname,
                studio,
                prompt,
                type: 'video',
                resultUrl: response.result,
                refImageUrl
            });
        } catch (logErr) {
            console.error('Failed to log video generation:', logErr);
        }

        return NextResponse.json({ url: response.result });
    } catch (error) {
        console.error('[generate/video] Unhandled error:', error);
        return NextResponse.json({ error: 'Hệ thống đang bận, các em vui lòng thử lại sau 5 phút nhé! 🎥' }, { status: 500 });
    }
}
