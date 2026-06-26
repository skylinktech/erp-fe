<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Purchase Request</h4>
      <p class="mb-6">Permintaan barang internal perusahaan (ATK, perangkat keras, dll.)</p>

      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Total PR</p><div class="avatar"><span class="avatar-initial rounded bg-label-primary"><i class="ri-file-list-3-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.totalPurchaseRequests || 0 }}</h5></div></div></div>
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Draft</p><div class="avatar"><span class="avatar-initial rounded bg-label-secondary"><i class="ri-draft-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.draftPurchaseRequests || 0 }}</h5></div></div></div>
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Pending</p><div class="avatar"><span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.pendingPurchaseRequests || 0 }}</h5></div></div></div>
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Approved</p><div class="avatar"><span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.approvedPurchaseRequests || 0 }}</h5></div></div></div>
      </div>

      <div class="row g-6">
        <div class="col-12"><h4 class="mt-2 mb-1">Filter</h4></div>
        <div class="col-12">
          <div class="card"><div class="card-body"><div class="row g-2">
            <div class="col-md-6">
              <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Status" />
            </div>
            <div class="col-md-6">
              <CustomSelect2 v-model="filters.priority" :options="priorityOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Prioritas" />
            </div>
          </div></div></div>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0"><span class="me-2">Baris:</span><Dropdown v-model="tableControls.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" /></div>
              <div class="d-flex align-items-center gap-2">
                <button v-if="userHasRole('superadmin') || userHasPermission('create_purchase_request')" @click="navigateTo('/purchasing/purchase-request/form')" class="btn btn-primary"><i class="ri-add-line me-1"></i>Tambah</button>
                <span class="p-input-icon-left"><InputText v-model="globalFilterValue" placeholder="Cari no. PR, keterangan..." class="w-full md:w-20rem" /></span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable ref="myDataTableRef" :data="purchaseRequests" :rows="Number(params.rows)" :loading="loading" :totalRecords="totalRecords" :first="params.first" :lazy="true" @page="onPage($event)" @sort="onSort($event)" responsiveLayout="scroll" paginatorPosition="bottom" paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data">
                <Column header="#" :sortable="false"><template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template></Column>
                <Column field="prNumber" header="No. PR" :sortable="true" class="text-nowrap"><template #body="slotProps"><a @click="navigateTo(`/purchasing/purchase-request/detail/${slotProps.data.id}`)" class="text-primary" style="cursor:pointer;text-decoration:underline">{{ slotProps.data.prNumber || slotProps.data.pr_number || slotProps.data.noPurchaseRequest }}</a></template></Column>
                <Column field="priority" header="Prioritas" :sortable="true"><template #body="slotProps"><span class="text-capitalize">{{ slotProps.data.priority || '-' }}</span></template></Column>
                <Column field="totalAmount" header="Total" :sortable="true"><template #body="slotProps">{{ formatRupiah(slotProps.data.totalAmount ?? slotProps.data.grandTotal) }}</template></Column>
                <Column field="requestedByUser.full_name" header="Pemohon" :sortable="true"><template #body="slotProps">{{ slotProps.data.requestedByUser?.fullName || slotProps.data.requestedByUser?.full_name || slotProps.data.createdByUser?.full_name || '-' }}</template></Column>
                <Column field="status" header="Status" :sortable="true"><template #body="slotProps"><span :class="getStatusBadge(slotProps.data).class">{{ getStatusBadge(slotProps.data).text }}</span></template></Column>
                <Column header="Stok" :sortable="false" style="min-width:8.5rem">
                  <template #body="slotProps">
                    <span
                      v-if="prStockDisplay(slotProps.data).useBadge"
                      :class="['badge', prStockDisplay(slotProps.data).badgeClass]"
                      :title="prStockDisplay(slotProps.data).title"
                    >
                      {{ prStockDisplay(slotProps.data).label }}
                    </span>
                    <span v-else class="text-muted small">—</span>
                  </template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:9rem">
                  <template #body="slotProps">
                    <button
                      type="button"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                      aria-haspopup="true"
                      aria-controls="pr-actions-menu"
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
      </div>
    </div>

    <Menu
      id="pr-actions-menu"
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
import { usePurchaseRequestStore } from '~/stores/purchase-request'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'
import { usePurchaseRequestApproval } from '~/composables/usePurchaseRequestApproval'
import { usePurchaseRequestListStockCache } from '~/composables/usePurchaseRequestListStockCache'
import { stockSummaryLabel } from '~/utils/purchasing/stockAvailability'

const purchaseRequestStore = usePurchaseRequestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { canApprovePurchaseRequest, canRejectPurchaseRequest } = usePurchaseRequestApproval()
const formatRupiah = useFormatRupiah()
const { purchaseRequests, loading, totalRecords, params, statistics } = storeToRefs(purchaseRequestStore)
const tableControls = ref({ rows: 10 })
const filters = ref({ status: null, priority: null })
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const statusOptions = [{ label: 'Draft', value: 'draft' }, { label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Completed', value: 'completed' }]
const priorityOptions = [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }]
const { getStatusBadge } = useApprovalStatus()

const { getEntry: getPrStockEntry } = usePurchaseRequestListStockCache(purchaseRequests)

const PR_STOCK_CHECK_STATUSES = ['pending', 'approved', 'completed']

function prStockDisplay(row: { id: number; status?: string }) {
  const status = String(row?.status ?? '').toLowerCase()
  if (!PR_STOCK_CHECK_STATUSES.includes(status)) {
    return { label: '—', badgeClass: 'bg-label-secondary', title: undefined, useBadge: false }
  }
  const entry = getPrStockEntry(Number(row.id))
  if (!entry) {
    return stockSummaryLabel(null, { loading: true })
  }
  return stockSummaryLabel(entry.result, {
    loading: entry.loading,
    error: entry.error,
  })
}

const actionsMenuRef = ref(null)
const activeRow = ref(null)

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items = []
  const canEdit = userHasRole('superadmin') || userHasPermission('edit_purchase_request')
  const isEditable = row.status === 'draft' || row.status === 'rejected'

  if (canEdit && isEditable) {
    items.push({
      label: 'Submit',
      icon: 'ri ri-send-plane-line',
      command: () => purchaseRequestStore.submitPurchaseRequest(row.id),
    })
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/purchasing/purchase-request/form/${row.id}`),
    })
  }
  if (canApprovePurchaseRequest(row)) {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      command: () => purchaseRequestStore.approvePurchaseRequest(row.id),
    })
  }
  if (canRejectPurchaseRequest(row)) {
    items.push({
      label: 'Reject',
      icon: 'ri ri-close-line',
      command: () => rejectRow(row),
    })
  }
  items.push({
    label: 'Detail',
    icon: 'ri ri-eye-line',
    command: () => navigateTo(`/purchasing/purchase-request/detail/${row.id}`),
  })
  if (
    row.status === 'approved' &&
    (userHasRole('superadmin') || userHasPermission('create_purchase_order'))
  ) {
    items.push({
      label: 'Tambah PO',
      icon: 'ri ri-shopping-cart-line',
      command: () =>
        navigateTo({
          path: '/purchasing/purchase-order/form',
          query: { fromPurchaseRequestId: String(row.id) },
        }),
    })
  }
  return items
})

async function rejectRow(row) {
  const { value, isConfirmed } = await Swal.fire({
    title: 'Tolak Purchase Request',
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
    await purchaseRequestStore.rejectPurchaseRequest(row.id, value.trim())
  }
}

function toggleActions(event, row) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

const onPage = (e) => { if (e) purchaseRequestStore.setPagination(e) }
const onSort = (e) => { if (e) purchaseRequestStore.setSort(e) }
const handleRowsChange = (v) => { params.value.rows = Number(v) || 10; params.value.first = 0; purchaseRequestStore.fetchPurchaseRequests() }
const debouncedSearch = useDebounceFn(() => purchaseRequestStore.setSearch(globalFilterValue.value), 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => purchaseRequestStore.setFilters({ status: f.status, priority: f.priority }), { deep: true })

onMounted(() => {
  purchaseRequestStore.fetchPurchaseRequests()
  purchaseRequestStore.fetchStatistics()
})

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Purchase Request' })
</script>
