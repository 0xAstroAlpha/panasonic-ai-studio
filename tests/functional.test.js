const { test, expect } = require('@playwright/test');

test.describe('Panasonic AI Studio - Functional Logic & Safety Filters', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage, click start to go to login screen
    await page.goto('/');
    await page.click('#btn-start-landing');
    
    // Perform standard login to reach the profile setup page
    await page.fill('#login-user', 'hocsinh1');
    await page.fill('#login-pass', 'risupia123');
    await page.click('#btn-login');
    
    // Fill profile setup
    await page.fill('#profile-nick', 'TesterBot');
    // Select first avatar
    await page.locator('.avatar-option').first().click();
    await page.click('#btn-finish-profile');
    
    // Close onboarding modal if present
    const closeOnboard = page.locator('#btn-close-onboard');
    if (await closeOnboard.isVisible()) {
      await closeOnboard.click();
    }
  });

  test('Keyword safety filter blocks blacklisted words (Vietnamese & English)', async ({ page }) => {
    // Fill the mandatory subject/action in Comic Studio (default studio)
    await page.fill('#comic-char-desc', 'chú mèo máy dễ thương');
    await page.fill('#comic-action', 'đang bay lượn trên bầu trời có máu');

    // Intercept alert dialog
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Click generate button
    await page.click('#btn-generate');

    // Assert safety filter message
    expect(alertMessage).toContain('Ý tưởng này chưa phù hợp với lớp học của chúng mình rồi');
  });

  test('Keyword safety filter blocks profanity and violent English words', async ({ page }) => {
    await page.fill('#comic-char-desc', 'a cute mascot');
    await page.fill('#comic-action', 'holding a gun and shoot target');

    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('#btn-generate');
    expect(alertMessage).toContain('Ý tưởng này chưa phù hợp với lớp học của chúng mình rồi');
  });

  test('Personal info safety filter blocks keywords like school or phone', async ({ page }) => {
    await page.fill('#comic-char-desc', 'chú mèo máy dễ thương');
    await page.fill('#comic-action', 'học ở trường tiểu học của tớ');

    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('#btn-generate');
    expect(alertMessage).toBe('Hãy giữ an toàn bằng cách không nhập tên thật, trường học hoặc địa chỉ của mình vào câu lệnh nhé! 🔒');
  });


  test('Prompt Builder correctly updates and aggregates prompt blocks realtime', async ({ page }) => {
    // Clear/fill specific fields
    await page.fill('#comic-char-name', 'Robot Mini');
    await page.fill('#comic-char-desc', 'màu đỏ rực');
    await page.fill('#comic-action', 'đang chạy nhanh');

    // Select options from custom select dropdowns
    // Select Manga Style
    await page.click('.custom-select[data-category="comicStyle"] .select-trigger');
    await page.click('.custom-select[data-category="comicStyle"] .option-item[data-val="manga"]');

    // Select Forest Context
    await page.click('.custom-select[data-category="comicContext"] .select-trigger');
    await page.click('.custom-select[data-category="comicContext"] .option-item[data-val="magical_forest"]');

    // Let's retrieve the compiled prompt value
    const finalPromptVal = await page.inputValue('#final-prompt');

    // Final prompt should contain the components combined
    expect(finalPromptVal).toContain('nhân vật Robot Mini (màu đỏ rực)');
    expect(finalPromptVal).toContain('đang chạy nhanh');
    expect(finalPromptVal).toContain('phong cách Manga');
    expect(finalPromptVal).toContain('khu rừng ma thuật');
  });

  test('Local Storage updates correctly with user profile', async ({ page }) => {
    const sessionDataStr = await page.evaluate(() => localStorage.getItem('ai_studio_session'));
    expect(sessionDataStr).not.toBeNull();
    
    const sessionData = JSON.parse(sessionDataStr);
    expect(sessionData.username).toBe('hocsinh1');
    expect(sessionData.nickname).toBe('TesterBot');
    expect(sessionData.avatar).toContain('dicebear');
  });

  test('Sidebar contains kids studios and hides commercial modules', async ({ page }) => {
    const sidebarText = await page.textContent('#main-sidebar');
    
    // Should contain kids modules
    expect(sidebarText).toContain('Xưởng Truyện Tranh');
    expect(sidebarText).toContain('Tạo Nhân Vật');
    expect(sidebarText).toContain('Xưởng Khoa Học Vui');
    expect(sidebarText).toContain('Vẽ tranh cùng AI');
    expect(sidebarText).toContain('Làm Phim Ngắn');
    expect(sidebarText).toContain('Thư viện');
    
    // Should NOT contain commercial studios
    expect(sidebarText).not.toContain('Fashion Studio');
    expect(sidebarText).not.toContain('Interior Studio');
    expect(sidebarText).not.toContain('Film Poster');
  });

  test('Sketch-to-Image (Vẽ tranh cùng AI) correctly validates, uploads sketch and generates image', async ({ page }) => {
    // Navigate to Vẽ tranh cùng AI
    await page.click('.sidebar .nav-item:has-text("Vẽ tranh cùng AI")');
    
    // Check dynamic formula text is shown
    const formulaBadge = page.locator('#prompt-formula-badge');
    await expect(formulaBadge).toContainText('Công thức: [Bản phác thảo] + [Ý tưởng] + [Phong cách] + [Bối cảnh]');

    // Try generating without uploading a sketch (should alert)
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('#btn-generate');
    expect(alertMessage).toContain('Vui lòng tải lên bức phác thảo của em');

    // Reset dialog handler for next assertions
    page.removeAllListeners('dialog');

    // Input sketch details and style
    await page.fill('#sketch-desc', 'chú mèo máy Doraemon đang cười vui vẻ');
    
    // Select a style (Anime)
    await page.click('.custom-select[data-category="sketchStyle"] .select-trigger');
    await page.click('.custom-select[data-category="sketchStyle"] .option-item[data-val="anime"]');

    // Simulate uploading a file using the file chooser/input
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Clicking the zone triggers the file input click
    await page.click('#sketch-upload-zone');
    const fileChooser = await fileChooserPromise;

    // Create a mock buffer of an image to upload
    const buffer = Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    
    // Handle dialog accept for safety confirm check
    page.on('dialog', async dialog => {
      await dialog.accept(); // Confirms safety photo check
    });

    await fileChooser.setFiles({
      name: 'sketch.png',
      mimeType: 'image/png',
      buffer: buffer
    });

    // Check preview container is visible
    await expect(page.locator('#sketch-preview-container')).toBeVisible();

    // Trigger generate
    await page.click('#btn-generate');

    // Results card and generated mock image should display
    const generatedImage = page.locator('.result-item img');
    await expect(generatedImage).toBeVisible({ timeout: 5000 });
  });

});
