import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Logo from '@/assets/images/Nyumba-Logo.png';
import { spacing, typography } from '@/src/theme';

export function WebFooter() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 960;

  return (
    <View style={styles.footerContainer}>
      <View style={styles.contentWrapper}>
        <View style={[styles.mainGrid, isMobile && styles.mainGridMobile]}>
          {/* Brand Column */}
          <View style={styles.brandCol}>
            <View style={[styles.brandHeader, isMobile && styles.brandHeaderMobile]}>
              <Image source={Logo} style={styles.logo} contentFit="contain" />
              <Text style={styles.brandName}>Nyumba</Text>
            </View>
            <Text style={[styles.blurb, isMobile && styles.blurbMobile]}>
              House hunting across Kenya — discover trusted agencies, browse homes for rent or sale,
              and contact agents in one tap.
            </Text>
          </View>

          {/* Links Section (Grids on Mobile, Columns on Tablet/Desktop) */}
          <View style={[styles.linksGroup, isMobile && styles.linksGroupMobile]}>
            {/* Explore Column */}
            <View style={styles.linkCol}>
              <Text style={styles.heading}>Explore</Text>
              <Pressable style={styles.linkTouch} onPress={() => router.push('/' as any)}>
                <Text style={styles.linkText}>Home</Text>
              </Pressable>
              <Pressable style={styles.linkTouch} onPress={() => router.push('/search' as any)}>
                <Text style={styles.linkText}>Search homes</Text>
              </Pressable>
              <Pressable style={styles.linkTouch} onPress={() => router.push('/map' as any)}>
                <Text style={styles.linkText}>Map</Text>
              </Pressable>
              <Pressable style={styles.linkTouch} onPress={() => router.push('/favorites' as any)}>
                <Text style={styles.linkText}>Saved homes</Text>
              </Pressable>
            </View>

            {/* Account Column */}
            <View style={styles.linkCol}>
              <Text style={styles.heading}>Account</Text>
              <Pressable style={styles.linkTouch} onPress={() => router.push('/login' as any)}>
                <Text style={styles.linkText}>Sign in</Text>
              </Pressable>
              <Pressable style={styles.linkTouch} onPress={() => router.push('/signup' as any)}>
                <Text style={styles.linkText}>Create account</Text>
              </Pressable>
              <Pressable style={styles.linkTouch} onPress={() => router.push('/settings' as any)}>
                <Text style={styles.linkText}>Settings</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} Nyumba · Built for Kenya · Demo marketplace
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: '#07231B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  contentWrapper: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: 32,
  },
  mainGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 48,
    marginBottom: 48,
  },
  mainGridMobile: {
    flexDirection: 'column',
    gap: 36,
    marginBottom: 36,
  },
  brandCol: {
    flex: 1.2,
    maxWidth: 420,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  brandHeaderMobile: {
    gap: 12,
  },
  logo: {
    width: 64,
    height: 64,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  blurb: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 14,
    fontSize: 15,
    lineHeight: 24,
  },
  blurbMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  linksGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 64,
  },
  linksGroupMobile: {
    justifyContent: 'space-between',
    gap: 24,
  },
  linkCol: {
    minWidth: 120,
    gap: 6,
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 10,
  },
  linkTouch: {
    paddingVertical: 6,
  },
  linkText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 24,
    alignItems: 'center',
  },
  copyright: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
    textAlign: 'center',
  },
});
