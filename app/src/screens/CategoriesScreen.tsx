import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, shadow, spacing, STATIC, swatchColor } from '../theme';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { ProgressRing } from '../components/ProgressRing';
import { AddModal } from '../components/AddModal';
import { CategoriesStackParamList } from '../navigation/CategoriesStack';

type Nav = NativeStackNavigationProp<CategoriesStackParamList, 'CategoriesList'>;

export function CategoriesScreen() {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { categories, fetchCategories, deleteCategory, addCategory, partner } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useFocusEffect(useCallback(() => { fetchCategories(); }, []));

  async function onRefresh() {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert('Delete category', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(id) },
    ]);
  }

  const partnerName = partner?.partner?.name ?? 'Partner';


  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Bucket List</Text>
        <Text style={styles.subtitle}>{user?.name} & {partnerName}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {categories.length === 0 && (
          <View style={[styles.empty, { backgroundColor: STATIC.card }]}>
            <Text style={styles.emptyText}>No categories yet — tap + to add one</Text>
          </View>
        )}

        {categories.map((cat, i) => {
          const percent = cat.totalItems > 0 ? Math.round((cat.ratedByMe / cat.totalItems) * 100) : 0;
          const color = swatchColor(i);
          return (
            <Pressable
              key={cat._id}
              style={[styles.card, shadow.card]}
              onPress={() =>
                cat.subCount > 0
                  ? nav.navigate('Subcategories', { categoryId: cat._id, categoryName: cat.name, colorHue: cat.colorHue })
                  : nav.navigate('Items', { categoryId: cat._id, categoryName: cat.name, colorHue: cat.colorHue })
              }
            >
              <View style={[styles.swatch, { backgroundColor: color }]}>
                <Text style={styles.swatchLetter}>{cat.name[0].toUpperCase()}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catSub}>
                  {cat.totalItems === 0 ? 'No entries yet' : `${cat.ratedByMe} of ${cat.totalItems} rated`}
                </Text>
              </View>

              {cat.subCount > 0 ? (
                <Text style={{ color: STATIC.textMuted, fontSize: 20 }}>›</Text>
              ) : cat.totalItems === 0 && !cat.isSystem ? (
                <Pressable
                  onPress={() => handleDelete(cat._id, cat.name)}
                  style={styles.deleteBtn}
                >
                  <Text style={{ color: STATIC.textMuted, fontSize: 18 }}>×</Text>
                </Pressable>
              ) : (
                <ProgressRing percent={percent} size={34} stroke={3} color={theme.accent} labelSize={9} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => setModalOpen(true)}
        style={[styles.fab, { backgroundColor: theme.accent }, shadow.fab]}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <AddModal
        visible={modalOpen}
        mode="category"
        existingNames={categories.map(c => c.name)}
        onAdd={addCategory}
        onClose={() => setModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 58, paddingHorizontal: spacing.screenH, paddingBottom: 14 },
  title: { fontFamily: font.serif, fontSize: 26, color: STATIC.textPrimary },
  subtitle: { fontFamily: font.sans, fontSize: 14, color: STATIC.textMuted, marginTop: 2 },
  list: { padding: spacing.screenH, gap: spacing.gap, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: STATIC.card, borderRadius: radius.card, padding: 16,
  },
  swatch: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  swatchLetter: { fontFamily: font.serif, fontSize: 18, color: '#fff' },
  catName: { fontFamily: font.sansSemiBold, fontSize: 16, color: STATIC.textPrimary },
  catSub: { fontFamily: font.sans, fontSize: 13, color: STATIC.textMuted, marginTop: 2 },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: STATIC.track, alignItems: 'center', justifyContent: 'center',
  },
  fab: {
    position: 'absolute', right: 20, bottom: 30,
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
  empty: { borderRadius: radius.card, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: font.sans, fontSize: 15, color: STATIC.textMuted },
});
