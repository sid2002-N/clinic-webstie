import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  "Unlimited habits",
  "Detailed streak analytics",
  "Custom habit icons",
  "Widget support",
];

export function PremiumModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <View
          style={[styles.iconContainer, { backgroundColor: colors.secondary }]}
        >
          <Feather name="star" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Upgrade to Premium
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          You've reached the 3 habit limit on the free plan. Upgrade to unlock
          unlimited habits and more.
        </Text>

        <View
          style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View
                style={[
                  styles.featureCheck,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather name="check" size={12} color={colors.primary} />
              </View>
              <Text
                style={[styles.featureText, { color: colors.foreground }]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
          onPress={onClose}
        >
          <Feather name="zap" size={18} color="#FFD700" />
          <Text style={[styles.upgradeText, { color: colors.primaryForeground }]}>
            Upgrade — Coming Soon
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.dismissText, { color: colors.mutedForeground }]}>
            Maybe later
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: "center",
    gap: 14,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  featuresCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  upgradeBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  upgradeText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  dismissText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
});
