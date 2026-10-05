import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { getAgencyById } from '@/src/data/repositories/agencies';
import { getPropertyById } from '@/src/data/repositories/properties';
import { Agency, Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { openPhone, openWhatsApp, shareProperty } from '@/src/utils/contact';
import { formatKesFull, formatPropertyType } from '@/src/utils/format';

const { width } = Dimensions.get('window');

export default function PropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useApp();

  const [property, setProperty] = useState<Property | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPropertyById(id);
      setProperty(p);
      if (p) {
        const a = await getAgencyById(p.agencyId);
        setAgency(a);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setImageIndex(i);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.loader}>
        <EmptyState title="Property not found" />
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  const fav = isFavorite(property.id);
  const priceLabel =
    property.transactionType === 'rent'
      ? `${formatKesFull(property.priceKes)} / month`
      : formatKesFull(property.priceKes);

  const requestViewing = () => {
    if (!agency || !property) return;
    router.push(`/request-viewing/${property.id}`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View>
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.hero} contentFit="cover" />
            )}
          />
          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <View style={styles.topRight}>
              <Pressable
                style={styles.iconBtn}
                onPress={() =>
                  shareProperty(property.title, property.estate, priceLabel)
                }
              >
                <Ionicons name="share-outline" size={20} color={colors.text} />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => {
                  toggleFavorite(property.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }}
              >
                <Ionicons
                  name={fav ? 'heart' : 'heart-outline'}
                  size={20}
                  color={fav ? colors.accent : colors.text}
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.dots}>
            {property.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {property.transactionType === 'rent' ? 'For Rent' : 'For Sale'}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeMuted]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                {formatPropertyType(property.propertyType)}
              </Text>
            </View>
          </View>

          <Text style={styles.price}>{priceLabel}</Text>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.location}>
              {property.estate}, {property.city}, {property.county}
            </Text>
          </View>

          <View style={styles.facts}>
            {property.bedrooms > 0 && (
              <Fact icon="bed-outline" label={`${property.bedrooms} Beds`} />
            )}
            {property.bathrooms > 0 && (
              <Fact icon="water-outline" label={`${property.bathrooms} Baths`} />
            )}
            {property.sqm != null && (
              <Fact icon="resize-outline" label={`${property.sqm} m²`} />
            )}
            {property.parking != null && property.parking > 0 && (
              <Fact icon="car-outline" label={`${property.parking} Park`} />
            )}
          </View>

          <Text style={styles.section}>About this home</Text>
          <Text style={styles.description}>{property.description}</Text>

          {property.amenities.length > 0 && (
            <>
              <Text style={styles.section}>What it offers</Text>
              <View style={styles.amenities}>
                {property.amenities.map((a) => (
                  <View key={a} style={styles.amenity}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {agency && (
            <>
              <Text style={styles.section}>Listed by</Text>
              <Pressable
                style={styles.agencyCard}
                onPress={() => router.push(`/agency/${agency.id}`)}
              >
                <Image source={{ uri: agency.logoUrl }} style={styles.agencyLogo} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <View style={styles.agencyNameRow}>
                    <Text style={styles.agencyName}>{agency.name}</Text>
                    {agency.verified && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.verified} />
                    )}
                  </View>
                  <Text style={styles.agencyMeta}>
                    ★ {agency.rating.toFixed(1)} · {agency.listingCount} listings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </>
          )}

          <PrimaryButton
            label="Request viewing"
            icon="calendar-outline"
            variant={property.transactionType === 'sale' ? 'secondary' : 'primary'}
            onPress={requestViewing}
            style={{ marginTop: spacing.xl }}
          />

          {property.transactionType === 'sale' && (
            <PrimaryButton
              label="Buy this house"
              icon="cash-outline"
              variant="accent"
              onPress={() => router.push(`/property/buy/${property.id}`)}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </View>
      </ScrollView>

      {agency && (
        <View style={[styles.sticky, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton
            label="Call"
            icon="call"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => openPhone(agency.phone)}
          />
          <PrimaryButton
            label="WhatsApp"
            icon="logo-whatsapp"
            variant="accent"
            style={{ flex: 1 }}
            onPress={() =>
              openWhatsApp(
                agency.whatsapp,
                `Hi, I'm interested in "${property.title}" (${priceLabel}) on Nyumba.`
              )
            }
          />
        </View>
      )}
    </View>
  );
}

function Fact({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.factText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  hero: {
    width,
    height: 300,
    backgroundColor: colors.chip,
  },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.textInverse,
    width: 16,
  },
  body: {
    padding: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeMuted: {
    backgroundColor: colors.chip,
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  price: {
    ...typography.priceLarge,
    color: colors.accent,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xs,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  location: {
    ...typography.body,
    color: colors.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factText: {
    ...typography.captionBold,
    color: colors.text,
  },
  section: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  amenityText: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  agencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  agencyLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.chip,
  },
  agencyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agencyName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  agencyMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sticky,
  },
});
