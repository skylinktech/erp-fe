<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-6">Riwayat pergerakan dari <code>stock_movements</code> (operasional). Balance memakai before/after quantity.</p>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-2">
              <label class="form-label">Product ID</label>
              <input v-model.number="filters.productId" type="number" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Warehouse ID</label>
              <input v-model.number="filters.warehouseId" type="number" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Movement Type</label>
              <input v-model="filters.movementType" class="form-control" placeholder="optional" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Date From</label>
              <input v-model="filters.dateFrom" type="date" class="form-control" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Date To</label>
              <input v-model="filters.dateTo" type="date" class="form-control" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary w-100" @click="loadCard">Load</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Ref</th>
                <th class="text-end">IN</th>
                <th class="text-end">OUT</th>
                <th class="text-end">Balance</th>
                <th>Status</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in movements"
                :key="m.id"
                :class="{ 'table-warning': m.reversalOfMovementId }"
                style="cursor:pointer"
                @click="selected = m"
              >
                <td>{{ formatDate(m.postedAt) }}</td>
                <td>{{ m.movementType }}</td>
                <td>{{ m.referenceNumber || '-' }}</td>
                <td class="text-end">{{ m.qtyIn }}</td>
                <td class="text-end">{{ m.qtyOut }}</td>
                <td class="text-end">{{ m.balance }}</td>
                <td>{{ m.status }}</td>
                <td class="text-truncate" style="max-width:160px">{{ m.sourceDocumentType }}:{{ m.sourceDocumentId }}</td>
              </tr>
              <tr v-if="!movements.length">
                <td colspan="8" class="text-muted">Tidak ada movement / filter belum diisi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="selected" class="card mt-4">
        <div class="card-header d-flex justify-content-between">
          <strong>Movement Detail</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="selected = null">Close</button>
        </div>
        <div class="card-body">
          <pre class="mb-0 small">{{ selected }}</pre>
          <button
            v-if="selected.status === 'posted' && !selected.reversalOfMovementId"
            class="btn btn-outline-danger mt-3"
            @click="reverseSelected"
          >
            Reverse Movement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: "Stock Card", middleware: ['auth', 'check-permission'] })

const { $api, $toast } = useNuxtApp()
const movements = ref([])
const selected = ref(null)
const filters = reactive({
  productId: null,
  warehouseId: null,
  movementType: '',
  dateFrom: '',
  dateTo: '',
})

const formatDate = (v) => {
  if (!v) return '-'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return String(v)
  }
}

const loadCard = async () => {
  if (!filters.productId || !filters.warehouseId) {
    $toast?.error?.('productId dan warehouseId wajib')
    return
  }
  try {
    const res = await $fetch($api.stockCard(), {
      credentials: 'include',
      query: {
        productId: filters.productId,
        warehouseId: filters.warehouseId,
        movementType: filters.movementType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      },
    })
    movements.value = res?.data?.movements || []
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Gagal load stock card')
  }
}

const reverseSelected = async () => {
  const reason = window.prompt('Alasan reverse (wajib):')
  if (!reason?.trim() || !selected.value) return
  try {
    await $fetch($api.reverseStockMovement(selected.value.id), {
      method: 'POST',
      credentials: 'include',
      body: { reason },
    })
    $toast?.success?.('Movement reversed')
    selected.value = null
    await loadCard()
  } catch (e) {
    $toast?.error?.(e?.data?.message || 'Reverse gagal')
  }
}
</script>
