import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { useApp } from '@/src/context/AppContext';
import { getCountyByName } from '@/src/data/repositories/locations';
import { getProperties } from '@/src/data/repositories/properties';
import { Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes } from '@/src/utils/format';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { county } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, countyData] = await Promise.all([
        getProperties({ county }),
        getCountyByName(county),
      ]);
      setProperties(list.filter((p) => p.lat && p.lng));
      if (countyData) {
        setRegion({
          latitude: countyData.lat,
          longitude: countyData.lng,
          latitudeDelta: 0.22,
          longitudeDelta: 0.22,
        });
      }
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [county]);

  useEffect(() => {
    load();
  }, [load]);

  const pins = useMemo(() => properties, [properties]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>
          {pins.length} homes in {county}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {pins.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              pinColor={selected?.id === p.id ? colors.primary : colors.mapPin}
              onPress={() => setSelected(p)}
              title={formatKes(p.priceKes)}
            />
          ))}
        </MapView>
      )}

      {selected && (
        <Pressable
          style={[styles.sheet, { bottom: insets.bottom + 90 }]}
          onPress={() => router.push(`/property/${selected.id}`)}
        >
          <Image
            source={{ uri: selected.images[0] }}
            style={styles.sheetImage}
            contentFit="cover"
          />
          <View style={styles.sheetBody}>
            <Text style={styles.sheetPrice}>
              {selected.transactionType === 'rent'
                ? `${formatKes(selected.priceKes)}/mo`
                : formatKes(selected.priceKes)}
            </Text>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {selected.title}
            </Text>
            <Text style={styles.sheetLoc} numberOfLines={1}>
              {selected.estate}, {selected.county}
            </Text>
          </View>
        </Pressable>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(247,248,246,0.92)',
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  sheetImage: {
    width: 100,
    height: 96,
    backgroundColor: colors.chip,
  },
  sheetBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    gap: 2,
  },
  sheetPrice: {
    ...typography.price,
    color: colors.accent,
    fontSize: 16,
  },
  sheetTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sheetLoc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
