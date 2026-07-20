import { NextResponse } from 'next/server';
import { db } from '@/db';
import { gpsLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId) {
      return NextResponse.json({ success: false, error: 'معرف المركبة مطلوب' }, { status: 400 });
    }

    const logs = await db.select()
      .from(gpsLogs)
      .where(eq(gpsLogs.vehicleId, parseInt(vehicleId)))
      .orderBy(desc(gpsLogs.id))
      .limit(30);

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
