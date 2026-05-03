import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  message: string | null;
}

export function MotivationBanner({ message }: Props) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.secondary,
          borderColor: colors.primary + "20",
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
        <Text style={styles.iconEmoji}>✨</Text>
      </View>
      <Text style={[styles.message, { color: colors.foreground }]}>
        {message ?? "Every habit you build today is a brick in the person you're becoming."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  iconEmoji: {
    fontSize: 16,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    flexWrap: "wrap",
  },
});
