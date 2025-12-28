# Cross-Platform Testing Checklist

## General
- [ ] App launches successfully on Android Emulator.
- [ ] App launches successfully on iOS Simulator.
- [ ] Fonts load correctly (Cairo for Arabic, System for English).
- [ ] RTL layout works correctly when language is switched to Arabic.
- [ ] Dark mode/Light mode (if applicable) looks correct.

## Onboarding
- [ ] Onboarding modal appears on first launch.
- [ ] "Get Started" button works.
- [ ] Puzzles are marked as "seen" after first interaction.
- [ ] Onboarding does not appear on subsequent launches.

## Alarm Management
- [ ] Can create a new alarm.
- [ ] Can edit an existing alarm.
- [ ] Can delete an alarm.
- [ ] Alarm list updates correctly.
- [ ] Toggle alarm on/off works.
- [ ] Time picker works on both Android and iOS.
- [ ] Repeat days selector works.

## Puzzles
- [ ] **Math Puzzle:**
  - [ ] Generates correct difficulty.
  - [ ] Validates correct answer.
  - [ ] Rejects incorrect answer.
  - [ ] Haptic feedback on success/failure.
- [ ] **Memory Puzzle:**
  - [ ] Cards flip correctly.
  - [ ] Matches are found.
  - [ ] Game completes when all matches found.
  - [ ] Haptic feedback on flip/match.
- [ ] **Typing Puzzle:**
  - [ ] Text to type is visible.
  - [ ] Input validation works.
  - [ ] Case sensitivity handled correctly.
- [ ] **Barcode Puzzle:**
  - [ ] Camera permission requested.
  - [ ] Scanner activates.
  - [ ] Scans valid barcode.

## Alarm Ringing
- [ ] Alarm screen appears when alarm triggers (foreground).
- [ ] Alarm notification appears when alarm triggers (background).
- [ ] Sound plays correctly.
- [ ] Vibration works.
- [ ] Snooze button works (if enabled).
- [ ] "Stop" button requires puzzle completion.
- [ ] Puzzle must be solved to stop alarm.

## Settings
- [ ] Can change language (English/Arabic).
- [ ] Can change theme (if applicable).
- [ ] Can change default snooze duration.
- [ ] Can change default alarm sound.

## Accessibility
- [ ] VoiceOver/TalkBack reads all interactive elements.
- [ ] Focus order is logical.
- [ ] Touch targets are large enough (min 44x44).
- [ ] Color contrast is sufficient.

## Performance
- [ ] No visible lag during navigation.
- [ ] Animations are smooth (60fps).
- [ ] Memory usage is stable.
- [ ] App does not crash on long usage.
