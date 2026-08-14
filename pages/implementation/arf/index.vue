<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6">Pengajuan budget untuk project implementation</p>

      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total ARF</p>
                <div class="avatar"><span class="avatar-initial rounded bg-label-primary"><i class="ri-file-edit-line"></i></span></div>
              </div>
              <h5 class="mb-0">{{ statistics?.totalArfs || 0 }}</h5>
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
              <h5 class="mb-0">{{ statistics?.draftArfs || 0 }}</h5>
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
              <h5 class="mb-0">{{ statistics?.pendingArfs || 0 }}</h5>
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
              <h5 class="mb-0">{{ statistics?.approvedArfs || 0 }}</h5>
            </div>
          </div>
        </div>
      </div>

      <CollapsibleFilterCard
        title="Filter ARF"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <div class="row g-4">
          <div class="col-md-6">
            <label class="form-label">Status</label>
            <CustomSelect2
              v-model="filters.status"
              :options="statusOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              searchable
              clearable
              placeholder="Semua status"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Tipe</label>
            <CustomSelect2
              v-model="filters.type"
              :options="typeOptions"
              :get-option-label="(o) => o.label"
              :reduce="(o) => o.value"
              searchable
              clearable
              placeholder="Semua tipe"
            />
          </div>
          <div class="col-md-6 offset-md-6 d-flex justify-content-end mt-4">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
              <i class="ri-refresh-line me-1"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div class="row g-6">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown v-model="tableControls.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_arf')"
                  class="btn btn-primary"
                  @click="navigateTo('/implementation/arf/form')"
                >
                  <i class="ri-add-line me-1"></i>Tambah
                </button>
                <span class="p-input-icon-left">
                  <InputText v-model="globalFilterValue" placeholder="Cari no. ARF, SI, catatan..." class="w-full md:w-20rem" />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                :data="arfs"
                :rows="Number(params.rows)"
                :loading="loading"
                :totalRecords="totalRecords"
                :first="params.first"
                :lazy="true"
                @page="onPage($event)"
                @sort="onSort($event)"
                responsiveLayout="scroll"
                paginatorPosition="bottom"
              >
                <Column header="#" :sortable="false">
                  <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                </Column>
                <Column field="requestNo" header="No. ARF" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a
                      class="text-primary"
                      style="cursor: pointer; text-decoration: underline"
                      @click="navigateTo(`/implementation/arf/detail/${slotProps.data.id}`)"
                    >
                      {{ slotProps.data.requestNo || slotProps.data.request_no }}
                    </a>
                  </template>
                </Column>
                <Column field="type" header="Tipe" :sortable="true">
                  <template #body="slotProps">
                    <span class="text-capitalize">{{ slotProps.data.type || '—' }}</span>
                  </template>
                </Column>
                <Column field="siteInvestment.si_number" header="Site Investment" :sortable="false">
                  <template #body="slotProps">
                    {{ slotProps.data.siteInvestment?.siNumber || slotProps.data.siteInvestment?.si_number || '—' }}
                  </template>
                </Column>
                <Column field="totalAmount" header="Total" :sortable="true">
                  <template #body="slotProps">{{ formatRupiah(slotProps.data.totalAmount) }}</template>
                </Column>
                <Column field="requestedByUser.full_name" header="Pemohon" :sortable="true">
                  <template #body="slotProps">
                    {{ slotProps.data.requestedByUser?.fullName || slotProps.data.requestedByUser?.full_name || '—' }}
                  </template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data).class">{{ getStatusBadge(slotProps.data).text }}</span>
                  </template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width: 9rem">
                  <template #body="slotProps">
                    <button
                      type="button"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
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

    <Menu id="arf-actions-menu" ref="actionsMenuRef" :model="actionMenuItems" :popup="true" append-to="body" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useArfStore, ARF_STATUS_OPTIONS, ARF_TYPE_OPTIONS, type Arf } from '~/stores/arf'
import { usePermissions } from '~/composables/usePermissions'
import { useArfApproval } from '~/composables/useArfApproval'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'ARF',
})

const arfStore = useArfStore()
const formatRupiah = useFormatRupiah()
const { arfs, loading, totalRecords, params, statistics } = storeToRefs(arfStore)
const { userHasRole, userHasPermission } = usePermissions()
const { canApproveArf, canRejectArf } = useArfApproval()
const { getStatusBadge } = useApprovalStatus()

const statusOptions = ARF_STATUS_OPTIONS
const typeOptions = ARF_TYPE_OPTIONS
const filters = ref({ status: null as string | null, type: null as string | null })
const globalFilterValue = ref('')
const tableControls = ref({ rows: 10 })
const rowsPerPageOptionsArray = [10, 25, 50, 100]
const actionsMenuRef = ref()
const selectedRow = ref<Arf | null>(null)

const hasActiveFilters = computed(
  () => filters.value.status != null || filters.value.type != null
)

function resetFilters() {
  filters.value.status = null
  filters.value.type = null
}

const actionMenuItems = computed(() => {
  const row = selectedRow.value
  if (!row) return []
  const items: { label: string; icon: string; command: () => void }[] = []

  if (canSubmitArf(row)) {
    items.push({
      label: row.status === 'rejected' ? 'Submit Revisi' : 'Submit untuk Approval',
      icon: 'ri-send-plane-line',
      command: () => onSubmitArf(row),
    })
    items.push({
      label: 'Edit',
      icon: 'ri-edit-box-line',
      command: () => navigateTo(`/implementation/arf/form/${row.id}`),
    })
  }
  if (canApproveArf(row)) {
    items.push({
      label: 'Approve',
      icon: 'ri-check-line',
      command: () => onApproveArf(row),
    })
  }
  if (canRejectArf(row)) {
    items.push({
      label: 'Reject',
      icon: 'ri-close-line',
      command: () => onRejectArf(row),
    })
  }
  items.push({
    label: 'Detail',
    icon: 'ri-eye-line',
    command: () => navigateTo(`/implementation/arf/detail/${row.id}`),
  })
  items.push({
    label: 'Cetak',
    icon: 'ri-printer-line',
    command: () => goToCetak(row),
  })

  return items
})

function canSubmitArf(row: Arf) {
  return (
    (row.status === 'draft' || row.status === 'rejected') &&
    (userHasRole('superadmin') ||
      userHasPermission('edit_arf') ||
      userHasPermission('create_arf'))
  )
}

async function onSubmitArf(row: Arf) {
  const ok = await arfStore.submitArf(row.id)
  if (ok) {
    await arfStore.fetchArfs(true)
    await arfStore.fetchStatistics()
  }
}

async function onApproveArf(row: Arf) {
  const { value: remarks, isConfirmed } = await Swal.fire({
    title: 'Approve ARF',
    input: 'textarea',
    inputLabel: 'Catatan approval (opsional)',
    inputPlaceholder: 'Catatan...',
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'Batal',
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-label-secondary',
    },
  })
  if (!isConfirmed) return
  const ok = await arfStore.approveArf(row.id, remarks?.trim() || undefined)
  if (ok) {
    await arfStore.fetchArfs(true)
    await arfStore.fetchStatistics()
  }
}

async function onRejectArf(row: Arf) {
  const { value, isConfirmed } = await Swal.fire({
    title: 'Tolak ARF',
    input: 'textarea',
    inputLabel: 'Alasan penolakan',
    inputPlaceholder: 'Wajib diisi',
    inputValidator: (v) => (!v?.trim() ? 'Alasan penolakan wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Tolak',
    cancelButtonText: 'Batal',
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-label-secondary',
    },
  })
  if (!isConfirmed || !value?.trim()) return
  const ok = await arfStore.rejectArf(row.id, value.trim())
  if (ok) {
    await arfStore.fetchArfs(true)
    await arfStore.fetchStatistics()
  }
}

function goToCetak(row: Arf) {
  void navigateTo({ path: '/implementation/cetak-arf', query: { id: String(row.id) } })
}

function toggleActions(event: Event, row: Arf) {
  selectedRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

function onPage(e: { first: number; rows: number }) {
  params.value.first = e.first
  params.value.rows = e.rows
  arfStore.fetchArfs()
}

function onSort(e: { sortField?: string; sortOrder?: number }) {
  params.value.sortField = e.sortField ?? null
  params.value.sortOrder = e.sortOrder ?? null
  arfStore.fetchArfs()
}

function handleRowsChange() {
  params.value.rows = tableControls.value.rows
  params.value.first = 0
  arfStore.fetchArfs()
}

const debouncedSearch = useDebounceFn(() => {
  params.value.search = globalFilterValue.value
  params.value.first = 0
  arfStore.fetchArfs()
}, 400)

watch(globalFilterValue, debouncedSearch)
watch(
  filters,
  () => {
    params.value.status = filters.value.status
    params.value.type = filters.value.type
    params.value.first = 0
    arfStore.fetchArfs()
  },
  { deep: true }
)

onMounted(async () => {
  tableControls.value.rows = params.value.rows
  await arfStore.fetchStatistics()
  await arfStore.fetchArfs(true)
})
</script>
