package com.anonymous.puzzlealarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String = "AlarmModule"
    
    @ReactMethod
    fun scheduleAlarm(alarmId: String, timestamp: Double, promise: Promise) {
        try {
            val context = reactApplicationContext
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            
            val intent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarmId)
            }
            
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            val triggerTime = timestamp.toLong()
            
            // Use exact alarm for reliability
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAlarmClock(
                        AlarmManager.AlarmClockInfo(triggerTime, pendingIntent),
                        pendingIntent
                    )
                } else {
                    // Fallback if exact alarms not permitted
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerTime,
                        pendingIntent
                    )
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAlarmClock(
                    AlarmManager.AlarmClockInfo(triggerTime, pendingIntent),
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            }
            
            promise.resolve(alarmId)
        } catch (e: Exception) {
            promise.reject("ALARM_ERROR", "Failed to schedule alarm: ${e.message}", e)
        }
    }
    
    @ReactMethod
    fun cancelAlarm(alarmId: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            
            val intent = Intent(context, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ALARM_ERROR", "Failed to cancel alarm: ${e.message}", e)
        }
    }
    
    @ReactMethod
    fun dismissAlarmNotification(alarmId: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
            
            // Cancel notifications for this alarm
            notificationManager.cancel(alarmId.hashCode())
            
            // Also release any wake locks
            AlarmService.releaseWakeLock()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", "Failed to dismiss notification: ${e.message}", e)
        }
    }
    
    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            promise.resolve(alarmManager.canScheduleExactAlarms())
        } else {
            promise.resolve(true)
        }
    }
    
    @ReactMethod
    fun openExactAlarmSettings(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactApplicationContext.startActivity(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", "Failed to open settings: ${e.message}", e)
        }
    }
    
    @ReactMethod
    fun getPendingAlarmId(promise: Promise) {
        val activity = currentActivity as? MainActivity
        val alarmId = activity?.getPendingAlarmId()
        promise.resolve(alarmId)
    }
    
    @ReactMethod
    fun disableAlarmMode(promise: Promise) {
        try {
            val activity = currentActivity as? MainActivity
            activity?.runOnUiThread {
                activity.disableAlarmMode()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ALARM_MODE_ERROR", "Failed to disable alarm mode: ${e.message}", e)
        }
    }
}
