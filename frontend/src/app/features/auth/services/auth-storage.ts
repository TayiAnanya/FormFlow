import { InjectionToken } from '@angular/core';

import { AuthUser, StoredUser } from '../models/auth.model';

/**
 * Storage port for authentication.
 * Swap LocalStorageAuthStorage for an HTTP-backed implementation later
 * without changing AuthenticationService consumers.
 */
export interface AuthStorage {
  getUsers(): StoredUser[];
  saveUsers(users: StoredUser[]): void;
  getCurrentUser(): AuthUser | null;
  setCurrentUser(user: AuthUser | null): void;
  isLoggedIn(): boolean;
  setLoggedIn(loggedIn: boolean): void;
  clearSession(): void;
}

export const AUTH_STORAGE = new InjectionToken<AuthStorage>('AUTH_STORAGE');
