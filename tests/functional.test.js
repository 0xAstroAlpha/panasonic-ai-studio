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
    await page.fill('#comic-action', 'đang bay lượn trên bầu trời có máu');

    // Intercept alert dialog
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Move to generation phase
    await page.click('#btn-go-to-generator');

    // Click generate button
    await page.click('#btn-generate');

    // Assert safety filter message
    expect(alertMessage).toBe('Ý tưởng này chưa phù hợp, thử mô tả khác nhé!');
  });

  test('Keyword safety filter blocks profanity and violent English words', async ({ page }) => {
    await page.fill('#comic-action', 'holding a gun and shoot target');

    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('#btn-go-to-generator');
    await page.click('#btn-generate');
    expect(alertMessage).toBe('Ý tưởng này chưa phù hợp, thử mô tả khác nhé!');
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

});
