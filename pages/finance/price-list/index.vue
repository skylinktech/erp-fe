<template>
    <div class="page-wrapper">
        <div class="content-wrapper">
            <!-- Content -->
            <div v-if="loading" class="text-center py-8">
                <ProgressSpinner 
                    style="width: 50px; height: 50px" 
                    strokeWidth="4"
                    fill="transparent"
                    animationDuration="1s"
                />
                <div class="mt-3 text-muted">Memuat data...</div>
            </div>
            <div v-else class="container-xxl flex-grow-1 container-p-y">
                <div>
                    <h4 class="mb-1">List Price List</h4>
                    <p class="mb-6">
                        Daftar harga produk, service, dan DID berdasarkan tipe dan periode
                    </p>
                    <div class="row g-6 mb-6">
                        <!-- Add Price List Card -->
                        <div class="col-12">
                            <div class="card h-100">
                                <div class="row h-100">
                                    <div class="col-sm-2">
                                        <div class="d-flex align-items-end h-100 justify-content-center">
                                            <i class="ri-price-tag-3-line text-primary" style="font-size: 3rem;"></i>
                                        </div>
                                    </div>
                                    <div class="col-sm-10">
                                        <div class="card-body text-sm-end text-center ps-sm-0">
                                            <button v-if="userHasRole('superadmin') || userHasPermission('create_price_list')"
                                                @click="priceListStore.openModal()"
                                                class="btn btn-primary mb-2 text-nowrap add-new-role"
                                            >
                                                Tambah Price List
                                            </button>
                                            <p class="mb-0 mt-1">Buat price list baru untuk mengatur harga produk, service, dan DID</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-6">
                        <div class="col-12">
                            <!-- Price List Table -->
                            <div class="card">
                                <div class="card-header">
                                    <div class="table-controls-custom">
                                        <!-- Desktop -->
                                        <div class="d-none d-md-flex justify-content-between align-items-center">
                                            <div class="d-flex align-items-center">
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
                                                <Dropdown 
                                                    v-model="tableControls.typeFilter" 
                                                    :options="typeOptions" 
                                                    @change="handleTypeChange" 
                                                    placeholder="Semua Tipe" 
                                                    style="width: 12rem;"
                                                    :showClear="true"
                                                />
                                                <Dropdown 
                                                    v-model="tableControls.activeFilter" 
                                                    :options="activeOptions" 
                                                    @change="handleActiveChange" 
                                                    placeholder="Semua Status" 
                                                    style="width: 12rem;"
                                                    :showClear="true"
                                                />
                                                <InputText
                                                    v-model="tableControls.search"
                                                    placeholder="Cari price list..."
                                                    style="width: 20rem;"
                                                    @input="(e) => handleSearch(e.target.value)"
                                                />
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
                                                <Dropdown 
                                                    v-model="tableControls.typeFilter" 
                                                    :options="typeOptions" 
                                                    @change="handleTypeChange" 
                                                    placeholder="Semua Tipe" 
                                                    class="w-100"
                                                    :showClear="true"
                                                />
                                            </div>
                                            <div class="mb-3">
                                                <Dropdown 
                                                    v-model="tableControls.activeFilter" 
                                                    :options="activeOptions" 
                                                    @change="handleActiveChange" 
                                                    placeholder="Semua Status" 
                                                    class="w-100"
                                                    :showClear="true"
                                                />
                                            </div>
                                            <div class="mb-3">
                                                <InputText
                                                    v-model="tableControls.search"
                                                    placeholder="Cari price list..."
                                                    class="w-100"
                                                    @input="(e) => handleSearch(e.target.value)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-datatable table-responsive py-3 px-3">
                                    <MyDataTable 
                                        ref="myDataTableRef"
                                        :data="priceLists" 
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
                                        <Column field="name" header="Nama" :sortable="true" class="text-nowrap">
                                            <template #body="slotProps">
                                                <a 
                                                    @click="navigateTo(`/finance/price-list/detail/${slotProps.data.id}`)" 
                                                    style="cursor: pointer; color: #666bff; text-decoration: underline;"
                                                    title="View detail"
                                                    class="text-primary"
                                                >
                                                    {{ slotProps.data.name || '-' }}
                                                </a>
                                            </template>
                                        </Column>
                                        <Column field="type" header="Tipe" :sortable="true">
                                            <template #body="slotProps">
                                                <span class="badge" :class="getTypeBadgeClass(slotProps.data.type)">
                                                    {{ getTypeLabel(slotProps.data.type) }}
                                                </span>
                                            </template>
                                        </Column>
                                        <Column field="isActive" header="Status" :sortable="true">
                                            <template #body="slotProps">
                                                <span class="badge" :class="slotProps.data.isActive ? 'bg-success' : 'bg-secondary'">
                                                    {{ slotProps.data.isActive ? 'Aktif' : 'Nonaktif' }}
                                                </span>
                                            </template>
                                        </Column>
                                        <Column field="validFrom" header="Berlaku Dari" :sortable="true">
                                            <template #body="slotProps">
                                                {{ formatDate(slotProps.data.validFrom) }}
                                            </template>
                                        </Column>
                                        <Column field="validTo" header="Berlaku Sampai" :sortable="true">
                                            <template #body="slotProps">
                                                {{ slotProps.data.validTo ? formatDate(slotProps.data.validTo) : 'Tidak terbatas' }}
                                            </template>
                                        </Column>
                                        <Column field="createdAt" header="Dibuat" :sortable="true">
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
                                                        <li v-if="userHasRole('superadmin') || userHasPermission('show_price_list')">
                                                            <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/finance/price-list/detail/${slotProps.data.id}`)">
                                                                <i class="ri-eye-line me-2"></i> Lihat Detail
                                                            </a>
                                                        </li>
                                                        <li v-if="userHasRole('superadmin') || userHasPermission('edit_price_list')">
                                                            <a class="dropdown-item" href="javascript:void(0)" @click="editPriceList(slotProps.data)">
                                                                <i class="ri-edit-box-line me-2"></i> Edit
                                                            </a>
                                                        </li>
                                                        <li v-if="userHasRole('superadmin') || userHasPermission('delete_price_list')">
                                                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="priceListStore.deletePriceList(slotProps.data.id)">
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
            
            <!-- Modal untuk Price List -->
            <Modal 
                id="PriceListModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validationErrorsFromParent="validationErrors"
                size="xl"
            >
                <template #default>
                    <form @submit.prevent="priceListStore.savePriceList()">
                        <div class="row">
                            <div class="col">
                                <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item">
                                        <button class="nav-link" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'" type="button">
                                            <i class="ri-price-tag-3-line me-1"></i> Informasi Price List
                                        </button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link" :class="{ active: activeTab === 'lines' }" @click="activeTab = 'lines'" type="button">
                                            <i class="ri-list-check me-1"></i> Item Lines ({{ form.lines.length }})
                                        </button>
                                    </li>
                                </ul>

                                <div class="tab-content pt-4">
                                    <!-- Tab Price List Info -->
                                    <div v-if="activeTab === 'info'" class="tab-pane fade show active" role="tabpanel">
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="text" 
                                                        class="form-control"
                                                        v-model="form.name" 
                                                        placeholder="Nama Price List"
                                                        required
                                                    >
                                                    <label>Nama Price List <span class="text-danger">*</span></label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <select class="form-select" v-model="form.type" required>
                                                        <option value="site_investment">Site Investment</option>
                                                        <option value="walk_in">Walk In</option>
                                                        <option value="promo">Promo</option>
                                                        <option value="starlink">Starlink</option>
                                                        <option value="skylink">Skylink</option>
                                                    </select>
                                                    <label>Tipe <span class="text-danger">*</span></label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="date" 
                                                        class="form-control"
                                                        v-model="form.validFrom" 
                                                        required
                                                    >
                                                    <label>Berlaku Dari <span class="text-danger">*</span></label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating form-floating-outline">
                                                    <input 
                                                        type="date" 
                                                        class="form-control"
                                                        v-model="form.validTo"
                                                        :min="form.validFrom"
                                                    >
                                                    <label>Berlaku Sampai</label>
                                                </div>
                                                <small class="text-muted">Kosongkan jika tidak terbatas</small>
                                            </div>
                                            <div class="col-md-12">
                                                <label class="form-label">Status</label>
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" v-model="form.isActive" id="isActive">
                                                    <label class="form-check-label" for="isActive">
                                                        {{ form.isActive ? 'Aktif' : 'Nonaktif' }}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Lines Tab -->
                                    <div v-if="activeTab === 'lines'" class="tab-pane fade show active">
                                        <div v-if="form.lines.length === 0" class="text-center text-muted py-4">Belum ada item. Klik tombol di bawah untuk menambah.</div>
                                        <div v-for="(line, index) in form.lines" :key="index" class="repeater-item mb-4">
                                            <div class="d-flex justify-content-between align-items-center mb-3">
                                                <span class="text-muted fw-medium">Item #{{ index + 1 }}</span>
                                                <button class="btn btn-sm btn-outline-danger" @click="priceListStore.removeLine(index)" type="button" title="Hapus item">
                                                    <i class="ri-delete-bin-line me-1"></i> Hapus
                                                </button>
                                            </div>

                                            <!-- Baris 1: Tipe, Item, Jenis Harga (grid 3-6-3) -->
                                            <div class="row g-3 align-items-end mb-3">
                                                <div class="col-12 col-sm-4 col-md-3">
                                                    <label class="form-label mb-1">Tipe</label>
                                                    <select 
                                                        class="form-select" 
                                                        v-model="form.lines[index].priceableType"
                                                        @change="handlePriceableTypeChange(index)"
                                                    >
                                                        <option value="product">Produk</option>
                                                        <option value="service">Service</option>
                                                        <option value="did">DID</option>
                                                    </select>
                                                </div>
                                                <div class="col-12 col-sm-4 col-md-6">
                                                    <label class="form-label mb-1">{{ getPriceableLabel(line.priceableType) }}</label>
                                                    <CustomSelect2
                                                        v-model="form.lines[index].priceableId"
                                                        :options="getPriceableOptions(line.priceableType)"
                                                        :get-option-label="(option) => getPriceableOptionLabel(line.priceableType, option)"
                                                        :reduce="(option) => option?.id"
                                                        placeholder="Pilih item"
                                                        searchable
                                                        clearable
                                                    />
                                                </div>
                                                <div class="col-12 col-sm-4 col-md-3">
                                                    <label class="form-label mb-1">Jenis Harga</label>
                                                    <select class="form-select" v-model="form.lines[index].priceType">
                                                        <option v-for="opt in priceTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Baris 2: Billing (full width default), Cycle (muncul jika recurring) -->
                                            <div class="row g-3 align-items-end mb-3">
                                                <div class="col-12" :class="line.billingType === 'recurring' ? 'col-md-6' : 'col-md-12'">
                                                    <label class="form-label mb-1">Billing</label>
                                                    <select 
                                                        class="form-select" 
                                                        v-model="form.lines[index].billingType"
                                                        @change="handleBillingTypeChange(index)"
                                                    >
                                                        <option value="one_time">One Time</option>
                                                        <option value="recurring">Recurring</option>
                                                    </select>
                                                </div>
                                                <div class="col-12 col-md-6" v-if="line.billingType === 'recurring'">
                                                    <label class="form-label mb-1">Cycle</label>
                                                    <select class="form-select" v-model="form.lines[index].billingCycle">
                                                        <option value="monthly">Monthly</option>
                                                        <option value="quarterly">Quarterly</option>
                                                        <option value="semi_annually">Semi-Annually</option>
                                                        <option value="yearly">Yearly</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Baris 3: Qty, Harga, Subtotal (grid 4-4-4, sama lebar) -->
                                            <div class="row g-3 align-items-end mb-3">
                                                <div class="col-6 col-md-3">
                                                    <label class="form-label mb-1">Qty</label>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        class="form-control" 
                                                        v-model.number="form.lines[index].quantity"
                                                        @input="updateLineSubtotal(index)" 
                                                    />
                                                </div>
                                                <div class="col-6 col-md-3">
                                                    <label class="form-label mb-1">Harga</label>
                                                    <input
                                                        type="text"
                                                        class="form-control"
                                                        :value="formatRupiah(line.price)"
                                                        @input="(e) => handlePriceInput(index, e.target.value)"
                                                        :disabled="line.priceableType === 'service'"
                                                        placeholder="0"
                                                    />
                                                </div><div class="col-6 col-md-3">
                                                    <label class="form-label mb-1">Terminal Kit Count</label>
                                                    <input 
                                                        type="text"
                                                        class="form-control" 
                                                        :value="formatRupiah(line.terminalKitCount)"
                                                        @input="(e) => handleTerminalKitCountInput(index, e.target.value)"
                                                        :disabled="line.priceableType === 'product'"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div class="col-6 col-md-3">
                                                    <label class="form-label mb-1">Quota Priority</label>
                                                    <input 
                                                        type="text"
                                                        class="form-control" 
                                                        :value="formatRupiah(line.quotaPriority)"
                                                        @input="(e) => handleQuotaPriorityInput(index, e.target.value)"
                                                        :disabled="line.priceableType === 'product'"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>

                                            <!-- Baris 4: Terminal Kit, Quota Priority, New Service Line, Additional Data (grid 3-3-3-3) -->
                                            <div class="row g-3 align-items-end">
                                                <div class="col-6 col-md-3">
                                                    <label class="form-label mb-1">New Service Line</label>
                                                    <input 
                                                        type="text"
                                                        class="form-control" 
                                                        :value="formatRupiah(line.newServiceLine)"
                                                        @input="(e) => handleNewServiceLineInput(index, e.target.value)"
                                                        :disabled="line.priceableType === 'product'"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div class="col-6 col-md-3">
                                                    <label class="form-label mb-1">Additional Data</label>
                                                    <input 
                                                        type="text"
                                                        class="form-control" 
                                                        :value="formatRupiah(line.additionalData)"
                                                        @input="(e) => handleAdditionalDataInput(index, e.target.value)"
                                                        :disabled="line.priceableType === 'product'"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div class="col-12 col-md-6">
                                                    <label class="form-label mb-1">Subtotal</label>
                                                    <input
                                                        type="text"
                                                        class="form-control bg-light"
                                                        :value="formatRupiah(line.subtotal)"
                                                        readonly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mt-3 pt-2 border-top">
                                            <button class="btn btn-primary" type="button" @click="priceListStore.addEmptyLine()">
                                                <i class="ri-add-line me-1"></i> Tambah Item
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="modal-footer mt-4">
                                    <button type="button" class="btn btn-outline-secondary" @click="priceListStore.closeModal()">Tutup</button>
                                    <button type="submit" class="btn btn-primary" :disabled="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </template>
            </Modal>
        </div>
        <div class="content-backdrop fade"></div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceListStore } from '~/stores/price_list'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useFormatRupiah } from '~/composables/formatRupiah'
import Swal from 'sweetalert2'

// Composables
const { setListTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()

const myDataTableRef = ref(null)
const priceListStore = usePriceListStore()

const { priceLists, loading, totalRecords, params, form, isEditMode, showModal, validationErrors } = storeToRefs(priceListStore)

const activeTab = ref('info')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Table controls state
const tableControls = ref({
    rows: 10,
    search: '',
    typeFilter: null,
    activeFilter: null,
})

const typeOptions = ref([
    { label: 'Site Investment', value: 'site_investment' },
    { label: 'Walk In', value: 'walk_in' },
    { label: 'Promo', value: 'promo' },
    { label: 'Starlink', value: 'starlink' },
    { label: 'Skylink', value: 'skylink' },
])

const activeOptions = ref([
    { label: 'Aktif', value: true },
    { label: 'Nonaktif', value: false },
])

const modalTitle = computed(() => isEditMode.value ? 'Edit Price List' : 'Tambah Price List')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data price list di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan price list baru.')

// Options for dropdowns
const productOptions = ref([])
const serviceOptions = ref([])
const didOptions = ref([])

const priceTypeOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Starlink', value: 'starlink' },
    { label: 'Skylink', value: 'skylink' },
    { label: 'Terminal Access Charge', value: 'terminal_access_charge' },
    { label: 'Open Service Line', value: 'open_service_line' },
    { label: 'Additional Data', value: 'additional_data' },
]

// Fetch options
async function fetchProductOptions() {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.product()}?page=1&rows=1000`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
        const json = await res.json()
        productOptions.value = json.data || []
    } catch (e) {
        productOptions.value = []
    }
}

async function fetchServiceOptions() {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.service()}?page=1&rows=500`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
        const json = await res.json()
        serviceOptions.value = json.data || []
    } catch (e) {
        serviceOptions.value = []
    }
}

async function fetchDidOptions() {
    const { $api } = useNuxtApp()
    try {
        const res = await fetch(`${$api.did()}?page=1&rows=500`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
        const json = await res.json()
        didOptions.value = json.data || []
    } catch (e) {
        didOptions.value = []
    }
}

// Helper functions
function getTypeBadgeClass(type) {
    if (type === 'site_investment') return 'bg-primary'
    if (type === 'walk_in') return 'bg-info'
    if (type === 'promo') return 'bg-warning'
    if (type === 'starlink') return 'bg-dark'
    if (type === 'skylink') return 'bg-secondary'
    return 'bg-secondary'
}

function getTypeLabel(type) {
    if (type === 'site_investment') return 'Site Investment'
    if (type === 'walk_in') return 'Walk In'
    if (type === 'promo') return 'Promo'
    if (type === 'starlink') return 'Starlink'
    if (type === 'skylink') return 'Skylink'
    return type
}

function getPriceableLabel(type) {
    if (type === 'product') return 'Produk'
    if (type === 'service') return 'Service'
    if (type === 'did') return 'DID'
    return 'Item'
}

function getPriceableOptions(type) {
    if (type === 'product') return productOptions.value
    if (type === 'service') return serviceOptions.value
    if (type === 'did') return didOptions.value
    return []
}

function getPriceableOptionLabel(type, option) {
    if (!option) return ''
    if (type === 'product') return `${option.name} (${option.sku})`
    if (type === 'service') return `${option.name} (${option.code})`
    if (type === 'did') return `${option.code} - ${option.name}`
    return option.name || ''
}

function handlePriceableTypeChange(index) {
    const line = form.value.lines[index]
    line.priceableId = null
    if (line.priceableType === 'product') {
      line.billingType = 'one_time'
      line.billingCycle = null
    } else if (line.priceableType === 'service') {
      line.billingType = 'recurring'
      line.billingCycle = line.billingCycle || 'monthly'
    }
    updateLineSubtotal(index)
}

function handleBillingTypeChange(index) {
    // Reset billingCycle when billing type changes to one_time
    if (form.value.lines[index].billingType === 'one_time') {
        form.value.lines[index].billingCycle = null
    } else {
        // Set default billing cycle to monthly for recurring
        form.value.lines[index].billingCycle = 'monthly'
    }
}

const parseRupiahToNumber = (rupiahString) => {
    if (!rupiahString) return 0
    return Number(String(rupiahString).replace(/[Rp\s.]/g, '').replace(',', '.')) || 0
}

function handlePriceInput(index, value) {
    form.value.lines[index].price = parseRupiahToNumber(value)
    updateLineSubtotal(index)
}

function handleTerminalKitCountInput(index, value) {
    form.value.lines[index].terminalKitCount = parseRupiahToNumber(value)
    updateLineSubtotal(index)
}

function handleQuotaPriorityInput(index, value) {
    form.value.lines[index].quotaPriority = parseRupiahToNumber(value)
    updateLineSubtotal(index)
}

function handleNewServiceLineInput(index, value) {
    form.value.lines[index].newServiceLine = parseRupiahToNumber(value)
    updateLineSubtotal(index)
}

function handleAdditionalDataInput(index, value) {
    form.value.lines[index].additionalData = parseRupiahToNumber(value)
    updateLineSubtotal(index)
}

function updateLineSubtotal(index) {
    priceListStore.updateLineSubtotal(index)
}

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

// Table event handlers
const onPage = async (event) => {
    priceListStore.params.first = event.first
    priceListStore.params.rows = event.rows
    await priceListStore.fetchPriceLists()
}

const onSort = async (event) => {
    priceListStore.params.sortField = event.sortField
    priceListStore.params.sortOrder = event.sortOrder
    await priceListStore.fetchPriceLists()
}

const handleRowsChange = async () => {
    priceListStore.params.rows = tableControls.value.rows
    priceListStore.params.first = 0
    await priceListStore.fetchPriceLists()
}

const handleSearch = useDebounceFn(async (value) => {
    priceListStore.params.search = value
    priceListStore.params.first = 0
    await priceListStore.fetchPriceLists()
}, 500)

const handleTypeChange = async () => {
    priceListStore.params.type = tableControls.value.typeFilter?.value
    priceListStore.params.first = 0
    await priceListStore.fetchPriceLists()
}

const handleActiveChange = async () => {
    priceListStore.params.isActive = tableControls.value.activeFilter?.value
    priceListStore.params.first = 0
    await priceListStore.fetchPriceLists()
}

// Edit price list
async function editPriceList(priceList) {
    const { $api } = useNuxtApp()
    try {
        loading.value = true
        const res = await fetch(`${$api.priceListShow(priceList.id)}?includeLines=true`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        })
        const json = await res.json()
        priceListStore.openModal(json)
    } catch (e) {
        console.error(e)
        const toast = useToast()
        toast.error({
            title: 'Error',
            message: 'Gagal memuat data price list',
            color: 'red',
            position: 'topRight',
        })
    } finally {
        loading.value = false
    }
}

// Modal instance
let modalInstance = null
watch(showModal, (newValue) => {
    if (newValue) {
        activeTab.value = isEditMode.value ? 'info' : 'lines'
        nextTick(() => {
            const modalElement = document.getElementById('PriceListModal')
            if (modalElement) {
                modalInstance = new window.bootstrap.Modal(modalElement)
                modalInstance.show()
            }
        })
    } else {
        if (modalInstance) {
            modalInstance.hide()
            modalInstance = null
        }
    }
})

// Lifecycle
onMounted(async () => {
    setListTitle('Price List')
    await Promise.all([
        priceListStore.fetchPriceLists(),
        fetchProductOptions(),
        fetchServiceOptions(),
        fetchDidOptions(),
    ])
})
</script>

<style scoped>
.repeater-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e9ecef;
}

.table-controls-custom {
    padding: 1rem;
}
</style>
