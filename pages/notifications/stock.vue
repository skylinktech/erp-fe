<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="ri-notification-2-line me-2"></i>
              Notifikasi Stock
            </h5>
            <div class="d-flex gap-2">
              <button 
                class="btn btn-outline-primary btn-sm"
                @click="refreshNotifications"
                :disabled="notificationsStore.loading"
              >
                <i class="ri-refresh-line me-1"></i>
                Refresh
              </button>
              <button 
                class="btn btn-outline-success btn-sm"
                @click="markAllAsRead"
                :disabled="notificationsStore.unreadCount === 0"
              >
                <i class="ri-check-double-line me-1"></i>
                Tandai Semua Dibaca
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <!-- Loading State -->
            <div v-if="notificationsStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-muted mt-2">Memuat notifikasi...</p>
            </div>

            <!-- No Notifications -->
            <div v-else-if="notificationsStore.notifications.length === 0" class="text-center py-5">
              <i class="ri-checkbox-circle-line ri-48px text-success mb-3"></i>
              <h6 class="text-muted">Tidak ada notifikasi stock</h6>
              <p class="text-muted">Semua stock sudah di-posting dengan baik</p>
            </div>

            <!-- Notifications List -->
            <div v-else class="row">
              <div class="col-12">
                <div class="list-group">
                  <div 
                    v-for="notification in notificationsStore.notifications" 
                    :key="notification.id"
                    class="list-group-item list-group-item-action"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="d-flex align-items-start">
                      <div class="flex-shrink-0 me-3">
                        <div class="avatar">
                          <span 
                            class="avatar-initial rounded-circle"
                            :class="notification.type === 'stock_in' ? 'bg-label-warning' : 'bg-label-danger'"
                          >
                            <i 
                              class="icon-base"
                              :class="notification.type === 'stock_in' ? 'ri-arrow-down-line' : 'ri-arrow-up-line'"
                            ></i>
                          </span>
                        </div>
                      </div>
                      
                      <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 class="mb-1">
                              {{ notification.type === 'stock_in' ? 'Stock In' : 'Stock Out' }} 
                              <span class="badge bg-label-secondary ms-2">
                                {{ notification.type === 'stock_in' ? notification.noSi : notification.noSo }}
                              </span>
                            </h6>
                            <p class="mb-1 text-muted">
                              <strong>Status:</strong> 
                              <span class="badge bg-label-warning">{{ notification.status }}</span>
                            </p>
                            <p class="mb-1">
                              <strong>Quantity:</strong> {{ notification.quantity }} | 
                              <strong>Warehouse:</strong> {{ notification.warehouseName }}
                            </p>
                            <p class="mb-0 text-muted">
                              <small>
                                <i class="ri-time-line me-1"></i>
                                {{ notificationsStore.formatTimeAgo(notification.createdAt) }} • 
                                <i class="ri-user-line me-1"></i>
                                {{ notification.createdByName }}
                              </small>
                            </p>
                          </div>
                          
                          <div class="flex-shrink-0">
                            <button 
                              class="btn btn-outline-primary btn-sm"
                              @click.stop="goToDetail(notification)"
                            >
                              <i class="ri-eye-line me-1"></i>
                              Lihat Detail
                            </button>
                          </div>
                        </div>
                        
                        <div v-if="notification.description" class="mt-2">
                          <small class="text-muted">
                            <i class="ri-file-text-line me-1"></i>
                            {{ notification.description }}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationsStore } from '~/stores/notifications'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const notificationsStore = useNotificationsStore()
const router = useRouter()

// Set page title
useHead({
  title: 'Notifikasi Stock - ERP System'
})

onMounted(async () => {
  // Load notifications when component mounts
  await notificationsStore.fetchNotifications()
})

const refreshNotifications = async () => {
  await notificationsStore.fetchNotifications()
}

const markAllAsRead = async () => {
  await notificationsStore.markAllAsRead()
}

const handleNotificationClick = (notification) => {
  goToDetail(notification)
}

const goToDetail = (notification) => {
  if (notification.type === 'stock_in') {
    router.push('/inventory/stock-in')
  } else if (notification.type === 'stock_out') {
    router.push('/inventory/stock-out')
  }
}
</script>

<style scoped>
.list-group-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar-initial {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.bg-label-warning {
  background-color: rgba(255, 193, 7, 0.1) !important;
  color: #ffc107 !important;
}

.bg-label-danger {
  background-color: rgba(220, 53, 69, 0.1) !important;
  color: #dc3545 !important;
}

.bg-label-secondary {
  background-color: rgba(108, 117, 125, 0.1) !important;
  color: #6c757d !important;
}
</style>
