# React Native Mobile App - Development Plan

## Project Overview
Creating a React Native mobile app that replicates all features from the web app using Expo framework.

## Web App Features Analysis (from frontend code)

### Core Features to Implement:
1. **Authentication**
   - Login/Signup with JWT (cookie-based on web)
   - Session management
   - Protected routes

2. **Todos Management**
   - Create, read, update, delete todos
   - Todo categories
   - Todo priorities (urgent, high, medium, low)
   - Completion tracking
   - Due dates

3. **Notes Management**
   - Rich text notes with folders
   - Folder organization (FolderSidebar)
   - Note editor with formatting
   - Search functionality

4. **Calendar Integration**
   - Calendar view with todos
   - Time logs
   - Diary entries (today-only editing)
   - Date-based filtering

5. **Projects Management**
   - Project creation with status/priority
   - Todo-project linking
   - Project progress tracking
   - Goal dates

6. **Analytics Dashboard**
   - Todo completion statistics
   - Time tracking breakdown
   - Productivity insights
   - Period filtering (day/week/month)

7. **Diary**
   - Daily diary entries
   - Timeline view
   - Read-only for past dates

8. **Settings**
   - Change password
   - Account information
   - Theme toggle (dark/light)

## Tech Stack

### Mobile Framework
- **Expo** (React Native)
- **React Navigation** (navigation)
- **AsyncStorage** (local storage)
- **Axios** (API calls)

### UI Components
- **React Native Paper** or **Native Base** (UI library)
- Custom components matching web design

### State Management
- **React Context API** (matching web app structure)
  - AuthContext
  - TodoContext
  - FoldersContext
  - CalendarContext
  - ThemeContext

## Development Phases

### Phase 1: Project Setup & Authentication ✓ (Current)
- [x] Create Expo project
- [ ] Install dependencies
- [ ] Setup folder structure
- [ ] Create AuthContext
- [ ] Build Login/Signup screens
- [ ] Implement JWT token storage (AsyncStorage)
- [ ] Setup API service with base URL

### Phase 2: Notes Feature (First Feature)
- [ ] Create FoldersContext
- [ ] Build Notes screen with folder sidebar
- [ ] Implement note CRUD operations
- [ ] Add rich text editor
- [ ] Search functionality
- [ ] Folder management

### Phase 3: Todos Feature
- [ ] Create TodoContext
- [ ] Build Todo list screen
- [ ] Todo form with priorities/categories
- [ ] Todo filtering and sorting
- [ ] Completion tracking

### Phase 4: Calendar & Diary
- [ ] Create CalendarContext
- [ ] Build calendar view
- [ ] Implement time logs
- [ ] Diary entry component
- [ ] Date restrictions (today-only edit)

### Phase 5: Projects
- [ ] Create projects screen
- [ ] Project CRUD operations
- [ ] Link todos to projects
- [ ] Progress tracking UI

### Phase 6: Analytics
- [ ] Build analytics dashboard
- [ ] Todo statistics charts
- [ ] Time log breakdown
- [ ] Insights generation

### Phase 7: Settings & Polish
- [ ] Settings screen
- [ ] Password change
- [ ] Theme toggle (dark/light)
- [ ] Profile management
- [ ] App icons and splash screen

### Phase 8: Testing & Optimization
- [ ] Test all features
- [ ] Performance optimization
- [ ] Error handling
- [ ] Offline support (future)

## API Integration

### Backend Compatibility
- Use existing Express.js backend at port 5000
- Same endpoints as web app
- Modify authentication to use headers instead of cookies

### API Base URL
```javascript
// Development
const API_URL = 'http://localhost:5000/api';

// Production (Render)
const API_URL = 'https://your-backend.onrender.com/api';
```

### Authentication Approach
**Web**: httpOnly cookies
**Mobile**: JWT token in AsyncStorage + Authorization header

## Folder Structure

```
mobile/
├── App.js
├── package.json
├── app.json
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── SignupScreen.js
│   │   ├── Notes/
│   │   │   ├── NotesListScreen.js
│   │   │   ├── NoteEditorScreen.js
│   │   │   └── FolderManagementScreen.js
│   │   ├── Todos/
│   │   │   ├── TodoListScreen.js
│   │   │   └── TodoFormScreen.js
│   │   ├── Calendar/
│   │   │   ├── CalendarScreen.js
│   │   │   └── DiaryScreen.js
│   │   ├── Projects/
│   │   │   ├── ProjectsListScreen.js
│   │   │   └── ProjectDetailScreen.js
│   │   ├── Analytics/
│   │   │   └── AnalyticsScreen.js
│   │   └── Settings/
│   │       └── SettingsScreen.js
│   ├── components/
│   │   ├── common/
│   │   ├── notes/
│   │   ├── todos/
│   │   └── calendar/
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── TodoContext.js
│   │   ├── FoldersContext.js
│   │   ├── CalendarContext.js
│   │   └── ThemeContext.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── noteService.js
│   │   ├── todoService.js
│   │   └── calendarService.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── utils/
│   │   ├── storage.js
│   │   └── helpers.js
│   └── styles/
│       ├── theme.js
│       └── colors.js
└── assets/
```

## Dependencies to Install

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "@react-navigation/native": "^6.x",
    "@react-navigation/stack": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@react-native-async-storage/async-storage": "^2.x",
    "axios": "^1.x",
    "react-native-paper": "^5.x",
    "react-native-vector-icons": "^10.x",
    "react-native-calendars": "^1.x",
    "react-native-gesture-handler": "^2.x",
    "react-native-reanimated": "^3.x",
    "react-native-safe-area-context": "^4.x",
    "react-native-screens": "^3.x",
    "@react-native-picker/picker": "^2.x",
    "date-fns": "^3.x"
  }
}
```

## Next Steps (Immediate)

1. **Wait for Expo installation to complete**
2. **Install all required dependencies**
3. **Setup folder structure**
4. **Create API service layer**
5. **Implement AuthContext with AsyncStorage**
6. **Build Login/Signup screens**
7. **Start with Notes feature (as requested)**

## Key Differences from Web App

| Feature | Web | Mobile |
|---------|-----|--------|
| Navigation | React Router | React Navigation (Stack/Tab) |
| Storage | Cookies | AsyncStorage |
| Auth | httpOnly cookies | JWT in headers |
| Styling | CSS files | StyleSheet / Paper Theme |
| Rich Text | Browser contentEditable | React Native editor library |
| Date Picker | HTML input | React Native DateTimePicker |

## API Authentication Strategy

### Web App (Current)
```javascript
// Uses credentials: 'include' for cookies
fetch(url, { credentials: 'include' })
```

### Mobile App (To Implement)
```javascript
// Use Authorization header with token
const token = await AsyncStorage.getItem('token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Backend Changes Needed
- Modify `authMiddleware.js` to check both:
  1. Cookie-based JWT (for web)
  2. Authorization header (for mobile)

## Timeline Estimate

- **Phase 1 (Auth)**: 2-3 days
- **Phase 2 (Notes)**: 3-4 days
- **Phase 3 (Todos)**: 2-3 days
- **Phase 4 (Calendar)**: 3-4 days
- **Phase 5 (Projects)**: 2-3 days
- **Phase 6 (Analytics)**: 2-3 days
- **Phase 7 (Settings)**: 1-2 days
- **Phase 8 (Testing)**: 2-3 days

**Total**: ~3-4 weeks of development

## Notes

- Start with **Notes feature** as requested by user
- Build incrementally, testing each feature before moving to next
- Maintain same data structure and API contracts as web app
- Focus on mobile UX patterns (bottom tabs, swipe gestures, etc.)
- Consider offline-first approach for future enhancement
