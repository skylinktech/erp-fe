<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <NuxtLink to="/order-process/subscription" class="text-muted small text-decoration-none">Subscription</NuxtLink>
            <span class="text-muted small">/</span>
            <span class="text-muted small">{{ pageTitle }}</span>
          </div>
          <h4 class="mb-0">{{ pageTitle }}</h4>
          <p class="text-muted mb-0 small">{{ pageSubtitle }}</p>
        </div>
        <NuxtLink to="/order-process/subscription" class="btn btn-outline-secondary btn-sm">
          <i class="ri-arrow-left-line me-1"></i> Kembali
        </NuxtLink>
      </div>

      <div class="row g-4">
        <div class="col-xl-8 col-12">
          <div class="card">
            <div class="card-body">
              <form @submit.prevent="handleSubmit" novalidate>
            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#subscription-tab-info" role="tab" type="button">
                  <span class="ri-information-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Informasi</span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#subscription-tab-installation" role="tab" type="button">
                  <span class="ri-building-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Installation & Contact</span>
                </button>
              </li>
            </ul>

            <div class="tab-content pt-4">
              <div id="subscription-tab-info" class="tab-pane fade active show" role="tabpanel">
                <div class="row g-4">
                  <div class="col-12">
                    <div v-if="!isEditMode && !prefilledQuotationId" class="alert alert-info mb-2">
                      <i class="ri-information-line me-2"></i>
                      Pilih Quotation yang sudah approved untuk membuat Subscription. Data akan terisi otomatis.
                    </div>
                    <div v-if="prefilledQuotationId && prefilledLeTechReviewId" class="alert alert-success mb-2">
                      <label class="form-label text-muted me-1">Status Verifikasi</label>
                      <div>
                        <span class="badge bg-label-success">
                          <i class="ri-user-line me-1"></i>
                          Verified by Legal Review ({{ prefilledLeTechReviewNo || '-' }})
                        </span>
                      </div>
                    </div>
                    <label class="form-label text-muted">Quotation (approved)</label>
                    <CustomSelect2
                      v-model="localForm.quotationId"
                      :options="quotationsApproved"
                      :get-option-label="o => o ? (o.noQuotation || o.no_quotation || '') + ' - ' + (o.customer?.name || o.customer_name || '') : ''"
                      :reduce="o => o?.id"
                      :disabled="isEditMode || !!prefilledQuotationId"
                      searchable
                      clearable
                      placeholder="Pilih Quotation"
                      @update:modelValue="onQuotationChange"
                    />
                  </div>
                </div>

                <div class="row g-4 mt-2">
                  <div class="col-md-6">
                    <label class="form-label text-muted">Customer Name</label>
                    <input type="text" :value="localForm.customerName" class="form-control bg-light" readonly />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Service Plan</label>
                    <input type="text" :value="servicePlanNameFromQuotation" class="form-control bg-light" readonly />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">One Time Charge (OTC)</label>
                    <input type="text" :value="formatRupiah(otcFromQuotationItems)" class="form-control bg-light" readonly />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Monthly Recurring (MRC)</label>
                    <input type="text" :value="localForm.subscriptionServices && localForm.subscriptionServices.length > 0 ? formatRupiah(localForm.subscriptionServices[0].mrcAmount) : formatRupiah(0)" class="form-control bg-light" readonly />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Payment Method</label>
                    <input v-model="localForm.paymentMethod" type="text" class="form-control" placeholder="Payment Method" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Term of Payment</label>
                    <input type="text" :value="localForm.termOfPayment" class="form-control bg-light" readonly />
                  </div>
                </div>

                <div class="row g-4 mt-2">
                  <div class="col-md-6">
                    <label class="form-label text-muted">Contract Period (Months)</label>
                    <input v-model.number="localForm.contractPeriod" type="number" class="form-control" min="1" placeholder="12" @input="calculateContractEndDate" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted">Target Activation Date</label>
                    <input v-model="localForm.targetActiveDate" type="date" class="form-control" @change="calculateContractEndDate" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted">Contract End Date (Auto-calculated)</label>
                    <input type="text" :value="localForm.contractEndDate ? new Date(localForm.contractEndDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'" class="form-control bg-light" readonly />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-muted">Attachments (Multiple)</label>
                    <input type="file" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv" multiple @change="onAttachmentsChange">
                    <small class="text-muted d-block mt-1">Maks. 2MB per file. Format: jpg, png, pdf, doc, docx, xls, xlsx, csv.</small>
                    <div v-if="(localForm.attachmentPreviews && localForm.attachmentPreviews.length > 0) || (localForm.existingAttachments && localForm.existingAttachments.length > 0)" class="mt-3">
                      <div v-for="(preview, idx) in (localForm.attachmentPreviews || [])" :key="'new-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                        <i class="ri-file-line text-primary"></i>
                        <span class="flex-grow-1 small">{{ getFileNameFromPreview(preview) }}</span>
                        <button type="button" class="btn btn-sm btn-text-danger p-0" @click="removeAttachment(idx, 'new')"><i class="ri-close-circle-line"></i></button>
                      </div>
                      <div v-for="(url, idx) in (localForm.existingAttachments || [])" :key="'existing-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                        <i class="ri-file-line text-success"></i>
                        <a :href="getAttachmentUrl(url)" target="_blank" rel="noopener noreferrer" class="flex-grow-1 small text-decoration-none">{{ getFileNameFromUrl(url) }}</a>
                        <button type="button" class="btn btn-sm btn-text-danger p-0" @click="removeAttachment(idx, 'existing')"><i class="ri-close-circle-line"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="subscription-tab-installation" class="tab-pane fade" role="tabpanel">
                <div class="row g-4">
                  <div class="col-12">
                    <div v-for="(installation, index) in localForm.subscriptionInstallations" :key="index" class="repeater-item mb-4">
                      <div class="repeater-title d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0 fw-semibold text-dark"><i class="ri-map-pin-line me-2 text-primary"></i>Installation Address {{ localForm.subscriptionInstallations.length > 1 ? `#${index + 1}` : '' }}</h6>
                      </div>
                      <hr class="repeater-hr mt-0 mb-3" />
                      <div class="row g-3">
                        <div class="col-12">
                          <label class="form-label text-muted">Alamat Instalasi</label>
                          <textarea v-model="installation.installAddress" class="form-control" rows="3" placeholder="Full address for installation..."></textarea>
                        </div>
                        <div class="col-12 d-flex justify-content-end" v-if="localForm.subscriptionInstallations.length > 1">
                          <button type="button" class="btn btn-outline-danger" @click.prevent="removeInstallation(index)"><i class="ri-delete-bin-line me-1"></i> Hapus</button>
                        </div>
                      </div>
                    </div>
                    <hr class="section-hr my-4" />
                    <div class="mt-4">
                      <button type="button" class="btn btn-primary btn-sm w-100" @click.prevent="addInstallation()"><i class="ri-add-line me-1"></i> Tambah Alamat Instalasi</button>
                    </div>
                  </div>

                  <div class="col-12">
                    <div v-for="(contact, index) in billingContacts" :key="`billing-${index}`" class="repeater-item mb-4">
                      <div class="repeater-title d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0 fw-semibold text-dark"><i class="ri-user-line me-2 text-primary"></i>Billing Contact {{ billingContacts.length > 1 ? `#${index + 1}` : '' }}</h6>
                      </div>
                      <hr class="repeater-hr mt-0 mb-3" />
                      <div class="row g-3">
                        <div class="col-md-6"><label class="form-label text-muted">Name</label><input v-model="contact.name" type="text" class="form-control" /></div>
                        <div class="col-md-6"><label class="form-label text-muted">Department</label><input v-model="contact.department" type="text" class="form-control" /></div>
                        <div class="col-md-6"><label class="form-label text-muted">Phone</label><input v-model="contact.phone" type="text" class="form-control" /></div>
                        <div class="col-md-6"><label class="form-label text-muted">Email</label><input v-model="contact.email" type="email" class="form-control" /></div>
                        <div class="col-md-12 d-flex justify-content-end">
                          <button type="button" class="btn btn-outline-danger" @click.prevent="removeContact(localForm.subscriptionContacts.indexOf(contact))"><i class="ri-delete-bin-line me-1"></i> Hapus</button>
                        </div>
                      </div>
                    </div>
                    <hr class="section-hr my-4" />
                    <div class="mt-4">
                      <button type="button" class="btn btn-primary btn-sm w-100" @click.prevent="addBillingContact()"><i class="ri-add-line me-1"></i> Tambah Billing Contact</button>
                    </div>
                  </div>

                  <div class="col-12">
                    <div v-for="(contact, index) in technicalContacts" :key="`technical-${index}`" class="repeater-item mb-4">
                      <div class="repeater-title d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0 fw-semibold text-dark"><i class="ri-user-settings-line me-2 text-primary"></i>Technical Contact {{ technicalContacts.length > 1 ? `#${index + 1}` : '' }}</h6>
                      </div>
                      <hr class="repeater-hr mt-0 mb-3" />
                      <div class="row g-3">
                        <div class="col-md-6"><label class="form-label text-muted">Name</label><input v-model="contact.name" type="text" class="form-control" /></div>
                        <div class="col-md-6"><label class="form-label text-muted">Department</label><input v-model="contact.department" type="text" class="form-control" /></div>
                        <div class="col-md-6"><label class="form-label text-muted">Phone</label><input v-model="contact.phone" type="text" class="form-control" /></div>
                        <div class="col-md-6"><label class="form-label text-muted">Email</label><input v-model="contact.email" type="email" class="form-control" /></div>
                        <div class="col-md-12 d-flex justify-content-end">
                          <button type="button" class="btn btn-outline-danger" @click.prevent="removeContact(localForm.subscriptionContacts.indexOf(contact))"><i class="ri-delete-bin-line me-1"></i> Hapus</button>
                        </div>
                      </div>
                    </div>
                    <hr class="section-hr my-4" />
                    <div class="mt-4">
                      <button type="button" class="btn btn-primary btn-sm w-100" @click.prevent="addTechnicalContact()"><i class="ri-add-line me-1"></i> Tambah Technical Contact</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-6">
              <button type="button" class="btn btn-outline-secondary" @click="navigateTo('/order-process/subscription')">Tutup</button>
              <button type="submit" class="btn btn-primary ms-2" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Simpan
              </button>
            </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-xl-4 col-12">
          <div class="card shadow-sm border-0">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0 d-flex align-items-center">
                <i class="ri-menu-2-line me-2 text-primary"></i>
                Modul Order Process
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubscriptionStore } from '~/stores/subscription'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useImageUrl } from '~/composables/useImageUrl'

const route = useRoute()
const subscriptionStore = useSubscriptionStore()
const formatRupiah = useFormatRupiah()
const { getAttachmentUrl } = useImageUrl()
const { form, isEditMode, saving } = storeToRefs(subscriptionStore)

const quotationsApproved = ref<any[]>([])
const selectedQuotation = ref<any>(null)
const prefilledQuotationId = computed(() => route.query.quotationId ? String(route.query.quotationId) : null)
const prefilledLeTechReviewId = computed(() => route.query.leTechReviewId ? Number(route.query.leTechReviewId) : null)
const prefilledLeTechReviewNo = computed(() => route.query.leTechReviewNo ? String(route.query.leTechReviewNo) : null)
const prefilledPurchaseRequestId = computed(() => route.query.purchaseRequestId ? String(route.query.purchaseRequestId) : null)
const pageTitle = computed(() => (isEditMode.value ? 'Edit Subscription' : 'Tambah Subscription'))
const pageSubtitle = computed(() => (isEditMode.value ? 'Perbarui data subscription.' : 'Isi form untuk membuat subscription baru.'))
const moduleNavItems = computed(() => [
  { label: 'Subscription', to: '/order-process/subscription', icon: 'ri-file-list-3-line' },
  { label: 'PKS', to: '/order-process/pks', icon: 'ri-file-text-line' },
  { label: 'Legal Tech', to: '/order-process/legal-tech', icon: 'ri-shield-check-line' },
  { label: 'Customer Verification', to: '/order-process/customer-verif', icon: 'ri-user-search-line' },
])

const localForm = computed({
  get: () => form.value,
  set: (val) => { form.value = val },
})

const billingContacts = computed({
  get: () => localForm.value.subscriptionContacts?.filter(c => c.contactType === 'billing') || [],
  set: (val) => {
    const others = localForm.value.subscriptionContacts?.filter(c => c.contactType !== 'billing') || []
    localForm.value.subscriptionContacts = [...others, ...val]
  },
})

const technicalContacts = computed({
  get: () => localForm.value.subscriptionContacts?.filter(c => c.contactType === 'technical') || [],
  set: (val) => {
    const others = localForm.value.subscriptionContacts?.filter(c => c.contactType !== 'technical') || []
    localForm.value.subscriptionContacts = [...others, ...val]
  },
})

const servicePlanNameFromQuotation = computed(() => {
  if (!selectedQuotation.value) return ''
  const services = selectedQuotation.value.quotationServices ?? selectedQuotation.value.quotation_services ?? []
  return services[0]?.servicePlan?.name ?? services[0]?.service_plan_name ?? services[0]?.service?.servicePlan?.name ?? ''
})

const otcFromQuotationItems = computed(() => {
  if (localForm.value.subscriptionServices?.length) return Number(localForm.value.subscriptionServices[0].otcAmount) || 0
  const items = selectedQuotation.value?.quotationItems ?? selectedQuotation.value?.quotation_items ?? []
  return items.reduce((total: number, item: any) => {
    const billingType = item?.product?.billingType ?? item?.product?.billing_type ?? 'one_time'
    if (billingType !== 'one_time') return total
    return total + ((Number(item.quantity) || 0) * (Number(item.price) || 0))
  }, 0)
})

async function fetchQuotationsApproved() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.quotation()}?page=1&rows=500&status=approved&includeItems=true`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    if (r.ok) {
      const j = await r.json()
      quotationsApproved.value = j.data || []
    }
  } catch (e) {
    console.error(e)
  }
}

function addInstallation() { subscriptionStore.addInstallation() }
function removeInstallation(index: number) { subscriptionStore.removeInstallation(index) }
function removeContact(index: number) { subscriptionStore.removeContact(index) }
function addBillingContact() { subscriptionStore.addContact(); localForm.value.subscriptionContacts.at(-1)!.contactType = 'billing' }
function addTechnicalContact() { subscriptionStore.addContact(); localForm.value.subscriptionContacts.at(-1)!.contactType = 'technical' }

function calculateContractEndDate() {
  if (!localForm.value.contractPeriod || !localForm.value.targetActiveDate) {
    localForm.value.contractEndDate = null
    return
  }
  const startDate = new Date(localForm.value.targetActiveDate)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + Number(localForm.value.contractPeriod))
  localForm.value.contractEndDate = endDate.toISOString().split('T')[0]
}

async function onQuotationChange(quotationId: string | null) {
  if (!quotationId) return
  const { $api } = useNuxtApp()
  const r = await fetch(`${$api.quotation()}/${quotationId}?includeItems=true&includeServices=true`, { headers: { Accept: 'application/json' }, credentials: 'include' })
  if (!r.ok) return
  const j = await r.json()
  const q = j.data || j
  selectedQuotation.value = q
  localForm.value.customerId = q.customerId ?? q.customer_id ?? q.customer?.id ?? null
  localForm.value.customerName = q.customer?.name ?? q.customer_name ?? ''
  localForm.value.termOfPayment = q.termOfPayment ?? q.term_of_payment ?? 'Net 30 Days'
  localForm.value.purchaseRequestId = q.purchaseRequestId ?? q.purchase_request_id ?? q.purchaseRequest?.id ?? localForm.value.purchaseRequestId
  const services = q.quotationServices ?? q.quotation_services ?? []
  const items = q.quotationItems ?? q.quotation_items ?? []
  const totalOtcFromItems = items.reduce((total: number, item: any) => {
    const billingType = item?.product?.billingType ?? item?.product?.billing_type ?? 'one_time'
    if (billingType !== 'one_time') return total
    return total + ((Number(item.quantity) || 0) * (Number(item.price) || 0))
  }, 0)
  localForm.value.subscriptionServices = services.map((s: any, index: number) => {
    const planName = s.service?.servicePlan?.name ?? s.servicePlan?.name ?? s.planName ?? s.plan_name ?? s.service_plan_name ?? s.service_plan ?? s.service?.name ?? 'N/A'
    return {
      serviceId: s.serviceId ?? s.service_id ?? s.service?.id ?? 0,
      serviceName: s.service?.name ?? s.serviceName ?? s.service_name ?? '',
      servicePlan: planName,
      planName,
      quantity: Number(s.quantity) || 1,
      mrcAmount: Number(s.mrcAmount ?? s.mrc_amount ?? s.price) || 0,
      otcAmount: index === 0 && totalOtcFromItems > 0 ? totalOtcFromItems : (Number(s.otcAmount ?? s.otc_amount) || 0),
      startDate: null,
      endDate: null,
    }
  })
}

function onAttachmentsChange(e: Event) {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (!files.length) return
  if (!localForm.value.attachments) localForm.value.attachments = []
  if (!localForm.value.attachmentPreviews) localForm.value.attachmentPreviews = []
  localForm.value.attachments.push(...files)
  localForm.value.attachmentPreviews.push(...files.map((f) => URL.createObjectURL(f)))
  target.value = ''
}

function removeAttachment(index: number, type: 'new' | 'existing') {
  if (type === 'new') {
    const url = localForm.value.attachmentPreviews?.[index]
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    localForm.value.attachmentPreviews?.splice(index, 1)
    localForm.value.attachments?.splice(index, 1)
  } else {
    localForm.value.existingAttachments?.splice(index, 1)
  }
}

function getFileNameFromPreview(preview: string) {
  const idx = localForm.value.attachmentPreviews?.indexOf(preview) ?? -1
  return idx >= 0 ? localForm.value.attachments?.[idx]?.name || 'File' : 'File'
}

function getFileNameFromUrl(url: string) {
  return url?.split('/').pop() || 'File'
}

function isModuleNavActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

async function handleSubmit() {
  const ok = await subscriptionStore.saveSubscription()
  if (ok) navigateTo('/order-process/subscription')
}

function ensureDefaultRepeaters() {
  if (!localForm.value.subscriptionInstallations || localForm.value.subscriptionInstallations.length === 0) addInstallation()
  if (!localForm.value.subscriptionContacts) localForm.value.subscriptionContacts = []
  const hasBilling = localForm.value.subscriptionContacts.some((c) => c.contactType === 'billing')
  const hasTechnical = localForm.value.subscriptionContacts.some((c) => c.contactType === 'technical')
  if (!hasBilling) addBillingContact()
  if (!hasTechnical) addTechnicalContact()
}

onMounted(async () => {
  await fetchQuotationsApproved()
  const id = route.params.id ? String(route.params.id) : null
  if (id) {
    await subscriptionStore.fetchSubscriptionForEdit(id)
    if (localForm.value.quotationId) await onQuotationChange(String(localForm.value.quotationId))
  } else {
    subscriptionStore.openModal(null)
    subscriptionStore.showModal = false
    if (prefilledQuotationId.value) {
      localForm.value.quotationId = prefilledQuotationId.value
      if (prefilledPurchaseRequestId.value) localForm.value.purchaseRequestId = prefilledPurchaseRequestId.value
      if (prefilledLeTechReviewId.value) localForm.value.leTechReviewId = prefilledLeTechReviewId.value
      await onQuotationChange(prefilledQuotationId.value)
    }
  }
  ensureDefaultRepeaters()
})
</script>

<style scoped>
.repeater-item { background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #e9ecef; }
.repeater-hr { border-top: 2px solid #e9ecef; opacity: 1; }
.section-hr { border-top: 2px dashed #e9ecef; opacity: 1; }
</style>
