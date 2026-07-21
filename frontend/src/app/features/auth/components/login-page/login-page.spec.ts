import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { AUTH_STORAGE } from '../../services/auth-storage';
import { AuthenticationService } from '../../services/authentication.service';
import { InMemoryAuthStorage } from '../../testing/in-memory-auth.storage';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let auth: AuthenticationService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideNoopAnimations(),
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'forms/:scenarioId', children: [] },
          { path: 'login', component: LoginPage },
        ]),
        AuthenticationService,
        { provide: AUTH_STORAGE, useClass: InMemoryAuthStorage },
      ],
    }).compileComponents();

    auth = TestBed.inject(AuthenticationService);
    router = TestBed.inject(Router);
    auth.register({
      fullName: 'Ananya Tayi',
      email: 'ananya@example.com',
      mobileNumber: '9876543210',
      password: 'secret1',
      confirmPassword: 'secret1',
    });
    auth.logout();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Login — navigates to dashboard on success', async () => {
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    const harness = component as unknown as {
      form: { setValue: (v: unknown) => void };
      onSubmit: () => void;
    };

    harness.form.setValue({ email: 'ananya@example.com', password: 'secret1' });
    harness.onSubmit();

    expect(auth.checkAuthentication()).toBeTrue();
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('Login — navigates to returnUrl module after success', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login?returnUrl=/forms/loan-inquiry', LoginPage);
    const page = harness.routeDebugElement?.componentInstance as LoginPage;
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);

    const pageHarness = page as unknown as {
      form: { setValue: (v: unknown) => void };
      onSubmit: () => void;
    };

    pageHarness.form.setValue({ email: 'ananya@example.com', password: 'secret1' });
    pageHarness.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith('/forms/loan-inquiry');
  });

  it('Invalid Login — shows an error and stays on the page', () => {
    const harness = component as unknown as {
      form: { setValue: (v: unknown) => void };
      onSubmit: () => void;
      errorMessage: string | null;
    };

    harness.form.setValue({ email: 'ananya@example.com', password: 'nope' });
    harness.onSubmit();
    fixture.detectChanges();

    expect(harness.errorMessage).toContain('Invalid');
    expect(auth.checkAuthentication()).toBeFalse();
  });
});
