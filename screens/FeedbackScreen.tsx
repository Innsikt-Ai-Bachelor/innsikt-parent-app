import { SphereBackground } from "@/components/ui/SphereBackground";
import { FeedbackResult } from "@/lib/api";
import { getJson } from "@/lib/storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedbackScreen() {
  const params = useLocalSearchParams<{ title?: string; sessionId?: string }>();
  const sessionId = params?.sessionId ? String(params.sessionId) : "";
  const title = params?.title ? String(params.title) : "Session";

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

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <SphereBackground />
      <ScrollView className="flex-1 px-4 pt-1" contentContainerClassName="pb-8">
        <View className="h-11 flex-row items-center">
          <Pressable onPress={handleBack} hitSlop={12} className="w-8">
            <Text className="text-primary text-2xl font-extrabold">‹</Text>
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-text font-extrabold">Progress</Text>
          </View>
          <View className="w-8" />
        </View>
        <Text className="text-text text-2xl font-extrabold text-center">Great Work!</Text>
        <Text className="text-muted text-center mt-1">Here&apos;s your session summary</Text>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
              <Text className="text-primary font-bold text-center">{title}</Text>

              {feedback && (
                <View className="mt-3 items-center">
                  <Text className="text-text text-4xl font-extrabold">
                    {feedback.total_score}
                    <Text className="text-muted text-lg"> / 100</Text>
                  </Text>
                  <Text className="text-muted text-xs mt-1">Total Score</Text>
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
                      <Text className="text-muted text-xs mt-1 capitalize">{c.name}</Text>
                      {!!c.reason && (
                        <Text className="text-muted text-xs mt-1">{c.reason}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {feedback && feedback.feedback.length > 0 && (
              <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
                <Text className="text-text font-extrabold text-base">What Went Well</Text>
                <View className="mt-2 gap-2">
                  {feedback.feedback.map((line, i) => (
                    <View key={i} className="flex-row gap-2">
                      <Text className="text-primary">•</Text>
                      <Text className="text-muted flex-1 leading-6">{line}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {!feedback && (
              <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
                <Text className="text-muted text-center">No feedback available.</Text>
              </View>
            )}
          </>
        )}

        <Pressable
          className="mt-5 bg-primary rounded-xl py-3 items-center"
          onPress={() => router.replace("/(tabs)/history")}
        >
          <Text className="text-white font-extrabold">Open History</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
