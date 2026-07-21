import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';

import { AUTH_STORAGE } from '../../services/auth-storage';
import { AuthenticationService } from '../../services/authentication.service';
import { InMemoryAuthStorage } from '../../testing/in-memory-auth.storage';
import { RegisterPage } from './register-page';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let component: RegisterPage;
  let auth: AuthenticationService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideNoopAnimations(),
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'register', component: RegisterPage },
        ]),
        AuthenticationService,
        { provide: AUTH_STORAGE, useClass: InMemoryAuthStorage },
      ],
    }).compileComponents();

    auth = TestBed.inject(AuthenticationService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Registration — creates an account and navigates to dashboard', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    const harness = component as unknown as {
      form: { setValue: (v: unknown) => void };
      onSubmit: () => void;
    };

    harness.form.setValue({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    harness.onSubmit();

    expect(auth.checkAuthentication()).toBeTrue();
    expect(auth.getCurrentUser()?.fullName).toBe('Ananya Tayi');
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });
});
