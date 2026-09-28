<template>
  <div ref="terminalEl" class="pos-terminal container-fluid py-3">
    <PosToolbar
      :company-id="activeCompanyId"
      :company-ready="activeCompanyReady"
      :company-label="activeCompanyLabel"
      :warehouse-id="form.warehouseId"
      :cashier-name="cashierName"
      :is-fullscreen="isFullscreen"
      @update:warehouse-id="onWarehouseChange"
      @toggle-fullscreen="toggleFullscreen"
    />

    <div v-if="gateError" class="alert alert-warning">{{ gateError }}</div>
    <div v-if="error" class="alert alert-danger text-break d-flex flex-wrap justify-content-between gap-2">
      <span>{{ error }}</span>
      <button
        v-if="canRetryCheckout"
        type="button"
        class="btn btn-sm btn-outline-danger"
        :disabled="saving"
        @click="checkout"
      >
        Coba checkout lagi
      </button>
    </div>
    <div v-if="notice" class="alert alert-success text-break">{{ notice }}</div>
    <div v-if="contextNotice" class="alert alert-info text-break">{{ contextNotice }}</div>

    <div class="row g-3 align-items-start">
      <div class="col-12 col-lg-8">
        <div class="card card-body">
          <PosProductCatalog
            :search="catalog.searchInput.value"
            :items="catalog.items.value"
            :loading="catalog.loading.value"
            :page="catalog.page.value"
            :last-page="catalog.lastPage.value"
            :total="catalog.total.value"
            :page-size="catalog.pageSize"
            :error="catalog.error.value"
            :disabled="!activeCompanyReady"
            :warehouse-selected="!!form.warehouseId"
            :adding-product-id="addingProductId"
            @update:search="onCatalogSearchInput"
            @search="catalog.applySearch()"
            @retry="catalog.reload()"
            @page-change="catalog.goToPage($event)"
            @add="addFromCatalog"
          />
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <PosCartPanel
          :cart="cart"
          :subtotal="cartSubtotal"
          :customer-mode="form.customerMode"
          :customer-id="form.customerId"
          :walk-in-name="form.walkInName"
          :company-id="activeCompanyId"
          :company-ready="activeCompanyReady"
          :can-checkout="canCheckout"
          :checkout-busy="saving"
          @clear="clearCart"
          @remove="removeLine"
          @update-qty="setLineQty"
          @checkout="checkout"
          @update:customer-mode="form.customerMode = $event"
          @update:customer-id="form.customerId = $event"
          @update:walk-in-name="form.walkInName = $event"
        />
      </div>
    </div>

    <!-- Optional UOM picker when default unit price needs alternate unit -->
    <div
      v-if="uomPicker"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      style="background: rgba(0, 0, 0, 0.35)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h6 mb-0">Pilih satuan — {{ uomPicker.name }}</h2>
            <button type="button" class="btn-close" aria-label="Tutup" @click="uomPicker = null" />
          </div>
          <div class="modal-body">
            <label class="form-label">Satuan</label>
            <UnitSelect v-model="uomPicker.unitId" />
            <p v-if="uomPicker.priceNotice" class="small text-muted mt-2 mb-0">{{ uomPicker.priceNotice }}</p>
            <p v-if="uomPicker.error" class="small text-danger mt-2 mb-0">{{ uomPicker.error }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="uomPicker = null">Batal</button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!uomPicker.unitId || uomPicker.resolving"
              @click="confirmUomAdd"
            >
              {{ uomPicker.resolving ? 'Memeriksa harga…' : 'Tambah' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCompanyContextStore } from '~/stores/companyContext'
import { useUserStore } from '~/stores/user'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { usePosCatalog } from '~/composables/usePosCatalog'
import { isRouteAllowedForContext, businessAwareLanding } from '~/utils/businessFlowRoute'
import { readAccessToken } from '~/utils/authCookie'
import {
  posCartIndicativeSubtotal,
  posCheckoutFingerprint,
  removePosCartLine,
  updatePosCartQuantity,
  upsertPosCartLine,
  type PosCartLine,
  type PosCatalogRow,
} from '~/utils/posCart'
import PosToolbar from '~/components/pos/PosToolbar.vue'
import PosProductCatalog from '~/components/pos/PosProductCatalog.vue'
import PosCartPanel from '~/components/pos/PosCartPanel.vue'
import UnitSelect from '~/components/reference/UnitSelect.vue'

definePageMeta({
  layout: 'pos',
  middleware: ['auth', 'check-permission'],
})

const router = useRouter()
const companyContextStore = useCompanyContextStore()
const { generation: companyGeneration } = storeToRefs(companyContextStore)
const userStore = useUserStore()
const {
  ready: activeCompanyReady,
  label: activeCompanyLabel,
  requireCompanyId,
  missingMessage: activeCompanyMissing,
  ensureBootstrapped,
  companyId: activeCompanyId,
} = useActiveCompany()

const gateError = ref('')
const error = ref('')
const notice = ref('')
const contextNotice = ref('')
const saving = ref(false)
const canRetryCheckout = ref(false)
const addingProductId = ref<number | null>(null)
const isFullscreen = ref(false)
const terminalEl = ref<HTMLElement | null>(null)

const form = reactive({
  warehouseId: null as number | null,
  customerMode: 'WALK_IN' as 'WALK_IN' | 'REGISTERED',
  customerId: null as number | null,
  walkInName: '',
})

const cart = ref<PosCartLine[]>([])
const warehouseIdRef = computed({
  get: () => form.warehouseId,
  set: (v) => {
    form.warehouseId = v
  },
})

const catalog = usePosCatalog({
  companyId: activeCompanyId,
  warehouseId: warehouseIdRef,
  generation: companyGeneration,
})

const uomPicker = ref<{
  productId: number
  name: string
  sku: string
  unitId: number | null
  unitName: string
  resolving: boolean
  error: string
  priceNotice: string
  officialUnitPrice: number | null
  priceListCode: string | null
} | null>(null)

/** Reuse idempotency key while the same checkout fingerprint is pending/retrying. */
const checkoutKeyState = ref<{ fingerprint: string; key: string } | null>(null)

const cashierName = computed(() => userStore.user?.fullName || userStore.user?.username || '')
const cartSubtotal = computed(() => posCartIndicativeSubtotal(cart.value))
const canCheckout = computed(
  () =>
    activeCompanyReady.value &&
    !!form.warehouseId &&
    cart.value.length > 0 &&
    (form.customerMode === 'WALK_IN' || !!form.customerId)
)

function headers() {
  const token = readAccessToken()
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) h.Authorization = `Bearer ${token}`
  if (activeCompanyId.value) h['X-Company-Id'] = String(activeCompanyId.value)
  return h
}

function clearCart() {
  cart.value = []
  checkoutKeyState.value = null
  canRetryCheckout.value = false
}

function removeLine(index: number) {
  cart.value = removePosCartLine(cart.value, index)
  checkoutKeyState.value = null
}

function setLineQty(index: number, quantity: number) {
  cart.value = updatePosCartQuantity(cart.value, index, quantity)
  checkoutKeyState.value = null
}

function onCatalogSearchInput(value: string) {
  catalog.searchInput.value = value
  catalog.onSearchInput()
}

function onWarehouseChange(next: number | null) {
  if (form.warehouseId === next) return
  if (cart.value.length) {
    const ok = window.confirm(
      'Mengganti gudang akan mengosongkan keranjang agar tidak terkirim ke konteks stok yang berbeda. Lanjutkan?'
    )
    if (!ok) return
    clearCart()
    contextNotice.value = 'Keranjang dikosongkan karena gudang berubah.'
  }
  form.warehouseId = next
}

function addFromCatalog(item: PosCatalogRow) {
  if (item.officialUnitPrice == null || !item.unitId) {
    // Offer UOM picker to try another unit if default has no price.
    uomPicker.value = {
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      unitId: item.unitId || null,
      unitName: item.unitName || '',
      resolving: false,
      error: item.officialUnitPrice == null ? 'Harga default belum tersedia. Coba satuan lain.' : '',
      priceNotice: '',
      officialUnitPrice: item.officialUnitPrice,
      priceListCode: item.priceListCode,
    }
    return
  }
  cart.value = upsertPosCartLine(cart.value, {
    productId: item.productId,
    unitId: item.unitId,
    quantity: 1,
    productName: item.name,
    sku: item.sku,
    unitName: item.unitName || item.unitSymbol || '',
    officialUnitPrice: Number(item.officialUnitPrice),
    priceListCode: item.priceListCode,
  })
  checkoutKeyState.value = null
  notice.value = ''
  error.value = ''
}

async function resolveOfficialPrice(productId: number, unitId: number) {
  const { $api } = useNuxtApp()
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch {
    return null
  }
  const url = new URL($api.productSellingPriceResolve())
  url.searchParams.set('perusahaanId', String(companyId))
  url.searchParams.set('productId', String(productId))
  url.searchParams.set('unitId', String(unitId))
  url.searchParams.set('pricingDate', new Date().toISOString().slice(0, 10))
  url.searchParams.set('channel', 'RETAIL')
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: headers(),
    credentials: 'include',
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { error: payload?.message || 'Harga resmi tidak tersedia.', data: null }
  }
  return { error: '', data: payload.data || payload }
}

async function confirmUomAdd() {
  if (!uomPicker.value?.unitId) return
  const picker = uomPicker.value
  picker.resolving = true
  picker.error = ''
  const resolved = await resolveOfficialPrice(picker.productId, picker.unitId)
  picker.resolving = false
  if (!resolved || resolved.error || !resolved.data) {
    picker.error = resolved?.error || 'Harga resmi tidak tersedia.'
    return
  }
  const unitPrice = Number(resolved.data.unitPrice ?? resolved.data.officialUnitPrice)
  if (!Number.isFinite(unitPrice)) {
    picker.error = 'Harga belum tersedia'
    return
  }
  cart.value = upsertPosCartLine(cart.value, {
    productId: picker.productId,
    unitId: picker.unitId,
    quantity: 1,
    productName: picker.name,
    sku: picker.sku,
    unitName: resolved.data.unitName || picker.unitName || '',
    officialUnitPrice: unitPrice,
    priceListCode: resolved.data.priceListCode || null,
  })
  checkoutKeyState.value = null
  uomPicker.value = null
}

function ensureIdempotencyKey(fingerprint: string): string {
  if (checkoutKeyState.value?.fingerprint === fingerprint) {
    return checkoutKeyState.value.key
  }
  const key = crypto.randomUUID()
  checkoutKeyState.value = { fingerprint, key }
  return key
}

async function checkout() {
  error.value = ''
  notice.value = ''
  canRetryCheckout.value = false
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch (err: any) {
    error.value = err?.message || activeCompanyMissing.value
    return
  }
  if (!canCheckout.value || !form.warehouseId) {
    error.value = 'Lengkapi gudang, pelanggan, dan keranjang.'
    return
  }
  if (saving.value) return

  const items = cart.value.map((item) => ({
    productId: item.productId,
    unitId: item.unitId,
    quantity: item.quantity,
    expectedUnitPrice: item.officialUnitPrice,
  }))
  const fingerprint = posCheckoutFingerprint({
    companyId,
    warehouseId: form.warehouseId,
    customerMode: form.customerMode,
    customerId: form.customerMode === 'REGISTERED' ? form.customerId : null,
    walkInName: form.customerMode === 'WALK_IN' ? form.walkInName || '' : '',
    items,
  })
  const idempotencyKey = ensureIdempotencyKey(fingerprint)

  saving.value = true
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.directSaleCheckout(), {
      method: 'POST',
      headers: headers(),
      credentials: 'include',
      body: JSON.stringify({
        perusahaanId: companyId,
        idempotencyKey,
        warehouseId: form.warehouseId,
        customerMode: form.customerMode,
        customerId: form.customerMode === 'REGISTERED' ? form.customerId : null,
        walkInName: form.customerMode === 'WALK_IN' ? form.walkInName || null : null,
        confirm: true,
        items,
      }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = payload?.message || 'Checkout Direct Sale ditolak.'
      canRetryCheckout.value = true
      return
    }
    notice.value = `Direct Sale ${payload?.data?.saleNumber || ''} · ${
      payload?.data?.checkout?.status || 'CONFIRMED'
    }. Lanjut fulfill di Riwayat transaksi.`
    cart.value = []
    form.walkInName = ''
    form.customerId = null
    checkoutKeyState.value = null
    canRetryCheckout.value = false
  } catch (err: any) {
    error.value = err?.message || 'Checkout gagal (jaringan). Anda dapat mencoba lagi tanpa mengganti kunci idempotency.'
    canRetryCheckout.value = true
  } finally {
    saving.value = false
  }
}

async function toggleFullscreen() {
  const el = terminalEl.value
  if (!el) return
  try {
    if (!document.fullscreenElement) {
      await el.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch {
    error.value = 'Browser menolak mode fullscreen.'
  }
}

function onFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === terminalEl.value
}

watch(activeCompanyId, (next, prev) => {
  if (prev == null || next === prev) return
  if (cart.value.length) {
    clearCart()
    contextNotice.value = 'Keranjang dikosongkan karena Active Company berubah.'
  }
  form.warehouseId = null
  form.customerId = null
  catalog.clear()
  void catalog.reload()
})

watch(
  () => form.warehouseId,
  () => {
    // Initial load / programmatic set without confirm dialog.
    void catalog.reload()
  }
)

onMounted(async () => {
  await ensureBootstrapped()
  await userStore.ensureUserLoaded?.()
  if (!companyContextStore.initialized) {
    try {
      await companyContextStore.bootstrap()
    } catch {
      /* middleware also bootstraps */
    }
  }
  const ctx = {
    effectiveFlowCodes: companyContextStore.effectiveFlowCodes,
    profileCode: companyContextStore.profileCode,
  }
  if (companyContextStore.initialized && !isRouteAllowedForContext('/sales/pos', ctx)) {
    gateError.value = 'Active Company tidak memiliki kapabilitas DIRECT_PRODUCT_SALE.'
    await router.replace(businessAwareLanding(ctx))
    return
  }
  document.addEventListener('fullscreenchange', onFullscreenChange)
  void catalog.reload()
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (document.fullscreenElement === terminalEl.value) {
    void document.exitFullscreen().catch(() => {})
  }
})
</script>

<style scoped>
.pos-terminal {
  max-width: 1400px;
}
.pos-terminal:fullscreen {
  max-width: none;
  background: var(--bs-body-bg, #f5f5f9);
  overflow: auto;
  padding: 1rem;
}
</style>
