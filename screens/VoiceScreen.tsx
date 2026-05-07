import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Canvas, useFrame, useThree } from "@react-three/fiber/native";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

import { SphereBackground } from "@/components/ui/SphereBackground";
import { api } from "@/lib/api";
import { speakText } from "@/lib/tts";
import { transcribeAudio } from "@/lib/stt";

// Suppress noisy expo-gl warnings that flood the console
const _origLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("pixelStorei")) return;
  _origLog(...args);
};

type VoiceState = "IDLE" | "LISTENING" | "THINKING" | "SPEAKING";

const STATUS_LABELS: Record<VoiceState, string> = {
  IDLE: "Trykk for å snakke",
  LISTENING: "Lytter...",
  THINKING: "Tenker...",
  SPEAKING: "",
};

// ─── 3D Avatar ────────────────────────────────────────────────────────────────

async function loadScene(): Promise<THREE.Group> {
  // Step 1: get a real file:// URI from the bundled asset
  const asset = Asset.fromModule(require("../assets/models/girl-model-1.glb"));
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  console.log("[Avatar] localUri:", uri);
  if (!uri) throw new Error("No localUri after downloadAsync");

  // Step 2: read as base64 via expo-file-system (reliable on iOS, unlike XHR)
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64" as any,
  });
  console.log("[Avatar] base64 length:", base64.length);

  // Step 3: decode base64 → ArrayBuffer
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const buffer = bytes.buffer;
  console.log("[Avatar] buffer byteLength:", buffer.byteLength);

  // Step 4: parse GLB
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(
      buffer,
      "",
      (gltf) => {
        console.log("[Avatar] parsed OK, scene children:", gltf.scene.children.length);
        resolve(gltf.scene);
      },
      (err) => { console.error("[Avatar] parse error:", err); reject(err); },
    );
  });
}

function AvatarModel({ scene, voiceState }: { scene: THREE.Group; voiceState: VoiceState }) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  const { s, baseY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0.001 ? 3 / maxDim : 1;
    const baseY = -center.y * s - 1.2;
    return { s, baseY };
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    t.current += delta;
    switch (voiceState) {
      case "IDLE":
        groupRef.current.position.y = baseY + Math.sin(t.current * 0.8) * 0.03;
        groupRef.current.rotation.y = 0;
        break;
      case "LISTENING":
        groupRef.current.position.y = baseY + Math.sin(t.current * 2.5) * 0.02;
        break;
      case "THINKING":
        groupRef.current.rotation.y = Math.sin(t.current * 1.2) * 0.1;
        groupRef.current.position.y = baseY + Math.sin(t.current * 0.8) * 0.02;
        break;
      case "SPEAKING":
        groupRef.current.position.y = baseY + Math.sin(t.current * 9) * 0.02;
        break;
    }
  });

  return (
    <group ref={groupRef} scale={[s, s, s]} position={[0, baseY, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function CameraLookAt({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);
  return null;
}

function AvatarCanvas({ voiceState }: { voiceState: VoiceState }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    loadScene().then(setScene).catch(console.error);
  }, []);

  return (
    <Canvas style={{ flex: 1 }} camera={{ position: [0, 0.1, 1.9], fov: 30 }}>
      <CameraLookAt target={[0, 0.1, 0]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 4, 5]} intensity={1} />
      <directionalLight position={[-2, 2, -2]} intensity={0.3} />
      {scene ? (
        <AvatarModel scene={scene} voiceState={voiceState} />
      ) : (
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#6D7CFF" />
        </mesh>
      )}
    </Canvas>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VoiceScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  const params = useLocalSearchParams<{
    scenarioId?: string;
    title?: string;
    description?: string;
  }>();
  const scenarioTitle = params.title ? String(params.title) : "Practice";
  const scenarioDescription = params.description ? String(params.description) : "";
  const scenarioId = params.scenarioId ? Number(params.scenarioId) : 1;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [isEnding, setIsEnding] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    api.newSessionId(scenarioId, scenarioTitle).then(setSessionId).catch(console.error);
  }, [scenarioId, scenarioTitle]);

  const handleMicPress = async () => {
    if (voiceState === "IDLE") await startRecording();
    else if (voiceState === "LISTENING") await stopRecordingAndProcess();
  };

  const startRecording = async () => {
    if (!sessionId) return;
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    recordingRef.current = recording;
    setVoiceState("LISTENING");
  };

  const stopRecordingAndProcess = async () => {
    if (!recordingRef.current) return;
    if (!sessionId) {
      await recordingRef.current.stopAndUnloadAsync().catch(() => {});
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      recordingRef.current = null;
      setVoiceState("IDLE");
      return;
    }
    setVoiceState("THINKING");
    await recordingRef.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    if (!uri) { setVoiceState("IDLE"); return; }
    try {
      const text = await transcribeAudio(uri);
      const reply = await api.sendMessage(sessionId, text);
      setVoiceState("SPEAKING");
      await speakText(reply);
    } catch (err) {
      console.error("Voice pipeline error:", err);
    } finally {
      setVoiceState("IDLE");
    }
  };

  const endSession = async () => {
    if (!sessionId || isEnding) return;
    setIsEnding(true);
    try {
      await api.generateFeedback(sessionId);
      router.push({ pathname: "/feedback", params: { title: scenarioTitle, sessionId } });
    } catch (error) {
      console.error(error);
      setIsEnding(false);
    }
  };

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const micEnabled = voiceState === "IDLE" || voiceState === "LISTENING";

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`} edges={["top", "bottom"]}>
      <SphereBackground />

      <View className="px-4 pt-1 pb-2 flex-row items-center">
        <Pressable onPress={handleBack} hitSlop={12} className="w-8">
          <Text className="text-2xl font-extrabold" style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}>
            ‹
          </Text>
        </Pressable>
        <View className="flex-1 items-center px-4">
          <Text className="font-extrabold" numberOfLines={1} style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
            {scenarioTitle}
          </Text>
          <Text className="text-xs font-semibold" numberOfLines={1} style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
            {scenarioDescription}
          </Text>
        </View>
        <View className="w-8" />
      </View>

      <View className="flex-1">
        <AvatarCanvas voiceState={voiceState} />
      </View>

      <View className="pb-10 px-6 items-center gap-4" style={{ zIndex: 10 }}>
        <Text className="text-sm font-semibold" style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
          {STATUS_LABELS[voiceState]}
        </Text>

        <Pressable
          onPress={handleMicPress}
          disabled={!micEnabled}
          style={{
            width: 72, height: 72, borderRadius: 36,
            alignItems: "center", justifyContent: "center",
            backgroundColor:
              voiceState === "LISTENING" ? "#FF4B4B"
              : micEnabled ? (isDark ? "#6D7CFF" : "#4F5FE8")
              : (isDark ? "#2A3450" : "#D0D5EE"),
          }}
        >
          <Ionicons name={voiceState === "LISTENING" ? "stop" : "mic"} size={32} color="white" />
        </Pressable>

        <Pressable onPress={endSession} disabled={isEnding} className="mt-2">
          <Text className="font-extrabold text-xs" style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}>
            {isEnding ? "Genererer tilbakemelding…" : "Avslutt og se tilbakemelding"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
