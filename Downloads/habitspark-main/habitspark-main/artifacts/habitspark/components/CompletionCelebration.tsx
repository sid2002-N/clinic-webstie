import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
}

const MESSAGES = [
  "All done for today! 🎉",
  "You crushed it today! 🏆",
  "Perfect day! Keep it up! ⭐",
  "Full streak! Amazing! 🔥",
];

export function CompletionCelebration({ visible }: Props) {
  const colors = useColors();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const message = useRef(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }
  }, [visible, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          transform: [{ translateY }],
          opacity,
          pointerEvents: "none",
        },
      ]}
    >
      <View style={styles.inner}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  inner: {
    alignItems: "center",
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
});
