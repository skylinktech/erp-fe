<template>
  <div class="content-wrapper">
    <!-- Content -->
    <div class="container-xxl flex-grow-1">
      <div v-if="loading" class="text-center py-8">
        <ProgressSpinner 
          style="width: 50px; height: 50px" 
          strokeWidth="4"
          fill="transparent"
          animationDuration="1s"
        />
        <div class="mt-3 text-muted">Memuat data...</div>
      </div>
      <template v-else>
        <div>
          
          <p class="mb-6">
            Review dan approve/reject price adjustment requests dari sales team
          </p>

          <!-- Statistics Cards -->
          <div class="row g-6 mb-6">
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <p class="mb-0">Pending Approval</p>
                    <div class="avatar">
                      <span class="avatar-initial rounded bg-label-warning">
                        <i class="ri-time-line"></i>
                      </span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="account-heading">
                      <h5 class="mb-1">{{ statistics.pending }}</h5>
                      <span class="text-muted">Menunggu review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <p class="mb-0">Approved</p>
                    <div class="avatar">
                      <span class="avatar-initial rounded bg-label-success">
                        <i class="ri-checkbox-circle-line"></i>
                      </span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="account-heading">
                      <h5 class="mb-1">{{ statistics.approved }}</h5>
                      <span class="text-muted">Disetujui</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <p class="mb-0">Rejected</p>
                    <div class="avatar">
                      <span class="avatar-initial rounded bg-label-danger">
                        <i class="ri-close-circle-line"></i>
                      </span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="account-heading">
                      <h5 class="mb-1">{{ statistics.rejected }}</h5>
                      <span class="text-muted">Ditolak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6">
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <p class="mb-0">Draft</p>
                    <div class="avatar">
                      <span class="avatar-initial rounded bg-label-secondary">
                        <i class="ri-draft-line"></i>
                      </span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="account-heading">
                      <h5 class="mb-1">{{ statistics.draft }}</h5>
                      <span class="text-muted">Draft</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-6">
            <div class="col-12">
              <CollapsibleFilterCard
                title="Filter Pricing Approval"
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
              <!-- Price Adjustment Requests Table -->
              <div class="card">
                <div class="card-header">
                  <div class="d-flex justify-content-between align-items-center flex-wrap">
                    <div class="flex-grow-1">
                      <div class="table-controls-custom">
                        <!-- Desktop -->
                        <div class="d-none d-md-flex justify-content-between align-items-center">
                          <div class="d-flex align-items-center me-3">
                            <span class="me-2">Baris:</span>
                            <Dropdown 
                              v-model="tableControls.rows" 
                              :options="rowsPerPageOptionsArray" 
                              @change="handleRowsChange" 
                              placeholder="Jumlah" 
                              style="width: 8rem;"
                              :showClear="false"
                            />
                          </div>
                          <div class="d-flex align-items-center gap-2">
                            <div class="input-group">
                              <span class="p-input-icon-left">
                                <InputText
                                  v-model="tableControls.search"
                                  placeholder="Cari..."
                                  class="w-full md:w-20rem"
                                  @input="(e) => handleSearch(e.target.value)"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Mobile -->
                        <div class="d-md-none">
                          <div class="mb-3">
                            <div class="d-flex align-items-center">
                              <span class="me-2" style="font-weight: 500; white-space: nowrap;">Baris:</span>
                              <Dropdown 
                                v-model="tableControls.rows" 
                                :options="rowsPerPageOptionsArray" 
                                @change="handleRowsChange" 
                                placeholder="Jumlah" 
                                class="flex-grow-1"
                                :showClear="false"
                              />
                            </div>
                          </div>
                          <div class="mb-3">
                            <InputText
                              v-model="tableControls.search"
                              placeholder="Cari..."
                              class="w-100"
                              @input="(e) => handleSearch(e.target.value)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-datatable table-responsive py-3 px-3">
                  <MyDataTable 
                    ref="myDataTableRef"
                    :data="requests" 
                    :rows="Number(params.rows)" 
                    :loading="loading"
                    :totalRecords="totalRecords"
                    :first="params.first"
                    :lazy="true"
                    :sort-field="params.sortField"
                    :sort-order="params.sortOrder"
                    sort-mode="single"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    responsiveLayout="scroll"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                  >
                    <Column header="#" :sortable="false">
                      <template #body="slotProps">
                        {{ params.first + slotProps.index + 1 }}
                      </template>
                    </Column>
                    <Column field="customer.name" header="Customer" :sortable="true">
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
                          <span v-if="slotProps.data.servicePlan"> ({{ slotProps.data.servicePlan.name }})</span>
                        </span>
                        <span v-else-if="slotProps.data.did">
                          <strong>DID:</strong> {{ slotProps.data.did.code }}
                        </span>
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
                    <Column field="requestedByUser.fullName" header="Requested By" :sortable="true">
                      <template #body="slotProps">
                        {{ slotProps.data.requestedByUser?.fullName || '-' }}
                      </template>
                    </Column>
                    <Column field="createdAt" header="Tanggal Request" :sortable="true">
                      <template #body="slotProps">
                        {{ formatDate(slotProps.data.createdAt) }}
                      </template>
                    </Column>
                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                      <template #body="slotProps">
                        <div class="d-inline-block">
                          <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                            <i class="ri-more-2-fill"></i>
                          </a>
                          <ul class="dropdown-menu">
                            <li>
                              <a class="dropdown-item" href="javascript:void(0)" @click="viewDetail(slotProps.data)">
                                <i class="ri-eye-line me-2"></i> Lihat Detail
                              </a>
                            </li>
                            <li v-if="slotProps.data.status === 'pending' && (userHasRole('superadmin') || userHasPermission('approve_price_adjustment'))">
                              <a class="dropdown-item text-success" href="javascript:void(0)" @click="store.approveRequest(slotProps.data.id)">
                                <i class="ri-check-line me-2"></i> Approve
                              </a>
                            </li>
                            <li v-if="slotProps.data.status === 'pending' && (userHasRole('superadmin') || userHasPermission('reject_price_adjustment'))">
                              <a class="dropdown-item text-danger" href="javascript:void(0)" @click="showRejectDialog(slotProps.data)">
                                <i class="ri-close-line me-2"></i> Reject
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
        </div>
      </template>

      <!-- Detail Modal -->
      <Dialog v-model:visible="showDetailModal" header="Detail Price Adjustment Request" :modal="true" :style="{ width: '700px' }">
        <div v-if="selectedRequest" class="row g-3">
          <div class="col-12">
            <h6>Customer</h6>
            <p>{{ selectedRequest.customer?.name || '-' }}</p>
          </div>
          <div class="col-12">
            <h6>Item</h6>
            <p v-if="selectedRequest.product">
              <strong>Product:</strong> {{ selectedRequest.product.name }} ({{ selectedRequest.product.sku }})
            </p>
            <p v-else-if="selectedRequest.service">
              <strong>Service:</strong> {{ selectedRequest.service.name }}
              <span v-if="selectedRequest.servicePlan"> - {{ selectedRequest.servicePlan.name }}</span>
            </p>
            <p v-else-if="selectedRequest.did">
              <strong>DID:</strong> {{ selectedRequest.did.code }} - {{ selectedRequest.did.name }}
            </p>
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
            <span class="badge bg-info">{{ selectedRequest.type === 'site_investment' ? 'Site Investment' : 'Walk In' }}</span>
          </div>
          <div class="col-12">
            <h6>Requested By</h6>
            <p>{{ selectedRequest.requestedByUser?.fullName }} ({{ formatDate(selectedRequest.createdAt) }})</p>
          </div>
          <div v-if="selectedRequest.approvedByUser" class="col-12">
            <h6>Approved By</h6>
            <p>{{ getApprovalStepJabatan(selectedRequest, 'approved') || selectedRequest.approvedByUser.fullName }} ({{ formatDate(selectedRequest.approvedAt) }})</p>
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

      <!-- Reject Modal -->
      <Dialog v-model:visible="showRejectModal" header="Reject Price Adjustment Request" :modal="true" :style="{ width: '500px' }">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Alasan Reject <span class="text-danger">*</span></label>
            <textarea 
              v-model="rejectReason" 
              class="form-control" 
              rows="4" 
              placeholder="Masukkan alasan reject..."
              required
            ></textarea>
          </div>
        </div>
        <template #footer>
          <button type="button" class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
          <button type="button" class="btn btn-danger" @click="handleReject" :disabled="!rejectReason || rejectReason.length < 10">
            Reject
          </button>
        </template>
      </Dialog>
    </div>
    <!-- / Content -->

    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceAdjustmentRequestStore } from '~/stores/price_adjustment_request'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useFormatRupiah } from '~/composables/formatRupiah'

// Composables
const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()

const myDataTableRef = ref(null)
const store = usePriceAdjustmentRequestStore()

const { requests, loading, totalRecords, params, statistics } = storeToRefs(store)

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Table controls state
const tableControls = ref({
  rows: 10,
  search: '',
})

const statusFilter = ref('')

const hasActiveFilters = computed(() => !!statusFilter.value)

function resetFilters() {
  statusFilter.value = ''
  store.params.status = undefined
  store.params.first = 0
  void store.fetchRequests()
}

// Detail modal
const showDetailModal = ref(false)
const selectedRequest = ref(null)

// Reject modal
const showRejectModal = ref(false)
const rejectReason = ref('')
const requestToReject = ref(null)

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const { getStatusBadge, getApprovalStepJabatan } = useApprovalStatus()

function getStepJabatanLabel (log) {
  const steps = log?.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  const nm = step?.jabatan?.nm_jabatan ?? step?.jabatan?.nmJabatan ?? ''
  if (nm) return nm
  return step?.step_name ?? step?.stepName ?? log.user?.fullName ?? log.user?.full_name ?? '—'
}

function getStepLabel (log) {
  const steps = log?.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  return step?.step_name ?? step?.stepName ?? `Step ${log.stepOrder}`
}

// Table event handlers
const onPage = async (event) => {
  store.params.first = event.first
  store.params.rows = event.rows
  await store.fetchRequests()
}

const onSort = async (event) => {
  store.params.sortField = event.sortField
  store.params.sortOrder = event.sortOrder
  await store.fetchRequests()
}

const handleRowsChange = async () => {
  store.params.rows = tableControls.value.rows
  store.params.first = 0
  await store.fetchRequests()
}

const handleSearch = useDebounceFn(async (value) => {
  store.params.search = value
  store.params.first = 0
  await store.fetchRequests()
}, 500)

const handleStatusChange = async () => {
  store.params.status = statusFilter.value || undefined
  store.params.first = 0
  await store.fetchRequests()
}

// Actions
function viewDetail(request) {
  selectedRequest.value = request
  showDetailModal.value = true
}

function showRejectDialog(request) {
  requestToReject.value = request
  rejectReason.value = ''
  showRejectModal.value = true
}

async function handleReject() {
  if (!rejectReason.value || rejectReason.value.length < 10) {
    return
  }
  
  try {
    await store.rejectRequest(requestToReject.value.id, rejectReason.value)
    showRejectModal.value = false
  } catch (e) {
    console.error('Error rejecting request:', e)
  }
}

// Lifecycle
onMounted(async () => {
  setListTitle('Pricing Approval')
  await Promise.all([
    store.fetchRequests(),
    store.fetchStatistics(),
  ])
})
</script>

<style scoped>
.table-controls-custom {
  width: 100%;
}
</style>
