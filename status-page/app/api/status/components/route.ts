import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const components = db.prepare("SELECT * FROM components ORDER BY name ASC").all();
        return NextResponse.json(components);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
