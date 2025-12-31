import React, { useState } from 'react';
import { Modal, StyleSheet, View as RNView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { View } from './View';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing } from '../theme';
import { parseAlarmTime, formatAlarmTime } from '../utils/alarmTime';

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

const CLOCK_SIZE = 260;
const CLOCK_RADIUS = CLOCK_SIZE / 2 - 30;

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  initialTime,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { hours, minutes } = parseAlarmTime(initialTime);
  
  const [selectedHour, setSelectedHour] = useState(hours % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(minutes);
  const [isPM, setIsPM] = useState(hours >= 12);

  const getAngle = (value: number, max: number) => {
    return ((value * 360) / max - 90) * (Math.PI / 180);
  };

  const getPosition = (angle: number, radius: number) => {
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const handleConfirm = () => {
    const hour24 = isPM ? (selectedHour % 12) + 12 : selectedHour % 12;
    onConfirm(formatAlarmTime(hour24, selectedMinute));
  };

  const handleMinuteIncrement = (delta: number) => {
    let newMinute = selectedMinute + delta;
    if (newMinute < 0) newMinute = 55;
    if (newMinute > 59) newMinute = 0;
    setSelectedMinute(newMinute);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <RNView style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select time</Text>
          
          {/* Time Display */}
          <View style={styles.displayContainer}>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeNumber}>{String(selectedHour).padStart(2, '0')}</Text>
              <Text style={styles.timeColon}>:</Text>
              <Text style={styles.timeNumber}>{String(selectedMinute).padStart(2, '0')}</Text>
            </View>
            
            <View style={styles.periodToggle}>
              <TouchableOpacity
                style={[styles.periodButton, !isPM && styles.periodButtonActive]}
                onPress={() => setIsPM(false)}
              >
                <Text style={[styles.periodText, !isPM && styles.periodTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, isPM && styles.periodButtonActive]}
                onPress={() => setIsPM(true)}
              >
                <Text style={[styles.periodText, isPM && styles.periodTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Clock Face */}
          <View style={styles.clockFace}>
            {/* Hour numbers */}
            {Array.from({ length: 12 }, (_, i) => {
              const hourValue = i === 0 ? 12 : i;
              const angle = getAngle(hourValue, 12);
              const pos = getPosition(angle, CLOCK_RADIUS);
              const isSelected = selectedHour === hourValue;
              
              return (
                <TouchableOpacity
                  key={`hour-${i}`}
                  style={[
                    styles.hourMarker,
                    {
                      left: CLOCK_SIZE / 2 + pos.x - 18,
                      top: CLOCK_SIZE / 2 + pos.y - 18,
                    },
                    isSelected && styles.hourMarkerSelected
                  ]}
                  onPress={() => setSelectedHour(hourValue)}
                >
                  <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>
                    {hourValue}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Clock Hand */}
            {(() => {
              const angle = getAngle(selectedHour, 12);
              const pos = getPosition(angle, CLOCK_RADIUS * 0.6);
              const rotation = ((selectedHour * 360) / 12) - 90;
              
              return (
                <>
                  <RNView 
                    style={[
                      styles.clockHand,
                      {
                        width: CLOCK_RADIUS * 0.6,
                        transform: [{ rotate: `${rotation}deg` }]
                      }
                    ]} 
                  />
                  <RNView style={styles.clockCenter} />
                  <RNView 
                    style={[
                      styles.clockHandEnd,
                      {
                        left: CLOCK_SIZE / 2 + pos.x - 8,
                        top: CLOCK_SIZE / 2 + pos.y - 8,
                      }
                    ]} 
                  />
                </>
              );
            })()}
          </View>

          {/* Minute Selector */}
          <View style={styles.minuteSelector}>
            <TouchableOpacity
              onPress={() => handleMinuteIncrement(-5)}
              style={styles.minuteButton}
            >
              <Text style={styles.minuteButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.minuteValue}>{String(selectedMinute).padStart(2, '0')}</Text>
            <TouchableOpacity
              onPress={() => handleMinuteIncrement(5)}
              style={styles.minuteButton}
            >
              <Text style={styles.minuteButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View row style={styles.buttonContainer}>
            <Button
              tx="common.cancel"
              variant="outline"
              onPress={onCancel}
              style={styles.button}
            />
            <Button
              tx="common.ok"
              onPress={handleConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </RNView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  timeNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.surface,
    minWidth: 70,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.surface,
    marginHorizontal: 4,
  },
  periodToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    minWidth: 60,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#A855F7',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.surface,
  },
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: colors.background,
    alignSelf: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  hourMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourMarkerSelected: {
    backgroundColor: colors.primary,
  },
  hourText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hourTextSelected: {
    color: colors.surface,
  },
  clockCenter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    left: CLOCK_SIZE / 2 - 4,
    top: CLOCK_SIZE / 2 - 4,
  },
  clockHand: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.primary,
    left: CLOCK_SIZE / 2,
    top: CLOCK_SIZE / 2 - 1.5,
    transformOrigin: 'left center',
  },
  clockHandEnd: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  minuteSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  minuteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteButtonText: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: '600',
  },
  minuteValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    justifyContent: 'space-between',
  },
  button: {
    flex: 0.48,
  },
});
