<template>
  <div class="card activity-feed-card h-100">
    <div class="card-header flex-shrink-0">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="mb-1">Activity Feed</h5>
          <p class="mb-0 card-subtitle text-muted">
            <span v-if="store.loading && store.items.length === 0">Memuat...</span>
            <span v-else-if="store.items.length > 0">
              {{ store.items.length }} aktivitas dimuat
              <template v-if="store.hasMore"> · scroll untuk lainnya</template>
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

    <div class="card-body pt-0 activity-feed-body">
      <div v-if="store.loading && store.items.length === 0" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="store.error && store.items.length === 0" class="text-center py-4">
        <p class="text-danger small mb-2">{{ store.error }}</p>
        <button type="button" class="btn btn-sm btn-primary" @click="refresh">Coba Lagi</button>
      </div>

      <div v-else-if="store.isEmpty" class="text-center py-4">
        <i class="ri-history-line ri-32px text-muted mb-2 d-block"></i>
        <p class="text-muted mb-0 small">Belum ada aktivitas tercatat</p>
      </div>

      <div
        v-else
        class="activity-feed-list"
        @scroll.passive="store.handleScroll"
      >
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

        <div v-if="store.loadingMore" class="text-center py-2">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <p v-else-if="!store.hasMore && store.items.length > 0" class="text-center text-muted small mb-0 py-2">
          Semua aktivitas sudah ditampilkan
        </p>
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.activity-feed-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.activity-feed-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  overscroll-behavior: contain;
}

.activity-feed-item {
  border: 1px solid rgba(67, 89, 113, 0.12);
  border-radius: 0.5rem;
  padding: 0.875rem;
  background: rgba(67, 89, 113, 0.02);
  flex-shrink: 0;
}

.activity-feed-item--success {
  border-left: 3px solid #00ac4f;
}

.activity-feed-item--warning {
  border-left: 3px solid #ffba2f;
}

.activity-feed-item--danger {
  border-left: 3px solid #f13636;
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
