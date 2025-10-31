import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import { spacing, fontSize, borderRadius } from '../../styles/theme';

const SettingsScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout, setUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleRefreshProfile = async () => {
    try {
      setIsRefreshingProfile(true);
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      Alert.alert('Profile Updated', 'We refreshed your profile details.');
    } catch (error) {
      Alert.alert('Refresh Failed', error.message || 'Unable to refresh profile');
    } finally {
      setIsRefreshingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    sectionDescription: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
      lineHeight: 20,
    },
    profileRow: {
      marginBottom: spacing.sm,
    },
    profileLabel: {
      fontSize: fontSize.xs,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      marginBottom: spacing.xs,
      letterSpacing: 0.5,
    },
    profileValue: {
      fontSize: fontSize.md,
      color: colors.text,
      fontWeight: '600',
    },
    refreshButton: {
      marginTop: spacing.md,
      alignSelf: 'flex-start',
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    refreshButtonText: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    passwordInput: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: fontSize.md,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.borderLight,
      marginBottom: spacing.sm,
    },
    saveButton: {
      marginTop: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    dangerSection: {
      borderColor: colors.error,
    },
    logoutButton: {
      backgroundColor: colors.error,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
    },
    logoutButtonText: {
      color: '#fff',
      fontSize: fontSize.md,
      fontWeight: '700',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Manage your personal details and keep your profile up to date.
          </Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>{user?.name || '—'}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{user?.email || '—'}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshProfile}
            disabled={isRefreshingProfile}
          >
            <Text style={styles.refreshButtonText}>↻ Refresh</Text>
            {isRefreshingProfile && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginLeft: spacing.xs }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Switch between light and dark themes to match your environment.
          </Text>
          <View style={styles.switchRow}>
            <Text style={styles.profileValue}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              thumbColor={isDark ? '#fff' : '#fff'}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
            />
          </View>
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Update your password regularly to keep your account secure.
          </Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="Current Password"
            placeholderTextColor={colors.textTertiary}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.passwordInput}
            placeholder="New Password"
            placeholderTextColor={colors.textTertiary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.saveButton, isSavingPassword && styles.saveButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isSavingPassword}
          >
            {isSavingPassword ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Logging out will remove your local session. You can log in again anytime.
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsScreen;
