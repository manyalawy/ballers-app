import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema, OtpFormData } from "../../src/lib/validations/auth";
import { useAuth } from "../../src/providers/AuthProvider";
import {
  useEntryAnimation,
  useButtonPress,
} from "../../src/hooks/useAnimations";
import {
  ScreenContainer,
  AnimatedInput,
  PrimaryButton,
} from "../../src/components";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from "../../src/constants/theme";

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, signInWithEmail } = useAuth();
  const { animatedStyle, fadeStyle } = useEntryAnimation();
  const resendButton = useButtonPress();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const codeValue = watch("code");

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: OtpFormData) => {
    if (!email) return;
    Keyboard.dismiss();
    setIsSubmitting(true);
    setApiError(null);

    const { error } = await verifyOtp(email, data.code);

    if (error) {
      setApiError(error.message);
      setIsSubmitting(false);
      return;
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setApiError(null);

    const { error } = await signInWithEmail(email);

    if (error) {
      setApiError(error.message);
    } else {
      setResendCooldown(60);
    }
    setIsResending(false);
  };

  const displayError = errors.code?.message || apiError;

  return (
    <ScreenContainer>
      {/* Mail Icon */}
      <Animated.View style={[styles.iconContainer, fadeStyle]}>
        <View style={styles.iconCircle}>
          <View style={styles.mailIcon}>
            <View style={styles.mailBody} />
            <View style={styles.mailFlap} />
          </View>
        </View>
      </Animated.View>

      {/* Header */}
      <Animated.View style={[styles.headerContainer, animatedStyle]}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a sign-in code to{"\n"}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
      </Animated.View>

      {/* OTP Input */}
      <Animated.View style={[styles.formContainer, animatedStyle]}>
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <AnimatedInput
              label="Enter 6-digit code"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isSubmitting}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              error={displayError}
              inputStyle="otp"
            />
          )}
        />

        <PrimaryButton
          title="Verify"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={codeValue.length !== 6}
        />

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Animated.View style={resendButton.scaleStyle}>
            <Pressable
              onPress={handleResend}
              onPressIn={
                resendCooldown === 0 ? resendButton.handlePressIn : undefined
              }
              onPressOut={resendButton.handlePressOut}
              disabled={resendCooldown > 0 || isResending}
            >
              {isResending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : resendCooldown > 0 ? (
                <Text style={styles.resendTextDisabled}>
                  Resend code in {resendCooldown}s
                </Text>
              ) : (
                <Text style={styles.resendText}>Resend code</Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Change Email Link */}
      <Animated.View style={[styles.footer, fadeStyle]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.changeEmailText}>Use a different email</Text>
        </Pressable>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  mailIcon: {
    width: 36,
    height: 28,
    position: "relative",
  },
  mailBody: {
    width: 36,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xs,
    position: "absolute",
    bottom: 0,
  },
  mailFlap: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.primaryDark,
    position: "absolute",
    top: 0,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes["2xl"],
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
  },
  emailText: {
    fontFamily: fonts.bodySemibold,
    color: colors.text,
  },
  formContainer: {
    flex: 1,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  resendText: {
    fontFamily: fonts.bodySemibold,
    fontSize: fontSizes.base,
    color: colors.primary,
  },
  resendTextDisabled: {
    fontFamily: fonts.body,
    fontSize: fontSizes.base,
    color: colors.textMuted,
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  changeEmailText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
});
