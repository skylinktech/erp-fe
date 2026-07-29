<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">My Price Requests</h4>
      <p class="mb-4">Daftar price adjustment request yang Anda ajukan.</p>

      <CollapsibleFilterCard
        title="Filter Price Requests"
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

      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-3">
            <Dropdown v-model="tableControls.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" style="width:8rem" />
            <div class="input-group">
              <InputText v-model="tableControls.search" placeholder="Cari..." @input="(e) => handleSearch(e.target.value)" />
            </div>
          </div>

          <MyDataTable
            :data="requests"
            :rows="Number(params.rows)"
            :loading="loading"
            :totalRecords="totalRecords"
            :first="params.first"
            :lazy="true"
            @page="onPage"
            @sort="onSort"
          >
            <Column header="#" :sortable="false">
              <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
            </Column>
            <Column field="item" header="Item">
              <template #body="slotProps">
                <span v-if="slotProps.data.product"><strong>Product:</strong> {{ slotProps.data.product.name }}</span>
                <span v-else-if="slotProps.data.service"><strong>Service:</strong> {{ slotProps.data.service.name }} <small v-if="slotProps.data.servicePlan">({{ slotProps.data.servicePlan.name }})</small></span>
                <span v-else-if="slotProps.data.did"><strong>DID:</strong> {{ slotProps.data.did.code }}</span>
              </template>
            </Column>
            <Column field="currentPrice" header="Harga Saat Ini">
              <template #body="slotProps">{{ slotProps.data.currentPrice ? formatRupiah(slotProps.data.currentPrice) : '-' }}</template>
            </Column>
            <Column field="proposedPrice" header="Harga Proposed">
              <template #body="slotProps">{{ formatRupiah(slotProps.data.proposedPrice) }}</template>
            </Column>
            <Column field="status" header="Status">
              <template #body="slotProps">
                <span :class="getStatusBadgeClass(slotProps.data.status)">{{ getStatusLabel(slotProps.data.status) }}</span>
              </template>
            </Column>
            <Column field="createdAt" header="Tanggal">
              <template #body="slotProps">{{ formatDate(slotProps.data.createdAt) }}</template>
            </Column>
            <Column header="Actions">
              <template #body="slotProps">
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="viewDetail(slotProps.data)">Lihat</button>
                  <button v-if="slotProps.data.status === 'draft'" class="btn btn-sm btn-primary" @click="openSubmitDialog(slotProps.data)">Submit</button>
                  <button v-if="slotProps.data.status === 'draft'" class="btn btn-sm btn-danger" @click="deleteRequest(slotProps.data.id)">Hapus</button>
                </div>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>

      <Dialog v-model:visible="showDetailModal" header="Detail Price Request" :modal="true">
        <div v-if="selectedRequest">
          <p><strong>Customer:</strong> {{ selectedRequest.customer?.name || '-' }}</p>
          <p><strong>Item:</strong>
            <span v-if="selectedRequest.product">Product - {{ selectedRequest.product.name }}</span>
            <span v-else-if="selectedRequest.service">Service - {{ selectedRequest.service.name }} <small v-if="selectedRequest.servicePlan">({{ selectedRequest.servicePlan.name }})</small></span>
            <span v-else-if="selectedRequest.did">DID - {{ selectedRequest.did.code }}</span>
          </p>
          <p><strong>Harga Saat Ini:</strong> {{ selectedRequest.currentPrice ? formatRupiah(selectedRequest.currentPrice) : '-' }}</p>
          <p><strong>Harga Proposed:</strong> {{ formatRupiah(selectedRequest.proposedPrice) }}</p>
          <p><strong>Alasan:</strong> {{ selectedRequest.reason || '-' }}</p>
          <p><strong>Status:</strong> {{ getStatusLabel(selectedRequest.status) }}</p>
        </div>
      </Dialog>

      <Dialog v-model:visible="showSubmitModal" header="Submit Price Request" :modal="true">
        <div class="mb-3">
          <label class="form-label">Alasan submit <span class="text-danger">*</span></label>
          <textarea v-model="submitReason" class="form-control" rows="4" />
        </div>
        <template #footer>
          <button class="btn btn-outline-secondary" @click="showSubmitModal = false">Batal</button>
          <button class="btn btn-primary" @click="submitSelected" :disabled="!submitReason || submitReason.length < 10">Submit</button>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceAdjustmentRequestStore } from '~/stores/price_adjustment_request'
import { useUserStore } from '~/stores/user'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import { useFormatRupiah } from '~/composables/formatRupiah'

const store = usePriceAdjustmentRequestStore()
const { requests, loading, totalRecords, params, statistics } = storeToRefs(store)
const { user } = storeToRefs(useUserStore())

const formatRupiah = useFormatRupiah()

const tableControls = ref({ rows: 10, search: '' })
const statusFilter = ref('')
const rowsPerPageOptionsArray = ref([10,25,50,100])

const hasActiveFilters = computed(() => !!statusFilter.value)

function resetFilters() {
  statusFilter.value = ''
  store.params.status = undefined
  store.params.first = 0
  void store.fetchRequests()
}

const selectedRequest = ref(null)
const showDetailModal = ref(false)
const showSubmitModal = ref(false)
const submitReason = ref('')
const selectedIdToSubmit = ref(null)

function viewDetail(r) { selectedRequest.value = r; showDetailModal.value = true }
function openSubmitDialog(r) { selectedIdToSubmit.value = r.id; submitReason.value = r.reason || ''; showSubmitModal.value = true }

async function submitSelected() {
  if (!selectedIdToSubmit.value) return
  await store.submitRequest(selectedIdToSubmit.value, submitReason.value)
  showSubmitModal.value = false
}

async function deleteRequest(id) {
  await store.deleteRequest(id)
}

function getStatusLabel(status){ return status ? status.charAt(0).toUpperCase()+status.slice(1) : '-' }
function getStatusBadgeClass(status){ return status === 'approved' ? 'badge bg-success' : status === 'pending' ? 'badge bg-warning' : status === 'rejected' ? 'badge bg-danger' : 'badge bg-secondary' }
function formatDate(d){ if(!d) return '-'; return new Date(d).toLocaleString('id-ID') }

const onPage = async (ev) => { store.params.first = ev.first; store.params.rows = ev.rows; await store.fetchRequests() }
const onSort = async (ev) => { store.params.sortField = ev.sortField; store.params.sortOrder = ev.sortOrder; await store.fetchRequests() }
const handleRowsChange = async () => { store.params.rows = tableControls.value.rows; store.params.first = 0; await store.fetchRequests() }
const handleStatusChange = async () => { store.params.status = statusFilter.value || undefined; store.params.first = 0; await store.fetchRequests() }
const handleSearch = async (val) => { store.params.search = val; store.params.first = 0; await store.fetchRequests() }

onMounted(async () => {
  // limit to current user's requests
  if (user.value && user.value.id) {
    store.params.requestedBy = user.value.id
  }
  await store.fetchRequests()
})
</script>

<style scoped>
.badge { padding: .35em .6em; border-radius: .375rem; }
</style>
