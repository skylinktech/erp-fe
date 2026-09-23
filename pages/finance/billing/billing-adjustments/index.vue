<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6 text-muted">
        Komponen penambah/pengurang tagihan sebelum Billing Preparation
      </p>

            <ListPageStatsCards :items="statItems" :loading="loadingStats" />

      <CollapsibleFilterCard
        title="Filter Billing Adjustment"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow :columns="3">
          <FilterField>
            <label class="form-label">Periode Billing</label>
            <input
              v-model="filterPeriod"
              type="month"
              class="form-control"
              @change="applyFilters"
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Status</label>
            <select v-model="filterStatus" class="form-select" @change="applyFilters">
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </FilterField>
          <FilterField>
            <label class="form-label">Tipe</label>
            <select v-model="filterType" class="form-select" @change="applyFilters">
              <option value="">Semua Tipe</option>
              <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
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
                v-if="userHasRole('superadmin') || userHasPermission('create_billing_adjustment')"
                class="btn btn-primary"
                @click="openCreate"
              >
                <i class="ri-add-line me-1"></i> Tambah
              </button>
              <InputText
                v-model="searchQuery"
                placeholder="Cari customer / deskripsi..."
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
            <Column header="Customer" style="min-width:160px">
              <template #body="{ data }">{{ data.customer?.name || '—' }}</template>
            </Column>
            <Column header="Tipe" style="min-width:140px">
              <template #body="{ data }">
                <span class="badge bg-label-secondary">{{ typeLabel(data.type) }}</span>
              </template>
            </Column>
            <Column header="Amount" style="min-width:120px">
              <template #body="{ data }">
                <span :class="Number(data.amount) < 0 ? 'text-danger' : ''">{{ formatRupiah(data.amount) }}</span>
              </template>
            </Column>
            <Column header="Status" style="min-width:110px">
              <template #body="{ data }">
                <span :class="statusBadge(data.status)">{{ getDocumentStatusLabel(data.status) }}</span>
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
                    <li
                      v-if="canEditAdjustment(data) && (userHasRole('superadmin') || userHasPermission('edit_billing_adjustment'))"
                    >
                      <a
                        class="dropdown-item"
                        href="javascript:void(0)"
                        @click="openEdit(data)"
                      >
                        <i class="ri-pencil-line me-2"></i> Edit
                      </a>
                    </li>
                    <li
                      v-if="data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('approve_billing_adjustment'))"
                    >
                      <a
                        class="dropdown-item text-success"
                        href="javascript:void(0)"
                        @click="store.approve(data.id)"
                      >
                        <i class="ri-check-line me-2"></i> Approve
                      </a>
                    </li>
                    <li
                      v-if="data.status !== 'approved' && (userHasRole('superadmin') || userHasPermission('delete_billing_adjustment'))"
                    >
                      <a
                        class="dropdown-item text-danger"
                        href="javascript:void(0)"
                        @click="store.remove(data.id)"
                      >
                        <i class="ri-delete-bin-line me-2"></i> Hapus
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

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editingId ? 'Edit Billing Adjustment' : 'Tambah Billing Adjustment'"
      :style="{ width: '520px' }"
    >
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
          <input v-model="form.billingPeriod" type="month" class="form-control" />
        </div>
        <div>
          <label class="form-label">Tipe</label>
          <select v-model="form.type" class="form-select">
            <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Amount</label>
          <input
            type="text"
            class="form-control"
            :value="formatRupiah(form.amount)"
            placeholder="Rp 0"
            @input="onAmountInput"
          />
          <small class="text-muted">Discount/Restitution otomatis mengurangi tagihan.</small>
        </div>
        <div>
          <label class="form-label">Deskripsi</label>
          <textarea v-model="form.description" class="form-control" rows="2"></textarea>
        </div>
        <div>
          <label class="form-label">Attachment</label>
          <input type="file" class="form-control" @change="onFile" />
          <small v-if="editingId && existingAttachment" class="text-muted d-block mt-1">
            File saat ini:
            <a
              :href="getAttachmentUrl(existingAttachment)"
              target="_blank"
              rel="noopener noreferrer"
            >Lihat</a>
          </small>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="dialogVisible = false">Batal</button>
        <button type="button" class="btn btn-primary" :disabled="store.saving" @click="submitForm">Simpan</button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import { useBillingAdjustmentStore } from '~/stores/billing-adjustments'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah, parseRupiahToNumber } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Billing Adjustment',
})

const store = useBillingAdjustmentStore()
const customerStore = useCustomerStore()
const { rows, loading, loadingStats, totalRecords, statistics } = storeToRefs(store)

const formatRupiah = useFormatRupiah()
const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total',
    value: statistics.value?.total ?? 0,
    subtitle: 'Semua adjustment',
    icon: 'ri-file-list-3-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Jumlah Keseluruhan',
      description: 'Jumlah seluruh Billing Adjustment yang terdaftar dalam sistem, mencakup semua status.',
    },
  },
  {
    key: 'draft',
    label: 'Draft',
    value: statistics.value?.draft ?? 0,
    subtitle: 'Menunggu approve',
    icon: 'ri-draft-line',
    iconBgClass: 'bg-label-secondary',
    info: {
      title: 'Draft',
      description: 'Jumlah Billing Adjustment berstatus Draft yang menunggu persetujuan.',
    },
  },
  {
    key: 'approved',
    label: 'Approved',
    value: statistics.value?.approved ?? 0,
    subtitle: `Siap ke preparation · ${formatRupiah(statistics.value?.approvedAmount ?? 0)}`,
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
    valueClass: 'text-success',
    info: {
      title: 'Approved',
      description: 'Jumlah Billing Adjustment yang telah disetujui dan siap ke preparation. Subtitle menampilkan total nominal approved dari statistik API.',
    },
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    value: statistics.value?.cancelled ?? 0,
    subtitle: 'Dibatalkan',
    icon: 'ri-close-circle-line',
    iconBgClass: 'bg-label-danger',
    valueClass: 'text-danger',
    info: {
      title: 'Cancelled',
      description: 'Jumlah Billing Adjustment yang telah dibatalkan.',
    },
  },
])
const { userHasRole, userHasPermission } = usePermissions()
const { setListTitle } = useDynamicTitle()
const { getAttachmentUrl } = useImageUrl()

const searchQuery = ref('')
const filterPeriod = ref('')
const filterStatus = ref('')
const filterType = ref('')
const dialogVisible = ref(false)
const editingId = ref(null)
const existingAttachment = ref(null)
const fileRef = ref(null)
const form = ref({
  customerId: null,
  billingPeriod: '',
  type: 'additional_charge',
  amount: 0,
  description: '',
})

const customers = computed(() => customerStore.customers || [])

const hasActiveFilters = computed(() =>
  Boolean(filterPeriod.value || filterStatus.value || filterType.value)
)

const typeOptions = [
  { value: 'restitution', label: 'Restitution' },
  { value: 'additional_charge', label: 'Additional Charge' },
  { value: 'discount', label: 'Discount' },
  { value: 'penalty', label: 'Penalty' },
  { value: 'correction', label: 'Correction' },
  { value: 'other', label: 'Other' },
]

const typeLabel = (v) => typeOptions.find((t) => t.value === v)?.label || v

const statusBadge = (s) => ({
  draft: 'badge bg-label-secondary',
  approved: 'badge bg-label-success',
  cancelled: 'badge bg-label-danger',
}[s] || 'badge bg-label-secondary')

const getDocumentStatusLabel = (s) => ({
  draft: 'Draft',
  approved: 'Approved',
  cancelled: 'Cancelled',
}[s] || s)

/** Draft: semua dengan permission. Approved: superadmin/admin. Cancelled: tidak bisa. */
const canEditAdjustment = (row) => {
  if (!row || row.status === 'cancelled') return false
  if (row.status === 'draft') return true
  if (row.status === 'approved') {
    return userHasRole('superadmin') || userHasRole('admin')
  }
  return false
}

const applyFilters = () => {
  store.params.billingPeriod = filterPeriod.value || ''
  store.params.status = filterStatus.value || ''
  store.params.type = filterType.value || ''
  store.params.first = 0
  store.fetchList()
}

const resetFilters = () => {
  filterPeriod.value = ''
  filterStatus.value = ''
  filterType.value = ''
  applyFilters()
}

const debouncedSearch = useDebounceFn((v) => {
  store.params.search = v
  store.params.first = 0
  store.fetchList()
}, 400)

watch(searchQuery, (v) => debouncedSearch(v))

const onPage = (e) => {
  store.params.first = e.first
  store.params.rows = e.rows
  store.fetchList()
}

const onRowsChange = () => {
  store.params.first = 0
  store.fetchList()
}

const resetForm = () => {
  form.value = {
    customerId: null,
    billingPeriod: new Date().toISOString().slice(0, 7),
    type: 'additional_charge',
    amount: 0,
    description: '',
  }
  fileRef.value = null
  existingAttachment.value = null
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row) => {
  editingId.value = row.id
  existingAttachment.value = row.attachment || null
  form.value = {
    customerId: row.customerId ?? null,
    billingPeriod: row.billingPeriod || '',
    type: row.type || 'additional_charge',
    amount: Number(row.amount || 0),
    description: row.description || '',
  }
  fileRef.value = null
  dialogVisible.value = true
}

const onFile = (e) => {
  fileRef.value = e.target.files?.[0] || null
}

const onAmountInput = (e) => {
  form.value.amount = parseRupiahToNumber(e.target?.value || '')
}

const submitForm = async () => {
  if (!form.value.customerId || !form.value.billingPeriod) {
    useToast().error({ title: 'Error', message: 'Customer & periode wajib', color: 'red', position: 'bottomRight' })
    return
  }
  const payload = {
    customerId: form.value.customerId,
    billingPeriod: form.value.billingPeriod,
    type: form.value.type,
    amount: form.value.amount,
    description: form.value.description,
  }
  const ok = editingId.value
    ? await store.update(editingId.value, payload, fileRef.value)
    : await store.create(payload, fileRef.value)
  if (ok) {
    dialogVisible.value = false
    resetForm()
  }
}

onMounted(async () => {
  setListTitle('Billing Adjustment')
  await Promise.all([
    store.fetchList(),
    store.fetchStatistics(),
    customerStore.prefetchCustomers?.() || customerStore.fetchCustomers?.(true),
  ])
})
</script>
