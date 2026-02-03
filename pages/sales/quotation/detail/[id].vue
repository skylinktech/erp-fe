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
                <small class="text-muted">{{ formatDateTime(quotation.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(quotation).class" class="badge">{{ getStatusBadge(quotation).text }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="(userHasRole('superadmin') || userHasPermission('create_quotation') || userHasPermission('approve_quotation')) && quotation.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit Quotation
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/sales/quotation?edit=' + quotation.id)">
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
          <div class="card mb-4 shadow-sm border-0">
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
                <span class="process-pill process-pill-inactive">IRO</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Implementation</span>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Kartu: Informasi Quotation -->
              <div class="card mb-4 shadow-sm border-0">
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
                      <label class="form-label text-muted medium">Minimum Period</label>
                      <p class="mb-0">{{ quotation.minimumPeriod ? quotation.minimumPeriod + ' bulan' : '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Dibuat oleh</label>
                      <p class="mb-0">{{ quotation.createdByUser?.fullName || quotation.createdByUser?.full_name || '—' }}</p>
                    </div>
                    <div class="col-12" v-if="quotation.description">
                      <label class="form-label text-muted medium">Deskripsi / Catatan</label>
                      <p class="mb-0 text-break">{{ quotation.description }}</p>
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

              <!-- Service Details -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-service-line me-2 text-primary"></i>
                    Service Details
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Service Type</label>
                      <p class="mb-0 fw-medium">{{ primaryService?.service?.name || primaryService?.service?.code || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Service Plan</label>
                      <p class="mb-0 fw-medium">{{ primaryService?.service?.servicePlan?.name || primaryService?.service?.description || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Quantity</label>
                      <p class="mb-0">{{ primaryService ? (primaryService.quantity ?? 1) + ' unit' : '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Service Period</label>
                      <p class="mb-0">{{ quotation.minimumPeriod ? quotation.minimumPeriod + ' bulan' : '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Installation Location</label>
                      <p class="mb-0 fw-medium">{{ quotation.site?.name || quotation.site?.code || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Target RFS</label>
                      <p class="mb-0">—</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cost Breakdown (dari quotationItems by product.billing_type) -->
              <div class="card mb-4 shadow-sm border-0">
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
                              <td class="text-end">{{ formatRupiah(m.price) }}</td>
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
                              <th class="text-end">Monthly</th>
                              <th>Period</th>
                              <th class="text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(m, i) in mrcItems" :key="m.id || 'mrc-' + i">
                              <td class="fw-medium">
                                {{ (m.product?.name || m.product?.sku) || (m.service?.name || m.service?.code) || '—' }}
                              </td>
                              <td class="text-muted">{{ m.description || m.service?.description || '—' }}</td>
                              <td class="text-end">{{ formatRupiah(mrcMonthly(m)) }}</td>
                              <td>{{ mrcPeriod }} months</td>
                              <td class="text-end fw-medium">{{ formatRupiah(mrcTotal(m)) }}</td>
                            </tr>
                            <tr class="border-top">
                              <td colspan="4" class="text-end fw-medium">Subtotal MRC</td>
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
              <div class="card mb-4 shadow-sm border-0 qo-detail-summary">
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
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Subtotal</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(computedSubtotal) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Discount ({{ quotation.discountPercent ?? 0 }}%)</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(computedDiscount) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Setelah Diskon</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(computedAfterDiscount) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Pajak ({{ quotation.taxPercent ?? 0 }}%)</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(computedTax) }}</p>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Grand Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(quotation.grandTotal ?? quotation.total) }}</p>
                  </div>
                </div>
              </div>

              <ApprovalCard
                :status-text="getStatusText(quotation)"
                :current-step="quotation.currentApprovalStep"
                :current-approvers="quotation.currentApprovers"
                :approval-logs="quotation.approvalLogs"
              />

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
  if (!quotation.value || quotation.value.status !== 'pending') return false
  const approvers = quotation.value.currentApprovers || []
  if (!currentUserId.value) return false
  return approvers.length === 0 || approvers.some((a) => a.userId === currentUserId.value)
})

function formatDate (v: string | Date | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const { getStatusBadge, getStatusText } = useApprovalStatus()

const mrcPeriod = computed(() => Number(quotation.value?.minimumPeriod) || 12)

// Untuk fallback: OTC = qty*price; MRC (recurring) = (qty*price)*period
const displayProductSubtotal = computed(() => {
  const q = quotation.value
  if (!q) return 0
  if (q.productSubtotal != null && q.productSubtotal !== '') return Number(q.productSubtotal)
  const period = mrcPeriod.value
  return (q.quotationItems || []).reduce((s, i) => {
    const bt = (i?.product?.billingType ?? i?.product?.billing_type ?? 'one_time') + ''
    const qty = Number(i.quantity) || 0
    const pr = Number(i.price) || 0
    return s + (bt === 'recurring' ? qty * pr * period : qty * pr)
  }, 0)
})

const displayServiceSubtotal = computed(() => {
  const q = quotation.value
  if (!q) return 0
  if (q.serviceSubtotal != null && q.serviceSubtotal !== '') return Number(q.serviceSubtotal)
  return (q.quotationServices || []).reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0)
})

const computedSubtotal = computed(() => displayProductSubtotal.value + displayServiceSubtotal.value)

// Service Details: service utama (pertama) dari quotationServices
const primaryService = computed(() => {
  const list = quotation.value?.quotationServices || []
  return list[0] ?? null
})

// Billing type dari product (camelCase atau snake_case)
function getBillingType (item: any): string {
  return (item?.product?.billingType ?? item?.product?.billing_type ?? 'one_time') + ''
}

// Cost Breakdown: OTC (one_time) dan MRC (recurring) dari quotationItems
const otcItems = computed(() => {
  const list = quotation.value?.quotationItems || []
  return list.filter((i: any) => getBillingType(i) !== 'recurring')
})

const mrcItems = computed(() => {
  const productList = quotation.value?.quotationItems || []
  const serviceList = quotation.value?.quotationServices || []
  const productRecurring = productList.filter((i: any) => {
    const bt = getBillingType(i)
    return bt === 'recurring'
  })
  const serviceRecurring = serviceList.filter((s: any) => {
    const bt = (s?.billingType ?? s?.billing_type ?? s?.service?.billing_type ?? s?.service?.billingType ?? '') + ''
    return bt.toLowerCase() === 'recurring'
  })
  // Normalize service entries to match item shape for rendering
  const normalizedServices = serviceRecurring.map((s: any) => ({
    id: s.id,
    service: s.service,
    quantity: s.quantity,
    price: s.price,
    subtotal: s.subtotal,
    description: s.description ?? s.service?.description ?? null,
  }))
  return [...productRecurring, ...normalizedServices]
})

function otcAmount (m: any): number {
  return (Number(m.quantity) || 0) * (Number(m.price) || 0)
}

function mrcMonthly (m: any): number {
  return (Number(m.quantity) || 0) * (Number(m.price) || 0)
}

function mrcTotal (m: any): number {
  return mrcMonthly(m) * mrcPeriod.value
}

const subtotalOtc = computed(() => otcItems.value.reduce((s, i) => s + otcAmount(i), 0))
const subtotalMrc = computed(() => mrcItems.value.reduce((s, i) => s + mrcTotal(i), 0))

const computedDiscount = computed(() => {
  const pct = Number(quotation.value?.discountPercent) || 0
  return computedSubtotal.value * (pct / 100)
})

const computedAfterDiscount = computed(() => computedSubtotal.value - computedDiscount.value)

const computedTax = computed(() => {
  const pct = Number(quotation.value?.taxPercent) || 0
  return computedAfterDiscount.value * (pct / 100)
})

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
  const ok = await quotationStore.approveQuotation(quotation.value.id, result.value || '')
  if (ok) refreshAfterAction()
}

async function onReject () {
  if (!quotation.value) return
  const result = await Swal.fire({
    title: 'Reject Quotation',
    input: 'textarea',
    inputLabel: 'Alasan reject (wajib)',
    inputPlaceholder: 'Tulis alasan reject...',
    inputValidator: (value) => (!value ? 'Alasan reject wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Reject',
    cancelButtonText: 'Batal',
  })
  if (!result.isConfirmed) return
  const ok = await quotationStore.rejectQuotation(quotation.value.id, result.value || '')
  if (ok) refreshAfterAction()
}

function onPrintQuotation () {
  if (!quotation.value?.id) return
  navigateTo({ path: '/sales/cetak-quotation', query: { id: quotation.value.id, print: 'true' } })
}

function handleDelete () {
  if (!quotation.value) return
  quotationStore.deleteQuotation(quotation.value.id)
  navigateTo('/sales/quotation')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
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
