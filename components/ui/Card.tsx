import { colors } from "constants/Colors";
import React from "react";
import { StyleSheet, View } from "react-native";

// Standard kort-komponent brukt i hele appen.
// Gir konsistent radius, border og shadow.

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2, // Android shadow
  },
});
