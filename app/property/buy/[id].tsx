import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AuthTextField } from '@/src/components/AuthTextField';
import { BankDetailsCard } from '@/src/components/BankDetailsCard';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/context/AuthContext';
import { getAgencyById } from '@/src/data/repositories/agencies';
import { createLead } from '@/src/data/repositories/leads';
import { getPropertyById } from '@/src/data/repositories/properties';
import { Agency, Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKesFull } from '@/src/utils/format';

function makeReference() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NYB-${new Date().getFullYear()}-${rand}`;
}

export default function BuyPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<'form' | 'invoice'>('form');
  const [name, setName] = useState(profile?.fullName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reference = useMemo(() => makeReference(), []);
  const depositKes = useMemo(
    () => (property ? Math.round(property.priceKes * 0.1) : 0),
    [property]
  );

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPropertyById(id);
      setProperty(p);
      if (p) {
        const a = await getAgencyById(p.agencyId);
        setAgency(a);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!name && profile?.fullName) setName(profile.fullName);
    if (!phone && profile?.phone) setPhone(profile.phone);
    if (!email && user?.email) setEmail(user.email);
  }, [profile, user, name, phone, email]);

  const goToInvoice = () => {
    setError(null);
    if (name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (phone.trim().length < 7) {
      setError('Enter a valid phone number.');
      return;
    }
    setStep('invoice');
  };

  const submitPurchase = async () => {
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (property && agency) {
      await createLead({
        propertyId: property.id,
        agencyId: agency.id,
        userId: user?.id,
        name: name.trim(),
        phone: phone.trim(),
        message: `Purchase enquiry for "${property.title}" (ref ${reference}). Deposit details were viewed in Nyumba.`,
        type: 'purchase',
      });
    }
    setSubmitting(false);
    router.replace({
      pathname: '/confirmed',
      params: {
        type: 'purchase',
        propertyTitle: property?.title ?? '',
        agencyName: agency?.name ?? '',
        reference,
        propertyId: property?.id ?? '',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property || !agency) {
    return (
      <View style={styles.loader}>
        <EmptyState title="Listing unavailable" subtitle="This property could not be loaded." />
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => (step === 'invoice' ? setStep('form') : router.back())}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 'form' ? 'Buy this home' : 'Your invoice'}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.summary}>
            <Image source={{ uri: property.images[0] }} style={styles.summaryImage} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryPrice}>{formatKesFull(property.priceKes)}</Text>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                {property.title}
              </Text>
              <Text style={styles.summaryLoc} numberOfLines={1}>
                {property.estate}, {property.county}
              </Text>
            </View>
          </View>

          {step === 'form' ? (
            <>
              <Text style={styles.sectionTitle}>Your details</Text>
              <Text style={styles.sectionHint}>
                We&apos;ll generate an invoice with {agency.name}&apos;s bank details so you can
                pay them directly.
              </Text>

              <AuthTextField
                label="Full name"
                icon="person-outline"
                placeholder="Jane Wanjiru"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <AuthTextField
                label="Phone number"
                icon="call-outline"
                placeholder="07xx xxx xxx"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <AuthTextField
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <PrimaryButton
                label="Generate invoice"
                icon="document-text-outline"
                onPress={goToInvoice}
                fullWidth
                style={{ marginTop: spacing.sm }}
              />
            </>
          ) : (
            <>
              <View style={styles.invoiceCard}>
                <View style={styles.invoiceHeaderRow}>
                  <Text style={styles.invoiceTitle}>Invoice</Text>
                  <Text style={styles.invoiceRef}>{reference}</Text>
                </View>

                <InvoiceRow label="Buyer" value={name} />
                <InvoiceRow label="Phone" value={phone} />
                <InvoiceRow label="Email" value={email} />
                <InvoiceRow label="Property" value={property.title} />
                <InvoiceRow label="Purchase price" value={formatKesFull(property.priceKes)} />
                <InvoiceRow
                  label="Booking deposit (10%)"
                  value={formatKesFull(depositKes)}
                  emphasize
                  last
                />

                <Text style={styles.invoiceNote}>
                  Review the agency’s payment details, then contact the agency before sending funds. Nyumba does not verify payments in-app yet.
                </Text>
              </View>

              {agency.bankAccount ? (
                <View style={{ marginTop: spacing.lg }}>
                  <BankDetailsCard bankAccount={agency.bankAccount} agencyName={agency.name} />
                </View>
              ) : (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>
                    This agency hasn&apos;t added bank details yet. Contact them directly.
                  </Text>
                </View>
              )}

              <PrimaryButton
                label={submitting ? 'Sending enquiry…' : 'Send purchase enquiry'}
                icon="checkmark-circle-outline"
                variant="accent"
                onPress={submitPurchase}
                fullWidth
                style={{ marginTop: spacing.xl }}
              />
              <PrimaryButton
                label="Edit my details"
                variant="ghost"
                onPress={() => setStep('form')}
                fullWidth
                style={{ marginTop: spacing.sm }}
              />
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function InvoiceRow({
  label,
  value,
  last,
  emphasize,
}: {
  label: string;
  value: string;
  last?: boolean;
  emphasize?: boolean;
}) {
  return (
    <View style={[styles.invoiceRow, !last && styles.invoiceRowBorder]}>
      <Text style={styles.invoiceRowLabel}>{label}</Text>
      <Text style={[styles.invoiceRowValue, emphasize && styles.invoiceRowValueEmphasis]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconBtn: {
    width: 22,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  summaryImage: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.chip,
  },
  summaryPrice: {
    ...typography.price,
    color: colors.accent,
  },
  summaryTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: 2,
  },
  summaryLoc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  invoiceTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  invoiceRef: {
    ...typography.captionBold,
    color: colors.primary,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  invoiceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  invoiceRowLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  invoiceRowValue: {
    ...typography.bodyBold,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  invoiceRowValueEmphasis: {
    color: colors.accent,
    fontSize: 17,
  },
  invoiceNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
