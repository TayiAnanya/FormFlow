import { TestBed } from '@angular/core/testing';

import { AUTH_STORAGE } from './auth-storage';
import { AuthenticationService } from './authentication.service';
import { InMemoryAuthStorage } from '../testing/in-memory-auth.storage';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let storage: InMemoryAuthStorage;

  const validRegister = {
    fullName: 'Ananya Tayi',
    email: 'ananya@example.com',
    mobileNumber: '9876543210',
    password: 'secret1',
    confirmPassword: 'secret1',
  };

  beforeEach(() => {
    storage = new InMemoryAuthStorage();

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: AUTH_STORAGE, useValue: storage },
      ],
    });

    service = TestBed.inject(AuthenticationService);
  });

  it('Registration — stores user and opens a session', () => {
    const result = service.register(validRegister);

    expect(result.success).toBeTrue();
    expect(result.user?.email).toBe('ananya@example.com');
    expect(storage.getUsers().length).toBe(1);
    expect(service.checkAuthentication()).toBeTrue();
    expect(service.getCurrentUser()?.fullName).toBe('Ananya Tayi');
    expect(storage.isLoggedIn()).toBeTrue();
  });

  it('Duplicate Email — rejects a second registration with the same email', () => {
    expect(service.register(validRegister).success).toBeTrue();
    const duplicate = service.register({
      ...validRegister,
      fullName: 'Someone Else',
    });

    expect(duplicate.success).toBeFalse();
    expect(duplicate.errorMessage).toContain('already exists');
    expect(storage.getUsers().length).toBe(1);
  });

  it('Login — authenticates against locally stored users', () => {
    service.register(validRegister);
    service.logout();

    const result = service.login({
      email: 'ananya@example.com',
      password: 'secret1',
    });

    expect(result.success).toBeTrue();
    expect(service.checkAuthentication()).toBeTrue();
    expect(service.getCurrentUser()?.email).toBe('ananya@example.com');
  });

  it('Invalid Login — rejects wrong credentials', () => {
    service.register(validRegister);
    service.logout();

    const result = service.login({
      email: 'ananya@example.com',
      password: 'wrong-password',
    });

    expect(result.success).toBeFalse();
    expect(result.errorMessage).toContain('Invalid');
    expect(service.checkAuthentication()).toBeFalse();
  });

  it('Logout — clears session state', () => {
    service.register(validRegister);
    service.logout();

    expect(service.checkAuthentication()).toBeFalse();
    expect(service.getCurrentUser()).toBeNull();
    expect(storage.isLoggedIn()).toBeFalse();
    expect(storage.getCurrentUser()).toBeNull();
  });

  it('Session Persistence — restoreSession rehydrates login after refresh', () => {
    service.register(validRegister);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: AUTH_STORAGE, useValue: storage },
      ],
    });
    const afterRefresh = TestBed.inject(AuthenticationService);

    expect(afterRefresh.checkAuthentication()).toBeTrue();
    expect(afterRefresh.getCurrentUser()?.fullName).toBe('Ananya Tayi');
  });
});
