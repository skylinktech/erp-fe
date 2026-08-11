<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Purchase Return</h4>
      <p class="mb-6">Retur pembelian operasional berdasarkan qty yang sudah di-receive (Stock In posted). Melewati InventoryPostingService.</p>

      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header"><strong>Buat Purchase Return</strong></div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Purchase Order ID (UUID)</label>
                <input v-model="form.purchaseOrderId" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Warehouse</label>
                <select v-model="form.warehouseId" class="form-select">
                  <option value="">Pilih warehouse</option>
                  <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Product ID</label>
                <input v-model.number="form.productId" type="number" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Quantity</label>
                <div class="input-group">
                  <input v-model.number="form.quantity" type="number" min="0.01" step="0.01" class="form-control" />
                  <button class="btn btn-outline-secondary" type="button" @click="checkEligible">Cek Eligible</button>
                </div>
                <small v-if="eligible != null" class="text-muted">Eligible return qty: {{ eligible }}</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Reason</label>
                <input v-model="form.reason" class="form-control" />
              </div>
              <button class="btn btn-primary" :disabled="saving" @click="createReturn">
                {{ saving ? 'Saving...' : 'Create Draft' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between">
              <strong>Daftar Purchase Return</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="loadList">Refresh</button>
            </div>
            <div class="card-body table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>PO</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id">
                    <td>{{ row.noPrtn }}</td>
                    <td class="text-truncate" style="max-width:140px">{{ row.purchaseOrderId }}</td>
                    <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
                    <td class="text-nowrap">
                      <button v-if="row.status === 'draft'" class="btn btn-xs btn-outline-primary me-1" @click="approve(row.id)">Approve</button>
                      <button v-if="['draft','approved'].includes(row.status)" class="btn btn-xs btn-outline-success me-1" @click="post(row.id)">Post</button>
                      <button v-if="row.status === 'posted'" class="btn btn-xs btn-outline-danger" @click="reverse(row.id)">Reverse</button>
                    </td>
                  </tr>
                  <tr v-if="!rows.length">
                    <td colspan="4" class="text-muted">Belum ada data</td>
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
const rows = ref([])
const eligible = ref(null)
const saving = ref(false)
const form = reactive({
  purchaseOrderId: '',
  warehouseId: '',
  productId: null,
  quantity: 1,
  reason: '',
})

const loadWarehouses = async () => {
  try {
    const res = await $fetch($api.warehouse(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
}

const loadList = async () => {
  try {
    const res = await $fetch($api.purchaseReturn(), { credentials: 'include', query: { page: 1, limit: 50 } })
    rows.value = Array.isArray(res?.data) ? res.data : []
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Gagal load purchase return')
  }
}

const checkEligible = async () => {
  try {
    const res = await $fetch($api.purchaseReturnEligible(), {
      credentials: 'include',
      query: {
        purchaseOrderId: form.purchaseOrderId,
        productId: form.productId,
        warehouseId: form.warehouseId,
      },
    })
    eligible.value = res?.data?.eligible ?? null
  } catch (e) {
    eligible.value = null
    $toast?.error?.(e?.data?.message || 'Gagal cek eligible')
  }
}

const createReturn = async () => {
  saving.value = true
  try {
    await $fetch($api.purchaseReturn(), {
      method: 'POST',
      credentials: 'include',
      body: {
        purchaseOrderId: form.purchaseOrderId,
        warehouseId: Number(form.warehouseId),
        reason: form.reason || null,
        items: [{ productId: Number(form.productId), quantity: Number(form.quantity) }],
      },
    })
    $toast?.success?.('Purchase Return draft dibuat')
    await loadList()
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Gagal create')
  } finally {
    saving.value = false
  }
}

const approve = async (id) => {
  try {
    await $fetch($api.approvePurchaseReturn(id), { method: 'PATCH', credentials: 'include' })
    $toast?.success?.('Approved')
    await loadList()
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Approve gagal')
  }
}

const post = async (id) => {
  try {
    await $fetch($api.postPurchaseReturn(id), { method: 'POST', credentials: 'include' })
    $toast?.success?.('Posted (PURCHASE_RETURN OUT)')
    await loadList()
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Post gagal')
  }
}

const reverse = async (id) => {
  const reason = window.prompt('Alasan reverse (wajib):')
  if (!reason?.trim()) return
  try {
    await $fetch($api.reversePurchaseReturn(id), {
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
  await Promise.all([loadWarehouses(), loadList()])
})
</script>
