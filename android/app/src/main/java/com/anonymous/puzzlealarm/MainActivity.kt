package com.anonymous.puzzlealarm

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  private var pendingAlarmId: String? = null
  private var isAlarmMode: Boolean = false

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)
    
    // Check if launched from alarm and enable lock screen mode only if so
    val isAlarm = intent?.getBooleanExtra("isAlarm", false) ?: false
    if (isAlarm) {
      enableAlarmMode()
    }
    
    // Check if launched from alarm
    handleAlarmIntent(intent)
  }
  
  private fun enableAlarmMode() {
    isAlarmMode = true
    
    // Allow showing over lock screen
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
      val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      keyguardManager.requestDismissKeyguard(this, null)
    } else {
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      )
    }
    
    // Keep screen on while alarm is active
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }
  
  fun disableAlarmMode() {
    isAlarmMode = false
    
    // Remove lock screen flags
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(false)
      setTurnScreenOn(false)
    } else {
      window.clearFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      )
    }
    
    // Remove keep screen on flag
    window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }
  
  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    intent?.let { 
      val isAlarm = it.getBooleanExtra("isAlarm", false)
      if (isAlarm) {
        enableAlarmMode()
      }
      handleAlarmIntent(it) 
    }
  }
  
  private fun handleAlarmIntent(intent: Intent) {
    val alarmId = intent.getStringExtra(AlarmReceiver.EXTRA_ALARM_ID)
    val isAlarm = intent.getBooleanExtra("isAlarm", false)
    
    if (alarmId != null && isAlarm) {
      pendingAlarmId = alarmId
      // The React Native side will check for this via Linking
    }
  }
  
  fun getPendingAlarmId(): String? {
    val id = pendingAlarmId
    pendingAlarmId = null
    return id
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
