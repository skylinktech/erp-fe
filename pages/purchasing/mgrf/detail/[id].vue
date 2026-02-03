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
            <p class="mt-3 text-muted">Memuat detail MGRF...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !mgrf" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error.message || 'Gagal memuat data.' }}
          <NuxtLink to="/purchasing/mgrf" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="mgrf">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/purchasing/mgrf" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ mgrf.noMgrf || 'MGRF' }}</h4>
                <small class="text-muted">{{ formatDateTime(mgrf.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(mgrf).class" class="badge">{{ getStatusBadge(mgrf).text }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="mgrf.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit MGRF
                  </a>
                  <a v-if="mgrf.status === 'pending'" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="mgrf.status === 'pending'" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/purchasing/mgrf?edit=' + mgrf.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a v-if="mgrf.status === 'draft'" class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
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
                    Informasi MGRF
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. MGRF</label>
                      <p class="mb-0 fw-medium">{{ mgrf.noMgrf || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">IRO</label>
                      <p class="mb-0 fw-medium">
                        <a 
                          v-if="mgrf.iro"
                          @click="navigateTo(`/order-process/iro/detail/${mgrf.iro.id}`)" 
                          style="cursor: pointer; color: #666bff; text-decoration: underline;"
                          class="text-primary"
                        >
                          {{ mgrf.iro.noIro || '—' }}
                        </a>
                        <span v-else>—</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Tanggal</label>
                      <p class="mb-0">{{ formatDate(mgrf.date) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Status</label>
                      <p class="mb-0">
                        <span :class="getStatusBadge(mgrf).class" class="badge">
                          {{ getStatusBadge(mgrf).text }}
                        </span>
                      </p>
                    </div>
                    <div class="col-12" v-if="mgrf.description">
                      <label class="form-label text-muted medium">Deskripsi</label>
                      <p class="mb-0 text-break">{{ mgrf.description }}</p>
                    </div>
                    <div class="col-12" v-if="mgrf.attachment">
                      <label class="form-label text-muted medium">Attachment</label>
                      <a
                        :href="getAttachmentUrl(mgrf.attachment)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                      >
                        <i :class="getFileIcon(mgrf.attachment) + ' me-1'"></i>
                        Lihat / Unduh File
                      </a>
                      <img
                        v-if="isImageFile(mgrf.attachment)"
                        :src="getAttachmentUrl(mgrf.attachment)"
                        alt="Attachment"
                        class="d-block mt-2 rounded border"
                        style="max-height: 160px; max-width: 100%; object-fit: contain;"
                        @error="(e) => (e.target.style.display = 'none')"
                      />
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
                  <span class="badge bg-label-primary">{{ (mgrf.mgrfItems || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(mgrf.mgrfItems || []).length" class="text-muted text-center py-4">
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
                        <tr v-for="(item, i) in sortedMgrfItems" :key="item.id || i">
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
                    <p class="mb-0 text-end fw-semibold mt-3">Total: {{ formatRupiah(mgrf.total || totalAmount) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar: Ringkasan + Meta -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan Total -->
              <div class="card mb-4 shadow-sm border-0 mgrf-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan Total
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(mgrf.total || totalAmount) }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi IRO -->
              <div class="card mb-4 shadow-sm border-0" v-if="mgrf.iro">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-file-list-3-line me-2 text-primary"></i>
                    Informasi IRO
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">No. IRO</label>
                    <p class="mb-0 fw-medium">
                      <a 
                        @click="navigateTo(`/order-process/iro/detail/${mgrf.iro.id}`)" 
                        style="cursor: pointer; color: #666bff; text-decoration: underline;"
                        class="text-primary"
                      >
                        {{ mgrf.iro.noIro || '—' }}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Approval Card -->
              <ApprovalCard
                :status-text="getStatusText(mgrf)"
                :current-step="mgrf.currentApprovalStep ?? null"
                :current-approvers="mgrf.currentApprovers ?? []"
                :approval-logs="mgrf.approvalLogs ?? []"
              />

              <!-- Informasi User -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi User
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3" v-if="mgrf.createdByUser">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ mgrf.createdByUser.fullName || mgrf.createdByUser.full_name || mgrf.createdByUser.email || '—' }}</p>
                    <small class="text-muted">{{ formatDateTime(mgrf.createdAt) }}</small>
                  </div>
                  <div class="mb-3" v-if="mgrf.approvedByUser || (mgrf.status === 'approved' && getApprovalStepJabatan(mgrf, 'approved'))">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(mgrf, 'approved') || mgrf.approvedByUser?.fullName || mgrf.approvedByUser?.full_name || '—' }}</p>
                    <small class="text-muted" v-if="mgrf.approvedAt">{{ formatDateTime(mgrf.approvedAt) }}</small>
                  </div>
                  <div class="mb-0" v-if="mgrf.rejectedByUser || (mgrf.status === 'rejected' && getApprovalStepJabatan(mgrf, 'rejected'))">
                    <label class="form-label text-muted mb-1">Ditolak Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(mgrf, 'rejected') || mgrf.rejectedByUser?.fullName || mgrf.rejectedByUser?.full_name || '—' }}</p>
                    <small class="text-muted" v-if="mgrf.rejectedAt">{{ formatDateTime(mgrf.rejectedAt) }}</small>
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
import { useMgrfStore } from '~/stores/mgrf'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import ApprovalCard from '~/components/ApprovalCard.vue'

const route = useRoute()
const mgrfStore = useMgrfStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, getFileIcon, isImageFile } = useImageUrl()
const { getStatusBadge, getStatusText, getApprovalStepJabatan } = useApprovalStatus()
const formatRupiah = useFormatRupiah()

const { mgrf, loading, error } = storeToRefs(mgrfStore)

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
  if (!mgrf.value || !mgrf.value.mgrfItems) return 0
  return mgrf.value.mgrfItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

// Sort items: additional == false di paling atas
const sortedMgrfItems = computed(() => {
  if (!mgrf.value || !mgrf.value.mgrfItems) return []
  const items = [...mgrf.value.mgrfItems]
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
    await mgrfStore.getMgrfDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

async function onApprove () {
  if (!mgrf.value) return
  await mgrfStore.approveMgrf(mgrf.value.id)
  refreshAfterAction()
}

async function onReject () {
  if (!mgrf.value) return
  await mgrfStore.rejectMgrf(mgrf.value.id)
  refreshAfterAction()
}

async function onSubmit () {
  if (!mgrf.value) return
  await mgrfStore.submitMgrf(mgrf.value.id)
  refreshAfterAction()
}

function handleDelete () {
  if (!mgrf.value) return
  mgrfStore.deleteMgrf(mgrf.value.id)
  navigateTo('/purchasing/mgrf')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.mgrf-detail-summary .card-body {
  font-variant-numeric: tabular-nums;
}
</style>
