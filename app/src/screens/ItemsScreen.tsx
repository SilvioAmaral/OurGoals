import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, shadow, spacing, STATIC } from '../theme';
import { itemApi } from '../api';
import { Item, useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { RatingPills } from '../components/RatingPills';
import { interpolate } from '../utils/interpolate';
import { AddModal } from '../components/AddModal';
import { CategoriesStackParamList } from '../navigation/CategoriesStack';

type Route = RouteProp<CategoriesStackParamList, 'Items'>;
type Nav = NativeStackNavigationProp<CategoriesStackParamList, 'Items'>;

export function ItemsScreen() {
  const theme = useTheme();
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const { categoryId, categoryName } = route.params;
  const partner = useAppStore(s => s.partner);
  const { user } = useAuthStore();
  const partnerName = partner?.partner?.name ?? user?.partnerNickname ?? null;

  const [items, setItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const { data } = await itemApi.list(categoryId);
    setItems(data.items);
  }

  useFocusEffect(useCallback(() => { load(); }, [categoryId]));

  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  async function handleRate(itemId: string, value: number) {
    setItems(prev => prev.map(i => i._id === itemId ? { ...i, myRating: value } : i));
    try {
      await itemApi.rate(categoryId, itemId, value);
    } catch {
      load();
    }
  }

  async function handleDelete(itemId: string) {
    Alert.alert('Remove entry', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await itemApi.delete(categoryId, itemId);
          setItems(prev => prev.filter(i => i._id !== itemId));
        },
      },
    ]);
  }

  async function handleAdd(name: string) {
    await itemApi.create(categoryId, name);
    await load();
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Header */}
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
        {items.length === 0 && (
          <View style={[styles.empty, { backgroundColor: STATIC.card }]}>
            <Text style={styles.emptyText}>No entries yet — tap + to add one</Text>
          </View>
        )}

        {items.map(item => (
          <Pressable
            key={item._id}
            style={[styles.card, shadow.card]}
            onPress={() => nav.navigate('ItemDetail', { categoryId, itemId: item._id, categoryName })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.itemName}>{interpolate(item.name, partnerName)}</Text>
              <Pressable onPress={() => handleDelete(item._id)} hitSlop={10}>
                <Text style={{ color: STATIC.textFaint, fontSize: 18 }}>×</Text>
              </Pressable>
            </View>

            <RatingPills value={item.myRating} onChange={v => handleRate(item._id, v)} />

            {item.myRating && item.myRating >= 4 && item.partnerRating && item.partnerRating >= 4 && (
              <Text style={[styles.matchNote, { color: theme.accent }]}>
                You both want this!
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={() => setModalOpen(true)}
        style={[styles.fab, { backgroundColor: theme.accent }, shadow.fab]}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <AddModal
        visible={modalOpen}
        mode="item"
        existingNames={items.map(i => i.name)}
        onAdd={handleAdd}
        onClose={() => setModalOpen(false)}
      />
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
  list: { padding: spacing.screenH, gap: spacing.gap, paddingBottom: 100 },
  card: { backgroundColor: STATIC.card, borderRadius: radius.cardSm, padding: 14, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { fontFamily: font.sansMedium, fontSize: 15, color: STATIC.textPrimary, flex: 1, marginRight: 8 },
  matchNote: { fontFamily: font.sans, fontSize: 12, marginTop: 2 },
  fab: {
    position: 'absolute', right: 20, bottom: 30,
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
  empty: { borderRadius: radius.card, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: font.sans, fontSize: 15, color: STATIC.textMuted },
});
