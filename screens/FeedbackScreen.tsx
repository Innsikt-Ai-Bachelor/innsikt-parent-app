import { SphereBackground } from "@/components/ui/SphereBackground";
import { api } from "@/lib/api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedbackScreen() {
  const params = useLocalSearchParams<{ title?: string; sessionId?: string }>();
  const sessionId = params?.sessionId ? String(params.sessionId) : "";
  const title = params?.title ? String(params.title) : "Session";

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result = await api.generateFeedback(sessionId);
        if (mounted) setFeedback(result);
      } catch (error) {
        if (mounted) setFeedback("Could not generate feedback.");
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

  const score = useMemo(() => {
    const seed = sessionId.length || 8;
    return {
      empathy: Math.min(10, 6 + (seed % 4)),
      boundaries: Math.min(10, 6 + ((seed + 1) % 4)),
      consistency: Math.min(10, 6 + ((seed + 2) % 4)),
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

        <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
          <Text className="text-primary font-bold text-center">{title}</Text>
          <View className="mt-4 flex-row gap-2">
            <View className="flex-1 border border-emerald-300/40 rounded-xl p-3">
              <Text className="text-emerald-300 text-2xl font-extrabold">{score.empathy}/10</Text>
              <Text className="text-muted text-xs mt-1">Empathy</Text>
            </View>
            <View className="flex-1 border border-indigo-300/40 rounded-xl p-3">
              <Text className="text-indigo-300 text-2xl font-extrabold">
                {score.boundaries}/10
              </Text>
              <Text className="text-muted text-xs mt-1">Boundaries</Text>
            </View>
            <View className="flex-1 border border-amber-300/40 rounded-xl p-3">
              <Text className="text-amber-300 text-2xl font-extrabold">
                {score.consistency}/10
              </Text>
              <Text className="text-muted text-xs mt-1">Consistency</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 bg-card border border-border rounded-xl2 p-4">
          <Text className="text-text font-extrabold text-base">What Went Well</Text>
          {loading ? (
            <View className="py-6 items-center">
              <ActivityIndicator />
            </View>
          ) : (
            <Text className="text-muted mt-2 leading-6">{feedback}</Text>
          )}
        </View>

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
