import { Tabs } from 'expo-router';

import { WebShell } from '@/src/web/WebShell';
import { colors } from '@/src/theme';

/**
 * Website chrome on web: top nav + full-height tab scenes (page scrolls inside).
 */
export default function WebTabLayout() {
  return (
    <WebShell>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          sceneStyle: {
            backgroundColor: colors.background,
            flex: 1,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="map" options={{ title: 'Map' }} />
        <Tabs.Screen name="favorites" options={{ title: 'Saved' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </WebShell>
  );
}
