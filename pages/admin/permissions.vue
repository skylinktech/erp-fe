<template>
    <div>
        <!-- Content wrapper -->
        <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
                <div>
                        <h4 class="mb-1">List Permissions</h4>
                        <p class="mb-6">
                            List permissions yang terdaftar di sistem
                        </p>
                        <div class="row g-6 mb-6">
                            <!-- Skeleton loader untuk card saat loading -->
                            <div class="col-6" v-if="loading && stats.total === undefined">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center">
                                            <div class="skeleton-loader me-3" style="width: 40px; height: 40px; border-radius: 8px;"></div>
                                            <div class="flex-grow-1">
                                                <div class="skeleton-loader mb-2" style="width: 60%; height: 16px;"></div>
                                                <div class="skeleton-loader" style="width: 40%; height: 20px;"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Card total permission -->
                            <CardBox
                                v-else-if="stats.total !== undefined"
                                title="Total Permission"
                                :total="stats.total + ' Permission'"
                            />
                            <!-- Card statistik per role, dinamis sesuai data dari backend -->
                            <CardBox
                                v-for="role in stats.roles"
                                :key="role.id"
                                :title="role.name.charAt(0).toUpperCase() + role.name.slice(1)"
                                :total="role.total + ' Permission'"
                            />
                            <CardBox
                                :isAddButtonCard="true"
                                image-src="/img/illustrations/add-new-role-illustration.png"
                                image-alt="Tambah Permission"
                                button-text="Tambah Permission"
                                modal-target="#PermissionModal" 
                                @button-click="openAddPermissionModal"
                            />
                        </div>
            
                        <div class="row g-6">
                            <div class="col-12">
                                <h4 class="mt-6 mb-1">Total Roles with their Permissions</h4>
                                <p class="mb-0">Find all of your company's administrator accounts and their associate Permissions.</p>
                                <div v-if="selectedPermissions.length > 0" class="alert alert-info mt-3 mb-0">
                                    <i class="ri-information-line me-2"></i>
                                    <strong>{{ selectedPermissions.length }}</strong> permission dipilih untuk aksi batch.
                                </div>
                            </div>
                            <div class="col-12">
                                <!-- permission Table -->
                                <div class="card">
                                    <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                                        <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                            <span class="me-2">Baris:</span>
                                            <Dropdown v-model="lazyParams.rows" :options="rowsPerPageOptionsArray" optionLabel="label" optionValue="value" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <!-- Batch Actions -->
                                            <div v-if="selectedPermissions.length > 0" class="btn-group me-2">
                                                <button 
                                                    class="btn btn-sm btn-dark px-2 py-2 me-2" 
                                                    type="button" 
                                                    aria-expanded="false"
                                                    @click="deleteBatchPermissions"
                                                    :disabled="selectedPermissions.length === 0"
                                                    style="min-width: 120px; min-height: 38px;"
                                                >
                                                    <i class="ri-delete-bin-7-line me-1"></i> 
                                                    Delete ({{ selectedPermissions.length }})
                                                </button>
                                                <button 
                                                    class="btn btn-sm btn-primary px-2 py-2 me-2" 
                                                    type="button" 
                                                    aria-expanded="false"
                                                    @click="openUpdateBatchModal"
                                                    :disabled="selectedPermissions.length === 0"
                                                    style="min-width: 120px; min-height: 38px;"
                                                >
                                                    <i class="ri-edit-line me-1"></i> 
                                                    Update ({{ selectedPermissions.length }})
                                                </button>
                                            </div>
                                            <div class="btn-group me-2">
                                                <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i class="ri-upload-2-line me-1"></i> Export
                                                </button>
                                                <ul class="dropdown-menu">
                                                    <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('csv')">CSV</a></li>
                                                    <li><a class="dropdown-item" href="javascript:void(0)" @click="exportData('pdf')">PDF</a></li>
                                                </ul>
                                            </div>
                                            <div class="input-group">
                                                <span class="p-input-icon-left">
                                                <InputText
                                                    v-model="globalFilterValue"
                                                    placeholder="Cari permission..."
                                                    class="w-full md:w-20rem"
                                                />
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-datatable table-responsive py-3 px-3">
                                    <MyDataTable 
                                        ref="myDataTableRef"
                                        :data="permissions" 
                                        :rows="lazyParams.rows" 
                                        :loading="loading"
                                        :totalRecords="totalRecords"
                                        :first="lazyParams.first"
                                        :lazy="true"
                                        @page="onPage($event)"
                                        @sort="onSort($event)"
                                        @selection-change="onSelectionChange"
                                        responsiveLayout="scroll" 
                                        paginatorPosition="bottom"
                                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                        :filters="filters"
                                        :globalFilterFields="['name', 'menuGroups', 'menuDetails']"
                                        v-model:selection="selectedPermissions"
                                        >
                                        <Column selectionMode="multiple" headerStyle="width: 3rem" :exportable="false"></Column>
                                        <Column field="id" header="#" :sortable="true" style="width: 50px;"></Column> 
                                            <Column field="name" header="Nama Permission" :sortable="true"></Column>
                                            
                                            <Column field="menuGroups" header="Menu Group" :sortable="true">
                                                <template #body="slotProps">
                                                    <span v-if="Array.isArray(slotProps.data.menuGroups) && slotProps.data.menuGroups.length > 0">
                                                        {{ slotProps.data.menuGroups.map(g => g.name).join(', ') }}
                                                    </span>
                                                    <span v-else>-</span>
                                                </template>
                                            </Column>
                                            <Column field="menuDetails" header="Menu Details" :sortable="true">
                                                <template #body="slotProps">
                                                    <span v-if="Array.isArray(slotProps.data.menuDetails) && slotProps.data.menuDetails.length > 0">
                                                        {{ slotProps.data.menuDetails.map(d => d.name).join(', ') }}
                                                    </span>
                                                    <span v-else>-</span>
                                                </template>
                                            </Column>
                                            <Column field="assignedRoles" header="Assigned To">
                                                <template #body="slotProps">
                                                    <template v-if="Array.isArray(slotProps.data.assignedRoles) && slotProps.data.assignedRoles.length > 0">
                                                        <span v-for="r in slotProps.data.assignedRoles" :key="r.id" 
                                                            
                                                            style="margin-right: 5px;">
                                                            {{ r.name }}
                                                        </span>
                                                    </template>
                                                    <span v-else>-</span>
                                                </template>
                                            </Column>
                                            <Column header="Actions" :exportable="false" style="min-width:8rem">
                                                <template #body="slotProps">
                                                    <button @click="openEditPermissionModal(slotProps.data)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2"><i class="ri-edit-box-line"></i></button>
                                                    <button @click="deletePermission(slotProps.data.id)" class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon"><i class="ri-delete-bin-7-line"></i></button>
                                                </template>
                                            </Column>
                                    </MyDataTable>
                                    </div>
                                </div>
                                <!--/ permission Table -->
                            </div>
                        </div>
                        <!--/ permission cards -->
                    </div>
                    <!-- Placeholder untuk MenuModal component -->
                    <Modal 
                        id="PermissionModal"
                        :validationErrorsFromParent="validationErrors"
                        :title="modalTitle" 
                        :description="modalDescription"
                    >
                        <template #default>
                            <form @submit.prevent="handleSavePermission">
                                <div class="row g-3">
                                    <div class="col-12 mb-3">
                                        <label for="modalPermissionName">Permission Name</label>
                                        <input
                                            type="text"
                                            id="modalPermissionName"
                                            v-model="formPermission.name"
                                            class="form-control"
                                            placeholder="Enter a permission name"
                                            
                                        />
                                    </div>
                                    <div class="col-6 mb-3">
                                        <label for="menuGroup">Menu Group</label>
                                        <CustomSelect2 v-model="formPermission.menuGroupId" :options="menuGroups"
                                            :get-option-label="option => option.name"
                                            :reduce="option => option.id" searchable clearable
                                            placeholder="-- Pilih Menu Group --"
                                            id="menuGroup"
                                            class="menu-group"
                                        />                                    
                                    </div>
                                    <div class="col-6 mb-3">
                                        <label for="menuDetail">Menu Detail</label>
                                        <CustomSelect2 v-model="formPermission.menuDetailId" :options="filteredMenuDetails"
                                            :get-option-label="option => option.name"
                                            :reduce="option => option.id" searchable clearable
                                            placeholder="-- Pilih Menu Detail --"
                                            id="menuDetail"
                                            class="menu-detail"
                                        />                                    
                                    </div>
                                    <div class="col-12 d-flex flex-wrap justify-content-center gap-4 row-gap-4">
                                        <button type="button" class="btn btn-outline-secondary" @click="handleCloseModal">
                                            Tutup
                                        </button>
                                        <button
                                            type="submit"
                                            class="btn btn-primary"
                                        >
                                            {{ isEditMode ? 'Update' : 'Simpan' }}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </template>
                    </Modal>

                    <!-- Modal untuk Update Batch Permission -->
                    <Modal 
                        id="UpdateBatchPermissionModal"
                        :validationErrorsFromParent="batchValidationErrors"
                        title="Update Batch Permission" 
                        description="Update multiple permission sekaligus dengan menu group dan menu detail yang sama."
                    >
                        <template #default>
                            <form @submit.prevent="handleUpdateBatchPermission">
                                <div class="row g-3">
                                    <div class="col-6 mb-3">
                                        <label for="batchMenuGroup">Menu Group</label>
                                        <CustomSelect2 v-model="batchForm.menuGroupId" :options="menuGroups"
                                            :get-option-label="option => option.name"
                                            :reduce="option => option.id" searchable clearable
                                            placeholder="-- Pilih Menu Group --"
                                            id="batchMenuGroup"
                                            class="menu-group"
                                        />                                    
                                    </div>
                                    <div class="col-6 mb-3">
                                        <label for="batchMenuDetail">Menu Detail</label>
                                        <CustomSelect2 v-model="batchForm.menuDetailId" :options="filteredBatchMenuDetails"
                                            :get-option-label="option => option.name"
                                            :reduce="option => option.id" searchable clearable
                                            placeholder="-- Pilih Menu Detail --"
                                            id="batchMenuDetail"
                                            class="menu-detail"
                                        />                                    
                                    </div>
                                    <div class="col-12 d-flex flex-wrap justify-content-center gap-4 row-gap-4">
                                        <button type="button" class="btn btn-outline-secondary" @click="handleCloseBatchModal">
                                            Tutup
                                        </button>
                                        <button
                                            type="submit"
                                            class="btn btn-primary"
                                            :disabled="!batchForm.menuGroupId || !batchForm.menuDetailId"
                                        >
                                            Update {{ selectedPermissions.length }} Permission
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
        <!-- Content wrapper -->
    </div>
</template>
 
<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '~/components/modal/Modal.vue'
import CardBox from '~/components/cards/Cards.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { usePermissionsStore } from '~/stores/permissions'
import { useLayoutStore } from '~/stores/layout'
import { useMenuGroupStore } from '~/stores/menu-group'
import { useMenuDetailStore } from '~/stores/menu-detail'
import vSelect from 'vue-select'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Swal from 'sweetalert2'
import 'vue-select/dist/vue-select.css'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

// Composables
const { setListTitle, setFormTitle } = useDynamicTitle()

const { $api } = useNuxtApp()
const toast     = useToast();

const myDataTableRef = ref(null)
const globalFilterValue = ref('')
const permissionsStore = usePermissionsStore()
const layoutStore = useLayoutStore()
const menuGroupStore = useMenuGroupStore()
const menuDetailStore = useMenuDetailStore()
const permissions = ref([])
const totalRecords = ref(0)
const loading = ref(false)
const selectedPermissions = ref([])
const lazyParams = ref({
    first: 0,
    rows: 10,
    sortField: 'id',
    sortOrder: 'desc',
    search: '',
    draw: 1,
})

const stats = ref({
  total : undefined,
  roles: []
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Use stores for menu groups
const menuGroups = computed(() => menuGroupStore.menuGroups)
// Menu details perlu ref lokal karena di-fetch berdasarkan groupId
const menuDetails = ref([])

let searchDebounceTimer = null;
watch(globalFilterValue, (newValue) => {
    filters.value.global.value = newValue;

    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
        lazyParams.value.search = newValue;
        lazyParams.value.first = 0;
        fetchAllPageData();
    }, 500);
});

onBeforeUnmount(() => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
});

const isEditMode = ref(false)
const selectedPermission = ref(null)
const validationErrors = ref([])
const batchValidationErrors = ref([])

const formPermission = ref({
    id: null,
    name: '',
    menuGroupId: null,
    menuDetailId: null,
})

const batchForm = ref({
    menuGroupId: null,
    menuDetailId: null,
})

// Track if batch modal is open to prevent watcher from running after modal is closed
const isBatchModalOpen = ref(false);

const rowsPerPageOptionsArray = ref([
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
]);

const modalTitle = computed(() => isEditMode.value ? 'Edit Permission' : 'Tambah Permission');
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data permission di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan permission baru.');

const handleCloseModal = () => {
    const modalEl = document.getElementById('PermissionModal'); 
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        // Bersihkan backdrop setelah modal tertutup
        modalEl.addEventListener('hidden.bs.modal', () => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.style.overflow = '';
        }, { once: true });
    }
    resetFormState(); 
};

const handleCloseBatchModal = () => {
    try {
        // Mark modal as closed first to prevent watchers from running
        isBatchModalOpen.value = false;
        
        const modalEl = document.getElementById('UpdateBatchPermissionModal'); 
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
                
                // Bersihkan backdrop setelah modal tertutup
                modalEl.addEventListener('hidden.bs.modal', () => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.style.overflow = '';
                }, { once: true });
            }
        }
        
        // Reset form and validation errors
        batchForm.value = {
            menuGroupId: null,
            menuDetailId: null,
        };
        batchValidationErrors.value = [];
    } catch (error) {
        console.error('Error closing batch modal:', error);
        isBatchModalOpen.value = false;
    }
};

const resetFormState = () => {
    formPermission.value = {
        id: null,
        name: '',
        menuGroupId: null,
        menuDetailId: null,
    };
    validationErrors.value = [];
};

const loadLazyData = async () => {
    try {
        // Update store params
        permissionsStore.setParams({
            first: lazyParams.value.first,
            rows: lazyParams.value.rows,
            sortField: lazyParams.value.sortField,
            sortOrder: lazyParams.value.sortOrder,
            search: lazyParams.value.search,
            draw: lazyParams.value.draw,
        });
        
        // Fetch menggunakan store
        await permissionsStore.fetchPermissions();
        
        // Update local refs dari store
        permissions.value = permissionsStore.permissions;
        totalRecords.value = permissionsStore.totalRecords;
        
        if (permissionsStore.params.draw) {
            lazyParams.value.draw = permissionsStore.params.draw;
        }
        
        // Reset selection when data changes
        selectedPermissions.value = [];
    } catch (error) {
        console.error('Gagal mengambil data permissions:', error);
        permissions.value = [];
        totalRecords.value = 0;
        selectedPermissions.value = [];
        throw error;
    }
};

const fetchStats = async () => {
  const defaultStats = {
    total: undefined,
    roles: []
  };
  try {
    const result = await permissionsStore.fetchStats();
    if (result && typeof result === 'object' && result !== null) {
      stats.value = {
          total: result.total,
          roles: result.roles
      };
    } else {
      stats.value = defaultStats;
      console.warn('Data statistik dari API tidak dalam format objek yang diharapkan atau null:', result);
    }
  } catch (error) {
    console.error('Gagal mengambil data statistik (exception):', error);
    stats.value = defaultStats;
  }
};

const handleSavePermission = async () => {
    layoutStore.setLoading(true);
    try {
        const permissionIdToUpdate = isEditMode.value ? formPermission.value.id : null;
        if (isEditMode.value && !permissionIdToUpdate) {
            toast.error({
                title: 'Gagal!',
                icon: 'ri-close-line',
                message: 'ID Permission tidak ditemukan untuk update.',
                timeout: 3000,
                position: 'topRight',
                layout: 2,
            })
            return;
        }

        const payload = {
            name: formPermission.value.name,
            menuGroupIds: formPermission.value.menuGroupId ? [formPermission.value.menuGroupId] : [],
            menuDetailIds: formPermission.value.menuDetailId ? [formPermission.value.menuDetailId] : [],
            ...(permissionIdToUpdate && { id: permissionIdToUpdate }),
        };
        
        await permissionsStore.savePermission(payload);
        
        selectedPermissions.value = []; // Reset selection
        await fetchAllPageData();
        handleCloseModal();
        
        toast.success({
            title: 'Berhasil!',
            icon: 'ri-check-line',
            message: 'Permission berhasil disimpan',
            timeout: 3000,
            position: 'topRight',
            layout: 2,
        })
    } catch (error) {
        if (permissionsStore.validationErrors.length > 0) {
            validationErrors.value = permissionsStore.validationErrors;
        } else {
            toast.error({
                title: 'Gagal!',
                icon: 'ri-close-line',
                message: 'Terjadi kesalahan saat menyimpan data',
                timeout: 3000,
                position: 'topRight',
                layout: 2,
            })
        }
    } finally {
        layoutStore.setLoading(false);
    }
};

const onPage = (event) => {
    lazyParams.value.first = event.first;
    lazyParams.value.rows = event.rows;
    selectedPermissions.value = []; // Reset selection on page change
    fetchAllPageData();
};

const handleRowsChange = () => {
    lazyParams.value.first = 0;
    selectedPermissions.value = []; // Reset selection on rows change
    fetchAllPageData();
};

const handleSearch = () => {
    lazyParams.value.first = 0;
    selectedPermissions.value = []; // Reset selection on search
    fetchAllPageData();
};

const onSort = (event) => {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    selectedPermissions.value = []; // Reset selection on sort
    fetchAllPageData();
};

const exportData = (format) => {
    if (format === 'csv') {
        myDataTableRef.value.exportCSV();
    } else if (format === 'pdf') {
        myDataTableRef.value.exportPDF();
    }
};

const getBadgeClass = (roleId) => {
    const classMap = {
        1: 'bg-label-primary',
        2: 'bg-label-warning',
        3: 'bg-label-success',
    };
    return classMap[roleId] || 'bg-label-info';
};

// Fungsi untuk mengambil data menu groups - menggunakan store
const fetchMenuGroups = async () => {
    try {
        await menuGroupStore.fetchMenuGroups()
    } catch (error) {
        console.error('Error fetching menu groups:', error)
    }
}

// Fungsi untuk mengambil data menu details berdasarkan group
const fetchMenuDetails = async (groupId) => {
    if (!groupId) {
        return;
    }
    try {
        const response = await fetch($api.getMenuDetails(groupId), {
            headers: { 
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Cookie-based auth
        });
        if (!response.ok) throw new Error('Gagal mengambil data menu details');
        const data = await response.json();
        // Update menuDetails ref (temporary solution, ideally should use store)
        menuDetails.value = Array.isArray(data.menuDetails) ? data.menuDetails : [];
    } catch (error) {
        console.error('Error fetching menu details:', error);
        menuDetails.value = [];
    }
};

onMounted(() => {
    fetchAllPageData();
    setListTitle('Permissions', permissions.value.length)
});

const fetchAllPageData = async () => {
    layoutStore.setLoading(true);
    try {
        await loadLazyData();
        fetchStats();
        fetchMenuGroupsAndDetails();
    } catch (error) {
        console.error("Gagal memuat data halaman:", error);
        toast.error({
            title: 'Error',
            icon: 'ri-close-line',
            message: 'Gagal memuat data halaman.',
            timeout: 3000,
            position: 'topRight',
            layout: 2,
        });
    } finally {
        layoutStore.setLoading(false);
    }
};

function openAddPermissionModal() {
    isEditMode.value = false;
    resetFormState();
    const modalEl = document.getElementById('PermissionModal');
    if (modalEl) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    }
}

function openUpdateBatchModal() {
    try {
        if (selectedPermissions.value.length === 0) {
            toast.error({
                title: 'Peringatan!',
                icon: 'ri-error-warning-line',
                message: 'Tidak ada permission yang dipilih untuk diupdate.',
                timeout: 3000,
                position: 'topRight',
                layout: 2,
            });
            return;
        }
        
        // Reset form batch
        batchForm.value = {
            menuGroupId: null,
            menuDetailId: null,
        };
        batchValidationErrors.value = [];
        
        // Ensure menuDetails is initialized
        if (!Array.isArray(menuDetails.value)) {
            menuDetails.value = [];
        }
        
        // Mark modal as open before showing
        isBatchModalOpen.value = true;
        
        const modalEl = document.getElementById('UpdateBatchPermissionModal');
        if (modalEl) {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            
            // Listen for modal close events
            modalEl.addEventListener('hidden.bs.modal', () => {
                isBatchModalOpen.value = false;
            }, { once: true });
            
            modalInstance.show();
        }
    } catch (error) {
        console.error('Error opening batch update modal:', error);
        isBatchModalOpen.value = false;
        toast.error({
            title: 'Error!',
            icon: 'ri-close-line',
            message: 'Terjadi kesalahan saat membuka modal.',
            timeout: 3000,
            position: 'topRight',
            layout: 2,
        });
    }
}

async function openEditPermissionModal(permissionData) {
    isEditMode.value = true;
    resetFormState();
    selectedPermission.value = JSON.parse(JSON.stringify(permissionData));

    formPermission.value = {
        id: permissionData.id,
        name: permissionData.name || '',
        menuGroupId: permissionData.menuGroups && permissionData.menuGroups.length > 0 ? permissionData.menuGroups[0].id : null,
        menuDetailId: permissionData.menuDetails && permissionData.menuDetails.length > 0 ? permissionData.menuDetails[0].id : null,
    };
    
    if (formPermission.value.menuGroupId) {
        await fetchMenuDetails(formPermission.value.menuGroupId);
        // Ensure menuDetailId is set after details are fetched
        formPermission.value.menuDetailId = permissionData.menuDetails && permissionData.menuDetails.length > 0 ? permissionData.menuDetails[0].id : null;
    }

    const modalEl = document.getElementById('PermissionModal');
    if (modalEl) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    }
}

const deletePermission = async (permissionId) => {
    if (!permissionId) return;

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#666CFF',
        cancelButtonColor: '#A7A9B3',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        layoutStore.setLoading(true);
        try {
            await permissionsStore.deletePermission(permissionId);
            await fetchAllPageData();

            toast.success({
                title: 'Berhasil!',
                icon: 'ri-check-line',
                message: 'Permission berhasil dihapus.',
                timeout: 3000,
                position: 'topRight',
                layout: 2,
            });

        } catch (error) {
            toast.error({
                title: 'Gagal!',
                icon: 'ri-close-line',
                message: 'Terjadi kesalahan saat menghapus permission',
                timeout: 3000,
                position: 'topRight',
                layout: 2,
            });
        } finally {
            layoutStore.setLoading(false);
        }
    }
};

const deleteBatchPermissions = async () => {
    if (!selectedPermissions.value || selectedPermissions.value.length === 0) {
        toast.error({
            title: 'Peringatan!',
            icon: 'ri-error-warning-line',
            message: 'Tidak ada permission yang dipilih untuk dihapus.',
            timeout: 3000,
            position: 'topRight',
            layout: 2,
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Konfirmasi Hapus Batch',
        text: `Anda yakin ingin menghapus ${selectedPermissions.value.length} permission yang dipilih? Tindakan ini tidak dapat dibatalkan!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus Semua!',
        cancelButtonText: 'Batal',
        reverseButtons: true
    });

    if (result.isConfirmed) {
        layoutStore.setLoading(true);
        try {
            const permissionIds = selectedPermissions.value.map(permission => permission.id);
            const { successful, failed } = await permissionsStore.deleteBatchPermissions(permissionIds);
            
            // Clear selection
            selectedPermissions.value = [];
            
            // Refresh data
            await fetchAllPageData();
            
            if (failed === 0) {
                toast.success({
                    title: 'Berhasil!',
                    icon: 'ri-check-line',
                    message: `${successful} permission berhasil dihapus.`,
                    timeout: 3000,
                    position: 'topRight',
                    layout: 2,
                });
            } else {
                toast.warning({
                    title: 'Peringatan!',
                    icon: 'ri-error-warning-line',
                    message: `${successful} permission berhasil dihapus, ${failed} gagal dihapus.`,
                    timeout: 5000,
                    position: 'topRight',
                    layout: 2,
                });
            }

        } catch (error) {
            console.error('Error during batch delete:', error);
            toast.error({
                title: 'Error!',
                icon: 'ri-close-line',
                message: 'Terjadi kesalahan saat menghapus permissions: ' + (error?.message || 'Unknown error'),
                timeout: 5000,
                position: 'topRight',
                layout: 2,
            });
        } finally {
            layoutStore.setLoading(false);
        }
    }
};

const onSelectionChange = (event) => {
    selectedPermissions.value = event.value;
};

const handleUpdateBatchPermission = async () => {
    if (!batchForm.value.menuGroupId || !batchForm.value.menuDetailId) {
        toast.error({
            title: 'Error!',
            icon: 'ri-close-line',
            message: 'Menu Group dan Menu Detail harus dipilih.',
            timeout: 3000,
            position: 'topRight',
            layout: 2,
        });
        return;
    }

    layoutStore.setLoading(true);
    try {
        const permissionIds = selectedPermissions.value.map(permission => permission.id);
        const payload = {
            menuGroupIds: [batchForm.value.menuGroupId],
            menuDetailIds: [batchForm.value.menuDetailId],
        };
        
        const { successful, failed } = await permissionsStore.updateBatchPermissions(permissionIds, payload);
        
        // Clear selection
        selectedPermissions.value = [];
        
        // Close modal first before refreshing data to avoid reactivity issues
        handleCloseBatchModal();
        
        // Use nextTick to ensure modal is fully closed before refreshing
        await nextTick();
        
        // Refresh data
        await fetchAllPageData();
        
        if (failed === 0) {
            toast.success({
                title: 'Berhasil!',
                icon: 'ri-check-line',
                message: `${successful} permission berhasil diupdate.`,
                timeout: 3000,
                position: 'topRight',
                layout: 2,
            });
        } else {
            toast.warning({
                title: 'Peringatan!',
                icon: 'ri-error-warning-line',
                message: `${successful} permission berhasil diupdate, ${failed} gagal diupdate.`,
                timeout: 5000,
                position: 'topRight',
                layout: 2,
            });
        }
    } catch (error) {
        toast.error({
            title: 'Gagal!',
            icon: 'ri-close-line',
            message: 'Terjadi kesalahan saat mengupdate batch permission.',
            timeout: 3000,
            position: 'topRight',
            layout: 2,
        });
    } finally {
        layoutStore.setLoading(false);
    }
};

const filteredMenuDetails = computed(() => {
    try {
        if (!formPermission.value?.menuGroupId || !Array.isArray(menuDetails.value)) {
            return [];
        }
        return menuDetails.value; // details are already filtered by fetchMenuDetails
    } catch (error) {
        console.error('Error in filteredMenuDetails:', error);
        return [];
    }
});

const filteredBatchMenuDetails = computed(() => {
    try {
        if (!batchForm.value?.menuGroupId || !Array.isArray(menuDetails.value)) {
            return [];
        }
        return menuDetails.value;
    } catch (error) {
        console.error('Error in filteredBatchMenuDetails:', error);
        return [];
    }
});

watch(() => formPermission.value.menuGroupId, (newVal, oldVal) => {
  try {
    if (newVal !== oldVal) {
      formPermission.value.menuDetailId = null; // Reset detail when group changes
      if (newVal) {
        fetchMenuDetails(newVal);
      }
    }
  } catch (error) {
    console.error('Error in formPermission menuGroupId watcher:', error);
  }
})

watch(() => batchForm.value.menuGroupId, (newVal, oldVal) => {
  try {
    // Only update if modal is open to prevent errors after modal is closed
    if (!isBatchModalOpen.value) return;
    
    if (newVal !== oldVal) {
      batchForm.value.menuDetailId = null; // Reset detail when group changes
      if (newVal) {
        fetchMenuDetails(newVal);
      }
    }
  } catch (error) {
    console.error('Error in batchForm menuGroupId watcher:', error);
  }
})

const fetchMenuGroupsAndDetails = async () => {
    await Promise.all([
        fetchMenuGroups(),
        fetchMenuDetails()
    ]);
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Permissions',
  description: 'Permission Management',
  keywords: 'Permissions, Admin, Kainnova Digital Solutions',
  author: 'Kainnova Digital Solutions',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});

</script>
 
<style scoped>

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
