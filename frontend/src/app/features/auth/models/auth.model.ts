/** Public user profile — never includes password. */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  registeredAt: string;
}

/** Persisted user record for the mock auth store. */
export interface StoredUser extends AuthUser {
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  errorMessage?: string;
  user?: AuthUser;
}

export const AUTH_STORAGE_KEYS = {
  users: 'bank_users',
  currentUser: 'current_user',
  isLoggedIn: 'is_logged_in',
} as const;

export function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
    registeredAt: user.registeredAt,
  };
}

export function firstNameFromFullName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return 'Customer';
  }
  return trimmed.split(/\s+/)[0] ?? 'Customer';
}
