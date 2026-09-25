import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Image,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AgencyCard } from '@/src/components/AgencyCard';
import { Chip } from '@/src/components/Chip';
import { ProjectCard } from '@/src/components/ProjectCard';
import { PropertyCard } from '@/src/components/PropertyCard';
import { SearchBar } from '@/src/components/SearchBar';
import { SectionHeader } from '@/src/components/SectionHeader';
import { TransactionToggle } from '@/src/components/TransactionToggle';
import { useApp } from '@/src/context/AppContext';
import { getAgencies, getFeaturedAgencies } from '@/src/data/repositories/agencies';
import { getFeaturedProperties } from '@/src/data/repositories/properties';
import { getUpcomingProjects } from '@/src/data/repositories/projects';
import { Agency, Property, PropertyType, TransactionType, UpcomingProject } from '@/src/data/types';
import { colors, spacing, typography } from '@/src/theme';
import Logo from '@/assets/images/Nyumba-Logo.png';

const quickChips: { label: string; propertyType?: PropertyType }[] = [
  { label: 'All types' },
  { label: 'Apartments', propertyType: 'apartment' },
  { label: 'Houses', propertyType: 'house' },
  { label: 'Bedsitters', propertyType: 'bedsitter' },
  { label: 'Land', propertyType: 'land' },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { county, filters, updateFilters } = useApp();

  const [featuredAgencies, setFeaturedAgencies] = useState<Agency[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const activeChip = quickChips.findIndex(
    (chip) => (chip.propertyType ?? 'all') === (filters.propertyType ?? 'all')
  );

  const load = useCallback(async () => {
    const [featuredA, allA, featuredP, upcoming] = await Promise.all([
      getFeaturedAgencies(county),
      getAgencies({ county }),
      getFeaturedProperties(county),
      getUpcomingProjects(county),
    ]);
    setFeaturedAgencies(featuredA);
    setAgencies(allA);
    setFeaturedProperties(featuredP);
    setProjects(upcoming);
  }, [county]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onChipPress = (index: number) => {
    const chip = quickChips[index];
    updateFilters({ propertyType: chip.propertyType ?? 'all' });
    router.push('/(tabs)/search');
  };

  const onTransactionChange = (value: TransactionType | 'all') => {
    updateFilters({ transactionType: value });
    router.push('/(tabs)/search');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Image source={Logo} style={styles.logoImage} />
            </View>
            <Text style={styles.logoText}>Nyumba</Text>
          </View>

          <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={8}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Find your dream home</Text>
          <Pressable style={styles.locationRow} onPress={() => router.push('/county-picker')}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.locationText}>{county}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        <SearchBar onPress={() => router.push('/(tabs)/search')} />

        {!loading && projects.length > 0 && (
          <>
            <SectionHeader title="Upcoming projects" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
              contentContainerStyle={styles.horizontalListContent}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPress={() => router.push(`/project/${project.id}`)}
                />
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.transactionBar}>
          <TransactionToggle
            value={filters.transactionType ?? 'all'}
            onChange={onTransactionChange}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chips}
          contentContainerStyle={styles.chipsContent}
        >
          {quickChips.map((chip, i) => (
            <Chip
              key={chip.label}
              label={chip.label}
              active={activeChip === i}
              onPress={() => onChipPress(i)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : (
          <>
            <SectionHeader title="Featured agencies" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
              contentContainerStyle={styles.horizontalListContent}
            >
              {featuredAgencies.map((agency) => (
                <AgencyCard
                  key={agency.id}
                  agency={agency}
                  compact
                  onPress={() => router.push(`/agency/${agency.id}`)}
                />
              ))}
            </ScrollView>

            {featuredProperties.length > 0 && (
              <>
                <SectionHeader
                  title="Homes you might love"
                  actionLabel="See all"
                  onAction={() => {
                    updateFilters({ featuredOnly: true });
                    router.push('/(tabs)/search');
                  }}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalList}
                  contentContainerStyle={styles.horizontalListContent}
                >
                  {featuredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      horizontal
                      onPress={() => router.push(`/property/${property.id}`)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            <SectionHeader title={`Agencies in ${county}`} />
            {agencies.length === 0 ? (
              <Text style={styles.empty}>No agencies in this county yet. Try another area.</Text>
            ) : (
              agencies.map((agency) => (
                <AgencyCard
                  key={agency.id}
                  agency={agency}
                  onPress={() => router.push(`/agency/${agency.id}`)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logoMark: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logoText: {
    ...typography.title,
    color: colors.primary,
  },
  greetingBlock: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.hero,
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  locationText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  transactionBar: {
    marginTop: spacing.lg,
  },
  chips: {
    marginVertical: spacing.lg,
  },
  chipsContent: {
    paddingRight: spacing.lg,
  },
  horizontalList: {
    marginVertical: -spacing.sm,
  },
  horizontalListContent: {
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
