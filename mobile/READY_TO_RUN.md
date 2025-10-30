# 📱 Expo Go - Ready to Run Checklist

## ✅ Setup Complete!

Your mobile app is configured and ready to test on your phone.

### Your Configuration:
- **Computer IP:** `10.128.146.248`
- **Backend URL:** `http://10.128.146.248:5000/api`
- **App Name:** Todo App

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend (if not running)
```powershell
cd backend
npm run dev
```
Wait for: `Server running on port 5000`

### Step 2: Start Mobile App
```powershell
cd mobile
npm start
```
A QR code will appear in the terminal

### Step 3: Scan QR Code on Your Phone

**iPhone:**
- Open Camera app
- Point at QR code
- Tap notification
- Expo Go opens

**Android:**
- Open Expo Go app
- Tap "Scan QR Code"
- Point at QR code
- App loads

---

## 📱 Before You Start

Make sure you have:

- [ ] Expo Go app installed on your phone (App Store or Play Store)
- [ ] Phone and computer on **SAME WiFi network**
- [ ] Backend server running (`npm run dev` in backend folder)
- [ ] No VPN running on your computer

---

## 🧪 Test Authentication

Once app loads on your phone:

### Create Account:
1. Should see Login screen
2. Tap "Sign Up" at bottom
3. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Confirm: test123456
4. Tap "Sign Up"
5. ✅ Should see "Notes" placeholder screen

### Test Login:
1. Close app completely
2. Reopen from Expo Go
3. Enter credentials
4. Tap "Login"
5. ✅ Should see Notes screen again

---

## 🐛 If Something Goes Wrong

### "Network request failed"
- Check both devices on same WiFi
- Verify IP is `10.128.146.248` in api.js
- Backend must be running

### Can't scan QR code
- **iPhone**: Use Camera app (not Expo Go)
- **Android**: Use Expo Go's built-in scanner

### App won't load
- Press `r` in terminal to reload
- Or restart: Ctrl+C, then `npm start` again

### Backend can't connect
Run test:
```powershell
cd mobile
node test-auth.js
```
Should show all ✅ checkmarks

---

## 💡 While Developing

### Making Changes:
- Edit code in VS Code
- Save file
- App auto-reloads on phone
- If not, shake phone → Reload

### Useful Commands (in terminal where npm start runs):
- `r` - Reload app
- `m` - Toggle menu
- `j` - Open debugger
- `c` - Clear cache

### On Your Phone:
- Shake device → Opens developer menu
- Reload - Refresh the app
- Debug Remote JS - Chrome debugger

---

## ✅ Success Checklist

You'll know it's working when:

- [ ] App loads on your phone
- [ ] See Login screen with email/password fields
- [ ] Can create new account
- [ ] Data saves to MongoDB (check backend logs)
- [ ] Can logout and login again
- [ ] No "Network error" messages
- [ ] Backend logs show API requests

---

## 📞 Quick Reference

### Terminals Needed:
```powershell
# Terminal 1: Backend
cd c:\Users\ANUJ\Documents\GitHub\todo\backend
npm run dev

# Terminal 2: Mobile
cd c:\Users\ANUJ\Documents\GitHub\todo\mobile
npm start
```

### Your URLs:
- Backend API: `http://10.128.146.248:5000/api`
- Backend Status: `http://10.128.146.248:5000`

### Test Script:
```powershell
cd mobile
node test-auth.js
```

---

## 🎉 You're Ready!

Everything is configured. Now just:

1. Make sure backend is running
2. Run `npm start` in mobile folder
3. Scan QR code with your phone
4. Test authentication!

See `EXPO_GO_SETUP.md` for detailed troubleshooting guide.

**Have fun testing! 📱✨**
