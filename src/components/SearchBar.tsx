import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme';

type Props = {
  placeholder?: string;
  value?: string;
  onPress?: () => void;
};

export function SearchBar({
  placeholder = 'Search agencies or neighbourhoods',
  value,
  onPress,
}: Props) {
  return (
    <Pressable style={styles.bar} onPress={onPress}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <Text style={[styles.text, !value && styles.placeholder]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <View style={styles.filterIcon}>
        <Ionicons name="options-outline" size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  filterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
