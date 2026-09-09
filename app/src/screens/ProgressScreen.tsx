import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, STATIC, swatchColor, spacing } from '../theme';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { ProgressRing } from '../components/ProgressRing';

export function ProgressScreen() {
  const theme = useTheme();
  const { progress, fetchProgress } = useAppStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(useCallback(() => { fetchProgress(); }, []));

  async function onRefresh() { setRefreshing(true); await fetchProgress(); setRefreshing(false); }

  const overall = progress?.overall ?? { rated: 0, total: 0, percent: 0 };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Overall summary card */}
        <View style={styles.summaryCard}>
          <ProgressRing
            percent={overall.percent}
            size={104}
            stroke={8}
            color={theme.accent}
            labelSize={24}
            label="rated"
          />
          <Text style={styles.summaryText}>
            {overall.rated} of {overall.total} items rated by {user?.name ?? 'you'}
          </Text>
        </View>

        {/* Per-category bars */}
        {(progress?.categories ?? []).map((cat, i) => (
          <View key={cat.categoryId} style={styles.catRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.catHeader}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catFraction}>{cat.rated}/{cat.total}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${cat.percent}%` as any, backgroundColor: swatchColor(i) },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}

        {!progress && (
          <View style={[styles.emptyCard, { backgroundColor: STATIC.card }]}>
            <Text style={styles.emptyText}>Start rating items to see your progress</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 58, paddingHorizontal: spacing.screenH, paddingBottom: 14 },
  title: { fontFamily: font.serif, fontSize: 26, color: STATIC.textPrimary },
  content: { padding: spacing.screenH, gap: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: STATIC.card, borderRadius: radius.card, padding: 20,
    alignItems: 'center', gap: 14,
  },
  summaryText: { fontFamily: font.sans, fontSize: 14, color: STATIC.textMuted, textAlign: 'center' },
  catRow: { backgroundColor: STATIC.card, borderRadius: radius.cardSm, padding: 16 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName: { fontFamily: font.sansMedium, fontSize: 14, color: STATIC.textPrimary },
  catFraction: { fontFamily: font.sans, fontSize: 13, color: STATIC.textMuted },
  barTrack: { height: 8, backgroundColor: STATIC.track, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  emptyCard: { borderRadius: radius.card, padding: 24, alignItems: 'center' },
  emptyText: { fontFamily: font.sans, fontSize: 15, color: STATIC.textMuted },
});
