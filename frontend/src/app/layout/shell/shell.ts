import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';

/** Placeholder app shell: shows who is signed in. Navigation and screens come with the feature changes. */
@Component({
  selector: 'kn-shell',
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly email = computed(() => this.auth.me()?.email ?? '');

  protected signOut(): void {
    this.auth.signOut();
  }
}
