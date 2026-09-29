export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const AUTH_USER_KEY = 'xias_session_user_v2';
const REGISTERED_USERS_KEY = 'xias_registered_users_v2';

// SHA-256 password hashing using Web Crypto
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_xias_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to update auth session', e);
  }
}

export function getRegisteredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered users', e);
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, error: 'Ad Soyad alanı boş bırakılamaz.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Geçerli bir kurumsal veya kişisel e-posta girin.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Şifre güvenliğiniz için en az 6 karakter olmalıdır.' };
  }

  const users = getRegisteredUsers();
  const exists = users.some((u) => u.email === cleanEmail);
  if (exists) {
    return { success: false, error: 'Bu e-posta adresiyle daha önce kayıt olunmuş.' };
  }

  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: `usr_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'Lütfen e-posta ve şifrenizi girin.' };
  }

  const users = getRegisteredUsers();
  const found = users.find((u) => u.email === cleanEmail);

  const hash = await hashPassword(password);

  if (!found) {
    // If not found in local user registry, automatically create secure account for user on first login
    const autoUser: User = {
      id: `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };
    users.push(autoUser);
    saveRegisteredUsers(users);
    setCurrentUser(autoUser);
    return { success: true, user: autoUser };
  }

  if (found.passwordHash !== hash) {
    return { success: false, error: 'Hatalı şifre girdiniz. Lütfen kontrol edin.' };
  }

  setCurrentUser(found);
  return { success: true, user: found };
}

export function logoutUser(): void {
  setCurrentUser(null);
}
