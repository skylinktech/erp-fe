<template>
  <div class="content-wrapper">
    <!-- Content -->
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">Budgets</h4>
      <p class="mb-6">
        Kelola budget untuk perencanaan dan kontrol keuangan.
      </p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total Budget</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-funds-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics.totalBudgets }}</h5>
                  <span class="text-muted">Budget terdaftar</span>
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
                  <h5 class="mb-1">{{ statistics.draftBudgets }}</h5>
                  <span class="text-muted">Draft</span>
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
                  <h5 class="mb-1">{{ statistics.approvedBudgets }}</h5>
                  <span class="text-muted">Approved</span>
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
                  <h5 class="mb-1">{{ statistics.rejectedBudgets }}</h5>
                  <span class="text-muted">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Daftar Budget</h4>
          <p class="mb-0">Temukan dan kelola semua budget di sistem.</p>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="params.rows"
                  :options="rowsPerPageOptionsArray"
                  @change="handleRowsChange"
                  placeholder="Jumlah"
                  style="width: 8rem;"
                />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_budget')"
                  @click="budgetStore.openModal()"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Budget
                </button>
                <button @click="exportData('excel')" class="btn btn-outline-secondary" :disabled="loading">
                  <i class="ri-download-line me-1"></i>
                  Export Excel
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari budget..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <DataTable
                ref="myDataTableRef"
                :value="budgets"
                :rows="Number(params.rows)"
                :loading="loading"
                :totalRecords="totalRecords"
                :first="params.first"
                paginator
                @page="onPage($event)"
                @sort="onSort($event)"
                responsiveLayout="scroll"
                paginatorPosition="bottom"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                dataKey="id"
                tableStyle="min-width: 50rem"
              >
                <Column header="#" :sortable="false">
                  <template #body="slotProps">
                    {{ params.first + slotProps.index + 1 }}
                  </template>
                </Column>
                <Column field="budgetCode" header="Kode Budget" :sortable="true" style="min-width:150px">
                  <template #body="slotProps">
                    <span class="fw-semibold">{{ slotProps.data.budgetCode }}</span>
                  </template>
                </Column>
                <Column field="budgetName" header="Nama Budget" :sortable="true" style="min-width:250px">
                  <template #body="slotProps">
                    <div class="fw-semibold">{{ slotProps.data.budgetName }}</div>
                  </template>
                </Column>
                <Column field="costCenter" header="Cost Center" :sortable="false" style="min-width:200px">
                  <template #body="slotProps">
                    <span v-if="slotProps.data.costCenter">
                      {{ slotProps.data.costCenter.code }} - {{ slotProps.data.costCenter.name }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </template>
                </Column>
                <Column field="totalAmount" header="Total Budget" :sortable="true" style="min-width:180px">
                  <template #body="slotProps">
                    <span class="fw-semibold text-primary">
                      {{ formatRupiah(slotProps.data.totalAmount) }}
                    </span>
                  </template>
                </Column>
                <Column field="status" header="Status" :sortable="true" style="min-width:120px">
                  <template #body="slotProps">
                    <span class="badge" :class="getStatusBadgeClass(slotProps.data.status)">
                      {{ getStatusLabel(slotProps.data.status) }}
                    </span>
                  </template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:10rem">
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
                        <li v-if="slotProps.data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('edit_budget'))">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="openEditModal(slotProps.data)"
                          >
                            <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                        </li>
                        <li v-if="slotProps.data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('approve_budget'))">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="budgetStore.approveBudget(slotProps.data.id)"
                          >
                            <i class="ri-checkbox-circle-line me-2"></i> Approve
                          </a>
                        </li>
                        <li v-if="slotProps.data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('reject_budget'))">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="budgetStore.rejectBudget(slotProps.data.id)"
                          >
                            <i class="ri-close-circle-line me-2"></i> Reject
                          </a>
                        </li>
                        <li v-if="slotProps.data.status === 'draft' && (userHasRole('superadmin') || userHasPermission('delete_budget'))">
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            @click="budgetStore.deleteBudget(slotProps.data.id)"
                          >
                            <i class="ri-delete-bin-7-line me-2"></i> Hapus
                          </a>
                        </li>
                      </ul>
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- Budget Modal -->
        <Modal
          id="BudgetModal"
          :title="modalTitle"
          :description="modalDescription"
          :validation-errors-from-parent="validationErrors"
        >
          <template #default>
            <form @submit.prevent="budgetStore.saveBudget()">
              <!-- Nav tabs -->
              <ul class="nav nav-tabs mb-4" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link active"
                    id="budget-info-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#budget-info"
                    type="button"
                    role="tab"
                    aria-controls="budget-info"
                    aria-selected="true"
                  >
                    <i class="ri-information-line me-2"></i>
                    Informasi Budget
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    id="allocations-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#allocations"
                    type="button"
                    role="tab"
                    aria-controls="allocations"
                    aria-selected="false"
                  >
                    <i class="ri-pie-chart-line me-2"></i>
                    Alokasi Budget
                  </button>
                </li>
              </ul>

              <!-- Tab content -->
              <div class="tab-content">
                <!-- Budget Info Tab -->
                <div class="tab-pane fade show active" id="budget-info" role="tabpanel" aria-labelledby="budget-info-tab">
                  <div class="row g-6">
                    <div class="col-md-12">
                      <div class="form-floating form-floating-outline">
                        <input
                          type="text"
                          class="form-control"
                          v-model="form.budgetName"
                          placeholder="Masukkan nama budget"
                          required
                        />
                        <label>Nama Budget *</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <select class="form-select" v-model="form.costCenterId">
                          <option :value="null">Pilih Cost Center (Opsional)</option>
                          <option
                            v-for="cc in costCenterOptions"
                            :key="cc.id"
                            :value="cc.id"
                          >
                            {{ cc.code }} - {{ cc.name }}
                          </option>
                        </select>
                        <label>Cost Center</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input
                          type="text"
                          class="form-control"
                          :value="formatRupiah(form.totalAmount)"
                          @input="updateTotalAmountFromInput"
                          placeholder="Masukkan total budget"
                          required
                        />
                        <label>Total Budget *</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input
                          type="date"
                          class="form-control"
                          v-model="form.startDate"
                        />
                        <label>Tanggal Mulai</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input
                          type="date"
                          class="form-control"
                          v-model="form.endDate"
                        />
                        <label>Tanggal Selesai</label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Allocations Tab -->
                <div class="tab-pane fade" id="allocations" role="tabpanel" aria-labelledby="allocations-tab">
                  <div class="row g-3">
                    <div class="col-12">
                      <div class="table-responsive">
                        <table class="table table-bordered">
                          <thead>
                            <tr>
                              <th style="width: 50px;">#</th>
                              <th>Site</th>
                              <th style="width: 200px;">Amount</th>
                              <th style="width: 80px;">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(allo, index) in form.budgetAllos" :key="index">
                              <td class="text-center">{{ index + 1 }}</td>
                              <td>
                                <select
                                  class="form-select form-select-sm"
                                  v-model="allo.siteId"
                                >
                                  <option :value="null">Pilih Site (Opsional)</option>
                                  <option
                                    v-for="site in siteOptions"
                                    :key="site.id"
                                    :value="site.id"
                                  >
                                    {{ site.code }} - {{ site.name }}
                                  </option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  :value="formatRupiah(allo.amount)"
                                  @input="(e) => updateAllocationAmountFromInput(e, index)"
                                  placeholder="0"
                                  required
                                />
                              </td>
                              <td class="text-center">
                                <button
                                  type="button"
                                  class="btn btn-sm btn-icon btn-text-danger"
                                  @click="budgetStore.removeAllocation(index)"
                                >
                                  <i class="ri-delete-bin-7-line"></i>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr class="table-active">
                              <td colspan="2" class="text-end fw-bold">Total Alokasi:</td>
                              <td colspan="2" class="fw-bold">{{ formatRupiah(totalAllocations) }}</td>
                            </tr>
                            <tr v-if="totalAllocations > form.totalAmount" class="table-danger">
                              <td colspan="4" class="text-center text-danger">
                                <i class="ri-error-warning-line me-1"></i>
                                Total alokasi melebihi total budget!
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                    <div class="col-12">
                      <button
                        type="button"
                        class="btn btn-sm btn-primary"
                        @click="budgetStore.addAllocation()"
                      >
                        <i class="ri-add-line me-1"></i>
                        Tambah Alokasi
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" @click="budgetStore.closeModal()">
                  Tutup
                </button>
                <!-- Biarkan user tetap bisa menyimpan walaupun alokasi > budget, hanya tampilkan alert -->
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditMode ? 'Update' : 'Simpan' }}
                </button>
              </div>
            </form>
          </template>
        </Modal>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useBudgetStore } from '~/stores/budget'
import { useCostCenterStore } from '~/stores/cost-center'
import { useSiteStore } from '~/stores/site'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDebounceFn } from '@vueuse/core'
import Modal from '~/components/modal/Modal.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useFormatRupiah } from '~/composables/formatRupiah'

const { setListTitle } = useDynamicTitle()
const formatRupiah = useFormatRupiah()

// Stores
const budgetStore = useBudgetStore()
const costCenterStore = useCostCenterStore()
const siteStore = useSiteStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Computed dari store
const loading = computed(() => budgetStore.loading)
const budgets = computed(() => budgetStore.budgets || [])
const totalRecords = computed(() => budgetStore.totalRecords || 0)
const params = computed(() => budgetStore.params)
const form = computed(() => budgetStore.form)
const isEditMode = computed(() => budgetStore.isEditMode)
const showModal = computed(() => budgetStore.showModal)
const validationErrors = computed(() =>
  Array.isArray(budgetStore.validationErrors) ? budgetStore.validationErrors : []
)
const statistics = computed(() => budgetStore.statistics)

// Options
const costCenterOptions = computed(() => costCenterStore.costCenters || [])
const siteOptions = computed(() => siteStore.sites || [])

// Total allocations
const totalAllocations = computed(() => {
  if (!form.value.budgetAllos || !Array.isArray(form.value.budgetAllos)) {
    return 0
  }
  return form.value.budgetAllos.reduce((sum, allo) => sum + (Number(allo.amount) || 0), 0)
})

// Modal computed
const modalTitle = computed(() => (isEditMode.value ? 'Edit Budget' : 'Tambah Budget Baru'))
const modalDescription = computed(() =>
  isEditMode.value
    ? 'Silakan ubah data budget di bawah ini.'
    : 'Silakan isi form di bawah ini untuk menambahkan budget baru.'
)

// Helpers
const getStatusLabel = (status) => {
  const labels = {
    draft: 'Draft',
    approved: 'Approved',
    rejected: 'Rejected',
    received: 'Received',
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    draft: 'bg-label-secondary',
    approved: 'bg-label-success',
    rejected: 'bg-label-danger',
    received: 'bg-label-info',
  }
  return classes[status] || 'bg-label-secondary'
}

// Function to convert formatted rupiah back to number (sama seperti di purchase-invoice)
const parseRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0
  // Remove 'Rp', spaces, dots (thousand separators) and convert to number
  return Number(rupiahString.replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
}

// Handler untuk update total amount dari input yang diformat
const updateTotalAmountFromInput = (event) => {
  const inputValue = event.target.value
  const numericValue = parseRupiahToNumber(inputValue)
  budgetStore.form.totalAmount = Math.round(numericValue)
}

// Handler untuk update allocation amount dari input yang diformat
const updateAllocationAmountFromInput = (event, index) => {
  const inputValue = event.target.value
  const numericValue = parseRupiahToNumber(inputValue)
  budgetStore.form.budgetAllos[index].amount = Math.round(numericValue)
}

const exportData = async (format) => {
  const toast = useToast()
  try {
    if (format === 'excel') {
      const exportResult = await budgetStore.fetchBudgetsForExport()
      if (myDataTableRef.value && exportResult.data) {
        await myDataTableRef.value.exportExcel({
          title: `Data Budget`,
          data: exportResult.data,
        })
        toast.success({
          title: 'Success',
          message: 'Data budget berhasil diekspor ke Excel',
          color: 'green',
          position: 'topRight',
          layout: 2,
        })
      }
    }
  } catch (error) {
    console.error('Export error:', error)
    toast.error({
      title: 'Error',
      message: error.message || 'Gagal melakukan export data',
      color: 'red',
      position: 'topRight',
      layout: 2,
    })
  }
}

const openEditModal = async (budget) => {
  try {
    const fullBudget = await budgetStore.fetchBudgetById(budget.id)
    budgetStore.openModal(fullBudget)
  } catch (error) {
    console.error('Error opening edit modal:', error)
  }
}

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions()

// Lifecycle
let modalInstance = null
onMounted(async () => {
  try {
    await permissionStore.fetchPermissions()
    await userStore.loadUser()
    await budgetStore.fetchBudgets()
    await budgetStore.fetchStatistics()
    // Fetch options
    await costCenterStore.fetchCostCenters(true)
    await siteStore.fetchSites(true)
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
  setListTitle('Budgets', totalRecords.value)
})

// Watch modal visibility untuk bootstrap modal
watch(showModal, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const modalElement = document.getElementById('BudgetModal')
      if (modalElement && !modalInstance) {
        // @ts-ignore
        modalInstance = new bootstrap.Modal(modalElement)
      }
      modalInstance?.show()
    })
  } else {
    modalInstance?.hide()
  }
})

const debouncedSearch = useDebounceFn(() => {
  budgetStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

// Table events
const onPage = (event) => {
  budgetStore.setPagination(event)
}

const onSort = (event) => {
  budgetStore.setSort(event)
}

const handleRowsChange = async (value) => {
  const rowsValue = Number(value) || 10
  budgetStore.params.rows = rowsValue
  budgetStore.params.first = 0
  await budgetStore.fetchBudgets(true)
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Budgets',
  description: 'Budget Management',
  keywords: 'Budget, Accounting, Kainnova Digital Solutions',
  author: 'Kainnova Digital Solutions',
  robots: 'index, follow',
  viewport:
    'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
})
</script>

<style scoped>
@media (max-width: 768px) {
  .card-body {
    padding: 16px;
  }

  .form-label {
    font-size: 13px;
    margin-bottom: 6px;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 12px;
  }
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

/* Fix z-index untuk SweetAlert2 agar muncul di atas modal Bootstrap */
:deep(.swal2-container-custom) {
  z-index: 9999 !important;
}

:deep(.swal2-container) {
  z-index: 9999 !important;
}
</style>
