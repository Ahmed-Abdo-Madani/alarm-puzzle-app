import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '../utils/uuid';

const CUSTOM_SOUNDS_KEY = 'custom_sounds';

export interface CustomSound {
  id: string;
  name: string;
  uri: string;
  isCustom: true;
}

class CustomSoundService {
  async importCustomSound(): Promise<CustomSound | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      
      // Validate file size (10MB limit)
      if (asset.size && asset.size > 10 * 1024 * 1024) {
        throw new Error('File size too large');
      }

      const fileName = `${generateUUID()}-${asset.name}`;
      const destination = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: asset.uri,
        to: destination,
      });

      const newSound: CustomSound = {
        id: generateUUID(),
        name: asset.name.replace(/\.[^/.]+$/, ""), // Remove extension
        uri: destination,
        isCustom: true,
      };

      await this.saveCustomSound(newSound);
      return newSound;

    } catch (error) {
      console.error('Error importing custom sound:', error);
      throw error;
    }
  }

  async saveCustomSound(sound: CustomSound) {
    try {
      const existingSounds = await this.getCustomSounds();
      const updatedSounds = [...existingSounds, sound];
      await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(updatedSounds));
    } catch (error) {
      console.error('Error saving custom sound:', error);
      throw error;
    }
  }

  async getCustomSounds(): Promise<CustomSound[]> {
    try {
      const soundsJson = await AsyncStorage.getItem(CUSTOM_SOUNDS_KEY);
      return soundsJson ? JSON.parse(soundsJson) : [];
    } catch (error) {
      console.error('Error getting custom sounds:', error);
      return [];
    }
  }

  async deleteCustomSound(id: string) {
    try {
      const sounds = await this.getCustomSounds();
      const soundToDelete = sounds.find(s => s.id === id);
      
      if (soundToDelete) {
        await FileSystem.deleteAsync(soundToDelete.uri, { idempotent: true });
        const updatedSounds = sounds.filter(s => s.id !== id);
        await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(updatedSounds));
      }
    } catch (error) {
      console.error('Error deleting custom sound:', error);
      throw error;
    }
  }
}

export default new CustomSoundService();
