import { SphereBackground } from "@/components/ui/SphereBackground";
import { FeedbackResult } from "@/lib/api";
import { getJson } from "@/lib/storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function FeedbackScreen() {
  const params = useLocalSearchParams<{ title?: string; sessionId?: string }>();
  const sessionId = params?.sessionId ? String(params.sessionId) : "";
  const title = params?.title ? String(params.title) : "Session";
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await getJson<FeedbackResult>(`feedback:${sessionId}`);
        if (mounted) setFeedback(result);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [sessionId]);

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const scoreColor = (score: number) => {
    const s = Math.max(0, Math.min(100, score));
    const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
    // rød(248,113,113) → gul(250,204,20) → grønn(74,222,128)
    const [r, g, b] = s < 70
      ? [lerp(248, 250, s / 70), lerp(113, 204, s / 70), lerp(113, 20, s / 70)]
      : [lerp(250, 74, (s - 70) / 30), lerp(204, 222, (s - 70) / 30), lerp(20, 128, (s - 70) / 30)];
    return `rgb(${r},${g},${b})`;
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`} edges={["top"]}>
      <SphereBackground />
      <ScrollView className="flex-1 px-4 pt-1" contentContainerClassName="pb-10">

        {/* Header */}
        <View className="h-11 flex-row items-center">
          <Pressable onPress={handleBack} hitSlop={12} className="w-8">
            <Text className="text-primary text-2xl font-extrabold">‹</Text>
          </Pressable>
          <View className="flex-1 items-center">
            <Text className={`font-extrabold ${isDark ? "text-text" : "text-[#1C2336]"}`}>Fremgang</Text>
          </View>
          <View className="w-8" />
        </View>

        {/* Title */}
        <View className="items-center mt-2 mb-6">
          <View className="w-14 h-14 rounded-2xl bg-primary/20 items-center justify-center mb-3">
            <Ionicons name="trending-up" size={28} color={isDark ? "#6D7CFF" : "#4F5FE8"} />
          </View>
          <Text className={`text-2xl font-extrabold ${isDark ? "text-text" : "text-[#1C2336]"}`}>Bra jobbet!</Text>
          <Text className={`text-sm mt-1 ${isDark ? "text-muted" : "text-[#6B7285]"}`}>Her er oppsummeringen din</Text>
        </View>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator />
          </View>
        ) : !feedback ? (
          <View className={`bg-card border border-border rounded-2xl p-4 items-center`}>
            <Text className="text-muted text-center">Ingen tilbakemelding tilgjengelig.</Text>
          </View>
        ) : (
          <>
            {/* Total score */}
            <View className={`bg-card border border-border rounded-2xl p-4 items-center mb-4`}>
              <Text className={`font-bold text-sm mb-1 ${isDark ? "text-muted" : "text-[#6B7285]"}`}>{title}</Text>
              <Text style={{ color: scoreColor(feedback.total_score) }} className="text-5xl font-extrabold">
                {feedback.total_score}
                <Text className="text-muted text-xl"> / 100</Text>
              </Text>
              <Text className={`text-xs mt-1 ${isDark ? "text-muted" : "text-[#6B7285]"}`}>Totalpoeng</Text>
            </View>

            {/* Criteria */}
            {feedback.criteria.length > 0 && (
              <View className="flex-row flex-wrap gap-3 mb-4">
                {feedback.criteria.map((c) => (
                  <View
                    key={c.name}
                    className="bg-card border border-border rounded-2xl p-3"
                    style={{ minWidth: "44%", flex: 1 }}
                  >
                    <Text style={{ color: scoreColor(c.score) }} className="text-2xl font-extrabold">
                      {c.score}
                      <Text className="text-muted text-sm"> / {c.max_score}</Text>
                    </Text>
                    <Text className={`text-sm font-bold mt-1 capitalize ${isDark ? "text-text" : "text-[#1C2336]"}`}>{c.name}</Text>
                    {!!c.reason && (
                      <Text className={`text-xs mt-1 leading-5 ${isDark ? "text-muted" : "text-[#6B7285]"}`}>{c.reason}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* What went well */}
            {feedback.positive_feedback.length > 0 && (
              <View className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-xl bg-green-500/20 items-center justify-center">
                    <Ionicons name="checkmark-circle" size={18} color="#4ADE80" />
                  </View>
                  <Text className={`font-extrabold text-base ${isDark ? "text-text" : "text-[#1C2336]"}`}>Hva gikk bra</Text>
                </View>
                <View className="gap-2">
                  {feedback.positive_feedback.map((line, i) => (
                    <View key={i} className="flex-row gap-2 items-start">
                      <Ionicons name="checkmark" size={16} color="#4ADE80" style={{ marginTop: 3 }} />
                      <Text className={`flex-1 leading-6 text-sm ${isDark ? "text-muted" : "text-[#6B7285]"}`}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* What to improve */}
            {feedback.negative_feedback.length > 0 && (
              <View className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-xl bg-yellow-500/20 items-center justify-center">
                    <Ionicons name="time" size={18} color="#FACC15" />
                  </View>
                  <Text className={`font-extrabold text-base ${isDark ? "text-text" : "text-[#1C2336]"}`}>Forbedringsmuligheter</Text>
                </View>
                <View className="gap-2">
                  {feedback.negative_feedback.map((line, i) => (
                    <View key={i} className="flex-row gap-2 items-start">
                      <Text className="text-yellow-400 font-bold" style={{ marginTop: 2 }}>→</Text>
                      <Text className={`flex-1 leading-6 text-sm ${isDark ? "text-muted" : "text-[#6B7285]"}`}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <Pressable
          className="mt-2 bg-primary rounded-2xl py-3 items-center"
          onPress={() => router.replace("/(tabs)/history")}
        >
          <Text className="text-white font-extrabold">Se historikk</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
