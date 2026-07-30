<template>
  <div class="card h-100">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div class="avatar">
          <div class="avatar-initial bg-label-success rounded-3">
            <i class="ri-user-line ri-24px"></i>
          </div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          :disabled="store.loading"
          title="Refresh"
          @click="refresh"
        >
          <i class="ri-refresh-line"></i>
        </button>
      </div>

      <div v-if="store.loading && store.activeUsers.length === 0" class="card-info mt-5 text-center">
        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      </div>

      <div v-else-if="store.error && store.activeUsers.length === 0" class="card-info mt-4">
        <p class="text-danger small mb-2">{{ store.error }}</p>
        <button type="button" class="btn btn-sm btn-primary" @click="refresh">Coba Lagi</button>
      </div>

      <div v-else class="card-info mt-5">
        <h5 class="mb-1">{{ store.totalActiveUsers }}</h5>
        <p class="mb-1">Total User Login</p>
        <p class="mb-0 small text-muted">
          Desktop: {{ store.activeUsersByDevice.desktop }} |
          Mobile: {{ store.activeUsersByDevice.mobile }} |
          Tablet: {{ store.activeUsersByDevice.tablet }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUserSessionStore } from '~/stores/user-session'

/**
 * Summary widget — reuse store yang sama dengan OnlineUsersCard.
 * Kalau Online Users sudah fetch lebih dulu, widget ini tidak memicu
 * request kedua (shared Pinia state).
 */
const store = useUserSessionStore()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const refresh = async () => {
  await store.fetchActiveUsers()
}

onMounted(async () => {
  if (store.activeUsers.length === 0) await refresh()
  refreshTimer = setInterval(refresh, 60_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
