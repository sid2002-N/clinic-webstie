import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getAllTimeStats, getHabitsWithStreaks, type AllTimeStats } from "@/db/storage";

interface HabitStreak {
  habit: { id: number; name: string; createdAt: string };
  streak: number;
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AllTimeStats>({
    totalCompleted: 0,
    totalHabits: 0,
    bestStreak: 0,
    bestStreakHabit: null,
    completionRateThisWeek: 0,
  });
  const [habitStreaks, setHabitStreaks] = useState<HabitStreak[]>([]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useFocusEffect(
    useCallback(() => {
      const s = getAllTimeStats();
      setStats(s);
      setHabitStreaks(getHabitsWithStreaks());
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: topPad + 12 },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.primaryForeground }]}>
          📊 Your Stats
        </Text>
        <Text style={[styles.headerSub, { color: "rgba(255,255,255,0.75)" }]}>
          All-time progress
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.cardsGrid}>
          <StatCard
            emoji="✅"
            label="Total Completions"
            value={stats.totalCompleted.toString()}
            colors={colors}
          />
          <StatCard
            emoji="📋"
            label="Active Habits"
            value={stats.totalHabits.toString()}
            colors={colors}
          />
          <StatCard
            emoji="🔥"
            label="Best Streak"
            value={`${stats.bestStreak} days`}
            colors={colors}
          />
          <StatCard
            emoji="📈"
            label="This Week"
            value={`${stats.completionRateThisWeek}%`}
            colors={colors}
          />
        </View>

        {/* Best streak habit */}
        {stats.bestStreakHabit && stats.bestStreak > 0 && (
          <View
            style={[
              styles.highlightCard,
              { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" },
            ]}
          >
            <Text style={[styles.highlightEmoji]}>🏆</Text>
            <View style={styles.highlightText}>
              <Text style={[styles.highlightLabel, { color: colors.mutedForeground }]}>
                Longest current streak
              </Text>
              <Text style={[styles.highlightValue, { color: colors.foreground }]}>
                {stats.bestStreakHabit}
              </Text>
              <Text style={[styles.highlightCount, { color: colors.primary }]}>
                {stats.bestStreak} days in a row
              </Text>
            </View>
          </View>
        )}

        {/* Per-habit streaks */}
        {habitStreaks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Current Streaks
            </Text>
            {habitStreaks.map(({ habit, streak }) => (
              <View
                key={habit.id}
                style={[
                  styles.habitRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.habitName, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {habit.name}
                </Text>
                <View style={styles.streakRight}>
                  {streak >= 7 && (
                    <Text style={styles.badgeEmoji}>
                      {streak >= 100 ? "💎" : streak >= 30 ? "👑" : streak >= 14 ? "⭐" : "🔥"}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.streakPill,
                      { backgroundColor: streak > 0 ? colors.streakBg : colors.muted },
                    ]}
                  >
                    <Text
                      style={[
                        styles.streakCount,
                        { color: streak > 0 ? colors.streak : colors.mutedForeground },
                      ]}
                    >
                      ⚡{streak} days
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {habitStreaks.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add some habits to start tracking your progress
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({
  emoji,
  label,
  value,
  colors,
}: {
  emoji: string;
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "flex-start",
    gap: 4,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  highlightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  highlightEmoji: {
    fontSize: 36,
  },
  highlightText: {
    flex: 1,
    gap: 2,
  },
  highlightLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  highlightValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  highlightCount: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  habitName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  streakRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  streakPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  streakCount: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
