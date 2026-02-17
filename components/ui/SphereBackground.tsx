import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { View } from "react-native";

export function SphereBackground() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <LinearGradient
        colors={
          isDark
            ? ["rgba(119,220,202,0.42)", "rgba(119,220,202,0.07)", "rgba(11,18,32,0)"]
            : ["rgba(122,224,206,0.30)", "rgba(122,224,206,0.06)", "rgba(255,255,255,0)"]
        }
        className="absolute"
        style={{
          width: 520,
          height: 360,
          borderRadius: 220,
          left: -150,
          bottom: -130,
          transform: [{ rotate: "18deg" }],
        }}
      />
      <LinearGradient
        colors={
          isDark
            ? ["rgba(231,241,131,0.30)", "rgba(231,241,131,0.04)", "rgba(11,18,32,0)"]
            : ["rgba(220,231,128,0.24)", "rgba(220,231,128,0.04)", "rgba(255,255,255,0)"]
        }
        className="absolute"
        style={{
          width: 320,
          height: 320,
          borderRadius: 160,
          left: 90,
          top: 280,
        }}
      />
      <LinearGradient
        colors={
          isDark
            ? ["rgba(127,143,233,0.44)", "rgba(127,143,233,0.08)", "rgba(11,18,32,0)"]
            : ["rgba(127,143,233,0.26)", "rgba(127,143,233,0.05)", "rgba(255,255,255,0)"]
        }
        className="absolute"
        style={{
          width: 500,
          height: 340,
          borderRadius: 220,
          right: -190,
          top: -20,
          transform: [{ rotate: "-20deg" }],
        }}
      />
      <LinearGradient
        colors={
          isDark
            ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.01)", "rgba(11,18,32,0)"]
            : ["rgba(255,255,255,0.75)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]
        }
        className="absolute"
        style={{
          width: 280,
          height: 180,
          borderRadius: 120,
          right: 20,
          top: 120,
          transform: [{ rotate: "-14deg" }],
        }}
      />
      <View className={`absolute inset-0 ${isDark ? "bg-bg/50" : "bg-[#F7F8FC]/52"}`} />
    </View>
  );
}
