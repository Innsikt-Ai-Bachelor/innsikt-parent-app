import { ScenarioCard } from "@/components/ui/ScenarioCard";
import { SphereBackground } from "@/components/ui/SphereBackground";
import { api, Scenario } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  useEffect(() => {
    api.getScenarios().then(setScenarios).catch(console.error);
  }, []);

  const handleThemeToggle = async () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`} edges={["top"]}>
      <SphereBackground />
      <View className="px-4 pt-1">
        <View className="h-11 flex-row items-center justify-between">
          <Pressable hitSlop={10} onPress={() => router.push("/(tabs)/settings")}>
            <Ionicons
              name="menu-outline"
              size={24}
              color={isDark ? "#6D7CFF" : "#4F5FE8"}
            />
          </Pressable>
          <Text className={`${isDark ? "text-text" : "text-[#131A2A]"} font-extrabold`}>
            Scenarios
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable hitSlop={10} onPress={() => router.push("/(tabs)/history")}>
              <Ionicons
                name={isDark ? "stats-chart" : "stats-chart-outline"}
                size={20}
                color={isDark ? "#6D7CFF" : "#4F5FE8"}
              />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={handleThemeToggle}
              className={`h-8 w-8 rounded-full items-center justify-center border ${
                isDark ? "border-border" : "border-[#D6DBEE]"
              }`}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={16}
                color={isDark ? "#E7F183" : "#F59E0B"}
              />
            </Pressable>
          </View>
        </View>

        <Text
          className={`text-3xl font-extrabold text-center mt-2 ${
            isDark ? "text-text" : "text-[#131A2A]"
          }`}
        >
          Practice Makes Progress
        </Text>
        <Text className={`${isDark ? "text-muted" : "text-[#6B7285]"} text-center mt-2`}>
          Choose a scenario to practice
        </Text>

        <Pressable
          className={`mt-4 border rounded-xl2 px-4 py-3 flex-row items-center justify-between ${
            isDark ? "border-orange-400/60 bg-card" : "border-orange-300 bg-white"
          }`}
          onPress={() => router.push("/(tabs)/history")}
        >
          <View className="flex-row items-center">
            <Text className="text-2xl">🔥</Text>
            <View className="ml-2">
              <Text className={`${isDark ? "text-text" : "text-[#131A2A]"} font-extrabold`}>
                12 days
              </Text>
              <Text className={`${isDark ? "text-muted" : "text-[#6B7285]"} text-xs`}>
                Current streak
              </Text>
            </View>
          </View>
          <Text className={`${isDark ? "text-primary" : "text-[#4F5FE8]"} font-bold`}>
            View Progress ›
          </Text>
        </Pressable>

        <FlatList
          className="mt-4"
          data={scenarios}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="pb-24"
          renderItem={({ item }) => (
            <ScenarioCard
              scenario={item}
              onPress={() =>
                router.push({
                  pathname: "/chatbot",
                  params: {
                    scenarioId: String(item.id),
                    title: item.title,
                    description: item.description,
                  },
                })
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
