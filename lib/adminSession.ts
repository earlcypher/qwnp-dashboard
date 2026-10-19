const STORAGE_KEY = 'adminSession';

export function readAdminSession(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(STORAGE_KEY) || '';
}

export function saveAdminSession(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('adminKey');
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem('adminKey');
}

export function clearLegacyAdminKey(): void {
  if (typeof window !== 'undefined') sessionStorage.removeItem('adminKey');
}
