<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div class="d-flex align-items-center gap-2">
          <NuxtLink to="/admin/dashboards" class="btn btn-icon btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line"></i>
          </NuxtLink>
          <div>
            <h4 class="mb-1">Analytics — {{ detail?.dashboard?.name || 'Dashboard' }}</h4>
            <PageBreadcrumb class="mt-1" :current-label="`Analytics — ${detail?.dashboard?.name || 'Dashboard'}`" />
            <p class="mb-0 text-muted">Ringkasan penggunaan dashboard ini & widget di dalamnya.</p>
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

      <template v-else-if="detail">
        <div class="row g-4 mb-4">
          <div class="col-sm-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <p class="text-muted mb-1 small">Total Views ({{ detail.days }} hari)</p>
                <h4 class="mb-0">{{ detail.totalViews.toLocaleString('id-ID') }}</h4>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <p class="text-muted mb-1 small">User Unik</p>
                <h4 class="mb-0">{{ detail.uniqueUsers.toLocaleString('id-ID') }}</h4>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <p class="text-muted mb-1 small">Rata-rata Views/Hari</p>
                <h4 class="mb-0">{{ avgViewsPerDay }}</h4>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <div class="card h-100">
              <div class="card-header"><span class="fw-semibold">Views per Hari</span></div>
              <div class="card-body">
                <div v-if="detail.dailyViews.length === 0" class="text-center text-muted py-4">
                  Belum ada data views di rentang ini.
                </div>
                <div v-else class="d-flex flex-column gap-2">
                  <div v-for="row in detail.dailyViews" :key="row.date" class="d-flex align-items-center gap-2">
                    <small class="text-muted" style="width: 90px; flex-shrink: 0;">{{ row.date }}</small>
                    <div class="flex-grow-1 bg-label-secondary rounded" style="height: 18px;">
                      <div
                        class="bg-primary rounded h-100"
                        :style="{ width: barWidth(row.views) + '%' }"
                      ></div>
                    </div>
                    <small class="fw-semibold" style="width: 40px; text-align: right; flex-shrink: 0;">{{ row.views }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="card h-100">
              <div class="card-header"><span class="fw-semibold">Widget Terpopuler di Dashboard Ini</span></div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Widget</th>
                      <th class="text-end">Views</th>
                      <th class="text-end">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="detail.topWidgets.length === 0">
                      <td colspan="3" class="text-center text-muted py-4">Belum ada data.</td>
                    </tr>
                    <tr v-for="row in detail.topWidgets" :key="row.widgetCode">
                      <td><code>{{ row.widgetCode }}</code></td>
                      <td class="text-end">{{ row.views }}</td>
                      <td class="text-end">
                        <span :class="row.errors > 0 ? 'text-danger' : 'text-muted'">{{ row.errors }}</span>
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
import type { DashboardAnalyticsDetail } from '~/composables/useDashboardAnalyticsAdmin'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Analytics Dashboard',
  description: 'Detail analytics 1 dashboard',
})

const route = useRoute()
const dashboardId = computed(() => String(route.params.id))

const { loading, error, fetchDashboardDetail } = useDashboardAnalyticsAdmin()
const detail = ref<DashboardAnalyticsDetail | null>(null)
const days = ref(30)

const maxDailyViews = computed(() => Math.max(1, ...(detail.value?.dailyViews.map((d) => d.views) ?? [1])))
function barWidth(views: number): number {
  return Math.max(4, Math.round((views / maxDailyViews.value) * 100))
}

const avgViewsPerDay = computed(() => {
  if (!detail.value) return 0
  return (detail.value.totalViews / detail.value.days).toFixed(1)
})

async function load() {
  detail.value = await fetchDashboardDetail(dashboardId.value, days.value)
}

onMounted(load)
</script>
