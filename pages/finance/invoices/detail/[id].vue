<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div v-if="loadingDetail" class="text-center p-6">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="4"
          fill="transparent"
          animationDuration="1s"
        />
        <div class="mt-3 text-muted">Memuat detail Invoice...</div>
      </div>

      <template v-else-if="invoice">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div class="d-flex flex-wrap align-items-center gap-3">
            <NuxtLink to="/finance/invoices" class="btn btn-outline-secondary btn-sm">
              <i class="ri-arrow-left-line me-1"></i> Kembali
            </NuxtLink>
            <div>
              <h4 class="mb-0 fw-semibold">{{ invoice.noInvoice }}</h4>
              <small class="text-muted">
                {{ invoice.subscription?.noSubscription
                  ? `Subscription: ${invoice.subscription.noSubscription}`
                  : 'Finance Invoice' }}
                <template v-if="poReference">
                  · PO: {{ poReference }}
                </template>
              </small>
            </div>
            <span :class="getStatusBadgeClass(invoice.status)">{{ getStatusLabel(invoice.status) }}</span>
            <span :class="getDocumentStatusBadge(invoice.documentStatus)">{{ getDocumentStatusLabel(invoice.documentStatus) }}</span>
            <span :class="getSourceBadgeClass(invoice.documentSource)">{{ getSourceLabel(invoice.documentSource) }}</span>
          </div>
        </div>

        <div class="row invoice-preview">
          <div class="col-xl-9 col-md-8 col-12 mb-md-0 mb-6">
            <div class="card invoice-preview-card p-sm-12 p-6">
              <div class="invoice-preview-header rounded-4 pb-4">
                <div class="row gy-4 gx-0 invoice-meta-row">
                  <div class="col-md-6">
                    <div class="invoice-issuer-brand mb-3">
                      <img
                        v-if="invoice.perusahaan?.logoPerusahaan"
                        :src="getCompanyLogo(invoice.perusahaan.logoPerusahaan)"
                        alt="logo perusahaan"
                        class="invoice-issuer-logo"
                        @error="(e) => handleImageError(e, '/img/branding/logo.png')"
                      >
                      <img
                        v-else
                        src="/img/branding/logo.png"
                        alt="logo perusahaan"
                        class="invoice-issuer-logo"
                      >
                      <h5 class="invoice-issuer-name mb-0">
                        {{ invoice.perusahaan?.nmPerusahaan || '—' }}
                      </h5>
                    </div>
                    <p class="mb-1 text-muted">{{ invoice.perusahaan?.alamatPerusahaan || '—' }}</p>
                    <p class="mb-1 text-muted">{{ invoice.perusahaan?.kodePerusahaan || '—' }}</p>
                    <p class="mb-0 text-muted">{{ invoice.perusahaan?.npwpPerusahaan || '—' }}</p>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <h5 class="mb-3">Invoice: {{ invoice.noInvoice }}</h5>
                    <div class="mb-1"><span>Tanggal: </span>{{ formatDate(invoice.date) }}</div>
                    <div class="mb-1"><span>Jatuh Tempo: </span>{{ formatDate(invoice.dueDate) }}</div>
                    <div v-if="invoice.billingPeriod" class="mb-1">
                      <span>Periode: </span>{{ invoice.billingPeriod }}
                    </div>
                    <div class="mb-1">
                      <span>PO Reference: </span>{{ poReference || '—' }}
                    </div>
                    <div v-if="invoice.sentAt" class="mb-0 text-success">
                      <i class="ri-mail-check-line me-1"></i>
                      Terkirim: {{ formatDate(invoice.sentAt) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-2 pb-6">
                <div class="row gy-4 gx-0 invoice-meta-row">
                  <div class="col-md-6">
                    <h6>Invoice To:</h6>
                    <p class="mb-1">{{ invoice.up || '—' }}</p>
                    <p class="mb-1 fw-bold">{{ invoice.customer?.name || '—' }}</p>
                    <p class="mb-1">{{ invoice.customer?.address || '—' }}</p>
                    <p class="mb-1">{{ invoice.customer?.phone || '—' }}</p>
                    <p class="mb-1">{{ invoice.email || invoice.customer?.email || '—' }}</p>
                    <p class="mb-0">
                      <span class="text-muted">PO Reference:</span>
                      {{ poReference || '—' }}
                    </p>
                  </div>
                  <div class="col-md-6 text-md-end">
                    <h6>Bill To:</h6>
                    <p class="mb-1">{{ invoice.perusahaan?.nmPerusahaan || '—' }}</p>
                    <p class="mb-1">{{ invoice.perusahaan?.alamatPerusahaan || '—' }}</p>
                    <p class="mb-0">{{ invoice.perusahaan?.emailPerusahaan || '—' }}</p>
                  </div>
                </div>
              </div>

              <div v-if="otcItems.length" class="table-responsive border rounded-4 border-bottom-0 mb-3">
                <div class="px-3 pt-3 pb-1 fw-semibold small text-heading">One Time Charge (OTC)</div>
                <table class="table m-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in otcItems" :key="'otc-' + item.id">
                      <td class="text-heading">{{ item.product?.name || '—' }}</td>
                      <td>{{ cleanInvoiceItemDescription(item) }}</td>
                      <td>{{ formatRupiah(item.price) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatRupiah(item.subtotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="mrcItems.length" class="table-responsive border rounded-4 border-bottom-0 mb-3">
                <div class="px-3 pt-3 pb-1 fw-semibold small text-heading">Monthly Recurring Charge (MRC)</div>
                <table class="table m-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in mrcItems" :key="'mrc-' + item.id">
                      <td class="text-heading">{{ item.product?.name || '—' }}</td>
                      <td>{{ cleanInvoiceItemDescription(item) }}</td>
                      <td>{{ formatRupiah(item.price) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatRupiah(item.subtotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="adjustmentItems.length" class="table-responsive border rounded-4 border-bottom-0 mb-3">
                <div class="px-3 pt-3 pb-1 fw-semibold small text-heading">Billing Adjustment</div>
                <table class="table m-0">
                  <thead>
                    <tr>
                      <th>Tipe</th>
                      <th>Description</th>
                      <th>Nominal</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in adjustmentItems" :key="'adj-' + item.id">
                      <td class="text-heading">{{ adjustmentTypeLabel(item) }}</td>
                      <td>{{ cleanInvoiceItemDescription(item) }}</td>
                      <td>{{ formatRupiah(item.price) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatRupiah(item.subtotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="otherItems.length" class="table-responsive border rounded-4 border-bottom-0 mb-3">
                <div class="px-3 pt-3 pb-1 fw-semibold small text-heading">Lainnya</div>
                <table class="table m-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in otherItems" :key="'other-' + item.id">
                      <td class="text-heading">{{ item.product?.name || '—' }}</td>
                      <td>{{ cleanInvoiceItemDescription(item) }}</td>
                      <td>{{ formatRupiah(item.price) }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatRupiah(item.subtotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                v-if="!otcItems.length && !mrcItems.length && !adjustmentItems.length && !otherItems.length"
                class="table-responsive border rounded-4 border-bottom-0"
              >
                <table class="table m-0">
                  <tbody>
                    <tr>
                      <td colspan="5" class="text-center text-muted py-4">Tidak ada item</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="table-responsive">
                <table class="table m-0 table-borderless">
                  <tbody>
                    <tr>
                      <td class="align-top px-0 py-6">
                        <p class="mb-1">
                          <span class="me-2 fw-medium text-heading">Description:</span><br>
                          <span>{{ invoice.description || '—' }}</span>
                        </p>
                      </td>
                      <td class="pe-0 py-6 align-top" style="min-width: 170px;">
                        <div class="d-flex flex-column align-items-end gap-1">
                          <div class="d-flex w-100 justify-content-between">
                            <span>Subtotal</span><span>:</span>
                          </div>
                          <div
                            v-for="(tax, idx) in taxItems"
                            :key="'tax-sum-' + (tax.id || idx)"
                            class="d-flex w-100 justify-content-between"
                          >
                            <span>{{ taxItemSummaryLabel(tax) }}</span><span>:</span>
                          </div>
                          <div v-if="materaiAmount > 0" class="d-flex w-100 justify-content-between">
                            <span>Materai</span><span>:</span>
                          </div>
                          <div class="d-flex w-100 justify-content-between">
                            <span>Total</span><span>:</span>
                          </div>
                          <div class="d-flex w-100 justify-content-between">
                            <span>Paid</span><span>:</span>
                          </div>
                          <div class="d-flex w-100 justify-content-between pt-2">
                            <span>Remaining</span><span>:</span>
                          </div>
                        </div>
                      </td>
                      <td class="text-end px-0 py-6 align-top" style="min-width: 150px;">
                        <div class="d-flex flex-column gap-1 align-items-end">
                          <span>{{ formatRupiah(subtotalAmount) }}</span>
                          <span
                            v-for="(tax, idx) in taxItems"
                            :key="'tax-amt-' + (tax.id || idx)"
                            :class="Number(tax.subtotal) < 0 ? 'text-danger' : ''"
                          >
                            {{ formatRupiah(Number(tax.subtotal) || 0) }}
                          </span>
                          <span v-if="materaiAmount > 0">{{ formatRupiah(materaiAmount) }}</span>
                          <span class="fw-semibold">{{ formatRupiah(invoice.total) }}</span>
                          <span class="text-success">{{ formatRupiah(invoice.paidAmount) }}</span>
                          <span
                            class="fw-semibold pt-2"
                            :class="invoice.remainingAmount > 0 ? 'text-danger' : 'text-success'"
                          >
                            {{ formatRupiah(invoice.remainingAmount) }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="showSignatureSection" class="pt-4 px-0">
                <MultiSignatureDisplay
                  :key="'sig-' + (invoice.id ?? '')"
                  document-type="sales-invoices"
                  :document-id="invoice.id != null ? String(invoice.id) : ''"
                  :columns="4"
                  :qr-size="96"
                  :compact="true"
                  :show-approved-by-label="false"
                  :legacy-signature-token="invoice.signatureToken || undefined"
                />
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-4 col-12 invoice-actions">
            <div class="card mb-4">
              <div class="card-body d-grid gap-3">
                <button
                  v-if="canSubmit"
                  class="btn btn-primary d-grid w-100"
                  :disabled="submitting"
                  @click="onSubmit"
                >
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-send-plane-line ri-16px me-2"></i>
                    {{ invoice.documentStatus === 'rejected' ? 'Submit Revisi' : 'Submit Approval' }}
                  </span>
                </button>

                <button
                  v-if="canApprove"
                  class="btn btn-success d-grid w-100"
                  :disabled="submitting"
                  @click="onApprove"
                >
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-check-line ri-16px me-2"></i>Approve
                  </span>
                </button>

                <button
                  v-if="canReject"
                  class="btn btn-outline-danger d-grid w-100"
                  :disabled="submitting"
                  @click="onReject"
                >
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-close-line ri-16px me-2"></i>Reject
                  </span>
                </button>

                <button class="btn btn-outline-primary d-grid w-100" @click="printInvoice">
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-printer-line ri-16px me-2"></i>Cetak Invoice
                  </span>
                </button>

                <button
                  v-if="userHasRole('superadmin') || userHasPermission('edit_invoice')"
                  class="btn btn-outline-primary d-grid w-100"
                  :disabled="store.sending"
                  @click="sendInvoice"
                >
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-mail-send-line ri-16px me-2"></i>
                    {{ store.sending ? 'Mengirim...' : 'Send' }}
                  </span>
                </button>

                <button
                  v-if="userHasRole('superadmin') || userHasPermission('edit_invoice')"
                  class="btn btn-outline-secondary d-grid w-100"
                  :disabled="invoice.status === 'paid' || invoice.documentStatus === 'pending_approval'"
                  @click="openEditDialog"
                >
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-pencil-line ri-16px me-2"></i>Edit
                  </span>
                </button>

                <button
                  v-if="(userHasRole('superadmin') || userHasPermission('create_ar_receipt')) && invoice.status !== 'paid'"
                  class="btn btn-outline-success d-grid w-100"
                  @click="goToArReceipt"
                >
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-money-dollar-circle-line ri-16px me-2"></i>Buat Tanda Terima
                  </span>
                </button>

                <button
                  v-if="(userHasRole('superadmin') || userHasPermission('delete_invoice')) && invoice.status === 'unpaid'"
                  class="btn btn-outline-danger d-grid w-100"
                  @click="deleteInvoice"
                >
                  <span class="d-flex align-items-center justify-content-center text-nowrap">
                    <i class="ri-delete-bin-line ri-16px me-2"></i>Hapus
                  </span>
                </button>
              </div>
            </div>

            <ApprovalCard
              :status-text="getDocumentStatusLabel(invoice.documentStatus)"
              :current-step="invoice.currentApprovalStep ?? invoice.nextApprovalStep"
              :current-approvers="invoice.currentApprovers"
              :approval-logs="invoice.approvalLogs || []"
            />

            <div class="card">
              <div class="card-body">
                <h6 class="mb-3">Ringkasan</h6>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Sumber</span>
                  <span>{{ getSourceLabel(invoice.documentSource) }}</span>
                </div>
                <div
                  v-if="poReference"
                  class="d-flex justify-content-between mb-2"
                >
                  <span class="text-muted">PO Reference</span>
                  <span>{{ poReference }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Dokumen</span>
                  <span>{{ getDocumentStatusLabel(invoice.documentStatus) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">DPP</span>
                  <span>{{ formatRupiah(invoice.dpp) }}</span>
                </div>
                <div v-if="materaiAmount > 0" class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Materai</span>
                  <span>{{ formatRupiah(materaiAmount) }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Nominal</span>
                  <span class="fw-semibold">{{ formatRupiah(invoice.total) }}</span>
                </div>
                <p class="text-muted small mt-3 mb-0">
                  <i class="ri-lock-line me-1"></i>Nominal terkunci dan tidak dapat diedit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="error" class="text-center p-6">
        <div class="alert alert-danger" role="alert">
          <h5 class="alert-heading">Terjadi Kesalahan</h5>
          <p>{{ error.message || 'Gagal memuat detail Invoice.' }}</p>
          <hr>
          <NuxtLink to="/finance/invoices" class="btn btn-outline-secondary">
            <i class="ri-arrow-left-line me-2"></i>Kembali
          </NuxtLink>
        </div>
      </div>

      <div v-else class="text-center p-6">
        <div class="alert alert-warning" role="alert">
          <h5 class="alert-heading">Invoice Tidak Ditemukan</h5>
          <p>Invoice yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <hr>
          <NuxtLink to="/finance/invoices" class="btn btn-outline-secondary">
            <i class="ri-arrow-left-line me-2"></i>Kembali
          </NuxtLink>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="editDialogVisible"
      modal
      header="Edit Invoice"
      :style="{ width: '520px' }"
      :closable="!store.saving"
    >
      <div v-if="editForm" class="d-flex flex-column gap-3">
        <div class="alert alert-info py-2 mb-0 small">
          <i class="ri-lock-line me-1"></i>
          Nominal terkunci:
          <strong class="ms-1">{{ formatRupiah(editForm.total) }}</strong>
        </div>
        <div>
          <label class="form-label">UP / Attention</label>
          <input v-model="editForm.up" type="text" class="form-control" :disabled="store.saving">
        </div>
        <div>
          <label class="form-label">Email</label>
          <input v-model="editForm.email" type="email" class="form-control" :disabled="store.saving">
        </div>
        <div class="row g-3">
          <div class="col-6">
            <label class="form-label">Tanggal</label>
            <input v-model="editForm.date" type="date" class="form-control" :disabled="store.saving">
          </div>
          <div class="col-6">
            <label class="form-label">Jatuh Tempo</label>
            <input v-model="editForm.dueDate" type="date" class="form-control" :disabled="store.saving">
          </div>
        </div>
        <div>
          <label class="form-label">Deskripsi / Catatan</label>
          <textarea v-model="editForm.description" class="form-control" rows="3" :disabled="store.saving"></textarea>
        </div>
        <div class="form-check">
          <input
            id="detailEditTtd"
            v-model="editForm.ttdDigital"
            class="form-check-input"
            type="checkbox"
            :disabled="store.saving"
          >
          <label class="form-check-label" for="detailEditTtd">Tanda Tangan Digital</label>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline-secondary" :disabled="store.saving" @click="editDialogVisible = false">
          Batal
        </button>
        <button class="btn btn-primary" :disabled="store.saving" @click="submitEdit">
          <span v-if="store.saving" class="spinner-border spinner-border-sm me-1"></span>
          Simpan
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Dialog from 'primevue/dialog'
import Swal from 'sweetalert2'
import { useFinanceInvoiceStore } from '~/stores/finance-invoices'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import { useUserStore } from '~/stores/user'
import ApprovalCard from '~/components/ApprovalCard.vue'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'
import {
  groupFinanceInvoiceItems,
  adjustmentTypeLabel,
  cleanInvoiceItemDescription,
  taxItemSummaryLabel,
} from '~/utils/financeInvoiceItems'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail Finance Invoice',
})

const route = useRoute()
const router = useRouter()
const store = useFinanceInvoiceStore()
const { selectedInvoice: invoice, loadingDetail, error } = storeToRefs(store)
const { userHasRole, userHasPermission } = usePermissions()
const formatRupiah = useFormatRupiah()
const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()
const userStore = useUserStore()

const editDialogVisible = ref(false)
const editForm = ref(null)
const submitting = ref(false)

const invoiceId = computed(() => String(route.params.id || ''))
const currentUserId = computed(() => userStore.user?.id ?? null)

const poReference = computed(() => {
  const sub = invoice.value?.subscription
  if (!sub) return ''
  return sub.poReference || sub.po_reference || ''
})

const materaiAmount = computed(() => {
  if (!invoice.value) return 0
  return Number(invoice.value.materaiAmount ?? invoice.value.materai_amount ?? 0) || 0
})

const canSubmit = computed(() => {
  if (!invoice.value) return false
  if (!(userHasRole('superadmin') || userHasPermission('edit_invoice'))) return false
  return invoice.value.documentStatus === 'draft' || invoice.value.documentStatus === 'rejected'
})

const canApprove = computed(() => {
  if (!invoice.value || currentUserId.value == null) return false
  if (!(userHasRole('superadmin') || userHasPermission('approve_invoice'))) return false
  if (invoice.value.documentStatus !== 'pending_approval') return false
  if (userHasRole('superadmin')) return true
  const approvers = invoice.value.currentApprovers || []
  const uid = currentUserId.value
  return approvers.length === 0 || approvers.some((a) => Number(a.userId) === Number(uid))
})

const canReject = computed(() => {
  if (!invoice.value || currentUserId.value == null) return false
  if (!(userHasRole('superadmin') || userHasPermission('reject_invoice'))) return false
  if (invoice.value.documentStatus !== 'pending_approval') return false
  if (userHasRole('superadmin')) return true
  const approvers = invoice.value.currentApprovers || []
  const uid = currentUserId.value
  return approvers.length === 0 || approvers.some((a) => Number(a.userId) === Number(uid))
})

const showSignatureSection = computed(() => {
  if (!invoice.value) return false
  const status = invoice.value.documentStatus
  const statusOk = status === 'approved' || status === 'pending_approval'
  return statusOk && !!invoice.value.ttdDigital
})

const groupedInvoiceItems = computed(() =>
  groupFinanceInvoiceItems(invoice.value?.salesInvoiceItems || [])
)
const otcItems = computed(() => groupedInvoiceItems.value.otc)
const mrcItems = computed(() => groupedInvoiceItems.value.mrc)
const adjustmentItems = computed(() => groupedInvoiceItems.value.adjustment)
const taxItems = computed(() => groupedInvoiceItems.value.tax)
const otherItems = computed(() => groupedInvoiceItems.value.other)

/** Subtotal sebelum pajak. */
const subtotalAmount = computed(() => {
  const groups = groupedInvoiceItems.value
  const lines = [
    ...(groups.otc || []),
    ...(groups.mrc || []),
    ...(groups.adjustment || []),
    ...(groups.other || []),
  ]
  return lines.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
})

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const raw = String(dateStr)
    // Prefer tanggal kalender (YYYY-MM-DD) agar tidak geser karena timezone
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[3]}-${m[2]}-${m[1]}`

    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  } catch {
    return dateStr
  }
}

const toDateInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toISOString().slice(0, 10)
}

const getStatusBadgeClass = (status) => {
  const map = {
    unpaid: 'badge bg-label-danger',
    partial: 'badge bg-label-warning',
    paid: 'badge bg-label-success',
  }
  return map[status] ?? 'badge bg-label-secondary'
}

const getStatusLabel = (status) => {
  const map = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Lunas' }
  return map[status] ?? status
}

const getSourceBadgeClass = (source) => {
  const map = {
    cron_monthly: 'badge bg-label-info',
    subscription_signed: 'badge bg-label-primary',
    billing_prep: 'badge bg-label-success',
    manual: 'badge bg-label-secondary',
  }
  return map[source] ?? 'badge bg-label-secondary'
}

const getSourceLabel = (source) => {
  const map = {
    cron_monthly: 'Bulanan (Legacy)',
    subscription_signed: 'Berlangganan',
    billing_prep: 'Billing Preparation',
    manual: 'Manual',
  }
  return map[source] ?? source
}

const getDocumentStatusBadge = (status) => {
  const map = {
    draft: 'badge bg-label-secondary',
    pending_approval: 'badge bg-label-warning',
    approved: 'badge bg-label-success',
    rejected: 'badge bg-label-danger',
  }
  return map[status] ?? 'badge bg-label-secondary'
}

const getDocumentStatusLabel = (status) => {
  const map = {
    draft: 'Draft',
    pending_approval: 'Menunggu Approval',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return map[status] ?? status
}

const loadInvoice = async () => {
  if (!invoiceId.value) return
  await store.fetchInvoiceById(invoiceId.value)
  if (invoice.value?.noInvoice) {
    setDetailTitle(`Invoice ${invoice.value.noInvoice}`)
  }
}

const refreshAfterAction = () => {
  setTimeout(() => loadInvoice(), 400)
}

const onSubmit = async () => {
  if (!invoice.value) return
  submitting.value = true
  try {
    const ok = await store.submitInvoice(invoice.value.id)
    if (ok) refreshAfterAction()
  } finally {
    submitting.value = false
  }
}

const onApprove = async () => {
  if (!invoice.value) return
  const { promptFinanceInvoiceApprove } = await import('~/composables/useFinanceInvoiceApproveDialog')
  const choice = await promptFinanceInvoiceApprove({
    ttdDigital: invoice.value.ttdDigital !== false,
  })
  if (!choice) return
  submitting.value = true
  try {
    const ok = await store.approveInvoice(
      invoice.value.id,
      choice.remarks,
      true,
      choice.ttdDigital
    )
    if (ok) refreshAfterAction()
  } finally {
    submitting.value = false
  }
}

const onReject = async () => {
  if (!invoice.value) return
  const result = await Swal.fire({
    title: 'Reject Invoice',
    input: 'textarea',
    inputLabel: 'Alasan penolakan',
    inputPlaceholder: 'Tulis alasan reject...',
    inputValidator: (value) => (!value ? 'Alasan wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Reject',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#f13636',
  })
  if (!result.isConfirmed) return
  submitting.value = true
  try {
    const ok = await store.rejectInvoice(invoice.value.id, result.value || '', true)
    if (ok) refreshAfterAction()
  } finally {
    submitting.value = false
  }
}

const printInvoice = () => {
  router.push({
    path: '/finance/cetak-invoice',
    query: { id: invoiceId.value, print: 'true' },
  })
}

const sendInvoice = async () => {
  await store.sendInvoice(invoiceId.value)
}

const openEditDialog = () => {
  if (!invoice.value) return
  editForm.value = {
    up: invoice.value.up || '',
    email: invoice.value.email || '',
    date: toDateInput(invoice.value.date),
    dueDate: toDateInput(invoice.value.dueDate),
    description: invoice.value.description || '',
    ttdDigital: !!invoice.value.ttdDigital,
    total: invoice.value.total,
  }
  editDialogVisible.value = true
}

const submitEdit = async () => {
  if (!editForm.value) return
  try {
    await store.updateInvoice(invoiceId.value, {
      up: editForm.value.up,
      email: editForm.value.email,
      date: editForm.value.date,
      dueDate: editForm.value.dueDate,
      description: editForm.value.description,
      ttdDigital: editForm.value.ttdDigital,
    })
    editDialogVisible.value = false
  } catch {
    // toast via store
  }
}

const goToArReceipt = () => {
  router.push({
    path: '/finance/ar-receipts',
    query: {
      invoiceId: invoiceId.value,
      customerId: invoice.value?.customerId,
    },
  })
}

const deleteInvoice = async () => {
  const ok = await store.deleteInvoice(invoiceId.value)
  if (ok) router.push('/finance/invoices')
}

watch(invoiceId, loadInvoice)
onMounted(loadInvoice)
</script>

<style scoped>
.invoice-meta-row > [class*='col-'] {
  min-width: 0;
}

.invoice-issuer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.invoice-issuer-logo {
  display: block;
  height: 72px;
  width: auto;
  max-width: 220px;
  object-fit: contain;
}

.invoice-issuer-name {
  font-weight: 700;
  color: #566a7f;
  line-height: 1.3;
}
</style>
