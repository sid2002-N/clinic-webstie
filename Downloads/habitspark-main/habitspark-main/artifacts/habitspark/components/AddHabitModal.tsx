import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function AddHabitModal({ visible, onClose, onAdd }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  const canAdd = name.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onShow={() => inputRef.current?.focus()}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: colors.border }]}
          />
          <Text style={[styles.title, { color: colors.foreground }]}>
            New Habit
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            What habit do you want to build?
          </Text>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="e.g. Drink water, Meditate, Exercise..."
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            maxLength={60}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.cancelBtn,
                { borderColor: colors.border },
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.addBtn,
                {
                  backgroundColor: canAdd ? colors.primary : colors.muted,
                },
              ]}
              onPress={handleAdd}
              disabled={!canAdd}
            >
              <Text
                style={[
                  styles.addText,
                  { color: canAdd ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                Add Habit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  addBtn: {},
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  addText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
