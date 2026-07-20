import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { plateNumber, model, gpsEnabled, gpsType, rating, notes, status } = await request.json();

    if (!plateNumber || !model) {
      return NextResponse.json({ success: false, error: 'رقم اللوحة وموديل السيارة مطلوبان' }, { status: 400 });
    }

    const newVehicle = await db.insert(vehicles).values({
      plateNumber,
      model,
      gpsEnabled: gpsEnabled !== undefined ? gpsEnabled : true,
      gpsType: gpsType || 'phone',
      rating: rating || 5,
      notes: notes || '',
      status: status || 'available',
      lastLatitude: 24.7136, // Riyadh center default
      lastLongitude: 46.6753,
      lastGpsUpdate: new Date(),
    }).returning();

    return NextResponse.json({ success: true, vehicle: newVehicle[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, plateNumber, model, gpsEnabled, gpsType, rating, notes, status, lastLatitude, lastLongitude } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف المركبة مطلوب للتحديث' }, { status: 400 });
    }

    const updateData: any = {};
    if (plateNumber !== undefined) updateData.plateNumber = plateNumber;
    if (model !== undefined) updateData.model = model;
    if (gpsEnabled !== undefined) updateData.gpsEnabled = gpsEnabled;
    if (gpsType !== undefined) updateData.gpsType = gpsType;
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (lastLatitude !== undefined) updateData.lastLatitude = parseFloat(lastLatitude);
    if (lastLongitude !== undefined) updateData.lastLongitude = parseFloat(lastLongitude);
    
    updateData.lastGpsUpdate = new Date();

    const updated = await db.update(vehicles)
      .set(updateData)
      .where(eq(vehicles.id, id))
      .returning();

    return NextResponse.json({ success: true, vehicle: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
