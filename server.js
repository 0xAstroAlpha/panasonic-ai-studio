require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { VidtoryAI } = require('@vidtory/ai-sdk');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ các file tĩnh (HTML, CSS, JS) trong thư mục public
const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

// API tạo ảnh
app.post('/api/generate/image', async (req, res) => {
    try {
        const { prompt, aspectRatio } = req.body;
        
        // Vidtory API sử dụng aspectRatio format chuẩn (mặc định nếu không cung cấp)
        const params = { prompt };
        if (aspectRatio) {
            if (aspectRatio === '--ar 16:9') params.aspectRatio = 'IMAGE_ASPECT_RATIO_LANDSCAPE';
            else if (aspectRatio === '--ar 9:16') params.aspectRatio = 'IMAGE_ASPECT_RATIO_PORTRAIT';
            else params.aspectRatio = 'IMAGE_ASPECT_RATIO_SQUARE';
        }

        const response = await ai.models.generateImage(params);
        res.json({ url: response.result });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// API tạo video
app.post('/api/generate/video', async (req, res) => {
    try {
        const { prompt, aspectRatio, refImageBase64, refImageUrl: directUrl } = req.body;
        
        let refImageUrl = directUrl || null;
        
        // Nếu có ảnh tham khảo base64, chuyển đổi và upload lên hệ thống Vidtory để lấy URL
        if (refImageBase64) {
            // Tách phần data type ra khỏi base64 string
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
        res.json({ url: response.result });
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`AI Studio Server đang chạy tại http://localhost:${port}`);
});
