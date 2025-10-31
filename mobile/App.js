import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { FoldersProvider } from './src/context/FoldersContext';
import { NotesProvider } from './src/context/NotesContext';
import { TodoProvider } from './src/context/TodoContext';
import { CalendarProvider } from './src/context/CalendarContext';
import { DiaryProvider } from './src/context/DiaryContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FoldersProvider>
          <NotesProvider>
            <TodoProvider>
              <CalendarProvider>
                <DiaryProvider>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </DiaryProvider>
              </CalendarProvider>
            </TodoProvider>
          </NotesProvider>
        </FoldersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
