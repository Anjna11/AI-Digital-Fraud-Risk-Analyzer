const TOKEN_KEY = "auth_token";

export interface AuthResponse {
  token: string;
  email: string;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Registration failed. Email may already be in use.");
  }
  const data: AuthResponse = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }
  const data: AuthResponse = await response.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}