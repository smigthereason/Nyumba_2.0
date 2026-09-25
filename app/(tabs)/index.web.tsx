import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '@/src/context/AppContext';
import { getAgencies, getFeaturedAgencies } from '@/src/data/repositories/agencies';
import { getFeaturedProperties, getProperties } from '@/src/data/repositories/properties';
import { Agency, Property, PropertyType, TransactionType } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { WebAgencyCard } from '@/src/web/WebAgencyCard';
import { WebFooter } from '@/src/web/WebFooter';
import { WebPropertyCard } from '@/src/web/WebPropertyCard';

const HERO_IMG =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop';

const chips: {
  label: string;
  transactionType?: TransactionType;
  propertyType?: PropertyType;
}[] = [
  { label: 'For Rent', transactionType: 'rent' },
  { label: 'For Sale', transactionType: 'sale' },
  { label: 'Apartments', propertyType: 'apartment' },
  { label: 'Houses', propertyType: 'house' },
  { label: 'Bedsitters', propertyType: 'bedsitter' },
  { label: 'Land', propertyType: 'land' },
];

/** Enhanced breakpoints tuned specifically for Phone, iPad / Air / Pro, and Large Desktop */
function useLayout(width: number) {
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1280; // Handles iPad mini, iPad Air, & iPad Pro (Portrait/Landscape)
  const isDesktop = width >= 1280;

  // 3 columns for iPad Pro / large tablets and desktop; 2 for standard portrait tablets; 1 for phones
  const cols = width >= 960 ? 3 : isTablet ? 2 : 1;
  const pad = isPhone ? 16 : isTablet ? 32 : 40;
  const sectionGap = isPhone ? 28 : isTablet ? 36 : 48;
  const maxContent = Math.min(width, 1200);

  const heroTitleSize = isPhone ? 28 : isTablet ? 40 : 48;
  const heroTitleLine = isPhone ? 34 : isTablet ? 48 : 54;
  const heroSubSize = isPhone ? 15 : isTablet ? 17 : 18;
  const sectionTitleSize = isPhone ? 22 : isTablet ? 28 : 32;

  return {
    isPhone,
    isTablet,
    isDesktop,
    cols,
    pad,
    sectionGap,
    maxContent,
    heroTitleSize,
    heroTitleLine,
    heroSubSize,
    sectionTitleSize,
  };
}

function gridWidth(screenW: number, cols: number, pad: number) {
  const gap = 20;
  const max = Math.min(screenW, 1200) - pad * 2;
  return (max - gap * (cols - 1)) / cols;
}

export default function WebHomePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const layout = useLayout(width);
  const { county, setFilters } = useApp();

  const [query, setQuery] = useState('');
  const [featuredAgencies, setFeaturedAgencies] = useState<Agency[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const cardW = useMemo(
    () => gridWidth(width, layout.cols, layout.pad),
    [width, layout.cols, layout.pad]
  );

  const load = useCallback(async () => {
    const [fa, all, fp, recent] = await Promise.all([
      getFeaturedAgencies(county),
      getAgencies({ county }),
      getFeaturedProperties(county),
      getProperties({ county }),
    ]);
    setFeaturedAgencies(fa);
    setAgencies(all);
    setFeaturedProperties(fp);
    setRecentProperties(recent.slice(0, 6));
  }, [county]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const goSearch = (extra?: {
    transactionType?: TransactionType;
    propertyType?: PropertyType;
  }) => {
    setFilters({
      transactionType: extra?.transactionType ?? 'all',
      propertyType: extra?.propertyType ?? 'all',
      query: query.trim() || undefined,
    });
    router.push('/search' as any);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {/* ── HERO ───────────────────────────────────────── */}
      <View
        style={[
          styles.hero,
          {
            minHeight: layout.isPhone ? 480 : layout.isTablet ? 540 : 560,
            paddingVertical: layout.isPhone ? 40 : 64,
          },
        ]}
      >
        <Image source={{ uri: HERO_IMG }} style={styles.heroBg} contentFit="cover" />
        <LinearGradient
          colors={['rgba(10,47,36,0.75)', 'rgba(10,47,36,0.55)', 'rgba(10,47,36,0.85)']}
          style={styles.heroBg}
        />

        <View style={[styles.heroInner, { paddingHorizontal: layout.pad }]}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Kenya’s agency-first house hunt</Text>
          </View>

          <Text
            style={[
              styles.heroTitle,
              {
                fontSize: layout.heroTitleSize,
                lineHeight: layout.heroTitleLine,
              },
            ]}
          >
            Find your next home{'\n'}with agencies you trust
          </Text>

          <Text
            style={[
              styles.heroSub,
              {
                fontSize: layout.heroSubSize,
                lineHeight: layout.heroSubSize + 8,
                marginBottom: layout.isPhone ? 24 : 36,
              },
            ]}
          >
            Browse real estate companies like storefronts — rentals, sales, and land across{' '}
            {county} and beyond. Call or WhatsApp in one click.
          </Text>

          {/* Search card */}
          <View
            style={[
              styles.searchCard,
              {
                maxWidth: layout.isPhone ? '100%' : 720,
                padding: layout.isPhone ? 14 : 20,
              },
            ]}
          >
            <View
              style={[
                styles.searchRow,
                layout.isPhone && { flexDirection: 'column', alignItems: 'stretch', gap: 10 },
              ]}
            >
              <View style={styles.searchInputWrap}>
                <Ionicons name="search" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search estates, neighbourhoods…"
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => goSearch()}
                />
              </View>
              <Pressable
                style={[styles.searchBtn, layout.isPhone && { alignSelf: 'stretch' }]}
                onPress={() => goSearch()}
              >
                <Text style={styles.searchBtnText}>Search</Text>
              </Pressable>
            </View>

            <View style={styles.chipRow}>
              {chips.map((c) => (
                <Pressable
                  key={c.label}
                  style={styles.chip}
                  onPress={() =>
                    goSearch({
                      transactionType: c.transactionType,
                      propertyType: c.propertyType,
                    })
                  }
                >
                  <Text style={styles.chipText}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View
            style={[
              styles.statsRow,
              {
                marginTop: layout.isPhone ? 28 : 40,
                gap: layout.isPhone ? 20 : 40,
              },
            ]}
          >
            <Stat value={`${agencies.length}+`} label="Agencies" />
            <Stat value={`${recentProperties.length}+`} label="Listings near you" />
            {!layout.isPhone && <Stat value="KES" label="Local pricing" />}
            {!layout.isPhone && <Stat value="24/7" label="Browse anytime" />}
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 60 }} color={colors.primary} size="large" />
      ) : (
        <>
          {/* Featured agencies */}
          <Section
            title="Featured agencies"
            subtitle={`Top-rated partners serving ${county}`}
            action="View all"
            onAction={() => router.push('/search' as any)}
            pad={layout.pad}
            titleSize={layout.sectionTitleSize}
          >
            <View style={styles.grid}>
              {featuredAgencies.slice(0, layout.cols * 2).map((a) => (
                <View key={a.id} style={{ width: cardW, maxWidth: '100%' }}>
                  <WebAgencyCard
                    agency={a}
                    onPress={() => router.push(`/agency/${a.id}` as any)}
                  />
                </View>
              ))}
            </View>
          </Section>

          {/* Featured homes */}
          <Section
            title="Homes you’ll love"
            subtitle="Hand-picked featured listings"
            action="See all homes"
            onAction={() => goSearch()}
            pad={layout.pad}
            titleSize={layout.sectionTitleSize}
          >
            <View style={styles.grid}>
              {featuredProperties.slice(0, layout.cols * 2).map((p) => (
                <View key={p.id} style={{ width: cardW, maxWidth: '100%' }}>
                  <WebPropertyCard
                    property={p}
                    onPress={() => router.push(`/property/${p.id}` as any)}
                  />
                </View>
              ))}
            </View>
          </Section>

          {/* How it works */}
          <View
            style={[
              styles.howBand,
              {
                paddingHorizontal: layout.pad,
                paddingVertical: layout.isPhone ? 40 : 56,
              },
            ]}
          >
            <Text
              style={[
                styles.howTitle,
                { fontSize: layout.sectionTitleSize, marginBottom: layout.isPhone ? 24 : 36 },
              ]}
            >
              How Nyumba works
            </Text>
            <View style={styles.howGrid}>
              <HowCard
                step="01"
                title="Discover agencies"
                body="Browse verified real estate companies by county — like picking a trusted shop."
                icon="business"
              />
              <HowCard
                step="02"
                title="Filter your home"
                body="Rent or buy, set budget in KES, beds, estates from Westlands to Nyali."
                icon="options"
              />
              <HowCard
                step="03"
                title="Contact instantly"
                body="Call or WhatsApp the agency, save favourites, and request a viewing."
                icon="chatbubbles"
              />
            </View>
          </View>

          {/* All agencies */}
          <Section
            title={`Agencies in ${county}`}
            subtitle="Open a storefront to see their full catalogue"
            pad={layout.pad}
            titleSize={layout.sectionTitleSize}
          >
            <View style={styles.grid}>
              {agencies.map((a) => (
                <View key={a.id} style={{ width: cardW, maxWidth: '100%' }}>
                  <WebAgencyCard
                    agency={a}
                    onPress={() => router.push(`/agency/${a.id}` as any)}
                  />
                </View>
              ))}
            </View>
          </Section>

          {/* CTA */}
          <View
            style={[
              styles.ctaBand,
              {
                paddingHorizontal: layout.pad,
                paddingBottom: layout.isPhone ? 40 : 56,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.ctaGradient,
                { padding: layout.isPhone ? 28 : layout.isTablet ? 36 : 48 },
              ]}
            >
              <Text
                style={[
                  styles.ctaTitle,
                  { fontSize: layout.isPhone ? 22 : layout.isTablet ? 26 : 28 },
                ]}
              >
                Ready to find your dream home?
              </Text>
              <Text style={styles.ctaSub}>
                Create a free account to sync saved homes across phone and web.
              </Text>
              <View
                style={[
                  styles.ctaRow,
                  layout.isPhone && { flexDirection: 'column', width: '100%' },
                ]}
              >
                <Pressable
                  style={[styles.ctaPrimary, layout.isPhone && { width: '100%' }]}
                  onPress={() => router.push('/signup' as any)}
                >
                  <Text style={styles.ctaPrimaryText}>Get started free</Text>
                </Pressable>
                <Pressable
                  style={[styles.ctaGhost, layout.isPhone && { width: '100%' }]}
                  onPress={() => goSearch()}
                >
                  <Text style={styles.ctaGhostText}>Browse homes</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </>
      )}

      <WebFooter />
    </ScrollView>
  );
}

/* ── Small helpers ─────────────────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  subtitle,
  action,
  onAction,
  children,
  pad,
  titleSize,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
  pad: number;
  titleSize: number;
}) {
  return (
    <View style={[styles.section, { paddingHorizontal: pad }]}>
      <View style={styles.sectionHead}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.sectionTitle, { fontSize: titleSize }]}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
        </View>
        {action && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text style={styles.sectionAction}>{action} →</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function HowCard({
  step,
  title,
  body,
  icon,
}: {
  step: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.howCard}>
      <Text style={styles.howStep}>{step}</Text>
      <View style={styles.howIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.howCardTitle}>{title}</Text>
      <Text style={styles.howCardBody}>{body}</Text>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  pageContent: {
    flexGrow: 1,
  },

  hero: {
    justify: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.2,
    marginBottom: spacing.md,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 560,
  },

  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    ...shadows.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    // @ts-expect-error web
    outlineStyle: 'none',
    paddingVertical: 10,
  } as any,
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.primary,
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stat: {
    minWidth: 90,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  section: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 40,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
  },
  sectionSub: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionAction: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },

  howBand: {
    backgroundColor: colors.primarySoft,
  },
  howTitle: {
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  howGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  howCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  howStep: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1,
    marginBottom: 12,
  },
  howIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  howCardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 8,
  },
  howCardBody: {
    ...typography.body,
    color: colors.textSecondary,
  },

  ctaBand: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  ctaGradient: {
    borderRadius: 28,
    alignItems: 'center',
  },
  ctaTitle: {
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSub: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 24,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  ctaPrimary: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  ctaPrimaryText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  ctaGhost: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  ctaGhostText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});
