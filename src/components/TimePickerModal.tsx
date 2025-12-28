import React, { useState } from 'react';
import { Modal, StyleSheet, Platform, View as RNView } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { View } from './View';
import { Button } from './Button';
import { colors, spacing } from '../theme';
import { parseAlarmTime, formatAlarmTime } from '../utils/alarmTime';

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  initialTime,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { hours, minutes } = parseAlarmTime(initialTime);
  const initialDate = new Date();
  initialDate.setHours(hours, minutes, 0, 0);

  const [date, setDate] = useState(initialDate);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        onConfirm(formatAlarmTime(currentDate.getHours(), currentDate.getMinutes()));
      } else {
        onCancel();
      }
    } else {
      setDate(currentDate);
    }
  };

  const handleConfirm = () => {
    onConfirm(formatAlarmTime(date.getHours(), date.getMinutes()));
  };

  if (Platform.OS === 'android' && visible) {
    return (
      <DateTimePicker
        value={date}
        mode="time"
        is24Hour={true}
        display="default"
        onChange={onChange}
        accessibilityLabel={t('accessibility.selectTime')}
        accessibilityHint={t('accessibility.timePickerHint')}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <RNView style={styles.overlay}>
        <View style={styles.container}>
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
            textColor={colors.text}
            accessibilityLabel={t('accessibility.selectTime')}
            accessibilityHint={t('accessibility.timePickerHint')}
          />
          <View row style={styles.buttonContainer}>
            <Button
              tx="common.cancel"
              variant="outline"
              onPress={onCancel}
              style={styles.button}
            />
            <Button
              tx="common.done"
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    justifyContent: 'space-between',
  },
  button: {
    flex: 0.48,
  },
});
