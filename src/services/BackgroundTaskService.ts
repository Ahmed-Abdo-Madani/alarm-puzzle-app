import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

export const ALARM_BACKGROUND_TASK = 'ALARM_BACKGROUND_TASK';

export const BackgroundTaskService = {
  async registerTasks() {
    if (!TaskManager.isTaskDefined(ALARM_BACKGROUND_TASK)) {
      TaskManager.defineTask(ALARM_BACKGROUND_TASK, ({ data, error }) => {
        if (error) {
          console.error('Background task error:', error);
          return;
        }
        if (data) {
          console.log('Background task data:', data);
          // Handle background notification trigger if needed
        }
      });
    }
  },
};
