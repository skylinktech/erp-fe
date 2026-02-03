<template>
  <Modal :id="modalId" :title="modalTitle" :description="modalDescription" :validation-errors-from-parent="validationErrors" dialog-class="modal-xl">
    <template #default>
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col">
            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="`#${modalId}-form-tabs-info`" role="tab" aria-selected="true" type="button">
                  <span class="ri-information-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Informasi</span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" :data-bs-target="`#${modalId}-form-tabs-installation`" role="tab" aria-selected="false" type="button">
                  <span class="ri-building-line ri-20px d-sm-none"></span>
                  <span class="d-none d-sm-block">Installation & Contact</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="tab-content pt-4">
          <!-- Tab Informasi -->
          <div class="tab-pane fade active show" :id="`${modalId}-form-tabs-info`" role="tabpanel">
            <div class="row g-4">
              <!-- Quotation Selection -->
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
                      Verified by Legal Review ({{ leTechReviewInfo }})
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
                <small v-if="localForm.quotationId" class="text-muted d-block mt-1">
                  Based on Quotation: 
                  <a href="javascript:void(0)" @click="navigateTo(`/sales/quotation/detail/${localForm.quotationId}`)" class="text-primary">
                    {{ quotationNo || '-' }}
                  </a>
                </small>
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
                <input type="text" v-model="localForm.paymentMethod" class="form-control" placeholder="Payment Method" />
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">Term of Payment</label>
                <input type="text" :value="localForm.termOfPayment" class="form-control bg-light" readonly />
              </div>
            </div>
            <div class="row g-4 mt-2">
              <div class="col-md-6">
                <label class="form-label text-muted">Contract Period (Months)</label>
                <input type="number" v-model.number="localForm.contractPeriod" class="form-control" min="1" placeholder="12" @input="calculateContractEndDate" />
              </div>
              <div class="col-md-3">
                <label class="form-label text-muted">Target Activation Date</label>
                <input type="date" v-model="localForm.targetActiveDate" class="form-control" @change="calculateContractEndDate" />
              </div>
              <div class="col-md-3">
                <label class="form-label text-muted">Contract End Date (Auto-calculated)</label>
                <input type="text" :value="localForm.contractEndDate ? new Date(localForm.contractEndDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'" class="form-control bg-light" readonly />
              </div>
              <!-- Attachments -->
              <div class="col-12">
                <label class="form-label text-muted">Attachments (Multiple)</label>
                <input
                  type="file"
                  @change="onAttachmentsChange"
                  class="form-control"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                  multiple
                >
                <small class="text-muted d-block mt-1">Maks. 2MB per file. Format: jpg, png, pdf, doc, docx, xls, xlsx, csv. Bisa pilih beberapa file.</small>
                <div v-if="(localForm.attachmentPreviews && localForm.attachmentPreviews.length > 0) || (localForm.existingAttachments && localForm.existingAttachments.length > 0)" class="mt-3">
                  <div v-for="(preview, idx) in (localForm.attachmentPreviews || [])" :key="'new-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                    <i class="ri-file-line text-primary"></i>
                    <span class="flex-grow-1 small">{{ getFileNameFromPreview(preview) }}</span>
                    <button type="button" @click="removeAttachment(idx, 'new')" class="btn btn-sm btn-text-danger p-0"><i class="ri-close-circle-line"></i></button>
                  </div>
                  <div v-for="(url, idx) in (localForm.existingAttachments || [])" :key="'existing-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                    <i class="ri-file-line text-success"></i>
                    <a :href="getAttachmentUrl(url)" target="_blank" rel="noopener noreferrer" class="flex-grow-1 small text-decoration-none">{{ getFileNameFromUrl(url) }}</a>
                    <button type="button" @click="removeAttachment(idx, 'existing')" class="btn btn-sm btn-text-danger p-0"><i class="ri-close-circle-line"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Installation & Contact -->
          <div class="tab-pane fade" :id="`${modalId}-form-tabs-installation`" role="tabpanel">
            <div class="row g-4">
              <!-- Installation Addresses -->
              <div class="col-12">
                <div v-for="(installation, index) in localForm.subscriptionInstallations" :key="index" class="repeater-item mb-4">
                  <div class="repeater-title d-flex align-items-center justify-content-between mb-3">
                    <h6 class="mb-0 fw-semibold text-dark">
                      <i class="ri-map-pin-line me-2 text-primary"></i>
                      Installation Address {{ localForm.subscriptionInstallations.length > 1 ? `#${index + 1}` : '' }}
                    </h6>
                  </div>
                  <hr class="repeater-hr mt-0 mb-3" />
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label text-muted">Alamat Instalasi</label>
                      <textarea v-model="installation.installAddress" class="form-control" rows="3" placeholder="Full address for installation..."></textarea>
                    </div>
                    <div class="col-12 d-flex justify-content-end" v-if="localForm.subscriptionInstallations.length > 1">
                      <button type="button" class="btn btn-outline-danger" @click.prevent="removeInstallation(index)">
                        <i class="ri-delete-bin-line me-1"></i> Hapus
                      </button>
                    </div>
                  </div>
                </div>
                <hr class="section-hr my-4" />
                <div class="mt-4">
                  <button type="button" class="btn btn-primary btn-sm w-100" @click.prevent="addInstallation()">
                    <i class="ri-add-line me-1"></i> Tambah Alamat Instalasi
                  </button>
                </div>
              </div>

              <!-- Billing Contact -->
              <div class="col-12">
                <div v-for="(contact, index) in billingContacts" :key="`billing-${index}`" class="repeater-item mb-4">
                  <div class="repeater-title d-flex align-items-center justify-content-between mb-3">
                    <h6 class="mb-0 fw-semibold text-dark">
                      <i class="ri-user-line me-2 text-primary"></i>
                      Billing Contact {{ billingContacts.length > 1 ? `#${index + 1}` : '' }}
                    </h6>
                  </div>
                  <hr class="repeater-hr mt-0 mb-3" />
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Name</label>
                      <input type="text" v-model="contact.name" class="form-control" placeholder="e.g. Finance Dept / Ibu Ani" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Department</label>
                      <input type="text" v-model="contact.department" class="form-control" placeholder="Department" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Phone</label>
                      <input type="text" v-model="contact.phone" class="form-control" placeholder="Phone number" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Email</label>
                      <input type="email" v-model="contact.email" class="form-control" placeholder="Email address" />
                    </div>
                    <div class="col-md-12 d-flex justify-content-end">
                      <button type="button" class="btn btn-outline-danger" @click.prevent="removeContact(localForm.subscriptionContacts.indexOf(contact))">
                        <i class="ri-delete-bin-line me-1"></i> Hapus
                      </button>
                    </div>
                  </div>
                </div>
                <hr class="section-hr my-4" />
                <div class="mt-4">
                  <button type="button" class="btn btn-primary btn-sm w-100" @click.prevent="addBillingContact()">
                    <i class="ri-add-line me-1"></i> Tambah Billing Contact
                  </button>
                </div>
              </div>

              <!-- Technical Contact -->
              <div class="col-12">
                <div v-for="(contact, index) in technicalContacts" :key="`technical-${index}`" class="repeater-item mb-4">
                  <div class="repeater-title d-flex align-items-center justify-content-between mb-3">
                    <h6 class="mb-0 fw-semibold text-dark">
                      <i class="ri-user-settings-line me-2 text-primary"></i>
                      Technical Contact {{ technicalContacts.length > 1 ? `#${index + 1}` : '' }}
                    </h6>
                  </div>
                  <hr class="repeater-hr mt-0 mb-3" />
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Name</label>
                      <input type="text" v-model="contact.name" class="form-control" placeholder="e.g. IT Manager / Pak Budi" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Department</label>
                      <input type="text" v-model="contact.department" class="form-control" placeholder="Department" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Phone</label>
                      <input type="text" v-model="contact.phone" class="form-control" placeholder="Phone number" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Email</label>
                      <input type="email" v-model="contact.email" class="form-control" placeholder="Email address" />
                    </div>
                    <div class="col-md-12 d-flex justify-content-end">
                      <button type="button" class="btn btn-outline-danger" @click.prevent="removeContact(localForm.subscriptionContacts.indexOf(contact))">
                        <i class="ri-delete-bin-line me-1"></i> Hapus
                      </button>
                    </div>
                  </div>
                </div>
                <hr class="section-hr my-4" />
                <div class="mt-4">
                  <button type="button" class="btn btn-primary btn-sm w-100" @click.prevent="addTechnicalContact()">
                    <i class="ri-add-line me-1"></i> Tambah Technical Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer mt-6">
          <button type="button" class="btn btn-outline-secondary" @click="handleClose">Tutup</button>
          <button type="submit" class="btn btn-primary ms-2" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Simpan
          </button>
        </div>
      </form>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubscriptionStore } from '~/stores/subscription'
import Modal from '~/components/modal/Modal.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import { useImageUrl } from '~/composables/useImageUrl'

const props = defineProps({
  modalId: {
    type: String,
    default: 'SubscriptionFormModal'
  },
  // Pre-filled data from Legal Tech Review
  prefilledQuotationId: {
    type: [String, Number],
    default: null
  },
  prefilledLeTechReviewId: {
    type: [String, Number],
    default: null
  },
  prefilledLeTechReviewNo: {
    type: String,
    default: null
  },
  prefilledIroId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const subscriptionStore = useSubscriptionStore()
const formatRupiah = useFormatRupiah()
const { getAttachmentUrl } = useImageUrl()

const { form, isEditMode, showModal, validationErrors, loading } = storeToRefs(subscriptionStore)

// Local form reference that syncs with store
const localForm = computed({
  get: () => form.value,
  set: (val) => { form.value = val }
})

const quotationsApproved = ref([])
const selectedQuotation = ref(null)
let modalInstance = null

const modalTitle = computed(() => (isEditMode.value ? 'Edit Subscription' : 'Tambah Subscription'))
const modalDescription = computed(() => (isEditMode.value ? 'Ubah data Subscription di bawah ini.' : 'Isi form untuk menambahkan Subscription baru.'))

const quotationNo = computed(() => {
  if (!localForm.value.quotationId) return ''
  const q = quotationsApproved.value.find((x) => (x.id || x) === (localForm.value.quotationId || localForm.value.quotation_id))
  return q?.noQuotation || q?.no_quotation || ''
})

const leTechReviewInfo = computed(() => {
  // Show info from prefilled data or from form
  if (props.prefilledLeTechReviewNo) return props.prefilledLeTechReviewNo
  if (localForm.value.leTechReviewId) return `LR-${String(localForm.value.leTechReviewId).padStart(3, '0')}`
  return null
})

const billingContacts = computed({
  get: () => localForm.value.subscriptionContacts?.filter(c => c.contactType === 'billing') || [],
  set: (val) => {
    const otherContacts = localForm.value.subscriptionContacts?.filter(c => c.contactType !== 'billing') || []
    localForm.value.subscriptionContacts = [...otherContacts, ...val]
  }
})

const technicalContacts = computed({
  get: () => localForm.value.subscriptionContacts?.filter(c => c.contactType === 'technical') || [],
  set: (val) => {
    const otherContacts = localForm.value.subscriptionContacts?.filter(c => c.contactType !== 'technical') || []
    localForm.value.subscriptionContacts = [...otherContacts, ...val]
  }
})

// Service Plan dari quotation_service->servicePlan->name
const servicePlanNameFromQuotation = computed(() => {
  if (!selectedQuotation.value) return ''
  const services = selectedQuotation.value.quotationServices ?? selectedQuotation.value.quotation_services ?? []
  if (services.length === 0) return ''
  const firstService = services[0]
  return firstService?.servicePlan?.name ?? firstService?.service_plan_name ?? firstService?.service?.servicePlan?.name ?? ''
})

// OTC dari quotation_items->product.billing_type == 'one_time'
const otcFromQuotationItems = computed(() => {
  // Prioritas 1: Ambil dari form subscriptionServices (jika sudah terisi, untuk edit mode atau setelah autofill)
  if (localForm.value.subscriptionServices && localForm.value.subscriptionServices.length > 0) {
    const otcFromForm = Number(localForm.value.subscriptionServices[0].otcAmount) || 0
    if (otcFromForm > 0) {
      return otcFromForm
    }
  }
  
  // Prioritas 2: Hitung dari selectedQuotation items
  if (selectedQuotation.value) {
    const items = selectedQuotation.value.quotationItems ?? selectedQuotation.value.quotation_items ?? []
    if (items.length > 0) {
      const total = items.reduce((total, item) => {
        const billingType = item?.product?.billingType ?? item?.product?.billing_type ?? 'one_time'
        if (billingType === 'one_time') {
          const qty = Number(item.quantity) || 0
          const price = Number(item.price) || 0
          return total + (qty * price)
        }
        return total
      }, 0)
      if (total > 0) {
        return total
      }
    }
  }
  
  return 0
})

function addBillingContact() {
  subscriptionStore.addContact()
  const contacts = localForm.value.subscriptionContacts || []
  const lastContact = contacts[contacts.length - 1]
  if (lastContact) lastContact.contactType = 'billing'
}

function addTechnicalContact() {
  subscriptionStore.addContact()
  const contacts = localForm.value.subscriptionContacts || []
  const lastContact = contacts[contacts.length - 1]
  if (lastContact) lastContact.contactType = 'technical'
}

function addInstallation() {
  subscriptionStore.addInstallation()
}

function removeInstallation(index) {
  subscriptionStore.removeInstallation(index)
}

function removeContact(index) {
  subscriptionStore.removeContact(index)
}

function calculateContractEndDate() {
  if (!localForm.value.contractPeriod || !localForm.value.targetActiveDate) {
    localForm.value.contractEndDate = null
    return
  }
  const startDate = new Date(localForm.value.targetActiveDate)
  const months = Number(localForm.value.contractPeriod) || 0
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + months)
  localForm.value.contractEndDate = endDate.toISOString().split('T')[0]
}

async function fetchQuotationsApproved() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.quotation()}?page=1&rows=500&status=approved&includeItems=true`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) { const j = await r.json(); quotationsApproved.value = j.data || [] }
  } catch (e) { console.error(e) }
}

async function onQuotationChange(quotationId) {
  console.log('onQuotationChange called with quotationId:', quotationId)
  if (!localForm.value) return
  if (!quotationId) {
    localForm.value.customerId = null
    localForm.value.customerName = ''
    localForm.value.subscriptionServices = []
    localForm.value.termOfPayment = ''
    selectedQuotation.value = null
    return
  }
  const { $api } = useNuxtApp()
  try {
    // Fetch quotation dengan includeItems dan includeServices untuk mendapatkan quotationItems dan quotationServices
    const r = await fetch(`${$api.quotation()}/${quotationId}?includeItems=true&includeServices=true`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (!r.ok) {
      console.error('Failed to fetch quotation:', r.status, r.statusText)
      return
    }
    const j = await r.json()
    const q = j.data || j
    console.log('Quotation data loaded:', {
      id: q.id,
      customerId: q.customerId || q.customer_id,
      servicesCount: (q.quotationServices || q.quotation_services || []).length,
      itemsCount: (q.quotationItems || q.quotation_items || []).length
    })
    
    // Simpan quotation data untuk computed properties (pastikan quotationItems ter-load)
    selectedQuotation.value = q
    
    // Autofill customer
    const customerId = q.customerId ?? q.customer_id ?? q.customer?.id ?? null
    const customerName = q.customer?.name ?? q.customer_name ?? ''
    localForm.value.customerId = customerId
    localForm.value.customerName = customerName
    
    // Autofill term of payment dari quotation (payment method tidak autofill)
    localForm.value.termOfPayment = q.termOfPayment ?? q.term_of_payment ?? 'Net 30 Days'
    
    // Hitung total OTC dari quotation items
    const items = q.quotationItems ?? q.quotation_items ?? []
    const totalOtcFromItems = items.reduce((total, item) => {
      const billingType = item?.product?.billingType ?? item?.product?.billing_type ?? 'one_time'
      if (billingType === 'one_time') {
        const qty = Number(item.quantity) || 0
        const price = Number(item.price) || 0
        return total + (qty * price)
      }
      return total
    }, 0)
    
    // Autofill services dari quotation services
    const services = q.quotationServices ?? q.quotation_services ?? []
    if (services.length > 0) {
      localForm.value.subscriptionServices = services.map((s, index) => {
        // Ambil planName dari berbagai sumber (prioritas: service.servicePlan.name > servicePlan.name > planName langsung)
        let planName = s.service?.servicePlan?.name ?? s.servicePlan?.name ?? s.planName ?? s.plan_name ?? s.service_plan_name ?? ''
        
        // Jika masih kosong, coba ambil dari servicePlan string
        if (!planName || planName.trim() === '') {
          planName = s.service_plan || ''
        }
        
        // Ambil servicePlan (sama dengan planName untuk konsistensi)
        const servicePlan = planName || s.service_plan || ''
        
        // Pastikan planName tidak kosong (required field)
        if (!planName || planName.trim() === '') {
          console.warn('planName kosong untuk service:', s)
          // Coba ambil dari service description sebagai fallback terakhir
          planName = s.service?.description || s.service?.name || 'N/A'
        }
        
        // OTC: jika service pertama, gunakan total OTC dari quotation items, jika tidak gunakan dari service atau 0
        const otcAmount = index === 0 && totalOtcFromItems > 0 
          ? totalOtcFromItems 
          : Number(s.otcAmount ?? s.otc_amount) || 0
        
        return {
          serviceId: s.serviceId ?? s.service_id ?? s.service?.id ?? 0,
          serviceName: s.service?.name ?? s.serviceName ?? s.service_name ?? '',
          servicePlan: servicePlan || planName,
          planName: planName,
          quantity: Number(s.quantity) || 1,
          mrcAmount: Number(s.mrcAmount ?? s.mrc_amount ?? s.price) || 0,
          otcAmount: otcAmount,
          startDate: null,
          endDate: null,
        }
      })
    }
    
    // Autofill IRO jika ada
    if (q.iroId || q.iro_id || q.iro?.id) {
      localForm.value.iroId = q.iroId ?? q.iro_id ?? q.iro?.id ?? null
    }
    
    console.log('Quotation autofill completed:', {
      customerId: localForm.value.customerId,
      customerName: localForm.value.customerName,
      servicesCount: localForm.value.subscriptionServices.length,
      termOfPayment: localForm.value.termOfPayment,
      iroId: localForm.value.iroId
    })
  } catch (e) {
    console.error('fetch quotation for Subscription autofill error:', e)
    selectedQuotation.value = null
  }
}

function onAttachmentsChange(e) {
  if (!localForm.value) return
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  const toast = useToast()
  const maxSize = 2 * 1024 * 1024
  const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
  const validFiles = []
  const previews = []

  for (const file of files) {
    if (!file.size || file.size === 0) {
      toast.error({ title: 'Error', message: `File ${file.name} kosong atau tidak valid`, color: 'red', position: 'topRight', layout: 2 })
      continue
    }
    if (file.size > maxSize) {
      toast.error({ title: 'Error', message: `File ${file.name} terlalu besar (maksimal 2MB)`, color: 'red', position: 'topRight', layout: 2 })
      continue
    }
    const ext = file.name?.split('.').pop()?.toLowerCase() || ''
    if (!allowed.includes(ext)) {
      toast.error({ title: 'Error', message: `Format ${file.name} tidak didukung. Gunakan: ${allowed.join(', ')}`, color: 'red', position: 'topRight', layout: 2 })
      continue
    }
    validFiles.push(file)
    previews.push(URL.createObjectURL(file))
  }

  if (validFiles.length > 0) {
    if (!localForm.value.attachments) localForm.value.attachments = []
    if (!localForm.value.attachmentPreviews) localForm.value.attachmentPreviews = []
    localForm.value.attachments.push(...validFiles)
    localForm.value.attachmentPreviews.push(...previews)
  }
  e.target.value = ''
}

function removeAttachment(index, type) {
  if (!localForm.value) return
  if (type === 'new') {
    if (localForm.value.attachmentPreviews?.[index]) {
      const url = localForm.value.attachmentPreviews[index]
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
    localForm.value.attachmentPreviews?.splice(index, 1)
    localForm.value.attachments?.splice(index, 1)
  } else {
    localForm.value.existingAttachments?.splice(index, 1)
  }
}

function getFileNameFromPreview(preview) {
  if (preview.startsWith('blob:')) {
    const file = localForm.value?.attachments?.find((_, i) => localForm.value?.attachmentPreviews?.[i] === preview)
    return file?.name || 'File'
  }
  return 'File'
}

function getFileNameFromUrl(url) {
  if (!url) return 'File'
  const parts = url.split('/')
  const fileName = parts[parts.length - 1]
  return fileName || 'File'
}

async function handleSubmit() {
  console.log('handleSubmit called, form data:', {
    quotationId: localForm.value.quotationId,
    customerId: localForm.value.customerId,
    customerName: localForm.value.customerName,
    servicesCount: localForm.value.subscriptionServices?.length || 0,
    installationsCount: localForm.value.subscriptionInstallations?.length || 0,
    contactsCount: localForm.value.subscriptionContacts?.length || 0,
    contractPeriod: localForm.value.contractPeriod,
    leTechReviewId: localForm.value.leTechReviewId
  })
  
  const result = await subscriptionStore.saveSubscription()
  console.log('saveSubscription result:', result)
  
  if (result) {
    emit('saved')
  }
}

function handleClose() {
  subscriptionStore.closeModal()
  emit('close')
}

function initModal() {
  const el = document.getElementById(props.modalId)
  if (el && typeof bootstrap !== 'undefined') {
    modalInstance = new bootstrap.Modal(el)
  }
}

async function openModalWithData() {
  console.log('openModalWithData called with:', {
    prefilledQuotationId: props.prefilledQuotationId,
    prefilledLeTechReviewId: props.prefilledLeTechReviewId,
    prefilledIroId: props.prefilledIroId,
    isEditMode: isEditMode.value
  })
  
  // Apply prefilled data if available
  if (props.prefilledQuotationId && !isEditMode.value) {
    localForm.value.quotationId = props.prefilledQuotationId
    // Trigger quotation change to load related data immediately
    await onQuotationChange(props.prefilledQuotationId)
  }
  
  if (props.prefilledLeTechReviewId) {
    localForm.value.leTechReviewId = props.prefilledLeTechReviewId
  }
  
  if (props.prefilledIroId) {
    localForm.value.iroId = props.prefilledIroId
  }
}

onMounted(() => {
  fetchQuotationsApproved()
  initModal()
})

watch(showModal, async (v) => {
  if (v) {
    modalInstance?.show()
    await nextTick()
    
    // Apply prefilled data first
    await openModalWithData()
    
    // Pastikan quotation ada di daftar jika edit mode
    if (isEditMode.value && localForm.value?.quotationId && !quotationsApproved.value.some((q) => (q.id || q) === (localForm.value.quotationId || localForm.value.quotation_id))) {
      const q = { id: localForm.value.quotationId, noQuotation: '-', customer: { id: localForm.value.customerId, name: localForm.value.customerName } }
      quotationsApproved.value = [q, ...quotationsApproved.value]
    }
    
    // Jika belum ada installation, tambahkan satu
    if (!localForm.value.subscriptionInstallations || localForm.value.subscriptionInstallations.length === 0) {
      subscriptionStore.addInstallation()
    }

    // Default: selalu tampilkan minimal 1 Billing Contact & 1 Technical Contact
    if (!localForm.value.subscriptionContacts) localForm.value.subscriptionContacts = []
    const hasBilling = localForm.value.subscriptionContacts.some((c) => (c?.contactType ?? c?.contact_type) === 'billing')
    const hasTechnical = localForm.value.subscriptionContacts.some((c) => (c?.contactType ?? c?.contact_type) === 'technical')
    if (!hasBilling) addBillingContact()
    if (!hasTechnical) addTechnicalContact()
    
    console.log('Modal opened with form data:', {
      quotationId: localForm.value.quotationId,
      customerId: localForm.value.customerId,
      servicesCount: localForm.value.subscriptionServices?.length || 0,
      installationsCount: localForm.value.subscriptionInstallations?.length || 0,
      contactsCount: localForm.value.subscriptionContacts?.length || 0
    })
  } else {
    modalInstance?.hide()
    selectedQuotation.value = null
    // Clean up blob URLs when modal closes
    if (localForm.value.attachmentPreviews) {
      for (const url of localForm.value.attachmentPreviews) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
    }
  }
})

// Watch quotationId untuk autofill - disabled karena sudah di-handle di openModalWithData
// watch(() => localForm.value.quotationId, (newVal) => {
//   if (newVal && !isEditMode.value) {
//     console.log('quotationId watcher triggered:', newVal)
//     onQuotationChange(newVal)
//   }
// })

// Expose method to open modal from parent
defineExpose({
  openModal: () => {
    subscriptionStore.openModal()
    openModalWithData()
  },
  openModalForEdit: (data) => {
    subscriptionStore.openModal(data)
  }
})
</script>

<style scoped>
.repeater-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease-in-out;
}

.repeater-hr {
  border-top: 2px solid #e9ecef;
  opacity: 1;
}

.section-hr {
  border-top: 2px dashed #e9ecef;
  opacity: 1;
}
</style>
