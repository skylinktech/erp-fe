<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Equipment Detail</h4>
          <p class="mb-0 text-muted">Kit identity is immutable after receipt. Component serials are captured at unbox.</p>
          <div v-if="row" class="mt-2">
            <span class="badge me-1" :class="statusBadgeClass(row.status)">{{ row.status }}</span>
            <span v-if="row.sealStatus === 'SEALED'" class="badge bg-label-warning me-1">SEALED</span>
            <span v-if="row.sealStatus === 'UNSEALED'" class="badge bg-label-secondary me-1">UNSEALED</span>
            <span
              v-if="row.serialCaptureStatus && !['COMPLETE', 'VERIFIED'].includes(row.serialCaptureStatus)"
              class="badge bg-label-danger me-1"
            >
              SERIAL {{ row.serialCaptureStatus === 'PARTIAL' ? 'PARTIAL' : 'PENDING' }}
            </span>
            <span v-else-if="row.serialCaptureStatus === 'VERIFIED'" class="badge bg-label-success me-1">SERIAL VERIFIED</span>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button
            v-if="canUnbox"
            class="btn btn-primary btn-sm"
            @click="openUnbox"
          >
            Unbox / Lengkapi Serial Komponen
          </button>
          <NuxtLink to="/inventory/equipment?tab=register" class="btn btn-outline-secondary btn-sm">← Back</NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Loading...</div>
      <div v-else-if="row" class="row g-4">
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header"><strong>Identity</strong></div>
            <div class="card-body">
              <ul class="list-unstyled mb-0 mt-5">
                <li class="mb-2"><strong>Equipment No:</strong> {{ row.equipmentNo }}</li>
                <li class="mb-2"><strong>Product:</strong> {{ row.product?.sku }} — {{ row.product?.name }}</li>
                <li class="mb-2"><strong>Serial:</strong> {{ row.serialNumber }}</li>
                <li class="mb-2"><strong>UTID:</strong> {{ row.utid || '—' }}</li>
                <li class="mb-2"><strong>Kit Number:</strong> {{ row.kitNumber || '—' }}</li>
                <li class="mb-2"><strong>Tracking:</strong> {{ row.product?.trackingPolicy || row.product?.tracking_policy || '—' }}</li>
                <li class="mb-2"><strong>Seal:</strong> {{ row.sealStatus || '—' }}</li>
                <li class="mb-2"><strong>Serial Capture:</strong> {{ row.serialCaptureStatus || '—' }}</li>
                <li class="mb-2"><strong>Status:</strong> {{ row.status }}</li>
                <li class="mb-2"><strong>Warehouse:</strong> {{ row.warehouse?.name || row.currentWarehouseId || '—' }}</li>
                <li class="mb-2">
                  <strong>Current Site:</strong>
                  <NuxtLink v-if="row.currentSiteId" :to="`/company/site/${row.currentSiteId}`">
                    {{ row.currentSite?.code || row.currentSiteId }} — {{ row.currentSite?.name }}
                  </NuxtLink>
                  <span v-else>—</span>
                </li>
                <li class="mb-2"><strong>Acquired:</strong> {{ formatDate(row.acquiredAt) }}</li>
                <li class="mb-2"><strong>Source:</strong> {{ row.sourceType }} / {{ row.sourceId }}</li>
              </ul>
            </div>
          </div>
          <div class="card mt-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>Component Identities</strong>
              <button v-if="canUnbox" class="btn btn-xs btn-outline-primary" type="button" @click="openUnbox">
                Capture / Verify
              </button>
            </div>
            <div class="card-body table-responsive">
              <table class="table table-sm mt-3">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Serial</th>
                    <th>Captured</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in row.componentIdentities || []" :key="c.id">
                    <td><code>{{ c.componentType }}</code></td>
                    <td>{{ c.serialNumber }}</td>
                    <td>{{ formatDate(c.capturedAt) }}</td>
                    <td>{{ formatDate(c.verifiedAt) }}</td>
                  </tr>
                  <tr v-if="!(row.componentIdentities || []).length">
                    <td colspan="4" class="text-muted">Belum ada serial komponen</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card mb-4">
            <div class="card-header"><strong>Assignment History</strong></div>
            <div class="card-body table-responsive py-5">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in row.assignments || []" :key="a.id">
                    <td>
                      <NuxtLink :to="`/company/site/${a.siteId}`">
                        {{ a.site?.code || a.siteId }}
                      </NuxtLink>
                    </td>
                    <td>{{ formatDate(a.assignedAt) }}</td>
                    <td>{{ formatDate(a.removedAt) }}</td>
                    <td>{{ a.status }}</td>
                  </tr>
                  <tr v-if="!(row.assignments || []).length">
                    <td colspan="4" class="text-muted">No assignments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><strong>Event History</strong></div>
            <div class="card-body table-responsive py-5">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ev in row.events || []" :key="ev.id">
                    <td>{{ formatDate(ev.createdAt) }}</td>
                    <td>{{ ev.eventType }}</td>
                    <td>{{ ev.fromStatus || '—' }} → {{ ev.toStatus || '—' }}</td>
                    <td>{{ ev.sourceType }}:{{ ev.sourceId }}</td>
                  </tr>
                  <tr v-if="!(row.events || []).length">
                    <td colspan="4" class="text-muted">No events</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>Fault / Withdrawal / Inspection</strong>
              <NuxtLink to="/inventory/equipment?tab=inspection" class="btn btn-xs btn-outline-secondary">
                Inspection Queue
              </NuxtLink>
            </div>
            <div class="card-body">
              <div class="row g-3 mt-5">
                <div class="col-md-4">
                  <h6>Incidents</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="i in timeline.incidents || []" :key="i.id" class="mb-2 border-bottom pb-2">
                      <div><code>{{ i.incidentType }}</code> · {{ i.status }}</div>
                      <div class="text-muted">{{ formatDate(i.reportedAt) }}</div>
                      <div>{{ i.description }}</div>
                      <div v-for="a in i.assessments || []" :key="a.id" class="ms-2 text-muted">
                        Assess: {{ a.recommendedAction }} — {{ a.diagnosis || '—' }}
                      </div>
                    </li>
                    <li v-if="!(timeline.incidents || []).length" class="text-muted">No incidents</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6>Withdrawals</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="w in timeline.withdrawals || []" :key="w.id" class="mb-2 border-bottom pb-2">
                      <div><code>{{ w.reason }}</code> · {{ w.status }}</div>
                      <div class="text-muted">{{ formatDate(w.requestedAt) }}</div>
                      <div v-if="w.returnedAt">Returned: {{ formatDate(w.returnedAt) }}</div>
                    </li>
                    <li v-if="!(timeline.withdrawals || []).length" class="text-muted">No withdrawals</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6>Inspections</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="insp in timeline.inspections || []" :key="insp.id" class="mb-2 border-bottom pb-2">
                      <div>{{ insp.status }} · {{ insp.condition || '—' }}</div>
                      <div class="text-muted">{{ formatDate(insp.startedAt) }}</div>
                      <div v-if="insp.inspectionResult"><code>{{ insp.inspectionResult }}</code></div>
                    </li>
                    <li v-if="!(timeline.inspections || []).length" class="text-muted">No inspections</li>
                  </ul>
                </div>
              </div>

              <div class="row g-3 mt-2">
                <div class="col-md-6">
                  <h6>Service Recovery — Replaced By</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="r in replacements.replacedBy || []" :key="r.id" class="mb-2 border-bottom pb-2">
                      <NuxtLink :to="`/inventory/equipment-replacement/${r.id}`">
                        <code>{{ r.replacementNo }}</code>
                      </NuxtLink>
                      · {{ r.status }}
                      <div v-if="r.replacementEquipment">
                        → {{ r.replacementEquipment.equipmentNo }}
                      </div>
                      <div class="text-muted">{{ formatDate(r.completedAt || r.requestedAt) }}</div>
                    </li>
                    <li v-if="!(replacements.replacedBy || []).length" class="text-muted">No outbound replacements</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6>Replacement Origin — Replaces</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="r in replacements.replaces || []" :key="r.id" class="mb-2 border-bottom pb-2">
                      <NuxtLink :to="`/inventory/equipment-replacement/${r.id}`">
                        <code>{{ r.replacementNo }}</code>
                      </NuxtLink>
                      · {{ r.status }}
                      <div v-if="r.originalEquipment">
                        ← {{ r.originalEquipment.equipmentNo }}
                      </div>
                    </li>
                    <li v-if="!(replacements.replaces || []).length" class="text-muted">No inbound replacements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 mt-5">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>Warranty</strong>
              <NuxtLink to="/inventory/warranty?tab=assessments" class="btn btn-xs btn-outline-secondary">
                Assessments
              </NuxtLink>
            </div>
            <div class="card-body">
              <div v-if="(warranty.warranties || []).length" class="mb-3">
                <div v-for="w in warranty.warranties" :key="w.id" class="mb-2">
                  <div>
                    <strong>{{ w.provider?.name || '—' }}</strong>
                    · {{ w.policy?.name || w.policy?.code }}
                  </div>
                  <div class="small">
                    Coverage: {{ formatDateOnly(w.warrantyStartDate) }} – {{ formatDateOnly(w.warrantyEndDate) }}
                    · <span class="badge bg-label-info">{{ w.status }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-muted mb-3 mt-5">No equipment warranty snapshot yet.</div>

              <div class="row g-3 mt-5">
                <div class="col-md-4">
                  <h6>Assessments</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="a in warranty.assessments || []" :key="a.id" class="mb-2 border-bottom pb-2">
                      <code>{{ a.assessmentNo }}</code>
                      · {{ a.coverageResult }}
                      <div v-if="a.reason" class="text-muted">{{ a.reason }}</div>
                      <div v-if="a.primaryExclusion">{{ a.primaryExclusion.code }}</div>
                    </li>
                    <li v-if="!(warranty.assessments || []).length" class="text-muted">None</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6>Claims</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="c in warranty.claims || []" :key="c.id" class="mb-2 border-bottom pb-2">
                      <NuxtLink :to="`/inventory/warranty-claim/${c.id}`">
                        <code>{{ c.claimNo }}</code>
                      </NuxtLink>
                      · {{ c.status }}
                      <div class="text-muted">{{ c.provider?.code }} · {{ c.providerReference || '—' }}</div>
                    </li>
                    <li v-if="!(warranty.claims || []).length" class="text-muted">None</li>
                  </ul>
                </div>
                <div class="col-md-4">
                  <h6>RMA</h6>
                  <ul class="list-unstyled small mb-0">
                    <li v-for="r in warranty.rmas || []" :key="r.id" class="mb-2 border-bottom pb-2">
                      <NuxtLink :to="`/inventory/warranty-rma/${r.id}`">
                        <code>{{ r.rmaNo }}</code>
                      </NuxtLink>
                      · {{ r.status }}
                      <div v-if="r.resolutionType" class="text-muted">{{ r.resolutionType }}</div>
                    </li>
                    <li v-if="!(warranty.rmas || []).length" class="text-muted">None</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showUnbox" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Unbox / Lengkapi Serial Komponen</h5>
          <button type="button" class="btn-close" @click="showUnbox = false" />
        </div>
        <div class="modal-body">
          <p class="small text-muted">
            Serial komponen adalah identitas teknis. Tidak menambah stock quantity atau nilai inventory.
          </p>
          <div v-for="line in unboxForm.components" :key="line.componentType" class="mb-3">
            <label class="form-label">{{ line.componentType }}</label>
            <input v-model="line.serialNumber" class="form-control" :placeholder="`${line.componentType} serial`" />
          </div>
          <div class="form-check">
            <input id="verify-serials" v-model="unboxForm.verify" class="form-check-input" type="checkbox" />
            <label class="form-check-label" for="verify-serials">Verify setelah capture (membuka gate SITE_ISSUE)</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" type="button" @click="showUnbox = false">Batal</button>
          <button class="btn btn-primary" type="button" :disabled="savingUnbox" @click="submitUnbox">
            {{ savingUnbox ? 'Saving...' : 'Simpan' }}
          </button>
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
const { userHasPermission, userHasRole } = usePermissions()
const loading = ref(true)
const row = ref(null)
const timeline = ref({ incidents: [], withdrawals: [], inspections: [] })
const replacements = ref({ replacedBy: [], replaces: [] })
const warranty = ref({ warranties: [], assessments: [], claims: [], rmas: [] })
const showUnbox = ref(false)
const savingUnbox = ref(false)
const unboxForm = reactive({
  verify: true,
  components: [
    { componentType: 'ROUTER', serialNumber: '' },
    { componentType: 'ANTENNA', serialNumber: '' },
    { componentType: 'CABLE', serialNumber: '' },
  ],
})

const canUnbox = computed(() => {
  if (!row.value) return false
  if (row.value.serialCaptureStatus === 'VERIFIED') return false
  const policy = row.value.product?.trackingPolicy || row.value.product?.tracking_policy
  if (policy !== 'DEFERRED_COMPONENT_SERIAL' && policy !== 'KIT_SERIAL') return false
  return (
    userHasRole('superadmin') ||
    userHasRole('admin') ||
    userHasPermission('unbox_equipment') ||
    userHasPermission('capture_component_serial')
  )
})

function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

function statusBadgeClass(status) {
  return status === 'AVAILABLE' ? 'bg-label-success' : 'bg-label-primary'
}

function formatDateOnly(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleDateString()
  } catch {
    return '—'
  }
}

function hydrateUnboxForm() {
  const existing = row.value?.componentIdentities || []
  const byType = Object.fromEntries(existing.map((c) => [c.componentType, c.serialNumber]))
  unboxForm.components = ['ROUTER', 'ANTENNA', 'CABLE'].map((componentType) => ({
    componentType,
    serialNumber: byType[componentType] || '',
  }))
  unboxForm.verify = row.value?.serialCaptureStatus !== 'VERIFIED'
}

function openUnbox() {
  hydrateUnboxForm()
  showUnbox.value = true
}

async function reloadEquipment() {
  const eqRes = await $fetch($api.equipmentShow(route.params.id), { credentials: 'include' })
  row.value = eqRes?.data || eqRes
}

async function submitUnbox() {
  savingUnbox.value = true
  try {
    const components = unboxForm.components.filter((c) => String(c.serialNumber || '').trim())
    await $fetch($api.equipmentUnbox(route.params.id), {
      method: 'POST',
      credentials: 'include',
      body: {
        components,
        verify: unboxForm.verify,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: unboxForm.verify ? 'Serial komponen tersimpan dan verified' : 'Serial komponen tersimpan',
      color: 'green',
      position: 'bottomRight',
    })
    showUnbox.value = false
    await reloadEquipment()
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal unbox / capture serial'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    savingUnbox.value = false
  }
}

onMounted(async () => {
  try {
    const [eqRes, tlRes, repRes, warRes] = await Promise.all([
      $fetch($api.equipmentShow(route.params.id), { credentials: 'include' }),
      $fetch($api.equipmentFaultTimeline(route.params.id), { credentials: 'include' }).catch(() => null),
      $fetch($api.equipmentReplacementsFor(route.params.id), { credentials: 'include' }).catch(() => null),
      $fetch($api.equipmentWarranty(route.params.id), { credentials: 'include' }).catch(() => null),
    ])
    row.value = eqRes?.data || eqRes
    timeline.value = tlRes?.data || { incidents: [], withdrawals: [], inspections: [] }
    replacements.value = repRes?.data || { replacedBy: [], replaces: [] }
    warranty.value = warRes?.data || { warranties: [], assessments: [], claims: [], rmas: [] }
  } catch (e) {
    toast.error({
      title: 'Error',
      message: getApiErrorMessage(e, 'Gagal load equipment'),
      color: 'red',
      position: 'bottomRight',
    })
  } finally {
    loading.value = false
  }
})
</script>
