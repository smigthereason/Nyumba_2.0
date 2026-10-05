import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const icons: Record<string, { focused: IconName; idle: IconName }> = {
  index: { focused: 'home', idle: 'home-outline' },
  search: { focused: 'search', idle: 'search-outline' },
  map: { focused: 'map', idle: 'map-outline' },
  favorites: { focused: 'heart', idle: 'heart-outline' },
  profile: { focused: 'person-circle', idle: 'person-circle-outline' },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const item = icons[route.name] ?? { focused: 'ellipse', idle: 'ellipse-outline' };
          return <Ionicons name={focused ? item.focused : item.idle} size={size || 22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Discover' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saved' }} />
      <Tabs.Screen name="profile" options={{ title: 'Account' }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
