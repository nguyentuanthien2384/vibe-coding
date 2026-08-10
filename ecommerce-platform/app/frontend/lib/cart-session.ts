/**
 * Utility quản lý Guest Session ID cố định trong LocalStorage cho người dùng chưa đăng nhập.
 */
export function getOrCreateGuestSessionId(): string {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'techbite_guest_session_id';
  try {
    let sessionId = localStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'guest_fallback_session';
  }
}
