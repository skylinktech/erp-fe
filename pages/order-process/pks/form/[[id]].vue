<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="row g-4 align-items-start mb-4">
        <div class="col-xl-8 col-12">
          <div class="d-flex flex-column">
            <h4 class="mb-0">{{ pageTitle }}</h4>
            <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
            <p class="text-muted mb-0 small">{{ pageSubtitle }}</p>
          </div>
        </div>
        <div class="col-xl-4 col-12 d-flex justify-content-end">
          <NuxtLink to="/order-process/pks" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i> Kembali ke Daftar
          </NuxtLink>
        </div>
      </div>

      <div v-if="loadError" class="alert alert-danger">
        {{ loadError }}
        <NuxtLink to="/order-process/pks" class="alert-link ms-2">Kembali</NuxtLink>
      </div>

      <div v-else>
        <div class="row g-4">
          <!-- Main form column -->
          <div class="col-xl-8 col-12">
            <div class="card">
              <div class="card-body">
                <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
                  <div v-if="validationErrors?.length" class="alert alert-warning mb-4">
                    <ul class="mb-0 ps-3">
                      <li v-for="(err, i) in validationErrors" :key="i">{{ err }}</li>
                    </ul>
                  </div>

                  <!-- PKS Customer / PKS Vendor (mutually exclusive radios) -->
                  <div class="row mb-4">
                    <div class="col">
                      <FormLabel required label-class="form-label text-muted mb-2 px-5">Tipe PKS</FormLabel>

                      <div class="d-flex align-items-center gap-3">
                        <div class="form-check mb-0 px-12">
                          <input
                            class="form-check-input"
                            type="radio"
                            name="pksType"
                            id="pks-mode-customer"
                            value="CUSTOMER"
                            :checked="form.pksType === 'CUSTOMER' || form.isInternal"
                            @change="onPksTypeChange('CUSTOMER')"
                          />
                          <label class="form-check-label" for="pks-mode-customer">
                            PKS Customer
                          </label>
                        </div>

                        <div class="form-check mb-0 px-12">
                          <input
                            class="form-check-input"
                            type="radio"
                            name="pksType"
                            id="pks-mode-vendor"
                            value="VENDOR"
                            :checked="form.pksType === 'VENDOR' || form.isExternal"
                            @change="onPksTypeChange('VENDOR')"
                          />
                          <label class="form-check-label" for="pks-mode-vendor">
                            PKS Vendor
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="isCustomerPks">
                    <div class="row">
                    <div class="col">
                      <TabbedFormNav
                        :steps="visibleSteps"
                        :current-index="currentIndex"
                        :disabled="navigating || saving"
                        @select="goTo"
                      />
                    </div>
                  </div>

                  <div class="tab-content pt-4">
                    <div class="tab-pane fade" id="pks-form-tabs-info" data-step-id="pks-form-tabs-info" role="tabpanel" :class="paneClass('pks-form-tabs-info')">
                      <div class="row g-4">
                        <div class="col-md-12">
                          <FormLabel required>Customer</FormLabel>
                          <CustomSelect2
                            v-model="form.customerId"
                            :options="customers || []"
                            :get-option-label="c => c.name"
                            :reduce="c => c.id"
                            placeholder="Pilih Customer"
                            searchable
                            clearable
                            @update:modelValue="onCustomerChange"
                          />
                        </div>
                        <div class="col-md-12">
                          <label class="form-label text-muted">Description</label>
                          <textarea v-model="form.description" class="form-control" rows="3" placeholder="Description"></textarea>
                        </div>
                        <div class="col-md-6">
                          <FormLabel required html-for="pks-contract-start">Contract Start Date</FormLabel>
                          <input id="pks-contract-start" v-model="form.contractStartDate" type="date" class="form-control" aria-required="true" />
                        </div>
                        <div class="col-md-6">
                          <FormLabel required html-for="pks-contract-end">Contract End Date</FormLabel>
                          <input id="pks-contract-end" v-model="form.contractEndDate" type="date" class="form-control" aria-required="true" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted">Signing Location</label>
                          <input v-model="form.signingLocation" type="text" class="form-control" placeholder="Signing Location" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted">Signing Date</label>
                          <input v-model="form.signingDate" type="date" class="form-control" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted">Customer PIC</label>
                          <input v-model="form.custPic" type="text" class="form-control" placeholder="Customer PIC" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted">No. Tlp Customer PIC</label>
                          <input v-model="form.custPicNoTlp" type="text" class="form-control" placeholder="No. Tlp Customer PIC" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted">Site PIC</label>
                          <input v-model="form.sitePic" type="text" class="form-control" placeholder="Site PIC" />
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted">No. Tlp Site PIC</label>
                          <input v-model="form.sitePicNoTlp" type="text" class="form-control" placeholder="No. Tlp Site PIC" />
                        </div>
                      </div>
                    </div>

                    <div class="tab-pane fade" id="pks-form-tabs-subscriptions" data-step-id="pks-form-tabs-subscriptions" role="tabpanel" :class="paneClass('pks-form-tabs-subscriptions')">
                      <div class="alert alert-info mb-4">
                        <i class="ri-information-line me-2"></i>
                        <strong>Info:</strong> Jika baris subscription ditambahkan, pilih subscription dengan status <strong>signed</strong>.
                      </div>
                      <div v-for="(pksSub, index) in form.pksSubscriptions" :key="index" class="repeater-item mb-4">
                        <div class="row g-3">
                          <div class="col-md-10">
                            <FormLabel required>Subscription {{ form.pksSubscriptions.length > 1 ? `#${index + 1}` : '' }}</FormLabel>
                            <CustomSelect2
                              v-model="pksSub.subscriptionId"
                              :options="subscriptionsSigned"
                              :get-option-label="subscriptionSelectLabel"
                              :reduce="s => s?.id"
                              placeholder="Pilih Subscription (status: signed)"
                              searchable
                              clearable
                              @update:modelValue="onSubscriptionChange(index)"
                            />
                            <small v-if="pksSub.subscriptionId" class="text-muted d-block mt-1">
                              Pastikan subscription memiliki status 'signed'
                            </small>
                          </div>
                          <div class="col-md-2 d-flex align-items-end">
                            <button
                              v-if="form.pksSubscriptions.length > 1"
                              type="button"
                              class="btn btn-outline-danger w-100"
                              @click.prevent="pksStore.removeSubscription(index)"
                            >
                              <i class="ri-delete-bin-line me-1"></i> Hapus
                            </button>
                          </div>
                        </div>
                        <hr v-if="index < form.pksSubscriptions.length - 1" class="my-4">
                      </div>
                      <div class="mt-4">
                        <button type="button" class="btn btn-primary" @click.prevent="pksStore.addSubscription()">
                          <i class="ri-add-line me-1"></i> Tambah Subscription
                        </button>
                      </div>
                    </div>

                    <div class="tab-pane fade" id="pks-form-tabs-documents" data-step-id="pks-form-tabs-documents" role="tabpanel" :class="paneClass('pks-form-tabs-documents')">
                      <div class="alert alert-info mb-4">
                        <i class="ri-information-line me-2"></i>
                        <strong>Info:</strong> Documents bersifat <strong>opsional</strong>. Anda bisa simpan PKS tanpa upload dokumen.
                      </div>
                      <div v-for="(doc, index) in form.pksDocuments" :key="index" class="repeater-item mb-4">
                        <div class="row g-3">
                          <div class="col-md-4">
                            <label class="form-label text-muted">Document Type {{ form.pksDocuments.length > 1 ? `#${index + 1}` : '' }}</label>
                            <CustomSelect2
                              v-model="doc.docType"
                              :options="docTypeOptions"
                              :get-option-label="o => o.label"
                              :reduce="o => o.value"
                              placeholder="Pilih Document Type"
                              searchable
                              clearable
                            />
                          </div>
                          <div class="col-md-6">
                            <label class="form-label text-muted">Attachment</label>
                            <input
                              type="file"
                              class="form-control"
                              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                              @change="onDocumentChange($event, index)"
                            >
                            <small class="text-muted d-block mt-1">Maks. 2MB. Format: jpg, png, pdf, doc, docx, xls, xlsx, csv</small>
                            <div v-if="doc.attachmentPreview" class="mt-2">
                              <a :href="doc.attachmentPreview" target="_blank" rel="noopener noreferrer" class="d-block mb-1">Lihat Attachment</a>
                              <img
                                v-if="isImageFile(doc.attachment?.name || doc.attachmentPreview)"
                                :src="doc.attachmentPreview"
                                alt="Preview"
                                class="attachment-preview"
                                style="height: 60px; max-width: 120px; object-fit: contain; border: 2px solid #ddd; border-radius: 8px;"
                              >
                            </div>
                          </div>
                          <div class="col-md-2 d-flex align-items-end">
                            <button
                              v-if="form.pksDocuments.length > 1"
                              type="button"
                              class="btn btn-outline-danger w-100"
                              @click.prevent="pksStore.removeDocument(index)"
                            >
                              <i class="ri-delete-bin-line me-1"></i> Hapus
                            </button>
                          </div>
                        </div>
                        <hr v-if="index < form.pksDocuments.length - 1" class="my-4">
                      </div>
                      <div class="mt-4">
                        <button type="button" class="btn btn-primary" @click.prevent="pksStore.addDocument()">
                          <i class="ri-add-line me-1"></i> Tambah Document
                        </button>
                      </div>
                    </div>
                  </div>

                  </div>
                  <div v-else>
                    <hr class="my-4">
                    <div class="row g-4 px-5">
                      <div class="col-md-6">
                        <FormLabel required html-for="pks-no-surat">No. Surat</FormLabel>
                        <input id="pks-no-surat" v-model="form.noSurat" type="text" class="form-control" placeholder="No. Surat" aria-required="true" />
                      </div>
                      <div class="col-md-6">
                        <FormLabel required>Vendor</FormLabel>
                        <CustomSelect2
                          v-model="form.vendorId"
                          :options="vendors || []"
                          :get-option-label="(v: any) => v?.name || ''"
                          :reduce="(v: any) => v?.id"
                          placeholder="Pilih Vendor"
                          searchable
                          clearable
                          @update:modelValue="onVendorChange"
                        />
                      </div>
                      <div class="col-md-6">
                        <FormLabel required html-for="pks-nominal">Nominal</FormLabel>
                        <input id="pks-nominal" v-model="form.nominal" type="text" class="form-control" placeholder="Nominal" aria-required="true" />
                      </div>
                      <div class="col-md-6">
                        <FormLabel required>Purchase Order</FormLabel>
                        <CustomSelect2
                          v-model="form.purchaseOrderId"
                          :options="purchaseOrders || []"
                          :get-option-label="purchaseOrderSelectLabel"
                          :reduce="(po: any) => po?.id"
                          placeholder="Pilih Purchase Order (external)"
                          searchable
                          clearable
                          @select="onPurchaseOrderSelected"
                        />
                      </div>
                      <div class="col-12">
                        <label class="form-label text-muted">Description</label>
                        <textarea v-model="form.description" class="form-control" rows="3" placeholder="Description"></textarea>
                      </div>
                    </div>

                    <hr class="my-4">
                    <div class="px-5">
                      <div class="alert alert-info mb-4">
                        <i class="ri-information-line me-2"></i>
                        <strong>Info:</strong> Documents bersifat <strong>opsional</strong> untuk PKS Vendor.
                      </div>
                      <div v-for="(doc, index) in form.pksDocuments" :key="'vendor-doc-' + index" class="repeater-item mb-4">
                        <div class="row g-3">
                          <div class="col-md-4">
                            <label class="form-label text-muted">Document Type</label>
                            <CustomSelect2
                              v-model="doc.docType"
                              :options="docTypeOptions"
                              :get-option-label="o => o.label"
                              :reduce="o => o.value"
                              placeholder="Pilih Document Type"
                              searchable
                              clearable
                            />
                          </div>
                          <div class="col-md-6">
                            <label class="form-label text-muted">Attachment</label>
                            <input
                              type="file"
                              class="form-control"
                              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                              @change="onDocumentChange($event, index)"
                            >
                          </div>
                          <div class="col-md-2 d-flex align-items-end">
                            <button
                              v-if="form.pksDocuments.length > 1"
                              type="button"
                              class="btn btn-outline-danger w-100"
                              @click.prevent="pksStore.removeDocument(index)"
                            >
                              <i class="ri-delete-bin-line me-1"></i> Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="mt-2">
                        <button type="button" class="btn btn-primary" @click.prevent="pksStore.addDocument()">
                          <i class="ri-add-line me-1"></i> Tambah Document
                        </button>
                      </div>
                    </div>
                  </div>

                  <TabbedFormActions
                    :is-first-step="isFirstStep"
                    :is-last-step="isLastStep"
                    :loading="navigating"
                    :saving="saving"
                    cancel-label="Batal"
                    @next="next"
                    @previous="previous"
                    @cancel="handleCancel"
                  />
                </form>
              </div>
            </div>
          </div>

          <!-- Module navigation column -->
          <div class="col-xl-4 col-12">
            <div class="card mb-4">
              <div class="card-header border-0 bg-transparent px-5 py-4">
                <h5 class="card-title mb-0 d-flex align-items-center">
                  <i class="ri-menu-2-line me-2 text-primary"></i>
                  Modul
                </h5>
              </div>
              <div class="card-body px-5 pt-0 pb-5">
                <div class="list-group list-group-flush">
                  <NuxtLink
                    v-for="item in moduleNavItems"
                    :key="item.to"
                    :to="item.to"
                    class="list-group-item list-group-item-action d-flex align-items-center justify-content-between gap-3"
                    :class="{ active: isModuleNavActive(item.to) }"
                  >
                    <span class="d-flex align-items-center gap-2">
                      <i :class="item.icon" class="text-primary"></i>
                      {{ item.label }}
                    </span>
                    <i class="ri-arrow-right-s-line text-muted"></i>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePksStore, type PksType } from '~/stores/pks'
import { useCustomerStore } from '~/stores/customer'
import { useVendorStore } from '~/stores/vendor'
import { usePurchaseOrderStore } from '~/stores/purchaseOrder'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { useImageUrl } from '~/composables/useImageUrl'
import Swal from 'sweetalert2'

const route = useRoute()
const pksStore = usePksStore()
const customerStore = useCustomerStore()
const vendorStore = useVendorStore()
const purchaseOrderStore = usePurchaseOrderStore()
const { form, loading, saving, isEditMode, validationErrors } = storeToRefs(pksStore)
const { customers } = storeToRefs(customerStore)
const { vendors } = storeToRefs(vendorStore)
const { purchaseOrders } = storeToRefs(purchaseOrderStore)
const { isImageFile } = useImageUrl()

const subscriptionsSigned = ref<any[]>([])
const loadError = ref<string | null>(null)
const formRoot = ref<HTMLFormElement | null>(null)

const isCustomerPks = computed(() => (form.value?.pksType || (form.value?.isInternal ? 'CUSTOMER' : 'VENDOR')) === 'CUSTOMER')

const formSteps = computed(() => {
  if (!isCustomerPks.value) return []
  return [
    { id: 'pks-form-tabs-info', label: 'Informasi', icon: 'ri-information-line' },
    { id: 'pks-form-tabs-subscriptions', label: 'Subscriptions', icon: 'ri-file-list-3-line' },
    { id: 'pks-form-tabs-documents', label: 'Documents', icon: 'ri-file-paper-line' },
  ]
})
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
} = useTabbedFormNavigation({ steps: formSteps, formRoot })

const pksIdParam = computed(() => {
  const raw = route.params.id
  if (Array.isArray(raw)) return raw[0] ? String(raw[0]) : undefined
  return raw ? String(raw) : undefined
})

const pageTitle = computed(() => (isEditMode.value ? 'Edit PKS' : 'Tambah PKS'))
const pageSubtitle = computed(() =>
  isEditMode.value ? 'Ubah data PKS di bawah ini.' : 'Isi form untuk menambahkan PKS baru.',
)

const moduleNavItems = computed(() => [
  { label: 'PKS', to: '/order-process/pks', icon: 'ri-file-list-3-line' },
  { label: 'Subscriptions', to: '/order-process/subscription', icon: 'ri-stack-line' },
  { label: 'Customer Verification', to: '/order-process/customer-verif', icon: 'ri-verified-badge-line' },
  { label: 'Legal Tech', to: '/order-process/legal-tech', icon: 'ri-shield-check-line' },
])

function isModuleNavActive(to: string) {
  // Mark active if current page is inside that module root.
  return route.path === to || route.path.startsWith(`${to}/`)
}

const docTypeOptions = [
  { label: 'Main', value: 'main' },
  { label: 'Addendum', value: 'addendum' },
  { label: 'Amendment', value: 'amendment' },
]

function subscriptionSelectLabel(s: any) {
  if (!s) return ''
  return `${s.noSubscription || s.no_subscription || ''} - ${s.customer?.name || s.customer_name || ''} (${s.status || ''})`
}

async function fetchSubscriptionsSigned() {
  const { $api } = useNuxtApp()
  try {
    const customerId = form.value?.customerId
    const qs = new URLSearchParams({ page: '1', rows: '500', status: 'signed' })
    if (customerId) qs.append('customerId', String(customerId))
    const r = await fetch(`${$api.subscription()}?${qs.toString()}`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (!r.ok) return
    const j = await r.json()
    let list = j.data || []
    const byId = new Map(list.map((x: any) => [x.id, x]))
    const linked = (form.value.pksSubscriptions || [])
      .map((row) => row.subscription)
      .filter(Boolean) as any[]
    for (const sub of linked) {
      const id = sub?.id
      if (id && !byId.has(id)) {
        byId.set(id, sub)
        list = [...list, sub]
      }
    }
    subscriptionsSigned.value = list
  } catch (e) {
    console.error('Error fetching signed subscriptions:', e)
  }
}

function purchaseOrderSelectLabel(po: any) {
  if (!po) return ''
  const poNo = po.noPo ?? po.no_po ?? ''
  const vendorName = po.vendor?.name ?? po.extNamaPerusahaan ?? ''

  if (poNo && vendorName) return `${poNo} - ${vendorName}`
  if (poNo) return String(poNo)
  return String(po.id ?? '')
}

async function fetchExternalOptions() {
  if (isCustomerPks.value) return

  // Increase page size so the currently selected values are present in combobox.
  vendorStore.params.first = 0
  vendorStore.params.rows = 500

  purchaseOrderStore.params.first = 0
  purchaseOrderStore.params.rows = 500
  purchaseOrderStore.params.poType = 'external'

  // Optional filtering by currently selected vendor_id
  if (form.value?.vendorId != null && form.value.vendorId !== '') {
    purchaseOrderStore.params.vendorId = Number(form.value.vendorId)
  } else {
    purchaseOrderStore.params.vendorId = null
  }

  if (!vendors.value?.length) await vendorStore.fetchVendors(true)
  await purchaseOrderStore.fetchPurchaseOrders(true)
}

async function onVendorChange(vendorId: any) {
  form.value.vendorId = vendorId ?? null
  if (isCustomerPks.value) return

  purchaseOrderStore.params.poType = 'external'
  purchaseOrderStore.params.vendorId = vendorId ? Number(vendorId) : null
  purchaseOrderStore.params.first = 0
  purchaseOrderStore.params.rows = 500

  void purchaseOrderStore.fetchPurchaseOrders(true)
}

function onPurchaseOrderSelected(po: any) {
  if (!po) {
    form.value.purchaseOrderId = null
    return
  }

  form.value.purchaseOrderId = po.id ?? null
  // Help the user: set vendor_id automatically based on PO vendor.
  if (po.vendorId != null) {
    form.value.vendorId = po.vendorId
  }
}

function hasTypeSpecificData(from: PksType): boolean {
  if (from === 'CUSTOMER') {
    return !!(
      form.value.customerId ||
      form.value.contractStartDate ||
      form.value.contractEndDate ||
      (form.value.pksSubscriptions || []).some((s) => !!s.subscriptionId) ||
      (form.value.pksDocuments || []).some((d) => !!d.attachment)
    )
  }
  return !!(
    form.value.noSurat ||
    form.value.vendorId ||
    form.value.nominal ||
    form.value.purchaseOrderId ||
    (form.value.pksDocuments || []).some((d) => !!d.attachment)
  )
}

function clearFieldsForType(target: PksType) {
  if (target === 'CUSTOMER') {
    form.value.noSurat = ''
    form.value.vendorId = null
    form.value.nominal = null
    form.value.purchaseOrderId = null
  } else {
    form.value.customerId = null
    form.value.customerName = ''
    form.value.contractStartDate = null
    form.value.contractEndDate = null
    form.value.signingLocation = ''
    form.value.signingDate = null
    form.value.custPic = ''
    form.value.sitePic = ''
    form.value.custPicNoTlp = ''
    form.value.sitePicNoTlp = ''
    form.value.pksSubscriptions = []
  }
}

async function onPksTypeChange(next: PksType) {
  const current: PksType = form.value.pksType || (form.value.isInternal ? 'CUSTOMER' : 'VENDOR')
  if (current === next) return

  if (hasTypeSpecificData(current)) {
    const labelFrom = current === 'CUSTOMER' ? 'PKS Customer' : 'PKS Vendor'
    const labelTo = next === 'CUSTOMER' ? 'PKS Customer' : 'PKS Vendor'
    const result = await Swal.fire({
      title: 'Ganti tipe PKS?',
      html: `Data khusus <strong>${labelFrom}</strong> akan dihapus saat beralih ke <strong>${labelTo}</strong>. Lanjutkan?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008fec',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, ganti tipe',
      cancelButtonText: 'Batal',
    })
    if (!result.isConfirmed) {
      // Force radio to stay on current type
      pksStore.setPksType(current)
      return
    }
  }

  clearFieldsForType(next)
  pksStore.setPksType(next)
  if (next === 'VENDOR') {
    void fetchExternalOptions()
  }
}

function toYmd(d: any) {
  if (!d) return null
  try {
    return new Date(d).toISOString().split('T')[0]
  } catch {
    return null
  }
}

async function onCustomerChange(customerId: number | null) {
  if (!isCustomerPks.value) return
  if (!customerId) {
    form.value.customerName = ''
    subscriptionsSigned.value = []
    form.value.pksSubscriptions = []
    form.value.contractStartDate = null
    form.value.contractEndDate = null
    return
  }

  const customer = customers.value.find((c) => c.id === customerId)
  if (customer) form.value.customerName = customer.name

  await fetchSubscriptionsSigned()

  const firstSub = (subscriptionsSigned.value || [])[0]
  form.value.pksSubscriptions = firstSub?.id ? [{ subscriptionId: firstSub.id }] : []

  if (firstSub) {
    const cs =
      firstSub.contractStartDate ??
      firstSub.contract_start_date ??
      firstSub.targetActiveDate ??
      firstSub.target_active_date ??
      null
    const ce = firstSub.contractEndDate ?? firstSub.contract_end_date ?? null
    form.value.contractStartDate = toYmd(cs)
    form.value.contractEndDate = toYmd(ce)
  } else {
    form.value.contractStartDate = null
    form.value.contractEndDate = null
  }
}

function onSubscriptionChange(index: number) {
  if (index !== 0) return
  const subId = form.value?.pksSubscriptions?.[0]?.subscriptionId
  if (!subId) return
  const s = (subscriptionsSigned.value || []).find((x) => (x?.id || x) === subId)
  if (!s) return
  const cs = s.contractStartDate ?? s.contract_start_date ?? s.targetActiveDate ?? s.target_active_date ?? null
  const ce = s.contractEndDate ?? s.contract_end_date ?? null
  form.value.contractStartDate = toYmd(cs)
  form.value.contractEndDate = toYmd(ce)
}

function onDocumentChange(event: Event, index: number) {
  if (!form.value?.pksDocuments) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const toast = useToast()
    if (!file.size || file.size === 0) {
      toast.error({ title: 'Error', message: 'File attachment kosong atau tidak valid', color: 'red' })
      return
    }
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error({ title: 'Error', message: 'Ukuran file maksimal 2MB', color: 'red' })
      return
    }
    const ext = file.name?.split('.').pop()?.toLowerCase() || ''
    const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
    if (!allowed.includes(ext)) {
      toast.error({ title: 'Error', message: `Format tidak didukung. Gunakan: ${allowed.join(', ')}`, color: 'red' })
      return
    }
    form.value.pksDocuments[index].attachment = file
    form.value.pksDocuments[index].attachmentPreview = URL.createObjectURL(file)
  } else {
    form.value.pksDocuments[index].attachment = null
    form.value.pksDocuments[index].attachmentPreview = null
  }
  input.value = ''
}

async function loadForm() {
  pksStore.closeModal()
  loadError.value = null
  const id = pksIdParam.value
  await customerStore.fetchCustomers()
  if (id) {
    await pksStore.fetchPksForEdit(id)
    if (!form.value?.id) {
      loadError.value = (pksStore.error as any)?.message || 'Gagal memuat data PKS'
      return
    }
  } else {
    pksStore.openModal(null, { noModal: true })
  }
  await nextTick()
  if (isCustomerPks.value) {
    await fetchSubscriptionsSigned()
  } else {
    subscriptionsSigned.value = []
    await fetchExternalOptions()
  }
}

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await handleSubmit()
}

async function handleSubmit() {
  await pksStore.savePks({ navigateToList: true })
}

function handleCancel() {
  pksStore.closeModal()
  navigateTo('/order-process/pks')
}

onMounted(() => {
  loadForm()
})

watch(
  () => form.value?.pksType ?? (form.value?.isInternal ? 'CUSTOMER' : 'VENDOR'),
  async (pksType) => {
    if (pksType === 'CUSTOMER' && form.value?.customerId) {
      await fetchSubscriptionsSigned()
    } else if (pksType === 'CUSTOMER') {
      subscriptionsSigned.value = []
    } else {
      subscriptionsSigned.value = []
    }
  },
)

watch(pksIdParam, () => {
  loadForm()
})

onBeforeUnmount(() => {
  pksStore.closeModal()
})

useHead(() => ({
  title: pageTitle.value,
}))

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.repeater-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.attachment-preview {
  display: block;
  cursor: pointer;
}
</style>
