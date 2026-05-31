require('dotenv').config();
const express = require('express');
const cors = require('cors');

const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ các file tĩnh trong thư mục public

// API tạo ảnh (Mock)
app.post('/api/generate/image', async (req, res) => {
    try {
        const { prompt, aspectRatio, refImageBase64, refImageUrl } = req.body;
        console.log(`[Mock Server] Generate Image Request. Prompt: "${prompt}", AspectRatio: "${aspectRatio}", HasSketch: ${!!refImageBase64 || !!refImageUrl}`);
        
        // Return a local image served statically from public/images
        res.json({ url: '/images/floating_ai_comic.png' });
    } catch (error) {
        console.error('Error generating image (mock):', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// API tạo video (Mock)
app.post('/api/generate/video', async (req, res) => {
    try {
        const { prompt, aspectRatio, refImageBase64, refImageUrl } = req.body;
        console.log(`[Mock Server] Generate Video Request. Prompt: "${prompt}", AspectRatio: "${aspectRatio}"`);
        
        // Return a mock video URL (public sample mp4 for reliable loading in <video>)
        res.json({ url: 'https://www.w3schools.com/html/mov_bbb.mp4' });
    } catch (error) {
        console.error('Error generating video (mock):', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`AI Studio Mock Server đang chạy tại http://localhost:${port}`);
});
