<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">
            List category yang terdaftar di sistem
            </p>
            <ListPageStatsCards :items="statItems" />

            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Data Kategori</h4>
                    <p class="mb-0">Kelola kategori produk dan deskripsinya.</p>
                </div>
                <div class="col-12">
                    <!-- category Table -->
                    <div class="card">
                        <ListPageTableHeader
                            :rows="Number(params.rows)"
                            :rows-options="rowsPerPageOptionsArray"
                            :search="globalFilterValue"
                            search-placeholder="Cari Kategori..."
                            :show-export="false"
                            :export-disabled="loading"
                            @update:rows="onKategoriToolbarRows"
                            @update:search="(v) => { globalFilterValue = v }"
                        >
                            <template #add>
                                <button
                                    v-if="userHasRole('superadmin') || userHasPermission('create_kategori')"
                                    type="button"
                                    class="btn btn-primary"
                                    @click="kategoriStore.openModal()"
                                >
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Kategori
                                </button>
                            </template>
                        </ListPageTableHeader>
                        <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="kategori" 
                            :rows="params.rows" 
                            :loading="loading"
                            :totalRecords="totalRecords"
                            :first="params.first"
                            :lazy="true"
                            @page="onPage($event)"
                            @sort="onSort($event)"
                            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                            >
                                <Column field="id" header="#" :sortable="true"></Column> 
                                <Column field="name" header="Nama Category" :sortable="true"></Column>
                                <Column field="description" header="Deskripsi" :sortable="true"></Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <button v-if="userHasRole('superadmin') || userHasPermission('edit_kategori')" @click="kategoriStore.openModal(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2"><i class="ri-edit-box-line ri-20px"></i></button>
                                        <button v-if="userHasRole('superadmin') || userHasPermission('delete_kategori')" @click="kategoriStore.deleteKategori(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon"><i class="ri-delete-bin-7-line ri-20px"></i></button>
                                    </template>
                                </Column>
                        </MyDataTable>
                        </div>
                    </div>
                    <!--/ category Table -->
                </div>
            </div>
            <!--/ category cards -->

            <!-- Placeholder untuk CategoryModal component -->
            <Modal
                :model-value="showModal"
                @close="kategoriStore.closeModal" 
                id="KategoriModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="kategoriStore.saveKategori()">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.name" 
                                        placeholder="Masukkan nama category"
                                        
                                    >
                                    <label>Nama Category <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.description" 
                                        placeholder="Masukkan deskripsi category"
                                        
                                    >
                                    <label>Deskripsi Category</label>
                                </div>
                            </div>
                        </div>
                         <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="kategoriStore.closeModal()">Tutup</button>
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
import { storeToRefs } from 'pinia';
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { useKategoriStore } from '~/stores/kategori'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useUserStore } from '~/stores/user'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const { userHasPermission, userHasRole } = usePermissions();

const myDataTableRef  = ref(null)
const kategoriStore   = useKategoriStore()
const permissionStore = usePermissionsStore()
const userStore       = useUserStore()
const { kategori, loading, stats, totalRecords, params, form, isEditMode, showModal, validationErrors } = storeToRefs(kategoriStore)

const statItems = computed(() => [
  {
    key: 'total-kategori',
    label: 'Total Kategori',
    value: stats.value.total,
    subtitle: 'Kategori',
    icon: 'ri-folder-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Jumlah Keseluruhan',
      description: 'Jumlah keseluruhan data Kategori yang terdaftar dalam sistem berdasarkan statistik API.',
    },
  },
  {
    key: 'sparepart',
    label: 'Sparepart',
    value: stats.value.sparepart,
    subtitle: 'Produk',
    icon: 'ri-settings-line',
    iconBgClass: 'bg-label-info',
    info: {
      title: 'Sparepart',
      description: 'Ringkasan metrik "Sparepart" pada daftar Kategori berdasarkan data statistik yang disediakan API/store.',
    },
  },
  {
    key: 'oli',
    label: 'Oli',
    value: stats.value.oli,
    subtitle: 'Produk',
    icon: 'ri-oil-line',
    iconBgClass: 'bg-label-warning',
    info: {
      title: 'Oli',
      description: 'Ringkasan metrik "Oli" pada daftar Kategori berdasarkan data statistik yang disediakan API/store.',
    },
  },
  {
    key: 'alat-berat',
    label: 'Alat Berat',
    value: stats.value.alat_berat,
    subtitle: 'Produk',
    icon: 'ri-truck-line',
    iconBgClass: 'bg-label-success',
    info: {
      title: 'Alat Berat',
      description: 'Ringkasan metrik "Alat Berat" pada daftar Kategori berdasarkan data statistik yang disediakan API/store.',
    },
  },
  {
    key: 'tooling',
    label: 'Tooling',
    value: stats.value.tooling,
    subtitle: 'Produk',
    icon: 'ri-tools-line',
    iconBgClass: 'bg-label-secondary',
    info: {
      title: 'Tooling',
      description: 'Ringkasan metrik "Tooling" pada daftar Kategori berdasarkan data statistik yang disediakan API/store.',
    },
  }
])


const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const modalTitle = computed(() => isEditMode.value ? 'Edit Kategori' : 'Tambah Kategori');
const modalDescription = computed(() => isEditMode.value ? 'Ubah detail kategori.' : 'Isi untuk menambah kategori baru.');

onMounted(() => {
    kategoriStore.fetchKategori()
    kategoriStore.fetchStats()
    permissionStore.fetchPermissions()
    userStore.loadUser()
    setListTitle('Kategori', kategori.value.length)
});

const debouncedSearch = useDebounceFn(() => {
    kategoriStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch);


const onPage = (event) => kategoriStore.setPagination(event);

const handleRowsChange = () => {
    params.value.first = 0; // Reset to first page
    kategoriStore.fetchKategori();
};

const onKategoriToolbarRows = (v) => {
    params.value.rows = Number(v) || 10;
    handleRowsChange();
};

const onSort = (event) => kategoriStore.setSort(event);

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Kategori',
  description: 'Category Management',
  keywords: 'Kategori, Category, Inventory, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

</script>