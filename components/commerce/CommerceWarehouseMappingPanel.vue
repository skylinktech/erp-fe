<template>
  <div class="card mb-3">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
      <div class="min-w-0">
        <h5 class="mb-0">Mapping Gudang Marketplace</h5>
        <p class="mb-0 card-subtitle text-muted small mt-1">
          Hubungkan gudang marketplace dengan gudang SkyFlow yang digunakan untuk memproses pesanan toko.
        </p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <CommerceActionButton
          action="reload"
          btn-class="btn btn-outline-secondary btn-sm"
          :busy="loading"
          @click="reload"
        />
        <button
          v-if="canManage"
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="!companyId || loading"
          @click="openCreate"
        >
          Hubungkan Gudang
        </button>
      </div>
    </div>

    <div class="card-body mt-3">
      <div class="row g-2 align-items-end mb-3">
        <div class="col-12 col-md-4 col-lg-3">
          <label class="form-label" for="wh-map-shop">Toko</label>
          <select
            id="wh-map-shop"
            v-model="shopId"
            class="form-select form-select-sm"
            :disabled="loading"
          >
            <option value="">Semua toko</option>
            <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="col-12 col-md-5 col-lg-4">
          <label class="form-label" for="wh-map-q">Cari</label>
          <input
            id="wh-map-q"
            v-model="q"
            type="search"
            class="form-control form-control-sm"
            placeholder="Toko / gudang / ID marketplace"
            @keyup.enter="applyFilters"
          />
        </div>
        <div class="col-12 col-md-3 col-lg-5">
          <div class="d-flex flex-wrap gap-2">
            <CommerceActionButton
              action="filter"
              icon="ri-filter-3-line"
              btn-class="btn btn-sm btn-outline-secondary"
              :busy="loading"
              @click="applyFilters"
            />
            <CommerceActionButton
              action="reset"
              icon="ri-refresh-line"
              btn-class="btn btn-sm btn-outline-secondary"
              :busy="loading"
              @click="resetFilters"
            />
          </div>
        </div>
      </div>

      <p class="small text-muted mb-3">
        Menghubungkan gudang tidak membuat gudang baru.
        <NuxtLink v-if="canOpenMaster" to="/inventory/gudang">Kelola master gudang</NuxtLink>
        <span v-if="canOpenMaster && canOpenAllocation"> · </span>
        <NuxtLink v-if="canOpenAllocation" to="/settings/business-model">Alokasi gudang perusahaan</NuxtLink>
      </p>

      <div v-if="error" class="alert alert-warning small text-break mb-3">
        {{ error }}
        <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="reload">Coba lagi</button>
      </div>

      <div v-if="loading && !rows.length" class="text-muted small">Memuat mapping gudang…</div>
      <div v-else-if="!rows.length" class="text-muted small">
        Belum ada mapping gudang untuk perusahaan ini.
      </div>

      <div v-else>
        <div v-if="loading" class="text-muted small mb-2" aria-live="polite">Memperbarui…</div>
        <div class="table-responsive d-none d-md-block">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Marketplace / toko</th>
                <th>Gudang SkyFlow</th>
                <th>Gudang marketplace</th>
                <th>Status</th>
                <th>Stok pengaman</th>
                <th class="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td class="text-break">
                  <div class="fw-semibold">{{ row.shopName || 'Toko' }}</div>
                  <div class="wh-map-meta text-muted">{{ commercePlatformLabel(row.platformCode) }}</div>
                </td>
                <td class="text-break">
                  <div>{{ warehouseLabel(row) }}</div>
                  <span v-if="row.isPrimary" class="badge bg-label-primary wh-map-badge">Gudang Utama</span>
                </td>
                <td class="text-break">
                  <div v-if="marketplaceWarehouseLabel(row)">{{ marketplaceWarehouseLabel(row) }}</div>
                  <div v-else-if="!row.externalWarehouseId">Gudang marketplace belum dipilih</div>
                  <div v-if="row.externalWarehouseId" class="wh-map-id font-monospace text-muted text-break">
                    ID Gudang Marketplace: {{ row.externalWarehouseId }}
                  </div>
                </td>
                <td>
                  <span class="badge" :class="commerceStatusBadge(row.mappingStatus)">
                    {{ commerceEnumLabel(row.mappingStatus) }}
                  </span>
                </td>
                <td>
                  {{ formatCommerceQty(row.safetyBufferQty) }}
                  <button
                    type="button"
                    class="btn btn-link btn-sm p-0 ms-1"
                    title="Jumlah yang ditahan dari stok tersedia sebelum diproses ke marketplace."
                  >
                    <i class="ri-information-line" aria-hidden="true" />
                    <span class="visually-hidden">Penjelasan stok pengaman</span>
                  </button>
                </td>
                <td class="text-end">
                  <button
                    v-if="canManage"
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="actions.isTargetBusy(row.id)"
                    @click="openEdit(row)"
                  >
                    Ubah
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-md-none">
          <article v-for="row in rows" :key="row.id" class="border rounded p-3 mb-2">
            <div class="fw-semibold text-break">{{ row.shopName || 'Toko' }}</div>
            <div class="wh-map-meta text-muted">{{ commercePlatformLabel(row.platformCode) }}</div>
            <div class="mt-2">{{ warehouseLabel(row) }}</div>
            <div v-if="marketplaceWarehouseLabel(row)" class="mt-1">{{ marketplaceWarehouseLabel(row) }}</div>
            <div v-else-if="!row.externalWarehouseId" class="mt-1">Gudang marketplace belum dipilih</div>
            <div
              v-if="row.externalWarehouseId"
              class="wh-map-id font-monospace text-muted text-break mt-1"
            >
              ID Gudang Marketplace: {{ row.externalWarehouseId }}
            </div>
            <div class="d-flex flex-wrap gap-1 mt-2">
              <span v-if="row.isPrimary" class="badge bg-label-primary wh-map-badge">Gudang Utama</span>
              <span class="badge" :class="commerceStatusBadge(row.mappingStatus)">
                {{ commerceEnumLabel(row.mappingStatus) }}
              </span>
            </div>
            <div class="small text-muted mt-1">
              Stok pengaman: {{ formatCommerceQty(row.safetyBufferQty) }}
            </div>
            <button
              v-if="canManage"
              type="button"
              class="btn btn-sm btn-outline-primary mt-2"
              :disabled="actions.isTargetBusy(row.id)"
              @click="openEdit(row)"
            >
              Ubah
            </button>
          </article>
        </div>

        <CommerceListPagination
          :page="page"
          :per-page="perPage"
          :meta="meta"
          :disabled="loading"
          id-prefix="wh-map"
          @update:page="onPage"
          @update:per-page="onPerPage"
        />
      </div>
    </div>
  </div>

  <div
    v-if="showForm"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    @click.self="closeForm"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editing ? 'Ubah mapping gudang' : 'Hubungkan gudang' }}</h5>
          <button type="button" class="btn-close" aria-label="Tutup" @click="closeForm" />
        </div>
        <div class="modal-body">
          <p class="small text-muted">
            Pilih gudang SkyFlow yang sudah dialokasikan ke perusahaan aktif, lalu pilih gudang marketplace
            dari Seller Center. Menghubungkan tidak membuat gudang baru di SkyFlow.
          </p>
          <div v-if="formError" class="alert alert-danger small text-break">{{ formError }}</div>
          <div class="mb-3">
            <label class="form-label" for="wh-form-shop">Toko</label>
            <select
              id="wh-form-shop"
              v-model="form.shopId"
              class="form-select"
              :disabled="Boolean(editing)"
            >
              <option value="">Pilih toko</option>
              <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Gudang SkyFlow</label>
            <WarehouseSelect
              v-model="form.warehouseId"
              :company-id="productPickerCompanyId"
              allocated-only
              :disabled="Boolean(editing)"
              :clearable="!editing"
              :initial-option="editingWarehouseOption"
              placeholder="Cari gudang yang dialokasikan…"
            />
            <div v-if="editing" class="form-text">
              Gudang SkyFlow tidak diganti di sini. Pasangan toko + gudang sudah terhubung.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Gudang Marketplace</label>
            <MarketplaceWarehouseSelect
              v-model="form.externalWarehouseId"
              :shop-id="form.shopId || null"
              :platform-code="formShopPlatform"
            />
          </div>
          <div class="mb-3">
            <label class="form-label" for="wh-form-buffer">
              Stok pengaman
              <span
                class="text-muted"
                title="Jumlah yang ditahan dari stok tersedia sebelum diproses ke marketplace."
              >(cadangan lokal)</span>
            </label>
            <input
              id="wh-form-buffer"
              v-model="form.safetyBufferQty"
              type="number"
              min="0"
              step="1"
              class="form-control"
            />
          </div>
          <div class="form-check">
            <input
              id="wh-form-primary"
              v-model="form.isPrimary"
              class="form-check-input"
              type="checkbox"
            />
            <label class="form-check-label" for="wh-form-primary">Jadikan gudang utama toko ini</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="closeForm">Batal</button>
          <CommerceActionButton
            action="save"
            label="Simpan"
            btn-class="btn btn-primary"
            :busy="saving"
            :disabled="saving"
            @click="save"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-if="showForm" class="modal-backdrop fade show" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useCommerceActionBusy } from '~/composables/useCommerceActionBusy'
import { usePermissions } from '~/composables/usePermissions'
import CommerceActionButton from '~/components/commerce/CommerceActionButton.vue'
import CommerceListPagination from '~/components/commerce/CommerceListPagination.vue'
import MarketplaceWarehouseSelect from '~/components/commerce/MarketplaceWarehouseSelect.vue'
import WarehouseSelect from '~/components/reference/WarehouseSelect.vue'
import { readAccessToken } from '~/utils/authCookie'
import { commercePlatformLabel } from '~/utils/commercePlatform'
import { commerceEnumLabel, commerceStatusBadge, formatCommerceQty } from '~/utils/commerceFormat'
import {
  marketplaceWarehouseNameById,
  type MarketplaceWarehouseOption,
} from '~/utils/commerceMarketplaceWarehouse'
import {
  clampCommercePerPage,
  COMMERCE_DEFAULT_PER_PAGE,
  normalizeCommerceMeta,
  type CommerceListMeta,
} from '~/utils/commercePagination'

export type ShopWarehouseRow = {
  id: string
  shopId: string
  shopName?: string | null
  platformCode?: string | null
  warehouseId: number
  warehouseName?: string | null
  warehouseCode?: string | null
  isPrimary?: boolean
  isActive?: boolean
  safetyBufferQty?: number | string
  externalWarehouseId?: string | null
  mappingStatus?: string | null
}

const emit = defineEmits<{
  notice: [message: string]
  error: [message: string]
}>()

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()
const actions = useCommerceActionBusy({ companyId })
const { userHasPermission, userHasRole } = usePermissions()

const canManage = computed(
  () => userHasRole('superadmin') || userHasPermission('manage_commerce_connection')
)
const canOpenMaster = computed(
  () => userHasRole('superadmin') || userHasPermission('view_gudang') || userHasPermission('edit_gudang')
)
const canOpenAllocation = computed(
  () =>
    userHasRole('superadmin') ||
    userHasPermission('view_business_model_configuration') ||
    userHasPermission('manage_company_warehouse_allocation')
)

const productPickerCompanyId = computed(() => {
  const id = companyId.value
  if (id == null || id === '') return null
  const n = Number(id)
  return Number.isFinite(n) && n > 0 ? n : null
})

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const rows = ref<ShopWarehouseRow[]>([])
const shops = ref<Array<{ id: string; name: string; platformCode?: string | null }>>([])
const shopId = ref('')
const q = ref('')
const page = ref(1)
const perPage = ref(COMMERCE_DEFAULT_PER_PAGE)
const meta = ref(normalizeCommerceMeta(null))
const mpWarehousesByShop = ref<Record<string, MarketplaceWarehouseOption[]>>({})
let abort: AbortController | null = null

const showForm = ref(false)
const editing = ref<ShopWarehouseRow | null>(null)
const formError = ref('')
const form = ref({
  shopId: '',
  warehouseId: null as number | null,
  externalWarehouseId: '',
  safetyBufferQty: '0',
  isPrimary: true,
})

const formShopPlatform = computed(() => {
  const shop = shops.value.find((s) => s.id === form.value.shopId)
  return shop?.platformCode || null
})

const editingWarehouseOption = computed(() => {
  const row = editing.value
  if (!row?.warehouseId) return null
  return {
    id: Number(row.warehouseId),
    nmWarehouse: row.warehouseName || 'Gudang SkyFlow',
    kodeWarehouse: row.warehouseCode || '',
  }
})

function warehouseLabel(row: ShopWarehouseRow) {
  const name = row.warehouseName || 'Gudang SkyFlow'
  return row.warehouseCode ? `${name} (${row.warehouseCode})` : name
}

function marketplaceWarehouseLabel(row: ShopWarehouseRow) {
  return marketplaceWarehouseNameById(mpWarehousesByShop.value[row.shopId], row.externalWarehouseId)
}

function parseExternalWarehouseRows(data: unknown): MarketplaceWarehouseOption[] {
  if (!Array.isArray(data)) return []
  return data
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
}

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Company-Id'] = String(companyId.value)
  return h
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: { ...headers(), ...(init?.headers || {}) },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Permintaan gagal (${res.status})`)
  }
  return json
}

async function loadShops(gen: number) {
  if (!companyId.value) return
  const json = await fetchJson(
    `${$api.commerceShops()}?perusahaanId=${companyId.value}&page=1&perPage=100`,
    { signal: abort?.signal }
  )
  if (!actions.isCurrentGen(gen)) return
  shops.value = json.data || []
}

async function hydrateMarketplaceNames(gen: number, signal: AbortSignal) {
  const shopIds = [
    ...new Set(
      rows.value
        .filter((r) => r.shopId && r.externalWarehouseId)
        .map((r) => r.shopId)
    ),
  ]
  if (!shopIds.length) return
  await Promise.all(
    shopIds.map(async (id) => {
      try {
        const json = await fetchJson($api.commerceShopExternalWarehouses(id), { signal })
        if (!actions.isCurrentGen(gen)) return
        mpWarehousesByShop.value = {
          ...mpWarehousesByShop.value,
          [id]: parseExternalWarehouseRows(json.data),
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return
      }
    })
  )
}

async function reload() {
  if (!companyId.value) {
    rows.value = []
    shops.value = []
    mpWarehousesByShop.value = {}
    error.value = 'Active Company belum dipilih'
    return
  }
  abort?.abort()
  abort = new AbortController()
  const gen = actions.bumpRequestGen()
  loading.value = true
  error.value = ''
  try {
    await loadShops(gen)
    if (!actions.isCurrentGen(gen)) return
    if (shopId.value && !shops.value.some((s) => s.id === shopId.value)) shopId.value = ''
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: String(page.value),
      perPage: String(perPage.value),
    })
    if (shopId.value) qs.set('shopId', shopId.value)
    if (q.value.trim()) qs.set('q', q.value.trim())
    const json = await fetchJson(`${$api.commerceShopWarehouseMaps()}?${qs}`, {
      signal: abort.signal,
    })
    if (!actions.isCurrentGen(gen)) return
    rows.value = json.data || []
    meta.value = normalizeCommerceMeta(json.meta as CommerceListMeta)
    void hydrateMarketplaceNames(gen, abort.signal)
  } catch (e: any) {
    if (e?.name === 'AbortError') return
    if (!actions.isCurrentGen(gen)) return
    error.value = e?.message || 'Gagal memuat mapping gudang'
    rows.value = []
    meta.value = normalizeCommerceMeta(null)
  } finally {
    if (actions.isCurrentGen(gen)) loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  void reload()
}

function resetFilters() {
  shopId.value = ''
  q.value = ''
  page.value = 1
  void reload()
}

function onPage(next: number) {
  page.value = next
  void reload()
}

function onPerPage(next: number) {
  perPage.value = clampCommercePerPage(next)
  page.value = 1
  void reload()
}

function openCreate() {
  editing.value = null
  formError.value = ''
  form.value = {
    shopId: shopId.value || shops.value[0]?.id || '',
    warehouseId: null,
    externalWarehouseId: '',
    safetyBufferQty: '0',
    isPrimary: !rows.value.some((r) => r.isPrimary && (!shopId.value || r.shopId === shopId.value)),
  }
  showForm.value = true
}

function openEdit(row: ShopWarehouseRow) {
  editing.value = row
  formError.value = ''
  form.value = {
    shopId: row.shopId,
    warehouseId: Number(row.warehouseId),
    externalWarehouseId: row.externalWarehouseId || '',
    safetyBufferQty: String(row.safetyBufferQty ?? 0),
    isPrimary: Boolean(row.isPrimary),
  }
  showForm.value = true
}

function closeForm() {
  if (saving.value) return
  showForm.value = false
  editing.value = null
  formError.value = ''
}

async function save() {
  formError.value = ''
  if (!form.value.shopId) {
    formError.value = 'Pilih toko.'
    return
  }
  if (!form.value.warehouseId) {
    formError.value = 'Pilih gudang SkyFlow.'
    return
  }
  saving.value = true
  const target = editing.value?.id || form.value.shopId
  const companySnapshot = companyId.value
  try {
    const saved = await actions.run('save', target, async () => {
      const body: Record<string, unknown> = {
        warehouseId: form.value.warehouseId,
        externalWarehouseId: form.value.externalWarehouseId.trim(),
        safetyBufferQty: Number(form.value.safetyBufferQty),
        isPrimary: Boolean(form.value.isPrimary),
      }
      await fetchJson($api.commerceShopWarehouses(form.value.shopId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return true as const
    })
    if (!saved || companyId.value !== companySnapshot) return
    emit('notice', editing.value ? 'Mapping gudang diperbarui.' : 'Gudang marketplace terhubung.')
    showForm.value = false
    editing.value = null
    await reload()
  } catch (e: any) {
    formError.value = e?.message || 'Gagal menyimpan mapping gudang'
    emit('error', formError.value)
  } finally {
    saving.value = false
  }
}

watch(companyId, () => {
  shopId.value = ''
  q.value = ''
  page.value = 1
  rows.value = []
  shops.value = []
  mpWarehousesByShop.value = {}
  saving.value = false
  showForm.value = false
  editing.value = null
  formError.value = ''
  void reload()
})

watch(
  () => form.value.shopId,
  () => {
    if (showForm.value && !editing.value) form.value.externalWarehouseId = ''
  }
)

onMounted(() => reload())
onBeforeUnmount(() => abort?.abort())
</script>

<style scoped>
.wh-map-meta,
.wh-map-id {
  font-size: 0.6875rem;
  line-height: 1.3;
}
.wh-map-badge {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.12rem 0.35rem;
}
</style>

