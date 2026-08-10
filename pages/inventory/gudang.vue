<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-pt-12">
            <h4 class="mb-1">List Gudang</h4>
            <p class="mb-6">
            List warehouse yang terdaftar di sistem
            </p>
            <div class="row g-6 mb-6">
                <div v-if="stats.total !== undefined" class="col-xl col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Gudang</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary"><i class="ri-store-2-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.total }}</h5>
                                <span class="text-muted">Gudang terdaftar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Data Gudang</h4>
                    <p class="mb-0">Kelola lokasi penyimpanan dan kontak gudang.</p>
                </div>
                <div class="col-12">
                    <!-- warehouse Table -->
                    <div class="card">
                        <ListPageTableHeader
                            :rows="Number(params.rows)"
                            :rows-options="rowsPerPageOptionsArray"
                            :search="globalFilterValue"
                            search-placeholder="Cari Gudang..."
                            :export-disabled="loading"
                            @update:rows="onGudangToolbarRows"
                            @update:search="(v) => { globalFilterValue = v }"
                            @export="exportData"
                        >
                            <template #add>
                                <button
                                    v-if="userHasRole('superadmin') || userHasPermission('create_gudang')"
                                    type="button"
                                    class="btn btn-primary"
                                    @click="warehouseStore.openModal()"
                                >
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Gudang
                                </button>
                            </template>
                        </ListPageTableHeader>
                        <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="warehouses" 
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
                                <Column header="#" :sortable="false">
                                    <template #body="slotProps">
                                        {{ params.first + slotProps.index + 1 }}
                                    </template>
                                </Column>
                                <Column field="code" header="Kode Gudang" :sortable="true"></Column>
                                <Column field="name" header="Nama Gudang" :sortable="true"></Column>
                                <Column field="address" header="Alamat Gudang" :sortable="true"></Column>
                                <Column field="phone" header="No. Telepon Gudang" :sortable="true"></Column>
                                <Column field="email" header="Email Gudang" :sortable="true"></Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <button v-if="userHasRole('superadmin') || userHasPermission('edit_gudang')" @click="warehouseStore.openModal(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2"><i class="ri-edit-box-line"></i></button>
                                        <button v-if="userHasRole('superadmin') || userHasPermission('delete_gudang')" @click="warehouseStore.deleteWarehouse(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon"><i class="ri-delete-bin-7-line"></i></button>
                                    </template>
                                </Column>
                        </MyDataTable>
                        </div>
                    </div>
                    <!--/ warehouse Table -->
                </div>
            </div>
            <!--/ warehouse cards -->

            <!-- Placeholder untuk WarehouseModal component -->
            <Modal 
                id="Modal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="warehouseStore.saveWarehouse()">
                        <div class="row g-6">
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="kodeGudang" 
                                        v-model="form.code" 
                                        placeholder="Masukkan kode gudang"
                                        
                                    >
                                    <label for="kodeGudang">Kode Gudang</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="nmGudang" 
                                        v-model="form.name" 
                                        placeholder="Masukkan nama gudang"
                                        
                                    >
                                    <label for="nmGudang">Nama Gudang</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="email" 
                                        class="form-control" 
                                        id="emailGudang" 
                                        v-model="form.email" 
                                        placeholder="Masukkan email gudang"
                                        
                                    >
                                    <label for="emailGudang">Email Gudang</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="phoneGudang" 
                                        v-model="form.phone" 
                                        placeholder="Masukkan no. telepon gudang"
                                        
                                    >
                                    <label for="phoneGudang">No. Telepon Gudang</label>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <textarea
                                        class="form-control h-px-100"
                                        id="alamatGudang"
                                        placeholder="Masukkan alamat gudang"
                                        v-model="form.address">
                                    </textarea>
                                    <label for="alamatGudang">Alamat Gudang</label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="warehouseStore.closeModal()">Tutup</button>
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
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { useWarehouseStore } from '~/stores/warehouse'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'
import { usePermissionsStore } from '~/stores/permissions'
import { useUserStore } from '~/stores/user'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const { userHasPermission, userHasRole } = usePermissions();

const myDataTableRef = ref(null)
const warehouseStore = useWarehouseStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()
const { warehouses, loading, stats, totalRecords, params, form, isEditMode, showModal, validationErrors } = storeToRefs(warehouseStore)

const globalFilterValue = ref('')

const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);
const modalTitle = computed(() => isEditMode.value ? 'Edit Gudang' : 'Tambah Gudang');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data gudang di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan gudang baru.');

let modalInstance = null
onMounted(() => {
    warehouseStore.fetchWarehouses()
    warehouseStore.fetchStats()
    permissionStore.fetchPermissions()
    userStore.loadUser()

    const modalElement = document.getElementById('Modal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Gudang', warehouses.value.length)
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const debouncedSearch = useDebounceFn(() => {
    warehouseStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

const onPage = (event) => warehouseStore.setPagination(event);

const handleRowsChange = () => {
    params.value.first = 0;
    warehouseStore.fetchWarehouses();
};

const onGudangToolbarRows = (v) => {
    params.value.rows = Number(v) || 10;
    handleRowsChange();
};

const onSort = (event) => warehouseStore.setSort(event);

const exportData = (format) => {
    if (format === 'excel' || format === 'csv') {
        myDataTableRef.value?.exportCSV?.();
        return;
    }
    if (format === 'pdf') {
        useToast().info({
            title: 'Info',
            message: 'Export PDF akan tersedia pada rilis berikutnya.',
            color: 'blue',
            position: 'bottomRight',
            layout: 2,
        });
    }
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Gudang',
  description: 'Warehouse Management',
  keywords: 'Gudang, Warehouse, Inventory, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});
</script>