<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Inventory NRV</h4>
      <p class="mb-4 text-muted">NRV reconciliation + assessments list (VIEW ONLY workflow visibility).</p>
      <div class="card mb-4"><div class="card-body"><div class="row g-3 align-items-end">
        <div class="col-md-2"><label class="form-label">Company ID</label><input v-model="companyId" class="form-control" /></div>
        <div class="col-md-2"><button class="btn btn-outline-secondary w-100" :disabled="loading" @click="loadAssessments">Assessments</button></div>
        <div class="col-md-2"><button class="btn btn-primary w-100" :disabled="loading" @click="load">Load</button></div>
      </div></div></div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="card"><div class="card-body">
        <pre class="small mb-0" style="max-height:70vh;overflow:auto">{{ payload }}</pre>
      </div></div>
    </div>
  </div>
</template>
<script setup>
definePageMeta({ middleware: ['auth', 'check-permission'] })
const { $api, $apiFetch } = useNuxtApp()
const loading=ref(false), error=ref(''), payload=ref(null), companyId=ref('')

async function loadAssessments(){
  loading.value=true; error.value=''; payload.value=null
  try {
    const params=new URLSearchParams({ page:'1', limit:'50' })
    if(companyId.value) params.set('companyId', companyId.value)
    const res=await $apiFetch(`${$api.inventoryNrvAssessments()}?${params}`)
    payload.value = res
  } catch(e){ error.value=e?.data?.message||e?.message||'Failed' }
  finally{ loading.value=false }
}
async function load(){
  loading.value=true; error.value=''; payload.value=null
  try {
    const params=new URLSearchParams()
    if(companyId.value) params.set('companyId', companyId.value)
    
    const res=await $apiFetch(`${$api.inventoryNrv()}?${params}`)
    payload.value = res.data ?? res
  } catch(e){ error.value=e?.data?.message||e?.message||'Failed' }
  finally{ loading.value=false }
}
</script>
