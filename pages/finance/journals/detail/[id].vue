<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-1">Journal Detail</h4>
          <PageBreadcrumb class="mt-1" current-label="Journal Detail" />
          <p class="mb-0 text-muted">Header, lines, and inventory accounting trace when related.</p>
        </div>
        <NuxtLink class="btn btn-outline-secondary btn-sm" to="/finance/journals">Back to Journals</NuxtLink>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="text-muted">Loading…</div>

      <template v-if="journal && !loading">
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <h6 class="text-muted">Document Information</h6>
                <dl class="row mb-0 small">
                  <dt class="col-4">Journal No</dt><dd class="col-8">{{ journal.journalNumber }}</dd>
                  <dt class="col-4">Date</dt><dd class="col-8">{{ formatDate(journal.date) }}</dd>
                  <dt class="col-4">Status</dt>
                  <dd class="col-8"><span class="badge bg-label-secondary">{{ journal.status }}</span></dd>
                  <dt class="col-4">Description</dt><dd class="col-8">{{ journal.description || '-' }}</dd>
                  <dt class="col-4">Company / Period</dt>
                  <dd class="col-8">{{ journal.fiscalPeriod?.name || journal.fiscalPeriodId || '-' }}</dd>
                </dl>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Source / Audit</h6>
                <dl class="row mb-0 small">
                  <dt class="col-4">Reference</dt>
                  <dd class="col-8">{{ journal.referenceType || '-' }} / {{ journal.referenceId || '-' }}</dd>
                  <dt class="col-4">Created By</dt>
                  <dd class="col-8">{{ journal.createdByUser?.name || journal.createdBy || '-' }}</dd>
                  <dt class="col-4">Posted By / At</dt>
                  <dd class="col-8">{{ journal.postedBy || '-' }} / {{ formatDate(journal.postedAt) }}</dd>
                  <dt class="col-4">Reversal Of</dt>
                  <dd class="col-8">
                    <NuxtLink
                      v-if="journal.reversalOfJournalId"
                      :to="`/finance/journals/detail/${journal.reversalOfJournalId}`"
                    >{{ shortId(journal.reversalOfJournalId) }}</NuxtLink>
                    <span v-else>-</span>
                  </dd>
                  <dt class="col-4">Reversed By</dt>
                  <dd class="col-8">
                    <NuxtLink
                      v-if="journal.reversedByJournalId"
                      :to="`/finance/journals/detail/${journal.reversedByJournalId}`"
                    >{{ shortId(journal.reversedByJournalId) }}</NuxtLink>
                    <span v-else>-</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header"><strong>Journal Lines</strong></div>
          <div class="card-body table-responsive py-3">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Account</th><th>Description</th>
                  <th class="text-end">Debit</th><th class="text-end">Credit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in journal.journalLines || []" :key="line.id">
                  <td>{{ line.account?.code || line.accountId }} — {{ line.account?.name || '' }}</td>
                  <td>{{ line.description || '-' }}</td>
                  <td class="text-end">{{ formatMoney(line.debit) }}</td>
                  <td class="text-end">{{ formatMoney(line.credit) }}</td>
                </tr>
                <tr v-if="!(journal.journalLines || []).length">
                  <td colspan="4" class="text-muted">No lines</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="(journal.inventoryAccountingEvents || []).length" class="card mb-4">
          <div class="card-header"><strong>Inventory Accounting Trace</strong></div>
          <div class="card-body table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Movement</th><th>Type</th><th>Amount</th><th>Status</th><th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in journal.inventoryAccountingEvents" :key="e.id">
                  <td>
                    <NuxtLink
                      v-if="e.stockMovementId"
                      :to="`/inventory/stock-movements`"
                      class="text-primary"
                      @click="rememberMovement(e.stockMovementId)"
                    >{{ shortId(e.stockMovementId) }}</NuxtLink>
                    <span v-else>-</span>
                  </td>
                  <td>{{ e.movementType }}</td>
                  <td>{{ formatMoney(e.amount) }}</td>
                  <td>{{ e.status }}</td>
                  <td>{{ e.sourceDocumentType || '-' }}</td>
                </tr>
              </tbody>
            </table>
            <p class="small text-muted mb-0">
              Open Stock Movements and filter/load detail for the movement ID above.
            </p>
          </div>
        </div>

        <div v-if="(journal.inventoryValuations || []).length" class="card mb-4">
          <div class="card-header"><strong>Related Valuation Entries</strong></div>
          <div class="card-body table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Product</th><th>WH</th><th>Qty</th><th>Unit Cost</th><th>Value</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in journal.inventoryValuations" :key="v.id">
                  <td>{{ v.productId }}</td>
                  <td>{{ v.warehouseId }}</td>
                  <td>{{ v.quantity }}</td>
                  <td>{{ formatMoney(v.unitCost) }}</td>
                  <td>{{ formatMoney(v.movementValue) }}</td>
                  <td>{{ v.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <details class="mb-4">
          <summary class="small text-muted">Technical IDs</summary>
          <pre class="small mt-2">{{ {
            id: journal.id,
            idempotencyKey: journal.idempotencyKey,
            accountingStatus: journal.accountingStatus,
            isSystem: journal.isSystem,
          } }}</pre>
        </details>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  hidePageHeading: true,
  middleware: ['auth', 'check-permission'],
  title: 'Journal Detail',
})

const route = useRoute()
const { $api, $apiFetch } = useNuxtApp()
const loading = ref(false)
const error = ref('')
const journal = ref(null)

function formatDate(v) {
  if (!v) return '-'
  try { return new Date(v).toLocaleString() } catch { return String(v) }
}

function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function shortId(id) {
  const s = String(id || '')
  return s.length > 12 ? `${s.slice(0, 8)}…` : s || '-'
}

function rememberMovement(_id) {
  // navigation hint only — list page opens separately
}

async function load() {
  const id = route.params.id
  if (!id) {
    error.value = 'Journal id required'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await $apiFetch($api.journalEntriesShow(id))
    journal.value = res.data || res
  } catch (e) {
    error.value = e?.data?.message || e?.message || 'Failed to load journal'
    journal.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>
