<template>
  <li class="nav-item dropdown-notifications navbar-dropdown dropdown me-4 me-xl-1" ref="rootRef">
    <a
      class="nav-link dropdown-toggle hide-arrow"
      href="javascript:void(0);"
      aria-label="Notifikasi"
      @click.prevent="toggleDropdown"
    >
      <i class="icon-base ri ri-notification-2-line icon-22px"></i>
      <span
        v-if="feedStore.unreadCount > 0"
        class="position-absolute top-0 start-50 translate-middle-y badge badge-dot bg-danger mt-2 border"
      ></span>
      <span
        v-if="feedStore.unreadCount > 0"
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge-count"
      >
        {{ feedStore.unreadCount > 99 ? '99+' : feedStore.unreadCount }}
      </span>
    </a>

    <ul
      class="dropdown-menu dropdown-menu-end dropdown-menu-animate-up py-0 mt-3 notification-dropdown-panel"
      :class="{ show: isOpen }"
    >
      <li class="notification-dropdown-header border-bottom">
        <div class="d-flex align-items-center justify-content-between px-4 py-3">
          <h6 class="mb-0 fw-semibold">Notifikasi</h6>
          <button
            type="button"
            class="btn btn-link btn-sm p-2 text-heading notification-mark-all"
            aria-label="Tandai semua dibaca"
            title="Tandai semua dibaca"
            :disabled="feedStore.loading || feedStore.unreadCount === 0"
            @click="markAllAsRead"
          >
            <i class="icon-base ri ri-mail-open-line"></i>
          </button>
        </div>

        <div class="notification-tabs px-4 pb-0">
          <div class="d-flex align-items-center notification-tabs-row">
            <template v-for="(tab, index) in tabs" :key="tab.key">
              <span v-if="index > 0" class="notification-tab-separator" aria-hidden="true">|</span>
              <button
                type="button"
                class="notification-tab-btn"
                :class="{ active: feedStore.activeTab === tab.key }"
                @click="switchTab(tab.key)"
              >
                <span>{{ tab.label }}</span>
                <span v-if="tab.count > 0" class="notification-tab-badge">{{ tab.count }}</span>
              </button>
            </template>
          </div>
        </div>
      </li>

      <li class="dropdown-notifications-list">
        <div ref="scrollRef" class="notification-scroll-area" @scroll="onScroll">
          <div v-if="feedStore.loading" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
            <div class="small text-muted mt-2">Memuat notifikasi...</div>
          </div>

          <div v-else-if="feedStore.error" class="text-center py-4 px-3">
            <p class="text-danger small mb-2">{{ feedStore.error }}</p>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="reload">
              Coba lagi
            </button>
          </div>

          <div v-else-if="feedStore.isEmpty" class="text-center py-5 px-3">
            <i class="ri-notification-off-line ri-32px text-muted mb-2 d-block"></i>
            <p class="text-muted mb-0 small">Tidak ada notifikasi</p>
          </div>

          <ul v-else class="list-group list-group-flush">
            <li
              v-for="item in feedStore.items"
              :key="item.recipientId"
              class="list-group-item list-group-item-action notification-item py-3 px-4"
              :class="{ 'notification-item--unread': !item.isRead }"
              @click="handleItemClick(item)"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="notification-avatar flex-shrink-0" aria-hidden="true">
                  <span class="notification-avatar-badge">
                    <i :class="getIcon(item.type)"></i>
                  </span>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <p class="mb-1 small notification-item-text">
                    <span class="fw-semibold">{{ item.createdByName }}</span>
                    {{ ' ' }}
                    <span>{{ getEventLabel(item.event) }}</span>
                    {{ ' ' }}
                    <span class="fw-semibold">{{ item.title }}</span>
                  </p>
                  <p class="mb-0 text-muted notification-item-meta">
                    {{ formatTimeAgo(item.createdAt) }} • {{ item.categoryLabel }}
                  </p>
                </div>
                <div v-if="!item.isRead" class="flex-shrink-0">
                  <span class="notification-unread-dot" aria-label="Belum dibaca"></span>
                </div>
              </div>
            </li>
          </ul>

          <div
            v-if="feedStore.hasMore && !feedStore.loading && feedStore.items.length > 0"
            ref="sentinelRef"
            class="notification-scroll-sentinel"
            aria-hidden="true"
          ></div>

          <div v-if="feedStore.loadingMore" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          </div>
          <div
            v-else-if="!feedStore.hasMore && feedStore.items.length > 0"
            class="text-center py-3 text-muted small"
          >
            Semua notifikasi telah dimuat
          </div>
        </div>
      </li>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotificationFeedStore } from '~/stores/notificationFeed'
import {
  formatNotificationTimeAgo,
  getNotificationEventLabel,
  getNotificationNavigationPath,
  type NotificationFeedItem,
  type NotificationTab,
} from '~/utils/notificationFeed'

const feedStore = useNotificationFeedStore()
const { counts } = storeToRefs(feedStore)
const router = useRouter()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const tabs = computed(() => [
  { key: 'inbox' as NotificationTab, label: 'Inbox', count: counts.value.inbox },
  { key: 'general' as NotificationTab, label: 'Umum', count: counts.value.general },
  { key: 'archived' as NotificationTab, label: 'Arsip', count: counts.value.archived },
])

function getEventLabel(event: string) {
  return getNotificationEventLabel(event)
}

function formatTimeAgo(date: string) {
  return formatNotificationTimeAgo(date)
}

function getIcon(type: string) {
  const map: Record<string, string> = {
    quotation: 'ri-file-text-line',
    fdr: 'ri-file-list-3-line',
    price_adjustment: 'ri-price-tag-3-line',
    purchase_order: 'ri-shopping-bag-4-line',
    sales_order: 'ri-file-list-3-line',
    site_investment: 'ri-building-2-line',
    arf: 'ri-file-edit-line',
    purchase_request: 'ri-shopping-cart-line',
    payment_request: 'ri-hand-coin-line',
    pks: 'ri-file-paper-2-line',
    subscription: 'ri-repeat-line',
  }
  return map[type] || 'ri-notification-3-line'
}

async function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await feedStore.openDropdown()
    await nextTick()
    setupInfiniteScrollObserver()
  } else {
    observer?.disconnect()
  }
}

async function switchTab(tab: NotificationTab) {
  await feedStore.switchTab(tab)
  if (scrollRef.value) scrollRef.value.scrollTop = 0
}

function onScroll(event: Event) {
  feedStore.handleScroll(event)
}

function setupInfiniteScrollObserver() {
  observer?.disconnect()
  if (!sentinelRef.value || !scrollRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting) {
        void feedStore.loadMore()
      }
    },
    {
      root: scrollRef.value,
      rootMargin: '48px',
      threshold: 0,
    }
  )

  observer.observe(sentinelRef.value)
}

async function reload() {
  await feedStore.openDropdown()
}

async function markAllAsRead() {
  try {
    await feedStore.markAllAsRead()
    const toast = useToast()
    toast?.success?.({
      title: 'Berhasil',
      message: 'Semua notifikasi ditandai dibaca',
      color: 'green',
      position: 'bottomRight',
    })
  } catch {
    const toast = useToast()
    toast?.error?.({
      title: 'Error',
      message: 'Gagal menandai semua notifikasi',
      color: 'red',
      position: 'bottomRight',
    })
  }
}

async function handleItemClick(item: NotificationFeedItem) {
  if (!item.isRead) {
    try {
      await feedStore.markAsRead(item.recipientId)
    } catch {
      /* ignore */
    }
  }

  const path = getNotificationNavigationPath(item)
  isOpen.value = false
  if (path) await router.push(path)
}

function handleClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

watch(
  () => [feedStore.items.length, feedStore.hasMore, feedStore.loading, isOpen.value],
  async () => {
    if (!isOpen.value) return
    await nextTick()
    setupInfiniteScrollObserver()
  }
)

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await feedStore.fetchCountsOnly()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  observer?.disconnect()
})
</script>

<style scoped>
.notification-dropdown-panel {
  width: min(420px, calc(100vw - 1.5rem));
  max-height: min(560px, calc(100vh - 5rem));
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(67, 89, 113, 0.12);
  box-shadow: 0 12px 40px rgba(67, 89, 113, 0.18);
}

.notification-badge-count {
  font-size: 10px;
  min-width: 18px;
  padding: 0.2rem 0.35rem;
}

.notification-tabs {
  border-bottom: 1px solid rgba(67, 89, 113, 0.12);
}

.notification-tabs-row {
  flex-wrap: wrap;
}

.notification-tab-separator {
  color: rgba(67, 89, 113, 0.35);
  padding: 0 1.25rem 0.85rem;
  font-size: 0.875rem;
  line-height: 1;
  user-select: none;
}

.notification-tab-btn {
  border: 0;
  background: transparent;
  padding: 0 0.5rem 0.85rem;
  color: #697a8d;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  position: relative;
}

.notification-tab-btn.active {
  color: var(--bs-primary, #008fec);
  font-weight: 600;
}

.notification-tab-btn.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--bs-primary, #008fec);
  border-radius: 999px;
}

.notification-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: #eef0f4;
  color: #566a7f;
  font-size: 0.6875rem;
  font-weight: 600;
}

.notification-tab-btn.active .notification-tab-badge {
  background: var(--bs-primary, #008fec);
  color: #fff;
}

.notification-scroll-area {
  max-height: 420px;
  overflow-y: auto;
}

.notification-item {
  border-left: 0;
  border-right: 0;
  cursor: pointer;
}

.notification-item--unread {
  background: rgba(0, 143, 236, 0.04);
}

.notification-avatar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: rgba(0, 143, 236, 0.12);
  color: var(--bs-primary, #008fec);
  flex-shrink: 0;
}

.notification-avatar-badge i {
  font-size: 1.125rem;
  line-height: 1;
}

.notification-item-text {
  line-height: 1.45;
  color: #566a7f;
}

.notification-item-meta {
  font-size: 0.75rem;
}

.notification-unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #008fec;
}

.notification-mark-all {
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.notification-mark-all:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.06);
}

.notification-mark-all:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.notification-mark-all i {
  font-size: 1.25rem;
  transition: color 0.2s ease;
}

.notification-mark-all:hover:not(:disabled) i {
  color: var(--bs-primary, #008fec) !important;
}

.notification-scroll-sentinel {
  height: 1px;
}
</style>

<style>
.navbar-nav .dropdown-notifications .notification-dropdown-panel.dropdown-menu {
  inset: 100% 0 auto auto !important;
  transform: none !important;
}

.dropdown-notifications .dropdown-notifications-list {
  max-height: none;
}
</style>
