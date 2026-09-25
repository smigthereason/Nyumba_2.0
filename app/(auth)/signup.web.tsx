import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/context/AuthContext';
import { colors, typography } from '@/src/theme';
import { WebAuthLayout } from '@/src/web/WebAuthLayout';

export default function WebSignupPage() {
  const router = useRouter();
  const { signUp, isConfigured } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || password.length < 6) {
      setError('Use a valid email and a password with at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace('/' as any);
  };

  return (
    <WebAuthLayout eyebrow="Get started">
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Save favourites, request viewings, and pick up where you left off on any device.
      </Text>

      {!isConfigured && (
        <View style={styles.banner}>
          <Ionicons name="information-circle" size={18} color={colors.accent} />
          <Text style={styles.bannerText}>
            Demo mode — real sign-up needs Supabase configured in{' '}
            <Text style={styles.mono}>.env</Text>.
          </Text>
        </View>
      )}

      <Text style={styles.label}>Full name</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="person-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Jane Wanjiku"
          placeholderTextColor={colors.textMuted}
          autoComplete="name"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <Text style={styles.label}>Email address</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@email.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={onSubmit}
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.hints}>
        <Hint ok={password.length >= 6} text="6+ characters" />
        <Hint ok={email.includes('@')} text="Valid email" />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.submit, loading && styles.submitDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Create free account</Text>
        )}
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href={'/login' as any} asChild>
          <Pressable>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </WebAuthLayout>
  );
}

function Hint({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.hint}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={ok ? colors.primary : colors.textMuted}
      />
      <Text style={[styles.hintText, ok && styles.hintOk]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  banner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.accentSoft,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  bannerText: {
    ...typography.caption,
    color: colors.accent,
    flex: 1,
    lineHeight: 18,
  },
  mono: { fontWeight: '700' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  } as any,
  hints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintText: { ...typography.caption, color: colors.textMuted },
  hintOk: { color: colors.primary, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#FDECEA',
    padding: 12,
    borderRadius: 10,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.75 },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
