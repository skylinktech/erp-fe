<template>
  <div class="lp-table-header card-header">
    <div class="lp-header-top-row">
      <div class="d-flex align-items-center lp-rows-control">
        <span class="me-2">Baris:</span>
        <Dropdown
          :model-value="rows"
          :options="rowsOptions"
          placeholder="Jumlah"
          style="width: 8rem"
          :show-clear="false"
          @update:model-value="onRowsUpdate"
        />
      </div>
      <div class="lp-add-slot">
        <slot name="add" />
      </div>
      <div v-if="$slots['toolbar-extra']" class="lp-toolbar-extra d-flex flex-wrap align-items-center gap-2">
        <slot name="toolbar-extra" />
      </div>
      <div v-if="showExport" class="btn-group lp-export-group">
        <button
          class="btn btn-outline-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          :disabled="exportDisabled"
        >
          <i class="ri-download-line me-1" />
          Export
        </button>
        <ul class="dropdown-menu">
          <li v-for="item in exportItems" :key="item.value">
            <a
              class="dropdown-item"
              href="javascript:void(0)"
              @click="$emit('export', item.value)"
            >{{ item.label }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="lp-actions-row">
      <span class="p-input-icon-left lp-search-wrap">
        <InputText
          :model-value="search"
          :placeholder="searchPlaceholder"
          class="lp-search-input"
          @update:model-value="onSearchUpdate"
        />
      </span>
    </div>
  </div>
</template>

<script setup>
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'

defineProps({
  rows: { type: Number, required: true },
  rowsOptions: { type: Array, default: () => [10, 25, 50, 100] },
  search: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Cari...' },
  showExport: { type: Boolean, default: true },
  exportDisabled: { type: Boolean, default: false },
  exportItems: {
    type: Array,
    default: () => [
      { value: 'excel', label: 'Excel' },
      { value: 'pdf', label: 'PDF' },
    ],
  },
})

const emit = defineEmits(['update:rows', 'update:search', 'export'])

function onRowsUpdate(value) {
  emit('update:rows', Number(value) || 10)
}

function onSearchUpdate(value) {
  emit('update:search', value ?? '')
}
</script>

<style scoped>
.lp-table-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lp-header-top-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  flex-wrap: nowrap;
}

.lp-header-top-row :deep(.btn),
.lp-export-group .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  min-height: 2.375rem;
  padding-top: 0.4375rem;
  padding-bottom: 0.4375rem;
  line-height: 1.25;
}

.lp-header-top-row :deep(.btn.btn-sm) {
  min-height: 2.375rem;
  padding: 0.4375rem 1rem;
  font-size: 0.9375rem;
}

.lp-add-slot,
.lp-toolbar-extra {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.lp-rows-control {
  min-width: 0;
}

.lp-rows-control :deep(.p-dropdown) {
  min-height: 2.375rem;
  align-items: center;
}

.lp-rows-control :deep(.p-dropdown .p-dropdown-label) {
  display: flex;
  align-items: center;
  min-height: 2.375rem;
  padding-top: 0;
  padding-bottom: 0;
}

.lp-actions-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.lp-actions-row .p-input-icon-left {
  display: block;
  width: 100%;
}

.lp-search-wrap {
  width: 100%;
}

.lp-search-input {
  width: 100% !important;
  min-height: 2.375rem !important;
  height: 2.375rem;
  box-sizing: border-box;
}

.lp-export-group {
  flex: 0 0 auto;
}

@media (min-width: 768px) {
  .lp-table-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .lp-header-top-row {
    flex: 0 0 auto;
  }

  .lp-actions-row {
    width: auto;
  }

  .lp-actions-row .p-input-icon-left {
    width: auto;
  }

  .lp-search-wrap {
    width: auto;
  }

  .lp-search-input {
    width: 20rem !important;
  }
}

@media (max-width: 767.98px) {
  .lp-actions-row {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (min-width: 768px) and (max-width: 991.98px) {
  .lp-table-header {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0.75rem;
  }

  .lp-header-top-row {
    width: 100%;
    justify-content: flex-start;
  }

  .lp-actions-row {
    width: 100%;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .lp-export-group {
    margin-left: 0.5rem;
  }

  .lp-search-wrap {
    width: 100% !important;
    flex-basis: 100%;
  }

  .lp-search-input {
    width: 100% !important;
  }
}
</style>
