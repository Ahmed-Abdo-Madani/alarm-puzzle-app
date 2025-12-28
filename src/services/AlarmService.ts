import { Alarm } from '../types/alarm';
import { StorageService, ALARMS_KEY } from './StorageService';
import { generateUUID } from '../utils/uuid';
import { validateAlarm } from '../utils/validation';
import { getNextOccurrence } from '../utils/alarmTime';
import { AlarmSchedulerService } from './AlarmSchedulerService';

export const AlarmService = {
  async getAllAlarms(): Promise<Alarm[]> {
    const alarms = await StorageService.getItem<Alarm[]>(ALARMS_KEY);
    if (!alarms) return [];
    
    // Sort by time
    return alarms.sort((a, b) => a.time.localeCompare(b.time));
  },

  async getAlarmById(id: string): Promise<Alarm | null> {
    const alarms = await this.getAllAlarms();
    return alarms.find(a => a.id === id) || null;
  },

  async createAlarm(alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alarm> {
    const validation = validateAlarm(alarmData);
    if (!validation.valid) {
      throw new Error(`Invalid alarm data: ${validation.errors.join(', ')}`);
    }

    const now = Date.now();
    const newAlarm: Alarm = {
      ...alarmData,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const alarms = await this.getAllAlarms();
    
    if (newAlarm.enabled) {
      const notificationIds = await AlarmSchedulerService.scheduleAlarm(newAlarm);
      if (notificationIds && notificationIds.length > 0) {
        newAlarm.notificationIds = notificationIds;
      }
    }

    alarms.push(newAlarm);
    await StorageService.setItem(ALARMS_KEY, alarms);
    
    return newAlarm;
  },

  async updateAlarm(id: string, updates: Partial<Alarm>): Promise<Alarm> {
    const alarms = await this.getAllAlarms();
    const index = alarms.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error('Alarm not found');
    }

    const existingAlarm = alarms[index];
    const updatedAlarm: Alarm = {
      ...existingAlarm,
      ...updates,
      settings: updates.settings
        ? { ...existingAlarm.settings, ...updates.settings }
        : existingAlarm.settings,
      snoozeSettings: updates.snoozeSettings
        ? { ...existingAlarm.snoozeSettings, ...updates.snoozeSettings }
        : existingAlarm.snoozeSettings,
      updatedAt: Date.now(),
    };

    const validation = validateAlarm(updatedAlarm);
    if (!validation.valid) {
      throw new Error(`Invalid alarm data: ${validation.errors.join(', ')}`);
    }

    // Handle scheduling
    if (existingAlarm.enabled && !updatedAlarm.enabled) {
      await AlarmSchedulerService.cancelAlarm(existingAlarm);
      updatedAlarm.notificationIds = undefined;
    } else if (!existingAlarm.enabled && updatedAlarm.enabled) {
      const notificationIds = await AlarmSchedulerService.scheduleAlarm(updatedAlarm);
      if (notificationIds && notificationIds.length > 0) {
        updatedAlarm.notificationIds = notificationIds;
      }
    } else if (updatedAlarm.enabled) {
      // If time or repeat changed, reschedule
      const timeChanged = existingAlarm.time !== updatedAlarm.time;
      const repeatChanged = existingAlarm.repeatPattern !== updatedAlarm.repeatPattern || 
                           JSON.stringify(existingAlarm.repeatDays) !== JSON.stringify(updatedAlarm.repeatDays);
      
      if (timeChanged || repeatChanged) {
        const notificationIds = await AlarmSchedulerService.rescheduleAlarm(updatedAlarm);
        if (notificationIds && notificationIds.length > 0) {
          updatedAlarm.notificationIds = notificationIds;
        }
      }
    }

    alarms[index] = updatedAlarm;
    await StorageService.setItem(ALARMS_KEY, alarms);

    return updatedAlarm;
  },

  async deleteAlarm(id: string): Promise<void> {
    const alarm = await this.getAlarmById(id);
    if (alarm) {
      await AlarmSchedulerService.cancelAlarm(alarm);
    }
    const alarms = await this.getAllAlarms();
    const filteredAlarms = alarms.filter(a => a.id !== id);
    await StorageService.setItem(ALARMS_KEY, filteredAlarms);
  },

  async toggleAlarm(id: string): Promise<Alarm> {
    const alarm = await this.getAlarmById(id);
    if (!alarm) throw new Error('Alarm not found');
    
    return await this.updateAlarm(id, { enabled: !alarm.enabled });
  },

  async getActiveAlarms(): Promise<Alarm[]> {
    const alarms = await this.getAllAlarms();
    return alarms.filter(a => a.enabled);
  },

  getNextAlarmTime(alarm: Alarm): Date | null {
    return getNextOccurrence(alarm);
  },

  async rescheduleActiveAlarms(): Promise<void> {
    const alarms = await this.getAllAlarms();
    let hasChanges = false;

    for (let i = 0; i < alarms.length; i++) {
      const alarm = alarms[i];
      if (alarm.enabled) {
        const notificationIds = await AlarmSchedulerService.rescheduleAlarm(alarm);
        if (notificationIds && notificationIds.length > 0) {
          alarm.notificationIds = notificationIds;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await StorageService.setItem(ALARMS_KEY, alarms);
    }
  },
};
