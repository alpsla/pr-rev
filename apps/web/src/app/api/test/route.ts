import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('Test API route hit');
  return NextResponse.json({ message: 'Test successful' });
}