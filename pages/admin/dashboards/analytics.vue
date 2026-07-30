<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div class="d-flex align-items-center gap-2">
          <NuxtLink to="/admin/dashboards" class="btn btn-icon btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line"></i>
          </NuxtLink>
          <div>
            <h4 class="mb-1">Dashboard & Widget Analytics</h4>
            <p class="mb-0 text-muted">Ringkasan pemakaian dashboard & widget lintas seluruh aplikasi.</p>
          </div>
        </div>
        <select v-model.number="days" class="form-select" style="max-width: 180px;" @change="load">
          <option :value="7">7 hari terakhir</option>
          <option :value="30">30 hari terakhir</option>
          <option :value="90">90 hari terakhir</option>
        </select>
      </div>

      <div v-if="loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <template v-else-if="overview">
        <!-- Summary cards -->
        <div class="row g-4 mb-4">
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Dashboard Views</p>
                    <h4 class="mb-0">{{ overview.totals.dashboardViews.toLocaleString('id-ID') }}</h4>
                  </div>
                  <span class="avatar"><span class="avatar-initial rounded bg-label-primary"><i class="ri-layout-grid-line ri-24px"></i></span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Widget Views</p>
                    <h4 class="mb-0">{{ overview.totals.widgetViews.toLocaleString('id-ID') }}</h4>
                  </div>
                  <span class="avatar"><span class="avatar-initial rounded bg-label-info"><i class="ri-puzzle-line ri-24px"></i></span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Widget Errors</p>
                    <h4 class="mb-0">{{ overview.totals.widgetErrors.toLocaleString('id-ID') }}</h4>
                  </div>
                  <span class="avatar"><span class="avatar-initial rounded bg-label-danger"><i class="ri-error-warning-line ri-24px"></i></span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1 small">Error Rate Widget</p>
                    <h4 class="mb-0">{{ overallErrorRate }}%</h4>
                  </div>
                  <span class="avatar"><span class="avatar-initial rounded bg-label-warning"><i class="ri-percent-line ri-24px"></i></span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header"><span class="fw-semibold">Dashboard Terpopuler</span></div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Dashboard</th>
                      <th class="text-end">Views</th>
                      <th class="text-end">User Unik</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="overview.topDashboards.length === 0">
                      <td colspan="3" class="text-center text-muted py-4">Belum ada data.</td>
                    </tr>
                    <tr v-for="row in overview.topDashboards" :key="row.dashboardCode">
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <i v-if="row.icon" :class="[row.icon, 'text-primary']"></i>
                          <span>{{ row.name }}</span>
                        </div>
                      </td>
                      <td class="text-end">{{ row.views.toLocaleString('id-ID') }}</td>
                      <td class="text-end">{{ row.uniqueUsers.toLocaleString('id-ID') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header"><span class="fw-semibold">Widget Terpopuler</span></div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Widget</th>
                      <th class="text-end">Views</th>
                      <th class="text-end">Errors</th>
                      <th class="text-end">Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="overview.topWidgets.length === 0">
                      <td colspan="4" class="text-center text-muted py-4">Belum ada data.</td>
                    </tr>
                    <tr v-for="row in overview.topWidgets" :key="row.widgetCode">
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <i v-if="row.icon" :class="[row.icon, 'text-primary']"></i>
                          <span>{{ row.title }}</span>
                        </div>
                      </td>
                      <td class="text-end">{{ row.views.toLocaleString('id-ID') }}</td>
                      <td class="text-end">{{ row.errors.toLocaleString('id-ID') }}</td>
                      <td class="text-end">
                        <span class="badge" :class="row.errorRate > 5 ? 'bg-label-danger' : 'bg-label-success'">
                          {{ row.errorRate }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDashboardAnalyticsAdmin } from '~/composables/useDashboardAnalyticsAdmin'
import type { DashboardAnalyticsOverview } from '~/composables/useDashboardAnalyticsAdmin'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Dashboard & Widget Analytics',
  description: 'Ringkasan pemakaian dashboard & widget',
})

const { loading, error, fetchOverview } = useDashboardAnalyticsAdmin()
const overview = ref<DashboardAnalyticsOverview | null>(null)
const days = ref(30)

const overallErrorRate = computed(() => {
  if (!overview.value) return 0
  const { widgetViews, widgetErrors } = overview.value.totals
  const denom = widgetViews + widgetErrors
  return denom > 0 ? Number(((widgetErrors / denom) * 100).toFixed(1)) : 0
})

async function load() {
  overview.value = await fetchOverview(days.value)
}

onMounted(load)
</script>
