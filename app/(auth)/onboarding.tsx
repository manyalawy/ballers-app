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
import { useRouter } from "expo-router";
import { supabase } from "../../src/services/supabase";
import { useAuth } from "../../src/providers/AuthProvider";
import { Database } from "../../src/types/database.types";
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

type Sport = Database["public"]["Tables"]["sports"]["Row"];
type SkillLevel = Database["public"]["Enums"]["skill_level"];

const SKILL_LEVELS: { value: SkillLevel; label: string; color: string }[] = [
  { value: "beginner", label: "Beginner", color: colors.skillBeginner },
  {
    value: "intermediate",
    label: "Intermediate",
    color: colors.skillIntermediate,
  },
  { value: "advanced", label: "Advanced", color: colors.skillAdvanced },
  { value: "pro", label: "Pro", color: colors.skillPro },
];

interface SelectedSport {
  sportId: string;
  skillLevel: SkillLevel;
}

function SportCard({
  sport,
  isSelected,
  skillLevel,
  onPress,
  onSkillSelect,
}: {
  sport: Sport;
  isSelected: boolean;
  skillLevel: SkillLevel | null;
  onPress: () => void;
  onSkillSelect: (level: SkillLevel) => void;
}) {
  const { scaleStyle, handlePressIn, handlePressOut } = useButtonPress();
  const sportColor = sport.color || colors.primary;

  return (
    <View style={styles.sportCardWrapper}>
      <Animated.View style={scaleStyle}>
        <Pressable
          style={[
            styles.sportCard,
            isSelected && { borderColor: sportColor, borderWidth: 2 },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View
            style={[
              styles.sportIconContainer,
              { backgroundColor: `${sportColor}15` },
            ]}
          >
            <Text style={[styles.sportIcon, { color: sportColor }]}>
              {sport.icon || "⚽"}
            </Text>
          </View>
          <Text style={styles.sportName} numberOfLines={1}>
            {sport.name}
          </Text>
          {isSelected && skillLevel && (
            <View
              style={[
                styles.skillBadge,
                {
                  backgroundColor:
                    SKILL_LEVELS.find((s) => s.value === skillLevel)?.color +
                    "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.skillBadgeText,
                  {
                    color: SKILL_LEVELS.find((s) => s.value === skillLevel)
                      ?.color,
                  },
                ]}
              >
                {SKILL_LEVELS.find((s) => s.value === skillLevel)?.label}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {isSelected && (
        <View style={styles.skillPicker}>
          {SKILL_LEVELS.map((level) => (
            <Pressable
              key={level.value}
              style={[
                styles.skillOption,
                skillLevel === level.value && { backgroundColor: level.color },
              ]}
              onPress={() => onSkillSelect(level.value)}
            >
              <Text
                style={[
                  styles.skillOptionText,
                  skillLevel === level.value && { color: colors.surface },
                ]}
              >
                {level.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshOnboardingStatus } = useAuth();
  const { animatedStyle, fadeStyle } = useEntryAnimation();

  const [displayName, setDisplayName] = useState("");
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSports, setSelectedSports] = useState<SelectedSport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: sportsData, error: sportsError } = await supabase
        .from("sports")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (sportsError) throw sportsError;
      if (sportsData) setSports(sportsData);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();

        if (profileData?.display_name) {
          setDisplayName(profileData.display_name);
        }
      }
    } catch (e: any) {
      console.error("Error fetching data:", e);
      setError("Failed to load sports");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => {
      const exists = prev.find((s) => s.sportId === sportId);
      if (exists) {
        return prev.filter((s) => s.sportId !== sportId);
      }
      return [...prev, { sportId, skillLevel: "intermediate" as SkillLevel }];
    });
    setError(null);
  };

  const updateSkillLevel = (sportId: string, skillLevel: SkillLevel) => {
    setSelectedSports((prev) =>
      prev.map((s) => (s.sportId === sportId ? { ...s, skillLevel } : s))
    );
  };

  const handleComplete = async () => {
    Keyboard.dismiss();

    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (selectedSports.length === 0) {
      setError("Please select at least one sport");
      return;
    }

    if (!user) {
      setError("User not found");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", user.id);

      if (profileError) throw profileError;

      await supabase.from("user_sports").delete().eq("user_id", user.id);

      const { error: sportsError } = await supabase.from("user_sports").insert(
        selectedSports.map((s) => ({
          user_id: user.id,
          sport_id: s.sportId,
          skill_level: s.skillLevel,
        }))
      );

      if (sportsError) throw sportsError;

      await refreshOnboardingStatus();
      router.replace("/(tabs)/discover");
    } catch (e: any) {
      console.error("Error saving profile:", e);
      setError(e.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = displayName.trim().length > 0 && selectedSports.length > 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View style={[styles.headerContainer, animatedStyle]}>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>
          Tell us about yourself and the sports you play
        </Text>
      </Animated.View>

      {/* Display Name Input */}
      <Animated.View style={[styles.inputSection, animatedStyle]}>
        <AnimatedInput
          label="Your name"
          placeholder="How should we call you?"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </Animated.View>

      {/* Sports Selection */}
      <Animated.View style={[styles.sportsSection, animatedStyle]}>
        <Text style={styles.sectionLabel}>Select your sports</Text>
        <Text style={styles.sectionHint}>
          Tap to select, then choose your skill level
        </Text>

        <View style={styles.sportsGrid}>
          {sports.map((sport) => {
            const selected = selectedSports.find((s) => s.sportId === sport.id);
            return (
              <SportCard
                key={sport.id}
                sport={sport}
                isSelected={!!selected}
                skillLevel={selected?.skillLevel || null}
                onPress={() => toggleSport(sport.id)}
                onSkillSelect={(level) => updateSkillLevel(sport.id, level)}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Complete Button */}
      <Animated.View style={[styles.buttonContainer, fadeStyle]}>
        <PrimaryButton
          title="Get Started"
          onPress={handleComplete}
          loading={isSaving}
          disabled={!isValid}
        />
        <Text style={styles.selectedCount}>
          {selectedSports.length} sport{selectedSports.length !== 1 ? "s" : ""}{" "}
          selected
        </Text>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: spacing["2xl"],
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSizes["2xl"],
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
  inputSection: {
    marginBottom: spacing.sm,
  },
  sportsSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: fontSizes.base,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  sportsGrid: {
    gap: spacing.md,
  },
  sportCardWrapper: {
    marginBottom: spacing.xs,
  },
  sportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sportIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sportIcon: {
    fontSize: 22,
  },
  sportName: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.base,
    color: colors.text,
    flex: 1,
  },
  skillBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  skillBadgeText: {
    fontFamily: fonts.bodySemibold,
    fontSize: fontSizes.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skillPicker: {
    flexDirection: "row",
    marginTop: spacing.sm,
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.xs,
  },
  skillOption: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: "#F5F5F4",
    alignItems: "center",
  },
  skillOptionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  errorContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.error,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
  selectedCount: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
