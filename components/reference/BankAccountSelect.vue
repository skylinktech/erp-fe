<template>
  <AsyncReferenceSelect
    :model-value="modelValue"
    :fetch-page="fetchPage"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :reload-key="companyId"
    :get-option-label="label"
    :get-secondary-label="(b) => b?.accountNumber || b?.account_number || b?.bankName || ''"
    :reduce="(b) => b?.id ?? null"
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
    modelValue: number | string | null
    companyId: number | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
  }>(),
  {
    placeholder: 'Cari rekening bank…',
    disabled: false,
    clearable: true,
  }
)

defineEmits<{
  'update:modelValue': [value: number | string | null]
  select: [option: any | null]
}>()

function label(b: any) {
  const name = b?.accountName || b?.account_name || b?.name || 'Rekening'
  const bank = b?.bankName || b?.bank_name || b?.bank?.name || ''
  const number = b?.accountNumber || b?.account_number || ''
  return [bank, name, number].filter(Boolean).join(' — ')
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
  const res = await fetch(`${$api.bankAccounts()}?${qs}`, {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  const rows = json.data || json.bankAccounts || []
  return { rows: Array.isArray(rows) ? rows : [], total: json.totalRecords ?? json.meta?.total }
}
</script>
