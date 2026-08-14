<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-4 text-muted">VIEW ONLY / MONITOR — inventory accounting events → journals.</p>
      <div class="card mb-4"><div class="card-body"><div class="row g-3 align-items-end">
        <div class="col-md-2" v-for="f in filterFields" :key="f.key">
          <label class="form-label">{{ f.label }}</label>
          <input v-model="filters[f.key]" :type="f.type||'text'" class="form-control" />
        </div>
        <div class="col-md-2"><button class="btn btn-primary w-100" :disabled="loading" @click="load">Load</button></div>
      </div></div></div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="summary" class="alert alert-secondary"><pre class="mb-0 small">{{ summary }}</pre></div>
      <div class="card"><div class="card-body table-responsive">
        <table class="table table-sm table-hover"><thead><tr>
          <th>Updated</th>
          <th>Movement</th>
          <th>Company</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Journal</th>
          <th>Error</th>
        </tr></thead><tbody>
          <tr v-for="(row,i) in rows" :key="row.id||i" style="cursor:pointer" @click="selected=row">
            <td>{{ formatDate(row.updatedAt) }}</td>
            <td>{{ shortId(row.stockMovementId) }}</td>
            <td>{{ row.companyId }}</td>
            <td>{{ formatMoney(row.amount) }}</td>
            <td><span class="badge bg-label-secondary">{{ row.status }}</span></td>
            <td>
              <NuxtLink v-if="row.journalId" :to="`/accounting/journals/detail?id=${row.journalId}`">
                {{ shortId(row.journalId) }}
              </NuxtLink>
              <span v-else>-</span>
            </td>
            <td>{{ row.errorCode||'-' }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="7" class="text-muted">No data — click Load</td></tr>
        </tbody></table>
        <div class="d-flex justify-content-between mt-2">
          <small class="text-muted">Page {{ page }}</small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" :disabled="page<=1" @click="page--; load()">Prev</button>
            <button class="btn btn-outline-secondary" @click="page++; load()">Next</button>
          </div>
        </div>
      </div></div>
      <div v-if="selected" class="card mt-4">
        <div class="card-header d-flex justify-content-between"><strong>Detail (VIEW ONLY)</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="selected=null">Close</button></div>
        <div class="card-body small">
          <dl class="row mb-0">
            <dt class="col-4">Movement</dt>
            <dd class="col-8"><NuxtLink to="/inventory/stock-movements">{{ selected.stockMovementId }}</NuxtLink></dd>
            <dt class="col-4">Product / WH</dt>
            <dd class="col-8">{{ selected.productId }} / {{ selected.warehouseId }}</dd>
            <dt class="col-4">Source Doc</dt>
            <dd class="col-8">{{ selected.sourceDocumentType }} #{{ selected.sourceDocumentId }}</dd>
            <dt class="col-4">Accounting Date</dt>
            <dd class="col-8">{{ selected.accountingDate || '-' }}</dd>
            <dt class="col-4">Status / Journal</dt>
            <dd class="col-8">
              {{ selected.status }} /
              <NuxtLink v-if="selected.journalId" :to="`/accounting/journals/detail?id=${selected.journalId}`">
                {{ selected.journalId }}
              </NuxtLink>
              <span v-else>-</span>
            </dd>
            <dt class="col-4">Error</dt>
            <dd class="col-8">{{ selected.errorCode || '-' }} — {{ selected.errorMessage || '-' }}</dd>
          </dl>
          <details class="mt-3"><summary class="text-muted">Technical IDs</summary>
            <pre class="mt-2 mb-0">{{ { id: selected.id, valuationEntryId: selected.valuationEntryId, idempotencyKey: selected.idempotencyKey } }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  title: "Inventory Accounting Events", middleware: ['auth', 'check-permission'] })
const { $api, $apiFetch } = useNuxtApp()
const loading=ref(false), error=ref(''), rows=ref([]), selected=ref(null), page=ref(1), summary=ref(null)
const filterFields = [{key:'status',label:'Status'},{key:'companyId',label:'Company'},{key:'stockMovementId',label:'Movement ID'}]
const filters = reactive(Object.fromEntries(filterFields.map(f=>[f.key,''])))
function formatDate(v){ if(!v) return '-'; try{return new Date(v).toLocaleString()}catch{return String(v)} }
function formatMoney(v){ if(v==null||v==='') return '-'; const n=Number(v); return Number.isNaN(n)?String(v):n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) }
function shortId(id){ const s=String(id||''); return s.length>12?`${s.slice(0,8)}…`:s||'-' }
async function load() {
  loading.value=true; error.value=''; summary.value=null
  try {
    const params=new URLSearchParams({ page:String(page.value), limit:'25' })
    Object.entries(filters).forEach(([k,v])=>{ if(v) params.set(k,String(v)) })
    const res = await $apiFetch(`${$api.inventoryAccountingEvents()}?${params}`)
    if (Array.isArray(res?.data)) rows.value = res.data
    else if (Array.isArray(res?.data?.data)) rows.value = res.data.data
    else rows.value = []
    if (res.aggregates) summary.value = res.aggregates
  } catch(e) {
    error.value = e?.data?.message || e?.message || 'Failed'
    rows.value=[]
  } finally { loading.value=false }
}
</script>
