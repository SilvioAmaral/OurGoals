import React, { useState, useRef } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { font, radius, STATIC } from '../theme';

const CATEGORY_SUGGESTIONS = [
  'Travel', 'Food & Drink', 'Adventure', 'Culture', 'Wellness', 'Entertainment',
  'Sports', 'Learning', 'Home', 'Family', 'Romance', 'Nature',
];

const ITEM_SUGGESTIONS: Record<string, string[]> = {
  default: [
    'Hot air balloon ride', 'Cook a 5-course meal', 'See the Northern Lights',
    'Go skydiving', 'Learn to dance', 'Visit Japan', 'Hike a volcano',
    'Take a cooking class', 'Watch a meteor shower', 'Learn a language together',
    'Road trip across the country', 'Try surfing', 'Visit a vineyard',
  ],
};

interface Props {
  visible: boolean;
  mode: 'category' | 'item';
  existingNames: string[];
  onAdd: (name: string) => Promise<void>;
  onClose: () => void;
}

export function AddModal({ visible, mode, existingNames, onAdd, onClose }: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const suggestions = (mode === 'category' ? CATEGORY_SUGGESTIONS : ITEM_SUGGESTIONS.default)
    .filter(s => !existingNames.includes(s) && s.toLowerCase().includes(text.toLowerCase()))
    .slice(0, 5);

  const title = mode === 'category' ? 'Add a new group' : 'Add an entry';

  async function handleAdd() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onAdd(text.trim());
      setText('');
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setText('');
    setOpen(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>

        <View style={{ position: 'relative' }}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={mode === 'category' ? 'e.g. Travel' : 'e.g. See the Northern Lights'}
              placeholderTextColor={STATIC.textFaint}
              value={text}
              onChangeText={t => { setText(t); setOpen(true); }}
              onFocus={() => setOpen(true)}
              autoFocus
            />
            <Pressable onPress={() => setOpen(o => !o)} style={[styles.chevronBtn, { borderColor: STATIC.border }]}>
              <Text style={{ fontSize: 12, color: STATIC.textMuted, transform: [{ rotate: open ? '180deg' : '0deg' }] }}>▾</Text>
            </Pressable>
          </View>

          {open && suggestions.length > 0 && (
            <View style={styles.dropdown}>
              {suggestions.map(s => (
                <Pressable
                  key={s}
                  onPress={() => { setText(s); setOpen(false); }}
                  style={({ pressed }) => [styles.suggestion, pressed && { backgroundColor: STATIC.track }]}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.btnRow}>
          <Pressable onPress={handleClose} style={[styles.btn, styles.btnCancel]}>
            <Text style={[styles.btnText, { color: STATIC.textMuted }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleAdd}
            disabled={!text.trim() || loading}
            style={[styles.btn, { backgroundColor: theme.accent, opacity: !text.trim() ? 0.4 : 1 }]}
          >
            <Text style={[styles.btnText, { color: '#fff' }]}>Add</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: STATIC.track, alignSelf: 'center', marginBottom: 4,
  },
  title: { fontFamily: font.serif, fontSize: 18, color: STATIC.textPrimary },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: STATIC.border, borderRadius: radius.input },
  input: {
    flex: 1, padding: 14, fontFamily: font.sans, fontSize: 15, color: STATIC.textPrimary,
  },
  chevronBtn: { padding: 14 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 12, zIndex: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 8,
  },
  suggestion: { padding: 14 },
  suggestionText: { fontFamily: font.sans, fontSize: 15, color: STATIC.textPrimary },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.btn },
  btnCancel: { backgroundColor: STATIC.track },
  btnText: { fontFamily: font.sansSemiBold, fontSize: 15 },
});
