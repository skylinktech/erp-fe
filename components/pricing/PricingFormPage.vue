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
        <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/sales/pricing')">
          <i class="ri-arrow-left-line me-1"></i>Kembali
        </button>
      </div>

      <div v-if="loading" class="card">
        <div class="card-body text-center py-5 text-muted">Memuat data pricing…</div>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div v-if="error" class="alert alert-danger text-break">{{ error }}</div>
          <div v-if="!isDraftEditable" class="alert alert-warning">
            Daftar harga berstatus <strong>{{ form.status }}</strong> bersifat hanya lihat. Edit hanya tersedia untuk
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
                        v-model.number="line.officialUnitPrice"
                        type="number"
                        min="1"
                        step="1"
                        class="form-control"
                        placeholder="0"
                        :disabled="!isDraftEditable"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePricingStore } from '~/stores/pricing'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ActiveCompanyField from '~/components/company/ActiveCompanyField.vue'
import ProductSelect from '~/components/reference/ProductSelect.vue'
import PageBreadcrumb from '~/components/PageBreadcrumb.vue'

const route = useRoute()
const pricingStore = usePricingStore()
const { setFormTitle } = useDynamicTitle()
const {
  companyId,
  requireCompanyId,
  missingMessage: activeCompanyMissing,
  ensureBootstrapped,
} = useActiveCompany()
void ensureBootstrapped()

const { form, loading, saving, error, isEditMode, isDraftEditable } = storeToRefs(pricingStore)

const formRoot = ref<HTMLElement | null>(null)
const uiErrors = ref<Record<string, string>>({})

const channelOptions = [
  { value: 'RETAIL', label: 'RETAIL (POS / Direct Sale)' },
  { value: 'PRODUCT_QUOTATION', label: 'PRODUCT_QUOTATION' },
]

const pageTitle = computed(() => (isEditMode.value ? 'Edit Pricing' : 'Tambah Pricing'))

const formSteps = computed(() => [
  {
    id: 'pricing-tab-info',
    label: 'Informasi Pricing',
    icon: 'ri-price-tag-3-line',
  },
  {
    id: 'pricing-tab-lines',
    label: 'Detail Produk',
    icon: 'ri-shopping-bag-3-line',
    badge: pricingStore.filledLines.length || null,
  },
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
  reset,
} = useTabbedFormNavigation({
  steps: formSteps,
  formRoot,
  validateStep: validatePricingStep,
})

function onProductSelect(index: number, product: any | null) {
  pricingStore.applyProductToLine(index, product)
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
  } else {
    setFormTitle('Pricing', false)
    pricingStore.resetForm({
      channel: 'RETAIL',
      perusahaanId: companyId.value,
    })
  }
})

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
