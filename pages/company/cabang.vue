<template>
    <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-pt-10">
            <h4 class="mb-1">List Cabang</h4>
            <p class="mb-6">List cabang yang terdaftar di sistem</p>

            <ListPageStatsCards :items="statItems" :loading="loadingStats" />

            <CollapsibleFilterCard
                title="Filter Cabang"
                :has-active-filters="hasActiveFilters"
                @reset="resetFilters"
            >
                <FilterFieldsRow :columns="1">
                    <FilterField>
                        <label class="form-label">Perusahaan</label>
                        <select class="form-select w-100" v-model="filterPerusahaanId" @change="applyPerusahaanFilter">
                            <option value="">Semua Perusahaan</option>
                            <option v-for="p in (perusahaans || [])" :key="p.id" :value="p.id">{{ p.nmPerusahaan }}</option>
                        </select>
                    </FilterField>
                </FilterFieldsRow>
            </CollapsibleFilterCard>

            <div class="card">
                <ListPageTableHeader
                    :rows="Number(params.rows)"
                    :rows-options="[5, 10, 20, 50]"
                    :search="globalFilterValue"
                    search-placeholder="Cari cabang..."
                    :show-export="false"
                    @update:rows="handleRowsChange"
                    @update:search="(v) => { globalFilterValue = v }"
                >
                    <template #add>
                        <button
                            v-if="userHasRole('superadmin') || userHasPermission('create_cabang')"
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="cabangStore.openModal()"
                        >
                            <i class="ri-add-line me-1"></i> Tambah Cabang
                        </button>
                    </template>
                </ListPageTableHeader>
                <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable 
                    ref="myDataTableRef"
                    :data="cabangs" 
                    :rows="params.rows" 
                    :loading="loading"
                    :totalRecords="totalRecords"
                    :first="tableFirst"
                    :lazy="true"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                >
                            <Column header="#" :sortable="false">
                                <template #body="slotProps">
                                    {{ tableFirst + (Number(slotProps.index) || 0) + 1 }}
                                </template>
                            </Column>
                            <Column field="kodeCabang" header="Kode Cabang" :sortable="true"></Column>
                            <Column field="nmCabang" header="Nama Cabang" :sortable="true"></Column>
                            <Column field="alamatCabang" header="Alamat" :sortable="true"></Column>
                            <Column header="Perusahaan" :sortable="true" field="perusahaan.nmPerusahaan">
                                <template #body="slotProps">
                                    {{ slotProps.data.perusahaan?.nmPerusahaan || '-' }}
                                </template>
                            </Column>
                            <Column header="Actions" :exportable="false" style="min-width:8rem">
                                <template #body="slotProps">
                                    <div class="d-inline-block">
                                        <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li v-if="userHasRole('superadmin') || userHasPermission('edit_cabang')">
                                                <a class="dropdown-item" href="javascript:void(0)" @click="cabangStore.openModal(slotProps.data, 'admin')">
                                                    <i class="ri-edit-box-line me-2"></i> Edit
                                                </a>
                                            </li>
                                            <li v-if="userHasRole('superadmin') || userHasPermission('delete_cabang')">
                                                <a class="dropdown-item text-danger" href="javascript:void(0)" @click="cabangStore.deleteCabang(slotProps.data.id)">
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
                id="CabangModal"
                :title="modalTitle"
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <form @submit.prevent="handleSubmit">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="kodeCabang" 
                                    v-model="form.kodeCabang" 
                                    placeholder="Masukkan kode cabang"
                                    
                                >
                                <label for="kodeCabang">Kode Cabang</label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    id="nmCabang" 
                                    v-model="form.nmCabang" 
                                    placeholder="Masukkan nama cabang"
                                    
                                >
                                <label for="nmCabang">Nama Cabang</label>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-floating form-floating-outline">
                                <textarea 
                                    class="form-control h-100" 
                                    id="alamatCabang" 
                                    v-model="form.alamatCabang" 
                                    placeholder="Masukkan alamat lengkap"
                                    rows="4"
                                ></textarea>
                                <label for="alamatCabang">Alamat</label>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="form-floating form-floating-outline">
                                <select id="perusahaanId" class="form-select" v-model="form.perusahaanId"  :disabled="!perusahaans || perusahaans.length === 0">
                                    <option value="" disabled>
                                        {{ !perusahaans || perusahaans.length === 0 ? 'Loading perusahaan...' : 'Pilih Perusahaan' }}
                                    </option>
                                    <option v-for="perusahaan in (perusahaans || [])" :key="perusahaan.id" :value="perusahaan.id">
                                        {{ perusahaan.nmPerusahaan }}
                                    </option>
                                </select>
                                <label for="perusahaanId">Perusahaan</label>
                                <small v-if="!perusahaans || perusahaans.length === 0" class="text-muted">
                                    Sedang memuat data perusahaan...
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer mt-6">
                        <button type="button" class="btn btn-outline-secondary" @click="cabangStore.closeModal()">Tutup</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
         <!-- / Content -->
         <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCabangStore } from '~/stores/cabang'
import { usePerusahaanStore } from '~/stores/perusahaan'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Column from 'primevue/column'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CollapsibleFilterCard from '~/components/list/CollapsibleFilterCard.vue'
import FilterFieldsRow from '~/components/list/FilterFieldsRow.vue'
import FilterField from '~/components/list/FilterField.vue'
import Swal from 'sweetalert2'
import { useDebounceFn } from '@vueuse/core'
import { useUserStore } from '~/stores/user'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setListTitle } = useDynamicTitle()
const cabangStore = useCabangStore()
const perusahaanStore = usePerusahaanStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()
const { userHasPermission, userHasRole } = usePermissions()

const { cabangs, loading, loadingStats, totalRecords, statistics, params, form, isEditMode, showModal, validationErrors } = storeToRefs(cabangStore)
const { perusahaans } = storeToRefs(perusahaanStore)

const myDataTableRef = ref(null)
const globalFilterValue = ref('')
const filterPerusahaanId = ref('')

const hasActiveFilters = computed(() => filterPerusahaanId.value !== '' && filterPerusahaanId.value != null)

const tableFirst = computed(() => {
  const page = Number(params.value.page) || 1
  const rows = Number(params.value.rows) || 10
  return (page - 1) * rows
})

const statItems = computed(() => [
  { key: 'total', label: 'Total', value: statistics.value.total, icon: 'ri-building-2-line', iconBgClass: 'bg-label-primary', subtitle: 'Semua cabang' },
  { key: 'perusahaan', label: 'Perusahaan', value: statistics.value.perusahaanCount, icon: 'ri-community-line', iconBgClass: 'bg-label-info' },
  { key: 'withAlamat', label: 'Dengan Alamat', value: statistics.value.withAlamat, icon: 'ri-map-pin-line', iconBgClass: 'bg-label-success', valueClass: 'text-success' },
])

const modalTitle = computed(() => isEditMode.value ? 'Edit Cabang' : 'Tambah Cabang')
const modalDescription = computed(() => isEditMode.value ? 'Ubah detail cabang baru di bawah ini.' : 'Isi detail cabang baru di bawah ini.')

const applyPerusahaanFilter = () => {
  const v = filterPerusahaanId.value
  cabangStore.setPerusahaanId(v === '' ? '' : Number(v))
}

const resetFilters = () => {
  filterPerusahaanId.value = ''
  applyPerusahaanFilter()
}

const modalInstance = ref(null)

onMounted(() => {
  filterPerusahaanId.value = params.value.perusahaanId === '' || params.value.perusahaanId == null ? '' : params.value.perusahaanId
  Promise.all([
    cabangStore.fetchCabangs(),
    cabangStore.fetchStatistics(),
    perusahaanStore.fetchPerusahaans(),
    permissionStore.fetchPermissions(),
    userStore.loadUser(),
  ]).then(() => {
    setListTitle('Cabang', totalRecords.value)
  }).catch((error) => {
    console.error('Error during initialization:', error)
    setListTitle('Cabang', 0)
  })

  const modalElement = document.getElementById('CabangModal')
  if (modalElement) modalInstance.value = new bootstrap.Modal(modalElement)
})

watch(showModal, (newValue) => {
  if (newValue) modalInstance.value?.show()
  else modalInstance.value?.hide()
})

const handleSubmit = async () => {
  const toast = useToast()
  try {
    if (!form.value.perusahaanId) {
      toast.error({ title: 'Error', message: 'Pilih perusahaan terlebih dahulu', color: 'red', position: 'bottomRight', layout: 2 })
      return
    }
    if (!form.value.kodeCabang || !form.value.nmCabang || !form.value.alamatCabang) {
      toast.error({ title: 'Error', message: 'Semua field wajib diisi', color: 'red', position: 'bottomRight', layout: 2 })
      return
    }
    if (isEditMode.value) await cabangStore.updateCabang()
    else await cabangStore.createCabang()
  } catch (error) {
    toast.error({ title: 'Error', message: error.message || 'Terjadi kesalahan saat menyimpan data', color: 'red', position: 'bottomRight', layout: 2 })
  }
}

const onPage = (event) => {
  params.value.page = event.page + 1
  params.value.rows = event.rows
  cabangStore.fetchCabangs()
}

const onSort = (event) => {
  params.value.sortField = event.sortField
  params.value.sortOrder = event.sortOrder
  cabangStore.fetchCabangs()
}

const handleRowsChange = (value) => {
  params.value.rows = Number(value) || 10
  params.value.page = 1
  cabangStore.fetchCabangs()
}

const debouncedSearch = useDebounceFn(() => {
  cabangStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, () => { debouncedSearch() })

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Cabang',
  description: 'Branch Management',
  keywords: 'Cabang, Branch, Company, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
})
</script>

<style scoped>
@media (max-width: 768px) {
  .card-body { padding: 16px; }
  .form-label { font-size: 13px; margin-bottom: 6px; }
}
</style>
