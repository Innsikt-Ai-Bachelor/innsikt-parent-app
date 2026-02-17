import { getJson, setJson } from "./storage";

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
  scenarioId: number;
  title: string;
  scenarioDescription: string;
  savedAt: string;
  lastMessagePreview: string;
  turnCount: number;
};

export type ChatMessage = { role: "parent" | "child"; text: string };

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// --- MOCK DATA ---
const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 1,
    emoji: "🌙",
    title: "Bedtime Resistance",
    description: "Your child refuses to go to bed despite it being past bedtime",
    durationMin: "5–10 min",
    difficulty: "Moderate",
  },
  {
    id: 2,
    emoji: "📚",
    title: "Homework Frustration",
    description: "Your child is struggling with homework and getting upset",
    durationMin: "10–15 min",
    difficulty: "Challenging",
  },
  {
    id: 3,
    emoji: "🧸",
    title: "Sharing Conflict",
    description: "Your child does not want to share their toys with a sibling",
    durationMin: "5–8 min",
    difficulty: "Easy",
  },
  {
    id: 4,
    emoji: "⏰",
    title: "Morning Rush",
    description: "Your child is moving slowly and you need to leave soon",
    durationMin: "8–12 min",
    difficulty: "Moderate",
  },
];

// --- API (MOCK IMPLEMENTASJON) ---
export const api = {
  async authenticate(email: string, _password: string): Promise<User> {
    // UI-only: “godta alt”
    const user: User = { id: 1, email, name: "Parent" };
    await setJson("user", user);
    return user;
  },

  async getScenarios(): Promise<Scenario[]> {
    return MOCK_SCENARIOS;
  },

  newSessionId(): string {
    return uuid();
  },

  async saveConversation(sessionId: string, messages: ChatMessage[]) {
    await setJson(`conversation:${sessionId}`, messages);
  },

  async getConversation(sessionId: string): Promise<ChatMessage[]> {
    return (await getJson<ChatMessage[]>(`conversation:${sessionId}`)) ?? [];
  },

  async upsertSessionSummary(summary: SessionSummary) {
    const sessions = (await getJson<SessionSummary[]>("sessions")) ?? [];
    const next = [summary, ...sessions.filter((s) => s.sessionId !== summary.sessionId)];
    await setJson("sessions", next);
  },

  async getSessions(): Promise<SessionSummary[]> {
    return (await getJson<SessionSummary[]>("sessions")) ?? [];
  },

  async deleteSession(sessionId: string) {
    const sessions = (await getJson<SessionSummary[]>("sessions")) ?? [];
    await setJson("sessions", sessions.filter((s) => s.sessionId !== sessionId));
    // conversation:<id> kan også slettes hvis du vil (valgfritt)
  },

  async generateFeedback(sessionId: string): Promise<string> {
    const convo = await this.getConversation(sessionId);
    const turns = convo.length;

    // enkel, deterministisk “feedback”
    return [
      `Great work! Here's your session summary.`,
      ``,
      `Turns: ${turns}`,
      `Strengths: You stayed engaged and kept the conversation moving.`,
      `Growth: Try more validation before giving instructions.`,
      ``,
      `Example: "I see you're upset. Do you want a hug, or do you want to talk?"`,
    ].join("\n");
  },
};
