import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const maintenance = db.prepare("SELECT * FROM maintenances ORDER BY scheduledStart DESC LIMIT 20").all();
        return NextResponse.json(maintenance);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
