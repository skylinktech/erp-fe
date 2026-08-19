<template>
  <div>
    <div v-if="loading && !rows.length" class="text-center py-3 text-muted small">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span class="ms-2">Memuat payslip…</span>
    </div>

    <div v-else-if="error" class="text-muted small">{{ error }}</div>

    <template v-else>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <span class="badge rounded-pill bg-label-primary">Total: {{ stats.total }}</span>
        <span class="badge rounded-pill bg-label-success">Paid: {{ stats.paid }}</span>
        <span class="badge rounded-pill bg-label-warning">Pending: {{ stats.pending }}</span>
        <span v-if="stats.failed" class="badge rounded-pill bg-label-danger">Failed: {{ stats.failed }}</span>
      </div>

      <div class="table-responsive" style="max-height: 280px; overflow-y: auto">
        <table class="table table-sm table-bordered table-striped align-middle mb-0 small">
          <thead class="table-light sticky-top">
            <tr>
              <th>Periode</th>
              <th>Tipe</th>
              <th class="text-end">Net Pay</th>
              <th>Status</th>
              <th class="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>{{ periodLabel(row) }}</td>
              <td>{{ runTypeLabel(row.run?.runType || row.run?.run_type) }}</td>
              <td class="text-end text-nowrap">{{ money(row.netPayAmount ?? row.net_pay_amount) }}</td>
              <td>
                <PayrollRunStatusBadge :status="row.paymentStatus || row.payment_status" />
              </td>
              <td class="text-end">
                <NuxtLink
                  :to="`/payroll/cetak-payslip?id=${row.id}`"
                  class="btn btn-sm btn-outline-primary py-0 px-2"
                >
                  Cetak
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="5" class="text-center text-muted py-2">
                Belum ada payslip yang dipublikasikan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav
        v-if="total > perPage"
        class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3"
        aria-label="Pagination Payslip"
      >
        <small class="text-muted">
          Menampilkan {{ showingFrom }}–{{ showingTo }} dari {{ total }}
        </small>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: page <= 1 }">
            <button
              type="button"
              class="page-link"
              :disabled="page <= 1"
              aria-label="Halaman sebelumnya"
              @click="goToPage(page - 1)"
            >
              <i class="ri-arrow-left-s-line"></i>
            </button>
          </li>
          <li
            v-for="(p, i) in pageNumbers"
            :key="`ps-${i}-${p}`"
            class="page-item"
            :class="{ active: p === page, disabled: p === '…' }"
          >
            <span v-if="p === '…'" class="page-link">…</span>
            <button v-else type="button" class="page-link" @click="goToPage(p)">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: page >= totalPages }">
            <button
              type="button"
              class="page-link"
              :disabled="page >= totalPages"
              aria-label="Halaman berikutnya"
              @click="goToPage(page + 1)"
            >
              <i class="ri-arrow-right-s-line"></i>
            </button>
          </li>
        </ul>
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '~/utils/apiFetch'
import { unwrapPayslipPage, type PayrollPayslipStats } from '~/types/payroll'
import PayrollRunStatusBadge from '~/components/payroll/PayrollRunStatusBadge.vue'

const PER_PAGE = 8

const props = defineProps<{
  pegawaiId: number
}>()

const { $api } = useNuxtApp()
const { money, runTypeLabel } = usePayrollStatus()

const loading = ref(false)
const error = ref<string | null>(null)
const rows = ref<Record<string, any>[]>([])
const page = ref(1)
const perPage = ref(PER_PAGE)
const total = ref(0)
const stats = ref<PayrollPayslipStats>({ total: 0, paid: 0, pending: 0, failed: 0 })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const showingFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1))
const showingTo = computed(() => Math.min(page.value * perPage.value, total.value))

const pageNumbers = computed<(number | '…')[]>(() => {
  const last = totalPages.value
  const current = page.value
  if (last <= 5) return Array.from({ length: last }, (_, i) => i + 1)
  const result: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)
  if (start > 2) result.push('…')
  for (let i = start; i <= end; i++) result.push(i)
  if (end < last - 1) result.push('…')
  result.push(last)
  return result
})

function periodLabel(row: Record<string, any>): string {
  const period = row.run?.period
  return period?.name || period?.code || '—'
}

function goToPage(next: number | '…') {
  if (next === '…') return
  const clamped = Math.min(Math.max(1, next), totalPages.value)
  if (clamped !== page.value) page.value = clamped
}

async function loadPayslips() {
  if (!props.pegawaiId) return
  loading.value = true
  error.value = null
  try {
    const res = await apiFetch<{ data: unknown }>(
      `${$api.payrollEmployeePayslips(props.pegawaiId)}?page=${page.value}&per_page=${PER_PAGE}`,
      { credentials: 'include', skip403Redirect: true }
    )
    const payload = unwrapPayslipPage<Record<string, any>>(res.data)
    rows.value = payload.rows
    total.value = payload.total
    perPage.value = payload.perPage || PER_PAGE
    stats.value = payload.stats
  } catch (e: any) {
    rows.value = []
    total.value = 0
    stats.value = { total: 0, paid: 0, pending: 0, failed: 0 }
    const status = Number(e?.response?.status || e?.statusCode || e?.status || e?.data?.status)
    error.value =
      status === 403
        ? 'Anda tidak memiliki akses ke payslip pegawai ini.'
        : e?.data?.message || e?.message || 'Gagal memuat payslip.'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.pegawaiId, page.value] as const,
  () => {
    loadPayslips()
  },
  { immediate: true }
)
</script>
