<template>
  <div class="nested-children-table">
    <DataTable 
      :value="children" 
      class="nested-table" 
      tableStyle="min-width: 40rem"
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
                 ? 'ri-arrow-down-s-line text-primary cursor-pointer' 
                 : 'ri-arrow-right-s-line text-primary cursor-pointer'
             ]"
             @click="toggleRow(slotProps.data.id)">
          </i>
        </template>
      </Column>
      
      <Column field="code" header="Kode" sortable style="width: 100px">
        <template #body="slotProps">
          <span class="fw-semibold">{{ slotProps.data.code }}</span>
        </template>
      </Column>
      
      <Column field="name" header="Nama" sortable style="min-width: 150px">
        <template #body="slotProps">
          <div class="d-flex align-items-center">
            <i class="ri-file-line me-2 text-muted"></i>
            <span>{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      
      <Column field="category" header="Kategori" sortable style="width: 100px">
        <template #body="slotProps">
          <span :class="getTypeBadgeClass(slotProps.data.category)">
            {{ getTypeLabel(slotProps.data.category) }}
          </span>
        </template>
      </Column>
      
      <Column field="level" header="Level" sortable style="width: 70px">
        <template #body="slotProps">
          <span class="badge bg-label-info">{{ slotProps.data.level }}</span>
        </template>
      </Column>
      
      <Column header="Has Children" :exportable="false" style="width: 100px">
        <template #body="slotProps">
          <span :class="slotProps.data.children && slotProps.data.children.length > 0 ? 'badge bg-success' : 'badge bg-secondary'">
            {{ slotProps.data.children && slotProps.data.children.length > 0 ? 'Yes' : 'No' }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// Props
const props = defineProps({
  children: {
    type: Array,
    required: true
  }
})

// Refs
const expandedRows = ref({})

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
.nested-children-table {
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

.nested-expansion-content {
  background-color: #f8f9fa;
  border-left: 3px solid #fd7e14;
  margin-left: 2rem;
}

.cursor-pointer {
  cursor: pointer;
}

.text-primary {
  color: #0d6efd !important;
}

/* Styling untuk nested expansion dengan warna berbeda untuk setiap level */
.nested-expansion-content .nested-expansion-content {
  margin-left: 2rem;
  border-left-color: #6f42c1;
}

.nested-expansion-content .nested-expansion-content .nested-expansion-content {
  margin-left: 2rem;
  border-left-color: #e83e8c;
}

.nested-expansion-content .nested-expansion-content .nested-expansion-content .nested-expansion-content {
  margin-left: 2rem;
  border-left-color: #20c997;
}
</style>
