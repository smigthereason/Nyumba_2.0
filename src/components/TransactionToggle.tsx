import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TransactionType } from '@/src/data/types';
import { colors, radius, spacing, typography } from '@/src/theme';

type Value = TransactionType | 'all';

type Props = {
  value: Value;
  onChange: (value: Value) => void;
};

const options: { label: string; value: Value }[] = [
  { label: 'All', value: 'all' },
  { label: 'Rent', value: 'rent' },
  { label: 'Buy', value: 'sale' },
];

export function TransactionToggle({ value, onChange }: Props) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.chip,
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textInverse,
  },
});
