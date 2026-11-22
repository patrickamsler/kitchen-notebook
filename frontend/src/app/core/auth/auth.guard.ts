import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthService } from './auth.service';

/** Lets signed-in users through; sends everyone else to sign-in at the backend. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  if (await auth.loadMe()) {
    return true;
  }
  auth.signIn();
  return false;
};
