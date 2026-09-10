<template>
  <div class="budget-history-tab py-3">
    <div class="row g-2 align-items-end mb-3">
      <div class="col-md-2 col-6">
        <label class="form-label small">Tipe</label>
        <select v-model="filters.type" class="form-select form-select-sm">
          <option :value="null">Semua</option>
          <option value="reserve">Reserve</option>
          <option value="commit">Commit</option>
          <option value="actual">Actual</option>
          <option value="release">Release</option>
          <option value="transfer_in">Transfer In</option>
          <option value="transfer_out">Transfer Out</option>
        </select>
      </div>
      <div class="col-md-2 col-6">
        <label class="form-label small">Sumber</label>
        <select v-model="filters.sourceType" class="form-select form-select-sm">
          <option :value="null">Semua</option>
          <option value="purchase_order">Purchase Order</option>
          <option value="purchase_invoice">Purchase Invoice</option>
          <option value="purchase_request">Purchase Request</option>
        </select>
      </div>
      <div class="col-md-2 col-6">
        <label class="form-label small">Start</label>
        <input v-model="filters.startDate" type="date" class="form-control form-control-sm" />
      </div>
      <div class="col-md-2 col-6">
        <label class="form-label small">End</label>
        <input v-model="filters.endDate" type="date" class="form-control form-control-sm" />
      </div>
      <div class="col-md-3 col-8">
        <label class="form-label small">Cari (notes/event)</label>
        <input
          v-model="filters.search"
          type="text"
          class="form-control form-control-sm"
          placeholder="Tidak mengubah running available"
        />
      </div>
      <div class="col-md-1 col-4 d-flex gap-1">
        <button
          type="button"
          class="btn btn-primary btn-sm w-100"
          :disabled="historyLoading"
          @click="applyFilters"
        >
          Filter
        </button>
      </div>
    </div>

    <div v-if="historyError" class="alert alert-danger">{{ historyError }}</div>

    <BudgetHistorySummary v-if="historyReport" :summary="historyReport.summary" />

    <div class="card">
      <div class="card-body">
        <div v-if="historyLoading" class="text-center py-4 text-muted">Memuat history budget…</div>
        <div v-else class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th class="text-end">Nominal</th>
                <th>Sumber</th>
                <th>Aktor</th>
                <th>Catatan</th>
                <th class="text-end">Running Available</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>{{ formatDate(row.effectiveAt) }}</td>
                <td>
                  <span class="badge" :class="typeBadgeClass(row.type)">{{ row.typeLabel }}</span>
                </td>
                <td class="text-end">{{ formatMoney(row.amount) }}</td>
                <td>
                  <NuxtLink v-if="sourceDisplay(row).link" :to="sourceDisplay(row).link">
                    {{ sourceDisplay(row).label }} · {{ sourceDisplay(row).number }}
                  </NuxtLink>
                  <span v-else>{{ sourceDisplay(row).label }}</span>
                </td>
                <td>{{ row.actor?.fullName || '—' }}</td>
                <td class="small text-muted">{{ row.notes || '—' }}</td>
                <td class="text-end fw-semibold">{{ formatMoney(row.runningAvailable) }}</td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="7" class="text-center text-muted">Tidak ada mutasi pada filter ini.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="historyReport && historyReport.pagination.lastPage > 1"
          class="d-flex justify-content-between align-items-center mt-3"
        >
          <div class="text-muted small">
            Halaman {{ historyReport.pagination.page }} dari {{ historyReport.pagination.lastPage }}
            ({{ historyReport.pagination.total }} baris)
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-sm btn-outline-secondary"
              :disabled="historyReport.pagination.page <= 1 || historyLoading"
              @click="goPage(historyReport.pagination.page - 1)"
            >
              Sebelumnya
            </button>
            <button
              class="btn btn-sm btn-outline-secondary"
              :disabled="historyReport.pagination.page >= historyReport.pagination.lastPage || historyLoading"
              @click="goPage(historyReport.pagination.page + 1)"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { budgetSourceDisplay } from '~/utils/budgetSourceRoutes'
import BudgetHistorySummary from '~/components/budget/BudgetHistorySummary.vue'

const props = defineProps({
  budgetId: {
    type: [Number, String],
    default: null,
  },
  /** Set to false while the tab is not the active step to avoid fetching until shown. */
  active: {
    type: Boolean,
    default: true,
  },
})

const budgetStore = useBudgetStore()
const formatRupiah = useFormatRupiah()

const historyLoading = computed(() => budgetStore.historyLoading)
const historyError = computed(() => budgetStore.historyError)
const historyReport = computed(() => budgetStore.historyReport)
const rows = computed(() => historyReport.value?.history || [])

const filters = reactive({
  type: null,
  sourceType: null,
  startDate: null,
  endDate: null,
  search: '',
})

function formatMoney(n) {
  return formatRupiah(Number(n || 0))
}
function formatDate(iso) {
  if (!iso) return '—'
  return String(iso).slice(0, 10)
}
function sourceDisplay(row) {
  return budgetSourceDisplay(row.sourceDocument)
}
function typeBadgeClass(type) {
  const classes = {
    reserve: 'bg-label-warning',
    commit: 'bg-label-info',
    actual: 'bg-label-primary',
    release: 'bg-label-success',
    transfer_in: 'bg-label-success',
    transfer_out: 'bg-label-danger',
  }
  return classes[type] || 'bg-label-secondary'
}

function load(page = 1) {
  if (!props.budgetId) return
  budgetStore.fetchBudgetHistory(props.budgetId, { ...filters, page })
}

function applyFilters() {
  load(1)
}

function goPage(page) {
  load(page)
}

let hasLoadedOnce = false
watch(
  () => [props.budgetId, props.active],
  ([budgetId, active]) => {
    if (budgetId && active && !hasLoadedOnce) {
      hasLoadedOnce = true
      load(1)
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.budgetId && props.active && !hasLoadedOnce) {
    hasLoadedOnce = true
    load(1)
  }
})

onUnmounted(() => {
  budgetStore.clearHistory()
})
</script>
