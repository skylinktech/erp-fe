<template>
  <div class="container-fluid py-3">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h4 class="mb-0">Harga Jual Produk (Direct Sale / Retail)</h4>
      <p class="text-muted small mb-0 w-100">
        Canonical untuk channel RETAIL / product selling price.
        Berbeda dari Finance → Price List (ISP FDR/SI).
      </p>
      <button class="btn btn-primary btn-sm" type="button" :disabled="!canCreate" @click="open = !open">Daftar baru</button>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <form v-if="open" class="card card-body mb-3" @submit.prevent="createDraft">
      <div class="row g-2">
        <div class="col-12 col-md-3"><input v-model="draft.code" class="form-control" placeholder="Kode" required /></div>
        <div class="col-12 col-md-3">
          <ActiveCompanyField input-id="price-list-company" />
        </div>
        <div class="col-6 col-md-2"><input v-model="draft.validFrom" type="date" class="form-control" required /></div>
        <div class="col-6 col-md-2"><input v-model="draft.validTo" type="date" class="form-control" /></div>
        <div class="col-12 col-md-2">
          <button class="btn btn-success w-100" type="submit" :disabled="!activeCompanyReady">Simpan draft</button>
        </div>
      </div>
    </form>
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead>
          <tr><th>Kode</th><th>Perusahaan</th><th>Status</th><th>Berlaku</th><th>Harga</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.code }}</td>
            <td class="text-break">{{ companyLabelFor(row.perusahaanId) }}</td>
            <td>{{ row.status }}</td>
            <td>{{ dateOf(row.validFrom) }} – {{ dateOf(row.validTo) || 'terbuka' }}</td>
            <td>{{ (row.lines || []).length }}</td>
            <td class="text-nowrap">
              <form v-if="row.status === 'draft' && canCreate" class="d-inline-flex flex-wrap gap-1 me-1 align-items-center" @submit.prevent="addLine(row.id)">
                <div style="min-width:10rem">
                  <ProductSelect v-model="line.productId" :company-id="companyId" />
                </div>
                <div style="min-width:7rem">
                  <UnitSelect v-model="line.unitId" />
                </div>
                <input v-model.number="line.officialUnitPrice" type="number" class="form-control form-control-sm" style="width:8rem" placeholder="Harga" required />
                <button class="btn btn-outline-secondary btn-sm" type="submit">Tambah</button>
              </form>
              <button v-if="row.status === 'draft'" class="btn btn-outline-secondary btn-sm me-1" type="button" @click="act(row.id, 'submit')">Ajukan</button>
              <button v-if="row.status === 'pending' && canApprove" class="btn btn-outline-primary btn-sm me-1" type="button" @click="act(row.id, 'approve')">Setujui</button>
              <button v-if="row.status === 'approved' && canActivate" class="btn btn-outline-success btn-sm me-1" type="button" @click="act(row.id, 'activate')">Aktifkan</button>
              <button v-if="row.status === 'active' && canActivate" class="btn btn-outline-warning btn-sm" type="button" @click="act(row.id, 'deactivate')">Nonaktifkan</button>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="6" class="text-muted">Belum ada daftar harga.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { formatActiveCompanyLabel } from '~/utils/activeCompanyBinding'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import ProductSelect from '~/components/reference/ProductSelect.vue'
import UnitSelect from '~/components/reference/UnitSelect.vue'

const { userHasPermission, userHasRole } = usePermissions()
const activeCompany = useActiveCompany()
const {
  ready: activeCompanyReady,
  requireCompanyId,
  missingMessage: activeCompanyMissing,
  ensureBootstrapped,
  allowedCompanies,
  company,
  companyId,
} = activeCompany
void ensureBootstrapped()

const canCreate = computed(() => userHasRole('admin') || userHasRole('superadmin') || userHasPermission('create_product_price_list'))
const canApprove = computed(() => userHasRole('admin') || userHasRole('superadmin') || userHasPermission('approve_product_price_list'))
const canActivate = computed(() => userHasRole('admin') || userHasRole('superadmin') || userHasPermission('activate_product_price_list'))
const rows = ref<any[]>([])
const error = ref('')
const open = ref(false)
const draft = ref({ code: '', validFrom: '', validTo: '' })
const line = ref({ productId: null as number | null, unitId: null as number | null, officialUnitPrice: null as number | null })

/** O(1) lookup from already-loaded allowedCompanies — no per-row fetch. */
const companyNameById = computed(() => {
  const map = new Map<number, string>()
  for (const row of allowedCompanies.value) {
    map.set(row.id, formatActiveCompanyLabel({ name: row.name, code: row.code }, row.id))
  }
  if (company.value && companyId.value) {
    map.set(companyId.value, formatActiveCompanyLabel(company.value, companyId.value))
  }
  return map
})

function companyLabelFor(id: number | null | undefined) {
  if (id == null) return '—'
  return companyNameById.value.get(Number(id)) || `Perusahaan #${id}`
}

function dateOf(value: unknown) {
  return value ? String(value).slice(0, 10) : ''
}

async function load() {
  const { $api } = useNuxtApp()
  const token = useCookie('access_token')
  const res = await fetch($api.productSellingPrices(), { headers: token.value ? { Authorization: `Bearer ${token.value}` } : {} })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Daftar harga tidak dapat dimuat.'
    return
  }
  error.value = ''
  rows.value = payload.data || []
}

async function createDraft() {
  let perusahaanId: number
  try {
    perusahaanId = requireCompanyId()
  } catch (err: any) {
    error.value = err?.message || activeCompanyMissing.value || 'Active Company wajib.'
    return
  }
  const { $api } = useNuxtApp()
  const token = useCookie('access_token')
  const res = await fetch($api.productSellingPrices(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}) },
    body: JSON.stringify({
      code: draft.value.code,
      perusahaanId,
      validFrom: draft.value.validFrom,
      validTo: draft.value.validTo || null,
    }),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Draft gagal disimpan.'
    return
  }
  open.value = false
  draft.value = { code: '', validFrom: '', validTo: '' }
  await load()
}

async function addLine(id: number) {
  const { $api } = useNuxtApp()
  const token = useCookie('access_token')
  const res = await fetch(`${$api.productSellingPrices()}/${id}/lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}) },
    body: JSON.stringify(line.value),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Harga produk ditolak.'
    return
  }
  error.value = ''
  await load()
}

async function act(id: number, action: 'submit' | 'approve' | 'activate' | 'deactivate') {
  const { $api } = useNuxtApp()
  const token = useCookie('access_token')
  const res = await fetch(`${$api.productSellingPrices()}/${id}/${action}`, {
    method: 'POST',
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Aksi daftar harga ditolak.'
    return
  }
  error.value = ''
  await load()
}

onMounted(load)
</script>
