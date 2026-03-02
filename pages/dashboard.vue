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
        <div class="card h-100">
          <div class="row row-bordered g-0 h-100">
            <div class="col-md-7 col-12 order-2 order-md-0">
              <div class="card-header">
                <h5 class="mb-0">FP Growth</h5>
              </div>
              <div class="card-body">
                <div class="fp-growth-chart-container">
                  <!-- Debug Info -->
                  <div v-if="chartData?.labels?.length === 0" class="alert alert-info">
                    <i class="ri-information-line me-2"></i>
                    <strong>Info:</strong> Tidak ada aturan asosiasi yang ditemukan. 
                    Pastikan ada transaksi penjualan dengan multiple produk untuk menghasilkan diagram FP-Growth.
                  </div>
                  
                  <!-- Loading State -->
                  <div v-else-if="!chartData || !chartData.labels" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading FP-Growth...</span>
                    </div>
                    <p class="mt-2">Memuat data FP-Growth...</p>
                  </div>
                  
                  <!-- Chart -->
                  <div v-else>
                    <Chart 
                      type="bar" 
                      :data="chartData" 
                      :options="chartOptions" 
                      style="height: 300px;"
                    />
                    <!-- Fallback jika Chart component error -->
                    <div v-if="!chartData?.datasets?.[0]?.data?.length" class="alert alert-warning mt-2">
                      <i class="ri-alert-line me-2"></i>
                      Chart component loaded but no data to display
                    </div>
                  </div>
                  
                  <!-- Debug Console Logs -->
                  <div v-if="false" class="mt-2">
                    <small class="text-muted">
                      Debug: {{ chartData?.labels?.length || 0 }} rules found
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-5 col-12">
              <div class="card-header">
                <div class="d-flex justify-content-between">
                  <h5 class="mb-1">Report Penjualan</h5>
                  <div class="dropdown">
                    <button class="btn btn-text-secondary rounded-pill text-muted border-0 p-1" type="button"
                      id="totalTransaction" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <i class="ri-more-2-line ri-20px"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end" aria-labelledby="totalTransaction">
                      <a class="dropdown-item" href="javascript:void(0);" @click="refreshSalesStatistics">Refresh</a>
                      <a class="dropdown-item" href="javascript:void(0);">Share</a>
                      <a class="dropdown-item" href="javascript:void(0);">Update</a>
                    </div>
                  </div>
                </div>
                <p class="mb-0 card-subtitle">
                  <span v-if="salesStatisticsStore.loading">Loading...</span>
                  <span v-else-if="salesStatisticsStore.statistics">
                    Transaksi 1 bulan terakhir {{ salesStatisticsStore.formattedLastMonthTotal }}
                  </span>
                  <span v-else>Data tidak tersedia</span>
                </p>
              </div>
              <div class="card-body pt-6">
                <div v-if="salesStatisticsStore.loading" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div v-else-if="salesStatisticsStore.error" class="text-center py-4">
                  <p class="text-danger">{{ salesStatisticsStore.error }}</p>
                  <button @click="refreshSalesStatistics" class="btn btn-sm btn-primary">Coba Lagi</button>
                </div>
                <div v-else-if="salesStatisticsStore.statistics" class="row">
                  <div class="col-6 border-end">
                    <div class="d-flex flex-column align-items-center">
                      <div class="avatar">
                        <div class="avatar-initial bg-label-success rounded-3">
                          <i class="ri-calendar-line ri-24px"></i>
                        </div>
                      </div>
                      <p class="mt-3 mb-1">Minggu Ini</p>
                      <h6 class="mb-0" >
                        {{ salesStatisticsStore.formattedThisWeekPerformance }}
                      </h6>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="d-flex flex-column align-items-center">
                      <div class="avatar">
                        <div class="avatar-initial bg-label-primary rounded-3">
                          <i class="ri-money-dollar-circle-line ri-24px"></i>
                        </div>
                      </div>
                      <p class="mt-3 mb-1">Hari Ini</p>
                      <h6 class="mb-0">{{ salesStatisticsStore.formattedTodayTotal }}</h6>
                    </div>
                  </div>
                </div>
                <hr class="my-5" />
                <div class="d-flex justify-content-around align-items-center flex-wrap gap-2">
                  <div>
                    <p class="mb-1">Performa Bulanan</p>
                    <h6 class="mb-0" >
                      {{ salesStatisticsStore.formattedLastMonthPerformance }}
                    </h6>
                  </div>
                  <div>
                    <button @click="refreshSalesStatistics" class="btn btn-primary" type="button"
                      :disabled="salesStatisticsStore.loading">
                      <i class="ri-refresh-line" ></i>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <div class="card h-100">
          <div class="card-header">
            <div class="d-flex justify-content-between">
              <h5 class="mb-1">Data Mingguan</h5>
              <div class="dropdown">
                <button class="btn btn-text-secondary rounded-pill text-muted border-0 p-1" type="button"
                  id="weeklyDataDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="ri-more-2-line ri-20px"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end" aria-labelledby="weeklyDataDropdown">
                  <a class="dropdown-item" href="javascript:void(0);" @click="refreshSalesStatistics">Refresh</a>
                  <a class="dropdown-item" href="javascript:void(0);">Export</a>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="salesStatisticsStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="salesStatisticsStore.error" class="text-center py-4">
              <p class="text-danger">{{ salesStatisticsStore.error }}</p>
              <button @click="refreshSalesStatistics" class="btn btn-sm btn-primary">Coba Lagi</button>
            </div>
            <div v-else-if="salesStatisticsStore.statistics?.weeklyData" class="weekly-data-list">
              <div v-for="week in salesStatisticsStore.statistics.weeklyData" :key="week.week"
                class="d-flex align-items-center justify-content-between mb-3 p-2 border rounded">
                <div class="d-flex align-items-center">
                  <div class="avatar avatar-sm me-3">
                    <div class="avatar-initial bg-label-info rounded">
                      <i class="ri-calendar-line"></i>
                    </div>
                  </div>
                  <div>
                    <h6 class="mb-0 small">{{ week.week }}</h6>
                    <p class="mb-0 text-muted small">{{ week.dateRange }}</p>
                  </div>
                </div>
                <div class="text-end">
                  <h6 class="mb-0 text-primary">
                    {{ new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(week.amount) }}
                  </h6>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-muted">Tidak ada data mingguan tersedia</p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xxl-4">
        <div class="card h-100">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="card-title m-0 me-2">Produk Teratas</h5>
            <div class="dropdown">
              <button class="btn btn-text-secondary rounded-pill text-muted border-0 p-1" type="button"
                id="topProductsMenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="ri-more-2-line ri-20px"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-end" aria-labelledby="topProductsMenu">
                <a class="dropdown-item" href="javascript:void(0);" @click="refreshTopProducts">Refresh</a>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="topProductsStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="topProductsStore.error" class="text-center py-4">
              <p class="text-danger">{{ topProductsStore.error }}</p>
              <button @click="refreshTopProducts" class="btn btn-sm btn-primary">Coba Lagi</button>
            </div>
            <div v-else>
              <template v-if="topProductsStore.visibleItems && topProductsStore.visibleItems.length > 0">
                <ul class="p-0 m-0">
                  <li v-for="item in topProductsStore.visibleItems" :key="item.productId" class="d-flex align-items-center mb-4">
                    <div class="avatar avatar-md flex-shrink-0 me-4">
                      <div class="avatar-initial bg-light-gray rounded-3">
                        <div>
                          <img src="/img/icons/misc/4-square.png" alt="Product" class="h-25" />
                        </div>
                      </div>
                    </div>
                    <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                      <div class="me-2">
                        <h6 class="mb-1">{{ item.name }}</h6>
                        <small v-if="item.sku">Part Number: {{ item.sku }}</small>
                      </div>
                      <div class="badge bg-label-primary rounded-pill">Qty {{ item.totalQty }}</div>
                    </div>
                  </li>
                </ul>

                <div class="text-center mt-3" v-if="topProductsStore.hasMore">
                  <button @click="loadMoreTopProducts" class="btn btn-outline-primary btn-sm">
                    <i class="ri-add-line me-1"></i>
                    Load More
                  </button>
                </div>
                <div class="text-center mt-3" v-if="topProductsStore.isFullyExpanded && topProductsStore.items.length > 5">
                  <button @click="showLessTopProducts" class="btn btn-outline-secondary btn-sm">
                    <i class="ri-subtract-line me-1"></i>
                    Show Less
                  </button>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-4">
                  <p class="text-muted">Belum ada produk yang terjual saat ini</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xxl-4">
        <div class="row g-4">
          <div class="col-md-6 col-sm-6">
            <div class="card h-100">
              <div class="card-header pb-xl-8">
                <div class="d-flex align-items-center mb-1 flex-wrap">
                  <h5 class="mb-0 me-1" v-if="salesStatisticsStore.statistics">
                    {{ salesStatisticsStore.formattedLastMonthTotal }}
                  </h5>
                  <h5 class="mb-0 me-1" v-else>Rp 0</h5>
                  <p class="mb-0"  v-if="salesStatisticsStore.statistics">
                    {{ salesStatisticsStore.formattedLastMonthPerformance }}
                  </p>
                  <p class="mb-0 text-muted" v-else>0%</p>
                </div>
                <span class="d-block card-subtitle">Total Revenue Bulanan</span>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <div class="avatar me-3">
                    <div class="avatar-initial bg-label-primary rounded">
                      <i class="ri-bar-chart-line"></i>
                    </div>
                  </div>
                  <div>
                    <p class="mb-0 small">Performa vs Bulan Sebelumnya</p>
                    <h6 class="mb-0" 
                      v-if="salesStatisticsStore.statistics">
                      {{ salesStatisticsStore.formattedLastMonthPerformance }}
                    </h6>
                    <h6 class="mb-0 text-muted" v-else>0%</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-sm-6">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div class="avatar">
                    <div class="avatar-initial bg-label-success rounded-3">
                      <i class="ri-calendar-line ri-24px"></i>
                    </div>
                  </div>
                  <div class="d-flex align-items-center">
                    <p class="mb-0" 
                      v-if="salesStatisticsStore.statistics">
                      {{ salesStatisticsStore.formattedThisWeekPerformance }}
                    </p>
                    <p class="mb-0 text-muted" v-else>0%</p>
                    <i class="ri-arrow-up-s-line" 
                      v-if="salesStatisticsStore.statistics?.performance.weekly > 0"></i>
                    <i class="ri-arrow-down-s-line" 
                      v-else-if="salesStatisticsStore.statistics?.performance.weekly < 0"></i>
                  </div>
                </div>
                <div class="card-info mt-5 mt-xl-8">
                  <h5 class="mb-1" v-if="salesStatisticsStore.statistics">
                    {{ salesStatisticsStore.formattedThisWeekTotal }}
                  </h5>
                  <h5 class="mb-1" v-else>Rp 0</h5>
                  <p>Total Sales Minggu Ini</p>
                  <div class="badge bg-label-secondary rounded-pill">vs Minggu Lalu</div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-sm-6">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div class="avatar">
                    <div class="avatar-initial bg-label-info rounded-3">
                      <i class="ri-sun-line ri-24px"></i>
                    </div>
                  </div>
                  <div class="d-flex align-items-center">
                    <p class="mb-0 text-success me-1">Hari Ini</p>
                    <i class="ri-calendar-check-line text-success"></i>
                  </div>
                </div>
                <div class="card-info mt-5 mt-xl-8">
                  <h5 class="mb-1" v-if="salesStatisticsStore.statistics">
                    {{ salesStatisticsStore.formattedTodayTotal }}
                  </h5>
                  <h5 class="mb-1" v-else>Rp 0</h5>
                  <p>Total Sales Hari Ini</p>
                  <div class="badge bg-label-secondary rounded-pill">Real-time</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-sm-6">
            <div class="card h-100">
              <div class="card-header pb-xl-7">
                <div class="d-flex align-items-center mb-1 flex-wrap">
                  <h5 class="mb-0 me-1" v-if="salesStatisticsStore.statistics">
                    {{ salesStatisticsStore.formattedThisWeekTotal }}
                  </h5>
                  <h5 class="mb-0 me-1" v-else>Rp 0</h5>
                  <p class="mb-0" 
                    v-if="salesStatisticsStore.statistics">
                    {{ salesStatisticsStore.formattedThisWeekPerformance }}
                  </p>
                  <p class="mb-0 text-muted" v-else>0%</p>
                </div>
                <span class="d-block card-subtitle">Ringkasan Mingguan</span>
              </div>
              <div class="card-body pb-xl-8">
                <div class="d-flex align-items-center">
                  <div class="avatar me-3">
                    <div class="avatar-initial bg-label-warning rounded">
                      <i class="ri-money-dollar-circle-line ri-24px"></i>
                    </div>
                  </div>
                  <div>
                    <p class="mb-0 small">Performa vs Minggu Lalu</p>
                    <h6 class="mb-0" 
                      v-if="salesStatisticsStore.statistics">
                      {{ salesStatisticsStore.formattedThisWeekPerformance }}
                    </h6>
                    <h6 class="mb-0 text-muted" v-else>0%</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-xxl-12 col-md-6">
        <div class="card h-100">
          <div class="card-header">
            <div class="d-flex justify-content-between">
              <h5 class="mb-1">Sales by Customer</h5>
              <div class="dropdown">
                <button class="btn btn-text-secondary rounded-pill text-muted border-0 p-1" type="button"
                  id="salesCustomerDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="ri-more-2-line ri-20px"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end" aria-labelledby="salesCustomerDropdown">
                  <a class="dropdown-item" href="javascript:void(0);" @click="refreshSalesByCustomer">Refresh</a>
                  <a class="dropdown-item" href="javascript:void(0);">Export</a>
                  <a class="dropdown-item" href="javascript:void(0);">Share</a>
                </div>
              </div>
            </div>
            <p class="mb-0 card-subtitle">
              <span v-if="salesByCustomerStore.loading">Loading...</span>
              <span v-else-if="salesByCustomerStore.data">
                Total {{ salesByCustomerStore.formattedTotalSales }} Sales
              </span>
              <span v-else>Data tidak tersedia</span>
            </p>
          </div>
          <div class="card-body pb-1 px-0">
            <div v-if="salesByCustomerStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="salesByCustomerStore.error" class="text-center py-4">
              <p class="text-danger">{{ salesByCustomerStore.error }}</p>
              <button @click="refreshSalesByCustomer" class="btn btn-sm btn-primary">Coba Lagi</button>
            </div>
            <div v-else-if="salesByCustomerStore.data?.customers" class="sales-customer-chart">
              <div v-for="customer in salesByCustomerStore.data.customers" :key="customer.customer"
                class="customer-bar-item">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <div class="d-flex align-items-center">
                    <div class="customer-color-indicator me-2" :style="{ backgroundColor: customer.color }"></div>
                    <span class="customer-name">{{ customer.customer }}</span>
                  </div>
                  <span class="customer-sales">
                    {{ new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(customer.sales) }}
                  </span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" :style="{ 
                      width: `${(customer.sales / salesByCustomerStore.maxSales) * 100}%`,
                      backgroundColor: customer.color
                    }"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-muted">Tidak ada data customer tersedia</p>
            </div>
          </div>
        </div>
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
    useDashboardStore
  } from '~/stores/dashboard'
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
    useSalesByCustomerStore
  } from '~/stores/sales-by-customer'
  import { useTopProductsStore } from '~/stores/top-products'
  import {
    storeToRefs
  } from 'pinia'
  import {
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
  } from 'vue'
  import {
    useDynamicTitle
  } from '~/composables/useDynamicTitle'
  import {
    usePermissions 
  } from '~/composables/usePermissions'
  import DashboardSalesPipelineTab from '~/components/dashboard/sales/PipelineTab.vue'

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
  const dashboardStore = useDashboardStore()
  const salesOrderStore = useSalesOrderStore()
  const userSessionStore = useUserSessionStore()
  const salesStatisticsStore = useSalesStatisticsStore()
  const salesByCustomerStore = useSalesByCustomerStore()
  const topProductsStore = useTopProductsStore()
  const { userHasRole } = usePermissions()

  const activeDashboardTab = ref('all')
  const canViewSalesPipelineTab = computed(() => userHasRole('superadmin') || userHasRole('sales_manager'))

  const {
    chartData,
    chartOptions
  } = storeToRefs(dashboardStore)


  // Functions
  const refreshActiveUsers = async () => {
    await userSessionStore.fetchActiveUsers()
  }

  const refreshSalesStatistics = async () => {
    await salesStatisticsStore.fetchSalesStatistics()
  }

  const refreshSalesByCustomer = async () => {
    await salesByCustomerStore.fetchSalesByCustomer()
  }

  const refreshTopProducts = async () => {
    await topProductsStore.fetchTopProducts('1m')
  }

  const loadMoreTopProducts = () => {
    topProductsStore.loadMore()
  }

  const showLessTopProducts = () => {
    topProductsStore.showLess()
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
    
    await dashboardStore.fetchAssociationRules();
    
    await userSessionStore.fetchActiveUsers();
    await salesStatisticsStore.fetchSalesStatistics();
    await salesByCustomerStore.fetchSalesByCustomer();
    await topProductsStore.fetchTopProducts();
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
  /* Gaya spesifik untuk halaman ini jika diperlukan */

  .sales-customer-chart {
    padding: 1rem;
  }

  .customer-bar-item {
    margin-bottom: 1.5rem;
  }

  .customer-bar-item:last-child {
    margin-bottom: 0;
  }

  .customer-color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .customer-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #566a7f;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .customer-sales {
    font-size: 0.875rem;
    font-weight: 600;
    color: #566a7f;
    text-align: right;
  }

  .progress-bar-container {
    width: 100%;
    height: 8px;
    background-color: #f5f5f9;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
    position: relative;
  }

  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }

    100% {
      transform: translateX(100%);
    }
  }

  /* FP Growth Chart Styling */
  .fp-growth-chart-container {
    position: relative;
    height: 300px;
    padding-bottom: 60px;
    /* Extra space for multi-line labels */
  }

  .fp-growth-chart-container canvas {
    max-height: 240px !important;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .customer-name {
      max-width: 80px;
    }

    .customer-sales {
      font-size: 0.75rem;
    }

    .fp-growth-chart-container {
      height: 350px;
      padding-bottom: 80px;
    }

    .fp-growth-chart-container canvas {
      max-height: 270px !important;
    }
  }

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