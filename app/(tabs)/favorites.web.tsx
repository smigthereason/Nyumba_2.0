import { useRouter } from 'expo-router';
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
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { getPropertyById } from '@/src/data/repositories/properties';
import { Property } from '@/src/data/types';
import { colors, radius, spacing, typography } from '@/src/theme';
import { WebFooter } from '@/src/web/WebFooter';
import { WebPropertyCard } from '@/src/web/WebPropertyCard';

export default function WebFavoritesPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { favoriteIds, toggleFavorite } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const cols = width >= 1100 ? 3 : width >= 720 ? 2 : 1;
  const gap = 20;
  const horizontalPad = 48;
  const contentW = Math.min(width, 1200) - horizontalPad;
  const cardW = Math.max(240, (contentW - gap * (cols - 1)) / cols);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await Promise.all(favoriteIds.map((id) => getPropertyById(id)));
      setProperties(items.filter((p): p is Property => p != null));
    } finally {
      setLoading(false);
    }
  }, [favoriteIds]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
    >
      {/* This block grows so the footer is pushed to the bottom */}
      <View style={styles.main}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Saved homes</Text>
            <Text style={styles.subtitle}>
              {favoriteIds.length} {favoriteIds.length === 1 ? 'property' : 'properties'}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : properties.length === 0 ? (
            <EmptyState
              icon="heart-outline"
              title="No saved homes yet"
              subtitle="Tap the heart on any property to save it here."
            />
          ) : (
            <View style={[styles.grid, { gap }]}>
              {properties.map((p) => (
                <View key={p.id} style={{ width: cardW }}>
                  <WebPropertyCard
                    property={p}
                    onPress={() => router.push(`/property/${p.id}` as any)}
                  />
                  <Pressable style={styles.unsave} onPress={() => toggleFavorite(p.id)}>
                    <Ionicons name="heart" size={14} color={colors.accent} />
                    <Text style={styles.unsaveText}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    // @ts-expect-error web
    minHeight: '100%',
  } as any,
  main: {
    flexGrow: 1,
  },
  inner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unsave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
  unsaveText: {
    ...typography.captionBold,
    color: colors.accent,
  },
});
