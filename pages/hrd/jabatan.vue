<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-pt-12">
            <h4 class="mb-1">List Jabatan</h4>
            <p class="mb-6">
            List jabatan yang terdaftar di sistem
            </p>
            <div class="row g-6 mb-6">
                <div v-if="stats.total !== undefined" class="col-xl col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Total Jabatan</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-primary"><i class="ri-briefcase-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.total }}</h5>
                                <span class="text-muted">Jabatan terdaftar</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.direktur_utama !== undefined" class="col-xl col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Direktur Utama</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-success"><i class="ri-user-star-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.direktur_utama }}</h5>
                                <span class="text-muted">Pegawai</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.direktur_keuangan !== undefined" class="col-xl col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Direktur Keuangan</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-info"><i class="ri-funds-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.direktur_keuangan }}</h5>
                                <span class="text-muted">Pegawai</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.direktur_operasional !== undefined" class="col-xl col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">Direktur Operasional</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-warning"><i class="ri-settings-3-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.direktur_operasional }}</h5>
                                <span class="text-muted">Pegawai</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="stats.general_manager !== undefined" class="col-xl col-lg-6 col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <p class="mb-0">General Manager</p>
                                <div class="avatar">
                                    <span class="avatar-initial rounded bg-label-secondary"><i class="ri-team-line"></i></span>
                                </div>
                            </div>
                            <div class="account-heading">
                                <h5 class="mb-1">{{ stats.general_manager }}</h5>
                                <span class="text-muted">Pegawai</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Data Jabatan</h4>
                    <p class="mb-0">Kelola daftar jabatan dan penempatan pegawai.</p>
                </div>
                <div class="col-12">
                    <!-- jabatan Table -->
                    <div class="card">
                        <ListPageTableHeader
                            :rows="Number(params.rows)"
                            :rows-options="rowsPerPageOptionsArray"
                            :search="globalFilterValue"
                            search-placeholder="Cari Jabatan..."
                            :export-disabled="loading"
                            @update:rows="onJabatanToolbarRows"
                            @update:search="(v) => { globalFilterValue = v }"
                            @export="exportData"
                        >
                            <template #add>
                                <button
                                    v-if="userHasRole('superadmin') || userHasPermission('create_jabatan')"
                                    type="button"
                                    class="btn btn-primary"
                                    @click="jabatanStore.openModal()"
                                >
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Jabatan
                                </button>
                            </template>
                        </ListPageTableHeader>
                        <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="jabatans" 
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
                            <Column field="nmJabatan" header="Nama Jabatan" :sortable="true"></Column>
                            <Column header="Actions" :exportable="false" style="min-width:8rem">
                                <template #body="slotProps">
                                    <div class="d-inline-block">
                                        <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li v-if="userHasRole('superadmin') || userHasPermission('edit_jabatan')">
                                                <a class="dropdown-item" href="javascript:void(0)" @click="jabatanStore.openModal(slotProps.data, 'admin')">
                                                    <i class="ri-edit-box-line me-2"></i> Edit
                                                </a>
                                            </li>
                                            <li v-if="userHasRole('superadmin') || userHasPermission('delete_jabatan')">
                                                <a class="dropdown-item text-danger" href="javascript:void(0)" @click="jabatanStore.deleteJabatan(slotProps.data.id)">
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
                    <!--/ jabatan Table -->
                </div>
            </div>
            <!--/ jabatan cards -->

            <!-- Placeholder untuk JabatanModal component -->
            <Modal 
                id="JabatanModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="jabatanStore.saveJabatan()">
                        <div class="row g-6">
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="name" 
                                        v-model="form.nmJabatan" 
                                        placeholder="Masukkan nama jabatan"
                                        
                                    >
                                    <label for="name">Nama Jabatan</label>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mt-6">
                                <button type="button" class="btn btn-outline-secondary me-2" @click="jabatanStore.closeModal()">Tutup</button>
                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                    :disabled="loading"
                                >
                                    <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    {{ isEditMode ? 'Update' : 'Simpan' }}
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
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { useJabatanStore } from '~/stores/jabatan'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import Column from 'primevue/column'
import { useDebounceFn } from '@vueuse/core'
import { useUserStore } from '~/stores/user'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const myDataTableRef = ref(null)
const jabatanStore = useJabatanStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()
const { userHasPermission, userHasRole } = usePermissions();

const { jabatans, loading, stats, totalRecords, params, form, isEditMode, showModal, validationErrors } = storeToRefs(jabatanStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

const modalTitle = computed(() => isEditMode.value ? 'Edit Jabatan' : 'Tambah Jabatan');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data jabatan di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan jabatan baru.');

let modalInstance = null
onMounted(() => {
    jabatanStore.fetchJabatans();
    jabatanStore.fetchStats();
    permissionStore.fetchPermissions()
    userStore.loadUser()

    const modalElement = document.getElementById('JabatanModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Jabatan', jabatans.value.length)
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const debouncedSearch = useDebounceFn(() => {
    jabatanStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch);

const onPage = (event) => jabatanStore.setPagination(event);

const handleRowsChange = () => {
    params.value.first = 0;
    jabatanStore.fetchJabatans();
};

const onJabatanToolbarRows = (v) => {
    params.value.rows = Number(v) || 10;
    handleRowsChange();
};

const onSort = (event) => jabatanStore.setSort(event);

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
            position: 'topRight',
            layout: 2,
        });
    }
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Jabatan',
  description: 'Position Management',
  keywords: 'Jabatan, Position, HRD, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

</script>