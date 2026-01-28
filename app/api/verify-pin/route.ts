import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { pin } = await request.json();

  // Store this in regular env variable (not NEXT_PUBLIC_)
  const correctPin = process.env.ADMIN_PIN;

  if (pin === correctPin) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
