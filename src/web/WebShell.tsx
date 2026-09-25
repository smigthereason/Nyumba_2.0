import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Logo from '@/assets/images/Nyumba-Logo.png';
import { useApp } from '@/src/context/AppContext';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, spacing, typography } from '@/src/theme';

const NAV = [
  { label: 'Home', href: '/', match: ['/', '/(tabs)', '/(tabs)/'] },
  { label: 'Search homes', href: '/search', match: ['/search', '/(tabs)/search'] },
  { label: 'Map', href: '/map', match: ['/map', '/(tabs)/map'] },
  { label: 'Saved', href: '/favorites', match: ['/favorites', '/(tabs)/favorites'] },
] as const;

function pathActive(pathname: string, match: readonly string[]) {
  const p = pathname.replace(/\/$/, '') || '/';
  return match.some((m) => {
    const n = m.replace(/\/$/, '') || '/';
    return p === n || p.endsWith(n);
  });
}

/**
 * Website chrome: top nav only.
 * - Phone / tablet (< 1100): logo + actions on row 1, nav pills on row 2
 * - Desktop (≥ 1100): single row with centered nav
 */
export function WebShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { county } = useApp();
  const { user, profile } = useAuth();
  const { width } = useWindowDimensions();

  // iPad Air + iPad Pro both use the two-row nav
  const isDesktop = width >= 1100;
  const isPhone = width < 640;
  const pad = isPhone ? 16 : isDesktop ? 40 : 28;

  const displayName = profile?.fullName || user?.email?.split('@')[0];

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        {/* Row 1: brand + actions */}
        <View style={[styles.topInner, { paddingHorizontal: pad }]}>
          <Pressable style={styles.brand} onPress={() => router.push('/' as any)}>
            <Image source={Logo} style={styles.logo} contentFit="contain" />
            <Text style={styles.brandName}>Nyumba</Text>
          </Pressable>

          {isDesktop && (
            <View style={styles.nav}>
              {NAV.map((item) => {
                const active = pathActive(pathname, item.match);
                return (
                  <Pressable
                    key={item.href}
                    onPress={() => router.push(item.href as any)}
                    style={[styles.navItem, active && styles.navItemActive]}
                  >
                    <Text style={[styles.navText, active && styles.navTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              style={styles.countyChip}
              onPress={() => router.push('/county-picker' as any)}
            >
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={styles.countyText} numberOfLines={1}>
                {county}
              </Text>
              <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
            </Pressable>

            {user ? (
              <Pressable
                style={styles.accountBtn}
                onPress={() => router.push('/profile' as any)}
              >
                <Ionicons name="person-circle" size={22} color={colors.primary} />
                {isDesktop && (
                  <Text style={styles.accountText} numberOfLines={1}>
                    {displayName}
                  </Text>
                )}
              </Pressable>
            ) : (
              <Pressable style={styles.cta} onPress={() => router.push('/login' as any)}>
                <Text style={styles.ctaText}>Sign in</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Row 2: nav pills — phone + tablet only */}
        {!isDesktop && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.mobileNav, { paddingHorizontal: pad }]}
          >
            {NAV.map((item) => {
              const active = pathActive(pathname, item.match);
              return (
                <Pressable
                  key={item.href}
                  onPress={() => router.push(item.href as any)}
                  style={[styles.mobileNavItem, active && styles.navItemActive]}
                >
                  <Text style={[styles.navText, active && styles.navTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.main}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web'
      ? ({
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        } as any)
      : {}),
  },
  topBar: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 50,
    flexShrink: 0,
  },
  topInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.4,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  navItemActive: {
    backgroundColor: colors.primarySoft,
  },
  navText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 14,
  },
  navTextActive: {
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    maxWidth: 140,
  },
  countyText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  accountText: {
    ...typography.captionBold,
    color: colors.text,
    maxWidth: 100,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  ctaText: {
    ...typography.bodyBold,
    color: colors.textInverse,
    fontSize: 14,
  },
  mobileNav: {
    paddingBottom: 10,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileNavItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  main: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
  } as any,
});
