import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, vehicles, duties } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const driverIdStr = searchParams.get('driverId');

    // Base queries
    const allUsers = await db.select().from(users).orderBy(desc(users.id));
    const allVehicles = await db.select().from(vehicles).orderBy(desc(vehicles.id));
    
    let allDuties = [];
    if (role === 'driver' && driverIdStr) {
      const driverId = parseInt(driverIdStr);
      allDuties = await db.select()
        .from(duties)
        .where(eq(duties.driverId, driverId))
        .orderBy(desc(duties.id));
    } else {
      // Admin and viewers see everything
      allDuties = await db.select().from(duties).orderBy(desc(duties.id));
    }

    return NextResponse.json({
      success: true,
      users: allUsers,
      vehicles: allVehicles,
      duties: allDuties
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
