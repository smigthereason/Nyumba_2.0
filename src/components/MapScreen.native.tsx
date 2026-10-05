import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/src/context/AppContext';
import { getCounties } from '@/src/data/repositories/locations';
import { getProperties } from '@/src/data/repositories/properties';
import { County, Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes } from '@/src/utils/format';

const DEFAULT_REGION: Region = {
  latitude: -1.2921,
  longitude: 36.8219,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

const KENYA_BOUNDS = {
  minLatitude: -4.95,
  maxLatitude: 5.25,
  minLongitude: 33.75,
  maxLongitude: 42.25,
};

type MapProperty = Property & {
  mapLatitude: number;
  mapLongitude: number;
  approximateMapLocation: boolean;
};

function hasUsableCoordinates(property: Property): boolean {
  return (
    Number.isFinite(property.lat) &&
    Number.isFinite(property.lng) &&
    Math.abs(property.lat) > 0.000001 &&
    Math.abs(property.lng) > 0.000001 &&
    property.lat >= -90 &&
    property.lat <= 90 &&
    property.lng >= -180 &&
    property.lng <= 180
  );
}

function stableOffset(id: string, axis: 'lat' | 'lng'): number {
  let hash = axis === 'lat' ? 17 : 31;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 33 + id.charCodeAt(index)) >>> 0;
  }
  // Keep fallback pins close to the county centre while preventing exact overlap.
  return ((hash % 1000) / 1000 - 0.5) * 0.024;
}

function toMapProperty(property: Property, counties: Map<string, County>): MapProperty | null {
  if (hasUsableCoordinates(property)) {
    return {
      ...property,
      mapLatitude: property.lat,
      mapLongitude: property.lng,
      approximateMapLocation: false,
    };
  }

  const fallback = counties.get(property.county.toLowerCase());
  if (!fallback) return null;

  return {
    ...property,
    mapLatitude: fallback.lat + stableOffset(property.id, 'lat'),
    mapLongitude: fallback.lng + stableOffset(property.id, 'lng'),
    approximateMapLocation: true,
  };
}

function regionAroundCounty(county: County | undefined): Region {
  if (!county) return DEFAULT_REGION;
  return {
    latitude: county.lat,
    longitude: county.lng,
    latitudeDelta: 0.24,
    longitudeDelta: 0.24,
  };
}

function regionAroundProperties(properties: MapProperty[]): Region {
  if (!properties.length) return DEFAULT_REGION;
  if (properties.length === 1) {
    return {
      latitude: properties[0].mapLatitude,
      longitude: properties[0].mapLongitude,
      latitudeDelta: 0.14,
      longitudeDelta: 0.14,
    };
  }

  const latitudes = properties.map((property) => property.mapLatitude);
  const longitudes = properties.map((property) => property.mapLongitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max(0.16, (maxLatitude - minLatitude) * 1.35 + 0.08),
    longitudeDelta: Math.max(0.16, (maxLongitude - minLongitude) * 1.35 + 0.08),
  };
}

function isInsideKenya(latitude: number, longitude: number): boolean {
  return (
    latitude >= KENYA_BOUNDS.minLatitude &&
    latitude <= KENYA_BOUNDS.maxLatitude &&
    longitude >= KENYA_BOUNDS.minLongitude &&
    longitude <= KENYA_BOUNDS.maxLongitude
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const { county } = useApp();

  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [selected, setSelected] = useState<MapProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [targetRegion, setTargetRegion] = useState<Region>(DEFAULT_REGION);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // The map intentionally loads a bounded cross-county set instead of filtering
      // only by the selected county. This prevents a valid nearby listing from
      // disappearing just because the onboarding county currently has no inventory.
      const [list, countyList] = await Promise.all([
        getProperties({ limit: 100 }),
        getCounties(),
      ]);

      const countyLookup = new Map(countyList.map((item) => [item.name.toLowerCase(), item]));
      const mapped = list
        .map((property) => toMapProperty(property, countyLookup))
        .filter((property): property is MapProperty => property !== null);
      const selectedCountyHomes = mapped.filter(
        (property) => property.county.toLowerCase() === county.toLowerCase()
      );
      const selectedCounty = countyLookup.get(county.toLowerCase());

      setProperties(mapped);
      setSelected(null);

      // Prefer the selected county when it has inventory. If it has none, show the
      // available mapped homes rather than presenting an empty map.
      const nextRegion = selectedCountyHomes.length
        ? regionAroundCounty(selectedCounty)
        : mapped.length
          ? regionAroundProperties(mapped)
          : regionAroundCounty(selectedCounty);

      setTargetRegion(nextRegion);
      requestAnimationFrame(() => mapRef.current?.animateToRegion(nextRegion, 450));
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [county]);

  useEffect(() => {
    load();
  }, [load]);

  const pins = useMemo(() => properties, [properties]);
  const countyHomeCount = useMemo(
    () => pins.filter((property) => property.county.toLowerCase() === county.toLowerCase()).length,
    [county, pins]
  );
  const approximateCount = useMemo(
    () => pins.filter((property) => property.approximateMapLocation).length,
    [pins]
  );

  const selectProperty = (property: MapProperty) => {
    setSelected(property);
    mapRef.current?.animateToRegion(
      {
        latitude: property.mapLatitude,
        longitude: property.mapLongitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      },
      300
    );
  };

  const useCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Location access is off',
          'Allow location access in Settings to center the map on your current location.'
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = current.coords;

      // iOS Simulator commonly reports an Apple-provided US test location unless a
      // custom simulator location is configured. Do not move a Kenya-only property
      // map thousands of kilometres away because of that simulated coordinate.
      if (!isInsideKenya(latitude, longitude)) {
        setShowUserLocation(false);
        mapRef.current?.animateToRegion(targetRegion, 350);
        Alert.alert(
          'Location is outside Kenya',
          'This device is reporting a location outside Nyumba’s supported map area. In iOS Simulator, choose Features → Location → Custom Location and enter a Kenyan coordinate. On a physical device, check Location Services.'
        );
        return;
      }

      setShowUserLocation(true);
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        },
        450
      );
    } catch {
      Alert.alert('Location unavailable', 'We could not determine your current location.');
    } finally {
      setLocating(false);
    }
  };

  const subtitle = loading
    ? 'Loading homes…'
    : countyHomeCount > 0
      ? `${countyHomeCount} ${countyHomeCount === 1 ? 'home' : 'homes'} in ${county}`
      : pins.length > 0
        ? `No ${county} homes · showing ${pins.length} elsewhere`
        : 'No mapped homes yet';

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={targetRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass
        onPress={() => setSelected(null)}
        onMapReady={() => mapRef.current?.animateToRegion(targetRegion, 0)}
      >
        {pins.map((property) => {
          const active = selected?.id === property.id;
          return (
            <Marker
              key={property.id}
              coordinate={{ latitude: property.mapLatitude, longitude: property.mapLongitude }}
              onPress={() => selectProperty(property)}
              accessibilityLabel={`${property.title}, ${formatKes(property.priceKes)}${
                property.approximateMapLocation ? ', approximate map location' : ''
              }`}
            >
              <View style={[styles.marker, active && styles.markerActive]}>
                <Text style={[styles.markerText, active && styles.markerTextActive]}>
                  {formatKes(property.priceKes).replace('KES ', '')}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View
        pointerEvents="box-none"
        style={[styles.topOverlay, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.titleCard}>
          <Text style={styles.title}>Map</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use my current location"
        accessibilityHint="Centers the map on your location when you are in Kenya"
        onPress={useCurrentLocation}
        style={({ pressed }) => [
          styles.locationButton,
          { top: insets.top + 92 },
          pressed && styles.pressed,
        ]}
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={22} color={colors.primary} />
        )}
      </Pressable>

      {loading ? (
        <View pointerEvents="none" style={styles.loadingPill}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Updating map</Text>
        </View>
      ) : null}

      {!loading && pins.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="map-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>No mapped homes yet</Text>
            <Text style={styles.emptyText}>
              Active listings will appear here once agencies publish them.
            </Text>
          </View>
        </View>
      ) : null}

      {!loading && pins.length > 0 && countyHomeCount === 0 ? (
        <View pointerEvents="none" style={styles.marketNotice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.marketNoticeText}>
            No active homes in {county} yet. Showing available homes in other counties.
          </Text>
        </View>
      ) : null}

      {selected ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${selected.title}`}
          style={({ pressed }) => [
            styles.sheet,
            { bottom: spacing.lg },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push(`/property/${selected.id}`)}
        >
          {selected.images[0] ? (
            <Image
              source={{ uri: selected.images[0] }}
              style={styles.sheetImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.sheetImage, styles.imagePlaceholder]}>
              <Ionicons name="home-outline" size={26} color={colors.textMuted} />
            </View>
          )}
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
            {selected.approximateMapLocation ? (
              <Text style={styles.approximateText}>Approximate map position</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}

      {!loading && approximateCount > 0 && !selected ? (
        <View pointerEvents="none" style={[styles.approximatePill, { bottom: spacing.md }]}>
          <Ionicons name="pin-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.approximatePillText}>
            {approximateCount} {approximateCount === 1 ? 'listing uses' : 'listings use'} an approximate map position
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  titleCard: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.soft,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  marker: {
    minHeight: 34,
    minWidth: 54,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.soft,
  },
  markerActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  markerText: {
    ...typography.captionBold,
    color: colors.text,
  },
  markerTextActive: {
    color: colors.textInverse,
  },
  locationButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  loadingPill: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.soft,
  },
  loadingText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  emptyCard: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '42%',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  marketNotice: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.soft,
  },
  marketNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadows.card,
  },
  sheetImage: {
    width: 92,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.chip,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    flex: 1,
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
  approximateText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  approximatePill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '88%',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.soft,
  },
  approximatePillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.78,
  },
});
