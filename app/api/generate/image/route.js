import { VidtoryAI } from '@vidtory/ai-sdk';
import { NextResponse } from 'next/server';

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, aspectRatio, refImageBase64, refImageUrl: directUrl } = body;
        
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

        const params = { prompt };
        if (refImageUrl) {
            params.refImageUrl = refImageUrl;
        }
        
        if (aspectRatio) {
            if (aspectRatio === '--ar 16:9') params.aspectRatio = 'IMAGE_ASPECT_RATIO_LANDSCAPE';
            else if (aspectRatio === '--ar 9:16') params.aspectRatio = 'IMAGE_ASPECT_RATIO_PORTRAIT';
            else params.aspectRatio = 'IMAGE_ASPECT_RATIO_SQUARE';
        }

        const response = await ai.models.generateImage(params);
        return NextResponse.json({ url: response.result });
    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
