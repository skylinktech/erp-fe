<template>
  <div>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail FDR...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !fdr" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error.message || 'Gagal memuat data.' }}
          <NuxtLink to="/sales/fdr" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="fdr">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/sales/fdr" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ fdr.fdrNumber || fdr.name }}</h4>
                <small class="text-muted">{{ formatDateTime(fdr.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(fdr).class" class="badge">{{ getStatusBadge(fdr).text }}</span>
              <span :class="getPriorityBadge(fdr.priority).class" class="badge">{{ getPriorityBadge(fdr.priority).text }}</span>
              <span v-if="fdr.overBudget" class="badge bg-label-warning">
                <i class="ri-alert-line me-1"></i> Over Budget
              </span>
              <span v-if="fdr.pocNeeded" class="badge bg-label-info">
                <i class="ri-checkbox-circle-line me-1"></i> POC Needed
              </span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <!-- Proceed to SI Button -->
              <button
                v-if="fdr.status === 'approved' && (userHasRole('superadmin') || userHasPermission('create_site_investment'))"
                @click="openSiteInvestmentModal"
                class="btn btn-success btn-sm"
              >
                <i class="ri-file-add-line me-1"></i>
                Proceed to SI
              </button>
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="fdr.status === 'draft' && (userHasRole('superadmin') || userHasPermission('edit_fdr'))" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit FDR
                  </a>
                  <a v-if="fdr.status === 'pending' && (userHasRole('superadmin') || userHasPermission('approve_fdr'))" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="fdr.status === 'pending' && (userHasRole('superadmin') || userHasPermission('reject_fdr'))" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a v-if="fdr.status === 'approved' && (userHasRole('superadmin') || userHasPermission('create_site_investment'))" class="dropdown-item" href="javascript:void(0)" @click="openSiteInvestmentModal">
                    <i class="ri-file-add-line me-2"></i> Proceed to SI
                  </a>
                  <a v-if="fdr.status !== 'cancelled' && (userHasRole('superadmin') || userHasPermission('approve_fdr'))" class="dropdown-item" href="javascript:void(0)" @click="onCancel">
                    <i class="ri-close-circle-line me-2"></i> Cancel
                  </a>
                  <a v-if="(userHasRole('superadmin') || userHasPermission('edit_fdr'))" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/sales/fdr?edit=' + fdr.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a v-if="userHasRole('superadmin') || userHasPermission('delete_fdr')" class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
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
                <span class="process-pill process-pill-done">
                  <i class="ri-check-line me-1"></i> FDR{{ fdr.fdrDate ? ' (' + formatDate(fdr.fdrDate) + ')' : '' }}
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-pending">
                  <i class="ri-time-line me-1"></i> Quotation
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Customer Approval</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">IRO</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Implementation</span>
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
                    Informasi Project
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Nama Project</label>
                      <p class="mb-0 fw-medium">{{ fdr.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ fdr.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="fdr.site">
                      <label class="form-label text-muted medium">Site</label>
                      <p class="mb-0 fw-medium">{{ (fdr.site?.code || '') + ' - ' + (fdr.site?.name || '—') }}</p>
                    </div>
                    <div class="col-md-6" v-if="fdr.businessSchemeId">
                      <label class="form-label text-muted medium">Skema</label>
                      <p class="mb-0">
                        <span :class="getBusinessSchemeBadgeClass(fdr.businessSchemeId)" class="badge">
                          {{ fdr.businessScheme?.name || fdr.businessScheme?.code || '—' }}
                        </span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Lokasi</label>
                      <p class="mb-0">{{ fdr.location || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Tanggal FDR</label>
                      <p class="mb-0">{{ formatDate(fdr.fdrDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Estimasi Mulai</label>
                      <p class="mb-0">{{ formatDate(fdr.estimatedStartDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Estimasi Selesai</label>
                      <p class="mb-0">{{ formatDate(fdr.estimatedCompletionDate) }}</p>
                    </div>
                    <div class="col-6" v-if="fdr.notes">
                      <label class="form-label text-muted medium">Catatan</label>
                      <p class="mb-0 text-break">{{ fdr.notes }}</p>
                    </div>
                    <div class="col-12" v-if="fdr.attachment">
                      <label class="form-label text-muted medium">Attachment</label>
                      <a
                        :href="getAttachmentUrl(fdr.attachment)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                      >
                        <i :class="getFileIcon(fdr.attachment) + ' me-1'"></i>
                        Lihat / Unduh File
                      </a>
                      <img
                        v-if="isImageFile(fdr.attachment)"
                        :src="getAttachmentUrl(fdr.attachment)"
                        alt="Attachment"
                        class="d-block mt-2 rounded border"
                        style="max-height: 160px; max-width: 100%; object-fit: contain;"
                        @error="(e) => (e.target.style.display = 'none')"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Material -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-product-hunt-line me-2 text-primary"></i>
                    Material / Produk
                  </h5>
                  <span class="badge bg-label-primary">{{ (fdr.fdrItems ?? fdr.fdr_items ?? []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!((fdr.fdrItems ?? fdr.fdr_items) || []).length" class="text-muted text-center py-4">
                    Tidak ada material
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Produk</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Harga Satuan</th>
                          <th class="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(m, i) in ((fdr.fdrItems ?? fdr.fdr_items) || [])" :key="m.id || i">
                          <td>{{ m.priceListLine?.product?.name || m.priceListLine?.product?.sku || m.price_list_line?.product?.name || '—' }}</td>
                          <td class="text-center">{{ m.quantity ?? 0 }}</td>
                          <td class="text-end">{{ formatRupiah(m.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(m.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal Material: {{ formatRupiah(materialSubtotalFromApi) }}</p>
                  </div>
                </div>
              </div>

              <!-- Services -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-service-line me-2 text-primary"></i>
                    Managed Service
                  </h5>
                  <span class="badge bg-label-primary">{{ ((fdr.fdrServices ?? fdr.fdr_services) || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!((fdr.fdrServices ?? fdr.fdr_services) || []).length" class="text-muted text-center py-4">
                    Tidak ada service
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(s, i) in ((fdr.fdrServices ?? fdr.fdr_services) || [])" :key="s.id || i">
                          <td>{{ s.priceListLine?.service?.name || s.price_list_line?.service?.name || '—' }}</td>
                          <td class="text-center">{{ s.quantity ?? 0 }}</td>
                          <td class="text-end">{{ formatRupiah(getServicePrice(s)) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(getServiceSubtotal(s)) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal Service: {{ formatRupiah(serviceSubtotalFromApi) }}</p>
                  </div>
                </div>
              </div>

              <!-- DID -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-truck-line me-2 text-primary"></i>
                    DID (Delivery / Installation)
                  </h5>
                  <span class="badge bg-label-primary">{{ ((fdr.fdrDids ?? fdr.fdr_dids) || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!((fdr.fdrDids ?? fdr.fdr_dids) || []).length" class="text-muted text-center py-4">
                    Tidak ada DID
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>DID</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in ((fdr.fdrDids ?? fdr.fdr_dids) || [])" :key="d.id || i">
                          <td>{{ d.priceListLine?.did?.code || d.priceListLine?.did?.name || d.price_list_line?.did?.code || '—' }}</td>
                          <td class="text-center">{{ d.quantity ?? 1 }}</td>
                          <td class="text-end">{{ formatRupiah(d.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(d.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal DID: {{ formatRupiah(didSubtotalFromApi) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar: Ringkasan Keuangan + Meta -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan Keuangan -->
              <div class="card mb-4 shadow-sm border-0 si-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan Investasi
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Managed Service</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(serviceSubtotalFromApi) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Material</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(materialSubtotalFromApi) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">DID</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(didSubtotalFromApi) }}</p>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Grand Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(grandTotalFromApi) }}</p>
                  </div>
                </div>
              </div>

              <!-- Customer Information -->
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
                    <p class="mb-0 fw-medium">{{ fdr.customer?.name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Telepon</label>
                    <p class="mb-0 fw-medium">{{ fdr.customer?.phone || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ fdr.customer?.email || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium text-break">{{ fdr.customer?.address || '—' }}</p>
                  </div>
                  <div v-if="fdr.customer?.npwp" class="mb-0">
                    <label class="form-label text-muted mb-1">NPWP</label>
                    <p class="mb-0 fw-medium">{{ fdr.customer.npwp }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi Approval -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-checkbox-circle-line me-2 text-primary"></i>
                    Informasi Approval
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Status</label>
                    <p class="mb-0">
                      <span :class="getStatusBadge(fdr).class" class="badge">{{ getStatusBadge(fdr).text }}</span>
                    </p>
                  </div>
                  <div v-if="fdr.status === 'approved' && (getApprovalStepJabatan(fdr, 'approved') || fdr.approvedByUser)" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(fdr, 'approved') || fdr.approvedByUser?.fullName || fdr.approvedByUser?.full_name || '—' }}</p>
                    <small v-if="fdr.approvedAt" class="text-muted">{{ formatDateTime(fdr.approvedAt) }}</small>
                  </div>
                  <div v-if="fdr.status === 'rejected' && (getApprovalStepJabatan(fdr, 'rejected') || fdr.rejectedByUser)" class="mb-0">
                    <label class="form-label text-muted mb-1">Ditolak Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(fdr, 'rejected') || fdr.rejectedByUser?.fullName || fdr.rejectedByUser?.full_name || '—' }}</p>
                    <small v-if="fdr.rejectedAt" class="text-muted">{{ formatDateTime(fdr.rejectedAt) }}</small>
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
  <SiteInvestFormModal
    modal-id="FdrSiteInvestModal"
    :prefilled-fdr-id="fdr?.id"
    @saved="onSiteInvestSaved"
    @close="onSiteInvestClose"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFdrStore } from '~/stores/fdr'
import { useSiteInvestStore } from '~/stores/site-invest'
import SiteInvestFormModal from '~/components/modal/SiteInvestFormModal.vue'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'
import { useApprovalStatus } from '~/composables/useApprovalStatus'

const route = useRoute()
const fdrStore = useFdrStore()
const siteInvestStore = useSiteInvestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, getFileIcon, isImageFile } = useImageUrl()
const { getStatusBadge, getApprovalStepJabatan } = useApprovalStatus()
const formatRupiah = useFormatRupiah()

const { fdr, loading, error } = storeToRefs(fdrStore)

const id = computed(() => String(route.params.id || ''))

function formatDate(v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'low': return { text: 'Low', class: 'badge rounded-pill bg-label-info' }
    case 'medium': return { text: 'Medium', class: 'badge rounded-pill bg-label-warning' }
    case 'high': return { text: 'High', class: 'badge rounded-pill bg-label-danger' }
    default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

function getBusinessSchemeBadgeClass(businessSchemeId: number | null | undefined): string {
  switch (businessSchemeId) {
    case 1: return 'bg-label-info'
    case 2: return 'bg-label-secondary'
    case 3: return 'bg-label-primary'
    case 4: return 'bg-label-success'
    default: return 'bg-label-light'
  }
}

function getServicePrice(s: any): number {
  if (!s) return 0
  const p = s.price ?? (s as any).price
  const n = Number(p)
  return Number.isNaN(n) ? 0 : n
}

function getServiceSubtotal(s: any): number {
  if (!s) return 0
  const st = s.subtotal ?? (s as any).subtotal
  if (st !== undefined && st !== null && st !== '') {
    const n = Number(st)
    if (!Number.isNaN(n)) return n
  }
  const qty = Number(s.quantity ?? (s as any).quantity) || 1
  const price = getServicePrice(s)
  return qty * price
}

function fromApiNum(si: any, ...keys: string[]): number {
  if (!si) return 0
  for (const k of keys) {
    const v = (si as any)[k]
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return 0
}

const serviceSubtotalFromApi = computed(() => {
  const d = fdr.value
  if (!d) return 0
  return fromApiNum(d, 'serviceSubtotal', 'service_subtotal')
})

const materialSubtotalFromApi = computed(() => {
  const d = fdr.value
  if (!d) return 0
  return fromApiNum(d, 'materialSubtotal', 'material_subtotal')
})

const didSubtotalFromApi = computed(() => {
  const d = fdr.value
  if (!d) return 0
  return fromApiNum(d, 'didSubtotal', 'did_subtotal')
})

const totalFromApi = computed(() => fromApiNum(fdr.value, 'total'))
const grandTotalFromApi = computed(() => fromApiNum(fdr.value, 'grandTotal', 'grand_total'))

async function load() {
  if (!id.value) return
  try {
    await fdrStore.getFdrDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction() {
  setTimeout(() => load(), 500)
}

async function onApprove() {
  if (!fdr.value) return
  await fdrStore.approveFdr(fdr.value.id)
  refreshAfterAction()
}

async function onReject() {
  if (!fdr.value) return
  await fdrStore.rejectFdr(fdr.value.id)
  refreshAfterAction()
}

async function onSubmit() {
  if (!fdr.value) return
  await fdrStore.submitFdr(fdr.value.id)
  refreshAfterAction()
}

async function onCancel() {
  if (!fdr.value) return
  await fdrStore.cancelFdr(fdr.value.id)
  refreshAfterAction()
}

async function handleDelete() {
  if (!fdr.value) return
  const deleted = await fdrStore.deleteFdr(fdr.value.id)
  if (deleted) navigateTo('/sales/fdr')
}

function openSiteInvestmentModal() {
  if (!fdr.value) return
  siteInvestStore.openModalFromFdr(fdr.value.id)
}

function onSiteInvestSaved() {
  const toast = useToast()
  toast.success({ title: 'Sukses', message: 'Site Investment berhasil dibuat dari FDR', color: 'green', position: 'topRight', layout: 2 })
  load()
  navigateTo('/sales/site-investment')
}

function onSiteInvestClose() {
  // Modal closed
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail FDR',
})
</script>

<style scoped>
.si-detail-summary .card-body {
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
