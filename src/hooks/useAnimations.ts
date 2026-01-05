import { useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { animation, colors } from '../constants/theme';

/**
 * Hook for screen entry animation (fade in + slide up)
 * Returns animated values for opacity and translateY
 */
export function useEntryAnimation() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(animation.slide.initial)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: animation.slide.final,
        duration: animation.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return {
    fadeAnim,
    slideAnim,
    animatedStyle: {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    },
    fadeStyle: {
      opacity: fadeAnim,
    },
  };
}

/**
 * Hook for button press animation (scale down on press)
 * Returns scale animated value and press handlers
 */
export function useButtonPress() {
  const scaleAnim = useRef(new Animated.Value(animation.scale.normal)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: animation.scale.pressed,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: animation.scale.normal,
      useNativeDriver: true,
    }).start();
  }, []);

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
    scaleStyle: {
      transform: [{ scale: scaleAnim }],
    },
  };
}

/**
 * Hook for input border animation (color change on focus)
 * Returns animated border color and focus/blur handlers
 */
export function useBorderAnimation() {
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: animation.duration.fast,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleBlur = useCallback(() => {
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: animation.duration.fast,
      useNativeDriver: false,
    }).start();
  }, []);

  const interpolatedBorderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.borderFocused],
  });

  return {
    borderColorAnim,
    handleFocus,
    handleBlur,
    interpolatedBorderColor,
    borderStyle: {
      borderColor: interpolatedBorderColor,
    },
  };
}
