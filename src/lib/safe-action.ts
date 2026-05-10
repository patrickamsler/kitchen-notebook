import { createSafeActionClient } from 'next-safe-action';
import { getUser } from '@/lib/auth';

export const actionClient = createSafeActionClient();

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await getUser();
  if (!user) {
    throw new Error('You must be signed in to perform this action.');
  }
  return next({ ctx: { user } });
});
