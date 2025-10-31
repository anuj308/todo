import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useProjects } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const ProjectDetailScreen = ({ route, navigation }) => {
  const { projectId } = route.params;
  const { currentProject, fetchProjectById, loading, error, deleteProject } = useProjects();
  const { colors } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProjectById(projectId);
  }, [projectId, fetchProjectById]);

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete project.');
    }
  };

  const styles = screenStyles(colors, currentProject?.color);

  if (loading || !currentProject) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const completionRate = currentProject.completionRate || 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{currentProject.title}</Text>
          <Text style={styles.description}>{currentProject.description}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('ProjectEdit', { projectId })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Project Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>{currentProject.status}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Priority:</Text>
          <Text style={styles.statusValue}>{currentProject.priority}</Text>
        </View>
        {currentProject.goalDate && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Goal Date:</Text>
            <Text style={styles.statusValue}>
              {new Date(currentProject.goalDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progress</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{completionRate}% Complete</Text>
          <Text style={styles.taskCount}>
            {currentProject.completedCount} / {currentProject.todoCount} tasks
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${completionRate}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tasks</Text>
        {currentProject.todos && currentProject.todos.length > 0 ? (
          currentProject.todos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <Text style={[styles.todoTitle, todo.isCompleted && styles.todoCompleted]}>
                {todo.title}
              </Text>
              <Text style={styles.todoDueDate}>
                {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTasksText}>No tasks in this project yet.</Text>
        )}
      </View>

      <View style={styles.dangerZone}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteConfirm(true)}>
          <Text style={styles.deleteButtonText}>Delete Project</Text>
        </TouchableOpacity>
        {showDeleteConfirm && (
          <View style={styles.confirmDelete}>
            <Text style={styles.confirmText}>Are you sure? This cannot be undone.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleDelete}>
                <Text style={styles.confirmButtonText}>Yes, Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const screenStyles = (colors, projectColor = '#ccc') => StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.error, fontSize: fontSize.md },
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderLeftWidth: 5,
    borderLeftColor: projectColor,
  },
  headerContent: {},
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: fontSize.md, color: colors.textSecondary },
  headerActions: { position: 'absolute', top: spacing.lg, right: spacing.lg },
  editButton: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: borderRadius.md },
  editButtonText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    marginBottom: 0,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  statusLabel: { color: colors.textSecondary },
  statusValue: { color: colors.text, fontWeight: '600', textTransform: 'capitalize' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  progressText: { color: colors.text, fontWeight: 'bold' },
  taskCount: { color: colors.textSecondary },
  progressBarContainer: { height: 10, backgroundColor: colors.surfaceVariant, borderRadius: 5 },
  progressBar: { height: '100%', backgroundColor: projectColor, borderRadius: 5 },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  todoTitle: { color: colors.text },
  todoCompleted: { textDecorationLine: 'line-through', color: colors.textTertiary },
  todoDueDate: { color: colors.textSecondary, fontSize: fontSize.xs },
  noTasksText: { color: colors.textTertiary, fontStyle: 'italic' },
  dangerZone: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.error },
  deleteButton: { backgroundColor: colors.error, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  confirmDelete: { marginTop: spacing.md },
  confirmText: { color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  confirmActions: { flexDirection: 'row', justifyContent: 'center' },
  confirmButton: { padding: spacing.sm, borderRadius: borderRadius.md, marginHorizontal: spacing.sm, minWidth: 100, alignItems: 'center' },
  confirmButtonText: { color: colors.error, fontWeight: 'bold' },
  cancelButton: { backgroundColor: colors.surfaceVariant },
  cancelButtonText: { color: colors.text },
});

export default ProjectDetailScreen;
