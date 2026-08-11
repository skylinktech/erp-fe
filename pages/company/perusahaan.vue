<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-pt-10">
            <h4 class="mb-1">List Perusahaan</h4>
            <p class="mb-6">List perusahaan yang terdaftar di sistem</p>

            <ListPageStatsCards :items="statItems" :loading="loadingStats" />

            <div class="card">
                <ListPageTableHeader
                    :rows="Number(params.rows)"
                    :rows-options="rowsPerPageOptionsArray"
                    :search="globalFilterValue"
                    search-placeholder="Cari perusahaan..."
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
                            v-if="userHasRole('superadmin') || userHasPermission('create_perusahaan')"
                            type="button"
                            class="btn btn-primary btn-sm"
                            data-bs-target="#PerusahaanModal"
                            data-bs-toggle="modal"
                            @click="perusahaanStore.openModal()"
                        >
                            <i class="ri-add-line me-1"></i> Tambah Perusahaan
                        </button>
                    </template>
                </ListPageTableHeader>
                <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable 
                    ref="myDataTableRef"
                    :data="perusahaans" 
                    :rows="params.rows" 
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
<Column field="id" header="#" :sortable="true"></Column> 
                                <Column field="logoPerusahaan" header="Logo" :sortable="true">
                                    <template #body="slotProps">
                                        <div v-if="slotProps.data.logoPerusahaan">
                                            <img 
                                                :src="getCompanyLogo(slotProps.data.logoPerusahaan)" 
                                                alt="Logo Perusahaan" 
                                                style="height: 40px; max-width: 80px; object-fit: contain;" 
                                                @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                                            />
                                        </div>
                                        <div v-else>
                                            <img 
                                                src="/img/default-company-logo.png" 
                                                alt="Default Logo" 
                                                style="height: 40px; max-width: 80px; object-fit: contain;"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <Column field="nmPerusahaan" header="Nama Perusahaan" :sortable="true"></Column>
                                <Column field="alamatPerusahaan" header="Alamat Perusahaan" :sortable="true"></Column>
                                <Column field="tlpPerusahaan" header="No. Telp Perusahaan" :sortable="true"></Column>
                                <Column field="emailPerusahaan" header="Email Perusahaan" :sortable="true"></Column>
                                <Column field="npwpPerusahaan" header="NPWP Perusahaan" :sortable="true"></Column>
                                <Column field="namaBankPerusahaan" header="Nama Bank" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.namaBankPerusahaan || slotProps.data.nama_bank_perusahaan || '—' }}
                                    </template>
                                </Column>
                                <Column field="nomorRekeningPerusahaan" header="No. Rekening" :sortable="true">
                                    <template #body="slotProps">
                                        {{ slotProps.data.nomorRekeningPerusahaan || slotProps.data.nomor_rekening_perusahaan || '—' }}
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                <template #body="slotProps">
                                    <div class="d-inline-block">
                                        <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li v-if="userHasRole('superadmin') || userHasPermission('edit_perusahaan')">
                                                <a class="dropdown-item" href="javascript:void(0)" @click="perusahaanStore.openModal(slotProps.data, 'admin')">
                                                    <i class="ri-edit-box-line me-2"></i> Edit
                                                </a>
                                            </li>
                                            <li v-if="userHasRole('superadmin') || userHasPermission('delete_perusahaan')">
                                                <a class="dropdown-item text-danger" href="javascript:void(0)" @click="perusahaanStore.deletePerusahaan(slotProps.data.id)">
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
                id="PerusahaanModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validationErrorsFromParent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="perusahaanStore.savePerusahaan()">
                        <div class="row g-6">
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="file" 
                                        class="form-control" 
                                        id="logoPerusahaan" 
                                        @change="onLogoChange"
                                        accept="image/*"
                                        placeholder="Masukkan logo perusahaan"
                                    >
                                    <label for="logoPerusahaan">Logo Perusahaan</label>
                                    
                                    <div v-if="form.logoPreview" class="mt-2">
                                        <img 
                                            :src="form.logoPreview" 
                                            alt="Logo Preview" 
                                            class="logo-preview"
                                            style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;"
                                            @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
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
                                        id="kodePerusahaan" 
                                        v-model="form.kodePerusahaan" 
                                        placeholder="Masukkan kode perusahaan"
                                        
                                    >
                                    <label for="kodePerusahaan">Kode Perusahaan</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="nmPerusahaan"
                                        v-model="form.nmPerusahaan"
                                        placeholder="Masukkan nama perusahaan"
                                        :class="{ 'is-invalid': hasFieldError('nmPerusahaan') }"
                                    >
                                    <label for="nmPerusahaan">Nama Perusahaan</label>
                                    <div v-if="hasFieldError('nmPerusahaan')" class="invalid-feedback">
                                        {{ getFieldError('nmPerusahaan') }}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="tlpPerusahaan"
                                        v-model="form.tlpPerusahaan"
                                        placeholder="Masukkan no telp perusahaan"
                                    >
                                    <label for="tlpPerusahaan">No. Telp Perusahaan</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input
                                        type="email"
                                        class="form-control"
                                        id="emailPerusahaan"
                                        v-model="form.emailPerusahaan"
                                        placeholder="Masukkan email perusahaan"
                                        :class="{ 'is-invalid': hasFieldError('emailPerusahaan') }"
                                    >
                                    <label for="emailPerusahaan">Email Perusahaan</label>
                                    <div v-if="hasFieldError('emailPerusahaan')" class="invalid-feedback">
                                        {{ getFieldError('emailPerusahaan') }}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                    type="text" 
                                    class="form-control" 
                                    id="npwpPerusahaan" 
                                    v-model="form.npwpPerusahaan" 
                                    placeholder="Masukkan npwp perusahaan"
                                    
                                    >
                                    <label for="npwpPerusahaan">NPWP Perusahaan</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="namaBankPerusahaan"
                                        v-model="form.namaBankPerusahaan"
                                        placeholder="Masukkan nama bank"
                                        maxlength="100"
                                    >
                                    <label for="namaBankPerusahaan">Nama Bank</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="nomorRekeningPerusahaan"
                                        v-model="form.nomorRekeningPerusahaan"
                                        placeholder="Masukkan nomor rekening"
                                        maxlength="50"
                                    >
                                    <label for="nomorRekeningPerusahaan">No. Rekening</label>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <textarea
                                        class="form-control h-px-100"
                                        id="alamatPerusahaan"
                                        placeholder="Alamat Perusahaan"
                                        v-model="form.alamatPerusahaan">
                                    </textarea>
                                    <label for="alamatPerusahaan">Alamat Perusahaan</label>
                                </div>
                            </div>
                            <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="perusahaanStore.closeModal()">Tutup</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Simpan
                            </button>
                        </div>
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
import { usePerusahaanStore } from '~/stores/perusahaan'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import Column from 'primevue/column'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { useDebounceFn } from '@vueuse/core'
import { useUserStore } from '~/stores/user'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'

const { setListTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

const myDataTableRef = ref(null)
const perusahaanStore = usePerusahaanStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()
const { userHasPermission, userHasRole } = usePermissions()

const { perusahaans, loading, loadingStats, totalRecords, statistics, params, form, isEditMode, showModal, validationErrors } = storeToRefs(perusahaanStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statItems = computed(() => [
  { key: 'total', label: 'Total', value: statistics.value.total, icon: 'ri-building-line', iconBgClass: 'bg-label-primary', subtitle: 'Semua perusahaan' },
  { key: 'withCabang', label: 'Dengan Cabang', value: statistics.value.withCabang, icon: 'ri-git-branch-line', iconBgClass: 'bg-label-info' },
  { key: 'withBank', label: 'Dengan Bank', value: statistics.value.withBank, icon: 'ri-bank-line', iconBgClass: 'bg-label-success', valueClass: 'text-success' },
  { key: 'cabangCount', label: 'Total Cabang', value: statistics.value.cabangCount, icon: 'ri-map-pin-line', iconBgClass: 'bg-label-warning' },
])

const modalTitle = computed(() => isEditMode.value ? 'Edit Perusahaan' : 'Tambah Perusahaan')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data perusahaan di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan perusahaan baru.')

let modalInstance = null
onMounted(() => {
  Promise.all([
    perusahaanStore.fetchPerusahaans(),
    perusahaanStore.fetchStatistics(),
    permissionStore.fetchPermissions(),
    userStore.loadUser(),
  ])
  const modalElement = document.getElementById('PerusahaanModal')
  if (modalElement) modalInstance = new bootstrap.Modal(modalElement)
  setListTitle('Perusahaan', totalRecords.value)
})

watch(showModal, (newValue) => {
  if (newValue) modalInstance?.show()
  else modalInstance?.hide()
})

const debouncedSearch = useDebounceFn(() => {
  perusahaanStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => perusahaanStore.setPagination(event)
const handleRowsChange = (value) => {
  params.value.rows = Number(value) || 10
  params.value.first = 0
  perusahaanStore.fetchPerusahaans()
}
const onSort = (event) => perusahaanStore.setSort(event)

const onLogoChange = (e) => {
  const file = e.target.files[0]
  if (file) perusahaanStore.handleLogoChange(file)
}

const exportData = (format) => {
  if (format === 'csv') myDataTableRef.value.exportCSV()
}

const hasFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return false
  return validationErrors.value.some(error => typeof error !== 'string' && (error.field === fieldName || error.rule === fieldName))
}

const getFieldError = (fieldName) => {
  if (!validationErrors.value || !Array.isArray(validationErrors.value)) return ''
  const error = validationErrors.value.find(error => typeof error !== 'string' && (error.field === fieldName || error.rule === fieldName))
  return error ? error.message : ''
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Perusahaan',
  description: 'Company Management',
  keywords: 'Perusahaan, Company, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
.logo-preview { transition: all 0.3s ease; }
.logo-preview:hover { transform: scale(1.05); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
.form-control.is-invalid { border-color: #dc3545; box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25); }
.invalid-feedback { display: block; width: 100%; margin-top: 0.25rem; font-size: 0.875rem; color: #dc3545; }
</style>
