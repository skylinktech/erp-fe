<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Payment Request</h4>
      <p class="mb-6">Pengajuan dana ke Direktur Utama berdasarkan Purchase Order, Material Request Form, atau Advanced Request Form.</p>

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
          <div class="col-md-4">
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
          <div class="col-md-4">
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
          <div class="col-md-4">
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
              v-if="userHasRole('superadmin') || userHasPermission('create_payment_request')"
              @click="navigateTo('/finance/payment-request/form')"
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
            <Column field="sourceType" header="Sumber" :sortable="true">
              <template #body="slotProps">
                <div class="small">
                  <div>{{ getSourceTypeLabel(slotProps.data.sourceType || slotProps.data.source_type) }}</div>
                  <div class="text-muted">{{ slotProps.data.sourceNumber || slotProps.data.source_number || '—' }}</div>
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
                <button
                  type="button"
                  class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                  aria-haspopup="true"
                  aria-controls="prq-actions-menu"
                  @click.stop="toggleActions($event, slotProps.data)"
                >
                  <i class="ri-more-2-fill"></i>
                </button>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
    </div>

    <Menu
      id="prq-actions-menu"
      ref="actionsMenuRef"
      :model="actionMenuItems"
      :popup="true"
      append-to="body"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  usePaymentRequestStore,
  getPaymentRequestNo,
  getSourceTypeLabel,
} from '~/stores/payment-request'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterField from '~/components/list/FilterField.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'
import { usePaymentRequestApproval } from '~/composables/usePaymentRequestApproval'

const paymentRequestStore = usePaymentRequestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { canApprovePaymentRequest, canRejectPaymentRequest } = usePaymentRequestApproval()
const formatRupiah = useFormatRupiah()
const { paymentRequests, loading, totalRecords, params, statistics } = storeToRefs(paymentRequestStore)
const tableControls = ref({ rows: 10 })
const filters = ref({ status: null as string | null, priority: null as string | null, sourceType: null as string | null })
const exportingCsv = ref(false)

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

const actionsMenuRef = ref(null)
const activeRow = ref(null)

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items = []
  const canEdit = userHasRole('superadmin') || userHasPermission('edit_payment_request')
  const isEditable = row.status === 'draft' || row.status === 'rejected'

  if (canEdit && isEditable) {
    items.push({
      label: 'Submit',
      icon: 'ri ri-send-plane-line',
      command: () => paymentRequestStore.submitPaymentRequest(row.id),
    })
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/finance/payment-request/form/${row.id}`),
    })
  }
  if (canApprovePaymentRequest(row)) {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      command: () => paymentRequestStore.approvePaymentRequest(row.id),
    })
  }
  if (canRejectPaymentRequest(row)) {
    items.push({
      label: 'Reject',
      icon: 'ri ri-close-line',
      command: () => rejectRow(row),
    })
  }
  items.push({
    label: 'Detail',
    icon: 'ri ri-eye-line',
    command: () => navigateTo(`/finance/payment-request/detail/${row.id}`),
  })
  items.push({
    label: 'Cetak',
    icon: 'ri ri-printer-line',
    command: () => navigateTo({ path: '/finance/cetak-payment-request', query: { id: row.id } }),
  })
  if (
    userHasRole('superadmin') ||
    (row.status === 'draft' && userHasPermission('delete_payment_request'))
  ) {
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'text-danger',
      command: () => paymentRequestStore.deletePaymentRequest(row.id),
    })
  }
  return items
})

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

function toggleActions(event, row) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
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
        position: 'topRight',
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
      position: 'topRight',
    })
  } catch (error: any) {
    toast.error({
      title: 'Error',
      message: `Gagal export CSV: ${error?.message || 'Unknown error'}`,
      color: 'red',
      position: 'topRight',
    })
  } finally {
    exportingCsv.value = false
  }
}

onMounted(() => {
  paymentRequestStore.fetchPaymentRequests()
  paymentRequestStore.fetchStatistics()
})

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Payment Request' })
</script>
