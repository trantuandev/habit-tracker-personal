# 🌱 Habit Tracker — Daily Habit Tracking App

> A cross-platform mobile application that empowers users to build and maintain healthy daily habits with an intuitive interface, interactive monthly heatmaps, in-depth performance analytics, and an integrated AI Coach.

![React Native](https://img.shields.io/badge/React_Native-0.88-blue?logo=react)
![Expo](https://img.shields.io/badge/Expo_SDK-58-000020?logo=expo)
![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 👥 Team Members & Contributions

| Member | Role & Key Contributions |
|---|---|
| **Tran Tuan** | • **Habit Management (CRUD)**: Developed full habit creation, editing, deletion, real-time search, category grouping, and filter mechanisms.<br>• **AI Coach Assistant**: Implemented AI chatbot powered by Google Gemini API, contextual responses, and rule-based fallback system. |

---

## ✨ Key Features

| Screen / Module | Description |
|---|---|
| 📅 **Today** | 1-tap quick check-in, real-time daily progress ring, dynamic motivational tips based on completion rate |
| 📋 **Habits** | Full CRUD operations, real-time search, status filtering (All, Active, Paused), category grouping |
| ✏️ **Habit Edit** | Comprehensive customization: 14 emoji icons, 10 vibrant color palettes, 7 categories, goal intervals (daily/weekly), reminder times, and difficulty ratings |
| 📆 **Calendar** | Visual 5-level monthly completion heatmap, detailed daily breakdown on tap, monthly performance statistics |
| 📊 **Insights** | Weekly pattern bar charts, consecutive streak tracking, best performing habits highlight, progress metrics |
| 🤖 **AI Coach** | Smart chatbot powered by Google Gemini API for personalized habit recommendations, progress audits, and motivational guidance (with offline fallback support) |
| 👤 **Profile & Settings** | User account management, avatar selection via camera/gallery, and Light / Dark theme switching |

### Additional Highlights

- 🔔 **Scheduled Push Notifications**: Configurable alerts and reminders per habit (`expo-notifications`).
- 🌙 **Theme Modes**: Seamless toggling between Light and Dark modes (`ThemeContext`).
- 🔐 **Authentication**: User registration and login flows with per-user data isolation (`AuthContext`).
- 💾 **Offline-First Architecture**: Persistent storage using `AsyncStorage` — fully functional without an active network connection.
- 📱 **Hardware Integration**: Camera roll and device camera access via `expo-image-picker`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.88.1 |
| **Platform** | Expo SDK 58 |
| **Language** | JavaScript (ES6+) |
| **Navigation** | React Navigation 7 (Native Stack + Bottom Tabs) |
| **State Management** | React Context API + `useReducer` |
| **Local Storage** | `@react-native-async-storage/async-storage` |
| **AI Integration** | Google Generative AI (Gemini API) + rule-based fallback |
| **Icons** | `@expo/vector-icons` (Ionicons) |
| **Notifications** | `expo-notifications` |
| **Media & Hardware** | `expo-image-picker`, `expo-location` |

---

## 📂 Project Structure

```
├── App.js                         # Root entry point & Navigation configuration
├── app.json                       # Expo application manifest
├── package.json                   # Dependencies and scripts
├── babel.config.js                # Babel configuration
├── metro.config.js                # Metro bundler configuration
│
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── HabitCard.js           # Habit item presentation card
│   │   └── SearchBar.js           # Search input with clear button
│   │
│   ├── context/                   # Global application state
│   │   ├── HabitContext.js        # Habits, logs & persistence logic
│   │   ├── AuthContext.js         # Authentication state & session
│   │   └── ThemeContext.js        # Light / Dark theme management
│   │
│   ├── models/                    # Data schemas
│   │   ├── Habit.js               # Habit entity model
│   │   └── HabitLog.js            # Check-in log model
│   │
│   ├── screens/                   # Application screens
│   │   ├── LoginScreen.js         # User login screen
│   │   ├── RegisterScreen.js      # User registration screen
│   │   ├── TodayScreen.js         # Daily check-in dashboard
│   │   ├── HabitsScreen.js        # Habits listing, filter & search
│   │   ├── HabitEditScreen.js     # Create & edit habit form
│   │   ├── CalendarScreen.js      # Monthly heatmap & historical logs
│   │   ├── InsightsScreen.js      # Statistics, streak & pattern charts
│   │   ├── CoachScreen.js         # AI Coach conversation interface
│   │   └── ProfileScreen.js       # User profile & preferences
│   │
│   ├── services/                  # Platform & API services
│   │   ├── notificationService.js # Push notification scheduling
│   │   ├── imageService.js        # Image picker & camera helpers
│   │   └── locationService.js     # Geolocation service
│   │
│   ├── hooks/                     # Custom React hooks
│   │   └── useAppStateNotifications.js
│   │
│   └── utils/                     # Helper utilities
│       └── storage.js             # AsyncStorage abstraction helpers
│
├── backend/                       # Backend server & APIs
├── android/                       # Native Android project configuration
└── assets/                        # Static assets (icons, splash screen, logos)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or later)
- **npm** or **yarn**
- **Expo Go** app on your physical device, or an Android/iOS emulator

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/trantuandev/habit-tracker-personal.git
cd habit-tracker-personal

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npm start

# 4. Launch on a specific platform
npm run android    # Android device / emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### AI Coach Configuration (Optional)

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Open `src/screens/CoachScreen.js`.
3. Replace the placeholder with your actual API key:

```javascript
const GEMINI_API_KEY = 'YOUR_ACTUAL_GEMINI_API_KEY';
```

> **Note:** If no API key is provided, the app seamlessly falls back to pre-configured intelligent response rules, ensuring an uninterrupted user experience.

---

## 📊 Data Flow Architecture

```
User Action ➔ Context Dispatch ➔ Reducer Update ➔ AsyncStorage Persistence ➔ UI Re-render
```

```
Application Launch ➔ Hydrate from AsyncStorage ➔ Initialize Global State ➔ Render UI
```

---

## 🔐 Privacy & Security

- **Local-First Storage**: User habits and check-in history remain strictly on the local device via `AsyncStorage`.
- **Zero Third-Party Tracking**: No analytical beacons or intrusive trackers are integrated.
- **Privacy-Safe AI Requests**: Only habit context relevant to your query is sent to the Gemini API during chat interactions.

---

## 🐛 Troubleshooting

| Issue | Resolution |
|---|---|
| Module resolution failure | Run `npm install && npx expo start -c` to clear the cache. |
| Metro bundler cache error | Run `npx expo start --clear`. |
| AI Coach responses failing | Verify internet connectivity and check your Gemini API key in `CoachScreen.js`. |
| Native build issues | Run `cd android && ./gradlew clean && cd ..` before rebuilding. |

---

## 📄 License

This project is licensed under the **MIT License** — you are free to modify and distribute it as needed.

---

**Empower your daily routines and achieve your goals with Habit Tracker! 🌟**
