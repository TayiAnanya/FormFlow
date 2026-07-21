import { Injectable } from '@angular/core';

import { AuthUser, StoredUser } from '../models/auth.model';
import { AuthStorage } from '../services/auth-storage';

/** In-memory AuthStorage for unit tests. */
@Injectable()
export class InMemoryAuthStorage implements AuthStorage {
  users: StoredUser[] = [];
  currentUser: AuthUser | null = null;
  loggedIn = false;

  getUsers(): StoredUser[] {
    return [...this.users];
  }

  saveUsers(users: StoredUser[]): void {
    this.users = [...users];
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  setCurrentUser(user: AuthUser | null): void {
    this.currentUser = user;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  setLoggedIn(loggedIn: boolean): void {
    this.loggedIn = loggedIn;
  }

  clearSession(): void {
    this.currentUser = null;
    this.loggedIn = false;
  }
}
