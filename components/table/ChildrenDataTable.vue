<template>
  <div class="children-data-table mt-3">
    <DataTable 
      :value="children" 
      class="nested-table" 
      tableStyle="min-width: 50rem"
      :paginator="false"
      :rows="100"
      :showGridlines="true"
      v-model:expandedRows="expandedRows"
      @rowExpand="onRowExpand"
      @rowCollapse="onRowCollapse"
      dataKey="id"
    >
      <Column :expander="true" style="width: 3rem">
        <template #body="slotProps">
          <!-- Hanya tampilkan expander jika account memiliki children -->
          <i v-if="slotProps.data.children && slotProps.data.children.length > 0" 
             :class="[
               expandedRows[slotProps.data.id] 
                 ? 'ri-arrow-down-s-line text-secondary cursor-pointer' 
                 : 'ri-arrow-right-s-line text-secondary cursor-pointer'
             ]"
             @click="toggleRow(slotProps.data.id)">
          </i>
        </template>
      </Column>
      <Column field="code" header="Kode" sortable style="width: 120px">
        <template #body="slotProps">
          <span class="fw-semibold">{{ slotProps.data.code }}</span>
        </template>
      </Column>
      
      <Column field="name" header="Nama" sortable style="min-width: 200px">
        <template #body="slotProps">
          <div class="d-flex align-items-center">
            <i class="ri-file-line me-2 text-muted"></i>
            <span>{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      
      <Column field="category" header="Kategori" sortable style="width: 120px">
        <template #body="slotProps">
          <span :class="getTypeBadgeClass(slotProps.data.category)">
            {{ getTypeLabel(slotProps.data.category) }}
          </span>
        </template>
      </Column>
      
      <Column field="normalBalance" class="text-nowrap" header="Normal Balance" sortable style="width: 130px">
        <template #body="slotProps">
          <span class="badge bg-label-secondary">{{ slotProps.data.normalBalance }}</span>
        </template>
      </Column>
      
      <Column field="level" header="Level" sortable style="width: 80px">
        <template #body="slotProps">
          <span class="badge bg-label-info">{{ slotProps.data.level }}</span>
        </template>
      </Column>
      <Column header="Actions" :exportable="false" style="min-width:1rem">
          <template #body="slotProps">
              <div class="d-inline-block">
                  <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-fill"></i>
                  </a>
                  <ul class="dropdown-menu">
                      <li v-if="userHasRole('superadmin') || userHasPermission('edit_account')">
                          <a class="dropdown-item" href="javascript:void(0)" @click="openEditModal(slotProps.data)">
                              <i class="ri-edit-box-line me-2"></i> Edit
                          </a>
                      </li>
                      <li v-if="userHasRole('superadmin') || userHasPermission('delete_account')">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="deleteAccount(slotProps.data.id)">
                              <i class="ri-delete-bin-7-line me-2"></i> Hapus
                          </a>
                      </li>
                  </ul>
              </div>
          </template>
      </Column>
      
      <!-- Expansion Template untuk Children -->
      <template #expansion="slotProps">
        <div class="children-expansion-content p-3 bg-white border-start border-4 border-success">
          <!-- Tampilkan children jika ada -->
          <div v-if="slotProps.data.children && slotProps.data.children.length > 0" class="mt-3">
            
            <!-- Gunakan NestedChildrenTable untuk nested children -->
            <div class="mt-3">
              <h6 class="text-secondary">Sub-accounts (Level {{ slotProps.data.level + 1 }}):</h6>
              <NestedChildrenTable :children="slotProps.data.children" />
            </div>
          </div>
          
          <!-- Empty State untuk Children -->
          <div v-else class="text-center py-4">
            <div class="mb-3">
              <i class="ri-inbox-line ri-48px text-muted"></i>
            </div>
            <p class="text-muted mb-2">Tidak ada sub-akun untuk akun ini</p>
            <small class="text-muted d-block">Level {{ slotProps.data.level }} adalah level terakhir</small>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { usePermissions } from '~/composables/usePermissions'
import { useAccountStore } from '~/stores/accounts'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import NestedChildrenTable from './NestedChildrenTable.vue'
import { ref } from 'vue'

// Props
const props = defineProps({
  children: {
    type: Array,
    required: true
  }
})

// Refs
const expandedRows = ref({})

// Composables
const { userHasRole, userHasPermission } = usePermissions()
const accountStore = useAccountStore()
const router = useRouter()

// Methods
const toggleRow = (accountId) => {
  if (expandedRows.value[accountId]) {
    delete expandedRows.value[accountId]
  } else {
    expandedRows.value[accountId] = true
  }
}

const onRowExpand = (event) => {
  // Row expanded event handler
}

const onRowCollapse = (event) => {
  // Row collapsed event handler
}

const openAccountDetails = (accountId) => {
  router.push({ path: `/accounting/accounts/detail`, query: { id: accountId } })
}

const openEditModal = (account) => {
  accountStore.openModal(account)
}

const deleteAccount = (accountId) => {
  accountStore.deleteAccount(accountId)
}

// Helper functions
const getTypeBadgeClass = (category) => {
  const classes = {
    asset: 'badge bg-label-success',
    liability: 'badge bg-label-danger',
    equity: 'badge bg-label-warning',
    income: 'badge bg-label-info',
    expense: 'badge bg-label-secondary'
  }
  return classes[category] || 'badge bg-label-secondary'
}

const getTypeLabel = (category) => {
  const labels = {
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    income: 'Income',
    expense: 'Expense'
  }
  return labels[category] || category
}
</script>

<style scoped>
.children-data-table {
  border-radius: 0.375rem;
  overflow: hidden;
}

.nested-table {
  box-shadow: none;
}

.nested-table .p-datatable-thead > tr > th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.875rem;
}

.nested-table .p-datatable-tbody > tr > td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f3f4;
}

.nested-table .p-datatable-tbody > tr:hover > td {
  background-color: #e3f2fd !important;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.children-expansion-content {
  background-color: #f8f9fa;
  border-left: 3px solid #198754;
  margin-left: 2rem;
}

.cursor-pointer {
  cursor: pointer;
}

.text-primary {
  color: #0d6efd !important;
}
</style>
