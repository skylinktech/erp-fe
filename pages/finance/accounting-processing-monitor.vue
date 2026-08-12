<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Accounting Processing Monitor</h4>
      <p class="mb-4 text-muted">Outbox monitor (business label). Payload not editable.</p>
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
          <th>Created</th>
          <th>Event</th>
          <th>Source</th>
          <th>Status</th>
          <th>Attempts</th>
          <th>Error</th>
          <th>Journal</th>
        </tr></thead><tbody>
          <tr v-for="(row,i) in rows" :key="row.id||i" style="cursor:pointer" @click="selected=row">
            <td>{{ row.createdAt }}</td>
            <td>{{ row.eventType }}</td>
            <td>{{ row.sourceType }}:{{ row.sourceId }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.attemptCount }}</td>
            <td>{{ row.errorMessage||'-' }}</td>
            <td>{{ row.journalId||'-' }}</td>
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
        <div class="card-body"><pre class="small mb-0">{{ selected }}</pre></div>
      </div>
    </div>
  </div>
</template>
<script setup>
definePageMeta({ middleware: ['auth', 'check-permission'] })
const { $api, $apiFetch } = useNuxtApp()
const loading=ref(false), error=ref(''), rows=ref([]), selected=ref(null), page=ref(1), summary=ref(null)
const filterFields = [{key:'status',label:'Status'},{key:'eventType',label:'Event Type'}]
const filters = reactive(Object.fromEntries(filterFields.map(f=>[f.key,''])))
async function load() {
  loading.value=true; error.value=''; summary.value=null
  try {
    const params=new URLSearchParams({ page:String(page.value), limit:'25' })
    Object.entries(filters).forEach(([k,v])=>{ if(v) params.set(k,String(v)) })
    const res = await $apiFetch(`${$api.accountingOutbox()}?${params}`)
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
