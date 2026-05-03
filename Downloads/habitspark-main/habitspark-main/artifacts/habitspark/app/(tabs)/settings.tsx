import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { clearAllData } from "@/db/storage";
import {
  getNotificationHour,
  scheduleHabitReminder,
} from "@/utils/notifications";

const NOTIFICATION_TIMES = [
  { label: "6 AM", hour: 6 },
  { label: "8 AM", hour: 8 },
  { label: "12 PM", hour: 12 },
  { label: "6 PM", hour: 18 },
  { label: "8 PM", hour: 20 },
  { label: "10 PM", hour: 22 },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isDark, themePreference, setThemePreference } = useTheme();
  const [notifHour, setNotifHour] = useState(20);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useFocusEffect(
    useCallback(() => {
      getNotificationHour().then(setNotifHour).catch(() => {});
    }, [])
  );

  const handleThemeToggle = async (value: boolean) => {
    await setThemePreference(value ? "dark" : "light");
  };

  const handleNotifTime = async (hour: number) => {
    setNotifHour(hour);
    await scheduleHabitReminder(hour);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your habits and progress. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              clearAllData();
            }
            await AsyncStorage.multiRemove([
              "habitspark_motivation_v1",
              "habitspark_onboarded",
            ]).catch(() => {});
            Alert.alert(
              "Data Reset",
              "All your habits and progress have been cleared."
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: topPad + 12 },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.primaryForeground }]}>
          ⚙️ Settings
        </Text>
        <Text style={[styles.headerSub, { color: "rgba(255,255,255,0.75)" }]}>
          Preferences & account
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SectionHeader title="Appearance" colors={colors} />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>🌙</Text>
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                  Dark Mode
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.mutedForeground }]}
                >
                  {themePreference === "system"
                    ? "Following system"
                    : isDark
                    ? "On"
                    : "Off"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
          <View
            style={[styles.divider, { backgroundColor: colors.border }]}
          />
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setThemePreference("system")}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>📱</Text>
              <View>
                <Text
                  style={[styles.settingLabel, { color: colors.foreground }]}
                >
                  Follow System
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.mutedForeground }]}
                >
                  Automatically match your device theme
                </Text>
              </View>
            </View>
            {themePreference === "system" && (
              <Text style={[styles.checkmark, { color: colors.primary }]}>
                ✓
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" colors={colors} />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[styles.notifLabel, { color: colors.mutedForeground }]}
          >
            🔔 Daily reminder time
          </Text>
          <View style={styles.timeGrid}>
            {NOTIFICATION_TIMES.map(({ label, hour }) => (
              <TouchableOpacity
                key={hour}
                onPress={() => handleNotifTime(hour)}
                activeOpacity={0.8}
                style={[
                  styles.timeChip,
                  {
                    backgroundColor:
                      notifHour === hour ? colors.primary : colors.secondary,
                    borderColor:
                      notifHour === hour ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    {
                      color:
                        notifHour === hour
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data */}
        <SectionHeader title="Data" colors={colors} />
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>🗑</Text>
              <View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: colors.destructive },
                  ]}
                >
                  Reset All Data
                </Text>
                <Text
                  style={[styles.settingDesc, { color: colors.mutedForeground }]}
                >
                  Delete all habits and progress
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          HabitSpark v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

function SectionHeader({
  title,
  colors,
}: {
  title: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
      {title.toUpperCase()}
    </Text>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  notifLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  timeChipText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 24,
  },
});
