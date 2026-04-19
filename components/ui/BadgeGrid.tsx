import { ALL_BADGES } from "@/lib/gamification";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

export function BadgeGrid({ earnedIds }: { earnedIds: string[] }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const earnedSet = new Set(earnedIds);

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
        Badges
      </Text>
      <View className="flex-row flex-wrap gap-y-4">
        {ALL_BADGES.map((badge) => {
          const earned = earnedSet.has(badge.id);
          return (
            <View
              key={badge.id}
              className="items-center"
              style={{ width: "20%" }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: earned
                    ? isDark
                      ? "rgba(109,124,255,0.22)"
                      : "rgba(79,95,232,0.12)"
                    : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#F0F0F5",
                }}
              >
                <Text
                  className="text-2xl"
                  style={{ opacity: earned ? 1 : 0.25 }}
                >
                  {earned ? badge.emoji : "🔒"}
                </Text>
              </View>
              <Text
                className="text-xs font-semibold mt-1 text-center"
                numberOfLines={2}
                style={{
                  color: earned
                    ? isDark
                      ? "#EAF0FF"
                      : "#1C2336"
                    : isDark
                      ? "#3A4460"
                      : "#C0C5D5",
                }}
              >
                {badge.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
