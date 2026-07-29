<template>
  <div class="card activity-feed-card">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="mb-1">Activity Feed</h5>
          <p class="mb-0 card-subtitle text-muted">
            <span v-if="store.loading">Memuat...</span>
            <span v-else-if="store.items.length > 0">
              {{ store.items.length }} aktivitas terbaru
            </span>
            <span v-else>Log aktivitas CRUD &amp; approval semua user</span>
          </p>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="store.loading"
          @click="refresh"
        >
          <i class="ri-refresh-line"></i>
        </button>
      </div>
    </div>

    <div class="card-body pt-0">
      <div v-if="store.loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="store.error" class="text-center py-4">
        <p class="text-danger small mb-2">{{ store.error }}</p>
        <button type="button" class="btn btn-sm btn-primary" @click="refresh">Coba Lagi</button>
      </div>

      <div v-else-if="store.isEmpty" class="text-center py-4">
        <i class="ri-history-line ri-32px text-muted mb-2 d-block"></i>
        <p class="text-muted mb-0 small">Belum ada aktivitas tercatat</p>
      </div>

      <div v-else class="activity-feed-list">
        <div
          v-for="item in store.items"
          :key="item.id"
          class="activity-feed-item"
          :class="`activity-feed-item--${parseAction(item.action).variant}`"
        >
          <div class="d-flex align-items-start gap-3">
            <div class="avatar avatar-sm flex-shrink-0">
              <span
                class="avatar-initial rounded"
                :class="`bg-label-${parseAction(item.action).variant}`"
              >
                <i :class="parseAction(item.action).icon"></i>
              </span>
            </div>

            <div class="flex-grow-1 min-w-0">
              <p class="mb-1 small activity-feed-text">
                <span class="fw-semibold">{{ getUserName(item) }}</span>
                {{ ' ' }}
                <span>{{ parseAction(item.action).verbLabel }}</span>
                {{ ' ' }}
                <span class="fw-semibold">{{ formatEntity(parseAction(item.action).entity) }}</span>
              </p>

              <p v-if="item.description" class="mb-2 small text-muted activity-feed-description">
                {{ item.description }}
              </p>

              <div class="d-flex flex-wrap align-items-center gap-2">
                <span
                  class="badge rounded-pill"
                  :class="`bg-label-${parseAction(item.action).variant}`"
                >
                  {{ parseAction(item.action).badgeLabel }}
                </span>
                <small class="text-muted">
                  {{ formatTimeAgo(item.createdAt) }}
                  <template v-if="item.device"> • {{ item.device }}</template>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDashboardActivityFeedStore } from '~/stores/dashboard-activity-feed'
import {
  formatActivityEntity,
  formatActivityTimeAgo,
  getActivityUserName,
  parseActivityAction,
  type ActivityFeedItem,
} from '~/utils/activityFeed'

const store = useDashboardActivityFeedStore()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const parseAction = parseActivityAction
const formatEntity = formatActivityEntity
const formatTimeAgo = formatActivityTimeAgo
const getUserName = getActivityUserName

const refresh = async () => {
  await store.fetchFeed()
}

onMounted(async () => {
  await refresh()
  refreshTimer = setInterval(refresh, 60000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.activity-feed-card {
  height: auto;
}

.activity-feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 28rem;
  overflow-y: auto;
  padding-top: 0.25rem;
}

.activity-feed-item {
  border: 1px solid rgba(67, 89, 113, 0.12);
  border-radius: 0.5rem;
  padding: 0.875rem;
  background: rgba(67, 89, 113, 0.02);
}

.activity-feed-item--success {
  border-left: 3px solid #71dd37;
}

.activity-feed-item--warning {
  border-left: 3px solid #ffab00;
}

.activity-feed-item--danger {
  border-left: 3px solid #ff3e1d;
}

.activity-feed-item--secondary {
  border-left: 3px solid #8592a3;
}

.activity-feed-text {
  color: #566a7f;
  line-height: 1.45;
}

.activity-feed-description {
  line-height: 1.4;
  word-break: break-word;
}
</style>
