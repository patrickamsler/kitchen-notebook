import { DOCUMENT, Injectable, inject } from '@angular/core';

/** Full-page navigation, used where the backend (not the router) must handle the URL. */
@Injectable({ providedIn: 'root' })
export class BrowserLocation {
  private readonly document = inject(DOCUMENT);

  assign(url: string): void {
    this.document.location.assign(url);
  }
}
