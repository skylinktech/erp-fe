<template>
  <div class="card h-100">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="mb-1">Kontrak &amp; Layanan Berakhir</h5>
          <p class="mb-0 card-subtitle text-muted">
            <span v-if="store.loading">Memuat...</span>
            <span v-else-if="store.criticalCount > 0">
              {{ store.criticalCount }} kritis (≤7 hari)
            </span>
            <span v-else>
              {{ store.data?.total ?? 0 }} item dalam {{ store.selectedPeriod }} hari
            </span>
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="btn-group btn-group-sm" role="group" aria-label="Jendela hari">
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
            type="button"
            class="btn btn-sm btn-outline-secondary"
            :disabled="store.loading"
            @click="refresh"
          >
            <i class="ri-refresh-line"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="card-body">
      <div v-if="store.loading && !store.data" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="store.error && !store.data" class="text-center py-4">
        <p class="text-danger small mb-2">{{ store.error }}</p>
        <button type="button" class="btn btn-sm btn-primary" @click="refresh">Coba Lagi</button>
      </div>

      <div v-else-if="store.isEmpty" class="text-center py-4">
        <i class="ri-checkbox-circle-line ri-32px text-muted mb-2 d-block"></i>
        <p class="text-muted mb-0 small">
          Tidak ada kontrak/layanan yang berakhir dalam {{ store.selectedPeriod }} hari
        </p>
      </div>

      <div v-else class="expiring-list">
        <button
          v-for="item in store.items"
          :key="itemKey(item)"
          type="button"
          class="expiring-item w-100 text-start"
          :class="`expiring-item--${item.severity}`"
          @click="openDetail(item)"
        >
          <div class="d-flex align-items-start gap-3">
            <div class="avatar avatar-sm flex-shrink-0">
              <span
                class="avatar-initial rounded"
                :class="`bg-label-${severityVariant(item.severity)}`"
              >
                <i :class="typeIcon(item.type)"></i>
              </span>
            </div>

            <div class="flex-grow-1 min-w-0">
              <p class="mb-1 small expiring-text">
                <span class="fw-semibold">{{ item.customerName }}</span>
                <span class="text-muted"> · {{ item.noSubscription }}</span>
              </p>
              <p v-if="item.type === 'service' && item.serviceName" class="mb-1 small text-muted text-truncate">
                {{ item.serviceName }}
              </p>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span
                  class="badge rounded-pill"
                  :class="`bg-label-${severityVariant(item.severity)}`"
                >
                  {{ typeLabel(item.type) }}
                </span>
                <small class="text-muted">
                  {{ formatEndDate(item.endDate) }} · {{ daysLabel(item.daysRemaining) }}
                </small>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useDashboardExpiringContractsStore,
  type ExpiringContractItem,
  type ExpiringPeriodKey,
  type ExpiringSeverity,
} from '~/stores/dashboard-expiring-contracts'

const store = useDashboardExpiringContractsStore()
const router = useRouter()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const periodOptions: Array<{ value: ExpiringPeriodKey; label: string }> = [
  { value: '7', label: '7h' },
  { value: '14', label: '14h' },
  { value: '30', label: '30h' },
]

const itemKey = (item: ExpiringContractItem) =>
  `${item.type}-${item.subscriptionId}-${item.serviceId ?? 'contract'}-${item.endDate}`

const typeLabel = (type: ExpiringContractItem['type']) =>
  type === 'contract' ? 'Kontrak' : 'Layanan'

const typeIcon = (type: ExpiringContractItem['type']) =>
  type === 'contract' ? 'ri-file-list-3-line' : 'ri-wireless-charging-line'

const severityVariant = (severity: ExpiringSeverity) => {
  if (severity === 'critical') return 'danger'
  if (severity === 'warning') return 'warning'
  return 'info'
}

const daysLabel = (days: number) => {
  if (days <= 0) return 'Hari ini'
  if (days === 1) return '1 hari lagi'
  return `${days} hari lagi`
}

const formatEndDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const refresh = async () => {
  await store.fetchExpiring()
}

const openDetail = async (item: ExpiringContractItem) => {
  await router.push(`/order-process/subscription/detail/${item.subscriptionId}`)
}

onMounted(async () => {
  await refresh()
  refreshTimer = setInterval(() => {
    void refresh()
  }, 120_000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.expiring-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 22rem;
  overflow-y: auto;
}

.expiring-item {
  border: 1px solid rgba(67, 89, 113, 0.12);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.expiring-item:hover {
  background-color: rgba(0, 143, 236, 0.04);
  border-color: rgba(0, 143, 236, 0.2);
}

.expiring-item--critical {
  border-left: 3px solid #f13636;
}

.expiring-item--warning {
  border-left: 3px solid #ffba2f;
}

.expiring-item--info {
  border-left: 3px solid #008fec;
}

.expiring-text {
  color: #566a7f;
  line-height: 1.45;
}
</style>
