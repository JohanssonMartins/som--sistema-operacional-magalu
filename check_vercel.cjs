const { chromium } = require('playwright');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('BROWSER CONSOLE ERROR:', msg.text());
      } else {
        console.log('BROWSER CONSOLE:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.error('BROWSER PAGE ERROR:', error.message, error.stack);
    });

    console.log('Navigating to https://som-lac.vercel.app/ ...');
    await page.goto('https://som-lac.vercel.app/', { waitUntil: 'networkidle' });
    
    const content = await page.content();
    console.log('Page body length:', content.length);
    
    await browser.close();
  } catch(e) {
    console.error('Script Error:', e);
  }
})();
