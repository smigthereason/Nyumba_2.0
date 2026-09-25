import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="unlink-outline" size={44} color={colors.primary} />
        </View>
        <Text style={styles.title}>This page took a wrong turn</Text>
        <Text style={styles.subtitle}>
          The link you followed may be broken, or the page may have been moved. Let&apos;s get you
          back on track.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label="Back to Discover"
            icon="home-outline"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
          />
          <PrimaryButton
            label="Go back"
            icon="arrow-back-outline"
            variant="ghost"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>ERROR 404 · PAGE NOT FOUND</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.hero,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  actions: {
    width: '100%',
  },
  codeBadge: {
    marginTop: spacing.xxxl,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  codeText: {
    ...typography.label,
    color: colors.textMuted,
  },
});
