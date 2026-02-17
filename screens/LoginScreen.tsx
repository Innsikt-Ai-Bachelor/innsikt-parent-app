import { SphereBackground } from "@/components/ui/SphereBackground";
import { api } from "@/lib/api";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = { onSuccess?: () => void };

export default function LoginScreen({ onSuccess }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== "light";
  const [email, setEmail] = useState("test@demo.com");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await api.authenticate(email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace("/(tabs)");
      }
    } catch {
      setError("Login failed.");
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`} edges={["top"]}>
      <SphereBackground />
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-full max-w-md rounded-xl2 p-5 border"
          style={{
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.18)",
          }}
        >
          <Text
            className="text-2xl font-extrabold text-center"
            style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
          >
            Login
          </Text>

          {!!error && <Text className="text-warning mt-3 text-center">{error}</Text>}

          <TextInput
            className="mt-4 border rounded-xl px-4 py-3 font-semibold"
            style={{
              backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.18)",
              color: isDark ? "#EAF0FF" : "#1C2336",
            }}
            placeholder="Email"
            placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError("");
            }}
          />

          <TextInput
            className="mt-3 border rounded-xl px-4 py-3 font-semibold"
            style={{
              backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.18)",
              color: isDark ? "#EAF0FF" : "#1C2336",
            }}
            placeholder="Password"
            placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError("");
            }}
            onSubmitEditing={handleLogin}
          />

          <Pressable
            onPress={handleLogin}
            className="mt-5 bg-primary rounded-xl py-3 items-center"
          >
            <Text className="text-white font-extrabold text-lg">Logg inn</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
