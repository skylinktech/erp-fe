<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail Site Investment...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !siteInvest" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error.message || 'Gagal memuat data.' }}
          <NuxtLink to="/sales/site-investment" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="siteInvest">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/sales/site-investment" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ siteInvest.siNumber || siteInvest.name }}</h4>
                <small class="text-muted">{{ formatDateTime(siteInvest.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(siteInvest).class" class="badge">{{ getStatusBadge(siteInvest).text }}</span>
              <span v-if="(siteInvest.revision ?? 0) > 0" class="badge bg-label-info">Revisi {{ siteInvest.revision }}</span>
              <span :class="getPriorityBadge(siteInvest.priority).class" class="badge">{{ getPriorityBadge(siteInvest.priority).text }}</span>
              <span v-if="siteInvest.overBudget" class="badge bg-label-warning">
                <i class="ri-alert-line me-1"></i> Over Budget
              </span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="siteInvest.status === 'draft' || siteInvest.status === 'rejected'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> {{ siteInvest.status === 'rejected' ? 'Submit Revisi' : 'Submit SI' }}
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="onCancel">
                    <i class="ri-close-circle-line me-2"></i> Cancel
                  </a>
                  <a v-if="canEditSiteInvest(siteInvest)" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/sales/site-investment/form/' + siteInvest.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="onPrintSI">
                    <i class="ri-printer-line me-2"></i> Print SI
                  </a>
                  <a class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Process Flow -->
          <div class="card mb-4">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0">Process Flow</h5>
            </div>
            <div class="card-body px-5 pt-0 pb-4">
              <div class="d-flex flex-wrap align-items-center gap-2 process-flow">
                <span class="process-pill process-pill-done">
                  <i class="ri-check-line me-1"></i> Site Investment{{ siteInvest.siDate ? ' (' + formatDate(siteInvest.siDate) + ')' : '' }}
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-pending">
                  <i class="ri-time-line me-1"></i> Quotation
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Customer Approval</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Purchase Order</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Implementation</span>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Kartu: Informasi Umum -->
              <div class="card mb-4">
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
                      <p class="mb-0 fw-medium">{{ siteInvest.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ siteInvest.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="siteInvest.site">
                      <label class="form-label text-muted medium">Site</label>
                      <p class="mb-0 fw-medium">{{ (siteInvest.site?.code || '') + ' - ' + (siteInvest.site?.name || '—') }}</p>
                    </div>
                    <div class="col-md-6" v-if="siteInvest.businessSchemeId">
                      <label class="form-label text-muted medium">Skema</label>
                      <p class="mb-0">
                        <span :class="getBusinessSchemeBadgeClass(siteInvest.businessSchemeId)" class="badge">
                          {{ siteInvest.businessScheme?.name || siteInvest.businessScheme?.code || '—' }}
                        </span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Lokasi</label>
                      <p class="mb-0">{{ siteInvest.location || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Tanggal SI</label>
                      <p class="mb-0">{{ formatDate(siteInvest.siDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Estimasi Mulai</label>
                      <p class="mb-0">{{ formatDate(siteInvest.estimatedStartDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Estimasi Selesai</label>
                      <p class="mb-0">{{ formatDate(siteInvest.estimatedCompletionDate) }}</p>
                    </div>
                    <div class="col-md-6" v-if="siteInvest.lat || siteInvest.long">
                      <label class="form-label text-muted medium">Koordinat</label>
                      <p class="mb-0">
                        <a
                          v-if="siteInvest.lat && siteInvest.long"
                          :href="`https://www.google.com/maps?q=${siteInvest.lat},${siteInvest.long}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-primary"
                        >
                          {{ siteInvest.lat }}, {{ siteInvest.long }}
                          <i class="ri-external-link-line ms-1 medium"></i>
                        </a>
                        <span v-else>—</span>
                      </p>
                    </div>
                    <div class="col-6" v-if="siteInvest.notes">
                      <label class="form-label text-muted medium">Catatan</label>
                      <p class="mb-0 text-break">{{ siteInvest.notes }}</p>
                    </div>
                    <div class="col-12" v-if="siteInvest.attachment">
                      <label class="form-label text-muted medium">Attachment</label>
                      <a
                        :href="getAttachmentUrl(siteInvest.attachment)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                      >
                        <i :class="getFileIcon(siteInvest.attachment) + ' me-1'"></i>
                        Lihat / Unduh File
                      </a>
                      <img
                        v-if="isImageFile(siteInvest.attachment)"
                        :src="getAttachmentUrl(siteInvest.attachment)"
                        alt="Attachment"
                        class="d-block mt-2 rounded border"
                        style="max-height: 160px; max-width: 100%; object-fit: contain;"
                        @error="(e) => (e.target.style.display = 'none')"
                      />
                    </div>
                    <div class="col-12" v-if="(siteInvest.preparedBy || []).length">
                      <label class="form-label text-muted medium">Prepared By</label>
                      <p class="mb-0">
                        <span
                          v-for="(p, i) in (siteInvest.preparedBy || [])"
                          :key="p.id_pegawai ?? p.idPegawai ?? i"
                          class="badge bg-label-secondary me-1 mb-1"
                        >
                          {{ p.nm_pegawai || p.nmPegawai || '—' }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Material -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-product-hunt-line me-2 text-primary"></i>
                    Material / Produk
                  </h5>
                  <span class="badge bg-label-primary">{{ (siteInvest.siteInvestMaterials || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!((siteInvest.siteInvestMaterials ?? siteInvest.site_invest_materials) || []).length" class="text-muted text-center py-4">
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
                        <tr v-for="(m, i) in ((siteInvest.siteInvestMaterials ?? siteInvest.site_invest_materials) || [])" :key="m.id || i">
                          <td>{{ m.priceListLine?.product?.name || m.priceListLine?.product?.sku || '—' }}</td>
                          <td class="text-center">{{ m.quantity ?? 0 }}</td>
                          <td class="text-end">{{ formatRupiah(getMaterialPrice(m)) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(getMaterialSubtotal(m)) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal Material: {{ formatRupiah(materialSubtotalFromApi) }}</p>
                  </div>
                </div>
              </div>

              <!-- Services -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-service-line me-2 text-primary"></i>
                    Managed Service
                  </h5>
                  <span class="badge bg-label-primary">{{ ((siteInvest.siteInvestServices ?? siteInvest.site_invest_services) || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!((siteInvest.siteInvestServices ?? siteInvest.site_invest_services) || []).length" class="text-muted text-center py-4">
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
                        <tr v-for="(s, i) in ((siteInvest.siteInvestServices ?? siteInvest.site_invest_services) || [])" :key="s.id || i">
                          <td>{{ s.priceListLine?.service?.name || '—' }}</td>
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

              <!-- DID (Delivery/Installation) -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-truck-line me-2 text-primary"></i>
                    DID (Delivery / Installation)
                  </h5>
                  <span class="badge bg-label-primary">{{ ((siteInvest.siteInvestDids ?? siteInvest.site_invest_dids) || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!((siteInvest.siteInvestDids ?? siteInvest.site_invest_dids) || []).length" class="text-muted text-center py-4">
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
                        <tr v-for="(d, i) in ((siteInvest.siteInvestDids ?? siteInvest.site_invest_dids) || [])" :key="d.id || i">
                          <td>{{ d.priceListLine?.did?.code || d.priceListLine?.did?.name || '—' }}</td>
                          <td class="text-center">{{ d.quantity ?? 1 }}</td>
                          <td class="text-end">{{ formatRupiah(getDidPrice(d)) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(getDidSubtotal(d)) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal DID: {{ formatRupiah(didSubtotalFromApi) }}</p>
                  </div>
                </div>
              </div>

              <!-- Sidebar starts in next column -->
            </div>

            <!-- Sidebar: Ringkasan Keuangan + Meta -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan Keuangan -->
              <div class="card mb-4 si-detail-summary">
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
                    <label class="form-label text-muted medium mb-0">Total Investasi</label>
                    <p class="mb-0 fw-semibold">{{ formatRupiah(totalFromApi) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Marketing Fee</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(marketingFeeFromApi) }}</p>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Grand Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(grandTotalFromApi) }}</p>
                  </div>
                </div>
              </div>

              <!-- Customer Information -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi Customer
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Customer</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer?.name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Telepon</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer?.phone || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer?.email || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium text-break">{{ siteInvest.customer?.address || '—' }}</p>
                  </div>
                  <div v-if="siteInvest.customer?.npwp" class="mb-0">
                    <label class="form-label text-muted mb-1">NPWP</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer.npwp }}</p>
                  </div>
                </div>
              </div>

              <!-- Approval (sama seperti Quotation: current approval step, approvers, riwayat) -->
              <ApprovalCard
                :status-text="getStatusText(siteInvest)"
                :current-step="siteInvest.currentApprovalStep ?? siteInvest.nextApprovalStep"
                :current-approvers="siteInvest.currentApprovers || []"
                :approval-logs="(siteInvest.approvalLogs || siteInvest.approval_logs || [])"
              />
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
import { useSiteInvestStore } from '~/stores/site-invest'
import { useUserStore } from '~/stores/user'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'
import { useApprovalStatus } from '~/composables/useApprovalStatus'

const route = useRoute()
const siteInvestStore = useSiteInvestStore()
const userStore = useUserStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, getFileIcon, isImageFile } = useImageUrl()
const { getStatusBadge, getStatusText, getApprovalStepJabatan, getApprovedStepCount, getUserDisplayName } = useApprovalStatus()

function canEditSiteInvest(row: any) {
  if (!row) return false
  const s = row.status
  if (s === 'draft' || s === 'pending' || s === 'rejected') return true
  if (s === 'approved') {
    const stepCount = getApprovedStepCount(row)
    return stepCount != null && stepCount.total > 0 && stepCount.current < stepCount.total
  }
  return false
}

const currentUserId = computed(() => userStore.user?.id ?? null)
const canApprove = computed(() => {
  if (!siteInvest.value || currentUserId.value == null) return false
  const approvers = siteInvest.value.currentApprovers || []
  const uid = currentUserId.value
  const isCurrentApprover = approvers.length === 0 || approvers.some((a: any) => Number(a.userId) === Number(uid))
  const si = siteInvest.value
  if (si.status === 'pending') {
    return isCurrentApprover
  }
  if (si.status === 'approved') {
    const stepCount = getApprovedStepCount(si)
    if (stepCount && stepCount.current < stepCount.total) {
      return isCurrentApprover
    }
  }
  return false
})
const canReject = computed(() => canApprove.value)
const formatRupiah = useFormatRupiah()

const { siteInvest, loading, error } = storeToRefs(siteInvestStore)

const id = computed(() => {
  const p = route.params.id
  if (p == null || p === 'undefined' || p === 'null') return ''
  return String(p)
})

function formatDate (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getPriorityBadge (priority: string) {
  switch (priority) {
    case 'low': return { text: 'Low', class: 'badge rounded-pill bg-label-info' }
    case 'medium': return { text: 'Medium', class: 'badge rounded-pill bg-label-warning' }
    case 'high': return { text: 'High', class: 'badge rounded-pill bg-label-danger' }
    default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

function getBusinessSchemeBadgeClass (businessSchemeId: number | null | undefined): string {
  switch (businessSchemeId) {
    case 1: return 'bg-label-info'
    case 2: return 'bg-label-secondary'
    case 3: return 'bg-label-primary'
    case 4: return 'bg-label-success'
    default: return 'bg-label-light'
  }
}

/** Normalisasi angka dari API (hindari string desimal "3325000.00" salah format) */
function toItemAmount (value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const n = Number(value)
  return Number.isNaN(n) ? 0 : n
}

function getMaterialPrice (m: any): number {
  return toItemAmount(m?.price)
}

function getMaterialSubtotal (m: any): number {
  const st = toItemAmount(m?.subtotal)
  if (st > 0) return st
  const qty = toItemAmount(m?.quantity) || 1
  return qty * getMaterialPrice(m)
}

function getDidPrice (d: any): number {
  return toItemAmount(d?.price)
}

function getDidSubtotal (d: any): number {
  const st = toItemAmount(d?.subtotal)
  if (st > 0) return st
  const qty = toItemAmount(d?.quantity) || 1
  return qty * getDidPrice(d)
}

/** Harga satuan service: murni dari API (tidak hitung ulang) */
function getServicePrice (s: any): number {
  if (!s) return 0
  const p = s.price ?? (s as any).price
  const n = Number(p)
  return Number.isNaN(n) ? 0 : n
}

/** Subtotal service per baris: murni dari API; fallback qty×price hanya jika subtotal tidak ada */
function getServiceSubtotal (s: any): number {
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

/** Subtotal service: selalu dari API (service_subtotal / serviceSubtotal), tidak hitung ulang */
const serviceSubtotalFromApi = computed(() => {
  const si = siteInvest.value
  if (!si) return 0
  const v = (si as any).serviceSubtotal ?? (si as any).service_subtotal
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
})

/** Subtotal material: dari API (material_subtotal / materialSubtotal) */
const materialSubtotalFromApi = computed(() => {
  const si = siteInvest.value
  if (!si) return 0
  const v = (si as any).materialSubtotal ?? (si as any).material_subtotal
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
})

/** Subtotal DID: dari API (did_subtotal / didSubtotal) */
const didSubtotalFromApi = computed(() => {
  const si = siteInvest.value
  if (!si) return 0
  const v = (si as any).didSubtotal ?? (si as any).did_subtotal
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
})

function fromApiNum (si: any, ...keys: string[]): number {
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

const totalFromApi = computed(() => fromApiNum(siteInvest.value, 'total'))
const marketingFeeFromApi = computed(() => fromApiNum(siteInvest.value, 'marketingFee', 'marketing_fee'))
const grandTotalFromApi = computed(() => fromApiNum(siteInvest.value, 'grandTotal', 'grand_total'))

async function load () {
  if (!id.value) return
  try {
    await siteInvestStore.getSiteInvestDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

function getTargetId () {
  return siteInvest.value?.id || id.value
}

async function onApprove () {
  const targetId = getTargetId()
  if (!targetId) return
  await siteInvestStore.approveSiteInvest(targetId)
  refreshAfterAction()
}

async function onReject () {
  const targetId = getTargetId()
  if (!targetId) return
  await siteInvestStore.rejectSiteInvest(targetId)
  refreshAfterAction()
}

async function onSubmit () {
  const targetId = getTargetId()
  if (!targetId) return
  await siteInvestStore.submitSiteInvest(targetId)
  refreshAfterAction()
}

async function onCancel () {
  const targetId = getTargetId()
  if (!targetId) return
  await siteInvestStore.cancelSiteInvest(targetId)
  refreshAfterAction()
}

async function handleDelete () {
  const targetId = siteInvest.value?.id || id.value
  if (!targetId) return
  const deleted = await siteInvestStore.deleteSiteInvest(targetId)
  if (deleted) navigateTo('/sales/site-investment')
}

function onPrintSI () {
  if (!siteInvest.value?.id) return
  navigateTo({ path: '/sales/cetak-si', query: { id: siteInvest.value.id, print: 'true' } })
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
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
