<template>
  <div>
    <ListPageStatsCards v-if="mode === 'approval'" :items="statItems" />

    <div class="row g-6">
      <div class="col-12">
        <CollapsibleFilterCard
          :title="mode === 'approval' ? 'Filter Pricing Approval' : 'Filter My Requests'"
          :has-active-filters="hasActiveFilters"
          @reset="resetFilters"
        >
          <FilterFieldsRow>
            <FilterField>
              <label class="form-label">Status</label>
              <select v-model="statusFilter" class="form-select" @change="handleStatusChange">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </FilterField>
          </FilterFieldsRow>
        </CollapsibleFilterCard>
      </div>

      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="d-flex align-items-center">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="tableControls.rows"
                  :options="rowsPerPageOptions"
                  placeholder="Jumlah"
                  style="width: 8rem"
                  :show-clear="false"
                  @change="handleRowsChange"
                />
              </div>
              <div class="input-group" style="max-width: 20rem">
                <span class="p-input-icon-left w-100">
                  <InputText
                    v-model="tableControls.search"
                    placeholder="Cari customer, produk, service..."
                    class="w-100"
                    @input="(e) => handleSearch(e.target.value)"
                  />
                </span>
              </div>
            </div>
          </div>

          <div class="card-datatable table-responsive py-3 px-3">
            <MyDataTable
              :data="requests"
              :rows="Number(params.rows)"
              :loading="loading"
              :total-records="totalRecords"
              :first="params.first"
              :lazy="true"
              :sort-field="params.sortField"
              :sort-order="params.sortOrder"
              sort-mode="single"
              responsive-layout="scroll"
              paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
              current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
              @page="onPage"
              @sort="onSort"
            >
              <Column header="#" :sortable="false">
                <template #body="slotProps">
                  {{ params.first + slotProps.index + 1 }}
                </template>
              </Column>

              <Column
                v-if="mode === 'approval'"
                field="customer.name"
                header="Customer"
                :sortable="true"
              >
                <template #body="slotProps">
                  {{ slotProps.data.customer?.name || '-' }}
                </template>
              </Column>

              <Column field="item" header="Item" :sortable="false">
                <template #body="slotProps">
                  <span v-if="slotProps.data.product">
                    <strong>Product:</strong> {{ slotProps.data.product.name }}
                  </span>
                  <span v-else-if="slotProps.data.service">
                    <strong>Service:</strong> {{ slotProps.data.service.name }}
                    <small v-if="slotProps.data.servicePlan"> ({{ slotProps.data.servicePlan.name }})</small>
                  </span>
                  <span v-else-if="slotProps.data.did">
                    <strong>DID:</strong> {{ slotProps.data.did.code }}
                  </span>
                  <span v-else>-</span>
                </template>
              </Column>

              <Column field="currentPrice" header="Harga Saat Ini" :sortable="true" class="text-nowrap">
                <template #body="slotProps">
                  {{ slotProps.data.currentPrice ? formatRupiah(slotProps.data.currentPrice) : '-' }}
                </template>
              </Column>

              <Column field="proposedPrice" header="Harga Proposed" :sortable="true" class="text-nowrap">
                <template #body="slotProps">
                  {{ formatRupiah(slotProps.data.proposedPrice) }}
                </template>
              </Column>

              <Column field="status" header="Status" :sortable="true">
                <template #body="slotProps">
                  <span class="badge" :class="getStatusBadge(slotProps.data).class">
                    {{ getStatusBadge(slotProps.data).text }}
                  </span>
                </template>
              </Column>

              <Column
                v-if="mode === 'approval'"
                field="requestedByUser.fullName"
                header="Requested By"
                :sortable="true"
              >
                <template #body="slotProps">
                  {{ slotProps.data.requestedByUser?.fullName || '-' }}
                </template>
              </Column>

              <Column field="createdAt" header="Tanggal" :sortable="true">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.createdAt) }}
                </template>
              </Column>

              <Column header="Actions" :exportable="false" style="min-width: 8rem">
                <template #body="slotProps">
                  <div class="d-inline-block">
                    <a
                      href="javascript:;"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                      data-bs-toggle="dropdown"
                    >
                      <i class="ri-more-2-fill"></i>
                    </a>
                    <ul class="dropdown-menu">
                      <li>
                        <a class="dropdown-item" href="javascript:void(0)" @click="viewDetail(slotProps.data)">
                          <i class="ri-eye-line me-2"></i> Lihat Detail
                        </a>
                      </li>

                      <template v-if="mode === 'my-requests'">
                        <li v-if="slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="openSubmitDialog(slotProps.data)">
                            <i class="ri-send-plane-line me-2"></i> Submit
                          </a>
                        </li>
                        <li v-if="slotProps.data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="deleteRequest(slotProps.data.id)">
                            <i class="ri-delete-bin-line me-2"></i> Hapus
                          </a>
                        </li>
                      </template>

                      <template v-else>
                        <li
                          v-if="slotProps.data.status === 'pending' && canApprove"
                        >
                          <a class="dropdown-item text-success" href="javascript:void(0)" @click="store.approveRequest(slotProps.data.id)">
                            <i class="ri-check-line me-2"></i> Approve
                          </a>
                        </li>
                        <li
                          v-if="slotProps.data.status === 'pending' && canReject"
                        >
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="showRejectDialog(slotProps.data)">
                            <i class="ri-close-line me-2"></i> Reject
                          </a>
                        </li>
                      </template>
                    </ul>
                  </div>
                </template>
              </Column>
            </MyDataTable>
          </div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showDetailModal"
      header="Detail Price Adjustment Request"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <div v-if="selectedRequest" class="row g-3">
        <div class="col-12">
          <h6>Customer</h6>
          <p>{{ selectedRequest.customer?.name || '-' }}</p>
        </div>
        <div class="col-12">
          <h6>Item</h6>
          <p v-if="selectedRequest.product">
            <strong>Product:</strong> {{ selectedRequest.product.name }}
            <span v-if="selectedRequest.product.sku">({{ selectedRequest.product.sku }})</span>
          </p>
          <p v-else-if="selectedRequest.service">
            <strong>Service:</strong> {{ selectedRequest.service.name }}
            <span v-if="selectedRequest.servicePlan"> - {{ selectedRequest.servicePlan.name }}</span>
          </p>
          <p v-else-if="selectedRequest.did">
            <strong>DID:</strong> {{ selectedRequest.did.code }} - {{ selectedRequest.did.name }}
          </p>
          <p v-else>-</p>
        </div>
        <div class="col-md-6">
          <h6>Harga Saat Ini</h6>
          <p>{{ selectedRequest.currentPrice ? formatRupiah(selectedRequest.currentPrice) : '-' }}</p>
        </div>
        <div class="col-md-6">
          <h6>Harga Proposed</h6>
          <p class="text-primary fw-bold">{{ formatRupiah(selectedRequest.proposedPrice) }}</p>
        </div>
        <div class="col-12">
          <h6>Alasan</h6>
          <p>{{ selectedRequest.reason || '-' }}</p>
        </div>
        <div class="col-md-6">
          <h6>Status</h6>
          <span class="badge" :class="getStatusBadge(selectedRequest).class">
            {{ getStatusBadge(selectedRequest).text }}
          </span>
        </div>
        <div class="col-md-6">
          <h6>Tipe</h6>
          <span class="badge bg-info">{{ typeLabel(selectedRequest.type) }}</span>
        </div>
        <div class="col-12">
          <h6>Requested By</h6>
          <p>
            {{ selectedRequest.requestedByUser?.fullName || '-' }}
            ({{ formatDate(selectedRequest.createdAt) }})
          </p>
        </div>
        <div v-if="selectedRequest.approvedByUser" class="col-12">
          <h6>Approved By</h6>
          <p>
            {{ getApprovalStepJabatan(selectedRequest, 'approved') || selectedRequest.approvedByUser.fullName }}
            ({{ formatDate(selectedRequest.approvedAt) }})
          </p>
        </div>
        <div v-if="selectedRequest.approvalLogs?.length" class="col-12">
          <h6>Riwayat Approval</h6>
          <ul class="mb-0 ps-3">
            <li v-for="log in selectedRequest.approvalLogs" :key="log.id">
              {{ log.action === 'approved' ? 'Approved' : 'Rejected' }} by {{ getStepJabatanLabel(log) }} — {{ getStepLabel(log) }}
              <div v-if="log.remarks" class="text-muted small">Catatan: {{ log.remarks }}</div>
            </li>
          </ul>
        </div>
        <div v-if="selectedRequest.rejectedByUser" class="col-12">
          <h6>Rejected By</h6>
          <p>{{ selectedRequest.rejectedByUser.fullName }} ({{ formatDate(selectedRequest.rejectedAt) }})</p>
          <h6>Rejection Reason</h6>
          <p>{{ selectedRequest.rejectionReason }}</p>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-if="mode === 'my-requests'"
      v-model:visible="showSubmitModal"
      header="Submit Price Request"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="mb-3">
        <label class="form-label">Alasan submit <span class="text-danger">*</span></label>
        <textarea v-model="submitReason" class="form-control" rows="4" placeholder="Minimal 10 karakter..." />
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showSubmitModal = false">Batal</button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!submitReason || submitReason.length < 10"
          @click="submitSelected"
        >
          Submit
        </button>
      </template>
    </Dialog>

    <Dialog
      v-if="mode === 'approval'"
      v-model:visible="showRejectModal"
      header="Reject Price Adjustment Request"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">Alasan Reject <span class="text-danger">*</span></label>
          <textarea
            v-model="rejectReason"
            class="form-control"
            rows="4"
            placeholder="Masukkan alasan reject (minimal 10 karakter)..."
            required
          />
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
        <button
          type="button"
          class="btn btn-danger"
          :disabled="!rejectReason || rejectReason.length < 10"
          @click="handleReject"
        >
          Reject
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import type { PriceAdjustmentRequest } from '~/stores/price_adjustment_request'
import { usePriceAdjustmentRequestStore } from '~/stores/price_adjustment_request'
import { useUserStore } from '~/stores/user'
import { usePermissions } from '~/composables/usePermissions'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { useFormatRupiah } from '~/composables/formatRupiah'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

export type PriceAdjustmentPanelMode = 'my-requests' | 'approval'

const props = defineProps<{
  mode: PriceAdjustmentPanelMode
}>()

const store = usePriceAdjustmentRequestStore()
const { requests, loading, totalRecords, params, statistics } = storeToRefs(store)
const { user } = storeToRefs(useUserStore())
const { userHasPermission, userHasRole } = usePermissions()
const { getStatusBadge, getApprovalStepJabatan } = useApprovalStatus()
const formatRupiah = useFormatRupiah()

const rowsPerPageOptions = [10, 25, 50, 100]
const tableControls = ref({ rows: 10, search: '' })
const statusFilter = ref('')

const selectedRequest = ref<PriceAdjustmentRequest | null>(null)
const showDetailModal = ref(false)
const showSubmitModal = ref(false)
const submitReason = ref('')
const selectedIdToSubmit = ref<number | null>(null)
const showRejectModal = ref(false)
const rejectReason = ref('')
const requestToReject = ref<PriceAdjustmentRequest | null>(null)

const hasActiveFilters = computed(() => !!statusFilter.value)

const canApprove = computed(
  () => userHasRole('superadmin') || userHasPermission('approve_price_adjustment')
)
const canReject = computed(
  () => userHasRole('superadmin') || userHasPermission('reject_price_adjustment')
)

const statItems = computed(() => [
  {
    key: 'pending-approval',
    label: 'Pending Approval',
    value: statistics.value.pending,
    subtitle: 'Menunggu review',
    icon: 'ri-time-line',
    iconBgClass: 'bg-label-warning',
    info: {
      title: 'Pending Approval',
      description: 'Jumlah price adjustment request berstatus Pending yang menunggu review.',
    },
  },
  {
    key: 'approved',
    label: 'Approved',
    value: statistics.value.approved,
    subtitle: 'Disetujui',
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
    info: {
      title: 'Approved',
      description: 'Jumlah price adjustment request yang telah disetujui.',
    },
  },
  {
    key: 'rejected',
    label: 'Rejected',
    value: statistics.value.rejected,
    subtitle: 'Ditolak',
    icon: 'ri-close-circle-line',
    iconBgClass: 'bg-label-danger',
    info: {
      title: 'Rejected',
      description: 'Jumlah price adjustment request yang ditolak.',
    },
  },
  {
    key: 'draft',
    label: 'Draft',
    value: statistics.value.draft,
    subtitle: 'Draft',
    icon: 'ri-draft-line',
    iconBgClass: 'bg-label-secondary',
    info: {
      title: 'Draft',
      description: 'Jumlah price adjustment request berstatus Draft.',
    },
  },
])

function typeLabel(type: string | undefined) {
  if (type === 'site_investment') return 'Site Investment'
  if (type === 'promo') return 'Promo'
  return 'Walk In'
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStepJabatanLabel(log: NonNullable<PriceAdjustmentRequest['approvalLogs']>[number]) {
  const steps = log?.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  const nm = step?.jabatan?.nm_jabatan ?? step?.jabatan?.nmJabatan ?? ''
  if (nm) return nm
  return step?.step_name ?? step?.stepName ?? log.user?.fullName ?? log.user?.full_name ?? '—'
}

function getStepLabel(log: NonNullable<PriceAdjustmentRequest['approvalLogs']>[number]) {
  const steps = log?.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  return step?.step_name ?? step?.stepName ?? `Step ${log.stepOrder}`
}

function applyScope() {
  store.params.first = 0
  store.params.status = statusFilter.value || undefined
  store.params.search = tableControls.value.search || ''
  store.params.rows = tableControls.value.rows

  if (props.mode === 'my-requests') {
    store.params.requestedBy = user.value?.id ? Number(user.value.id) : undefined
  } else {
    store.params.requestedBy = undefined
  }
}

async function loadPanel() {
  applyScope()
  const tasks: Promise<unknown>[] = [store.fetchRequests()]
  if (props.mode === 'approval') {
    tasks.push(store.fetchStatistics())
  }
  await Promise.all(tasks)
}

function resetFilters() {
  statusFilter.value = ''
  store.params.status = undefined
  store.params.first = 0
  void store.fetchRequests()
}

const onPage = async (event: { first: number; rows: number }) => {
  store.params.first = event.first
  store.params.rows = event.rows
  await store.fetchRequests()
}

const onSort = async (event: { sortField: string | null; sortOrder: number | null }) => {
  store.params.sortField = event.sortField
  store.params.sortOrder = event.sortOrder
  await store.fetchRequests()
}

const handleRowsChange = async () => {
  store.params.rows = tableControls.value.rows
  store.params.first = 0
  await store.fetchRequests()
}

const handleSearch = useDebounceFn(async (value: string) => {
  store.params.search = value
  store.params.first = 0
  await store.fetchRequests()
}, 500)

const handleStatusChange = async () => {
  store.params.status = statusFilter.value || undefined
  store.params.first = 0
  await store.fetchRequests()
}

function viewDetail(request: PriceAdjustmentRequest) {
  selectedRequest.value = request
  showDetailModal.value = true
}

function openSubmitDialog(request: PriceAdjustmentRequest) {
  selectedIdToSubmit.value = request.id
  submitReason.value = request.reason || ''
  showSubmitModal.value = true
}

async function submitSelected() {
  if (!selectedIdToSubmit.value) return
  await store.submitRequest(selectedIdToSubmit.value, submitReason.value)
  showSubmitModal.value = false
}

async function deleteRequest(id: number) {
  await store.deleteRequest(id)
}

function showRejectDialog(request: PriceAdjustmentRequest) {
  requestToReject.value = request
  rejectReason.value = ''
  showRejectModal.value = true
}

async function handleReject() {
  if (!requestToReject.value || !rejectReason.value || rejectReason.value.length < 10) return
  await store.rejectRequest(requestToReject.value.id, rejectReason.value)
  showRejectModal.value = false
}

onMounted(() => {
  void loadPanel()
})
</script>
