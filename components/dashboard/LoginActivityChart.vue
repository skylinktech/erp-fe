<template>
  <div class="card login-activity-card">
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
            :class="loginActivityStore.selectedPeriod === period.value ? 'btn-primary' : 'btn-outline-primary'"
            :disabled="loginActivityStore.loading"
            @click="loginActivityStore.setPeriod(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
        <button
          class="btn btn-sm btn-outline-secondary"
          type="button"
          :disabled="loginActivityStore.loading"
          @click="refresh"
        >
          <i class="ri-refresh-line"></i>
        </button>
      </div>
    </div>

    <div class="card-body login-activity-card-body">
      <div v-if="loginActivityStore.loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 mb-0 text-muted">Memuat data login activity...</p>
      </div>

      <div v-else-if="loginActivityStore.error" class="text-center py-4">
        <p class="text-danger mb-3">{{ loginActivityStore.error }}</p>
        <button class="btn btn-sm btn-primary" type="button" @click="refresh">Coba Lagi</button>
      </div>

      <template v-else-if="loginActivityStore.currentPeriod">
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
                  <h5 class="mb-0">{{ loginActivityStore.currentPeriod.totalLogins }}</h5>
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
                  <h5 class="mb-0">{{ loginActivityStore.currentPeriod.uniqueUsers }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="login-activity-chart-container">
          <Chart
            type="line"
            :data="loginActivityStore.chartData"
            :options="loginActivityStore.chartOptions"
          />
        </div>
      </template>

      <div v-else class="text-center py-4">
        <p class="text-muted mb-0">Belum ada data login activity</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLoginActivityStore, type LoginActivityPeriodKey } from '~/stores/login-activity'

const loginActivityStore = useLoginActivityStore()

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
  return map[loginActivityStore.selectedPeriod]
})

const refresh = async () => {
  await loginActivityStore.fetchLoginActivity()
}

onMounted(async () => {
  if (!loginActivityStore.stats) {
    await refresh()
  }
})
</script>

<style scoped>
.login-activity-card {
  height: auto;
}

.login-activity-card-body {
  padding-bottom: 1rem;
}

.login-activity-chart-container {
  position: relative;
  height: 220px;
}

@media (max-width: 768px) {
  .login-activity-chart-container {
    height: 200px;
  }
}
</style>
