import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setJson(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKeys(keys: string[]) {
  await AsyncStorage.multiRemove(keys);
}
