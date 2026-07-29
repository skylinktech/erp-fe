<template>
  <div v-if="siteInvestment" class="progress-tracker-si-items">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h6 class="mb-0">Item Site Investment</h6>
      <NuxtLink
        v-if="siteInvestmentId"
        :to="`/sales/site-investment/detail/${siteInvestmentId}`"
        class="btn btn-outline-primary btn-sm"
      >
        <i class="ri-external-link-line me-1"></i>
        Lihat Detail SI
      </NuxtLink>
    </div>

    <div class="si-item-block border rounded mb-3">
      <div class="si-item-block__header px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
        <span class="fw-medium small">
          <i class="ri-product-hunt-line me-1 text-primary"></i>
          Material / Produk
        </span>
        <span class="badge bg-label-primary">{{ materials.length }} item</span>
      </div>
      <div class="si-item-block__body p-3">
        <div v-if="!materials.length" class="text-muted small">Tidak ada material</div>
        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Produk</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Harga Satuan</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, i) in materials" :key="m.id || i">
                <td>{{ materialName(m) }}</td>
                <td class="text-center">{{ m.quantity ?? 0 }}</td>
                <td class="text-end">{{ formatRupiah(itemPrice(m)) }}</td>
                <td class="text-end fw-medium">{{ formatRupiah(itemSubtotal(m)) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="mb-0 text-end fw-semibold small mt-2">
            Subtotal Material: {{ formatRupiah(materialSubtotal) }}
          </p>
        </div>
      </div>
    </div>

    <div class="si-item-block border rounded mb-3">
      <div class="si-item-block__header px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
        <span class="fw-medium small">
          <i class="ri-service-line me-1 text-primary"></i>
          Managed Service
        </span>
        <span class="badge bg-label-primary">{{ services.length }} item</span>
      </div>
      <div class="si-item-block__body p-3">
        <div v-if="!services.length" class="text-muted small">Tidak ada service</div>
        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Service</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Harga</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in services" :key="s.id || i">
                <td>{{ serviceName(s) }}</td>
                <td class="text-center">{{ s.quantity ?? 0 }}</td>
                <td class="text-end">{{ formatRupiah(itemPrice(s)) }}</td>
                <td class="text-end fw-medium">{{ formatRupiah(itemSubtotal(s)) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="mb-0 text-end fw-semibold small mt-2">
            Subtotal Service: {{ formatRupiah(serviceSubtotal) }}
          </p>
        </div>
      </div>
    </div>

    <div class="si-item-block border rounded">
      <div class="si-item-block__header px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
        <span class="fw-medium small">
          <i class="ri-truck-line me-1 text-primary"></i>
          DID (Delivery / Installation)
        </span>
        <span class="badge bg-label-primary">{{ dids.length }} item</span>
      </div>
      <div class="si-item-block__body p-3">
        <div v-if="!dids.length" class="text-muted small">Tidak ada DID</div>
        <div v-else class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>DID</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Harga</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in dids" :key="d.id || i">
                <td>{{ didName(d) }}</td>
                <td class="text-center">{{ d.quantity ?? 1 }}</td>
                <td class="text-end">{{ formatRupiah(itemPrice(d)) }}</td>
                <td class="text-end fw-medium">{{ formatRupiah(itemSubtotal(d)) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="mb-0 text-end fw-semibold small mt-2">
            Subtotal DID: {{ formatRupiah(didSubtotal) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressTrackerSiteInvestment } from '~/stores/progress-tracker'

const props = defineProps<{
  siteInvestment?: ProgressTrackerSiteInvestment | null
}>()

const formatRupiah = useFormatRupiah()

const siteInvestmentId = computed(() => props.siteInvestment?.id ?? null)

const materials = computed(
  () =>
    props.siteInvestment?.siteInvestMaterials ??
    props.siteInvestment?.site_invest_materials ??
    []
)
const services = computed(
  () =>
    props.siteInvestment?.siteInvestServices ??
    props.siteInvestment?.site_invest_services ??
    []
)
const dids = computed(
  () => props.siteInvestment?.siteInvestDids ?? props.siteInvestment?.site_invest_dids ?? []
)

const materialSubtotal = computed(
  () =>
    Number(props.siteInvestment?.materialSubtotal ?? props.siteInvestment?.material_subtotal) || 0
)
const serviceSubtotal = computed(
  () =>
    Number(props.siteInvestment?.serviceSubtotal ?? props.siteInvestment?.service_subtotal) || 0
)
const didSubtotal = computed(
  () => Number(props.siteInvestment?.didSubtotal ?? props.siteInvestment?.did_subtotal) || 0
)

function toAmount(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const n = Number(value)
  return Number.isNaN(n) ? 0 : n
}

function itemPrice(row: { price?: number }) {
  return toAmount(row?.price)
}

function itemSubtotal(row: { subtotal?: number; quantity?: number; price?: number }) {
  const st = toAmount(row?.subtotal)
  if (st > 0) return st
  const qty = toAmount(row?.quantity) || 1
  return qty * itemPrice(row)
}

function materialName(row: Record<string, unknown>) {
  const pl = (row.priceListLine ?? row.price_list_line) as Record<string, unknown> | undefined
  const product = (pl?.product ?? {}) as Record<string, unknown>
  return String(product.name || product.sku || '—')
}

function serviceName(row: Record<string, unknown>) {
  const pl = (row.priceListLine ?? row.price_list_line) as Record<string, unknown> | undefined
  const service = (pl?.service ?? {}) as Record<string, unknown>
  return String(service.name || service.code || '—')
}

function didName(row: Record<string, unknown>) {
  const pl = (row.priceListLine ?? row.price_list_line) as Record<string, unknown> | undefined
  const did = (pl?.did ?? {}) as Record<string, unknown>
  return String(did.code || did.name || '—')
}
</script>

<style scoped>
.si-item-block {
  border-color: rgba(67, 89, 113, 0.16) !important;
}

.si-item-block__header {
  background-color: rgba(67, 89, 113, 0.04);
}
</style>
