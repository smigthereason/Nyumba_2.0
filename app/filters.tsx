import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Chip } from '@/src/components/Chip';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useApp } from '@/src/context/AppContext';
import { getEstatesForCounty } from '@/src/data/repositories/locations';
import { PropertyType, TransactionType } from '@/src/data/types';
import { colors, radius, spacing, typography } from '@/src/theme';

const propertyTypes: { label: string; value: PropertyType | 'all' }[] = [
  { label: 'Any type', value: 'all' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Maisonette', value: 'maisonette' },
  { label: 'Bungalow', value: 'bungalow' },
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Studio', value: 'studio' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Land', value: 'land' },
  { label: 'Commercial', value: 'commercial' },
];

export default function FiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { county, filters, setFilters, resetFilters } = useApp();

  const [transactionType, setTransactionType] = useState<TransactionType | 'all'>(
    filters.transactionType ?? 'all'
  );
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>(
    filters.propertyType ?? 'all'
  );
  const [estate, setEstate] = useState(filters.estate ?? '');
  const [bedrooms, setBedrooms] = useState(filters.bedrooms ?? 0);
  const [minPrice, setMinPrice] = useState(
    filters.minPrice != null ? String(filters.minPrice) : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice != null ? String(filters.maxPrice) : ''
  );

  const estates = useMemo(() => getEstatesForCounty(county), [county]);

  const apply = () => {
    setFilters({
      ...filters,
      transactionType,
      propertyType,
      estate: estate || undefined,
      bedrooms: bedrooms || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    router.back();
  };

  const clear = () => {
    resetFilters();
    setTransactionType('all');
    setPropertyType('all');
    setEstate('');
    setBedrooms(0);
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Transaction</Text>
        <View style={styles.row}>
          {(['all', 'rent', 'sale'] as const).map((t) => (
            <Chip
              key={t}
              label={t === 'all' ? 'Any' : t === 'rent' ? 'For Rent' : 'For Sale'}
              active={transactionType === t}
              onPress={() => setTransactionType(t)}
            />
          ))}
        </View>

        <Text style={styles.label}>Property type</Text>
        <View style={styles.wrap}>
          {propertyTypes.map((t) => (
            <Chip
              key={t.value}
              label={t.label}
              active={propertyType === t.value}
              onPress={() => setPropertyType(t.value)}
            />
          ))}
        </View>

        <Text style={styles.label}>Estate in {county}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          <Chip label="Any estate" active={!estate} onPress={() => setEstate('')} />
          {estates.map((e) => (
            <Chip
              key={e}
              label={e}
              active={estate === e}
              onPress={() => setEstate(e)}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Bedrooms (min)</Text>
        <View style={styles.row}>
          {[0, 1, 2, 3, 4].map((n) => (
            <Chip
              key={n}
              label={n === 0 ? 'Any' : `${n}+`}
              active={bedrooms === n}
              onPress={() => setBedrooms(n)}
            />
          ))}
        </View>

        <Text style={styles.label}>Price (KES)</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={styles.input}
            placeholder="Min"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <Text style={styles.to}>to</Text>
          <TextInput
            style={styles.input}
            placeholder="Max"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton label="Clear" variant="ghost" onPress={clear} />
        <PrimaryButton label="Show results" onPress={apply} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  to: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
