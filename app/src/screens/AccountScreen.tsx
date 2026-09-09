import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, STATIC, THEMES, ThemeName, spacing } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Toggle } from '../components/Toggle';
import { userApi } from '../api';

const THEME_OPTIONS: { key: ThemeName; label: string; color: string }[] = [
  { key: 'purple', label: 'Purple', color: '#7c3aed' },
  { key: 'rose',   label: 'Rose',   color: '#e03e3e' },
  { key: 'teal',   label: 'Teal',   color: '#0d9488' },
  { key: 'sunset', label: 'Sunset', color: '#d97706' },
];

export function AccountScreen() {
  const theme = useTheme();
  const { user, updateUser, logout } = useAuthStore();
  const { partner, setTheme, theme: themeName, toggleSexuality, reset } = useAppStore();

  const [name, setName] = useState(user?.name ?? '');
  const [partnerNickname, setPartnerNickname] = useState(user?.partnerNickname ?? '');
  const [sexuality, setSexuality] = useState(user?.sexualityEnabled ?? false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await userApi.update({ name: name.trim(), theme: themeName, sexualityEnabled: sexuality, partnerNickname: partnerNickname.trim() });
      updateUser({ name: name.trim(), theme: themeName, sexualityEnabled: sexuality, partnerNickname: partnerNickname.trim() });
      if (sexuality !== user?.sexualityEnabled) {
        await toggleSexuality(sexuality);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function handleTheme(t: ThemeName) {
    setTheme(t);
    await userApi.update({ theme: t });
    updateUser({ theme: t });
  }

  async function handleDelete() {
    try {
      await userApi.delete();
      reset();
      await logout();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete account');
    }
  }

  const partnerName = partner?.partner?.name ?? partner?.inviteContact ?? '—';

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <Text style={styles.avatarLetter}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileSub}>Rating with {partnerName}</Text>
        </View>

        {/* Names */}
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
            value={partnerNickname}
            onChangeText={setPartnerNickname}
            autoCapitalize="words"
            placeholder="Your partner's name"
            placeholderTextColor={STATIC.textFaint}
          />
        </View>

        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THEME</Text>
          <View style={styles.swatches}>
            {THEME_OPTIONS.map(opt => {
              const active = themeName === opt.key;
              return (
                <Pressable key={opt.key} onPress={() => handleTheme(opt.key)} style={styles.swatchWrap}>
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: opt.color },
                      active && styles.swatchActive,
                    ]}
                  />
                  <Text style={styles.swatchLabel}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sexuality toggle */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.toggleLabel}>Sexuality entries</Text>
            <Text style={styles.toggleDesc}>Show an intimate category</Text>
          </View>
          <Toggle value={sexuality} onChange={setSexuality} />
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: theme.accent }]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save changes</Text>}
        </Pressable>

        {/* Sign out */}
        <Pressable onPress={() => { reset(); logout(); }} style={[styles.deleteBtn, { borderColor: STATIC.border }]}>
          <Text style={[styles.deleteBtnText, { color: STATIC.textMuted }]}>Sign Out</Text>
        </Pressable>

        {/* Delete */}
        <Pressable onPress={() => setDeleteModal(true)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </Pressable>
      </ScrollView>

      {/* Delete confirm modal */}
      <Modal visible={deleteModal} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setDeleteModal(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Delete your account?</Text>
          <Text style={styles.sheetBody}>This will permanently remove your account, categories, and all ratings.</Text>
          <View style={styles.sheetBtns}>
            <Pressable onPress={() => setDeleteModal(false)} style={[styles.sheetBtn, { backgroundColor: STATIC.track }]}>
              <Text style={[styles.sheetBtnText, { color: STATIC.textPrimary }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={[styles.sheetBtn, { backgroundColor: STATIC.dangerText }]}>
              <Text style={[styles.sheetBtnText, { color: '#fff' }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 58, paddingHorizontal: spacing.screenH, paddingBottom: 14 },
  title: { fontFamily: font.serif, fontSize: 26, color: STATIC.textPrimary },
  content: { padding: spacing.screenH, gap: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: STATIC.card, borderRadius: radius.card, padding: 20,
    alignItems: 'center', gap: 6,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  avatarLetter: { fontFamily: font.serif, fontSize: 28, color: '#fff' },
  profileName: { fontFamily: font.sansSemiBold, fontSize: 17, color: STATIC.textPrimary },
  profileSub: { fontFamily: font.sans, fontSize: 13, color: STATIC.textMuted },
  field: { gap: 6 },
  label: { fontFamily: font.sansSemiBold, fontSize: 12, color: STATIC.textMuted, letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: STATIC.border, borderRadius: radius.input,
    padding: 14, fontFamily: font.sans, fontSize: 15, color: STATIC.textPrimary, backgroundColor: STATIC.card,
  },
  section: { gap: 10 },
  sectionLabel: { fontFamily: font.sansSemiBold, fontSize: 12, color: STATIC.textMuted, letterSpacing: 0.5 },
  swatches: { flexDirection: 'row', gap: 20 },
  swatchWrap: { alignItems: 'center', gap: 6 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 4,
    borderWidth: 3, borderColor: '#fff',
  },
  swatchLabel: { fontFamily: font.sans, fontSize: 11, color: STATIC.textMuted },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: STATIC.card,
    padding: 16, borderRadius: radius.card, gap: 12,
  },
  toggleLabel: { fontFamily: font.sansSemiBold, fontSize: 15, color: STATIC.textPrimary },
  toggleDesc: { fontFamily: font.sans, fontSize: 13, color: STATIC.textMuted },
  saveBtn: {
    height: 50, borderRadius: radius.btn, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontFamily: font.sansSemiBold, fontSize: 15, color: '#fff' },
  deleteBtn: {
    height: 50, borderRadius: radius.btn, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: STATIC.dangerBorder,
  },
  deleteBtnText: { fontFamily: font.sansSemiBold, fontSize: 15, color: STATIC.dangerText },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 12,
  },
  sheetTitle: { fontFamily: font.serif, fontSize: 20, color: STATIC.textPrimary },
  sheetBody: { fontFamily: font.sans, fontSize: 14, color: STATIC.textMuted },
  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  sheetBtn: { flex: 1, height: 48, borderRadius: radius.btn, alignItems: 'center', justifyContent: 'center' },
  sheetBtnText: { fontFamily: font.sansSemiBold, fontSize: 15 },
});
