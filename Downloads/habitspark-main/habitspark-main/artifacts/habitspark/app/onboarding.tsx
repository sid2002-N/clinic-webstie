import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { addHabit } from "@/db/storage";

const ONBOARDING_KEY = "habitspark_onboarded";

const SUGGESTED = [
  { emoji: "💧", name: "Drink 8 glasses of water" },
  { emoji: "🏃", name: "Exercise 30 minutes" },
  { emoji: "📚", name: "Read 20 pages" },
  { emoji: "🧘", name: "Meditate 10 minutes" },
  { emoji: "😴", name: "Sleep 8 hours" },
  { emoji: "📝", name: "Journal" },
  { emoji: "🥗", name: "Eat healthy" },
  { emoji: "🚶", name: "Walk 10,000 steps" },
  { emoji: "💊", name: "Take vitamins" },
  { emoji: "📵", name: "No social media before noon" },
  { emoji: "🧹", name: "Tidy up for 10 minutes" },
  { emoji: "🙏", name: "Practice gratitude" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<"welcome" | "habits">("welcome");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const topPad = Platform.OS === "web" ? 44 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleHabit = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleStart = async () => {
    if (Platform.OS !== "web") {
      for (const name of selected) {
        addHabit(name);
      }
    }
    await AsyncStorage.setItem(ONBOARDING_KEY, "1").catch(() => {});
    router.replace("/(tabs)");
  };

  if (step === "welcome") {
    return (
      <View
        style={[
          styles.welcome,
          {
            backgroundColor: colors.primary,
            paddingTop: topPad + 20,
            paddingBottom: bottomPad + 20,
          },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeEmoji}>⚡</Text>
          <Text style={styles.welcomeTitle}>HabitSpark</Text>
          <Text style={styles.welcomeSub}>
            Build powerful habits, one day at a time. Track streaks, stay
            consistent, and become the best version of yourself.
          </Text>

          <View style={styles.featureList}>
            {[
              ["✅", "Track daily habits with streaks"],
              ["📊", "See your weekly progress at a glance"],
              ["🔔", "Daily reminders to keep you on track"],
              ["🏆", "Earn milestone badges as you grow"],
            ].map(([emoji, text]) => (
              <View key={text} style={styles.featureRow}>
                <Text style={styles.featureEmoji}>{emoji}</Text>
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: "#ffffff" }]}
          onPress={() => setStep("habits")}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: colors.primary }]}>
            Get Started →
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 8,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View
        style={[styles.habitHeader, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.habitHeaderTitle}>Pick your first habits</Text>
        <Text style={styles.habitHeaderSub}>
          Select a few to start — you can always add more later
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.habitGrid,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {SUGGESTED.map(({ emoji, name }) => {
          const isSelected = selected.has(name);
          return (
            <TouchableOpacity
              key={name}
              onPress={() => toggleHabit(name)}
              activeOpacity={0.8}
              style={[
                styles.habitChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={styles.habitChipEmoji}>{emoji}</Text>
              <Text
                style={[
                  styles.habitChipText,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : colors.foreground,
                  },
                ]}
              >
                {name}
              </Text>
              {isSelected && (
                <Text style={styles.habitChipCheck}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingBottom: bottomPad + 16,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.selectedCount, { color: colors.mutedForeground }]}>
          {selected.size > 0
            ? `${selected.size} habit${selected.size !== 1 ? "s" : ""} selected`
            : "Or skip and add your own"}
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: "#ffffff" }]}>
            {selected.size > 0 ? "Start Tracking 🚀" : "Start Fresh"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  welcomeEmoji: {
    fontSize: 64,
  },
  welcomeTitle: {
    fontSize: 38,
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  featureList: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 15,
    color: "#ffffff",
    fontFamily: "Inter_500Medium",
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  container: {
    flex: 1,
  },
  habitHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 4,
  },
  habitHeaderTitle: {
    fontSize: 22,
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
  },
  habitHeaderSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
  },
  habitGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  habitChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  habitChipEmoji: {
    fontSize: 22,
  },
  habitChipText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  habitChipCheck: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  selectedCount: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
