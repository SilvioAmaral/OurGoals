import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, STATIC } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Toggle } from '../components/Toggle';
import { userApi, partnerApi, setupApi } from '../api';

export function SetupScreen() {
  const theme = useTheme();
  const { user, updateUser, completeSetup } = useAuthStore();
  const { toggleSexuality } = useAppStore();

  const [name, setName] = useState(user?.name ?? '');
  const [partnerName, setPartnerName] = useState(user?.partnerNickname ?? '');
  const [partnerContact, setPartnerContact] = useState('');
  const [sexuality, setSexuality] = useState(user?.sexualityEnabled ?? false);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    if (!partnerName.trim()) { Alert.alert("Enter your partner's name"); return; }
    if (!partnerContact.trim()) { Alert.alert("Enter your partner's email or phone"); return; }
    setLoading(true);
    try {
      await userApi.update({ name: name.trim(), sexualityEnabled: sexuality, partnerNickname: partnerName.trim() });
      updateUser({ name: name.trim(), sexualityEnabled: sexuality, partnerNickname: partnerName.trim() });
      await partnerApi.invite(partnerContact.trim(), partnerName.trim());
      // Seed blueprint categories + create couple record
      const { data } = await setupApi.seed();
      updateUser({ coupleId: data.coupleId });
      if (sexuality) await toggleSexuality(true);
      completeSetup();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSexuality(v: boolean) {
    setSexuality(v);
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.mark, { backgroundColor: theme.accent }]}>
          <Text style={styles.markGlyph}>♡</Text>
        </View>

        <Text style={styles.title}>Our Bucket List</Text>
        <Text style={styles.subtitle}>Set up your shared space with your partner.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>YOUR NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Your name"
            placeholderTextColor={STATIC.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PARTNER'S NAME</Text>
          <TextInput
            style={styles.input}
            value={partnerName}
            onChangeText={setPartnerName}
            autoCapitalize="words"
            placeholder="Your partner's name"
            placeholderTextColor={STATIC.textFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PARTNER'S EMAIL OR PHONE</Text>
          <TextInput
            style={styles.input}
            value={partnerContact}
            onChangeText={setPartnerContact}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email or phone"
            placeholderTextColor={STATIC.textFaint}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.toggleLabel}>Sexuality entries</Text>
            <Text style={styles.toggleDesc}>Show an intimate category with sensitive topics</Text>
          </View>
          <Toggle value={sexuality} onChange={handleToggleSexuality} />
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleStart}
          disabled={loading}
          style={[styles.startBtn, { backgroundColor: theme.accent }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.startBtnText}>Start rating together</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 28, paddingTop: 88, gap: 20 },
  mark: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 8,
  },
  markGlyph: { fontSize: 28, color: '#fff' },
  title: { fontFamily: font.serif, fontSize: 30, color: STATIC.textPrimary, textAlign: 'center' },
  subtitle: { fontFamily: font.sans, fontSize: 15, color: STATIC.textMuted, textAlign: 'center' },
  field: { gap: 6 },
  label: { fontFamily: font.sansSemiBold, fontSize: 12, color: STATIC.textMuted, letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: STATIC.border, borderRadius: radius.input,
    padding: 14, fontFamily: font.sans, fontSize: 15, color: STATIC.textPrimary, backgroundColor: '#fff',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: radius.card, gap: 12,
  },
  toggleLabel: { fontFamily: font.sansSemiBold, fontSize: 15, color: STATIC.textPrimary },
  toggleDesc: { fontFamily: font.sans, fontSize: 13, color: STATIC.textMuted },
  bottom: { padding: 28 },
  startBtn: {
    height: 54, borderRadius: radius.btnLg, alignItems: 'center', justifyContent: 'center',
  },
  startBtnText: { fontFamily: font.sansSemiBold, fontSize: 16, color: '#fff' },
});
