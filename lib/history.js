import fs from 'fs';
import path from 'path';

let historyData = [];
const filePath = path.join(process.cwd(), 'public', 'history-data.json');

// Helper to load history from JSON file on startup
function loadHistory() {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            historyData = JSON.parse(data);
        } else {
            historyData = [];
        }
    } catch (error) {
        console.error('Failed to load history file:', error);
        historyData = [];
    }
}

// Load initially
loadHistory();

// Helper to save history to JSON file
function saveHistory() {
    try {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(historyData, null, 2), 'utf8');
    } catch (error) {
        // Fail-safe for read-only Vercel environment
        console.warn('Failed to write history file (expected on serverless hosts like Vercel):', error.message);
    }
}

export function getHistory() {
    return historyData;
}

export function logGeneration({ username, nickname, studio, prompt, type, resultUrl, refImageUrl }) {
    const entry = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        username: username || 'unknown',
        nickname: nickname || 'Ẩn danh',
        studio: studio || 'Studio Sáng Tạo',
        timestamp: new Date().toISOString(),
        prompt: prompt || '',
        type: type || 'image',
        resultUrl: resultUrl || '',
        refImageUrl: refImageUrl || null
    };
    
    // Unshift to keep newest at the top
    historyData.unshift(entry);
    saveHistory();
    return entry;
}

export function deleteHistoryItem(id) {
    historyData = historyData.filter(item => item.id !== id);
    saveHistory();
}

export function clearAllHistory() {
    historyData = [];
    saveHistory();
}
