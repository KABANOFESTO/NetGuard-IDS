import type { AuthResponse, AuthUser, UserRole } from "@/lib/redux/types/netguard";

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const USER_KEY = "netguard_user";
const AUTH_NOTICE_KEY = "netguard_auth_notice";

const isBrowser = () => typeof window !== "undefined";

export function persistAuthSession(session: AuthResponse) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(ACCESS_KEY, session.access);
  localStorage.setItem(REFRESH_KEY, session.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setAuthNotice(message: string) {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.setItem(AUTH_NOTICE_KEY, message);
}

export function consumeAuthNotice() {
  if (!isBrowser()) {
    return null;
  }

  const message = sessionStorage.getItem(AUTH_NOTICE_KEY);
  if (message) {
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
  }
  return message;
}

export function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function getDashboardPathForRole(role?: UserRole | string | null) {
  switch (role) {
    case "Admin":
      return "/Admin";
    case "Student":
    case "Lecturer":
      return "/student";
    case "Guest":
      return "/guest";
    default:
      return "/auth";
  }
}

export function getProfilePathForRole(role?: UserRole | string | null) {
  switch (role) {
    case "Admin":
      return "/Admin/Profile-settings";
    case "Student":
    case "Lecturer":
      return "/student/Profile-settings";
    case "Guest":
      return "/guest/Profile-settings";
    default:
      return "/auth";
  }
}
