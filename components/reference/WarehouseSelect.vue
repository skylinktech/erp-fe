<template>
  <AsyncReferenceSelect
    :model-value="modelValue"
    :fetch-page="fetchPage"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :reload-key="companyId"
    :get-option-label="label"
    :get-secondary-label="(w) => w?.kodeWarehouse || w?.kode_warehouse || w?.code || ''"
    :reduce="(w) => w?.id ?? null"
    @update:model-value="$emit('update:modelValue', $event)"
    @select="$emit('select', $event)"
  />
</template>

<script setup lang="ts">
import AsyncReferenceSelect from '~/components/reference/AsyncReferenceSelect.vue'
import { readAccessToken } from '~/utils/authCookie'
import type { AsyncFetchParams } from '~/components/reference/AsyncReferenceSelect.vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    companyId: number | null
    /** When true, prefer company warehouse allocations endpoint if available. */
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

defineEmits<{
  'update:modelValue': [value: number | null]
  select: [option: any | null]
}>()

function label(w: any) {
  const name = w?.nmWarehouse || w?.nm_warehouse || w?.name || ''
  const code = w?.kodeWarehouse || w?.kode_warehouse || w?.code || ''
  return code ? `${name} (${code})` : name
}

async function fetchPage(params: AsyncFetchParams) {
  if (!props.companyId) return { rows: [] }
  const { $api } = useNuxtApp()
  const token = readAccessToken()
  const qs = new URLSearchParams({
    page: String(params.page),
    rows: String(params.perPage),
    search: params.search || '',
    perusahaanId: String(props.companyId),
  })
  if (props.allocatedOnly) qs.set('allocatedOnly', '1')
  const endpoint = typeof ($api as any).warehouses === 'function' ? ($api as any).warehouses() : `${($api as any).apiBase || ''}/warehouses`
  const res = await fetch(`${endpoint}?${qs}`, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  const rows = json.data || json.warehouses || []
  return { rows: Array.isArray(rows) ? rows : [], total: json.totalRecords ?? json.meta?.total }
}
</script>
