<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="mb-1">Online User</h5>
          <p class="mb-0 card-subtitle text-muted">
            <span v-if="store.loading && store.activeUsers.length === 0">Memuat...</span>
            <span v-else>{{ store.totalActiveUsers }} user sedang online</span>
          </p>
        </div>
        <div class="dropdown">
          <button
            class="btn btn-text-secondary rounded-pill text-muted border-0 p-1"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="ri-more-2-line ri-20px"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end">
            <button type="button" class="dropdown-item" @click="refresh">Refresh</button>
            <button
              v-if="canManageSessions"
              type="button"
              class="dropdown-item"
              @click="cleanupExpired"
            >
              Cleanup Expired
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-body pt-0 online-users-body">
      <div v-if="store.loading && store.activeUsers.length === 0" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="store.error && store.activeUsers.length === 0" class="text-center py-4">
        <p class="text-danger small mb-2">{{ store.error }}</p>
        <button type="button" class="btn btn-sm btn-primary" @click="refresh">Coba Lagi</button>
      </div>

      <div v-else-if="store.recentActiveUsers.length === 0" class="text-center py-4">
        <i class="ri-user-unfollow-line ri-32px text-muted mb-2 d-block"></i>
        <p class="text-muted mb-0 small">Tidak ada user yang sedang online</p>
      </div>

      <div v-else class="online-users-list">
        <div
          v-for="session in store.recentActiveUsers"
          :key="session.sessionId"
          class="d-flex align-items-center mb-3 p-2 border rounded"
        >
          <div class="avatar avatar-sm me-3">
            <div class="avatar-initial bg-label-primary rounded">
              <i class="ri-user-line"></i>
            </div>
          </div>
          <div class="flex-grow-1 min-w-0">
            <h6 class="mb-0 small text-truncate">{{ session.user.fullName }}</h6>
            <p class="mb-0 text-muted small text-truncate">{{ session.user.email }}</p>
            <div class="d-flex align-items-center mt-1 flex-wrap gap-1">
              <span class="badge bg-label-secondary">{{ session.deviceType }}</span>
              <small class="text-muted">{{ formatTimeAgo(session.lastActivity) }}</small>
            </div>
          </div>
          <div v-if="canManageSessions" class="ms-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              title="Force Logout"
              @click="forceLogout(session.sessionId)"
            >
              <i class="ri-logout-box-r-line"></i>
            </button>
          </div>
        </div>

        <div v-if="store.hasMoreUsers" class="text-center mt-2">
          <button type="button" class="btn btn-outline-primary btn-sm" @click="store.loadMoreUsers()">
            <i class="ri-add-line me-1"></i>
            Load More ({{ store.totalActiveUsers - store.recentActiveUsers.length }} lagi)
          </button>
        </div>

        <div v-else-if="store.isFullyExpanded && store.totalActiveUsers > 3" class="text-center mt-2">
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="store.showLessUsers()">
            <i class="ri-subtract-line me-1"></i>
            Show Less
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useUserSessionStore } from '~/stores/user-session'
import { usePermissions } from '~/composables/usePermissions'

const store = useUserSessionStore()
const { userHasRole } = usePermissions()
const canManageSessions = computed(() => userHasRole('superadmin'))

let refreshTimer: ReturnType<typeof setInterval> | null = null

const refresh = async () => {
  await store.fetchActiveUsers()
}

const forceLogout = async (sessionId: string) => {
  const toast = useToast()
  try {
    await store.forceLogoutUser(sessionId)
    toast.success({ title: 'Success', message: 'User berhasil di-logout', color: 'green' })
  } catch {
    toast.error({ title: 'Error', message: 'Gagal logout user', color: 'red' })
  }
}

const cleanupExpired = async () => {
  const toast = useToast()
  try {
    await store.cleanupExpiredSessions()
    toast.success({ title: 'Success', message: 'Session expired berhasil dibersihkan', color: 'green' })
  } catch {
    toast.error({ title: 'Error', message: 'Gagal membersihkan session expired', color: 'red' })
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Baru saja'
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} hari yang lalu`
}

onMounted(async () => {
  if (store.activeUsers.length === 0) await refresh()
  refreshTimer = setInterval(refresh, 60_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.online-users-body {
  overflow-y: auto;
  max-height: 100%;
}

.online-users-list {
  min-height: 0;
}
</style>
