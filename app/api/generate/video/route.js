import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';
import { logGeneration } from '../../../../lib/history';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, aspectRatio, refImageBase64, refImageUrl: directUrl, username, nickname, studio } = body;
        
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

        const response = await ai.models.generateVideo(params);
        
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
        console.error('Error generating video:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
