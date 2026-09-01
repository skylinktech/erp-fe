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
            <p class="mt-3 text-muted">Memuat detail Quotation...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !quotation" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/sales/quotation" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="quotation">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/sales/quotation" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ quotation.noQuotation || '—' }}</h4>
                <PageBreadcrumb class="mt-1" :current-label="quotation.noQuotation || '—'" />
                <small class="text-muted">{{ formatDateTime(quotation.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(quotation).class" class="badge">{{ getStatusBadge(quotation).text }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="(userHasRole('superadmin') || userHasPermission('create_quotation') || userHasPermission('approve_quotation')) && (quotation.status === 'draft' || quotation.status === 'rejected')" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> {{ quotation.status === 'rejected' ? 'Submit Revisi' : 'Submit Quotation' }}
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a v-if="(userHasRole('superadmin') || userHasPermission('edit_purchase_order')) && canEditQuotation(quotation)" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/sales/quotation?edit=' + quotation.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="onPrintQuotation">
                    <i class="ri-printer-line me-2"></i> Print Quotation
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
                <NuxtLink v-if="quotation.siteInvest?.id" :to="'/sales/site-investment/detail/' + quotation.siteInvest.id" class="process-pill process-pill-done text-decoration-none">
                  <i class="ri-check-line me-1"></i> Site Investment{{ quotation.siteInvest?.siNumber ? ' (' + quotation.siteInvest.siNumber + ')' : '' }}
                </NuxtLink>
                <span v-else class="process-pill process-pill-done"><i class="ri-check-line me-1"></i> Site Investment</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-active">
                  <i class="ri-file-list-3-line me-1"></i> Quotation
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
              <!-- Kartu: Informasi Quotation -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi Quotation
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. Quotation</label>
                      <p class="mb-0 fw-medium">{{ quotation.noQuotation || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">UP / PIC</label>
                      <p class="mb-0 fw-medium">{{ quotation.up || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Tanggal</label>
                      <p class="mb-0">{{ formatDate(quotation.date) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Valid Until</label>
                      <p class="mb-0">{{ formatDate(quotation.validUntil) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ quotation.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="quotation.siteInvest">
                      <label class="form-label text-muted medium">Site Investment</label>
                      <p class="mb-0 fw-medium">
                        <NuxtLink v-if="quotation.siteInvest?.id" :to="'/sales/site-investment/detail/' + quotation.siteInvest.id" class="text-primary">{{ quotation.siteInvest?.siNumber || quotation.siteInvest?.name || '—' }}</NuxtLink>
                        <span v-else>{{ quotation.siteInvest?.siNumber || quotation.siteInvest?.name || '—' }}</span>
                      </p>
                    </div>
                    <div class="col-md-6" v-if="quotation.site">
                      <label class="form-label text-muted medium">Site</label>
                      <p class="mb-0 fw-medium">{{ (quotation.site?.code || '') + (quotation.site?.code && quotation.site?.name ? ' - ' : '') + (quotation.site?.name || '—') }}</p>
                    </div>
                    <div class="col-md-6" v-if="quotation.costCenter">
                      <label class="form-label text-muted medium">Cost Center</label>
                      <p class="mb-0 fw-medium">{{ (quotation.costCenter?.code || '') + (quotation.costCenter?.code && quotation.costCenter?.name ? ' - ' : '') + (quotation.costCenter?.name || '—') }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Terms of Payment</label>
                      <p class="mb-0">{{ quotation.termsOfPayment || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Dibuat oleh</label>
                      <p class="mb-0">{{ quotation.createdByUser?.fullName || quotation.createdByUser?.full_name || '—' }}</p>
                    </div>
                    <div class="col-12" v-if="quotation.status === 'rejected' && (quotation.rejectReason || quotation.reject_reason)">
                      <label class="form-label text-muted medium">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">{{ quotation.rejectReason || quotation.reject_reason || '—' }}</p>
                    </div>
                    <div class="col-12" v-if="quotation.description">
                      <label class="form-label text-muted medium">Deskripsi / Catatan</label>
                      <div class="quotation-description-content prose mb-0 text-break" v-html="quotation.description"></div>
                    </div>
                    <div class="col-12" v-if="quotation.attachment">
                      <label class="form-label text-muted medium">Attachment</label>
                      <a
                        :href="getAttachmentUrl(quotation.attachment)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                      >
                        <i :class="getFileIcon(quotation.attachment) + ' me-1'"></i>
                        Lihat / Unduh File
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- DID (Direct Inward Dialing) -->
              <div v-if="didItems.length > 0" class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-phone-line me-2 text-primary"></i>
                    Delivery, Installation, Dismantle (DID)
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Unit Price</th>
                          <th class="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in didItems" :key="d.id || 'did-' + i">
                          <td class="fw-medium">{{ getDidItemName(d) }}</td>
                          <td class="text-center">{{ d.quantity ?? 0 }}</td>
                          <td class="text-end">{{ formatRupiah(d.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(didSubtotalItem(d)) }}</td>
                        </tr>
                        <tr class="border-top">
                          <td colspan="3" class="text-end fw-medium">Subtotal DID</td>
                          <td class="text-end fw-medium">{{ formatRupiah(displayDidSubtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Cost Breakdown (dari quotationItems by product.billing_type) -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-money-dollar-circle-line me-2 text-primary"></i>
                    Cost Breakdown
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!otcItems.length && !mrcItems.length" class="text-muted text-center py-4">
                    Tidak ada item
                  </div>
                  <template v-else>
                    <!-- One Time Charge (OTC) -->
                    <div v-if="otcItems.length" class="mb-4">
                      <h6 class="text-muted mb-3">One Time Charge (OTC)</h6>
                      <div class="table-responsive">
                        <table class="table table-sm table-hover align-middle">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Description</th>
                              <th class="text-center">Qty</th>
                              <th class="text-end">Unit Price</th>
                              <th class="text-end">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(m, i) in otcItems" :key="m.id || 'otc-' + i">
                              <td class="fw-medium">{{ m.product?.name || m.product?.sku || '—' }}</td>
                              <td class="text-muted">{{ m.description || '—' }}</td>
                              <td class="text-center">{{ m.quantity ?? 0 }}</td>
                              <td class="text-end">{{ formatRupiah(otcUnitPrice(m)) }}</td>
                              <td class="text-end fw-medium">{{ formatRupiah(otcAmount(m)) }}</td>
                            </tr>
                            <tr class="border-top">
                              <td colspan="4" class="text-end fw-medium">Subtotal OTC</td>
                              <td class="text-end fw-medium">{{ formatRupiah(subtotalOtc) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <!-- Monthly Recurring Charge (MRC) -->
                    <div v-if="mrcItems.length">
                      <h6 class="text-muted mb-3">Monthly Recurring Charge (MRC)</h6>
                      <div class="table-responsive">
                        <table class="table table-sm table-hover align-middle">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Description</th>
                              <th class="text-center">Qty</th>
                              <th>Unit</th>
                              <th class="text-end">Unit Price</th>
                              <th class="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(m, i) in mrcItems" :key="m.id || 'mrc-' + i">
                              <td class="fw-medium">
                                {{ (m.product?.name || m.product?.sku) || (m.service?.name || m.service?.code) || '—' }}
                              </td>
                              <td class="text-muted">{{ m.description || m.service?.description || '—' }}</td>
                              <td class="text-center">{{ m.quantity ?? 0 }}</td>
                              <td>{{ mrcItemUnitLabel(m) }}</td>
                              <td class="text-end">{{ formatRupiah(mrcDisplayUnitPrice(m)) }}</td>
                              <td class="text-end fw-medium">{{ formatRupiah(mrcTotal(m)) }}</td>
                            </tr>
                            <tr class="border-top">
                              <td colspan="5" class="text-end fw-medium">Subtotal MRC</td>
                              <td class="text-end fw-medium">{{ formatRupiah(subtotalMrc) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Sidebar: Ringkasan + Customer -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan Keuangan -->
              <div class="card mb-4 qo-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan Quotation
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Service Subtotal</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(displayServiceSubtotal) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Product Subtotal</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(displayProductSubtotal) }}</p>
                  </div>
                  <div v-if="displayDidSubtotal > 0" class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">DID Subtotal</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(displayDidSubtotal) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Subtotal</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(totals.subtotal) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Discount ({{ totals.discountPercent }}%)</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(totals.discountAmount) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Setelah Diskon</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(totals.afterDiscount) }}</p>
                  </div>
                  <div v-if="totals.ppnPercent > 0 || totals.ppnAmount > 0" class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">PPN ({{ totals.ppnPercent }}%)</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(totals.ppnAmount) }}</p>
                  </div>
                  <div v-if="totals.hasPph" class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">PPH ({{ totals.pphPercent }}%)</label>
                    <p class="mb-0 fw-medium">-{{ formatRupiah(totals.pphAmount) }}</p>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Grand Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(totals.grandTotal) }}</p>
                  </div>
                </div>
              </div>

              <ApprovalCard
                :status-text="getStatusText(quotation)"
                :current-step="quotation.currentApprovalStep ?? quotation.nextApprovalStep"
                :current-approvers="quotation.currentApprovers"
                :approval-logs="quotation.approvalLogs || quotation.approval_logs || []"
              />

              <!-- Informasi Customer -->
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
                    <p class="mb-0 fw-medium">{{ quotation.customer?.name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Telepon</label>
                    <p class="mb-0 fw-medium">{{ quotation.customer?.phone || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ quotation.customer?.email || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium text-break">{{ quotation.customer?.address || '—' }}</p>
                  </div>
                  <div v-if="quotation.customer?.npwp" class="mb-0">
                    <label class="form-label text-muted mb-1">NPWP</label>
                    <p class="mb-0 fw-medium">{{ quotation.customer.npwp }}</p>
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
import { useQuotationStore } from '~/stores/quotation'
import { useImageUrl } from '~/composables/useImageUrl'
import { usePermissions } from '~/composables/usePermissions'
import { useUserStore } from '~/stores/user'
import Swal from 'sweetalert2'
import { computeQuotationTotals } from '~/utils/quotationTotals'

const route = useRoute()
const quotationStore = useQuotationStore()
const { getAttachmentUrl, getFileIcon } = useImageUrl()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()

const { quotation, loading, error } = storeToRefs(quotationStore)
const userStore = useUserStore()
const submitting = ref(false)

const id = computed(() => String(route.params.id || ''))
const currentUserId = computed(() => userStore.user?.id ?? null)
const canApprove = computed(() => {
  if (!quotation.value || currentUserId.value == null) return false
  const approvers = quotation.value.currentApprovers || []
  const uid = currentUserId.value
  const isCurrentApprover = approvers.length === 0 || approvers.some((a: any) => Number(a.userId) === Number(uid))
  const q = quotation.value
  if (q.status === 'pending') return isCurrentApprover
  if (q.status === 'approved') {
    const stepCount = getApprovedStepCount(q)
    if (stepCount && stepCount.current < stepCount.total) return isCurrentApprover
  }
  return false
})
const canReject = computed(() => canApprove.value)

function formatDate (v: string | Date | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const { getStatusBadge, getStatusText, getApprovedStepCount } = useApprovalStatus()

function canEditQuotation(row: any) {
  if (!row) return false
  const s = row.status
  if (s === 'draft' || s === 'pending' || s === 'rejected') return true
  if (s === 'approved') {
    const stepCount = getApprovedStepCount(row)
    return stepCount != null && stepCount.total > 0 && stepCount.current < stepCount.total
  }
  return false
}

// Nilai numerik dari API (camelCase / snake_case), tidak hitung ulang (selaras halaman SI/detail)
function fromApiNum (q: any, ...keys: string[]): number {
  if (!q) return 0
  for (const k of keys) {
    const v = (q as any)[k]
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return 0
}

// Section subtotals: selalu dari API, tidak hitung ulang
const displayProductSubtotal = computed(() => fromApiNum(quotation.value, 'productSubtotal', 'product_subtotal'))
const displayServiceSubtotal = computed(() => fromApiNum(quotation.value, 'serviceSubtotal', 'service_subtotal'))
const displayDidSubtotal = computed(() => fromApiNum(quotation.value, 'didSubtotal', 'did_subtotal'))

const didItems = computed(() => quotation.value?.quotationDids ?? quotation.value?.quotation_dids ?? [])

function getDidItemName (d: any): string {
  const pll = d.priceListLine ?? d.price_list_line
  if (!pll) return 'DID'
  const did = pll.did
  if (did && (did.name || did.code)) return [did.name, did.code].filter(Boolean).join(' – ')
  if (pll.priceableType === 'did' || pll.priceable_type === 'did') return 'DID #' + (pll.priceableId ?? pll.priceable_id ?? '')
  return 'DID'
}

function didSubtotalItem (d: any): number {
  const sub = d.subtotal != null ? Number(d.subtotal) : null
  if (sub != null && !Number.isNaN(sub)) return sub
  const qty = Number(d.quantity) || 0
  const price = Number(d.price) || 0
  return qty * price
}

const totals = computed(() => computeQuotationTotals(quotation.value as Record<string, unknown> | null))

function getServiceItemName (s: any): string {
  const svc = s.service ?? s
  const name = svc?.name ?? svc?.code
  if (name && !/^Service #\d+$/i.test(String(name))) return name
  return svc?.code || '—'
}

/** Harga efektif per unit (sama seperti modal): base price + Terminal Kit + Quota Priority + New Service Line + Additional Data */
function getServiceEffectivePrice (s: any): number {
  const base = Number(s?.price) || 0
  const tk = Number(s?.terminalKitCount ?? s?.terminal_kit_count) || 0
  const qp = Number(s?.quotaPriority ?? s?.quota_priority) || 0
  const nsl = Number(s?.newServiceLine ?? s?.new_service_line) || 0
  const ad = Number(s?.additionalData ?? s?.additional_data) || 0
  return base + tk + qp + nsl + ad
}

// Billing type dari product (camelCase atau snake_case)
function getBillingType (item: any): string {
  return (item?.product?.billingType ?? item?.product?.billing_type ?? 'one_time') + ''
}

// Cost Breakdown: OTC (one_time) dan MRC (recurring) dari quotationItems
const otcItems = computed(() => {
  const list = quotation.value?.quotationItems ?? quotation.value?.quotation_items ?? []
  return list.filter((i: any) => getBillingType(i) !== 'recurring')
})

const mrcItems = computed(() => {
  const productList = quotation.value?.quotationItems ?? quotation.value?.quotation_items ?? []
  const serviceList = quotation.value?.quotationServices ?? quotation.value?.quotation_services ?? []
  const productRecurring = productList.filter((i: any) => {
    const bt = getBillingType(i)
    return bt === 'recurring'
  })
  const serviceRecurring = serviceList.filter((s: any) => {
    const bt = (s?.billingType ?? s?.billing_type ?? s?.service?.billing_type ?? s?.service?.billingType ?? '') + ''
    return bt.toLowerCase() === 'recurring'
  })
  // Normalize service entries: include subtotal dari API agar Cost Breakdown akurat
  const normalizedServices = serviceRecurring.map((s: any) => ({
    id: s.id,
    service: s.service,
    quantity: s.quantity,
    price: s.price,
    subtotal: s.subtotal ?? (s as any).subtotal,
    unit: s.unit,
    unitId: s.unitId ?? s.unit_id,
    serviceId: s.serviceId ?? s.service_id,
    terminalKitCount: s.terminalKitCount ?? s.terminal_kit_count,
    quotaPriority: s.quotaPriority ?? s.quota_priority,
    newServiceLine: s.newServiceLine ?? s.new_service_line,
    additionalData: s.additionalData ?? s.additional_data,
    description: s.description ?? s.service?.description ?? null,
  }))
  return [...productRecurring, ...normalizedServices]
})

function otcAmount (m: any): number {
  const sub = m.subtotal ?? (m as any).subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    if (!Number.isNaN(n)) return n
  }
  return (Number(m.quantity) || 0) * (Number(m.price) || 0)
}

/** Unit price untuk OTC: dari API (subtotal/qty) agar konsisten dengan Amount, else price */
function otcUnitPrice (m: any): number {
  const sub = m.subtotal ?? (m as any).subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    const qty = Number(m.quantity) || 1
    if (!Number.isNaN(n) && qty > 0) return n / qty
  }
  return Number(m.price) || 0
}

function mrcUnitPrice (m: any): number {
  if (m.service != null || m.serviceId != null) return getServiceEffectivePrice(m)
  return Number(m.price) || 0
}

/** Unit price untuk MRC: dari API (subtotal/qty) agar konsisten dengan Ringkasan, else effective price */
function mrcDisplayUnitPrice (m: any): number {
  const sub = m.subtotal ?? (m as any).subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    const qty = Number(m.quantity) || 1
    if (!Number.isNaN(n) && qty > 0) return n / qty
  }
  return mrcUnitPrice(m)
}

function mrcTotal (m: any): number {
  const sub = m.subtotal ?? (m as any).subtotal
  if (sub !== undefined && sub !== null && sub !== '') {
    const n = Number(sub)
    if (!Number.isNaN(n)) return n
  }
  const qty = Number(m.quantity) || 0
  const unitPrice = mrcUnitPrice(m)
  return qty * unitPrice
}

function mrcItemUnitLabel (m: any): string {
  const u = m.unit ?? {}
  const sym = u.symbol ?? u.name
  if (sym) return String(sym)
  const uid = m.unitId ?? m.unit_id
  if (uid != null) return 'Unit #' + uid
  if (m.product?.unit?.symbol ?? m.product?.unit?.name) return String(m.product.unit.symbol ?? m.product.unit.name)
  return '—'
}

const subtotalOtc = computed(() => otcItems.value.reduce((s, i) => s + otcAmount(i), 0))
const subtotalMrc = computed(() => mrcItems.value.reduce((s, i) => s + mrcTotal(i), 0))

async function load () {
  if (!id.value) return
  try {
    await quotationStore.getQuotationDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

async function onSubmit () {
  if (!quotation.value) return
  submitting.value = true
  try {
    const ok = await quotationStore.submitQuotation(quotation.value.id)
    if (ok) refreshAfterAction()
  } finally {
    submitting.value = false
  }
}

async function onApprove () {
  if (!quotation.value) return
  const result = await Swal.fire({
    title: 'Approve Quotation',
    input: 'textarea',
    inputLabel: 'Catatan (optional)',
    inputPlaceholder: 'Tulis catatan approval jika diperlukan...',
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'Batal',
  })
  if (!result.isConfirmed) return
  const ok = await quotationStore.approveQuotation(quotation.value.id, result.value || '', true)
  if (ok) refreshAfterAction()
}

async function onReject () {
  if (!quotation.value) return
  const ok = await quotationStore.rejectQuotation(quotation.value.id)
  if (ok) refreshAfterAction()
}

function onPrintQuotation () {
  if (!quotation.value?.id) return
  navigateTo({ path: '/sales/cetak-quotation', query: { id: quotation.value.id, print: 'true' } })
}

async function handleDelete () {
  if (!quotation.value) return
  const deleted = await quotationStore.deleteQuotation(quotation.value.id)
  if (deleted) navigateTo('/sales/quotation')
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
.qo-detail-summary .card-body {
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

.process-pill-active {
  background: var(--bs-primary, #008fec);
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

.quotation-description-content.prose p { margin-bottom: 0.5em; }
.quotation-description-content.prose ul,
.quotation-description-content.prose ol { padding-left: 1.25rem; margin-bottom: 0.5em; }
.quotation-description-content.prose li { margin-bottom: 0.25em; }
</style>
