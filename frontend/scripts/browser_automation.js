const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser automation for Phase 3 verification...");
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to Dashboard (Leaflet Map)...");
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshot_phase3_dashboard_leaflet.png' });
    console.log("-> Dashboard screenshot saved.");

    console.log("Navigating to Relay page (Leaflet Map)...");
    await page.goto('http://localhost:3000/relay', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshot_phase3_relay_leaflet.png' });
    console.log("-> Relay screenshot saved.");

    console.log("Navigating to Reports page...");
    await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Simulate generating report
    await page.click('button:has-text("Generate Official Report")');
    await new Promise(r => setTimeout(r, 3000)); // wait for generation to finish
    await page.screenshot({ path: 'screenshot_phase3_reports.png' });
    console.log("-> Reports screenshot saved.");

    console.log("Navigating to Settings page...");
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Toggle a setting
    const toggles = await page.$$('button.rounded-full');
    if (toggles.length > 0) {
      await toggles[0].click(); // Toggle SSN masking
    }
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'screenshot_phase3_settings.png' });
    console.log("-> Settings screenshot saved.");

    console.log("Phase 3 Automated UI Verification completed successfully!");
    
  } catch (err) {
    console.error("Automation error:", err);
  } finally {
    await browser.close();
  }
})();
