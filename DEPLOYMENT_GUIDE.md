# DIForM - Complete Deployment Guide

## 📱 Platform Support

DIForM is now available as:
- ✅ **Desktop App** (Windows, macOS, Linux) - Electron
- ✅ **Mobile App** (iOS, Android) - React Native
- ✅ **Web App** (Browser) - React

---

## 🔧 Prerequisites

### Desktop App
- Node.js 18+
- npm or yarn

### Mobile App
- Node.js 18+
- React Native development environment
- **iOS**: Xcode 14+ (macOS only)
- **Android**: Android Studio, SDK 31+

---

## 🔐 Microsoft 365 Integration Setup

### Step 1: Register Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**

**Desktop App Registration:**
- Name: `DIForM Desktop`
- Supported account types: `Accounts in any organizational directory and personal Microsoft accounts`
- Redirect URI: `http://localhost` (Public client/native)

**Mobile App Registration:**
- Name: `DIForM Mobile`
- Redirect URI: `msauth://com.diform.mobile/YOUR_SIGNATURE_HASH`
- Platform: Mobile and desktop applications

### Step 2: Configure API Permissions

Add the following **Microsoft Graph** permissions:

Required permissions:
- ✅ `User.Read` - Sign in and read user profile
- ✅ `Mail.ReadWrite` - Read and write access to user mail
- ✅ `Mail.Send` - Send mail as a user
- ✅ `Calendars.ReadWrite` - Have full access to user calendars
- ✅ `Files.ReadWrite.All` - Have full access to all files user can access

**Grant admin consent** if deploying for organization.

### Step 3: Get Application Credentials

From your app registration:
- Copy **Application (client) ID**
- Copy **Directory (tenant) ID**
- Copy **Redirect URI**

---

## 💻 Desktop App Setup

### 1. Install Dependencies

```bash
cd electron
npm install
```

### 2. Configure Azure AD

Create `electron/.env`:

```bash
AZURE_CLIENT_ID=your_client_id_here
AZURE_TENANT_ID=your_tenant_id_here
```

### 3. Development

```bash
# Start desktop app in development
npm run dev
```

This will:
- Start Electron app
- Start React dev server on port 3000
- Enable hot reload

### 4. Build for Production

**Windows:**
```bash
npm run build:win
```
Output: `electron/dist/DIForM Setup.exe`

**macOS:**
```bash
npm run build:mac
```
Output: `electron/dist/DIForM.dmg`

**Linux:**
```bash
npm run build:linux
```
Output: `electron/dist/DIForM.AppImage`

### 5. Distribution

Installers will be created in `electron/dist/`:
- Windows: `.exe` installer (NSIS)
- macOS: `.dmg` disk image
- Linux: `.AppImage`, `.deb`, `.snap`

---

## 📱 Mobile App Setup

### 1. Install Dependencies

```bash
cd mobile
npm install

# iOS only (macOS required)
cd ios && pod install && cd ..
```

### 2. Configure Azure AD

Edit `mobile/services/MSGraphService.js`:

```javascript
const msalConfig = {
  clientId: 'YOUR_MOBILE_CLIENT_ID',
  authority: 'https://login.microsoftonline.com/common',
  redirectUri: 'msauth://com.diform.mobile/YOUR_SIGNATURE_HASH',
};
```

### 3. iOS Configuration

Edit `mobile/ios/DIForMobile/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>msauth.com.diform.mobile</string>
    </array>
  </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>msauthv2</string>
  <string>msauthv3</string>
</array>
```

### 4. Android Configuration

Edit `mobile/android/app/src/main/AndroidManifest.xml`:

```xml
<activity
    android:name="com.microsoft.identity.client.BrowserTabActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="msauth"
            android:host="com.diform.mobile"
            android:path="/YOUR_SIGNATURE_HASH" />
    </intent-filter>
</activity>
```

### 5. Development

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### 6. Build for Production

**iOS:**
```bash
cd ios
xcodebuild -workspace DIForMobile.xcworkspace -scheme DIForMobile -configuration Release
```

**Android:**
```bash
cd android
./gradlew assembleRelease
```

Output:
- iOS: `ios/build/Release-iphoneos/DIForMobile.app`
- Android: `android/app/build/outputs/apk/release/app-release.apk`

### 7. Distribution

**iOS:**
- Archive in Xcode
- Upload to App Store Connect
- Submit for review

**Android:**
- Sign APK with keystore
- Upload to Google Play Console
- Submit for review

---

## 🌐 Web App Setup

The web version is already configured and running!

### Development
```bash
# Backend
PORT=5001 npm run server

# Frontend
cd client && npm start
```

### Production Build
```bash
cd client
npm run build
```

Deploy `client/build/` to:
- Vercel
- Netlify
- Azure Static Web Apps
- AWS S3 + CloudFront

---

## 🔒 Security Considerations

### Desktop App
- Tokens stored in OS keychain (electron-store)
- No tokens in localStorage
- Secure IPC communication
- Signed installers recommended

### Mobile App
- Tokens stored in iOS Keychain / Android Keystore
- SSL pinning recommended
- App signing required
- Obfuscation recommended

### Web App
- OAuth redirect flow only
- No client secrets exposed
- HttpOnly cookies for tokens
- CSP headers configured

---

## 🚀 Feature Comparison

| Feature | Desktop | Mobile | Web |
|---------|---------|--------|-----|
| Microsoft 365 Auth | ✅ | ✅ | ✅ |
| Read Emails | ✅ | ✅ | ✅ |
| Send Emails | ✅ | ✅ | ✅ |
| Calendar Access | ✅ | ✅ | ✅ |
| File Access | ✅ | ✅ | Limited |
| Offline Mode | ✅ | ✅ | ❌ |
| System Tray | ✅ | ❌ | ❌ |
| Push Notifications | ✅ | ✅ | ✅ |
| Auto-Updates | ✅ | Via Store | ❌ |
| Local AI Processing | ✅ | Limited | ❌ |

---

## 📊 System Requirements

### Desktop App
- **Windows**: Windows 10+
- **macOS**: macOS 10.14+
- **Linux**: Ubuntu 18.04+, Fedora 32+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB

### Mobile App
- **iOS**: iOS 13.0+
- **Android**: Android 8.0+ (API 26+)
- **RAM**: 2GB minimum
- **Storage**: 200MB

---

## 🐛 Troubleshooting

### Desktop App

**Authentication fails:**
- Check Azure AD configuration
- Verify redirect URI is `http://localhost`
- Ensure clientId is correct

**App doesn't start:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Mobile App

**iOS build fails:**
```bash
cd ios
pod deintegrate
pod install
```

**Android build fails:**
```bash
cd android
./gradlew clean
./gradlew build
```

**MSAL errors:**
- Check redirect URI format
- Verify signature hash
- Check Info.plist / AndroidManifest.xml

---

## 📚 Additional Resources

- [Microsoft Graph Documentation](https://docs.microsoft.com/graph)
- [Azure AD App Registration](https://docs.microsoft.com/azure/active-directory)
- [Electron Builder](https://www.electron.build)
- [React Native MSAL](https://github.com/stashenergy/react-native-msal)

---

## 🎯 Next Steps After Deployment

1. ✅ Configure auto-updates
2. ✅ Set up crash reporting (Sentry)
3. ✅ Add analytics
4. ✅ Implement push notifications
5. ✅ Add telemetry
6. ✅ Set up CI/CD pipeline
7. ✅ Create user documentation
8. ✅ Submit to app stores

---

**For support, contact: support@diform.app**

*Work Gets Done.* 🚀
