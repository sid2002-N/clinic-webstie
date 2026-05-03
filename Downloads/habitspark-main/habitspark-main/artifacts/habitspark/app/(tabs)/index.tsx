import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useHabits } from "@/hooks/useHabits";
import { useMotivation } from "@/hooks/useMotivation";
import { HabitItem } from "@/components/HabitItem";
import { AddHabitModal } from "@/components/AddHabitModal";
import { PremiumModal } from "@/components/PremiumModal";
import { MotivationBanner } from "@/components/MotivationBanner";
import { AdBanner } from "@/components/AdBanner";
import { CompletionCelebration } from "@/components/CompletionCelebration";

const FREE_HABIT_LIMIT = 3;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletedRef = useRef(0);

  const {
    habitsWithStatus,
    completedCount,
    addNewHabit,
    toggleHabit,
    removeHabit,
    totalHabits,
  } = useHabits();

  const { message } = useMotivation(completedCount);

  // Trigger celebration when all habits are freshly completed
  useEffect(() => {
    const prev = prevCompletedRef.current;
    if (
      totalHabits > 0 &&
      completedCount === totalHabits &&
      prev < totalHabits
    ) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 3500);
      return () => clearTimeout(t);
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, totalHabits]);

  const handleAddPress = useCallback(() => {
    if (totalHabits >= FREE_HABIT_LIMIT) {
      setShowPremiumModal(true);
    } else {
      setShowAddModal(true);
    }
  }, [totalHabits]);

  const handleAddHabit = useCallback(
    (name: string) => {
      addNewHabit(name);
      setShowAddModal(false);
    },
    [addNewHabit]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerEmoji}>⚡</Text>
            <Text style={[styles.headerTitle, { color: colors.primaryForeground }]}>
              HabitSpark
            </Text>
          </View>
          <View
            style={[
              styles.progressPill,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Text style={[styles.progressText, { color: colors.primaryForeground }]}>
              {completedCount}/{totalHabits}
            </Text>
          </View>
        </View>
        <Text style={[styles.dateText, { color: "rgba(255,255,255,0.75)" }]}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Habit List */}
      <FlatList
        data={habitsWithStatus}
        keyExtractor={(item) => item.habit.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPad + 110 },
        ]}
        ListHeaderComponent={
          <MotivationBanner message={message} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text style={styles.emptyEmoji}>⭐</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No habits yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap the + button below to add your first habit and start building
              your streak
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HabitItem
            habit={item.habit}
            completed={item.completed}
            streak={item.streak}
            weeklyDots={item.weeklyDots}
            onToggle={() => toggleHabit(item.habit.id, item.completed)}
            onDelete={() => removeHabit(item.habit.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.primary, bottom: bottomPad + 68 },
        ]}
        onPress={handleAddPress}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Ad Banner */}
      <View style={{ paddingBottom: bottomPad }}>
        <AdBanner />
      </View>

      {/* Modals */}
      <AddHabitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
      />
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      {/* Completion celebration — rendered on top */}
      <CompletionCelebration visible={showCelebration} />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerEmoji: { fontSize: 20 },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  progressPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginLeft: 30,
  },
  listContent: { paddingTop: 12 },
  emptyEmoji: { fontSize: 32 },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6750A4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 30,
    color: "#ffffff",
    lineHeight: 34,
    fontFamily: "Inter_400Regular",
  },
});
