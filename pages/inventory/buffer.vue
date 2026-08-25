<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Buffer Stock</h4>
          <p class="mb-0 text-muted">
            Buffer adalah reservation tipe BUFFER — tidak mengubah On Hand dan tidak membuat stock movement.
          </p>
        </div>
        <NuxtLink to="/inventory/stock" class="btn btn-outline-secondary btn-sm">
          ← Kembali ke Stock
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header"><strong>Buat Buffer Reservation</strong></div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Produk</label>
                <CustomSelect2
                  v-model="form.productId"
                  :options="allProducts"
                  :get-option-label="o => `${o.sku} - ${o.name}`"
                  :reduce="o => o.id"
                  searchable
                  clearable
                  placeholder="-- Pilih Produk --"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Warehouse</label>
                <select v-model="form.warehouseId" class="form-select">
                  <option value="">Pilih warehouse</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">
                    {{ w.code }} — {{ w.name }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Quantity</label>
                <input v-model.number="form.quantity" type="number" min="0.01" step="0.01" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Reference</label>
                <input v-model="form.reference" type="text" class="form-control" placeholder="BUFFER-POLICY-8 / MANUAL-REF" />
              </div>
              <div class="mb-3">
                <label class="form-label">Reason / Notes</label>
                <textarea v-model="form.notes" class="form-control" rows="2" />
              </div>
              <button
                class="btn btn-primary"
                :disabled="saving || !(userHasRole('superadmin') || userHasPermission('manage_buffer_stock'))"
                @click="createBuffer"
              >
                {{ saving ? 'Saving...' : 'Create Buffer' }}
              </button>
              <p class="small text-muted mt-2 mb-0">
                Requires permission <code>manage_buffer_stock</code>.
              </p>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>Active Buffer Allocations</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="loadBuffers">Refresh</button>
            </div>
            <div class="card-body table-responsive py-3">
              <table class="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th class="text-end">Qty</th>
                    <th>Reference</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id">
                    <td>
                      <div>{{ row.product?.sku || row.productId }}</div>
                      <small class="text-muted">{{ row.product?.name }}</small>
                    </td>
                    <td>{{ row.warehouse?.code || row.warehouseId }}</td>
                    <td class="text-end">{{ Math.floor(Number(row.quantity) || 0) }}</td>
                    <td><code class="small">{{ row.sourceId }}</code></td>
                    <td class="small">{{ row.notes || '—' }}</td>
                    <td>
                      <button
                        v-if="userHasRole('superadmin') || userHasPermission('manage_buffer_stock') || userHasPermission('release_stock_reservation')"
                        class="btn btn-xs btn-outline-warning"
                        @click="releaseBuffer(row)"
                      >
                        Release
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!rows.length && !loading">
                    <td colspan="6" class="text-muted">Belum ada buffer aktif</td>
                  </tr>
                </tbody>
              </table>
              <p class="small text-muted mb-0">
                Release mengembalikan qty ke Available; On Hand tidak berubah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useProductStore } from '~/stores/product'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api } = useNuxtApp()
const toast = useToast()
const { userHasPermission, userHasRole } = usePermissions()
const productStore = useProductStore()
const { allProducts } = storeToRefs(productStore)

const warehouses = ref([])
const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const form = reactive({
  productId: null,
  warehouseId: '',
  quantity: 1,
  reference: '',
  notes: '',
})

function showApiError(e, fallback = 'Terjadi kesalahan') {
  toast.error({
    title: 'Error',
    message: getApiErrorMessage(e, fallback),
    color: 'red',
    position: 'bottomRight',
  })
}

async function loadWarehouses() {
  try {
    const res = await $fetch($api.warehouse(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
}

async function loadBuffers() {
  loading.value = true
  try {
    const res = await $fetch($api.stockReservationBuffers(), {
      credentials: 'include',
      query: { status: 'ACTIVE', rows: 100 },
    })
    rows.value = res?.data || []
  } catch (e) {
    showApiError(e, 'Gagal load buffer')
  } finally {
    loading.value = false
  }
}

async function createBuffer() {
  if (!form.productId || !form.warehouseId || !(form.quantity > 0)) {
    toast.error({
      title: 'Validasi',
      message: 'Product, warehouse, dan quantity wajib',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  saving.value = true
  try {
    await $fetch($api.stockReservationBufferCreate(), {
      method: 'POST',
      credentials: 'include',
      body: {
        productId: form.productId,
        warehouseId: Number(form.warehouseId),
        quantity: form.quantity,
        reference: form.reference || undefined,
        notes: form.notes || undefined,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'Buffer reservation dibuat',
      color: 'green',
      position: 'bottomRight',
    })
    form.quantity = 1
    form.reference = ''
    form.notes = ''
    await loadBuffers()
  } catch (e) {
    showApiError(e, 'Gagal membuat buffer')
  } finally {
    saving.value = false
  }
}

async function releaseBuffer(row) {
  if (!confirm(`Release buffer ${row.product?.sku || row.productId} qty ${row.quantity}?`)) return
  try {
    await $fetch($api.stockReservationRelease(row.id), {
      method: 'POST',
      credentials: 'include',
      body: {},
    })
    toast.success({
      title: 'Berhasil',
      message: 'Buffer di-release',
      color: 'green',
      position: 'bottomRight',
    })
    await loadBuffers()
  } catch (e) {
    showApiError(e, 'Gagal release buffer')
  }
}

onMounted(async () => {
  await Promise.all([
    productStore.fetchAllProducts(),
    loadWarehouses(),
    loadBuffers(),
  ])
})
</script>
