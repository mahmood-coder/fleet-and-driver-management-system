import { pgTable, text, serial, timestamp, doublePrecision, boolean, integer } from 'drizzle-orm/pg-core';

// Users can be:
// - 'admin' (المسؤول عن تنظيم الحركة - full access, create duties, configure GPS, etc.)
// - 'viewer' (المسؤول الأعلى للمتابعة - read only view for monitoring and tracking)
// - 'driver' (السائق - can only see his own duties, start/stop them, and report GPS if active)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // stored securely (or simple for demo with simulation)
  name: text('name').notNull(),
  role: text('role').notNull(), // 'admin' | 'viewer' | 'driver'
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vehicles in the system
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  plateNumber: text('plate_number').notNull().unique(), // رقم اللوحة
  model: text('model').notNull(), // الموديل / النوع (مثلاً تويوتا هايلاكس)
  status: text('status').notNull().default('available'), // 'available' | 'on_duty' | 'maintenance'
  gpsEnabled: boolean('gps_enabled').default(true).notNull(), // تفعيل GPS الهاتف أو الخارجي من المسؤول
  gpsType: text('gps_type').default('phone').notNull(), // 'phone' | 'external_wireless' (جي بي اس خارجي لاسلكي)
  lastLatitude: doublePrecision('last_latitude'),
  lastLongitude: doublePrecision('last_longitude'),
  lastGpsUpdate: timestamp('last_gps_update'),
  rating: integer('rating').default(5).notNull(), // تقييم المركبة (1-5)
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Duties (مهام النقل والحركة)
export const duties = pgTable('duties', {
  id: serial('id').primaryKey(),
  driverId: integer('driver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  dutyType: text('duty_type').notNull(), // نوع الواجب (مثلاً: نقل بضائع، توصيل موظفين، دورية)
  status: text('status').notNull().default('pending'), // 'pending' (بانتظار الحركة) | 'running' (انطلقت) | 'completed' (انتهت ورجعت للكراج)
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  durationMinutes: integer('duration_minutes'), // يحسب تلقائياً بالدقائق عند الإنهاء
  driverRating: integer('driver_rating'), // تقييم السائق في هذه المهمة (1-5)
  vehicleRating: integer('vehicle_rating'), // تقييم المركبة في هذه المهمة (1-5)
  feedback: text('feedback'), // ملاحظات التقييم أو تقرير المهمة
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Mock/Simulated GPS path log for routing visualization on the map
export const gpsLogs = pgTable('gps_logs', {
  id: serial('id').primaryKey(),
  dutyId: integer('duty_id').references(() => duties.id, { onDelete: 'cascade' }),
  vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});
