import { useSyncExternalStore } from "react";

const TOKEN_KEY = "sextafeira.jwt";
const USER_KEY = "sextafeira.user";

type AuthState = { token: string | null; user: string | null };

const isBrowser = typeof window !== "undefined";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): AuthState {
  if (!isBrowser) return { token: null, user: null };
  return {
    token: window.localStorage.getItem(TOKEN_KEY),
    user: window.localStorage.getItem(USER_KEY),
  };
}

let snapshot: AuthState = read();

function refresh() {
  snapshot = read();
  emit();
}

if (isBrowser) {
  window.addEventListener("storage", (e) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) refresh();
  });
}

// Generates a fake JWT-shaped token (header.payload.signature, base64url).
function fakeJwt(user: string): string {
  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const header = enc({ alg: "HS256", typ: "JWT" });
  const payload = enc({
    sub: user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  });
  const sig = enc({ mock: true, r: Math.random().toString(36).slice(2) });
  return `${header}.${payload}.${sig}`;
}

export const authApi = {
  login: (identifier: string, password: string) => {
    const id = identifier.trim();
    if (!id || !password.trim()) {
      throw new Error("Informe usuário/e-mail e senha.");
    }
    if (password.length < 4) {
      throw new Error("Credenciais inválidas.");
    }
    if (!isBrowser) return;
    const token = fakeJwt(id);
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, id);
    refresh();
  },
  logout: () => {
    if (!isBrowser) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    refresh();
  },
  getSnapshot: () => snapshot,
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAuth() {
  const s = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => ({ token: null, user: null }),
  );
  return { ...s, isAuthenticated: !!s.token };
}