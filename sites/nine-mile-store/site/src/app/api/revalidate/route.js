import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '/';
  
  try {
    // Revalidate the specific path
    revalidatePath(path);
    
    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path: path
    });
  } catch (err) {
    return NextResponse.json({
      revalidated: false,
      now: Date.now(),
      path: path,
      error: err.message
    }, { status: 500 });
  }
} 