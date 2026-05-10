import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

// runs on every request before any page or server action renders.
// Its only job is to keep the Supabase auth session alive
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
