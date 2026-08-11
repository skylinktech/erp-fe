<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Inventory Reconciliation</h4>
      <p class="mb-6">
        Opening + Σ IN − Σ OUT vs <code>stocks.quantity</code>. Read-only — variance harus diselesaikan lewat formal adjustment, bukan update stok langsung.
      </p>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-2">
              <label class="form-label">Product ID</label>
              <input v-model.number="filters.productId" type="number" class="form-control" placeholder="optional" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Warehouse ID</label>
              <input v-model.number="filters.warehouseId" type="number" class="form-control" placeholder="optional" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Status</label>
              <select v-model="filters.status" class="form-select">
                <option value="">All</option>
                <option value="MATCHED">MATCHED</option>
                <option value="VARIANCE">VARIANCE</option>
                <option value="INVESTIGATION_REQUIRED">INVESTIGATION_REQUIRED</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary w-100" @click="load">Reconcile</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Product</th>
                <th>Warehouse</th>
                <th class="text-end">Opening</th>
                <th class="text-end">IN</th>
                <th class="text-end">OUT</th>
                <th class="text-end">Expected</th>
                <th class="text-end">Actual</th>
                <th class="text-end">Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in rows" :key="idx">
                <td>{{ r.productId }}</td>
                <td>{{ r.warehouseId }}</td>
                <td class="text-end">{{ r.opening }}</td>
                <td class="text-end">{{ r.inbound }}</td>
                <td class="text-end">{{ r.outbound }}</td>
                <td class="text-end">{{ r.expectedClosing }}</td>
                <td class="text-end">{{ r.actualQuantity }}</td>
                <td class="text-end">{{ r.variance }}</td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'bg-success': r.status === 'MATCHED',
                      'bg-warning text-dark': r.status === 'VARIANCE',
                      'bg-danger': r.status === 'INVESTIGATION_REQUIRED',
                    }"
                  >{{ r.status }}</span>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="9" class="text-muted">Belum ada hasil</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api, $toast } = useNuxtApp()
const rows = ref([])
const filters = reactive({
  productId: null,
  warehouseId: null,
  status: '',
})

const load = async () => {
  try {
    const res = await $fetch($api.stockReconcile(), {
      credentials: 'include',
      query: {
        productId: filters.productId || undefined,
        warehouseId: filters.warehouseId || undefined,
        status: filters.status || undefined,
        limit: 100,
      },
    })
    const data = res?.data
    rows.value = Array.isArray(data) ? data : data ? [data] : []
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Gagal reconcile')
  }
}
</script>
