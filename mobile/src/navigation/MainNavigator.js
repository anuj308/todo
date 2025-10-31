import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import NotesListScreen from '../screens/Notes/NotesListScreen';
import NoteEditorScreen from '../screens/Notes/NoteEditorScreen';
import TodoListScreen from '../screens/Todos/TodoListScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import DiaryScreen from '../screens/Diary/DiaryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Notes Stack Navigator (includes list and editor)
const NotesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesList" component={NotesListScreen} />
      <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Notes" 
        component={NotesStack}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📝</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Todos" 
        component={TodoListScreen}
        options={{
          tabBarLabel: 'Todos',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>✓</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📅</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
        options={{
          tabBarLabel: 'Diary',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📔</Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
