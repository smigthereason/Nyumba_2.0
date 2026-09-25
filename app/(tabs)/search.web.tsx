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

import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { getAgencies } from '@/src/data/repositories/agencies';
import { getEstatesForCounty } from '@/src/data/repositories/locations';
import { getProperties } from '@/src/data/repositories/properties';
import { Agency, Property, PropertyType, TransactionType } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { WebAgencyCard } from '@/src/web/WebAgencyCard';
import { WebFooter } from '@/src/web/WebFooter';
import { WebPropertyCard } from '@/src/web/WebPropertyCard';

type Mode = 'homes' | 'agencies';

const types: { label: string; value: PropertyType | 'all' }[] = [
  { label: 'Any type', value: 'all' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Studio', value: 'studio' },
  { label: 'Land', value: 'land' },
];

/** Dynamic breakpoint hook specifically refined for Phones, iPad Air, iPad Pro, and Desktop screens */
function useSearchLayout(width: number) {
  const isPhone = width < 768;
  // iPad Mini & iPad Air Portrait
  const isTablet = width >= 768 && width < 1024;
  // iPad Pro Portrait & iPad Air/Mini Landscape (1024px to 1199px)
  const isTabletPro = width >= 1024 && width < 1280;
  // iPad Pro 12.9 Landscape & Large Desktops
  const isDesktop = width >= 1280;

  // Show persistent sidebar side-by-side for iPad Pro (>=1024px) and Desktop
  const showSidebar = width >= 1024;

  const gap = isPhone ? 12 : 20;
  const horizontalPad = isPhone ? 16 : isTablet ? 24 : 48;
  const sidebarW = 260;

  // Compute available width for main container and actual search results panel
  const maxContainerW = Math.min(width, 1400);
  const contentW = maxContainerW - horizontalPad * 2;
  const resultsW = showSidebar ? contentW - sidebarW - gap : contentW;

  // Determine ideal number of columns based on actual available space in the results panel
  let cols = 1;
  if (resultsW >= 900) {
    cols = 3;
  } else if (resultsW >= 500) {
    cols = 2;
  } else {
    cols = 1;
  }

  // Calculate percentage width with gap compensation for seamless grid alignment across screens
  const cardW = cols === 1 ? '100%' : `${(100 - (cols - 1) * (gap / resultsW * 100)) / cols}%`;

  return {
    isPhone,
    isTablet,
    isTabletPro,
    isDesktop,
    showSidebar,
    cols,
    gap,
    horizontalPad,
    cardW,
  };
}

export default function WebSearchPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const layout = useSearchLayout(width);
  const { county, filters, updateFilters, resetFilters } = useApp();

  const [mode, setMode] = useState<Mode>('homes');
  const [query, setQuery] = useState(filters.query ?? '');
  const [properties, setProperties] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const estates = useMemo(() => getEstatesForCounty(county), [county]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'homes') {
        setProperties(
          await getProperties({
            ...filters,
            query,
            county,
          })
        );
      } else {
        setAgencies(await getAgencies({ query, county }));
      }
    } finally {
      setLoading(false);
    }
  }, [mode, filters, query, county]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const setTx = (t: TransactionType | 'all') => updateFilters({ transactionType: t });
  const setType = (t: PropertyType | 'all') => updateFilters({ propertyType: t });

  const FiltersPanel = (
    <View style={[styles.sidebar, layout.showSidebar && styles.sidebarSticky]}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sideTitle}>Filters</Text>
        {!layout.showSidebar && (
          <Pressable onPress={() => setMobileFiltersOpen(false)} hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeBtn, mode === 'homes' && styles.modeBtnOn]}
          onPress={() => setMode('homes')}
        >
          <Text style={[styles.modeText, mode === 'homes' && styles.modeTextOn]}>Homes</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'agencies' && styles.modeBtnOn]}
          onPress={() => setMode('agencies')}
        >
          <Text style={[styles.modeText, mode === 'agencies' && styles.modeTextOn]}>
            Agencies
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Search</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Keywords…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {mode === 'homes' && (
        <>
          <Text style={styles.label}>Transaction</Text>
          <View style={styles.pills}>
            {(['all', 'rent', 'sale'] as const).map((t) => (
              <Pill
                key={t}
                label={t === 'all' ? 'Any' : t === 'rent' ? 'Rent' : 'Sale'}
                active={(filters.transactionType ?? 'all') === t}
                onPress={() => setTx(t)}
              />
            ))}
          </View>

          <Text style={styles.label}>Property type</Text>
          <View style={styles.pills}>
            {types.map((t) => (
              <Pill
                key={t.value}
                label={t.label}
                active={(filters.propertyType ?? 'all') === t.value}
                onPress={() => setType(t.value)}
              />
            ))}
          </View>

          <Text style={styles.label}>Estate</Text>
          <View style={styles.pills}>
            <Pill
              label="Any"
              active={!filters.estate}
              onPress={() => updateFilters({ estate: undefined })}
            />
            {estates.map((e) => (
              <Pill
                key={e}
                label={e}
                active={filters.estate === e}
                onPress={() => updateFilters({ estate: e })}
              />
            ))}
          </View>

          <Text style={styles.label}>Min bedrooms</Text>
          <View style={styles.pills}>
            {[0, 1, 2, 3, 4].map((n) => (
              <Pill
                key={n}
                label={n === 0 ? 'Any' : `${n}+`}
                active={(filters.bedrooms ?? 0) === n}
                onPress={() => updateFilters({ bedrooms: n || undefined })}
              />
            ))}
          </View>
        </>
      )}

      <Pressable
        style={styles.clear}
        onPress={() => {
          resetFilters();
          setQuery('');
        }}
      >
        <Text style={styles.clearText}>Clear filters</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View
        style={[
          styles.inner,
          {
            paddingHorizontal: layout.horizontalPad,
            paddingTop: layout.isPhone ? spacing.lg : spacing.xxl,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, layout.isPhone && { fontSize: 26 }]}>
            Search {mode === 'homes' ? 'homes' : 'agencies'}
          </Text>
          <Text style={styles.sub}>
            Showing results in <Text style={styles.em}>{county}</Text>
          </Text>
        </View>

        {/* Mobile/Tablet Filter Toggle */}
        {!layout.showSidebar && (
          <Pressable
            style={styles.mobileFilterBtn}
            onPress={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <Ionicons name="options-outline" size={18} color={colors.primary} />
            <Text style={styles.mobileFilterBtnText}>
              {mobileFiltersOpen ? 'Hide Filters' : 'Filter Results'}
            </Text>
          </Pressable>
        )}

        {!layout.showSidebar && mobileFiltersOpen && FiltersPanel}

        <View style={[styles.layout, !layout.showSidebar && styles.layoutStack]}>
          {layout.showSidebar && FiltersPanel}

          <View style={[styles.results, layout.showSidebar && { flex: 1, minWidth: 0 }]}>
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : mode === 'homes' ? (
              properties.length === 0 ? (
                <EmptyState
                  title="No homes match"
                  subtitle="Try another county, budget, or property type."
                />
              ) : (
                <>
                  <Text style={styles.count}>{properties.length} homes found</Text>
                  <View style={[styles.grid, { gap: layout.gap }]}>
                    {properties.map((p) => (
                      <View
                        key={p.id}
                        style={{
                          width: layout.cardW as any,
                          maxWidth: '100%',
                        }}
                      >
                        <WebPropertyCard
                          property={p}
                          onPress={() => router.push(`/property/${p.id}` as any)}
                        />
                      </View>
                    ))}
                  </View>
                </>
              )
            ) : agencies.length === 0 ? (
              <EmptyState title="No agencies found" subtitle="Try another search or county." />
            ) : (
              <>
                <Text style={styles.count}>{agencies.length} agencies found</Text>
                <View style={[styles.grid, { gap: layout.gap }]}>
                  {agencies.map((a) => (
                    <View
                      key={a.id}
                      style={{
                        width: layout.cardW as any,
                        maxWidth: '100%',
                      }}
                    >
                      <WebAgencyCard
                        agency={a}
                        onPress={() => router.push(`/agency/${a.id}` as any)}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.pill, active && styles.pillOn]} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', backgroundColor: colors.background },
  content: { flexGrow: 1 },
  inner: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing.xxl,
  },
  header: { marginBottom: spacing.md },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  sub: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  em: { fontWeight: '700', color: colors.primary },
  mobileFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  mobileFilterBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  layout: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  layoutStack: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    marginBottom: spacing.lg,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sidebarSticky: {
    // @ts-expect-error web sticky
    position: 'sticky',
    top: 16,
    alignSelf: 'flex-start',
    marginBottom: 0,
  } as any,
  sideTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.chip,
    borderRadius: radius.full,
    padding: 4,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  modeBtnOn: { backgroundColor: colors.surface, ...shadows.soft },
  modeText: { ...typography.captionBold, color: colors.textMuted },
  modeTextOn: { color: colors.primary },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    // @ts-expect-error web
    outlineStyle: 'none',
  } as any,
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.chip,
  },
  pillOn: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pillText: { ...typography.captionBold, color: colors.textSecondary },
  pillTextOn: { color: colors.primary },
  clear: { marginTop: spacing.lg, alignItems: 'center', padding: spacing.xs },
  clearText: { ...typography.bodyBold, color: colors.error },
  results: { minWidth: 0, width: '100%' },
  count: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
