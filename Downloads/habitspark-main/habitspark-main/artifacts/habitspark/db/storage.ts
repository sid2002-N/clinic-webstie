import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export interface Habit {
  id: number;
  name: string;
  createdAt: string;
}

export interface DailyLog {
  id: number;
  habitId: number;
  date: string;
  completed: number;
}

export interface AllTimeStats {
  totalCompleted: number;
  totalHabits: number;
  bestStreak: number;
  bestStreakHabit: string | null;
  completionRateThisWeek: number;
}

let _db: SQLite.SQLiteDatabase | null = null;

function db(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync("habitspark.db");
    _db.execSync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habitId INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        UNIQUE(habitId, date)
      );
    `);
  }
  return _db;
}

export function initDB(): void {
  if (Platform.OS === "web") return;
  db();
}

export function getAllHabits(): Habit[] {
  if (Platform.OS === "web") return [];
  return db().getAllSync<Habit>("SELECT * FROM habits ORDER BY createdAt ASC");
}

export function addHabit(name: string): Habit {
  if (Platform.OS === "web") {
    return { id: 0, name, createdAt: new Date().toISOString() };
  }
  const createdAt = new Date().toISOString();
  const result = db().runSync(
    "INSERT INTO habits (name, createdAt) VALUES (?, ?)",
    [name, createdAt]
  );
  return { id: result.lastInsertRowId, name, createdAt };
}

export function deleteHabit(id: number): void {
  if (Platform.OS === "web") return;
  db().runSync("DELETE FROM habits WHERE id = ?", [id]);
  db().runSync("DELETE FROM daily_logs WHERE habitId = ?", [id]);
}

export function toggleHabitToday(habitId: number, completed: boolean): void {
  if (Platform.OS === "web") return;
  const date = getTodayString();
  db().runSync(
    "INSERT OR REPLACE INTO daily_logs (habitId, date, completed) VALUES (?, ?, ?)",
    [habitId, date, completed ? 1 : 0]
  );
}

export function isHabitCompletedToday(habitId: number): boolean {
  if (Platform.OS === "web") return false;
  const date = getTodayString();
  const row = db().getFirstSync<{ completed: number }>(
    "SELECT completed FROM daily_logs WHERE habitId = ? AND date = ?",
    [habitId, date]
  );
  return row ? row.completed === 1 : false;
}

export function calculateStreak(habitId: number): number {
  if (Platform.OS === "web") return 0;
  const logs = db().getAllSync<{ date: string }>(
    "SELECT date FROM daily_logs WHERE habitId = ? AND completed = 1 ORDER BY date DESC",
    [habitId]
  );

  if (logs.length === 0) return 0;

  const completedDates = new Set(logs.map((l) => l.date));
  const today = getTodayString();
  const yesterday = getDateOffset(-1);

  if (!completedDates.has(today) && !completedDates.has(yesterday)) return 0;

  const startOffset = completedDates.has(today) ? 0 : 1;
  let streak = 0;

  for (let i = startOffset; i < 365; i++) {
    const dateStr = getDateOffset(-i);
    if (!completedDates.has(dateStr)) break;
    streak++;
  }

  return streak;
}

export function getCompletedCountToday(): number {
  if (Platform.OS === "web") return 0;
  const date = getTodayString();
  const row = db().getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM daily_logs WHERE date = ? AND completed = 1",
    [date]
  );
  return row?.count ?? 0;
}

export function getWeeklyStatus(habitId: number): boolean[] {
  if (Platform.OS === "web") return Array(7).fill(false);
  const result: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = getDateOffset(-i);
    const row = db().getFirstSync<{ completed: number }>(
      "SELECT completed FROM daily_logs WHERE habitId = ? AND date = ?",
      [habitId, dateStr]
    );
    result.push(row?.completed === 1);
  }
  return result;
}

export function getAllTimeStats(): AllTimeStats {
  if (Platform.OS === "web") {
    return {
      totalCompleted: 0,
      totalHabits: 0,
      bestStreak: 0,
      bestStreakHabit: null,
      completionRateThisWeek: 0,
    };
  }

  const totalRow = db().getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM daily_logs WHERE completed = 1"
  );
  const habits = getAllHabits();

  let bestStreak = 0;
  let bestStreakHabit: string | null = null;

  for (const h of habits) {
    const s = calculateStreak(h.id);
    if (s > bestStreak) {
      bestStreak = s;
      bestStreakHabit = h.name;
    }
  }

  let weeklyPossible = habits.length * 7;
  let weeklyCompleted = 0;
  if (weeklyPossible > 0) {
    for (let i = 0; i < 7; i++) {
      const dateStr = getDateOffset(-i);
      const row = db().getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM daily_logs WHERE date = ? AND completed = 1",
        [dateStr]
      );
      weeklyCompleted += row?.count ?? 0;
    }
  }

  return {
    totalCompleted: totalRow?.count ?? 0,
    totalHabits: habits.length,
    bestStreak,
    bestStreakHabit,
    completionRateThisWeek:
      weeklyPossible > 0
        ? Math.round((weeklyCompleted / weeklyPossible) * 100)
        : 0,
  };
}

export function getHabitsWithStreaks(): Array<{ habit: Habit; streak: number }> {
  if (Platform.OS === "web") return [];
  const habits = getAllHabits();
  return habits.map((habit) => ({ habit, streak: calculateStreak(habit.id) }));
}

export function clearAllData(): void {
  if (Platform.OS === "web") return;
  db().execSync("DELETE FROM habits");
  db().execSync("DELETE FROM daily_logs");
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDateOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}
