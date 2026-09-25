<template>
  <div class="pos-page container-fluid py-3">
    <header class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
      <div>
        <h1 class="h4 mb-1">POS — Direct Product Sale</h1>
        <p class="text-muted small mb-0">
          Active Company: <strong>{{ activeCompanyLabel || '—' }}</strong>
          · Kapabilitas DIRECT_PRODUCT_SALE
        </p>
      </div>
      <NuxtLink to="/sales/retail-sale" class="btn btn-outline-secondary btn-sm">Riwayat transaksi</NuxtLink>
    </header>

    <div v-if="gateError" class="alert alert-warning">{{ gateError }}</div>
    <div v-if="error" class="alert alert-danger text-break">{{ error }}</div>
    <div v-if="notice" class="alert alert-success text-break">{{ notice }}</div>

    <div class="row g-3">
      <div class="col-12 col-lg-7">
        <div class="card card-body">
          <div class="row g-2 mb-3">
            <div class="col-12">
              <ActiveCompanyField input-id="pos-company" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Gudang</label>
              <WarehouseSelect
                v-model="form.warehouseId"
                :company-id="activeCompanyId"
                :disabled="!activeCompanyReady"
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Pelanggan</label>
              <select v-model="form.customerMode" class="form-select mb-2">
                <option value="WALK_IN">Walk-in</option>
                <option value="REGISTERED">Terdaftar</option>
              </select>
              <CustomerSelect
                v-if="form.customerMode === 'REGISTERED'"
                v-model="form.customerId"
                :company-id="activeCompanyId"
                :disabled="!activeCompanyReady"
              />
              <input
                v-else
                v-model="form.walkInName"
                class="form-control"
                placeholder="Nama walk-in (opsional)"
              />
            </div>
          </div>

          <label class="form-label">Tambah produk</label>
          <div class="row g-2 align-items-end">
            <div class="col-12 col-md-6">
              <ProductSelect
                v-model="line.productId"
                :company-id="activeCompanyId"
                :warehouse-id="form.warehouseId"
                :disabled="!activeCompanyReady || !form.warehouseId"
                @select="onProductSelect"
              />
            </div>
            <div class="col-6 col-md-2">
              <UnitSelect v-model="line.unitId" :disabled="!line.productId" />
            </div>
            <div class="col-6 col-md-2">
              <input
                v-model.number="line.quantity"
                type="number"
                min="0.0001"
                step="0.0001"
                class="form-control"
                placeholder="Qty"
              />
            </div>
            <div class="col-12 col-md-2">
              <button
                type="button"
                class="btn btn-primary w-100"
                :disabled="!canAddLine"
                @click="addLine"
              >
                Tambah
              </button>
            </div>
          </div>
          <p v-if="line.officialPrice != null" class="small text-muted mt-2 mb-0">
            Harga resmi server: {{ formatMoney(line.officialPrice) }}
            <span v-if="line.priceListCode"> · {{ line.priceListCode }}</span>
          </p>
        </div>
      </div>

      <div class="col-12 col-lg-5">
        <div class="card card-body pos-cart">
          <h2 class="h6">Keranjang</h2>
          <div v-if="!cart.length" class="text-muted small">Belum ada item.</div>
          <ul class="list-unstyled mb-3">
            <li
              v-for="(item, index) in cart"
              :key="`${item.productId}-${item.unitId}-${index}`"
              class="border-bottom py-2 d-flex justify-content-between gap-2"
            >
              <div class="text-break">
                <div class="fw-semibold">{{ item.productName }}</div>
                <div class="small text-muted">
                  {{ item.sku }} · {{ item.quantity }} {{ item.unitName }}
                  × {{ formatMoney(item.officialUnitPrice) }}
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeLine(index)">×</button>
            </li>
          </ul>
          <div class="d-flex justify-content-between fw-semibold mb-3">
            <span>Subtotal (indikatif)</span>
            <span>{{ formatMoney(cartSubtotal) }}</span>
          </div>
          <button
            type="button"
            class="btn btn-success w-100"
            :disabled="saving || !canCheckout"
            @click="checkout"
          >
            {{ saving ? 'Memproses…' : 'Checkout (buat + konfirmasi)' }}
          </button>
          <p class="small text-muted mt-2 mb-0">
            Harga final dihitung server. Checkout membuat Direct Sale lalu konfirmasi reservasi stok.
            Fulfill / invoice / bayar di Riwayat transaksi.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyContextStore } from '~/stores/companyContext'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { isRouteAllowedForContext, businessAwareLanding } from '~/utils/businessFlowRoute'
import { readAccessToken } from '~/utils/authCookie'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import ProductSelect from '~/components/reference/ProductSelect.vue'
import WarehouseSelect from '~/components/reference/WarehouseSelect.vue'
import CustomerSelect from '~/components/reference/CustomerSelect.vue'
import UnitSelect from '~/components/reference/UnitSelect.vue'

definePageMeta({
  layout: 'pos',
  middleware: ['auth', 'check-permission'],
})

type CartLine = {
  productId: number
  unitId: number
  quantity: number
  productName: string
  sku: string
  unitName: string
  officialUnitPrice: number
  priceListCode?: string
}

const router = useRouter()
const companyContextStore = useCompanyContextStore()
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
const saving = ref(false)
const form = ref({
  warehouseId: null as number | null,
  customerMode: 'WALK_IN' as 'WALK_IN' | 'REGISTERED',
  customerId: null as number | null,
  walkInName: '',
})
const line = ref({
  productId: null as number | null,
  unitId: null as number | null,
  quantity: 1,
  productName: '',
  sku: '',
  unitName: '',
  officialPrice: null as number | null,
  priceListCode: '',
})
const cart = ref<CartLine[]>([])
const selectedProduct = ref<any>(null)

const canAddLine = computed(
  () =>
    !!line.value.productId &&
    !!line.value.unitId &&
    Number(line.value.quantity) > 0 &&
    line.value.officialPrice != null
)
const cartSubtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity * item.officialUnitPrice, 0)
)
const canCheckout = computed(
  () =>
    activeCompanyReady.value &&
    !!form.value.warehouseId &&
    cart.value.length > 0 &&
    (form.value.customerMode === 'WALK_IN' || !!form.value.customerId)
)

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(value)
  )
}

function headers() {
  const token = readAccessToken()
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function resolveOfficialPrice(productId: number, unitId: number) {
  const { $api } = useNuxtApp()
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch {
    return null
  }
  const res = await fetch($api.productSellingPriceResolve(), {
    method: 'POST',
    headers: headers(),
    credentials: 'include',
    body: JSON.stringify({
      perusahaanId: companyId,
      productId,
      unitId,
      channel: 'RETAIL',
      asOf: new Date().toISOString().slice(0, 10),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Harga resmi tidak tersedia.'
    return null
  }
  return payload.data || payload
}

function onProductSelect(product: any) {
  selectedProduct.value = product
  line.value.productName = product?.name || ''
  line.value.sku = product?.sku || ''
  if (product?.unitId && !line.value.unitId) {
    line.value.unitId = Number(product.unitId)
    line.value.unitName = product?.unit?.name || product?.unit?.nmUnit || ''
  }
  void refreshLinePrice()
}

watch(
  () => [line.value.productId, line.value.unitId],
  () => {
    void refreshLinePrice()
  }
)

async function refreshLinePrice() {
  line.value.officialPrice = null
  line.value.priceListCode = ''
  if (!line.value.productId || !line.value.unitId) return
  const resolved = await resolveOfficialPrice(line.value.productId, line.value.unitId)
  if (!resolved) return
  line.value.officialPrice = Number(resolved.unitPrice ?? resolved.officialUnitPrice)
  line.value.priceListCode = resolved.priceListCode || ''
  line.value.unitName = resolved.unitName || line.value.unitName
}

function addLine() {
  if (!canAddLine.value || line.value.productId == null || line.value.unitId == null) return
  const existing = cart.value.findIndex(
    (item) => item.productId === line.value.productId && item.unitId === line.value.unitId
  )
  if (existing >= 0) {
    cart.value[existing].quantity += Number(line.value.quantity)
  } else {
    cart.value.push({
      productId: line.value.productId,
      unitId: line.value.unitId,
      quantity: Number(line.value.quantity),
      productName: line.value.productName || selectedProduct.value?.name || `Produk #${line.value.productId}`,
      sku: line.value.sku || selectedProduct.value?.sku || '',
      unitName: line.value.unitName || '',
      officialUnitPrice: Number(line.value.officialPrice),
      priceListCode: line.value.priceListCode,
    })
  }
  line.value.productId = null
  line.value.unitId = null
  line.value.quantity = 1
  line.value.officialPrice = null
  line.value.productName = ''
  line.value.sku = ''
  selectedProduct.value = null
}

function removeLine(index: number) {
  cart.value.splice(index, 1)
}

async function checkout() {
  error.value = ''
  notice.value = ''
  let companyId: number
  try {
    companyId = requireCompanyId()
  } catch (err: any) {
    error.value = err?.message || activeCompanyMissing.value
    return
  }
  if (!canCheckout.value) {
    error.value = 'Lengkapi gudang, pelanggan, dan keranjang.'
    return
  }
  saving.value = true
  const { $api } = useNuxtApp()
  const res = await fetch($api.directSaleCheckout(), {
    method: 'POST',
    headers: headers(),
    credentials: 'include',
    body: JSON.stringify({
      perusahaanId: companyId,
      idempotencyKey: crypto.randomUUID(),
      warehouseId: form.value.warehouseId,
      customerMode: form.value.customerMode,
      customerId: form.value.customerMode === 'REGISTERED' ? form.value.customerId : null,
      walkInName: form.value.customerMode === 'WALK_IN' ? form.value.walkInName || null : null,
      confirm: true,
      items: cart.value.map((item) => ({
        productId: item.productId,
        unitId: item.unitId,
        quantity: item.quantity,
        // Display-only; server re-resolves official price and rejects tampering.
        expectedUnitPrice: item.officialUnitPrice,
      })),
    }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) {
    error.value = payload?.message || 'Checkout Direct Sale ditolak.'
    return
  }
  notice.value = `Direct Sale ${payload?.data?.saleNumber || ''} · ${payload?.data?.checkout?.status || 'CONFIRMED'}. Lanjut fulfill di Riwayat.`
  cart.value = []
  form.value.walkInName = ''
  form.value.customerId = null
}

onMounted(async () => {
  await ensureBootstrapped()
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
  }
})
</script>

<style scoped>
.pos-page {
  max-width: 1200px;
}
.pos-cart {
  position: sticky;
  top: 1rem;
}
@media (max-width: 991px) {
  .pos-cart {
    position: static;
  }
}
</style>
