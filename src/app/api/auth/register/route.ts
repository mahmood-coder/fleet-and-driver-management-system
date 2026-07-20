import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { username, password, name, role, phone } = await request.json();

    if (!username || !password || !name || !role) {
      return NextResponse.json({ success: false, error: 'الرجاء إدخال الحقول المطلوبة بالكامل' }, { status: 400 });
    }

    // Check if username exists
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم مسجل مسبقاً، اختر اسماً آخر' }, { status: 400 });
    }

    const newUser = await db.insert(users).values({
      username,
      password,
      name,
      role,
      phone: phone || '',
    }).returning();

    return NextResponse.json({
      success: true,
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        name: newUser[0].name,
        role: newUser[0].role,
        phone: newUser[0].phone,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
