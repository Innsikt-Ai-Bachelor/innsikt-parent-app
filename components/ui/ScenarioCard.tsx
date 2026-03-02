import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

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
        {scenario.emoji ? <Text className="text-xl mr-2">{scenario.emoji}</Text> : null}

        <View className="flex-1">
          <Text className={`text-base font-extrabold ${isDark ? "text-text" : "text-[#131A2A]"}`}>
            {scenario.title}
          </Text>
          <Text className={`mt-1 text-sm ${isDark ? "text-muted" : "text-[#6B7285]"}`}>
            {scenario.description}
          </Text>

          <View className="mt-3 flex-row items-center gap-2">
            <Text className={`text-xs font-semibold ${isDark ? "text-muted" : "text-[#6B7285]"}`}>
              ⏱ {duration}
            </Text>
            <View className={`rounded-full px-2.5 py-1 ${chip}`}>
              <Text className="text-xs font-extrabold">{difficulty}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
