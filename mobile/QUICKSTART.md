# 🚀 Quick Start Guide - Todo Mobile App

## Step-by-Step: Get Running in 5 Minutes

### 1️⃣ Check Dependencies Installation Status

```bash
cd mobile
npm install
```

If any errors, the dependencies are already installed from earlier.

### 2️⃣ Configure API URL

Open `mobile/src/services/api.js` and update line 13:

```javascript
// Choose one based on your setup:

// Option A: Android Emulator (most common)
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// Option B: iOS Simulator
const API_BASE_URL = 'http://localhost:5000/api';

// Option C: Physical Device (find your computer's IP first)
const API_BASE_URL = 'http://192.168.1.XXX:5000/api';
```

**How to find your IP** (Option C):
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig | grep "inet "` (look for 192.168...)

### 3️⃣ Start Backend Server

Open a **NEW terminal window**:

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB Connected: ...
```

### 4️⃣ Start Mobile App

Back in your original terminal (or open another):

```bash
cd mobile
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or...
```

### 5️⃣ Choose Your Testing Method

#### Option A: Android Emulator (Recommended for Windows)
1. Have Android Studio installed with an emulator
2. Start the emulator
3. Press `a` in the terminal

#### Option B: iOS Simulator (Mac Only)
1. Have Xcode installed
2. Press `i` in the terminal

#### Option C: Physical Device (Any Platform)
1. Install "Expo Go" app from:
   - iOS: App Store
   - Android: Play Store
2. Scan the QR code shown in terminal
3. App will load on your phone

## 🎯 Test the App

### Create Account
1. App opens to Login screen
2. Tap "Sign Up" link at bottom
3. Fill in: Name, Email, Password, Confirm Password
4. Tap "Sign Up" button
5. Should see "Notes" screen (placeholder)

### Login
1. From Notes screen, logout (not yet implemented)
2. Or close and restart app
3. Enter email and password
4. Tap "Login" button
5. Should see Notes screen again

## 🐛 Common Issues & Fixes

### "Network Error"
- **Backend not running**: Start backend server
- **Wrong API URL**: Check `API_BASE_URL` in `api.js`
- **Firewall blocking**: Disable firewall temporarily or allow port 5000

### "Unable to resolve module"
```bash
cd mobile
npm start -- --reset-cache
```

### Android Emulator Can't Connect
- Change API_BASE_URL to `http://10.0.2.2:5000/api`
- Restart app: `r` in terminal

### iOS Simulator Can't Connect  
- Change API_BASE_URL to `http://localhost:5000/api`
- Restart app: `r` in terminal

### Physical Device Can't Connect
1. Ensure phone and computer on same WiFi
2. Find computer's IP: `ipconfig` or `ifconfig`
3. Update API_BASE_URL to `http://YOUR_IP:5000/api`
4. Backend must listen on `0.0.0.0`, not just `localhost`

## 🎨 Useful Commands While Running

In the terminal where Metro bundler is running:

- **`r`** - Reload app
- **`m`** - Toggle menu
- **`d`** - Open developer menu
- **`j`** - Open Chrome DevTools (for debugging)
- **`c`** - Clear Metro bundler cache
- **`q`** - Quit

## 🔍 Verify Everything Works

- [ ] App launches without errors
- [ ] Can see Login screen with email/password fields
- [ ] Can navigate to Signup screen
- [ ] Can create new account (data saved in MongoDB)
- [ ] After signup, sees Notes screen
- [ ] Can logout and login again
- [ ] Backend logs show API requests

## 📝 What's Available Now

### ✅ Working Features:
- User registration
- User login  
- JWT token authentication
- Theme system (light/dark)
- Secure token storage
- Protected routes
- Form validation
- Error handling

### 🚧 Coming Next (Phase 2):
- Notes creation/editing
- Folder management
- Search notes
- Rich text formatting

## 💡 Pro Tips

1. **Keep Metro Bundler Running**: Don't close the terminal while developing
2. **Use Reload Often**: Press `r` after code changes
3. **Check Backend Logs**: Watch backend terminal for API errors
4. **React Native Debugger**: Install for better debugging experience
5. **Expo Go**: Great for quick testing without building native apps

## 🆘 Need Help?

Check these files:
- `SETUP_COMPLETE.md` - Detailed setup documentation
- `MOBILE_APP_PLAN.md` - Complete project roadmap
- `README.md` - Full documentation
- Backend logs in terminal

## ✨ You're Ready!

If you can:
1. ✅ See the login screen
2. ✅ Create an account
3. ✅ Login successfully
4. ✅ See the Notes placeholder screen

**Then you're all set to start building the Notes feature!** 🎉

Next step: Implement Notes functionality (see MOBILE_APP_PLAN.md Phase 2)
