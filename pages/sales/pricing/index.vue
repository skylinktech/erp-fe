<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        Kelola harga jual produk.
      </p>

      <ListPageStatsCards :items="statCards" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Pricing"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="3">
          <FilterField>
            <ActiveCompanyField input-id="pricing-company" label-text="Perusahaan" />
          </FilterField>
          <FilterField>
            <label class="form-label">Kanal</label>
            <CustomSelect2
              v-model="filters.channel"
              :options="channelOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => String(o.value)"
              searchable
              clearable
              placeholder="Semua kanal"
              @update:model-value="onFilterChange"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Status</label>
            <CustomSelect2
              v-model="filters.status"
              :options="statusOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => String(o.value)"
              searchable
              clearable
              placeholder="Semua status"
              @update:model-value="onStatusFilterChange"
            />
          </FilterField>
        </FilterFieldsRow>
        <div class="col-12 d-flex justify-content-end mt-4">
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
            <i class="ri-refresh-line me-1"></i>
            Reset Filter
          </button>
        </div>
      </CollapsibleFilterCard>

      <div v-if="error" class="alert alert-danger text-break mb-4">{{ error }}</div>

      <div class="col-12">
        <div class="card">
          <ListPageTableHeader
            :rows="Number(tableRows)"
            :rows-options="rowsPerPageOptions"
            :search="globalFilterValue"
            search-placeholder="Cari berdasarkan kode daftar harga…"
            :show-export="false"
            @update:rows="onToolbarRows"
            @update:search="onToolbarSearch"
          >
            <template #add>
              <button
                v-if="canCreate"
                type="button"
                class="btn btn-primary"
                :disabled="!activeCompanyReady"
                @click="goCreate"
              >
                <i class="ri-add-line me-1"></i>
                Tambah Daftar Harga
              </button>
            </template>
          </ListPageTableHeader>

          <div class="card-datatable table-responsive py-3 px-3">
            <MyDataTable
              :data="pagedRows"
              :rows="Number(tableRows)"
              :loading="loading"
              :total-records="filteredRows.length"
              :first="tableFirst"
              :expanded-rows="expandedRows"
              @page="onPage"
              @row-toggle="onRowToggle"
              responsive-layout="scroll"
              paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
            >
              <Column :expander="true" header-style="width: 3rem" />
              <Column header="#" :sortable="false">
                <template #body="slotProps">
                  {{ tableFirst + slotProps.index + 1 }}
                </template>
              </Column>
              <Column field="code" header="Kode" :sortable="true">
                <template #body="slotProps">
                  <a
                    v-if="canShow"
                    href="javascript:void(0)"
                    class="text-primary text-decoration-underline"
                    @click="goDetail(slotProps.data)"
                  >
                    {{ slotProps.data.code || '—' }}
                  </a>
                  <span v-else>{{ slotProps.data.code || '—' }}</span>
                </template>
              </Column>
              <Column field="channel" header="Kanal" :sortable="true">
                <template #body="slotProps">
                  <span class="badge bg-label-primary">{{ slotProps.data.channel || '—' }}</span>
                </template>
              </Column>
              <Column field="perusahaanId" header="Perusahaan" :sortable="true">
                <template #body="slotProps">
                  <span class="text-break">{{ companyLabelFor(slotProps.data.perusahaanId) }}</span>
                </template>
              </Column>
              <Column field="status" header="Status" :sortable="true">
                <template #body="slotProps">
                  <span :class="statusBadge(slotProps.data.status).class">
                    {{ statusBadge(slotProps.data.status).text }}
                  </span>
                </template>
              </Column>
              <Column header="Berlaku" :sortable="false">
                <template #body="slotProps">
                  {{ dateOf(slotProps.data.validFrom) }} – {{ dateOf(slotProps.data.validTo) || 'terbuka' }}
                </template>
              </Column>
              <Column header="Baris Harga" :sortable="false">
                <template #body="slotProps">
                  {{ (slotProps.data.lines || []).length }}
                </template>
              </Column>
              <Column header="Actions" :exportable="false" style="min-width:8rem">
                <template #body="slotProps">
                  <div class="dropdown d-inline-block">
                    <a
                      href="javascript:;"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                      data-bs-toggle="dropdown"
                      data-bs-popper-config='{"strategy":"fixed"}'
                    >
                      <i class="ri-more-2-fill"></i>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end pricing-actions-dropdown">
                      <li v-if="canShow">
                        <a
                          class="dropdown-item"
                          href="javascript:void(0)"
                          @click="goDetail(slotProps.data)"
                        >
                          <i class="ri-eye-line me-2"></i> Lihat Detail
                        </a>
                      </li>
                      <li v-if="slotProps.data.status === 'draft' && canCreate">
                        <a
                          class="dropdown-item"
                          href="javascript:void(0)"
                          @click="goEdit(slotProps.data)"
                        >
                          <i class="ri-edit-box-line me-2"></i> Edit
                        </a>
                      </li>
                      <li v-if="slotProps.data.status === 'draft' && canCreate">
                        <a
                          class="dropdown-item"
                          href="javascript:void(0)"
                          @click="act(slotProps.data.id, 'submit')"
                        >
                          <i class="ri-send-plane-line me-2"></i> Ajukan
                        </a>
                      </li>
                      <li v-if="slotProps.data.status === 'pending' && canApprove">
                        <a
                          class="dropdown-item"
                          href="javascript:void(0)"
                          @click="act(slotProps.data.id, 'approve')"
                        >
                          <i class="ri-checkbox-circle-line me-2"></i> Setujui
                        </a>
                      </li>
                      <li v-if="slotProps.data.status === 'approved' && canActivate">
                        <a
                          class="dropdown-item"
                          href="javascript:void(0)"
                          @click="act(slotProps.data.id, 'activate')"
                        >
                          <i class="ri-play-circle-line me-2"></i> Aktifkan
                        </a>
                      </li>
                      <li v-if="slotProps.data.status === 'active' && canActivate">
                        <a
                          class="dropdown-item text-warning"
                          href="javascript:void(0)"
                          @click="act(slotProps.data.id, 'deactivate')"
                        >
                          <i class="ri-pause-circle-line me-2"></i> Nonaktifkan
                        </a>
                      </li>
                      <li v-if="canDeleteRow(slotProps.data)">
                        <a
                          class="dropdown-item text-danger"
                          href="javascript:void(0)"
                          @click="confirmDelete(slotProps.data)"
                        >
                          <i class="ri-delete-bin-7-line me-2"></i> Hapus
                        </a>
                      </li>
                    </ul>
                  </div>
                </template>
              </Column>

              <template #expansion="{ data }">
                <div class="p-3 bg-light">
                  <h6 class="mb-3">Baris Harga Produk</h6>
                  <div v-if="data.lines?.length" class="table-responsive">
                    <table class="table table-sm table-bordered mb-0">
                      <thead>
                        <tr>
                          <th style="width: 60px">#</th>
                          <th>SKU</th>
                          <th>Produk</th>
                          <th>Jenis</th>
                          <th>Unit</th>
                          <th>Harga Resmi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(ln, index) in data.lines" :key="ln.id || index">
                          <td>{{ index + 1 }}</td>
                          <td>{{ ln.product?.sku || ln.productId || '—' }}</td>
                          <td class="text-break">{{ ln.product?.name || '—' }}</td>
                          <td>
                            <span
                              v-if="ln.product?.isBundling || ln.product?.isKit"
                              class="badge bg-label-info"
                            >Bundling</span>
                            <span v-else class="badge bg-label-secondary">Satuan</span>
                          </td>
                          <td>{{ ln.unit?.name || ln.unit?.symbol || ln.unitId || '—' }}</td>
                          <td>{{ formatMoney(ln.officialUnitPrice) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else class="text-muted">Belum ada baris harga pada daftar ini.</div>
                </div>
              </template>
            </MyDataTable>
          </div>
        </div>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import Column from 'primevue/column'
import { usePermissions } from '~/composables/usePermissions'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { formatActiveCompanyLabel } from '~/utils/activeCompanyBinding'
import { readAccessToken } from '~/utils/authCookie'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const activeCompany = useActiveCompany()
const {
  ready: activeCompanyReady,
  requireCompanyId,
  ensureBootstrapped,
  allowedCompanies,
  company,
  companyId,
} = activeCompany
void ensureBootstrapped()

const canCreate = computed(
  () => userHasRole('admin') || userHasRole('superadmin') || userHasPermission('create_product_price_list')
)
const canShow = computed(
  () => userHasRole('superadmin') || userHasPermission('show_product_price_list')
)
const canApprove = computed(
  () => userHasRole('admin') || userHasRole('superadmin') || userHasPermission('approve_product_price_list')
)
const canActivate = computed(
  () => userHasRole('admin') || userHasRole('superadmin') || userHasPermission('activate_product_price_list')
)

function canDeleteRow(row: { status?: string }) {
  if (userHasRole('superadmin')) return true
  return userHasPermission('delete_product_price_list') && row.status === 'draft'
}

const rows = ref<any[]>([])
const error = ref('')
const loading = ref(false)
const globalFilterValue = ref('')
const tableRows = ref(10)
const tableFirst = ref(0)
const rowsPerPageOptions = [10, 25, 50, 100]
const expandedRows = ref<Record<string, boolean>>({})

const filters = ref<{ channel: string | null; status: string | null }>({
  channel: 'RETAIL',
  status: null,
})

const channelOptions = [
  { value: 'RETAIL', label: 'RETAIL (POS / Direct Sale)' },
  { value: 'PRODUCT_QUOTATION', label: 'PRODUCT_QUOTATION' },
]
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const companyNameById = computed(() => {
  const map = new Map<number, string>()
  for (const row of allowedCompanies.value) {
    map.set(row.id, formatActiveCompanyLabel({ name: row.name, code: row.code }, row.id))
  }
  if (company.value && companyId.value) {
    map.set(companyId.value, formatActiveCompanyLabel(company.value, companyId.value))
  }
  return map
})

const filteredRows = computed(() => {
  const q = globalFilterValue.value.trim().toLowerCase()
  const status = filters.value.status
  return rows.value.filter((row) => {
    if (status && String(row.status) !== status) return false
    if (q && !String(row.code || '').toLowerCase().includes(q)) return false
    return true
  })
})

const pagedRows = computed(() => {
  const start = tableFirst.value
  return filteredRows.value.slice(start, start + Number(tableRows.value))
})

const hasActiveFilters = computed(
  () => !!filters.value.channel || !!filters.value.status || !!globalFilterValue.value.trim()
)

const statCards = computed(() => {
  const all = rows.value
  const count = (status: string) => all.filter((r) => r.status === status).length
  return [
    {
      key: 'total',
      label: 'Total Daftar',
      value: all.length,
      subtitle: 'Semua status (filter kanal aktif)',
      icon: 'ri-price-tag-3-line',
      iconBgClass: 'bg-label-primary',
      info: {
        title: 'Total Daftar Harga',
        description: 'Jumlah daftar harga jual produk pada kanal dan perusahaan yang sedang difilter.',
      },
    },
    {
      key: 'draft',
      label: 'Draft',
      value: count('draft'),
      icon: 'ri-draft-line',
      iconBgClass: 'bg-label-secondary',
    },
    {
      key: 'pending',
      label: 'Pending',
      value: count('pending'),
      icon: 'ri-time-line',
      iconBgClass: 'bg-label-warning',
    },
    {
      key: 'active',
      label: 'Active',
      value: count('active'),
      icon: 'ri-checkbox-circle-line',
      iconBgClass: 'bg-label-success',
    },
  ]
})

function companyLabelFor(id: number | null | undefined) {
  if (id == null) return '—'
  return companyNameById.value.get(Number(id)) || `Perusahaan #${id}`
}

function dateOf(value: unknown) {
  return value ? String(value).slice(0, 10) : ''
}

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function statusBadge(status: string) {
  const map: Record<string, { class: string; text: string }> = {
    draft: { class: 'badge bg-label-secondary', text: 'Draft' },
    pending: { class: 'badge bg-label-warning', text: 'Pending' },
    approved: { class: 'badge bg-label-info', text: 'Approved' },
    active: { class: 'badge bg-label-success', text: 'Active' },
    inactive: { class: 'badge bg-label-danger', text: 'Inactive' },
  }
  return map[status] || { class: 'badge bg-label-secondary', text: status || '—' }
}

function headers() {
  const token = readAccessToken()
  const h: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

function goCreate() {
  navigateTo('/sales/pricing/form')
}

function goEdit(row: { id: number }) {
  navigateTo(`/sales/pricing/form/${row.id}`)
}

function goDetail(row: { id: number }) {
  navigateTo(`/sales/pricing/detail/${row.id}`)
}

async function confirmDelete(row: { id: number; code?: string }) {
  const Swal = (await import('sweetalert2')).default
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Daftar harga ${row.code || row.id} akan dihapus dan tidak dapat dikembalikan.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#008fec',
    cancelButtonColor: '#f13636',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
  })
  if (!result.isConfirmed) return

  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.productSellingPrices()}/${row.id}`, {
    method: 'DELETE',
    headers: headers(),
    credentials: 'include',
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Daftar harga gagal dihapus.'
    return
  }
  error.value = ''
  await load()
}

function onPage(event: { first: number; rows: number }) {
  tableFirst.value = event.first
  tableRows.value = event.rows
}

function onRowToggle(event: { data: Record<string, boolean> }) {
  expandedRows.value = event.data
}

function onToolbarRows(value: number) {
  tableRows.value = Number(value) || 10
  tableFirst.value = 0
}

const debouncedSearch = useDebounceFn(() => {
  tableFirst.value = 0
}, 300)

function onToolbarSearch(value: string) {
  globalFilterValue.value = value ?? ''
  debouncedSearch()
}

function onFilterChange() {
  tableFirst.value = 0
  void load()
}

function onStatusFilterChange() {
  tableFirst.value = 0
}

function resetFilters() {
  filters.value = { channel: 'RETAIL', status: null }
  globalFilterValue.value = ''
  tableFirst.value = 0
  void load()
}

async function load() {
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  try {
    let perusahaanId: number | null = null
    try {
      perusahaanId = requireCompanyId()
    } catch {
      perusahaanId = companyId.value
    }
    const qs = new URLSearchParams()
    if (perusahaanId) qs.set('perusahaanId', String(perusahaanId))
    if (filters.value.channel) qs.set('channel', filters.value.channel)
    const res = await fetch(`${$api.productSellingPrices()}?${qs}`, {
      headers: headers(),
      credentials: 'include',
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = payload?.message || 'Daftar harga tidak dapat dimuat.'
      rows.value = []
      return
    }
    rows.value = payload.data || []
    setListTitle('Pricing', rows.value.length)
  } catch (err: any) {
    error.value = err?.message || 'Daftar harga tidak dapat dimuat.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function act(id: number, action: 'submit' | 'approve' | 'activate' | 'deactivate') {
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.productSellingPrices()}/${id}/${action}`, {
    method: 'POST',
    headers: headers(),
    credentials: 'include',
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Aksi daftar harga ditolak.'
    return
  }
  error.value = ''
  await load()
}

watch(companyId, () => {
  tableFirst.value = 0
  void load()
})

onMounted(() => {
  setListTitle('Pricing', 0)
  void load()
})
</script>

<style scoped>
/* Dropdown aksi: fixed strategy agar tidak ter-clip overflow datatable */
:deep(.pricing-actions-dropdown) {
  z-index: 1100 !important;
}
</style>
