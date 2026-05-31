const { test, expect } = require('@playwright/test');

test.describe('Panasonic AI Studio - Desktop UI Flow', () => {

  test('Should complete the full user journey on Desktop viewport', async ({ page }) => {
    // 1. Landing View
    await page.goto('/');
    await expect(page.locator('.hero-title')).toContainText('KHÁM PHÁ TIỀM NĂNG');
    await expect(page.locator('.hero-subtitle')).toBeVisible();
    await expect(page.locator('.adventure-section')).toBeVisible();
    
    // Click experience button
    await page.click('#btn-start-landing');
    
    // 2. Authentication/Login View
    await expect(page.locator('h2', { hasText: 'Đăng nhập' })).toBeVisible();
    
    // Try login without username (should trigger alert or prevent progress - simple client checks)
    // Wait, the client code checks for empty input and alerts 'Vui lòng nhập tên đăng nhập'
    let alertMessage = '';
    page.once('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    await page.click('#btn-login');
    expect(alertMessage).toBe('Vui lòng nhập tên đăng nhập');

    // Fill username and proceed
    await page.fill('#login-user', 'hocsinh1');
    await page.fill('#login-pass', 'risupia123');
    await page.click('#btn-login');

    // 3. Profile Setup View
    await expect(page.locator('h2', { hasText: 'Hồ sơ của bạn' })).toBeVisible();
    
    // Try finish without filling nickname or selecting avatar
    let profileAlert = '';
    page.once('dialog', async dialog => {
      profileAlert = dialog.message();
      await dialog.accept();
    });
    await page.click('#btn-finish-profile');
    expect(profileAlert).toBe('Vui lòng nhập nickname và chọn 1 avatar!');

    // Fill profile info and choose avatar
    await page.fill('#profile-nick', 'SpeedyCreative');
    await page.locator('.avatar-option').nth(2).click(); // Click 3rd avatar
    await page.click('#btn-finish-profile');

    // 4. Onboarding Overlay check
    const onboardModal = page.locator('.onboarding-modal');
    await expect(onboardModal).toBeVisible();
    await expect(onboardModal.locator('h2')).toContainText('Chào mừng đến với AI Studio!');
    await page.click('#btn-close-onboard');
    await expect(onboardModal).not.toBeVisible();

    // 5. Main Studio layout and switching modules
    // Default studio is Comic Studio
    await expect(page.locator('#playground-area h1')).toContainText('Comic Studio');
    
    // Switch to Fashion Studio via sidebar
    await page.click('.nav-item[data-id="fashion"]');
    await expect(page.locator('#playground-area h1')).toContainText('Fashion Studio');
    await expect(page.locator('.block-title', { hasText: 'Thiết kế / Trang phục (Bắt buộc)' })).toBeVisible();

    // Switch to Game Studio
    await page.click('.nav-item[data-id="game"]');
    await expect(page.locator('#playground-area h1')).toContainText('Game Studio');

    // 6. Generate action in Studio
    await page.fill('#game-desc', 'một kỵ sĩ rồng uy phong lẫm liệt');
    
    // Select dynamic option (cel-shaded)
    await page.click('.custom-select[data-category="gameStyle"] .select-trigger');
    await page.click('.custom-select[data-category="gameStyle"] .option-item[data-val="cel_shaded"]');

    // Go to generator phase, go back to edit, then go to generator again
    await page.click('#btn-go-to-generator');
    await page.click('#btn-back-to-builder');
    await page.click('#btn-go-to-generator');

    // Trigger generate
    await page.click('#btn-generate');

    // Loader spinner should display
    const loadingText = page.locator('#result-display span', { hasText: 'AI đang sáng tạo...' });
    await expect(loadingText).toBeVisible();

    // Wait for the mock image to display in grid
    const generatedImage = page.locator('.result-item img');
    await expect(generatedImage).toBeVisible({ timeout: 5000 });

    // 7. Lightbox Popup
    // Click result item to show lightbox
    await page.click('.result-item');
    const lightbox = page.locator('#global-lightbox');
    await expect(lightbox).toHaveClass(/show/);
    await expect(lightbox.locator('img')).toBeVisible();

    // Close lightbox
    await page.click('.lightbox-close');
    await expect(lightbox).not.toHaveClass(/show/);

    // Enable console listeners for debugging
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser PageError] ${err.message}`));

    // Navigate to Gallery via sidebar
    await page.click('.nav-item[data-view="gallery"]');
    await expect(page.locator('#playground-area h1')).toContainText('Thư viện cá nhân của bạn');

    // Verify mock image is listed in gallery grid
    const galleryGridItem = page.locator('.gallery-item img');
    await expect(galleryGridItem).toBeVisible();

    // Check Multi-select Mode
    await page.click('button:has-text("Chọn nhiều")');
    
    // Wait for the UI state transition (Hủy chọn button should appear)
    await expect(page.locator('button:has-text("Hủy chọn")')).toBeVisible();

    // Item select click
    await page.click('.gallery-item');
    await expect(page.locator('.gallery-item')).toHaveClass(/selected/);
    await expect(page.locator('.gallery-multi-actions')).toBeVisible();

    // Exit Select Mode
    await page.click('button:has-text("Hủy chọn")');
    await expect(page.locator('.gallery-multi-actions')).not.toBeVisible();

    // 9. Logout
    let logoutConfirm = '';
    page.once('dialog', async dialog => {
      logoutConfirm = dialog.message();
      await dialog.accept(); // Confirm logout
    });
    await page.click('button:has-text("Đăng xuất")');
    expect(logoutConfirm).toContain('Bạn có chắc chắn muốn thoát?');
    
    // Redirect check to Login view
    await expect(page.locator('h2', { hasText: 'Đăng nhập' })).toBeVisible();
  });

});
