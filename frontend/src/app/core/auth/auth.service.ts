import { HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

import { Api } from '../../api/api';
import { getCurrentUser } from '../../api/fn/me/get-current-user';
import { CurrentUser } from '../../api/models/current-user';
import { BrowserLocation } from './browser-location';

/** Starts the OIDC flow in the backend (ADR-009); the browser never sees a token. */
export const SIGN_IN_URL = '/oauth2/authorization/keycloak';
export const SIGN_OUT_URL = '/logout';
const XSRF_COOKIE = 'XSRF-TOKEN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(BrowserLocation);

  /** `undefined` until loaded, `null` when signed out. */
  private readonly user = signal<CurrentUser | null | undefined>(undefined);

  readonly me = computed(() => this.user() ?? null);
  readonly isSignedIn = computed(() => !!this.user());

  /** Loads the signed-in user once; a 401 from the API means signed out. */
  async loadMe(): Promise<CurrentUser | null> {
    const known = this.user();
    if (known !== undefined) {
      return known;
    }
    try {
      const me = await this.api.invoke(getCurrentUser);
      this.user.set(me);
      return me;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.user.set(null);
        return null;
      }
      throw error;
    }
  }

  signIn(): void {
    this.location.assign(SIGN_IN_URL);
  }

  /**
   * Signs out with a full-page form POST: the backend answers with a redirect to Keycloak's end-session endpoint,
   * which an XHR could not follow. The form carries the CSRF token from the XSRF-TOKEN cookie.
   */
  signOut(): void {
    const form = this.document.createElement('form');
    form.method = 'post';
    form.action = SIGN_OUT_URL;
    const token = readCookie(this.document.cookie, XSRF_COOKIE);
    if (token) {
      const input = this.document.createElement('input');
      input.type = 'hidden';
      input.name = '_csrf';
      input.value = token;
      form.appendChild(input);
    }
    this.document.body.appendChild(form);
    form.submit();
  }
}

function readCookie(cookies: string, name: string): string | null {
  const match = cookies.split('; ').find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.substring(name.length + 1)) : null;
}
