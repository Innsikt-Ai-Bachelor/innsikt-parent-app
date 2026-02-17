import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";

export function ChatBubble({
  role,
  text,
}: {
  role: "parent" | "child";
  text: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const isParent = role === "parent";

  return (
    <View className={`my-1.5 flex-row ${isParent ? "justify-end" : "justify-start"}`}>
      <View
        className="max-w-[82%] rounded-2xl border px-3 py-2.5"
        style={{
          backgroundColor: isParent
            ? isDark
              ? "#6D7CFF"
              : "#E4E8FF"
            : isDark
              ? "#111A2E"
              : "#FFFFFF",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.20)",
        }}
      >
        <Text
          className="text-sm leading-5 font-semibold"
          style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}
