<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Inventory Adjustment</h4>
      <p class="mb-6">Penyesuaian stok operasional (IN/OUT) melalui inventory ledger. Tidak ada valuasi/akuntansi.</p>

      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header"><strong>Buat Adjustment</strong></div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Warehouse</label>
                <select v-model="form.warehouseId" class="form-select">
                  <option value="">Pilih warehouse</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Reason</label>
                <select v-model="form.reason" class="form-select">
                  <option v-for="r in reasons" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea v-model="form.notes" class="form-control" rows="2" />
              </div>
              <div class="mb-3">
                <label class="form-label">Product ID</label>
                <input v-model.number="form.productId" type="number" class="form-control" />
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Quantity</label>
                  <input v-model.number="form.quantity" type="number" min="0.01" step="0.01" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label">Direction</label>
                  <select v-model="form.direction" class="form-select">
                    <option value="IN">IN (+)</option>
                    <option value="OUT">OUT (−)</option>
                  </select>
                </div>
              </div>
              <button class="btn btn-primary" :disabled="saving" @click="createAdjustment">
                {{ saving ? 'Saving...' : 'Create Draft' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>Daftar Adjustment</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="loadList">Refresh</button>
            </div>
            <div class="card-body table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>WH</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id">
                    <td>{{ row.noAdj }}</td>
                    <td>{{ row.warehouse?.name || row.warehouseId }}</td>
                    <td>{{ row.reason }}</td>
                    <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
                    <td class="text-nowrap">
                      <button v-if="row.status === 'draft'" class="btn btn-xs btn-outline-primary me-1" @click="approve(row.id)">Approve</button>
                      <button v-if="['draft','approved'].includes(row.status)" class="btn btn-xs btn-outline-success me-1" @click="post(row.id)">Post</button>
                      <button v-if="row.status === 'posted'" class="btn btn-xs btn-outline-danger" @click="reverse(row.id)">Reverse</button>
                    </td>
                  </tr>
                  <tr v-if="!rows.length">
                    <td colspan="5" class="text-muted">Belum ada data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api, $toast } = useNuxtApp()
const warehouses = ref([])
const reasons = ref([])
const rows = ref([])
const saving = ref(false)
const form = reactive({
  warehouseId: '',
  reason: 'STOCK_OPNAME_DIFFERENCE',
  notes: '',
  productId: null,
  quantity: 1,
  direction: 'IN',
})

const loadWarehouses = async () => {
  try {
    const res = await $fetch($api.warehouse(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
}

const loadReasons = async () => {
  try {
    const res = await $fetch($api.inventoryAdjustmentReasons(), { credentials: 'include' })
    reasons.value = res?.data || []
    if (reasons.value.length) form.reason = reasons.value[0]
  } catch {
    reasons.value = ['STOCK_OPNAME_DIFFERENCE', 'DAMAGE', 'LOSS', 'FOUND', 'EXPIRED', 'DATA_CORRECTION', 'OTHER']
  }
}

const loadList = async () => {
  try {
    const res = await $fetch($api.inventoryAdjustment(), { credentials: 'include', query: { page: 1, limit: 50 } })
    rows.value = res?.data || res?.meta ? (res.data || []) : (Array.isArray(res) ? res : [])
    if (res?.meta && Array.isArray(res.data)) rows.value = res.data
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Gagal load adjustment')
  }
}

const createAdjustment = async () => {
  saving.value = true
  try {
    await $fetch($api.inventoryAdjustment(), {
      method: 'POST',
      credentials: 'include',
      body: {
        warehouseId: Number(form.warehouseId),
        reason: form.reason,
        notes: form.notes || null,
        items: [{
          productId: Number(form.productId),
          quantity: Number(form.quantity),
          direction: form.direction,
        }],
      },
    })
    $toast?.success?.('Adjustment draft dibuat')
    await loadList()
  } catch (e) {
    $toast?.error?.(e?.data?.message || e?.message || 'Gagal create')
  } finally {
    saving.value = false
  }
}

const approve = async (id) => {
  try {
    await $fetch($api.approveInventoryAdjustment(id), { method: 'PATCH', credentials: 'include' })
    $toast?.success?.('Approved')
    await loadList()
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Approve gagal')
  }
}

const post = async (id) => {
  try {
    await $fetch($api.postInventoryAdjustment(id), { method: 'POST', credentials: 'include' })
    $toast?.success?.('Posted ke ledger')
    await loadList()
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Post gagal')
  }
}

const reverse = async (id) => {
  const reason = window.prompt('Alasan reverse (wajib):')
  if (!reason?.trim()) return
  try {
    await $fetch($api.reverseInventoryAdjustment(id), {
      method: 'POST',
      credentials: 'include',
      body: { reason },
    })
    $toast?.success?.('Reversed')
    await loadList()
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Reverse gagal')
  }
}

onMounted(async () => {
  await Promise.all([loadWarehouses(), loadReasons(), loadList()])
})
</script>
