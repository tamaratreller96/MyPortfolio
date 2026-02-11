import cron from 'node-cron';
import { fetchAndSync } from './poller';

console.log('Starting Status Page Poller Worker...');
console.log('Schedule: Every minute (* * * * *)');

// Run immediately on start
fetchAndSync();

// Schedule every minute
cron.schedule('* * * * *', () => {
    console.log('Running scheduled sync...');
    fetchAndSync();
});
