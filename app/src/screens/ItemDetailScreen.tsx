import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, STATIC, ratingColor } from '../theme';
import { itemApi } from '../api';
import { RatingPills, ratingLabel } from '../components/RatingPills';
import { interpolate } from '../utils/interpolate';
import { CategoriesStackParamList } from '../navigation/CategoriesStack';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

type Route = RouteProp<CategoriesStackParamList, 'ItemDetail'>;

function matchNote(my: number, partner: number) {
  const diff = Math.abs(my - partner);
  if (diff === 0) return 'Perfect match!';
  if (diff === 1) return 'Close match';
  if (diff === 2) return 'Some overlap';
  return 'You see this differently — worth a chat';
}

export function ItemDetailScreen() {
  const theme = useTheme();
  const nav = useNavigation();
  const route = useRoute<Route>();
  const { categoryId, itemId, categoryName } = route.params;
  const partner = useAppStore(s => s.partner);
  const { user } = useAuthStore();

  const [item, setItem] = useState<{ _id: string; name: string } | null>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [partnerRating, setPartnerRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemApi.detail(categoryId, itemId).then(({ data }) => {
      setItem(data.item);
      setMyRating(data.myRating);
      setPartnerRating(data.partnerRating);
      setLoading(false);
    });
  }, [itemId]);

  async function handleRate(value: number) {
    setMyRating(value);
    await itemApi.rate(categoryId, itemId, value);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  const partnerName = partner?.partner?.name ?? user?.partnerNickname ?? 'Partner';

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: STATIC.textPrimary }}>‹</Text>
        </Pressable>
        <Text style={styles.catLabel}>{categoryName.toUpperCase()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.itemName}>{interpolate(item?.name ?? '', partnerName)}</Text>

        <Text style={styles.rateLabel}>HOW MUCH DO YOU WANT THIS?</Text>
        <RatingPills value={myRating} onChange={handleRate} large />

        {myRating && (
          <Text style={[styles.myLabel, { color: theme.accent }]}>
            You: {ratingLabel(myRating)}
          </Text>
        )}

        {/* Partner rating card */}
        <View style={styles.partnerCard}>
          {partnerRating !== null ? (
            <>
              <View style={[styles.partnerBubble, { backgroundColor: ratingColor(partnerRating as any) }]}>
                <Text style={styles.partnerNum}>{partnerRating}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerName}>{partnerName}</Text>
                <Text style={[styles.matchNote, { color: myRating ? theme.accent : STATIC.textMuted }]}>
                  {myRating ? matchNote(myRating, partnerRating) : ratingLabel(partnerRating)}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noPartnerRating}>{partnerName} hasn't rated this yet</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingTop: 58, paddingHorizontal: 20, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  catLabel: {
    fontFamily: font.sansSemiBold, fontSize: 11, color: STATIC.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  content: { padding: 20, gap: 20 },
  itemName: { fontFamily: font.serif, fontSize: 24, color: STATIC.textPrimary },
  rateLabel: {
    fontFamily: font.sansSemiBold, fontSize: 11, color: STATIC.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  myLabel: { fontFamily: font.sans, fontSize: 14, textAlign: 'center' },
  partnerCard: {
    backgroundColor: '#fff', borderRadius: radius.card, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginTop: 8,
  },
  partnerBubble: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  partnerNum: { fontFamily: font.sansBold, fontSize: 16, color: STATIC.textPrimary },
  partnerName: { fontFamily: font.sansSemiBold, fontSize: 14, color: STATIC.textPrimary },
  matchNote: { fontFamily: font.sans, fontSize: 13, marginTop: 2 },
  noPartnerRating: { fontFamily: font.sans, fontSize: 14, color: STATIC.textMuted },
});
