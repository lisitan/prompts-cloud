import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerClient();
  await supabase.auth.signOut();

  const origin = request.headers.get('origin') || 'http://localhost:3000';
  return NextResponse.redirect(`${origin}/login`);
}
