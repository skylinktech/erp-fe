<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Replacement {{ row?.replacementNo || '' }}</h4>
          <p class="mb-0 text-muted">Service recovery detail — physical install uses SITE_ISSUE.</p>
        </div>
        <NuxtLink to="/inventory/equipment?tab=replacement" class="btn btn-outline-secondary btn-sm">← Back</NuxtLink>
      </div>

      <div v-if="loading" class="text-muted">Loading...</div>
      <template v-else-if="row">
        <div class="row g-4">
          <div class="col-lg-6">
            <div class="card mb-3">
              <div class="card-header"><strong>Replacement Information</strong></div>
              <div class="card-body">
                <ul class="list-unstyled mb-0">
                  <li class="mb-2"><strong>No:</strong> {{ row.replacementNo }}</li>
                  <li class="mb-2"><strong>Status:</strong> {{ row.status }}</li>
                  <li class="mb-2"><strong>Reason:</strong> {{ row.reason }}</li>
                  <li class="mb-2"><strong>Stock Source:</strong> {{ row.stockSource }}</li>
                  <li class="mb-2"><strong>Site:</strong> {{ row.site?.code }} — {{ row.site?.name }}</li>
                  <li class="mb-2"><strong>Requested:</strong> {{ formatDate(row.requestedAt) }}</li>
                  <li class="mb-2"><strong>Completed:</strong> {{ formatDate(row.completedAt) }}</li>
                  <li class="mb-2"><strong>SITE_ISSUE:</strong> {{ row.siteIssueMovementId || '—' }}</li>
                  <li class="mb-2"><strong>Reservation:</strong> {{ row.reservationId || '—' }}</li>
                  <li class="mb-2"><strong>Notes:</strong> {{ row.notes || '—' }}</li>
                </ul>
              </div>
            </div>
            <div class="card">
              <div class="card-header"><strong>References</strong></div>
              <div class="card-body small">
                <div>Incident: {{ row.incidentId || '—' }}</div>
                <div>Withdrawal: {{ row.withdrawalId || '—' }}</div>
                <div>Inspection: {{ row.inspectionId || '—' }}</div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card mb-3">
              <div class="card-header"><strong>Original Equipment</strong></div>
              <div class="card-body">
                <NuxtLink :to="`/inventory/equipment/${row.originalEquipmentId}`">
                  {{ row.originalEquipment?.equipmentNo }}
                </NuxtLink>
                <div class="small text-muted">
                  {{ row.originalEquipment?.serialNumber }} · {{ row.originalEquipment?.status }}
                </div>
                <div class="small">{{ row.originalEquipment?.product?.sku }}</div>
                <div v-if="origWarranty.claims?.length" class="mt-2 small border-top pt-2">
                  <strong>Original Equipment Recovery</strong>
                  <div v-for="c in origWarranty.claims.slice(0, 3)" :key="c.id">
                    Warranty Claim:
                    <NuxtLink :to="`/inventory/warranty-claim/${c.id}`">
                      <code>{{ c.claimNo }}</code>
                    </NuxtLink>
                    · Status: {{ c.status }}
                  </div>
                  <div v-for="r in (origWarranty.rmas || []).slice(0, 2)" :key="r.id" class="text-muted">
                    RMA: {{ r.rmaNo }} · {{ r.status }}
                  </div>
                  <p class="text-muted mb-0 mt-1">Informational only — replacement state is independent.</p>
                </div>
              </div>
            </div>
            <div class="card mb-3">
              <div class="card-header"><strong>Replacement Equipment</strong></div>
              <div class="card-body">
                <template v-if="row.replacementEquipment">
                  <NuxtLink :to="`/inventory/equipment/${row.replacementEquipmentId}`">
                    {{ row.replacementEquipment.equipmentNo }}
                  </NuxtLink>
                  <div class="small text-muted">
                    {{ row.replacementEquipment.serialNumber }} · {{ row.replacementEquipment.status }}
                  </div>
                </template>
                <span v-else class="text-muted">Not selected</span>
              </div>
            </div>

            <div v-if="row.status !== 'COMPLETED' && row.status !== 'CANCELLED' && row.status !== 'REJECTED'" class="card">
              <div class="card-header"><strong>Actions</strong></div>
              <div class="card-body">
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <button
                    v-if="row.status === 'REQUESTED' && (userHasRole('superadmin') || userHasPermission('approve_equipment_replacement'))"
                    class="btn btn-sm btn-outline-primary"
                    @click="approve"
                  >
                    Approve
                  </button>
                  <button
                    v-if="['REQUESTED','APPROVED','READY'].includes(row.status) && (userHasRole('superadmin') || userHasPermission('cancel_equipment_replacement'))"
                    class="btn btn-sm btn-outline-warning"
                    @click="cancel"
                  >
                    Cancel
                  </button>
                </div>

                <div v-if="['REQUESTED','APPROVED'].includes(row.status) && (userHasRole('superadmin') || userHasPermission('select_replacement_equipment'))">
                  <h6>Select Target Equipment</h6>
                  <div class="input-group mb-2">
                    <input v-model="targetSearch" class="form-control form-control-sm" placeholder="Search EQ / serial" @keyup.enter="loadTargets" />
                    <button class="btn btn-sm btn-outline-secondary" @click="loadTargets">Cari</button>
                  </div>
                  <select v-model="selectedTargetId" class="form-select form-select-sm mb-2">
                    <option value="">— pilih —</option>
                    <option v-for="t in targets" :key="t.id" :value="t.id">
                      {{ t.equipmentNo }} / {{ t.serialNumber }} ({{ t.warehouse?.code }})
                      · OpAvail {{ t.availability?.operationalAvailableQty }}
                    </option>
                  </select>
                  <div v-if="row.stockSource === 'BUFFER_STOCK'" class="mb-2">
                    <label class="form-label small">Buffer Reservation</label>
                    <select v-model="bufferReservationId" class="form-select form-select-sm">
                      <option value="">— pilih buffer —</option>
                      <option v-for="b in buffers" :key="b.id" :value="b.id">
                        {{ b.id.slice(0, 8) }}… qty={{ b.quantity }} wh={{ b.warehouseId }}
                      </option>
                    </select>
                    <p v-if="!(userHasRole('superadmin') || userHasPermission('use_buffer_for_replacement'))" class="small text-danger mb-0">
                      Buffer authorization required
                    </p>
                  </div>
                  <button class="btn btn-sm btn-primary" :disabled="saving || !selectedTargetId" @click="selectTarget">
                    Commit Target
                  </button>
                </div>

                <div v-if="row.status === 'READY'" class="mt-3">
                  <button
                    v-if="userHasRole('superadmin') || userHasPermission('complete_equipment_replacement')"
                    class="btn btn-success"
                    :disabled="saving"
                    @click="complete"
                  >
                    {{ saving ? 'Installing...' : 'Install Replacement (SITE_ISSUE)' }}
                  </button>
                  <p class="small text-muted mt-2 mb-0">
                    Original equipment recovery state will not change.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ middleware: ['auth', 'check-permission'] })

const route = useRoute()
const { $api } = useNuxtApp()
const toast = useToast()
const { userHasPermission, userHasRole } = usePermissions()

const loading = ref(true)
const saving = ref(false)
const row = ref(null)
const targets = ref([])
const buffers = ref([])
const targetSearch = ref('')
const selectedTargetId = ref('')
const bufferReservationId = ref('')
const origWarranty = ref({ claims: [], rmas: [] })

function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

function showError(e, fallback) {
  toast.error({
    title: 'Error',
    message: getApiErrorMessage(e, fallback),
    color: 'red',
    position: 'bottomRight',
  })
}

async function load() {
  loading.value = true
  try {
    const res = await $fetch($api.equipmentReplacementShow(route.params.id), { credentials: 'include' })
    row.value = res?.data || res
    origWarranty.value = { claims: [], rmas: [] }
    if (row.value?.originalEquipmentId) {
      const war = await $fetch($api.equipmentWarranty(row.value.originalEquipmentId), {
        credentials: 'include',
      }).catch(() => null)
      origWarranty.value = war?.data || { claims: [], rmas: [] }
    }
  } catch (e) {
    row.value = null
    showError(e, 'Gagal load replacement')
  } finally {
    loading.value = false
  }
}

async function loadTargets() {
  try {
    const res = await $fetch($api.equipmentReplacementEligible(route.params.id), {
      credentials: 'include',
      query: { search: targetSearch.value || undefined },
    })
    targets.value = res?.data || []
  } catch (e) {
    targets.value = []
    showError(e, 'Gagal load eligible targets')
  }
}

async function loadBuffers() {
  try {
    const res = await $fetch($api.equipmentReplacementBuffers(route.params.id), { credentials: 'include' })
    buffers.value = res?.data || []
  } catch {
    buffers.value = []
  }
}

async function approve() {
  try {
    await $fetch($api.equipmentReplacementApprove(route.params.id), { method: 'POST', credentials: 'include' })
    toast.success({ title: 'Approved', message: 'Replacement approved', color: 'green', position: 'bottomRight' })
    await load()
  } catch (e) {
    showError(e, 'Gagal approve')
  }
}

async function selectTarget() {
  saving.value = true
  try {
    await $fetch($api.equipmentReplacementSelect(route.params.id), {
      method: 'POST',
      credentials: 'include',
      body: {
        replacementEquipmentId: selectedTargetId.value,
        bufferReservationId: bufferReservationId.value || undefined,
        allowFromRequested: true,
      },
    })
    toast.success({ title: 'Berhasil', message: 'Target committed (READY)', color: 'green', position: 'bottomRight' })
    await load()
  } catch (e) {
    showError(e, 'Gagal select target')
  } finally {
    saving.value = false
  }
}

async function complete() {
  if (!confirm('Install replacement via SITE_ISSUE? On Hand −1 for new unit.')) return
  saving.value = true
  try {
    await $fetch($api.equipmentReplacementComplete(route.params.id), {
      method: 'POST',
      credentials: 'include',
    })
    toast.success({
      title: 'Completed',
      message: 'Replacement INSTALLED — original equipment state unchanged',
      color: 'green',
      position: 'bottomRight',
    })
    await load()
  } catch (e) {
    showError(e, 'Gagal complete replacement')
  } finally {
    saving.value = false
  }
}

async function cancel() {
  if (!confirm('Cancel this replacement?')) return
  try {
    await $fetch($api.equipmentReplacementCancel(route.params.id), {
      method: 'POST',
      credentials: 'include',
    })
    toast.success({ title: 'Cancelled', message: 'Replacement cancelled', color: 'green', position: 'bottomRight' })
    await load()
  } catch (e) {
    showError(e, 'Gagal cancel')
  }
}

onMounted(async () => {
  await load()
  if (row.value && ['REQUESTED', 'APPROVED'].includes(row.value.status)) {
    await loadTargets()
    if (row.value.stockSource === 'BUFFER_STOCK') await loadBuffers()
  }
})
</script>
