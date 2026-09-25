<template>
  <AsyncReferenceSelect
    :model-value="modelValue"
    :fetch-page="fetchPage"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :reload-key="companyId"
    :get-option-label="(p) => p?.name || p?.nmProduct || ''"
    :get-secondary-label="(p) => (p?.sku ? `SKU: ${p.sku}` : '')"
    :reduce="(p) => p?.id ?? null"
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
    warehouseId?: number | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
  }>(),
  {
    warehouseId: null,
    placeholder: 'Cari produk / SKU…',
    disabled: false,
    clearable: true,
  }
)

defineEmits<{
  'update:modelValue': [value: number | null]
  select: [option: any | null]
}>()

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
  if (props.warehouseId) qs.set('warehouseId', String(props.warehouseId))
  const res = await fetch(`${$api.products()}?${qs}`, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  const rows = json.data || json.products || []
  return { rows: Array.isArray(rows) ? rows : [], total: json.totalRecords ?? json.meta?.total }
}
</script>
