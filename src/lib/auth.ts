export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const AUTH_STORAGE_KEY = 'xias_auth_user_v1';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to update auth session', e);
  }
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'E-posta ve şifre zorunludur.' };
  }

  // Pre-configured demo user or newly registered user
  const user: User = {
    id: `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    createdAt: new Date().toISOString(),
  };

  setCurrentUser(user);
  return { success: true, user };
}

export function registerUser(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, error: 'Ad Soyad zorunludur.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Geçerli bir e-posta adresi girin.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Şifre en az 6 karakter olmalıdır.' };
  }

  const user: User = {
    id: `usr_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    createdAt: new Date().toISOString(),
  };

  setCurrentUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentUser(null);
}
