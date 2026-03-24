import { SphereBackground } from "@/components/ui/SphereBackground";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScenarioDetailsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const params = useLocalSearchParams<{
    scenarioId?: string;
    title?: string;
    description?: string;
    detailedDescription?: string;
    durationMin?: string;
    difficulty?: string;
    emoji?: string;
  }>();

  const scenarioId = params.scenarioId ? String(params.scenarioId) : "1";
  const title = params.title ? String(params.title) : "Practice";
  const description = params.description ? String(params.description) : "";
  const detailedDescription = params.detailedDescription
    ? String(params.detailedDescription)
    : "";
  const durationMin = params.durationMin
    ? String(params.durationMin)
    : "5-10 min";
  const difficulty = params.difficulty ? String(params.difficulty) : "Moderate";
  const emoji = params.emoji ? String(params.emoji) : "";

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  const handleProceed = () => {
    router.push({
      pathname: "/chatbot",
      params: {
        scenarioId,
        title,
        description,
      },
    });
  };

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
            {"<"}
          </Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Text
            className="font-extrabold"
            style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
          >
            Scenario Details
          </Text>
        </View>
        <View className="w-8" />
      </View>

      <View className="px-4 pt-4 flex-1">
        <View
          className="rounded-xl2 p-5 border"
          style={{
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            borderColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(79,95,232,0.18)",
          }}
        >
          {emoji ? <Text className="text-3xl">{emoji}</Text> : null}

          <Text
            className="text-2xl font-extrabold mt-3"
            style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
          >
            {title}
          </Text>

          <Text
            className="mt-3"
            style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
          >
            {detailedDescription ||
              description ||
              "No description available for this scenario."}
          </Text>

          <View
            className="mt-5 rounded-xl px-4 py-3 border"
            style={{
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(79,95,232,0.16)",
              backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
            }}
          >
            <Text
              className="font-semibold"
              style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
            >
              Duration: {durationMin}
            </Text>
            <Text
              className="mt-1 font-semibold"
              style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
            >
              Difficulty: {difficulty}
            </Text>
          </View>
        </View>

        <View className="mt-auto pb-6">
          <Pressable
            className="rounded-xl2 py-3 items-center border"
            style={{
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(79,95,232,0.26)",
            }}
            onPress={handleBack}
          >
            <Text
              className="font-extrabold"
              style={{ color: isDark ? "#9AA6C0" : "#56607A" }}
            >
              Back to selection
            </Text>
          </Pressable>

          <Pressable
            className="mt-3 bg-primary rounded-xl2 py-3 items-center"
            onPress={handleProceed}
          >
            <Text className="text-white font-extrabold">Proceed to chat</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
