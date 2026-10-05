import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    (user?.user_metadata?.full_name ? String(user.user_metadata.full_name) : '') ||
    user?.email?.split('@')[0] ||
    (user ? 'Member' : 'Guest');

  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const resetDemo = () => {
    Alert.alert('Reset local demo data?', 'This clears favourites, county, and onboarding on this device.', [
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
          Alert.alert('Demo data reset', 'Reload the app to see onboarding again.');
        },
      },
    ]);
  };

  const onSignOut = () => {
    Alert.alert('Sign out of Nyumba?', undefined, [
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
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <Text style={styles.title}>Account</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.meta}>{user?.email ?? 'Browsing as guest'}</Text>
            {profile?.phone ? <Text style={styles.meta}>{profile.phone}</Text> : null}
          </View>
        </View>

        {!user ? (
          <View style={styles.authActions}>
            <PrimaryButton
              label="Create account"
              onPress={() => router.push('/(auth)/signup' as any)}
              fullWidth
            />
            <PrimaryButton
              label="Sign in"
              variant="secondary"
              onPress={() => router.push('/(auth)' as any)}
              fullWidth
            />
            <Text style={styles.authHint}>
              An account syncs saved homes and reuses your contact details for viewing requests.
            </Text>
          </View>
        ) : (
          <PrimaryButton
            label="Sign out"
            variant="ghost"
            onPress={onSignOut}
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        )}

        <Text style={styles.section}>Preferences</Text>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => router.push('/county-picker')}
        >
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

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => router.push('/(tabs)/favorites')}
        >
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
            Discover homes from Kenyan agencies, save favourites, request viewings, and contact agencies directly.
          </Text>
          <Text style={styles.connectionText}>
            {isConfigured ? 'Connected to the live Supabase backend.' : 'Backend configuration is missing.'}
          </Text>
        </View>

        {dataMode === 'mock' ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
            onPress={resetDemo}
          >
            <Text style={styles.resetText}>Reset local demo data</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg },
  title: { ...typography.hero, color: colors.text, marginBottom: spacing.lg },
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
  avatarText: { ...typography.subtitle, color: colors.textInverse },
  name: { ...typography.subtitle, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  authActions: { gap: spacing.sm, marginTop: spacing.lg },
  authHint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  section: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.bodyBold, color: colors.text },
  rowValue: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  about: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  aboutTitle: { ...typography.subtitle, color: colors.primary },
  aboutBody: { ...typography.body, color: colors.textSecondary },
  connectionText: { ...typography.caption, color: colors.textMuted },
  reset: { minHeight: 44, marginTop: spacing.xxl, alignItems: 'center', justifyContent: 'center' },
  resetText: { ...typography.bodyBold, color: colors.error },
  pressed: { opacity: 0.65 },
});
