<template>
  <CetakDocument
    type="SUBSCRIPTION"
    :document-number="documentNumber"
    :status="subscription?.status"
    :loading="loading"
    :error="error"
    :not-found="!loading && !error && !subscription"
    :auto-print="autoPrint"
    :generated-at="printedAt"
  >
    <template v-if="subscription">
      <CetakInfoGrid :left="infoLeft" :right="infoRight" />

      <!-- Services -->
      <CetakTable>
        <template #head>
          <tr>
            <th class="text-center" style="width: 36px;">No</th>
            <th class="text-start">Service / Plan</th>
            <th class="text-center" style="width: 56px;">Qty</th>
            <th class="text-end" style="width: 120px;">MRC</th>
            <th class="text-end" style="width: 120px;">OTC</th>
          </tr>
        </template>
        <tr class="cetak-table__section">
          <td colspan="5" class="text-start">RINCIAN LAYANAN</td>
        </tr>
        <tr v-for="(svc, idx) in services" :key="svc.id || 'svc-' + idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td class="cetak-desc">
            <div>{{ serviceName(svc) }}</div>
            <small v-if="servicePlanLabel(svc)" class="text-muted">{{ servicePlanLabel(svc) }}</small>
          </td>
          <td class="text-center">{{ Number(svc.quantity) || 0 }}</td>
          <td class="cetak-num">{{ formatRupiahNum(svc.mrcAmount ?? svc.mrc_amount) }}</td>
          <td class="cetak-num">{{ formatRupiahNum(svc.otcAmount ?? svc.otc_amount) }}</td>
        </tr>
        <tr v-if="services.length" class="cetak-table__total">
          <td colspan="3" class="text-end">Total</td>
          <td class="cetak-num">{{ formatRupiahNum(totalMrc) }}</td>
          <td class="cetak-num">{{ formatRupiahNum(totalOtc) }}</td>
        </tr>
        <tr v-if="!services.length">
          <td colspan="5" class="text-center py-4 text-muted">Tidak ada layanan</td>
        </tr>
      </CetakTable>

      <!-- Installations -->
      <CetakTable v-if="installations.length">
        <template #head>
          <tr>
            <th class="text-center" style="width: 36px;">No</th>
            <th class="text-start">Alamat Instalasi</th>
            <th class="text-start" style="width: 120px;">Kota</th>
            <th class="text-start" style="width: 120px;">Provinsi</th>
          </tr>
        </template>
        <tr class="cetak-table__section">
          <td colspan="4" class="text-start">ALAMAT INSTALASI</td>
        </tr>
        <tr v-for="(inst, idx) in installations" :key="inst.id || 'inst-' + idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td class="cetak-desc">{{ inst.installAddress || inst.install_address || '—' }}</td>
          <td>{{ inst.city || '—' }}</td>
          <td>{{ inst.province || '—' }}</td>
        </tr>
      </CetakTable>

      <!-- Contacts -->
      <CetakTable v-if="contacts.length">
        <template #head>
          <tr>
            <th class="text-center" style="width: 36px;">No</th>
            <th class="text-start" style="width: 100px;">Tipe</th>
            <th class="text-start">Nama</th>
            <th class="text-start">Departemen</th>
            <th class="text-start">Telepon</th>
            <th class="text-start">Email</th>
          </tr>
        </template>
        <tr class="cetak-table__section">
          <td colspan="6" class="text-start">KONTAK</td>
        </tr>
        <tr v-for="(c, idx) in contacts" :key="c.id || 'contact-' + idx">
          <td class="text-center">{{ idx + 1 }}</td>
          <td>{{ contactTypeLabel(c.contactType ?? c.contact_type) }}</td>
          <td class="cetak-desc">{{ c.name || '—' }}</td>
          <td>{{ c.department || '—' }}</td>
          <td>{{ c.phone || '—' }}</td>
          <td>{{ c.email || '—' }}</td>
        </tr>
      </CetakTable>

      <div
        v-if="subscription.status === 'canceled' && cancelReason"
        class="alert alert-danger py-2 mb-4"
        style="font-size: 12px"
      >
        <strong>Alasan Pembatalan:</strong> {{ cancelReason }}
      </div>

      <CetakNotes
        title="Catatan"
        :html="notesHtml"
      />
    </template>
  </CetakDocument>
</template>

<script setup>
definePageMeta({
  layout: 'cetak',
  middleware: ['auth', 'check-permission'],
  title: 'Cetak Form Berlangganan',
})

import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useSubscriptionStore } from '~/stores/subscription'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

const { setDetailTitle } = useDynamicTitle()
const subscriptionStore = useSubscriptionStore()
const route = useRoute()
const { subscription, loading, error } = storeToRefs(subscriptionStore)

const printedAt = computed(() => new Date())
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

const businessSchemeLabel = computed(() => {
  const q = subscription.value?.quotation
  const si = q?.siteInvest ?? q?.site_invest
  const scheme = si?.businessScheme ?? si?.business_scheme
  return scheme?.name || scheme?.code || '—'
})

const quotationLabel = computed(() => {
  const q = subscription.value?.quotation
  return q?.noQuotation || q?.no_quotation || '—'
})

const cancelReason = computed(
  () => subscription.value?.reasonCancel || subscription.value?.reason_cancel || ''
)

const totalMrc = computed(() =>
  services.value.reduce((sum, s) => sum + (Number(s.mrcAmount ?? s.mrc_amount) || 0), 0)
)
const totalOtc = computed(() =>
  services.value.reduce((sum, s) => sum + (Number(s.otcAmount ?? s.otc_amount) || 0), 0)
)

const infoLeft = computed(() => {
  const s = subscription.value
  if (!s) return []
  return [
    { label: 'No. Subscription', value: documentNumber.value || '—' },
    { label: 'Customer', value: s.customerName || s.customer_name || s.customer?.name || '—' },
    { label: 'Quotation', value: quotationLabel.value },
    { label: 'Business Scheme', value: businessSchemeLabel.value },
    { label: 'Payment Method', value: s.paymentMethod || s.payment_method || '—' },
    { label: 'Term of Payment', value: s.termOfPayment || s.term_of_payment || '—' },
  ]
})

const infoRight = computed(() => {
  const s = subscription.value
  if (!s) return []
  const items = [
    { label: 'Status', value: statusLabel(s.status) },
    {
      label: 'Contract Period',
      value: s.contractPeriod || s.contract_period
        ? `${s.contractPeriod || s.contract_period} bulan`
        : '—',
    },
    {
      label: 'Target Activation',
      value: formatDate(s.targetActiveDate || s.target_active_date),
    },
    {
      label: 'Contract Start',
      value: formatDate(s.contractStartDate || s.contract_start_date),
    },
    {
      label: 'Contract End',
      value: formatDate(s.contractEndDate || s.contract_end_date),
    },
  ]
  const po = s.poReference || s.po_reference
  if (po) items.push({ label: 'PO Reference', value: po })
  const lr = s.leTechReview?.noLr || s.leTechReview?.no_lr
  if (lr) items.push({ label: 'Legal Tech Review', value: lr })
  return items
})

const notesHtml = computed(() => {
  return (
    'Dokumen Form Berlangganan (Subscription) ini merujuk pada Quotation terkait ' +
    'dan skema bisnis dari Site Investment. Digunakan sebagai dasar aktivasi layanan ' +
    'serta penagihan berulang sesuai masa kontrak.'
  )
})

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
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
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

function contactTypeLabel(type) {
  if (type === 'billing') return 'Billing'
  if (type === 'technical') return 'Technical'
  return type || '—'
}

onMounted(async () => {
  const id = route.query.id
  if (!id) return
  try {
    await subscriptionStore.getSubscriptionDetails(String(id))
    if (subscription.value) {
      setDetailTitle('Cetak Form Berlangganan - ' + documentNumber.value)
    }
  } catch (e) {
    console.error('Cetak Subscription load error:', e)
  }
})
</script>
