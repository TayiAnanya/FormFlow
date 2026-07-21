import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';
import { resolvePostAuthUrl } from '../utils/resolve-post-auth-url';

/** Protects banking portal routes — redirects guests to Login with returnUrl. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  if (auth.checkAuthentication()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Keeps authenticated users out of landing/login/register.
 * Honors a safe returnUrl when present (e.g. resumed module deep-link).
 */
export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  if (!auth.checkAuthentication()) {
    return true;
  }

  const destination = resolvePostAuthUrl(route.queryParamMap.get('returnUrl'));
  return router.parseUrl(destination);
};
