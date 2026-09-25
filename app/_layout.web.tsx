import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AppProvider, useApp } from '@/src/context/AppContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { colors } from '@/src/theme';
import { WebShell } from '@/src/web/WebShell';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hydrated, onboardingDone, completeOnboarding, isAuthenticated } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  // Web: skip onboarding + never force guests into auth
  useEffect(() => {
    if (!hydrated) return;

    // Auto-complete onboarding on web
    if (!onboardingDone) {
      completeOnboarding();
    }

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === '(auth)';
    const atRoot = !segments[0];

    // Always leave onboarding
    if (inOnboarding) {
      router.replace('/(tabs)');
      return;
    }

    // Guests landing on / or stuck on auth index → send to home
    // (only force away from auth if they didn't intentionally go to /login or /signup)
    if (!isAuthenticated && (atRoot || (inAuth && segments.length === 1))) {
      router.replace('/(tabs)');
      return;
    }

    // Logged-in users shouldn't stay on auth/onboarding
    if (isAuthenticated && (inOnboarding || inAuth)) {
      router.replace('/(tabs)');
    }
  }, [hydrated, onboardingDone, isAuthenticated, segments, router, completeOnboarding]);

  if (!hydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Auth pages = full page (no top nav / footer)
  const isAuth = segments[0] === '(auth)';

  // Detail pages still need the site chrome
  const needsOuterShell =
    !isAuth &&
    (segments[0] === 'agency' ||
      segments[0] === 'property' ||
      segments[0] === 'filters' ||
      segments[0] === 'county-picker' ||
      segments[0] === 'project' ||
      segments[0] === 'confirmed');

  const stack = (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="agency/[id]" />
      <Stack.Screen name="property/[id]" />
      <Stack.Screen name="property/buy/[id]" />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen name="confirmed" options={{ presentation: 'modal' }} />
      <Stack.Screen name="filters" options={{ presentation: 'modal' }} />
      <Stack.Screen name="county-picker" options={{ presentation: 'modal' }} />
    </Stack>
  );

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.root}>
        {needsOuterShell ? <WebShell>{stack}</WebShell> : stack}
      </View>
    </>
  );
}

const styles = {
  root: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    minHeight: '100vh' as any,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.background,
  },
};

export default function WebRootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </AuthProvider>
  );
}
