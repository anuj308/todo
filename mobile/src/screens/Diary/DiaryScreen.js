import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDiary } from '../../context/DiaryContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const formatDisplayDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const shortDateLabel = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const today = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const DiaryScreen = () => {
  const {
    selectedDate,
    selectDate,
    loadEntry,
    saveEntry,
    getEntryForDate,
    recentEntries,
    loading,
    saving,
    error,
  } = useDiary();
  const { colors } = useTheme();

  const [content, setContent] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const entry = getEntryForDate(selectedDate);

  useEffect(() => {
    if (!entry?.loading && typeof entry?.content === 'string') {
      setContent(entry.content);
    }
  }, [selectedDate, entry?.content, entry?.loading]);

  const goToOffsetDay = (offset) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    selectDate(next);
    setStatusMessage(null);
  };

  const handleSave = async () => {
    try {
      await saveEntry(selectedDate, content);
      setStatusMessage('Saved just now');
    } catch (err) {
      Alert.alert('Save Failed', err.message || 'Unable to save diary entry.');
    }
  };

  const handleToday = () => {
    selectDate(today());
    setStatusMessage(null);
  };

  const isTodaySelected = useMemo(() => {
    const selected = new Date(selectedDate);
    const now = today();
    return selected.getTime() === now.getTime();
  }, [selectedDate]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    dateTitle: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      marginRight: spacing.md,
    },
    navButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceVariant,
    },
    navButtonText: {
      fontSize: fontSize.lg,
      color: colors.text,
    },
    todayButton: {
      backgroundColor: isTodaySelected ? colors.primary : colors.surfaceVariant,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
    },
    todayButtonText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: isTodaySelected ? '#fff' : colors.text,
    },
    statusText: {
      marginTop: spacing.xs,
      fontSize: fontSize.xs,
      color: colors.textTertiary,
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    editorCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    editorLabel: {
      fontSize: fontSize.sm,
      textTransform: 'uppercase',
      color: colors.textTertiary,
      marginBottom: spacing.sm,
      letterSpacing: 1,
    },
    textInput: {
      minHeight: 220,
      textAlignVertical: 'top',
      fontSize: fontSize.md,
      lineHeight: 24,
      color: colors.text,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    saveBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: spacing.md,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      minWidth: 120,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    errorBanner: {
      marginTop: spacing.md,
      backgroundColor: colors.error,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
    },
    errorText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: fontSize.sm,
    },
    recentSection: {
      marginTop: spacing.lg,
    },
    recentTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    recentScroll: {
      flexDirection: 'row',
    },
    recentCard: {
      width: 140,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.md,
    },
    recentDate: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    recentSnippet: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    loadingOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    loadingText: {
      marginLeft: spacing.sm,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.navButton} onPress={() => goToOffsetDay(-1)}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.dateTitle}>{formatDisplayDate(selectedDate)}</Text>
            <TouchableOpacity style={styles.navButton} onPress={() => goToOffsetDay(1)}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.todayButton} onPress={handleToday}>
            <Text style={styles.todayButtonText}>{isTodaySelected ? 'Viewing Today' : 'Jump to Today'}</Text>
          </TouchableOpacity>
          {statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}
          {entry?.updatedAt && (
            <Text style={styles.statusText}>
              Last updated {entry.updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </Text>
          )}
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.editorCard}>
            <Text style={styles.editorLabel}>Today&apos;s Reflections</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Write about your day, highlights, challenges, or anything on your mind..."
              placeholderTextColor={colors.textTertiary}
              value={content}
              onChangeText={(value) => {
                setContent(value);
                setStatusMessage(null);
              }}
            />
            {(loading || entry?.loading) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading entry...</Text>
              </View>
            )}
            <View style={styles.saveBar}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Entry</Text>
                )}
              </TouchableOpacity>
            </View>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {recentEntries && recentEntries.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent Entries</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.recentScroll}>
                  {recentEntries.map((item, index) => {
                    const cardDate = item.date || today();
                    const key = cardDate instanceof Date ? cardDate.toISOString() : `entry-${index}`;
                    return (
                    <TouchableOpacity
                      key={key}
                      style={styles.recentCard}
                      onPress={() => selectDate(cardDate)}
                    >
                      <Text style={styles.recentDate}>{shortDateLabel(cardDate)}</Text>
                      <Text style={styles.recentSnippet} numberOfLines={3}>
                        {item.content || 'No notes recorded.'}
                      </Text>
                    </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DiaryScreen;
