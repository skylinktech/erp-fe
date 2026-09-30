<template>
  <CustomSelect2
    :model-value="modelValue"
    :options="options"
    :loading="loading"
    :disabled="disabled || !shopId"
    :clearable="clearable"
    :searchable="true"
    :placeholder="placeholder"
    search-placeholder="Cari nama kategori…"
    :no-options-text="emptyText"
    :get-option-label="(o) => o?.pathLabel || o?.name || o?.id || ''"
    :reduce="(o) => o?.id ?? null"
    :is-invalid="isInvalid"
    append-to-body
    @update:model-value="onUpdate"
    @open="ensureLoaded"
  >
    <template #option="{ option }">
      <div class="tiktok-cat-option">
        <div class="tiktok-cat-option__primary">{{ option.pathLabel || option.name }}</div>
        <div class="tiktok-cat-option__secondary text-muted small font-monospace">{{ option.id }}</div>
      </div>
    </template>
  </CustomSelect2>
  <div v-if="loadError" class="form-text text-danger">{{ loadError }}</div>
  <div v-else-if="!shopId" class="form-text text-muted">Pilih shop draft dulu untuk memuat kategori TikTok.</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { readAccessToken } from '~/utils/authCookie'
import {
  flattenListingCategoryLeaves,
  type ListingCategoryLeafOption,
  type ListingCategoryNode,
} from '~/utils/commerceListingCategories'

/**
 * Per-shop leaf cache — one TikTok Get Categories call per shop per session
 * (anti N+1 when opening multiple drafts for the same shop).
 * Bump key when leaf-assembly logic changes so stale parent-only options are dropped.
 */
const CACHE_VER = 'v4-v2-leaves'
const leafCache = new Map<string, ListingCategoryLeafOption[]>()

function cacheKey(shopId: string) {
  return `${CACHE_VER}:${shopId}`
}

const props = withDefaults(
  defineProps<{
    modelValue: string | null
    shopId: string | null
    locale?: string | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    isInvalid?: boolean
  }>(),
  {
    locale: 'id-ID',
    placeholder: 'Pilih kategori leaf TikTok…',
    disabled: false,
    clearable: true,
    isInvalid: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  select: [option: ListingCategoryLeafOption | null]
}>()

const loading = ref(false)
const loadError = ref('')
const options = ref<ListingCategoryLeafOption[]>([])

const emptyText = computed(() =>
  loadError.value ? 'Gagal memuat kategori' : 'Tidak ada kategori leaf'
)

function onUpdate(v: string | number | null) {
  const id = v == null || v === '' ? null : String(v)
  emit('update:modelValue', id)
  const opt = id ? options.value.find((o) => o.id === id) || null : null
  emit('select', opt)
}

async function ensureLoaded() {
  const shopId = String(props.shopId || '').trim()
  if (!shopId) {
    options.value = []
    return
  }
  const cached = leafCache.get(cacheKey(shopId))
  if (cached) {
    options.value = cached
    return
  }
  await loadForShop(shopId)
}

async function loadForShop(shopId: string) {
  loading.value = true
  loadError.value = ''
  try {
    const { $api } = useNuxtApp() as any
    const token = readAccessToken()
    const qs = new URLSearchParams({ shopId })
    if (props.locale) qs.set('locale', String(props.locale))
    const res = await fetch(`${$api.commerceListingCategories()}?${qs}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      throw new Error(json.message || 'Gagal memuat kategori TikTok')
    }
    const tree = (json.data || []) as ListingCategoryNode[]
    const leaves = flattenListingCategoryLeaves(Array.isArray(tree) ? tree : [])
    leafCache.set(cacheKey(shopId), leaves)
    options.value = leaves
    // Drop stale non-leaf ids (e.g. parent category saved before forest fix).
    if (props.modelValue && !leaves.some((l) => l.id === props.modelValue)) {
      emit('update:modelValue', null)
      emit('select', null)
    }
  } catch (e: any) {
    loadError.value = e?.message || 'Gagal memuat kategori'
    options.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.shopId,
  (id) => {
    const shopId = String(id || '').trim()
    if (!shopId) {
      options.value = []
      return
    }
    const cached = leafCache.get(cacheKey(shopId))
    if (cached) options.value = cached
    else void loadForShop(shopId)
  },
  { immediate: true }
)
</script>

<style scoped>
.tiktok-cat-option__primary {
  font-size: 0.875rem;
  line-height: 1.3;
}
.tiktok-cat-option__secondary {
  margin-top: 0.125rem;
}
</style>
