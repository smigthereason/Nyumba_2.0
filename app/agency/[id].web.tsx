import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
// ScrollView + WebFooter
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/EmptyState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { getAgencyById } from '@/src/data/repositories/agencies';
import { getPropertiesByAgency } from '@/src/data/repositories/properties';
import { Agency, Property, TransactionType } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { openPhone, openWhatsApp } from '@/src/utils/contact';
import { WebFooter } from '@/src/web/WebFooter';
import { WebPropertyCard } from '@/src/web/WebPropertyCard';

type Tab = 'all' | 'rent' | 'sale' | 'featured';

export default function WebAgencyPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cols = width >= 1100 ? 3 : width >= 720 ? 2 : 1;

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
        setProperties(await getPropertiesByAgency(a.id, filters));
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
        <EmptyState title="Agency not found" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={{ uri: agency.coverUrl }} style={styles.cover} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(10,47,36,0.9)']}
          style={styles.coverGrad}
        />
        <View style={styles.heroInner}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Image source={{ uri: agency.logoUrl }} style={styles.logo} contentFit="cover" />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{agency.name}</Text>
            {agency.verified && (
              <Ionicons name="checkmark-circle" size={24} color="#7DFFB3" />
            )}
          </View>
          <Text style={styles.stats}>
            ★ {agency.rating.toFixed(1)} ({agency.reviewCount}) · {agency.listingCount} listings ·{' '}
            {agency.yearsActive} yrs · {agency.responseRate}% response
          </Text>
          <Text style={styles.bio}>{agency.bio}</Text>
          <Text style={styles.counties}>Serves {agency.counties.join(', ')}</Text>
          <View style={styles.ctaRow}>
            <PrimaryButton
              label="Call agency"
              icon="call"
              variant="secondary"
              onPress={() => openPhone(agency.phone)}
            />
            <PrimaryButton
              label="WhatsApp"
              icon="logo-whatsapp"
              variant="accent"
              onPress={() =>
                openWhatsApp(
                  agency.whatsapp,
                  `Hi ${agency.name}, I found you on Nyumba and would like to enquire about your listings.`
                )
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.tabs}>
          {(
            [
              ['all', 'All'],
              ['rent', 'For Rent'],
              ['sale', 'For Sale'],
              ['featured', 'Featured'],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.tab, tab === key && styles.tabOn]}
              onPress={() => setTab(key)}
            >
              <Text style={[styles.tabText, tab === key && styles.tabTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.count}>
          {properties.length} {properties.length === 1 ? 'home' : 'homes'}
        </Text>

        {properties.length === 0 ? (
          <EmptyState title="No listings in this tab" subtitle="Try All, Rent, or Sale." />
        ) : (
          <View style={styles.grid}>
            {properties.map((p) => (
              <View key={p.id} style={{ width: gridW(width, cols) }}>
                <WebPropertyCard
                  property={p}
                  onPress={() => router.push(`/property/${p.id}` as any)}
                />
              </View>
            ))}
          </View>
        )}
      </View>
      <WebFooter />
    </ScrollView>
  );
}

function gridW(screenW: number, cols: number) {
  const max = Math.min(screenW, 1200) - 48;
  const gap = 20;
  return (max - gap * (cols - 1)) / cols;
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', backgroundColor: colors.background },
  content: { flexGrow: 1, paddingBottom: 0 },
  loader: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    minHeight: 380,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  cover: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  coverGrad: {
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
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    zIndex: 2,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  backText: { color: '#fff', fontWeight: '600' },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: colors.chip,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
  },
  stats: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
  },
  bio: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.md,
    maxWidth: 640,
    lineHeight: 24,
  },
  counties: {
    ...typography.captionBold,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.sm,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.xl,
  },
  body: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    padding: spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.lg,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.chip,
  },
  tabOn: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: { ...typography.captionBold, color: colors.textSecondary },
  tabTextOn: { color: colors.primary },
  count: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
});
