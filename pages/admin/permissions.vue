<template>
    <div>
        <!-- Content wrapper -->
        <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-pt-12">
                <div>
                        <h4 class="mb-1">List Permissions</h4>
                        <p class="mb-6">
                            List permissions yang terdaftar di sistem
                        </p>
                        <div class="row g-6 mb-6">
                            <div class="col-xl col-lg-6 col-md-6" v-if="loading && stats.total === undefined">
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
                            <div v-else-if="stats.total !== undefined" class="col-xl col-lg-6 col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-4">
                                            <p class="mb-0">Total Permission</p>
                                            <div class="avatar">
                                                <span class="avatar-initial rounded bg-label-primary"><i class="ri-lock-2-line"></i></span>
                                            </div>
                                        </div>
                                        <div class="account-heading">
                                            <h5 class="mb-1">{{ stats.total }}</h5>
                                            <span class="text-muted">Permission terdaftar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                v-for="role in stats.roles"
                                :key="role.id"
                                class="col-xl col-lg-6 col-md-6"
                            >
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center mb-4">
                                            <p class="mb-0 text-capitalize">{{ role.name }}</p>
                                            <div class="avatar">
                                                <span class="avatar-initial rounded bg-label-info"><i class="ri-shield-user-line"></i></span>
                                            </div>
                                        </div>
                                        <div class="account-heading">
                                            <h5 class="mb-1">{{ role.total }}</h5>
                                            <span class="text-muted">Permission pada role</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                    <ListPageTableHeader
                                        :rows="Number(lazyParams.rows)"
                                        :rows-options="permissionsRowsOptions"
                                        :search="globalFilterValue"
                                        search-placeholder="Cari permission..."
                                        :export-disabled="loading"
                                        :export-items="[
                                            { value: 'excel', label: 'Excel' },
                                            { value: 'pdf', label: 'PDF' },
                                        ]"
                                        @update:rows="onPermissionsToolbarRows"
                                        @update:search="(v) => { globalFilterValue = v }"
                                        @export="exportData"
                                    >
                                        <template #add>
                                            <button type="button" class="btn btn-primary" @click="openAddPermissionModal">
                                                <i class="ri-add-line me-1"></i>
                                                Tambah
                                            </button>
                                        </template>
                                        <template #toolbar-extra>
                                            <button
                                                v-if="selectedPermissions.length > 0"
                                                class="btn btn-dark"
                                                type="button"
                                                @click="deleteBatchPermissions"
                                            >
                                                <i class="ri-delete-bin-7-line me-1"></i>
                                                Delete ({{ selectedPermissions.length }})
                                            </button>
                                            <button
                                                v-if="selectedPermissions.length > 0"
                                                class="btn btn-primary"
                                                type="button"
                                                @click="openUpdateBatchModal"
                                            >
                                                <i class="ri-edit-line me-1"></i>
                                                Update ({{ selectedPermissions.length }})
                                            </button>
                                        </template>
                                    </ListPageTableHeader>
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
                                                        :class="r.name === 'danger' ? 'badge bg-label-danger' : r.name === 'warning' ? 'badge bg-label-warning' : r.name === 'success' ? 'badge bg-label-success' : r.name === 'info' ? 'badge bg-label-info' : r.name === 'primary' ? 'badge bg-label-primary' : r.name === 'secondary' ? 'badge bg-label-secondary' : r.name === 'light' ? 'badge bg-label-light' : r.name === 'dark' ? 'badge bg-label-dark' : 'badge bg-label-primary'"
                                                        style="margin-right: 5px;">
                                                        {{ r.name }}
                                                    </span>
                                                </template>
                                                <span v-else>-</span>
                                            </template>
                                        </Column>
                                        <Column header="Actions" :exportable="false" style="min-width:8rem">
                                            <template #body="slotProps">
                                                <div class="d-inline-block">
                                                <a
                                                    href="javascript:;"
                                                    class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    <i class="ri-more-2-fill"></i>
                                                </a>
                                                <ul class="dropdown-menu">
                                                    <li>
                                                    <a
                                                        class="dropdown-item"
                                                        href="javascript:void(0)"
                                                        @click="openEditPermissionModal(slotProps.data)"
                                                    >
                                                        <i class="ri-edit-box-line me-2"></i> Edit
                                                    </a>
                                                    </li>
                                                    <li>
                                                    <a
                                                        class="dropdown-item text-danger"
                                                        href="javascript:void(0)"
                                                        @click="deletePermission(slotProps.data.id)"
                                                    >
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
                                        <CustomSelect2 v-model="formPermission.menuGroupId" :options="menuGroupOptions"
                                            :get-option-label="option => option?.name ?? ''"
                                            :reduce="option => option?.id" searchable clearable
                                            placeholder="-- Pilih Menu Group --"
                                            id="menuGroup"
                                            class="menu-group"
                                        />                                    
                                    </div>
                                    <div class="col-6 mb-3">
                                        <label for="menuDetail">Menu Detail</label>
                                        <CustomSelect2 v-model="formPermission.menuDetailId" :options="filteredMenuDetails"
                                            :get-option-label="option => option?.name ?? ''"
                                            :reduce="option => option?.id" searchable clearable
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
                                        <CustomSelect2 v-model="batchForm.menuGroupId" :options="menuGroupOptions"
                                            :get-option-label="option => option?.name ?? ''"
                                            :reduce="option => option?.id" searchable clearable
                                            placeholder="-- Pilih Menu Group --"
                                            id="batchMenuGroup"
                                            class="menu-group"
                                        />                                    
                                    </div>
                                    <div class="col-6 mb-3">
                                        <label for="batchMenuDetail">Menu Detail</label>
                                        <CustomSelect2 v-model="batchForm.menuDetailId" :options="filteredBatchMenuDetails"
                                            :get-option-label="option => option?.name ?? ''"
                                            :reduce="option => option?.id" searchable clearable
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
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { usePermissionsStore } from '~/stores/permissions'
import { useLayoutStore } from '~/stores/layout'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Swal from 'sweetalert2'
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

// Lightweight options for CustomSelect2 (from /menu-groups/options)
const menuGroupOptions = ref([])
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

const permissionsRowsOptions = [10, 20, 50, 100]

const modalTitle = computed(() => isEditMode.value ? 'Edit Permission' : 'Tambah');
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

const onPermissionsToolbarRows = (v) => {
    lazyParams.value.rows = Number(v) || 10;
    handleRowsChange();
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
    if (format === 'excel' || format === 'csv') {
        myDataTableRef.value?.exportCSV?.();
        return;
    }
    if (format === 'pdf') {
        myDataTableRef.value?.exportPDF?.();
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

const fetchMenuGroupOptions = async (search = '') => {
    try {
        const params = new URLSearchParams();
        if (search.trim()) {
            params.set('search', search.trim());
        }
        const query = params.toString();
        const url = query ? `${$api.menuGroupsOptions()}?${query}` : $api.menuGroupsOptions();
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Gagal mengambil data menu group');
        const result = await response.json();
        menuGroupOptions.value = Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error('Error fetching menu group options:', error);
        menuGroupOptions.value = [];
    }
};

const fetchMenuDetails = async (groupId) => {
    if (!groupId) {
        menuDetails.value = [];
        return;
    }
    try {
        const response = await fetch($api.getMenuDetails(groupId), {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Gagal mengambil data menu details');
        const data = await response.json();
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

async function openAddPermissionModal() {
    isEditMode.value = false;
    resetFormState();
    menuDetails.value = [];
    if (menuGroupOptions.value.length === 0) {
        await fetchMenuGroupOptions();
    }
    const modalEl = document.getElementById('PermissionModal');
    if (modalEl) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    }
}

async function openUpdateBatchModal() {
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
        menuDetails.value = [];

        // Pastikan opsi menu group terisi sebelum modal dibuka
        await fetchMenuGroupOptions();
        
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

    if (menuGroupOptions.value.length === 0) {
        await fetchMenuGroupOptions();
    }

    formPermission.value = {
        id: permissionData.id,
        name: permissionData.name || '',
        menuGroupId: permissionData.menuGroups && permissionData.menuGroups.length > 0 ? permissionData.menuGroups[0].id : null,
        menuDetailId: permissionData.menuDetails && permissionData.menuDetails.length > 0 ? permissionData.menuDetails[0].id : null,
    };
    
    if (formPermission.value.menuGroupId) {
        await fetchMenuDetails(formPermission.value.menuGroupId);
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
    await fetchMenuGroupOptions();
};

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Permissions',
  description: 'Permission Management',
  keywords: 'Permissions, Admin, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
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
