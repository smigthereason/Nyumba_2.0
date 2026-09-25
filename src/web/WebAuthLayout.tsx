import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Logo from '@/assets/images/Nyumba-Logo.png';
import { colors } from '@/src/theme';

const HERO =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&h=1600&fit=crop';

type Props = {
  children: ReactNode;
  /** Small label above the form title */
  eyebrow?: string;
};

/**
 * Full-viewport website auth chrome: brand panel + form panel.
 * Not wrapped in the main site footer/nav.
 */
export function WebAuthLayout({ children, eyebrow }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <View style={styles.root}>
      {wide && (
        <View style={styles.brandPanel}>
          <Image source={{ uri: HERO }} style={styles.brandBg} contentFit="cover" />
          <LinearGradient
            colors={['rgba(10,47,36,0.55)', 'rgba(10,47,36,0.92)']}
            style={styles.brandOverlay}
          />
          <View style={styles.brandContent}>
            <Pressable style={styles.brandLogo} onPress={() => router.push('/' as any)}>
              <Image source={Logo} style={styles.logoImg} contentFit="contain" />
              <Text style={styles.brandName}>Nyumba</Text>
            </Pressable>

            <View style={styles.brandCopy}>
              <Text style={styles.brandHeadline}>
                Your next home in Kenya starts here
              </Text>
              <Text style={styles.brandSub}>
                Discover trusted agencies, browse rentals and sales in KES, and contact
                agents on WhatsApp — all in one place.
              </Text>

              <View style={styles.bullets}>
                <Bullet text="Browse agencies like storefronts" />
                <Bullet text="Filter by county, estate & budget" />
                <Bullet text="Save homes across phone & web" />
              </View>
            </View>

            <Text style={styles.brandFoot}>Trusted house hunting for Kenya</Text>
          </View>
        </View>
      )}

      <View style={styles.formPanel}>
        <View style={styles.formTop}>
          <Pressable style={styles.backHome} onPress={() => router.push('/' as any)}>
            <Ionicons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.backHomeText}>Back to Nyumba</Text>
          </Pressable>
          {!wide && (
            <Pressable style={styles.mobileBrand} onPress={() => router.push('/' as any)}>
              <Image source={Logo} style={styles.logoSm} contentFit="contain" />
              <Text style={styles.mobileBrandName}>Nyumba</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.formCard}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {children}
        </View>

        <Text style={styles.legal}>
          By continuing you agree to Nyumba’s Terms & Privacy (demo).
        </Text>
      </View>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot}>
        <Ionicons name="checkmark" size={12} color={colors.primary} />
      </View>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh' as any,
    backgroundColor: colors.background,
  },
  brandPanel: {
    flex: 1.05,
    position: 'relative',
    minHeight: '100vh' as any,
    overflow: 'hidden',
  },
  brandBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  brandOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  brandContent: {
    flex: 1,
    zIndex: 2,
    padding: 48,
    justifyContent: 'space-between',
  },
  brandLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImg: { width: 40, height: 40 },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandCopy: {
    maxWidth: 440,
  },
  brandHeadline: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 16,
  },
  brandSub: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 28,
  },
  bullets: { gap: 14 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  brandFoot: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  formPanel: {
    flex: 1,
    minWidth: 320,
    maxWidth: 640,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },
  formTop: {
    marginBottom: 24,
    gap: 16,
  },
  backHome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backHomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoSm: { width: 32, height: 32 },
  mobileBrandName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 36,
    borderWidth: 1,
    borderColor: colors.border,
    // soft elevation
    shadowColor: '#1A1F1C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 10,
  },
  legal: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
