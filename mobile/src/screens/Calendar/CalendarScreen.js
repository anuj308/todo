import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCalendar } from '../../context/CalendarContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const isSameDay = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  return new Date(dateA).setHours(0, 0, 0, 0) === new Date(dateB).setHours(0, 0, 0, 0);
};

const startOfMonth = (date) => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getMonthDays = (currentMonth, dayStats) => {
  const start = startOfMonth(currentMonth);
  const firstDayOfWeek = start.getDay();

  const gridStart = new Date(start);
  gridStart.setDate(gridStart.getDate() - firstDayOfWeek);

  const days = [];

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);

    const key = new Date(date).setHours(0, 0, 0, 0);
    const stats = dayStats.get(key) || { total: 0, completed: 0 };

    days.push({
      date,
      isCurrentMonth: date.getMonth() === currentMonth.getMonth(),
      isToday: isSameDay(date, new Date()),
      stats,
    });
  }

  return days;
};

const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const CalendarScreen = () => {
  const {
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    loading,
    error,
    calendarTodos,
    monthSummary,
    getTodosForDate,
    createCalendarTodo,
    updateCalendarTodo,
    deleteCalendarTodo,
  } = useCalendar();
  const { colors } = useTheme();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTime, setNewTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);

  const dayStats = useMemo(() => {
    const map = new Map();
    calendarTodos.forEach((todo) => {
      if (!todo.dueDate) return;
      const key = new Date(todo.dueDate).setHours(0, 0, 0, 0);
      if (!map.has(key)) {
        map.set(key, { total: 0, completed: 0 });
      }
      const stats = map.get(key);
      stats.total += 1;
      if (todo.isCompleted) {
        stats.completed += 1;
      }
    });
    return map;
  }, [calendarTodos]);

  const calendarDays = useMemo(
    () => getMonthDays(currentMonth, dayStats),
    [currentMonth, dayStats]
  );

  const dayTodos = useMemo(() => {
    const list = getTodosForDate(selectedDate) || [];
    return [...list].sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeA - timeB;
    });
  }, [getTodosForDate, selectedDate, calendarTodos]);

  const handleDayPress = (day) => {
    const normalized = new Date(day.date);
    normalized.setHours(0, 0, 0, 0);
    setSelectedDate(normalized);
    if (!day.isCurrentMonth) {
      setCurrentMonth(normalized);
    }
  };

  const openCreateModal = () => {
    setNewTitle('');
    setNewDescription('');
    setNewTime('');
    setPriority('medium');
    setIsModalVisible(true);
  };

  const closeCreateModal = () => {
    if (saving) return;
    setIsModalVisible(false);
  };

  const handleCreateTodo = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Title', 'Please add a title for the calendar item.');
      return;
    }

    const dueDate = new Date(selectedDate);
    if (newTime.trim()) {
      const [hourStr, minuteStr] = newTime.split(':');
      const hours = Number.parseInt(hourStr, 10);
      const minutes = Number.parseInt(minuteStr, 10);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        dueDate.setHours(hours, minutes, 0, 0);
      }
    } else {
      dueDate.setHours(9, 0, 0, 0);
    }

    setSaving(true);

    try {
      await createCalendarTodo({
        title: newTitle.trim(),
        description: newDescription.trim(),
        dueDate: dueDate.toISOString(),
        priority,
      });
      setIsModalVisible(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create calendar item');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompletion = async (todo) => {
    try {
      await updateCalendarTodo(todo.id, {
        isCompleted: !todo.isCompleted,
        completionPercentage: !todo.isCompleted ? 100 : 0,
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update item');
    }
  };

  const handleDeleteTodo = (todo) => {
    Alert.alert(
      'Delete Item',
      `Remove "${todo.title}" from the calendar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCalendarTodo(todo.id);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    navButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.round,
    },
    navButtonText: {
      fontSize: fontSize.xl,
      color: colors.text,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    todayButton: {
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    todayText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    calendarContainer: {
      margin: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    weekRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surfaceVariant,
    },
    weekDay: {
      flex: 1,
      textAlign: 'center',
      paddingVertical: spacing.sm,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.2857%',
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      alignItems: 'center',
    },
    dayNumber: {
      fontSize: fontSize.md,
      marginBottom: spacing.xs,
    },
    dayNumberOutside: {
      color: colors.textTertiary,
    },
    todayBadge: {
      backgroundColor: colors.primary,
      color: '#fff',
      borderRadius: borderRadius.round,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      fontSize: fontSize.xs,
      marginBottom: spacing.xs,
    },
    indicatorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 1,
    },
    selectedDayHighlight: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: borderRadius.md,
    },
    dayDetailsCard: {
      flex: 1,
      marginTop: spacing.sm,
      marginHorizontal: spacing.md,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    detailsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    detailsTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    addButtonText: {
      color: '#fff',
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    todoItem: {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    todoTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    todoTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    todoDescription: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    todoMeta: {
      fontSize: fontSize.xs,
      color: colors.textTertiary,
    },
    todoActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: spacing.xs,
    },
    actionButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      marginLeft: spacing.sm,
    },
    actionText: {
      fontSize: fontSize.xs,
      color: colors.text,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    input: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
      fontSize: fontSize.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      marginBottom: spacing.sm,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    priorityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: spacing.sm,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginHorizontal: spacing.xs,
    },
    priorityActive: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    priorityText: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: spacing.md,
    },
    modalButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceVariant,
      marginLeft: spacing.sm,
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
    },
    modalButtonPrimaryText: {
      color: '#fff',
    },
    errorBanner: {
      backgroundColor: colors.error,
      padding: spacing.sm,
      margin: spacing.md,
      borderRadius: borderRadius.md,
    },
    errorText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: fontSize.sm,
    },
  });

  if (loading && calendarTodos.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {monthSummary.completed} done · {monthSummary.pending} to go
          </Text>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.calendarContainer}>
        <View style={styles.weekRow}>
          {DAYS_OF_WEEK.map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {calendarDays.map((day) => {
            const isSelected = isSameDay(day.date, selectedDate);
            const dots = [];
            const dotCount = Math.min(day.stats.total, 3);
            for (let i = 0; i < dotCount; i += 1) {
              dots.push(
                <View
                  // eslint-disable-next-line react/no-array-index-key
                  key={`dot-${i}`}
                  style={[
                    styles.dot,
                    { backgroundColor: i < day.stats.completed ? colors.primary : colors.textTertiary },
                  ]}
                />
              );
            }

            return (
              <TouchableOpacity
                key={day.date.toISOString()}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDayHighlight,
                  !day.isCurrentMonth && { backgroundColor: colors.background },
                ]}
                onPress={() => handleDayPress(day)}
              >
                {day.isToday && <Text style={styles.todayBadge}>Today</Text>}
                <Text
                  style={[
                    styles.dayNumber,
                    !day.isCurrentMonth && styles.dayNumberOutside,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
                <View style={[styles.indicatorRow, { marginTop: spacing.xs }]}>{dots}</View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.dayDetailsCard}>
        <View style={styles.detailsHeader}>
          <View>
            <Text style={styles.detailsTitle}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.summaryText}>{dayTodos.length} items scheduled</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {dayTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.summaryText}>Plan something for this day</Text>
            <Text style={styles.emptyText}>
              Tap "+ Add" to schedule a task or milestone.
            </Text>
          </View>
        ) : (
          <ScrollView>
            {dayTodos.map((todo) => (
              <View key={todo.id} style={styles.todoItem}>
                <View style={styles.todoTitleRow}>
                  <Text
                    style={[
                      styles.todoTitle,
                      todo.isCompleted && { textDecorationLine: 'line-through', color: colors.textSecondary },
                    ]}
                  >
                    {todo.title}
                  </Text>
                  <Text style={styles.todoMeta}>{formatTime(todo.dueDate)}</Text>
                </View>
                {todo.description ? (
                  <Text style={styles.todoDescription}>{todo.description}</Text>
                ) : null}
                <Text style={styles.todoMeta}>
                  Priority: {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </Text>
                <View style={styles.todoActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { marginLeft: 0 }]}
                    onPress={() => handleToggleCompletion(todo)}
                  >
                    <Text style={styles.actionText}>{todo.isCompleted ? 'Mark Pending' : 'Mark Done'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteTodo(todo)}
                  >
                    <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCreateModal}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Calendar Item</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={colors.textTertiary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textTertiary}
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Time (HH:MM, optional)"
              placeholderTextColor={colors.textTertiary}
              value={newTime}
              onChangeText={setNewTime}
              keyboardType="numbers-and-punctuation"
            />
            <View style={styles.priorityRow}>
              {['low', 'medium', 'high', 'urgent'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    priority === level && styles.priorityActive,
                  ]}
                  onPress={() => setPriority(level)}
                >
                  <Text style={styles.priorityText}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { marginLeft: 0 }]}
                onPress={closeCreateModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateTodo}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default CalendarScreen;
