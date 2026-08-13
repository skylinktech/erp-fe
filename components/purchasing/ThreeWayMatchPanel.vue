<script setup lang="ts">
const props = defineProps<{
  purchaseOrderId: string | number
}>()

// https://github.com/skylinktech/skylink-api/blob/main/src/main/java/com/skylinktech/core/purchase/service/ThreeWayMatchService.java
type MatchLine = {
  productId: number
  poQty: number
  receivedQty: number
  invoiceQty: number
  poPrice: number
  invoicePrice: number
  qtyVariancePct: number
  priceVariancePct: number
  status: string
  messages: string[]
}

type MatchResult = {
  status: 'pass' | 'warn' | 'fail'
  mode: string
  qtyTolerancePct: number
  priceTolerancePct: number
  summary: string
  lines: MatchLine[]
}

const loading = ref(false)
const error = ref('')
const result = ref<MatchResult | null>(null)

const statusClass: Record<string, string> = {
  pass: 'bg-success',
  warn: 'bg-warning text-dark',
  fail: 'bg-danger',
}

async function load() {
  if (!props.purchaseOrderId) return
  loading.value = true
  error.value = ''
  const { $api } = useNuxtApp()
  try {
    const res = await fetch($api.purchaseOrderThreeWayMatch(props.purchaseOrderId), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message || 'Gagal memuat 3-way match')
    result.value = json.data
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat 3-way match'
    result.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => props.purchaseOrderId,
  () => load(),
  { immediate: true }
)
</script>

<template>
  <div class="card">
    <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
      <h6 class="mb-0">3-Way Match</h6>
      <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="loading" @click="load">
        Refresh
      </button>
    </div>
    <div class="card-body pt-0">
      <div v-if="loading" class="text-muted small">Memuat...</div>
      <div v-else-if="error" class="text-danger small">{{ error }}</div>
      <template v-else-if="result">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge" :class="statusClass[result.status] || 'bg-secondary'">{{ result.status }}</span>
          <span class="small text-muted">mode={{ result.mode }} · qty±{{ result.qtyTolerancePct }}% · price±{{ result.priceTolerancePct }}%</span>
        </div>
        <p class="small mb-3">{{ result.summary }}</p>
        <div class="table-responsive" v-if="result.lines?.length">
          <table class="table table-sm mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>PO</th>
                <th>Rcv</th>
                <th>Inv</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in result.lines" :key="line.productId">
                <td>{{ line.productId }}</td>
                <td>{{ line.poQty }} @ {{ line.poPrice }}</td>
                <td>{{ line.receivedQty }}</td>
                <td>{{ line.invoiceQty }} @ {{ line.invoicePrice }}</td>
                <td>
                  <span class="badge" :class="statusClass[line.status] || 'bg-secondary'">{{ line.status }}</span>
                  <div v-for="(m, i) in line.messages" :key="i" class="small text-muted">{{ m }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-muted small">Belum ada baris untuk dicocokkan.</div>
      </template>
    </div>
  </div>
</template>
