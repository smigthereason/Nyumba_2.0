import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  fullWidth,
}: Props) {
  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btn,
        isPrimary && styles.primary,
        isAccent && styles.accent,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={isSecondary || isGhost ? colors.primary : colors.textInverse}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          (isSecondary || isGhost) && styles.labelDark,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    flex: 1,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
  labelDark: {
    color: colors.primary,
  },
});
