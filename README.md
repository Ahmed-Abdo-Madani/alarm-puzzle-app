# ⏰ Puzzle Alarm App

A smart alarm clock application built with React Native and Expo that ensures you wake up by solving puzzles. Featuring a beautiful desert-themed UI, comprehensive accessibility support, and full RTL (Right-to-Left) compatibility for Arabic users.

## ✨ Features

### 🧩 Wake-up Puzzles
Ensure you're fully awake with multiple challenge types:
- **Math Puzzle**: Solve arithmetic problems with adjustable difficulty.
- **Memory Game**: Match pairs of cards to turn off the alarm.
- **Typing Challenge**: Type out motivational phrases or complex sentences.
- **Barcode Scanner**: Scan a specific barcode (e.g., toothpaste) to stop the ringing.

### ⚙️ Advanced Alarm Settings
- **Custom Schedules**: Repeat alarms on specific days, weekdays, or weekends.
- **Snooze Control**: Limit snooze counts and enforce puzzles for snoozing.
- **Gradual Volume**: Wake up gently with volume that fades in over time.
- **Sound Selection**: Choose from built-in sounds or pick your own files.

### 🎨 UI & UX
- **Desert Theme**: A warm, calming orange and cream color palette.
- **Animations**: Smooth transitions, rotating sun animations, and haptic feedback.
- **Dark/Light Mode**: (Coming soon)
- **Accessibility**: Fully accessible with VoiceOver/TalkBack support.

### 🌍 Internationalization
- **Multi-language**: Full support for English and Arabic.
- **RTL Support**: Layouts automatically mirror for Right-to-Left languages.

## 📱 Screenshots

| Home Screen | Alarm Ringing | Math Puzzle | Memory Game |
|:-----------:|:-------------:|:-----------:|:-----------:|
| ![Home](https://via.placeholder.com/200x400?text=Home) | ![Ringing](https://via.placeholder.com/200x400?text=Ringing) | ![Math](https://via.placeholder.com/200x400?text=Math) | ![Memory](https://via.placeholder.com/200x400?text=Memory) |

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) & [Expo SDK 54](https://expo.dev/)
- **Navigation**: [React Navigation v7](https://reactnavigation.org/)
- **State Management**: React Hooks & Context
- **Storage**: Async Storage
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Graphics**: [React Native SVG](https://github.com/software-mansion/react-native-svg)
- **Haptics**: Expo Haptics
- **i18n**: i18next & react-i18next

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- Expo Go app on your physical device OR Android Studio/Xcode for emulators.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ahmed-Abdo-Madani/alarm-puzzle-app.git
   cd alarm-puzzle-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Scan the QR code with Expo Go (Android) or Camera (iOS).
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.

## 📂 Project Structure

```
src/
├── components/    # Reusable UI components (Buttons, Cards, Puzzles)
├── config/        # App configuration (Fonts, i18n)
├── constants/     # Static data and assets
├── locales/       # Translation files (en.json, ar.json)
├── navigation/    # Stack and Tab navigators
├── screens/       # Application screens
├── services/      # Business logic (Alarm, Audio, Storage)
├── theme/         # Design system (Colors, Spacing, Typography)
├── types/         # TypeScript definitions
└── utils/         # Helper functions (Haptics, Validation, Formatting)
```

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
