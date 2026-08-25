<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Claim {{ row?.claimNo }}</h4>
          <p class="mb-0 text-muted">Internal assessment is never overwritten by provider decision.</p>
        </div>
        <NuxtLink to="/inventory/warranty-claim" class="btn btn-outline-secondary btn-sm">← Back</NuxtLink>
      </div>

      <div v-if="loading" class="text-muted">Loading...</div>
      <div v-else-if="row" class="row g-4">
        <div class="col-lg-6">
          <div class="card mb-3">
            <div class="card-header"><strong>Claim</strong></div>
            <div class="card-body">
              <ul class="list-unstyled mb-0">
                <li class="mb-2"><strong>Status:</strong> {{ row.status }}</li>
                <li class="mb-2"><strong>Provider:</strong> {{ row.provider?.name }}</li>
                <li class="mb-2"><strong>Provider Ref:</strong> {{ row.providerReference || '—' }}</li>
                <li class="mb-2"><strong>Decision:</strong> {{ formatDate(row.providerDecisionAt) }}</li>
                <li class="mb-2"><strong>Decision Reason:</strong> {{ row.providerDecisionReason || '—' }}</li>
              </ul>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><strong>Internal Assessment (immutable)</strong></div>
            <div class="card-body">
              <div>{{ row.assessment?.assessmentNo }}</div>
              <div class="badge bg-label-info">{{ row.assessment?.coverageResult }}</div>
              <div class="small text-muted mt-1">{{ row.assessment?.reason || '—' }}</div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card mb-3">
            <div class="card-header"><strong>Equipment</strong></div>
            <div class="card-body">
              <NuxtLink :to="`/inventory/equipment/${row.equipmentId}`">
                {{ row.equipment?.equipmentNo }}
              </NuxtLink>
              <div class="small">{{ row.equipment?.serialNumber }} · {{ row.equipment?.status }}</div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><strong>Actions</strong></div>
            <div class="card-body d-flex flex-wrap gap-2">
              <button
                v-if="row.status === 'DRAFT' && (userHasRole('superadmin') || userHasPermission('submit_warranty_claim'))"
                class="btn btn-sm btn-primary"
                @click="submit"
              >
                Submit Claim
              </button>
              <button
                v-if="['SUBMITTED','UNDER_PROVIDER_REVIEW'].includes(row.status) && (userHasRole('superadmin') || userHasPermission('record_warranty_provider_decision'))"
                class="btn btn-sm btn-success"
                @click="decide('APPROVED')"
              >
                Record Provider Approval
              </button>
              <button
                v-if="['SUBMITTED','UNDER_PROVIDER_REVIEW'].includes(row.status) && (userHasRole('superadmin') || userHasPermission('record_warranty_provider_decision'))"
                class="btn btn-sm btn-outline-danger"
                @click="decide('REJECTED')"
              >
                Record Provider Rejection
              </button>
              <button
                v-if="row.status === 'APPROVED' && (userHasRole('superadmin') || userHasPermission('create_warranty_rma'))"
                class="btn btn-sm btn-outline-primary"
                @click="createRma"
              >
                Create RMA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const route = useRoute()
const { $api } = useNuxtApp()
const toast = useToast()
const router = useRouter()
const { userHasPermission, userHasRole } = usePermissions()

const loading = ref(true)
const row = ref(null)

function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

async function load() {
  loading.value = true
  try {
    const res = await $fetch($api.warrantyClaimShow(route.params.id), { credentials: 'include' })
    row.value = res?.data || res
  } catch (e) {
    row.value = null
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal load claim'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    loading.value = false
  }
}

async function submit() {
  try {
    await $fetch($api.warrantyClaimSubmit(route.params.id), { method: 'POST', credentials: 'include' })
    toast.success({ title: 'Submitted', message: 'Claim submitted — stock unchanged', color: 'green', position: 'bottomRight' })
    await load()
  } catch (e) {
    toast.error({ title: 'Error', message: getApiErrorMessage(e, 'Gagal submit'), color: 'red', position: 'bottomRight' })
  }
}

async function decide(decision) {
  const reason =
    decision === 'REJECTED'
      ? prompt('Provider rejection reason') || ''
      : undefined
  if (decision === 'REJECTED' && !reason.trim()) return
  const providerReference = prompt('Provider reference (optional)') || undefined
  try {
    await $fetch($api.warrantyClaimDecision(route.params.id), {
      method: 'POST',
      credentials: 'include',
      body: { decision, providerDecisionReason: reason, providerReference },
    })
    toast.success({
      title: 'Recorded',
      message: `Provider ${decision} — assessment unchanged, stock unchanged`,
      color: 'green',
      position: 'bottomRight',
    })
    await load()
  } catch (e) {
    toast.error({ title: 'Error', message: getApiErrorMessage(e, 'Gagal record decision'), color: 'red', position: 'bottomRight' })
  }
}

async function createRma() {
  try {
    const res = await $fetch($api.warrantyRmas(), {
      method: 'POST',
      credentials: 'include',
      body: { claimId: row.value.id },
    })
    toast.success({ title: 'RMA created', message: res?.data?.rmaNo, color: 'green', position: 'bottomRight' })
    if (res?.data?.id) await router.push(`/inventory/warranty-rma/${res.data.id}`)
  } catch (e) {
    toast.error({ title: 'Error', message: getApiErrorMessage(e, 'Gagal create RMA'), color: 'red', position: 'bottomRight' })
  }
}

onMounted(load)
</script>
