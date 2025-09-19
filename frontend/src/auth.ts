export type AuthUser = {
  userId: number;
  name: string;
  email: string;
};

const BASE = "";

function mapUser(u: any): AuthUser {
  return { userId: u.user_id, name: u.name, email: u.email };
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to register");
  return mapUser(data);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to login");
  return mapUser(data);
}

export async function me(userId: number) {
  const res = await fetch(`${BASE}/api/auth/me?user_id=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch me");
  return mapUser(data);
}

export async function logout() {
  await fetch(`${BASE}/api/auth/logout`, { method: "POST" });
}

export const authStore = {
  get userId(): number | null {
    const v = localStorage.getItem("user_id");
    return v ? Number(v) : null;
  },
  set userId(v: number | null) {
    if (v == null) localStorage.removeItem("user_id");
    else localStorage.setItem("user_id", String(v));
  },
};
