<template>
  <div v-if="loadingDetail" class="text-center p-6">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="4"
      fill="transparent"
      animationDuration="1s"
    />
    <div class="mt-3 text-muted">Memuat data...</div>
  </div>

  <div v-else-if="error" class="alert alert-danger m-6">{{ error.message }}</div>

  <div v-else-if="invoice" class="p-6">
    <div class="d-flex justify-content-between align-items-start mb-6">
      <div class="logo-section">
        <div class="d-flex align-items-center gap-2 mb-3">
          <img
            v-if="invoice.perusahaan?.logoPerusahaan"
            :src="getCompanyLogo(invoice.perusahaan.logoPerusahaan)"
            alt="logo Perusahaan"
            class="cetak-invoice-logo"
            @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
          >
          <img
            v-else
            src="/img/branding/logo.png"
            alt="logo"
            class="cetak-invoice-logo"
          >
        </div>
        <div class="text-start text-secondary-medium" style="font-size: 12px; width: 220px;">
          <p class="mb-2 fw-bold text-heading" style="font-size: 14px;">
            {{ invoice.perusahaan?.nmPerusahaan || '—' }}
          </p>
          <p class="mb-0">Alamat: {{ invoice.perusahaan?.alamatPerusahaan || '—' }}</p>
          <p class="mb-0">Telepon: {{ invoice.perusahaan?.tlpPerusahaan || '—' }}</p>
          <p class="mb-0">Email: {{ invoice.perusahaan?.emailPerusahaan || '—' }}</p>
        </div>
      </div>

      <div class="invoice-header text-end">
        <h2 class="mb-0 text-capitalize fw-bold">INVOICE</h2>
        <p class="mb-2 fw-bold" style="font-size: 12px;">
          <NuxtLink
            :to="`/finance/invoices/detail/${invoice.id}`"
            class="text-decoration-underline"
          >
            {{ invoice.noInvoice }}
          </NuxtLink>
        </p>
        <table style="font-size: 12px; width: auto; margin-left: auto;">
          <tr>
            <td style="text-align: right;">Tanggal</td>
            <td>:</td>
            <td>{{ formatDate(invoice.date) }}</td>
          </tr>
          <tr>
            <td style="text-align: right;">Jatuh Tempo</td>
            <td>:</td>
            <td>{{ formatDate(invoice.dueDate) }}</td>
          </tr>
          <tr v-if="invoice.billingPeriod">
            <td style="text-align: right;">Periode</td>
            <td>:</td>
            <td>{{ invoice.billingPeriod }}</td>
          </tr>
          <tr>
            <td style="text-align: right;">PO Reference</td>
            <td>:</td>
            <td>{{ poReference || '—' }}</td>
          </tr>
        </table>
      </div>
    </div>

    <hr class="my-6" />

    <div class="customer-info-section mb-6">
      <div class="row">
        <div class="col-6">
          <table class="table table-borderless" style="font-size: 12px;">
            <tr>
              <td style="white-space: nowrap; width: 90px;">Customer</td>
              <td style="width: 10px;">:</td>
              <td class="fw-bold">{{ invoice.customer?.name || '—' }}</td>
            </tr>
            <tr>
              <td>NPWP</td>
              <td>:</td>
              <td>{{ invoice.customer?.npwp || '—' }}</td>
            </tr>
            <tr>
              <td>Attention</td>
              <td>:</td>
              <td>{{ invoice.up || '—' }}</td>
            </tr>
            <tr v-if="invoice.subscription?.noSubscription">
              <td>Subscription</td>
              <td>:</td>
              <td>{{ invoice.subscription.noSubscription }}</td>
            </tr>
          </table>
        </div>
        <div class="col-6">
          <table class="table table-borderless" style="font-size: 12px;">
            <tr>
              <td style="white-space: nowrap; width: 80px; vertical-align: top;">Alamat</td>
              <td style="width: 10px; vertical-align: top;">:</td>
              <td style="white-space: pre-line;">{{ invoice.customer?.address || '—' }}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>:</td>
              <td>{{ invoice.email || invoice.customer?.email || '—' }}</td>
            </tr>
            <tr>
              <td>Telepon</td>
              <td>:</td>
              <td>{{ invoice.customer?.phone || '—' }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <div v-if="otcItems.length" class="table-responsive border-bottom-0 rounded mb-4">
      <p class="mb-2 fw-semibold" style="font-size: 12px;">One Time Charge (OTC)</p>
      <table class="table m-0" style="font-size: 12px;">
        <thead class="table-dark">
          <tr>
            <th>No</th>
            <th>SKU</th>
            <th>Produk</th>
            <th>Deskripsi</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in otcItems" :key="'otc-' + (item.id || index)">
            <td>{{ index + 1 }}</td>
            <td>{{ item.product?.sku || '—' }}</td>
            <td>{{ item.product?.name || '—' }}</td>
            <td>{{ cleanInvoiceItemDescription(item) }}</td>
            <td>{{ Number(item.quantity) }}</td>
            <td>{{ formatRupiah(item.price || 0) }}</td>
            <td>{{ formatRupiah(item.subtotal || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mrcItems.length" class="table-responsive border-bottom-0 rounded mb-4">
      <p class="mb-2 fw-semibold" style="font-size: 12px;">Monthly Recurring Charge (MRC)</p>
      <table class="table m-0" style="font-size: 12px;">
        <thead class="table-dark">
          <tr>
            <th>No</th>
            <th>SKU</th>
            <th>Produk</th>
            <th>Deskripsi</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in mrcItems" :key="'mrc-' + (item.id || index)">
            <td>{{ index + 1 }}</td>
            <td>{{ item.product?.sku || '—' }}</td>
            <td>{{ item.product?.name || '—' }}</td>
            <td>{{ cleanInvoiceItemDescription(item) }}</td>
            <td>{{ Number(item.quantity) }}</td>
            <td>{{ formatRupiah(item.price || 0) }}</td>
            <td>{{ formatRupiah(item.subtotal || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="adjustmentItems.length" class="table-responsive border-bottom-0 rounded mb-4">
      <p class="mb-2 fw-semibold" style="font-size: 12px;">Billing Adjustment</p>
      <table class="table m-0" style="font-size: 12px;">
        <thead class="table-dark">
          <tr>
            <th>No</th>
            <th>Tipe</th>
            <th>Deskripsi</th>
            <th>Qty</th>
            <th>Nominal</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in adjustmentItems" :key="'adj-' + (item.id || index)">
            <td>{{ index + 1 }}</td>
            <td>{{ adjustmentTypeLabel(item) }}</td>
            <td>{{ cleanInvoiceItemDescription(item) }}</td>
            <td>{{ Number(item.quantity) }}</td>
            <td>{{ formatRupiah(item.price || 0) }}</td>
            <td>{{ formatRupiah(item.subtotal || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="otherItems.length" class="table-responsive border-bottom-0 rounded mb-4">
      <p class="mb-2 fw-semibold" style="font-size: 12px;">Lainnya</p>
      <table class="table m-0" style="font-size: 12px;">
        <thead class="table-dark">
          <tr>
            <th>No</th>
            <th>SKU</th>
            <th>Produk</th>
            <th>Deskripsi</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in otherItems" :key="'other-' + (item.id || index)">
            <td>{{ index + 1 }}</td>
            <td>{{ item.product?.sku || '—' }}</td>
            <td>{{ item.product?.name || '—' }}</td>
            <td>{{ cleanInvoiceItemDescription(item) }}</td>
            <td>{{ Number(item.quantity) }}</td>
            <td>{{ formatRupiah(item.price || 0) }}</td>
            <td>{{ formatRupiah(item.subtotal || 0) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!otcItems.length && !mrcItems.length && !adjustmentItems.length && !otherItems.length"
      class="table-responsive border-bottom-0 rounded mb-6"
    >
      <table class="table m-0" style="font-size: 12px;">
        <tbody>
          <tr>
            <td class="text-center py-4 text-muted">
              <em>Tidak ada item untuk ditampilkan</em>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-responsive">
      <table class="table mt-2 table-borderless" style="font-size: 12px;">
        <tbody>
          <tr>
            <td class="px-0 pt-6 align-top" style="width: 58%; max-width: 420px;">
              <table class="table m-0 term-conditions-table mb-3">
                <thead class="table-dark">
                  <tr>
                    <th colspan="2" class="text-center">TERM AND CONDITIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(term, index) in termAndConditions" :key="'term-' + index">
                    <td class="term-conditions-no text-center">{{ index + 1 }}</td>
                    <td class="term-conditions-text" v-html="term"></td>
                  </tr>
                </tbody>
              </table>

              <table
                v-if="hasPaymentInstructions"
                class="table m-0 term-conditions-table payment-instructions-table mb-3"
              >
                <thead class="table-dark">
                  <tr>
                    <th class="text-center">PAYMENT INSTRUCTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="payment-instructions-body">
                      <div v-if="paymentCompanyName" class="fw-bold">{{ paymentCompanyName }}</div>
                      <div v-if="paymentBankName" class="fw-bold">{{ paymentBankName }}</div>
                      <div v-if="paymentAccountNumber" class="fw-bold">{{ paymentAccountNumber }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <template v-if="invoice.description">
                <p class="mb-1"><span class="fw-medium text-heading">Catatan:</span></p>
                <p class="mb-0" style="white-space: pre-line; font-size: 11px;">{{ invoice.description }}</p>
              </template>
            </td>
            <td class="px-0 pt-6 align-top">
              <div class="d-flex flex-column align-items-end">
                <div class="mb-2 d-flex justify-content-end" style="min-width: 220px;">
                  <span style="min-width: 110px;">Subtotal</span>
                  <span class="px-2">:</span>
                  <span class="text-end flex-grow-1">{{ formatRupiah(subtotalAmount) }}</span>
                </div>
                <div
                  v-for="(tax, idx) in taxItems"
                  :key="'tax-sum-' + (tax.id || idx)"
                  class="mb-2 d-flex justify-content-end"
                  style="min-width: 220px;"
                >
                  <span style="min-width: 110px;">{{ taxItemSummaryLabel(tax) }}</span>
                  <span class="px-2">:</span>
                  <span
                    class="text-end flex-grow-1"
                    :class="Number(tax.subtotal) < 0 ? 'text-danger' : ''"
                  >
                    {{ formatRupiah(Number(tax.subtotal) || 0) }}
                  </span>
                </div>
                <div class="mb-2 d-flex justify-content-end" style="min-width: 220px;">
                  <span style="min-width: 110px;">DPP</span>
                  <span class="px-2">:</span>
                  <span class="text-end flex-grow-1">{{ formatRupiah(Number(invoice.dpp) || 0) }}</span>
                </div>
                <div
                  v-if="materaiAmount > 0"
                  class="mb-2 d-flex justify-content-end"
                  style="min-width: 220px;"
                >
                  <span style="min-width: 110px;">Materai</span>
                  <span class="px-2">:</span>
                  <span class="text-end flex-grow-1">{{ formatRupiah(materaiAmount) }}</span>
                </div>
                <div class="fw-bold border-top border-dark pt-2 d-flex justify-content-end" style="min-width: 220px;">
                  <span style="min-width: 110px;">Total</span>
                  <span class="px-2">:</span>
                  <span class="text-end flex-grow-1">{{ formatRupiah(Number(invoice.total) || 0) }}</span>
                </div>
              </div>

              <div class="invoice-cetak-signature mt-12">
                <p class="mb-2 text-center">
                  Jakarta,
                  {{ formatDate(invoice.date) }}
                </p>
                <div v-if="showSignatureSection" class="invoice-cetak-signature-body">
                  <MultiSignatureDisplay
                    :key="'sig-' + (invoice.id ?? '')"
                    document-type="sales-invoices"
                    :document-id="invoice.id != null ? String(invoice.id) : ''"
                    :columns="4"
                    :qr-size="96"
                    :compact="true"
                    :show-header="false"
                    :show-approved-by-label="false"
                    :legacy-signature-token="invoice.signatureToken || undefined"
                  />
                </div>
                <div v-else style="height: 80px;"></div>
                <p v-if="!showSignatureSection" class="fw-bold mb-0">Finance</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="alert alert-danger m-6" role="alert">
    Invoice tidak ditemukan.
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
})

import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFinanceInvoiceStore } from '~/stores/finance-invoices'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'
import {
  groupFinanceInvoiceItems,
  adjustmentTypeLabel,
  cleanInvoiceItemDescription,
  taxItemSummaryLabel,
} from '~/utils/financeInvoiceItems'

const route = useRoute()
const store = useFinanceInvoiceStore()
const { selectedInvoice: invoice, loadingDetail, error } = storeToRefs(store)
const formatRupiah = useFormatRupiah()
const { setDetailTitle } = useDynamicTitle()
const { getCompanyLogo, handleImageError } = useImageUrl()

useRegisterCetakDraftStatus(
  () => invoice.value?.documentStatus ?? invoice.value?.document_status
)

const invoiceId = computed(() => String(route.query.id || ''))

const termAndConditions = [
  'Kirim Bukti potong PPH ke email <strong>finance@skylink.net.id</strong>',
  'Layanan akan dimatikan jika belum dilakukan pembayaran setelah jatuh tempo',
  'Dalam hal terdapat kesalahan dalam Invoice dan Faktur Pajak, mitra diberikan waktu 7 (tujuh) hari kalender sejak Invoice diterima untuk mengajukan perubahan pada dokumen-dokumen tersebut. Setelah waktu yang diberikan berakhir, Invoice dan Faktur Pajak dianggap sah dan tidak bisa direvisi.',
]

const paymentCompanyName = computed(() => {
  const p = invoice.value?.perusahaan
  return String(p?.nmPerusahaan || p?.nm_perusahaan || '').trim()
})

const paymentBankName = computed(() => {
  const p = invoice.value?.perusahaan
  return String(p?.namaBankPerusahaan || p?.nama_bank_perusahaan || '').trim()
})

const paymentAccountNumber = computed(() => {
  const p = invoice.value?.perusahaan
  const raw = String(p?.nomorRekeningPerusahaan || p?.nomor_rekening_perusahaan || '')
  // Strip invisible unicode (LTR/RTL marks) yang sering ikut saat copy-paste
  return raw.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '').trim()
})

const hasPaymentInstructions = computed(() => {
  return !!(paymentCompanyName.value || paymentBankName.value || paymentAccountNumber.value)
})

const poReference = computed(() => {
  const sub = invoice.value?.subscription
  if (!sub) return ''
  return sub.poReference || sub.po_reference || ''
})

const materaiAmount = computed(() => {
  if (!invoice.value) return 0
  return Number(invoice.value.materaiAmount ?? invoice.value.materai_amount ?? 0) || 0
})

/** Klasifikasi OTC / MRC / Billing Adjustment / Lainnya. */
const groupedInvoiceItems = computed(() =>
  groupFinanceInvoiceItems(invoice.value?.salesInvoiceItems || [])
)

const otcItems = computed(() => groupedInvoiceItems.value.otc)
const mrcItems = computed(() => groupedInvoiceItems.value.mrc)
const adjustmentItems = computed(() => groupedInvoiceItems.value.adjustment)
const taxItems = computed(() => groupedInvoiceItems.value.tax)
const otherItems = computed(() => groupedInvoiceItems.value.other)

/** QR/TTD digital hanya tampil jika status approval + flag ttdDigital aktif. */
const showSignatureSection = computed(() => {
  if (!invoice.value) return false
  const status = invoice.value.documentStatus
  const statusOk = status === 'approved' || status === 'pending_approval'
  return statusOk && !!invoice.value.ttdDigital
})

/** Subtotal sebelum pajak (item non-tax). */
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

const loadAndMaybePrint = async () => {
  if (!invoiceId.value) return
  await store.fetchInvoiceById(invoiceId.value)
  if (invoice.value?.noInvoice) {
    setDetailTitle(`Cetak Invoice ${invoice.value.noInvoice}`)
  }
  if (route.query.print === 'true' && invoice.value) {
    setTimeout(() => window.print(), 400)
  }
}

watch(invoiceId, loadAndMaybePrint)
onMounted(loadAndMaybePrint)
</script>

<style>
.cetak-invoice-logo {
  display: block;
  height: 60px !important;
  width: auto !important;
  max-width: 220px !important;
  max-height: 60px !important;
  object-fit: contain;
}

.invoice-header {
  flex-shrink: 0;
  min-width: 280px;
}

.invoice-cetak-signature {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
}

.invoice-cetak-signature-body {
  display: flex;
  justify-content: center;
  width: 100%;
}

.invoice-cetak-signature-body .multi-signature-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0;
}

.invoice-cetak-signature-body .signature-grid {
  justify-content: center !important;
  width: 100%;
  margin: 0 auto;
}

.invoice-cetak-signature-body .signature-card {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.invoice-cetak-signature-body .qr-wrapper {
  display: flex;
  justify-content: center;
}

.term-conditions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  line-height: 1.35;
  --bs-table-bg: #4b4b4b;
  --bs-table-color: #fff;
  --bs-table-border-color: #616161;
}

.term-conditions-table thead.table-dark th {
  background-color: #4b4b4b !important;
  color: #fff !important;
  border-color: #616161 !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.term-conditions-table th {
  text-align: center;
  font-weight: 700;
  padding: 6px 8px;
  letter-spacing: 0.02em;
}

.term-conditions-table td {
  border: 1px solid #616161;
  vertical-align: top;
  padding: 6px 8px;
  background: #fff;
  color: #111;
}

.term-conditions-table .term-conditions-no {
  width: 28px;
  font-weight: 700;
  background: #fff !important;
  color: #111 !important;
}

.term-conditions-table .term-conditions-text {
  background: #fff;
  color: #111;
  text-align: left;
}

.payment-instructions-table .payment-instructions-body {
  background: #fff !important;
  color: #111;
  text-align: left;
  padding: 8px 10px;
  line-height: 1.45;
}

@media print {
  .no-print {
    display: none !important;
  }

  .cetak-invoice-logo {
    height: 60px !important;
    max-width: 220px !important;
    max-height: 60px !important;
  }

  .term-conditions-table thead.table-dark th,
  .payment-instructions-table thead.table-dark th,
  .table-dark th {
    background-color: #4b4b4b !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .term-conditions-table .term-conditions-no {
    background: #fff !important;
    color: #111 !important;
  }
}
</style>
