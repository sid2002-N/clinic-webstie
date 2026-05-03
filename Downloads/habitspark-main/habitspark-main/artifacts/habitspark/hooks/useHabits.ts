import { useState, useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";
import {
  getAllHabits,
  addHabit,
  deleteHabit,
  toggleHabitToday,
  isHabitCompletedToday,
  calculateStreak,
  getCompletedCountToday,
  getWeeklyStatus,
  type Habit,
} from "@/db/storage";

export interface HabitWithStatus {
  habit: Habit;
  completed: boolean;
  streak: number;
  weeklyDots: boolean[];
}

export function useHabits() {
  const [habitsWithStatus, setHabitsWithStatus] = useState<HabitWithStatus[]>(
    []
  );
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const habits = getAllHabits();
    const withStatus = habits.map((habit) => ({
      habit,
      completed: isHabitCompletedToday(habit.id),
      streak: calculateStreak(habit.id),
      weeklyDots: getWeeklyStatus(habit.id),
    }));
    setHabitsWithStatus(withStatus);
    setCompletedCount(getCompletedCountToday());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addNewHabit = useCallback(
    (name: string) => {
      addHabit(name.trim());
      refresh();
    },
    [refresh]
  );

  const toggleHabit = useCallback(
    (habitId: number, currentCompleted: boolean) => {
      toggleHabitToday(habitId, !currentCompleted);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      refresh();
    },
    [refresh]
  );

  const removeHabit = useCallback(
    (habitId: number) => {
      deleteHabit(habitId);
      refresh();
    },
    [refresh]
  );

  return {
    habitsWithStatus,
    completedCount,
    loading,
    addNewHabit,
    toggleHabit,
    removeHabit,
    totalHabits: habitsWithStatus.length,
  };
}
