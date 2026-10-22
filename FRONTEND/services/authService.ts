const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const TOKEN_KEY = "auth_token";

export interface AuthResponse {
  token: string;
  email: string;
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);

  // Spring Boot may return "detail" for ResponseStatusException and
  // "message" for other API errors.
  if (typeof body?.message === "string") return body.message;
  if (typeof body?.detail === "string") return body.detail;
  if (typeof body?.error === "string") return body.error;

  return fallback;
}

function saveToken(data: AuthResponse): AuthResponse {
  if (typeof data?.token !== "string" || data.token.length === 0) {
    throw new Error("The server did not return a JWT token. Please try again.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, "Registration failed."));
  }

  const data: AuthResponse = await response.json();
  return saveToken(data);
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, "Invalid email or password."));
  }

  const data: AuthResponse = await response.json();
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}
