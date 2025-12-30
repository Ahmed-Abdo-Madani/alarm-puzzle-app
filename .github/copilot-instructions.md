# Puzzle Alarm App - AI Coding Instructions

## 🏗 Architecture & Data Flow
- **Service-Oriented Logic**: Business logic resides in `src/services/`.
  - `AlarmService`: CRUD operations for alarms using `StorageService`.
  - `AlarmSchedulerService`: Handles `expo-notifications` scheduling.
  - `AudioService`: Manages alarm playback via `react-native-track-player`.
- **Navigation**: Uses **React Navigation v7 Static API** (`src/navigation/RootNavigator.tsx`).
- **State Management**: Primarily handled through services and local component state. Persistent data uses `AsyncStorage` via `StorageService`.
- **Puzzles**: Integrated via `PuzzleContainer.tsx`. New puzzles should be added to `src/components/puzzles/` and registered in `PuzzleType` enum.

## 🌍 Internationalization (i18n) & RTL
- **RTL First**: The app fully supports Arabic. Always use logical properties for styling.
  - Use `paddingStart` instead of `paddingLeft`.
  - Use `I18nManager.isRTL` for direction-specific logic.
- **Translations**: Never hardcode strings.
  - Use the `tx` prop on the custom `Text` component: `<Text tx="common.save" />`.
  - Add keys to `src/locales/en.json` and `src/locales/ar.json`.

## 🎨 UI & Styling
- **Base Components**: Always prefer components in `src/components/` (`View`, `Text`, `Button`) as they handle RTL and theme defaults.
- **Theme**: Use constants from `src/theme/index.ts`.
  - Colors: `colors.primary`, `colors.background`, etc.
  - Spacing: `spacing.md`, `spacing.lg`, etc.
- **Animations**: Use `react-native-reanimated` for smooth transitions.

## 🛠 Developer Workflows
- **Start Dev**: `npx expo start`
- **Linting**: `npm run lint` (ESLint + Prettier).
- **Testing**: Follow the manual checklist in `TESTING.md`.
- **Adding a Service**: Follow the singleton object pattern used in `AlarmService.ts`.

## 📝 Coding Conventions
- **TypeScript**: Strict typing is required. Define interfaces in `src/types/`.
- **File Naming**: PascalCase for components (`AlarmItem.tsx`), camelCase for services and utils (`alarmService.ts`).
- **Haptics**: Use `src/utils/haptics.ts` for consistent tactile feedback.
- **Validation**: Use `src/utils/validation.ts` for alarm and input validation.

## 🔗 Key Files
- `src/types/alarm.ts`: Central source of truth for Alarm and Puzzle data structures.
- `src/navigation/RootNavigator.tsx`: Main navigation configuration.
- `src/components/puzzles/PuzzleContainer.tsx`: Orchestrates puzzle logic and onboarding.
