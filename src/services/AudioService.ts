import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Asset } from 'expo-asset';

class AudioService {
  private sound: Audio.Sound | null = null;
  private gradualVolumeInterval: NodeJS.Timeout | null = null;
  private isSetup: boolean = false;
  private loadFailed: boolean = false;

  async setupPlayer() {
    if (this.isSetup) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
      });
      
      this.isSetup = true;
    } catch (error) {
      console.error('Error setting up player:', error);
    }
  }

  // Interruption handling is largely handled by the OS/Expo AV settings above

  async loadSound(soundUri: string | number) {
    if (!this.isSetup) {
      await this.setupPlayer();
    }

    this.loadFailed = false;

    try {
      await this.unloadSound();
      
      let source: any;
      
      if (typeof soundUri === 'string') {
        // Custom sound - use URI directly
        source = { uri: soundUri };
      } else {
        // Bundled asset - use Asset.fromModule to get proper URI
        const asset = Asset.fromModule(soundUri);
        await asset.downloadAsync();
        source = { uri: asset.localUri || asset.uri };
      }
      
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: false, isLooping: true }
      );
      
      this.sound = sound;
      
    } catch (error) {
      console.warn('Sound file unavailable:', error);
      this.loadFailed = true;
      // Don't throw - allow app to continue without sound
    }
  }

  async loadFallbackSound() {
    // Sounds are unavailable - just log and continue silently
    console.log('Fallback sound unavailable - continuing without audio');
    this.loadFailed = true;
  }

  async unloadSound() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        // Ignore unload errors
      }
      this.sound = null;
    }
  }

  async startGradualVolumeIncrease(targetVolume: number, durationMs: number) {
    if (!this.sound) return;

    try {
      await this.sound.setVolumeAsync(0);
      await this.sound.playAsync();

      const steps = 30;
      const intervalTime = durationMs / steps;
      const volumeStep = targetVolume / steps;
      let currentVolume = 0;

      this.gradualVolumeInterval = setInterval(async () => {
        currentVolume += volumeStep;
        if (currentVolume >= targetVolume) {
          currentVolume = targetVolume;
          this.stopGradualVolumeIncrease();
        }
        if (this.sound) {
            await this.sound.setVolumeAsync(currentVolume);
        }
      }, intervalTime);
    } catch (error) {
      console.error('Error starting gradual volume:', error);
    }
  }

  stopGradualVolumeIncrease() {
    if (this.gradualVolumeInterval) {
      clearInterval(this.gradualVolumeInterval);
      this.gradualVolumeInterval = null;
    }
  }

  async playSound(volume: number = 1) {
    if (!this.sound) return;
    try {
      await this.sound.setVolumeAsync(volume);
      await this.sound.playAsync();
    } catch (error) {
      // Ignore play errors - sound may not be loaded
      console.log('Could not play sound:', error);
    }
  }

  async stopSound() {
    this.stopGradualVolumeIncrease();
    if (!this.sound) {
      // No sound to stop - this is OK
      return;
    }
    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        await this.sound.stopAsync();
      }
    } catch (error) {
      // Ignore stop errors - sound may already be stopped or unloaded
      console.log('Could not stop sound (already stopped or unloaded)');
    }
    // Clean up the sound reference
    await this.unloadSound();
  }

  async setVolume(volume: number) {
    if (!this.sound) return;
    try {
      await this.sound.setVolumeAsync(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async pauseSound() {
    if (!this.sound) return;
    try {
      await this.sound.pauseAsync();
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  }

  async resumeSound() {
    if (!this.sound) return;
    try {
      await this.sound.playAsync();
    } catch (error) {
      console.error('Error resuming sound:', error);
    }
  }
}

export default new AudioService();
