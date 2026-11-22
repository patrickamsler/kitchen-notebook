import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CurrentUser } from '../../api/models/current-user';
import { AuthService, SIGN_IN_URL } from './auth.service';
import { BrowserLocation } from './browser-location';

const anna: CurrentUser = {
  subject: '3f1c2b9e-7a64-4f3b-9a51-2d8c3e0f4b11',
  email: 'anna@example.com',
  emailVerified: true,
  displayName: 'Anna Example',
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const location = { assign: vi.fn() };

  beforeEach(() => {
    location.assign.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BrowserLocation, useValue: location },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.querySelectorAll('form').forEach((form) => form.remove());
    vi.restoreAllMocks();
  });

  it('PLT-03 loads the signed-in user into the me signal', async () => {
    // given
    const loading = service.loadMe();

    // when
    http.expectOne({ method: 'GET', url: '/api/me' }).flush(anna);

    // then
    expect(await loading).toEqual(anna);
    expect(service.me()).toEqual(anna);
    expect(service.isSignedIn()).toBe(true);
  });

  it('PLT-01 treats 401 from /api/me as signed out', async () => {
    // given
    const loading = service.loadMe();

    // when
    http
      .expectOne('/api/me')
      .flush(
        { type: 'urn:kn:problem:unauthenticated', title: 'Not signed in', status: 401 },
        { status: 401, statusText: 'Unauthorized' },
      );

    // then
    expect(await loading).toBeNull();
    expect(service.me()).toBeNull();
    expect(service.isSignedIn()).toBe(false);
  });

  it('PLT-02 starts sign-in with a full-page navigation to the backend', () => {
    // when
    service.signIn();

    // then
    expect(location.assign).toHaveBeenCalledWith(SIGN_IN_URL);
  });

  it('PLT-06 signs out with a form POST carrying the XSRF token', () => {
    // given
    document.cookie = 'XSRF-TOKEN=token-123';
    const submit = vi
      .spyOn(HTMLFormElement.prototype, 'submit')
      .mockImplementation(() => undefined);

    // when
    service.signOut();

    // then
    const submitted = submit.mock.contexts[0] as HTMLFormElement | undefined;
    expect(submitted?.method).toBe('post');
    expect(submitted?.getAttribute('action')).toBe('/logout');
    const csrf = submitted?.querySelector<HTMLInputElement>('input[name="_csrf"]');
    expect(csrf?.value).toBe('token-123');
  });
});
