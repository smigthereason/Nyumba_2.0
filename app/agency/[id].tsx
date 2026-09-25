import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Chip } from '@/src/components/Chip';
import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PropertyCard } from '@/src/components/PropertyCard';
import { useApp } from '@/src/context/AppContext';
import { getAgencyById } from '@/src/data/repositories/agencies';
import { getPropertiesByAgency } from '@/src/data/repositories/properties';
import { Agency, Property, TransactionType } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { openPhone, openWhatsApp } from '@/src/utils/contact';

type Tab = 'all' | 'rent' | 'sale' | 'featured';

export default function AgencyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useApp();

  const [agency, setAgency] = useState<Agency | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const a = await getAgencyById(id);
      setAgency(a);
      if (a) {
        const filters: { transactionType?: TransactionType | 'all'; featuredOnly?: boolean } = {};
        if (tab === 'rent') filters.transactionType = 'rent';
        if (tab === 'sale') filters.transactionType = 'sale';
        if (tab === 'featured') filters.featuredOnly = true;
        const props = await getPropertiesByAgency(a.id, filters);
        setProperties(props);
      }
    } finally {
      setLoading(false);
    }
  }, [id, tab]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !agency) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!agency) {
    return (
      <View style={styles.loader}>
        <EmptyState title="Agency not found" subtitle="It may have been removed." />
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        ListHeaderComponent={
          <View>
            <View>
              <Image source={{ uri: agency.coverUrl }} style={styles.cover} contentFit="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.55)']}
                style={styles.coverGradient}
              />
              <Pressable
                style={[styles.back, { top: insets.top + 8 }]}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.headerCard}>
              <Image source={{ uri: agency.logoUrl }} style={styles.logo} contentFit="cover" />
              <View style={styles.nameRow}>
                <Text style={styles.name}>{agency.name}</Text>
                {agency.verified && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.verified} />
                )}
              </View>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Ionicons name="star" size={14} color={colors.star} />
                  <Text style={styles.statText}>
                    {agency.rating.toFixed(1)} ({agency.reviewCount})
                  </Text>
                </View>
                <Text style={styles.statDot}>·</Text>
                <Text style={styles.statText}>{agency.listingCount} listings</Text>
                <Text style={styles.statDot}>·</Text>
                <Text style={styles.statText}>{agency.yearsActive} yrs</Text>
              </View>
              <Text style={styles.bio}>{agency.bio}</Text>
              <Text style={styles.counties}>
                Serves: {agency.counties.join(', ')} · Responds {agency.responseRate}% of the time
              </Text>
            </View>

            <View style={styles.tabs}>
              {(
                [
                  ['all', 'All'],
                  ['rent', 'For Rent'],
                  ['sale', 'For Sale'],
                  ['featured', 'Featured'],
                ] as const
              ).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  active={tab === key}
                  onPress={() => setTab(key)}
                />
              ))}
            </View>
            <Text style={styles.listTitle}>
              {properties.length} {properties.length === 1 ? 'home' : 'homes'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No listings in this tab"
              subtitle="Try All, Rent, or Sale."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <PropertyCard
              property={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => router.push(`/property/${item.id}`)}
            />
          </View>
        )}
      />

      <View style={[styles.sticky, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label="Call"
          icon="call"
          variant="secondary"
          fullWidth
          onPress={() => openPhone(agency.phone)}
        />
        <PrimaryButton
          label="WhatsApp"
          icon="logo-whatsapp"
          variant="accent"
          fullWidth
          onPress={() =>
            openWhatsApp(
              agency.whatsapp,
              `Hi ${agency.name}, I found you on Nyumba and would like to enquire about your listings.`
            )
          }
        />
      </View>
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
  cover: {
    width: '100%',
    height: 220,
    backgroundColor: colors.chip,
  },
  coverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 220,
  },
  back: {
    position: 'absolute',
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  headerCard: {
    marginTop: -40,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    marginTop: -48,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.chip,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statDot: {
    color: colors.textMuted,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  counties: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  listTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
