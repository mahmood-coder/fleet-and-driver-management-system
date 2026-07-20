import { db } from "@/db";
import { users, vehicles, duties, gpsLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  // Check if users already exist
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return; // Already seeded
  }

  console.log("Seeding database with Arabic transportation data...");

  // Create Users (Admin, Viewers, Drivers)
  // Password is raw for demo simplicity
  const adminUser = await db.insert(users).values({
    username: "admin",
    password: "123",
    name: "م. أحمد الشمري (مسؤول الحركة)",
    role: "admin",
    phone: "0501234567",
  }).returning();

  const viewerUser = await db.insert(users).values({
    username: "viewer",
    password: "123",
    name: "اللواء عبد العزيز (المسؤول الأعلى)",
    role: "viewer",
    phone: "0502234567",
  }).returning();

  const driver1 = await db.insert(users).values({
    username: "driver1",
    password: "123",
    name: "ياسر القحطاني (سائق)",
    role: "driver",
    phone: "0503344551",
  }).returning();

  const driver2 = await db.insert(users).values({
    username: "driver2",
    password: "123",
    name: "سلمان العتيبي (سائق)",
    role: "driver",
    phone: "0503344552",
  }).returning();

  const driver3 = await db.insert(users).values({
    username: "driver3",
    password: "123",
    name: "خالد الحربي (سائق)",
    role: "driver",
    phone: "0503344553",
  }).returning();

  // Create Vehicles
  const v1 = await db.insert(vehicles).values({
    plateNumber: "أ ب ج 1234",
    model: "تويوتا هايلكس 2024",
    status: "available",
    gpsEnabled: true,
    gpsType: "phone",
    lastLatitude: 24.7136,
    lastLongitude: 46.6753,
    lastGpsUpdate: new Date(),
    rating: 5,
    notes: "حالة المركبة ممتازة ونظيفة تماماً",
  }).returning();

  const v2 = await db.insert(vehicles).values({
    plateNumber: "د هـ و 5678",
    model: "شاحنة إيسوزو ديماكس 2023",
    status: "available",
    gpsEnabled: true,
    gpsType: "external_wireless",
    lastLatitude: 24.7224,
    lastLongitude: 46.6812,
    lastGpsUpdate: new Date(),
    rating: 4,
    notes: "مجهزة بجي بي اس خارجي لاسلكي في التابلت الخاص بالسيارة",
  }).returning();

  const v3 = await db.insert(vehicles).values({
    plateNumber: "ر س ت 9999",
    model: "فورد ترانزيت باص 2022",
    status: "available",
    gpsEnabled: false,
    gpsType: "phone",
    lastLatitude: 24.6985,
    lastLongitude: 46.7021,
    lastGpsUpdate: new Date(),
    rating: 3,
    notes: "نظام تحديد المواقع مغلق حالياً بانتظار الصيانة",
  }).returning();

  // Create some past duties (completed)
  await db.insert(duties).values({
    driverId: driver1[0].id,
    vehicleId: v1[0].id,
    dutyType: "توصيل شحنة طبية عاجلة إلى مستشفى الملك فيصل",
    status: "completed",
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000 - 30 * 60 * 1000), // 4.5 hours ago
    endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    durationMinutes: 240, // 4 hours
    driverRating: 5,
    vehicleRating: 5,
    feedback: "تم إنجاز المهمة بنجاح وبسرعة قياسية، السائق متعاون جداً والسيارة مريحة",
  });

  await db.insert(duties).values({
    driverId: driver2[0].id,
    vehicleId: v2[0].id,
    dutyType: "نقل معدات مكتبية وصيانة للفرع الشمالي",
    status: "completed",
    startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    durationMinutes: 180, // 3 hours
    driverRating: 4,
    vehicleRating: 4,
    feedback: "التوصيل سليم، استغرق بعض الوقت بسبب الازدحام المروري",
  });

  // Create an active duty (running) for driver1
  const activeDuty = await db.insert(duties).values({
    driverId: driver1[0].id,
    vehicleId: v2[0].id,
    dutyType: "مهمة إمداد لوجستي طارئة وتوزيع طرود المنطقة الوسطى",
    status: "running",
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  }).returning();

  // Insert GPS route points for this active duty
  await db.insert(gpsLogs).values([
    { dutyId: activeDuty[0].id, vehicleId: v2[0].id, latitude: 24.7136, longitude: 46.6753, recordedAt: new Date(Date.now() - 45 * 60 * 1000) },
    { dutyId: activeDuty[0].id, vehicleId: v2[0].id, latitude: 24.7180, longitude: 46.6800, recordedAt: new Date(Date.now() - 30 * 60 * 1000) },
    { dutyId: activeDuty[0].id, vehicleId: v2[0].id, latitude: 24.7224, longitude: 46.6812, recordedAt: new Date(Date.now() - 15 * 60 * 1000) },
  ]);

  // Create a pending duty (assigned) for driver3
  await db.insert(duties).values({
    driverId: driver3[0].id,
    vehicleId: v3[0].id,
    dutyType: "نقل الوفد الزائر من مطار الملك خالد الدولي إلى مقر الإدارة الرئيسي",
    status: "pending",
  });

  console.log("Database seeded successfully!");
}
