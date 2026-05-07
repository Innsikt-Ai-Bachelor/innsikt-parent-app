import type { Quest } from "@/lib/gamification";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

function QuestCard({ quest, isDark }: { quest: Quest; isDark: boolean }) {
  const progress = quest.target > 0 ? quest.current / quest.target : 0;

  return (
    <View
      className="border rounded-xl p-3 mb-2"
      style={{
        backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
        borderColor: quest.completed
          ? isDark
            ? "rgba(45,212,191,0.5)"
            : "rgba(16,185,129,0.4)"
          : isDark
            ? "rgba(165,180,252,0.4)"
            : "rgba(79,95,232,0.24)",
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <Text className="text-xl mr-2">{quest.emoji}</Text>
          <View className="flex-1">
            <Text
              className="font-extrabold text-sm"
              style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
            >
              {quest.title}
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
            >
              {quest.description}
            </Text>
          </View>
        </View>
        <View className="items-end ml-1">
          <Text
            className="text-xs font-bold"
            style={{
              color: quest.completed
                ? "#2DD4BF"
                : isDark
                  ? "#6D7CFF"
                  : "#4F5FE8",
            }}
          >
            +{quest.xpReward} XP
          </Text>
          <Text
            className="text-xs mt-0.5"
            style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
          >
            {quest.current}/{quest.target}
          </Text>
        </View>
      </View>

      <View
        className="h-1.5 rounded-full mt-2 overflow-hidden"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#E4E8F3",
        }}
      >
        <View
          className="h-1.5 rounded-full"
          style={{
            width: `${Math.min(100, progress * 100)}%`,
            backgroundColor: quest.completed ? "#2DD4BF" : "#6D7CFF",
          }}
        />
      </View>
    </View>
  );
}

export function QuestSection({ quests }: { quests: Quest[] }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  return (
    <View>
      <Text
        className="font-extrabold text-base mb-2"
        style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
      >
        Aktive oppdrag
      </Text>
      {quests.map((q) => (
        <QuestCard key={q.id} quest={q} isDark={isDark} />
      ))}
    </View>
  );
}
