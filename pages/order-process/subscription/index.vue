<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6">Daftar Subscription yang terdaftar di sistem</p>

      <ListPageStatsCards :items="statItems" />

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard title="Filter Subscription" :has-active-filters="hasActiveFilters" @reset="resetFilters">
            <FilterFieldsRow :columns="2">
              <FilterField>
                <label class="form-label">Customer</label>
                <CustomSelect2 v-model="filters.customerId" :options="customers || []" :get-option-label="o => o?.name ?? ''" :reduce="o => o?.id" searchable clearable placeholder="Pilih Customer" />
              </FilterField>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih Status" />
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>
        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(tableControls.rows)"
              :rows-options="rowsPerPageOptionsArray"
              :search="globalFilterValue"
              search-placeholder="Cari Subscription..."
              :export-disabled="loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
              @export="exportData"
            >
              <template #add>
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_subscription')"
                  type="button"
                  class="btn btn-primary subscription-add-button"
                  @click="navigateTo('/order-process/subscription/form')"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Data
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="subscriptions"
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
                <Column field="noSubscription" header="No. Subscription" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/order-process/subscription/detail/${slotProps.data.id}`)" class="text-primary" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.noSubscription || slotProps.data.no_subscription }}</a>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer" :sortable="true" class="text-nowrap" />
                <Column field="quotation.noQuotation" header="Quotation" :sortable="true">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/sales/quotation/detail/${slotProps.data.quotation.id}`)" class="text-primary text-nowrap" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.quotation?.noQuotation || slotProps.data.quotation?.no_quotation || '-' }}</a>
                  </template>
                </Column>
                <Column header="Skema" :sortable="false" class="text-nowrap">
                  <template #body="slotProps">
                    {{ getBusinessSchemeLabel(slotProps.data) }}
                  </template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.status).class">{{ getStatusBadge(slotProps.data.status).text }}</span>
                  </template>
                </Column>
                <Column field="contractPeriod" header="Contract Period" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.contractPeriod || slotProps.data.contract_period || '-' }} bulan</template>
                </Column>
                <Column field="targetActiveDate" header="Target Activation" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.targetActiveDate || slotProps.data.target_active_date ? new Date(slotProps.data.targetActiveDate || slotProps.data.target_active_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column field="createdAt" header="Tanggal" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:9rem">
                  <template #body="slotProps">
                    <div class="dropdown d-inline-block">
                      <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'><i class="ri-more-2-fill"></i></a>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/order-process/subscription/form/${slotProps.data.id}`)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && (slotProps.data.status === 'signed' || slotProps.data.status === 'expired')">
                          <a class="dropdown-item text-success" href="javascript:void(0)" @click="handleActivate(slotProps.data)"><i class="ri-checkbox-circle-line me-2"></i> Aktifkan</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && (slotProps.data.status === 'draft' || slotProps.data.status === 'signed')">
                          <a class="dropdown-item text-warning" href="javascript:void(0)" @click="openCancelModal(slotProps.data)"><i class="ri-close-circle-line me-2"></i> Cancel</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && (slotProps.data.status === 'active' || slotProps.data.status === 'signed')">
                          <a class="dropdown-item" href="javascript:void(0)" @click="openAttachmentModal(slotProps.data)"><i class="ri-attachment-line me-2"></i> Edit Attachment</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('delete_subscription')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="subscriptionStore.deleteSubscription(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/order-process/subscription/detail/${slotProps.data.id}`)"><i class="ri-eye-line me-2"></i> Lihat Detail</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="goToCetak(slotProps.data)"><i class="ri-printer-line me-2"></i> Cetak</a>
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

    </div>
    <div class="content-backdrop fade"></div>
    <SubscriptionAttachmentModal
      v-model="showAttachmentModal"
      :subscription-id="selectedAttachmentSubscription?.id || null"
      :subscription-data="selectedAttachmentSubscription"
      @saved="refreshAfterAttachmentSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import SubscriptionAttachmentModal from '~/components/subscription/SubscriptionAttachmentModal.vue'
import { useSubscriptionStore } from '~/stores/subscription'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import Swal from 'sweetalert2'

const { setListTitle } = useDynamicTitle()
const subscriptionStore = useSubscriptionStore()
const customerStore = useCustomerStore()
const { userHasPermission, userHasRole } = usePermissions()

const { subscriptions, loading, totalRecords, params, statistics } = storeToRefs(subscriptionStore)
const { customers } = storeToRefs(customerStore)

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total Subscription',
    value: statistics.value?.totalSubscriptions ?? 0,
    subtitle: 'Subscription terdaftar',
    icon: 'ri-file-list-3-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Jumlah Keseluruhan',
      description:
        'Jumlah seluruh dokumen Subscription yang terdaftar dalam sistem, mencakup semua status.',
    },
  },
  {
    key: 'draft',
    label: 'Draft',
    value: statistics.value?.draftSubscriptions ?? 0,
    subtitle: 'Draft',
    icon: 'ri-draft-line',
    iconBgClass: 'bg-label-secondary',
    info: {
      title: 'Draft',
      description:
        'Jumlah dokumen Subscription berstatus Draft yang belum diproses lebih lanjut.',
    },
  },
  {
    key: 'signed',
    label: 'Signed',
    value: statistics.value?.signedSubscriptions ?? 0,
    subtitle: 'Signed',
    icon: 'ri-file-check-line',
    iconBgClass: 'bg-label-info',
    info: {
      title: 'Signed',
      description:
        'Jumlah dokumen Subscription yang telah ditandatangani dan menunggu atau menjalani proses aktivasi.',
    },
  },
  {
    key: 'active',
    label: 'Active',
    value: statistics.value?.activeSubscriptions ?? 0,
    subtitle: 'Active',
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
    info: {
      title: 'Active',
      description: 'Jumlah Subscription yang saat ini berstatus aktif.',
    },
  },
  {
    key: 'canceled',
    label: 'Canceled',
    value: statistics.value?.canceledSubscriptions ?? 0,
    subtitle: 'Canceled',
    icon: 'ri-close-circle-line',
    iconBgClass: 'bg-label-danger',
    info: {
      title: 'Canceled',
      description: 'Jumlah dokumen Subscription yang telah dibatalkan.',
    },
  },
])

const tableControls = ref({ rows: 10, search: '' })
const filters = ref({ search: '', customerId: null, status: null })
const showAttachmentModal = ref(false)
const selectedAttachmentSubscription = ref(null)

const hasActiveFilters = computed(
  () => !!filters.value.customerId || !!filters.value.status
)

function resetFilters() {
  filters.value.customerId = null
  filters.value.status = null
}
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Signed', value: 'signed' },
  { label: 'Active', value: 'active' },
  { label: 'Terminated', value: 'terminated' },
  { label: 'Expired', value: 'expired' },
  { label: 'Canceled', value: 'canceled' },
]

function getStatusBadge(status) {
  if (!status) return { text: '-', class: 'badge rounded-pill bg-label-light' }
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'signed': return { text: 'Signed', class: 'badge rounded-pill bg-label-info' }
    case 'active': return { text: 'Active', class: 'badge rounded-pill bg-label-success' }
    case 'terminated': return { text: 'Terminated', class: 'badge rounded-pill bg-label-warning' }
    case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
    case 'canceled': return { text: 'Canceled', class: 'badge rounded-pill bg-label-danger' }
    default: return { text: status, class: 'badge rounded-pill bg-label-light' }
  }
}

/** Quotation → Site Investment → Business Scheme (preloaded server-side). */
function getBusinessSchemeLabel(row) {
  const q = row?.quotation
  const si = q?.siteInvest ?? q?.site_invest
  const scheme = si?.businessScheme ?? si?.business_scheme
  return scheme?.name || scheme?.code || '-'
}

function goToCetak(row) {
  if (!row?.id) return
  navigateTo({
    path: '/order-process/cetak-subscription',
    query: { id: String(row.id), print: 'true' },
  })
}

async function handleActivate(row) {
  const confirmed = await Swal.fire({
    title: 'Aktifkan Subscription',
    text: `Yakin ingin mengubah status subscription ${row.noSubscription || row.no_subscription || row.id} menjadi Active?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#00ac4f',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Aktifkan',
    cancelButtonText: 'Batal',
  })
  if (confirmed.isConfirmed) {
    const ok = await subscriptionStore.activateSubscription(row.id)
    if (ok) {
      subscriptionStore.fetchSubscriptions()
      subscriptionStore.fetchStatistics()
    }
  }
}

async function openCancelModal(row) {
  const result = await Swal.fire({
    title: 'Cancel Subscription',
    html: `<div style="text-align:left;width:100%;padding:0">
             <p style="margin:0 0 0.75rem 0">Yakin ingin membatalkan subscription <strong>${row.noSubscription || row.no_subscription || row.id}</strong>?</p>
             <label for="swal-reason-cancel" style="display:block;margin-bottom:0.35rem;font-weight:500">Alasan cancel (opsional)</label>
             <textarea id="swal-reason-cancel" rows="3" placeholder="Masukkan alasan cancel..." style="width:100%;box-sizing:border-box;padding:0.5rem 0.6rem;margin:0;border:1px solid #d9dee3;border-radius:0.375rem;font-size:0.9375rem;resize:vertical;min-height:4rem"></textarea>
           </div>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f13636',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Cancel',
    cancelButtonText: 'Batal',
    preConfirm: () => document.getElementById('swal-reason-cancel')?.value?.trim() || null,
  })
  if (result.isConfirmed) {
    const ok = await subscriptionStore.cancelSubscription(row.id, result.value ?? null)
    if (ok) subscriptionStore.fetchSubscriptions()
  }
}

function openAttachmentModal(row) {
  selectedAttachmentSubscription.value = row
  showAttachmentModal.value = true
}

async function refreshAfterAttachmentSave() {
  await subscriptionStore.fetchSubscriptions(true)
  await subscriptionStore.fetchStatistics()
}

const handleRowsChange = (v) => { 
  const rowsValue = Number(v) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  subscriptionStore.fetchSubscriptions()
}
const onToolbarRows = (v) => {
  tableControls.value.rows = Number(v) || 10
  handleRowsChange(v)
}

async function exportData(format) {
  const toast = useToast()
  if (format === 'excel') {
    try {
      toast.info({ title: 'Info', message: 'Mempersiapkan export Excel...', color: 'blue', position: 'bottomRight', layout: 2 })
      const all = await subscriptionStore.fetchAllSubscriptionsForExport()
      if (!all?.length) {
        toast.warning({ title: 'Warning', message: 'Tidak ada data untuk diexport', color: 'orange', position: 'bottomRight', layout: 2 })
        return
      }
      const XLSX = await import('xlsx').then((m) => m.default || m)
      const headers = ['No. Subscription', 'Customer', 'Status', 'Contract (bln)', 'Target Activation', 'Tanggal']
      const rows = all.map((r) => [
        r.noSubscription || r.no_subscription || '-',
        r.customer?.name || '-',
        r.status || '-',
        r.contractPeriod ?? r.contract_period ?? '-',
        (r.targetActiveDate || r.target_active_date) ? new Date(r.targetActiveDate || r.target_active_date).toLocaleDateString('id-ID') : '-',
        r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID') : '-',
      ])
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
      ws['!cols'] = headers.map(() => ({ wch: 18 }))
      XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions')
      XLSX.writeFile(wb, 'subscriptions.xlsx')
      toast.success({ title: 'Success', message: `Excel berisi ${all.length} baris`, color: 'green', position: 'bottomRight', layout: 2 })
    } catch (e) {
      console.error(e)
      toast.error({ title: 'Error', message: 'Gagal export Excel', color: 'red', position: 'bottomRight', layout: 2 })
    }
    return
  }
  if (format === 'pdf') {
    try {
      toast.info({ title: 'Info', message: 'Mempersiapkan export PDF...', color: 'blue', position: 'bottomRight', layout: 2 })
      const all = await subscriptionStore.fetchAllSubscriptionsForExport()
      if (!all?.length) {
        toast.warning({ title: 'Warning', message: 'Tidak ada data untuk diexport', color: 'orange', position: 'bottomRight', layout: 2 })
        return
      }
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF('landscape')
      doc.setFontSize(14)
      doc.text('Laporan Subscription', 14, 16)
      const body = all.map((r) => [
        r.noSubscription || r.no_subscription || '-',
        r.customer?.name || '-',
        r.status || '-',
        r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID') : '-',
      ])
      autoTable(doc, {
        head: [['No. Subscription', 'Customer', 'Status', 'Tanggal']],
        body,
        startY: 22,
        styles: { fontSize: 8 },
      })
      doc.save('subscriptions.pdf')
      toast.success({ title: 'Success', message: `PDF berisi ${all.length} baris`, color: 'green', position: 'bottomRight', layout: 2 })
    } catch (e) {
      console.error(e)
      toast.error({ title: 'Error', message: 'Gagal export PDF', color: 'red', position: 'bottomRight', layout: 2 })
    }
  }
}

const onPage = (e) => { if (e) subscriptionStore.setPagination(e) }
const onSort = (e) => { if (e) subscriptionStore.setSort(e) }

const debouncedSearch = useDebounceFn(() => {
  subscriptionStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => { subscriptionStore.setFilters({ customerId: f.customerId, status: f.status, search: f.search }) }, { deep: true })

const route = useRoute()
onMounted(() => {
  subscriptionStore.fetchSubscriptions()
  subscriptionStore.fetchStatistics()
  customerStore.fetchCustomers()
  setListTitle('Subscription', subscriptions.value?.length ?? 0)
  tableControls.value.rows = Number(params.value.rows) || 10
  globalFilterValue.value = params.value.search || ''
  const editId = Array.isArray(route.query?.edit) ? route.query.edit[0] : route.query?.edit
  if (editId) navigateTo(`/order-process/subscription/form/${String(editId)}`)
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Subscription',
})
</script>

<style scoped>
.subscription-add-button {
  flex: 0 0 auto;
  white-space: nowrap;
}
</style>
