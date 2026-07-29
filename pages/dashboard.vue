<template>
  <div class="container-xxl flex-grow-1 container-py-0">
    <!-- Tabs: All & Sales Pipeline -->
    <ul class="nav nav-tabs nav-tabs-custom mb-4">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeDashboardTab === 'all' }"
          type="button"
          @click="activeDashboardTab = 'all'"
        >
          <i class="ri-dashboard-line me-1"></i>
          All
        </button>
      </li>
      <li class="nav-item" v-if="canViewSalesPipelineTab">
        <button
          class="nav-link"
          :class="{ active: activeDashboardTab === 'salesPipeline' }"
          type="button"
          @click="activeDashboardTab = 'salesPipeline'"
        >
          <i class="ri-diamond-line me-1"></i>
          Sales
        </button>
      </li>
    </ul>

    <!-- Tab: All (existing dashboard content) -->
    <div v-show="activeDashboardTab === 'all'" class="row g-6 mt-2">
      <div class="col-md-12 col-xxl-8">
        <div class="card">
          <div class="d-flex align-items-end row">
            <div class="col-md-6 order-2 order-md-1">
              <div class="card-body">
                <h4 class="card-title mb-4">Welcome <span
                    class="fw-bold">{{ userStore.user?.fullName || 'Guest' }}</span> 🎉</h4>
                <p class="mb-0">Have the courage to follow your heart and intuition.</p>
                <p>They somehow already know what you truly want to become.</p>
                <a href="javascript:;" class="btn btn-primary">View Profile</a>
              </div>
            </div>
            <div class="col-md-6 text-center text-md-end order-1 order-md-2">
              <div class="card-body pb-0 px-0 pt-2">
                <img src="/img/illustrations/illustration-john-light.png" height="186" class="scaleX-n1-rtl"
                  alt="View Profile" data-app-light-img="illustrations/illustration-john-light.png"
                  data-app-dark-img="illustrations/illustration-john-dark.png" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xxl-2 col-sm-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div class="avatar">
                <div class="avatar-initial bg-label-primary rounded-3">
                  <i class="ri-shopping-cart-2-line ri-24px"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <p class="mb-0 text-success me-1">+22%</p>
                <i class="ri-arrow-up-s-line text-success"></i>
              </div>
            </div>
            <div class="card-info mt-5">
              <h5 class="mb-1">{{ salesOrderStore.stats.deliveredLast4Months }}</h5>
              <p>Total Orders</p>
              <div class="badge bg-label-secondary rounded-pill">Last 4 Month</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xxl-2 col-sm-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div class="avatar">
                <div class="avatar-initial bg-label-success rounded-3">
                  <i class="ri-user-line ri-24px"></i>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <button @click="refreshActiveUsers" class="btn btn-sm btn-outline-primary"
                  :disabled="userSessionStore.loading">
                  <i class="ri-refresh-line" ></i>
                </button>
              </div>
            </div>
            <div class="card-info mt-5">
              <h5 class="mb-1">{{ userSessionStore.totalActiveUsers }}</h5>
              <p>Total User Login</p>
              <p class="mb-0 small">Desktop: {{ userSessionStore.activeUsersByDevice.desktop }} | Mobile:
                {{ userSessionStore.activeUsersByDevice.mobile }} | Tablet:
                {{ userSessionStore.activeUsersByDevice.tablet }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-xxl-8">
        <DashboardLoginActivityChart />
      </div>
      <div class="col-12 col-xxl-4 col-md-6">
        <div class="card h-100">
          <div class="card-header">
            <div class="d-flex justify-content-between">
              <h5 class="mb-1">User yang Sedang Online</h5>
              <div class="dropdown">
                <button class="btn btn-text-secondary rounded-pill text-muted border-0 p-1" type="button"
                  id="activeUsersDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="ri-more-2-line ri-20px"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end" aria-labelledby="activeUsersDropdown">
                  <a class="dropdown-item" href="javascript:void(0);" @click="refreshActiveUsers">Refresh</a>
                  <a class="dropdown-item" href="javascript:void(0);" @click="cleanupExpiredSessions">Cleanup
                    Expired</a>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="userSessionStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="userSessionStore.error" class="text-center py-4">
              <p class="text-danger">{{ userSessionStore.error }}</p>
              <button @click="refreshActiveUsers" class="btn btn-sm btn-primary">Coba Lagi</button>
            </div>
            <div v-else-if="userSessionStore.recentActiveUsers.length === 0" class="text-center py-4">
              <p class="text-muted">Tidak ada user yang sedang online</p>
            </div>
            <div v-else class="active-users-list">
              <div v-for="session in userSessionStore.recentActiveUsers" :key="session.id"
                class="d-flex align-items-center mb-3 p-2 border rounded">
                <div class="avatar avatar-sm me-3">
                  <div class="avatar-initial bg-label-primary rounded">
                    <i class="ri-user-line"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h6 class="mb-0 small">{{ session.user.fullName }}</h6>
                  <p class="mb-0 text-muted small">{{ session.user.email }}</p>
                  <div class="d-flex align-items-center mt-1">
                    <span class="badge bg-label-secondary me-2">{{ session.deviceType }}</span>
                    <small class="text-muted">{{ formatTimeAgo(session.lastActivity) }}</small>
                  </div>
                </div>
                <div class="ms-2" v-if="userHasRole('superadmin')">
                  <button @click="forceLogoutUser(session.sessionId)" class="btn btn-sm btn-outline-danger"
                    title="Force Logout">
                    <i class="ri-logout-box-r-line"></i>
                  </button>
                </div>
              </div>

              <!-- Load More Button -->
              <div v-if="userSessionStore.hasMoreUsers" class="text-center mt-3">
                <button @click="loadMoreUsers" class="btn btn-outline-primary btn-sm">
                  <i class="ri-add-line me-1"></i>
                  Load More ({{ userSessionStore.totalActiveUsers - userSessionStore.recentActiveUsers.length }} lagi)
                </button>
              </div>

              <!-- Show Less Button -->
              <div v-if="userSessionStore.isFullyExpanded && userSessionStore.totalActiveUsers > 3"
                class="text-center mt-3">
                <button @click="showLessUsers" class="btn btn-outline-secondary btn-sm">
                  <i class="ri-subtract-line me-1"></i>
                  Show Less
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-xxl-4 col-md-6">
        <DashboardImportantNotificationsCard />
      </div>
      <div class="col-12 col-xxl-8" v-if="canViewSystemStats">
        <DashboardSystemStatsCard />
      </div>
      <div class="col-12 col-xxl-12 col-md-6">
        <DashboardActivityFeedCard />
      </div>
    </div>

    <!-- Tab: Sales Pipeline -->
    <div v-if="canViewSalesPipelineTab" v-show="activeDashboardTab === 'salesPipeline'">
      <DashboardSalesPipelineTab />
    </div>

  </div>
</template>

<script setup>
  import {
    useUserStore
  } from '~/stores/user'
  import {
    useSalesOrderStore
  } from '~/stores/sales-order'
  import {
    useUserSessionStore
  } from '~/stores/user-session'
  import {
    useSalesStatisticsStore
  } from '~/stores/sales-statistics'
  import {
    ref,
    computed,
    onMounted,
    onUnmounted,
  } from 'vue'
  import {
    useDynamicTitle
  } from '~/composables/useDynamicTitle'
  import {
    usePermissions 
  } from '~/composables/usePermissions'
  import DashboardSalesPipelineTab from '~/components/dashboard/sales/PipelineTab.vue'
  import DashboardLoginActivityChart from '~/components/dashboard/LoginActivityChart.vue'
  import DashboardImportantNotificationsCard from '~/components/dashboard/ImportantNotificationsCard.vue'
  import DashboardSystemStatsCard from '~/components/dashboard/SystemStatsCard.vue'
  import DashboardActivityFeedCard from '~/components/dashboard/ActivityFeedCard.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  title: 'Dashboard',
  description: 'Dashboard',
  keywords: 'Dashboard, Sinergi Innovate Pratama',
    author: 'Sinergi Innovate Pratama',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
  });

  // Composables
  const {
    setListTitle,
    setFormTitle
  } = useDynamicTitle()

  const userStore = useUserStore()
  const salesOrderStore = useSalesOrderStore()
  const userSessionStore = useUserSessionStore()
  const salesStatisticsStore = useSalesStatisticsStore()
  const { userHasRole } = usePermissions()

  const activeDashboardTab = ref('all')
  const canViewSalesPipelineTab = computed(() => userHasRole('superadmin') || userHasRole('sales_manager'))
  const canViewSystemStats = computed(() => userHasRole('superadmin') || userHasRole('admin'))

  // Functions
  const refreshActiveUsers = async () => {
    await userSessionStore.fetchActiveUsers()
  }

  const refreshSalesStatistics = async () => {
    await salesStatisticsStore.fetchSalesStatistics()
  }

  const forceLogoutUser = async (sessionId) => {
    try {
      await userSessionStore.forceLogoutUser(sessionId)
      const toast = useToast();
      toast.success({
        title: 'Success',
        message: 'User berhasil di-logout',
        color: 'green'
      });
    } catch (error) {
      console.error('Error force logout:', error)
      const toast = useToast();
      toast.error({
        title: 'Error',
        message: 'Gagal logout user',
        color: 'red'
      });
    }
  }

  const cleanupExpiredSessions = async () => {
    try {
      await userSessionStore.cleanupExpiredSessions()
      const toast = useToast();
      toast.success({
        title: 'Success',
        message: 'Session expired berhasil dibersihkan',
        color: 'green'
      });
    } catch (error) {
      console.error('Error cleanup sessions:', error)
      const toast = useToast();
      toast.error({
        title: 'Error',
        message: 'Gagal membersihkan session expired',
        color: 'red'
      });
    }
  }

  const loadMoreUsers = () => {
    userSessionStore.loadMoreUsers()
  }

  const showLessUsers = () => {
    userSessionStore.showLessUsers()
  }

  const formatTimeAgo = (dateString) => {
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

  // Store interval reference for cleanup
  const interval = ref(null)

  onMounted(async () => {
    // Pastikan user data ter-load terlebih dahulu
    await userStore.ensureUserLoaded();
    
    // Refresh cache jika diperlukan
    await userStore.refreshCacheIfNeeded();
    
    await salesOrderStore.fetchStats();
    
    await userSessionStore.fetchActiveUsers();
    await salesStatisticsStore.fetchSalesStatistics();
    setListTitle('Dashboard')

    // Auto refresh user sessions every 60 seconds
    interval.value = setInterval(async () => {
      await userSessionStore.fetchActiveUsers();
    }, 60000);
  });

  // Cleanup interval on unmount
  onUnmounted(() => {
    if (interval.value) {
      clearInterval(interval.value);
    }
  });
</script>

<style scoped>
  /* Dashboard Tabs */
  .nav-tabs-custom {
    border-bottom: 1px solid #e9ecef;
  }

  .nav-tabs-custom .nav-link {
    border: none;
    border-bottom: 2px solid transparent;
    color: #6b7280;
    padding: 10px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .nav-tabs-custom .nav-link:hover {
    color: #696cff;
    border-bottom-color: #e9ecef;
  }

  .nav-tabs-custom .nav-link.active {
    color: #696cff;
    border-bottom-color: #696cff;
    background-color: transparent;
  }
</style>