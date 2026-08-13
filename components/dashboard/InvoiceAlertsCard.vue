<template>
  <div class="card h-100 invoice-alerts-card">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="mb-1">Alert Invoice</h5>
          <p class="mb-0 card-subtitle text-muted">
            <span v-if="store.loading">Memuat...</span>
            <span v-else-if="(store.data?.overdueCount ?? 0) > 0">
              {{ store.data?.overdueCount }} lewat jatuh tempo
            </span>
            <span v-else>
              {{ store.data?.total ?? 0 }} invoice perlu perhatian
            </span>
          </p>
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

      <div class="invoice-alert-filters mt-3" role="group" aria-label="Filter alert">
        <button
          v-for="filter in filterOptions"
          :key="filter.value"
          type="button"
          class="invoice-alert-filter-btn btn btn-sm"
          :class="store.selectedFilter === filter.value ? 'btn-primary' : 'btn-outline-primary'"
          :disabled="store.loading"
          :title="filter.title"
          @click="store.setFilter(filter.value)"
        >
          <span class="invoice-alert-filter-label">{{ filter.label }}</span>
          <span v-if="filter.count != null" class="invoice-alert-filter-count">{{ filter.count }}</span>
        </button>
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
        <p class="text-muted mb-0 small">Tidak ada invoice yang perlu perhatian</p>
      </div>

      <div v-else class="invoice-alerts-list">
        <button
          v-for="item in store.items"
          :key="item.invoiceId"
          type="button"
          class="invoice-alert-item w-100 text-start"
          :class="`invoice-alert-item--${item.severity}`"
          @click="openDetail(item)"
        >
          <div class="d-flex align-items-start gap-3">
            <div class="avatar avatar-sm flex-shrink-0">
              <span
                class="avatar-initial rounded"
                :class="`bg-label-${severityVariant(item.severity)}`"
              >
                <i :class="alertIcon(item.alertType)"></i>
              </span>
            </div>

            <div class="flex-grow-1 min-w-0">
              <p class="mb-1 small invoice-alert-text">
                <span class="fw-semibold">{{ item.customerName }}</span>
                <span class="text-muted"> · {{ item.noInvoice }}</span>
              </p>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span
                  class="badge rounded-pill"
                  :class="`bg-label-${severityVariant(item.severity)}`"
                >
                  {{ alertLabel(item.alertType) }}
                </span>
                <small class="text-muted">
                  {{ formatAmount(item.remainingAmount) }}
                  <template v-if="item.dueDate"> · {{ dueLabel(item) }}</template>
                </small>
              </div>
              <div v-if="extraBadges(item).length" class="d-flex flex-wrap gap-1 mt-1">
                <span
                  v-for="badge in extraBadges(item)"
                  :key="badge"
                  class="badge bg-label-secondary rounded-pill"
                >
                  {{ badge }}
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useDashboardInvoiceAlertsStore,
  type InvoiceAlertFilter,
  type InvoiceAlertItem,
  type InvoiceAlertSeverity,
  type InvoiceAlertType,
} from '~/stores/dashboard-invoice-alerts'

const store = useDashboardInvoiceAlertsStore()
const router = useRouter()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const filterOptions = computed(() => {
  const d = store.data
  return [
    {
      value: 'all' as InvoiceAlertFilter,
      label: 'Semua',
      title: 'Semua alert',
      count: d?.total ?? null,
    },
    {
      value: 'overdue' as InvoiceAlertFilter,
      label: 'Overdue',
      title: 'Lewat jatuh tempo',
      count: d?.overdueCount ?? null,
    },
    {
      value: 'unsent' as InvoiceAlertFilter,
      label: 'Kirim',
      title: 'Belum dikirim',
      count: d?.unsentCount ?? null,
    },
    {
      value: 'unpaid' as InvoiceAlertFilter,
      label: 'Bayar',
      title: 'Belum dibayar',
      count: d?.unpaidCount ?? null,
    },
  ]
})

const alertLabel = (type: InvoiceAlertType) => {
  if (type === 'overdue') return 'Lewat Jatuh Tempo'
  if (type === 'unsent') return 'Belum Dikirim'
  return 'Belum Dibayar'
}

const alertIcon = (type: InvoiceAlertType) => {
  if (type === 'overdue') return 'ri-alarm-warning-line'
  if (type === 'unsent') return 'ri-mail-unread-line'
  return 'ri-money-dollar-circle-line'
}

const severityVariant = (severity: InvoiceAlertSeverity) => {
  if (severity === 'critical') return 'danger'
  if (severity === 'warning') return 'warning'
  return 'info'
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const dueLabel = (item: InvoiceAlertItem) => {
  if (!item.dueDate) return ''
  if (item.daysOverdue != null && item.daysOverdue > 0) {
    return `${formatDate(item.dueDate)} · ${item.daysOverdue} hari terlambat`
  }
  if (item.daysUntilDue === 0) return `${formatDate(item.dueDate)} · jatuh tempo hari ini`
  if (item.daysUntilDue != null) return `${formatDate(item.dueDate)} · ${item.daysUntilDue} hari lagi`
  return formatDate(item.dueDate)
}

/** Badge sekunder selain alertType utama (hindari duplikat label). */
const extraBadges = (item: InvoiceAlertItem): string[] => {
  const badges: string[] = []
  if (item.alertType !== 'unsent' && item.isUnsent) badges.push('Belum dikirim')
  if (item.alertType !== 'unpaid' && item.alertType !== 'overdue' && item.isUnpaid) {
    badges.push('Belum dibayar')
  }
  if (item.alertType !== 'overdue' && item.isOverdue) badges.push('Lewat jatuh tempo')
  return badges
}

const refresh = async () => {
  await store.fetchAlerts()
}

const openDetail = async (item: InvoiceAlertItem) => {
  await router.push(`/finance/invoices/detail/${item.invoiceId}`)
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
.invoice-alerts-card {
  min-width: 0;
  overflow: hidden;
}

.invoice-alerts-card .card-header,
.invoice-alerts-card .card-body {
  min-width: 0;
}

.invoice-alert-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  width: 100%;
  min-width: 0;
  container-type: inline-size;
}

.invoice-alert-filter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex: 1 1 calc(50% - 0.375rem);
  min-width: 0;
  max-width: 100%;
  padding: 0.3rem 0.45rem;
  font-size: 0.75rem;
  line-height: 1.2;
  white-space: nowrap;
}

.invoice-alert-filter-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.invoice-alert-filter-count {
  flex-shrink: 0;
  opacity: 0.8;
}

.invoice-alert-filter-count::before {
  content: '(';
}

.invoice-alert-filter-count::after {
  content: ')';
}

/* Card lebar: 4 tab sejajar; sempit: 2x2 wrap */
@container (min-width: 22rem) {
  .invoice-alert-filter-btn {
    flex: 1 1 0;
  }
}

.invoice-alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 22rem;
  overflow-y: auto;
}

.invoice-alert-item {
  border: 1px solid rgba(67, 89, 113, 0.12);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.invoice-alert-item:hover {
  background-color: rgba(0, 143, 236, 0.04);
  border-color: rgba(0, 143, 236, 0.2);
}

.invoice-alert-item--critical {
  border-left: 3px solid #f13636;
}

.invoice-alert-item--warning {
  border-left: 3px solid #ffba2f;
}

.invoice-alert-item--info {
  border-left: 3px solid #008fec;
}

.invoice-alert-text {
  color: #566a7f;
  line-height: 1.45;
}
</style>
