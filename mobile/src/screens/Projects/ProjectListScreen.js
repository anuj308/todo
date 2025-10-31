import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useProjects } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const ProjectCard = ({ project, onPress }) => {
  const { colors } = useTheme();
  const styles = cardStyles(colors, project.color);

  const completionRate = project.completionRate || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.colorIndicator, { backgroundColor: project.color }]} />
        <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {project.description || 'No description provided.'}
      </Text>
      <View style={styles.stats}>
        <Text style={styles.statText}>{project.todoCount || 0} Tasks</Text>
        <Text style={styles.statText}>{project.status}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${completionRate}%` }]} />
      </View>
      <Text style={styles.progressText}>{completionRate}% complete</Text>
    </TouchableOpacity>
  );
};

const ProjectListScreen = ({ navigation }) => {
  const { projects, loading, error, fetchProjects, addProject } = useProjects();
  const { colors } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
  });

  const handleAddProject = async () => {
    if (!newProject.title.trim()) {
      Alert.alert('Validation Error', 'Project title is required.');
      return;
    }
    try {
      await addProject(newProject);
      setModalVisible(false);
      setNewProject({ title: '', description: '', color: '#3b82f6' });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create project.');
    }
  };

  const styles = screenStyles(colors);

  if (loading && projects.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Projects</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>+ New Project</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No projects yet.</Text>
              <Text style={styles.emptySubText}>Tap &apos;+ New Project&apos; to start.</Text>
            </View>
          )
        }
        onRefresh={fetchProjects}
        refreshing={loading}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <TextInput
              style={styles.input}
              placeholder="Project Title"
              placeholderTextColor={colors.textTertiary}
              value={newProject.title}
              onChangeText={(text) => setNewProject({ ...newProject, title: text })}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textTertiary}
              value={newProject.description}
              onChangeText={(text) => setNewProject({ ...newProject, description: text })}
              multiline
            />
            <Text style={styles.colorLabel}>Project Color</Text>
            <View style={styles.colorSelector}>
              {['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newProject.color === color && styles.selectedColor,
                  ]}
                  onPress={() => setNewProject({ ...newProject, color })}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleAddProject}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const screenStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold', color: colors.text },
  addButton: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: borderRadius.md },
  addButtonText: { color: '#fff', fontWeight: '600' },
  emptyText: { fontSize: fontSize.lg, color: colors.textSecondary },
  emptySubText: { fontSize: fontSize.md, color: colors.textTertiary, marginTop: spacing.sm },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.surfaceVariant,
    color: colors.text,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorLabel: { color: colors.text, marginBottom: spacing.sm },
  colorSelector: { flexDirection: 'row', marginBottom: spacing.lg },
  colorOption: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.md },
  selectedColor: { borderWidth: 3, borderColor: colors.primary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  button: { padding: spacing.md, borderRadius: borderRadius.md, minWidth: 100, alignItems: 'center' },
  cancelButton: { backgroundColor: colors.surfaceVariant, marginRight: spacing.md },
  createButton: { backgroundColor: colors.primary },
  buttonText: { color: colors.text, fontWeight: '600' },
});

const cardStyles = (colors, projectColor) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 5,
    borderLeftColor: projectColor,
    ...colors.shadow,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, flex: 1 },
  description: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  statText: { fontSize: fontSize.xs, color: colors.textTertiary, textTransform: 'capitalize' },
  progressBarContainer: { height: 6, backgroundColor: colors.surfaceVariant, borderRadius: 3, marginBottom: spacing.xs },
  progressBar: { height: '100%', backgroundColor: projectColor, borderRadius: 3 },
  progressText: { fontSize: fontSize.xs, color: colors.textTertiary, alignSelf: 'flex-end' },
});

export default ProjectListScreen;
