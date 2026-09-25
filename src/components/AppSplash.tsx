import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing, typography } from '@/src/theme';
import Logo from '@/assets/images/Nyumba-Logo.png';

type Props = {
  onFinish: () => void;
  durationMs?: number;
};

export function AppSplash({ onFinish, durationMs = 1100 }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const wrapOpacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.back(1.2)) });
    wrapOpacity.value = withDelay(Math.max(durationMs - 220, 0), withTiming(0, { duration: 220 }));

    const timer = setTimeout(onFinish, durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: wrapOpacity.value,
  }));

  return (
    <Animated.View style={[styles.screen, wrapStyle]}>
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Image source={Logo} style={styles.logo} contentFit="contain" />
        <Text style={styles.brand}>Nyumba</Text>
        <Text style={styles.tagline}>Find your dream home in Kenya</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logoWrap: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logo: {
    width: 76,
    height: 76,
    marginBottom: spacing.sm,
  },
  brand: {
    ...typography.hero,
    color: colors.primary,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
