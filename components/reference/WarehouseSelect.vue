<template>
  <AsyncReferenceSelect
    :model-value="modelValue"
    :fetch-page="fetchPage"
    :placeholder="placeholder"
    :disabled="disabled || !companyId"
    :clearable="clearable"
    :reload-key="reloadKey"
    :get-option-label="label"
    :get-secondary-label="(w) => w?.kodeWarehouse || w?.kode_warehouse || w?.code || ''"
    :reduce="(w) => w?.id ?? null"
    empty-text="Tidak ada gudang untuk perusahaan ini"
    @update:model-value="$emit('update:modelValue', $event)"
    @select="$emit('select', $event)"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import AsyncReferenceSelect from '~/components/reference/AsyncReferenceSelect.vue'
import { apiFetch } from '~/utils/apiFetch'
import type { AsyncFetchParams } from '~/components/reference/AsyncReferenceSelect.vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    companyId: number | null
    /** When true, only warehouses allocated to the company (POS / ops). */
    allocatedOnly?: boolean
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
  }>(),
  {
    allocatedOnly: true,
    placeholder: 'Cari gudang…',
    disabled: false,
    clearable: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  select: [option: any | null]
}>()

const reloadKey = computed(() =>
  [props.companyId ?? '', props.allocatedOnly ? '1' : '0'].join(':')
)

function label(w: any) {
  const name = w?.nmWarehouse || w?.nm_warehouse || w?.name || ''
  const code = w?.kodeWarehouse || w?.kode_warehouse || w?.code || ''
  return code ? `${name} (${code})` : name
}

watch(
  () => props.companyId,
  (next, prev) => {
    if (prev != null && next !== prev && props.modelValue != null) {
      emit('update:modelValue', null)
      emit('select', null)
    }
  }
)

async function fetchPage(params: AsyncFetchParams) {
  if (!props.companyId) return { rows: [], total: 0 }
  const { $api } = useNuxtApp()
  const endpoint =
    typeof ($api as any).warehouses === 'function'
      ? ($api as any).warehouses()
      : ($api as any).warehouse?.() || `${($api as any).apiBase || ''}/warehouse`

  const result = await apiFetch<any>(endpoint, {
    method: 'GET',
    query: {
      page: params.page,
      rows: params.perPage,
      search: params.search || '',
      perusahaanId: props.companyId,
      ...(props.allocatedOnly ? { allocatedOnly: '1' } : {}),
    },
    headers: {
      'X-Company-Id': String(props.companyId),
    },
  })

  const rows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result?.warehouses)
      ? result.warehouses
      : []
  return {
    rows,
    total: Number(result?.meta?.total ?? result?.totalRecords ?? rows.length) || 0,
  }
}
</script>
