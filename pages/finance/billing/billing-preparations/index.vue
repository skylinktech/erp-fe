<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6 text-muted">
        Siapkan tagihan dari Service Line + Adjustment. Set Ready untuk generate Finance Invoice.
      </p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="d-flex align-items-center">
                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                <div class="flex-grow-1">
                  <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                  <div class="skeleton-loader" style="width:40%;height:20px"></div>
                </div>
              </div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Total</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-primary">
                      <i class="ri-file-list-3-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-end">
                  <div>
                    <h5 class="mb-0">{{ statistics.total }}</h5>
                    <small class="text-muted">Semua preparation</small>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="d-flex align-items-center">
                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                <div class="flex-grow-1">
                  <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                  <div class="skeleton-loader" style="width:40%;height:20px"></div>
                </div>
              </div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Draft</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-secondary">
                      <i class="ri-draft-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-end">
                  <div>
                    <h5 class="mb-0">{{ statistics.draft }}</h5>
                    <small class="text-muted">Sedang disiapkan</small>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="d-flex align-items-center">
                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                <div class="flex-grow-1">
                  <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                  <div class="skeleton-loader" style="width:40%;height:20px"></div>
                </div>
              </div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Ready</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-warning">
                      <i class="ri-send-plane-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-end">
                  <div>
                    <h5 class="mb-0 text-warning">{{ statistics.ready }}</h5>
                    <small class="text-muted">Menunggu invoice</small>
                  </div>
                  <span class="text-warning small fw-semibold">
                    {{ formatRupiah(statistics.readyAmount) }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="d-flex align-items-center">
                <div class="skeleton-loader me-3" style="width:40px;height:40px;border-radius:8px"></div>
                <div class="flex-grow-1">
                  <div class="skeleton-loader mb-2" style="width:60%;height:16px"></div>
                  <div class="skeleton-loader" style="width:40%;height:20px"></div>
                </div>
              </div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Invoiced</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-success">
                      <i class="ri-checkbox-circle-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-end">
                  <div>
                    <h5 class="mb-0 text-success">{{ statistics.invoiced }}</h5>
                    <small class="text-muted">Sudah diinvoice</small>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <CollapsibleFilterCard
        title="Filter Billing Preparation"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="2">
          <FilterField>
            <label class="form-label">Periode Billing</label>
            <input
              v-model="filterPeriod"
              type="month"
              class="form-control"
              @change="applyFilters"
            >
          </FilterField>
          <FilterField>
            <label class="form-label">Status</label>
            <select v-model="filterStatus" class="form-select" @change="applyFilters">
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div class="card">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="d-flex align-items-center">
              <span class="me-2">Baris:</span>
              <select
                v-model.number="store.params.rows"
                class="form-select"
                style="width: 5.5rem"
                @change="onRowsChange"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <button
                v-if="userHasRole('superadmin') || userHasPermission('create_billing_preparation')"
                class="btn btn-primary"
                @click="openCreate"
              >
                <i class="ri-add-line me-1"></i> Tambah
              </button>
              <InputText
                v-model="searchQuery"
                placeholder="Cari customer / faktur..."
                class="w-full md:w-20rem"
                style="max-width: 280px"
              />
            </div>
          </div>
        </div>
        <div class="card-datatable table-responsive p-3">
          <MyDataTable
            :data="rows"
            :rows="store.params.rows"
            :loading="loading"
            :totalRecords="totalRecords"
            :first="store.params.first"
            :lazy="true"
            @page="onPage"
          >
            <Column header="#" style="width:50px">
              <template #body="slotProps">{{ store.params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column header="Periode" style="min-width:100px">
              <template #body="{ data }">{{ data.billingPeriod }}</template>
            </Column>
            <Column header="Customer" style="min-width:180px">
              <template #body="{ data }">{{ data.customer?.name || '—' }}</template>
            </Column>
            <Column header="Items" style="min-width:90px">
              <template #body="{ data }">{{ data.selectedCount }}/{{ data.itemCount }}</template>
            </Column>
            <Column header="Total" style="min-width:130px">
              <template #body="{ data }">{{ formatRupiah(data.totalAmount || 0) }}</template>
            </Column>
            <Column header="Status" style="min-width:110px">
              <template #body="{ data }">
                <span :class="statusBadge(data.status)"> {{ getDocumentStatusLabel(data.status) }}</span>
              </template>
            </Column>
            <Column header="Aksi" :exportable="false" style="min-width:8rem">
              <template #body="{ data }">
                <div class="d-inline-block dropdown">
                  <a
                    href="javascript:;"
                    class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    data-bs-toggle="dropdown"
                    data-bs-popper-config='{"strategy":"fixed"}'
                  >
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <NuxtLink
                        class="dropdown-item"
                        :to="`/finance/billing/billing-preparations/detail/${data.id}`"
                      >
                        <i class="ri-eye-line me-2"></i> Detail / Kelola Draft
                      </NuxtLink>
                    </li>
                    <li
                      v-if="data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('edit_billing_preparation'))"
                    >
                      <NuxtLink
                        class="dropdown-item"
                        :to="`/finance/billing/billing-preparations/detail/${data.id}?addAdjustment=1`"
                      >
                        <i class="ri-add-line me-2"></i> Tambah Billing Adjustment
                      </NuxtLink>
                    </li>
                    <li
                      v-if="data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('edit_billing_preparation'))"
                    >
                      <a
                        class="dropdown-item"
                        href="javascript:void(0)"
                        @click="store.syncCharges(data.id)"
                      >
                        <i class="ri-refresh-line me-2"></i> Sinkronkan Charge
                      </a>
                    </li>
                    <li
                      v-if="data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('ready_billing_preparation'))"
                    >
                      <a
                        class="dropdown-item text-success"
                        href="javascript:void(0)"
                        @click="store.markReady(data.id)"
                      >
                        <i class="ri-send-plane-line me-2"></i> Set Ready
                      </a>
                    </li>
                    <li
                      v-if="data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('delete_billing_preparation'))"
                    >
                      <a
                        class="dropdown-item text-danger"
                        href="javascript:void(0)"
                        @click="store.remove(data.id)"
                      >
                        <i class="ri-delete-bin-line me-2"></i> Hapus Draft
                      </a>
                    </li>
                  </ul>
                </div>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="dialogVisible" modal header="Buat Billing Preparation" :style="{ width: '640px' }">
      <div class="d-flex flex-column gap-3">
        <div>
          <label class="form-label">Customer</label>
          <select v-model="form.customerId" class="form-select">
            <option :value="null">Pilih customer</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Periode</label>
          <input v-model="form.billingPeriod" type="month" class="form-control">
        </div>
        <div>
          <label class="form-label">Faktur Pajak (opsional)</label>
          <input v-model="form.fakturPajak" type="text" class="form-control">
        </div>

        <div class="border rounded p-3">
          <div class="form-check form-switch mb-2">
            <input
              id="applyTaxCreate"
              v-model="form.applyTax"
              class="form-check-input"
              type="checkbox"
            >
            <label class="form-check-label fw-semibold" for="applyTaxCreate">
              Tambah Pajak
            </label>
          </div>

          <template v-if="form.applyTax">
            <label class="form-label">Pajak (Tax Master)</label>
            <CustomSelect2
              v-model="form.taxMasterIds"
              :options="taxMasterOptions"
              :get-option-label="taxMasterLabel"
              :reduce="(o) => o.id"
              :loading="loadingTaxes"
              searchable
              clearable
              multiple
              :close-on-select="false"
              placeholder="Pilih satu atau lebih pajak"
              no-options-text="Tidak ada tax master aktif"
            />

            <div v-if="selectedTaxPreviews.length" class="mt-3">
              <div class="small text-muted mb-2">Tarif terpilih</div>
              <div
                v-for="tax in selectedTaxPreviews"
                :key="tax.id"
                class="d-flex justify-content-between align-items-start border-bottom py-2 gap-2"
              >
                <div>
                  <div class="fw-semibold">{{ tax.code }} — {{ tax.name }}</div>
                  <small class="text-muted">
                    {{ tax.type }} · {{ tax.calculationType }}
                  </small>
                </div>
                <div class="text-end">
                  <span class="badge bg-label-primary">
                    {{ formatTaxRate(tax) }}
                  </span>
                  <div v-if="tax.taxRates?.length" class="small text-muted mt-1">
                    {{ tax.taxRates.length }} rate histori
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-muted small mb-0 mt-2">
              Pilih pajak untuk menampilkan tarif default dari Tax Master.
            </p>
          </template>
        </div>

        <div>
          <label class="form-label">Attachment (opsional)</label>
          <input type="file" class="form-control" @change="onFile">
        </div>

        <div v-if="form.customerId" class="border rounded p-3">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <span class="fw-semibold small">Sumber</span>
            <div class="d-flex flex-wrap gap-2">
              <NuxtLink
                to="/order-process/subscription"
                class="btn btn-sm btn-outline-primary"
                target="_blank"
              >
                <i class="ri-file-list-3-line me-1"></i> Form Berlangganan
              </NuxtLink>
              <NuxtLink
                to="/finance/billing-adjustments"
                class="btn btn-sm btn-outline-secondary"
                target="_blank"
              >
                <i class="ri-funds-line me-1"></i> Billing Adjustment
              </NuxtLink>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Form Berlangganan</label>
            <CustomSelect2
              v-model="form.subscriptionIds"
              :options="subscriptionOptions"
              :get-option-label="subscriptionLabel"
              :reduce="(o) => o.id"
              :loading="loadingPreview"
              searchable
              clearable
              multiple
              :close-on-select="false"
              placeholder="Pilih Form Berlangganan"
              no-options-text="Tidak ada Form Berlangganan untuk customer ini"
            />
          </div>

          <div>
            <label class="form-label">
              Billing Adjustment
              <span class="text-muted fw-normal">(opsional)</span>
            </label>
            <CustomSelect2
              v-model="form.adjustmentIds"
              :options="adjustmentOptions"
              :get-option-label="adjustmentLabel"
              :reduce="(o) => o.id"
              :loading="loadingPreview"
              searchable
              clearable
              multiple
              :close-on-select="false"
              placeholder="Pilih Billing Adjustment"
              no-options-text="Tidak ada Billing Adjustment approved untuk customer ini"
            />
          </div>

          <div v-if="chargePreviewLines.length" class="mt-3">
            <div class="small text-muted mb-1">Preview charge eligible (tidak di-reserve sampai Buat)</div>
            <ul class="list-unstyled small mb-0 border rounded p-2">
              <li
                v-for="line in chargePreviewLines"
                :key="line.chargeKey"
                class="d-flex justify-content-between gap-2 border-bottom py-1"
              >
                <span>
                  <span class="badge bg-label-secondary me-1">{{ line.chargeType }}</span>
                  {{ line.description }}
                </span>
                <span class="text-nowrap">{{ formatRupiah(line.amount) }}</span>
              </li>
            </ul>
          </div>
          <div v-if="chargePreviewSkips.length" class="alert alert-light border mt-2 mb-0 py-2 small">
            <div class="fw-semibold mb-1">Dilewati</div>
            <ul class="mb-0 ps-3">
              <li v-for="(skip, idx) in chargePreviewSkips" :key="skip.chargeKey || idx">
                {{ skip.reason }}
              </li>
            </ul>
          </div>
        </div>
        <p v-else class="text-muted small mb-0">
          Pilih customer terlebih dahulu untuk menampilkan Form Berlangganan dan Billing Adjustment.
        </p>
      </div>
      <template #footer>
        <button class="btn btn-outline-secondary" @click="dialogVisible = false">Batal</button>
        <button class="btn btn-primary" :disabled="store.saving" @click="submitCreate">Buat</button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import { useBillingPreparationStore } from '~/stores/billing-preparations'
import { useTaxMasterStore } from '~/stores/tax-masters'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import CustomSelect2 from '~/components/CustomSelect2.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Billing Preparation',
})

const router = useRouter()
const store = useBillingPreparationStore()
const taxMasterStore = useTaxMasterStore()
const customerStore = useCustomerStore()
const { rows, loading, loadingStats, totalRecords, statistics } = storeToRefs(store)
const { userHasRole, userHasPermission } = usePermissions()
const formatRupiah = useFormatRupiah()
const { setListTitle } = useDynamicTitle()

const searchQuery = ref('')
const filterPeriod = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const fileRef = ref(null)
const loadingPreview = ref(false)
const loadingTaxes = ref(false)
const sourceOptions = ref({
  subscriptions: [],
  adjustments: [],
  chargeLines: [],
  chargeSkips: [],
})
const taxMasterOptions = ref([])
const form = ref({
  customerId: null,
  billingPeriod: '',
  fakturPajak: '',
  subscriptionIds: [],
  adjustmentIds: [],
  applyTax: false,
  taxMasterIds: [],
})
const customers = computed(() => customerStore.customers || [])
const subscriptionOptions = computed(() => sourceOptions.value.subscriptions || [])
const adjustmentOptions = computed(() => sourceOptions.value.adjustments || [])
const chargePreviewLines = computed(() => sourceOptions.value.chargeLines || [])
const chargePreviewSkips = computed(() => sourceOptions.value.chargeSkips || [])

const selectedTaxPreviews = computed(() => {
  const ids = new Set(form.value.taxMasterIds || [])
  return (taxMasterOptions.value || []).filter((t) => ids.has(t.id))
})

const taxMasterLabel = (o) => {
  if (!o) return ''
  const rate =
    o.calculationType === 'FIXED'
      ? formatRupiah(o.defaultRate || 0)
      : `${Number(o.defaultRate || 0)}%`
  return `${o.code} — ${o.name} (${rate})`
}

const formatTaxRate = (tax) => {
  const rate = Number(tax.defaultRate || 0)
  return tax.calculationType === 'FIXED' ? formatRupiah(rate) : `${rate}%`
}

const hasActiveFilters = computed(() =>
  Boolean(filterPeriod.value || filterStatus.value)
)

const statusBadge = (s) => ({
  draft: 'badge bg-label-secondary',
  ready: 'badge bg-label-warning',
  invoiced: 'badge bg-label-success',
}[s] || 'badge bg-label-secondary')

const getDocumentStatusLabel = (s) => ({
  draft: 'Draft',
  ready: 'Ready',
  invoiced: 'Invoiced',
}[s] || s)

const subscriptionLabel = (o) => {
  if (!o) return ''
  const lines = o.serviceLineCount != null ? ` · ${o.serviceLineCount} line` : ''
  const status = o.status ? ` (${o.status})` : ''
  return `${o.noSubscription || o.id}${status}${lines}`
}

const adjustmentLabel = (o) => {
  if (!o) return ''
  const period = o.billingPeriod ? ` · ${o.billingPeriod}` : ''
  const amount = formatRupiah(o.amount || 0)
  return `${o.type || 'adjustment'} · ${o.description || 'Adjustment'}${period} · ${amount}`
}

const applyFilters = () => {
  store.params.billingPeriod = filterPeriod.value || ''
  store.params.status = filterStatus.value || ''
  store.params.first = 0
  store.fetchList()
}

const resetFilters = () => {
  filterPeriod.value = ''
  filterStatus.value = ''
  applyFilters()
}

const debouncedSearch = useDebounceFn((v) => {
  store.params.search = v
  store.params.first = 0
  store.fetchList()
}, 400)
watch(searchQuery, (v) => debouncedSearch(v))

const loadSourceOptions = useDebounceFn(async () => {
  if (!form.value.customerId) {
    sourceOptions.value = { subscriptions: [], adjustments: [], chargeLines: [], chargeSkips: [] }
    form.value.subscriptionIds = []
    form.value.adjustmentIds = []
    return
  }
  loadingPreview.value = true
  try {
    const data = await store.previewSources(form.value.customerId, form.value.billingPeriod || undefined)
    sourceOptions.value = data
    // Keep only still-valid selections
    const subIds = new Set((data.subscriptions || []).map((s) => s.id))
    const adjIds = new Set((data.adjustments || []).map((a) => a.id))
    form.value.subscriptionIds = (form.value.subscriptionIds || []).filter((id) => subIds.has(id))
    form.value.adjustmentIds = (form.value.adjustmentIds || []).filter((id) => adjIds.has(id))
  } finally {
    loadingPreview.value = false
  }
}, 250)

watch(
  () => form.value.customerId,
  () => {
    form.value.subscriptionIds = []
    form.value.adjustmentIds = []
    if (dialogVisible.value) loadSourceOptions()
  }
)

watch(
  () => form.value.billingPeriod,
  () => {
    if (dialogVisible.value && form.value.customerId) loadSourceOptions()
  }
)

const onPage = (e) => {
  store.params.first = e.first
  store.params.rows = e.rows
  store.fetchList()
}

const onRowsChange = () => {
  store.params.first = 0
  store.fetchList()
}

const openCreate = async () => {
  form.value = {
    customerId: null,
    billingPeriod: new Date().toISOString().slice(0, 7),
    fakturPajak: '',
    subscriptionIds: [],
    adjustmentIds: [],
    applyTax: false,
    taxMasterIds: [],
  }
  fileRef.value = null
  sourceOptions.value = { subscriptions: [], adjustments: [], chargeLines: [], chargeSkips: [] }
  dialogVisible.value = true
  loadingTaxes.value = true
  try {
    taxMasterOptions.value = await taxMasterStore.fetchActiveOptions()
  } finally {
    loadingTaxes.value = false
  }
}

const onFile = (e) => {
  fileRef.value = e.target.files?.[0] || null
}

watch(
  () => form.value.applyTax,
  (on) => {
    if (!on) form.value.taxMasterIds = []
  }
)

const submitCreate = async () => {
  if (!form.value.customerId || !form.value.billingPeriod) {
    useToast().error({ title: 'Error', message: 'Customer & periode wajib', color: 'red', position: 'bottomRight' })
    return
  }
  if (!form.value.subscriptionIds.length && !form.value.adjustmentIds.length) {
    useToast().error({
      title: 'Error',
      message: 'Pilih minimal 1 Form Berlangganan atau Billing Adjustment',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  if (form.value.applyTax && !form.value.taxMasterIds.length) {
    useToast().error({
      title: 'Error',
      message: 'Pilih minimal 1 pajak jika Tambah Pajak diaktifkan',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  const id = await store.create(
    {
      customerId: form.value.customerId,
      billingPeriod: form.value.billingPeriod,
      fakturPajak: form.value.fakturPajak || undefined,
      subscriptionIds: form.value.subscriptionIds,
      adjustmentIds: form.value.adjustmentIds,
      applyTax: !!form.value.applyTax,
      taxMasterIds: form.value.applyTax ? form.value.taxMasterIds : [],
    },
    fileRef.value
  )
  if (id) {
    dialogVisible.value = false
    router.push(`/finance/billing-preparations/detail/${id}`)
  }
}

onMounted(async () => {
  setListTitle('Billing Preparation')
  await Promise.all([
    store.fetchList(),
    store.fetchStatistics(),
    customerStore.prefetchCustomers?.() || customerStore.fetchCustomers?.(true),
  ])
})
</script>
