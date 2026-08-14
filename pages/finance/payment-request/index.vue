<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-4">Modul pengajuan dana — Project, Operational, dan Reimbursement dalam satu halaman.</p>

      <ul v-if="visibleTabs.length" class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" v-for="tab in visibleTabs" :key="tab.value">
          <button
            type="button"
            class="nav-link"
            :class="{ active: activeRequestType === tab.value }"
            @click="switchRequestType(tab.value)"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>
      <div v-else class="alert alert-warning mb-4">
        Anda tidak memiliki permission untuk melihat tab Payment Request manapun.
      </div>

      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total</p>
                <div class="avatar"><span class="avatar-initial rounded bg-label-primary"><i class="ri-hand-coin-line"></i></span></div>
              </div>
              <h5 class="mb-0">{{ statistics?.totalPaymentRequests || 0 }}</h5>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Draft</p>
                <div class="avatar"><span class="avatar-initial rounded bg-label-secondary"><i class="ri-draft-line"></i></span></div>
              </div>
              <h5 class="mb-0">{{ statistics?.draftPaymentRequests || 0 }}</h5>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Pending</p>
                <div class="avatar"><span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span></div>
              </div>
              <h5 class="mb-0">{{ statistics?.pendingPaymentRequests || 0 }}</h5>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Approved</p>
                <div class="avatar"><span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span></div>
              </div>
              <h5 class="mb-0">{{ statistics?.approvedPaymentRequests || 0 }}</h5>
            </div>
          </div>
        </div>
      </div>

      <CollapsibleFilterCard
        title="Filter Payment Request"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <div class="row g-4">
          <div :class="activeRequestType === 'project' ? 'col-md-4' : 'col-md-6'">
            <FilterField>
              <label class="form-label">Status</label>
              <CustomSelect2
                v-model="filters.status"
                :options="statusOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Status"
              />
            </FilterField>
          </div>
          <div v-if="activeRequestType === 'project'" class="col-md-4">
            <FilterField>
              <label class="form-label">Sumber</label>
              <CustomSelect2
                v-model="filters.sourceType"
                :options="sourceTypeOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Sumber dokumen"
              />
            </FilterField>
          </div>
          <div :class="activeRequestType === 'project' ? 'col-md-4' : 'col-md-6'">
            <FilterField>
              <label class="form-label">Prioritas</label>
              <CustomSelect2
                v-model="filters.priority"
                :options="priorityOptions"
                :get-option-label="(o) => o.label"
                :reduce="(o) => o.value"
                searchable
                clearable
                placeholder="Prioritas"
              />
            </FilterField>
          </div>
          <div class="col-md-12 d-flex justify-content-end mt-2">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
              <i class="ri-refresh-line me-1"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
          <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
            <span class="me-2">Baris:</span>
            <Dropdown
              v-model="tableControls.rows"
              :options="rowsPerPageOptionsArray"
              @change="handleRowsChange"
              placeholder="Jumlah"
              style="width: 8rem;"
            />
          </div>
          <div class="d-flex align-items-center gap-2">
            <button
              v-if="canCreateCurrentType"
              @click="goCreate"
              class="btn btn-primary"
            >
              <i class="ri-add-line me-1"></i>Tambah
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="exportingCsv || loading"
              @click="exportCSV"
            >
              <span v-if="exportingCsv" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="ri-file-download-line me-1"></i>
              Export CSV
            </button>
            <span class="p-input-icon-left">
              <InputText
                v-model="globalFilterValue"
                placeholder="Cari no. PRQ, sumber, penerima..."
                class="w-full md:w-20rem"
              />
            </span>
          </div>
        </div>
        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            ref="myDataTableRef"
            :data="paymentRequests"
            :rows="Number(params.rows)"
            :loading="loading"
            :totalRecords="totalRecords"
            :first="params.first"
            :lazy="true"
            @page="onPage($event)"
            @sort="onSort($event)"
            responsiveLayout="scroll"
            paginatorPosition="bottom"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column header="#" :sortable="false">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="prqNumber" header="No. PRQ" :sortable="true" class="text-nowrap">
              <template #body="slotProps">
                <a
                  @click="navigateTo(`/finance/payment-request/detail/${slotProps.data.id}`)"
                  class="text-primary"
                  style="cursor:pointer;text-decoration:underline"
                >
                  {{ getPaymentRequestNo(slotProps.data) || '—' }}
                </a>
              </template>
            </Column>
            <Column field="dueDate" header="Jatuh Tempo" :sortable="true" class="text-nowrap">
              <template #body="slotProps">
                {{ formatListDate(slotProps.data.dueDate || slotProps.data.due_date) }}
              </template>
            </Column>
            <Column field="sourceType" header="Tipe / Sumber" :sortable="true">
              <template #body="slotProps">
                <div class="small">
                  <div class="fw-medium">
                    {{ getRequestTypeLabel(slotProps.data.requestType || slotProps.data.request_type) }}
                  </div>
                  <div v-if="(slotProps.data.requestType || slotProps.data.request_type || 'project') === 'project'" class="text-muted">
                    {{ getSourceTypeLabel(slotProps.data.sourceType || slotProps.data.source_type) }}
                    · {{ slotProps.data.sourceNumber || slotProps.data.source_number || '—' }}
                  </div>
                  <div v-else class="text-muted">
                    {{ getPaymentMethodLabel(slotProps.data.paymentMethod || slotProps.data.payment_method) }}
                  </div>
                </div>
              </template>
            </Column>
            <Column field="payeeName" header="Penerima" :sortable="false">
              <template #body="slotProps">
                {{ slotProps.data.payeeName || slotProps.data.payee_name || slotProps.data.vendor?.name || '—' }}
              </template>
            </Column>
            <Column field="totalAmount" header="Nominal" :sortable="true">
              <template #body="slotProps">{{ formatRupiah(slotProps.data.totalAmount) }}</template>
            </Column>
            <Column field="attachment" header="File" :sortable="false" style="width:4rem">
              <template #body="slotProps">
                <a
                  v-if="slotProps.data.attachment"
                  :href="getAttachmentUrl(slotProps.data.attachment)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-icon btn-text-secondary"
                  title="Lihat attachment"
                  @click.stop
                >
                  <i :class="getFileIcon(slotProps.data.attachment)"></i>
                </a>
                <span v-else class="text-muted">—</span>
              </template>
            </Column>
            <Column field="requestedByUser.full_name" header="Pemohon" :sortable="true">
              <template #body="slotProps">
                {{
                  slotProps.data.requestedByUser?.fullName ||
                  slotProps.data.requestedByUser?.full_name ||
                  slotProps.data.createdByUser?.full_name ||
                  '-'
                }}
              </template>
            </Column>
            <Column field="status" header="Status" :sortable="true">
              <template #body="slotProps">
                <span :class="getStatusBadge(slotProps.data).class">{{ getStatusBadge(slotProps.data).text }}</span>
              </template>
            </Column>
            <Column header="Actions" :exportable="false" style="min-width:9rem">
              <template #body="slotProps">
                <div class="d-inline-block dropdown">
                  <a
                    href="javascript:;"
                    class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    data-bs-toggle="dropdown"
                    data-bs-popper-config='{"strategy":"fixed"}'
                  >
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end prq-actions-dropdown">
                    <li v-if="canSubmitRow(slotProps.data)">
                      <a class="dropdown-item" href="javascript:void(0)" @click="paymentRequestStore.submitPaymentRequest(slotProps.data.id)">
                        <i class="ri-send-plane-line me-2"></i>Submit
                      </a>
                    </li>
                    <li v-if="canEditRow(slotProps.data)">
                      <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/finance/payment-request/form/${slotProps.data.id}`)">
                        <i class="ri-edit-box-line me-2"></i>Edit
                      </a>
                    </li>
                    <li v-if="canApprovePaymentRequest(slotProps.data)">
                      <a class="dropdown-item text-success" href="javascript:void(0)" @click="paymentRequestStore.approvePaymentRequest(slotProps.data.id)">
                        <i class="ri-check-line me-2"></i>Approve
                      </a>
                    </li>
                    <li v-if="canRejectPaymentRequest(slotProps.data)">
                      <a class="dropdown-item text-danger" href="javascript:void(0)" @click="rejectRow(slotProps.data)">
                        <i class="ri-close-line me-2"></i>Reject
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/finance/payment-request/detail/${slotProps.data.id}`)">
                        <i class="ri-eye-line me-2"></i>Detail
                      </a>
                    </li>
                    <li>
                      <a
                        class="dropdown-item"
                        href="javascript:void(0)"
                        @click="navigateTo({ path: '/finance/cetak-payment-request', query: { id: slotProps.data.id } })"
                      >
                        <i class="ri-printer-line me-2"></i>Cetak
                      </a>
                    </li>
                    <li v-if="canDeleteRow(slotProps.data)">
                      <a class="dropdown-item text-danger" href="javascript:void(0)" @click="paymentRequestStore.deletePaymentRequest(slotProps.data.id)">
                        <i class="ri-delete-bin-7-line me-2"></i>Hapus
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  usePaymentRequestStore,
  getPaymentRequestNo,
  getSourceTypeLabel,
  getRequestTypeLabel,
  getPaymentMethodLabel,
  type PaymentRequestRequestType,
} from '~/stores/payment-request'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterField from '~/components/list/FilterField.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'
import { usePaymentRequestApproval } from '~/composables/usePaymentRequestApproval'
import { usePaymentRequestTabPermissions } from '~/composables/usePaymentRequestTabPermissions'
import { useImageUrl } from '~/composables/useImageUrl'

const paymentRequestStore = usePaymentRequestStore()
const { canApprovePaymentRequest, canRejectPaymentRequest } = usePaymentRequestApproval()
const {
  visibleTabs,
  defaultRequestType,
  canCreateType,
  canEditType,
  canDeleteType,
  canAccessTab,
  resolveAllowedType,
} = usePaymentRequestTabPermissions()
const { getAttachmentUrl, getFileIcon } = useImageUrl()
const formatRupiah = useFormatRupiah()
const { paymentRequests, loading, totalRecords, params, statistics } = storeToRefs(paymentRequestStore)
const tableControls = ref({ rows: 10 })
const filters = ref({ status: null as string | null, priority: null as string | null, sourceType: null as string | null })
const exportingCsv = ref(false)

const activeRequestType = computed(
  () =>
    (params.value.requestType && canAccessTab(params.value.requestType as PaymentRequestRequestType)
      ? params.value.requestType
      : defaultRequestType.value) as PaymentRequestRequestType
)

function switchRequestType(type: PaymentRequestRequestType) {
  if (!canAccessTab(type)) return
  paymentRequestStore.setRequestType(type)
}

function goCreate() {
  navigateTo({
    path: '/finance/payment-request/form',
    query: { type: activeRequestType.value },
  })
}

const canCreateCurrentType = computed(() => canCreateType(activeRequestType.value))

function formatListDate(val: unknown) {
  if (!val) return '—'
  const raw = String(val)
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  try {
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return raw
  }
}

const hasActiveFilters = computed(
  () => !!filters.value.status || !!filters.value.priority || !!filters.value.sourceType
)

function resetFilters() {
  filters.value.status = null
  filters.value.priority = null
  filters.value.sourceType = null
}

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
]
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]
const sourceTypeOptions = [
  { label: 'Purchase Order', value: 'purchase_order' },
  { label: 'Material Request Form', value: 'material_request' },
  { label: 'Advanced Request Form', value: 'arf' },
]
const { getStatusBadge } = useApprovalStatus()

function rowTypeOf(row: any): PaymentRequestRequestType {
  return (row?.requestType || row?.request_type || 'project') as PaymentRequestRequestType
}

function canEditRow(row: any) {
  const isEditable = row?.status === 'draft' || row?.status === 'rejected'
  return isEditable && canEditType(rowTypeOf(row))
}

function canSubmitRow(row: any) {
  return canEditRow(row)
}

function canDeleteRow(row: any) {
  return row?.status === 'draft' && canDeleteType(rowTypeOf(row))
}

async function rejectRow(row) {
  const { value, isConfirmed } = await Swal.fire({
    title: 'Tolak Payment Request',
    input: 'textarea',
    inputLabel: 'Alasan penolakan',
    inputPlaceholder: 'Wajib diisi',
    inputValidator: (v) => (!v?.trim() ? 'Alasan penolakan wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Tolak',
    cancelButtonText: 'Batal',
    customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-label-secondary' },
  })
  if (isConfirmed && value?.trim()) {
    await paymentRequestStore.rejectPaymentRequest(row.id, value.trim())
  }
}

const onPage = (e) => {
  if (e) paymentRequestStore.setPagination(e)
}
const onSort = (e) => {
  if (e) paymentRequestStore.setSort(e)
}
const handleRowsChange = (v) => {
  params.value.rows = Number(v) || 10
  params.value.first = 0
  paymentRequestStore.fetchPaymentRequests()
}
const debouncedSearch = useDebounceFn(() => paymentRequestStore.setSearch(globalFilterValue.value), 500)
watch(globalFilterValue, debouncedSearch)
watch(
  filters,
  (f) =>
    paymentRequestStore.setFilters({
      status: f.status,
      priority: f.priority,
      sourceType: f.sourceType as any,
    }),
  { deep: true }
)

function csvCell(value: unknown) {
  const str = value === null || value === undefined ? '' : String(value)
  return `"${str.replace(/"/g, '""')}"`
}

function formatDateCsv(val: unknown) {
  if (!val) return ''
  const raw = String(val)
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  try {
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${d.getFullYear()}`
  } catch {
    return raw
  }
}

function itemTypeLabel(item: any) {
  const t = item?.itemType ?? item?.item_type
  return t === 'other' ? 'Biaya lainnya' : 'Item sumber'
}

function statusLabelCsv(s: string | null | undefined) {
  const map: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return s ? map[s] || s : ''
}

async function exportCSV() {
  const toast = useToast()
  exportingCsv.value = true
  try {
    const data = await paymentRequestStore.fetchAllForExport()
    if (!data.length) {
      toast.warning({
        title: 'Peringatan',
        message: 'Tidak ada data untuk diexport',
        color: 'orange',
        position: 'bottomRight',
      })
      return
    }

    const headers = [
      'No. PRQ',
      'Tanggal Request',
      'Due Date / Jatuh Tempo',
      'Sumber',
      'No. Dokumen Sumber',
      'Penerima',
      'Bank',
      'No. Rekening',
      'Atas Nama',
      'Prioritas',
      'Status',
      'Pemohon',
      'Departemen',
      'Keperluan',
      'Tipe Item',
      'Deskripsi Item',
      'Qty',
      'Nominal Satuan',
      'Subtotal Item',
      'Catatan Item',
      'Subtotal Semua Item',
      'Diskon (%)',
      'DPP',
      'Pajak (%)',
      'Nilai Pajak',
      'Pajak (Tax Master)',
      'Grand Total',
      'Mata Uang',
      'Catatan',
    ]

    const lines = [`\uFEFF${headers.map(csvCell).join(',')}`]

    for (const row of data) {
      const items = row.paymentRequestItems || row.payment_request_items || []
      const taxes = row.taxes || []
      const taxMasterLabel = taxes.length
        ? taxes
            .map((t: any) => {
              const code = t.taxCode ?? t.tax_code ?? ''
              const rate = t.rate ?? 0
              const calc = t.calculationType ?? t.calculation_type
              const rateLabel = calc === 'FIXED' ? String(rate) : `${rate}%`
              return `${code} (${rateLabel})`
            })
            .join('; ')
        : ''

      const base = [
        getPaymentRequestNo(row),
        formatDateCsv(row.requestDate || row.request_date || row.createdAt),
        formatDateCsv(row.dueDate || row.due_date),
        getSourceTypeLabel(row.sourceType || row.source_type),
        row.sourceNumber || row.source_number || '',
        row.payeeName || row.payee_name || row.vendor?.name || '',
        row.bankName || row.bank_name || '',
        row.bankAccountNumber || row.bank_account_number || '',
        row.bankAccountName || row.bank_account_name || '',
        (row.priority || '').toString().toUpperCase(),
        statusLabelCsv(row.status),
        row.requestedByUser?.fullName ||
          row.requestedByUser?.full_name ||
          row.createdByUser?.full_name ||
          '',
        row.department?.nm_departemen || row.department?.nmDepartemen || '',
        row.purpose || '',
      ]

      const allItemsSubtotal = items.reduce(
        (s: number, it: any) => s + (Number(it.subtotal) || 0),
        0
      )
      const nominals = [
        allItemsSubtotal,
        Number(row.discountPercent ?? row.discount_percent ?? 0),
        Number(row.dpp ?? 0),
        Number(row.taxPercent ?? row.tax_percent ?? 0),
        Number(row.taxAmount ?? row.tax_amount ?? 0),
        taxMasterLabel,
        Number(row.totalAmount ?? 0),
        row.currency || 'IDR',
        row.notes || '',
      ]

      const rowsToWrite = items.length ? items : [null]
      for (const item of rowsToWrite) {
        lines.push(
          [
            ...base,
            item ? itemTypeLabel(item) : '',
            item?.description || (item ? '' : 'Tidak ada item'),
            item ? Number(item.qty) || 0 : '',
            item ? Number(item.unitAmount ?? item.unit_amount) || 0 : '',
            item ? Number(item.subtotal) || 0 : '',
            item?.remarks || '',
            ...nominals,
          ]
            .map(csvCell)
            .join(',')
        )
      }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `payment-requests_${new Date().toISOString().slice(0, 10)}.csv`
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success({
      title: 'Berhasil',
      message: `CSV berhasil diunduh (${data.length} payment request)`,
      color: 'green',
      position: 'bottomRight',
    })
  } catch (error: any) {
    toast.error({
      title: 'Error',
      message: `Gagal export CSV: ${error?.message || 'Unknown error'}`,
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    exportingCsv.value = false
  }
}

onMounted(() => {
  const allowed = resolveAllowedType(paymentRequestStore.params.requestType)
  if (!allowed) {
    return
  }
  paymentRequestStore.params.requestType = allowed
  paymentRequestStore.fetchPaymentRequests()
  paymentRequestStore.fetchStatistics()
})

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Payment Request' })
</script>

<style scoped>
/* Dropdown aksi: fixed strategy agar tidak ter-clip overflow datatable */
:deep(.prq-actions-dropdown) {
  z-index: 1100 !important;
}
</style>
