import { NextResponse } from 'next/server';
import { db } from '@/db';
import { duties, vehicles, gpsLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { driverId, vehicleId, dutyType } = await request.json();

    if (!driverId || !vehicleId || !dutyType) {
      return NextResponse.json({ success: false, error: 'الرجاء تحديد السائق، المركبة، ونوع الواجب' }, { status: 400 });
    }

    // Check if vehicle is already on duty
    const vehicleCheck = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
    if (vehicleCheck.length === 0) {
      return NextResponse.json({ success: false, error: 'المركبة المحددة غير موجودة' }, { status: 404 });
    }
    
    if (vehicleCheck[0].status === 'on_duty') {
      return NextResponse.json({ success: false, error: 'المركبة المحددة في مهمة حالية بالفعل' }, { status: 400 });
    }

    // Create the duty
    const newDuty = await db.insert(duties).values({
      driverId: parseInt(driverId),
      vehicleId: parseInt(vehicleId),
      dutyType,
      status: 'pending', // Pending start by the driver
    }).returning();

    return NextResponse.json({ success: true, duty: newDuty[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, driverRating, vehicleRating, feedback, latitude, longitude } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف المهمة مطلوب' }, { status: 400 });
    }

    // Get current duty details
    const currentDutyList = await db.select().from(duties).where(eq(duties.id, id)).limit(1);
    if (currentDutyList.length === 0) {
      return NextResponse.json({ success: false, error: 'المهمة غير موجودة' }, { status: 404 });
    }

    const currentDuty = currentDutyList[0];
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'running') {
        updateData.startTime = new Date();
        // Set vehicle status to on_duty
        await db.update(vehicles)
          .set({ status: 'on_duty' })
          .where(eq(vehicles.id, currentDuty.vehicleId));
      } else if (status === 'completed') {
        updateData.endTime = new Date();
        const start = currentDuty.startTime || new Date();
        const end = new Date();
        const diffMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
        updateData.durationMinutes = diffMinutes;

        // Set vehicle back to available
        await db.update(vehicles)
          .set({ status: 'available' })
          .where(eq(vehicles.id, currentDuty.vehicleId));

        if (driverRating) {
          updateData.driverRating = parseInt(driverRating);
        }
        if (vehicleRating) {
          updateData.vehicleRating = parseInt(vehicleRating);
          // Update vehicle rating average in vehicle table
          await db.update(vehicles)
            .set({ rating: parseInt(vehicleRating) })
            .where(eq(vehicles.id, currentDuty.vehicleId));
        }
        if (feedback) {
          updateData.feedback = feedback;
        }
      }
    }

    const updated = await db.update(duties)
      .set(updateData)
      .where(eq(duties.id, id))
      .returning();

    // If driver sent GPS location during duty
    if (latitude && longitude) {
      await db.update(vehicles)
        .set({
          lastLatitude: parseFloat(latitude),
          lastLongitude: parseFloat(longitude),
          lastGpsUpdate: new Date()
        })
        .where(eq(vehicles.id, currentDuty.vehicleId));

      await db.insert(gpsLogs).values({
        dutyId: id,
        vehicleId: currentDuty.vehicleId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
    }

    return NextResponse.json({ success: true, duty: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
