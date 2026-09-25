import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Agency } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type Props = {
  agency: Agency;
  onPress: () => void;
};

export function WebAgencyCard({ agency, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: any) => [styles.card, hovered && styles.cardHover]}
    >
      <Image source={{ uri: agency.coverUrl }} style={styles.cover} contentFit="cover" />
      <View style={styles.body}>
        <Image source={{ uri: agency.logoUrl }} style={styles.logo} contentFit="cover" />
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {agency.name}
          </Text>
          {agency.verified && (
            <Ionicons name="checkmark-circle" size={18} color={colors.verified} />
          )}
        </View>
        <View style={styles.stats}>
          <Ionicons name="star" size={13} color={colors.star} />
          <Text style={styles.statText}>{agency.rating.toFixed(1)}</Text>
          <Text style={styles.muted}> · {agency.listingCount} homes</Text>
        </View>
        <Text style={styles.bio} numberOfLines={2}>
          {agency.bio}
        </Text>
        <Text style={styles.counties} numberOfLines={1}>
          {agency.counties.join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 280,
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    // @ts-expect-error web
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  } as any,
  cardHover: {
    // @ts-expect-error web
    transform: [{ translateY: -4 }],
    ...shadows.card,
  } as any,
  cover: {
    width: '100%',
    height: 130,
    backgroundColor: colors.chip,
  },
  body: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginTop: -36,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.chip,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
    flexShrink: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  statText: {
    ...typography.captionBold,
    color: colors.text,
  },
  muted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bio: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  counties: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
});
