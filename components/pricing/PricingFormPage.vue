<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 class="mb-1">{{ pageTitle }}</h4>
          <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
          <p class="mb-0 text-muted mt-3">
            Kelola harga jual produk.
          </p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button
            v-if="isEditMode && form.id"
            type="button"
            class="btn btn-outline-primary"
            :disabled="saving"
            @click="openDuplicateModal"
          >
            <i class="ri-file-copy-line me-1"></i>Duplikat sebagai Draft
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/pricing')">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </button>
        </div>
      </div>

      <div v-if="loading" class="card">
        <div class="card-body text-center py-5 text-muted">Memuat data pricing…</div>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div v-if="error" class="alert alert-danger text-break">{{ error }}</div>
          <div v-if="!isDraftEditable" class="alert alert-warning">
            Daftar harga berstatus <strong>{{ humanizeLabel(form.status, { fallback: '—' }) }}</strong> bersifat hanya lihat. Edit hanya tersedia untuk
            status draft.
          </div>

          <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
            <TabbedFormNav
              :steps="visibleSteps"
              :current-index="currentIndex"
              :disabled="navigating || saving"
              @select="goTo"
            />

            <div class="tab-content pt-4">
              <div
                id="pricing-tab-info"
                data-step-id="pricing-tab-info"
                role="tabpanel"
                :class="paneClass('pricing-tab-info')"
              >
                <div class="row g-4">
                  <div class="col-md-6">
                      <FormLabel required for="pricing-code">Kode</FormLabel>
                      <input
                        id="pricing-code"
                        v-model="form.code"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': uiErrors.code }"
                        placeholder="Kode"
                        :disabled="!isDraftEditable"
                      aria-required="true"
                    />
                    <div v-if="uiErrors.code" class="invalid-feedback d-block">{{ uiErrors.code }}</div>
                  </div>

                  <div class="col-md-6">
                    <FormLabel required>Kanal</FormLabel>
                    <CustomSelect2
                      v-model="form.channel"
                      :options="channelOptions"
                      :get-option-label="(o) => o.label"
                      :reduce="(o) => o.value"
                      :get-option-key="(o) => o.value"
                      :clearable="false"
                      :disabled="!isDraftEditable"
                      placeholder="Pilih kanal"
                    />
                    <div v-if="uiErrors.channel" class="invalid-feedback d-block">{{ uiErrors.channel }}</div>
                  </div>

                  <div class="col-md-6 mt-7">
                    <div class="form-floating form-floating-outline">
                      <input
                        id="pricing-valid-from"
                        v-model="form.validFrom"
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': uiErrors.validFrom }"
                        :disabled="!isDraftEditable"
                        aria-required="true"
                      />
                      <label for="pricing-valid-from">
                        Berlaku dari <span class="text-danger" aria-hidden="true">*</span>
                      </label>
                    </div>
                    <div v-if="uiErrors.validFrom" class="invalid-feedback d-block">{{ uiErrors.validFrom }}</div>
                  </div>

                  <div class="col-md-6 mt-7">
                    <div class="form-floating form-floating-outline">
                      <input
                        id="pricing-valid-to"
                        v-model="form.validTo"
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': uiErrors.validTo }"
                        :disabled="!isDraftEditable"
                      />
                      <label for="pricing-valid-to">Berlaku sampai</label>
                    </div>
                    <div v-if="uiErrors.validTo" class="invalid-feedback d-block">{{ uiErrors.validTo }}</div>
                  </div>

                  <div class="col-12">
                    <ActiveCompanyField input-id="pricing-form-company" />
                    <div v-if="uiErrors.perusahaanId" class="invalid-feedback d-block">
                      {{ uiErrors.perusahaanId }}
                    </div>
                  </div>

                  <div v-if="form.channel === 'MARKETPLACE'" class="col-12">
                    <div class="card bg-label-secondary border-0">
                      <div class="card-body">
                        <h6 class="mb-1">
                          <i class="ri-store-2-line me-1"></i>Penugasan Shop Marketplace
                        </h6>
                        <p class="text-muted small mb-3">
                          Daftar harga kanal Marketplace hanya berlaku untuk satu shop yang
                          terhubung. Simpan draft terlebih dahulu sebelum menugaskan shop.
                        </p>

                        <div v-if="!form.id" class="alert alert-warning small mb-0">
                          Simpan draft dulu untuk mengaktifkan penugasan shop.
                        </div>
                        <template v-else>
                          <div v-if="form.shopId" class="alert alert-success small mb-3">
                            Shop saat ini:
                            <strong>{{ form.shopName || assignedShopFallbackName || `#${form.shopId}` }}</strong>
                          </div>
                          <div class="row g-2 align-items-end">
                            <div class="col-md-8">
                              <label class="form-label" for="pricing-marketplace-shop">
                                Pilih Shop Terhubung
                              </label>
                              <select
                                id="pricing-marketplace-shop"
                                v-model="selectedShopId"
                                class="form-select"
                                :disabled="assigningShop || loadingShops"
                              >
                                <option value="">
                                  {{ loadingShops ? 'Memuat shop…' : 'Pilih shop' }}
                                </option>
                                <option v-for="s in connectedShops" :key="s.id" :value="s.id">
                                  {{ s.name }} ({{ commercePlatformLabel(s.platformCode) }})
                                </option>
                              </select>
                            </div>
                            <div class="col-md-4">
                              <button
                                type="button"
                                class="btn btn-primary w-100"
                                :disabled="!selectedShopId || assigningShop"
                                @click="onAssignShop"
                              >
                                <span
                                  v-if="assigningShop"
                                  class="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                {{ assigningShop ? 'Menyimpan…' : 'Assign ke Shop' }}
                              </button>
                            </div>
                          </div>
                          <p v-if="!connectedShops.length && !loadingShops" class="small text-muted mt-2 mb-0">
                            Belum ada shop terhubung. Hubungkan shop di Settings → Omnichannel → Toko Terhubung.
                          </p>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                id="pricing-tab-lines"
                data-step-id="pricing-tab-lines"
                role="tabpanel"
                :class="paneClass('pricing-tab-lines')"
              >
                <div v-if="uiErrors.lines" class="alert alert-danger py-2 mb-3">
                  <i class="ri-error-warning-line me-1"></i>{{ uiErrors.lines }}
                </div>

                <div class="repeater-table">
                  <div class="repeater-table-head d-none d-md-grid repeater-cols-pricing">
                    <span>Produk</span>
                    <span>Satuan</span>
                    <span>Harga Resmi</span>
                    <span></span>
                  </div>

                  <div
                    v-for="(line, index) in form.lines"
                    :key="`pricing-line-${index}`"
                    class="repeater-table-row"
                  >
                    <div class="repeater-cell repeater-cell-main">
                      <span class="repeater-cell-label d-md-none">Produk</span>
                      <ProductSelect
                        v-model="line.productId"
                        :company-id="companyId"
                        :per-page="100"
                        :initial-option="
                          line.productId
                            ? { id: line.productId, name: line.productName, sku: line.productSku }
                            : null
                        "
                        :disabled="!isDraftEditable || !companyId"
                        @select="(product) => onProductSelect(index, product)"
                      />
                      <p v-if="line.isBundling" class="small text-muted mb-0 mt-1">
                        Bundling — harga paket independen dari komponen
                      </p>
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Satuan</span>
                      <input
                        type="text"
                        class="form-control"
                        :value="line.unitName || (line.unitId ? `Unit #${line.unitId}` : '')"
                        placeholder="Otomatis dari produk"
                        readonly
                        disabled
                        tabindex="-1"
                      />
                    </div>
                    <div class="repeater-cell">
                      <span class="repeater-cell-label d-md-none">Harga Resmi</span>
                      <input
                        type="text"
                        class="form-control"
                        :value="formatRupiah(line.officialUnitPrice)"
                        placeholder="Rp 0"
                        :disabled="!isDraftEditable"
                        @input="updateOfficialUnitPriceFromInput(index, $event)"
                      />
                    </div>
                    <div class="repeater-cell repeater-cell-actions">
                      <button
                        v-if="isDraftEditable"
                        type="button"
                        class="repeater-delete-btn"
                        title="Hapus baris"
                        @click="pricingStore.removeLine(index)"
                      >
                        <i class="ri-delete-bin-6-line"></i>
                      </button>
                    </div>
                  </div>

                  <div v-if="!form.lines?.length" class="repeater-empty">Belum ada baris harga.</div>
                </div>

                <div v-if="isDraftEditable" class="mt-3">
                  <button type="button" class="btn btn-primary btn-sm" @click="pricingStore.addLine()">
                    <i class="ri-add-line me-1"></i>Tambah Produk
                  </button>
                </div>
              </div>
            </div>

            <TabbedFormActions
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              :loading="navigating"
              :saving="saving"
              :submit-disabled="!isDraftEditable"
              :submit-label="isEditMode ? 'Simpan Perubahan' : 'Simpan Draft'"
              cancel-label="Batal"
              cancel-href="/sales/pricing"
              @next="next"
              @previous="previous"
            />
          </form>
        </div>
      </div>
    </div>
    <div class="content-backdrop fade"></div>

    <PricingDuplicateModal
      :show="showDuplicateModal"
      :source-code="form.code"
      :source-channel="form.channel"
      :busy="pricingStore.duplicating"
      :error="duplicateError"
      @cancel="showDuplicateModal = false"
      @confirm="onConfirmDuplicate"
    />
  </div>
</template>

<script setup lang="ts">
import { humanizeLabel } from '~/utils/humanizeLabel'
import { commercePlatformLabel } from '~/utils/commercePlatform'

import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePricingStore } from '~/stores/pricing'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { useFormatRupiah, parseRupiahToNumber } from '~/composables/formatRupiah'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import ProductSelect from '~/components/reference/ProductSelect.vue'
import PageBreadcrumb from '~/components/PageBreadcrumb.vue'
import PricingDuplicateModal from '~/components/pricing/PricingDuplicateModal.vue'
import { PRICING_CHANNEL_OPTIONS, type PricingChannel } from '~/utils/pricingChannel'
import { readAccessToken } from '~/utils/authCookie'

const route = useRoute()
const formatRupiah = useFormatRupiah()
const pricingStore = usePricingStore()
const { setFormTitle } = useDynamicTitle()
const {
  companyId,
  requireCompanyId,
  missingMessage: activeCompanyMissing,
  ensureBootstrapped} = useActiveCompany()
void ensureBootstrapped()

const { form, loading, saving, error, isEditMode, isDraftEditable } = storeToRefs(pricingStore)

const formRoot = ref<HTMLElement | null>(null)
const uiErrors = ref<Record<string, string>>({})

const channelOptions = PRICING_CHANNEL_OPTIONS

const assigningShop = computed(() => pricingStore.assigningShop)
const connectedShops = ref<Array<{ id: string; name: string; platformCode: string }>>([])
const loadingShops = ref(false)
const selectedShopId = ref('')

const assignedShopFallbackName = computed(() => {
  const id = form.value.shopId ? String(form.value.shopId) : ''
  if (!id) return ''
  return connectedShops.value.find((s) => String(s.id) === id)?.name || ''
})

async function loadConnectedShops() {
  if (!companyId.value) return
  loadingShops.value = true
  try {
    const { $api } = useNuxtApp() as any
    const token = readAccessToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    headers['X-Company-Id'] = String(companyId.value)
    const qs = new URLSearchParams({ perusahaanId: String(companyId.value), page: '1', perPage: '100' })
    const res = await fetch(`${$api.commerceShops()}?${qs}`, { headers, credentials: 'include' })
    const json = await res.json().catch(() => ({}))
    connectedShops.value = res.ok
      ? (json.data || []).filter((s: any) => String(s.status || '').toUpperCase() === 'ACTIVE')
      : []
    syncSelectedShopFromForm()
  } catch {
    connectedShops.value = []
  } finally {
    loadingShops.value = false
  }
}

function syncSelectedShopFromForm() {
  const id = form.value.shopId ? String(form.value.shopId) : ''
  selectedShopId.value = id
  if (id && !form.value.shopName) {
    const hit = connectedShops.value.find((s) => String(s.id) === id)
    if (hit?.name) form.value.shopName = hit.name
  }
}

async function onAssignShop() {
  if (!selectedShopId.value) return
  const shopId = selectedShopId.value
  const localName = connectedShops.value.find((s) => String(s.id) === shopId)?.name || null
  const ok = await pricingStore.assignShop(shopId, companyId.value)
  if (!ok) return
  // Keep dropdown on assigned shop (do not clear). Resolve name if API omitted it.
  selectedShopId.value = String(form.value.shopId || shopId)
  if (!form.value.shopName && localName) form.value.shopName = localName
}

const showDuplicateModal = ref(false)
const duplicateError = ref('')

function openDuplicateModal() {
  duplicateError.value = ''
  showDuplicateModal.value = true
}

async function onConfirmDuplicate(targetChannel: PricingChannel) {
  if (!form.value.id) return
  duplicateError.value = ''
  const newId = await pricingStore.duplicateDraft(form.value.id, targetChannel, companyId.value)
  if (!newId) {
    duplicateError.value = pricingStore.error || 'Duplikasi draft gagal.'
    return
  }
  showDuplicateModal.value = false
  await navigateTo(`/sales/pricing/form/${newId}`)
}

watch(
  () => form.value.channel,
  (channel) => {
    if (channel === 'MARKETPLACE' && form.value.id && !connectedShops.value.length && !loadingShops.value) {
      void loadConnectedShops()
    }
  }
)

const pageTitle = computed(() => (isEditMode.value ? 'Edit Pricing' : 'Tambah Pricing'))

const formSteps = computed(() => [
  {
    id: 'pricing-tab-info',
    label: 'Informasi Pricing',
    icon: 'ri-price-tag-3-line'},
  {
    id: 'pricing-tab-lines',
    label: 'Detail Produk',
    icon: 'ri-shopping-bag-3-line',
    badge: pricingStore.filledLines.length || null},
])

function validatePricingStep(step: { id: string }) {
  uiErrors.value = {}
  if (step.id === 'pricing-tab-info') {
    if (!String(form.value.code || '').trim()) uiErrors.value.code = 'Kode wajib diisi.'
    if (!form.value.channel) uiErrors.value.channel = 'Kanal wajib dipilih.'
    if (!form.value.validFrom) uiErrors.value.validFrom = 'Tanggal berlaku dari wajib diisi.'
    if (
      form.value.validFrom &&
      form.value.validTo &&
      String(form.value.validTo) < String(form.value.validFrom)
    ) {
      uiErrors.value.validTo = 'Berlaku sampai tidak boleh lebih awal dari berlaku dari.'
    }
    try {
      requireCompanyId()
    } catch {
      uiErrors.value.perusahaanId = activeCompanyMissing.value || 'Active Company wajib dipilih.'
    }
    return Object.keys(uiErrors.value).length === 0
  }
  if (step.id === 'pricing-tab-lines') {
    const filled = pricingStore.filledLines
    if (filled.length < 1) {
      uiErrors.value.lines = 'Minimal satu produk dengan harga resmi harus ditambahkan.'
      return false
    }
    const keys = new Set<string>()
    for (const line of filled) {
      const key = `${line.productId}:${line.unitId}`
      if (keys.has(key)) {
        uiErrors.value.lines = 'Produk dan satuan yang sama tidak boleh diulang.'
        return false
      }
      keys.add(key)
    }
    return true
  }
  return true
}

const {
  currentIndex,
  visibleSteps,
  isFirstStep,
  isLastStep,
  navigating,
  next,
  previous,
  goTo,
  paneClass,
  validateAll,
  reset} = useTabbedFormNavigation({
  steps: formSteps,
  formRoot,
  validateStep: validatePricingStep})

function onProductSelect(index: number, product: any | null) {
  pricingStore.applyProductToLine(index, product)
}

function updateOfficialUnitPriceFromInput(index: number, e: Event) {
  const line = form.value?.lines?.[index]
  if (!line) return
  line.officialUnitPrice = parseRupiahToNumber((e.target as HTMLInputElement)?.value)
}

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!isDraftEditable.value) return
  if (!(await validateAll())) return

  let perusahaanId: number
  try {
    perusahaanId = requireCompanyId()
  } catch (err: any) {
    pricingStore.error = err?.message || activeCompanyMissing.value || 'Active Company wajib.'
    await goTo(0, { skipValidation: true })
    return
  }

  const ok = await pricingStore.save(perusahaanId)
  if (ok) {
    await navigateTo('/sales/pricing')
  }
}

onMounted(async () => {
  reset(0)
  const rawId = route.params.id
  const id = rawId != null && String(rawId).trim() !== '' ? Number(rawId) : null
  if (id && Number.isFinite(id) && id > 0) {
    setFormTitle('Pricing', true, String(id))
    const ok = await pricingStore.fetchForEdit(id, companyId.value)
    if (!ok) return
    setFormTitle('Pricing', true, form.value.code || String(id))
    if (form.value.channel === 'MARKETPLACE') void loadConnectedShops()
  } else {
    setFormTitle('Pricing', false)
    pricingStore.resetForm({
      channel: 'POS',
      perusahaanId: companyId.value})
  }
})

watch(
  () => form.value.shopId,
  () => {
    syncSelectedShopFromForm()
  }
)
watch(companyId, (nextId) => {
  if (!isEditMode.value) {
    form.value.perusahaanId = nextId
  }
})

watch(
  () => form.value.code,
  (code) => {
    if (isEditMode.value) setFormTitle('Pricing', true, code || String(form.value.id || ''))
  }
)
</script>

<style scoped>
.repeater-table {
  border: 1px solid #dee2e6;
  border-radius: 10px;
}
.repeater-table-head {
  background: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
  border-radius: 10px 10px 0 0;
  padding: 8px 16px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6c757d;
  gap: 12px;
  align-items: center;
}
.repeater-cols-pricing {
  grid-template-columns: 2.5fr 1fr 1.2fr 48px;
}
.repeater-table-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-end;
  transition: background 0.12s;
}
.repeater-table-row:last-child {
  border-bottom: none;
}
.repeater-table-row:hover {
  background: #fafbfc;
}
.repeater-cell {
  display: flex;
  flex-direction: column;
  flex: 1 1 120px;
  min-width: 0;
}
.repeater-cell-main {
  flex: 3 1 240px;
}
.repeater-cell-actions {
  flex: 0 0 48px;
  align-items: flex-end;
}
.repeater-cell-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 4px;
  display: block;
}
.repeater-delete-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #f1aeb5;
  border-radius: 6px;
  color: #dc3545;
}
.repeater-delete-btn:hover {
  background: #fff5f5;
}
.repeater-empty {
  padding: 1.25rem 1rem;
  color: #6c757d;
  text-align: center;
}

@media (min-width: 768px) {
  .repeater-table-row {
    display: grid;
    grid-template-columns: 2.5fr 1fr 1.2fr 48px;
    align-items: end;
  }
}
</style>
