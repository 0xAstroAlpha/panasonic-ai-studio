const { test, expect } = require('@playwright/test');

test.describe('Panasonic AI Studio - Mobile UI Flow', () => {

  test('Should navigate and perform generation on simulated Mobile Viewport', async ({ page }) => {
    // 1. Load Landing Page on Mobile viewport (Pixel 5 size set in config)
    await page.goto('/');
    
    // Enable console listeners for debugging
    page.on('console', msg => console.log(`[Mobile Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Mobile Browser PageError] ${err.message}`));

    // Verify hero text is visible
    await expect(page.locator('.hero-title')).toBeVisible();
    await page.click('#btn-start-landing');
    
    // 2. Authentication View
    await expect(page.locator('h2', { hasText: 'Đăng nhập' })).toBeVisible();
    await page.fill('#login-user', 'hocsinh1');
    await page.fill('#login-pass', 'risupia123');
    await page.click('#btn-login');

    // 3. Profile Setup View
    await expect(page.locator('h2', { hasText: 'Hồ sơ của bạn' })).toBeVisible();
    await page.fill('#profile-nick', 'MobileArtist');
    await page.locator('.avatar-option').first().click();
    await page.click('#btn-finish-profile');

    // 4. Close Onboarding
    const onboardModal = page.locator('.onboarding-modal');
    await expect(onboardModal).toBeVisible();
    await page.click('#btn-close-onboard');
    await expect(onboardModal).not.toBeVisible();

    // 5. Verify Sidebar structure / main layout in mobile width
    // In mobile, we check that elements are interactable and not covered
    await expect(page.locator('#playground-area h1')).toContainText('Comic Studio');
    
    // Fill required actions in prompt builder
    await page.fill('#comic-action', 'mèo máy đáng yêu nhảy múa');

    // Select standard panels
    await page.click('.custom-select[data-category="comicPanels"] .select-trigger');
    await page.click('.custom-select[data-category="comicPanels"] .option-item[data-val="2 panels"]');

    // Move to generation phase
    await page.click('#btn-go-to-generator');

    // Click Generate
    await page.click('#btn-generate');

    // Loader text should appear and then image load
    await expect(page.locator('#result-display span', { hasText: 'AI đang sáng tạo...' })).toBeVisible();
    
    // Verify generated mock image is visible
    const generatedImage = page.locator('.result-item img');
    await expect(generatedImage).toBeVisible({ timeout: 5000 });

    // Open lightbox and verify mobile behavior
    await page.click('.result-item');
    const lightbox = page.locator('#global-lightbox');
    await expect(lightbox).toHaveClass(/show/);
    
    // Close lightbox
    await page.click('.lightbox-close');
    await expect(lightbox).not.toHaveClass(/show/);
  });

});
