import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AgencyCard } from '@/src/components/AgencyCard';
import { Chip } from '@/src/components/Chip';
import { EmptyState } from '@/src/components/EmptyState';
import { PropertyCard } from '@/src/components/PropertyCard';
import { useApp } from '@/src/context/AppContext';
import { getAgencies } from '@/src/data/repositories/agencies';
import { getProperties } from '@/src/data/repositories/properties';
import { Agency, Property } from '@/src/data/types';
import { colors, radius, spacing, typography } from '@/src/theme';

type Mode = 'homes' | 'agencies';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { county, filters, updateFilters, isFavorite, toggleFavorite } = useApp();

  const [mode, setMode] = useState<Mode>('homes');
  const [query, setQuery] = useState(filters.query ?? '');
  const [properties, setProperties] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.transactionType && filters.transactionType !== 'all') n++;
    if (filters.propertyType && filters.propertyType !== 'all') n++;
    if (filters.minPrice || filters.maxPrice) n++;
    if (filters.bedrooms) n++;
    if (filters.estate) n++;
    return n;
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'homes') {
        const list = await getProperties({
          ...filters,
          query,
          county,
        });
        setProperties(list);
      } else {
        const list = await getAgencies({ query, county });
        setAgencies(list);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, filters, query, county]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder={mode === 'homes' ? 'Homes, estates, areas…' : 'Agency name…'}
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <Pressable style={styles.filterBtn} onPress={() => router.push('/filters')}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={styles.modeRow}>
          <Chip label="Homes" active={mode === 'homes'} onPress={() => setMode('homes')} />
          <Chip label="Agencies" active={mode === 'agencies'} onPress={() => setMode('agencies')} />
        </View>
        <Text style={styles.hint}>
          Showing in {county}
          {filters.transactionType && filters.transactionType !== 'all'
            ? ` · ${filters.transactionType === 'rent' ? 'Rent' : 'Sale'}`
            : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : mode === 'homes' ? (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No homes match"
              subtitle="Try another county, budget, or property type."
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => router.push(`/property/${item.id}`)}
            />
          )}
        />
      ) : (
        <FlatList
          data={agencies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="No agencies found"
              subtitle="Try a different search or county."
            />
          }
          renderItem={({ item }) => (
            <AgencyCard agency={item} onPress={() => router.push(`/agency/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.hero,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    paddingTop: spacing.md,
  },
});
