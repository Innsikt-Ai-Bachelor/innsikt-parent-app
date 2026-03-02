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
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(79,95,232,0.18)",
    color: isDark ? "#EAF0FF" : "#1C2336",
  };

  const handleLogin = async () => {
    try {
      await api.authenticate(username, password);
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace("/(tabs)");
      }
    } catch {
      setError("Feil brukernavn eller passord.");
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("Fyll ut alle feltene.");
      return;
    }
    try {
      await api.register(username, password, email);
      await api.authenticate(username, password);
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace("/(tabs)");
      }
    } catch {
      setError("Registrering feilet. Prøv et annet brukernavn.");
    }
  };

  const toggle = () => {
    setIsRegistering((v) => !v);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
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
            {isRegistering ? "Opprett konto" : "Logg inn"}
          </Text>

          {!!error && <Text className="text-warning mt-3 text-center">{error}</Text>}

          <TextInput
            className="mt-4 border rounded-xl px-4 py-3 font-semibold"
            style={inputStyle}
            placeholder="Brukernavn"
            placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
            autoCapitalize="none"
            value={username}
            onChangeText={(t) => { setUsername(t); if (error) setError(""); }}
          />

          {isRegistering && (
            <TextInput
              className="mt-3 border rounded-xl px-4 py-3 font-semibold"
              style={inputStyle}
              placeholder="E-post"
              placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => { setEmail(t); if (error) setError(""); }}
            />
          )}

          <TextInput
            className="mt-3 border rounded-xl px-4 py-3 font-semibold"
            style={inputStyle}
            placeholder="Passord"
            placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={(t) => { setPassword(t); if (error) setError(""); }}
            onSubmitEditing={isRegistering ? handleRegister : handleLogin}
          />

          <Pressable
            onPress={isRegistering ? handleRegister : handleLogin}
            className="mt-5 bg-primary rounded-xl py-3 items-center"
          >
            <Text className="text-white font-extrabold text-lg">
              {isRegistering ? "Registrer" : "Logg inn"}
            </Text>
          </Pressable>

          <Pressable onPress={toggle} className="mt-4 items-center">
            <Text className="text-primary font-semibold text-sm">
              {isRegistering
                ? "Har du allerede en konto? Logg inn"
                : "Ingen konto? Registrer deg"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
