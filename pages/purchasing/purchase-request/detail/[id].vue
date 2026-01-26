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
            <p class="mt-3 text-muted">Memuat detail Purchase Request...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !purchaseRequest" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error.message || 'Gagal memuat data.' }}
          <NuxtLink to="/purchasing/purchase-request" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="purchaseRequest">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/purchasing/purchase-request" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ purchaseRequest.noPr || 'Purchase Request' }}</h4>
                <small class="text-muted">{{ formatDateTime(purchaseRequest.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(purchaseRequest.status).class" class="badge">{{ getStatusBadge(purchaseRequest.status).text }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="purchaseRequest.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit Purchase Request
                  </a>
                  <a v-if="purchaseRequest.status === 'pending'" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="purchaseRequest.status === 'pending'" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/purchasing/purchase-request?edit=' + purchaseRequest.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a v-if="purchaseRequest.status === 'draft'" class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
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
                    Informasi Purchase Request
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. PR</label>
                      <p class="mb-0 fw-medium">{{ purchaseRequest.noPr || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">MGRF</label>
                      <p class="mb-0 fw-medium">
                        <a 
                          v-if="purchaseRequest.mgrf"
                          @click="navigateTo(`/purchasing/mgrf/detail/${purchaseRequest.mgrf.id}`)" 
                          style="cursor: pointer; color: #666bff; text-decoration: underline;"
                          class="text-primary"
                        >
                          {{ purchaseRequest.mgrf.noMgrf || '—' }}
                        </a>
                        <span v-else>—</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Vendor</label>
                      <p class="mb-0 fw-medium">{{ purchaseRequest.vendor?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Status</label>
                      <p class="mb-0">
                        <span :class="getStatusBadge(purchaseRequest.status).class" class="badge">
                          {{ getStatusBadge(purchaseRequest.status).text }}
                        </span>
                      </p>
                    </div>
                    <div class="col-12" v-if="purchaseRequest.description">
                      <label class="form-label text-muted medium">Deskripsi</label>
                      <p class="mb-0 text-break">{{ purchaseRequest.description }}</p>
                    </div>
                    <div class="col-12" v-if="purchaseRequest.attachment">
                      <label class="form-label text-muted medium">Attachment</label>
                      <a
                        :href="getAttachmentUrl(purchaseRequest.attachment)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                      >
                        <i :class="getFileIcon(purchaseRequest.attachment) + ' me-1'"></i>
                        Lihat / Unduh File
                      </a>
                      <img
                        v-if="isImageFile(purchaseRequest.attachment)"
                        :src="getAttachmentUrl(purchaseRequest.attachment)"
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
                  <span class="badge bg-label-primary">{{ (purchaseRequest.purchaseRequestItems || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(purchaseRequest.purchaseRequestItems || []).length" class="text-muted text-center py-4">
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
                        <tr v-for="(item, i) in sortedPurchaseRequestItems" :key="item.id || i">
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
                    <p class="mb-0 text-end fw-semibold mt-3">Total: {{ formatRupiah(purchaseRequest.total || totalAmount) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar: Ringkasan + Meta -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan Total -->
              <div class="card mb-4 shadow-sm border-0 purchase-request-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan Total
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(purchaseRequest.total || totalAmount) }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi MGRF -->
              <div class="card mb-4 shadow-sm border-0" v-if="purchaseRequest.mgrf">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-file-list-3-line me-2 text-primary"></i>
                    Informasi MGRF
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">No. MGRF</label>
                    <p class="mb-0 fw-medium">
                      <a 
                        @click="navigateTo(`/purchasing/mgrf/detail/${purchaseRequest.mgrf.id}`)" 
                        style="cursor: pointer; color: #666bff; text-decoration: underline;"
                        class="text-primary"
                      >
                        {{ purchaseRequest.mgrf.noMgrf || '—' }}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Informasi Vendor -->
              <div class="card mb-4 shadow-sm border-0" v-if="purchaseRequest.vendor">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-store-line me-2 text-primary"></i>
                    Informasi Vendor
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Vendor</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.vendor.name || '—' }}</p>
                  </div>
                  <div class="mb-3" v-if="purchaseRequest.vendor.email">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.vendor.email || '—' }}</p>
                  </div>
                  <div class="mb-3" v-if="purchaseRequest.vendor.phone">
                    <label class="form-label text-muted mb-1">No. Telp</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.vendor.phone || '—' }}</p>
                  </div>
                  <div class="mb-3" v-if="purchaseRequest.vendor.address">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.vendor.address || '—' }}</p>
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
                  <div class="mb-3" v-if="purchaseRequest.createdByUser">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.createdByUser.fullName || purchaseRequest.createdByUser.full_name || purchaseRequest.createdByUser.email || '—' }}</p>
                    <small class="text-muted">{{ formatDateTime(purchaseRequest.createdAt) }}</small>
                  </div>
                  <div class="mb-3" v-if="purchaseRequest.approvedByUser">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.approvedByUser.fullName || purchaseRequest.approvedByUser.full_name || '—' }}</p>
                    <small class="text-muted" v-if="purchaseRequest.approvedAt">{{ formatDateTime(purchaseRequest.approvedAt) }}</small>
                  </div>
                  <div class="mb-3" v-if="purchaseRequest.rejectedByUser">
                    <label class="form-label text-muted mb-1">Ditolak Oleh</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.rejectedByUser.fullName || purchaseRequest.rejectedByUser.full_name || '—' }}</p>
                    <small class="text-muted" v-if="purchaseRequest.rejectedAt">{{ formatDateTime(purchaseRequest.rejectedAt) }}</small>
                  </div>
                  <div class="mb-0" v-if="purchaseRequest.receivedByUser">
                    <label class="form-label text-muted mb-1">Diterima Oleh</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.receivedByUser.fullName || purchaseRequest.receivedByUser.full_name || '—' }}</p>
                    <small class="text-muted" v-if="purchaseRequest.receivedAt">{{ formatDateTime(purchaseRequest.receivedAt) }}</small>
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
import { usePurchaseRequestStore } from '~/stores/purchase-request'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'

const route = useRoute()
const purchaseRequestStore = usePurchaseRequestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, getFileIcon, isImageFile } = useImageUrl()
const formatRupiah = useFormatRupiah()

const { purchaseRequest, loading, error } = storeToRefs(purchaseRequestStore)

const id = computed(() => String(route.params.id || ''))

function formatDate (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getStatusBadge (status: string) {
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'pending': return { text: 'Pending', class: 'badge rounded-pill bg-label-warning' }
    case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-success' }
    case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' }
    case 'received': return { text: 'Received', class: 'badge rounded-pill bg-label-info' }
    default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

const totalAmount = computed(() => {
  if (!purchaseRequest.value || !purchaseRequest.value.purchaseRequestItems) return 0
  return purchaseRequest.value.purchaseRequestItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

// Sort items: additional == false di paling atas
const sortedPurchaseRequestItems = computed(() => {
  if (!purchaseRequest.value || !purchaseRequest.value.purchaseRequestItems) return []
  const items = [...purchaseRequest.value.purchaseRequestItems]
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
    await purchaseRequestStore.getPurchaseRequestDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

async function onApprove () {
  if (!purchaseRequest.value) return
  await purchaseRequestStore.approvePurchaseRequest(purchaseRequest.value.id)
  refreshAfterAction()
}

async function onReject () {
  if (!purchaseRequest.value) return
  await purchaseRequestStore.rejectPurchaseRequest(purchaseRequest.value.id)
  refreshAfterAction()
}

async function onSubmit () {
  if (!purchaseRequest.value) return
  await purchaseRequestStore.submitPurchaseRequest(purchaseRequest.value.id)
  refreshAfterAction()
}

function handleDelete () {
  if (!purchaseRequest.value) return
  purchaseRequestStore.deletePurchaseRequest(purchaseRequest.value.id)
  navigateTo('/purchasing/purchase-request')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.purchase-request-detail-summary .card-body {
  font-variant-numeric: tabular-nums;
}
</style>
