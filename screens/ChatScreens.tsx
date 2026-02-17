import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatBubble } from "@/components/ui/ChatBubble";
import { SphereBackground } from "@/components/ui/SphereBackground";
import { api } from "@/lib/api";
import { generateChildReply } from "@/lib/chatAgentMock";

type ChatMessage = { id: string; role: "parent" | "child"; text: string };

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    scenarioId?: string;
    title?: string;
    description?: string;
  }>();
  const scenarioTitle = params.title ? String(params.title) : "Practice";
  const scenarioDescription = params.description ? String(params.description) : "";
  const scenarioId = params.scenarioId ? Number(params.scenarioId) : 1;
  const sessionId = useMemo(() => api.newSessionId(), []);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m0", role: "child", text: "I don't want to go to bed!" },
  ]);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    setInput("");

    const parentMsg: ChatMessage = { id: `p-${Date.now()}`, role: "parent", text };
    setMessages((prev) => [...prev, parentMsg]);
    setIsThinking(true);

    const reply = await generateChildReply({
      scenarioTitle,
      scenarioDescription,
      parentMessage: text,
    });

    const childMsg: ChatMessage = { id: `c-${Date.now()}`, role: "child", text: reply };
    setMessages((prev) => [...prev, childMsg]);
    setIsThinking(false);

    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const endSession = async () => {
    // lagre conversation
    const convo = messages.map((m) => ({ role: m.role, text: m.text }));
    await api.saveConversation(sessionId, convo);

    // lagre session summary for History-tab
    const last = messages[messages.length - 1]?.text ?? "";
    await api.upsertSessionSummary({
      sessionId,
      scenarioId,
      title: scenarioTitle,
      scenarioDescription,
      savedAt: new Date().toISOString(),
      lastMessagePreview: last.slice(0, 80),
      turnCount: messages.length,
    });

    router.push({
      pathname: "/feedback",
      params: { title: scenarioTitle, sessionId },
    });
  };

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <SphereBackground />
        <View className="px-4 pt-1 pb-2 flex-row items-center">
          <Pressable onPress={handleBack} hitSlop={12} className="w-8">
            <Text className="text-primary text-2xl font-extrabold">‹</Text>
          </Pressable>

          <View className="flex-1 items-center px-4">
            <Text className="text-text font-extrabold" numberOfLines={1}>
              {scenarioTitle}
            </Text>
            <Text className="text-muted text-xs font-semibold" numberOfLines={1}>
              {scenarioDescription}
            </Text>
          </View>

          <View className="w-8" />
        </View>

        <View className="px-4 pb-2">
          <View className="h-2 rounded-full bg-white/10 overflow-hidden border border-border">
            <View className="h-full w-2/5 bg-primary rounded-full" />
          </View>
          <Text className="text-muted text-xs font-bold mt-1">Conversation Mood</Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerClassName="px-4 pb-3"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <ChatBubble role={item.role} text={item.text} />}
        />

        <View className="p-4 pt-2">
          <View className="bg-card border border-border rounded-xl2 p-3">
            <View className="flex-row items-end gap-2">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type your response…"
                placeholderTextColor="#9AA6C0"
                className="flex-1 text-text font-semibold min-h-[36px]"
                multiline
              />
              <Pressable
                onPress={send}
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  input.trim() ? "bg-primary" : "bg-primarySoft"
                }`}
              >
                <Text className="text-white font-extrabold">➤</Text>
              </Pressable>
            </View>

            <Pressable onPress={endSession} className="mt-3 items-center">
              <Text className="text-primary font-extrabold text-xs">
                End Session & View Feedback
              </Text>
            </Pressable>

            {isThinking ? (
              <Text className="text-muted text-xs mt-2">Child is responding…</Text>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
