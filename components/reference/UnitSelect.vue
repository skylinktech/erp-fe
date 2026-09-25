<template>
  <AsyncReferenceSelect
    :model-value="modelValue"
    :fetch-page="fetchPage"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :get-option-label="(u) => u?.name || u?.nmUnit || u?.symbol || ''"
    :get-secondary-label="(u) => u?.symbol || u?.code || ''"
    :reduce="(u) => u?.id ?? null"
    @update:model-value="$emit('update:modelValue', $event)"
    @select="$emit('select', $event)"
  />
</template>

<script setup lang="ts">
import AsyncReferenceSelect from '~/components/reference/AsyncReferenceSelect.vue'
import { readAccessToken } from '~/utils/authCookie'
import type { AsyncFetchParams } from '~/components/reference/AsyncReferenceSelect.vue'

withDefaults(
  defineProps<{
    modelValue: number | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
  }>(),
  {
    placeholder: 'Cari satuan…',
    disabled: false,
    clearable: true,
  }
)

defineEmits<{
  'update:modelValue': [value: number | null]
  select: [option: any | null]
}>()

async function fetchPage(params: AsyncFetchParams) {
  const { $api } = useNuxtApp()
  const token = readAccessToken()
  const qs = new URLSearchParams({
    page: String(params.page),
    rows: String(params.perPage),
    search: params.search || '',
  })
  const endpoint = typeof ($api as any).units === 'function' ? ($api as any).units() : `${($api as any).apiBase || ''}/units`
  const res = await fetch(`${endpoint}?${qs}`, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  const rows = json.data || json.units || []
  return { rows: Array.isArray(rows) ? rows : [], total: json.totalRecords ?? json.meta?.total }
}
</script>
