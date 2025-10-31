import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTodos } from '../../context/TodoContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const TodoListScreen = () => {
  const {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    fetchTodos,
    getFilteredTodos,
    getTodoStats,
  } = useTodos();
  const { colors } = useTheme();
  
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [addingTodo, setAddingTodo] = useState(false);

  const stats = getTodoStats();
  const filteredTodos = getFilteredTodos(filter);

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) {
      Alert.alert('Empty Todo', 'Please enter a todo text');
      return;
    }

    setAddingTodo(true);
    try {
      await addTodo(newTodoText);
      setNewTodoText('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add todo');
    } finally {
      setAddingTodo(false);
    }
  };

  const handleToggleTodo = async (todoId, currentStatus) => {
    try {
      await toggleTodo(todoId, !currentStatus);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update todo');
    }
  };

  const handleDeleteTodo = (todoId, todoText) => {
    Alert.alert(
      'Delete Todo',
      `Are you sure you want to delete "${todoText}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo(todoId);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete todo');
            }
          },
        },
      ]
    );
  };

  const renderTodoItem = ({ item }) => (
    <View style={[styles.todoItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => handleToggleTodo(item.id || item._id, item.completed)}
      >
        <View style={[
          styles.checkbox,
          { borderColor: item.completed ? colors.primary : colors.border },
          item.completed && { backgroundColor: colors.primary }
        ]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text
          style={[
            styles.todoText,
            { color: item.completed ? colors.textSecondary : colors.text },
            item.completed && styles.todoTextCompleted,
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTodo(item.id || item._id, item.text)}
      >
        <Text style={[styles.deleteButtonText, { color: colors.error }]}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterTab = (tabFilter, label, count) => {
    const isActive = filter === tabFilter;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterTab,
          {
            backgroundColor: isActive ? colors.primary : colors.surface,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setFilter(tabFilter)}
      >
        <Text style={[
          styles.filterTabText,
          { color: isActive ? '#fff' : colors.text }
        ]}>
          {label}
        </Text>
        <View style={[
          styles.filterBadge,
          { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : colors.primaryLight }
        ]}>
          <Text style={[
            styles.filterBadgeText,
            { color: isActive ? '#fff' : colors.primary }
          ]}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: spacing.md,
    },
    title: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    input: {
      flex: 1,
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: colors.text,
      marginRight: spacing.sm,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    filterContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    filterTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      gap: spacing.xs,
    },
    filterTabText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    filterBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      minWidth: 24,
      alignItems: 'center',
    },
    filterBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
    },
    listContainer: {
      flex: 1,
    },
    todosList: {
      padding: spacing.md,
    },
    todoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
    },
    todoContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      marginRight: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: '#fff',
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    todoText: {
      flex: 1,
      fontSize: fontSize.md,
      lineHeight: 22,
    },
    todoTextCompleted: {
      textDecorationLine: 'line-through',
    },
    deleteButton: {
      padding: spacing.sm,
      marginLeft: spacing.sm,
    },
    deleteButtonText: {
      fontSize: fontSize.lg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.md,
    },
    emptyText: {
      fontSize: fontSize.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: fontSize.sm,
      color: colors.textTertiary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      padding: spacing.md,
      backgroundColor: colors.errorLight || '#fee',
      borderRadius: borderRadius.md,
      margin: spacing.md,
    },
    errorText: {
      color: colors.error,
      fontSize: fontSize.sm,
      textAlign: 'center',
    },
  });

  if (loading && todos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📝 My Todos</Text>
        
        {/* Add Todo Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a new task..."
            placeholderTextColor={colors.textTertiary}
            value={newTodoText}
            onChangeText={setNewTodoText}
            onSubmitEditing={handleAddTodo}
            returnKeyType="done"
            editable={!addingTodo}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTodo}
            disabled={addingTodo}
          >
            {addingTodo ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {renderFilterTab('all', 'All', stats.total)}
          {renderFilterTab('pending', 'Pending', stats.pending)}
          {renderFilterTab('completed', 'Done', stats.completed)}
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Todos List */}
      <View style={styles.listContainer}>
        {filteredTodos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {filter === 'completed' ? '✨' : '📋'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'completed' && 'No completed tasks yet'}
              {filter === 'pending' && 'No pending tasks'}
              {filter === 'all' && 'No tasks yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' && 'Add your first task above to get started!'}
              {filter === 'pending' && 'All tasks are completed! 🎉'}
              {filter === 'completed' && 'Complete a task to see it here'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTodos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id || item._id}
            contentContainerStyle={styles.todosList}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchTodos}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default TodoListScreen;
