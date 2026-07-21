import { Injectable, inject, signal } from '@angular/core';

import {
  AuthResult,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  StoredUser,
  toAuthUser,
} from '../models/auth.model';
import { AUTH_STORAGE } from './auth-storage';

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

/**
 * Frontend-only mock authentication.
 * Depends on AUTH_STORAGE so persistence can later move to REST APIs.
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly storage = inject(AUTH_STORAGE);

  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly authenticatedSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.authenticatedSignal.asReadonly();

  constructor() {
    this.restoreSession();
  }

  restoreSession(): void {
    if (this.storage.isLoggedIn()) {
      const user = this.storage.getCurrentUser();
      if (user) {
        this.currentUserSignal.set(user);
        this.authenticatedSignal.set(true);
        return;
      }
    }

    this.currentUserSignal.set(null);
    this.authenticatedSignal.set(false);
  }

  register(request: RegisterRequest): AuthResult {
    const fullName = request.fullName?.trim() ?? '';
    const email = request.email?.trim().toLowerCase() ?? '';
    const mobileNumber = request.mobileNumber?.trim() ?? '';
    const password = request.password ?? '';
    const confirmPassword = request.confirmPassword ?? '';

    if (!fullName || !email || !mobileNumber || !password || !confirmPassword) {
      return { success: false, errorMessage: 'All fields are required.' };
    }

    if (!EMAIL_PATTERN.test(email)) {
      return { success: false, errorMessage: 'Enter a valid email address.' };
    }

    if (!MOBILE_PATTERN.test(mobileNumber)) {
      return { success: false, errorMessage: 'Enter a valid 10-digit Indian mobile number.' };
    }

    if (password.length < 6) {
      return { success: false, errorMessage: 'Password must be at least 6 characters.' };
    }

    if (password !== confirmPassword) {
      return { success: false, errorMessage: 'Password and confirm password do not match.' };
    }

    const users = this.storage.getUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) {
      return { success: false, errorMessage: 'An account with this email already exists.' };
    }

    const stored: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fullName,
      email,
      mobileNumber,
      password,
      registeredAt: new Date().toISOString(),
    };

    this.storage.saveUsers([...users, stored]);

    const user = toAuthUser(stored);
    this.persistSession(user);

    return { success: true, user };
  }

  login(request: LoginRequest): AuthResult {
    const email = request.email?.trim().toLowerCase() ?? '';
    const password = request.password ?? '';

    if (!email || !password) {
      return { success: false, errorMessage: 'Email and password are required.' };
    }

    const users = this.storage.getUsers();
    const match = users.find(
      (user) => user.email.toLowerCase() === email && user.password === password,
    );

    if (!match) {
      return { success: false, errorMessage: 'Invalid email or password.' };
    }

    const user = toAuthUser(match);
    this.persistSession(user);
    return { success: true, user };
  }

  logout(): void {
    this.storage.clearSession();
    this.currentUserSignal.set(null);
    this.authenticatedSignal.set(false);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSignal();
  }

  checkAuthentication(): boolean {
    return this.authenticatedSignal();
  }

  private persistSession(user: AuthUser): void {
    this.storage.setCurrentUser(user);
    this.storage.setLoggedIn(true);
    this.currentUserSignal.set(user);
    this.authenticatedSignal.set(true);
  }
}
