import type { MasterySkill } from "@/lib/gamification";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

const SKILL_COLORS: Record<string, string> = {
  empathy: "#6D7CFF",
  "de-escalation": "#2DD4BF",
  consistency: "#FBBF24",
  communication: "#F472B6",
  listening: "#A78BFA",
  "active listening": "#A78BFA",
};

function skillColor(key: string): string {
  return SKILL_COLORS[key] ?? "#6D7CFF";
}

export function MasterySection({ skills }: { skills: MasterySkill[] }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  return (
    <View
      className="border rounded-xl2 p-4"
      style={{
        backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
        borderColor: isDark ? "rgba(165,180,252,0.4)" : "rgba(79,95,232,0.24)",
      }}
    >
      <Text
        className="font-extrabold text-base mb-3"
        style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
      >
        Mastery Skills
      </Text>

      {skills.length === 0 ? (
        <Text
          className="text-sm"
          style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
        >
          Complete sessions with feedback to track your skill mastery.
        </Text>
      ) : (
        skills.map((skill) => {
          const color = skillColor(skill.key);
          return (
            <View key={skill.key} className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
                >
                  {skill.label}
                </Text>
                <Text className="text-xs font-extrabold" style={{ color }}>
                  {skill.score}%
                </Text>
              </View>
              <View
                className="h-2 rounded-full overflow-hidden"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "#E4E8F3",
                }}
              >
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: `${skill.score}%`,
                    backgroundColor: color,
                    opacity: 0.85,
                  }}
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
