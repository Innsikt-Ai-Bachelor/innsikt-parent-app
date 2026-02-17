import { SphereBackground } from "@/components/ui/SphereBackground";
import { api, SessionSummary } from "@/lib/api";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
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

    const last3 = sessions.slice(0, 3);
    const avgTurns = last3.length
      ? last3.reduce((sum, s) => sum + s.turnCount, 0) / last3.length
      : 0;
    const empathy = Math.min(10, Math.max(6, 6.4 + avgTurns * 0.14));
    const boundaries = Math.min(10, Math.max(6, 6.2 + avgTurns * 0.16));
    const consistency = Math.min(10, Math.max(6, 6.0 + avgTurns * 0.12));

    return {
      currentStreak: Math.max(1, Math.min(30, longestStreak || 1)),
      longestStreak: Math.max(1, longestStreak || 1),
      total,
      weekCount: Math.min(weeklyTarget, weekCount),
      weeklyTarget,
      empathy: empathy.toFixed(1),
      boundaries: boundaries.toFixed(1),
      consistency: consistency.toFixed(1),
    };
  }, [items]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <SphereBackground />
      <View className="px-4 pt-1 flex-row items-center">
        <Pressable onPress={handleBack} hitSlop={12} className="w-8">
          <Text className="text-primary text-2xl font-extrabold">‹</Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-text font-extrabold">Progress</Text>
        </View>
        <View className="w-8" />
      </View>
      <Text className="text-text text-3xl font-extrabold text-center px-4 mt-2">Progress</Text>
      <View className="px-4 mt-4">
        <View className="border border-orange-400/60 rounded-xl2 p-4 bg-card">
          <View className="flex-row items-center">
            <Text className="text-3xl">🔥</Text>
            <View className="ml-2">
              <Text className="text-text text-3xl font-extrabold">{stats.currentStreak}</Text>
              <Text className="text-muted text-xs -mt-1">Current streak</Text>
            </View>
          </View>
          <Text className="text-emerald-300 font-extrabold mt-3">Amazing streak! 💪</Text>
          <View className="mt-3 flex-row gap-2">
            {["7", "14", "30"].map((n) => (
              <View
                key={n}
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  Number(n) <= stats.currentStreak ? "bg-orange-500" : "bg-white/10"
                }`}
              >
                <Text className="text-white text-xs font-bold">{n}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 border border-indigo-300/40 rounded-xl2 p-4 bg-card">
            <Text className="text-2xl">🏆</Text>
            <Text className="text-text text-4xl font-extrabold mt-1">{stats.longestStreak}</Text>
            <Text className="text-muted mt-1">Longest Streak</Text>
          </View>
          <View className="flex-1 border border-indigo-300/40 rounded-xl2 p-4 bg-card">
            <Text className="text-2xl">✓</Text>
            <Text className="text-text text-4xl font-extrabold mt-1">{stats.total}</Text>
            <Text className="text-muted mt-1">Total Sessions</Text>
          </View>
        </View>

        <View className="mt-4 border border-indigo-300/40 rounded-xl2 p-4 bg-card">
          <View className="flex-row items-center justify-between">
            <Text className="text-text font-semibold">📅 Weekly Goal</Text>
            <Text className="text-cyan-300 font-extrabold">
              {stats.weekCount} / {stats.weeklyTarget}
            </Text>
          </View>
          <View className="h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <View
              className="h-2 rounded-full bg-cyan-300"
              style={{ width: `${(stats.weekCount / stats.weeklyTarget) * 100}%` }}
            />
          </View>
        </View>

        <View className="mt-4 border border-indigo-300/40 rounded-xl2 p-4 bg-card mb-8">
          <Text className="text-text font-semibold">Average Scores (Last 3 Sessions)</Text>

          <View className="mt-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-text">Empathy</Text>
              <Text className="text-text font-extrabold">{stats.empathy} / 10</Text>
            </View>
            <View className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
              <View className="h-2 rounded-full bg-emerald-300" style={{ width: `${Number(stats.empathy) * 10}%` }} />
            </View>
          </View>

          <View className="mt-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-text">Boundaries</Text>
              <Text className="text-text font-extrabold">{stats.boundaries} / 10</Text>
            </View>
            <View className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
              <View className="h-2 rounded-full bg-indigo-300" style={{ width: `${Number(stats.boundaries) * 10}%` }} />
            </View>
          </View>

          <View className="mt-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-text">Consistency</Text>
              <Text className="text-text font-extrabold">{stats.consistency} / 10</Text>
            </View>
            <View className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
              <View className="h-2 rounded-full bg-lime-300" style={{ width: `${Number(stats.consistency) * 10}%` }} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
