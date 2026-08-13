<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="mb-1">Notifikasi Penting</h5>
          <p class="mb-0 card-subtitle text-muted">
            <span v-if="store.loading">Memuat...</span>
            <span v-else-if="store.unreadCount > 0">
              {{ store.unreadCount }} belum dibaca
            </span>
            <span v-else>Approval &amp; status dokumen</span>
          </p>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          :disabled="store.loading"
          @click="refresh"
        >
          <i class="ri-refresh-line"></i>
        </button>
      </div>
    </div>

    <div class="card-body">
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
        <i class="ri-notification-off-line ri-32px text-muted mb-2 d-block"></i>
        <p class="text-muted mb-0 small">Tidak ada notifikasi penting yang belum dibaca</p>
      </div>

      <div v-else class="important-notifications-list">
        <button
          v-for="item in store.items"
          :key="item.recipientId"
          type="button"
          class="important-notification-item w-100 text-start"
          :class="`important-notification-item--${getEventVariant(item.event)}`"
          @click="handleItemClick(item)"
        >
          <div class="d-flex align-items-start gap-3">
            <div class="avatar avatar-sm flex-shrink-0">
              <span
                class="avatar-initial rounded"
                :class="`bg-label-${getEventVariant(item.event)}`"
              >
                <i :class="getEventIcon(item.event)"></i>
              </span>
            </div>

            <div class="flex-grow-1 min-w-0">
              <p class="mb-1 small important-notification-text">
                <span class="fw-semibold">{{ item.createdByName }}</span>
                {{ ' ' }}
                <span>{{ getEventLabel(item.event) }}</span>
                {{ ' ' }}
                <span class="fw-semibold">{{ item.title }}</span>
              </p>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span
                  class="badge rounded-pill"
                  :class="`bg-label-${getEventVariant(item.event)}`"
                >
                  {{ getEventHint(item.event) }}
                </span>
                <small class="text-muted">
                  {{ formatTimeAgo(item.createdAt) }} • {{ item.categoryLabel }}
                </small>
              </div>
            </div>

            <span class="important-notification-dot flex-shrink-0" aria-label="Belum dibaca"></span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardImportantNotificationsStore } from '~/stores/dashboard-important-notifications'
import {
  formatNotificationTimeAgo,
  getNotificationEventHint,
  getNotificationEventIcon,
  getNotificationEventLabel,
  getNotificationEventVariant,
  getNotificationNavigationPath,
  type NotificationFeedItem,
} from '~/utils/notificationFeed'

const store = useDashboardImportantNotificationsStore()
const router = useRouter()

const getEventLabel = getNotificationEventLabel
const getEventHint = getNotificationEventHint
const getEventIcon = getNotificationEventIcon
const getEventVariant = getNotificationEventVariant
const formatTimeAgo = formatNotificationTimeAgo

const refresh = async () => {
  await store.fetchNotifications()
}

const handleItemClick = async (item: NotificationFeedItem) => {
  try {
    await store.markAsRead(item.recipientId)
  } catch {
    /* navigasi tetap dilanjutkan */
  }

  const path = getNotificationNavigationPath(item)
  if (path) {
    await router.push(path)
  }
}

onMounted(async () => {
  await refresh()
})
</script>

<style scoped>
.important-notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.important-notification-item {
  border: 1px solid rgba(67, 89, 113, 0.12);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.important-notification-item:hover {
  background-color: rgba(0, 143, 236, 0.04);
  border-color: rgba(0, 143, 236, 0.2);
}

.important-notification-item--warning {
  border-left: 3px solid #ffba2f;
}

.important-notification-item--success {
  border-left: 3px solid #00ac4f;
}

.important-notification-item--danger {
  border-left: 3px solid #f13636;
}

.important-notification-item--info {
  border-left: 3px solid #008fec;
}

.important-notification-text {
  color: #566a7f;
  line-height: 1.45;
}

.important-notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #008fec;
  margin-top: 0.35rem;
}
</style>
