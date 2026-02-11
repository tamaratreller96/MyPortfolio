import 'dotenv/config';
import puppeteer from 'puppeteer';
import db from '../lib/db';
import { randomUUID } from 'crypto';

const API_URL = 'https://status.5centscdn.net';

// Prepared statements
const upsertComponent = db.prepare(`
  INSERT INTO components (id, componentId, name, status, group_name, updatedAt, syncedAt)
  VALUES (@id, @componentId, @name, @status, @group_name, @updatedAt, @syncedAt)
  ON CONFLICT(componentId) DO UPDATE SET
    name = @name,
    status = @status,
    group_name = @group_name,
    updatedAt = @updatedAt,
    syncedAt = @syncedAt
`);

const upsertIncident = db.prepare(`
  INSERT INTO incidents (id, incidentId, title, status, body, createdAt, updatedAt, syncedAt)
  VALUES (@id, @incidentId, @title, @status, @body, @createdAt, @updatedAt, @syncedAt)
  ON CONFLICT(incidentId) DO UPDATE SET
    title = @title,
    status = @status,
    body = @body,
    updatedAt = @updatedAt,
    syncedAt = @syncedAt
`);

const createLog = db.prepare(`INSERT INTO sync_logs (id, status, message, durationMs) VALUES (@id, @status, @message, @durationMs)`);

export async function fetchAndSync() {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] Starting sync via Puppeteer...`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Optimization: Block images/fonts
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'font', 'stylesheet'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(API_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Wait for components to load
        try {
            await page.waitForSelector('.border-gray-100', { timeout: 15000 });
        } catch (e) {
            console.log('Timeout waiting for selector, continuing...');
        }

        // Extract Data
        const data = await page.evaluate(() => {
            const components: any[] = [];
            const incidents: any[] = [];

            // Components
            // Select rows that look like components (border-gray-100 border-b-2)
            const rows = document.querySelectorAll('.border-gray-100.border-b-2');
            rows.forEach(row => {
                const nameEl = row.querySelector('.text-gray-500');
                // Status is usually in a div with colored text at the end
                // We use a heuristic: find element with "Operational", "Degraded" text
                const textContent = row.innerText;

                let name = nameEl?.textContent?.trim() || 'Unknown Component';
                // If name is "Edge PoPs\n", clean it
                name = name.split('\n')[0];

                let status = 'operational';
                let statusText = 'Operational';

                // Find status node
                const colEls = row.querySelectorAll('div');
                // Iterate backwards to find status text
                for (let i = colEls.length - 1; i >= 0; i--) {
                    const txt = colEls[i].textContent?.trim().toLowerCase();
                    if (txt === 'operational') { status = 'operational'; statusText = 'Operational'; break; }
                    if (txt === 'degraded performance') { status = 'degraded'; statusText = 'Degraded Performance'; break; }
                    if (txt === 'partial outage') { status = 'partial_outage'; statusText = 'Partial Outage'; break; }
                    if (txt === 'major outage') { status = 'major_outage'; statusText = 'Major Outage'; break; }
                    if (txt === 'maintenance') { status = 'maintenance'; statusText = 'Maintenance'; break; }
                }

                if (name !== 'Unknown Component') {
                    components.push({
                        name,
                        status,
                        group: 'General', // We could try to infer group from previous headers if needed
                        updatedAt: new Date().toISOString()
                    });
                }
            });

            // Incidents
            // Look for active-event-box-body-title
            const incidentEls = document.querySelectorAll('.active-event-box-body-title');
            incidentEls.forEach(el => {
                const title = el.textContent?.trim() || 'Unknown Incident';
                // Find parent container to get details
                const container = el.closest('.shadow'); // Assuming it's in a shadow box
                const descEl = container?.querySelector('.active-event-box-body-description');
                const body = descEl?.textContent?.trim() || '';
                const status = 'identified'; // Default

                incidents.push({
                    title,
                    status,
                    body,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            });

            return { components, incidents };
        });

        console.log(`Scraped ${data.components.length} components, ${data.incidents.length} incidents.`);

        // DB Transaction
        const txn = db.transaction(() => {
            // Components
            for (const comp of data.components) {
                upsertComponent.run({
                    id: randomUUID(),
                    componentId: comp.name, // Use Name as ID for scraping
                    name: comp.name,
                    status: comp.status,
                    group_name: comp.group,
                    updatedAt: comp.updatedAt,
                    syncedAt: new Date().toISOString()
                });
            }

            // Incidents
            for (const inc of data.incidents) {
                upsertIncident.run({
                    id: randomUUID(),
                    incidentId: inc.title, // Use Title as ID
                    title: inc.title,
                    status: inc.status,
                    body: inc.body,
                    createdAt: inc.createdAt,
                    updatedAt: inc.updatedAt,
                    syncedAt: new Date().toISOString()
                });
            }
        });

        txn();

        const duration = Date.now() - start;
        console.log(`Sync successful in ${duration}ms`);
        createLog.run({ id: randomUUID(), status: 'SUCCESS', message: `Synced ${data.components.length} components, ${data.incidents.length} incidents`, durationMs: duration });

    } catch (err: any) {
        const duration = Date.now() - start;
        console.error('Sync failed:', err);
        createLog.run({ id: randomUUID(), status: 'ERROR', message: err.message, durationMs: duration });
    } finally {
        if (browser) await browser.close();
    }
}

// Run if called directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    fetchAndSync();
}
