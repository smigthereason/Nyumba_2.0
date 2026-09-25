import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BankAccount } from '@/src/data/types';
import { colors, radius, spacing, typography } from '@/src/theme';

type Props = {
  bankAccount: BankAccount;
  agencyName: string;
};

export function BankDetailsCard({ bankAccount, agencyName }: Props) {
  const [copied, setCopied] = useState(false);

  const copyAccountNumber = async () => {
    await Clipboard.setStringAsync(bankAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="business" size={18} color={colors.primary} />
        <Text style={styles.headerText}>Pay {agencyName} directly</Text>
      </View>
      <Text style={styles.note}>
        This purchase is paid straight to the agency&apos;s bank account below — Nyumba does not
        hold or process the funds.
      </Text>

      <Row label="Bank" value={bankAccount.bankName} />
      <Row label="Account name" value={bankAccount.accountName} />
      <View style={[styles.rowWrap, styles.rowBorder]}>
        <Text style={styles.rowLabel}>Account number</Text>
        <View style={styles.acctRow}>
          <Text style={styles.acctNumber}>{bankAccount.accountNumber}</Text>
          <Pressable style={styles.copyBtn} onPress={copyAccountNumber} hitSlop={8}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? colors.primary : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
      <Row label="Branch" value={bankAccount.branch} />
      {bankAccount.paybill ? (
        <Row label="M-Pesa Paybill" value={bankAccount.paybill} last />
      ) : null}
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.rowWrap, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerText: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  rowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,110,79,0.15)',
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.bodyBold,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  acctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  acctNumber: {
    ...typography.bodyBold,
    color: colors.text,
    letterSpacing: 0.5,
  },
  copyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
