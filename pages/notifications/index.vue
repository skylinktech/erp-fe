<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="ri-notification-2-line me-2"></i>
              Semua Notifikasi
            </h5>
            <div class="d-flex gap-2">
              <button 
                v-if="notificationsStore.unreadCount > 0"
                @click="markAllAsRead" 
                class="btn btn-outline-dark btn-sm"
                :disabled="loading"
              >
                <i class="ri-mail-open-line me-1"></i>
                Tandai Semua Dibaca
              </button>
              <button 
                @click="refreshNotifications" 
                class="btn btn-outline-dark btn-sm"
                :disabled="loading"
              >
                <i class="ri-refresh-line me-1" :class="{ 'ri-loader-4-line animate-spin': loading }"></i>
                Refresh
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-dark" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-muted mt-2">Memuat notifikasi...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger" role="alert">
              <i class="ri-error-warning-line me-2"></i>
              {{ error }}
              <button @click="refreshNotifications" class="btn btn-sm btn-outline-danger ms-2">
                Coba Lagi
              </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="notificationsStore.notifications.length === 0" class="text-center py-5">
              <i class="ri-checkbox-circle-line ri-48px text-success mb-3"></i>
              <h6 class="text-muted">Tidak ada notifikasi stock</h6>
              <p class="text-muted mb-0">Semua stock sudah di-posting</p>
            </div>

            <!-- Notifications List -->
            <div v-else class="list-group list-group-flush">
              <div 
                v-for="notification in notificationsStore.notifications" 
                :key="notification.id"
                class="list-group-item list-group-item-action py-3 px-3"
                :class="{ 'bg-white': !notificationsStore.readNotifications.has(notification.id) }"
                @click="handleNotificationClick(notification)"
                style="cursor: pointer;"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-2">
                      <span 
                        class="badge me-2"
                        :class="getTypeBadgeClass(notification.type)"
                      >
                        {{ getTypeText(notification.type) }}
                      </span>
                      <span
                        :class="'badge ' + getStatusBadgeClass(notification.status)"
                      >
                        {{ getStatusText(notification.status) }}
                      </span>
                      <span 
                        v-if="!notificationsStore.readNotifications.has(notification.id)"
                        class="badge bg-dark ms-2"
                      >
                        Baru
                      </span>
                    </div>
                    
                    <h6 class="mb-1">
                      {{ getNotificationTitle(notification) }}
                    </h6>
                    
                    <div class="text-muted small">
                      <div class="d-flex flex-wrap gap-3">
                        <span>
                          <i class="ri-calendar-line me-1"></i>
                          {{ formatDate(notification.createdAt) }}
                        </span>
                        <span>
                          <i class="ri-user-line me-1"></i>
                          {{ notification.createdByName || 'Unknown' }}
                        </span>
                        <span v-if="notification.type === 'stock_in' || notification.type === 'stock_out'">
                          <i class="ri-building-line me-1"></i>
                          {{ notification.warehouseName || 'Unknown Warehouse' }}
                        </span>
                        <span v-else-if="notification.type === 'purchase_order'">
                          <i class="ri-store-2-line me-1"></i>
                          {{ notification.vendorName || 'Unknown Vendor' }}
                        </span>
                        <span v-else-if="notification.type === 'sales_order'">
                          <i class="ri-user-line me-1"></i>
                          {{ notification.customerName || 'Unknown Customer' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex-shrink-0">
                    <button 
                      v-if="!notificationsStore.readNotifications.has(notification.id)"
                      @click.stop="markAsRead(notification.id)"
                      class="btn btn-sm btn-outline-dark"
                      title="Tandai sebagai dibaca"
                    >
                      <i class="ri-check-line"></i>
                    </button>
                    <i 
                      v-else
                      class="ri-check-line text-success"
                      title="Sudah dibaca"
                    ></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- View All Button -->
            <div v-if="notificationsStore.notifications.length > 0" class="text-center mt-3">
              <button 
                @click="viewAllNotifications" 
                class="btn btn-outline-dark"
              >
                <i class="ri-eye-line me-1"></i>
                Lihat Semua Notifikasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'

// Meta
definePageMeta({
  title: 'Notifikasi Stock',
  layout: 'default'
})

// Store
const notificationsStore = useNotificationsStore()

// Reactive data
const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const { notifications, unreadCount } = storeToRefs(notificationsStore)

// Methods
const refreshNotifications = async () => {
  loading.value = true
  error.value = null
  
  try {
    await notificationsStore.fetchNotifications()
  } catch (err) {
    error.value = 'Gagal memuat notifikasi'
    console.error('Error refreshing notifications:', err)
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notificationId: string) => {
  try {
    await notificationsStore.markAsRead(notificationId)
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllAsRead()
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
  }
}

const handleNotificationClick = (notification: any) => {
  // Mark as read when clicked
  if (!notificationsStore.readNotifications.has(notification.id)) {
    markAsRead(notification.id)
  }
  
  // Navigate to appropriate page
  switch (notification.type) {
    case 'stock_in':
      navigateTo('/inventory/stock-in')
      break
    case 'stock_out':
      navigateTo('/inventory/stock-out')
      break
    case 'purchase_order':
      navigateTo('/purchasing/purchase-order')
      break
    case 'sales_order':
      navigateTo('/sales/sales-order')
      break
  }
}

const viewAllNotifications = () => {
  // This could navigate to a more comprehensive notifications page
  // For now, just refresh to show all
  refreshNotifications()
}

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'stock_in':
      return 'bg-info'
    case 'stock_out':
      return 'bg-warning'
    case 'purchase_order':
      return 'bg-primary'
    case 'sales_order':
      return 'bg-success'
    default:
      return 'bg-secondary'
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case 'stock_in':
      return 'Stock In'
    case 'stock_out':
      return 'Stock Out'
    case 'purchase_order':
      return 'Purchase Order'
    case 'sales_order':
      return 'Sales Order'
    default:
      return 'Unknown'
  }
}

const getNotificationTitle = (notification: any) => {
  switch (notification.type) {
    case 'stock_in':
      return `Stock In untuk ${notification.noSi} dengan quantity ${notification.quantity} belum di posting`
    case 'stock_out':
      return `Stock Out untuk ${notification.noSo} dengan quantity ${notification.quantity} belum di posting`
    case 'purchase_order':
      return `Purchase Order ${notification.noPo} memerlukan approval`
    case 'sales_order':
      return `Sales Order ${notification.noSo} memerlukan approval`
    default:
      return 'Notifikasi'
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'posted':
      return 'bg-success'
    case 'pending':
      return 'bg-warning'
    case 'draft':
      return 'bg-info'
    default:
      return 'bg-danger'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'posted':
      return 'Posted'
    case 'pending':
      return 'Pending'
    case 'draft':
      return 'Draft'
    default:
      return 'Not Posted'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await refreshNotifications()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.list-group-item:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

.bg-light {
  background-color: rgba(13, 110, 253, 0.1) !important;
}
</style>
