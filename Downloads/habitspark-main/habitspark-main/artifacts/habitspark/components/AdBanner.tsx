import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

export function AdBanner() {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderTopColor: colors.border },
      ]}
    >
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Ad</Text>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        Advertisement • Banner Ad (Test)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    borderWidth: 1,
    borderColor: "currentColor",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
