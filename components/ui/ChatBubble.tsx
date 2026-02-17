import { Text, View } from "react-native";

export function ChatBubble({
  role,
  text,
}: {
  role: "parent" | "child";
  text: string;
}) {
  const isParent = role === "parent";

  return (
    <View className={`my-1.5 flex-row ${isParent ? "justify-end" : "justify-start"}`}>
      <View
        className={`max-w-[82%] rounded-2xl border px-3 py-2.5 ${
          isParent ? "bg-primarySoft border-border" : "bg-black/10 border-border"
        }`}
      >
        <Text className="text-text text-sm leading-5 font-semibold">{text}</Text>
      </View>
    </View>
  );
}
