import { Injectable } from '@angular/core';

import {
  AUTH_STORAGE_KEYS,
  AuthUser,
  StoredUser,
  toAuthUser,
} from '../models/auth.model';
import { AuthStorage } from './auth-storage';

/** localStorage-backed auth persistence (mock — replaceable by REST later). */
@Injectable()
export class LocalStorageAuthStorage implements AuthStorage {
  getUsers(): StoredUser[] {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.users);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  saveUsers(users: StoredUser[]): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.users, JSON.stringify(users));
  }

  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.currentUser);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as StoredUser | AuthUser;
      if (!parsed?.email || !parsed?.fullName) {
        return null;
      }
      return 'password' in parsed ? toAuthUser(parsed as StoredUser) : (parsed as AuthUser);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: AuthUser | null): void {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.currentUser);
      return;
    }
    localStorage.setItem(AUTH_STORAGE_KEYS.currentUser, JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(AUTH_STORAGE_KEYS.isLoggedIn) === 'true';
  }

  setLoggedIn(loggedIn: boolean): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.isLoggedIn, loggedIn ? 'true' : 'false');
  }

  clearSession(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.currentUser);
    localStorage.setItem(AUTH_STORAGE_KEYS.isLoggedIn, 'false');
  }
}
