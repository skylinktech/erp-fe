<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container pt-12">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail ARF...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !arf" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error.message || 'Gagal memuat data.' }}
          <NuxtLink to="/purchasing/arf" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="arf">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/purchasing/arf" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ arf.noArf || 'ARF' }}</h4>
                <small class="text-muted">{{ formatDateTime(arf.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(arf).class" class="badge">{{ getStatusBadge(arf).text }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="arf.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit ARF
                  </a>
                  <a v-if="arf.status === 'submitted' && (userHasRole('superadmin') || userHasPermission('approve_arf'))" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="arf.status === 'submitted' && (userHasRole('superadmin') || userHasPermission('approve_arf'))" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a v-if="arf.status === 'approved' && (userHasRole('superadmin') || userHasPermission('approve_arf'))" class="dropdown-item" href="javascript:void(0)" @click="onDisburse">
                    <i class="ri-money-dollar-circle-line me-2"></i> Disburse
                  </a>
                  <a v-if="arf.status === 'disbursed' && (userHasRole('superadmin') || userHasPermission('approve_arf'))" class="dropdown-item" href="javascript:void(0)" @click="onSettle">
                    <i class="ri-check-double-line me-2"></i> Settle
                  </a>
                  <a v-if="arf.status !== 'settled' && arf.status !== 'cancelled' && (userHasRole('superadmin') || userHasPermission('approve_arf'))" class="dropdown-item" href="javascript:void(0)" @click="onCancel">
                    <i class="ri-close-circle-line me-2"></i> Cancel
                  </a>
                  <a v-if="userHasRole('superadmin') || userHasPermission('edit_arf')" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/purchasing/arf?edit=' + arf.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a v-if="arf.status === 'draft' && (userHasRole('superadmin') || userHasPermission('delete_arf'))" class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Kartu: Informasi Umum -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi ARF
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. ARF</label>
                      <p class="mb-0 fw-medium">{{ arf.noArf || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Purchase Request</label>
                      <p class="mb-0 fw-medium">
                        <a 
                          v-if="arf.purchaseRequest"
                          @click="navigateTo(`/purchasing/purchase-request/detail/${arf.purchaseRequest.id}`)" 
                          style="cursor: pointer; color: #666bff; text-decoration: underline;"
                          class="text-primary"
                        >
                          {{ arf.purchaseRequest.noPr || '—' }}
                        </a>
                        <span v-else>—</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Request Date</label>
                      <p class="mb-0 fw-medium">{{ formatDate(arf.requestDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Needed Date</label>
                      <p class="mb-0 fw-medium">{{ formatDate(arf.neededDate) || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Site</label>
                      <p class="mb-0 fw-medium">{{ arf.site?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Cost Center</label>
                      <p class="mb-0 fw-medium">{{ arf.costCenter?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Status</label>
                      <p class="mb-0">
                        <span :class="getStatusBadge(arf).class" class="badge">
                          {{ getStatusBadge(arf).text }}
                        </span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Currency</label>
                      <p class="mb-0 fw-medium">{{ arf.currency || 'IDR' }}</p>
                    </div>
                    <div class="col-12" v-if="arf.purpose">
                      <label class="form-label text-muted medium">Purpose</label>
                      <p class="mb-0 text-break">{{ arf.purpose }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-box-line me-2 text-primary"></i>
                    Items
                  </h5>
                  <span class="badge bg-label-primary">{{ (arf.arfItems || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(arf.arfItems || []).length" class="text-muted text-center py-4">
                    Tidak ada items
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Warehouse</th>
                          <th>Unit</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                          <th class="text-center">Additional</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, i) in sortedArfItems" :key="item.id || i">
                          <td>{{ item.product?.name || item.product?.sku || '—' }}</td>
                          <td>{{ item.warehouse?.name || '—' }}</td>
                          <td>{{ item.unit?.symbol || item.unit?.name || '—' }}</td>
                          <td class="text-center">{{ item.quantity ?? 0 }}</td>
                          <td class="text-end">{{ formatRupiah(item.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(item.subtotal) }}</td>
                          <td class="text-center">
                            <span 
                              :class="item.additional ? 'badge bg-label-warning' : 'badge bg-label-success'"
                              class="badge"
                            >
                              {{ item.additional ? 'Ya' : 'Tidak' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Estimated Amount: {{ formatRupiah(arf.estimatedAmount || totalAmount) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar: Ringkasan + Meta -->
            <div class="col-xl-4 col-12">
              <!-- Approval Card -->
              <ApprovalCard
                :status-text="getStatusText(arf)"
                :current-step="arf.currentApprovalStep ?? null"
                :current-approvers="arf.currentApprovers ?? []"
                :approval-logs="arf.approvalLogs ?? []"
              />

              <!-- Ringkasan Total -->
              <div class="card mb-4 shadow-sm border-0 arf-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan Total
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Estimated Amount</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(arf.estimatedAmount || totalAmount) }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi Purchase Request -->
              <div class="card mb-4 shadow-sm border-0" v-if="arf.purchaseRequest">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-file-list-3-line me-2 text-primary"></i>
                    Informasi Purchase Request
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">No. PR</label>
                    <p class="mb-0 fw-medium">
                      <a 
                        @click="navigateTo(`/purchasing/purchase-request/detail/${arf.purchaseRequest.id}`)" 
                        style="cursor: pointer; color: #666bff; text-decoration: underline;"
                        class="text-primary"
                      >
                        {{ arf.purchaseRequest.noPr || '—' }}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Informasi Site -->
              <div class="card mb-4 shadow-sm border-0" v-if="arf.site">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-map-pin-line me-2 text-primary"></i>
                    Informasi Site
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Site</label>
                    <p class="mb-0 fw-medium">{{ arf.site.name || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi Cost Center -->
              <div class="card mb-4 shadow-sm border-0" v-if="arf.costCenter">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-building-line me-2 text-primary"></i>
                    Informasi Cost Center
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Cost Center</label>
                    <p class="mb-0 fw-medium">{{ arf.costCenter.name || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi User -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi User
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3" v-if="arf.requestor">
                    <label class="form-label text-muted mb-1">Requestor</label>
                    <p class="mb-0 fw-medium">{{ arf.requestor.fullName || arf.requestor.full_name || arf.requestor.email || '—' }}</p>
                    <small class="text-muted">{{ formatDateTime(arf.createdAt) }}</small>
                  </div>
                  <div class="mb-3" v-if="arf.approvedByUser || (arf.status === 'approved' && getApprovalStepJabatan(arf, 'approved'))">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(arf, 'approved') || arf.approvedByUser?.fullName || arf.approvedByUser?.full_name || '—' }}</p>
                    <small class="text-muted" v-if="arf.approvedAt">{{ formatDateTime(arf.approvedAt) }}</small>
                  </div>
                  <div class="mb-3" v-if="arf.rejectedByUser || (arf.status === 'rejected' && getApprovalStepJabatan(arf, 'rejected'))">
                    <label class="form-label text-muted mb-1">Ditolak Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(arf, 'rejected') || arf.rejectedByUser?.fullName || arf.rejectedByUser?.full_name || '—' }}</p>
                    <small class="text-muted" v-if="arf.rejectedAt">{{ formatDateTime(arf.rejectedAt) }}</small>
                  </div>
                  <div class="mb-3" v-if="arf.disbursedByUser">
                    <label class="form-label text-muted mb-1">Disbursed Oleh</label>
                    <p class="mb-0 fw-medium">{{ arf.disbursedByUser.fullName || arf.disbursedByUser.full_name || '—' }}</p>
                    <small class="text-muted" v-if="arf.disbursedAt">{{ formatDateTime(arf.disbursedAt) }}</small>
                  </div>
                  <div class="mb-3" v-if="arf.settledByUser">
                    <label class="form-label text-muted mb-1">Settled Oleh</label>
                    <p class="mb-0 fw-medium">{{ arf.settledByUser.fullName || arf.settledByUser.full_name || '—' }}</p>
                    <small class="text-muted" v-if="arf.settledAt">{{ formatDateTime(arf.settledAt) }}</small>
                  </div>
                  <div class="mb-0" v-if="arf.cancelledByUser">
                    <label class="form-label text-muted mb-1">Dibatalkan Oleh</label>
                    <p class="mb-0 fw-medium">{{ arf.cancelledByUser.fullName || arf.cancelledByUser.full_name || '—' }}</p>
                    <small class="text-muted" v-if="arf.cancelledAt">{{ formatDateTime(arf.cancelledAt) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useArfStore } from '~/stores/arf'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import ApprovalCard from '~/components/ApprovalCard.vue'
import { usePermissions } from '~/composables/usePermissions'

const route = useRoute()
const arfStore = useArfStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getStatusBadge, getStatusText, getApprovalStepJabatan } = useApprovalStatus()
const formatRupiah = useFormatRupiah()

const { arf, loading, error } = storeToRefs(arfStore)

const id = computed(() => String(route.params.id || ''))

function formatDate (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const totalAmount = computed(() => {
  if (!arf.value || !arf.value.arfItems) return 0
  return arf.value.arfItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

// Sort items: additional == false di paling atas
const sortedArfItems = computed(() => {
  if (!arf.value || !arf.value.arfItems) return []
  const items = [...arf.value.arfItems]
  return items.sort((a, b) => {
    // Convert additional to boolean if needed
    const aAdditional = a.additional === true || a.additional === 'true' || a.additional === 1 || a.additional === '1'
    const bAdditional = b.additional === true || b.additional === 'true' || b.additional === 1 || b.additional === '1'
    
    // Sort: false (0) comes before true (1)
    if (aAdditional === bAdditional) return 0
    return aAdditional ? 1 : -1
  })
})

async function load () {
  if (!id.value) return
  try {
    await arfStore.getArfDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

async function onApprove () {
  if (!arf.value) return
  await arfStore.approveArf(arf.value.id)
  refreshAfterAction()
}

async function onReject () {
  if (!arf.value) return
  await arfStore.rejectArf(arf.value.id)
  refreshAfterAction()
}

async function onDisburse () {
  if (!arf.value) return
  await arfStore.disburseArf(arf.value.id)
  refreshAfterAction()
}

async function onSettle () {
  if (!arf.value) return
  await arfStore.settleArf(arf.value.id)
  refreshAfterAction()
}

async function onCancel () {
  if (!arf.value) return
  await arfStore.cancelArf(arf.value.id)
  refreshAfterAction()
}

async function onSubmit () {
  if (!arf.value) return
  await arfStore.submitArf(arf.value.id)
  refreshAfterAction()
}

function handleDelete () {
  if (!arf.value) return
  arfStore.deleteArf(arf.value.id)
  navigateTo('/purchasing/arf')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.arf-detail-summary .card-body {
  font-variant-numeric: tabular-nums;
}
</style>
