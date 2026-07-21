import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { AUTH_STORAGE } from '../services/auth-storage';
import { AuthenticationService } from '../services/authentication.service';
import { InMemoryAuthStorage } from '../testing/in-memory-auth.storage';
import { authGuard, guestGuard } from './auth.guard';

describe('auth guards', () => {
  let auth: AuthenticationService;
  let router: Router;
  let storage: InMemoryAuthStorage;

  beforeEach(() => {
    storage = new InMemoryAuthStorage();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', children: [] },
          { path: 'dashboard', children: [] },
          { path: 'forms/:scenarioId', children: [] },
        ]),
        AuthenticationService,
        { provide: AUTH_STORAGE, useValue: storage },
      ],
    });

    auth = TestBed.inject(AuthenticationService);
    router = TestBed.inject(Router);
  });

  it('Route Guard — redirects unauthenticated users to login with returnUrl', () => {
    const state = { url: '/forms/loan-inquiry' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, state));
    expect(result).toEqual(
      router.createUrlTree(['/login'], {
        queryParams: { returnUrl: '/forms/loan-inquiry' },
      }),
    );
  });

  it('Route Guard — allows authenticated users through', () => {
    auth.register({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      password: 'secret1',
      confirmPassword: 'secret1',
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/dashboard' } as RouterStateSnapshot),
    );
    expect(result).toBeTrue();
  });

  it('guestGuard — sends logged-in users to dashboard by default', () => {
    auth.register({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      password: 'secret1',
      confirmPassword: 'secret1',
    });

    const route = {
      queryParamMap: {
        get: () => null,
      },
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => guestGuard(route, {} as never));
    expect(result).toEqual(router.parseUrl('/dashboard'));
  });

  it('guestGuard — resumes requested module when returnUrl is present', () => {
    auth.register({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      password: 'secret1',
      confirmPassword: 'secret1',
    });

    const route = {
      queryParamMap: {
        get: (key: string) => (key === 'returnUrl' ? '/forms/account-opening' : null),
      },
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => guestGuard(route, {} as never));
    expect(result).toEqual(router.parseUrl('/forms/account-opening'));
  });
});
