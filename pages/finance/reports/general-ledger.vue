<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <p class="mb-0 text-muted">
            Mutasi akun dari jurnal posted dan reversed, dengan opening, running, dan closing balance.
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" :disabled="loading || !accountId" @click="load">
            <i class="ri-refresh-line me-1"></i> Refresh
          </button>
          <button
            v-if="canExport"
            class="btn btn-outline-primary"
            :disabled="loading || !accountId"
            @click="exportCsv"
          >
            <i class="ri-download-line me-1"></i> Export
          </button>
        </div>
      </div>

      <CollapsibleFilterCard
        title="Filter General Ledger"
        :has-active-filters="hasAdvancedFilters"
        @reset="resetFilters"
      >
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Akun <span class="text-danger">*</span></label>
            <CustomSelect2
              v-model="accountId"
              :options="accountOptions"
              :get-option-label="(o) => o.label || `${o.code} — ${o.name}`"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Cari kode atau nama akun"
              @search="onAccountSearch"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label">Start</label>
            <input v-model="startDate" type="date" class="form-control" />
          </div>
          <div class="col-md-2">
            <label class="form-label">End</label>
            <input v-model="endDate" type="date" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Fiscal Period</label>
            <CustomSelect2
              v-model="fiscalPeriodId"
              :options="fiscalPeriodOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Opsional"
            />
          </div>
          <div class="col-md-4 mt-5">
            <label class="form-label">Perusahaan</label>
            <CustomSelect2
              v-model="perusahaanId"
              :options="perusahaanOptions"
              :get-option-label="(o) => o.name"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Semua"
              @search="(t) => fetchOptions('perusahaan', t)"
            />
          </div>
          <div class="col-md-2 mt-5">
            <label class="form-label">Departemen</label>
            <CustomSelect2
              v-model="departmentId"
              :options="departmentOptions"
              :get-option-label="(o) => o.name"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Opsional"
              @search="(t) => fetchOptions('department', t)"
            />
          </div>
          <div class="col-md-2 mt-5">
            <label class="form-label">Cost Center</label>
            <CustomSelect2
              v-model="costCenterId"
              :options="costCenterOptions"
              :get-option-label="(o) => o.code ? `${o.code} — ${o.name}` : o.name"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Opsional"
              @search="(t) => fetchOptions('costCenter', t)"
            />
          </div>
          <div class="col-md-4 mt-5">
            <label class="form-label">Customer</label>
            <CustomSelect2
              v-model="customerId"
              :options="customerOptions"
              :get-option-label="(o) => o.code ? `${o.code} — ${o.name}` : o.name"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Opsional"
              @search="(t) => fetchOptions('customer', t)"
            />
          </div>
          <div class="col-md-4 mt-5">
            <label class="form-label">Vendor</label>
            <CustomSelect2
              v-model="vendorId"
              :options="vendorOptions"
              :get-option-label="(o) => o.name"
              :reduce="(o) => o.id"
              searchable
              clearable
              placeholder="Opsional"
              @search="(t) => fetchOptions('vendor', t)"
            />
          </div>
          <div class="col-md-4 mt-5">
            <label class="form-label">Source</label>
            <CustomSelect2
              v-model="sourceType"
              :options="sourceOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              clearable
              placeholder="Semua"
            />
          </div>
          <div class="col-md-4 mt-5">
            <label class="form-label">Cari jurnal / deskripsi</label>
            <input v-model="search" type="text" class="form-control" placeholder="Tidak mengubah opening/closing" />
          </div>
          <div class="col-12 d-flex gap-2 mt-5">
            <button type="button" class="btn btn-primary" :disabled="loading || !accountId" @click="applyFilters">
              Terapkan Filter
            </button>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-if="!accountId" class="card">
        <div class="card-body text-center text-muted py-5">
          Pilih akun dan periode untuk menampilkan General Ledger.
        </div>
      </div>

      <div v-else-if="!report && !loading && !error" class="card">
        <div class="card-body text-center text-muted py-5">
          Klik Terapkan Filter untuk menampilkan General Ledger.
        </div>
      </div>

      <template v-else>
        <div v-if="report" class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="text-muted small">Akun</div>
                <div class="fw-semibold">{{ report.account.code }} — {{ report.account.name }}</div>
                <div class="small text-muted">Normal: {{ report.account.normalBalance }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card h-100">
              <div class="card-body">
                <div class="text-muted small">Opening</div>
                <div class="fw-semibold">{{ formatMoney(report.summary.openingBalance) }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card h-100">
              <div class="card-body">
                <div class="text-muted small">Total Debit</div>
                <div class="fw-semibold">{{ formatMoney(report.summary.totalDebit) }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="card h-100">
              <div class="card-body">
                <div class="text-muted small">Total Credit</div>
                <div class="fw-semibold">{{ formatMoney(report.summary.totalCredit) }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="text-muted small">Closing</div>
                <div class="fw-semibold">{{ formatMoney(report.summary.closingBalance) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div v-if="loading" class="text-center py-4 text-muted">Memuat General Ledger…</div>
            <div v-else class="table-responsive">
              <table class="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Journal Number</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Customer / Vendor</th>
                    <th>Dept / CC</th>
                    <th class="text-end">Debit</th>
                    <th class="text-end">Credit</th>
                    <th class="text-end">Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in entries" :key="row.journalLineId">
                    <td>{{ row.date }}</td>
                    <td>
                      <NuxtLink v-if="row.links?.journal" :to="row.links.journal">
                        {{ row.journalNumber }}
                      </NuxtLink>
                      <span v-else>{{ row.journalNumber }}</span>
                    </td>
                    <td>
                      <NuxtLink v-if="row.links?.source" :to="row.links.source">
                        {{ sourceLabel(row) }}
                      </NuxtLink>
                      <span v-else>{{ sourceLabel(row) }}</span>
                    </td>
                    <td>
                      <div>{{ row.lineDescription || row.journalDescription || '—' }}</div>
                    </td>
                    <td>{{ partyLabel(row) }}</td>
                    <td>{{ dimensionLabel(row) }}</td>
                    <td class="text-end">{{ formatAmount(row.debit) }}</td>
                    <td class="text-end">{{ formatAmount(row.credit) }}</td>
                    <td class="text-end fw-semibold">{{ formatMoney(row.runningBalance) }}</td>
                  </tr>
                  <tr v-if="!entries.length">
                    <td colspan="9" class="text-center text-muted">Tidak ada mutasi pada filter ini.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="report && report.pagination.lastPage > 1" class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted small">
                Halaman {{ report.pagination.page }} dari {{ report.pagination.lastPage }}
                ({{ report.pagination.total }} baris)
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="goPage(page - 1)">
                  Sebelumnya
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  :disabled="page >= report.pagination.lastPage"
                  @click="goPage(page + 1)"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { normalizeFailedResponse } from '~/utils/apiError'
import { journalSourceLabel } from '~/utils/journalSourceRoutes'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'General Ledger',
})

const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const route = useRoute()
const router = useRouter()
const formatRupiah = useFormatRupiah()

const report = ref(null)
const loading = ref(false)
const error = ref('')
const accountId = ref('')
const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10))
const endDate = ref(new Date().toISOString().slice(0, 10))
const fiscalPeriodId = ref(null)
const perusahaanId = ref(null)
const departmentId = ref(null)
const costCenterId = ref(null)
const customerId = ref(null)
const vendorId = ref(null)
const sourceType = ref(null)
const search = ref('')
const page = ref(1)
const perPage = ref(25)

const accountOptions = ref([])
const fiscalPeriodOptions = ref([])
const perusahaanOptions = ref([])
const departmentOptions = ref([])
const costCenterOptions = ref([])
const customerOptions = ref([])
const vendorOptions = ref([])
const sourceOptions = ref([])

const canExport = computed(
  () => userHasRole('superadmin') || userHasPermission('export_general_ledger')
)
const entries = computed(() => report.value?.entries || [])
const hasAdvancedFilters = computed(() =>
  Boolean(
    fiscalPeriodId.value ||
      perusahaanId.value ||
      departmentId.value ||
      costCenterId.value ||
      customerId.value ||
      vendorId.value ||
      sourceType.value ||
      search.value
  )
)

function formatMoney(n) {
  return formatRupiah(Number(n || 0))
}
function formatAmount(n) {
  if (!n || Number(n) === 0) return '—'
  return formatMoney(n)
}
function sourceLabel(row) {
  return journalSourceLabel(row.referenceType)
}
function partyLabel(row) {
  if (row.customer?.name) return `Customer: ${row.customer.name}`
  if (row.vendor?.name) return `Vendor: ${row.vendor.name}`
  return '—'
}
function dimensionLabel(row) {
  const parts = []
  if (row.department?.name) parts.push(row.department.name)
  if (row.costCenter?.name) parts.push(row.costCenter.name)
  return parts.join(' / ') || '—'
}

function queryString() {
  const qs = new URLSearchParams()
  qs.set('accountId', accountId.value)
  qs.set('startDate', startDate.value)
  qs.set('endDate', endDate.value)
  if (fiscalPeriodId.value) qs.set('fiscalPeriodId', String(fiscalPeriodId.value))
  if (perusahaanId.value) qs.set('perusahaanId', String(perusahaanId.value))
  if (departmentId.value) qs.set('departmentId', String(departmentId.value))
  if (costCenterId.value) qs.set('costCenterId', String(costCenterId.value))
  if (customerId.value) qs.set('customerId', String(customerId.value))
  if (vendorId.value) qs.set('vendorId', String(vendorId.value))
  if (sourceType.value) qs.set('sourceType', String(sourceType.value))
  if (search.value) qs.set('search', search.value)
  qs.set('page', String(page.value))
  qs.set('perPage', String(perPage.value))
  return qs
}

function syncUrl() {
  router.replace({ query: Object.fromEntries(queryString().entries()) })
}

async function fetchOptions(kind, searchTerm = '') {
  const { $api } = useNuxtApp()
  const qs = new URLSearchParams({ kind, search: searchTerm || '', page: '1', perPage: '20' })
  const res = await fetch($api.generalLedgerFormOptions(qs.toString()), {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) return
  const json = await res.json()
  const rows = json.data || []
  if (kind === 'account') accountOptions.value = rows
  if (kind === 'fiscalPeriod') fiscalPeriodOptions.value = rows
  if (kind === 'perusahaan') perusahaanOptions.value = rows
  if (kind === 'department') departmentOptions.value = rows
  if (kind === 'costCenter') costCenterOptions.value = rows
  if (kind === 'customer') customerOptions.value = rows
  if (kind === 'vendor') vendorOptions.value = rows
  if (kind === 'sourceType') sourceOptions.value = rows
}

const onAccountSearch = useDebounceFn((term) => fetchOptions('account', term || ''), 300)

async function load() {
  if (!accountId.value) {
    report.value = null
    return
  }
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  try {
    syncUrl()
    const res = await fetch($api.generalLedger(queryString().toString()), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) {
      const normalized = await normalizeFailedResponse(res, 'Gagal memuat General Ledger')
      throw new Error(normalized.message)
    }
    const json = await res.json()
    report.value = json.data
  } catch (e) {
    error.value = e.message
    report.value = null
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  load()
}
function resetFilters() {
  fiscalPeriodId.value = null
  perusahaanId.value = null
  departmentId.value = null
  costCenterId.value = null
  customerId.value = null
  vendorId.value = null
  sourceType.value = null
  search.value = ''
  page.value = 1
  if (accountId.value) load()
}
function goPage(next) {
  page.value = next
  load()
}

async function exportCsv() {
  if (!accountId.value) return
  const { $api } = useNuxtApp()
  const res = await fetch($api.generalLedgerExport(queryString().toString()), {
    credentials: 'include',
  })
  if (!res.ok) {
    const normalized = await normalizeFailedResponse(res, 'Gagal mengekspor General Ledger')
    error.value = normalized.message
    return
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `general-ledger-${startDate.value}-${endDate.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function hydrateFromQuery() {
  const q = route.query
  if (q.accountId) accountId.value = String(q.accountId)
  if (q.startDate) startDate.value = String(q.startDate)
  if (q.endDate) endDate.value = String(q.endDate)
  if (q.fiscalPeriodId) fiscalPeriodId.value = String(q.fiscalPeriodId)
  if (q.perusahaanId) perusahaanId.value = Number(q.perusahaanId)
  if (q.departmentId) departmentId.value = Number(q.departmentId)
  if (q.costCenterId) costCenterId.value = Number(q.costCenterId)
  if (q.customerId) customerId.value = Number(q.customerId)
  if (q.vendorId) vendorId.value = Number(q.vendorId)
  if (q.sourceType) sourceType.value = String(q.sourceType)
  if (q.search) search.value = String(q.search)
  if (q.page) page.value = Number(q.page) || 1
}

watch(vendorId, (v) => {
  if (v) customerId.value = null
})
watch(customerId, (v) => {
  if (v) vendorId.value = null
})

onMounted(async () => {
  setListTitle('General Ledger')
  hydrateFromQuery()
  await Promise.all([
    fetchOptions('account'),
    fetchOptions('fiscalPeriod'),
    fetchOptions('sourceType'),
    fetchOptions('perusahaan'),
    fetchOptions('department'),
    fetchOptions('costCenter'),
  ])
  if (accountId.value) await load()
})
</script>
