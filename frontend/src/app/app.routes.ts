import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './features/auth/guards/auth.guard';
import { LandingPage } from './features/auth/components/landing-page/landing-page';
import { LoginPage } from './features/auth/components/login-page/login-page';
import { ProfilePage } from './features/auth/components/profile-page/profile-page';
import { RegisterPage } from './features/auth/components/register-page/register-page';
import { BankingAdvisorPage } from './features/banking-advisor/components/banking-advisor-page/banking-advisor-page';
import { Dashboard } from './features/demo/dashboard/dashboard';
import { FormHost } from './features/demo/form-host/form-host';
import { ApplicationDetailPage } from './features/workspace/components/application-detail-page/application-detail-page';
import { PortalShell } from './layouts/portal-shell/portal-shell';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    component: LoginPage,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterPage,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: PortalShell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'advisor',
        component: BankingAdvisorPage,
      },
      {
        path: 'forms/:scenarioId',
        component: FormHost,
      },
      {
        path: 'applications/:applicationId',
        component: ApplicationDetailPage,
      },
      {
        path: 'profile',
        component: ProfilePage,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
