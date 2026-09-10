<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <DetailPageHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
        back-href="/finance/budgets"
        back-label="Kembali ke Budgets"
        breadcrumb-label="Detail Budget"
      >
        <template #badges>
          <span v-if="budget" class="badge" :class="getStatusBadgeClass(budget.status)">
            {{ getStatusLabel(budget.status) }}
          </span>
        </template>
        <template #actions>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            :disabled="loading || historyLoading"
            @click="refresh"
          >
            <i class="ri-refresh-line me-1"></i>
            Refresh
          </button>
        </template>
      </DetailPageHeader>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="card mb-4">
        <div class="card-body text-center text-muted py-4">Memuat detail budget…</div>
      </div>

      <template v-else-if="budget">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Informasi Budget</h5>
          </div>
          <div class="card-body">
            <div class="row g-3 py-3">
              <div class="col-md-6">
                <dl class="row mb-0 small">
                  <dt class="col-5 text-muted">Kode</dt>
                  <dd class="col-7 fw-semibold">{{ budget.budgetCode || '—' }}</dd>
                  <dt class="col-5 text-muted">Nama</dt>
                  <dd class="col-7">{{ budget.budgetName || '—' }}</dd>
                  <dt class="col-5 text-muted">Cost Center</dt>
                  <dd class="col-7">
                    <template v-if="budget.costCenter">
                      {{ budget.costCenter.code }} — {{ budget.costCenter.name }}
                    </template>
                    <template v-else>—</template>
                  </dd>
                </dl>
              </div>
              <div class="col-md-6">
                <dl class="row mb-0 small">
                  <dt class="col-5 text-muted">Total Budget</dt>
                  <dd class="col-7 fw-semibold">{{ formatRupiah(budget.totalAmount) }}</dd>
                  <dt class="col-5 text-muted">Periode</dt>
                  <dd class="col-7">{{ periodLabel }}</dd>
                  <dt class="col-5 text-muted">Status</dt>
                  <dd class="col-7">
                    <span class="badge" :class="getStatusBadgeClass(budget.status)">
                      {{ getStatusLabel(budget.status) }}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 class="card-title mb-0">History</h5>
              <small class="text-muted">
                Riwayat reservasi, komitmen, realisasi, pelepasan, dan transfer budget.
              </small>
            </div>
          </div>
          <div class="card-body">
            <BudgetHistoryTab :budget-id="budgetId" :active="true" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DetailPageHeader from '~/components/DetailPageHeader.vue'
import BudgetHistoryTab from '~/components/budget/BudgetHistoryTab.vue'
import { useBudgetStore } from '~/stores/budget'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useFormatRupiah } from '~/composables/formatRupiah'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail Budget',
})

const route = useRoute()
const budgetStore = useBudgetStore()
const { setListTitle } = useDynamicTitle()
const formatRupiah = useFormatRupiah()

const loading = ref(false)
const error = ref('')
const budget = ref(null)

const budgetId = computed(() => Number(route.params.id))
const historyLoading = computed(() => budgetStore.historyLoading)

const pageTitle = computed(
  () => budget.value?.budgetCode || budget.value?.budgetName || 'Detail Budget'
)
const pageSubtitle = computed(() =>
  budget.value?.budgetName && budget.value?.budgetCode
    ? budget.value.budgetName
    : 'Detail budget dan riwayat aktivitas ledger.'
)
const periodLabel = computed(() => {
  const start = budget.value?.startDate ? String(budget.value.startDate).slice(0, 10) : null
  const end = budget.value?.endDate ? String(budget.value.endDate).slice(0, 10) : null
  if (start && end) return `${start} s/d ${end}`
  if (start) return `Mulai ${start}`
  if (end) return `Sampai ${end}`
  return '—'
})

function getStatusLabel(status) {
  const labels = {
    draft: 'Draft',
    approved: 'Approved',
    rejected: 'Rejected',
    received: 'Received',
  }
  return labels[status] || status || '—'
}

function getStatusBadgeClass(status) {
  const classes = {
    draft: 'bg-label-secondary',
    approved: 'bg-label-success',
    rejected: 'bg-label-danger',
    received: 'bg-label-info',
  }
  return classes[status] || 'bg-label-secondary'
}

async function loadBudget() {
  if (!budgetId.value || Number.isNaN(budgetId.value)) {
    error.value = 'ID budget tidak valid.'
    budget.value = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    budget.value = await budgetStore.fetchBudgetById(budgetId.value)
    setListTitle(budget.value?.budgetCode || 'Detail Budget')
  } catch (e) {
    error.value = e?.message || 'Gagal memuat detail budget.'
    budget.value = null
  } finally {
    loading.value = false
  }
}

async function refresh() {
  await loadBudget()
  if (budgetId.value) {
    await budgetStore.fetchBudgetHistory(budgetId.value, { page: 1 })
  }
}

watch(
  () => route.params.id,
  () => {
    budgetStore.clearHistory()
    loadBudget()
  }
)

onMounted(() => {
  loadBudget()
})

onUnmounted(() => {
  budgetStore.clearHistory()
})
</script>
