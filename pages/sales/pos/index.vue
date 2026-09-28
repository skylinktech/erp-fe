<template>
  <div ref="terminalEl" class="pos-terminal container-fluid py-3">
    <PosToolbar
      :company-id="activeCompanyId"
      :company-ready="activeCompanyReady"
      :company-label="activeCompanyLabel"
      :warehouse-id="form.warehouseId"
      :cashier-name="cashierName"
      :is-fullscreen="isFullscreen"
      :shift-open="!!shift?.id"
      :shift-label="shiftLabel"
      @update:warehouse-id="onWarehouseChange"
      @toggle-fullscreen="toggleFullscreen"
      @open-shift="openShift"
      @close-shift="closeShift"
    />

    <div v-if="gateError" class="alert alert-warning">{{ gateError }}</div>
    <div v-if="error" class="alert alert-danger text-break d-flex flex-wrap justify-content-between gap-2">
      <span>{{ error }}</span>
      <button
        v-if="canRetryCheckout || pendingSaleId"
        type="button"
        class="btn btn-sm btn-outline-danger"
        :disabled="saving"
        @click="pendingSaleId ? resumePendingSale() : openPayment()"
      >
        {{ pendingSaleId ? 'Lanjutkan pembayaran' : 'Coba lagi' }}
      </button>
    </div>
    <div v-if="notice" class="alert alert-success text-break">{{ notice }}</div>
    <div v-if="contextNotice" class="alert alert-info text-break">{{ contextNotice }}</div>
    <div
      v-if="pendingGatewayAttemptId && pendingResumeVia === 'gateway-poll'"
      class="alert alert-warning d-flex flex-wrap gap-2 align-items-center"
    >
      <span class="me-auto">Gateway attempt {{ pendingGatewayAttemptId }} — resolusi operator:</span>
      <button type="button" class="btn btn-sm btn-outline-primary" :disabled="saving" @click="pollGatewayAttempt">
        Poll
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline-success"
        :disabled="saving"
        @click="resolveGateway('accept_late_success')"
      >
        Terima late success
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        :disabled="saving"
        @click="resolveGateway('retry_finalize')"
      >
        Retry finalize
      </button>
      <button
        type="button"
        class="btn btn-sm btn-outline-danger"
        :disabled="saving"
        @click="resolveGateway('abandon_unpaid')"
      >
        Abandon unpaid
      </button>
    </div>

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
            @search="onCatalogSearch"
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
          @checkout="openPayment"
          @hold="holdCart"
          @resume="resumeHoldPicker"
          @update:customer-mode="form.customerMode = $event"
          @update:customer-id="form.customerId = $event"
          @update:walk-in-name="form.walkInName = $event"
        />
      </div>
    </div>

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

    <PosPaymentModal
      v-if="paymentOpen"
      :total="paymentTotal"
      :company-id="activeCompanyId"
      :company-ready="activeCompanyReady"
      :busy="saving"
      :error="paymentError"
      @cancel="onPaymentCancel"
      @confirm="completeSale"
    />

    <PosReceiptModal
      v-if="receipt"
      :receipt="receipt"
      :company-label="activeCompanyLabel"
      :payment-meta="lastPaymentMeta"
      @close="receipt = null"
    />
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
  findExactCatalogScanMatch,
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
import PosPaymentModal from '~/components/pos/PosPaymentModal.vue'
import PosReceiptModal from '~/components/pos/PosReceiptModal.vue'
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
const paymentError = ref('')
const saving = ref(false)
const canRetryCheckout = ref(false)
const addingProductId = ref<number | null>(null)
const isFullscreen = ref(false)
const terminalEl = ref<HTMLElement | null>(null)
const paymentOpen = ref(false)
const receipt = ref<Record<string, any> | null>(null)
const lastPaymentMeta = ref<Record<string, any> | null>(null)
const pendingSaleId = ref<string | null>(null)
const pendingSaleRevision = ref<number | null>(null)
const pendingSaleTotal = ref<number | null>(null)
const pendingResumeVia = ref<'complete' | 'pos-pay' | 'gateway-poll' | 'ownership-fix' | null>(null)
const pendingGatewayAttemptId = ref<string | null>(null)
const shift = ref<Record<string, any> | null>(null)

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

const checkoutKeyState = ref<{ fingerprint: string; key: string } | null>(null)

const POS_SESSION_KEY = 'skylink.pos.checkout.v1'

function posSessionStorageKey() {
  return `${POS_SESSION_KEY}:${activeCompanyId.value || 0}:${form.warehouseId || 0}`
}

function persistPosSession() {
  if (typeof sessionStorage === 'undefined') return
  try {
    const payload = {
      fingerprint: checkoutKeyState.value?.fingerprint || null,
      key: checkoutKeyState.value?.key || null,
      pendingSaleId: pendingSaleId.value,
      pendingSaleRevision: pendingSaleRevision.value,
      pendingSaleTotal: pendingSaleTotal.value,
      pendingResumeVia: pendingResumeVia.value,
      pendingGatewayAttemptId: pendingGatewayAttemptId.value,
      cart: cart.value,
      customerMode: form.customerMode,
      customerId: form.customerId,
      walkInName: form.walkInName,
    }
    sessionStorage.setItem(posSessionStorageKey(), JSON.stringify(payload))
  } catch {
    /* ignore quota */
  }
}

function clearPosSession() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(posSessionStorageKey())
  } catch {
    /* ignore */
  }
}

async function restorePosSession() {
  if (typeof sessionStorage === 'undefined') return
  try {
    const raw = sessionStorage.getItem(posSessionStorageKey())
    if (!raw) return
    const data = JSON.parse(raw)
    if (Array.isArray(data.cart) && data.cart.length) cart.value = data.cart
    if (data.customerMode) form.customerMode = data.customerMode
    if (data.customerId != null) form.customerId = data.customerId
    if (data.walkInName != null) form.walkInName = data.walkInName
    if (data.key && data.fingerprint) {
      checkoutKeyState.value = { key: data.key, fingerprint: data.fingerprint }
    }
    if (data.pendingSaleId) {
      pendingSaleId.value = String(data.pendingSaleId)
      pendingSaleRevision.value = data.pendingSaleRevision != null ? Number(data.pendingSaleRevision) : null
      pendingSaleTotal.value = data.pendingSaleTotal != null ? Number(data.pendingSaleTotal) : null
      pendingResumeVia.value = data.pendingResumeVia || 'complete'
      pendingGatewayAttemptId.value = data.pendingGatewayAttemptId || null
      notice.value = `Sesi POS dipulihkan (${pendingSaleId.value}). Lanjutkan pembayaran — jangan buat sale baru.`
    } else if (data.key && activeCompanyId.value) {
      await recoverByCheckoutKey(String(data.key))
    }
  } catch {
    /* ignore corrupt */
  }
}

async function recoverByCheckoutKey(key: string) {
  if (!activeCompanyId.value) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.posCheckoutByKey(key)}?perusahaanId=${activeCompanyId.value}`, {
      headers: headers(),
      credentials: 'include',
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok || !payload?.data?.saleId) return
    const d = payload.data
    pendingSaleId.value = String(d.saleId)
    pendingSaleRevision.value = d.revision != null ? Number(d.revision) : null
    pendingSaleTotal.value = d.grandTotal != null ? Number(d.grandTotal) : null
    pendingResumeVia.value = d.resumeVia || 'complete'
    pendingGatewayAttemptId.value = d.attemptId || null
    notice.value = `Checkout key ditemukan → sale ${d.saleNumber || d.saleId}. Lanjutkan tanpa menggandakan.`
    persistPosSession()
  } catch {
    /* network */
  }
}

const cashierName = computed(() => userStore.user?.fullName || userStore.user?.username || '')
const cartSubtotal = computed(() => posCartIndicativeSubtotal(cart.value))
const paymentTotal = computed(() =>
  pendingSaleId.value && pendingSaleTotal.value != null
    ? Number(pendingSaleTotal.value)
    : cartSubtotal.value
)
const canCheckout = computed(
  () =>
    activeCompanyReady.value &&
    !!form.warehouseId &&
    cart.value.length > 0 &&
    (form.customerMode === 'WALK_IN' || !!form.customerId)
)
const shiftLabel = computed(() => {
  if (!shift.value?.id) return ''
  return `Shift · saldo awal ${Number(shift.value.openingCash || 0).toLocaleString('id-ID')}`
})

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
  pendingSaleId.value = null
  pendingSaleRevision.value = null
  pendingSaleTotal.value = null
  pendingResumeVia.value = null
  pendingGatewayAttemptId.value = null
  clearPosSession()
}

async function abandonPendingSale() {
  if (!pendingSaleId.value) {
    clearCart()
    return
  }
  const saleId = pendingSaleId.value
  const ok = window.confirm(
    'Batalkan penjualan tertunda dan lepaskan reservasi stok? Ini tidak membuat dokumen ganda.'
  )
  if (!ok) return
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.retailSaleCancel(saleId), {
      method: 'POST',
      headers: headers(),
      credentials: 'include',
      body: JSON.stringify({
        expectedRevision: pendingSaleRevision.value,
        idempotencyKey: crypto.randomUUID(),
      }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok && payload?.code !== 'RETAIL_SALE_NOT_CANCELLABLE') {
      // FULFILLED cannot cancel — offer gateway abandon instead.
      if (pendingGatewayAttemptId.value) {
        const resolveRes = await fetch($api.posPaymentAttemptResolve(pendingGatewayAttemptId.value), {
          method: 'POST',
          headers: headers(),
          credentials: 'include',
          body: JSON.stringify({ action: 'abandon_unpaid', note: 'POS operator abandon' }),
        })
        const resolvePayload = await resolveRes.json().catch(() => ({}))
        if (!resolveRes.ok) {
          error.value = resolvePayload?.message || payload?.message || 'Gagal membatalkan.'
          return
        }
        notice.value = resolvePayload?.data?.nextStep || 'Attempt dibatalkan. Ikuti langkah stok jika sudah ISSUED.'
      } else {
        error.value = payload?.message || 'Penjualan tidak bisa dibatalkan (mungkin sudah fulfilled).'
        return
      }
    } else {
      notice.value = 'Penjualan dibatalkan; reservasi dilepas.'
    }
  } catch (err: any) {
    error.value = err?.message || 'Gagal membatalkan penjualan.'
    return
  }
  clearCart()
  paymentOpen.value = false
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

async function onCatalogSearch() {
  const query = catalog.searchInput.value.trim()
  const rows = await catalog.applySearch()
  if (!query || !rows.length) return
  const match = findExactCatalogScanMatch(rows, query)
  if (!match) return
  addFromCatalog(match)
  catalog.searchInput.value = ''
  catalog.appliedSearch.value = ''
  notice.value = `Ditambah: ${match.sku || match.name}`
  // Keep catalog list but clear search box for next scan.
  const searchEl = document.getElementById('pos-catalog-search') as HTMLInputElement | null
  searchEl?.focus()
  searchEl?.select()
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
  void loadShift()
}

function addFromCatalog(item: PosCatalogRow) {
  if (item.officialUnitPrice == null || !item.unitId) {
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
  persistPosSession()
  return key
}

function openPayment() {
  error.value = ''
  paymentError.value = ''
  if (pendingSaleId.value) {
    if (!shift.value?.id) {
      error.value = 'Buka shift kasir sebelum menyelesaikan pembayaran.'
      return
    }
    paymentOpen.value = true
    return
  }
  if (!canCheckout.value) {
    error.value = 'Lengkapi gudang, pelanggan, dan keranjang.'
    return
  }
  if (!shift.value?.id) {
    error.value = 'Buka shift kasir sebelum menyelesaikan penjualan.'
    return
  }
  paymentOpen.value = true
}

function rememberPendingSale(data: Record<string, any> | null | undefined) {
  if (!data?.id) return
  pendingSaleId.value = String(data.id)
  if (data.revision != null) pendingSaleRevision.value = Number(data.revision)
  if (data.grandTotal != null) pendingSaleTotal.value = Number(data.grandTotal)
  if (data.resumeVia) pendingResumeVia.value = data.resumeVia
  if (data.attemptId || data.payment?.attemptId) {
    pendingGatewayAttemptId.value = String(data.attemptId || data.payment.attemptId)
  }
  persistPosSession()
}

function onPaymentCancel() {
  paymentOpen.value = false
  if (pendingSaleId.value) {
    void abandonPendingSale()
  }
}

async function resolveGateway(action: 'accept_late_success' | 'abandon_unpaid' | 'retry_finalize') {
  if (!pendingGatewayAttemptId.value) return
  saving.value = true
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.posPaymentAttemptResolve(pendingGatewayAttemptId.value), {
      method: 'POST',
      headers: headers(),
      credentials: 'include',
      body: JSON.stringify({ action, note: `POS UI ${action}` }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = payload?.message || 'Resolusi gateway gagal.'
      return
    }
    if (action === 'accept_late_success' || action === 'retry_finalize') {
      if (payload?.data?.payment?.status === 'succeeded' || payload?.data?.status === 'succeeded') {
        notice.value = 'Late success / finalize berhasil — sale lunas.'
        clearCart()
        paymentOpen.value = false
        return
      }
    }
    notice.value = payload?.data?.nextStep || payload?.message || 'Resolusi diterapkan.'
    persistPosSession()
  } finally {
    saving.value = false
  }
}

async function completeSale(payment: Record<string, unknown>) {
  error.value = ''
  notice.value = ''
  paymentError.value = ''
  canRetryCheckout.value = false
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch (err: any) {
    paymentError.value = err?.message || activeCompanyMissing.value
    return
  }
  if (saving.value) return

  if (pendingSaleId.value && pendingResumeVia.value === 'pos-pay') {
    await payPendingSale(payment, companyId)
    return
  }
  if (pendingSaleId.value && pendingResumeVia.value === 'gateway-poll') {
    await pollGatewayAttempt()
    return
  }
  if (pendingSaleId.value && pendingResumeVia.value === 'ownership-fix') {
    paymentError.value =
      'Kepemilikan stok tidak valid. Perbaiki ownership perusahaan+produk+gudang, lalu coba lagi.'
    return
  }
  // resumeVia complete (or unset with pending id): fall through to complete with same idempotency key

  if (!canCheckout.value || !form.warehouseId) {
    paymentError.value = 'Lengkapi gudang, pelanggan, dan keranjang.'
    return
  }

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
    const res = await fetch($api.directSaleCheckoutComplete(), {
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
        items,
        payment: {
          ...payment,
          cashierShiftId: shift.value?.id || null,
        },
      }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      paymentError.value = payload?.message || 'Pembayaran POS ditolak.'
      if (payload?.code === 'RETAIL_PRICE_CHANGED') {
        paymentError.value = `${payload.message} Perbarui harga lalu konfirmasi ulang.`
      }
      canRetryCheckout.value = true
      rememberPendingSale(payload?.data)
      const via = payload?.data?.resumeVia
      if (via === 'pos-pay') {
        notice.value =
          'Transaksi sudah terbentuk dan siap dilanjutkan pembayaran — jangan ulangi penjualan dari keranjang.'
      } else if (via === 'complete' && payload?.data?.id) {
        notice.value =
          'Sebagian tahap berhasil. Tekan Bayar lagi dengan kunci yang sama — tidak menggandakan sale.'
      } else if (via === 'ownership-fix') {
        notice.value = 'Perbaiki kepemilikan stok sebelum mencoba lagi.'
      }
      return
    }

    applyPaymentSuccess(payload, payment)
  } catch (err: any) {
    paymentError.value =
      err?.message || 'Checkout gagal (jaringan). Coba lagi — kunci idempotency tetap sama.'
    canRetryCheckout.value = true
  } finally {
    saving.value = false
  }
}

async function payPendingSale(payment: Record<string, unknown>, companyId: number) {
  if (!pendingSaleId.value) return
  if (!shift.value?.id) {
    paymentError.value = 'Buka shift kasir sebelum menyelesaikan pembayaran.'
    return
  }
  saving.value = true
  const { $api } = useNuxtApp()
  const idempotencyKey = crypto.randomUUID()
  try {
    const res = await fetch($api.retailSalePosPay(pendingSaleId.value), {
      method: 'POST',
      headers: headers(),
      credentials: 'include',
      body: JSON.stringify({
        perusahaanId: companyId,
        expectedRevision: pendingSaleRevision.value,
        idempotencyKey,
        payment: {
          ...payment,
          cashierShiftId: shift.value?.id || null,
        },
      }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      paymentError.value = payload?.message || 'Pembayaran lanjutan ditolak.'
      canRetryCheckout.value = true
      rememberPendingSale(payload?.data)
      if (payload?.data?.revision != null) pendingSaleRevision.value = Number(payload.data.revision)
      return
    }
    applyPaymentSuccess(payload, payment)
  } catch (err: any) {
    paymentError.value = err?.message || 'Pembayaran lanjutan gagal (jaringan).'
    canRetryCheckout.value = true
  } finally {
    saving.value = false
  }
}

function applyPaymentSuccess(payload: Record<string, any>, payment: Record<string, unknown>) {
  const pay = payload?.data?.payment || {}
  const status = String(pay.status || '')
  lastPaymentMeta.value = {
    method: payment.method,
    tenderedAmount: pay.tenderedAmount,
    changeAmount: pay.changeAmount,
    journalPosted: pay.journalPosted,
    status,
    settlementComplete: pay.settlementComplete,
  }

  // Failed / expired / cancelled must NEVER look like a paid sale.
  if (status === 'failed' || status === 'expired' || status === 'cancelled') {
    paymentError.value = `Pembayaran ${status}. Keranjang tidak dikosongkan sebagai lunas.`
    rememberPendingSale({
      ...payload?.data,
      resumeVia: status === 'failed' || status === 'expired' ? 'gateway-poll' : 'pos-pay',
      attemptId: pay.attemptId,
    })
    paymentOpen.value = false
    return
  }

  if (status === 'pending' || status === 'ambiguous') {
    rememberPendingSale({
      ...payload?.data,
      resumeVia: 'gateway-poll',
      attemptId: pay.attemptId,
    })
    if (payload?.data?.revision != null) pendingSaleRevision.value = Number(payload.data.revision)
    if (payload?.data?.grandTotal != null) pendingSaleTotal.value = Number(payload.data.grandTotal)
    notice.value = `Pembayaran gateway ${status} · attempt ${pay.attemptId || ''}. Provider belum settled — jangan anggap lunas.`
    paymentOpen.value = false
    if (pay.checkoutUrl) window.open(String(pay.checkoutUrl), '_blank', 'noopener,noreferrer')
    return
  }

  // Provider/local succeeded but settlement missing → keep pending recovery, no paid receipt.
  if (status === 'succeeded' && pay.settlementComplete === false) {
    rememberPendingSale({
      ...payload?.data,
      resumeVia: 'gateway-poll',
      attemptId: pay.attemptId,
    })
    notice.value =
      'Provider sukses, settlement lokal belum selesai. Recovery/poll akan menyelesaikan tanpa charge baru.'
    paymentOpen.value = false
    return
  }

  if (status !== 'succeeded') {
    paymentError.value = `Status pembayaran tidak dikenal: ${status || '(kosong)'}`
    canRetryCheckout.value = true
    return
  }

  receipt.value = {
    ...payload.data,
    reprinted: false,
    paymentState: pay.journalPosted === false ? 'settled_journal_pending' : 'settled',
  }
  notice.value =
    pay.journalPosted === false
      ? `Transaksi ${payload?.data?.saleNumber || ''} settled — jurnal masih pending.`
      : `Transaksi ${payload?.data?.saleNumber || ''} selesai.`
  paymentOpen.value = false
  cart.value = []
  form.walkInName = ''
  form.customerId = null
  checkoutKeyState.value = null
  canRetryCheckout.value = false
  pendingSaleId.value = null
  pendingSaleRevision.value = null
  pendingSaleTotal.value = null
  pendingResumeVia.value = null
  pendingGatewayAttemptId.value = null
  clearPosSession()
}

async function pollGatewayAttempt() {
  if (!pendingGatewayAttemptId.value) {
    paymentError.value = 'Tidak ada attempt gateway untuk dipoll.'
    return
  }
  saving.value = true
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.posPaymentAttempt(pendingGatewayAttemptId.value), {
      headers: headers(),
      credentials: 'include',
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      paymentError.value = payload?.message || 'Gagal poll gateway.'
      return
    }
    const attempt = payload.data || {}
    const status = String(attempt.status || '')

    if (status === 'failed' || status === 'expired' || status === 'cancelled') {
      paymentError.value = `Gateway ${status}. Tidak lunas — gunakan resolusi operator jika perlu.`
      notice.value = ''
      return
    }

    if (status === 'succeeded' && attempt.settlementComplete === false) {
      await fetch($api.posGatewayRecover(), {
        method: 'POST',
        headers: headers(),
        credentials: 'include',
        body: JSON.stringify({ limit: 5 }),
      }).catch(() => null)
      notice.value =
        'Provider captured / succeeded tanpa settlement — recovery dijalankan. Poll lagi sebentar.'
      return
    }

    if (status === 'succeeded' && attempt.settlementComplete) {
      notice.value = 'Gateway settled — memuat struk.'
      if (pendingSaleId.value) {
        const receiptRes = await fetch($api.posReceipt(pendingSaleId.value), {
          headers: headers(),
          credentials: 'include',
        })
        const receiptPayload = await receiptRes.json().catch(() => ({}))
        if (receiptRes.ok) {
          receipt.value = {
            ...receiptPayload.data,
            reprinted: false,
            paymentState: 'settled',
          }
          lastPaymentMeta.value = {
            ...(lastPaymentMeta.value || {}),
            status: 'succeeded',
            settlementComplete: true,
            journalPosted: receiptPayload.data?.finance?.journalPosted,
          }
          cart.value = []
          pendingSaleId.value = null
          pendingResumeVia.value = null
          pendingGatewayAttemptId.value = null
          clearPosSession()
        }
      }
      return
    }

    notice.value = `Gateway masih ${status || attempt.paymentStatusLabel || 'pending'}.`
  } catch (err: any) {
    paymentError.value = err?.message || 'Poll gateway gagal.'
  } finally {
    saving.value = false
  }
}

async function resumePendingSale() {
  if (!pendingSaleId.value) return
  const { $api } = useNuxtApp()
  const res = await fetch($api.posReceipt(pendingSaleId.value), {
    headers: headers(),
    credentials: 'include',
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Gagal memuat transaksi tertunda.'
    return
  }
  const data = payload.data || {}
  if (data.revision != null) pendingSaleRevision.value = Number(data.revision)
  if (data.grandTotal != null) pendingSaleTotal.value = Number(data.grandTotal)

  const paymentStatus = String(
    data.paymentStatus || data.finance?.state || data.payment?.status || ''
  ).toUpperCase()
  const paid =
    paymentStatus === 'PAID' ||
    paymentStatus === 'SUCCEEDED' ||
    paymentStatus === 'SUCCESS' ||
    paymentStatus === 'SETTLED' ||
    data.status === 'PAID' ||
    data.status === 'CLOSED'

  if (paid) {
    receipt.value = { ...data, reprinted: true }
    notice.value = 'Transaksi sudah dibayar — struk dibuka untuk cetak ulang.'
    pendingSaleId.value = null
    pendingSaleRevision.value = null
    pendingSaleTotal.value = null
    pendingResumeVia.value = null
    pendingGatewayAttemptId.value = null
    return
  }

  const finance = String(data.finance?.state || data.paymentStatus || '').toUpperCase()
  if (finance === 'PAYMENT_PENDING' || finance === 'INVOICED') {
    pendingResumeVia.value = 'pos-pay'
  } else if (data.status === 'CONFIRMED') {
    pendingResumeVia.value = 'complete'
  } else if (data.status === 'FULFILLED') {
    pendingResumeVia.value = 'pos-pay'
  }

  notice.value = `Lanjutkan (${pendingResumeVia.value || 'complete'}) untuk ${data.saleNumber || pendingSaleId.value}.`
  error.value = ''
  openPayment()
}

async function holdCart() {
  if (!cart.value.length || !form.warehouseId) return
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch (err: any) {
    error.value = err?.message || activeCompanyMissing.value
    return
  }
  const { $api } = useNuxtApp()
  const res = await fetch($api.posHolds(), {
    method: 'POST',
    headers: headers(),
    credentials: 'include',
    body: JSON.stringify({
      perusahaanId: companyId,
      warehouseId: form.warehouseId,
      cashierShiftId: shift.value?.id || null,
      customerMode: form.customerMode,
      customerId: form.customerId,
      walkInName: form.walkInName,
      cart: cart.value,
    }),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Gagal hold keranjang.'
    return
  }
  notice.value = `Hold ${payload?.data?.holdCode || ''} tersimpan.`
  clearCart()
}

async function resumeHoldPicker() {
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch (err: any) {
    error.value = err?.message || activeCompanyMissing.value
    return
  }
  const { $api } = useNuxtApp()
  const qs = new URLSearchParams({
    perusahaanId: String(companyId),
    ...(form.warehouseId ? { warehouseId: String(form.warehouseId) } : {}),
  })
  const listRes = await fetch(`${$api.posHolds()}?${qs}`, {
    headers: headers(),
    credentials: 'include',
  })
  const listPayload = await listRes.json().catch(() => ({}))
  const rows = Array.isArray(listPayload.data) ? listPayload.data : []
  if (!rows.length) {
    notice.value = 'Tidak ada transaksi hold.'
    return
  }
  const pick = rows[0]
  const res = await fetch($api.posHoldResume(pick.id), {
    method: 'POST',
    headers: headers(),
    credentials: 'include',
    body: '{}',
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Gagal resume hold.'
    return
  }
  const data = payload.data
  form.warehouseId = data.warehouseId
  form.customerMode = data.customerMode
  form.customerId = data.customerId
  form.walkInName = data.walkInName || ''
  cart.value = Array.isArray(data.cartJson) ? data.cartJson : []
  notice.value = `Hold ${data.holdCode} dilanjutkan.`
}

async function loadShift() {
  if (!activeCompanyId.value || !form.warehouseId) {
    shift.value = null
    return
  }
  const { $api } = useNuxtApp()
  const qs = new URLSearchParams({
    perusahaanId: String(activeCompanyId.value),
    warehouseId: String(form.warehouseId),
  })
  const res = await fetch(`${$api.posShiftCurrent()}?${qs}`, {
    headers: headers(),
    credentials: 'include',
  })
  const payload = await res.json().catch(() => ({}))
  shift.value = payload?.data || null
}

async function openShift() {
  if (!form.warehouseId) {
    error.value = 'Pilih gudang sebelum buka shift.'
    return
  }
  const opening = window.prompt('Saldo awal kas (angka)', '0')
  if (opening == null) return
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch (err: any) {
    error.value = err?.message || activeCompanyMissing.value
    return
  }
  const { $api } = useNuxtApp()
  const res = await fetch($api.posShiftOpen(), {
    method: 'POST',
    headers: headers(),
    credentials: 'include',
    body: JSON.stringify({
      perusahaanId: companyId,
      warehouseId: form.warehouseId,
      openingCash: Number(opening) || 0,
    }),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Gagal buka shift.'
    return
  }
  shift.value = payload.data
  notice.value = 'Shift dibuka.'
}

async function closeShift() {
  if (!shift.value?.id) return
  const counted = window.prompt('Hasil hitung kas di laci', String(shift.value.expectedCash ?? shift.value.openingCash ?? 0))
  if (counted == null) return
  let acknowledgePendingGateway = false
  const { $api } = useNuxtApp()
  const attemptClose = async () => {
    const res = await fetch($api.posShiftClose(shift.value!.id), {
      method: 'POST',
      headers: headers(),
      credentials: 'include',
      body: JSON.stringify({
        shiftId: shift.value!.id,
        countedCash: Number(counted) || 0,
        acknowledgePendingGateway,
      }),
    })
    return { res, payload: await res.json().catch(() => ({})) }
  }
  let { res, payload } = await attemptClose()
  if (!res.ok && payload?.code === 'POS_SETTLEMENT_INCOMPLETE') {
    const pending = payload?.data?.summary?.pendingGatewayCount ?? '?'
    const ok = window.confirm(
      `Masih ada ${pending} gateway pending. Tutup shift tetap? Late success tetap bisa settle ke shift ini.`
    )
    if (!ok) return
    acknowledgePendingGateway = true
    ;({ res, payload } = await attemptClose())
  }
  if (!res.ok) {
    error.value = payload?.message || 'Gagal tutup shift.'
    return
  }
  const s = payload.data
  const summary = s.summary || {}
  notice.value = `Shift ditutup. Kas netto ${summary.cashNet ?? s.expectedCash}, noncash ${summary.nonCashSucceeded ?? 0}, pending ${summary.pendingGatewayCount ?? 0}, hitung ${s.countedCash}, selisih ${s.cashVariance}.`
  shift.value = null
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
  shift.value = null
  catalog.clear()
  void catalog.reload()
})

watch(
  () => form.warehouseId,
  () => {
    void catalog.reload()
    void loadShift()
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
  await restorePosSession()
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
