/**
 * Playwright 脚本：观察 FormView 的重复渲染问题
 *
 * 运行方式：
 * node test-formview-render.js
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright to observe FormView rendering...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 捕获所有 console 消息
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    const timestamp = new Date().toLocaleTimeString();

    // 只记录 FormView 相关的日志
    if (text.includes('[FormView]')) {
      console.log(`[${timestamp}] ${text}`);
      consoleLogs.push({ timestamp, text });
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  try {
    console.log('📂 Opening Storybook...');
    // 打开 Storybook
    await page.goto('http://localhost:6006');

    // 等待 Storybook iframe 加载
    await page.waitForTimeout(3000);

    console.log('🔍 Searching for FormView story...\n');
    console.log('=' .repeat(80));
    console.log('CONSOLE OUTPUT START');
    console.log('=' .repeat(80) + '\n');

    // 尝试导航到一个使用 FormView 的 story
    // 你需要根据实际的 story 路径调整这里
    // 例如：Theme/ViewRenderers/FormView
    try {
      // 点击侧边栏中的 story（这里需要根据实际 DOM 结构调整）
      await page.click('text=Theme', { timeout: 5000 });
      await page.waitForTimeout(500);

      await page.click('text=View Renderers', { timeout: 5000 });
      await page.waitForTimeout(500);

      await page.click('text=Form View', { timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('⚠️  Could not navigate to story via UI, trying direct URL...');

      // 尝试直接访问 story URL（需要根据实际调整）
      await page.goto('http://localhost:6006/?path=/story/theme-view-renderers--form-view');
      await page.waitForTimeout(3000);
    }

    // 等待一段时间观察渲染
    console.log('\n⏱️  Observing renders for 10 seconds...\n');
    await page.waitForTimeout(10000);

    console.log('\n' + '='.repeat(80));
    console.log('CONSOLE OUTPUT END');
    console.log('='.repeat(80) + '\n');

    // 分析渲染次数
    const renderLogs = consoleLogs.filter(log => log.text.includes('Component RENDER'));
    console.log(`\n📊 Analysis:`);
    console.log(`   Total render count: ${renderLogs.length}`);

    if (renderLogs.length > 2) {
      console.log(`   ⚠️  WARNING: FormView rendered ${renderLogs.length} times!`);
      console.log(`   This might indicate unnecessary re-renders.`);
    } else {
      console.log(`   ✅ Render count looks normal.`);
    }

    // 分析 useEffect 执行次数
    const effectLogs = consoleLogs.filter(log => log.text.includes('useEffect VALIDATION'));
    console.log(`\n   useEffect (validation) triggered: ${effectLogs.length} times`);

    if (effectLogs.length > renderLogs.length) {
      console.log(`   ⚠️  WARNING: useEffect ran more than renders!`);
    }

    // 显示完整日志供分析
    console.log(`\n📝 Full log entries: ${consoleLogs.length}`);
    console.log(`\nPress Ctrl+C to close the browser...`);

    // 保持浏览器打开以便手动交互和观察
    await new Promise(() => {}); // 永久等待

  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
