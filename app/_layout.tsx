import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { AppSplash } from '@/src/components/AppSplash';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { colors } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hydrated, onboardingDone, isAuthenticated } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const [showAppSplash, setShowAppSplash] = useState(true);

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync();
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === '(auth)';

    // 1. Onboarding still required once
    if (!onboardingDone && !inOnboarding) {
      router.replace('/(onboarding)');
    }
    // 2. Logged-in users shouldn't stay on auth/onboarding
    else if (onboardingDone && isAuthenticated && (inOnboarding || inAuth)) {
      router.replace('/(tabs)');
    }
    // 3. Guests are allowed into the app (no force-redirect to auth)
  }, [hydrated, onboardingDone, isAuthenticated, segments, router]);

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showAppSplash) {
    return <AppSplash onFinish={() => setShowAppSplash(false)} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.shell}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="agency/[id]" 
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="property/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="property/buy/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="project/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="confirmed"
              options={{
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="filters"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="county-picker"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </View>
      </View>
    </>
  );
}

const styles = {
  root: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
    height: Platform.OS === 'web' ? ('100%' as unknown as number) : undefined,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? ({ alignItems: 'center' as const } as const) : {}),
  },
  shell: {
    flex: 1,
    width: '100%' as const,
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
    ...(Platform.OS === 'web'
      ? ({
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center' as const,
        } as const)
      : {}),
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </AuthProvider>
  );
}
