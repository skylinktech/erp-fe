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
            <p class="mt-3 text-muted">Memuat detail Legal-Tech Review...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !review" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error.message || 'Gagal memuat data.' }}
          <NuxtLink to="/order-process/legal-tech" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="review">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/order-process/legal-tech" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ review.noLr || review.no_lr || 'Legal-Tech Review' }}</h4>
                <PageBreadcrumb class="mt-1" :current-label="review.noLr || review.no_lr || 'Legal-Tech Review'" />
                <small class="text-muted">{{ formatDateTime(review.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(review).class" class="badge">{{ getStatusBadge(review).text }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <!-- Proceed to Subscriptions Button -->
              <button
                v-if="review.status === 'approved' && (userHasRole('superadmin') || userHasPermission('create_subscription'))"
                @click="openSubscriptionModal"
                class="btn btn-success btn-sm"
              >
                <i class="ri-file-list-3-line me-1"></i>
                Proceed to Subscription
              </button>
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="review.status === 'draft' && (userHasRole('superadmin') || userHasPermission('edit_legal-technical_review'))" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit
                  </a>
                  <a v-if="review.status === 'pending' && (userHasRole('superadmin') || userHasPermission('approve_legal-technical_review'))" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="review.status === 'pending' && (userHasRole('superadmin') || userHasPermission('reject_legal-technical_review'))" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a v-if="review.status === 'approved' && (userHasRole('superadmin') || userHasPermission('create_subscription'))" class="dropdown-item" href="javascript:void(0)" @click="openSubscriptionModal">
                    <i class="ri-file-list-3-line me-2"></i> Proceed to Subscription
                  </a>
                  <a v-if="review.status === 'draft' && (userHasRole('superadmin') || userHasPermission('edit_legal-technical_review'))" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/order-process/legal-tech?edit=' + review.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a v-if="review.status === 'draft' && (userHasRole('superadmin') || userHasPermission('delete_legal-technical_review'))" class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Informasi Umum -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi Review
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. LR</label>
                      <p class="mb-0 fw-medium">{{ review.noLr || review.no_lr || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Quotation</label>
                      <p class="mb-0 fw-medium">
                        <NuxtLink v-if="review.quotation" :to="`/sales/quotation/detail/${review.quotation.id}`" class="text-primary text-decoration-none">
                          {{ review.quotation.noQuotation || review.quotation.no_quotation || '—' }}
                          <i class="ri-external-link-line ms-1"></i>
                        </NuxtLink>
                        <span v-else>—</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ review.quotation?.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Status</label>
                      <p class="mb-0">
                        <span :class="getStatusBadge(review).class" class="badge">{{ getStatusBadge(review).text }}</span>
                      </p>
                    </div>
                    <div class="col-12" v-if="review.notes">
                      <label class="form-label text-muted medium">Catatan</label>
                      <p class="mb-0 text-break">{{ review.notes }}</p>
                    </div>
                    <div class="col-12" v-if="attachments && attachments.length > 0">
                      <label class="form-label text-muted medium">Attachments</label>
                      <div class="d-flex flex-wrap gap-2">
                        <a
                          v-for="(url, idx) in attachments"
                          :key="idx"
                          :href="getAttachmentUrl(url)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                        >
                          <i :class="getFileIcon(url) + ' me-1'"></i>
                          File {{ idx + 1 }}
                        </a>
                      </div>
                      <div class="mt-2 d-flex flex-wrap gap-2">
                        <img
                          v-for="(url, idx) in imageAttachments"
                          :key="idx"
                          :src="getAttachmentUrl(url)"
                          alt="Attachment"
                          class="rounded border"
                          style="max-height: 160px; max-width: 200px; object-fit: contain;"
                          @error="(e) => (e.target.style.display = 'none')"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compliance Checklist -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-checkbox-line me-2 text-primary"></i>
                    Compliance Checklist
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-3">
                    <div class="col-md-6" v-for="item in checklistItems" :key="item.key">
                      <div class="d-flex align-items-center gap-2">
                        <i :class="review[item.key] ? 'ri-checkbox-circle-fill text-success' : 'ri-checkbox-blank-circle-line text-muted'" style="font-size: 1.25rem;"></i>
                        <span :class="review[item.key] ? 'fw-medium' : 'text-muted'">{{ item.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reference Quotation -->
              <div v-if="review.quotation" class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-file-list-3-line me-2 text-primary"></i>
                    Reference Quotation
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. Quotation</label>
                      <p class="mb-0 fw-medium">
                        <NuxtLink :to="`/sales/quotation/detail/${review.quotation.id}`" class="text-primary text-decoration-none">
                          {{ review.quotation.noQuotation || review.quotation.no_quotation || '—' }}
                          <i class="ri-external-link-line ms-1"></i>
                        </NuxtLink>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ review.quotation.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="review.quotation.site">
                      <label class="form-label text-muted medium">Site</label>
                      <p class="mb-0 fw-medium">{{ review.quotation.site?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="review.quotation.siteInvest">
                      <label class="form-label text-muted medium">Site Investment</label>
                      <p class="mb-0 fw-medium">
                        <NuxtLink v-if="review.quotation.siteInvest" :to="`/sales/site-investment/detail/${review.quotation.siteInvest.id}`" class="text-primary text-decoration-none">
                          {{ review.quotation.siteInvest.siNumber || review.quotation.siteInvest.si_number || '—' }}
                          <i class="ri-external-link-line ms-1"></i>
                        </NuxtLink>
                        <span v-else>—</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar: Meta Information -->
            <div class="col-xl-4 col-12">
              <!-- Informasi Review -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi Review
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ review.createdByUser?.full_name || review.createdByUser?.fullName || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Dibuat</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(review.createdAt) }}</p>
                  </div>
                  <div v-if="review.approvedByUser || (review.status === 'approved' && getApprovalStepJabatan(review, 'approved'))" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(review, 'approved') || review.approvedByUser?.full_name || review.approvedByUser?.fullName || '—' }}</p>
                  </div>
                  <div v-if="review.approvedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Disetujui</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(review.approvedAt) }}</p>
                  </div>
                  <div v-if="review.rejectedByUser || (review.status === 'rejected' && getApprovalStepJabatan(review, 'rejected'))" class="mb-3">
                    <label class="form-label text-muted mb-1">Ditolak Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(review, 'rejected') || review.rejectedByUser?.full_name || review.rejectedByUser?.fullName || '—' }}</p>
                  </div>
                  <div v-if="review.rejectedAt" class="mb-0">
                    <label class="form-label text-muted mb-1">Tanggal Ditolak</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(review.rejectedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- Approval Card -->
              <ApprovalCard
                :status-text="getStatusText(review)"
                :current-step="review.currentApprovalStep ?? null"
                :current-approvers="review.currentApprovers ?? []"
                :approval-logs="review.approvalLogs ?? []"
              />

              <!-- Customer Information -->
              <div v-if="review.quotation?.customer" class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi Customer
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Customer</label>
                    <p class="mb-0 fw-medium">{{ review.quotation.customer?.name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ review.quotation.customer?.email || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Telepon</label>
                    <p class="mb-0 fw-medium">{{ review.quotation.customer?.phone || '—' }}</p>
                  </div>
                  <div class="mb-0">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium text-break">{{ review.quotation.customer?.address || '—' }}</p>
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLegalTechStore } from '~/stores/legal-tech'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import ApprovalCard from '~/components/ApprovalCard.vue'

const route = useRoute()
const ltStore = useLegalTechStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, getFileIcon, isImageFile } = useImageUrl()
const { getStatusBadge, getStatusText, getApprovalStepJabatan } = useApprovalStatus()

const { reviews, loading, error } = storeToRefs(ltStore)

const id = computed(() => String(route.params.id || ''))
const review = computed(() => reviews.value.find(r => String(r.id) === id.value))

const checklistItems = [
  { key: 'legalDocMatch', label: 'Legal Document Match (NIB / NPWP / Akta)' },
  { key: 'installVerif', label: 'Installation Address Verified' },
  { key: 'serviceEligi', label: 'Service Eligibility (Coverage / Satellite Visibility)' },
  { key: 'deviceAvailConf', label: 'Device Availability Confirmed' },
  { key: 'slaTermsRev', label: 'SLA / Terms Reviewed' },
  { key: 'contractTermValid', label: 'Contract Term Validated' },
]

const attachments = computed(() => {
  if (!review.value?.attachment) return []
  try {
    const parsed = JSON.parse(review.value.attachment)
    return Array.isArray(parsed) ? parsed : [review.value.attachment]
  } catch {
    return [review.value.attachment]
  }
})

const imageAttachments = computed(() => {
  return attachments.value.filter(url => isImageFile(url))
})

function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function load() {
  if (!id.value) return
  
  // Pastikan list sudah ter-load terlebih dahulu jika kosong
  if (reviews.value.length === 0) {
    try {
      await ltStore.fetchLeTechReviews(true)
    } catch (e) {
      console.error('Failed to fetch list:', e)
    }
  }
  
  try {
    // Coba fetch detail lengkap
    await ltStore.getLeTechReviewDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
    
    // Cek apakah data ada di list
    const foundReview = reviews.value.find(r => String(r.id) === id.value)
    if (!foundReview) {
      // Jika tidak ada, coba fetch list sekali lagi
      try {
        await ltStore.fetchLeTechReviews(true)
        const retryFound = reviews.value.find(r => String(r.id) === id.value)
        if (!retryFound) {
          // Jika masih tidak ada, tampilkan error
          const toast = useToast()
          toast.error({ 
            title: 'Error', 
            message: 'Legal-Tech Review tidak ditemukan', 
            color: 'red', 
            position: 'bottomRight', 
            layout: 2 
          })
        }
      } catch (listError) {
        console.error('Failed to fetch list on retry:', listError)
      }
    }
  }
}

function refreshAfterAction() {
  setTimeout(() => load(), 500)
}

async function onApprove() {
  if (!review.value) return
  await ltStore.approveLeTechReview(review.value.id)
  refreshAfterAction()
}

async function onReject() {
  if (!review.value) return
  await ltStore.rejectLeTechReview(review.value.id)
  refreshAfterAction()
}

async function onSubmit() {
  if (!review.value) return
  await ltStore.submitLeTechReview(review.value.id)
  refreshAfterAction()
}

function handleDelete() {
  if (!review.value) return
  ltStore.deleteLeTechReview(review.value.id)
  navigateTo('/order-process/legal-tech')
}

// Subscription modal functions
function openSubscriptionModal() {
  if (!review.value) return
  navigateTo({
    path: '/order-process/subscription/form',
    query: {
      quotationId: review.value?.quotation?.id || review.value?.quotationId,
      leTechReviewId: review.value?.id,
      leTechReviewNo: review.value?.noLr || review.value?.no_lr,
      purchaseRequestId: review.value?.purchaseRequestId || review.value?.purchase_request_id || review.value?.purchaseRequest?.id,
    },
  })
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.process-flow {
  font-size: 0.9rem;
}

.process-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.process-pill-done {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.process-pill-pending {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.process-pill-inactive {
  background: #f1f5f9;
  color: #64748b;
}

.process-arrow {
  font-size: 0.85rem;
  font-weight: 600;
  user-select: none;
}
</style>
