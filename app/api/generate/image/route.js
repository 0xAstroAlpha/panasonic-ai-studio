import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';
import { logGeneration } from '../../../../lib/history';
import { checkServerPromptSafety } from '../../../../lib/promptSafety';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

// Failover chain: primary models (weighted random) → fallback
const IMAGE_FALLBACK_MODEL = 'gemini-3.1-flash-image-preview-aistudio';

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
                fileName: 'sketch-image.jpg',
                metadata: { category: 'sketch' },
            });
            refImageUrl = media.url;
        }

        // Weighted random: 50% aistudio, 50% flow
        const primaryModel = Math.random() < 0.5
            ? 'gemini-3.1-flash-image-preview-aistudio'
            : 'gemini-3.1-flash-image-preview';

        const params = { prompt };
        if (refImageUrl) {
            params.refImageUrl = refImageUrl;
        }
        if (aspectRatio) {
            if (aspectRatio === '--ar 16:9') params.aspectRatio = 'IMAGE_ASPECT_RATIO_LANDSCAPE';
            else if (aspectRatio === '--ar 9:16') params.aspectRatio = 'IMAGE_ASPECT_RATIO_PORTRAIT';
            else params.aspectRatio = 'IMAGE_ASPECT_RATIO_SQUARE';
        }

        let response;
        let usedModel = primaryModel;

        // --- Primary attempt ---
        try {
            console.log(`[generate/image] Trying primary model: ${primaryModel}`);
            response = await ai.models.generateImage({ ...params, modelId: primaryModel });
        } catch (primaryErr) {
            // --- Failover to gemini-3.1-flash-image-preview-aistudio ---
            console.warn(`[generate/image] Primary model "${primaryModel}" failed: ${primaryErr?.message}. Failing over to ${IMAGE_FALLBACK_MODEL}.`);
            usedModel = IMAGE_FALLBACK_MODEL;
            response = await ai.models.generateImage({ ...params, modelId: IMAGE_FALLBACK_MODEL });
        }

        console.log(`[generate/image] Success with model: ${usedModel}`);

        try {
            logGeneration({
                username,
                nickname,
                studio,
                prompt,
                type: 'image',
                resultUrl: response.result,
                refImageUrl
            });
        } catch (logErr) {
            console.error('Failed to log image generation:', logErr);
        }

        return NextResponse.json({ url: response.result });
    } catch (error) {
        console.error('[generate/image] Unhandled error:', error);
        return NextResponse.json({ error: 'Hệ thống đang bận, các em vui lòng thử lại sau 5 phút nhé! 🎨' }, { status: 500 });
    }
}
