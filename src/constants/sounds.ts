export const DEFAULT_SOUNDS = [
  { 
    id: 'default', 
    nameKey: 'sound.sounds.default',
    uri: require('../../assets/sounds/default_alarm.mp3') 
  },
  { 
    id: 'gentle_alarm', 
    nameKey: 'sound.sounds.gentleAlarm',
    uri: require('../../assets/sounds/gentle_alarm.mp3') 
  },
  { 
    id: 'andromeda', 
    nameKey: 'sound.sounds.andromeda',
    uri: require('../../assets/sounds/andromeda.mp3') 
  },
  { 
    id: 'radar', 
    nameKey: 'sound.sounds.radar',
    uri: require('../../assets/sounds/radar.mp3') 
  },
  { 
    id: 'chimes', 
    nameKey: 'sound.sounds.chimes',
    uri: require('../../assets/sounds/chimes.mp3') 
  },
];

// Helper to get sound by ID
export function getSoundById(id: string | number): number | null {
  // If it's already a require() result (number), find the matching sound
  if (typeof id === 'number') {
    const sound = DEFAULT_SOUNDS.find(s => s.uri === id);
    return sound?.uri || null;
  }
  
  // If it's a string ID, find the sound
  const sound = DEFAULT_SOUNDS.find(s => s.id === id);
  return sound?.uri || null;
}

// Helper to get the sound require() from stored value
export function getSoundSource(storedValue: string | number): number | string {
  // If it's a string that looks like a path/URI (custom sound), return as-is
  if (typeof storedValue === 'string') {
    // Check if it's a default sound ID
    const defaultSound = DEFAULT_SOUNDS.find(s => s.id === storedValue);
    if (defaultSound) {
      return defaultSound.uri;
    }
    // Otherwise it's a custom sound path
    return storedValue;
  }
  
  // If it's a number, it should be a require() result - find matching sound
  const matchingSound = DEFAULT_SOUNDS.find(s => s.uri === storedValue);
  if (matchingSound) {
    return matchingSound.uri;
  }
  
  // Fallback to default
  return DEFAULT_SOUNDS[0].uri;
}