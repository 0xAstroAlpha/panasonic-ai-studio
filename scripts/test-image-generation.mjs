#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { VidtoryAI } from '@vidtory/ai-sdk';

config({ quiet: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function readArg(name, fallback = null) {
    const prefix = `--${name}=`;
    const direct = process.argv.find(arg => arg.startsWith(prefix));
    if (direct) return direct.slice(prefix.length);

    const index = process.argv.indexOf(`--${name}`);
    if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];

    return fallback;
}

function toImageAspectRatio(value) {
    if (!value || value === '1:1' || value === '--ar 1:1') {
        return 'IMAGE_ASPECT_RATIO_SQUARE';
    }
    if (value === '16:9' || value === '--ar 16:9') {
        return 'IMAGE_ASPECT_RATIO_LANDSCAPE';
    }
    if (value === '9:16' || value === '--ar 9:16') {
        return 'IMAGE_ASPECT_RATIO_PORTRAIT';
    }
    throw new Error(`Unsupported aspect ratio "${value}". Use 1:1, 16:9, or 9:16.`);
}

function extensionFromContentType(contentType, imageUrl) {
    if (contentType?.includes('png')) return '.png';
    if (contentType?.includes('webp')) return '.webp';
    if (contentType?.includes('jpeg') || contentType?.includes('jpg')) return '.jpg';

    const urlPath = new URL(imageUrl).pathname;
    const ext = path.extname(urlPath);
    return ext || '.jpg';
}

const prompt = readArg(
    'prompt',
    'A bright educational illustration of a small friendly robot painting colorful science icons in a classroom, kid-safe, no real people, no text'
);
const aspectInput = readArg('aspect', '1:1');
const outputDir = path.resolve(repoRoot, readArg('out-dir', 'test-output'));
const aspectRatio = toImageAspectRatio(aspectInput);

if (!process.env.VIDTORY_API_KEY) {
    console.error('VIDTORY_API_KEY is missing. Add it to .env or export it before running this script.');
    process.exit(1);
}

const ai = new VidtoryAI({
    apiKey: process.env.VIDTORY_API_KEY
});

const startedAt = Date.now();
console.log('Generating image with Vidtory SDK...');
console.log(`Prompt: ${prompt}`);
console.log(`Aspect ratio: ${aspectInput}`);

try {
    const response = await ai.models.generateImage({ prompt, aspectRatio });
    const imageUrl = response?.result || response?.url;

    if (!imageUrl) {
        throw new Error(`Vidtory response did not include an image URL: ${JSON.stringify(response)}`);
    }

    console.log(`Image URL: ${imageUrl}`);
    console.log('Downloading generated image...');

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
        throw new Error(`Image download failed with HTTP ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const contentType = imageResponse.headers.get('content-type') || '';
    if (contentType && !contentType.toLowerCase().startsWith('image/')) {
        throw new Error(`Generated URL did not return an image content type: ${contentType}`);
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    if (buffer.length === 0) {
        throw new Error('Generated image downloaded as an empty file.');
    }

    await mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = extensionFromContentType(contentType, imageUrl);
    const imagePath = path.join(outputDir, `vidtory-image-test-${timestamp}${ext}`);
    const metadataPath = path.join(outputDir, `vidtory-image-test-${timestamp}.json`);

    await writeFile(imagePath, buffer);
    await writeFile(
        metadataPath,
        JSON.stringify({
            createdAt: new Date().toISOString(),
            durationMs: Date.now() - startedAt,
            prompt,
            aspectInput,
            aspectRatio,
            imageUrl,
            contentType,
            bytes: buffer.length
        }, null, 2)
    );

    console.log('Vidtory image generation test passed.');
    console.log(`Saved image: ${imagePath}`);
    console.log(`Saved metadata: ${metadataPath}`);
} catch (error) {
    console.error('Vidtory image generation test failed.');
    console.error(error?.message || error);
    process.exit(1);
}
