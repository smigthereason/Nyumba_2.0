import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { getCountyByName } from '@/src/data/repositories/locations';
import { getProperties } from '@/src/data/repositories/properties';
import { Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes } from '@/src/utils/format';
import { WebFooter } from '@/src/web/WebFooter';

/** Dynamic breakpoint hook for Maps: handles Phone, iPad Air, iPad Pro, & Desktop */
function useMapLayout(width: number, height: number) {
  const isPhone = width < 768;
  const isTabletPortrait = width >= 768 && width < 1024;
  const isTabletProOrDesktop = width >= 1024;

  const isSplitLayout = isTabletProOrDesktop;
  const horizontalPad = isPhone ? 12 : isTabletPortrait ? 20 : 36;
  const gap = isPhone ? 12 : 20;

  const mapHeight = isSplitLayout
    ? Math.max(500, height - 200)
    : isPhone
    ? 280
    : 380;

  return {
    isPhone,
    isTabletPortrait,
    isTabletProOrDesktop,
    isSplitLayout,
    horizontalPad,
    gap,
    mapHeight,
  };
}

export default function MapScreen() {
  const router = useRouter();
  const { county } = useApp();
  const { width, height } = useWindowDimensions();
  const layout = useMapLayout(width, height);

  // Ref to programmatically scroll the page to top on mobile tap
  const scrollRef = useRef<ScrollView>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState({ lat: -1.2921, lng: 36.8219 });
  const [selected, setSelected] = useState<Property | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, countyData] = await Promise.all([
        getProperties({ county }),
        getCountyByName(county),
      ]);
      const mapped = list.filter((p) => p.lat && p.lng);
      setProperties(mapped);
      if (countyData) {
        setCenter({ lat: countyData.lat, lng: countyData.lng });
      } else if (mapped[0]) {
        setCenter({ lat: mapped[0].lat, lng: mapped[0].lng });
      }
    } finally {
      setLoading(false);
    }
  }, [county]);

  useEffect(() => {
    load();
  }, [load]);

  const focus = selected ?? properties[0];
  const mapUrl = focus
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${focus.lng - 0.035}%2C${focus.lat - 0.025}%2C${focus.lng + 0.035}%2C${focus.lat + 0.025}&layer=mapnik&marker=${focus.lat}%2C${focus.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.08}%2C${center.lat - 0.06}%2C${center.lng + 0.08}%2C${center.lat + 0.06}&layer=mapnik`;

  /** Two-step interaction handler */
  const handleCardPress = (item: Property) => {
    if (layout.isSplitLayout) {
      // Side-by-side mode (iPad Pro / Desktop): update highlighted pin
      setSelected(item);
    } else {
      // Mobile / Stacked layout
      if (selected?.id === item.id) {
        // Second tap on already highlighted card: navigate to details
        router.push(`/property/${item.id}` as any);
      } else {
        // First tap: highlight property on map and smoothly auto-scroll up to view map
        setSelected(item);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.inner,
            {
              paddingHorizontal: layout.horizontalPad,
              paddingTop: layout.isPhone ? spacing.md : spacing.xl,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, layout.isPhone && { fontSize: 26 }]}>Map</Text>
            <Text style={styles.subtitle}>
              {loading
                ? 'Loading…'
                : `${properties.length} homes with locations in ${county}`}
            </Text>
          </View>

          <View style={[styles.layout, !layout.isSplitLayout && styles.layoutStack, { gap: layout.gap }]}>
            {/* MAP PANE */}
            <View
              style={[
                styles.mapPane,
                layout.isSplitLayout && ({
                  flex: 1.4,
                  position: 'sticky',
                  top: 16,
                  alignSelf: 'flex-start',
                  height: layout.mapHeight,
                } as any),
                !layout.isSplitLayout && { height: layout.mapHeight },
              ]}
            >
              {loading ? (
                <View style={styles.mapLoading}>
                  <ActivityIndicator color={colors.primary} size="large" />
                </View>
              ) : Platform.OS === 'web' ? (
                // @ts-expect-error web-only
                <iframe
                  title="Nyumba map"
                  src={mapUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    borderRadius: 20,
                    display: 'block',
                  }}
                />
              ) : null}
            </View>

            {/* LIST PANE */}
            <View style={[styles.listPane, layout.isSplitLayout && { flex: 1, minWidth: 320 }]}>
              {loading ? null : properties.length === 0 ? (
                <EmptyState title="No mapped homes" subtitle="Try another county." />
              ) : (
                <View style={!layout.isSplitLayout && layout.isTabletPortrait ? styles.tabletGrid : undefined}>
                  {properties.map((item) => {
                    const active = selected?.id === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        style={[
                          styles.card,
                          active && styles.cardActive,
                          !layout.isSplitLayout && layout.isTabletPortrait && styles.tabletGridCard,
                        ]}
                        onPress={() => handleCardPress(item)}
                      >
                        <Image
                          source={{ uri: item.images[0] }}
                          style={styles.image}
                          contentFit="cover"
                        />
                        <View style={styles.body}>
                          <Text style={styles.price}>
                            {item.transactionType === 'rent'
                              ? `${formatKes(item.priceKes)}/mo`
                              : formatKes(item.priceKes)}
                          </Text>
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.loc} numberOfLines={1}>
                            {item.estate}, {item.county}
                          </Text>
                          {!layout.isSplitLayout && active && (
                            <Text style={styles.tapHint}>Tap again to view home details</Text>
                          )}
                        </View>

                        {/* Chevron button always directly opens details page */}
                        <Pressable
                          style={styles.chevronWrap}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/property/${item.id}` as any);
                          }}
                          hitSlop={8}
                        >
                          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </Pressable>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

        <WebFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing.xxl,
  },
  header: { marginBottom: spacing.md },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  layout: { flexDirection: 'row', alignItems: 'flex-start' },
  layoutStack: { flexDirection: 'column' },
  mapPane: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapLoading: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justify: 'center',
  },
  listPane: { width: '100%', gap: spacing.sm },
  tabletGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tabletGridCard: { width: '48.5%' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    ...shadows.soft,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  image: { width: 84, height: 84, backgroundColor: colors.chip },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  price: { ...typography.price, color: colors.accent, fontSize: 15 },
  cardTitle: { ...typography.bodyBold, color: colors.text },
  loc: { ...typography.caption, color: colors.textSecondary },
  tapHint: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
    marginTop: 2,
  },
  chevronWrap: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
