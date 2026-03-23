import { Platform } from "react-native";
import { getJson, removeKeys, setJson } from "./storage";

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
  savedAt: string;
  totalScore?: number;
};

export type SessionDetail = {
  sessionId: string;
  scenarioId?: number;
  title: string;
  savedAt: string;
  messages: { role: string; content: string }[];
  feedback?: FeedbackResult;
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

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://localhost:8000");

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

  async register(
    username: string,
    password: string,
    email: string,
  ): Promise<void> {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });
    if (!res.ok) throw new Error("Registration failed");
  },

  async getScenarios(): Promise<Scenario[]> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/scenarios/`, { headers });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Failed to fetch scenarios (${res.status}): ${txt}`);
    }
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
    return data.map(
      (s: {
        session_id: string;
        scenario_id?: number;
        title: string;
        created_at: string;
        total_score?: number;
      }) => ({
        sessionId: s.session_id,
        scenarioId: s.scenario_id,
        title: s.title,
        savedAt: s.created_at,
        totalScore: s.total_score,
      }),
    );
  },

  async getSessionDetail(sessionId: string): Promise<SessionDetail> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/chat/session/${sessionId}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch session detail");
    const s = await res.json();
    return {
      sessionId: s.session_id,
      scenarioId: s.scenario_id,
      title: s.title,
      savedAt: s.created_at,
      messages: s.messages,
      feedback: s.feedback,
    };
  },

  async deleteSession(_sessionId: string) {
    // No backend endpoint available – no-op for now
  },

  async logout() {
    await clearToken();
  },
};
