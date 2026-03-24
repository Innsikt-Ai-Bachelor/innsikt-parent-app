import { SphereBackground } from "@/components/ui/SphereBackground";
import { api, SessionSummary } from "@/lib/api";
import { router, useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const [items, setItems] = useState<SessionSummary[]>([]);

  const load = useCallback(async () => {
    const sessions = await api.getSessions();
    setItems(sessions);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const stats = useMemo(() => {
    const sessions = items;
    const total = sessions.length;

    const byDay = new Set(
      sessions.map((s) => {
        const d = new Date(s.savedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );

    const sortedDays = [...byDay]
      .map((k) => {
        const [y, m, d] = k.split("-").map(Number);
        return new Date(y, m, d);
      })
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 0;
    let currentRun = 0;
    let prev: Date | null = null;
    for (const day of sortedDays) {
      if (!prev) {
        currentRun = 1;
      } else {
        const diff = Math.round((day.getTime() - prev.getTime()) / 86400000);
        currentRun = diff === 1 ? currentRun + 1 : 1;
      }
      if (currentRun > longestStreak) longestStreak = currentRun;
      prev = day;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekCount = sessions.filter((s) => new Date(s.savedAt) >= weekAgo).length;
    const weeklyTarget = 3;

    const scoredSessions = sessions.filter((s) => s.totalScore !== undefined);
    const last3 = scoredSessions
      .slice()
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, 3);
    const avgScore = last3.length
      ? last3.reduce((sum, s) => sum + (s.totalScore ?? 0), 0) / last3.length
      : null;

    return {
      currentStreak: Math.max(1, Math.min(30, longestStreak || 1)),
      longestStreak: Math.max(1, longestStreak || 1),
      total,
      weekCount: Math.min(weeklyTarget, weekCount),
      weeklyTarget,
      avgScore,
    };
  }, [items]);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`} edges={["top"]}>
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
          <Text className="font-extrabold" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
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
      <View className="mt-4">
        <View
          className="border rounded-xl2 p-4"
          style={{
            borderColor: isDark ? "rgba(251,146,60,0.6)" : "rgba(221,123,32,0.5)",
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
                {stats.currentStreak}
              </Text>
              <Text className="text-xs -mt-1" style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
                Current streak
              </Text>
            </View>
          </View>
          <Text className="text-emerald-300 font-extrabold mt-3">Amazing streak! 💪</Text>
          <View className="mt-3 flex-row gap-2">
            {["7", "14", "30"].map((n) => (
              <View
                key={n}
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  Number(n) <= stats.currentStreak ? "bg-orange-500" : isDark ? "bg-white/10" : "bg-[#E4E8F3]"
                }`}
              >
                <Text className={`text-xs font-bold ${Number(n) <= stats.currentStreak ? "text-white" : isDark ? "text-white" : "text-[#6B7285]"}`}>{n}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View
            className="flex-1 border rounded-xl2 p-4"
            style={{
              borderColor: isDark ? "rgba(165,180,252,0.4)" : "rgba(79,95,232,0.24)",
              backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            }}
          >
            <Text className="text-2xl">🏆</Text>
            <Text className="text-4xl font-extrabold mt-1" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>{stats.longestStreak}</Text>
            <Text className="mt-1" style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>Longest Streak</Text>
          </View>
          <View
            className="flex-1 border rounded-xl2 p-4"
            style={{
              borderColor: isDark ? "rgba(165,180,252,0.4)" : "rgba(79,95,232,0.24)",
              backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            }}
          >
            <Text className="text-2xl">✓</Text>
            <Text className="text-4xl font-extrabold mt-1" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>{stats.total}</Text>
            <Text className="mt-1" style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>Total Sessions</Text>
          </View>
        </View>

        <View
          className="mt-4 border rounded-xl2 p-4"
          style={{
            borderColor: isDark ? "rgba(165,180,252,0.4)" : "rgba(79,95,232,0.24)",
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>📅 Weekly Goal</Text>
            <Text className="text-cyan-300 font-extrabold">
              {stats.weekCount} / {stats.weeklyTarget}
            </Text>
          </View>
          <View
            className="h-2 rounded-full mt-3 overflow-hidden"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E4E8F3" }}
          >
            <View
              className="h-2 rounded-full bg-cyan-300"
              style={{ width: `${(stats.weekCount / stats.weeklyTarget) * 100}%` }}
            />
          </View>
        </View>

        <View
          className="mt-4 border rounded-xl2 p-4 mb-8"
          style={{
            borderColor: isDark ? "rgba(165,180,252,0.4)" : "rgba(79,95,232,0.24)",
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
          }}
        >
          <Text className="font-semibold" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
            Average Score (Last 3 Sessions)
          </Text>

          <View className="mt-3">
            <View className="flex-row items-center justify-between">
              <Text style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>Total Score</Text>
              <Text className="font-extrabold" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
                {stats.avgScore !== null ? `${Math.round(stats.avgScore)} / 100` : "—"}
              </Text>
            </View>
            <View
              className="h-2 rounded-full mt-1 overflow-hidden"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E4E8F3" }}
            >
              <View
                className="h-2 rounded-full bg-emerald-300"
                style={{
                  width: `${Math.min(100, Math.max(0, stats.avgScore ?? 0))}%`,
                }}
              />
            </View>
          </View>
        </View>

        <View className="mt-4 mb-8">
          <Text className="font-extrabold text-base mb-2" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
            Session History
          </Text>
          {items.length === 0 && (
            <Text style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>No sessions yet.</Text>
          )}
          {items.map((s) => (
            <Pressable
              key={s.sessionId}
              onPress={() => router.push({ pathname: "/feedback", params: { title: s.title, sessionId: s.sessionId } })}
              className="border rounded-xl p-3 mb-2"
              style={{
                borderColor: isDark ? "rgba(165,180,252,0.4)" : "rgba(79,95,232,0.24)",
                backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold flex-1 mr-2" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }} numberOfLines={1}>
                  {s.title}
                </Text>
                {s.totalScore !== undefined && (
                  <Text className="font-extrabold" style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}>
                    {s.totalScore} / 100
                  </Text>
                )}
              </View>
              <Text className="text-xs mt-1" style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
                {new Date(s.savedAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
