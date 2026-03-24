import Constants from "expo-constants";
import { router } from "expo-router";
import { Platform } from "react-native";
import { getJson, removeKeys, setJson } from "./storage";

export type User = {
  id: number;
  email: string;
  name: string;
  username?: string;
};

export type UpdateUserProfilePayload = {
  username: string;
  fullName: string;
  email: string;
  password?: string;
};

export type Scenario = {
  id: number;
  title: string;
  description: string;
  detailedDescription?: string;
  durationMin: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  emoji?: string;
};

export type SessionSummary = {
  sessionId: string;
  scenarioId?: number;
  title: string;
  scenarioDescription?: string;
  savedAt: string;
  lastMessagePreview: string;
  turnCount: number;
};

export type ChatMessage = { role: "parent" | "child"; text: string };

export type FeedbackResult = {
  session_id: string;
  total_score: number;
  criteria: {
    name: string;
    score: number;
    max_score: number;
    reason: string;
  }[];
  positive_feedback: string[];
  negative_feedback: string[];
};

function resolveBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest
      ?.debuggerHost;
  const host = hostUri?.split(":")[0];
  if (host) {
    return `http://${host}:8000`;
  }

  return Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://localhost:8000";
}

const BASE_URL = resolveBaseUrl();

const REQUEST_TIMEOUT_MS = 25000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `Request timed out after ${Math.round(timeoutMs / 1000)}s. ` +
          `Kontroller at backend kjører og at mobilen når ${BASE_URL}.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function getToken(): Promise<string | null> {
  return getJson<string>("access_token");
}

async function saveToken(token: string): Promise<void> {
  await setJson("access_token", token);
}

async function clearToken(): Promise<void> {
  await removeKeys(["access_token", "user"]);
}

async function forceLogoutToLogin(): Promise<void> {
  await clearToken();
  try {
    router.replace("/login");
  } catch {
    // Ignore navigation failures (e.g., router not ready yet).
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Økten er utløpt. Vennligst logg inn igjen.");
    this.name = "UnauthorizedError";
  }
}

function isUnauthorizedStatus(status: number): boolean {
  return status === 401 || status === 403;
}

async function handleUnauthorizedResponse(res: Response): Promise<void> {
  if (!isUnauthorizedStatus(res.status)) return;
  await forceLogoutToLogin();
  throw new UnauthorizedError();
}

async function authHeaders(): Promise<{ Authorization: string }> {
  const token = await getToken();
  if (!token) {
    await forceLogoutToLogin();
    throw new Error("Not authenticated");
  }
  return { Authorization: `Bearer ${token}` };
}

function mapApiUser(data: unknown, fallback: Partial<User> = {}): User {
  const value = (data ?? {}) as Record<string, unknown>;
  return {
    id: typeof value.id === "number" ? value.id : (fallback.id ?? 0),
    username:
      typeof value.username === "string" ? value.username : fallback.username,
    name:
      typeof value.full_name === "string"
        ? value.full_name
        : typeof value.name === "string"
          ? value.name
          : (fallback.name ?? ""),
    email:
      typeof value.email === "string" ? value.email : (fallback.email ?? ""),
  };
}

function normalizeDetailedDescription(value: unknown): string | undefined {
  if (typeof value === "string") {
    const text = value.trim();
    return text || undefined;
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const candidateKeys = ["text", "description", "detail", "content"];
  for (const key of candidateKeys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  const joined = Object.values(record)
    .filter(
      (entry): entry is string => typeof entry === "string" && !!entry.trim(),
    )
    .join("\n\n")
    .trim();

  return joined || undefined;
}

export const api = {
  async authenticate(username: string, password: string): Promise<User> {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      throw new Error("Fyll inn brukernavn og passord.");
    }

    const res = await fetchWithTimeout(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: trimmedUsername,
        password: trimmedPassword,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      let message = "Feil brukernavn eller passord.";

      if (res.status >= 500) {
        message =
          "Innlogging feilet på grunn av en serverfeil. Prøv igjen senere.";
      } else if (res.status === 429) {
        message = "For mange innloggingsforsøk. Vent litt før du prøver igjen.";
      } else if (res.status !== 400 && res.status !== 401) {
        // Unexpected 4xx (e.g. 403, 404) – default covers 400/401 (wrong credentials)
        message = "Innlogging feilet. Vennligst prøv igjen.";
      }

      if (txt) {
        console.warn("Login request failed:", res.status, txt);
      }

      throw new Error(message);
    }

    const data = await res.json().catch(() => ({}));
    if (!data?.access_token || typeof data.access_token !== "string") {
      throw new Error("Innlogging feilet: mangler access token fra backend.");
    }

    await saveToken(data.access_token);
    const user = mapApiUser(data.user ?? data, {
      id: 0,
      username: trimmedUsername,
      name: trimmedUsername,
      email: trimmedUsername,
    });
    await setJson("user", user);
    return user;
  },

  async register(
    username: string,
    password: string,
    email: string,
  ): Promise<void> {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedPassword || !trimmedEmail) {
      throw new Error("Fyll inn brukernavn, passord og e-post.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error("Ugyldig e-postadresse.");
    }

    const res = await fetchWithTimeout(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: trimmedUsername,
        password: trimmedPassword,
        email: trimmedEmail,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Registrering feilet.");
    }
  },

  async getCurrentUser(): Promise<User | null> {
    return getJson<User>("user");
  },

  async updateUserProfile(payload: UpdateUserProfilePayload): Promise<User> {
    const headers = await authHeaders();
    const res = await fetch(
      `${BASE_URL}/users/${encodeURIComponent(payload.username)}`,
      {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          full_name: payload.fullName,
          ...(payload.password ? { password: payload.password } : {}),
        }),
      },
    );

    await handleUnauthorizedResponse(res);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Failed to update profile (${res.status}): ${txt}`);
    }

    const data = await res.json().catch(() => ({}));
    const user = mapApiUser(data, {
      id: 0,
      username: payload.username,
      name: payload.fullName,
      email: payload.email,
    });
    await setJson("user", user);
    return user;
  },

  async getScenarios(): Promise<Scenario[]> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/scenarios/`, { headers });

    await handleUnauthorizedResponse(res);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Failed to fetch scenarios (${res.status}): ${txt}`);
    }
    const data = (await res.json()) as Array<
      Scenario & {
        "detailed-description"?: unknown;
        detailed_description?: unknown;
        detailedDescription?: unknown;
      }
    >;

    return data.map((scenario) => ({
      ...scenario,
      detailedDescription: normalizeDetailedDescription(
        scenario.detailedDescription ??
          scenario["detailed-description"] ??
          scenario.detailed_description,
      ),
    }));
  },

  async newSessionId(scenarioId: number, title: string): Promise<string> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/chat/session`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: scenarioId, title }),
    });

    await handleUnauthorizedResponse(res);

    if (!res.ok) throw new Error("Failed to start session");
    const data = await res.json();
    return data.session_id;
  },

  async sendMessage(sessionId: string, message: string): Promise<string> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/chat/message`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
    });

    await handleUnauthorizedResponse(res);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.log("chat/message status", res.status);
      console.log("chat/message body", txt);
      throw new Error(`Failed to send message (${res.status}): ${txt}`);
    }

    const data = await res.json();
    return data.assistant_message;
  },

  async generateFeedback(sessionId: string): Promise<FeedbackResult> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/chat/finish`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });

    await handleUnauthorizedResponse(res);

    if (!res.ok) throw new Error("Failed to finish session");
    const data: FeedbackResult = await res.json();
    await setJson(`feedback:${sessionId}`, data);
    return data;
  },

  async getSessions(): Promise<SessionSummary[]> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/chat/sessions`, { headers });

    await handleUnauthorizedResponse(res);

    if (!res.ok) throw new Error("Failed to fetch sessions");
    const data = await res.json();
    return data.map(
      (s: {
        session_id: string;
        scenario_id?: number;
        title: string;
        saved_at: string;
        last_message_preview: string;
        turn_count: number;
      }) => ({
        sessionId: s.session_id,
        scenarioId: s.scenario_id,
        title: s.title,
        savedAt: s.saved_at,
        lastMessagePreview: s.last_message_preview,
        turnCount: s.turn_count,
      }),
    );
  },

  async deleteSession(_sessionId: string) {
    // No backend endpoint available – no-op for now
  },

  async logout() {
    await clearToken();
  },
};
