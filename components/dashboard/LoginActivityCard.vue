<template>
  <div class="card h-100 login-activity-card">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <h5 class="mb-1">Login Activity</h5>
        <p class="mb-0 card-subtitle text-muted">
          Aktivitas login pengguna dalam {{ selectedPeriodLabel }}
        </p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <div class="btn-group btn-group-sm" role="group" aria-label="Periode login activity">
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

    <div class="card-body login-activity-card-body">
      <div v-if="store.loading && !store.stats" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 mb-0 text-muted">Memuat data login activity...</p>
      </div>

      <div v-else-if="store.error && !store.stats" class="text-center py-4">
        <p class="text-danger mb-3">{{ store.error }}</p>
        <button class="btn btn-sm btn-primary" type="button" @click="refresh">Coba Lagi</button>
      </div>

      <template v-else-if="store.currentPeriod">
        <div class="row g-2 mb-3 login-activity-stats">
          <div class="col-sm-6">
            <div class="border rounded p-2">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar avatar-sm">
                  <div class="avatar-initial bg-label-primary rounded-3">
                    <i class="ri-login-box-line"></i>
                  </div>
                </div>
                <div>
                  <p class="mb-0 text-muted small">Total Login</p>
                  <h5 class="mb-0">{{ store.currentPeriod.totalLogins }}</h5>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="border rounded p-2">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar avatar-sm">
                  <div class="avatar-initial bg-label-success rounded-3">
                    <i class="ri-user-line"></i>
                  </div>
                </div>
                <div>
                  <p class="mb-0 text-muted small">User Unik</p>
                  <h5 class="mb-0">{{ store.currentPeriod.uniqueUsers }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="login-activity-chart-container">
          <Chart type="line" :data="store.chartData" :options="store.chartOptions" />
        </div>
      </template>

      <div v-else class="text-center py-4">
        <p class="text-muted mb-0">Belum ada data login activity</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useLoginActivityStore, type LoginActivityPeriodKey } from '~/stores/login-activity'

const store = useLoginActivityStore()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const periodOptions: Array<{ value: LoginActivityPeriodKey; label: string }> = [
  { value: '7', label: '7 Hari' },
  { value: '30', label: '30 Hari' },
  { value: '90', label: '90 Hari' },
]

const selectedPeriodLabel = computed(() => {
  const map: Record<LoginActivityPeriodKey, string> = {
    '7': '7 hari terakhir',
    '30': '30 hari terakhir',
    '90': '90 hari terakhir',
  }
  return map[store.selectedPeriod]
})

const refresh = async () => {
  await store.fetchLoginActivity()
}

onMounted(async () => {
  if (!store.stats) await refresh()
  refreshTimer = setInterval(refresh, 60_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.login-activity-card-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.login-activity-chart-container {
  position: relative;
  flex: 1 1 auto;
  min-height: 180px;
  height: 220px;
}
</style>
