import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "nativewind";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  return (
    <Tabs
      screenOptions={{
        header: () => null,
        tabBarActiveTintColor: isDark ? "#6D7CFF" : "#4F5FE8",
        tabBarInactiveTintColor: isDark ? "#8B93A7" : "#6B7280",
        tabBarStyle: {
          display: "none",
          backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
          borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.18)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scenarios",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
