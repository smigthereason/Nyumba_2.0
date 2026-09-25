import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/EmptyState';
import { PropertyCard } from '@/src/components/PropertyCard';
import { useApp } from '@/src/context/AppContext';
import { getPropertyById } from '@/src/data/repositories/properties';
import { Property } from '@/src/data/types';
import { colors, spacing, typography } from '@/src/theme';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favoriteIds, isFavorite, toggleFavorite } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved homes</Text>
        <Text style={styles.subtitle}>
          {favoriteIds.length} {favoriteIds.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="No saved homes yet"
              subtitle="Tap the heart on any property to save it here."
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
});
