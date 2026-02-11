import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const lastSync = db.prepare<[], { timestamp: string }>("SELECT timestamp FROM sync_logs WHERE status='SUCCESS' ORDER BY timestamp DESC LIMIT 1").get();

        const components = db.prepare<[], { status: string }>("SELECT status FROM components").all();

        const total = components.length;
        const operational = components.filter(c => c.status === 'operational').length;
        const degraded = components.filter(c => c.status !== 'operational' && c.status !== 'major_outage').length;
        const down = components.filter(c => c.status === 'major_outage').length;

        // Determine overall status
        let overallStatus = 'operational';
        if (down > 0) overallStatus = 'major_outage';
        else if (degraded > 0) overallStatus = 'degraded';

        return NextResponse.json({
            overallStatus,
            lastSyncedAt: lastSync?.timestamp || null,
            components: {
                total,
                operational,
                degraded,
                down
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
