<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <h4 class="fw-semibold mb-4">Payslip saya</h4>
      <ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />
      <div class="card mb-4">
        <div class="card-body">
          <label class="form-label">Cari</label>
          <InputText v-model="search" placeholder="Cari periode atau tipe..." class="w-100" />
        </div>
      </div>
      <div v-if="!loading && !rows.length" class="card">
        <div class="card-body text-muted">Belum ada payslip.</div>
      </div>
      <div v-else-if="rows.length" class="row g-4">
        <div v-for="p in rows" :key="p.id" class="col-md-6 col-xl-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="mb-1">{{ p.run?.period?.name || p.run?.period?.code || 'Periode' }}</h5>
              <p class="text-muted mb-3">{{ p.run?.runType || p.run?.run_type }}</p>
              <p class="mb-1">Net Pay: <strong>{{ money(p.netPayAmount || p.net_pay_amount) }}</strong></p>
              <p class="mb-3"><PayrollRunStatusBadge :status="p.paymentStatus || p.payment_status" /></p>
              <NuxtLink :to="`/payroll/cetak-payslip?id=${p.id}`" class="btn btn-primary w-100">View Payslip</NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <nav
        v-if="total > perPage"
        class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4"
        aria-label="Pagination Payslip Saya"
      >
        <small class="text-muted">Menampilkan {{ showingFrom }}–{{ showingTo }} dari {{ total }}</small>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: page <= 1 }">
            <button type="button" class="page-link" :disabled="page <= 1" @click="page -= 1">
              <i class="ri-arrow-left-s-line"></i>
            </button>
          </li>
          <li class="page-item disabled">
            <span class="page-link">{{ page }} / {{ totalPages }}</span>
          </li>
          <li class="page-item" :class="{ disabled: page >= totalPages }">
            <button type="button" class="page-link" :disabled="page >= totalPages" @click="page += 1">
              <i class="ri-arrow-right-s-line"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
<script setup lang="ts">
import { apiFetch } from '~/utils/apiFetch'
import { toastApiError } from '~/utils/apiError'
import type { ListPageStatItem } from '~/components/list/ListPageStatsCards.vue'
import { unwrapPayslipPage, type PayrollPayslipStats } from '~/types/payroll'

definePageMeta({ title: 'Payslip Saya', middleware: ['auth', 'check-permission'], alias: '/payroll/me/payslips' })

const { money } = usePayrollStatus()
const { $api } = useNuxtApp()
const loading = ref(true)
const search = ref('')
const page = ref(1)
const perPage = ref(20)
const total = ref(0)
const rows = ref<any[]>([])
const stats = ref<PayrollPayslipStats>({ total: 0, paid: 0, pending: 0, failed: 0 })
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const showingFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
const showingTo = computed(() => Math.min(page.value * perPage.value, total.value))

const statItems = computed<ListPageStatItem[]>(() => [
  { label: 'Payslip', value: stats.value.total, icon: 'ri-file-user-line', iconBgClass: 'bg-label-primary' },
  { label: 'Pending', value: stats.value.pending, icon: 'ri-time-line', iconBgClass: 'bg-label-warning' },
  { label: 'Paid', value: stats.value.paid, icon: 'ri-checkbox-circle-line', iconBgClass: 'bg-label-success' },
])

async function loadMine() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      per_page: String(perPage.value),
    })
    const q = search.value.trim()
    if (q) params.set('search', q)
    const res = await apiFetch<{ data: unknown }>(`${$api.payrollMePayslips()}?${params}`, {
      credentials: 'include',
    })
    const payload = unwrapPayslipPage<any>(res.data)
    rows.value = payload.rows
    total.value = payload.total
    perPage.value = payload.perPage || 20
    stats.value = payload.stats
  } catch (error) {
    toastApiError(error, 'Payslip gagal dimuat.')
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch(search, () => {
  if (page.value !== 1) page.value = 1
})

let loadTimer: ReturnType<typeof setTimeout> | undefined
watch(
  [page, search],
  () => {
    clearTimeout(loadTimer)
    loadTimer = setTimeout(loadMine, 250)
  },
  { immediate: true }
)
</script>
