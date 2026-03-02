import { getJson, setJson, removeKeys } from "./storage";

export type User = { id: number; email: string; name: string };

export type Scenario = {
  id: number;
  title: string;
  description: string;
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
  criteria: { name: string; score: number; max_score: number; reason: string }[];
  feedback: string[];
};

const BASE_URL = "http://10.47.37.38:8000";

async function getToken(): Promise<string | null> {
  return getJson<string>("access_token");
}

async function saveToken(token: string): Promise<void> {
  await setJson("access_token", token);
}

async function clearToken(): Promise<void> {
  await removeKeys(["access_token", "user"]);
}

async function authHeaders(): Promise<{ Authorization: string }> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  async authenticate(username: string, password: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    await saveToken(data.access_token);
    const user: User = { id: 0, email: username, name: username };
    await setJson("user", user);
    return user;
  },

  async register(username: string, password: string, email: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });
    if (!res.ok) throw new Error("Registration failed");
  },

  async getScenarios(): Promise<Scenario[]> {
    const res = await fetch(`${BASE_URL}/scenarios`);
    if (!res.ok) throw new Error("Failed to fetch scenarios");
    return res.json();
  },

  async newSessionId(scenarioId: number, title: string): Promise<string> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/chat/session`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: scenarioId, title }),
    });
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
    if (!res.ok) throw new Error("Failed to send message");
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
    if (!res.ok) throw new Error("Failed to finish session");
    const data: FeedbackResult = await res.json();
    await setJson(`feedback:${sessionId}`, data);
    return data;
  },

  async getSessions(): Promise<SessionSummary[]> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/chat/sessions`, { headers });
    if (!res.ok) throw new Error("Failed to fetch sessions");
    const data = await res.json();
    return data.map((s: {
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
    }));
  },

  async deleteSession(_sessionId: string) {
    // No backend endpoint available – no-op for now
  },

  async logout() {
    await clearToken();
  },
};
