<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            
            <p class="mb-6">
            List divisi yang terdaftar di sistem
            </p>
            <!-- divisi cards -->
            <div class="row g-6 mb-6">
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card h-100">
                        <div class="row h-100">
                            <div class="col-sm-5">
                                <div class="d-flex align-items-end h-100 justify-content-center">
                                    <img src="/img/illustrations/add-new-role-illustration.png" class="img-fluid" alt="Image" width="70">
                                </div>
                            </div>
                            <div class="col-sm-7">
                                <div class="card-body text-sm-end text-center ps-sm-0">
                                    <button v-if="userHasRole('superadmin') || userHasPermission('create_divisi')" @click="divisiStore.openModal()" class="btn btn-primary mb-2 text-nowrap add-new-role">
                                        Tambah Divisi
                                    </button>
                                    <p class="mb-0 mt-1">Buat Divisi baru</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total Divisi</h4>
                    <p class="mb-0">Find all of your company's administrator accounts and their associate Divisi.</p>
                </div>
                <div class="col-12">
                    <!-- divisi Table -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown v-model="params.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="p-input-icon-left">
                                    <i class="ri-search-line"></i>
                                    <InputText v-model="globalFilterValue" placeholder="Cari Divisi..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="divisis" 
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
                            <Column field="nmDivisi" header="Nama Divisi" :sortable="true"></Column>
                            <Column header="Actions" :exportable="false" style="min-width:8rem">
                                <template #body="slotProps">
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                                        aria-haspopup="true"
                                        aria-controls="divisi-actions-menu"
                                        @click.stop="toggleActions($event, slotProps.data)"
                                    >
                                        <i class="ri-more-2-fill"></i>
                                    </button>
                                </template>
                            </Column>
                        </MyDataTable>
                        </div>
                    </div>
                    <!--/ divisi Table -->
                </div>
            </div>
            <!--/ divisi cards -->

            <Menu
                id="divisi-actions-menu"
                ref="actionsMenuRef"
                :model="actionMenuItems"
                :popup="true"
                append-to="body"
            />

            <!-- Placeholder untuk DivisiModal component -->
            <Modal 
                id="DivisiModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="divisiStore.saveDivisi()">
                        <div class="row g-4">
                            <div class="col-md-12">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.nmDivisi" 
                                        placeholder="Masukkan nama divisi"
                                        
                                    >
                                    <label>Nama Divisi <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="divisiStore.closeModal()">Tutup</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                {{ isEditMode ? 'Update' : 'Simpan' }}
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia';
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useDivisiStore } from '~/stores/divisi'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import { useUserStore } from '~/stores/user'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const myDataTableRef = ref(null)
const divisiStore = useDivisiStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()
const { userHasPermission, userHasRole } = usePermissions();

const { divisis, loading, totalRecords, params, form, isEditMode, showModal, validationErrors } = storeToRefs(divisiStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

const modalTitle = computed(() => isEditMode.value ? 'Edit Divisi' : 'Tambah Divisi');
const modalDescription = computed(() => isEditMode.value ? 'Ubah detail divisi.' : 'Isi untuk menambah divisi baru.');

const actionsMenuRef = ref(null)
const activeRow = ref(null)

const actionMenuItems = computed(() => {
    const row = activeRow.value
    if (!row) return []
    const items = []

    if (userHasRole('superadmin') || userHasPermission('edit_divisi')) {
        items.push({
            label: 'Edit',
            icon: 'ri ri-edit-box-line',
            command: () => divisiStore.openModal(row, 'admin'),
        })
    }
    if (userHasRole('superadmin') || userHasPermission('delete_divisi')) {
        if (items.length) items.push({ separator: true })
        items.push({
            label: 'Hapus',
            icon: 'ri ri-delete-bin-7-line',
            class: 'hrd-menu-danger',
            command: () => divisiStore.deleteDivisi(row.id),
        })
    }

    return items
})

function toggleActions(event, row) {
    activeRow.value = row
    nextTick(() => actionsMenuRef.value?.toggle(event))
}

let modalInstance = null
onMounted(() => {
    divisiStore.fetchDivisis();
    permissionStore.fetchPermissions()
    userStore.loadUser()

    const modalElement = document.getElementById('DivisiModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Divisi', divisis.value.length)
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const debouncedSearch = useDebounceFn(() => {
    divisiStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch);


const onPage = (event) => divisiStore.setPagination(event);

const handleRowsChange = () => {
    params.value.first = 0; // Reset to first page
    divisiStore.fetchDivisis();
};

const onSort = (event) => divisiStore.setSort(event);

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Divisi',
  description: 'Division Management',
  keywords: 'Divisi, Division, HRD, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});
</script>

<style scoped>
:deep(.hrd-menu-danger .p-menuitem-link) {
  color: var(--bs-danger) !important;
}
</style>