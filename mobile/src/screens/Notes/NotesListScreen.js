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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFolders } from '../../context/FoldersContext';
import { useNotes } from '../../context/NotesContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const NotesListScreen = () => {
  const navigation = useNavigation();
  const { folders, selectedFolder, setSelectedFolder, loading: foldersLoading } = useFolders();
  const {
    getFilteredNotes,
    listLoading,
    fetchNotesList,
    deleteNote,
    performSearch,
    searchQuery,
  } = useNotes();
  const { colors } = useTheme();
  
  const [showFolderSidebar, setShowFolderSidebar] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const filteredNotes = getFilteredNotes();

  const handleSearch = (query) => {
    setLocalSearchQuery(query);
    if (query.length > 2 || query.length === 0) {
      performSearch(query);
    }
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(noteId);
          },
        },
      ]
    );
  };

  const handleNotePress = (note) => {
    navigation.navigate('NoteEditor', { noteId: note.id || note._id });
  };

  const handleCreateNote = () => {
    navigation.navigate('NoteEditor', { folderId: selectedFolder?.id || selectedFolder?._id });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleNotePress(item)}
      onLongPress={() => handleDeleteNote(item.id || item._id)}
    >
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title || 'Untitled Note'}
        </Text>
        <Text style={[styles.noteDate, { color: colors.textTertiary }]}>
          {formatDate(item.updatedAt || item.createdAt)}
        </Text>
      </View>
      {item.content && (
        <Text style={[styles.notePreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.content.replace(/<[^>]*>/g, '').trim()}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }) => {
    const isSelected = selectedFolder && (selectedFolder.id === item.id || selectedFolder._id === item._id);
    
    return (
      <TouchableOpacity
        style={[
          styles.folderItem,
          {
            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
            borderLeftWidth: isSelected ? 4 : 0,
            borderLeftColor: colors.primary,
          },
        ]}
        onPress={() => {
          setSelectedFolder(item);
          setShowFolderSidebar(false);
        }}
      >
        <Text style={[styles.folderIcon, { color: item.color || colors.primary }]}>
          📁
        </Text>
        <Text
          style={[
            styles.folderName,
            { color: isSelected ? colors.primary : colors.text },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
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
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    folderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: spacing.sm,
    },
    folderButtonText: {
      fontSize: fontSize.lg,
      marginRight: spacing.xs,
    },
    folderName: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    createButtonText: {
      color: '#fff',
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
    searchInput: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSize.md,
      color: colors.text,
    },
    listContainer: {
      flex: 1,
    },
    notesList: {
      padding: spacing.md,
    },
    noteItem: {
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
    },
    noteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    noteTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      flex: 1,
      marginRight: spacing.sm,
    },
    noteDate: {
      fontSize: fontSize.xs,
    },
    notePreview: {
      fontSize: fontSize.sm,
      lineHeight: 20,
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
    sidebar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '75%',
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      zIndex: 1000,
      ...colors.shadow,
    },
    sidebarHeader: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sidebarTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    closeButtonText: {
      fontSize: fontSize.xl,
      color: colors.textSecondary,
    },
    foldersList: {
      flex: 1,
    },
    folderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    folderIcon: {
      fontSize: fontSize.xl,
      marginRight: spacing.sm,
    },
    overlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
  });

  if (listLoading && filteredNotes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.folderButton}
            onPress={() => setShowFolderSidebar(true)}
          >
            <Text style={styles.folderButtonText}>📁</Text>
            <Text style={styles.folderName} numberOfLines={1}>
              {selectedFolder?.name || 'All Notes'}
            </Text>
            <Text style={{ color: colors.textSecondary }}>▼</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.createButton} onPress={handleCreateNote}>
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={colors.textTertiary}
          value={localSearchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Notes List */}
      <View style={styles.listContainer}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the "+ New" button to create your first note
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id || item._id}
            contentContainerStyle={styles.notesList}
            refreshControl={
              <RefreshControl
                refreshing={listLoading}
                onRefresh={fetchNotesList}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>

      {/* Folder Sidebar */}
      {showFolderSidebar && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowFolderSidebar(false)}
          />
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Folders</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFolderSidebar(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={folders}
              renderItem={renderFolderItem}
              keyExtractor={(item) => item.id || item._id}
              contentContainerStyle={styles.foldersList}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default NotesListScreen;
