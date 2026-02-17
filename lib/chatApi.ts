/**import type { ChatApiMessage } from "@/interfaces/types";
import { Platform } from "react-native";

/**
 * BASE_URL for HTTPS 7143:
 * - Expo Web / iOS Simulator på samme maskin: https://localhost:7143
 * - Android Emulator: https://10.0.2.2:7143  (⚠️ emulatoren stoler normalt IKKE på dev-sertifikat)
 *   -> test helst i web/iOS-simulator når du bruker HTTPS dev-sertifikat.
 */
/**const isAndroid = Platform.OS === "android";
const isWeb = Platform.OS === "web";

export const BASE_URL = "https://innsikt-backend.fly.dev";
export async function sendChat(
  userId: number,
  scenarioId: number,
  sessionId: string,
  messages: ChatApiMessage[]
) {
  const payload = {userId, scenarioId, sessionId, messages };
  console.log("BASE_URL =", BASE_URL, "POST", `${BASE_URL}/api/chat`);
  console.log("Trying to send to api:", JSON.stringify(payload));

  console.log("REQUEST URL =", `${BASE_URL}/api/chat`);
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${txt}`);
  }

  return (await response.json()) as any;
}
export async function postFeedback(sessionId: string) {
  const payload = { sessionId }; // Rubric er valgfri i backend – default brukes
  const res = await fetch(`${BASE_URL}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return (await res.json()) as { content: string; model: string };
}

export async function deleteConversationBySession(sessionId: string) {
  const res = await fetch(`${BASE_URL}/api/conversations/${sessionId}`, {
    method: 'DELETE',
  });
  if (!(res.ok || res.status === 204)) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Delete failed (${res.status}): ${txt}`);
  }
}

export async function authenticateUser(email: string, password: string) {
  const payload = { email, password };
  console.log("Authenticating user:", email);

  const response = await fetch(`${BASE_URL}/api/users/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${txt}`);
  }

  return (await response.json()) as any;
}

export async function getScenarios() {
  console.log("Fetching scenarios from API");
  const response = await fetch(`${BASE_URL}/api/Scenarios`, { method: "GET" });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${txt}`);
  }
  return (await response.json()) as any;
}

export async function getScenarioById(scenarioId: number) {
  console.log("Fetching scenario by ID from API:", scenarioId);
  const response = await fetch(
    `${BASE_URL}/api/Scenarios/${scenarioId}`,
    { method: "GET" }
  );

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${txt}`);
  }
  return (await response.json()) as any;
}
