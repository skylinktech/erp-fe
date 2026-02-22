<template>
  <div class="container-xxl flex-grow-1 container-pt-12">
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
                <i class="ri-refresh-line me-1" ></i>
                Refresh
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3">
              <li class="nav-item">
                <a class="nav-link" :class="{active: activeTab === 'need'}" href="#" @click.prevent="activeTab = 'need'">Perlu Approval</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{active: activeTab === 'approved'}" href="#" @click.prevent="activeTab = 'approved'">Sudah Approved</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{active: activeTab === 'expiring'}" href="#" @click.prevent="activeTab = 'expiring'">Mendekati Expired</a>
                <span v-if="expiringMeta.total > 0" class="badge bg-warning text-dark ms-1">{{ expiringMeta.total }}</span>
              </li>
            </ul>
            
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
            <div v-else-if="needApprovalMeta.total === 0 && approvedMeta.total === 0 && expiringMeta.total === 0" class="text-center py-5">
              <i class="ri-checkbox-circle-line ri-48px text-success mb-3"></i>
              <h6 class="text-muted">Tidak ada notifikasi saat ini</h6>
            </div>

            <!-- Notifications List -->
            <div v-else class="list-group list-group-flush">
              <div v-if="activeTab === 'need'">
                <div v-if="needApprovalNotifications.length === 0" class="text-center py-3 text-muted">Tidak ada notifikasi perlu approval</div>
                <div v-for="item in needApprovalNotifications" :key="`need-${item.id}`" class="list-group-item list-group-item-action py-3 px-3" @click="handleRecipientClick(item)" style="cursor:pointer;">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-primary me-2">{{ getTypeText(item.type) }}</span>
                        <span>{{ getStatusText(item.status) }}</span>
                        <span v-if="!isItemRead(item)" class="badge bg-dark ms-2">Baru</span>
                      </div>
                      <h6 class="mb-1 text-dark">{{ item.title }}</h6>
                      <div class="text-muted small">
                        <div class="d-flex flex-wrap gap-3">
                          <span><i class="ri-calendar-line me-1"></i>{{ formatDate(item.createdAt) }}</span>
                          <span><i class="ri-user-line me-1"></i>{{ item.createdByName || 'Unknown' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex-shrink-0">
                      <button v-if="!isItemRead(item)" @click.stop="markRecipientAsRead(item)" class="btn btn-sm btn-outline-dark" title="Tandai sebagai dibaca"><i class="ri-check-line"></i></button>
                      <i v-else class="ri-check-line text-success" title="Sudah dibaca"></i>
                    </div>
                  </div>
                </div>
                <div v-if="needApprovalMeta.total > ROWS_PER_PAGE" class="d-flex justify-content-center mt-3">
                  <Paginator
                    :rows="ROWS_PER_PAGE"
                    :totalRecords="needApprovalMeta.total"
                    :first="(needApprovalMeta.currentPage - 1) * ROWS_PER_PAGE"
                    :rowsPerPageOptions="[10]"
                    @page="onNeedApprovalPage($event)"
                    template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                  />
                </div>
              </div>

              <div v-if="activeTab === 'approved'">
                <div v-if="approvedNotifications.length === 0" class="text-center py-3 text-muted">Tidak ada notifikasi approved</div>
                <div v-for="item in approvedNotifications" :key="`app-${item.id}`" class="list-group-item list-group-item-action py-3 px-3" @click="handleRecipientClick(item)" style="cursor:pointer;">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-primary me-2">{{ getTypeText(item.type) }}</span>
                        <span>{{ getStatusText(item.status) }}</span>
                        <span v-if="!isItemRead(item)" class="badge bg-dark ms-2">Baru</span>
                      </div>
                      <h6 class="mb-1 text-dark">{{ item.title }}</h6>
                      <div class="text-muted small">
                        <div class="d-flex flex-wrap gap-3">
                          <span><i class="ri-calendar-line me-1"></i>{{ formatDate(item.createdAt) }}</span>
                          <span><i class="ri-user-line me-1"></i>{{ item.createdByName || 'Unknown' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex-shrink-0">
                      <button v-if="!isItemRead(item)" @click.stop="markRecipientAsRead(item)" class="btn btn-sm btn-outline-dark" title="Tandai sebagai dibaca"><i class="ri-check-line"></i></button>
                      <i v-else class="ri-check-line text-success" title="Sudah dibaca"></i>
                    </div>
                  </div>
                </div>
                <div v-if="approvedMeta.total > ROWS_PER_PAGE" class="d-flex justify-content-center mt-3">
                  <Paginator
                    :rows="ROWS_PER_PAGE"
                    :totalRecords="approvedMeta.total"
                    :first="(approvedMeta.currentPage - 1) * ROWS_PER_PAGE"
                    :rowsPerPageOptions="[10]"
                    @page="onApprovedPage($event)"
                    template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                  />
                </div>
              </div>

              <div v-if="activeTab === 'expiring'">
                <div v-if="expiringNotifications.length === 0" class="text-center py-3 text-muted">Tidak ada quotation mendekati expired</div>
                <div v-for="item in expiringNotifications" :key="`exp-${item.id}`" class="list-group-item list-group-item-action py-3 px-3" @click="handleExpiringClick(item)" style="cursor:pointer;">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-2 flex-wrap gap-2">
                        <span class="badge bg-warning text-dark">Quotation</span>
                        <span class="badge bg-secondary">{{ getStatusText(item.status) }}</span>
                        <span v-if="item.validUntil" class="badge bg-danger">
                          <i class="ri-calendar-event-line me-1"></i>Berlaku hingga: {{ formatDateShort(item.validUntil) }}
                        </span>
                      </div>
                      <h6 class="mb-1 text-dark">{{ item.title }}</h6>
                      <div class="text-muted small">
                        <div class="d-flex flex-wrap gap-3">
                          <span><i class="ri-user-line me-1"></i>{{ item.createdByName || 'Unknown' }}</span>
                          <span v-if="item.customerName"><i class="ri-building-line me-1"></i>{{ item.customerName }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="expiringMeta.total > ROWS_PER_PAGE" class="d-flex justify-content-center mt-3">
                  <Paginator
                    :rows="ROWS_PER_PAGE"
                    :totalRecords="expiringMeta.total"
                    :first="(expiringMeta.currentPage - 1) * ROWS_PER_PAGE"
                    :rowsPerPageOptions="[10]"
                    @page="onExpiringPage($event)"
                    template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import Paginator from 'primevue/paginator'

// Meta
definePageMeta({
  title: 'Notifikasi Stock',
  layout: 'default'
})

// Store
const notificationsStore = useNotificationsStore()

// Reactive data - start with loading true to avoid flash of empty state
const loading = ref(true)
const error = ref<string | null>(null)

// Computed
const { notifications, unreadCount } = storeToRefs(notificationsStore)

// Methods
const refreshNotifications = async () => {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      fetchNeedApproval(needApprovalMeta.value.currentPage),
      fetchApproved(approvedMeta.value.currentPage),
      fetchExpiringSoon(expiringMeta.value.currentPage)
    ])
  } catch (err) {
    error.value = 'Gagal memuat notifikasi'
    console.error('Error refreshing notifications:', err)
  } finally {
    loading.value = false
  }
}

const onNeedApprovalPage = (event: { page: number }) => {
  fetchNeedApproval((event.page ?? 0) + 1)
}

const onApprovedPage = (event: { page: number }) => {
  fetchApproved((event.page ?? 0) + 1)
}

const onExpiringPage = (event: { page: number }) => {
  fetchExpiringSoon((event.page ?? 0) + 1)
}

// Local tab data
const activeTab = ref('need')
const needApprovalNotifications = ref<any[]>([])
const approvedNotifications = ref<any[]>([])

// Pagination state - 10 items per page
const ROWS_PER_PAGE = 10
const needApprovalMeta = ref<{ total: number; currentPage: number; lastPage: number }>({ total: 0, currentPage: 1, lastPage: 1 })
const approvedMeta = ref<{ total: number; currentPage: number; lastPage: number }>({ total: 0, currentPage: 1, lastPage: 1 })
const expiringNotifications = ref<any[]>([])
const expiringMeta = ref<{ total: number; currentPage: number; lastPage: number }>({ total: 0, currentPage: 1, lastPage: 1 })

const mapRecipientToItem = (r: any) => {
  const n = r.notification || {}
  const payload = n.payload || {}

  const createdByName =
    payload.requestedByUser?.fullName ||
    payload.requested_by_user?.full_name ||
    payload.createdByUser?.fullName ||
    payload.created_by_user?.full_name ||
    payload.createdByName ||
    payload.createdBy ||
    payload.requestedBy ||
    ''

  const makeTitle = () => {
    const t = n.type || payload.type || ''
    switch (t) {
      case 'site_investment':
        return `Site Investment ${payload.siNumber || payload.si_number || payload.id || ''}`.trim()
      case 'quotation':
        return `Quotation ${payload.noQuotation || payload.no_quotation || payload.id || ''}`.trim()
      case 'le_tech_review':
        return `Legal-Tech Review ${payload.noLr || payload.no_lr || payload.id || ''}`.trim()
      case 'subscription':
        return `Subscription ${payload.noSubscription || payload.no_subscription || payload.id || ''}`.trim()
      case 'pks':
        return `PKS ${payload.noPks || payload.no_pks || payload.id || ''}`.trim()
      case 'iro':
        return `IRO ${payload.noIro || payload.no_iro || payload.id || ''}`.trim()
      case 'fdr':
        return `FDR ${payload.fdrNumber || payload.fdr_number || payload.id || ''}`.trim()
      case 'price_adjustment':
        return `Price Adjustment ${payload.id || ''}`.trim()
      default:
        return (payload.title || payload.description || payload.note || `${t || 'Notifikasi'} ${payload.id || ''}`).trim()
    }
  }

  return {
    id: r.id,
    isRead: !!(r.is_read ?? r.isRead),
    type: n.type || payload.type,
    status: n.event || payload.status || '',
    createdAt: n.created_at || n.createdAt || r.created_at || r.createdAt,
    createdByName,
    title: makeTitle(),
    raw: r,
  }
}

const fetchNeedApproval = async (page = 1) => {
  try {
    const { $api } = useNuxtApp()
    const res = await fetch(`${$api.notifications()}?event=submitted&rows=${ROWS_PER_PAGE}&page=${page}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    const list = Array.isArray(json.data) ? json.data : []
    needApprovalNotifications.value = list.map(mapRecipientToItem)
    const meta = json.meta || {}
    needApprovalMeta.value = {
      total: meta.total ?? list.length,
      currentPage: meta.currentPage ?? page,
      lastPage: meta.lastPage ?? 1
    }
    await resolveMissingUserNames(needApprovalNotifications.value)
  } catch (e) {
    console.error('Error fetching need approval notifications:', e)
  }
}

const fetchApproved = async (page = 1) => {
  try {
    const { $api } = useNuxtApp()
    const res = await fetch(`${$api.notifications()}?event=approved&rows=${ROWS_PER_PAGE}&page=${page}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    const list = Array.isArray(json.data) ? json.data : []
    approvedNotifications.value = list.map(mapRecipientToItem)
    const meta = json.meta || {}
    approvedMeta.value = {
      total: meta.total ?? list.length,
      currentPage: meta.currentPage ?? page,
      lastPage: meta.lastPage ?? 1
    }
    await resolveMissingUserNames(approvedNotifications.value)
  } catch (e) {
    console.error('Error fetching approved notifications:', e)
  }
}

const mapExpiringQuotationToItem = (q: any) => ({
  id: q.id,
  type: 'quotation',
  status: q.status || '',
  createdAt: q.created_at || q.createdAt,
  createdByName: q.createdByUser?.full_name || q.created_by_user?.full_name || q.createdByUser?.fullName || '',
  customerName: q.customer?.name || '',
  title: `Quotation ${q.no_quotation || q.noQuotation || q.id || ''}`.trim(),
  validUntil: q.valid_until || q.validUntil,
})

const fetchExpiringSoon = async (page = 1) => {
  try {
    const { $api } = useNuxtApp()
    const res = await fetch(`${$api.quotationExpiringSoon()}?rows=${ROWS_PER_PAGE}&page=${page}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    const list = Array.isArray(json.data) ? json.data : []
    expiringNotifications.value = list.map(mapExpiringQuotationToItem)
    const meta = json.meta || {}
    expiringMeta.value = {
      total: meta.total ?? list.length,
      currentPage: meta.currentPage ?? page,
      lastPage: meta.lastPage ?? 1
    }
  } catch (e) {
    console.error('Error fetching expiring quotations:', e)
  }
}

// Resolve missing user names for items where createdByName is numeric or empty
const resolveMissingUserNames = async (items: any[]) => {
  try {
    const { $api } = useNuxtApp()
    const idsToFetch = new Set<number>()
    items.forEach((it) => {
      const name = it.createdByName
      if (!name || /^\d+$/.test(String(name))) {
        const payload = it.raw?.notification?.payload || {}
        const uid = payload.createdBy || payload.requestedBy || payload.created_by || payload.requested_by || null
        if (uid && Number(uid)) idsToFetch.add(Number(uid))
      }
    })
    if (idsToFetch.size === 0) return
    await Promise.all(Array.from(idsToFetch).map(async (uid) => {
      try {
        const res = await fetch(`${$api.users()}/${uid}`, { credentials: 'include' })
        if (!res.ok) return
        const json = await res.json()
        const user = json?.data ?? json
        const full = user?.fullName || user?.full_name || user?.username || user?.name || String(uid)
        // assign back to items that reference this uid
        items.forEach((it) => {
          const payload = it.raw?.notification?.payload || {}
          const uid2 = payload.createdBy || payload.requestedBy || payload.created_by || payload.requested_by || null
          if (Number(uid2) === uid) it.createdByName = full
        })
      } catch {}
    }))
  } catch (e) {
    console.error('Error resolving user names for notifications:', e)
  }
}

// Helper: treat as read if API says so OR user has marked it (stored in readNotifications)
const isItemRead = (item: any) =>
  !!item.isRead || notificationsStore.readNotifications.has(String(item.id))

const markRecipientAsRead = async (item: any) => {
  try {
    // call store action which will call backend if id numeric
    await notificationsStore.markAsRead(String(item.id))
    // update local lists so UI reflects immediately
    item.isRead = true
  } catch (e) {
    console.error('Error marking recipient as read:', e)
  }
}

const handleRecipientClick = async (item: any) => {
  // mark read and navigate if needed
  if (!isItemRead(item)) await markRecipientAsRead(item)
  // basic navigation heuristics
  const t = item.type
  const payload = item.raw?.notification?.payload || {}
  if (t === 'purchase_order') navigateTo('/purchasing/purchase-order')
  else if (t === 'sales_order') navigateTo('/sales/sales-order')
  else if (t === 'site_investment' && payload.id) navigateTo(`/sales/site-investment/detail/${payload.id}`)
  else if (t === 'fdr' && payload.id) navigateTo(`/sales/fdr/detail/${payload.id}`)
  else if (t === 'fdr') navigateTo('/sales/fdr')
  else if (t === 'quotation' && payload.id) navigateTo(`/sales/quotation/detail/${payload.id}`)
  else if (t === 'price_adjustment') {
    // go to price adjustment detail if payload contains id
    const payload = item.raw.notification?.payload || {}
    if (payload.id) navigateTo(`/price-adjustment/${payload.id}`)
  }
}

const handleExpiringClick = (item: any) => {
  if (item.id) navigateTo(`/sales/quotation/detail/${item.id}`)
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
    case 'site_investment':
      return 'bg-primary'
    case 'quotation':
      return 'bg-info'
    case 'le_tech_review':
      return 'bg-secondary'
    case 'subscription':
      return 'bg-success'
    case 'pks':
      return 'bg-dark'
    case 'iro':
      return 'bg-warning'
    case 'fdr':
      return 'bg-info'
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
    case 'price_adjustment':
      return 'Price Adjustment'
    case 'sales_order':
      return 'Sales Order'
    case 'site_investment':
      return 'Site Investment'
    case 'quotation':
      return 'Quotation'
    case 'le_tech_review':
      return 'Legal-Tech'
    case 'subscription':
      return 'Subscription'
    case 'pks':
      return 'PKS'
    case 'iro':
      return 'IRO'
    case 'fdr':
      return 'FDR'
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
    case 'price_adjustment':
      return `Price Adjustment (${notification.description || ''}) status: ${notification.status}`
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
    case 'submitted':
      return 'Perlu Approval'
    case 'approved':
      return 'Sudah Approved'
    case 'rejected':
      return 'Ditolak'
    default:
      return status || '—'
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

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  // Load read state from localStorage so marks persist across refresh
  notificationsStore.loadReadNotifications()
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
