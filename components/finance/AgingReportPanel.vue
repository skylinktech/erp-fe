<template>
  <div>
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
      <div>
        <p class="mb-0 text-muted">
          Outstanding per bucket umur (as of {{ report?.asOf || '—' }})
        </p>
      </div>
      <div class="d-flex flex-wrap gap-2 align-items-end">
        <div>
          <label class="form-label mb-0 small">As of</label>
          <input v-model="asOfLocal" type="date" class="form-control form-control-sm" />
        </div>
        <div>
          <label class="form-label mb-0 small">Bucket</label>
          <select v-model="bucketFilter" class="form-select form-select-sm">
            <option value="all">Semua</option>
            <option v-for="b in report?.buckets || []" :key="b.key" :value="b.key">
              {{ b.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="form-label mb-0 small">Cari</label>
          <input
            v-model="search"
            type="search"
            class="form-control form-control-sm"
            :placeholder="searchPlaceholder"
          />
        </div>
        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-sm"
            :class="mode === 'by_document' ? 'btn-primary' : 'btn-outline-primary'"
            @click="mode = 'by_document'"
          >
            {{ byDocumentLabel }}
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="mode === 'by_party' ? 'btn-primary' : 'btn-outline-primary'"
            @click="mode = 'by_party'"
          >
            {{ byPartyLabel }}
          </button>
        </div>
        <button class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="refresh">
          Refresh
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="loading && !report" class="text-muted py-4">Memuat aging…</div>
    <template v-else>
      <AgingSummaryCards
        :buckets="report?.buckets || []"
        :total-amount="report?.totalAmount || 0"
        :total-count="report?.totalCount || 0"
        :count-label="countLabel"
      />

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead>
                <tr v-if="mode === 'by_document'">
                  <th>{{ documentColumnLabel }}</th>
                  <th>{{ partyColumnLabel }}</th>
                  <th>Due</th>
                  <th>Days</th>
                  <th>Bucket</th>
                  <th class="text-end">Remaining</th>
                </tr>
                <tr v-else>
                  <th>{{ partyColumnLabel }}</th>
                  <th class="text-end"># Dokumen</th>
                  <th class="text-end">Max Days</th>
                  <th>Worst Bucket</th>
                  <th class="text-end">Remaining</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="mode === 'by_document'">
                  <tr v-for="row in filteredRows" :key="row.id">
                    <td>{{ row.number }}</td>
                    <td>{{ row.partyName || row.partyId || '—' }}</td>
                    <td>{{ row.dueDate || '—' }}</td>
                    <td>{{ row.daysPastDue }}</td>
                    <td><AgingBucketBadge :bucket="String(row.bucket)" /></td>
                    <td class="text-end">{{ formatFinanceMoney(row.remainingAmount) }}</td>
                  </tr>
                  <tr v-if="!filteredRows.length">
                    <td colspan="6" class="text-center text-muted">{{ emptyMessage }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="row in partyRows" :key="row.partyId">
                    <td>{{ row.partyName }}</td>
                    <td class="text-end">{{ row.invoiceCount }}</td>
                    <td class="text-end">{{ row.maxDaysPastDue }}</td>
                    <td><AgingBucketBadge :bucket="String(row.worstBucket)" /></td>
                    <td class="text-end">{{ formatFinanceMoney(row.remainingAmount) }}</td>
                  </tr>
                  <tr v-if="!partyRows.length">
                    <td colspan="5" class="text-center text-muted">{{ emptyMessage }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AgingViewMode } from '~/types/finance/workspace'
import {
  aggregateAgingByParty,
  filterAgingRows,
  formatFinanceMoney,
} from '~/utils/finance/agingView'
import { useAgingReport } from '~/composables/useAgingReport'
import AgingSummaryCards from '~/components/finance/AgingSummaryCards.vue'
import AgingBucketBadge from '~/components/finance/AgingBucketBadge.vue'
import { useDebounceFn } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    side: 'ar' | 'ap'
    partyColumnLabel?: string
    documentColumnLabel?: string
    byDocumentLabel?: string
    byPartyLabel?: string
    searchPlaceholder?: string
    countLabel?: string
    emptyMessage?: string
    partyId?: string | number | null
  }>(),
  {
    partyColumnLabel: 'Party',
    documentColumnLabel: 'Invoice',
    byDocumentLabel: 'By Invoice',
    byPartyLabel: 'By Party',
    searchPlaceholder: 'Cari…',
    countLabel: 'dokumen',
    emptyMessage: 'Tidak ada outstanding',
    partyId: null,
  }
)

const { report, loading, error, load } = useAgingReport(props.side)
const route = useRoute()
const router = useRouter()

const asOfLocal = ref(String(route.query.asOf || new Date().toISOString().slice(0, 10)))
const bucketFilter = ref(String(route.query.bucket || 'all'))
const search = ref(String(route.query.search || ''))
const mode = ref<AgingViewMode>(
  route.query.mode === 'by_party' ? 'by_party' : 'by_document'
)

const filteredRows = computed(() =>
  filterAgingRows(report.value?.rows || [], {
    search: search.value,
    bucket: bucketFilter.value,
    partyId: props.partyId,
  })
)

const partyRows = computed(() => aggregateAgingByParty(filteredRows.value))

function syncQuery() {
  const query = {
    ...route.query,
    asOf: asOfLocal.value || undefined,
    bucket: bucketFilter.value !== 'all' ? bucketFilter.value : undefined,
    search: search.value.trim() || undefined,
    mode: mode.value === 'by_party' ? 'by_party' : undefined,
  }
  router.replace({ query })
}

async function refresh() {
  await load({
    asOf: asOfLocal.value,
    customerId: props.side === 'ar' ? props.partyId : undefined,
    vendorId: props.side === 'ap' ? props.partyId : undefined,
    force: true,
  })
}

onMounted(() => refresh())

watch(
  () => props.partyId,
  () => refresh()
)

watch(asOfLocal, () => {
  syncQuery()
  refresh()
})

watch([bucketFilter, mode], () => {
  syncQuery()
})

watch(
  search,
  useDebounceFn(() => {
    syncQuery()
  }, 300)
)
</script>
