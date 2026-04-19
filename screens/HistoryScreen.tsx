import { BadgeGrid } from "@/components/ui/BadgeGrid";
import { MasterySection } from "@/components/ui/MasterySection";
import { QuestSection } from "@/components/ui/QuestSection";
import { SphereBackground } from "@/components/ui/SphereBackground";
import { api, FeedbackResult, SessionSummary } from "@/lib/api";
import {
  computeGamification,
  GamificationState,
  loadFeedbackMap,
} from "@/lib/gamification";
import { router, useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const [items, setItems] = useState<SessionSummary[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, FeedbackResult>
  >({});

  const load = useCallback(async () => {
    const sessions = await api.getSessions();
    setItems(sessions);
    const fMap = await loadFeedbackMap(sessions);
    setFeedbackMap(fMap);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const gamification: GamificationState = useMemo(
    () => computeGamification(items, feedbackMap),
    [items, feedbackMap],
  );

  const weeklyTarget = 3;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  const weekCount = items.filter(
    (s) =>
      s.totalScore !== undefined &&
      s.totalScore !== null &&
      new Date(s.savedAt) >= weekAgo,
  ).length;

  const scoredSessions = items.filter((s) => s.totalScore !== undefined);
  const last3 = scoredSessions
    .slice()
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    )
    .slice(0, 3);
  const avgScore = last3.length
    ? last3.reduce((sum, s) => sum + (s.totalScore ?? 0), 0) / last3.length
    : null;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`}
      edges={["top"]}
    >
      <SphereBackground />
      <View className="px-4 pt-1 flex-row items-center">
        <Pressable onPress={handleBack} hitSlop={12} className="w-8">
          <Text
            className="text-2xl font-extrabold"
            style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}
          >
            ‹
          </Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Text
            className="font-extrabold"
            style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
          >
            Progress
          </Text>
        </View>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 mt-2 pb-8">
        <Text
          className="text-3xl font-extrabold text-center mt-2"
          style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
        >
          Progress
        </Text>

        {/* Level & XP */}
        <View
          className="mt-4 border rounded-xl2 p-4"
          style={{
            borderColor: isDark
              ? "rgba(109,124,255,0.5)"
              : "rgba(79,95,232,0.30)",
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-2xl">⚡</Text>
              <View className="ml-2">
                <Text
                  className="text-2xl font-extrabold"
                  style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
                >
                  Level {gamification.level}
                </Text>
                <Text
                  className="text-xs -mt-1"
                  style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
                >
                  {gamification.xpToNextLevel} XP to next level
                </Text>
              </View>
            </View>
            <Text
              className="font-extrabold"
              style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}
            >
              {gamification.xp} XP
            </Text>
          </View>
          <View
            className="h-2 rounded-full mt-3 overflow-hidden"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E4E8F3",
            }}
          >
            <View
              className="h-2 rounded-full bg-primary"
              style={{
                width: `${Math.min(100, gamification.levelProgress * 100)}%`,
              }}
            />
          </View>
        </View>

        {/* Streak */}
        <View
          className="mt-4 border rounded-xl2 p-4"
          style={{
            borderColor: isDark
              ? "rgba(251,146,60,0.6)"
              : "rgba(221,123,32,0.5)",
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
          }}
        >
          <View className="flex-row items-center">
            <Text className="text-3xl">🔥</Text>
            <View className="ml-2">
              <Text
                className="text-3xl font-extrabold"
                style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
              >
                {gamification.currentStreak}
              </Text>
              <Text
                className="text-xs -mt-1"
                style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
              >
                Current streak
              </Text>
            </View>
          </View>
          {gamification.currentStreak > 0 && (
            <Text className="text-emerald-300 font-extrabold mt-3">
              {gamification.currentStreak >= 7
                ? "You're unstoppable! 🚀"
                : "Amazing streak! 💪"}
            </Text>
          )}
          <View className="mt-3 flex-row gap-2">
            {["3", "7", "14"].map((n) => (
              <View
                key={n}
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  gamification.currentStreak >= Number(n)
                    ? "bg-orange-500"
                    : isDark
                      ? "bg-white/10"
                      : "bg-[#E4E8F3]"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    gamification.currentStreak >= Number(n)
                      ? "text-white"
                      : isDark
                        ? "text-white"
                        : "text-[#6B7285]"
                  }`}
                >
                  {n}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats row */}
        <View className="mt-4 flex-row gap-3">
          <View
            className="flex-1 border rounded-xl2 p-4"
            style={{
              borderColor: isDark
                ? "rgba(165,180,252,0.4)"
                : "rgba(79,95,232,0.24)",
              backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            }}
          >
            <Text className="text-2xl">🏆</Text>
            <Text
              className="text-4xl font-extrabold mt-1"
              style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
            >
              {gamification.longestStreak}
            </Text>
            <Text
              className="mt-1"
              style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
            >
              Longest Streak
            </Text>
          </View>
          <View
            className="flex-1 border rounded-xl2 p-4"
            style={{
              borderColor: isDark
                ? "rgba(165,180,252,0.4)"
                : "rgba(79,95,232,0.24)",
              backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            }}
          >
            <Text className="text-2xl">✓</Text>
            <Text
              className="text-4xl font-extrabold mt-1"
              style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
            >
              {gamification.totalSessions}
            </Text>
            <Text
              className="mt-1"
              style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
            >
              Total Sessions
            </Text>
          </View>
        </View>

        {/* Active Quests */}
        <View className="mt-4">
          <QuestSection quests={gamification.activeQuests} />
        </View>

        {/* Weekly Goal */}
        <View
          className="mt-4 border rounded-xl2 p-4"
          style={{
            borderColor: isDark
              ? "rgba(165,180,252,0.4)"
              : "rgba(79,95,232,0.24)",
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="font-semibold"
              style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
            >
              📅 Weekly Goal
            </Text>
            <Text className="text-cyan-300 font-extrabold">
              {Math.min(weeklyTarget, weekCount)} / {weeklyTarget}
            </Text>
          </View>
          <View
            className="h-2 rounded-full mt-3 overflow-hidden"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E4E8F3",
            }}
          >
            <View
              className="h-2 rounded-full bg-cyan-300"
              style={{
                width: `${(Math.min(weeklyTarget, weekCount) / weeklyTarget) * 100}%`,
              }}
            />
          </View>
        </View>

        {/* Average Score (Last 3) */}
        <View
          className="mt-4 border rounded-xl2 p-4"
          style={{
            borderColor: isDark
              ? "rgba(165,180,252,0.4)"
              : "rgba(79,95,232,0.24)",
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
          }}
        >
          <Text
            className="font-semibold"
            style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
          >
            Average Score (Last 3 Sessions)
          </Text>
          <View className="mt-3">
            <View className="flex-row items-center justify-between">
              <Text style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
                Total Score
              </Text>
              <Text
                className="font-extrabold"
                style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
              >
                {avgScore !== null ? `${Math.round(avgScore)} / 100` : "—"}
              </Text>
            </View>
            <View
              className="h-2 rounded-full mt-1 overflow-hidden"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E4E8F3",
              }}
            >
              <View
                className="h-2 rounded-full bg-emerald-300"
                style={{
                  width: `${Math.min(100, Math.max(0, avgScore ?? 0))}%`,
                }}
              />
            </View>
          </View>
        </View>

        {/* Mastery Skills */}
        <View className="mt-4">
          <MasterySection skills={gamification.masterySkills} />
        </View>

        {/* Badges */}
        <View className="mt-4">
          <BadgeGrid earnedIds={gamification.earnedBadgeIds} />
        </View>

        {/* Session History */}
        <View className="mt-4 mb-8">
          <Text
            className="font-extrabold text-base mb-2"
            style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
          >
            Session History
          </Text>
          {items.length === 0 && (
            <Text style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
              No sessions yet.
            </Text>
          )}
          {items.map((s) => (
            <Pressable
              key={s.sessionId}
              onPress={() =>
                router.push({
                  pathname: "/feedback",
                  params: { title: s.title, sessionId: s.sessionId },
                })
              }
              className="border rounded-xl p-3 mb-2"
              style={{
                borderColor: isDark
                  ? "rgba(165,180,252,0.4)"
                  : "rgba(79,95,232,0.24)",
                backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className="font-semibold flex-1 mr-2"
                  style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
                  numberOfLines={1}
                >
                  {s.title}
                </Text>
                {s.totalScore !== undefined && (
                  <Text
                    className="font-extrabold"
                    style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}
                  >
                    {s.totalScore} / 100
                  </Text>
                )}
              </View>
              <Text
                className="text-xs mt-1"
                style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
              >
                {new Date(s.savedAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
