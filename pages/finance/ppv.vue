<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      
      <p class="mb-4 text-muted">PPV reconciliation. Controlled limitations (e.g. PPV_ALLOCATION_NOT_RELIABLE) appear in payload.</p>
      <div class="card mb-4"><div class="card-body"><div class="row g-3 align-items-end">
        <div class="col-md-2"><label class="form-label">Company ID</label><input v-model="companyId" class="form-control" /></div>
        
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
definePageMeta({
  title: "Purchase Price Variance", middleware: ['auth', 'check-permission'] })
const { $api, $apiFetch } = useNuxtApp()
const loading=ref(false), error=ref(''), payload=ref(null), companyId=ref('')

async function load(){
  loading.value=true; error.value=''; payload.value=null
  try {
    const params=new URLSearchParams()
    if(companyId.value) params.set('companyId', companyId.value)
    
    const res=await $apiFetch(`${$api.inventoryPpv()}?${params}`)
    payload.value = res.data ?? res
  } catch(e){ error.value=e?.data?.message||e?.message||'Failed' }
  finally{ loading.value=false }
}
</script>
