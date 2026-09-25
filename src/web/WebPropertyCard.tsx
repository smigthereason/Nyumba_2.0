import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes, formatPropertyType } from '@/src/utils/format';

type Props = {
  property: Property;
  onPress: () => void;
};

export function WebPropertyCard({ property, onPress }: Props) {
  const price =
    property.transactionType === 'rent'
      ? `${formatKes(property.priceKes)}/mo`
      : formatKes(property.priceKes);

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: any) => [styles.card, hovered && styles.cardHover]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: property.images[0] }} style={styles.image} contentFit="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {property.transactionType === 'rent' ? 'For Rent' : 'For Sale'}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>
            {property.estate}, {property.county}
          </Text>
        </View>
        <Text style={styles.facts}>
          {property.bedrooms > 0
            ? `${property.bedrooms} bed · ${property.bathrooms} bath`
            : formatPropertyType(property.propertyType)}
          {property.sqm ? ` · ${property.sqm} m²` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 260,
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    // @ts-expect-error web
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  } as any,
  cardHover: {
    // @ts-expect-error web
    transform: [{ translateY: -4 }],
    ...shadows.card,
  } as any,
  imageWrap: {
    height: 200,
    backgroundColor: colors.chip,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
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
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  facts: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
