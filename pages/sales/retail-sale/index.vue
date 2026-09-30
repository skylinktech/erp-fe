<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        Kelola draft dan transaksi Retail Sale untuk perusahaan aktif.
      </p>

      <ListPageStatsCards :items="statItems" :loading="loading && !rows.length" />

      <CollapsibleFilterCard
        title="Filter Retail Sale"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="4">
          <FilterField>
            <ActiveCompanyField input-id="retail-sale-company" label-text="Perusahaan" />
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
              @update:model-value="onFilterChange"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Mode pelanggan</label>
            <CustomSelect2
              v-model="filters.customerMode"
              :options="customerModeOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              :get-option-key="(o) => String(o.value)"
              searchable
              clearable
              placeholder="Semua mode"
              @update:model-value="onFilterChange"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Tanggal mulai</label>
            <input
              v-model="filters.from"
              type="date"
              class="form-control"
              @change="onFilterChange"
            >
          </FilterField>
          <FilterField>
            <label class="form-label">Tanggal akhir</label>
            <input
              v-model="filters.to"
              type="date"
              class="form-control"
              @change="onFilterChange"
            >
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div v-if="listError" class="alert alert-danger text-break mb-4">{{ listError }}</div>

      <div class="card mb-4">
        <ListPageTableHeader
          :rows="Number(tableRows)"
          :rows-options="rowsPerPageOptions"
          :search="globalFilterValue"
          search-placeholder="Cari nomor / nama walk-in..."
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
              @click="creating = true"
            >
              <i class="ri-add-line me-1"></i>
              Draft Baru
            </button>
          </template>
        </ListPageTableHeader>

        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            :data="rows"
            :rows="Number(tableRows)"
            :loading="loading"
            :total-records="totalRecords"
            :first="tableFirst"
            :lazy="true"
            :expanded-rows="expandedRows"
            responsive-layout="scroll"
            paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
            @page="onPage"
            @sort="onSort"
            @row-toggle="onRowToggle"
            @row-expand="onRowExpand"
          >
            <Column :expander="true" header-style="width: 3rem" />
            <Column header="#" :sortable="false">
              <template #body="slotProps">
                {{ tableFirst + slotProps.index + 1 }}
              </template>
            </Column>
            <Column field="saleNumber" header="Nomor" :sortable="true" class="text-nowrap">
              <template #body="slotProps">
                <span class="text-break">{{ slotProps.data.saleNumber || '—' }}</span>
              </template>
            </Column>
            <Column field="customerLabel" header="Pelanggan" :sortable="false">
              <template #body="slotProps">
                <div class="text-break">{{ slotProps.data.customerLabel || '—' }}</div>
                <div class="small text-muted">{{ retailCustomerModeLabel(slotProps.data.customerMode) }}</div>
              </template>
            </Column>
            <Column field="warehouse.name" header="Gudang" :sortable="false">
              <template #body="slotProps">
                <span class="text-break">
                  {{ slotProps.data.warehouse?.name || `Gudang #${slotProps.data.warehouseId || '—'}` }}
                </span>
              </template>
            </Column>
            <Column field="status" header="Status" :sortable="true">
              <template #body="slotProps">
                <span :class="retailSaleStatusBadge(slotProps.data.status).class">
                  {{ retailSaleStatusBadge(slotProps.data.status).text }}
                </span>
              </template>
            </Column>
            <Column field="finance.state" header="Keuangan" :sortable="false">
              <template #body="slotProps">
                <span :class="retailFinanceStateBadge(slotProps.data.finance?.state).class">
                  {{ retailFinanceStateBadge(slotProps.data.finance?.state).text }}
                </span>
              </template>
            </Column>
            <Column field="grandTotal" header="Total" :sortable="true">
              <template #body="slotProps">
                <span class="text-nowrap">
                  {{ formatRetailMoney(slotProps.data.grandTotal, slotProps.data.currency) }}
                </span>
              </template>
            </Column>
            <Column field="createdAt" header="Tanggal" :sortable="true" class="text-nowrap">
              <template #body="slotProps">
                {{ formatRetailDateTime(slotProps.data.createdAt) }}
              </template>
            </Column>

            <template #expansion="{ data }">
              <div v-if="detailLoading[data.id]" class="card m-2">
                <div class="card-body text-muted">Memuat detail...</div>
              </div>
              <div v-else-if="detailErrors[data.id]" class="card m-2">
                <div class="card-body">
                  <div class="alert alert-danger text-break mb-0">{{ detailErrors[data.id] }}</div>
                </div>
              </div>
              <RetailSaleDetailPanel
                v-else-if="detailsById[data.id]"
                embedded
                :sale="detailsById[data.id]"
                :actions="actionsFor(detailsById[data.id])"
                :saving="savingId === data.id"
                :error="detailActionErrors[data.id] || ''"
                :notice="detailNotices[data.id] || ''"
                :price-conflict="priceConflicts[data.id] || null"
                :company-id="companyId"
                :active-company-ready="activeCompanyReady"
                @confirm="confirmSale"
                @fulfill="fulfillSale"
                @invoice="invoiceSale"
                @resume-invoice="resumeInvoice"
                @pay="paySale"
                @cancel="cancelSale"
                @refresh-prices="refreshPrices"
                @save-quantity="saveQuantity"
              />
            </template>
          </MyDataTable>
        </div>
      </div>
    </div>
    <div class="content-backdrop fade"></div>

    <Modal
      id="RetailSaleDraftModal"
      :model-value="creating"
      title="Draft Retail Sale Baru"
      description="Direct Sale membuat journey Retail secara internal. Business Case tidak diisi pengguna."
      dialog-class="modal-lg"
      @close="creating = false"
      @update:model-value="(v) => { creating = v }"
    >
      <form class="row g-3" @submit.prevent="createDraft">
        <div class="col-12">
          <ActiveCompanyField input-id="retail-draft-company" />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="retail-warehouse">Gudang</label>
          <WarehouseSelect
            id="retail-warehouse"
            v-model="form.warehouseId"
            :company-id="companyId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="retail-mode">Pelanggan</label>
          <select id="retail-mode" v-model="form.customerMode" class="form-select">
            <option value="WALK_IN">Walk-in</option>
            <option value="REGISTERED">Terdaftar</option>
          </select>
        </div>
        <div v-if="form.customerMode === 'REGISTERED'" class="col-12 col-md-6">
          <label class="form-label" for="retail-customer">Pelanggan</label>
          <CustomerSelect
            id="retail-customer"
            v-model="form.customerId"
            :company-id="companyId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div v-else class="col-12 col-md-6">
          <label class="form-label" for="retail-walkin">Nama walk-in</label>
          <input id="retail-walkin" v-model="form.walkInName" class="form-control">
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label" for="retail-product">Produk</label>
          <ProductSelect
            id="retail-product"
            v-model="form.productId"
            :company-id="companyId"
            :warehouse-id="form.warehouseId"
            :disabled="!activeCompanyReady"
          />
        </div>
        <div class="col-6 col-md-4">
          <label class="form-label" for="retail-unit">Satuan</label>
          <UnitSelect id="retail-unit" v-model="form.unitId" />
        </div>
        <div class="col-6 col-md-4">
          <label class="form-label" for="retail-qty">Quantity</label>
          <input
            id="retail-qty"
            v-model.number="form.quantity"
            type="number"
            min="0.0001"
            step="0.0001"
            class="form-control"
            required
          >
        </div>
        <div class="col-12 d-flex flex-wrap justify-content-end gap-2 mt-2">
          <button type="button" class="btn btn-outline-secondary" :disabled="savingId === 'draft'" @click="creating = false">
            Batal
          </button>
          <button class="btn btn-primary" type="submit" :disabled="savingId === 'draft' || !activeCompanyReady">
            <i class="ri-save-line me-1"></i>
            Simpan draft
          </button>
        </div>
        <div v-if="draftError" class="col-12">
          <div class="alert alert-danger text-break mb-0">{{ draftError }}</div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import Column from 'primevue/column'
import { usePermissions } from '~/composables/usePermissions'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useCompanyScopedReload } from '~/composables/useCompanyScopedReload'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { readAccessToken } from '~/utils/authCookie'
import {
  formatRetailDateTime,
  formatRetailMoney,
  retailConflictMessage,
  retailCustomerModeLabel,
  RETAIL_CUSTOMER_MODE_OPTIONS,
  retailDraftActions,
  retailFinanceStateBadge,
  RETAIL_SALE_STATUS_OPTIONS,
  retailSaleStatusBadge,
} from '~/utils/retailSaleDraft'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import Modal from '~/components/modal/Modal.vue'
import ProductSelect from '~/components/reference/ProductSelect.vue'
import WarehouseSelect from '~/components/reference/WarehouseSelect.vue'
import CustomerSelect from '~/components/reference/CustomerSelect.vue'
import UnitSelect from '~/components/reference/UnitSelect.vue'
import RetailSaleDetailPanel from '~/components/retail/RetailSaleDetailPanel.vue'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const activeCompany = useActiveCompany()
const {
  ready: activeCompanyReady,
  requireCompanyId,
  missingMessage: activeCompanyMissing,
  ensureBootstrapped,
  companyId,
} = activeCompany
void ensureBootstrapped()

const privileged = computed(() => userHasRole('admin') || userHasRole('superadmin'))
const canCreate = computed(() => privileged.value || userHasPermission('create_retail_sale'))
const canConfirm = computed(() => privileged.value || userHasPermission('confirm_retail_sale'))
const canCancel = computed(() => privileged.value || userHasPermission('cancel_retail_sale'))
const canFulfill = computed(() => privileged.value || userHasPermission('fulfill_retail_sale'))
const canInvoice = computed(
  () =>
    (privileged.value || userHasPermission('invoice_retail_sale')) &&
    (privileged.value || userHasPermission('create_sales_invoice'))
)
const canPay = computed(
  () =>
    (privileged.value || userHasPermission('pay_retail_sale')) &&
    (privileged.value || userHasPermission('create_ar_receipt'))
)

const rows = ref<any[]>([])
const listError = ref('')
const draftError = ref('')
const loading = ref(false)
const savingId = ref<string | null>(null)
const creating = ref(false)
const expandedRows = ref<Record<string, boolean>>({})
const detailsById = ref<Record<string, any>>({})
const detailLoading = ref<Record<string, boolean>>({})
const detailErrors = ref<Record<string, string>>({})
const detailActionErrors = ref<Record<string, string>>({})
const detailNotices = ref<Record<string, string>>({})
const priceConflicts = ref<Record<string, any>>({})
const totalRecords = ref(0)
const tableRows = ref(10)
const tableFirst = ref(0)
const sortField = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const globalFilterValue = ref('')
const rowsPerPageOptions = [10, 25, 50, 100]
const stats = ref({
  total: 0,
  draft: 0,
  confirmed: 0,
  fulfilled: 0,
  cancelled: 0,
})

const filters = ref<{
  status: string | null
  customerMode: string | null
  from: string
  to: string
}>({
  status: null,
  customerMode: null,
  from: '',
  to: '',
})

const statusOptions = [...RETAIL_SALE_STATUS_OPTIONS]
const customerModeOptions = [...RETAIL_CUSTOMER_MODE_OPTIONS]

const form = ref({
  warehouseId: null as number | null,
  customerMode: 'WALK_IN',
  customerId: null as number | null,
  walkInName: '',
  productId: null as number | null,
  unitId: null as number | null,
  quantity: 1,
})

function actionsFor(sale: any) {
  return retailDraftActions({
    status: sale?.status,
    canCreate: canCreate.value,
    canConfirm: canConfirm.value,
    canCancel: canCancel.value,
    canFulfill: canFulfill.value,
    canInvoice: canInvoice.value,
    canPay: canPay.value,
    financeState: sale?.finance?.state || 'NOT_INVOICED',
    invoiceDocumentStatus: sale?.finance?.invoice?.documentStatus || null,
    invoiceEligibility: sale?.invoiceEligibility || null,
  })
}

function clearDetailCache() {
  expandedRows.value = {}
  detailsById.value = {}
  detailLoading.value = {}
  detailErrors.value = {}
  detailActionErrors.value = {}
  detailNotices.value = {}
  priceConflicts.value = {}
  invoiceIdempotencyBySale.value = {}
}

function setDetailNotice(saleId: string, message: string) {
  detailNotices.value = { ...detailNotices.value, [saleId]: message }
  detailActionErrors.value = { ...detailActionErrors.value, [saleId]: '' }
}

function setDetailError(saleId: string, message: string) {
  detailActionErrors.value = { ...detailActionErrors.value, [saleId]: message }
}

function patchDetail(sale: any) {
  if (!sale?.id) return
  detailsById.value = { ...detailsById.value, [sale.id]: sale }
}

const hasActiveFilters = computed(
  () =>
    !!filters.value.status ||
    !!filters.value.customerMode ||
    !!filters.value.from ||
    !!filters.value.to ||
    !!globalFilterValue.value.trim()
)

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total',
    value: stats.value.total,
    icon: 'ri-shopping-bag-3-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Total Retail Sale',
      description: 'Jumlah Retail Sale pada perusahaan aktif sesuai filter tanggal/mode/pencarian (tanpa filter status).',
    },
  },
  {
    key: 'draft',
    label: 'Draft',
    value: stats.value.draft,
    icon: 'ri-draft-line',
    iconBgClass: 'bg-label-secondary',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    value: stats.value.confirmed,
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-info',
  },
  {
    key: 'fulfilled',
    label: 'Fulfilled',
    value: stats.value.fulfilled,
    icon: 'ri-truck-line',
    iconBgClass: 'bg-label-success',
  },
])

function headers() {
  const token = readAccessToken()
  const h: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Company-Id'] = String(companyId.value)
  return h
}

function buildListQuery() {
  const page = Math.floor(tableFirst.value / Number(tableRows.value)) + 1
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(tableRows.value),
    sortBy: sortField.value,
    sortOrder: sortOrder.value,
  })
  if (companyId.value) params.set('perusahaanId', String(companyId.value))
  if (filters.value.status) params.set('status', filters.value.status)
  if (filters.value.customerMode) params.set('customerMode', filters.value.customerMode)
  if (filters.value.from) params.set('from', filters.value.from)
  if (filters.value.to) params.set('to', filters.value.to)
  const search = globalFilterValue.value.trim()
  if (search) params.set('search', search)
  return params.toString()
}

async function load(expectedGeneration?: number) {
  loading.value = true
  listError.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.retailSales()}?${buildListQuery()}`, { headers: headers() })
  const payload = await res.json().catch(() => ({}))
  if (expectedGeneration != null && !scopedReload.isCurrent(expectedGeneration)) return
  loading.value = false
  if (!res.ok) {
    listError.value = payload?.message || 'Retail Sale tidak dapat dimuat.'
    rows.value = []
    totalRecords.value = 0
    return
  }
  rows.value = payload.data || []
  totalRecords.value = Number(payload.meta?.total || 0)
  stats.value = {
    total: Number(payload.stats?.total || 0),
    draft: Number(payload.stats?.draft || 0),
    confirmed: Number(payload.stats?.confirmed || 0),
    fulfilled: Number(payload.stats?.fulfilled || 0),
    cancelled: Number(payload.stats?.cancelled || 0),
  }
  setListTitle('Retail Sale', totalRecords.value)
}

const scopedReload = useCompanyScopedReload(async (_id, generation) => {
  tableFirst.value = 0
  clearDetailCache()
  await load(generation)
})

const debouncedLoad = useDebounceFn(() => load(), 300)

function onFilterChange() {
  tableFirst.value = 0
  debouncedLoad()
}

function resetFilters() {
  filters.value = { status: null, customerMode: null, from: '', to: '' }
  globalFilterValue.value = ''
  tableFirst.value = 0
  load()
}

function onToolbarRows(value: number) {
  tableRows.value = Number(value) || 10
  tableFirst.value = 0
  load()
}

function onToolbarSearch(value: string) {
  globalFilterValue.value = value ?? ''
  tableFirst.value = 0
  debouncedLoad()
}

function onPage(event: { first?: number; rows?: number }) {
  tableFirst.value = Number(event.first || 0)
  if (event.rows != null) tableRows.value = Number(event.rows) || tableRows.value
  load()
}

function onSort(event: { sortField?: string; sortOrder?: number }) {
  if (event.sortField) sortField.value = String(event.sortField)
  sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
  tableFirst.value = 0
  load()
}

function onRowToggle(event: { data?: Record<string, boolean> }) {
  expandedRows.value = event.data || {}
}

async function onRowExpand(event: { data?: { id?: string } }) {
  const id = event.data?.id
  if (!id) return
  await ensureDetail(id)
}

async function ensureDetail(id: string, force = false) {
  if (!force && detailsById.value[id]) return detailsById.value[id]
  detailLoading.value = { ...detailLoading.value, [id]: true }
  detailErrors.value = { ...detailErrors.value, [id]: '' }
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSale(id), { headers: headers() })
  const payload = await res.json().catch(() => ({}))
  detailLoading.value = { ...detailLoading.value, [id]: false }
  if (!res.ok) {
    detailErrors.value = {
      ...detailErrors.value,
      [id]: payload?.message || 'Detail Retail Sale tidak ditemukan.',
    }
    return null
  }
  patchDetail(payload.data)
  return payload.data
}

async function confirmSale(saleId: string) {
  const sale = detailsById.value[saleId]
  if (!sale) return
  savingId.value = saleId
  setDetailError(saleId, '')
  setDetailNotice(saleId, '')
  priceConflicts.value = { ...priceConflicts.value, [saleId]: null }
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleConfirm(saleId), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: sale.revision,
      idempotencyKey: crypto.randomUUID(),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (payload?.code === 'RETAIL_PRICE_CHANGED') {
    priceConflicts.value = { ...priceConflicts.value, [saleId]: payload }
    setDetailError(saleId, retailConflictMessage(payload))
    return
  }
  if (!res.ok) {
    setDetailError(saleId, payload?.message || 'Konfirmasi ditolak.')
    return
  }
  patchDetail(payload.data)
  setDetailNotice(saleId, 'Retail Sale terkonfirmasi. Stok dipesan, belum dikeluarkan.')
  await load()
}

async function fulfillSale(saleId: string) {
  const sale = detailsById.value[saleId]
  if (!sale) return
  savingId.value = saleId
  setDetailError(saleId, '')
  setDetailNotice(saleId, '')
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleFulfill(saleId), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: sale.revision,
      idempotencyKey: crypto.randomUUID(),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (!res.ok) {
    setDetailError(saleId, payload?.message || 'Pemenuhan ditolak.')
    return
  }
  patchDetail(payload.data)
  setDetailNotice(saleId, 'Retail Sale dipenuhi. Stok dikeluarkan dan COGS dicatat. Invoice belum dibuat.')
  await load()
}

const invoiceIdempotencyBySale = ref<Record<string, string>>({})

async function invoiceSale(saleId: string) {
  const sale = detailsById.value[saleId]
  if (!sale || savingId.value === saleId) return
  const requestCompanyId = companyId.value
  savingId.value = saleId
  setDetailError(saleId, '')
  setDetailNotice(saleId, '')
  if (!invoiceIdempotencyBySale.value[saleId]) {
    invoiceIdempotencyBySale.value = {
      ...invoiceIdempotencyBySale.value,
      [saleId]: crypto.randomUUID(),
    }
  }
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.retailSaleInvoice(saleId), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        expectedRevision: sale.revision,
        idempotencyKey: invoiceIdempotencyBySale.value[saleId],
      }),
    })
    const payload = await res.json().catch(() => ({}))
    if (companyId.value !== requestCompanyId) return
    if (!res.ok) {
      setDetailError(saleId, payload?.message || 'Invoice ditolak.')
      return
    }
    const { [saleId]: _done, ...rest } = invoiceIdempotencyBySale.value
    invoiceIdempotencyBySale.value = rest
    patchDetail(payload.data)
    if (payload.code === 'RETAIL_INVOICE_PENDING_APPROVAL') {
      setDetailNotice(saleId, 'Invoice tersimpan; menunggu persetujuan Finance. Belum lunas.')
    } else if (payload.data?.finance?.invoice && payload.message?.includes?.('persetujuan')) {
      setDetailNotice(
        saleId,
        'Invoice draft tersimpan. Persetujuan Finance gagal atau belum siap — gunakan kirim ulang bila tersedia.'
      )
    } else {
      setDetailNotice(
        saleId,
        payload.code === 'RETAIL_INVOICE_PENDING_APPROVAL'
          ? 'Invoice menunggu persetujuan Finance. Belum lunas.'
          : 'Invoice draft tersimpan. Persetujuan Finance belum siap, sale tidak lunas.'
      )
    }
    await load()
  } catch (err: any) {
    if (companyId.value !== requestCompanyId) return
    setDetailError(saleId, err?.message || 'Gagal membuat invoice (jaringan).')
  } finally {
    if (companyId.value === requestCompanyId) savingId.value = null
  }
}

async function resumeInvoice(saleId: string) {
  const sale = detailsById.value[saleId]
  if (!sale) return
  savingId.value = saleId
  setDetailError(saleId, '')
  setDetailNotice(saleId, '')
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleInvoiceSubmit(saleId), {
    method: 'POST',
    headers: headers(),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (!res.ok) {
    setDetailError(saleId, payload?.message || 'Pengiriman ulang ditolak.')
    return
  }
  patchDetail(payload.data)
  setDetailNotice(
    saleId,
    payload.code === 'RETAIL_INVOICE_PENDING_APPROVAL'
      ? 'Invoice dikirim ulang ke persetujuan Finance.'
      : 'Invoice tetap draft. Approver Finance belum tersedia.'
  )
  await load()
}

async function paySale(payloadIn: { saleId: string; bankAccountId: number | string | null; method: string }) {
  const sale = detailsById.value[payloadIn.saleId]
  if (!sale) return
  savingId.value = payloadIn.saleId
  setDetailError(payloadIn.saleId, '')
  setDetailNotice(payloadIn.saleId, '')
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSalePay(payloadIn.saleId), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: sale.revision,
      idempotencyKey: crypto.randomUUID(),
      bankAccountId: payloadIn.bankAccountId,
      method: payloadIn.method,
    }),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (!res.ok) {
    setDetailError(payloadIn.saleId, payload?.message || 'Pembayaran ditolak.')
    return
  }
  patchDetail(payload.data)
  setDetailNotice(
    payloadIn.saleId,
    payload.code === 'RETAIL_PAID'
      ? 'Pelunasan tercatat dan jurnal kas posted.'
      : 'Penerimaan belum lunas. Jurnal kas belum posted.'
  )
  await load()
}

async function cancelSale(saleId: string) {
  const sale = detailsById.value[saleId]
  if (!sale) return
  savingId.value = saleId
  setDetailError(saleId, '')
  setDetailNotice(saleId, '')
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleCancel(saleId), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: sale.revision,
      idempotencyKey: crypto.randomUUID(),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (!res.ok) {
    setDetailError(saleId, payload?.message || 'Pembatalan ditolak.')
    return
  }
  patchDetail(payload.data)
  setDetailNotice(saleId, 'Retail Sale dibatalkan.')
  await load()
}

async function refreshPrices(saleId: string) {
  const sale = detailsById.value[saleId]
  if (!sale) return
  savingId.value = saleId
  setDetailError(saleId, '')
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSaleRefreshPrices(saleId), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ expectedRevision: sale.revision }),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (!res.ok) {
    setDetailError(saleId, payload?.message || 'Harga resmi tidak dapat diperbarui.')
    return
  }
  patchDetail(payload.data)
  priceConflicts.value = { ...priceConflicts.value, [saleId]: null }
  setDetailNotice(saleId, 'Harga resmi diperbarui. Konfirmasi belum dijalankan.')
}

async function createDraft() {
  savingId.value = 'draft'
  draftError.value = ''
  let perusahaanId: number
  try {
    perusahaanId = requireCompanyId()
  } catch (err: any) {
    savingId.value = null
    draftError.value = err?.message || activeCompanyMissing.value || 'Active Company wajib.'
    return
  }
  if (!form.value.warehouseId || !form.value.productId || !form.value.unitId) {
    savingId.value = null
    draftError.value = 'Lengkapi gudang, produk, dan satuan.'
    return
  }
  const { $api } = useNuxtApp()
  const res = await fetch($api.directSaleCheckout(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      perusahaanId,
      idempotencyKey: crypto.randomUUID(),
      warehouseId: form.value.warehouseId,
      customerMode: form.value.customerMode,
      customerId: form.value.customerMode === 'REGISTERED' ? form.value.customerId : null,
      walkInName: form.value.customerMode === 'WALK_IN' ? form.value.walkInName : null,
      confirm: false,
      items: [{ productId: form.value.productId, unitId: form.value.unitId, quantity: form.value.quantity }],
    }),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (!res.ok) {
    draftError.value = payload?.message || 'Draft ditolak.'
    return
  }
  creating.value = false
  const created = payload.data
  if (created?.id) {
    patchDetail(created)
    expandedRows.value = { ...expandedRows.value, [created.id]: true }
    setDetailNotice(created.id, 'Draft Direct Sale dibuat. Journey Retail diikat secara internal.')
  }
  await load()
}

async function saveQuantity(payloadIn: { saleId: string; quantity: number }) {
  const sale = detailsById.value[payloadIn.saleId]
  if (!sale?.items?.[0]) return
  savingId.value = payloadIn.saleId
  setDetailError(payloadIn.saleId, '')
  const item = sale.items[0]
  const { $api } = useNuxtApp()
  const res = await fetch($api.retailSale(payloadIn.saleId), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      expectedRevision: sale.revision,
      warehouseId: sale.warehouseId,
      customerMode: sale.customerMode,
      customerId: sale.customerId,
      walkInName: sale.walkInName,
      walkInPhone: sale.walkInPhone,
      items: [
        {
          productId: item.productId,
          unitId: item.unitId,
          quantity: payloadIn.quantity,
          expectedUnitPrice: item.officialUnitPrice,
        },
      ],
    }),
  })
  const payload = await res.json().catch(() => ({}))
  savingId.value = null
  if (!res.ok) {
    setDetailError(payloadIn.saleId, payload?.message || 'Perubahan ditolak.')
    return
  }
  patchDetail(payload.data)
  await load()
}

watch(creating, (open) => {
  if (open) draftError.value = ''
})

onMounted(() => {
  scopedReload.start()
})

onUnmounted(() => {
  scopedReload.stop()
})
</script>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > tr.p-datatable-row-expansion > td) {
  background: transparent;
  padding: 0.5rem 0.75rem;
}
</style>

