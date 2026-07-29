<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Material Request Form</h4>
      <p class="mb-6">Permintaan material proyek eksternal (Starlink, Mikrotik, dan perangkat terkait Site Investment).</p>

      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Total MRF</p><div class="avatar"><span class="avatar-initial rounded bg-label-primary"><i class="ri-file-list-3-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.totalMaterialRequests || 0 }}</h5></div></div></div>
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Draft</p><div class="avatar"><span class="avatar-initial rounded bg-label-secondary"><i class="ri-draft-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.draftMaterialRequests || 0 }}</h5></div></div></div>
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Pending</p><div class="avatar"><span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.pendingMaterialRequests || 0 }}</h5></div></div></div>
        <div class="col-xl-3 col-lg-6 col-md-6"><div class="card"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-4"><p class="mb-0">Approved</p><div class="avatar"><span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span></div></div><h5 class="mb-0">{{ statistics?.approvedMaterialRequests || 0 }}</h5></div></div></div>
      </div>

      <CollapsibleFilterCard
        title="Filter Material Request"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <div class="row g-4">
          <div class="col-md-6">
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
          <div class="col-md-6">
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
          <div class="col-md-6 offset-md-6 d-flex justify-content-end mt-4">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
              <i class="ri-refresh-line me-1"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0"><span class="me-2">Baris:</span><Dropdown v-model="tableControls.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" /></div>
              <div class="d-flex align-items-center gap-2">
                <button v-if="userHasRole('superadmin') || userHasPermission('create_material_request')" @click="navigateTo('/purchasing/material-request/form')" class="btn btn-primary"><i class="ri-add-line me-1"></i>Tambah</button>
                <span class="p-input-icon-left"><InputText v-model="globalFilterValue" placeholder="Cari no. MRF, SI, keterangan..." class="w-full md:w-20rem" /></span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable ref="myDataTableRef" :data="materialRequests" :rows="Number(params.rows)" :loading="loading" :totalRecords="totalRecords" :first="params.first" :lazy="true" @page="onPage($event)" @sort="onSort($event)" responsiveLayout="scroll" paginatorPosition="bottom" paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data">
                <Column header="#" :sortable="false"><template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template></Column>
                <Column field="mrfNumber" header="No. MRF" :sortable="true" class="text-nowrap"><template #body="slotProps"><a @click="navigateTo(`/purchasing/material-request/detail/${slotProps.data.id}`)" class="text-primary" style="cursor:pointer;text-decoration:underline">{{ getMaterialRequestNo(slotProps.data) || '—' }}</a></template></Column>
                <Column field="siteInvestment.si_number" header="Site Investment" :sortable="false"><template #body="slotProps">{{ slotProps.data.siteInvestment?.siNumber || slotProps.data.siteInvestment?.si_number || '—' }}</template></Column>
                <Column field="priority" header="Prioritas" :sortable="true"><template #body="slotProps"><span class="text-capitalize">{{ slotProps.data.priority || '-' }}</span></template></Column>
                <Column field="totalAmount" header="Total" :sortable="true"><template #body="slotProps">{{ formatRupiah(slotProps.data.totalAmount ?? slotProps.data.grandTotal) }}</template></Column>
                <Column field="requestedByUser.full_name" header="Pemohon" :sortable="true"><template #body="slotProps">{{ slotProps.data.requestedByUser?.fullName || slotProps.data.requestedByUser?.full_name || slotProps.data.createdByUser?.full_name || '-' }}</template></Column>
                <Column field="status" header="Status" :sortable="true"><template #body="slotProps"><span :class="getStatusBadge(slotProps.data).class">{{ getStatusBadge(slotProps.data).text }}</span></template></Column>
                <Column header="Actions" :exportable="false" style="min-width:9rem">
                  <template #body="slotProps">
                    <button
                      type="button"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                      aria-haspopup="true"
                      aria-controls="mrf-actions-menu"
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
      id="mrf-actions-menu"
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
import { useMaterialRequestStore, getMaterialRequestNo } from '~/stores/material-request'
import { usePermissions } from '~/composables/usePermissions'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'
import { useMaterialRequestApproval } from '~/composables/useMaterialRequestApproval'

const materialRequestStore = useMaterialRequestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { canApproveMaterialRequest, canRejectMaterialRequest } = useMaterialRequestApproval()
const formatRupiah = useFormatRupiah()
const { materialRequests, loading, totalRecords, params, statistics } = storeToRefs(materialRequestStore)
const tableControls = ref({ rows: 10 })
const filters = ref({ status: null, priority: null })

const hasActiveFilters = computed(
  () => !!filters.value.status || !!filters.value.priority
)

function resetFilters() {
  filters.value.status = null
  filters.value.priority = null
}

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const statusOptions = [{ label: 'Draft', value: 'draft' }, { label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Completed', value: 'completed' }]
const priorityOptions = [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }]
const { getStatusBadge } = useApprovalStatus()

const actionsMenuRef = ref(null)
const activeRow = ref(null)

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items = []
  const canEdit = userHasRole('superadmin') || userHasPermission('edit_material_request')
  const isEditable = row.status === 'draft' || row.status === 'rejected'

  if (canEdit && isEditable) {
    items.push({
      label: 'Submit',
      icon: 'ri ri-send-plane-line',
      command: () => materialRequestStore.submitMaterialRequest(row.id),
    })
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/purchasing/material-request/form/${row.id}`),
    })
  }
  if (canApproveMaterialRequest(row)) {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      command: () => materialRequestStore.approveMaterialRequest(row.id),
    })
  }
  if (canRejectMaterialRequest(row)) {
    items.push({
      label: 'Reject',
      icon: 'ri ri-close-line',
      command: () => rejectRow(row),
    })
  }
  items.push({
    label: 'Detail',
    icon: 'ri ri-eye-line',
    command: () => navigateTo(`/purchasing/material-request/detail/${row.id}`),
  })
  return items
})

async function rejectRow(row) {
  const { value, isConfirmed } = await Swal.fire({
    title: 'Tolak Material Request',
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
    await materialRequestStore.rejectMaterialRequest(row.id, value.trim())
  }
}

function toggleActions(event, row) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

const onPage = (e) => { if (e) materialRequestStore.setPagination(e) }
const onSort = (e) => { if (e) materialRequestStore.setSort(e) }
const handleRowsChange = (v) => { params.value.rows = Number(v) || 10; params.value.first = 0; materialRequestStore.fetchMaterialRequests() }
const debouncedSearch = useDebounceFn(() => materialRequestStore.setSearch(globalFilterValue.value), 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => materialRequestStore.setFilters({ status: f.status, priority: f.priority }), { deep: true })

onMounted(() => {
  materialRequestStore.fetchMaterialRequests()
  materialRequestStore.fetchStatistics()
})

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Material Request Form' })
</script>
