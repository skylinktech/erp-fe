<template>
  <div class="card h-100 revenue-card">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <h5 class="mb-1">Revenue</h5>
        <p class="mb-0 card-subtitle text-muted">
          Total revenue per bulan ({{ selectedPeriodLabel }})
        </p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <div class="btn-group btn-group-sm" role="group" aria-label="Periode revenue">
          <button
            v-for="period in periodOptions"
            :key="period.value"
            type="button"
            class="btn"
            :class="store.selectedPeriod === period.value ? 'btn-primary' : 'btn-outline-primary'"
            :disabled="store.loading"
            @click="store.setPeriod(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
        <button
          class="btn btn-sm btn-outline-secondary"
          type="button"
          :disabled="store.loading"
          @click="refresh"
        >
          <i class="ri-refresh-line"></i>
        </button>
      </div>
    </div>

    <div class="card-body revenue-card-body">
      <div v-if="store.loading && !store.stats" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 mb-0 text-muted">Memuat data revenue...</p>
      </div>

      <div v-else-if="store.error && !store.stats" class="text-center py-4">
        <p class="text-danger mb-3">{{ store.error }}</p>
        <button class="btn btn-sm btn-primary" type="button" @click="refresh">Coba Lagi</button>
      </div>

      <template v-else-if="store.stats">
        <div class="row g-2 mb-3">
          <div class="col-sm-6">
            <div class="border rounded p-2">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar avatar-sm">
                  <div class="avatar-initial bg-label-primary rounded-3">
                    <i class="ri-funds-line"></i>
                  </div>
                </div>
                <div>
                  <p class="mb-0 text-muted small">Total Revenue</p>
                  <h5 class="mb-0">{{ store.formattedTotalRevenue }}</h5>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="border rounded p-2">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar avatar-sm">
                  <div class="avatar-initial bg-label-success rounded-3">
                    <i class="ri-calendar-line"></i>
                  </div>
                </div>
                <div>
                  <p class="mb-0 text-muted small">Rata-rata / Bulan</p>
                  <h5 class="mb-0">{{ store.formattedAveragePerMonth }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="revenue-chart-container">
          <Chart type="line" :data="store.chartData" :options="store.chartOptions" />
        </div>
      </template>

      <div v-else class="text-center py-4">
        <p class="text-muted mb-0">Belum ada data revenue</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRevenueStore, type RevenuePeriodKey } from '~/stores/revenue'

const store = useRevenueStore()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const periodOptions: Array<{ value: RevenuePeriodKey; label: string }> = [
  { value: '6', label: '6 Bln' },
  { value: '12', label: '12 Bln' },
  { value: '24', label: '24 Bln' },
]

const selectedPeriodLabel = computed(() => {
  const map: Record<RevenuePeriodKey, string> = {
    '6': '6 bulan terakhir',
    '12': '12 bulan terakhir',
    '24': '24 bulan terakhir',
  }
  return map[store.selectedPeriod]
})

const refresh = async () => {
  await store.fetchRevenue()
}

onMounted(async () => {
  if (!store.stats) await refresh()
  refreshTimer = setInterval(refresh, 120_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.revenue-card-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.revenue-chart-container {
  position: relative;
  flex: 1 1 auto;
  min-height: 180px;
  height: 220px;
}
</style>
