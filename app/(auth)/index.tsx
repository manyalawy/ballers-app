import { useState } from "react";
import { View, Text, Animated, StyleSheet, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, EmailFormData } from "../../src/lib/validations/auth";
import { useAuth } from "../../src/providers/AuthProvider";
import { useEntryAnimation } from "../../src/hooks/useAnimations";
import {
  ScreenContainer,
  AnimatedInput,
  PrimaryButton,
} from "../../src/components/";
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
} from "../../src/constants/theme";

export default function EmailInputScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const { animatedStyle, fadeStyle } = useEntryAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: EmailFormData) => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    setApiError(null);

    const { error } = await signInWithEmail(data.email);

    if (error) {
      setApiError(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push({
      pathname: "/(auth)/verify",
      params: { email: data.email },
    });
    setIsSubmitting(false);
  };

  const displayError = errors.email?.message || apiError;

  return (
    <ScreenContainer>
      {/* Logo Placeholder */}
      <Animated.View style={[styles.logoContainer, fadeStyle]}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>BALLERS</Text>
        </View>
      </Animated.View>

      {/* Header */}
      <Animated.View style={[styles.headerContainer, animatedStyle]}>
        <Text style={styles.title}>Welcome to Ballers</Text>
        <Text style={styles.subtitle}>Enter your email to get started</Text>
      </Animated.View>

      {/* Form */}
      <Animated.View style={[styles.formContainer, animatedStyle]}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AnimatedInput
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isSubmitting}
              error={displayError}
              showLabelFocusColor
            />
          )}
        />

        <PrimaryButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, fadeStyle]}>
        <Text style={styles.footerText}>
          By continuing, you agree to our{" "}
          <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing["4xl"],
  },
  logoPlaceholder: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  logoText: {
    fontFamily: fonts.headingExtra,
    fontSize: fontSizes.xl,
    color: colors.surface,
    letterSpacing: 4,
  },
  headerContainer: {
    marginBottom: spacing["3xl"],
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes["3xl"],
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLink: {
    color: colors.primary,
    fontFamily: fonts.bodyMedium,
  },
});
