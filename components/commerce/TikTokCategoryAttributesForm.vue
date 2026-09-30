<template>
  <div class="tiktok-attrs">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <span v-if="loading" class="small text-muted">Memuat…</span>
    </div>

    <div v-if="!categoryId" class="form-text text-muted">Pilih kategori leaf dulu untuk memuat atribut wajib.</div>
    <div v-else-if="loadError" class="form-text text-danger">{{ loadError }}</div>
    <div v-else-if="!loading && !mandatoryDefs.length" class="form-text text-muted">
      Tidak ada atribut wajib untuk kategori ini.
    </div>

    <div v-else class="row g-2">
      <div v-for="attr in mandatoryDefs" :key="attr.id" class="col-md-12">
        <label class="form-label">
          {{ attr.name }}
          <span class="text-danger">*</span>
          <span class="text-muted small font-monospace ms-1">{{ attr.id }}</span>
        </label>

        <select
          v-if="attr.values?.length && !attr.isMultipleSelection"
          class="form-select"
          :value="singleSelectedId(attr.id)"
          :disabled="disabled"
          @change="onSingleSelect(attr, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Pilih {{ attr.name }}…</option>
          <option v-for="v in attr.values" :key="v.id || v.name" :value="v.id || v.name">
            {{ v.name }}
          </option>
        </select>

        <select
          v-else-if="attr.values?.length && attr.isMultipleSelection"
          class="form-select"
          multiple
          :value="multiSelectedIds(attr.id)"
          :disabled="disabled"
          @change="onMultiSelect(attr, $event)"
        >
          <option v-for="v in attr.values" :key="v.id || v.name" :value="v.id || v.name">
            {{ v.name }}
          </option>
        </select>

        <input
          v-else
          type="text"
          class="form-control"
          :value="customName(attr.id)"
          :disabled="disabled"
          :placeholder="`Isi ${attr.name}`"
          @input="onCustomInput(attr, ($event.target as HTMLInputElement).value)"
        />

        <div v-if="attr.isCustomizable && attr.values?.length" class="mt-1">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="customName(attr.id)"
            :disabled="disabled"
            :placeholder="`Atau isi kustom ${attr.name}`"
            @input="onCustomInput(attr, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <div v-if="optionalDefs.length" class="mt-3">
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="showOptional = !showOptional">
        {{ showOptional ? 'Sembunyikan' : 'Tampilkan' }} atribut opsional ({{ optionalDefs.length }})
      </button>
      <div v-if="showOptional" class="row g-2 mt-1">
        <div v-for="attr in optionalDefs" :key="attr.id" class="col-md-6">
          <label class="form-label">
            {{ attr.name }}
            <span class="text-muted small font-monospace ms-1">{{ attr.id }}</span>
          </label>
          <select
            v-if="attr.values?.length"
            class="form-select"
            :value="singleSelectedId(attr.id)"
            :disabled="disabled"
            @change="onSingleSelect(attr, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">—</option>
            <option v-for="v in attr.values" :key="v.id || v.name" :value="v.id || v.name">
              {{ v.name }}
            </option>
          </select>
          <input
            v-else
            type="text"
            class="form-control"
            :value="customName(attr.id)"
            :disabled="disabled"
            @input="onCustomInput(attr, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { readAccessToken } from '~/utils/authCookie'
import {
  getSelectedCustomName,
  getSelectedValueIds,
  upsertProductAttribute,
  type CategoryAttributeOption,
  type ProductAttributeSelection,
} from '~/utils/commerceProductAttributes'

/** Per shop+category cache — one Rules+Attributes call pair per category per session. */
const CACHE_VER = 'v1-attrs'
const rulesCache = new Map<string, CategoryAttributeOption[]>()

function cacheKey(shopId: string, categoryId: string) {
  return `${CACHE_VER}:${shopId}:${categoryId}`
}

const props = withDefaults(
  defineProps<{
    modelValue: ProductAttributeSelection[] | null
    shopId: string | null
    categoryId: string | null
    locale?: string | null
    disabled?: boolean
  }>(),
  {
    locale: 'id-ID',
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: ProductAttributeSelection[]]
}>()

const loading = ref(false)
const loadError = ref('')
const defs = ref<CategoryAttributeOption[]>([])
const showOptional = ref(false)

const mandatoryDefs = computed(() => defs.value.filter((d) => d.isMandatory))
const optionalDefs = computed(() => defs.value.filter((d) => !d.isMandatory))

function emitUpsert(attributeId: string, values: Array<{ id?: string; name: string }>) {
  emit('update:modelValue', upsertProductAttribute(props.modelValue, attributeId, values))
}

function singleSelectedId(attributeId: string) {
  const ids = getSelectedValueIds(props.modelValue, attributeId)
  return ids[0] || ''
}

function multiSelectedIds(attributeId: string) {
  return getSelectedValueIds(props.modelValue, attributeId)
}

function customName(attributeId: string) {
  return getSelectedCustomName(props.modelValue, attributeId)
}

function onSingleSelect(attr: CategoryAttributeOption, raw: string) {
  const key = String(raw || '').trim()
  if (!key) {
    emitUpsert(attr.id, [])
    return
  }
  const opt = (attr.values || []).find((v) => String(v.id || v.name) === key)
  if (opt) emitUpsert(attr.id, [{ id: opt.id || undefined, name: opt.name }])
  else emitUpsert(attr.id, [{ name: key }])
}

function onMultiSelect(attr: CategoryAttributeOption, event: Event) {
  const el = event.target as HTMLSelectElement
  const selected = Array.from(el.selectedOptions).map((o) => o.value)
  const values = selected
    .map((key) => {
      const opt = (attr.values || []).find((v) => String(v.id || v.name) === key)
      return opt ? { id: opt.id || undefined, name: opt.name } : { name: key }
    })
    .filter((v) => v.name)
  emitUpsert(attr.id, values)
}

function onCustomInput(attr: CategoryAttributeOption, raw: string) {
  const name = String(raw || '').trim()
  emitUpsert(attr.id, name ? [{ name }] : [])
}

async function loadForCategory(shopId: string, categoryId: string) {
  loading.value = true
  loadError.value = ''
  try {
    const cached = rulesCache.get(cacheKey(shopId, categoryId))
    if (cached) {
      defs.value = cached
      return
    }
    const { $api } = useNuxtApp() as any
    const token = readAccessToken()
    const qs = new URLSearchParams({ shopId })
    if (props.locale) qs.set('locale', String(props.locale))
    const res = await fetch(`${$api.commerceListingCategoryRules(categoryId)}?${qs}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      throw new Error(json.message || 'Gagal memuat atribut kategori TikTok')
    }
    const productAttrs = (json.data?.productAttributes || []) as CategoryAttributeOption[]
    const mapped = (Array.isArray(productAttrs) ? productAttrs : []).map((a) => ({
      id: String(a.id || ''),
      name: String(a.name || a.id || ''),
      isMandatory: Boolean(a.isMandatory),
      isMultipleSelection: Boolean(a.isMultipleSelection),
      isCustomizable: Boolean(a.isCustomizable),
      values: Array.isArray(a.values)
        ? a.values.map((v) => ({ id: String(v.id || ''), name: String(v.name || '') }))
        : [],
    }))
    rulesCache.set(cacheKey(shopId, categoryId), mapped)
    defs.value = mapped
  } catch (e: any) {
    loadError.value = e?.message || 'Gagal memuat atribut'
    defs.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.shopId, props.categoryId] as const,
  ([shopId, categoryId]) => {
    const s = String(shopId || '').trim()
    const c = String(categoryId || '').trim()
    if (!s || !c) {
      defs.value = []
      return
    }
    void loadForCategory(s, c)
  },
  { immediate: true }
)
</script>
