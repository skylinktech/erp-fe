<template>
  <AsyncReferenceSelect
    :model-value="modelValue"
    :fetch-page="fetchPage"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :reload-key="companyId"
    :get-option-label="(c) => c?.name || c?.nmCustomer || ''"
    :get-secondary-label="(c) => c?.code || c?.email || ''"
    :reduce="(c) => c?.id ?? null"
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
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
  }>(),
  {
    placeholder: 'Cari pelanggan…',
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
  const endpoint = typeof ($api as any).customers === 'function' ? ($api as any).customers() : `${($api as any).apiBase || ''}/customers`
  const res = await fetch(`${endpoint}?${qs}`, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  const rows = json.data || json.customers || []
  return { rows: Array.isArray(rows) ? rows : [], total: json.totalRecords ?? json.meta?.total }
}
</script>
