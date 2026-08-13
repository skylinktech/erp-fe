<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="mb-1">List Departemen</h4>
            <p class="mb-6">
            List departemen yang terdaftar di sistem
            </p>
            <!-- departemen cards -->
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
                                    <button v-if="userHasRole('superadmin') || userHasPermission('create_departemen')" @click="departemenStore.openModal()" class="btn btn-primary mb-2 text-nowrap add-new-role">
                                        Tambah Departemen
                                    </button>
                                    <p class="mb-0 mt-1">Buat Departemen baru</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Total Departemen</h4>
                    <p class="mb-0">Find all of your company's administrator accounts and their associate Departemen.</p>
                </div>
                <div class="col-12">
                    <!-- departemen Table -->
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown v-model="params.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="p-input-icon-left">
                                    <i class="ri-search-line"></i>
                                    <InputText v-model="globalFilterValue" placeholder="Cari Departemen..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                        <MyDataTable 
                            ref="myDataTableRef"
                            :data="departemens" 
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
                            <Column field="nmDepartemen" header="Nama Departemen" :sortable="true"></Column>
                            <Column field="divisi.nmDivisi" header="Divisi" :sortable="true"></Column>
                            <Column header="Actions" :exportable="false" style="min-width:8rem">
                                <template #body="slotProps">
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                                        aria-haspopup="true"
                                        aria-controls="departemen-actions-menu"
                                        @click.stop="toggleActions($event, slotProps.data)"
                                    >
                                        <i class="ri-more-2-fill"></i>
                                    </button>
                                </template>
                            </Column>
                        </MyDataTable>
                        </div>
                    </div>
                    <!--/ departemen Table -->
                </div>
            </div>
            <!--/ departemen cards -->

            <Menu
                id="departemen-actions-menu"
                ref="actionsMenuRef"
                :model="actionMenuItems"
                :popup="true"
                append-to="body"
            />

            <!-- Placeholder untuk DepartemenModal component -->
            <Modal 
                id="DepartemenModal"
                :title="modalTitle" 
                :description="modalDescription"
                :validation-errors-from-parent="validationErrors"
            >
                <template #default>
                    <form @submit.prevent="departemenStore.saveDepartemen()">
                        <div class="row g-6">
                            <div class="col-md-6">
                                <div class="form-floating form-floating-outline">
                                    <input 
                                        type="text" 
                                        class="form-control"
                                        v-model="form.nmDepartemen" 
                                        placeholder="Masukkan nama departemen"
                                        
                                    >
                                    <label>Nama Departemen <span class="text-danger" aria-hidden="true">*</span></label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <FormLabel required>Divisi</FormLabel>
                                <CustomSelect2 v-model="form.divisiId" :options="divisis"
                                    :get-option-label="option => option.nmDivisi"
                                    :reduce="option => option.id" searchable clearable
                                    placeholder="-- Pilih Divisi --"
                                    class="select-divisi"
                                />
                            </div>
                        </div>
                        <div class="modal-footer mt-6">
                            <button type="button" class="btn btn-outline-secondary" @click="departemenStore.closeModal()">Tutup</button>
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
import { useDepartemenStore } from '~/stores/departemen'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormLabel from '~/components/form/FormLabel.vue'
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
const departemenStore = useDepartemenStore()
const permissionStore = usePermissionsStore()
const userStore = useUserStore()
const { userHasPermission, userHasRole } = usePermissions();

const { departemens, divisis, loading, totalRecords, params, form, isEditMode, showModal, validationErrors } = storeToRefs(departemenStore)

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100]);

const modalTitle = computed(() => isEditMode.value ? 'Edit Departemen' : 'Tambah Departemen');
const modalDescription = computed(() => isEditMode.value ? 'Ubah detail departemen.' : 'Isi untuk menambah departemen baru.');

const actionsMenuRef = ref(null)
const activeRow = ref(null)

const actionMenuItems = computed(() => {
    const row = activeRow.value
    if (!row) return []
    const items = []

    if (userHasRole('superadmin') || userHasPermission('edit_departemen')) {
        items.push({
            label: 'Edit',
            icon: 'ri ri-edit-box-line',
            command: () => departemenStore.openModal(row, 'admin'),
        })
    }
    if (userHasRole('superadmin') || userHasPermission('delete_departemen')) {
        if (items.length) items.push({ separator: true })
        items.push({
            label: 'Hapus',
            icon: 'ri ri-delete-bin-7-line',
            class: 'hrd-menu-danger',
            command: () => departemenStore.deleteDepartemen(row.id),
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
    departemenStore.fetchDepartemens();
    permissionStore.fetchPermissions()
    userStore.loadUser()

    const modalElement = document.getElementById('DepartemenModal')
    if (modalElement) {
        modalInstance = new bootstrap.Modal(modalElement)
    }
    setListTitle('Departemen', departemens.value.length)
});

watch(showModal, (newValue) => {
    if (newValue) {
        modalInstance?.show()
    } else {
        modalInstance?.hide()
    }
})

const debouncedSearch = useDebounceFn(() => {
    departemenStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch);

const onPage = (event) => departemenStore.setPagination(event);

const handleRowsChange = () => {
    params.value.first = 0; // Reset to first page
    departemenStore.fetchDepartemens();
};

const onSort = (event) => departemenStore.setSort(event);

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Departemen',
  description: 'Department Management',
  keywords: 'Departemen, Department, HRD, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});
</script>

<style scoped>
:deep(.hrd-menu-danger .p-menuitem-link) {
  color: var(--bs-danger) !important;
}

/* Responsive adjustments */
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
</style>

