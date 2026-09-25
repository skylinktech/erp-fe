<template>
  <OmnichannelShell
    title="Inventory"
    subtitle="Ketersediaan & mapping stok kanal marketplace — bersumber dari inventory SkyFlow (read-only)"
  >
    <div class="alert alert-info small">
      Fase ini <strong>tidak</strong> membuat sumber stok kedua dan <strong>tidak</strong> mengaktifkan stock push ke TikTok.
      Data di bawah adalah mapping warehouse/SKU yang sudah tersimpan di <code>commerce_*</code>.
    </div>

    <div v-if="error" class="alert alert-danger text-break mb-3">{{ error }}</div>
    <div v-if="loading" class="text-muted mb-3">Memuat…</div>

    <section class="card mb-3">
      <div class="card-body">
        <h2 class="h6 mb-2">Warehouse terpetakan ke shop</h2>
        <div v-if="!warehouses.length" class="text-muted small">
          Belum ada mapping warehouse. Gunakan API map warehouse bila diperlukan — push stok tetap off.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-sm mb-0">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Warehouse ID</th>
                <th>Primary</th>
                <th>Buffer</th>
                <th>External WH</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in warehouses" :key="w.id">
                <td class="text-break">{{ w.shopName || w.shopId }}</td>
                <td>{{ w.warehouseId }}</td>
                <td>{{ w.isPrimary ? 'ya' : 'tidak' }}</td>
                <td>{{ w.safetyBufferQty }}</td>
                <td class="font-monospace small">{{ w.externalWarehouseId || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card mb-3">
      <div class="card-body">
        <h2 class="h6 mb-2">SKU listing terpetakan</h2>
        <div v-if="!skuRows.length" class="text-muted small">Belum ada SKU mapping ke Product Master.</div>
        <div v-else class="table-responsive">
          <table class="table table-sm mb-0">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Seller SKU</th>
                <th>Product ID</th>
                <th>Unit ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in skuRows" :key="r.id">
                <td class="text-break">{{ r.shopName || r.shopId }}</td>
                <td class="font-monospace small">{{ r.sellerSku }}</td>
                <td>{{ r.productId }}</td>
                <td>{{ r.unitId }}</td>
                <td><span class="badge bg-label-secondary">{{ r.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </OmnichannelShell>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import OmnichannelShell from '~/components/commerce/OmnichannelShell.vue'
import { readAccessToken } from '~/utils/authCookie'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()

const warehouses = ref<any[]>([])
const skuRows = ref<any[]>([])
const loading = ref(false)
const error = ref('')

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Active-Company-Id'] = String(companyId.value)
  return h
}

async function load() {
  if (!companyId.value) return
  loading.value = true
  error.value = ''
  try {
    const qs = new URLSearchParams({
      perusahaanId: String(companyId.value),
      page: '1',
      perPage: '50',
    })
    const res = await fetch(`${$api.commerceInventoryView()}?${qs}`, {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal memuat inventory view'
      warehouses.value = []
      skuRows.value = []
      return
    }
    warehouses.value = json.data?.warehouses || []
    skuRows.value = json.data?.skuListings || []
  } catch (e: any) {
    error.value = e?.message || 'Gagal memuat inventory view'
  } finally {
    loading.value = false
  }
}

watch(companyId, () => load())
onMounted(() => load())
</script>
