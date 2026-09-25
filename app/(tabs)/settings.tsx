import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors, radius, spacing, typography } from '@/src/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const resetDemo = () => {
    Alert.alert('Reset demo data?', 'This clears favorites, county, and onboarding.', [
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Text style={styles.section}>Preferences</Text>
      <View style={styles.row}>
        <Ionicons name="cash-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Currency</Text>
          <Text style={styles.rowValue}>KES (Kenyan Shilling)</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Notifications</Text>
          <Text style={styles.rowValue}>New listings and price drops</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <Text style={styles.section}>About</Text>
      <View style={styles.about}>
        <Text style={styles.aboutTitle}>Nyumba</Text>
        <Text style={styles.aboutBody}>
          Prototype house-hunting app for Kenya. Browse real estate agencies like
          restaurants on Uber Eats, explore their listings, and contact them on WhatsApp
          or call.
        </Text>
        <Text style={styles.disclaimer}>
          Demo data only — not a live marketplace. Built for agency demos.
        </Text>
      </View>
      <Text style={styles.version}>Version 1.0.0 (Demo)</Text>

      <Pressable style={styles.reset} onPress={resetDemo}>
        <Text style={styles.resetText}>Reset demo data</Text>
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
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
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
