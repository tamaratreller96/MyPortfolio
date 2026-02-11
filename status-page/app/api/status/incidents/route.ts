import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const incidents = db.prepare("SELECT * FROM incidents ORDER BY createdAt DESC LIMIT 20").all();
        return NextResponse.json(incidents);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
