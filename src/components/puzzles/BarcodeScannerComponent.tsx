import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Camera, useCameraPermission, useCodeScanner, useCameraDevice } from 'react-native-vision-camera';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { Button } from '../Button';
import { colors, spacing } from '../../theme';
import { notificationSuccess } from '../../utils/haptics';

interface BarcodeScannerComponentProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const BarcodeScannerComponent: React.FC<BarcodeScannerComponentProps> = ({
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [hasScanned, setHasScanned] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'requesting' | 'denied' | 'granted'>('unknown');
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'upc-a', 'upc-e'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && !hasScanned) {
        notificationSuccess();
        setHasScanned(true);
        // Delay completion slightly to show success message
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }
  });

  useEffect(() => {
    const checkPermission = async () => {
      if (hasPermission) {
        setPermissionStatus('granted');
      } else {
        setPermissionStatus('requesting');
        const result = await requestPermission();
        setPermissionStatus(result ? 'granted' : 'denied');
      }
    };
    
    checkPermission();
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    if (permissionStatus === 'unknown' || permissionStatus === 'requesting') {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text tx="loading.initializingCamera" style={styles.text} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text tx="puzzles.barcode.permissionDenied" style={styles.text} />
        <Button 
          tx="puzzles.barcode.requestPermission" 
          onPress={requestPermission} 
          style={styles.button}
        />
        {onCancel && (
          <Button
            tx="common.cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButton}
          />
        )}
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text>No camera device found</Text>
        {onCancel && (
          <Button
            tx="common.cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButton}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        accessibilityLabel={t('accessibility.cameraView', { defaultValue: 'Camera view for scanning barcode' })}
      />
      
      <View style={styles.overlay}>
        <Text tx="puzzles.barcode.title" variant="h2" style={styles.title} />
        
        {hasScanned ? (
          <View style={styles.successContainer}>
            <Text tx="puzzles.barcode.success" style={styles.successText} />
          </View>
        ) : (
          <View style={styles.instructionContainer}>
            <Text tx="puzzles.barcode.instruction" style={styles.instructionText} />
          </View>
        )}

        {onCancel && (
          <Button
            tx="common.cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButtonOverlay}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
  text: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  cancelButton: {
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    color: colors.surface,
    marginTop: spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.lg,
    borderRadius: 12,
  },
  instructionText: {
    color: colors.surface,
    textAlign: 'center',
    fontSize: 18,
  },
  successContainer: {
    backgroundColor: colors.success,
    padding: spacing.lg,
    borderRadius: 12,
  },
  successText: {
    color: colors.surface,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonOverlay: {
    width: '100%',
    backgroundColor: colors.surface,
  },
});
