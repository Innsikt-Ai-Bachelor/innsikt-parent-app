import * as FileSystem from "expo-file-system/legacy";
import { Audio } from "expo-av";
import { Platform } from "react-native";
import Constants from "expo-constants";

function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  if (Platform.OS === "android") return "http://10.0.2.2:8000";
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) return `http://${host}:8000`;
  return "http://localhost:8000";
}

const BASE_URL = getBaseUrl();

export async function speakText(text: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const res = await fetch(`${BASE_URL}/tts/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TTS failed (${res.status}): ${body}`);
  }

  if (Platform.OS === "web") {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new window.Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
    return;
  }

  // Native: convert arraybuffer → base64 → temp file → expo-av
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const tmpUri = FileSystem.cacheDirectory + `tts-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(tmpUri, base64, {
    encoding: "base64",
  });

  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  const { sound } = await Audio.Sound.createAsync({ uri: tmpUri });

  await new Promise<void>((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        resolve();
      }
    });
    sound.playAsync();
  });
}
