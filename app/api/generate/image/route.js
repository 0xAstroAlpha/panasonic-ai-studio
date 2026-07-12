import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';
import { logGeneration } from '../../../../lib/history';
import { checkServerPromptSafety } from '../../../../lib/promptSafety';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

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

        // Weighted random: 70% aistudio, 30% original
        const selectedModel = Math.random() < 0.7
            ? 'gemini-3.1-flash-image-preview-aistudio'
            : 'gemini-3.1-flash-image-preview';
        console.log(`[generate/image] Using model: ${selectedModel}`);

        const params = { prompt, modelId: selectedModel };
        if (refImageUrl) {
            params.refImageUrl = refImageUrl;
        }
        
        if (aspectRatio) {
            if (aspectRatio === '--ar 16:9') params.aspectRatio = 'IMAGE_ASPECT_RATIO_LANDSCAPE';
            else if (aspectRatio === '--ar 9:16') params.aspectRatio = 'IMAGE_ASPECT_RATIO_PORTRAIT';
            else params.aspectRatio = 'IMAGE_ASPECT_RATIO_SQUARE';
        }

        const response = await ai.models.generateImage(params);
        
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
        console.error('Error generating image:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
