import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  { path: '', component: Shell, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
