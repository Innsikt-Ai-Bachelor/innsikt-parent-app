import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { SphereBackground } from "@/components/ui/SphereBackground";

function Row({
  title,
  subtitle,
  right,
  onPress,
  isDark,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  onPress?: () => void;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-14 px-3 py-2 flex-row items-center justify-between"
    >
      <View>
        <Text className="font-semibold" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs mt-1" style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? (
        <Text className="font-bold" style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}>
          {right}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);

  const toggleTheme = async () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["user", "sessions"]);
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      Alert.alert("Feil", "Klarte ikke å logge ut. Prøv igjen.");
    }
  };

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`} edges={["top"]}>
      <SphereBackground />
      <View className="px-4 pt-1 flex-row items-center">
        <Pressable onPress={handleBack} hitSlop={12} className="w-8">
          <Text
            className="text-2xl font-extrabold"
            style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}
          >
            ‹
          </Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="font-extrabold" style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}>
            Settings
          </Text>
        </View>
        <View className="w-8" />
      </View>

      <View className="px-4">
        <Text
          className="text-3xl font-extrabold text-center mt-2"
          style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
        >
          Settings
        </Text>
        <Text className="text-center mt-2" style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
          Customize your experience
        </Text>

        <View
          className="mt-5 border rounded-xl2 py-2"
          style={{
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.18)",
          }}
        >
          <Row
            title="Appearance"
            subtitle={isDark ? "Dark mode active" : "Light mode active"}
            right={isDark ? "Dark" : "Light"}
            onPress={toggleTheme}
            isDark={isDark}
          />
          <View
            className="h-px mx-3"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.16)" }}
          />
          <Row
            title="Notifications"
            subtitle="Practice reminders"
            right={practiceReminders ? "On" : "Off"}
            onPress={() => setPracticeReminders((v) => !v)}
            isDark={isDark}
          />
          <View
            className="h-px mx-3"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.16)" }}
          />
          <Row
            title="Progress Updates"
            subtitle="Weekly progress notifications"
            right={progressUpdates ? "On" : "Off"}
            onPress={() => setProgressUpdates((v) => !v)}
            isDark={isDark}
          />
          <View
            className="h-px mx-3"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.16)" }}
          />
          <Row
            title="Language"
            subtitle="English"
            right="›"
            onPress={() => Alert.alert("Language", "Language settings coming soon.")}
            isDark={isDark}
          />
        </View>

        <Pressable
          className="mt-5 border border-orange-400/50 rounded-xl2 py-3 items-center"
          onPress={handleLogout}
        >
          <Text
            className="font-extrabold"
            style={{ color: isDark ? "#F8B26A" : "#DD7B20" }}
          >
            Log out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
