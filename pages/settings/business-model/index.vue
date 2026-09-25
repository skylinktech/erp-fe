<template>
  <div class="container-fluid py-3">
    <h1 class="h4">Model Bisnis Perusahaan</h1>
    <div v-if="!access.canView" class="alert alert-warning">Anda tidak memiliki izin konfigurasi model bisnis.</div>
    <div v-else-if="loading" class="placeholder-glow"><span class="placeholder col-12" style="height: 4rem"></span></div>
    <template v-else>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div v-if="conflict" class="alert alert-warning">Revisi konfigurasi berubah. Muat ulang sebelum menyimpan.</div>
      <div class="row g-2 mb-3">
        <div class="col-12 col-md-6">
          <label class="form-label" for="company-search">Cari perusahaan</label>
          <div class="input-group">
            <input id="company-search" v-model="search" class="form-control" @keyup.enter="loadCompanies" />
            <button class="btn btn-outline-secondary" type="button" @click="loadCompanies">Cari</button>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="company-select">Perusahaan</label>
          <select id="company-select" v-model="companyId" class="form-select" @change="loadSummary">
            <option :value="null">Pilih perusahaan</option>
            <option v-for="row in companies" :key="row.id" :value="row.id">{{ row.name }}</option>
          </select>
        </div>
      </div>
      <p v-if="!companies.length" class="text-muted">Tidak ada perusahaan pada halaman ini.</p>
      <BusinessModelSummaryCard :company="summary?.company" :revision="summary?.revision || 1" :readiness="summary?.readiness?.overallStatus || ''" :activation="activationLabel(summary?.company?.profileCode, summary?.readiness?.overallStatus)" />
      <section class="card mb-3">
        <div class="card-body">
          <h2 class="h6">Profil bisnis utama</h2>
          <p>Saat ini: {{ summary?.company?.profileCode || '-' }}</p>
          <label class="form-label" for="proposed-profile">Usulan</label>
          <select id="proposed-profile" v-model="proposedProfileId" class="form-select mb-2" :disabled="!access.canChangeProfile">
            <option :value="null">Pilih profil aktif</option>
            <option v-for="profile in profiles" :key="profile.id" :value="profile.id">{{ profile.name }} ({{ profile.code }})</option>
          </select>
          <label class="form-label" for="change-reason">Alasan</label>
          <textarea id="change-reason" v-model="reason" class="form-control mb-2" rows="2"></textarea>
          <button class="btn btn-primary" type="button" :disabled="!access.canChangeProfile || !companyId" @click="previewChange">Pratinjau dampak</button>
        </div>
      </section>
      <ConfigurationImpactDialog :open="previewOpen" :preview="preview" :saving="saving" @confirm="saveChange" @close="previewOpen = false" />
      <FlowEligibilityTable :flows="summary?.effectiveFlows || []" :can-manage="access.canChangeEligibility" @toggle="toggleFlow" />
      <div class="row">
        <div class="col-12 col-lg-12">
          <WarehouseAllocationManager :rows="warehouses" :can-manage="access.canChangeWarehouse" @search="loadWarehouses" @toggle="toggleWarehouse" />
        </div>
        <div class="col-12 col-lg-6">
          <InventoryOwnershipManager
            :rows="ownerships"
            :can-manage="access.canChangeOwnership"
            @search="loadOwnerships"
            @grant="onOwnershipGrant"
            @deactivate="onOwnershipDeactivate"
            @replace="onOwnershipReplace"
          />
        </div>
        <div class="col-12 col-lg-6">
          <section class="card mb-3">
            <div class="card-body">
              <h3 class="h6">Kebijakan retur</h3>
              <p class="small">
                Satu-satunya kebijakan yang didukung:
                <strong>FULFILLMENT_EVIDENCE_ONLY</strong>
                (kelayakan retur mengikuti bukti pemenuhan). Tidak ada jendela hari otomatis dan tidak ada opsi kebijakan lain.
              </p>
              <p class="small text-muted mb-2">
                Status saat ini: {{ summary?.returnPolicy ? summary.returnPolicy.eligibility : 'Belum diatur' }}.
              </p>
              <button v-if="access.canChangeReturnPolicy" class="btn btn-outline-primary btn-sm" type="button" @click="savePolicy">
                Simpan FULFILLMENT_EVIDENCE_ONLY
              </button>
            </div>
          </section>
        </div>
      </div>
      <ReadinessChecklist
        :overall="summary?.readiness?.overallStatus || ''"
        :items="readinessItems"
        :findings="readinessFindings"
      />
      <ConfigurationHistory :rows="history" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { readAccessToken } from '~/utils/authCookie'
import { activationLabel, configurationAccess } from '~/utils/businessModelConfiguration'
import BusinessModelSummaryCard from '~/components/business-model/BusinessModelSummaryCard.vue'
import ConfigurationImpactDialog from '~/components/business-model/ConfigurationImpactDialog.vue'
import FlowEligibilityTable from '~/components/business-model/FlowEligibilityTable.vue'
import WarehouseAllocationManager from '~/components/business-model/WarehouseAllocationManager.vue'
import InventoryOwnershipManager from '~/components/business-model/InventoryOwnershipManager.vue'
import ReadinessChecklist from '~/components/business-model/ReadinessChecklist.vue'
import ConfigurationHistory from '~/components/business-model/ConfigurationHistory.vue'

const { userHasPermission, userHasRole } = usePermissions()
const access = computed(() => configurationAccess({
  isAdmin: userHasRole('admin') || userHasRole('superadmin'),
  permissions: [
    'view_business_model_configuration',
    'manage_business_model_configuration',
    'manage_company_flow_eligibility',
    'manage_company_warehouse_allocation',
    'manage_company_inventory_ownership',
    'manage_retail_return_policy',
  ].filter((name) => userHasPermission(name)),
}))
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const conflict = ref(false)
const search = ref('')
const companies = ref<any[]>([])
const profiles = ref<any[]>([])
const companyId = ref<number | null>(null)
const summary = ref<any>(null)
const proposedProfileId = ref<number | null>(null)
const reason = ref('')
const preview = ref<any>(null)
const previewOpen = ref(false)
const warehouses = ref<any[]>([])
const ownerships = ref<any[]>([])
const history = ref<any[]>([])

const readinessItems = computed(() => {
  const finance = summary.value?.readiness?.checks?.finance || {}
  const checks = summary.value?.readiness?.checks || {}
  return [
    { label: 'Flow', value: checks.flow?.status || '-' },
    { label: 'Gudang', value: checks.warehouse?.status || '-' },
    { label: 'Persediaan', value: checks.inventory?.status || '-' },
    { label: 'Akuntansi persediaan', value: finance.inventoryAccounting || '-' },
    { label: 'Mapping COGS', value: finance.cogsMapping || '-' },
    { label: 'Workflow invoice', value: finance.invoiceWorkflow || '-' },
    { label: 'Pajak Retail', value: finance.taxPolicy || 'NOT_CONFIGURED' },
    { label: 'Refund tunai', value: finance.cashRefund || '-' },
    { label: 'Refund transfer', value: finance.bankRefund || '-' },
  ]
})

const readinessFindings = computed(() => {
  const readiness = summary.value?.readiness
  if (!readiness) return []
  const raw = Array.isArray(readiness.findings) && readiness.findings.length
    ? readiness.findings
    : [...(readiness.blockers || []), ...(readiness.warnings || [])]
  return raw.map((item: any) => ({
    code: item.code,
    severity: item.level || item.severity || 'INFO',
    message: item.message,
    area: item.area,
    remediationHint: item.remediationHint,
  }))
})

function headers() {
  const token = readAccessToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

async function loadCompanies() {
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.businessModelCompanies()}?search=${encodeURIComponent(search.value)}&perPage=20`, { headers: headers() })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) { error.value = payload.message || 'Daftar perusahaan gagal dimuat.'; return }
  companies.value = payload.data || []
}

async function loadSummary() {
  if (!companyId.value) return
  const { $api } = useNuxtApp()
  const [show, warehousePage, ownershipPage, historyPage] = await Promise.all([
    fetch($api.businessModelShow(companyId.value), { headers: headers() }),
    fetch(`${$api.businessModelWarehouses(companyId.value)}?perPage=20`, { headers: headers() }),
    fetch(`${$api.businessModelOwnerships(companyId.value)}?perPage=20`, { headers: headers() }),
    fetch(`${$api.businessModelHistory(companyId.value)}?perPage=20`, { headers: headers() }),
  ])
  const body = await show.json().catch(() => ({}))
  if (!show.ok) { error.value = body.message || 'Konfigurasi gagal dimuat.'; conflict.value = body.code === 'CONFIGURATION_REVISION_CONFLICT'; return }
  summary.value = body
  proposedProfileId.value = body.company?.profileId || null
  warehouses.value = (await warehousePage.json().catch(() => ({}))).data || []
  ownerships.value = (await ownershipPage.json().catch(() => ({}))).data || []
  history.value = (await historyPage.json().catch(() => ({}))).data || []
  error.value = ''
  conflict.value = false
}

async function loadWarehouses(term = '') {
  if (!companyId.value) return
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.businessModelWarehouses(companyId.value)}?search=${encodeURIComponent(term)}&perPage=20`, { headers: headers() })
  warehouses.value = ((await res.json().catch(() => ({}))).data) || []
}

async function loadOwnerships(term = '') {
  if (!companyId.value) return
  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.businessModelOwnerships(companyId.value)}?search=${encodeURIComponent(term)}&perPage=20`, { headers: headers() })
  ownerships.value = ((await res.json().catch(() => ({}))).data) || []
}

async function previewChange() {
  if (!companyId.value) return
  const { $api } = useNuxtApp()
  const res = await fetch($api.businessModelPreview(companyId.value), {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ expectedRevision: summary.value?.revision, reason: reason.value || 'Pratinjau', primaryProfileId: proposedProfileId.value }),
  })
  preview.value = await res.json().catch(() => ({}))
  if (!res.ok) { error.value = preview.value.message || 'Pratinjau gagal.'; conflict.value = preview.value.code === 'CONFIGURATION_REVISION_CONFLICT'; return }
  previewOpen.value = true
}

async function saveChange() {
  saving.value = true
  success.value = ''
  const { $api } = useNuxtApp()
  const res = await fetch($api.businessModelChangeset(companyId.value!), {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ expectedRevision: summary.value?.revision, reason: reason.value, primaryProfileId: proposedProfileId.value }),
  })
  const payload = await res.json().catch(() => ({}))
  saving.value = false
  if (!res.ok) { error.value = payload.message || 'Simpan gagal.'; conflict.value = payload.code === 'CONFIGURATION_REVISION_CONFLICT'; return }
  success.value = 'Konfigurasi tersimpan.'
  previewOpen.value = false
  await loadSummary()
}

async function toggleFlow(flow: any) {
  await mutate({ eligibilityChanges: [{ flowCode: flow.flowCode, enabled: !flow.explicitlyGranted }] })
}

async function toggleWarehouse(row: any) {
  await mutate({ warehouseAllocationChanges: [{ warehouseId: row.id, active: !row.allocated }] })
}

async function savePolicy() {
  await mutate({ returnPolicy: { eligibility: 'FULFILLMENT_EVIDENCE_ONLY', windowDays: null } })
}

async function onOwnershipGrant(payload: { productId: number; warehouseId: number; replace: boolean }) {
  await mutate({
    ownershipChanges: [{
      productId: payload.productId,
      warehouseId: payload.warehouseId,
      active: true,
      replace: payload.replace,
    }],
  })
}

async function onOwnershipDeactivate(row: any) {
  await mutate({
    ownershipChanges: [{ productId: row.productId, warehouseId: row.warehouseId, active: false }],
  })
}

async function onOwnershipReplace(row: any) {
  await mutate({
    ownershipChanges: [{
      productId: row.productId,
      warehouseId: row.warehouseId,
      active: true,
      replace: true,
    }],
  })
}

async function mutate(extra: Record<string, unknown>) {
  if (!companyId.value || !reason.value.trim()) { error.value = 'Isi alasan sebelum menyimpan.'; return }
  const { $api } = useNuxtApp()
  const res = await fetch($api.businessModelChangeset(companyId.value), {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ expectedRevision: summary.value?.revision, reason: reason.value, ...extra }),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) { error.value = payload.message || 'Perubahan ditolak.'; conflict.value = payload.code === 'CONFIGURATION_REVISION_CONFLICT'; return }
  success.value = 'Perubahan tersimpan.'
  await loadSummary()
}

onMounted(async () => {
  if (!access.value.canView) { loading.value = false; return }
  const { $api } = useNuxtApp()
  const profileRes = await fetch($api.businessModelProfiles(), { headers: headers() })
  profiles.value = ((await profileRes.json().catch(() => ({}))).data) || []
  await loadCompanies()
  loading.value = false
})
</script>
