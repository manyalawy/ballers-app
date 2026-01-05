import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Animated,
  StyleSheet,
} from "react-native";
import { useBorderAnimation } from "../hooks/useAnimations";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from "../constants/theme";

interface AnimatedInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string | null;
  showLabelFocusColor?: boolean;
  inputStyle?: "default" | "otp";
}

export const AnimatedInput = forwardRef<TextInput, AnimatedInputProps>(
  (
    {
      label,
      error,
      showLabelFocusColor = false,
      inputStyle = "default",
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const { handleFocus, handleBlur, interpolatedBorderColor } =
      useBorderAnimation();

    const handleInputFocus = (e: any) => {
      setIsFocused(true);
      handleFocus();
      onFocus?.(e);
    };

    const handleInputBlur = (e: any) => {
      setIsFocused(false);
      handleBlur();
      onBlur?.(e);
    };

    const isOtp = inputStyle === "otp";

    return (
      <View style={styles.wrapper}>
        {label && (
          <Text
            style={[
              styles.label,
              isOtp && styles.labelCentered,
              showLabelFocusColor && isFocused && styles.labelFocused,
            ]}
          >
            {label}
          </Text>
        )}
        <Animated.View
          style={[
            styles.inputContainer,
            isOtp && styles.inputContainerOtp,
            { borderColor: interpolatedBorderColor },
          ]}
        >
          <TextInput
            ref={ref}
            style={[styles.input, isOtp && styles.inputOtp]}
            placeholderTextColor={
              isOtp ? colors.textPlaceholder : colors.textMuted
            }
            {...props}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </Animated.View>
        {error && (
          <View
            style={[
              styles.errorContainer,
              isOtp && styles.errorContainerCentered,
            ]}
          >
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  labelCentered: {
    textAlign: "center",
  },
  labelFocused: {
    color: colors.primary,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  inputContainerOtp: {
    borderWidth: 2,
    borderRadius: borderRadius["2xl"],
  },
  input: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    height: 56,
  },
  inputOtp: {
    fontFamily: fonts.heading,
    fontSize: 32,
    paddingHorizontal: spacing.xl,
    paddingVertical: 20,
    height: 80,
    textAlign: "center",
    letterSpacing: 12,
  },
  errorContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  errorContainerCentered: {
    alignItems: "center",
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.error,
  },
});
