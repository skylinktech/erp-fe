<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6">Berita Acara Performansi layanan konektivitas pelanggan (periode, PID, uptime, latency).</p>

      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Total</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-primary"><i class="ri-file-list-3-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.total }}</h5>
          </div></div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Pending</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-warning"><i class="ri-time-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.pending }}</h5>
          </div></div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Approved</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-success"><i class="ri-checkbox-circle-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.approved }}</h5>
          </div></div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card"><div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <p class="mb-0">Completed</p>
              <div class="avatar"><span class="avatar-initial rounded bg-label-info"><i class="ri-flag-line"></i></span></div>
            </div>
            <h5 class="mb-0">{{ statistics.completed }}</h5>
          </div></div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <CollapsibleFilterCard title="Filter Berita Acara" :has-active-filters="hasActiveFilters" @reset="resetFilters">
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Status</label>
                <CustomSelect2
                  v-model="filters.status"
                  :options="statusOptions"
                  :get-option-label="o => o.label"
                  :reduce="o => o.value"
                  searchable
                  clearable
                  placeholder="Status"
                />
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>

        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center gap-2 me-3 mb-2 mb-md-0">
                <span class="me-1">Baris:</span>
                <Dropdown v-model="tableControls.rows" :options="rowsPerPageOptions" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('edit_berita_acara')"
                  class="btn btn-primary btn-sm"
                  :disabled="!selectedRows.length || store.sending"
                  @click="bulkSend"
                >
                  <i class="ri-mail-send-line me-1"></i>
                  {{ store.sending ? 'Mengirim...' : `Kirim (${selectedRows.length})` }}
                </button>
                <button
                  v-if="selectedRows.length"
                  class="btn btn-outline-secondary btn-sm"
                  :disabled="store.sending"
                  @click="clearSelection"
                >
                  Bersihkan
                </button>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_berita_acara')"
                  @click="navigateTo('/operations/berita-acara/form')"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>Tambah
                </button>
                <span class="p-input-icon-left">
                  <InputText v-model="globalFilterValue" placeholder="Cari no. BA, customer, kontrak, PID..." class="w-full md:w-20rem" />
                </span>
              </div>
            </div>

            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                v-model:selection="selectedRows"
                :data="beritaAcaras"
                :rows="Number(params.rows)"
                :loading="loading"
                :totalRecords="totalRecords"
                :first="params.first"
                :lazy="true"
                @page="onPage($event)"
                @sort="onSort($event)"
                @selection-change="onSelectionChange"
                responsiveLayout="scroll"
                paginatorPosition="bottom"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
              >
                <Column
                  v-if="userHasRole('superadmin') || userHasPermission('edit_berita_acara')"
                  selectionMode="multiple"
                  headerStyle="width: 3rem"
                />
                <Column header="#" :sortable="false">
                  <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                </Column>
                <Column field="documentNo" header="No. BA" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a
                      @click="navigateTo(`/operations/berita-acara/detail/${slotProps.data.id}`)"
                      class="text-primary"
                      style="cursor:pointer;text-decoration:underline"
                    >
                      {{ getBeritaAcaraNo(slotProps.data) || '—' }}
                    </a>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.customer?.name || '—' }}</template>
                </Column>
                <Column field="contractNo" header="No. Kontrak" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.contractNo || slotProps.data.contract_no || '—' }}</template>
                </Column>
                <Column field="periodStart" header="Periode" :sortable="true">
                  <template #body="slotProps">{{ formatPeriod(slotProps.data) }}</template>
                </Column>
                <Column field="documentDate" header="Tanggal BA" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.documentDate || slotProps.data.document_date || '—' }}</template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data).class">{{ getStatusBadge(slotProps.data).text }}</span>
                    <div v-if="slotProps.data.sentAt || slotProps.data.sent_at" class="small text-success mt-1">
                      Terkirim
                    </div>
                  </template>
                </Column>
                <Column header="Aksi" :exportable="false" style="min-width:8rem">
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

    <Menu id="ba-actions-menu" ref="actionsMenuRef" :model="actionMenuItems" :popup="true" append-to="body" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useBeritaAcaraStore,
  getBeritaAcaraNo,
  formatPeriod,
  isBeritaAcaraSendable,
} from '~/stores/berita-acara'
import { usePermissions } from '~/composables/usePermissions'
import { useBeritaAcaraApproval } from '~/composables/useBeritaAcaraApproval'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'

const store = useBeritaAcaraStore()
const { userHasPermission, userHasRole } = usePermissions()
const { canApproveBeritaAcara, canRejectBeritaAcara } = useBeritaAcaraApproval()
const { beritaAcaras, loading, totalRecords, params, statistics } = storeToRefs(store)
const { getStatusBadge } = useApprovalStatus()

const tableControls = ref({ rows: 10 })
const filters = ref({ status: null as string | null })
const hasActiveFilters = computed(() => !!filters.value.status)

function resetFilters() {
  filters.value.status = null
}

const globalFilterValue = ref('')
const rowsPerPageOptions = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
]

const actionsMenuRef = ref(null)
const activeRow = ref<any>(null)
const selectedRows = ref<any[]>([])

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: any[] = []
  const canEdit = userHasRole('superadmin') || userHasPermission('edit_berita_acara')
  const isEditable = row.status === 'draft' || row.status === 'rejected'

  if (canEdit && isEditable) {
    items.push({
      label: 'Submit',
      icon: 'ri ri-send-plane-line',
      command: () => store.submitBeritaAcara(row.id),
    })
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/operations/berita-acara/form/${row.id}`),
    })
  }

  if (canApproveBeritaAcara(row)) {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      command: () => store.approveBeritaAcara(row.id),
    })
  }
  if (canRejectBeritaAcara(row)) {
    items.push({
      label: 'Reject',
      icon: 'ri ri-close-line',
      command: () => rejectRow(row),
    })
  }

  if (row.status === 'approved' && (userHasRole('superadmin') || userHasPermission('edit_berita_acara'))) {
    items.push({
      label: 'Tandai Selesai',
      icon: 'ri ri-checkbox-circle-line',
      command: () => store.markCompleted(row.id),
    })
  }

  items.push({
    label: 'Detail',
    icon: 'ri ri-eye-line',
    command: () => navigateTo(`/operations/berita-acara/detail/${row.id}`),
  })

  items.push({
    label: 'Cetak',
    icon: 'ri ri-printer-line',
    command: () => navigateTo({ path: '/operations/cetak-berita-acara', query: { id: row.id } }),
  })

  if (canEdit && isBeritaAcaraSendable(row)) {
    items.push({
      label: store.sending ? 'Mengirim...' : 'Kirim Email',
      icon: 'ri ri-mail-send-line',
      disabled: store.sending,
      command: () => store.sendBeritaAcara(row.id),
    })
  }

  if (isEditable && canEdit) {
    items.push({ separator: true })
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'text-danger',
      command: () => store.deleteBeritaAcara(row.id),
    })
  }

  return items
})

function onSelectionChange(e: any) {
  selectedRows.value = Array.isArray(e?.value) ? e.value : Array.isArray(e) ? e : []
}

function clearSelection() {
  selectedRows.value = []
}

async function bulkSend() {
  const ids = selectedRows.value.map((row) => row.id)
  const result = await store.sendBeritaAcarasBulk(ids)
  if (result) clearSelection()
}

async function rejectRow(row: any) {
  const { value, isConfirmed } = await Swal.fire({
    title: 'Tolak Berita Acara',
    input: 'textarea',
    inputLabel: 'Alasan penolakan',
    inputPlaceholder: 'Wajib diisi',
    inputValidator: (v) => (!v?.trim() ? 'Alasan wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Tolak',
    cancelButtonText: 'Batal',
    customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-label-secondary' },
  })
  if (isConfirmed && value?.trim()) {
    await store.rejectBeritaAcara(row.id, value.trim())
  }
}

function toggleActions(event: Event, row: any) {
  activeRow.value = row
  nextTick(() => (actionsMenuRef.value as any)?.toggle(event))
}

const onPage = (e: any) => { if (e) store.setPagination(e) }
const onSort = (e: any) => { if (e) store.setSort(e) }
const handleRowsChange = (v: any) => {
  params.value.rows = Number(v) || 10
  params.value.first = 0
  store.fetchBeritaAcaras()
}

const debouncedSearch = useDebounceFn(() => store.setSearch(globalFilterValue.value), 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => store.setFilters({ status: f.status }), { deep: true })

onMounted(() => {
  store.fetchBeritaAcaras()
  store.fetchStatistics()
})

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'], title: 'Berita Acara' })
</script>
