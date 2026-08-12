<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Inventory Accounting Reconciliation</h4>
      <p class="mb-4 text-muted">Tabs via sequential loads: Inventory↔GL, GRNI, COGS, PPV, NRV. No Auto Fix / Force Match.</p>
      <div class="card mb-4"><div class="card-body"><div class="row g-3 align-items-end">
        <div class="col-md-2"><label class="form-label">Company ID</label><input v-model="companyId" class="form-control" /></div>
        
        <div class="col-md-2"><button class="btn btn-outline-primary w-100" @click="loadGl">Inv↔GL</button></div>
        <div class="col-md-2"><button class="btn btn-outline-primary w-100" @click="loadGrni">GRNI</button></div>
        <div class="col-md-2"><button class="btn btn-outline-primary w-100" @click="loadCogs">COGS</button></div>
        <div class="col-md-2"><button class="btn btn-outline-primary w-100" @click="loadPpv">PPV</button></div>
        <div class="col-md-2"><button class="btn btn-outline-primary w-100" @click="loadNrv">NRV</button></div>

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

async function run(url){
  loading.value=true; error.value=''; payload.value=null
  try {
    const params=new URLSearchParams()
    if(companyId.value) params.set('companyId', companyId.value)
    const res=await $apiFetch(`${url}?${params}`)
    payload.value = res.data ?? res
  } catch(e){ error.value=e?.data?.message||e?.message||'Failed' }
  finally{ loading.value=false }
}
const loadGl=()=>run($api.inventoryAccountingReconcileInventoryGl())
const loadGrni=()=>run($api.inventoryGrniReconcile())
const loadCogs=()=>run($api.inventoryCogs())
const loadPpv=()=>run($api.inventoryPpv())
const loadNrv=()=>run($api.inventoryNrv())
const load=loadGl
</script>
