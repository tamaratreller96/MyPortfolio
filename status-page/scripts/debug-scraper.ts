import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Safer for some envs
    });
    const page = await browser.newPage();

    console.log('Navigating to status page...');
    await page.goto('https://status.5centscdn.net', { waitUntil: 'networkidle0' });

    // Wait a bit more for React to render
    await new Promise(r => setTimeout(r, 5000));

    console.log('Getting content...');
    const content = await page.content();

    fs.writeFileSync('debug-dump.html', content);
    console.log('Saved to debug-dump.html');

    await browser.close();
}

run().catch(console.error);
