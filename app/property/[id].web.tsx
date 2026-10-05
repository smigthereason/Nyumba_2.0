import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { getAgencyById } from '@/src/data/repositories/agencies';
import { getPropertyById } from '@/src/data/repositories/properties';
import { Agency, Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { openPhone, openWhatsApp, shareProperty } from '@/src/utils/contact';
import { formatKesFull, formatPropertyType } from '@/src/utils/format';
import { WebFooter } from '@/src/web/WebFooter';

export default function WebPropertyPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const { isFavorite, toggleFavorite } = useApp();

  const [property, setProperty] = useState<Property | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPropertyById(id);
      setProperty(p);
      if (p) setAgency(await getAgencyById(p.agencyId));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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
        <PrimaryButton label="Back to search" onPress={() => router.push('/search' as any)} />
      </View>
    );
  }

  const fav = isFavorite(property.id);
  const priceLabel =
    property.transactionType === 'rent'
      ? `${formatKesFull(property.priceKes)} / month`
      : formatKesFull(property.priceKes);

  const hasCoords = property.lat != null && property.lng != null;

  const requestViewing = () => {
    if (!agency) return;
    router.push(`/request-viewing/${property.id}`);
  };

  const mapEmbedUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${property.lng! - 0.012}%2C${property.lat! - 0.008}%2C${property.lng! + 0.012}%2C${property.lat! + 0.008}&layer=mapnik&marker=${property.lat}%2C${property.lng}`
    : null;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={[styles.layout, !wide && styles.layoutStack]}>
        {/* LEFT: Gallery + Map */}
        <View style={[styles.leftCol, wide && { flex: 1.15 }]}>
          <Image
            source={{ uri: property.images[activeImg] || property.images[0] }}
            style={styles.mainImage}
            contentFit="cover"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbs}
            contentContainerStyle={{ gap: 8 }}
          >
            {property.images.map((img, i) => (
              <Pressable key={i} onPress={() => setActiveImg(i)}>
                <Image
                  source={{ uri: img }}
                  style={[styles.thumb, i === activeImg && styles.thumbActive]}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Location map — fills the previous whitespace */}
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.mapTitle}>Location</Text>
              <Text style={styles.mapSub} numberOfLines={1}>
                {property.estate}, {property.city}
              </Text>
            </View>

            {mapEmbedUrl && Platform.OS === 'web' ? (
              // @ts-expect-error web-only iframe
              <iframe
                title="Property location"
                src={mapEmbedUrl}
                style={{
                  width: '100%',
                  height: 240,
                  border: 0,
                  borderRadius: 16,
                  display: 'block',
                }}
              />
            ) : (
              <View style={styles.mapFallback}>
                <Ionicons name="map-outline" size={28} color={colors.textMuted} />
                <Text style={styles.mapFallbackText}>
                  {hasCoords
                    ? `${property.lat!.toFixed(4)}, ${property.lng!.toFixed(4)}`
                    : 'Location coordinates not available'}
                </Text>
              </View>
            )}

            {hasCoords && (
              <Pressable
                style={styles.mapLink}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.open(
                      `https://www.openstreetmap.org/?mlat=${property.lat}&mlon=${property.lng}#map=16/${property.lat}/${property.lng}`,
                      '_blank'
                    );
                  }
                }}
              >
                <Text style={styles.mapLinkText}>Open in maps</Text>
                <Ionicons name="open-outline" size={14} color={colors.primary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* RIGHT: Details + CTAs */}
        <View style={[styles.panel, wide && { flex: 1 }]}>
          <View style={styles.badges}>
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
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.loc}>
              {property.estate}, {property.city}, {property.county}
            </Text>
          </View>

          <View style={styles.facts}>
            {property.bedrooms > 0 && <Fact label={`${property.bedrooms} Beds`} icon="bed-outline" />}
            {property.bathrooms > 0 && (
              <Fact label={`${property.bathrooms} Baths`} icon="water-outline" />
            )}
            {property.sqm != null && <Fact label={`${property.sqm} m²`} icon="resize-outline" />}
            {property.parking != null && property.parking > 0 && (
              <Fact label={`${property.parking} Park`} icon="car-outline" />
            )}
          </View>

          <Text style={styles.section}>About this home</Text>
          <Text style={styles.desc}>{property.description}</Text>

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
            <Pressable
              style={styles.agency}
              onPress={() => router.push(`/agency/${agency.id}` as any)}
            >
              <Image source={{ uri: agency.logoUrl }} style={styles.agencyLogo} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.agencyName}>{agency.name}</Text>
                <Text style={styles.agencyMeta}>
                  ★ {agency.rating.toFixed(1)} · {agency.listingCount} listings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <PrimaryButton
              label={fav ? 'Saved' : 'Save'}
              icon={fav ? 'heart' : 'heart-outline'}
              variant="secondary"
              onPress={() => toggleFavorite(property.id)}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="Share"
              icon="share-outline"
              variant="ghost"
              onPress={() => shareProperty(property.title, property.estate, priceLabel)}
              style={{ flex: 1 }}
            />
          </View>

          <PrimaryButton
            label="Request viewing"
            icon="calendar-outline"
            onPress={requestViewing}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />

          {property.transactionType === 'sale' && (
            <PrimaryButton
              label="Buy this house"
              icon="cash-outline"
              variant="accent"
              onPress={() => router.push(`/property/buy/${property.id}` as any)}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          )}

          {agency && (
            <View style={styles.contactRow}>
              <PrimaryButton
                label="Call"
                icon="call"
                variant="secondary"
                onPress={() => openPhone(agency.phone)}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="WhatsApp"
                icon="logo-whatsapp"
                variant="accent"
                onPress={() =>
                  openWhatsApp(
                    agency.whatsapp,
                    `Hi, I'm interested in "${property.title}" (${priceLabel}) on Nyumba.`
                  )
                }
                style={{ flex: 1 }}
              />
            </View>
          )}
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

function Fact({
  label,
  icon,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.factText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', backgroundColor: colors.background },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 0,
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
    minHeight: 400,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  backText: { ...typography.bodyBold, color: colors.primary },
  layout: { flexDirection: 'row', gap: spacing.xxl, alignItems: 'flex-start' },
  layoutStack: { flexDirection: 'column' },
  leftCol: { minWidth: 280, gap: spacing.md },
  mainImage: {
    width: '100%',
    height: 400,
    borderRadius: 24,
    backgroundColor: colors.chip,
  },
  thumbs: { marginTop: 4 },
  thumb: {
    width: 88,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: colors.primary },
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapTitle: { ...typography.bodyBold, color: colors.text },
  mapSub: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  mapFallback: {
    height: 180,
    borderRadius: 16,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapFallbackText: { ...typography.caption, color: colors.textMuted },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  mapLinkText: { ...typography.captionBold, color: colors.primary },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    minWidth: 280,
  },
  badges: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeMuted: { backgroundColor: colors.chip },
  badgeText: { ...typography.captionBold, color: colors.primary },
  price: { fontSize: 32, fontWeight: '800', color: colors.accent, marginTop: 4 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
    letterSpacing: -0.4,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  loc: { ...typography.body, color: colors.textSecondary },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.xl },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factText: { ...typography.captionBold, color: colors.text },
  section: { ...typography.subtitle, color: colors.text, marginTop: spacing.xxl, marginBottom: 8 },
  desc: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  amenityText: { ...typography.captionBold, color: colors.primaryDark },
  agency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  agencyLogo: { width: 48, height: 48, borderRadius: 12 },
  agencyName: { ...typography.bodyBold, color: colors.text },
  agencyMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: spacing.xl },
  contactRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
});
