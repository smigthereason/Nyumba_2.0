import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '@/src/components/AuthTextField';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/context/AuthContext';
import { getAgencyById } from '@/src/data/repositories/agencies';
import { createLead } from '@/src/data/repositories/leads';
import { getPropertyById } from '@/src/data/repositories/properties';
import { Agency, Property } from '@/src/data/types';
import { colors, radius, spacing, typography } from '@/src/theme';
import { formatKesFull } from '@/src/utils/format';

export default function RequestViewingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile, updateProfile } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.fullName && !name) setName(profile.fullName);
    else if (user?.user_metadata?.full_name && !name) setName(String(user.user_metadata.full_name));

    if (profile?.phone && !phone) setPhone(profile.phone);
    else if (user?.user_metadata?.phone && !phone) setPhone(String(user.user_metadata.phone));
  }, [profile, user, name, phone]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPropertyById(id);
      setProperty(p);
      if (p) setAgency(await getAgencyById(p.agencyId));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!property || !agency || submitting) return;
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2) {
      setError('Enter your name so the agency knows who requested the viewing.');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 9) {
      setError('Enter a valid phone number so the agency can call, text, or WhatsApp you.');
      return;
    }

    const price = property.transactionType === 'rent'
      ? `${formatKesFull(property.priceKes)} / month`
      : formatKesFull(property.priceKes);
    const message = note.trim()
      ? `Viewing request for "${property.title}" (${price}). Note: ${note.trim()}`
      : `Viewing request for "${property.title}" (${price}).`;

    setSubmitting(true);
    const result = await createLead({
      propertyId: property.id,
      agencyId: agency.id,
      userId: user?.id,
      name: cleanName,
      phone: cleanPhone,
      message,
      type: 'viewing',
    });

    if (!result.ok) {
      setSubmitting(false);
      setError(result.error ?? 'We could not send the viewing request. Try again.');
      return;
    }

    if (user && (profile?.fullName !== cleanName || profile?.phone !== cleanPhone)) {
      await updateProfile({ fullName: cleanName, phone: cleanPhone });
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSubmitting(false);
    router.replace({
      pathname: '/confirmed',
      params: {
        type: 'viewing',
        propertyTitle: property.title,
        agencyName: agency.name,
        propertyId: property.id,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property || !agency) {
    return (
      <View style={styles.center}>
        <EmptyState title="Listing unavailable" subtitle="This property could not be loaded." />
        <PrimaryButton label="Close" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.nav, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel viewing request"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <Text style={styles.navButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.navTitle}>Request viewing</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <Text style={styles.propertyMeta}>{property.estate}, {property.county}</Text>
            <Text style={styles.agencyText}>Listed by {agency.name}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your contact details</Text>
        <Text style={styles.sectionHint}>
          The agency will use these details only to respond to this viewing request.
        </Text>

        <AuthTextField
          label="Full name"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          placeholder="Jane Wanjiru"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
        <AuthTextField
          label="Phone number"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          placeholder="+254 7xx xxx xxx"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="next"
        />

        <Text style={styles.fieldLabel}>Message (optional)</Text>
        <View style={styles.noteWrap}>
          <TextInput
            accessibilityLabel="Message to agency"
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Preferred day or time, questions, or anything the agency should know"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        {!user ? (
          <View style={styles.infoBox}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              You can request as a guest. Create an account later to sync favourites and reuse your contact details.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <PrimaryButton
          label={submitting ? 'Sending request…' : 'Send viewing request'}
          icon="paper-plane-outline"
          onPress={submit}
          disabled={submitting}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  nav: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  navButton: {
    minWidth: 64,
    minHeight: 44,
    justifyContent: 'center',
  },
  navButtonText: { ...typography.body, color: colors.primary },
  navTitle: { ...typography.bodyBold, color: colors.text, flex: 1, textAlign: 'center' },
  navSpacer: { width: 64 },
  content: { padding: spacing.lg },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.xxl,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  propertyTitle: { ...typography.bodyBold, color: colors.text },
  propertyMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  agencyText: { ...typography.caption, color: colors.primary, marginTop: 2 },
  sectionTitle: { ...typography.title, fontSize: 20, color: colors.text },
  sectionHint: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  noteWrap: {
    minHeight: 112,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  noteInput: { ...typography.body, color: colors.text, minHeight: 86 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginTop: spacing.lg,
  },
  infoText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  errorText: { ...typography.caption, color: colors.error, flex: 1 },
  pressed: { opacity: 0.65 },
});
