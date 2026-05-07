import { SphereBackground } from "@/components/ui/SphereBackground";
import { FeedbackResult } from "@/lib/api";
import { motivationalMessage, sessionXpGain } from "@/lib/gamification";
import { getJson } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    return () => {
      mounted = false;
    };
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
    const lerp = (a: number, b: number, t: number) =>
      Math.round(a + (b - a) * t);
    // rød(248,113,113) → gul(250,204,20) → grønn(74,222,128)
    const [r, g, b] =
      s < 70
        ? [
            lerp(248, 250, s / 70),
            lerp(113, 204, s / 70),
            lerp(113, 20, s / 70),
          ]
        : [
            lerp(250, 74, (s - 70) / 30),
            lerp(204, 222, (s - 70) / 30),
            lerp(20, 128, (s - 70) / 30),
          ];
    return `rgb(${r},${g},${b})`;
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`}
      edges={["top"]}
    >
      <SphereBackground />
      <ScrollView
        className="flex-1 px-4 pt-1"
        contentContainerClassName="pb-10"
      >
        {/* Header */}
        <View className="h-11 flex-row items-center">
          <Pressable onPress={handleBack} hitSlop={12} className="w-8">
            <Text className="text-primary text-2xl font-extrabold">‹</Text>
          </Pressable>
          <View className="flex-1 items-center">
            <Text
              className={`font-extrabold ${isDark ? "text-text" : "text-[#1C2336]"}`}
            >
              Fremgang
            </Text>
          </View>
          <View className="w-8" />
        </View>
        <Text className="text-text text-2xl font-extrabold text-center">
          Flott arbeid!
        </Text>
        <Text className="text-muted text-center mt-1">
          Her er ditt sesjonsammendrag
        </Text>

        {feedback && (
          <View className="mt-4 bg-card border border-border rounded-xl2 p-4 items-center">
            <Text className="text-2xl">🎉</Text>
            <Text className="text-warning text-3xl font-extrabold mt-1">
              +{sessionXpGain(feedback.total_score)} XP
            </Text>
            <Text className="text-muted text-xs mt-1">Earned this session</Text>
            <Text className="text-text font-semibold text-center mt-3 leading-6">
              {motivationalMessage(feedback.total_score)}
            </Text>
          </View>
        )}

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator />
          </View>
        ) : !feedback ? (
          <View
            className={`bg-card border border-border rounded-2xl p-4 items-center`}
          >
            <Text className="text-muted text-center">
              Ingen tilbakemelding tilgjengelig.
            </Text>
          </View>
        ) : (
          <>
            <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
              <Text className="text-primary font-bold text-center">
                {title}
              </Text>

              {feedback && (
                <View className="mt-3 items-center">
                  <Text className="text-text text-4xl font-extrabold">
                    {feedback.total_score}
                    <Text className="text-muted text-lg"> / 100</Text>
                  </Text>
                  <Text className="text-muted text-xs mt-1">
                    Total poengsum
                  </Text>
                </View>
              )}

              {feedback && feedback.criteria.length > 0 && (
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {feedback.criteria.map((c) => (
                    <View
                      key={c.name}
                      className="flex-1 border border-primary/30 rounded-xl p-3"
                      style={{ minWidth: "28%" }}
                    >
                      <Text className="text-primary text-xl font-extrabold">
                        {c.score}/{c.max_score}
                      </Text>
                      <Text className="text-muted text-xs mt-1 capitalize">
                        {c.name}
                      </Text>
                      {!!c.reason && (
                        <Text className="text-muted text-xs mt-1">
                          {c.reason}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {feedback && feedback.positive_feedback.length > 0 && (
              <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
                <Text className="text-text font-extrabold text-base">
                  What Went Well
                </Text>
                <View className="mt-2 gap-2">
                  {feedback.positive_feedback.map((line, i) => (
                    <View key={i} className="flex-row gap-2">
                      <Text className="text-primary">•</Text>
                      <Text className="text-muted flex-1 leading-6">
                        {line}
                      </Text>
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
                  <Text
                    className={`font-extrabold text-base ${isDark ? "text-text" : "text-[#1C2336]"}`}
                  >
                    Forbedringsmuligheter
                  </Text>
                </View>
                <View className="gap-2">
                  {feedback.negative_feedback.map((line, i) => (
                    <View key={i} className="flex-row gap-2 items-start">
                      <Text
                        className="text-yellow-400 font-bold"
                        style={{ marginTop: 2 }}
                      >
                        →
                      </Text>
                      <Text
                        className={`flex-1 leading-6 text-sm ${isDark ? "text-muted" : "text-[#6B7285]"}`}
                      >
                        {line}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!feedback && (
              <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
                <Text className="text-muted text-center">
                  No feedback available.
                </Text>
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
