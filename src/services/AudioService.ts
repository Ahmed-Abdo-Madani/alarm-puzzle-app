import TrackPlayer, { 
  Capability, 
  Event, 
  RepeatMode, 
  State,
  AppKilledPlaybackBehavior
} from 'react-native-track-player';
import { Alert } from 'react-native';

class AudioService {
  private gradualVolumeInterval: NodeJS.Timeout | null = null;
  private isInterrupted: boolean = false;
  private wasPlayingBeforeInterruption: boolean = false;
  private isSetup: boolean = false;

  async setupPlayer() {
    if (this.isSetup) return;
    
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
      });
      
      this.setupInterruptionHandling();
      this.isSetup = true;
    } catch (error) {
      console.error('Error setting up player:', error);
      // If setup fails, it might be because it's already set up (though we check isSetup)
      // or native module issue.
    }
  }

  setupInterruptionHandling() {
    TrackPlayer.addEventListener(Event.RemoteDuck, async (e) => {
      if (e.paused) {
        // Interrupted (e.g. phone call)
        const state = await TrackPlayer.getState();
        if (state === State.Playing) {
          this.wasPlayingBeforeInterruption = true;
          this.isInterrupted = true;
          await TrackPlayer.pause();
        }
      } else {
        // Interruption ended
        if (this.isInterrupted && this.wasPlayingBeforeInterruption) {
          this.isInterrupted = false;
          this.wasPlayingBeforeInterruption = false;
          await TrackPlayer.play();
        }
      }
    });
  }

  async loadSound(soundUri: string | number) {
    if (!this.isSetup) {
      await this.setupPlayer();
    }

    try {
      await TrackPlayer.reset();
      
      // Handle require() assets vs URI strings
      const track = {
        url: soundUri,
        title: 'Alarm',
        artist: 'Puzzle Alarm',
        artwork: require('../../assets/icon.png'), // Optional
      };

      await TrackPlayer.add([track]);
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      
    } catch (error) {
      console.error('Error loading sound:', error);
      // Fallback
      if (typeof soundUri === 'string') {
        console.log('Attempting to load fallback sound...');
        await this.loadFallbackSound();
      } else {
        throw error;
      }
    }
  }

  async loadFallbackSound() {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add([{
        url: require('../../assets/sounds/default_alarm.mp3'),
        title: 'Alarm',
        artist: 'Puzzle Alarm',
      }]);
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
    } catch (error) {
      console.error('Error loading fallback sound:', error);
      Alert.alert('Error', 'Failed to load alarm sound.');
    }
  }

  async startGradualVolumeIncrease(targetVolume: number, durationMs: number) {
    try {
      await TrackPlayer.setVolume(0);
      await TrackPlayer.play();

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
        await TrackPlayer.setVolume(currentVolume);
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
    try {
      await TrackPlayer.setVolume(volume);
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  async stopSound() {
    this.stopGradualVolumeIncrease();
    try {
      await TrackPlayer.stop();
      // We don't necessarily need to reset, but it cleans up the queue
      await TrackPlayer.reset();
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }

  async setVolume(volume: number) {
    try {
      await TrackPlayer.setVolume(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async pauseSound() {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  }

  async resumeSound() {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error resuming sound:', error);
    }
  }
}

export default new AudioService();
