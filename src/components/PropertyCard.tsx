import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes, formatPropertyType } from '@/src/utils/format';

type Props = {
  property: Property;
  onPress: () => void;
  horizontal?: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
};

export function PropertyCard({
  property,
  onPress,
  horizontal,
  onToggleFavorite,
  isFavorite,
}: Props) {
  const priceLabel =
    property.transactionType === 'rent'
      ? `${formatKes(property.priceKes)}/mo`
      : formatKes(property.priceKes);

  const bedsLabel =
    property.propertyType === 'land' || property.propertyType === 'commercial'
      ? formatPropertyType(property.propertyType)
      : property.bedrooms === 0
        ? formatPropertyType(property.propertyType)
        : `${property.bedrooms} bed · ${property.bathrooms} bath`;

  if (horizontal) {
    return (
      <Pressable style={styles.hCard} onPress={onPress}>
        <Image
          source={{ uri: property.images[0] }}
          style={styles.hImage}
          contentFit="cover"
        />
        <View style={styles.hBody}>
          <Text style={styles.price}>{priceLabel}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {property.title}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {property.estate}, {property.county}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Image
          source={{ uri: property.images[0] }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {property.transactionType === 'rent' ? 'For Rent' : 'For Sale'}
          </Text>
        </View>
        {onToggleFavorite && (
          <Pressable
            style={styles.favBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleFavorite();
            }}
            hitSlop={8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.accent : colors.textInverse}
            />
          </Pressable>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.price}>{priceLabel}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {property.estate}, {property.county}
          </Text>
        </View>
        <Text style={styles.meta}>{bedsLabel}</Text>
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
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.chip,
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.textInverse,
    fontSize: 11,
  },
  favBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    gap: 4,
  },
  price: {
    ...typography.price,
    color: colors.accent,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  hCard: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
    ...shadows.soft,
  },
  hImage: {
    width: '100%',
    height: 130,
    backgroundColor: colors.chip,
  },
  hBody: {
    padding: spacing.md,
    gap: 2,
  },
});
