import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Magic-link handler that works cross-device. Unlike the /auth/callback
// PKCE flow (which requires a code_verifier cookie set on the machine
// that requested the link), this verifies the token_hash server-side,
// so you can request a link on one machine and click it on another.
//
// The Supabase email template must link to:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/admin
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/admin';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
