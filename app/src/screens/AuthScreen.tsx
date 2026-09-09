import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, STATIC } from '../theme';
import { useAuthStore } from '../store/authStore';

export function AuthScreen() {
  const theme = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  async function handleContinue() {
    if (!email || !password) { Alert.alert('Missing fields'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(email.trim(), password);
      } else {
        if (!name) { Alert.alert('Enter your name'); return; }
        await register(name.trim(), email.trim(), password);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* App mark */}
        <View style={[styles.mark, { backgroundColor: theme.accent }]}>
          <Text style={styles.markGlyph}>♡</Text>
        </View>

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to start building your shared bucket list.</Text>

        {/* OAuth buttons */}
        <Pressable style={styles.oauthBtn}>
          <Text style={[styles.oauthDot, { color: '#4285F4' }]}>G</Text>
          <Text style={styles.oauthText}>Continue with Google</Text>
        </Pressable>
        <Pressable style={[styles.oauthBtn, styles.oauthApple]}>
          <Text style={[styles.oauthText, { color: '#fff' }]}>Continue with Apple</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>
            {mode === 'signin' ? 'or sign in with email' : 'or sign up with email'}
          </Text>
          <View style={styles.dividerLine} />
        </View>

        {mode === 'signup' && (
          <View style={styles.field}>
            <Text style={styles.label}>NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={STATIC.textFaint}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            placeholderTextColor={STATIC.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={STATIC.textFaint}
          />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleContinue}
          disabled={loading}
          style={[styles.continueBtn, { backgroundColor: theme.accent }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.continueBtnText}>Continue</Text>}
        </Pressable>
        <Pressable onPress={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
          <Text style={[styles.toggleText, { color: theme.accent }]}>
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 28, paddingTop: 88, gap: 16 },
  mark: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 8,
  },
  markGlyph: { fontSize: 28, color: '#fff' },
  title: { fontFamily: font.serif, fontSize: 28, color: STATIC.textPrimary, textAlign: 'center' },
  subtitle: { fontFamily: font.sans, fontSize: 15, color: STATIC.textMuted, textAlign: 'center' },
  oauthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 50, borderRadius: radius.btn, borderWidth: 1, borderColor: STATIC.border,
    backgroundColor: '#fff', gap: 10,
  },
  oauthApple: { backgroundColor: '#000', borderColor: '#000' },
  oauthDot: { fontFamily: font.sansBold, fontSize: 18 },
  oauthText: { fontFamily: font.sansSemiBold, fontSize: 14, color: STATIC.textPrimary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: STATIC.border },
  dividerLabel: { fontFamily: font.sans, fontSize: 13, color: STATIC.textMuted },
  field: { gap: 6 },
  label: { fontFamily: font.sansSemiBold, fontSize: 12, color: STATIC.textMuted, letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: STATIC.border, borderRadius: radius.input,
    padding: 14, fontFamily: font.sans, fontSize: 15, color: STATIC.textPrimary,
    backgroundColor: '#fff',
  },
  bottom: { padding: 28, gap: 14 },
  continueBtn: {
    height: 54, borderRadius: radius.btnLg, alignItems: 'center', justifyContent: 'center',
  },
  continueBtnText: { fontFamily: font.sansSemiBold, fontSize: 16, color: '#fff' },
  toggleText: { fontFamily: font.sans, fontSize: 14, textAlign: 'center' },
});
