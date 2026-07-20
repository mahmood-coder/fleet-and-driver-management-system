import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, vehicles, duties } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' }, { status: 400 });
    }

    // Direct match (for demo simulation)
    const result = await db.select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.password, password)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const user = result[0];
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
