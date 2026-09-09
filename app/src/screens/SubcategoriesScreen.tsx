import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, shadow, spacing, STATIC, swatchColor } from '../theme';
import { categoryApi } from '../api';
import { Category } from '../store/appStore';
import { ProgressRing } from '../components/ProgressRing';
import { CategoriesStackParamList } from '../navigation/CategoriesStack';

type Route = RouteProp<CategoriesStackParamList, 'Subcategories'>;
type Nav = NativeStackNavigationProp<CategoriesStackParamList, 'Subcategories'>;

export function SubcategoriesScreen() {
  const theme = useTheme();
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const { categoryId, categoryName } = route.params;

  const [subs, setSubs] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data } = await categoryApi.subcategories(categoryId);
    setSubs(data.categories);
  }

  useFocusEffect(useCallback(() => { load(); }, [categoryId]));

  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: STATIC.textPrimary }}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{categoryName}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {subs.length === 0 && (
          <View style={[styles.empty, { backgroundColor: STATIC.card }]}>
            <Text style={styles.emptyText}>No sub-categories found</Text>
          </View>
        )}

        {subs.map((cat, i) => {
          const percent = cat.totalItems > 0 ? Math.round((cat.ratedByMe / cat.totalItems) * 100) : 0;
          const color = swatchColor(i);
          return (
            <Pressable
              key={cat._id}
              style={[styles.card, shadow.card]}
              onPress={() => nav.navigate('Items', { categoryId: cat._id, categoryName: cat.name, colorHue: cat.colorHue })}
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

              {cat.totalItems > 0 ? (
                <ProgressRing percent={percent} size={34} stroke={3} color={theme.accent} labelSize={9} />
              ) : (
                <Text style={{ color: STATIC.textMuted, fontSize: 20 }}>›</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 58, paddingHorizontal: spacing.screenH, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: STATIC.card, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: font.serif, fontSize: 22, color: STATIC.textPrimary, flex: 1 },
  list: { padding: spacing.screenH, gap: spacing.gap, paddingBottom: 40 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: STATIC.card, borderRadius: radius.card, padding: 16,
  },
  swatch: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  swatchLetter: { fontFamily: font.serif, fontSize: 18, color: '#fff' },
  catName: { fontFamily: font.sansSemiBold, fontSize: 16, color: STATIC.textPrimary },
  catSub: { fontFamily: font.sans, fontSize: 13, color: STATIC.textMuted, marginTop: 2 },
  empty: { borderRadius: radius.card, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: font.sans, fontSize: 15, color: STATIC.textMuted },
});
