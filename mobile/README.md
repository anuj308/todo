# Todo Mobile App

React Native mobile application built with Expo that mirrors all features from the web app.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed automatically)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your phone (for physical device testing)

### Installation

1. **Navigate to mobile directory**
```bash
cd mobile
```

2. **Install dependencies** (if not already done)
```bash
npm install
```

3. **Configure API endpoint**
Edit `src/services/api.js` and update the `API_BASE_URL`:

```javascript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator  
const API_BASE_URL = 'http://localhost:5000/api';

// For physical device (replace with your computer's IP)
const API_BASE_URL = 'http://192.168.1.XXX:5000/api';

// For production
const API_BASE_URL = 'https://your-backend.onrender.com/api';
```

### Running the App

#### Start Development Server
```bash
npm start
```

#### Run on specific platform
```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

#### Using Expo Go (Physical Device)
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Run `npm start`
3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

## 📱 Features Implemented

### ✅ Phase 1: Authentication (Current)
- [x] Login screen with validation
- [x] Signup screen with validation
- [x] JWT token storage (AsyncStorage)
- [x] AuthContext for state management
- [x] ThemeContext for dark/light mode
- [x] Navigation structure (Auth & Main)
- [x] API service layer with interceptors

### 🚧 Phase 2: Notes Feature (In Progress)
- [ ] Notes list with folders
- [ ] Note CRUD operations
- [ ] Folder management
- [ ] Rich text editor
- [ ] Search functionality

### 📋 Upcoming Features
- [ ] Todos management
- [ ] Calendar integration
- [ ] Diary entries
- [ ] Projects management
- [ ] Analytics dashboard
- [ ] Settings & preferences

## 🏗️ Project Structure

```
mobile/
├── App.js                     # Main entry point
├── src/
│   ├── screens/              # Screen components
│   │   ├── Auth/            # Login, Signup
│   │   ├── Notes/           # Notes screens
│   │   ├── Todos/           # Todo screens
│   │   ├── Calendar/        # Calendar screens
│   │   ├── Projects/        # Projects screens
│   │   ├── Analytics/       # Analytics screens
│   │   └── Settings/        # Settings screens
│   ├── components/          # Reusable components
│   ├── context/             # React Context providers
│   │   ├── AuthContext.js   # Authentication state
│   │   └── ThemeContext.js  # Theme state
│   ├── services/            # API services
│   │   ├── api.js           # Axios instance
│   │   └── authService.js   # Auth API calls
│   ├── navigation/          # Navigation setup
│   │   ├── AppNavigator.js  # Root navigator
│   │   ├── AuthNavigator.js # Auth stack
│   │   └── MainNavigator.js # Main tabs
│   ├── utils/               # Utility functions
│   │   └── storage.js       # AsyncStorage helpers
│   └── styles/              # Theme and styles
│       └── theme.js         # Colors, spacing, etc.
└── assets/                  # Images, fonts, etc.
```

## 🔧 Configuration

### Android Emulator Network Access
The Android emulator uses a special IP to access localhost:
- `10.0.2.2` = your computer's localhost
- Update `API_BASE_URL` in `src/services/api.js`

### iOS Simulator Network Access
The iOS simulator can use `localhost` directly:
- `http://localhost:5000/api`

### Physical Device Testing
1. Connect phone and computer to same WiFi network
2. Find your computer's local IP address:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
3. Update API_BASE_URL to `http://YOUR_IP:5000/api`
4. Make sure backend server is listening on `0.0.0.0` not just `localhost`

## 🔐 Backend Changes Required

The backend needs to support JWT in Authorization headers (not just cookies).

Update `backend/middleware/authMiddleware.js`:

```javascript
export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies (web)
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  
  // Check for token in Authorization header (mobile)
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};
```

Update backend response to include token in JSON (not just cookie):

```javascript
// In userController.js login/register functions
res.status(200).json({
  token: token,  // Add this line
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});
```

## 🎨 Theming

The app supports dark and light modes:
- Toggle theme in settings (coming soon)
- Theme persists across app restarts
- Colors defined in `src/styles/theme.js`

## 📦 Dependencies

### Core
- `expo` - React Native framework
- `react-navigation` - Navigation library
- `@react-native-async-storage/async-storage` - Local storage

### UI
- `react-native-paper` - Material Design components
- `react-native-vector-icons` - Icon library

### Utilities
- `axios` - HTTP client
- `date-fns` - Date manipulation

## 🐛 Troubleshooting

### Metro Bundler Cache Issues
```bash
npm start -- --reset-cache
```

### Android Build Errors
```bash
cd android && ./gradlew clean && cd ..
```

### iOS Build Errors
```bash
cd ios && pod install && cd ..
```

### Network Connection Issues
- Make sure backend is running on `0.0.0.0:5000`
- Check firewall settings
- Verify API_BASE_URL is correct for your setup

### Authentication Issues
- Check backend middleware is updated to support Bearer tokens
- Verify token is being saved to AsyncStorage
- Check network requests in React Native Debugger

## 📱 Testing

### Development Testing
1. Start backend: `cd backend && npm run dev`
2. Start mobile: `cd mobile && npm start`
3. Use Expo Go or simulator

### Production Testing
1. Update API_BASE_URL to production URL
2. Test on physical devices
3. Verify all features work with remote backend

## 🚀 Next Steps

1. **Implement Notes Feature**
   - Create FoldersContext
   - Build notes list screen
   - Implement CRUD operations
   - Add folder sidebar

2. **Update Backend**
   - Modify authMiddleware for mobile support
   - Return token in JSON responses

3. **Test Authentication Flow**
   - Login/Signup
   - Token persistence
   - Protected routes

See `MOBILE_APP_PLAN.md` for complete roadmap.

## 📝 Notes

- Built with Expo for easier development and deployment
- Uses same backend API as web app
- Maintains feature parity with web version
- AsyncStorage for local data persistence
- Context API for state management (matching web app)
