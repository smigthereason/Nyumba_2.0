import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type ConfirmedParams = {
  type?: 'viewing' | 'purchase';
  propertyTitle?: string;
  agencyName?: string;
  reference?: string;
  propertyId?: string;
};

export default function ConfirmedScreen() {
  const params = useLocalSearchParams<ConfirmedParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isPurchase = params.type === 'purchase';

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={48} color={colors.textInverse} />
      </View>

      <Text style={styles.title}>
        {isPurchase ? 'Purchase request received' : 'Viewing request received'}
      </Text>
      <Text style={styles.subtitle}>
        {isPurchase
          ? 'Your invoice has been sent to the agency. They will confirm your payment and reach out to schedule next steps.'
          : "We've notified the agency. They typically respond within a few hours."}
      </Text>

      {(params.propertyTitle || params.agencyName || params.reference) && (
        <View style={styles.card}>
          {params.propertyTitle ? (
            <Row label="Property" value={String(params.propertyTitle)} />
          ) : null}
          {params.agencyName ? <Row label="Agency" value={String(params.agencyName)} /> : null}
          {params.reference ? (
            <Row label="Reference" value={String(params.reference)} last />
          ) : null}
        </View>
      )}

      <View style={styles.actions}>
        {params.propertyId ? (
          <PrimaryButton
            label="View property"
            variant="secondary"
            fullWidth
            onPress={() => router.replace(`/property/${params.propertyId}`)}
          />
        ) : null}
        <PrimaryButton
          label="Back to Discover"
          fullWidth
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
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
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowValue: {
    ...typography.bodyBold,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    width: '100%',
    marginTop: spacing.xxxl,
  },
});
