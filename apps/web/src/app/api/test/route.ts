import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request) {
  console.log('Test API route hit');
  return NextResponse.json({ message: 'Test successful' });
}