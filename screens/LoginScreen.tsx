import { api } from "@/lib/api";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = { onSuccess?: () => void };

export default function LoginScreen({ onSuccess }: Props) {
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
    <View className="flex-1 bg-bg items-center justify-center px-6">
      <View className="w-full max-w-md bg-card border border-border rounded-xl2 p-5">
        <Text className="text-text text-2xl font-extrabold text-center">
          Login
        </Text>

        {!!error && <Text className="text-warning mt-3 text-center">{error}</Text>}

        <TextInput
          className="mt-4 bg-black/20 border border-border rounded-xl px-4 py-3 text-text"
          placeholder="Email"
          placeholderTextColor="#9AA6C0"
          autoCapitalize="none"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (error) setError("");
          }}
        />

        <TextInput
          className="mt-3 bg-black/20 border border-border rounded-xl px-4 py-3 text-text"
          placeholder="Password"
          placeholderTextColor="#9AA6C0"
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
          <Text className="text-white font-extrabold">Logg inn</Text>
        </Pressable>
      </View>
    </View>
  );
}
