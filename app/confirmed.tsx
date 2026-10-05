import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, radius, spacing, typography } from '@/src/theme';

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
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.main}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={34} color={colors.textInverse} />
          </View>

          <Text style={styles.title}>
            {isPurchase ? 'Request sent' : 'Viewing requested'}
          </Text>
          <Text style={styles.subtitle}>
            {isPurchase
              ? 'The agency received your purchase enquiry and will contact you about the next steps.'
              : `${params.agencyName || 'The agency'} received your request and can now call, text, or WhatsApp you.`}
          </Text>

          {(params.propertyTitle || params.agencyName || params.reference) ? (
            <View style={styles.card}>
              {params.propertyTitle ? <Row label="Property" value={String(params.propertyTitle)} /> : null}
              {params.agencyName ? <Row label="Agency" value={String(params.agencyName)} /> : null}
              {params.reference ? <Row label="Reference" value={String(params.reference)} last /> : null}
            </View>
          ) : null}
        </View>

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
            label="Done"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: params.propertyId ? spacing.sm : 0 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  main: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowValue: {
    ...typography.bodyBold,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    width: '100%',
    paddingTop: spacing.xxxl,
  },
});
