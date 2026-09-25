import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { AuthTextField } from '@/src/components/AuthTextField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/context/AuthContext';
import { colors, spacing, typography } from '@/src/theme';
import Logo from '@/assets/images/Nyumba-Logo.png';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp, isConfigured } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);

    if (!email.trim() || password.length < 6) {
      setError('Use a valid email and password (6+ characters)');
      return;
    }

    setSubmitting(true);
    const result = await signUp(email.trim(), password, name.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.brandName}>Nyumba</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Save favourites, get faster replies from agencies, and track your requests.
        </Text>

        {!isConfigured && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Demo mode — accounts need Supabase configured in `.env`.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <AuthTextField
            label="Full name"
            icon="person-outline"
            placeholder="Jane Wanjiru"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <AuthTextField
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <AuthTextField
            label="Phone (optional)"
            icon="call-outline"
            placeholder="07xx xxx xxx"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <AuthTextField
            label="Password"
            icon="lock-closed-outline"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton
            label={submitting ? 'Creating account…' : 'Create account'}
            onPress={onSubmit}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)" replace>
            <Text style={styles.footerLink}> Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandName: {
    ...typography.title,
    color: colors.primary,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  banner: {
    backgroundColor: colors.accentSoft,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.accent,
  },
  form: {
    marginTop: spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
