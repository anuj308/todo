# 📱 Expo Go Setup Guide - Todo Mobile App

## Step-by-Step Guide to Run on Your Phone

### Prerequisites ✅

1. **Smartphone** (iOS or Android)
2. **Same WiFi Network** - Your computer and phone must be on the same WiFi
3. **Expo Go App** - Installed on your phone
4. **Backend Running** - Backend server must be running

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Expo Go on Your Phone

#### For iPhone (iOS):
1. Open **App Store**
2. Search for **"Expo Go"**
3. Install the app (it's free)

#### For Android:
1. Open **Google Play Store**
2. Search for **"Expo Go"**
3. Install the app (it's free)

---

### Step 2: Find Your Computer's IP Address

You need this so your phone can talk to your backend server.

#### On Windows:
```powershell
ipconfig
```
Look for **"IPv4 Address"** under your WiFi adapter, usually looks like: `192.168.1.XXX`

#### On Mac/Linux:
```bash
ifconfig | grep "inet "
# OR
hostname -I
```

**Write down your IP address!** Example: `192.168.1.105`

---

### Step 3: Update API URL for Your Phone

Open: `mobile/src/services/api.js`

Find line 13 and change it to:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_IP_HERE:5000/api'  // Replace YOUR_IP_HERE with your actual IP
  : 'https://your-backend.onrender.com/api';
```

**Example:**
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.105:5000/api'  // Use your actual IP!
  : 'https://your-backend.onrender.com/api';
```

💡 **Important:** Use your computer's IP address from Step 2!

---

### Step 4: Start Backend Server (If Not Running)

Open a terminal and run:

```powershell
cd backend
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB Connected: ...
```

✅ **Keep this terminal open!**

---

### Step 5: Start Expo Development Server

Open a **NEW terminal** and run:

```powershell
cd mobile
npm start
```

You'll see something like:

```
› Metro waiting on exp://192.168.1.105:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

---

### Step 6: Connect Your Phone

#### For iPhone (iOS):
1. Open the **default Camera app**
2. Point it at the **QR code** in the terminal
3. Tap the notification that appears
4. Expo Go will open and load your app

#### For Android:
1. Open **Expo Go app**
2. Tap **"Scan QR Code"** 
3. Point camera at the **QR code** in the terminal
4. Wait for app to load (first time may take 1-2 minutes)

---

## 🎯 Testing Authentication

Once the app loads on your phone:

### Test 1: Create Account
1. You should see the **Login screen**
2. Tap **"Sign Up"** at the bottom
3. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
4. Tap **"Sign Up"** button
5. ✅ Should see **"Notes"** screen (placeholder)

### Test 2: Logout & Login
1. Close the app (swipe away)
2. Open again from Expo Go
3. Should see **Login screen**
4. Enter:
   - Email: `test@example.com`
   - Password: `test123456`
5. Tap **"Login"** button
6. ✅ Should see **"Notes"** screen again

---

## 🐛 Troubleshooting

### "Network request failed"

**Problem:** Phone can't connect to backend

**Solutions:**
1. ✅ Check both devices on **same WiFi**
2. ✅ Verify IP address is correct in `api.js`
3. ✅ Backend is running on port 5000
4. ✅ No VPN running on computer
5. ✅ Firewall allows port 5000

**Test backend access:**
```powershell
# In mobile folder, run:
node test-auth.js
```
Should show all ✅ green checkmarks.

---

### "Unable to load app"

**Problem:** Metro bundler issues

**Solutions:**
1. In terminal where `npm start` is running, press `r` to reload
2. Or restart: Press `Ctrl+C`, then `npm start` again
3. Clear cache: `npm start -- --clear`

---

### "QR code not scanning"

**Problem:** Camera can't read QR

**Solutions:**

#### iOS:
- Make sure using default Camera app (not Expo Go to scan)
- Hold camera steady for 2-3 seconds
- Or manually type the URL shown in terminal

#### Android:
- Open Expo Go app first
- Use built-in QR scanner in Expo Go
- Or manually type the URL in Expo Go

---

### "Connection timeout"

**Problem:** Phone is on different network or IP wrong

**Solutions:**
1. Verify IP address: Run `ipconfig` again
2. Both devices must be on **same WiFi** (not mobile data!)
3. Some routers have "AP Isolation" - turn it off in router settings
4. Try restarting WiFi on both devices

---

## 🔧 Backend Configuration for Physical Device

Your backend needs to listen on `0.0.0.0` not just `localhost`.

Check `backend/server.js`:

```javascript
// Should be:
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// NOT just:
app.listen(PORT, () => { ... });
```

If needed, update it and restart backend.

---

## 📱 Useful Expo Go Commands

While app is running on your phone:

- **Shake phone** - Opens developer menu
- **Developer Menu Options:**
  - Reload - Refresh the app
  - Debug Remote JS - Open Chrome debugger
  - Show Performance Monitor
  - Toggle Element Inspector

---

## 🎨 Development Workflow

### Making Code Changes:

1. Edit files in VS Code
2. Save the file
3. App will **auto-reload** on your phone (Fast Refresh)
4. If it doesn't reload, shake phone → tap "Reload"

### Testing Different Screens:

After authentication works, you can:
- Navigate between screens
- Test dark/light mode
- Try different features as they're built

---

## 💡 Pro Tips

1. **Keep Metro bundler running** - Don't close the terminal
2. **Use same WiFi** - Mobile data won't work
3. **Phone won't sleep** - Keep Expo Go in foreground while developing
4. **Reload often** - Press `r` in terminal or shake phone
5. **Check backend logs** - Watch terminal for API errors
6. **Test on real device** - Better than emulator for gestures/performance

---

## ✅ Verification Checklist

Before reporting issues, check:

- [ ] Backend running (`npm run dev` in backend folder)
- [ ] Backend shows "Server is running on port 5000"
- [ ] IP address is correct in `api.js`
- [ ] Both phone and computer on same WiFi
- [ ] Expo Go app installed on phone
- [ ] Metro bundler running (`npm start` in mobile folder)
- [ ] QR code visible in terminal
- [ ] No VPN running
- [ ] Firewall not blocking port 5000

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ App loads on your phone
2. ✅ You see the Login screen
3. ✅ Can create an account
4. ✅ Data saves to MongoDB
5. ✅ Can logout and login
6. ✅ No "Network error" messages

---

## 📞 Quick Reference

### Your Setup:
- Backend URL: `http://YOUR_IP:5000/api`
- Metro Bundler: `exp://YOUR_IP:8081`
- Expo Go: Scan QR code

### Commands:
```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Mobile
cd mobile
npm start
```

### Test Authentication:
```powershell
cd mobile
node test-auth.js
```

---

## 🚀 Next Steps

Once authentication works on your phone:

1. ✅ Test login/signup flow
2. ✅ Verify token storage works
3. ✅ Check app persists login after restart
4. 🔨 Start building Notes feature
5. 🔨 Add more screens (Todos, Calendar, etc.)

---

## 🆘 Still Having Issues?

1. **Run the test script:**
   ```powershell
   cd mobile
   node test-auth.js
   ```
   If this passes ✅, backend is fine.

2. **Check Metro bundler logs:**
   Look at terminal where `npm start` is running

3. **Check phone logs in Expo Go:**
   Shake phone → Developer menu → Debug Remote JS

4. **Verify API URL:**
   Should match your computer's IP exactly

5. **Restart everything:**
   - Close Expo Go
   - Stop Metro bundler (Ctrl+C)
   - Restart backend
   - Run `npm start` again
   - Scan QR code again

---

**You're all set!** 🎉 The app should now run on your phone via Expo Go!
