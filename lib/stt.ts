import { Platform } from "react-native";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000");

export async function transcribeAudio(uri: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "audio/m4a",
    name: "recording.m4a",
  } as unknown as Blob);

  const res = await fetch(`${BASE_URL}/stt/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`STT failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.text as string;
}
