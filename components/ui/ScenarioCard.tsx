import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";

const EMOJI_TO_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  "🌙": "moon",
  "📚": "book",
  "🌅": "sunny",
  "😤": "flame",
  "🏃": "walk",
  "💬": "chatbubble",
  "🎮": "game-controller",
  "🍽️": "restaurant",
  "💤": "bed",
  "😴": "bed",
  "🎒": "backpack",
  "📱": "phone-portrait",
};

type Difficulty = "Easy" | "Moderate" | "Challenging";

export type ScenarioCardModel = {
  id: string | number;
  title: string;
  description: string;
  durationMin?: string; // f.eks "5–10 min" (valgfritt hvis dere ikke har det i data)
  difficulty?: Difficulty; // valgfritt
  emoji?: string; // valgfritt
};

function difficultyClass(difficulty: Difficulty) {
  if (difficulty === "Easy") {
    return "bg-emerald-300/20 text-emerald-300";
  }
  if (difficulty === "Moderate") {
    return "bg-amber-300/20 text-amber-200";
  }
  return "bg-indigo-300/20 text-indigo-300";
}

export function ScenarioCard({
  scenario,
  onPress,
}: {
  scenario: ScenarioCardModel;
  onPress?: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const duration = scenario.durationMin ?? "5–10 min";
  const difficulty = scenario.difficulty ?? "Moderate";
  const chip = difficultyClass(difficulty);

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-xl2 px-4 py-4 border ${
        isDark ? "bg-card border-border" : "bg-white border-[#D9DEEF]"
      }`}
    >
      <View className="flex-row items-start">
        {scenario.emoji ? (
          <Ionicons
            name={EMOJI_TO_ICON[scenario.emoji] ?? "ellipse-outline"}
            size={24}
            color="#6D7CFF"
            style={{ marginRight: 8, marginTop: 2 }}
          />
        ) : null}

        <View className="flex-1">
          <Text className={`text-base font-extrabold ${isDark ? "text-text" : "text-[#131A2A]"}`}>
            {scenario.title}
          </Text>
          <Text className={`mt-1 text-sm ${isDark ? "text-muted" : "text-[#6B7285]"}`}>
            {scenario.description}
          </Text>

          <View className="mt-3 flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color={isDark ? "#9AA6C0" : "#6B7285"} />
              <Text className={`text-xs font-semibold ${isDark ? "text-muted" : "text-[#6B7285]"}`}>
                {duration}
              </Text>
            </View>
            <View className={`rounded-full px-2.5 py-1 ${chip}`}>
              <Text className="text-xs font-extrabold">{difficulty}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
