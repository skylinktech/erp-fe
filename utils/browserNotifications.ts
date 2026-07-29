export type NotificationPreference = 'enabled' | 'disabled' | null

const PREFERENCE_STORAGE_KEY = 'skylink_notification_preference'
const SNOOZE_STORAGE_KEY = 'skylink_notification_prompt_snooze_until'

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export function getNotificationPreference(): NotificationPreference {
  const raw = readStorage(PREFERENCE_STORAGE_KEY)
  if (raw === 'enabled' || raw === 'disabled') return raw
  return null
}

export function setNotificationPreference(value: Exclude<NotificationPreference, null>): void {
  writeStorage(PREFERENCE_STORAGE_KEY, value)
}

export function isPromptSnoozed(): boolean {
  const raw = readStorage(SNOOZE_STORAGE_KEY)
  if (!raw) return false
  const until = Number(raw)
  return Number.isFinite(until) && Date.now() < until
}

export function snoozeNotificationPrompt(days = 7): void {
  writeStorage(SNOOZE_STORAGE_KEY, String(Date.now() + days * 86_400_000))
}

/** Sinkronkan status browser ke preferensi aplikasi (tanpa API call). */
export function syncNotificationPreferenceWithBrowser(): NotificationPreference {
  if (!isNotificationSupported()) {
    if (getNotificationPreference() === null) setNotificationPreference('disabled')
    return getNotificationPreference()
  }

  if (Notification.permission === 'denied' && getNotificationPreference() === null) {
    setNotificationPreference('disabled')
  }

  return getNotificationPreference()
}

export function shouldShowNotificationPrompt(): boolean {
  if (!isNotificationSupported()) return false
  if (syncNotificationPreferenceWithBrowser() !== null) return false
  if (Notification.permission === 'denied') return false
  if (isPromptSnoozed()) return false
  return true
}

export function canSendBrowserNotifications(): boolean {
  if (!isNotificationSupported()) return false
  if (getNotificationPreference() !== 'enabled') return false
  return Notification.permission === 'granted'
}

export async function enableBrowserNotifications(): Promise<{
  preference: NotificationPreference
  permission: NotificationPermission | 'unsupported'
}> {
  if (!isNotificationSupported()) {
    setNotificationPreference('disabled')
    return { preference: 'disabled', permission: 'unsupported' }
  }

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }

  if (permission === 'granted') {
    setNotificationPreference('enabled')
    return { preference: 'enabled', permission }
  }

  setNotificationPreference('disabled')
  return { preference: 'disabled', permission }
}

export function declineBrowserNotifications(): void {
  setNotificationPreference('disabled')
}

export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!canSendBrowserNotifications()) return null
  try {
    return new Notification(title, {
      icon: '/img/favicon/favicon.ico',
      badge: '/img/favicon/favicon.ico',
      ...options,
    })
  } catch {
    return null
  }
}
