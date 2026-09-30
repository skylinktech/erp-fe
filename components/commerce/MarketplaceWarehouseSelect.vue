<template>
  <div>
    <CustomSelect2
      v-if="mode === 'dropdown'"
      :model-value="modelValue || null"
      :options="visibleOptions"
      :loading="loading"
      :disabled="disabled || !shopId"
      :clearable="clearable"
      :searchable="true"
      :placeholder="placeholder"
      search-placeholder="Cari nama atau ID gudang…"
      :no-options-text="emptyText"
      :get-option-label="optionLabel"
      :reduce="(o) => o?.id ?? null"
      :is-invalid="isInvalid"
      append-to-body
      @update:model-value="onUpdate"
    >
      <template #option="{ option }">
        <div class="mp-wh-option">
          <div class="mp-wh-option__primary">{{ marketplaceWarehouseOptionLabel(option) }}</div>
          <div class="mp-wh-option__secondary text-muted small font-monospace">{{ option.id }}</div>
        </div>
      </template>
    </CustomSelect2>
    <input
      v-else
      id="wh-form-ext"
      class="form-control font-monospace"
      :value="modelValue"
      :disabled="disabled || !shopId || loading"
      :placeholder="manualPlaceholder"
      :aria-invalid="isInvalid ? true : undefined"
      @input="onTextInput"
    />
    <div v-if="loadError" class="form-text text-danger">{{ loadError }}</div>
    <div v-else-if="helperText" class="form-text">{{ helperText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { readAccessToken } from '~/utils/authCookie'
import {
  marketplaceWarehouseOptionLabel,
  withCurrentWarehouseOption,
  type MarketplaceWarehouseOption,
} from '~/utils/commerceMarketplaceWarehouse'

const props = withDefaults(
  defineProps<{
    modelValue: string | null
    shopId: string | null
    platformCode?: string | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    isInvalid?: boolean
  }>(),
  {
    platformCode: null,
    placeholder: 'Pilih gudang marketplace…',
    disabled: false,
    clearable: true,
    isInvalid: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()

const loading = ref(false)
const loadError = ref('')
const unsupported = ref(false)
const options = ref<MarketplaceWarehouseOption[]>([])
let abort: AbortController | null = null

const visibleOptions = computed(() =>
  withCurrentWarehouseOption(options.value, props.modelValue)
)

const mode = computed<'dropdown' | 'manual'>(() =>
  options.value.length > 0 ? 'dropdown' : 'manual'
)

const emptyText = computed(() =>
  loadError.value ? 'Gagal memuat gudang marketplace' : 'Tidak ada gudang marketplace'
)

const manualPlaceholder = computed(() =>
  props.shopId ? 'ID dari seller center' : 'Pilih toko dulu'
)

const helperText = computed(() => {
  if (!props.shopId) return 'Pilih toko dulu untuk memuat gudang marketplace.'
  if (loading.value) return 'Memuat gudang dari seller center…'
  if (unsupported.value) {
    return 'Kanal ini belum menyediakan daftar gudang. Isi ID dari Seller Center. Bukan nama gudang baru di SkyFlow.'
  }
  if (options.value.length) {
    return props.platformCode === 'TIKTOK_SHOP'
      ? 'Wajib agar mapping dianggap lengkap. Daftar diambil dari API TikTok (Seller Center), bukan nama gudang baru di SkyFlow.'
      : 'Wajib agar mapping dianggap lengkap. Daftar diambil dari Seller Center, bukan nama gudang baru di SkyFlow.'
  }
  return 'Toko ini belum punya gudang di Seller Center, atau daftar gagal dimuat. Isi ID secara manual. Bukan nama gudang baru di SkyFlow.'
})

function optionLabel(o: MarketplaceWarehouseOption) {
  return marketplaceWarehouseOptionLabel(o)
}

function onUpdate(v: string | number | null) {
  emit('update:modelValue', v == null ? '' : String(v))
}

function onTextInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

async function loadForShop(shopId: string) {
  abort?.abort()
  abort = new AbortController()
  const signal = abort.signal
  loading.value = true
  loadError.value = ''
  unsupported.value = false
  options.value = []
  try {
    const token = readAccessToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (companyId.value) headers['X-Company-Id'] = String(companyId.value)
    const res = await fetch($api.commerceShopExternalWarehouses(shopId), {
      credentials: 'include',
      headers,
      signal,
    })
    const json = await res.json().catch(() => ({}))
    if (signal.aborted) return
    const code = String(json.code || '')
    if (code === 'COMMERCE_CAPABILITY_UNSUPPORTED') {
      unsupported.value = true
      options.value = []
      return
    }
    if (!res.ok || json.success === false) {
      throw new Error(json.message || 'Gagal memuat gudang marketplace')
    }
    const rows = Array.isArray(json.data) ? json.data : []
    options.value = rows
      .map((r: any) => ({
        id: String(r?.id || '').trim(),
        name: String(r?.name || r?.id || '').trim(),
        type: r?.type ?? null,
        subType: r?.subType ?? null,
        effectStatus: r?.effectStatus ?? null,
        isDefault: r?.isDefault ?? null,
        usable: r?.usable !== false,
      }))
      .filter((r: MarketplaceWarehouseOption) => r.id)
  } catch (e: any) {
    if (e?.name === 'AbortError') return
    loadError.value = e?.message || 'Gagal memuat gudang marketplace'
    options.value = []
  } finally {
    if (!signal.aborted) loading.value = false
  }
}

watch(
  () => [props.shopId, companyId.value] as const,
  ([shopId]) => {
    const id = String(shopId || '').trim()
    abort?.abort()
    loadError.value = ''
    unsupported.value = false
    options.value = []
    if (!id) {
      loading.value = false
      return
    }
    void loadForShop(id)
  },
  { immediate: true }
)

onBeforeUnmount(() => abort?.abort())
</script>

<style scoped>
.mp-wh-option__primary {
  font-size: 0.875rem;
  line-height: 1.3;
}
.mp-wh-option__secondary {
  margin-top: 0.125rem;
}
</style>
