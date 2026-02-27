import { chromium } from 'playwright';

const devices = [
  { name: 'iPhone-landscape', width: 844, height: 390 },
  { name: 'iPhone-portrait', width: 390, height: 844 },
  { name: 'iPad-portrait', width: 820, height: 1180 },
  { name: 'iPad-landscape', width: 1180, height: 820 },
];

(async () => {
  const browser = await chromium.launch();

  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Get layout measurements
    const measurements = await page.evaluate(() => {
      const body = document.body;
      const calendar = document.querySelector('[class*="bg-white/50"]');
      const grid = document.querySelector('[class*="grid-cols-7"]');
      const dayColumns = document.querySelectorAll('[class*="flex flex-col min-w-0"]');
      const slots = document.querySelectorAll('[class*="flex-1"][class*="rounded-lg"]');

      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        body: { h: body.scrollHeight, clientH: body.clientHeight },
        calendar: calendar ? {
          h: calendar.offsetHeight,
          top: calendar.getBoundingClientRect().top,
          bottom: calendar.getBoundingClientRect().bottom,
          classes: calendar.className
        } : null,
        grid: grid ? {
          h: grid.offsetHeight,
          classes: grid.className
        } : null,
        firstDay: dayColumns[0] ? { h: dayColumns[0].offsetHeight } : null,
        slotsCount: slots.length,
        firstSlot: slots[0] ? { h: slots[0].offsetHeight } : null,
      };
    });

    console.log(`\n=== ${device.name} (${device.width}x${device.height}) ===`);
    console.log('Viewport:', measurements.viewport);
    console.log('Body scroll/client:', measurements.body);
    console.log('Calendar wrapper:', measurements.calendar ? {h: measurements.calendar.h, top: Math.round(measurements.calendar.top), bottom: Math.round(measurements.calendar.bottom)} : 'NOT FOUND');
    console.log('Grid:', measurements.grid ? {h: measurements.grid.h} : 'NOT FOUND');
    console.log('First day column:', measurements.firstDay);
    console.log('Slots count:', measurements.slotsCount, 'First slot h:', measurements.firstSlot?.h);

    // Check if calendar fills viewport
    if (measurements.calendar) {
      const fillPercent = Math.round((measurements.calendar.h / measurements.viewport.h) * 100);
      const gap = measurements.viewport.h - measurements.calendar.bottom;
      console.log(`>> Calendar fills ${fillPercent}% of viewport, ${Math.round(gap)}px gap at bottom`);
    }

    await page.screenshot({ path: `/tmp/mazli-${device.name}.png`, fullPage: false });
    await context.close();
  }

  await browser.close();
})();
