import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { Habit } from "@/db/storage";

interface Props {
  habit: Habit;
  completed: boolean;
  streak: number;
  weeklyDots: boolean[];
  onToggle: () => void;
  onDelete: () => void;
}

function getMilestoneBadge(streak: number): string | null {
  if (streak >= 100) return "💎";
  if (streak >= 30) return "👑";
  if (streak >= 14) return "⭐";
  if (streak >= 7) return "🔥";
  return null;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.deleteAction}
      activeOpacity={0.8}
    >
      <Text style={styles.deleteEmoji}>🗑</Text>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );
}

export function HabitItem({
  habit,
  completed,
  streak,
  weeklyDots,
  onToggle,
  onDelete,
}: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const swipeableRef = useRef<Swipeable>(null);

  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    scale.value = withSpring(1.3, { damping: 6 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    onToggle();
  };

  const handleDeletePress = () => {
    swipeableRef.current?.close();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Alert.alert("Delete Habit", `Remove "${habit.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  const milestone = getMilestoneBadge(streak);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <DeleteAction onPress={handleDeletePress} />
      )}
      rightThreshold={60}
      friction={2}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.8}
        style={[
          styles.container,
          {
            backgroundColor: completed ? colors.secondary : colors.card,
            borderColor: completed ? colors.primary + "30" : colors.border,
          },
        ]}
      >
        {/* Main row */}
        <View style={styles.mainRow}>
          <Animated.View
            style={[
              styles.checkbox,
              checkboxStyle,
              {
                backgroundColor: completed ? colors.primary : "transparent",
                borderColor: completed ? colors.primary : colors.border,
              },
            ]}
          >
            {completed && <Text style={styles.checkmark}>✓</Text>}
          </Animated.View>

          <Text
            style={[
              styles.name,
              {
                color: completed ? colors.mutedForeground : colors.foreground,
                textDecorationLine: completed ? "line-through" : "none",
              },
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>

          <View style={styles.badges}>
            {milestone !== null && (
              <Text style={styles.milestoneBadge}>{milestone}</Text>
            )}
            {streak > 0 && (
              <View
                style={[styles.streakBadge, { backgroundColor: colors.streakBg }]}
              >
                <Text style={[styles.streakText, { color: colors.streak }]}>
                  ⚡{streak}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 7-day dot grid */}
        <View style={styles.dotsRow}>
          {weeklyDots.map((done, i) => (
            <View key={i} style={styles.dotCol}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done ? colors.primary : colors.border,
                    opacity: done ? 1 : 0.4,
                  },
                ]}
              />
              <Text style={[styles.dotLabel, { color: colors.mutedForeground }]}>
                {DAY_LABELS[i]}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  milestoneBadge: {
    fontSize: 18,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 38,
  },
  dotCol: {
    alignItems: "center",
    gap: 2,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
  },
  deleteAction: {
    width: 75,
    marginVertical: 5,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  deleteEmoji: {
    fontSize: 20,
  },
  deleteText: {
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
