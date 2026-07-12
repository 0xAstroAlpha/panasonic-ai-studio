#!/usr/bin/env node
/**
 * Test script for specific Vidtory SDK models:
 *   - Image: google_image_gen_banana_2
 *   - Video: veo_3_1
 *
 * Usage:
 *   node scripts/test-models.mjs                   # test both
 *   node scripts/test-models.mjs --mode=image       # image only
 *   node scripts/test-models.mjs --mode=video       # video only
 *   node scripts/test-models.mjs --prompt="..."
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { VidtoryAI } from '@vidtory/ai-sdk';

config({ quiet: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// ─── CLI helpers ────────────────────────────────────────────────────────────
function readArg(name, fallback = null) {
    const prefix = `--${name}=`;
    const direct = process.argv.find(a => a.startsWith(prefix));
    if (direct) return direct.slice(prefix.length);
    const index = process.argv.indexOf(`--${name}`);
    if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
    return fallback;
}

const mode      = readArg('mode', 'both');       // 'image' | 'video' | 'both'
const prompt    = readArg('prompt', 'A beautiful sunrise over mountain peaks, cinematic, high quality');
const outputDir = path.resolve(repoRoot, readArg('out-dir', 'test-output'));

const IMAGE_MODEL = 'google_image_gen_banana_2';
const VIDEO_MODEL = 'veo_3_1';

// ─── Guards ──────────────────────────────────────────────────────────────────
if (!process.env.VIDTORY_API_KEY) {
    console.error('❌  VIDTORY_API_KEY is missing. Add it to .env or export it before running.');
    process.exit(1);
}

if (!['image', 'video', 'both'].includes(mode)) {
    console.error(`❌  Unknown --mode="${mode}". Use: image | video | both`);
    process.exit(1);
}

const ai = new VidtoryAI({ apiKey: process.env.VIDTORY_API_KEY });

await mkdir(outputDir, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ts() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function extensionFromContentType(contentType, url) {
    if (contentType?.includes('png'))  return '.png';
    if (contentType?.includes('webp')) return '.webp';
    if (contentType?.includes('jpeg') || contentType?.includes('jpg')) return '.jpg';
    const ext = path.extname(new URL(url).pathname);
    return ext || '.jpg';
}

function extensionFromVideoUrl(url) {
    try {
        const ext = path.extname(new URL(url).pathname);
        return ext || '.mp4';
    } catch { return '.mp4'; }
}

async function saveMetadata(filename, data) {
    const metaPath = path.join(outputDir, filename);
    await writeFile(metaPath, JSON.stringify(data, null, 2));
    return metaPath;
}

// ─── Image test ──────────────────────────────────────────────────────────────
async function testImage() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🖼️   Testing IMAGE model: ${IMAGE_MODEL}`);
    console.log(`📝  Prompt : ${prompt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startedAt = Date.now();

    const response = await ai.models.generateImage(
        {
            prompt,
            modelId: IMAGE_MODEL,
            aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        },
        {
            pollIntervalMs: 3000,
            timeoutMs: 300_000,
            onProgress: status => console.log(`  ⏳ Status: ${status}`),
        }
    );

    const durationMs = Date.now() - startedAt;
    const imageUrl = response?.result || response?.url;

    if (!imageUrl) {
        throw new Error(`No image URL in response: ${JSON.stringify(response)}`);
    }

    console.log(`✅  Image URL: ${imageUrl}`);
    console.log('⬇️   Downloading...');

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Download failed: HTTP ${imgRes.status}`);

    const contentType = imgRes.headers.get('content-type') || '';
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    if (buffer.length === 0) throw new Error('Downloaded image is empty.');

    const ext      = extensionFromContentType(contentType, imageUrl);
    const stamp    = ts();
    const imgPath  = path.join(outputDir, `image-${IMAGE_MODEL}-${stamp}${ext}`);
    const metaPath = path.join(outputDir, `image-${IMAGE_MODEL}-${stamp}.json`);

    await writeFile(imgPath, buffer);
    await saveMetadata(`image-${IMAGE_MODEL}-${stamp}.json`, {
        model: IMAGE_MODEL,
        prompt,
        durationMs,
        imageUrl,
        contentType,
        bytes: buffer.length,
        generationHistoryId: response.generationHistoryId || null,
        status: response.status || null,
        createdAt: new Date().toISOString(),
    });

    console.log(`💾  Saved image    : ${imgPath}`);
    console.log(`📄  Saved metadata : ${metaPath}`);
    console.log(`⏱️   Duration       : ${(durationMs / 1000).toFixed(1)}s`);
    console.log('🎉  IMAGE TEST PASSED\n');

    return { ok: true, imageUrl, durationMs };
}

// ─── Video test ──────────────────────────────────────────────────────────────
async function testVideo() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎬  Testing VIDEO model: ${VIDEO_MODEL}`);
    console.log(`📝  Prompt : ${prompt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startedAt = Date.now();

    const response = await ai.models.generateVideo(
        {
            prompt,
            modelId: VIDEO_MODEL,
            duration: 8,
            aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        },
        {
            pollIntervalMs: 5000,
            timeoutMs: 600_000,
            onProgress: status => console.log(`  ⏳ Status: ${status}`),
        }
    );

    const durationMs = Date.now() - startedAt;
    const videoUrl = response?.result || response?.url;

    if (!videoUrl) {
        throw new Error(`No video URL in response: ${JSON.stringify(response)}`);
    }

    console.log(`✅  Video URL: ${videoUrl}`);
    console.log('⬇️   Downloading...');

    const vidRes = await fetch(videoUrl);
    if (!vidRes.ok) throw new Error(`Download failed: HTTP ${vidRes.status}`);

    const contentType = vidRes.headers.get('content-type') || '';
    const buffer = Buffer.from(await vidRes.arrayBuffer());
    if (buffer.length === 0) throw new Error('Downloaded video is empty.');

    const ext      = extensionFromVideoUrl(videoUrl);
    const stamp    = ts();
    const vidPath  = path.join(outputDir, `video-${VIDEO_MODEL}-${stamp}${ext}`);
    const metaPath = path.join(outputDir, `video-${VIDEO_MODEL}-${stamp}.json`);

    await writeFile(vidPath, buffer);
    await saveMetadata(`video-${VIDEO_MODEL}-${stamp}.json`, {
        model: VIDEO_MODEL,
        prompt,
        durationMs,
        videoUrl,
        contentType,
        bytes: buffer.length,
        generationHistoryId: response.generationHistoryId || null,
        status: response.status || null,
        createdAt: new Date().toISOString(),
    });

    console.log(`💾  Saved video    : ${vidPath}`);
    console.log(`📄  Saved metadata : ${metaPath}`);
    console.log(`⏱️   Duration       : ${(durationMs / 1000).toFixed(1)}s`);
    console.log('🎉  VIDEO TEST PASSED\n');

    return { ok: true, videoUrl, durationMs };
}

// ─── Main ────────────────────────────────────────────────────────────────────
console.log('╔══════════════════════════════════════╗');
console.log('║     Vidtory SDK Model Test Suite     ║');
console.log('╚══════════════════════════════════════╝');
console.log(`Mode    : ${mode}`);
console.log(`API key : ${process.env.VIDTORY_API_KEY.slice(0, 12)}...`);
console.log(`Out dir : ${outputDir}`);

const results = {};

try {
    if (mode === 'image' || mode === 'both') {
        results.image = await testImage();
    }
} catch (err) {
    console.error('❌  IMAGE TEST FAILED:', err?.message || err);
    results.image = { ok: false, error: err?.message || String(err) };
}

try {
    if (mode === 'video' || mode === 'both') {
        results.video = await testVideo();
    }
} catch (err) {
    console.error('❌  VIDEO TEST FAILED:', err?.message || err);
    results.video = { ok: false, error: err?.message || String(err) };
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════╗');
console.log('║              SUMMARY                 ║');
console.log('╚══════════════════════════════════════╝');

if (results.image !== undefined) {
    const icon = results.image.ok ? '✅' : '❌';
    const detail = results.image.ok
        ? `${(results.image.durationMs / 1000).toFixed(1)}s`
        : results.image.error;
    console.log(`${icon}  Image (${IMAGE_MODEL}): ${detail}`);
}
if (results.video !== undefined) {
    const icon = results.video.ok ? '✅' : '❌';
    const detail = results.video.ok
        ? `${(results.video.durationMs / 1000).toFixed(1)}s`
        : results.video.error;
    console.log(`${icon}  Video (${VIDEO_MODEL}): ${detail}`);
}

const allOk = Object.values(results).every(r => r.ok);
process.exit(allOk ? 0 : 1);
