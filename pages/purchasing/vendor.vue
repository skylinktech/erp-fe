<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">List vendor yang terdaftar di sistem</p>

            <ListPageStatsCards :items="statItems" :loading="loadingStats" />

            <div class="card">
                <ListPageTableHeader
                    :rows="Number(params.rows)"
                    :rows-options="rowsPerPageOptionsArray"
                    :search="globalFilterValue"
                    search-placeholder="Cari vendor..."
                    :export-disabled="loading"
                    :export-items="[
                        { value: 'csv', label: 'CSV' },
                        { value: 'pdf', label: 'PDF' },
                    ]"
                    @update:rows="handleRowsChange"
                    @update:search="(v) => { globalFilterValue = v }"
                    @export="exportData"
                >
                    <template #add>
                        <button
                            v-if="userHasRole('superadmin') || userHasPermission('create_vendor')"
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="vendorStore.openModal()"
                        >
                            <i class="ri-add-line me-1"></i> Tambah Vendor
                        </button>
                    </template>
                </ListPageTableHeader>
                <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable 
                    ref="myDataTableRef"
                    :data="vendors" 
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
                                <Column field="logo" header="Logo" :sortable="false">
                                    <template #body="slotProps">
                                        <div v-if="slotProps.data.logo">
                                            <img 
                                                :src="getVendorLogo(slotProps.data.logo)" 
                                                alt="Logo Vendor" 
                                                style="height: 40px; max-width: 80px; object-fit: contain;" 
                                                @error="(e) => handleImageError(e, '/img/default-vendor-logo.png')"
                                            />
                                        </div>
                                        <div v-else>
                                            <img 
                                                src="/img/default-vendor-logo.png" 
                                                alt="Default Logo" 
                                                style="height: 40px; max-width: 80px; object-fit: contain;"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <Column field="name" header="Nama Vendor" :sortable="true"></Column>
                                <Column field="address" header="Alamat Vendor" :sortable="true"></Column>
                                <Column field="npwp" header="NPWP Vendor" :sortable="true"></Column>
                                <Column field="email" header="Email Vendor" :sortable="true"></Column>
                                <Column field="phone" header="Phone Vendor" :sortable="true"></Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <button v-if="userHasRole('superadmin') || userHasPermission('edit_vendor')" @click="vendorStore.openModal(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2"><i class="ri-edit-box-line ri-20px"></i></button>
                                        <button v-if="userHasRole('superadmin') || userHasPermission('delete_vendor')" @click="vendorStore.deleteVendor(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon"><i class="ri-delete-bin-7-line ri-20px"></i></button>
                                    </template>
                                </Column>
                        </MyDataTable>
                </div>
            </div>

            <Modal 
                id="VendorModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="onSubmitVendor">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="file" 
                                        class="form-control" 
                                        @change="onLogoChange"
                                        accept="image/*"
                                    >
                                    <label>Logo Vendor</label>
                                    
                                    <div v-if="form.logoPreview" class="mt-2">
                                        <img 
                                            :src="form.logoPreview" 
                                            alt="Logo Preview" 
                                            class="logo-preview"
                                            style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;"
                                            @error="(e) => handleImageError(e, '/img/default-vendor-logo.png')"
                                        />
                                        <a :href="form.logoPreview" target="_blank" rel="noopener noreferrer" class="d-block mt-1">Lihat Logo</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.name" 
                                        placeholder="Masukkan nama vendor"
                                        
                                    >
                                    <label>Nama Vendor <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="email" 
                                        class="form-control" 
                                        v-model="form.email" 
                                        placeholder="Masukkan email vendor"
                                        
                                    >
                                    <label>Email Vendor <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.phone" 
                                    placeholder="Masukkan no. telp vendor"
                                    
                                    >
                                    <label>No. Telp Vendor <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.npwp" 
                                    placeholder="Masukkan npwp vendor"
                                    >
                                    <label>NPWP Vendor</label>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <textarea
                                        class="form-control h-px-100"
                                        placeholder="Alamat Vendor"
                                        v-model="form.address">
                                    </textarea>
                                    <label>Alamat Vendor <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                             <button type="button" class="btn btn-outline-secondary" @click="vendorStore.closeModal()">Tutup</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Simpan
                            </button>
                        </div>
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
import { storeToRefs } from 'pinia'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useVendorStore } from '~/stores/vendor'
import Column from 'primevue/column'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useUserStore } from '~/stores/user'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'

const { setListTitle } = useDynamicTitle()
const { getVendorLogo, handleImageError } = useImageUrl()
const { userHasPermission, userHasRole } = usePermissions()

const vendorStore = useVendorStore()
const { vendors, loading, loadingStats, totalRecords, statistics, params, form, isEditMode, showModal, validationErrors } = storeToRefs(vendorStore)
const permissionStore = usePermissionsStore()
const userStore = useUserStore()

const myDataTableRef = ref(null)
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statItems = computed(() => [
  { key: 'total', label: 'Total', value: statistics.value.total, icon: 'ri-store-2-line', iconBgClass: 'bg-label-primary', subtitle: 'Semua vendor' },
  { key: 'withEmail', label: 'Dengan Email', value: statistics.value.withEmail, icon: 'ri-mail-line', iconBgClass: 'bg-label-info' },
  { key: 'withNpwp', label: 'NPWP', value: statistics.value.withNpwp, icon: 'ri-file-text-line', iconBgClass: 'bg-label-success', valueClass: 'text-success' },
  { key: 'withPhone', label: 'Phone', value: statistics.value.withPhone, icon: 'ri-phone-line', iconBgClass: 'bg-label-warning' },
])

const modalTitle = computed(() => isEditMode.value ? 'Edit Vendor' : 'Tambah Vendor')
const modalDescription = computed(() => isEditMode.value ? 'Ubah detail vendor.' : 'Isi untuk menambah vendor baru.')

let modalInstance = null
onMounted(() => {
  permissionStore.fetchPermissions()
  userStore.loadUser()
  Promise.all([vendorStore.fetchVendors(), vendorStore.fetchStatistics()])
  setListTitle('Vendor', totalRecords.value)
  const modalElement = document.getElementById('VendorModal')
  if (modalElement) modalInstance = new bootstrap.Modal(modalElement)
})

watch(showModal, (newValue) => {
  if (newValue) modalInstance?.show()
  else modalInstance?.hide()
})

const debouncedSearch = useDebounceFn(() => {
  vendorStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => vendorStore.setPagination(event)
const handleRowsChange = (value) => {
  params.value.rows = Number(value) || 10
  params.value.first = 0
  vendorStore.fetchVendors()
}
const onSort = (event) => vendorStore.setSort(event)

const exportData = (format) => {
  if (format === 'csv') myDataTableRef.value.exportCSV()
}

function isEmptyVendorField(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

function onSubmitVendor() {
  const toast = useToast()
  const f = form.value
  if (isEmptyVendorField(f.name)) {
    toast.error({ title: 'Validasi', message: 'Nama Vendor wajib diisi.', color: 'red' })
    return
  }
  if (isEmptyVendorField(f.email)) {
    toast.error({ title: 'Validasi', message: 'Email Vendor wajib diisi.', color: 'red' })
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.email).trim())) {
    toast.error({ title: 'Validasi', message: 'Email harus menggunakan format email yang valid.', color: 'red' })
    return
  }
  if (isEmptyVendorField(f.phone)) {
    toast.error({ title: 'Validasi', message: 'No. Telp Vendor wajib diisi.', color: 'red' })
    return
  }
  if (isEmptyVendorField(f.address)) {
    toast.error({ title: 'Validasi', message: 'Alamat Vendor wajib diisi.', color: 'red' })
    return
  }
  vendorStore.saveVendor()
}

function onLogoChange(e) {
  const file = e.target.files[0]
  if (file) vendorStore.handleLogoChange(file)
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Vendor',
  description: 'Vendor Management',
  keywords: 'Vendor, Purchasing, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
.logo-preview { transition: all 0.3s ease; }
.logo-preview:hover { transform: scale(1.05); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
</style>
