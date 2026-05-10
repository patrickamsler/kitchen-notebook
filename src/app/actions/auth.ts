'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { actionClient } from '@/lib/safe-action';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
  redirectTo: z.string().optional(),
});

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { email, password, redirectTo } }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
    revalidatePath('/', 'layout');
    redirect(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/');
  });

export const logoutAction = actionClient.action(async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
});
