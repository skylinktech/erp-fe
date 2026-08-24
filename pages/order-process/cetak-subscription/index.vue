<template>
  <CetakDocument
    type="SUBSCRIPTION"
    :document-number="documentNumber"
    :status="subscription?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !subscription"
    :auto-print="autoPrint"
    :header-meta="headerMeta"
    show-number-under-title
  >
    <template v-if="subscription">
      <!-- INFORMASI PELANGGAN -->
      <CetakTable>
        <template #head>
          <tr>
            <th colspan="2" class="text-start">INFORMASI PELANGGAN / SUBSCRIBER INFORMATION</th>
          </tr>
        </template>
        <tr>
          <td class="text-start cetak-sub-label">Jenis Pendaftaran / Subscription Status*</td>
          <td class="text-start">
            <span class="cetak-check">{{ schemeIsBuy ? '☑' : '☐' }} Beli / Buy</span>
            <span class="cetak-check">{{ schemeIsLease ? '☑' : '☐' }} Sewa / Lease</span>
            <span class="cetak-check">{{ schemeIsOnDemand ? '☑' : '☐' }} On Demand</span>
            <span v-if="businessSchemeLabel !== '—'" class="text-muted ms-2">({{ businessSchemeLabel }})</span>
          </td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Nama Perusahaan / Company Name*</td>
          <td class="cetak-desc">{{ customerName }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Penanggung Jawab / Authorized Person*</td>
          <td class="cetak-desc">{{ billingContact?.name || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Jabatan / Title*</td>
          <td class="cetak-desc">{{ billingContact?.department || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Email / Email Address*</td>
          <td class="cetak-desc">{{ billingEmails || customerEmail || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Telepon / Phone*</td>
          <td class="cetak-desc">{{ billingContact?.phone || customerPhone || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">NPWP / Tax ID*</td>
          <td class="cetak-desc">{{ customerNpwp || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Nomor Fax / Fax Number*</td>
          <td class="cetak-desc">—</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Alamat Perusahaan / Company Address*</td>
          <td class="cetak-desc">{{ customerAddress || '—' }}</td>
        </tr>
      </CetakTable>

      <!-- DOKUMEN PENDUKUNG -->
      <CetakTable>
        <template #head>
          <tr>
            <th colspan="2" class="text-start">Dokumen Pendukung / SUPPORTING DOCUMENT</th>
          </tr>
        </template>
        <tr>
          <td colspan="2" class="text-start">
            <div class="cetak-check-grid">
              <span>☐ Akta Pendirian &amp; SK</span>
              <span>☐ Akta Perubahan Direksi Terakhir &amp; SK</span>
              <span>☐ NPWP Perusahaan</span>
              <span>☐ NIB Perusahaan</span>
              <span>☐ KTP Direktur Utama &amp; Direktur</span>
              <span>☐ Surat Kuasa Direksi (Jika dikuasakan)</span>
              <span>☐ KTP Penerima Kuasa</span>
            </div>
          </td>
        </tr>
      </CetakTable>

      <!-- INFO LAYANAN -->
      <CetakTable>
        <template #head>
          <tr>
            <th colspan="2" class="text-start">INFO LAYANAN / SERVICE INFO</th>
          </tr>
        </template>
        <tr>
          <td class="text-start cetak-sub-label">Jenis Unit / <em>Unit Type</em>*</td>
          <td class="text-start">
            <div class="cetak-check-grid">
              <span v-for="opt in unitTypeOptions" :key="opt" class="cetak-check">
                {{ isChecked(selectedUnitTypes, opt) ? '☑' : '☐' }} {{ opt }}
              </span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Paket Service / <em>Service Plan</em>*</td>
          <td class="text-start">
            <span class="cetak-check">{{ isChecked(selectedPlans, 'Local Priority') ? '☑' : '☐' }} Local Priority</span>
            <span class="cetak-check">{{ isChecked(selectedPlans, 'Global Priority') ? '☑' : '☐' }} Global Priority</span>
            <span class="cetak-check">
              {{ otherPlanLabel ? '☑' : '☐' }} Others :
              <strong v-if="otherPlanLabel">{{ otherPlanLabel }}</strong>
            </span>
          </td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Kuota Data / <em>Quota Data</em>*</td>
          <td class="text-start">
            <span v-for="opt in quotaOptions" :key="opt" class="cetak-check">
              {{ isChecked(selectedQuotas, opt) ? '☑' : '☐' }} {{ opt }}
            </span>
          </td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Data Pool</td>
          <td class="cetak-desc">{{ dataPoolLabel || ':' }}</td>
        </tr>
      </CetakTable>

      <CetakTable table-class="cetak-sub-items-table">
        <template #head>
          <tr>
            <th class="text-center cetak-sub-col-no">No.</th>
            <th class="text-start cetak-sub-col-unit">Jenis Unit<br><em>Unit Type</em></th>
            <th class="text-center cetak-sub-col-qty">Jumlah Unit<br><em>Unit Total</em></th>
            <th class="text-start cetak-sub-col-plan">Paket Service<br><em>Service Plan</em></th>
            <th class="text-end cetak-sub-col-money">Bulan / Month<br>(Rp)</th>
            <th class="text-end cetak-sub-col-money">Tahun / Year<br>(Rp)</th>
          </tr>
        </template>
        <tr v-for="(svc, idx) in serviceRows" :key="svc.id || 'svc-' + idx">
          <td class="text-center">{{ idx + 1 }}.</td>
          <td class="cetak-desc">{{ idx < services.length ? serviceName(svc) : '' }}</td>
          <td class="text-center">{{ idx < services.length ? (Number(svc.quantity) || 0) : '' }}</td>
          <td class="cetak-desc">{{ idx < services.length ? (servicePlanLabel(svc) || '—') : '' }}</td>
          <td class="cetak-num">{{ idx < services.length ? formatRupiahNum(unitMrc(svc)) : '' }}</td>
          <td class="cetak-num">{{ idx < services.length ? formatRupiahNum(yearlyMrc(svc)) : '' }}</td>
        </tr>
        <template #foot>
          <tr v-if="services.length" class="cetak-table__total">
            <td colspan="5" class="text-end">Total MRC</td>
            <td class="cetak-num">{{ formatRupiahNum(totalMrcContract) }}</td>
          </tr>
        </template>
      </CetakTable>

      <!-- SYARAT DAN KETENTUAN PEMBAYARAN -->
      <CetakTable>
        <template #head>
          <tr>
            <th colspan="2" class="text-start">SYARAT DAN KETENTUAN PEMBAYARAN / PAYMENT TERMS &amp; CONDITIONS</th>
          </tr>
        </template>
        <tr>
          <td class="text-start cetak-sub-label">One Time Charge (OTC)*</td>
          <td class="text-start">
            <div>Pengiriman / Delivery Fee : Rp —</div>
            <div>Instalasi &amp; Dismantle : Rp —</div>
            <div><strong>Total OTC : Rp {{ formatRupiahNum(totalOtc) }}</strong></div>
          </td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Monthly Recurring Cost (MRC)*</td>
          <td class="text-start">
            <div>Bulanan / Monthly : Rp {{ formatRupiahNum(totalMrcMonthly) }}</div>
            <div>Tahunan / Yearly : Rp {{ formatRupiahNum(totalMrcMonthly * 12) }}</div>
            <div><strong>Total MRC : Rp {{ formatRupiahNum(totalMrcContract) }}</strong></div>
          </td>
        </tr>
      </CetakTable>

      <p class="cetak-sub-accept mb-4">
        Dengan ini Pelanggan menerima dan menyetujui paket serta harga layanan yang tertera di atas /
        Subscriber hereby accept and agreed all the product package and prices listed above.
      </p>

      <!-- PERIODE KONTRAK -->
      <CetakTable>
        <template #head>
          <tr>
            <th class="text-start">PERIODE KONTRAK LAYANAN / SERVICE CONTRACT PERIOD</th>
          </tr>
        </template>
        <tr>
          <td class="text-start">
            <div class="fw-medium">
              {{ contractPeriodLabel }}
              <template v-if="contractStartLabel !== '—' || contractEndLabel !== '—'">
                / {{ contractStartLabel }} s.d {{ contractEndLabel }}
              </template>
            </div>
            <div class="text-muted mt-1">(bulan/tahun – month/year)</div>
            <div class="mt-2">
              Minimum masa kontrak adalah 12 (dua belas) bulan.<br>
              Minimum contract period is 12 (twelve) months.
            </div>
          </td>
        </tr>
      </CetakTable>

      <!-- ALAMAT PENGIRIMAN & PEMASANGAN -->
      <CetakTable>
        <template #head>
          <tr>
            <th colspan="2" class="text-start">ALAMAT PENGIRIMAN &amp; PEMASANGAN / DELIVERY &amp; INSTALLATION ADDRESS</th>
          </tr>
        </template>
        <tr>
          <td colspan="2" class="text-start text-muted" style="font-size: 11px;">
            Jika alamat pengiriman/instalasi lebih dari satu lokasi, mohon lampirkan rincian alamat masing-masing lokasi.
            If the delivery/installation involves more than one location, please attach the details of each location.
          </td>
        </tr>
        <tr v-for="(inst, idx) in installations" :key="inst.id || 'inst-' + idx">
          <td class="text-start cetak-sub-label" style="width: 28%;">Lokasi {{ idx + 1 }}</td>
          <td class="cetak-desc">
            {{ formatInstallation(inst) }}
          </td>
        </tr>
        <tr v-if="!installations.length">
          <td class="text-start cetak-sub-label" style="width: 28%;">Alamat</td>
          <td class="cetak-desc">{{ customerAddress || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Target RFS*</td>
          <td class="cetak-desc">{{ targetRfsLabel }}</td>
        </tr>
      </CetakTable>

      <!-- INFO PENAGIHAN -->
      <CetakTable>
        <template #head>
          <tr>
            <th colspan="2" class="text-start">INFO PENAGIHAN / BILLING INFO</th>
          </tr>
        </template>
        <tr>
          <td class="text-start cetak-sub-label">Penanggungjawab / Authorized Person</td>
          <td class="cetak-desc">{{ billingContact?.name || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Jabatan / Title</td>
          <td class="cetak-desc">{{ billingContact?.department || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Alamat e-mail / e-mail Address</td>
          <td class="cetak-desc">{{ billingContact?.email || customerEmail || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Alamat Penagihan / Billing Address</td>
          <td class="cetak-desc">{{ customerAddress || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Term of Payment</td>
          <td class="cetak-desc">{{ termOfPayment || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Payment Method</td>
          <td class="cetak-desc">{{ paymentMethod || '—' }}</td>
        </tr>
      </CetakTable>

      <!-- KONTAK TEKNIS & KEUANGAN -->
      <CetakTable table-class="cetak-sub-contacts-table">
        <template #head>
          <tr>
            <th colspan="4" class="text-start">KONTAK TEKNIS &amp; KEUANGAN / TECHNICAL &amp; FINANCE CONTACT</th>
          </tr>
          <tr>
            <th class="text-start cetak-sub-col-role">Peran / Role</th>
            <th class="text-start cetak-sub-col-name">Nama Penanggung Jawab / Contact Person</th>
            <th class="text-start cetak-sub-col-phone">Nomor Seluler / Mobile Number</th>
            <th class="text-start cetak-sub-col-email">Email / Email Address</th>
          </tr>
        </template>
        <tr>
          <td class="text-start">Teknis / Technical</td>
          <td class="cetak-desc">{{ technicalContact?.name || '—' }}</td>
          <td>{{ technicalContact?.phone || '—' }}</td>
          <td>{{ technicalContact?.email || '—' }}</td>
        </tr>
        <tr>
          <td class="text-start">Keuangan / Finance</td>
          <td class="cetak-desc">{{ billingContact?.name || '—' }}</td>
          <td>{{ billingContact?.phone || '—' }}</td>
          <td>{{ billingContact?.email || '—' }}</td>
        </tr>
      </CetakTable>

      <!-- INFO KORESPONDENSI -->
      <div class="cetak-sub-section-title">INFO KORESPONDENSI / CORRESPONDENCES INFO*</div>
      <div class="row g-0 mb-4 cetak-sub-correspondence">
        <div class="col-6 pe-2">
          <table class="table table-bordered m-0" style="font-size: 11px;">
            <tbody>
              <tr>
                <td>
                  <div class="text-muted">Nama perusahaan / Subscriber Name</div>
                  <div class="fw-medium">{{ customerName }}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="text-muted">Alamat / Address</div>
                  <div>{{ customerAddress || '—' }}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="text-muted">Nomor Telepon / Phone Number</div>
                  <div>{{ billingContact?.phone || customerPhone || '—' }}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="text-muted">Alamat e-mail / e-mail Address</div>
                  <div>{{ billingEmails || customerEmail || '—' }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-6 ps-2">
          <table class="table table-bordered m-0" style="font-size: 11px;">
            <tbody>
              <tr>
                <td>
                  <div class="text-muted">Nama perusahaan / Subscriber Name</div>
                  <div class="fw-medium">{{ companyName }}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="text-muted">Alamat / Address</div>
                  <div>{{ companyAddress || '—' }}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="text-muted">Nomor Telepon / Phone Number</div>
                  <div>{{ companyPhone || '—' }}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="text-muted">Alamat e-mail / e-mail Address</div>
                  <div>{{ companyEmail || '—' }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- KETENTUAN PEMBAYARAN 1–9 -->
      <CetakNotes title="Ketentuan Pembayaran / Payment Terms" :html="paymentTermsHtml" />

      <!-- CATATAN KHUSUS -->
      <CetakTable>
        <template #head>
          <tr>
            <th colspan="2" class="text-start">Catatan Khusus / Special notes</th>
          </tr>
        </template>
        <tr>
          <td class="text-start cetak-sub-label">Nama Sales / Sales Person</td>
          <td class="cetak-desc">—</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Tanggal / Date</td>
          <td class="cetak-desc">{{ formDateLabel }}</td>
        </tr>
        <tr>
          <td class="text-start cetak-sub-label">Tanda tangan / Signature</td>
          <td class="cetak-desc" style="height: 48px;">&nbsp;</td>
        </tr>
      </CetakTable>

      <!-- PERNYATAAN & PERSETUJUAN -->
      <div class="cetak-sub-section-title">PERNYATAAN &amp; PERSETUJUAN / DECLARATION &amp; AGREEMENT</div>
      <p class="cetak-sub-declaration mb-3">
        Dengan ini Pelanggan menyatakan bahwa seluruh data dan informasi yang diberikan dalam Form Berlangganan ini adalah benar dan sah.
        Pelanggan telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum dalam Form Berlangganan ini beserta lampirannya. /
        The Subscriber hereby declares that all data and information provided in this Subscription Form are true and valid.
        The Subscriber has read, understood, and agreed to all terms and conditions stated in this Subscription Form and its attachments.
      </p>
      <p class="cetak-sub-declaration mb-4">
        Form Berlangganan ini dibuat dalam 2 (dua) rangkap, masing-masing mempunyai kekuatan hukum yang sama, dan mulai berlaku setelah
        ditandatangani oleh Para Pihak. /
        This Subscription Form is made in two (2) originals, each having equal legal force, and shall become effective upon being signed by the Parties.
      </p>

      <div class="row g-0 cetak-sub-sign">
        <div class="col-6 pe-2">
          <table class="table table-bordered m-0" style="font-size: 11px;">
            <thead>
              <tr>
                <th colspan="2" class="text-center">PELANGGAN / SUBSCRIBER*</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-start" style="width: 50%;">
                  <div class="text-muted">Nama Pejabat / Person Name</div>
                  <div class="fw-medium mt-1">{{ billingContact?.name || '—' }}</div>
                </td>
                <td class="text-start">
                  <div class="text-muted">Tanda Tangan / Signature</div>
                  <div style="height: 64px;">&nbsp;</div>
                </td>
              </tr>
              <tr>
                <td colspan="2" class="text-start">
                  <div class="text-muted">Jabatan / Title</div>
                  <div>{{ billingContact?.department || '—' }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-6 ps-2">
          <table class="table table-bordered m-0" style="font-size: 11px;">
            <thead>
              <tr>
                <th colspan="2" class="text-center">{{ companyName }}*</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-start" style="width: 50%;">
                  <div class="text-muted">Nama Pejabat / Person Name</div>
                  <div class="fw-medium mt-1">—</div>
                </td>
                <td class="text-start">
                  <div class="text-muted">Tanda Tangan / Signature</div>
                  <div style="height: 64px;">&nbsp;</div>
                </td>
              </tr>
              <tr>
                <td colspan="2" class="text-start">
                  <div class="text-muted">Jabatan / Title</div>
                  <div>Direktur Utama / President Director</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
  title: 'Cetak Formulir Berlangganan',
})

import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useSubscriptionStore } from '~/stores/subscription'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useCompanyPrintProfile } from '~/composables/useCompanyPrintProfile'

const { setDetailTitle } = useDynamicTitle()
const subscriptionStore = useSubscriptionStore()
const route = useRoute()
const { subscription, loading, error } = storeToRefs(subscriptionStore)
const { profile, ensureCompanyProfile } = useCompanyPrintProfile()

const autoPrint = computed(() => route.query.print === 'true' || route.query.print === true)

const documentNumber = computed(
  () => subscription.value?.noSubscription || subscription.value?.no_subscription || ''
)

const services = computed(
  () => subscription.value?.subscriptionServices || subscription.value?.subscription_services || []
)
const installations = computed(
  () =>
    subscription.value?.subscriptionInstallations ||
    subscription.value?.subscription_installations ||
    []
)
const contacts = computed(
  () => subscription.value?.subscriptionContacts || subscription.value?.subscription_contacts || []
)

const billingContacts = computed(() =>
  contacts.value.filter((c) => (c.contactType || c.contact_type) === 'billing')
)
const technicalContacts = computed(() =>
  contacts.value.filter((c) => (c.contactType || c.contact_type) === 'technical')
)
const billingContact = computed(() => billingContacts.value[0] || null)
const technicalContact = computed(() => technicalContacts.value[0] || null)

const billingEmails = computed(() => {
  const emails = billingContacts.value.map((c) => c.email).filter(Boolean)
  return emails.length ? emails.join(', ') : ''
})

const customer = computed(() => subscription.value?.customer || null)
const customerName = computed(
  () =>
    subscription.value?.customerName ||
    subscription.value?.customer_name ||
    customer.value?.name ||
    '—'
)
const customerAddress = computed(() => customer.value?.address || '')
const customerEmail = computed(() => customer.value?.email || '')
const customerPhone = computed(() => customer.value?.phone || '')
const customerNpwp = computed(() => customer.value?.npwp || '')

const businessScheme = computed(() => {
  const q = subscription.value?.quotation
  const si = q?.siteInvest ?? q?.site_invest
  return si?.businessScheme ?? si?.business_scheme ?? null
})
const businessSchemeLabel = computed(
  () => businessScheme.value?.name || businessScheme.value?.code || '—'
)
const schemeCode = computed(() =>
  String(businessScheme.value?.code || businessScheme.value?.name || '').toLowerCase()
)
const schemeIsBuy = computed(() => /buy|beli|own/.test(schemeCode.value) && !/lease|sewa/.test(schemeCode.value))
const schemeIsLease = computed(() => /lease|sewa|managed|op-lease|lease-own/.test(schemeCode.value))
const schemeIsOnDemand = computed(() => /on.?demand|ondemand/.test(schemeCode.value))

const contractPeriod = computed(() =>
  Number(subscription.value?.contractPeriod ?? subscription.value?.contract_period) || 0
)
const contractPeriodLabel = computed(() =>
  contractPeriod.value ? `${contractPeriod.value} bulan` : '—'
)
const contractStartLabel = computed(() =>
  formatDate(subscription.value?.contractStartDate || subscription.value?.contract_start_date)
)
const contractEndLabel = computed(() =>
  formatDate(subscription.value?.contractEndDate || subscription.value?.contract_end_date)
)
const targetRfsLabel = computed(() =>
  formatDate(subscription.value?.targetActiveDate || subscription.value?.target_active_date)
)
const formDateLabel = computed(() =>
  formatDate(subscription.value?.createdAt || subscription.value?.created_at) !== '—'
    ? formatDate(subscription.value?.createdAt || subscription.value?.created_at)
    : formatDate(new Date())
)

const paymentMethod = computed(
  () => subscription.value?.paymentMethod || subscription.value?.payment_method || ''
)
const termOfPayment = computed(
  () => subscription.value?.termOfPayment || subscription.value?.term_of_payment || ''
)

const UNIT_TYPE_DEFAULTS = [
  'Standard Actuated V3',
  'Flat Standard V4',
  'Flat High Performance',
  'Starlink Mini',
]
const PLAN_DEFAULTS = ['Local Priority', 'Global Priority']
const quotaOptions = ['50 GB', '500 GB', '1 TB', '2 TB']

const selectedUnitTypes = computed(() =>
  uniqueLabels(services.value.map((s) => serviceName(s)).filter((n) => n && n !== '—'))
)
const unitTypeOptions = computed(() =>
  uniqueLabels([...UNIT_TYPE_DEFAULTS, ...selectedUnitTypes.value]).slice(0, 6)
)
const selectedPlans = computed(() =>
  uniqueLabels(services.value.map((s) => servicePlanLabel(s)).filter(Boolean))
)
const otherPlanLabel = computed(() => {
  const extras = selectedPlans.value.filter(
    (plan) => !PLAN_DEFAULTS.some((opt) => labelsMatch(plan, opt))
  )
  return extras.join(', ')
})
const selectedQuotas = computed(() => {
  const blob = services.value
    .map((s) => [serviceName(s), servicePlanLabel(s)].filter(Boolean).join(' '))
    .join(' ')
  return quotaOptions.filter((opt) => blobHasQuota(blob, opt))
})
const dataPoolLabel = computed(() => {
  const raw = subscription.value?.dataPool || subscription.value?.data_pool || ''
  return raw ? String(raw) : ''
})
const serviceRows = computed(() => {
  const rows = [...services.value]
  while (rows.length < 3) rows.push({})
  return rows
})

const totalOtc = computed(() =>
  services.value.reduce((sum, s) => sum + (Number(s.otcAmount ?? s.otc_amount) || 0), 0)
)
const totalMrcMonthly = computed(() =>
  services.value.reduce((sum, s) => {
    const qty = Number(s.quantity) || 0
    const mrc = Number(s.mrcAmount ?? s.mrc_amount) || 0
    return sum + qty * mrc
  }, 0)
)
const totalMrcContract = computed(() => {
  const months = contractPeriod.value || 12
  return totalMrcMonthly.value * months
})

const companyName = computed(() => profile.value?.companyName || 'PT Sinergi Innovate Pratama')
const companyAddress = computed(() => profile.value?.address || '')
const companyPhone = computed(() => profile.value?.phone || '')
const companyEmail = computed(() => profile.value?.email || '')
const bankName = computed(() => profile.value?.bankName || 'BCA')
const bankAccount = computed(() => profile.value?.accountNumber || '2860552950')

const headerMeta = computed(() => [
  { label: 'No Form', value: documentNumber.value || '—' },
  { label: 'Tanggal', value: formDateLabel.value },
  { label: 'Status', value: statusLabel(subscription.value?.status) },
])

const paymentTermsHtml = computed(() => {
  const bank = bankName.value || 'BCA'
  const account = bankAccount.value || '2860552950'
  const owner = companyName.value
  return `
<ol style="margin:0;padding-left:1.25rem;font-size:11px;line-height:1.45;">
  <li>Pembayaran dilakukan di muka sebelum perangkat dikirimkan. / Payment must be made in advance before the device is delivered.</li>
  <li>Pembayaran awal meliputi biaya sewa, biaya instalasi dan dismantle, biaya pengiriman, serta biaya layanan bulan pertama. / The initial payment includes rental fee, installation and dismantle fee, delivery fee, and the first month service fee.</li>
  <li>Tagihan layanan bulanan diterbitkan setiap tanggal 1 dan jatuh tempo pada akhir bulan. Apabila tanggal aktivasi kurang dari 1 bulan, biaya akan dihitung secara prorata. / The billing cycle starts on the 1st of each month with a due date at the end of the month. If the activation period is less than one month, the fee will be charged on a prorated basis.</li>
  <li>Pelanggan wajib membayar 100% sesuai invoice yang diterbitkan oleh SIP. Pembayaran dilakukan melalui transfer ke rekening berikut: / The Subscriber must pay 100% of the invoice issued by SIP via bank transfer to the following account:<br>
    Nama Bank / Bank Name : <strong>${escapeHtml(bank)}</strong><br>
    Nomor Rekening / Account Number : <strong>${escapeHtml(account)}</strong><br>
    Nama Pemilik Rekening : <strong>${escapeHtml(owner)}</strong>
  </li>
  <li>Jika pembayaran belum diterima hingga 1 (satu) hari setelah tanggal jatuh tempo, SIP berhak melakukan isolasi dan/atau menghentikan layanan. / If payment is not received within 1 (one) day after the due date, SIP reserves the right to isolate and/or suspend the service.</li>
  <li>Jika pembayaran belum diterima hingga 7 (tujuh) hari setelah layanan diisolasi dan/atau dihentikan, SIP berhak melakukan pengambilan atau dismantling perangkat. / If payment is not received within 7 (seven) days after service isolation and/or suspension, SIP reserves the right to retrieve or dismantle the device.</li>
  <li>Pembatalan setelah Form Berlangganan ditandatangani akan dikenakan biaya pembatalan sebesar 50% dari nilai sisa kontrak, dan seluruh pembayaran yang telah dilakukan tidak dapat dikembalikan. / Cancellation after this Subscription Form is signed will be subject to a cancellation fee of 50% of the remaining contract value, and any payment made is non-refundable.</li>
  <li>Keterlambatan pembayaran dikenakan denda sebesar 1‰ per hari, dengan maksimum 3% dari total tagihan. / Late payment will be subject to a penalty of 1‰ per day, with a maximum of 3% of the total billed amount.</li>
  <li>Permintaan relokasi harus disampaikan secara tertulis minimal 3 hari kerja sebelum tanggal relokasi. Seluruh biaya relokasi menjadi tanggung jawab Pelanggan. / Relocation requests must be submitted in writing at least 3 business days prior to the relocation date. All relocation costs shall be borne by the Subscriber.</li>
</ol>
`.trim()
})

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function uniqueLabels(values) {
  const seen = new Set()
  const out = []
  for (const value of values) {
    const key = String(value).trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(String(value).trim())
  }
  return out
}

function labelsMatch(value, option) {
  const a = String(value || '').trim().toLowerCase()
  const b = String(option || '').trim().toLowerCase()
  if (!a || !b) return false
  return a === b || a.includes(b) || b.includes(a)
}

function isChecked(list, option) {
  return (list || []).some((item) => labelsMatch(item, option))
}

function blobHasQuota(blob, option) {
  const compact = String(blob || '').replace(/\s+/g, '').toLowerCase()
  const key = String(option).replace(/\s+/g, '').toLowerCase()
  return compact.includes(key)
}

function formatRupiahNum(val) {
  if (val === null || val === undefined || val === '') return '—'
  const n = typeof val === 'string' ? Number(val.replace(/[^0-9.-]/g, '')) : Number(val)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(n))
}

function formatDate(val) {
  if (!val) return '—'
  const d = typeof val === 'string' ? new Date(val) : val
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

function statusLabel(status) {
  const map = {
    draft: 'Draft',
    signed: 'Signed',
    active: 'Active',
    terminated: 'Terminated',
    expired: 'Expired',
    canceled: 'Canceled',
  }
  return status ? map[status] || status : '—'
}

function serviceName(svc) {
  return svc?.serviceName || svc?.service_name || svc?.service?.name || '—'
}

function servicePlanLabel(svc) {
  const plan = svc?.servicePlan || svc?.service_plan || ''
  const name = svc?.planName || svc?.plan_name || ''
  if (plan && name && plan !== name) return `${plan} · ${name}`
  return plan || name || ''
}

function unitMrc(svc) {
  return Number(svc?.mrcAmount ?? svc?.mrc_amount) || 0
}

function yearlyMrc(svc) {
  return unitMrc(svc) * 12
}

function formatInstallation(inst) {
  const parts = [
    inst.installAddress || inst.install_address,
    inst.city,
    inst.province,
  ].filter(Boolean)
  return parts.join(', ') || '—'
}

onMounted(async () => {
  await ensureCompanyProfile()
  const id = route.query.id
  if (!id) return
  try {
    await subscriptionStore.getSubscriptionDetails(String(id))
    if (subscription.value) {
      setDetailTitle('Cetak Formulir Berlangganan - ' + documentNumber.value)
    }
  } catch (e) {
    console.error('Cetak Subscription load error:', e)
  }
})
</script>

<style scoped>
.cetak-sub-label {
  width: 34%;
  white-space: normal;
  vertical-align: top;
}
.cetak-check {
  display: inline-block;
  margin-right: 1rem;
  white-space: nowrap;
}
.cetak-check-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 1rem;
  font-size: 11px;
}
.cetak-sub-label em {
  font-style: italic;
  font-weight: 500;
}
.cetak-sub-accept,
.cetak-sub-declaration {
  font-size: 11px;
  line-height: 1.45;
  margin: 0;
}
.cetak-sub-section-title {
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
}
.cetak-sub-correspondence :deep(td),
.cetak-sub-sign :deep(td),
.cetak-sub-sign :deep(th) {
  padding: 0.4rem 0.5rem;
}
</style>
