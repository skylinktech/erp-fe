<template>
  <div>
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
      <p class="mb-0 text-muted">{{ subtitle }}</p>
      <div class="d-flex flex-wrap gap-2 align-items-end">
        <div>
          <label class="form-label mb-0 small">Cari</label>
          <input
            v-model="search"
            type="search"
            class="form-control form-control-sm"
            :placeholder="searchPlaceholder"
          />
        </div>
        <div>
          <label class="form-label mb-0 small">Bucket</label>
          <select v-model="bucketFilter" class="form-select form-select-sm">
            <option value="all">Semua</option>
            <option value="current">Current</option>
            <option value="b1_30">1–30</option>
            <option value="b31_60">31–60</option>
            <option value="b61_90">61–90</option>
            <option value="b90_plus">&gt; 90</option>
          </select>
        </div>
        <button class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="$emit('refresh')">
          Refresh
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="loading" class="text-muted py-4">Memuat data…</div>
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead>
              <tr>
                <th>{{ documentLabel }}</th>
                <th>{{ partyLabel }}</th>
                <th>Invoice Date</th>
                <th>Due</th>
                <th class="text-end">Total</th>
                <th class="text-end">Paid</th>
                <th class="text-end">Remaining</th>
                <th>Status</th>
                <th>Days</th>
                <th>Bucket</th>
                <th class="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.id">
                <td class="fw-semibold">{{ row.number }}</td>
                <td>{{ row.partyName || '—' }}</td>
                <td>{{ row.documentDate || '—' }}</td>
                <td>{{ row.dueDate || '—' }}</td>
                <td class="text-end">{{ formatFinanceMoney(row.total) }}</td>
                <td class="text-end">{{ formatFinanceMoney(row.paidAmount) }}</td>
                <td class="text-end">{{ formatFinanceMoney(row.remainingAmount) }}</td>
                <td><PaymentStatusBadge :status="row.paymentStatus" /></td>
                <td>{{ row.overdueDays }}</td>
                <td><AgingBucketBadge :bucket="String(row.agingBucket)" /></td>
                <td class="text-end">
                  <div class="dropdown d-inline-block">
                    <a
                      href="javascript:;"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                      data-bs-toggle="dropdown"
                      data-bs-popper-config='{"strategy":"fixed"}'
                    >
                      <i class="ri-more-2-fill"></i>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <a
                          class="dropdown-item"
                          href="javascript:void(0)"
                          @click="$emit('view', row)"
                        >
                          <i class="ri-eye-line me-2"></i> {{ viewActionLabel }}
                        </a>
                      </li>
                      <li v-if="canCreatePayment">
                        <a
                          class="dropdown-item text-success"
                          href="javascript:void(0)"
                          @click="$emit('create-payment', row)"
                        >
                          <i class="ri-money-dollar-circle-line me-2"></i>
                          {{ createPaymentLabel }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredRows.length">
                <td colspan="11" class="text-center text-muted">{{ emptyMessage }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OpenDocumentRow } from '~/types/finance/workspace'
import { formatFinanceMoney } from '~/utils/finance/agingView'
import PaymentStatusBadge from '~/components/finance/PaymentStatusBadge.vue'
import AgingBucketBadge from '~/components/finance/AgingBucketBadge.vue'

const props = withDefaults(
  defineProps<{
    rows: OpenDocumentRow[]
    loading?: boolean
    error?: string
    subtitle?: string
    partyLabel?: string
    documentLabel?: string
    searchPlaceholder?: string
    emptyMessage?: string
    viewActionLabel?: string
    createPaymentLabel?: string
    canCreatePayment?: boolean
  }>(),
  {
    loading: false,
    error: '',
    subtitle: '',
    partyLabel: 'Party',
    documentLabel: 'Nomor',
    searchPlaceholder: 'Cari…',
    emptyMessage: 'Tidak ada dokumen outstanding',
    viewActionLabel: 'Lihat',
    createPaymentLabel: 'Buat Pembayaran',
    canCreatePayment: false,
  }
)

defineEmits<{
  refresh: []
  view: [row: OpenDocumentRow]
  'create-payment': [row: OpenDocumentRow]
}>()

const search = ref('')
const bucketFilter = ref('all')

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.rows.filter((row) => {
    if (bucketFilter.value !== 'all' && row.agingBucket !== bucketFilter.value) return false
    if (!q) return true
    return (
      row.number.toLowerCase().includes(q) ||
      row.partyName.toLowerCase().includes(q)
    )
  })
})
</script>
