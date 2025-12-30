import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import AudioService from '../services/AudioService';
import CustomSoundService, { CustomSound } from '../services/CustomSoundService';
import { DEFAULT_SOUNDS, getSoundSource } from '../constants/sounds';
import { View } from './View';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing } from '../theme';
import { flexRow, paddingHorizontal, textAlign } from '../theme/styles';

interface SoundPickerComponentProps {
  soundUri: string | number;
  soundName: string;
  onChange: (uri: string | number, name: string) => void;
}

export const SoundPickerComponent: React.FC<SoundPickerComponentProps> = ({
  soundUri,
  soundName,
  onChange,
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewing, setPreviewing] = useState<string | number | null>(null);
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState<string | number | null>(null);

  useEffect(() => {
    loadCustomSounds();
    return () => {
      AudioService.stopSound();
    };
  }, []);

  const loadCustomSounds = async () => {
    const sounds = await CustomSoundService.getCustomSounds();
    setCustomSounds(sounds);
  };

  const handlePreview = async (uri: string | number) => {
    if (previewing === uri) {
      await AudioService.stopSound();
      setPreviewing(null);
    } else {
      if (previewing) {
        await AudioService.stopSound();
      }
      setLoadingPreview(uri);
      try {
        // Convert sound ID to actual source if needed
        const soundSource = getSoundSource(uri);
        await AudioService.loadSound(soundSource);
        await AudioService.playSound();
        setPreviewing(uri);
      } catch (error) {
        console.error('Failed to preview sound', error);
        Alert.alert(t('common.error'), t('sound.previewError') || 'Failed to play sound');
      } finally {
        setLoadingPreview(null);
      }
    }
  };

  const handleSelect = (uri: string | number, name: string) => {
    onChange(uri, name);
    setModalVisible(false);
    if (previewing) {
      AudioService.stopSound();
      setPreviewing(null);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const newSound = await CustomSoundService.importCustomSound();
      if (newSound) {
        await loadCustomSounds();
        Alert.alert(t('common.success'), t('sound.importSuccess'));
      }
    } catch (error: any) {
      if (error.message === 'File size too large') {
        Alert.alert(t('common.error'), t('sound.fileTooLarge'));
      } else {
        Alert.alert(t('common.error'), t('sound.importError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustom = async (id: string) => {
    Alert.alert(
      t('sound.deleteSound'),
      t('common.confirmDelete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: async () => {
            await CustomSoundService.deleteCustomSound(id);
            await loadCustomSounds();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    // For comparison, use the item's ID for default sounds
    const isSelected = item.isCustom 
      ? item.uri === soundUri 
      : (item.id === soundUri || item.uri === soundUri);
    const displayName = item.isCustom ? item.name : t(item.nameKey);
    // Store the ID for default sounds, URI for custom sounds
    const valueToStore = item.isCustom ? item.uri : item.id;

    return (
      <View style={styles.soundItem}>
        <TouchableOpacity 
          style={[styles.soundSelect, isSelected && styles.selectedItem]}
          onPress={() => handleSelect(valueToStore, displayName)}
        >
          <Text style={[styles.soundName, isSelected && styles.selectedText]}>
            {displayName}
          </Text>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.itemPreviewBtn}
            onPress={() => handlePreview(item.uri)}
            disabled={loadingPreview === item.uri}
          >
            {loadingPreview === item.uri ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.itemActionText}>
                {previewing === item.uri ? '■' : '▶'}
              </Text>
            )}
          </TouchableOpacity>
          
          {item.isCustom && (
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => handleDeleteCustom(item.id)}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('sound.title')}</Text>
      
      <View style={styles.mainSelector}>
        <View style={styles.soundInfo}>
          <Text style={styles.value}>{soundName}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.previewBtn}
            onPress={() => handlePreview(soundUri)}
            disabled={loadingPreview === soundUri}
          >
            {loadingPreview === soundUri ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.actionText}>
                {previewing === soundUri ? t('sound.stopPreview') : t('sound.preview')}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.actionText, styles.boldText]}>{t('common.edit')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('sound.title')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={[...DEFAULT_SOUNDS, ...customSounds]}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <TouchableOpacity 
                  style={styles.importBtn}
                  onPress={handleImport}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.surface} />
                  ) : (
                    <Text style={styles.importText}>{t('sound.importCustom')}</Text>
                  )}
                </TouchableOpacity>
              }
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    ...textAlign(),
  },
  mainSelector: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...flexRow(),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soundInfo: {
    flex: 1,
  },
  actions: {
    ...flexRow(),
    alignItems: 'center',
    gap: spacing.md,
  },
  previewBtn: {
    paddingHorizontal: spacing.sm,
  },
  changeBtn: {
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: colors.text,
    ...textAlign(),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    ...flexRow(),
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  closeText: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: spacing.sm,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
    ...textAlign(),
  },
  soundItem: {
    ...flexRow(),
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  soundSelect: {
    flex: 1,
    ...flexRow(),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soundName: {
    fontSize: 16,
    color: colors.text,
    ...textAlign(),
  },
  selectedSoundName: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  selectedItem: {
    backgroundColor: colors.background,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  itemActions: {
    ...flexRow(),
    alignItems: 'center',
  },
  itemPreviewBtn: {
    padding: spacing.sm,
  },
  itemActionText: {
    fontSize: 18,
    color: colors.primary,
  },
  deleteBtn: {
    padding: spacing.sm,
  },
  deleteText: {
    fontSize: 16,
    color: colors.error,
  },
  importBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  importText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 18,
    marginHorizontal: spacing.sm,
  },
  listPreviewButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  listPreviewText: {
    fontSize: 18,
    color: colors.primary,
  },
  closeButton: {
    marginTop: spacing.md,
  },
});
