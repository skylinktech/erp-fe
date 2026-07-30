<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div class="d-flex align-items-center gap-2">
          <NuxtLink to="/admin/dashboards/widgets" class="btn btn-icon btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line"></i>
          </NuxtLink>
          <div>
            <h4 class="mb-1">Analytics — {{ detail?.widget?.title || 'Widget' }}</h4>
            <p class="mb-0 text-muted">Ringkasan pemakaian widget ini lintas seluruh dashboard.</p>
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
                <h4 class="mb-0">{{ detail.views.toLocaleString('id-ID') }}</h4>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <p class="text-muted mb-1 small">Total Errors</p>
                <h4 class="mb-0">{{ detail.errors.toLocaleString('id-ID') }}</h4>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <p class="text-muted mb-1 small">Error Rate</p>
                <h4 class="mb-0" :class="detail.errorRate > 5 ? 'text-danger' : ''">{{ detail.errorRate }}%</h4>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="fw-semibold">Dipakai di Dashboard</span></div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Dashboard</th>
                  <th class="text-end">Views</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="detail.usedInDashboards.length === 0">
                  <td colspan="2" class="text-center text-muted py-4">Belum ada data.</td>
                </tr>
                <tr v-for="row in detail.usedInDashboards" :key="row.dashboardCode">
                  <td><code>{{ row.dashboardCode }}</code></td>
                  <td class="text-end">{{ row.views.toLocaleString('id-ID') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDashboardAnalyticsAdmin } from '~/composables/useDashboardAnalyticsAdmin'
import type { WidgetAnalyticsDetail } from '~/composables/useDashboardAnalyticsAdmin'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Analytics Widget',
  description: 'Detail analytics 1 widget',
})

const route = useRoute()
const widgetId = computed(() => String(route.params.id))

const { loading, error, fetchWidgetDetail } = useDashboardAnalyticsAdmin()
const detail = ref<WidgetAnalyticsDetail | null>(null)
const days = ref(30)

async function load() {
  detail.value = await fetchWidgetDetail(widgetId.value, days.value)
}

onMounted(load)
</script>
