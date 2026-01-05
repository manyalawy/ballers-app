import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useButtonPress } from "../hooks/useAnimations";
import {
  colors,
  fonts,
  fontSizes,
  borderRadius,
  shadows,
} from "../constants/theme";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const { scaleStyle, handlePressIn, handlePressOut } = useButtonPress();
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[scaleStyle, style]}>
      <Pressable
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        {loading ? (
          <ActivityIndicator color={colors.surface} size="small" />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    ...shadows.buttonDisabled,
  },
  buttonText: {
    fontFamily: fonts.bodySemibold,
    fontSize: fontSizes.lg,
    color: colors.surface,
    letterSpacing: 0.3,
  },
});
