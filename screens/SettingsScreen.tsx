import { api } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <Text
          className="font-semibold"
          style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-xs mt-1"
            style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? (
        <Text
          className="font-bold"
          style={{ color: isDark ? "#6D7CFF" : "#4F5FE8" }}
        >
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
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const toggleTheme = async () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
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

  const openProfileModal = async () => {
    try {
      const user = await api.getCurrentUser();
      setProfileUsername(user?.username ?? user?.name ?? "");
      setProfileName(user?.name ?? "");
      setProfileEmail(user?.email ?? "");
      setProfilePassword("");
    } catch {
      setProfileUsername("");
      setProfileName("");
      setProfileEmail("");
      setProfilePassword("");
    }
    setIsProfileModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (
      !profileUsername.trim() ||
      !profileName.trim() ||
      !profileEmail.trim()
    ) {
      Alert.alert("Missing fields", "Please enter username, name, and email.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await api.updateUserProfile({
        username: profileUsername.trim(),
        fullName: profileName.trim(),
        email: profileEmail.trim(),
        password: profilePassword.trim() || undefined,
      });
      setIsProfileModalVisible(false);
      Alert.alert("Success", "Your profile has been updated.");
    } catch (err) {
      console.error("Profile update failed:", err);
      Alert.alert(
        "Update failed",
        "Could not update profile. Please try again.",
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-bg" : "bg-[#F7F8FC]"}`}
      edges={["top"]}
    >
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
          <Text
            className="font-extrabold"
            style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
          >
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
        <Text
          className="text-center mt-2"
          style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}
        >
          Customize your experience
        </Text>

        <View
          className="mt-5 border rounded-xl2 py-2"
          style={{
            backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
            borderColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(79,95,232,0.18)",
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
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(79,95,232,0.16)",
            }}
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
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(79,95,232,0.16)",
            }}
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
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(79,95,232,0.16)",
            }}
          />
          <Row
            title="Update Profile"
            subtitle="Change name, email or password"
            right="›"
            onPress={openProfileModal}
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

      <Modal
        visible={isProfileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        <View
          className="flex-1 items-center justify-center px-5"
          style={{ backgroundColor: "rgba(8,12,24,0.45)" }}
        >
          <View
            className="w-full max-w-md rounded-xl2 p-5 border"
            style={{
              backgroundColor: isDark ? "#111A2E" : "#FFFFFF",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(79,95,232,0.18)",
            }}
          >
            <Text
              className="text-xl font-extrabold"
              style={{ color: isDark ? "#EAF0FF" : "#1C2336" }}
            >
              Update Profile
            </Text>

            <TextInput
              className="mt-4 border rounded-xl px-4 py-3 font-semibold"
              style={{
                backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(79,95,232,0.18)",
                color: isDark ? "#EAF0FF" : "#1C2336",
              }}
              placeholder="Username"
              placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
              autoCapitalize="none"
              value={profileUsername}
              onChangeText={setProfileUsername}
            />

            <TextInput
              className="mt-3 border rounded-xl px-4 py-3 font-semibold"
              style={{
                backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(79,95,232,0.18)",
                color: isDark ? "#EAF0FF" : "#1C2336",
              }}
              placeholder="Name"
              placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
              autoCapitalize="words"
              value={profileName}
              onChangeText={setProfileName}
            />

            <TextInput
              className="mt-3 border rounded-xl px-4 py-3 font-semibold"
              style={{
                backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(79,95,232,0.18)",
                color: isDark ? "#EAF0FF" : "#1C2336",
              }}
              placeholder="Email"
              placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
              autoCapitalize="none"
              keyboardType="email-address"
              value={profileEmail}
              onChangeText={setProfileEmail}
            />

            <TextInput
              className="mt-3 border rounded-xl px-4 py-3 font-semibold"
              style={{
                backgroundColor: isDark ? "#0B1327" : "#F9FAFF",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(79,95,232,0.18)",
                color: isDark ? "#EAF0FF" : "#1C2336",
              }}
              placeholder="New password (optional)"
              placeholderTextColor={isDark ? "#9AA6C0" : "#8B94A8"}
              autoCapitalize="none"
              secureTextEntry
              value={profilePassword}
              onChangeText={setProfilePassword}
            />

            <View className="mt-5 flex-row justify-end gap-3">
              <Pressable
                className="px-4 py-2"
                onPress={() => setIsProfileModalVisible(false)}
                disabled={isUpdatingProfile}
              >
                <Text style={{ color: isDark ? "#9AA6C0" : "#6B7285" }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="bg-primary px-4 py-2 rounded-lg"
                onPress={handleUpdateProfile}
                disabled={isUpdatingProfile}
              >
                <Text className="font-bold text-white">
                  {isUpdatingProfile ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
