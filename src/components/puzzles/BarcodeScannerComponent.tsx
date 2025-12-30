import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (data && !hasScanned) {
      notificationSuccess();
      setHasScanned(true);
      // Delay completion slightly to show success message
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text tx="loading.initializingCamera" style={styles.text} />
      </View>
    );
  }

  if (!permission.granted) {
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

  return (
    <View style={styles.fullScreen}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
        }}
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
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
