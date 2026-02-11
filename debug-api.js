const axios = require('axios');

const BASE = 'https://status.5centscdn.net/status-page-api';

async function probe(method, path, data = null) {
    try {
        console.log(`\n--- Probing ${method} ${path} ---`);
        const res = await axios({
            method,
            url: `${BASE}${path}`,
            data,
            validateStatus: () => true // Don't throw on error
        });
        console.log(`Status: ${res.status}`);
        console.log('Data:', JSON.stringify(res.data).substring(0, 500));
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}


async function run() {
    // Check local domain-based logic
    await probe('POST', '/status-page/url', { url: 'status.5centscdn.net' });
    await probe('POST', '/status-page/domain', { domain: 'status.5centscdn.net' });

    // Check OneUptime Host directly
    const originalBase = 'https://status.5centscdn.net/status-page-api';
    const oneUptimeBase = 'https://oneuptime.com/status-page-api';

    // Overwrite base for a test
    console.log('\n--- Switching to OneUptime Base ---');
    async function probeOne(path, data) {
        try {
            console.log(`\n--- Probing OneUptime POST ${path} ---`);
            const res = await axios({
                method: 'POST',
                url: `${oneUptimeBase}${path}`,
                data,
                validateStatus: () => true
            });
            console.log(`Status: ${res.status}`);
            console.log('Data:', JSON.stringify(res.data).substring(0, 500));
        } catch (err) {
            console.error(err.message);
        }
    }

    const ID = '8cd137b0-4880-11ef-a9ce-f55a7a12d48d';
    await probe('POST', `/overview/${ID}`);
    await probeOne(`/overview/${ID}`);
    await probeOne(`/overview/${ID}`, {});

    // Also try probing for domain lookup
    await probe('POST', '/status-page/url', { url: 'https://status.5centscdn.net' });
    await probeOne('/status-page/url', { url: 'https://status.5centscdn.net' });
}

run();
