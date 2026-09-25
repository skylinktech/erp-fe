<template>
  <CustomSelect2
    :model-value="modelValue"
    :options="options"
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    :searchable="true"
    :placeholder="placeholder"
    :search-placeholder="searchPlaceholder"
    :no-options-text="emptyText"
    :get-option-label="labelFn"
    :reduce="reduceFn"
    :filter-by="passthroughFilter"
    :is-invalid="isInvalid"
    append-to-body
    @update:model-value="onUpdate"
    @search="onSearch"
    @open="onOpen"
    @clear="onClear"
  >
    <template #option="{ option }">
      <slot name="option" :option="option">
        <div class="async-ref-option">
          <div class="async-ref-option__primary">{{ labelFn(option) }}</div>
          <div v-if="secondaryLabel(option)" class="async-ref-option__secondary text-muted small">
            {{ secondaryLabel(option) }}
          </div>
        </div>
      </slot>
    </template>
  </CustomSelect2>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import CustomSelect2 from '~/components/CustomSelect2.vue'

export type AsyncFetchParams = {
  search: string
  page: number
  perPage: number
}

export type AsyncFetchResult<T = any> = {
  rows: T[]
  total?: number
  hasMore?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null
    fetchPage: (params: AsyncFetchParams) => Promise<AsyncFetchResult>
    getOptionLabel?: (option: any) => string
    getSecondaryLabel?: (option: any) => string
    reduce?: (option: any) => string | number | null
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    clearable?: boolean
    required?: boolean
    isInvalid?: boolean
    debounceMs?: number
    perPage?: number
    /** Extra deps that force reload (e.g. companyId, warehouseId). */
    reloadKey?: string | number | null
  }>(),
  {
    placeholder: 'Cari…',
    searchPlaceholder: 'Ketik untuk mencari…',
    emptyText: 'Tidak ada hasil',
    disabled: false,
    clearable: true,
    required: false,
    isInvalid: false,
    debounceMs: 300,
    perPage: 20,
    reloadKey: null,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  select: [option: any | null]
}>()

const options = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const search = ref('')
const selectedCache = ref<any | null>(null)

const labelFn = (option: any) => {
  if (props.getOptionLabel) return props.getOptionLabel(option)
  if (!option) return ''
  return option.label || option.name || option.nmWarehouse || option.nm_warehouse || String(option.id ?? '')
}

const secondaryLabel = (option: any) => {
  if (props.getSecondaryLabel) return props.getSecondaryLabel(option)
  return option?.sku || option?.code || option?.kodeWarehouse || option?.kode_warehouse || ''
}

const reduceFn = (option: any) => {
  if (props.reduce) return props.reduce(option)
  return option?.id ?? null
}

const passthroughFilter = () => true

async function load(reset = false) {
  if (props.disabled) return
  if (reset) {
    page.value = 1
    options.value = []
  }
  loading.value = true
  try {
    const result = await props.fetchPage({
      search: search.value,
      page: page.value,
      perPage: props.perPage,
    })
    const rows = Array.isArray(result?.rows) ? result.rows : []
    if (reset) options.value = rows
    else options.value = [...options.value, ...rows]
    if (selectedCache.value) {
      const id = reduceFn(selectedCache.value)
      if (!options.value.some((row) => reduceFn(row) === id)) {
        options.value = [selectedCache.value, ...options.value]
      }
    }
  } catch {
    if (reset) options.value = []
  } finally {
    loading.value = false
  }
}

const debouncedSearch = useDebounceFn((term: string) => {
  search.value = term || ''
  void load(true)
}, props.debounceMs)

function onSearch(term: string) {
  debouncedSearch(term)
}

function onOpen() {
  if (!options.value.length) void load(true)
}

function onUpdate(value: string | number | null) {
  emit('update:modelValue', value)
  const found = options.value.find((row) => reduceFn(row) === value) || null
  if (found) selectedCache.value = found
  emit('select', found)
}

function onClear() {
  selectedCache.value = null
  emit('update:modelValue', null)
  emit('select', null)
}

watch(
  () => props.reloadKey,
  () => {
    selectedCache.value = null
    void load(true)
  }
)

onMounted(() => {
  void load(true)
})
</script>

<style scoped>
.async-ref-option__primary {
  font-weight: 500;
  line-height: 1.25;
}
.async-ref-option__secondary {
  font-size: 0.75rem;
}
</style>
