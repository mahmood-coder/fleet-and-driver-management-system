import { NextResponse } from 'next/server';
import { db } from '@/db';
import { duties, vehicles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف المهمة مطلوب للحذف' }, { status: 400 });
    }

    const dutyId = parseInt(id);
    const dutyList = await db.select().from(duties).where(eq(duties.id, dutyId)).limit(1);
    
    if (dutyList.length > 0 && dutyList[0].status === 'running') {
      // If deleted while running, free up vehicle
      await db.update(vehicles)
        .set({ status: 'available' })
        .where(eq(vehicles.id, dutyList[0].vehicleId));
    }

    await db.delete(duties).where(eq(duties.id, dutyId));

    return NextResponse.json({ success: true, message: 'تم حذف المهمة بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
