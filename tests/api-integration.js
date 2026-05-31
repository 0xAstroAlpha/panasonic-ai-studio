const { spawn } = require('child_process');
const path = require('path');

async function runIntegrationTest() {
    console.log('Starting real API integration test with Vidtory API key...');
    
    // Start server.js
    const serverProcess = spawn('node', [path.join(__dirname, '..', 'server.js')], {
        env: { ...process.env }
    });

    let serverStarted = false;

    // Set a timeout in case server hangs
    const timeout = setTimeout(() => {
        console.error('Test timed out waiting for server to respond.');
        serverProcess.kill();
        process.exit(1);
    }, 45000);

    serverProcess.stdout.on('data', async (data) => {
        const output = data.toString();
        console.log(`[Server stdout]: ${output.trim()}`);
        
        if (output.includes('AI Studio Server đang chạy') && !serverStarted) {
            serverStarted = true;
            try {
                await performTestRequest();
            } catch (err) {
                console.error('Integration test failed:', err);
                serverProcess.kill();
                process.exit(1);
            } finally {
                clearTimeout(timeout);
                serverProcess.kill();
            }
        }
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[Server stderr]: ${data.toString().trim()}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        if (!serverStarted) {
            process.exit(1);
        }
    });
}

async function performTestRequest() {
    console.log('Sending test image generation request to the real server...');
    
    const payload = JSON.stringify({
        prompt: 'a small cute robot sticker, high quality, vector style',
        aspectRatio: '--ar 1:1'
    });

    const response = await fetch('http://localhost:3000/api/generate/image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    });

    console.log(`Response Status: ${response.status}`);
    const data = await response.json();
    
    if (response.status !== 200) {
        throw new Error(`Server returned error status ${response.status}: ${JSON.stringify(data)}`);
    }

    console.log('Server response data:', JSON.stringify(data, null, 2));
    
    if (data.url && data.url.startsWith('http')) {
        console.log('✅ Integration test PASSED! Generated URL is valid:', data.url);
    } else {
        throw new Error(`Invalid response url: ${data.url}`);
    }
}

runIntegrationTest();
