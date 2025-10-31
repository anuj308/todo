import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFolders } from '../../context/FoldersContext';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const NoteEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId, folderId: initialFolderId } = route.params || {};
  
  const { folders, selectedFolder } = useFolders();
  const {
    activeNote,
    noteLoading,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState(initialFolderId || selectedFolder?.id || selectedFolder?._id);
  const [saving, setSaving] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Load note if editing existing note
  useEffect(() => {
    if (noteId) {
      fetchNoteById(noteId);
    }
  }, [noteId]);

  // Set note data when loaded
  useEffect(() => {
    if (activeNote && noteId) {
      setTitle(activeNote.title || '');
      setContent(activeNote.content || '');
      setFolderId(activeNote.folderId);
    }
  }, [activeNote, noteId]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Note', 'Please add a title or content to save the note.');
      return;
    }

    if (!folderId) {
      Alert.alert('No Folder', 'Please select a folder for this note.');
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        folderId,
      };

      if (noteId) {
        await updateNote(noteId, noteData);
      } else {
        await createNote(noteData);
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Unsaved Changes',
        'Do you want to save your changes?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Save',
            onPress: handleSave,
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const selectedFolderData = folders.find(f => (f.id || f._id) === folderId);

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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.sm,
    },
    backButtonText: {
      fontSize: fontSize.xl,
      color: colors.primary,
    },
    folderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    folderIcon: {
      fontSize: fontSize.md,
      marginRight: spacing.xs,
    },
    folderButtonText: {
      fontSize: fontSize.sm,
      color: colors.text,
      marginRight: spacing.xs,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    deleteButton: {
      padding: spacing.sm,
      marginRight: spacing.xs,
    },
    deleteButtonText: {
      fontSize: fontSize.lg,
      color: colors.error,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      minWidth: 60,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: spacing.md,
    },
    titleInput: {
      fontSize: fontSize.xl,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      padding: spacing.sm,
    },
    contentInput: {
      flex: 1,
      fontSize: fontSize.md,
      color: colors.text,
      textAlignVertical: 'top',
      padding: spacing.sm,
      lineHeight: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    folderPicker: {
      position: 'absolute',
      top: 60,
      right: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 200,
      maxHeight: 300,
      ...colors.shadow,
    },
    folderPickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    folderPickerIcon: {
      fontSize: fontSize.md,
      marginRight: spacing.sm,
    },
    folderPickerText: {
      fontSize: fontSize.sm,
      color: colors.text,
      flex: 1,
    },
    folderPickerSelected: {
      backgroundColor: colors.primaryLight,
    },
  });

  if (noteLoading && noteId) {
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.folderButton}
            onPress={() => setShowFolderPicker(!showFolderPicker)}
          >
            <Text style={styles.folderIcon}>📁</Text>
            <Text style={styles.folderButtonText} numberOfLines={1}>
              {selectedFolderData?.name || 'Select Folder'}
            </Text>
            <Text style={{ color: colors.textTertiary }}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          {noteId && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Folder Picker Dropdown */}
      {showFolderPicker && (
        <ScrollView style={styles.folderPicker}>
          {folders.map((folder) => {
            const isSelected = (folder.id || folder._id) === folderId;
            return (
              <TouchableOpacity
                key={folder.id || folder._id}
                style={[
                  styles.folderPickerItem,
                  isSelected && styles.folderPickerSelected,
                ]}
                onPress={() => {
                  setFolderId(folder.id || folder._id);
                  setShowFolderPicker(false);
                }}
              >
                <Text style={styles.folderPickerIcon}>📁</Text>
                <Text
                  style={[
                    styles.folderPickerText,
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {folder.name}
                </Text>
                {isSelected && <Text style={{ color: colors.primary }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Editor Content */}
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="Note title..."
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />
        
        <TextInput
          style={styles.contentInput}
          placeholder="Start writing your note..."
          placeholderTextColor={colors.textTertiary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NoteEditorScreen;