export const SESSION_COOKIE = "taskflow_session";
export const SESSION_QUERY_KEY = ["auth-session"] as const;

export type UserSession = {
  id: number;
  username: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionResponse = {
  user: UserSession | null;
};

export function isUserSession(value: unknown): value is UserSession {
  if (typeof value !== "object" || value === null) return false;

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.username === "string" &&
    typeof user.name === "string" &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string"
  );
}
