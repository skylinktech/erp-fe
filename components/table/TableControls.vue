<template>
  <ListPageTableHeader
    :rows="rowsPerPage"
    :rows-options="rowsPerPageOptions"
    :search="searchValue"
    :search-placeholder="searchPlaceholder"
    :show-export="showExport"
    :export-items="exportItems"
    @update:rows="onRowsUpdate"
    @update:search="onSearchUpdate"
    @export="handleExport"
  >
    <template v-if="$slots.add" #add>
      <slot name="add" />
    </template>
    <template v-if="$slots['toolbar-extra']" #toolbar-extra>
      <slot name="toolbar-extra" />
    </template>
  </ListPageTableHeader>
</template>

<script setup>
import { ref, watch } from 'vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      rows: 10,
      search: '',
    }),
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100],
  },
  searchPlaceholder: {
    type: String,
    default: 'Cari...',
  },
  showExport: {
    type: Boolean,
    default: true,
  },
  exportItems: {
    type: Array,
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue', 'rows-change', 'search', 'export'])

const rowsPerPage = ref(Number(props.modelValue.rows) || 10)
const searchValue = ref(props.modelValue.search || '')

function onRowsUpdate(value) {
  rowsPerPage.value = value
  emit('rows-change', value)
  emit('update:modelValue', { ...props.modelValue, rows: value })
}

function onSearchUpdate(value) {
  searchValue.value = value
  emit('search', value)
  emit('update:modelValue', { ...props.modelValue, search: value })
}

function handleExport(type) {
  emit('export', type)
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue.rows !== undefined) rowsPerPage.value = Number(newValue.rows) || 10
    if (newValue.search !== undefined) searchValue.value = newValue.search
  },
  { deep: true },
)
</script>
