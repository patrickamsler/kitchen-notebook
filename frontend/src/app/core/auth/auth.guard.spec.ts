import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const auth = { loadMe: vi.fn(), signIn: vi.fn() };

  beforeEach(() => {
    auth.loadMe.mockReset();
    auth.signIn.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }] });
  });

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  it('PLT-02 lets a signed-in user through', async () => {
    // given
    auth.loadMe.mockResolvedValue({ email: 'anna@example.com' });

    // when
    const result = await runGuard();

    // then
    expect(result).toBe(true);
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('PLT-01 sends a signed-out user to sign-in at the backend', async () => {
    // given
    auth.loadMe.mockResolvedValue(null);

    // when
    const result = await runGuard();

    // then
    expect(result).toBe(false);
    expect(auth.signIn).toHaveBeenCalled();
  });
});
