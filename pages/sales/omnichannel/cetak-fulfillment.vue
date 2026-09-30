<template>
  <div class="container-fluid py-3">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
      <div>
        <h1 class="h5 mb-0">
          {{ kindLabel }} — {{ order?.externalOrderId || orderId }}
        </h1>
        <p class="text-muted small mb-0">Dokumen SkyFlow (bukan PDF marketplace)</p>
      </div>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="load" :disabled="loading">
          Muat ulang
        </button>
        <button type="button" class="btn btn-primary btn-sm" :disabled="loading || !doc" @click="doPrint">
          Cetak
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="loading" class="text-muted">Memuat dokumen…</div>

    <div v-if="doc" class="card fulfill-print-sheet">
      <div class="card-body">
        <header class="mb-3 border-bottom pb-2">
          <div class="fw-semibold">SkyFlow Omnichannel</div>
          <div class="h5 mb-1">{{ kindLabel }}</div>
          <div class="small text-muted">
            Order {{ doc.order?.externalOrderId }} · {{ doc.order?.platformCode }} ·
            {{ doc.order?.shopName || '—' }} · WH {{ doc.order?.warehouseId || '—' }}
          </div>
          <div class="small text-muted">Dibuat {{ doc.generatedAt }} · sumber {{ doc.source }}</div>
        </header>

        <p class="small text-muted">{{ doc.note }}</p>

        <div class="table-responsive">
          <table class="table table-sm table-bordered mb-0">
            <thead>
              <tr>
                <th style="width: 3rem">#</th>
                <th>SKU / Produk</th>
                <th class="text-end" style="width: 5rem">Qty</th>
                <th style="width: 6rem">Product ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(line, idx) in doc.lines || []" :key="line.externalLineId || idx">
                <td>{{ idx + 1 }}</td>
                <td>
                  <div class="fw-semibold">{{ line.productName || '—' }}</div>
                  <div class="small text-muted font-monospace">{{ line.sellerSku || '—' }}</div>
                </td>
                <td class="text-end">{{ line.quantity }}</td>
                <td class="font-monospace small">{{ line.mappedProductId || '—' }}</td>
              </tr>
              <tr v-if="!(doc.lines || []).length">
                <td colspan="4" class="text-muted text-center">Tidak ada line.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { readAccessToken } from '~/utils/authCookie'

definePageMeta({ layout: 'cetak' })

const { $api } = useNuxtApp() as any
const route = useRoute()
const { companyId } = useActiveCompany()

const orderId = computed(() => String(route.query.orderId || ''))
const kind = computed(() => (route.query.kind === 'packing' ? 'packing' : 'picking'))
const kindLabel = computed(() => (kind.value === 'packing' ? 'Packing List' : 'Picking List'))

const loading = ref(false)
const error = ref('')
const doc = ref<any>(null)
const order = computed(() => doc.value?.order)

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Company-Id'] = String(companyId.value)
  return h
}

async function load() {
  if (!orderId.value || !companyId.value) {
    error.value = 'orderId dan perusahaan aktif wajib.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await fetch($api.commerceExternalOrderDoc(orderId.value, kind.value), {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal memuat dokumen'
      doc.value = null
      return
    }
    doc.value = json.data
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat dokumen'
  } finally {
    loading.value = false
  }
}

function doPrint() {
  window.print()
}

watch([orderId, kind, companyId], () => load())
onMounted(load)
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  .fulfill-print-sheet {
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
