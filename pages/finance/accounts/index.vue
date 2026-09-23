<template>
    <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1">
            
            <p class="mb-6">
                Kelola Chart of Accounts (COA) untuk sistem akuntansi
            </p>

            <ListPageStatsCards :items="statItems" :loading="loading" />

            
            <div class="row g-6">
                <div class="col-12">
                    <h4 class="mt-6 mb-1">Chart of Accounts</h4>
                    <p class="mb-0">Temukan semua akun dalam sistem Chart of Accounts.</p>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                            <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                                <span class="me-2">Baris:</span>
                                <Dropdown v-model="params.rows" :options="rowsPerPageOptionsArray" @change="handleRowsChange" placeholder="Jumlah" style="width: 8rem;" />
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button 
                                    v-if="userHasRole('superadmin') || userHasPermission('create_account')"
                                    @click="accountStore.openModal()" 
                                    class="btn btn-primary">
                                    <i class="ri-add-line me-1"></i>
                                    Tambah Akun
                                </button>
                                <button @click="exportData('csv')" class="btn btn-outline-secondary">
                                    <i class="ri-download-line me-1"></i>
                                    Export
                                </button>
                                <span class="p-input-icon-left">
                                    <InputText v-model="globalFilterValue" placeholder="Cari Chart of Accounts..." class="w-full md:w-20rem" />
                                </span>
                            </div>
                        </div>
                        <div class="card-header d-flex justify-content-end align-items-center flex-wrap pt-0">
                            <div class="d-flex align-items-center gap-2">
                                <button @click="expandAll" class="btn me-5 p-0 fw-semibold">
                                    <i class="ri-expand-left-right-line me-1"></i>
                                    Expand All
                                </button>
                                <button @click="collapseAll" class="btn me-5 p-0 fw-semibold">
                                    <i class="ri-contract-left-right-line me-1"></i>
                                    Collapse All
                                </button>
                            </div>
                        </div>
                        <div class="card-datatable table-responsive py-3 px-3">
                            <!-- Test: Gunakan PrimeVue DataTable langsung untuk expansion -->
                            <DataTable 
                                ref="myDataTableRef"
                                :value="displayAccounts"
                                :rows="Number(params.rows)" 
                                :loading="loading"
                                :totalRecords="totalRecords"
                                :first="params.first"
                                paginator
                                @page="onPage($event)"
                                @sort="onSort($event)"
                                responsiveLayout="scroll" 
                                paginatorPosition="bottom"
                                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                                v-model:expandedRows="expandedRows"
                                @rowExpand="onRowExpand"
                                @rowCollapse="onRowCollapse"
                                dataKey="id"
                                tableStyle="min-width: 60rem"
                            >
                                <Column :expander="true" style="width: 3rem" />
                                <Column header="#" :sortable="false">
                                    <template #body="slotProps">
                                        {{ params.first + slotProps.index + 1 }}
                                    </template>
                                </Column>
                                <Column field="code" header="Kode Akun" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="fw-semibold">{{ slotProps.data.code }}</span>
                                    </template>
                                </Column>
                                <Column field="name" header="Nama Akun" :sortable="true" style="min-width:200px">
                                    <template #body="slotProps">
                                        <div>
                                            <div class="fw-semibold">{{ slotProps.data.name }}</div>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="category" header="Kategori" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span >
                                            {{ getTypeLabel(slotProps.data.category) }}
                                        </span>
                                    </template>
                                </Column>
                                <Column field="normalBalance" header="Normal Balance" :sortable="true" style="min-width:120px">
                                    <template #body="slotProps">
                                        <span class="badge bg-label-secondary">{{ slotProps.data.normalBalance }}</span>
                                    </template>
                                </Column>
                                <Column field="parent" header="Parent Account" :sortable="true" style="min-width:150px">
                                    <template #body="slotProps">
                                        <span v-if="slotProps.data.parent" class="text-muted">
                                            {{ slotProps.data.parent.code }} - {{ slotProps.data.parent.name }}
                                        </span>
                                        <span v-else class="text-muted">-</span>
                                    </template>
                                </Column>
                                <Column field="level" header="Level" :sortable="true" style="min-width:100px">
                                    <template #body="slotProps">
                                        <span class="badge bg-label-info">{{ slotProps.data.level }}</span>
                                    </template>
                                </Column>
                                <Column field="isParent" header="Tipe" :sortable="true" style="min-width:100px">
                                    <template #body="slotProps">
                                        <span >
                                            {{ slotProps.data.isParent ? 'Parent' : 'Child' }}
                                        </span>
                                    </template>
                                </Column>
                                <Column header="Actions" :exportable="false" style="min-width:8rem">
                                    <template #body="slotProps">
                                        <div class="d-inline-block">
                                            <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                                            </a>
                                            <ul class="dropdown-menu">
                                                <li v-if="userHasRole('superadmin') || userHasPermission('edit_account')">
                                                    <a class="dropdown-item" href="javascript:void(0)" @click="accountStore.openModal(slotProps.data, 'admin')">
                                                        <i class="ri-edit-box-line me-2"></i> Edit
                                                    </a>
                                                </li>
                                                <li v-if="userHasRole('superadmin') || userHasPermission('delete_account')">
                                                    <a class="dropdown-item text-danger" href="javascript:void(0)" @click="accountStore.deleteAccount(slotProps.data.id)">
                                                        <i class="ri-delete-bin-7-line me-2"></i> Hapus
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </template>
                                </Column>
                                <!-- Test Expansion Template -->
                                <template #expansion="slotProps">
                                    <ExpandedRowContent :account="slotProps.data" />
                                </template>
                            </DataTable>
                        </div>
                    </div>
                </div>

                <!-- Account Modal (tetap sama) -->
                <Modal
                    :model-value="showModal"
                    @close="accountStore.closeModal" 
                    id="AccountModal"
                    :title="modalTitle" 
                    :description="modalDescription"
                    :validation-errors-from-parent="validationErrors"
                >
                    <template #default>
                        <form @submit.prevent="accountStore.saveAccount()">
                            <div class="row g-6">
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            v-model="form.code" 
                                            placeholder="Masukkan kode akun"
                                            
                                        >
                                        <label>Kode Akun <span class="text-danger" aria-hidden="true">*</span></label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            v-model="form.name" 
                                            placeholder="Masukkan nama akun"
                                            
                                        >
                                        <label>Nama Akun <span class="text-danger" aria-hidden="true">*</span></label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.category"
                                            
                                        >
                                            <option value="">Pilih Kategori</option>
                                            <option v-for="category in accountCategories" :key="category.value" :value="category.value">
                                                {{ category.label }}
                                            </option>
                                        </select>
                                        <label>Kategori <span class="text-danger" aria-hidden="true">*</span></label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.normalBalance"
                                            
                                        >
                                            <option value="">Pilih Normal Balance</option>
                                            <option value="debit">Debit</option>
                                            <option value="credit">Credit</option>
                                        </select>
                                        <label>Normal Balance <span class="text-danger" aria-hidden="true">*</span></label>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-floating form-floating-outline">
                                        <select 
                                            class="form-select" 
                                            v-model="form.parentId"
                                        >
                                            <option value="">Pilih Parent Account (Opsional)</option>
                                            <option v-for="parent in parentAccounts" :key="parent.id" :value="parent.id">
                                                {{ parent.code }} - {{ parent.name }}
                                            </option>
                                        </select>
                                        <label>Parent Account</label>
                                    </div>
                                </div>
                                
                                <div class="col-md-12">
                                    <div class="form-check form-switch">
                                        <input 
                                            class="form-check-input" 
                                            type="checkbox" 
                                            v-model="form.isParent"
                                            id="isParent"
                                        >
                                        <label class="form-check-label" for="isParent">
                                            Akun Parent
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-outline-secondary" @click="accountStore.closeModal()">
                                    Tutup
                                </button>
                                <button type="submit" class="btn btn-primary" :disabled="saving">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ isEditMode ? 'Update' : 'Simpan' }}
                                </button>
                            </div>
                        </form>
                    </template>
                </Modal>
            </div>
        </div>
        <div class="content-backdrop fade"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '~/stores/accounts'
import { useUserStore } from '~/stores/user'
import { usePermissionsStore } from '~/stores/permissions'
import { usePermissions } from '~/composables/usePermissions'
import { useDebounceFn } from '@vueuse/core'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Modal from '~/components/modal/Modal.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import ExpandedRowContent from '~/components/table/ExpandedRowContent.vue'
import ListPageStatsCards from '~/components/list/ListPageStatsCards.vue'

const { setListTitle, setFormTitle } = useDynamicTitle()

// Stores
const accountStore = useAccountStore()
const userStore = useUserStore()
const permissionStore = usePermissionsStore()
const formatRupiah = useFormatRupiah()

// Router
const router = useRouter()

// Refs
const myDataTableRef = ref()
const globalFilterValue = ref('')
const expandedRows = ref({})
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

// Computed values dari store
const loading = computed(() => accountStore.loading)
const saving = computed(() => accountStore.saving)
const totalRecords = computed(() => {
  // Gunakan jumlah top-level parent accounts untuk pagination
  if (!accountStore.accounts || !Array.isArray(accountStore.accounts)) return 0
  
  // Hanya count top-level parent accounts (level 1, parent_id: null)
  return accountStore.accounts.filter(account => 
    account.level === 1 && !account.parentId
  ).length
})
const params = computed(() => {
  return accountStore.params || {
    first: 0,
    rows: 10,
    sortField: 'code',
    sortOrder: 1,
    search: ''
  }
})
const form = computed(() => accountStore.form)
const isEditMode = computed(() => accountStore.isEditMode)
const showModal = computed(() => accountStore.showModal)
const validationErrors = computed(() => {
  return Array.isArray(accountStore.validationErrors) ? accountStore.validationErrors : []
})
const parentAccounts = computed(() => {
  return Array.isArray(accountStore.parentAccounts) ? accountStore.parentAccounts : []
})
const accountTypes = computed(() => {
  return Array.isArray(accountStore.accountTypes) ? accountStore.accountTypes : []
})
const accountCategories = computed(() => {
  return Array.isArray(accountStore.accountCategories) ? accountStore.accountCategories : []
})

// Processed accounts untuk expanded rows - VERSI SEDERHANA
const processedAccounts = computed(() => {
  if (!accountStore.accounts || !Array.isArray(accountStore.accounts)) {
    return []
  }

  // Hanya ambil TOP-LEVEL parent accounts (level 1, parent_id: null)
  const topLevelParentAccounts = accountStore.accounts.filter(account => 
    account.level === 1 && !account.parentId
  )
  
  // Untuk setiap top-level parent, gunakan children yang sudah ada di store
  const processed = topLevelParentAccounts.map(account => {
    // Gunakan children yang sudah ada di store, jangan buat ulang
    return {
      ...account,
      children: account.children || [] // Gunakan children yang sudah ada
    }
  })

  return processed
})

// Display accounts dengan pagination dan sorting
const displayAccounts = computed(() => {
  if (!processedAccounts.value || processedAccounts.value.length === 0) {
    return []
  }

  let accounts = [...processedAccounts.value]

  // Sorting
  if (params.value.sortField) {
    accounts.sort((a, b) => {
      let aVal = a[params.value.sortField]
      let bVal = b[params.value.sortField]
      
      // Handle string comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (params.value.sortOrder > 0) {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  // Pagination
  const start = params.value.first
  const end = start + params.value.rows
  
  return accounts.slice(start, end)
})

// Statistics yang diperbaiki
const totalAccountsCount = computed(() => {
  if (!accountStore.accounts || !Array.isArray(accountStore.accounts)) return 0
  return accountStore.accounts.length
})

const assetCount = computed(() => {
  if (!accountStore.accounts || !Array.isArray(accountStore.accounts)) return 0
  return accountStore.accounts.filter(acc => acc.category === 'asset').length
})

const liabilityCount = computed(() => {
  if (!accountStore.accounts || !Array.isArray(accountStore.accounts)) return 0
  return accountStore.accounts.filter(acc => acc.category === 'liability').length
})

const equityCount = computed(() => {
  if (!accountStore.accounts || !Array.isArray(accountStore.accounts)) return 0
  return accountStore.accounts.filter(acc => acc.category === 'equity').length
})

// Modal computed
const modalTitle = computed(() => isEditMode.value ? 'Edit Akun' : 'Tambah Akun Baru')
const modalDescription = computed(() => isEditMode.value ? 'Silakan ubah data akun di bawah ini.' : 'Silakan isi form di bawah ini untuk menambahkan akun baru.')

// Methods
const getTypeBadgeClass = (type) => {
    const classes = {
        asset: 'badge bg-label-success',
        liability: 'badge bg-label-warning',
        equity: 'badge bg-label-info',
        revenue: 'badge bg-label-primary',
        expense: 'badge bg-label-danger'
    }
    return classes[type] || 'badge bg-label-secondary'
}

const getTypeLabel = (type) => {
    const labels = {
        asset: 'Asset',
        liability: 'Liability',
        equity: 'Equity',
        revenue: 'Revenue',
        expense: 'Expense'
    }
    return labels[type] || type
}

// Row expansion methods yang diperbaiki
const onRowExpand = (event) => {
    // Row expanded event handler
}

const onRowCollapse = (event) => {
    // Row collapsed event handler
}

const expandAll = () => {
    const allExpanded = {}
    processedAccounts.value.forEach(account => {
        if (account.children && account.children.length > 0) {
            allExpanded[account.id] = true
        }
    })
    expandedRows.value = allExpanded
}

const collapseAll = () => {
    expandedRows.value = {}
}

const openAccountDetails = (accountId) => {
    router.push({ path: `/accounting/accounts/detail`, query: { id: accountId } })
}

const openAddChildModal = (parentAccount) => {
    // Pre-fill form dengan parent account
    accountStore.openModal()
    nextTick(() => {
        accountStore.form.parentId = parentAccount.id
        accountStore.form.level = parentAccount.level + 1
        accountStore.form.category = parentAccount.category
    })
}

const exportData = (format) => {
    if (format === 'csv' && myDataTableRef.value) {
        myDataTableRef.value.exportCSV()
    }
}

// Permission helpers
const { userHasRole, userHasPermission } = usePermissions()

// Lifecycle
const statItems = computed(() => [
  {
    key: 'total-akun',
    label: 'Total Akun',
    value: totalAccountsCount.value,
    subtitle: 'Akun Aktif',
    icon: 'ri-bank-card-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Jumlah Keseluruhan',
      description: 'Jumlah seluruh akun (Chart of Accounts) yang terdaftar dalam sistem, mencakup semua kategori akun.',
    },
  },
  {
    key: 'asset',
    label: 'Asset',
    value: assetCount.value,
    subtitle: 'Akun Asset',
    icon: 'ri-money-dollar-circle-line',
    iconBgClass: 'bg-label-success',
    info: {
      title: 'Akun Asset',
      description: 'Jumlah akun dengan kategori Asset (aktiva) pada Chart of Accounts.',
    },
  },
  {
    key: 'liability',
    label: 'Liability',
    value: liabilityCount.value,
    subtitle: 'Akun Liability',
    icon: 'ri-exchange-funds-line',
    iconBgClass: 'bg-label-warning',
    info: {
      title: 'Akun Liability',
      description: 'Jumlah akun dengan kategori Liability (kewajiban) pada Chart of Accounts.',
    },
  },
  {
    key: 'equity',
    label: 'Equity',
    value: equityCount.value,
    subtitle: 'Akun Equity',
    icon: 'ri-user-star-line',
    iconBgClass: 'bg-label-info',
    info: {
      title: 'Akun Equity',
      description: 'Jumlah akun dengan kategori Equity (ekuitas) pada Chart of Accounts.',
    },
  }
])


onMounted(async () => {
    try {
        await permissionStore.fetchPermissions()
        await userStore.loadUser()
        // Gunakan fetchChartOfAccounts untuk mendapatkan semua top-level accounts dengan children
        await accountStore.fetchChartOfAccounts()
        
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
    setListTitle('Chart of Accounts', totalAccountsCount.value)
})

const debouncedSearch = useDebounceFn((value) => {
  accountStore.setSearch(value)
  expandedRows.value = {}
}, 500)

watch(globalFilterValue, (value) => {
  debouncedSearch(value)
})

// Table events
const onPage = (event) => {
    accountStore.setPagination(event)
}

const onSort = (event) => {
    // Update params untuk client-side sorting
    params.value.sortField = event.sortField || 'code'
    params.value.sortOrder = event.sortOrder || 1
}

const handleRowsChange = (value) => {
    accountStore.params.rows = Number(value) || 10
    accountStore.params.first = 0
}

const handleSearch = async (value) => {
    globalFilterValue.value = value
    accountStore.params.first = 0
    await accountStore.fetchAccounts()
}

// Debug computed untuk memantau perubahan data
watch(() => accountStore.accounts, (newAccounts, oldAccounts) => {
    
    if (newAccounts && newAccounts.length > 0) {
        
    }
}, { deep: true, immediate: true })

// Watch perubahan processedAccounts
watch(processedAccounts, (newProcessed) => {
    
}, { deep: true })

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Chart of Accounts',
  description: 'Chart of Accounts Management',
  keywords: 'Chart of Accounts, Accounting, Sinergi Innovate Pratama',
  author: 'Sinergi Innovate Pratama',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
});
</script>

<style scoped>
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
