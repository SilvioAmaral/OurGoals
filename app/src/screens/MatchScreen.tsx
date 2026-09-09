import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, STATIC, swatchColor, spacing } from '../theme';
import { useAppStore } from '../store/appStore';

export function MatchScreen() {
  const theme = useTheme();
  const { match, fetchMatch, partner } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(useCallback(() => { fetchMatch(); }, []));

  async function onRefresh() { setRefreshing(true); await fetchMatch(); setRefreshing(false); }

  if (partner?.status !== 'accepted') {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Match</Text>
        </View>
        <View style={styles.waiting}>
          <Text style={styles.waitingText}>
            {partner?.status === 'pending'
              ? `Waiting for your partner to accept the invite…`
              : 'Invite your partner to see your match!'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Match</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overall match card */}
        <View style={[styles.matchCard, { backgroundColor: theme.accent }]}>
          <Text style={styles.matchPercent}>{match?.overallMatchPercent ?? 0}%</Text>
          <Text style={styles.matchCaption}>
            match on {match?.totalRatedByBoth ?? 0} shared answers
          </Text>
        </View>

        {/* Shared high items */}
        <Text style={styles.sectionLabel}>THINGS YOU BOTH CAN'T WAIT FOR</Text>
        {(match?.sharedHighItems ?? []).length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: STATIC.card }]}>
            <Text style={styles.emptyText}>Rate items ≥4 together to see matches here</Text>
          </View>
        ) : (
          <View style={styles.sharedCard}>
            {(match?.sharedHighItems ?? []).slice(0, 6).map((item, i) => (
              <View key={item.itemId} style={styles.sharedRow}>
                <View style={[styles.dot, { backgroundColor: swatchColor(i) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sharedName}>{item.name}</Text>
                  <Text style={styles.sharedCat}>{item.categoryName}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Match by category */}
        <Text style={styles.sectionLabel}>MATCH BY CATEGORY</Text>
        {(match?.byCategory ?? []).map((cat, i) => (
          <View key={cat.categoryId} style={styles.catRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.catHeader}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catPct}>{cat.matchPercent}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${cat.matchPercent}%` as any, backgroundColor: swatchColor(i) },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 58, paddingHorizontal: spacing.screenH, paddingBottom: 14 },
  title: { fontFamily: font.serif, fontSize: 26, color: STATIC.textPrimary },
  content: { padding: spacing.screenH, gap: 16, paddingBottom: 40 },
  matchCard: {
    borderRadius: radius.card, padding: 22, alignItems: 'center', gap: 6,
  },
  matchPercent: { fontFamily: font.serif, fontSize: 40, fontWeight: '700', color: '#fff' },
  matchCaption: { fontFamily: font.sans, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  sectionLabel: {
    fontFamily: font.sansSemiBold, fontSize: 11, color: STATIC.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  sharedCard: { backgroundColor: STATIC.card, borderRadius: radius.card, padding: 16, gap: 12 },
  sharedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sharedName: { fontFamily: font.sansMedium, fontSize: 14, color: STATIC.textPrimary },
  sharedCat: { fontFamily: font.sans, fontSize: 12, color: STATIC.textMuted },
  catRow: { backgroundColor: STATIC.card, borderRadius: radius.cardSm, padding: 16 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName: { fontFamily: font.sansMedium, fontSize: 14, color: STATIC.textPrimary },
  catPct: { fontFamily: font.sansSemiBold, fontSize: 13, color: STATIC.textMuted },
  barTrack: { height: 8, backgroundColor: STATIC.track, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  emptyCard: { borderRadius: radius.card, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: font.sans, fontSize: 14, color: STATIC.textMuted, textAlign: 'center' },
  waiting: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  waitingText: { fontFamily: font.sans, fontSize: 16, color: STATIC.textMuted, textAlign: 'center' },
});
