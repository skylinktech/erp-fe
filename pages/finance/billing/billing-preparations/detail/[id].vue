<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="loadingDetail" class="text-center p-6">
        <ProgressSpinner style="width:48px;height:48px" strokeWidth="4" />
      </div>

      <template v-else-if="prep">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div class="d-flex flex-wrap align-items-center gap-3">
            <NuxtLink to="/finance/billing-preparations" class="btn btn-outline-secondary btn-sm">
              <i class="ri-arrow-left-line me-1"></i> Kembali
            </NuxtLink>
            <div>
              <h4 class="mb-0">{{ prep.customer?.name || '—' }} · {{ prep.billingPeriod }}</h4>
              <PageBreadcrumb class="mt-1" :current-label="`${prep.customer?.name || '—'} · ${prep.billingPeriod}`" />
              <small class="text-muted">Billing Preparation</small>
            </div>
            <span :class="statusBadge(prep.status)">{{ prep.status }}</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-if="prep.status === 'draft'"
              class="btn btn-outline-secondary btn-sm"
              @click="store.rebuildItems(prep.id)"
            >
              <i class="ri-refresh-line me-1"></i> Rebuild Items
            </button>
            <button
              v-if="prep.status === 'draft' && (userHasRole('superadmin') || userHasPermission('edit_billing_preparation'))"
              class="btn btn-outline-primary btn-sm"
              :disabled="store.saving"
              @click="saveItems"
            >
              <i class="ri-save-line me-1"></i> Simpan
            </button>
            <button
              v-if="prep.status === 'draft' && (userHasRole('superadmin') || userHasPermission('ready_billing_preparation'))"
              class="btn btn-success btn-sm"
              :disabled="!canSetReady"
              :title="readyDisabledReason"
              @click="onSetReady"
            >
              <i class="ri-send-plane-line me-1"></i> Set Ready → Finance Invoice
            </button>
            <NuxtLink
              v-if="prep.status === 'invoiced' && (prep.financeInvoiceId || prep.salesInvoiceId)"
              :to="`/finance/invoices/detail/${prep.financeInvoiceId || prep.salesInvoiceId}`"
              class="btn btn-primary btn-sm"
            >
              <i class="ri-file-list-3-line me-1"></i> Lihat Finance Invoice
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="prep.status === 'draft' && selectedCount > 0 && selectedTotal <= 0"
          class="alert alert-warning mb-4"
        >
          <i class="ri-error-warning-line me-1"></i>
          Total item terpilih saat ini
          <strong>{{ formatRupiah(selectedTotal) }}</strong>.
          Finance Invoice hanya bisa digenerate jika total &gt; Rp 0.
          Kurangi restitution/discount atau tambah charge terlebih dahulu.
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Items</h5>
                <small class="text-muted">Dari Form Berlangganan + Adjustment Approved</small>
              </div>
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead>
                    <tr>
                      <th style="width:50px">Sel</th>
                      <th>Source</th>
                      <th>Description</th>
                      <th class="text-end">Qty</th>
                      <th class="text-end">Price</th>
                      <th class="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in localItems" :key="item.id">
                      <td>
                        <input
                          v-model="item.selected"
                          type="checkbox"
                          class="form-check-input"
                          :disabled="prep.status !== 'draft'"
                        >
                      </td>
                      <td>
                        <NuxtLink
                          v-if="item.sourceType === 'subscription' && item.serviceLine?.subscriptionId"
                          :to="`/order-process/subscription/detail/${item.serviceLine.subscriptionId}`"
                          class="badge bg-label-info text-decoration-none"
                        >
                          subscription
                        </NuxtLink>
                        <NuxtLink
                          v-else-if="item.sourceType === 'adjustment'"
                          to="/finance/billing-adjustments"
                          class="badge bg-label-warning text-decoration-none"
                        >
                          adjustment
                        </NuxtLink>
                        <NuxtLink
                          v-else-if="item.sourceType === 'tax'"
                          to="/finance/tax-masters"
                          class="badge bg-label-primary text-decoration-none"
                        >
                          tax
                        </NuxtLink>
                        <span v-else class="badge bg-label-info">{{ item.sourceType }}</span>
                      </td>
                      <td>{{ item.description }}</td>
                      <td class="text-end">{{ item.qty }}</td>
                      <td class="text-end">{{ formatRupiah(item.price) }}</td>
                      <td class="text-end" :class="item.amount < 0 ? 'text-danger' : ''">
                        {{ formatRupiah(item.amount) }}
                      </td>
                    </tr>
                    <tr v-if="!localItems.length">
                      <td colspan="6" class="text-center text-muted py-4">Tidak ada item</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="localItems.length">
                    <tr>
                      <td colspan="5" class="text-end fw-semibold">Total terpilih</td>
                      <td class="text-end fw-semibold">{{ formatRupiah(selectedTotal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Sumber Terhubung</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="mb-0">Form Berlangganan</h6>
                      <NuxtLink to="/order-process/subscription" class="small">Lihat semua</NuxtLink>
                    </div>
                    <ul v-if="sources.subscriptions.length" class="list-unstyled mb-0">
                      <li
                        v-for="s in sources.subscriptions"
                        :key="s.id"
                        class="d-flex justify-content-between align-items-center border-bottom py-2"
                      >
                        <NuxtLink
                          :to="`/order-process/subscription/detail/${s.id}`"
                          class="text-decoration-none"
                        >
                          {{ s.noSubscription }}
                        </NuxtLink>
                        <span class="text-muted small">{{ s.serviceLineCount || 0 }} line</span>
                      </li>
                    </ul>
                    <p v-else class="text-muted small mb-0">Tidak ada Form Berlangganan eligible.</p>
                  </div>
                  <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="mb-0">
                        Billing Adjustment
                        <span class="text-muted fw-normal small">(opsional)</span>
                      </h6>
                      <NuxtLink to="/finance/billing-adjustments" class="small">Lihat semua</NuxtLink>
                    </div>
                    <ul v-if="sources.adjustments.length" class="list-unstyled mb-0">
                      <li
                        v-for="a in sources.adjustments"
                        :key="a.id"
                        class="d-flex justify-content-between align-items-center border-bottom py-2 gap-2"
                      >
                        <div>
                          <span class="badge bg-label-secondary me-1">{{ a.type }}</span>
                          <span class="small">{{ a.description || 'Adjustment' }}</span>
                        </div>
                        <span class="small text-nowrap" :class="a.amount < 0 ? 'text-danger' : ''">
                          {{ formatRupiah(a.amount) }}
                        </span>
                      </li>
                    </ul>
                    <p v-else class="text-muted small mb-0">Tidak ada adjustment approved untuk periode ini.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card mb-4">
              <div class="card-body">
                <h6 class="mb-3">Ringkasan</h6>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Faktur Pajak</span>
                  <span>{{ prep.fakturPajak || '—' }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Tambah Pajak</span>
                  <span :class="prep.applyTax ? 'badge bg-label-success' : 'badge bg-label-secondary'">
                    {{ prep.applyTax ? 'Ya' : 'Tidak' }}
                  </span>
                </div>

                <div v-if="prep.taxes?.length" class="mb-3">
                  <div class="small text-muted mb-2">Pajak terpasang</div>
                  <div
                    v-for="tax in prep.taxes"
                    :key="tax.id || tax.taxMasterId"
                    class="d-flex justify-content-between align-items-start border-bottom py-2 gap-2"
                  >
                    <div>
                      <div class="fw-semibold small">{{ tax.taxCode }} — {{ tax.taxName }}</div>
                      <small class="text-muted">{{ tax.taxType }} · {{ tax.calculationType }}</small>
                    </div>
                    <div class="text-end">
                      <div class="small fw-semibold">
                        {{
                          tax.calculationType === 'FIXED'
                            ? formatRupiah(tax.rate)
                            : `${tax.rate}%`
                        }}
                      </div>
                      <div class="small" :class="tax.amount < 0 ? 'text-danger' : 'text-muted'">
                        {{ formatRupiah(tax.amount) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Prepared At</span>
                  <span>{{ formatDate(prep.preparedAt) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Generated At</span>
                  <span>{{ formatDate(prep.generatedInvoiceAt) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 align-items-center">
                  <span class="text-muted">Attachment</span>
                  <a
                    v-if="prep.attachment"
                    :href="getAttachmentUrl(prep.attachment)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="badge rounded-pill bg-label-primary text-decoration-none"
                  >
                    <i class="ri-attachment-2 me-1"></i> File
                  </a>
                  <span v-else>—</span>
                </div>
                <div v-if="prep.status === 'draft'" class="mt-3">
                  <label class="form-label">Faktur Pajak</label>
                  <input v-model="fakturPajak" type="text" class="form-control form-control-sm mb-3">

                  <div class="form-check form-switch mb-2">
                    <input id="applyTaxDetail" v-model="applyTax" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="applyTaxDetail">Tambah Pajak</label>
                  </div>

                  <template v-if="applyTax">
                    <label class="form-label">Pajak (Tax Master)</label>
                    <CustomSelect2
                      v-model="taxMasterIds"
                      :options="taxMasterOptions"
                      :get-option-label="taxMasterLabel"
                      :reduce="(o) => o.id"
                      :loading="loadingTaxes"
                      searchable
                      clearable
                      multiple
                      :close-on-select="false"
                      placeholder="Pilih pajak"
                      class="mb-2"
                    />
                    <div v-if="selectedTaxPreviews.length" class="mb-3">
                      <div
                        v-for="tax in selectedTaxPreviews"
                        :key="tax.id"
                        class="d-flex justify-content-between small border-bottom py-1"
                      >
                        <span>{{ tax.code }}</span>
                        <span class="fw-semibold">{{ formatTaxRate(tax) }}</span>
                      </div>
                    </div>
                  </template>

                  <label class="form-label">Attachment</label>
                  <input type="file" class="form-control form-control-sm" @change="onFile">
                  <small v-if="fileRef" class="text-muted d-block mt-1">{{ fileRef.name }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="alert alert-warning">Billing preparation tidak ditemukan.</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBillingPreparationStore } from '~/stores/billing-preparations'
import { useTaxMasterStore } from '~/stores/tax-masters'
import { usePermissions } from '~/composables/usePermissions'
import { useFormatRupiah } from '~/composables/formatRupiah'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'
import CustomSelect2 from '~/components/CustomSelect2.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail Billing Preparation',
})

const route = useRoute()
const store = useBillingPreparationStore()
const taxMasterStore = useTaxMasterStore()
const { selected: prep, loadingDetail } = storeToRefs(store)
const { userHasRole, userHasPermission } = usePermissions()
const formatRupiah = useFormatRupiah()
const { setDetailTitle } = useDynamicTitle()
const { getAttachmentUrl } = useImageUrl()

const localItems = ref([])
const fakturPajak = ref('')
const fileRef = ref(null)
const applyTax = ref(false)
const taxMasterIds = ref([])
const taxMasterOptions = ref([])
const loadingTaxes = ref(false)

const sources = computed(() => prep.value?.sources || { subscriptions: [], adjustments: [] })

const selectedTaxPreviews = computed(() => {
  const ids = new Set(taxMasterIds.value || [])
  return (taxMasterOptions.value || []).filter((t) => ids.has(t.id))
})

const taxMasterLabel = (o) => {
  if (!o) return ''
  const rate =
    o.calculationType === 'FIXED'
      ? formatRupiah(o.defaultRate || 0)
      : `${Number(o.defaultRate || 0)}%`
  return `${o.code} — ${o.name} (${rate})`
}

const formatTaxRate = (tax) => {
  const rate = Number(tax.defaultRate || 0)
  return tax.calculationType === 'FIXED' ? formatRupiah(rate) : `${rate}%`
}

const statusBadge = (s) => ({
  draft: 'badge bg-label-secondary',
  ready: 'badge bg-label-warning',
  invoiced: 'badge bg-label-success',
}[s] || 'badge bg-label-secondary')

const selectedTotal = computed(() =>
  localItems.value.filter((i) => i.selected).reduce((s, i) => s + Number(i.amount || 0), 0)
)
const selectedCount = computed(() => localItems.value.filter((i) => i.selected).length)
const canSetReady = computed(() => selectedCount.value > 0 && selectedTotal.value > 0)
const readyDisabledReason = computed(() => {
  if (selectedCount.value === 0) return 'Pilih minimal 1 item terlebih dahulu'
  if (selectedTotal.value <= 0) {
    return `Total item terpilih harus > Rp 0 (saat ini ${formatRupiah(selectedTotal.value)})`
  }
  return ''
})

const formatDate = (v) => {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString('id-ID')
  } catch {
    return v
  }
}

watch(
  prep,
  (p) => {
    localItems.value = (p?.items || []).map((i) => ({ ...i }))
    fakturPajak.value = p?.fakturPajak || ''
    applyTax.value = !!p?.applyTax
    taxMasterIds.value = (p?.taxes || []).map((t) => t.taxMasterId).filter(Boolean)
    if (p?.billingPeriod) setDetailTitle(`Billing Prep ${p.billingPeriod}`)
  },
  { immediate: true }
)

watch(applyTax, (on) => {
  if (!on) taxMasterIds.value = []
})

const onFile = (e) => {
  fileRef.value = e.target.files?.[0] || null
}

const saveItems = async () => {
  if (!prep.value) return false
  if (applyTax.value && !taxMasterIds.value.length) {
    useToast().error({
      title: 'Validasi',
      message: 'Pilih minimal 1 pajak jika Tambah Pajak diaktifkan',
      color: 'red',
      position: 'bottomRight',
    })
    return false
  }
  const ok = await store.update(
    prep.value.id,
    {
      fakturPajak: fakturPajak.value,
      applyTax: !!applyTax.value,
      taxMasterIds: applyTax.value ? taxMasterIds.value : [],
      items: localItems.value.map((i) => ({
        id: i.id,
        selected: i.selected,
        qty: i.qty,
        price: i.price,
        amount: i.amount,
        description: i.description,
        sortOrder: i.sortOrder,
      })),
    },
    fileRef.value
  )
  if (ok) fileRef.value = null
  return ok
}

const onSetReady = async () => {
  if (!prep.value) return
  if (!canSetReady.value) {
    useToast().error({
      title: 'Tidak bisa Set Ready',
      message: readyDisabledReason.value,
      color: 'red',
      position: 'bottomRight',
    })
    return
  }
  // Pastikan pilihan item tersimpan sebelum mark ready
  const saved = await saveItems()
  if (!saved) return
  await store.markReady(prep.value.id)
}

onMounted(async () => {
  loadingTaxes.value = true
  try {
    taxMasterOptions.value = await taxMasterStore.fetchActiveOptions()
  } finally {
    loadingTaxes.value = false
  }
  await store.fetchById(String(route.params.id || ''))
})
</script>
