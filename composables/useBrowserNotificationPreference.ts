import { computed } from 'vue'
import {
  canSendBrowserNotifications,
  declineBrowserNotifications,
  enableBrowserNotifications,
  getNotificationPreference,
  shouldShowNotificationPrompt,
  snoozeNotificationPrompt,
  syncNotificationPreferenceWithBrowser,
  type NotificationPreference,
} from '~/utils/browserNotifications'

export function useBrowserNotificationPreference() {
  const preference = useState<NotificationPreference>(
    'browser-notification-preference',
    () => getNotificationPreference()
  )

  const promptVisible = useState<boolean>('browser-notification-prompt-visible', () => false)

  function syncPreference() {
    preference.value = syncNotificationPreferenceWithBrowser()
  }

  function refreshPromptVisibility(isAuthenticated: boolean) {
    syncPreference()
    promptVisible.value = isAuthenticated && shouldShowNotificationPrompt()
  }

  const canSend = computed(() => canSendBrowserNotifications())

  async function acceptNotifications() {
    const result = await enableBrowserNotifications()
    preference.value = result.preference
    promptVisible.value = false
    return result
  }

  function declineNotifications() {
    declineBrowserNotifications()
    preference.value = 'disabled'
    promptVisible.value = false
  }

  function snoozePrompt(days = 7) {
    snoozeNotificationPrompt(days)
    promptVisible.value = false
  }

  return {
    preference,
    promptVisible,
    canSend,
    syncPreference,
    refreshPromptVisibility,
    acceptNotifications,
    declineNotifications,
    snoozePrompt,
  }
}
