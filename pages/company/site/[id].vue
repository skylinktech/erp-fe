<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="loadingSite" class="text-muted py-4">Loading site...</div>
      <template v-else-if="site">
        <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
          <div>
            <h4 class="mb-1">{{ site.code }} — {{ site.name }}</h4>
            <p class="mb-0 text-muted">
              Planning assignment (ASSIGNED) vs physical install (INSTALLED via SITE_ISSUE).
            </p>
          </div>
          <div class="d-flex gap-2">
            <button
              v-if="userHasRole('superadmin') || userHasPermission('assign_site_equipment')"
              class="btn btn-primary btn-sm"
              @click="openAssign"
            >
              Assign Equipment
            </button>
            <NuxtLink to="/company/site" class="btn btn-outline-secondary btn-sm">← Daftar Site</NuxtLink>
          </div>
        </div>

        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tab === 'current' }" @click="tab = 'current'">
              Current Equipment
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tab === 'history' }" @click="tab = 'history'">
              Equipment History
            </button>
          </li>
        </ul>

        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <strong>{{ tab === 'current' ? 'Current Equipment' : 'Equipment History' }}</strong>
            <button class="btn btn-sm btn-outline-secondary" @click="reload">Refresh</button>
          </div>
          <div class="card-body table-responsive py-5">
            <table class="table table-sm align-middle">
              <thead>
                <tr v-if="tab === 'current'">
                  <th>Equipment No</th>
                  <th>Product</th>
                  <th>Serial</th>
                  <th>UTID</th>
                  <th>Kit No</th>
                  <th>Status</th>
                  <th>Assigned At</th>
                  <th>Installed At</th>
                  <th>Actions</th>
                  <th></th>
                </tr>
                <tr v-else>
                  <th>Equipment</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="tab === 'current'">
                  <tr v-for="row in currentRows" :key="row.id">
                    <td>
                      <NuxtLink :to="`/inventory/equipment/${row.equipmentId}`">
                        <code>{{ row.equipmentNo }}</code>
                      </NuxtLink>
                    </td>
                    <td>
                      <div>{{ row.product?.sku }}</div>
                      <small class="text-muted">{{ row.product?.name }}</small>
                    </td>
                    <td>{{ row.serialNumber }}</td>
                    <td>{{ row.utid || '—' }}</td>
                    <td>{{ row.kitNumber || '—' }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="row.status === 'INSTALLED' ? 'bg-label-success' : 'bg-label-warning'"
                      >
                        {{ row.status }}
                      </span>
                      <div v-if="row.equipmentStatus" class="small text-muted">EQ: {{ row.equipmentStatus }}</div>
                    </td>
                    <td>{{ formatDate(row.assignedAt) }}</td>
                    <td>{{ formatDate(row.installedAt) }}</td>
                    <td class="text-nowrap">
                      <div v-if="hasRowActions(row)" class="dropdown d-inline-block">
                        <a
                          href="javascript:;"
                          class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                          data-bs-toggle="dropdown"
                          data-bs-popper-config='{"strategy":"fixed"}'
                        >
                          <i class="ri-more-2-fill"></i>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                          <li
                            v-if="row.status === 'ACTIVE' && (userHasRole('superadmin') || userHasPermission('issue_site_equipment'))"
                          >
                            <a class="dropdown-item" href="javascript:void(0)" @click="openIssue(row)">
                              <i class="ri-install-line me-2"></i> Issue / Install
                            </a>
                          </li>
                          <li
                            v-if="row.status === 'ACTIVE' && (userHasRole('superadmin') || userHasPermission('remove_site_equipment'))"
                          >
                            <a class="dropdown-item text-warning" href="javascript:void(0)" @click="removeAssignment(row)">
                              <i class="ri-link-unlink me-2"></i> Unassign
                            </a>
                          </li>
                          <li
                            v-if="row.status === 'INSTALLED' && (userHasRole('superadmin') || userHasPermission('return_site_equipment'))"
                          >
                            <a class="dropdown-item" href="javascript:void(0)" @click="openReturn(row)">
                              <i class="ri-arrow-go-back-line me-2"></i> Return
                            </a>
                          </li>
                          <li
                            v-if="row.status === 'INSTALLED' && (userHasRole('superadmin') || userHasPermission('report_equipment_fault'))"
                          >
                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="openFault(row)">
                              <i class="ri-error-warning-line me-2"></i> Report Fault
                            </a>
                          </li>
                          <li
                            v-if="row.status === 'INSTALLED' && (userHasRole('superadmin') || userHasPermission('create_equipment_withdrawal'))"
                          >
                            <a class="dropdown-item" href="javascript:void(0)" @click="openWithdrawal(row)">
                              <i class="ri-logout-box-r-line me-2"></i> Request Withdrawal
                            </a>
                          </li>
                          <li
                            v-if="row.status === 'INSTALLED' && (userHasRole('superadmin') || userHasPermission('create_equipment_replacement'))"
                          >
                            <a class="dropdown-item text-success" href="javascript:void(0)" @click="startReplacement(row)">
                              <i class="ri-refresh-line me-2"></i> Replace
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!currentRows.length && !loading">
                    <td colspan="9" class="text-muted">Belum ada equipment aktif di site ini</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="row in historyRows" :key="row.id">
                    <td>
                      <div><code>{{ row.equipmentNo }}</code></div>
                      <small class="text-muted">{{ row.serialNumber }}</small>
                    </td>
                    <td>{{ formatDate(row.assignedAt) }}</td>
                    <td>{{ formatDate(row.removedAt) }}</td>
                    <td>{{ row.status }}</td>
                    <td class="small">{{ row.sourceType || '—' }}{{ row.sourceId ? `:${row.sourceId}` : '' }}</td>
                  </tr>
                  <tr v-if="!historyRows.length && !loading">
                    <td colspan="5" class="text-muted">Belum ada history</td>
                  </tr>
                </template>
              </tbody>
            </table>
            <p class="small text-muted mb-0 mt-5">
              ACTIVE = planning (masih di gudang). INSTALLED = sudah SITE_ISSUE (On Hand −1). Return → RETURNED (belum AVAILABLE).
            </p>
          </div>
        </div>
      </template>
      <div v-else class="text-danger">Site tidak ditemukan</div>
    </div>

    <!-- Assign modal -->
    <div v-if="showAssign" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assign Equipment</h5>
            <button type="button" class="btn-close" @click="showAssign = false" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Search Eligible Equipment</label>
              <div class="input-group">
                <input v-model="eligibleSearch" class="form-control" placeholder="EQ- / serial / UTID dari Equipment Register" @keyup.enter="loadEligible" />
                <button class="btn btn-outline-secondary" type="button" @click="loadEligible">Cari</button>
              </div>
              <small class="text-muted">Cari unit yang sudah ada di Equipment Register (status AVAILABLE, belum assigned).</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Pilih Equipment</label>
              <CustomSelect2
                v-model="assignForm.equipmentId"
                :options="eligible"
                :get-option-label="o => `${o.equipmentNo} — ${o.serialNumber} (${o.product?.sku || ''})`"
                :reduce="o => o.id"
                searchable
                clearable
                placeholder="-- Pilih Equipment --"
              />
              <small v-if="selectedEligible" class="text-muted d-block mt-1">
                Warehouse: {{ selectedEligible.warehouse?.code || '—' }}
                · Status: {{ selectedEligible.status }}
              </small>
            </div>
            <div class="mb-3">
              <label class="form-label">Alasan / Referensi Assignment <span class="text-danger">*</span></label>
              <textarea
                v-model="assignForm.notes"
                class="form-control"
                rows="2"
                placeholder="Contoh: instalasi awal, migrasi, atau nomor dokumen referensi"
              />
              <small class="text-muted">Wajib untuk assignment manual. Bukan identifier equipment (serial/UTID/EQ-).</small>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showAssign = false">Batal</button>
            <button class="btn btn-primary" :disabled="saving" @click="submitAssign">
              {{ saving ? 'Saving...' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Issue modal -->
    <div v-if="showIssue" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">SITE_ISSUE / Install</h5>
            <button type="button" class="btn-close" @click="showIssue = false" />
          </div>
          <div class="modal-body" v-if="issueRow">
            <ul class="list-unstyled small mb-3">
              <li><strong>Equipment:</strong> {{ issueRow.equipmentNo }} / {{ issueRow.serialNumber }}</li>
              <li><strong>Product:</strong> {{ issueRow.product?.sku }} — {{ issueRow.product?.name }}</li>
              <li><strong>Warehouse:</strong> {{ issueRow.warehouse?.code || issueRow.currentWarehouseId || '—' }}</li>
              <li><strong>Site:</strong> {{ site?.code }}</li>
            </ul>
            <div v-if="issueAvail" class="alert alert-secondary small py-2">
              On Hand: {{ Math.floor(issueAvail.onHandQty) }}
              · Reserved: {{ Math.floor(issueAvail.reservedQty) }}
              · Buffer: {{ Math.floor(issueAvail.bufferQty) }}
              · Available: {{ Math.floor(issueAvail.availableQty) }}
            </div>
            <div class="mb-3">
              <label class="form-label">Reservation ID (opsional)</label>
              <input v-model="issueForm.reservationId" class="form-control" placeholder="UUID reservation jika reservation-backed" />
            </div>
            <div class="mb-0">
              <label class="form-label">Notes</label>
              <textarea v-model="issueForm.notes" class="form-control" rows="2" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showIssue = false">Batal</button>
            <button class="btn btn-primary" :disabled="saving" @click="submitIssue">
              {{ saving ? 'Posting...' : 'Post SITE_ISSUE' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Return modal -->
    <div v-if="showReturn" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">SITE_RETURN</h5>
            <button type="button" class="btn-close" @click="showReturn = false" />
          </div>
          <div class="modal-body" v-if="returnRow">
            <ul class="list-unstyled small mb-3">
              <li><strong>Equipment:</strong> {{ returnRow.equipmentNo }}</li>
              <li><strong>Current Site:</strong> {{ site?.code }}</li>
            </ul>
            <div class="mb-3">
              <label class="form-label">Destination Warehouse <span class="text-danger">*</span></label>
              <select v-model="returnForm.destinationWarehouseId" class="form-select">
                <option value="">Pilih warehouse</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.code }} — {{ w.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Return Reason</label>
              <select v-model="returnForm.reason" class="form-select">
                <option value="NORMAL_RETURN">NORMAL_RETURN</option>
                <option value="RELOCATION">RELOCATION</option>
                <option value="TERMINATION">TERMINATION</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div class="mb-0">
              <label class="form-label">Notes</label>
              <textarea v-model="returnForm.notes" class="form-control" rows="2" />
            </div>
            <p class="small text-muted mt-2 mb-0">Setelah return, status equipment = RETURNED (belum AVAILABLE).</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showReturn = false">Batal</button>
            <button class="btn btn-primary" :disabled="saving" @click="submitReturn">
              {{ saving ? 'Posting...' : 'Post SITE_RETURN' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Fault modal -->
    <div v-if="showFault" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Report Fault</h5>
            <button type="button" class="btn-close" @click="showFault = false" />
          </div>
          <div class="modal-body">
            <ul class="small mb-3">
              <li><strong>Equipment:</strong> {{ faultRow?.equipmentNo }} / {{ faultRow?.serialNumber }}</li>
              <li><strong>Site:</strong> {{ site?.code }} — {{ site?.name }}</li>
            </ul>
            <div class="mb-3">
              <label class="form-label">Incident Type</label>
              <select v-model="faultForm.incidentType" class="form-select">
                <option v-for="t in incidentTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Severity</label>
              <select v-model="faultForm.severity" class="form-select">
                <option value="">—</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Description <span class="text-danger">*</span></label>
              <textarea v-model="faultForm.description" class="form-control" rows="2" />
            </div>
            <div class="mb-3">
              <label class="form-label">Symptoms</label>
              <textarea v-model="faultForm.symptoms" class="form-control" rows="2" />
            </div>
            <p class="small text-muted mb-0">Tidak mengubah On Hand / assignment. Equipment tetap INSTALLED.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showFault = false">Batal</button>
            <button class="btn btn-danger" :disabled="saving" @click="submitFault">
              {{ saving ? 'Saving...' : 'Report Fault' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Withdrawal modal -->
    <div v-if="showWithdrawal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Request Withdrawal</h5>
            <button type="button" class="btn-close" @click="showWithdrawal = false" />
          </div>
          <div class="modal-body">
            <ul class="small mb-3">
              <li><strong>Equipment:</strong> {{ withdrawalRow?.equipmentNo }}</li>
              <li><strong>Assignment:</strong> {{ withdrawalRow?.id }}</li>
              <li><strong>Site:</strong> {{ site?.code }}</li>
            </ul>
            <div class="mb-3">
              <label class="form-label">Reason</label>
              <select v-model="withdrawalForm.reason" class="form-select">
                <option v-for="r in withdrawalReasons" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div v-if="withdrawalForm.reason === 'FAILURE'" class="mb-3">
              <label class="form-label">Related Incident ID <span class="text-danger">*</span></label>
              <input v-model="withdrawalForm.incidentId" class="form-control" placeholder="UUID incident" />
              <small class="text-muted">FAILURE wajib terkait incident. Report Fault dulu jika belum ada.</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Destination Warehouse</label>
              <select v-model="withdrawalForm.destinationWarehouseId" class="form-select">
                <option value="">— pilih saat complete —</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.code }} — {{ w.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea v-model="withdrawalForm.notes" class="form-control" rows="2" />
            </div>
            <p class="small text-muted mb-0">
              Request tidak mengubah stock. Physical return via Complete Withdrawal → SITE_RETURN.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" @click="showWithdrawal = false">Batal</button>
            <button
              v-if="userHasRole('superadmin') || userHasPermission('create_equipment_withdrawal')"
              class="btn btn-primary"
              :disabled="saving"
              @click="submitWithdrawal"
            >
              {{ saving ? 'Saving...' : 'Request' }}
            </button>
            <button
              v-if="pendingWithdrawalId && (userHasRole('superadmin') || userHasPermission('create_equipment_withdrawal'))"
              class="btn btn-success"
              :disabled="saving || !withdrawalForm.destinationWarehouseId"
              @click="completePendingWithdrawal"
            >
              {{ saving ? 'Posting...' : 'Complete + SITE_RETURN' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({
  middleware: ['auth', 'check-permission'],
  title: 'Site Equipment',
})

const route = useRoute()
const { $api } = useNuxtApp()
const toast = useToast()
const { userHasPermission, userHasRole } = usePermissions()

const siteId = computed(() => route.params.id)
const loadingSite = ref(true)
const loading = ref(false)
const saving = ref(false)
const site = ref(null)
const tab = ref('current')
const currentRows = ref([])
const historyRows = ref([])
const showAssign = ref(false)
const showIssue = ref(false)
const showReturn = ref(false)
const showFault = ref(false)
const showWithdrawal = ref(false)
const eligible = ref([])
const eligibleSearch = ref('')
const warehouses = ref([])
const issueRow = ref(null)
const returnRow = ref(null)
const faultRow = ref(null)
const withdrawalRow = ref(null)
const pendingWithdrawalId = ref(null)
const issueAvail = ref(null)
const incidentTypes = [
  'HARDWARE_FAILURE',
  'POWER_ISSUE',
  'CONNECTIVITY_ISSUE',
  'PHYSICAL_DAMAGE',
  'ENVIRONMENTAL_DAMAGE',
  'FIRE_DAMAGE',
  'WATER_DAMAGE',
  'LIGHTNING_DAMAGE',
  'LOST',
  'OTHER',
]
const withdrawalReasons = [
  'FAILURE',
  'SERVICE_TERMINATION',
  'UPGRADE',
  'RELOCATION',
  'PREVENTIVE_REPLACEMENT',
  'CUSTOMER_REQUEST',
  'OTHER',
]
const assignForm = reactive({
  equipmentId: null,
  notes: '',
})
const issueForm = reactive({
  reservationId: '',
  notes: '',
})
const returnForm = reactive({
  destinationWarehouseId: '',
  reason: 'NORMAL_RETURN',
  notes: '',
})
const faultForm = reactive({
  incidentType: 'HARDWARE_FAILURE',
  severity: '',
  description: '',
  symptoms: '',
})
const withdrawalForm = reactive({
  reason: 'SERVICE_TERMINATION',
  incidentId: '',
  destinationWarehouseId: '',
  notes: '',
})

const selectedEligible = computed(() =>
  eligible.value.find((e) => e.id === assignForm.equipmentId) || null
)

function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

function hasRowActions(row) {
  if (row.status === 'ACTIVE') {
    return (
      userHasRole('superadmin') ||
      userHasPermission('issue_site_equipment') ||
      userHasPermission('remove_site_equipment')
    )
  }
  if (row.status === 'INSTALLED') {
    return (
      userHasRole('superadmin') ||
      userHasPermission('return_site_equipment') ||
      userHasPermission('report_equipment_fault') ||
      userHasPermission('create_equipment_withdrawal') ||
      userHasPermission('create_equipment_replacement')
    )
  }
  return false
}

function showError(e, fallback) {
  toast.error({
    title: 'Error',
    message: getApiErrorMessage(e, fallback),
    color: 'red',
    position: 'bottomRight',
  })
}

async function loadSite() {
  loadingSite.value = true
  try {
    const res = await $fetch(`${$api.sites()}/${siteId.value}`, { credentials: 'include' })
    // SitesController.show returns flat site JSON (not wrapped in { data })
    site.value = res?.data && (res.data.id || res.data.code) ? res.data : res
    if (site.value?._meta) {
      const { _meta, ...rest } = site.value
      site.value = rest
    }
  } catch (e) {
    site.value = null
    showError(e, 'Gagal load site')
  } finally {
    loadingSite.value = false
  }
}

async function loadCurrent() {
  const res = await $fetch($api.siteEquipment(siteId.value), { credentials: 'include' })
  currentRows.value = res?.data || []
}

async function loadHistory() {
  const res = await $fetch($api.siteEquipmentHistory(siteId.value), { credentials: 'include' })
  historyRows.value = res?.data || []
}

async function reload() {
  loading.value = true
  try {
    await Promise.all([loadCurrent(), loadHistory()])
  } catch (e) {
    showError(e, 'Gagal load equipment site')
  } finally {
    loading.value = false
  }
}

async function loadEligible() {
  try {
    const res = await $fetch($api.equipmentEligibleForAssignment(), {
      credentials: 'include',
      query: { search: eligibleSearch.value || undefined, rows: 100 },
    })
    eligible.value = res?.data || []
  } catch (e) {
    eligible.value = []
    showError(e, 'Gagal load eligible equipment')
  }
}

async function openAssign() {
  assignForm.equipmentId = null
  assignForm.notes = ''
  showAssign.value = true
  await loadEligible()
}

async function submitAssign() {
  if (!assignForm.equipmentId || !assignForm.notes.trim()) {
    toast.error({
      title: 'Validasi',
      message: 'Equipment dan notes wajib',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  saving.value = true
  try {
    await $fetch($api.siteEquipmentAssign(siteId.value), {
      method: 'POST',
      credentials: 'include',
      body: {
        equipmentId: assignForm.equipmentId,
        sourceType: 'MANUAL',
        notes: assignForm.notes.trim(),
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'Equipment di-assign ke site (planning — On Hand tidak berubah)',
      color: 'green',
      position: 'bottomRight',
    })
    showAssign.value = false
    await reload()
  } catch (e) {
    showError(e, 'Gagal assign equipment')
  } finally {
    saving.value = false
  }
}

async function removeAssignment(row) {
  if (!confirm(`Unassign ${row.equipmentNo} dari site ini? (On Hand tidak berubah)`)) return
  try {
    await $fetch($api.equipmentAssignmentRemove(row.id), {
      method: 'POST',
      credentials: 'include',
      body: { notes: 'Unassign from site detail' },
    })
    toast.success({
      title: 'Berhasil',
      message: 'Assignment di-remove',
      color: 'green',
      position: 'bottomRight',
    })
    await reload()
  } catch (e) {
    showError(e, 'Gagal unassign')
  }
}

async function loadWarehouses() {
  try {
    const res = await $fetch($api.warehouse(), { credentials: 'include' })
    warehouses.value = res?.data || res || []
  } catch {
    warehouses.value = []
  }
}

async function openIssue(row) {
  issueRow.value = row
  issueForm.reservationId = ''
  issueForm.notes = ''
  issueAvail.value = null
  showIssue.value = true
  if (row.product?.id && (row.warehouse?.id || row.currentWarehouseId)) {
    try {
      const res = await $fetch($api.stockReservationAvailability(), {
        credentials: 'include',
        query: {
          productId: row.product.id,
          warehouseId: row.warehouse?.id || row.currentWarehouseId,
        },
      })
      issueAvail.value = res?.data || res
    } catch {
      issueAvail.value = null
    }
  }
}

async function submitIssue() {
  if (!issueRow.value) return
  saving.value = true
  try {
    await $fetch($api.equipmentAssignmentIssue(issueRow.value.id), {
      method: 'POST',
      credentials: 'include',
      body: {
        reservationId: issueForm.reservationId || undefined,
        notes: issueForm.notes || undefined,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'SITE_ISSUE posted — On Hand −1, status INSTALLED',
      color: 'green',
      position: 'bottomRight',
    })
    showIssue.value = false
    await reload()
  } catch (e) {
    showError(e, 'Gagal SITE_ISSUE')
  } finally {
    saving.value = false
  }
}

async function openReturn(row) {
  returnRow.value = row
  returnForm.destinationWarehouseId = ''
  returnForm.reason = 'NORMAL_RETURN'
  returnForm.notes = ''
  showReturn.value = true
  if (!warehouses.value.length) await loadWarehouses()
}

async function submitReturn() {
  if (!returnRow.value || !returnForm.destinationWarehouseId) {
    toast.error({
      title: 'Validasi',
      message: 'Destination warehouse wajib',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  saving.value = true
  try {
    await $fetch($api.equipmentAssignmentReturn(returnRow.value.id), {
      method: 'POST',
      credentials: 'include',
      body: {
        destinationWarehouseId: Number(returnForm.destinationWarehouseId),
        reason: returnForm.reason,
        notes: returnForm.notes || undefined,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'SITE_RETURN posted — equipment RETURNED (bukan AVAILABLE)',
      color: 'green',
      position: 'bottomRight',
    })
    showReturn.value = false
    await reload()
  } catch (e) {
    showError(e, 'Gagal SITE_RETURN')
  } finally {
    saving.value = false
  }
}

function openFault(row) {
  faultRow.value = row
  faultForm.incidentType = 'HARDWARE_FAILURE'
  faultForm.severity = ''
  faultForm.description = ''
  faultForm.symptoms = ''
  showFault.value = true
}

async function submitFault() {
  if (!faultRow.value || !faultForm.description.trim()) {
    toast.error({
      title: 'Validasi',
      message: 'Description wajib',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  saving.value = true
  try {
    const res = await $fetch($api.equipmentIncidents(), {
      method: 'POST',
      credentials: 'include',
      body: {
        equipmentId: faultRow.value.equipmentId,
        incidentType: faultForm.incidentType,
        severity: faultForm.severity || undefined,
        description: faultForm.description.trim(),
        symptoms: faultForm.symptoms || undefined,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: `Fault reported (${res?.data?.id || 'OK'}) — equipment tetap INSTALLED`,
      color: 'green',
      position: 'bottomRight',
    })
    showFault.value = false
  } catch (e) {
    showError(e, 'Gagal report fault')
  } finally {
    saving.value = false
  }
}

async function openWithdrawal(row) {
  withdrawalRow.value = row
  pendingWithdrawalId.value = null
  withdrawalForm.reason = 'SERVICE_TERMINATION'
  withdrawalForm.incidentId = ''
  withdrawalForm.destinationWarehouseId = ''
  withdrawalForm.notes = ''
  showWithdrawal.value = true
  if (!warehouses.value.length) await loadWarehouses()
}

async function submitWithdrawal() {
  if (!withdrawalRow.value) return
  if (withdrawalForm.reason === 'FAILURE' && !withdrawalForm.incidentId.trim()) {
    toast.error({
      title: 'Validasi',
      message: 'FAILURE memerlukan incidentId',
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  saving.value = true
  try {
    const res = await $fetch($api.equipmentWithdrawals(), {
      method: 'POST',
      credentials: 'include',
      body: {
        equipmentId: withdrawalRow.value.equipmentId,
        reason: withdrawalForm.reason,
        incidentId: withdrawalForm.incidentId || undefined,
        destinationWarehouseId: withdrawalForm.destinationWarehouseId
          ? Number(withdrawalForm.destinationWarehouseId)
          : undefined,
        notes: withdrawalForm.notes || undefined,
      },
    })
    pendingWithdrawalId.value = res?.data?.id || null
    toast.success({
      title: 'Berhasil',
      message: 'Withdrawal requested — stock belum berubah. Complete untuk SITE_RETURN.',
      color: 'green',
      position: 'bottomRight',
    })
  } catch (e) {
    showError(e, 'Gagal request withdrawal')
  } finally {
    saving.value = false
  }
}

async function completePendingWithdrawal() {
  if (!pendingWithdrawalId.value || !withdrawalForm.destinationWarehouseId) return
  saving.value = true
  try {
    await $fetch($api.equipmentWithdrawalComplete(pendingWithdrawalId.value), {
      method: 'POST',
      credentials: 'include',
      body: {
        destinationWarehouseId: Number(withdrawalForm.destinationWarehouseId),
        notes: withdrawalForm.notes || undefined,
        allowFromRequested: true,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: 'SITE_RETURN posted — equipment UNDER_INSPECTION',
      color: 'green',
      position: 'bottomRight',
    })
    showWithdrawal.value = false
    pendingWithdrawalId.value = null
    await reload()
  } catch (e) {
    showError(e, 'Gagal complete withdrawal')
  } finally {
    saving.value = false
  }
}

async function startReplacement(row) {
  if (!confirm(`Create replacement for ${row.equipmentNo}? (service recovery — old unit state unchanged)`)) return
  try {
    const res = await $fetch($api.equipmentReplacements(), {
      method: 'POST',
      credentials: 'include',
      body: {
        originalEquipmentId: row.equipmentId,
        reason: 'HARDWARE_FAILURE',
        stockSource: 'STANDARD_STOCK',
        siteId: Number(siteId.value),
        notes: `From site ${site.value?.code}`,
      },
    })
    toast.success({
      title: 'Berhasil',
      message: `Replacement ${res?.data?.replacementNo} created`,
      color: 'green',
      position: 'bottomRight',
    })
    if (res?.data?.id) {
      await navigateTo(`/inventory/equipment-replacement/${res.data.id}`)
    }
  } catch (e) {
    showError(e, 'Gagal create replacement')
  }
}

onMounted(async () => {
  await Promise.all([loadSite(), loadWarehouses()])
  if (site.value) await reload()
})
</script>
