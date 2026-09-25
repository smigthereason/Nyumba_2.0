import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Agency } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type Props = {
  agency: Agency;
  onPress: () => void;
  compact?: boolean;
};

export function AgencyCard({ agency, onPress, compact }: Props) {
  if (compact) {
    return (
      <Pressable style={styles.compact} onPress={onPress}>
        <Image source={{ uri: agency.coverUrl }} style={styles.compactCover} contentFit="cover" />
        <View style={styles.compactBody}>
          <Image source={{ uri: agency.logoUrl }} style={styles.compactLogo} contentFit="cover" />
          <Text style={styles.compactName} numberOfLines={1}>
            {agency.name}
          </Text>
          <View style={styles.row}>
            <Ionicons name="star" size={12} color={colors.star} />
            <Text style={styles.ratingText}>{agency.rating.toFixed(1)}</Text>
            <Text style={styles.muted}> · {agency.listingCount} homes</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: agency.coverUrl }} style={styles.cover} contentFit="cover" />
      <View style={styles.body}>
        <Image source={{ uri: agency.logoUrl }} style={styles.logo} contentFit="cover" />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {agency.name}
            </Text>
            {agency.verified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.verified} />
            )}
          </View>
          <View style={styles.row}>
            <Ionicons name="star" size={13} color={colors.star} />
            <Text style={styles.ratingText}>{agency.rating.toFixed(1)}</Text>
            <Text style={styles.muted}> ({agency.reviewCount})</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.muted}>{agency.listingCount} listings</Text>
          </View>
          <Text style={styles.counties} numberOfLines={1}>
            {agency.counties.join(' · ')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cover: {
    width: '100%',
    height: 120,
    backgroundColor: colors.chip,
  },
  body: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.chip,
    marginTop: -36,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typography.captionBold,
    color: colors.text,
  },
  muted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dot: {
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  counties: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  compact: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
    ...shadows.soft,
  },
  compactCover: {
    width: '100%',
    height: 90,
    backgroundColor: colors.chip,
  },
  compactBody: {
    padding: spacing.md,
  },
  compactLogo: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    marginTop: -28,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.chip,
  },
  compactName: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
});
