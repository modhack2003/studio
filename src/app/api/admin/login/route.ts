import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const correct = process.env.ADMIN_PIN;
    
    if (!correct) {
      return new NextResponse('Admin PIN not configured', { status: 500 });
    }
    
    if (pin !== correct) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const res = new NextResponse('OK', { status: 200 });
    res.cookies.set('admin_session', '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 6, // 6 hours
    });
    return res;
  } catch {
    return new NextResponse('Bad Request', { status: 400 });
  }
}


