import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

export type UserSession = {
  id: number
  userId: number
  sessionId: string
  ipAddress: string
  userAgent: string
  deviceType: string
  isActive: boolean
  lastActivity: string
  loginAt: string
  logoutAt: string | null
  user: {
    id: number
    email: string
    fullName: string
  }
}

export type ActiveUsersMeta = {
  total: number
  byDevice: {
    desktop: number
    mobile: number
    tablet: number
  }
}

/**
 * Dedup 1 session terbaru per user di FE — safety net saja.
 * Backend `getActiveUsers` sudah mengembalikan 1 baris/user; helper ini
 * menjaga widget tetap benar kalau ada sumber SSO yang masih mengirim
 * duplikat.
 */
function getLatestSessionPerUser(sessions: UserSession[]): UserSession[] {
  const userSessionMap = new Map<number, UserSession>()

  for (const session of sessions) {
    const existing = userSessionMap.get(session.userId)
    if (
      !existing ||
      new Date(session.lastActivity).getTime() > new Date(existing.lastActivity).getTime()
    ) {
      userSessionMap.set(session.userId, session)
    }
  }

  return Array.from(userSessionMap.values()).sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  )
}

function emptyMeta(): ActiveUsersMeta {
  return { total: 0, byDevice: { desktop: 0, mobile: 0, tablet: 0 } }
}

function summarizeLocally(sessions: UserSession[]): ActiveUsersMeta {
  const latest = getLatestSessionPerUser(sessions)
  const byDevice = { desktop: 0, mobile: 0, tablet: 0 }

  for (const session of latest) {
    const key = session.deviceType as keyof typeof byDevice
    if (key in byDevice) byDevice[key] += 1
  }

  return { total: latest.length, byDevice }
}

export const useUserSessionStore = defineStore('userSession', {
  state: () => ({
    activeUsers: [] as UserSession[],
    /** Ringkasan dari backend (lebih akurat & tidak perlu recompute di tiap getter). */
    meta: emptyMeta() as ActiveUsersMeta,
    loading: false,
    error: null as string | null,
    displayedCount: 3,
  }),

  getters: {
    uniqueActiveUsers(state): UserSession[] {
      return getLatestSessionPerUser(state.activeUsers)
    },

    totalActiveUsers(): number {
      return this.meta.total > 0 || this.activeUsers.length === 0
        ? this.meta.total
        : this.uniqueActiveUsers.length
    },

    activeUsersByDevice(): ActiveUsersMeta['byDevice'] {
      if (this.meta.total > 0 || this.activeUsers.length === 0) {
        return this.meta.byDevice
      }
      return summarizeLocally(this.activeUsers).byDevice
    },

    recentActiveUsers(): UserSession[] {
      return this.uniqueActiveUsers.slice(0, this.displayedCount)
    },

    hasMoreUsers(): boolean {
      return this.uniqueActiveUsers.length > this.displayedCount
    },

    isFullyExpanded(): boolean {
      return this.displayedCount >= this.uniqueActiveUsers.length
    },
  },

  actions: {
    loadMoreUsers() {
      this.displayedCount += 3
    },

    showLessUsers() {
      this.displayedCount = 3
    },

    resetPagination() {
      this.displayedCount = 3
    },

    /**
     * Shared fetch — kalau Online Users & Total User Login mount bersamaan,
     * hanya 1 HTTP request yang jalan (in-flight promise di-reuse).
     */
    async fetchActiveUsers() {
      if (inFlightFetch) return inFlightFetch

      this.loading = true
      this.error = null

      inFlightFetch = (async () => {
        try {
          const { $api } = useNuxtApp()
          const response = await apiFetch<{
            success: boolean
            data: UserSession[]
            meta?: ActiveUsersMeta
          }>($api.userSessionsActiveUsers(), {
            credentials: 'include',
            skip403Redirect: true,
          })

          if (!response.success) {
            this.error = 'Response tidak berhasil'
            return
          }

          this.activeUsers = response.data || []
          this.meta = response.meta ?? summarizeLocally(this.activeUsers)
          this.resetPagination()
        } catch (error: any) {
          this.error = error.message || 'Gagal mengambil data user aktif'
        } finally {
          this.loading = false
          inFlightFetch = null
        }
      })()

      return inFlightFetch
    },

    async forceLogoutUser(sessionId: string) {
      const { $api } = useNuxtApp()
      await apiFetch($api.userSessionsForceLogout(sessionId), {
        method: 'POST',
        credentials: 'include',
        skip403Redirect: true,
      })
      await this.fetchActiveUsers()
    },

    async cleanupExpiredSessions() {
      const { $api } = useNuxtApp()
      await apiFetch($api.userSessionsCleanupExpired(), {
        method: 'POST',
        credentials: 'include',
        skip403Redirect: true,
      })
      await this.fetchActiveUsers()
    },
  },
})

/** Module-level in-flight guard — survive across multiple component mounts. */
let inFlightFetch: Promise<void> | null = null
