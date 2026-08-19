<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">Kelola jurnal umum untuk pencatatan transaksi akuntansi</p>

            <ListPageStatsCards :items="statItems" :loading="loadingStats" />

            <CollapsibleFilterCard
                title="Filter Jurnal"
                :has-active-filters="hasActiveFilters"
                @reset="resetFilters"
            >
                <FilterFieldsRow :columns="3">
                    <FilterField>
                        <label class="form-label">Status</label>
                        <select class="form-select w-100" v-model="filterStatus" @change="applyFilters">
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="posted">Posted</option>
                            <option value="reversed">Reversed</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </FilterField>
                    <FilterField>
                        <label class="form-label">Tanggal Mulai</label>
                        <input type="date" class="form-control" v-model="filterStartDate" @change="applyFilters" />
                    </FilterField>
                    <FilterField>
                        <label class="form-label">Tanggal Akhir</label>
                        <input type="date" class="form-control" v-model="filterEndDate" @change="applyFilters" />
                    </FilterField>
                </FilterFieldsRow>
            </CollapsibleFilterCard>

            <div class="card">
                <ListPageTableHeader
                    :rows="Number(params.rows)"
                    :rows-options="rowsPerPageOptionsArray"
                    :search="globalFilterValue"
                    search-placeholder="Cari jurnal..."
                    :export-disabled="loading"
                    :export-items="[{ value: 'csv', label: 'CSV' }]"
                    @update:rows="handleRowsChange"
                    @update:search="(v) => { globalFilterValue = v }"
                    @export="exportData"
                >
                    <template #add>
                        <button
                            v-if="userHasRole('superadmin') || userHasPermission('create_journal')"
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="journalStore.openModal()"
                        >
                            <i class="ri-add-line me-1"></i> Tambah Jurnal
                        </button>
                    </template>
                </ListPageTableHeader>
                <div class="card-datatable table-responsive py-3 px-3">
                            <MyDataTable
                                ref="myDataTableRef"
                                :data="journals"
                                :rows="Number(params.rows)" 
                                :loading="loading"
                                :totalRecords="totalRecords"
                                :first="params.first"
                                @page="onPage($event)"
                                @sort="onSort($event)"
                                striped-rows
                                hover
                                paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                responsiveLayout="scroll" 
                                paginatorPosition="bottom"
                                class="p-datatable-sm"
                            >
<Column header="#" :sortable="false">
                                    <template #body="slotProps">
                                        {{ params.first + slotProps.index + 1 }}
                                    </template>
                                </Column>
                                <Column field="journalNumber" header="No. Jurnal" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.journalNumber }}</span>
                                    </template>
                                </Column>
                                <Column field="date" header="Tanggal" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span>{{ formatDate(slotProps.data.date) }}</span>
                                    </template>
                                </Column>
                                <Column field="description" header="Deskripsi" :sortable="true" style="min-width:200px">
                                    <template #body="slotProps">
                                        <div>
                                            <div class="fw-semibold">{{ slotProps.data.description }}</div>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="status" header="Status" :sortable="true" style="min-width:100px">
                                    <template #body="slotProps">
                                        <span :class="statusBadgeClass(slotProps.data.status)">
                                            {{ getStatusLabel(slotProps.data.status) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="referenceType" header="Tipe Referensi" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span v-if="slotProps.data.referenceType" class="badge bg-label-info">
                                            {{ slotProps.data.referenceType }}
                                        </span>
                                        <span v-else class="text-muted">-</span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li v-if="userHasRole('superadmin') || userHasPermission('view_journal')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="openJournalDetails(slotProps.data.id)">
                                                        <i class="ri-eye-line me-2"></i> Lihat Detail
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('edit_journal')) && slotProps.data.status === 'draft'">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="journalStore.openModal(slotProps.data)">
                                                        <i class="ri-edit-box-line me-2"></i> Edit
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('submit_journal') || userHasPermission('post_journal')) && (slotProps.data.status === 'draft' || slotProps.data.status === 'rejected')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="journalStore.submitJournal(slotProps.data.id)">
                                                        <i class="ri-send-plane-line me-2"></i> Submit
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('approve_journal')) && slotProps.data.status === 'pending'">
                                                    <a class="dropdown-item text-success" href="javascript:void(0)" @click="journalStore.approveJournal(slotProps.data.id)">
                                                        <i class="ri-checkbox-circle-line me-2"></i> Approve
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('reject_journal')) && slotProps.data.status === 'pending'">
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="journalStore.rejectJournal(slotProps.data.id)">
                                                        <i class="ri-close-circle-line me-2"></i> Reject
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('post_journal')) && slotProps.data.status === 'approved'">
                                                    <a class="dropdown-item text-success" href="javascript:void(0)" @click="journalStore.postJournal(slotProps.data.id)">
                                                        <i class="ri-check-line me-2"></i> Post
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('reverse_journal')) && slotProps.data.status === 'posted'">
                                                    <a class="dropdown-item text-warning" href="javascript:void(0)" @click="journalStore.reverseJournal(slotProps.data.id)">
                                                        <i class="ri-arrow-go-back-line me-2"></i> Reverse
                                                    </a>
                                                </li>
                                                <li v-if="(userHasRole('superadmin') || userHasPermission('delete_journal')) && (slotProps.data.status === 'draft' || slotProps.data.status === 'rejected')">
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="journalStore.deleteJournal(slotProps.data.id)">
                                                        <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </template>
                                </Column>
                            </MyDataTable>
                        </div>
                    </div>

                <Modal
                    :model-value="showModal"
                    @close="journalStore.closeModal" 
                    id="JournalModal"
                    :title="modalTitle" 
                    :description="modalDescription"
                    :validation-errors-from-parent="validationErrors"
                >
                    <template #default>
                        <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
                            <TabbedFormNav
                                :steps="visibleSteps"
                                :current-index="currentIndex"
                                :disabled="navigating || saving"
                                @select="goTo"
                            />
                            <div class="tab-content pt-4">
                                <div class="tab-pane fade" id="form-tabs-info" data-step-id="form-tabs-info" role="tabpanel" :class="paneClass('form-tabs-info')">
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input 
                                                    type="text" 
                                                    class="form-control" 
                                                    v-model="form.journalNumber" 
                                                    placeholder="Akan di-generate otomatis (JRN-0001-ddmmyy)"
                                                    :readonly="!isEditMode"
                                                >
                                                <label>No. Jurnal</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input 
                                                    type="date" 
                                                    class="form-control" 
                                                    v-model="form.date" 
                                                    
                                                >
                                                <label>Tanggal <span class="text-danger" aria-hidden="true">*</span></label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    :value="getStatusLabel(form.status || 'draft')"
                                                    readonly
                                                    disabled
                                                >
                                                <label>Status (otomatis draft)</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input 
                                                    type="text" 
                                                    class="form-control" 
                                                    v-model="form.referenceType" 
                                                    placeholder="Tipe referensi (opsional)"
                                                >
                                                <label>Tipe Referensi</label>
                                            </div>
                                        </div>
                                        <div class="col-md-12">
                                            <div class="form-floating form-floating-outline">
                                                <input 
                                                    type="text" 
                                                    class="form-control" 
                                                    v-model="form.description" 
                                                    placeholder="Masukkan deskripsi jurnal"
                                                    
                                                >
                                                <label>Deskripsi <span class="text-danger" aria-hidden="true">*</span></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="form-tabs-lines" data-step-id="form-tabs-lines" role="tabpanel" :class="paneClass('form-tabs-lines')">
                                    <div v-for="(line, index) in form.journalLines" :key="index" class="repeater-item mb-4">
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <CustomSelect2 v-model="line.accountId" :options="accounts || []" 
                                                    :get-option-label="option => option?.code && option?.name ? `${option.code} - ${option.name}` : (option?.name || option?.code || '')" searchable clearable
                                                    :reduce="account => account.id" 
                                                    placeholder="Pilih Akun" 

                                                    :close-on-select="true"
                                                    :preserve-search="false"
                                                    :filter-by="(option, label, search) => {
                                                        const searchLower = search.toLowerCase();
                                                        return (option.name || '').toLowerCase().includes(searchLower) || 
                                                               (option.code || '').toLowerCase().includes(searchLower);
                                                    }"
                                                >
                                                    <template #option="{ option }">
                                                        <div class="d-flex justify-content-between align-items-center w-100">
                                                            <div>
                                                                <div class="fw-bold">{{ option.code }} - {{ option.name }}</div>
                                                                <small class="text-muted">{{ option.category || '—' }} · {{ option.normalBalance || '—' }}</small>
                                                            </div>
                                                        </div>
                                                    </template>
                                                    <template #selected-option="{ option }">
                                                        <div class="d-flex align-items-center">
                                                            <span class="fw-bold">{{ option.code }} - {{ option.name }}</span>
                                                        </div>
                                                    </template>
                                                    <template #no-options>
                                                        <div class="text-center p-3">
                                                            <div class="text-muted">
                                                                <i class="ri-search-line me-2"></i>
                                                                Tidak ada akun ditemukan
                                                            </div>
                                                        </div>
                                                    </template>
                                                </CustomSelect2>
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="number" 
                                                        class="form-control" 
                                                        v-model="line.debit" 
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0"
                                                    >
                                                    <label>Debit</label>
                                                </div>
                                            </div>
                                            <div class="col-md-2">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="number" 
                                                        class="form-control" 
                                                        v-model="line.credit" 
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0"
                                                    >
                                                    <label>Credit</label>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="text" 
                                                        class="form-control" 
                                                        v-model="line.description" 
                                                        placeholder="Deskripsi baris"
                                                    >
                                                    <label>Deskripsi</label>
                                                </div>
                                            </div>
                                            <div class="col-md-1 d-flex align-items-end">
                                                <button 
                                                    type="button" 
                                                    class="btn btn-outline-danger w-100 mb-1" 
                                                    @click="journalStore.removeJournalLine(index)"
                                                >
                                                    <i class="ri-subtract-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <hr class="my-4">
                                    </div>
                                    <div class="mt-4 col-12">
                                        <button type="button" class="btn btn-primary col-12 btn-sm" @click="journalStore.addJournalLine()">
                                            <i class="ri-add-line me-1"></i> Tambah Baris
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <TabbedFormActions
                                :is-first-step="isFirstStep"
                                :is-last-step="isLastStep"
                                :loading="navigating"
                                :saving="saving"
                                cancel-label="Tutup"
                                :submit-label="isEditMode ? 'Update' : 'Simpan'"
                                @next="next"
                                @previous="previous"
                                @cancel="journalStore.closeModal()"
                            />
                        </form>
                    </template>
                </Modal>
        </div>
         <!-- / Content -->
         <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalStore } from '~/stores/journal'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Jurnal Umum',
  description: 'General Journal Management',
  keywords: 'Jurnal Umum, General Journal, Accounting, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})

const journalStore = useJournalStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()
const formatRupiah = useFormatRupiah()
const router = useRouter()

const myDataTableRef = ref()
const formRoot = ref(null)
const formSteps = [
  { id: 'form-tabs-info', label: 'Informasi Jurnal', icon: 'ri-user-line' },
  { id: 'form-tabs-lines', label: 'Detail Jurnal', icon: 'ri-file-text-line' },
]
const {
  currentIndex,
  visibleSteps,
  isFirstStep,
  isLastStep,
  navigating,
  next,
  previous,
  goTo,
  paneClass,
  reset,
  validateAll,
} = useTabbedFormNavigation({ steps: formSteps, formRoot })
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const filterStatus = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')

const loading = computed(() => journalStore.loading)
const loadingStats = computed(() => journalStore.loadingStats)
const saving = computed(() => journalStore.saving)
const totalRecords = computed(() => journalStore.totalRecords || 0)
const params = computed(() => journalStore.params)
const form = computed(() => journalStore.form)
const isEditMode = computed(() => journalStore.isEditMode)
const showModal = computed(() => journalStore.showModal)
const validationErrors = computed(() => Array.isArray(journalStore.validationErrors) ? journalStore.validationErrors : [])
const accounts = computed(() => Array.isArray(journalStore.accounts) ? journalStore.accounts : [])
const journals = computed(() => Array.isArray(journalStore.journals) ? journalStore.journals : [])
const statistics = computed(() => journalStore.statistics)

const hasActiveFilters = computed(() => !!(filterStatus.value || filterStartDate.value || filterEndDate.value))

const statItems = computed(() => [
  { key: 'total', label: 'Total', value: statistics.value.total, icon: 'ri-file-text-line', iconBgClass: 'bg-label-primary', subtitle: 'Jurnal terdaftar' },
  { key: 'draft', label: 'Draft', value: statistics.value.draft, icon: 'ri-draft-line', iconBgClass: 'bg-label-warning' },
  { key: 'posted', label: 'Posted', value: statistics.value.posted, icon: 'ri-check-line', iconBgClass: 'bg-label-success', valueClass: 'text-success' },
  { key: 'totalDebit', label: 'Total Debit', value: formatRupiah(statistics.value.totalDebit), icon: 'ri-money-dollar-circle-line', iconBgClass: 'bg-label-info' },
])

const applyFilters = () => {
  journalStore.params.status = filterStatus.value
  journalStore.params.startDate = filterStartDate.value
  journalStore.params.endDate = filterEndDate.value
  journalStore.params.first = 0
  journalStore.fetchJournals()
}

const resetFilters = () => {
  filterStatus.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  applyFilters()
}

const modalTitle = computed(() => isEditMode.value ? 'Edit Jurnal' : 'Tambah Jurnal Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data jurnal di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan jurnal baru.')

const formatDate = (date) => new Date(date).toLocaleDateString('id-ID')

const getStatusLabel = (status) => {
  const labels = { draft: 'Draft', posted: 'Posted', reversed: 'Reversed', cancelled: 'Dibatalkan' }
  return labels[status] || status
}

const statusBadgeClass = (status) => {
  if (status === 'posted') return 'badge bg-label-success'
  if (status === 'reversed') return 'badge bg-label-info'
  if (status === 'cancelled') return 'badge bg-label-danger'
  return 'badge bg-label-warning'
}

const openJournalDetails = (journalId) => {
  router.push(`/finance/journals/detail/${journalId}`)
}

const exportData = (format) => {
  if (format === 'csv' && myDataTableRef.value) myDataTableRef.value.exportCSV()
}

const { userHasRole, userHasPermission } = usePermissions()

onMounted(async () => {
  try {
    await permissionStore.fetchPermissions()
    await userStore.loadUser()
    journalStore.journals = []
    filterStatus.value = journalStore.params.status || ''
    filterStartDate.value = journalStore.params.startDate || ''
    filterEndDate.value = journalStore.params.endDate || ''
    await Promise.all([
      journalStore.fetchAccounts(),
      journalStore.fetchJournals(),
      journalStore.fetchStatistics(),
    ])
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
  setListTitle('Jurnal Umum', totalRecords.value)
})

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await journalStore.saveJournal()
}

watch(showModal, (newValue) => {
  if (newValue) {
    reset()
  }
})

const debouncedSearch = useDebounceFn(() => {
  journalStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => journalStore.setPagination(event)
const onSort = (event) => journalStore.setSort(event)

const handleRowsChange = async (value) => {
  journalStore.params.rows = Number(value) || 10
  journalStore.params.first = 0
  await journalStore.fetchJournals()
}
</script>

<style scoped>
@media (max-width: 768px) {
  .card-body { padding: 16px; }
  .form-label { font-size: 13px; margin-bottom: 6px; }
}
</style>
