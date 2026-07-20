import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف المركبة مطلوب للحذف' }, { status: 400 });
    }

    await db.delete(vehicles).where(eq(vehicles.id, parseInt(id)));

    return NextResponse.json({ success: true, message: 'تم حذف المركبة بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
