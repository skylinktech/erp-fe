<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container pt-1">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail PKS...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !pks" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/order-process/pks" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="pks">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/order-process/pks" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ (pks as any).noPks || (pks as any).no_pks || '—' }}</h4>
                <small class="text-muted">{{ formatDateTime((pks as any).createdAt) }}</small>
              </div>
              <span :class="getStatusBadge((pks as any).status).class" class="badge">{{ getStatusBadge((pks as any).status).text }}</span>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span class="d-none d-sm-block">Actions</span>
                </button>
                <div class="dropdown-menu">
                  <a
                    v-if="(userHasRole('superadmin') || userHasPermission('approve_pks')) && (pks as any).status === 'draft'"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="onSigned"
                  >
                    <i class="ri-file-check-line me-2"></i> Signed
                  </a>
                  <a
                    v-if="(userHasRole('superadmin') || userHasPermission('edit_pks')) && (pks as any).status === 'draft'"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="navigateTo('/order-process/pks/form/' + (pks as any).id)"
                  >
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a
                    v-if="(userHasRole('superadmin') || userHasPermission('delete_pks')) && (pks as any).status === 'draft'"
                    class="dropdown-item text-danger"
                    href="javascript:void(0)"
                    @click="handleDelete"
                  >
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Process Flow -->
          <div class="card mb-4 shadow-sm border-0">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0">Process Flow</h5>
            </div>
            <div class="card-body px-5 pt-0 pb-4">
              <div class="d-flex flex-wrap align-items-center gap-2 process-flow">
                <NuxtLink
                  v-if="firstSubscriptionId"
                  :to="`/order-process/subscription/detail/${firstSubscriptionId}`"
                  class="process-pill process-pill-done text-decoration-none"
                >
                  <i class="ri-check-line me-1"></i> Subscription
                </NuxtLink>
                <span v-else class="process-pill process-pill-done">
                  <i class="ri-check-line me-1"></i> Subscription
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-active">
                  <i class="ri-file-text-line me-1"></i> PKS
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Implementation</span>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Informasi PKS -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi PKS
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. PKS</label>
                      <p class="mb-0 fw-medium">{{ (pks as any).noPks || (pks as any).no_pks || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ (pks as any).customerName || (pks as any).customer_name || (pks as any).customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Contract Start Date</label>
                      <p class="mb-0">{{ formatDate((pks as any).contractStartDate || (pks as any).contract_start_date) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Contract End Date</label>
                      <p class="mb-0">{{ formatDate((pks as any).contractEndDate || (pks as any).contract_end_date) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Signing Location</label>
                      <p class="mb-0">{{ (pks as any).signingLocation || (pks as any).signing_location || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Signing Date</label>
                      <p class="mb-0">{{ formatDate((pks as any).signingDate || (pks as any).signing_date) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer PIC</label>
                      <p class="mb-0">{{ (pks as any).custPic || (pks as any).cust_pic || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. Tlp Customer PIC</label>
                      <p class="mb-0">{{ (pks as any).custPicNoTlp || (pks as any).cust_pic_no_tlp || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Site PIC</label>
                      <p class="mb-0">{{ (pks as any).sitePic || (pks as any).site_pic || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. Tlp Site PIC</label>
                      <p class="mb-0">{{ (pks as any).sitePicNoTlp || (pks as any).site_pic_no_tlp || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="(pks as any).approvedAt || (pks as any).approved_at">
                      <label class="form-label text-muted medium">Approved At</label>
                      <p class="mb-0">{{ formatDateTime((pks as any).approvedAt || (pks as any).approved_at) }}</p>
                    </div>
                    <div class="col-md-6" v-if="(pks as any).rejectedAt || (pks as any).rejected_at">
                      <label class="form-label text-muted medium">Rejected At</label>
                      <p class="mb-0">{{ formatDateTime((pks as any).rejectedAt || (pks as any).rejected_at) }}</p>
                    </div>
                    <div class="col-12" v-if="(pks as any).description">
                      <label class="form-label text-muted medium">Description</label>
                      <p class="mb-0 text-break">{{ (pks as any).description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subscriptions -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-file-list-3-line me-2 text-primary"></i>
                    Subscriptions
                  </h5>
                  <span class="badge bg-label-primary">{{ (pksSubscriptions || []).length }} item</span>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(pksSubscriptions || []).length" class="text-muted text-center py-4">
                    Tidak ada subscription
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>No. Subscription</th>
                          <th>Status</th>
                          <th>Contract Start</th>
                          <th>Contract End</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, i) in pksSubscriptions" :key="row.id || i">
                          <td>
                            <NuxtLink
                              v-if="row.subscriptionId"
                              :to="`/order-process/subscription/detail/${row.subscriptionId}`"
                              class="text-primary"
                            >
                              {{ row.subscriptionNo || row.subscription?.noSubscription || row.subscription?.no_subscription || row.subscriptionId }}
                            </NuxtLink>
                            <span v-else>—</span>
                          </td>
                          <td>
                            <span :class="getStatusBadge(row.subscriptionStatus || row.subscription?.status).class" class="badge">
                              {{ getStatusBadge(row.subscriptionStatus || row.subscription?.status).text }}
                            </span>
                          </td>
                          <td>{{ formatDate(row.subscriptionContractStart || (row.subscription as any)?.contractStartDate || (row.subscription as any)?.contract_start_date) }}</td>
                          <td>{{ formatDate(row.subscriptionContractEnd || (row.subscription as any)?.contractEndDate || (row.subscription as any)?.contract_end_date) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Documents -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-attachment-line me-2 text-primary"></i>
                    Documents
                  </h5>
                  <span class="badge bg-label-primary">{{ (pksDocuments || []).length }} item</span>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(pksDocuments || []).length" class="text-muted text-center py-4">
                    Tidak ada dokumen
                  </div>
                  <div v-else>
                    <div v-for="(d, i) in pksDocuments" :key="d.id || i" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                      <i :class="getFileIcon(d.attachment || '') + ' text-primary'"></i>
                      <span class="badge bg-label-secondary text-uppercase">{{ d.docTypeLabel }}</span>
                      <a
                        v-if="d.attachment"
                        :href="getAttachmentUrl(d.attachment)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex-grow-1 small text-decoration-none"
                      >
                        {{ d.fileName }}
                      </a>
                      <span v-else class="text-muted flex-grow-1 small">—</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan -->
              <div class="card mb-4 shadow-sm border-0 pks-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-file-text-line me-2 text-primary"></i>
                    Ringkasan PKS
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Status</label>
                    <span :class="getStatusBadge((pks as any).status).class" class="badge">{{ getStatusBadge((pks as any).status).text }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Jumlah Subscription</label>
                    <p class="mb-0 fw-medium">{{ (pksSubscriptions || []).length }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Jumlah Dokumen</label>
                    <p class="mb-0 fw-medium">{{ (pksDocuments || []).length }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi Customer -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi Customer
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Customer</label>
                    <p class="mb-0 fw-medium">{{ (pks as any).customerName || (pks as any).customer?.name || '—' }}</p>
                  </div>
                  <div v-if="(pks as any).customer?.phone" class="mb-3">
                    <label class="form-label text-muted mb-1">Telepon</label>
                    <p class="mb-0 fw-medium">{{ (pks as any).customer.phone }}</p>
                  </div>
                  <div v-if="(pks as any).customer?.email" class="mb-3">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ (pks as any).customer.email }}</p>
                  </div>
                  <div v-if="(pks as any).customer?.address" class="mb-3">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium text-break">{{ (pks as any).customer.address }}</p>
                  </div>
                  <div v-if="(pks as any).customer?.npwp" class="mb-0">
                    <label class="form-label text-muted mb-1">NPWP</label>
                    <p class="mb-0 fw-medium">{{ (pks as any).customer.npwp }}</p>
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
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePksStore } from '~/stores/pks'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'

const route = useRoute()
const pksStore = usePksStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, getFileIcon } = useImageUrl()

const { pks, loading, error } = storeToRefs(pksStore)
const submitting = ref(false)

const id = computed(() => String(route.params.id || ''))

function formatDate (v: any) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime (v: any) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getStatusBadge (status: string) {
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'signed': return { text: 'Signed', class: 'badge rounded-pill bg-label-info' }
    case 'active': return { text: 'Active', class: 'badge rounded-pill bg-label-success' }
    case 'terminated': return { text: 'Terminated', class: 'badge rounded-pill bg-label-warning' }
    case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
    default: return { text: status || '—', class: 'badge rounded-pill bg-label-light' }
  }
}

const pksSubscriptions = computed(() => {
  const raw = ((pks.value as any)?.pksSubscriptions ?? (pks.value as any)?.pks_subscriptions ?? []) as any[]
  return (raw || []).map((x: any) => {
    const sub = x.subscription || null
    const subscriptionId = x.subscriptionId ?? x.subscription_id ?? sub?.id ?? null
    return {
      id: x.id,
      subscriptionId,
      subscription: sub,
      subscriptionNo: sub?.noSubscription || sub?.no_subscription || null,
      subscriptionStatus: sub?.status || null,
      subscriptionContractStart: sub?.contractStartDate || sub?.contract_start_date || sub?.targetActiveDate || sub?.target_active_date || null,
      subscriptionContractEnd: sub?.contractEndDate || sub?.contract_end_date || null,
    }
  })
})

const firstSubscriptionId = computed(() => {
  return pksSubscriptions.value?.[0]?.subscriptionId || null
})

const pksDocuments = computed(() => {
  const raw = ((pks.value as any)?.pksDocuments ?? (pks.value as any)?.pks_documents ?? []) as any[]
  return (raw || []).map((d: any) => {
    const attachment = d.attachment || null
    const docType = d.docType ?? d.doc_type ?? 'main'
    const fileName = attachment ? String(attachment).split('/').pop() : 'File'
    return {
      id: d.id,
      docType,
      docTypeLabel: String(docType || '').toUpperCase(),
      attachment,
      fileName,
    }
  })
})

async function load () {
  if (!id.value) return
  try {
    await pksStore.getPksDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

async function onSigned () {
  if (!pks.value) return
  submitting.value = true
  try {
    const ok = await pksStore.submitPks((pks.value as any).id)
    if (ok) refreshAfterAction()
  } finally {
    submitting.value = false
  }
}

function handleDelete () {
  if (!pks.value) return
  pksStore.deletePks((pks.value as any).id)
  navigateTo('/order-process/pks')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.pks-detail-summary .card-body {
  font-variant-numeric: tabular-nums;
}

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

.process-pill-active {
  background: var(--bs-primary, #696cff);
  color: #fff;
  font-weight: 600;
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

