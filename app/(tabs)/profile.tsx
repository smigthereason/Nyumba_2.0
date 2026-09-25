import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { county, favoriteIds, dataMode } = useApp();
  const { user, profile, signOut, isConfigured } = useAuth();

  const displayName =
    profile?.fullName ||
    user?.email?.split('@')[0] ||
    (user ? 'Member' : 'Guest');

  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const resetDemo = () => {
    Alert.alert('Reset local data?', 'Clears favorites, county, and onboarding on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([
            '@nyumba/county',
            '@nyumba/favorites',
            '@nyumba/onboarding_done',
          ]);
          Alert.alert('Done', 'Reload the app to see onboarding again.');
        },
      },
    ]);
  };

  const onSignOut = () => {
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.meta}>
            {user?.email ?? 'Browsing as guest'}
            {dataMode === 'mock' ? ' · Demo data' : ' · Live data'}
          </Text>
        </View>
      </View>

      {!user ? (
        <View style={styles.authActions}>
          <PrimaryButton
            label="Sign in"
            onPress={() => router.push('/(auth)' as any)}
            fullWidth
          />
          <PrimaryButton
            label="Create account"
            variant="secondary"
            onPress={() => router.push('/(auth)/signup' as any)}
            fullWidth
          />
        </View>
      ) : (
        <PrimaryButton
          label="Sign out"
          variant="ghost"
          onPress={onSignOut}
          style={{ marginTop: spacing.md }}
        />
      )}

      <Text style={styles.section}>Preferences</Text>

      <Pressable style={styles.row} onPress={() => router.push('/county-picker')}>
        <Ionicons name="location-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Preferred county</Text>
          <Text style={styles.rowValue}>{county}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <View style={styles.row}>
        <Ionicons name="cash-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Currency</Text>
          <Text style={styles.rowValue}>KES (Kenyan Shilling)</Text>
        </View>
      </View>

      <Pressable style={styles.row} onPress={() => router.push('/(tabs)/favorites')}>
        <Ionicons name="heart-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Saved homes</Text>
          <Text style={styles.rowValue}>{favoriteIds.length}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <Text style={styles.section}>About</Text>
      <View style={styles.about}>
        <Text style={styles.aboutTitle}>Nyumba</Text>
        <Text style={styles.aboutBody}>
          House hunting for Kenya — discover agencies, browse listings, and contact
          agents on WhatsApp or call.
        </Text>
        <Text style={styles.disclaimer}>
          {isConfigured
            ? 'Connected to Supabase when keys are set.'
            : 'Using built-in demo data until Supabase is configured.'}
        </Text>
      </View>

      <Pressable style={styles.reset} onPress={resetDemo}>
        <Text style={styles.resetText}>Reset local demo data</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.subtitle,
    color: colors.textInverse,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  authActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  about: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  aboutTitle: {
    ...typography.subtitle,
    color: colors.primary,
  },
  aboutBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  reset: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    padding: spacing.lg,
  },
  resetText: {
    ...typography.bodyBold,
    color: colors.error,
  },
});
