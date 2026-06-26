<template>
    <div class="page-wrapper">
        <div class="content-wrapper">
            <!-- Loading Overlay -->
            <div v-if="isInitialLoading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Memuat data Site Investment...</p>
                </div>
            </div>

            <!-- Content -->
            <div v-else class="container-xxl flex-grow-1 container-p-y">
                <h4 class="mb-1">Site Investment</h4>
                <p class="mb-6">List site investment yang terdaftar di sistem</p>

                <!-- Statistics Cards -->
                <div class="row g-6 mb-6">
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Total Site Investment</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-primary">
                                            <i class="ri-building-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                                        <span class="text-muted">Site Investment terdaftar</span>
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
                                        <h5 class="mb-1">{{ stats.draft || 0 }}</h5>
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
                                    <p class="mb-0">Pending</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-warning">
                                            <i class="ri-time-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.pending || 0 }}</h5>
                                        <span class="text-muted">Pending</span>
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
                                        <h5 class="mb-1">{{ stats.approved || 0 }}</h5>
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
                                        <h5 class="mb-1">{{ stats.rejected || 0 }}</h5>
                                        <span class="text-muted">Rejected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <p class="mb-0">Expired</p>
                                    <div class="avatar">
                                        <span class="avatar-initial rounded bg-label-secondary">
                                            <i class="ri-pass-expired-line"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="account-heading">
                                        <h5 class="mb-1">{{ stats.expired || 0 }}</h5>
                                        <span class="text-muted">Expired</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-6">
                    <div class="col-12">
                        <h4 class="mt-6 mb-1">Filter Site Investment</h4>
                        <p class="mb-0">Temukan semua site investment perusahaan Anda</p>
                    </div>
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Customer</label>
                                        <CustomSelect2
                                            v-model="filters.customerId"
                                            :options="customers"
                                            :get-option-label="getCustomerLabel"
                                            :reduce="getCustomerId"
                                            placeholder="Pilih Customer"
                                            searchable
                                            clearable
                                            :loading="customerStore.loading"
                                            loading-text="Memuat customer..."
                                        />
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Status</label>
                                        <CustomSelect2
                                            v-model="filters.status"
                                            :options="statusOptions"
                                            :get-option-label="getOptionLabel"
                                            :reduce="getOptionValue"
                                            placeholder="Pilih Status"
                                            searchable
                                            clearable
                                        />
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label text-muted mb-2">Filter Priority</label>
                                        <CustomSelect2
                                            v-model="filters.priority"
                                            :options="priorityOptions"
                                            :get-option-label="getOptionLabel"
                                            :reduce="getOptionValue"
                                            placeholder="Pilih Priority"
                                            searchable
                                            clearable
                                        />
                                    </div>
                                </div>
                                <div class="row mt-3">
                                    <div class="col-md-4 mb-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="filters.startDate" class="form-control" placeholder="Tanggal Mulai" @change="onDateChange">
                                            <label>Tanggal Mulai</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="form-floating form-floating-outline">
                                            <input type="date" v-model="filters.endDate" class="form-control" placeholder="Tanggal Akhir" @change="onDateChange">
                                            <label>Tanggal Akhir</label>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3 reset-filter-button">
                                        <button @click="clearDateFilters" class="btn btn-outline-secondary me-2 si-reset-filter-btn">
                                            <i class="ri-refresh-line me-1"></i> Reset Filter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="col-12">
                        <div class="card">
                            <ListPageTableHeader
                                :rows="Number(tableControls.rows)"
                                :rows-options="rowsPerPageOptionsArray"
                                :search="globalFilterValue"
                                search-placeholder="Cari Site Investment..."
                                :export-disabled="loading"
                                @update:rows="onToolbarRows"
                                @update:search="(v) => { globalFilterValue = v }"
                                @export="exportData"
                            >
                                <template #add>
                                    <button
                                        v-if="userHasRole('superadmin') || userHasPermission('create_site_investment')"
                                        type="button"
                                        class="btn btn-primary si-add-button"
                                        @click="navigateTo('/sales/site-investment/form')"
                                    >
                                        <i class="ri-add-line me-1"></i>
                                        Tambah SI
                                    </button>
                                </template>
                            </ListPageTableHeader>
                            <div class="card-datatable table-responsive py-3 px-3">
                                <MyDataTable
                                    ref="myDataTableRef"
                                    :data="siteInvests"
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
                                        <template #body="slotProps">
                                            {{ params.first + slotProps.index + 1 }}
                                        </template>
                                    </Column>
                                    <Column field="siNumber" header="SI Number" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            <a 
                                                @click="navigateTo(`/sales/site-investment/detail/${slotProps.data.id}`)" 
                                                style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                title="View detail"
                                                class="text-primary"
                                            >
                                                {{ slotProps.data.siNumber || '-' }}
                                            </a>
                                        </template>
                                    </Column>
                                    <Column field="name" header="Project Name" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">{{ slotProps.data.name || '-' }}</template>
                                    </Column>
                                    <Column field="customer.name" header="Customer" :sortable="true" class="text-nowrap fw-semibold">
                                        <template #body="slotProps">{{ (slotProps.data.customer?.name ?? slotProps.data.customerName) || '-' }}</template>
                                    </Column>
                                    <Column field="location" header="Lokasi" :sortable="true">
                                        <template #body="slotProps">{{ slotProps.data.location || '-' }}</template>
                                    </Column>
                                    <Column field="businessScheme.name" header="Skema" :sortable="true" class="text-nowrap fw-semibold">
                                        <template #body="slotProps">{{ (slotProps.data.businessScheme?.name ?? slotProps.data.businessSchemeName) || '-' }}</template>
                                    </Column>
                                    <Column field="priority" header="Priority" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getPriorityBadgeClass(slotProps.data.priority)">
                                                {{ getPriorityBadgeText(slotProps.data.priority) }}
                                            </span>
                                        </template>
                                    </Column>
                                    <Column field="status" header="Status" :sortable="true">
                                        <template #body="slotProps">
                                            <span :class="getStatusBadgeClass(slotProps.data)">
                                                {{ getStatusBadgeText(slotProps.data) }}
                                            </span>
                                            <span v-if="(slotProps.data.revision ?? 0) > 0" class="badge bg-label-info ms-1">R{{ slotProps.data.revision }}</span>
                                        </template>
                                    </Column>
                                    <Column field="grandTotal" header="Total Investment" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatRupiah(slotProps.data.grandTotal) }}
                                        </template>
                                    </Column>
                                    <Column field="marketingFee" header="Marketing Fee" :sortable="true" class="text-nowrap">
                                        <template #body="slotProps">
                                            {{ formatRupiah(slotProps.data.marketingFee ?? slotProps.data.marketing_fee ?? 0) }}
                                        </template>
                                    </Column>
                                    <Column field="siDate" header="Tanggal" :sortable="true">
                                        <template #body="slotProps">
                                            {{ formatSiDate(slotProps.data.siDate) }}
                                        </template>
                                    </Column>
                                    <Column field="attachment" header="Attachment" :sortable="false">
                                        <template #body="slotProps">
                                            <a v-if="slotProps.data.attachment" :href="getAttachmentUrl(slotProps.data.attachment)" target="_blank" rel="noopener noreferrer" download class="badge rounded-pill bg-label-primary" style="text-decoration: none;">
                                                <i class="ri-attachment-2 me-1"></i> File
                                            </a>
                                            <span v-else class="text-muted">—</span>
                                        </template>
                                    </Column>
                                    <Column header="Actions" :exportable="false" style="min-width:8rem">
                                        <template #body="slotProps">
                                            <div class="dropdown d-inline-block">
                                                <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'>
                                                    <i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu dropdown-menu-end si-actions-dropdown">
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('edit_site_investment')) && (slotProps.data.status === 'draft' || slotProps.data.status === 'rejected')">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="onSubmitSi(slotProps.data.id)">
                                                            <i class="ri-send-plane-line me-2"></i> {{ slotProps.data.status === 'rejected' ? 'Submit Revisi' : 'Submit SI' }}
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_site_investment')) && canApproveSiteInvest(slotProps.data)">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="siteInvestStore.approveSiteInvest(slotProps.data.id)">
                                                            <i class="ri-check-line me-2"></i> Approve
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('approve_site_investment')) && slotProps.data.status !== 'cancelled'">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="siteInvestStore.cancelSiteInvest(slotProps.data.id)">
                                                            <i class="ri-close-circle-line me-2"></i> Cancel
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('reject_site_investment')) && canRejectSiteInvest(slotProps.data)">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="siteInvestStore.rejectSiteInvest(slotProps.data.id)">
                                                            <i class="ri-close-line me-2"></i> Reject
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('edit_site_investment')) && canEditSiteInvest(slotProps.data)">
                                                        <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/sales/site-investment/form/${slotProps.data.id}`)">
                                                            <i class="ri-edit-box-line me-2"></i> Edit
                                                        </a>
                                                    </li>
                                                    <li v-if="(userHasRole('superadmin') || userHasPermission('delete_site_investment'))">
                                                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="siteInvestStore.deleteSiteInvest(slotProps.data.id)">
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
                    </div>
                </div>
            </div>

        </div>
        <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteInvestStore } from '~/stores/site-invest'
import { useCustomerStore } from '~/stores/customer'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { useImageUrl } from '~/composables/useImageUrl'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import Column from 'primevue/column'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()

const isInitialLoading = ref(true)
const siteInvestStore = useSiteInvestStore()
const customerStore = useCustomerStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()
const formatRupiah = useFormatRupiah()
const { userHasPermission, userHasRole } = usePermissions()
const { getStatusBadge, getStepCountForApproved } = useApprovalStatus()

function canEditSiteInvest(row) {
  if (!row) return false
  const s = row.status
  if (s === 'draft' || s === 'pending' || s === 'rejected') return true
  if (s === 'approved') {
    const stepCount = getStepCountForApproved(row)
    return stepCount != null && stepCount.total > 0 && stepCount.current < stepCount.total
  }
  return false
}

function canApproveSiteInvest(row) {
  if (!row) return false
  const uid = userStore.user?.id
  if (uid == null) return false
  const approvers = row.currentApprovers || []
  const isCurrentApprover = approvers.length === 0 || approvers.some((a) => Number(a.userId) === Number(uid))
  if (row.status === 'pending') {
    return isCurrentApprover
  }
  if (row.status === 'approved') {
    const stepCount = getStepCountForApproved(row)
    if (stepCount && stepCount.current < stepCount.total) {
      return isCurrentApprover
    }
  }
  return false
}

function canRejectSiteInvest(row) {
  return canApproveSiteInvest(row)
}

const { getAttachmentUrl, isImageFile } = useImageUrl()

function formatSiDate(value) {
    if (value == null || value === '') return '-'
    try {
        const d = new Date(value)
        if (Number.isNaN(d.getTime())) return '-'
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
        return '-'
    }
}

const { siteInvests, loading, totalRecords, params, stats } = storeToRefs(siteInvestStore)
const { customers } = storeToRefs(customerStore)


const { user } = storeToRefs(userStore)
const { permissions } = storeToRefs(permissionStore)

function getCustomerLabel(c) {
    return c ? c.name : ''
}

function getCustomerId(c) {
    return c ? c.id : null
}

function getOptionLabel(option) {
    return option ? option.label : ''
}

function getOptionValue(option) {
    return option ? option.value : null
}

const myDataTableRef = ref(null)
const filters = ref({
    customerId: null,
    status: null,
    priority: null,
    startDate: null,
    endDate: null,
    search: '',
})
const globalFilterValue = ref('')

const tableControls = ref({
    rows: 10,
    search: ''
})

const usersForBudget = ref([])
const sites = ref([])
const businessSchemes = ref([])
const pegawaiOptions = ref([])

const fetchBudgetsAndUsers_REMOVED = async () => {
    const prevRows = 10 // budgetStore was removed
    budgetStore.params.rows = 500
    await budgetStore.fetchBudgets(true)
    budgetStore.params.rows = prevRows
    const { $api } = useNuxtApp()
    try {
        const r = await fetch(`${$api.users()}?page=1&rows=500`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (r.ok) {
            const j = await r.json()
            usersForBudget.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching users for budget holder:', e)
    }
}

function mapPegawaiToOptions(raw) {
    const list = Array.isArray(raw) ? raw : []
    return list
        .map(function (p) {
            return {
                id_pegawai: Number(p.id_pegawai ?? p.idPegawai ?? p.id),
                nm_pegawai: p.nm_pegawai ?? p.nmPegawai ?? ''
            }
        })
        .filter(function (p) { return Number.isFinite(p.id_pegawai) && p.id_pegawai > 0 })
}

const fetchPegawaiForPreparedBy = async () => {
    const { $api } = useNuxtApp()
    try {
        const r = await fetch($api.siteInvestmentPreparedByOptions(), {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
        if (r.ok) {
            const j = await r.json()
            pegawaiOptions.value = mapPegawaiToOptions(j.data ?? j)
        } else {
            pegawaiOptions.value = []
        }
    } catch (e) {
        console.error('Error fetching pegawai for prepared by:', e)
        pegawaiOptions.value = []
    }
}

function addBudgetItem() {
    const f = siteInvestStore.form
    if (!f.siteInvestBudgets) f.siteInvestBudgets = []
    f.siteInvestBudgets.push({ budgetSourceId: null, budgetHolderId: null })
}
function removeBudgetItem(index) {
    const f = siteInvestStore.form
    if (!f.siteInvestBudgets) return
    f.siteInvestBudgets.splice(index, 1)
}

const fetchPriceListsForSelect = async () => {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.priceList()}?page=1&rows=500&isActive=true`, {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        })
        if (res.ok) {
            const j = await res.json()
            priceListOptions.value = j.data || []
        } else {
            priceListOptions.value = []
        }
    } catch (e) {
        console.error('Error fetching price lists for select:', e)
        priceListOptions.value = []
    }
}

const fetchPriceListLinesForModal = async () => {
    try {
        const [productLines, serviceLines, didLines] = await Promise.all([
            siteInvestStore.fetchPriceListLines('product'),
            siteInvestStore.fetchPriceListLines('service'),
            siteInvestStore.fetchPriceListLines('did'),
        ])
        priceListLinesProduct.value = productLines
        priceListLinesService.value = serviceLines
        priceListLinesDid.value = didLines
        recalcServiceItemsFromLines()
    } catch (error) {
        console.error('Error fetching price list lines for site investment:', error)
    }
}

function toNum(v) {
    return (v !== null && v !== undefined && v !== '') ? Number(v) : 0
}

/** Ambil data Price List lengkap dan merge ke priceListLines agar nominal (price, terminal_kit, dll) terisi. Dipakai saat autofill dari FDR karena data dari FDR API bisa minimal. */
async function enrichPriceListLinesFromPriceList(priceListId) {
    if (!priceListId) return
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
        if (!res.ok) return
        const priceList = await res.json()
        const lines = priceList.lines || []
        const pt = (l) => l.priceableType ?? l.priceable_type
        const mergeLine = (arr, fullLine) => {
            const idx = arr.findIndex((x) => (x.id ?? x) === (fullLine.id ?? fullLine))
            if (idx >= 0) {
                arr[idx] = { ...arr[idx], ...fullLine }
            } else {
                arr.push(fullLine)
            }
        }
        const productLines = lines.filter((l) => pt(l) === 'product')
        productLines.forEach((l) => mergeLine(priceListLinesProduct.value, l))
        const serviceLines = lines.filter((l) => pt(l) === 'service')
        serviceLines.forEach((l) => mergeLine(priceListLinesService.value, l))
        const didLines = lines.filter((l) => pt(l) === 'did')
        didLines.forEach((l) => mergeLine(priceListLinesDid.value, l))
    } catch (e) {
        console.error('Error enriching price list lines from Price List:', e)
    }
}

/** Saat user pilih Price List: fetch detail + lines, lalu isi tab Materials, Services, DID */
async function onPriceListSelect(priceListId) {
    if (!form.value || !priceListId) return
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.priceListShow(priceListId)}?includeLines=true`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
        if (!res.ok) return
        const priceList = await res.json()
        const lines = priceList.lines || []
        const pt = (l) => l.priceableType ?? l.priceable_type

        const productLines = lines.filter((l) => pt(l) === 'product')
        form.value.siteInvestMaterials = productLines.map((l) => {
            const q = toNum(l.quantity) || 1
            const p = toNum(l.price) || 0
            return {
                priceListLineId: l.id,
                quantity: q,
                price: p,
                subtotal: toNum(l.subtotal) || q * p,
                isPriceOverridden: false,
            }
        })

        const serviceLines = lines.filter((l) => pt(l) === 'service')
        const svcField = (l, key) => l[key] ?? l[key.replace(/([A-Z])/g, '_$1').toLowerCase()]
        form.value.siteInvestServices = serviceLines.map((l) => {
            const q = toNum(l.quantity) || 1
            const effectivePrice = getServiceLineEffectivePriceFromLine(l)
            const p = effectivePrice
            return {
                priceListLineId: l.id,
                quantity: q,
                price: p,
                subtotal: q * p,
                isPriceOverridden: false,
                terminalKitCount: svcField(l, 'terminalKitCount') != null ? Number(svcField(l, 'terminalKitCount')) : null,
                quotaPriority: svcField(l, 'quotaPriority') != null ? Number(svcField(l, 'quotaPriority')) : null,
                newServiceLine: svcField(l, 'newServiceLine') != null ? Number(svcField(l, 'newServiceLine')) : null,
                additionalData: svcField(l, 'additionalData') != null ? Number(svcField(l, 'additionalData')) : null,
            }
        })

        const didLines = lines.filter((l) => pt(l) === 'did')
        form.value.siteInvestDids = didLines.map((l) => {
            const q = toNum(l.quantity) || 1
            const p = toNum(l.price) || 0
            return {
                priceListLineId: l.id,
                quantity: q,
                price: p,
                subtotal: toNum(l.subtotal) || q * p,
                isPriceOverridden: false,
            }
        })
        selectedDidPriceListId.value = priceList.id

        recalcServiceItemsFromLines()
        await nextTick()
        await Promise.all((form.value?.siteInvestMaterials ?? []).map((_, i) => checkMaterialStock(i)))
    } catch (e) {
        console.error('Error filling from price list:', e)
    }
}

/** Harga efektif service dari objek line (support camelCase/snake_case) */
function getServiceLineEffectivePriceFromLine(line) {
    if (!line) return 0
    const base = toNum(line.price) || 0
    const tk = toNum(line.terminalKitCount ?? line.terminal_kit_count) || 0
    const qp = toNum(line.quotaPriority ?? line.quota_priority) || 0
    const nsl = toNum(line.newServiceLine ?? line.new_service_line) || 0
    const ad = toNum(line.additionalData ?? line.additional_data) || 0
    return base + tk + qp + nsl + ad
}

/** Autofill price, subtotal, dan 4 field komponen tiap service item dari price list line (untuk edit / setelah lines dimuat). Harga satuan = efektif (base + terminal_kit + quota_priority + new_service_line + additional_data). */
const recalcServiceItemsFromLines = () => {
    const items = form.value?.siteInvestServices ?? []
    const lines = priceListLinesService.value
    items.forEach((item) => {
        if (!item.priceListLineId) return
        const line = lines.find(l => l.id === item.priceListLineId || String(l.id) === String(item.priceListLineId))
        if (!line) return
        const unitPrice = getServiceLineEffectivePrice(line)
        item.price = unitPrice
        item.quantity = Number(item.quantity) || Number(line.quantity) || 1
        item.subtotal = (Number(item.quantity) || 1) * unitPrice
        item.terminalKitCount = serviceLineField(line, 'terminal_kit_count') != null ? Number(serviceLineField(line, 'terminal_kit_count')) : null
        item.quotaPriority = serviceLineField(line, 'quota_priority') != null ? Number(serviceLineField(line, 'quota_priority')) : null
        item.newServiceLine = serviceLineField(line, 'new_service_line') != null ? Number(serviceLineField(line, 'new_service_line')) : null
        item.additionalData = serviceLineField(line, 'additional_data') != null ? Number(serviceLineField(line, 'additional_data')) : null
    })
}

const fetchSitesForSelect = async () => {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.sites()}?page=1&rows=500`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (res.ok) {
            const j = await res.json()
            sites.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching sites for select:', e)
    }
}

const fetchBusinessSchemesForSelect = async () => {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.businessSchemes()}?page=1&rows=500`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
        if (res.ok) {
            const j = await res.json()
            businessSchemes.value = j.data || []
        }
    } catch (e) {
        console.error('Error fetching business schemes for select:', e)
    }
}

function onSiteChange(siteId) {
    const s = sites.value.find(x => x.id === siteId)
    if (s && form.value) {
        form.value.location = s.address || ''
        form.value.lat = s.latitude != null ? String(s.latitude) : ''
        form.value.long = s.longitude != null ? String(s.longitude) : ''
    }
}

const rowsPerPageOptionsArray = ref([10, 25, 50, 100])
const modalTitle = computed(() => isEditMode.value ? 'Edit Site Investment' : 'Tambah Site Investment')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data Site Investment di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan data Site Investment baru.')

const statusOptions = ref([
    { label: 'Semua', value: null },
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Expired', value: 'expired' },
    { label: 'Cancelled', value: 'cancelled' },
])

const priorityOptions = ref([
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
])

const categoryOptions = ref([
    { label: 'Delivery', value: 'delivery' },
    { label: 'Installation', value: 'installation' },
    { label: 'Survey', value: 'survey' },
    { label: 'Dismantle', value: 'dismantle' },
])

const materialSubtotal = computed(() => {
    if (!form.value || !form.value.siteInvestMaterials) return 0
    return form.value.siteInvestMaterials.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const serviceSubtotal = computed(() => {
    if (!form.value || !form.value.siteInvestServices) return 0
    return form.value.siteInvestServices.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const didSubtotal = computed(() => {
    if (!form.value || !form.value.siteInvestDids) return 0
    return form.value.siteInvestDids.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 1
        const price = Number(item.price) || 0
        return sum + (quantity * price)
    }, 0)
})

const totalInvestment = computed(() => {
    const fromItems = materialSubtotal.value + serviceSubtotal.value + didSubtotal.value
    if (fromItems > 0) return fromItems
    if (isEditMode.value && form.value && (form.value.total != null && form.value.total !== '')) {
      return Number(form.value.total) || 0
    }
    return fromItems
})

const marketingFeeAmount = computed(() => {
    const v = form.value?.marketingFee ?? form.value?.marketing_fee
    if (v === null || v === undefined || v === '') return 0
    return Number(v) || 0
})

const grandTotal = computed(() => {
    const fromCalc = totalInvestment.value + marketingFeeAmount.value
    if (fromCalc > 0) return fromCalc
    if (isEditMode.value && form.value && (form.value.grandTotal != null && form.value.grandTotal !== '')) {
      return Number(form.value.grandTotal) || 0
    }
    return fromCalc
})

const { isLoading: isDataLoading, error: dataError } = usePageData({
    pageName: 'Site Investment',
    loaders: [
        () => {
            filters.value.status = null
            filters.value.customerId = null
            filters.value.priority = null
            filters.value.startDate = null
            filters.value.endDate = null
            siteInvestStore.params.status = null
            siteInvestStore.params.customerId = null
            siteInvestStore.params.priority = null
            siteInvestStore.params.startDate = null
            siteInvestStore.params.endDate = null
            siteInvestStore.params.first = 0
        },
        () => customerStore.fetchCustomers(),
        () => permissionStore.fetchPermissions(),
        () => userStore.loadUser(),
        () => siteInvestStore.fetchSiteInvests(),
        () => siteInvestStore.fetchStats(),
    ],
    onSuccess: () => {
        setListTitle('Site Investment', stats.value.total || 0)
    },
    waitAll: true
})

watch(isDataLoading, (value) => {
    isInitialLoading.value = value
})

onMounted(() => {
    tableControls.value.rows = Number(params.value.rows) || 10
    tableControls.value.search = globalFilterValue.value

    const editId = useRoute().query.edit
    if (editId && typeof editId === 'string') {
        nextTick(() => navigateTo(`/sales/site-investment/form/${editId}`))
    }
    const fromFdrId = useRoute().query.fromFdr
    if (fromFdrId && typeof fromFdrId === 'string') {
        nextTick(() => navigateTo({ path: '/sales/site-investment/form', query: { fromFdr: fromFdrId } }))
    }
})

watch(() => params.value.rows, (newValue) => {
    tableControls.value.rows = Number(newValue) || 10
})

watch(() => globalFilterValue.value, (newValue) => {
    tableControls.value.search = newValue
})

const debouncedSearch = useDebounceFn(() => {
    siteInvestStore.setSearch(globalFilterValue.value)
}, 500)

watch(globalFilterValue, debouncedSearch)

watch(filters, (newFilters) => {
    const { page, rows, ...restFilters } = newFilters
    siteInvestStore.setFilters(restFilters)
}, { deep: true })


const onPage = (event) => {
    if (event) {
        const validEvent = {
            first: Number(event.first) || 0,
            rows: Number(event.rows) || 10,
            page: Number(event.page) || 0
        }
        siteInvestStore.setPagination(validEvent)
    }
}

const handleRowsChange = (value) => {
    const rowsValue = Number(value) || 10
    params.value.rows = rowsValue
    params.value.first = 0
    siteInvestStore.fetchSiteInvests()
}

const onToolbarRows = (value) => {
    tableControls.value.rows = Number(value) || 10
    handleRowsChange(value)
}

const handleSearch = (value) => {
    globalFilterValue.value = value
    params.value.first = 0
    siteInvestStore.fetchSiteInvests()
}

const onSubmitSi = async (id) => {
    const ok = await siteInvestStore.submitSiteInvest(id)
    if (ok) {
        filters.value.status = null
    }
}

const onSort = (event) => {
    if (event) {
        siteInvestStore.setSort(event)
    }
}

const exportData = async (format) => {
    const toast = useToast()
    if (format === 'excel') {
        if (myDataTableRef.value?.exportCSV) {
            myDataTableRef.value.exportCSV()
        } else {
            toast.warning({ title: 'Warning', message: 'Export tidak tersedia', color: 'orange' })
        }
        return
    }
    if (format === 'pdf') {
        toast.info({
            title: 'Info',
            message: 'Export PDF akan segera tersedia',
            color: 'blue'
        })
    }
}

const convertToNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0
    if (typeof value === 'number') return value
    const stringValue = String(value).trim()
    const normalizedValue = stringValue.replace(',', '.')
    const numValue = parseFloat(normalizedValue)
    return isNaN(numValue) ? 0 : numValue
}

const formatForDisplay = (value) => {
    const numValue = convertToNumber(value)
    if (numValue === 0) return ''
    return numValue.toString().replace('.', ',')
}

const onMarketingFeeInput = (event) => {
    const target = event.target
    const value = target.value
    const numValue = parseRupiahToNumber(value)
    form.value.marketingFee = numValue
}

const onMarketingFeeBlur = (event) => {
    const target = event.target
    const numValue = parseRupiahToNumber(target.value)
    form.value.marketingFee = numValue
    target.value = formatRupiah(numValue)
}

function onAttachmentChange(e) {
    if (!form.value) return
    const file = e.target.files?.[0]
    if (file) {
        if (!file.size || file.size === 0) {
            useToast().error({ title: 'Error', message: 'File attachment kosong atau tidak valid', color: 'red' })
            return
        }
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            useToast().error({ title: 'Error', message: 'Ukuran file maksimal 2MB', color: 'red' })
            return
        }
        const ext = file.name?.split('.').pop()?.toLowerCase() || ''
        const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
        if (!allowed.includes(ext)) {
            useToast().error({ title: 'Error', message: `Format tidak didukung. Gunakan: ${allowed.join(', ')}`, color: 'red' })
            return
        }
        form.value.attachment = file
        form.value.attachmentPreview = URL.createObjectURL(file)
    } else {
        form.value.attachment = null
        form.value.attachmentPreview = null
    }
    e.target.value = ''
}

const handleSubmit = () => {
    form.value.marketingFee = parseRupiahToNumber(form.value.marketingFee) || 0
    siteInvestStore.saveSiteInvest()
}

/** Cek stok product untuk material row; set materialStockInsufficient[index] jika qty > stok tersedia */
async function checkMaterialStock(index) {
    const item = form.value?.siteInvestMaterials?.[index]
    let line = null
    if (item?.priceListLineId) {
        line = priceListLinesProduct.value.find(l => l.id === item.priceListLineId) || null
    }
    const productId = line?.product?.id ?? line?.priceable_id
    const priceableType = line?.priceable_type ?? line?.priceableType
    if (!productId || priceableType !== 'product') {
        const next = Object.assign({}, materialStockInsufficient.value)
        next[index] = false
        materialStockInsufficient.value = next
        return
    }
    const res = await siteInvestStore.fetchProductStock(Number(productId))
    const requested = Number(item?.quantity) || 0
    let available = 0
    if (res != null && typeof res.quantity === 'number') available = res.quantity
    const next = Object.assign({}, materialStockInsufficient.value)
    next[index] = requested > 0 && available < requested
    materialStockInsufficient.value = next
}

const onMaterialLineChange = async (index, lineId) => {
    const line = priceListLinesProduct.value.find(l => l.id === lineId)
    if (!line || !form.value?.siteInvestMaterials?.[index]) return
    const item = form.value.siteInvestMaterials[index]
    item.price = Number(line.price) || 0
    item.quantity = Number(line.quantity) || 1
    item.isPriceOverridden = false
    item.subtotal = item.quantity * item.price
    await checkMaterialStock(index)
}

const calculateMaterialSubtotal = (index) => {
    const item = form.value?.siteInvestMaterials?.[index]
    if (!item) return
    const quantity = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    item.subtotal = quantity * price
    checkMaterialStock(index)
}

/** Harga satuan efektif dari price list (base + terminal_kit + quota_priority + new_service_line + additional_data). Dipakai untuk autofill nominal. */
function getServiceLineUnitPrice(line) {
    return getServiceLineEffectivePrice(line)
}

const onServiceLineChange = (index, lineId) => {
    const line = priceListLinesService.value.find(l => l.id === lineId || String(l.id) === String(lineId))
    if (!line || !form.value?.siteInvestServices?.[index]) return
    const item = form.value.siteInvestServices[index]
    const unitPrice = getServiceLineEffectivePrice(line)
    item.price = unitPrice
    item.quantity = Number(line.quantity) || 1
    item.isPriceOverridden = false
    item.subtotal = (Number(item.quantity) || 1) * unitPrice
    item.terminalKitCount = serviceLineField(line, 'terminal_kit_count') != null ? Number(serviceLineField(line, 'terminal_kit_count')) : null
    item.quotaPriority = serviceLineField(line, 'quota_priority') != null ? Number(serviceLineField(line, 'quota_priority')) : null
    item.newServiceLine = serviceLineField(line, 'new_service_line') != null ? Number(serviceLineField(line, 'new_service_line')) : null
    item.additionalData = serviceLineField(line, 'additional_data') != null ? Number(serviceLineField(line, 'additional_data')) : null
}

/** Mengambil price list line (service) yang dipilih untuk item di index tertentu */
const getServiceLineForItem = (index) => {
    const item = form.value?.siteInvestServices?.[index]
    if (!item?.priceListLineId) return null
    return priceListLinesService.value.find(l => l.id === item.priceListLineId) ?? null
}

/** Nilai field dari price list line (support snake_case & camelCase dari API) */
const serviceLineField = (line, snakeKey) => {
    if (!line) return null
    const camelKey = snakeKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    return line[snakeKey] ?? line[camelKey] ?? null
}

/** Nilai field harga dari price list line, diformat Rupiah */
const serviceLinePriceField = (line, snakeKey) => {
    const val = serviceLineField(line, snakeKey)
    return val != null ? formatRupiah(val) : '—'
}

/** Harga efektif per service = price + terminal_kit_count + quota_priority + new_service_line + additional_data */
const getServiceLineEffectivePrice = (line) => {
    if (!line) return 0
    const base = Number(line.price) || 0
    const terminalKit = Number(serviceLineField(line, 'terminal_kit_count')) || 0
    const quotaPriority = Number(serviceLineField(line, 'quota_priority')) || 0
    const newServiceLine = Number(serviceLineField(line, 'new_service_line')) || 0
    const additionalData = Number(serviceLineField(line, 'additional_data')) || 0
    return base + terminalKit + quotaPriority + newServiceLine + additionalData
}

/** Recalculate subtotal service saat qty berubah */
const calculateServiceSubtotal = (index) => {
    const item = form.value?.siteInvestServices?.[index]
    if (!item) return
    const qty = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    item.subtotal = qty * price
}

/** Saat user pilih satu Price List di tab DID: isi repeater dengan semua baris DID dari price list itu */
function onDidPriceListSelect(priceListId) {
    if (!form.value) return
    if (priceListId == null || priceListId === '') {
        form.value.siteInvestDids = []
        return
    }
    const lines = (priceListLinesDid.value || []).filter(
        (l) => (l.price_list_id ?? l.priceList?.id ?? l.price_list?.id) === priceListId
    )
    form.value.siteInvestDids = lines.map((line) => {
        const q = Number(line.quantity) || 1
        const p = Number(line.price) || 0
        return {
            priceListLineId: line.id,
            quantity: q,
            price: p,
            subtotal: q * p,
            isPriceOverridden: false,
        }
    })
}

/** Ambil price list line (DID) untuk item di index */
function getDidLineForItem(index) {
    const item = form.value?.siteInvestDids?.[index]
    if (!item?.priceListLineId) return null
    return priceListLinesDid.value.find((l) => l.id === item.priceListLineId) ?? null
}

/** Label tampilan untuk baris DID (DID code + name + kategori) */
function getDidLineLabel(item) {
    if (!item?.priceListLineId) return '—'
    const line = priceListLinesDid.value.find((l) => l.id === item.priceListLineId)
    if (!line) return '—'
    const didPart = line.did ? `${line.did.code || ''} - ${line.did.name || ''}`.trim() || `Line #${line.id}` : `Line #${line.id}`
    const cat = line.category_did ?? line.categoryDid
    const catStr = cat ? ` (${String(cat).split(',')[0].trim()})` : ''
    return didPart + catStr
}

const onDidLineChange = (index, lineId) => {
    const line = priceListLinesDid.value.find(l => l.id === lineId)
    if (!line || !form.value?.siteInvestDids?.[index]) return
    const item = form.value.siteInvestDids[index]
    item.price = Number(line.price) || 0
    item.quantity = Number(line.quantity) || 1
    item.isPriceOverridden = false
    item.subtotal = item.quantity * item.price
}

const calculateDidSubtotal = (index) => {
    const item = form.value?.siteInvestDids?.[index]
    if (!item) return
    const q = Number(item.quantity) || 1
    const p = Number(item.price) || 0
    item.subtotal = q * p
}

const parseRupiahToNumber = (rupiahString) => {
    if (!rupiahString) return 0
    return Number(String(rupiahString).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
}

const updateMaterialPriceFromInput = (index, event) => {
    const numericValue = parseRupiahToNumber(event.target?.value || '')
    if (form.value.siteInvestMaterials && form.value.siteInvestMaterials[index]) {
        form.value.siteInvestMaterials[index].price = Math.round(numericValue)
        calculateMaterialSubtotal(index)
    }
}

const updateServicePriceFromInput = (index, event) => {
    const numericValue = parseRupiahToNumber(event.target?.value || '')
    if (form.value.siteInvestServices && form.value.siteInvestServices[index]) {
        form.value.siteInvestServices[index].price = Math.round(numericValue)
        calculateServiceSubtotal(index)
    }
}

const updateDidPriceFromInput = (index, event) => {
    const numericValue = parseRupiahToNumber(event.target?.value || '')
    if (form.value.siteInvestDids && form.value.siteInvestDids[index]) {
        form.value.siteInvestDids[index].price = Math.round(numericValue)
        calculateDidSubtotal(index)
    }
}

const getPriorityBadge = (priority) => {
    switch (priority) {
        case 'low': return { text: 'Low', class: 'badge rounded-pill bg-label-info' }
        case 'medium': return { text: 'Medium', class: 'badge rounded-pill bg-label-warning' }
        case 'high': return { text: 'High', class: 'badge rounded-pill bg-label-danger' }
        default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
    }
}

function getPriorityBadgeClass(priority) {
    return getPriorityBadge(priority).class
}

function getPriorityBadgeText(priority) {
    return getPriorityBadge(priority).text
}

function getStatusBadgeClass(data) {
    return getStatusBadge(data).class
}

function getStatusBadgeText(data) {
    return getStatusBadge(data).text
}

const clearDateFilters = () => {
    filters.value.startDate = null
    filters.value.endDate = null
    siteInvestStore.setFilters(filters.value)
}

const onDateChange = () => {
    siteInvestStore.setFilters(filters.value)
}

definePageMeta({
    layout: 'default',
    middleware: ['auth', 'check-permission'],
    title: 'Site Investment',
    description: 'Site Investment Management',
    keywords: 'Site Investment, Sales, Sinergi Innovate Pratama',
    author: 'Sinergi Innovate Pratama',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
/* Dropdown Actions table: tampil di atas agar tidak tertutup overflow */
:deep(.si-actions-dropdown) {
    z-index: 1100 !important;
}

.repeater-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e9ecef;
    transition: all 0.2s ease-in-out;
}

.attachment-preview {
    display: block;
    cursor: pointer;
}

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

/* Total Investment Summary */
.investment-summary-card {
    background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
    border: 1px solid #e0e7ff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.06);
}

.investment-summary-title {
    margin: 0;
    padding: 14px 18px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #4f46e5;
    background: rgba(99, 102, 241, 0.08);
    border-bottom: 1px solid #e0e7ff;
}

.investment-summary-body {
    padding: 16px 18px 18px;
}

.investment-summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 0.9rem;
}

.investment-summary-label {
    color: #64748b;
    font-weight: 500;
}

.investment-summary-value {
    font-weight: 600;
    color: #1e293b;
    font-variant-numeric: tabular-nums;
    text-align: right;
}

.investment-summary-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e0e7ff, transparent);
    margin: 10px 0;
}

.investment-summary-row-total .investment-summary-value {
    font-weight: 700;
    color: #4f46e5;
}

.investment-summary-row-grand {
    padding-top: 12px;
    margin-top: 2px;
}

.investment-summary-row-grand .investment-summary-label {
    font-size: 1rem;
    font-weight: 700;
    color: #334155;
}

.investment-summary-row-grand .investment-summary-value {
    font-size: 1.15rem;
    font-weight: 800;
    color: #4f46e5;
}

.si-add-button {
    flex: 0 0 auto;
    white-space: nowrap;
}

@media (max-width: 767.98px) {
    .si-reset-filter-btn {
        width: 100%;
    }
}
</style>
