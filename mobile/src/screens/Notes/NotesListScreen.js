import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize } from '../../styles/theme';

const NotesListScreen = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    text: {
      fontSize: fontSize.lg,
      color: colors.text,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📝 Notes Screen</Text>
      <Text style={[styles.text, { marginTop: spacing.md, fontSize: fontSize.sm }]}>
        Coming soon...
      </Text>
    </View>
  );
};

export default NotesListScreen;
