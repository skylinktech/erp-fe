<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">Subscription</h4>
      <p class="mb-6">Daftar Subscription yang terdaftar di sistem</p>

      <!-- Statistics Cards -->
      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Total Subscription</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-primary">
                    <i class="ri-file-list-3-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.totalSubscriptions || 0 }}</h5>
                  <span class="text-muted">Subscription terdaftar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Draft</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-secondary">
                    <i class="ri-draft-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.draftSubscriptions || 0 }}</h5>
                  <span class="text-muted">Draft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Signed</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-info">
                    <i class="ri-file-check-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.signedSubscriptions || 0 }}</h5>
                  <span class="text-muted">Signed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">Active</p>
                <div class="avatar">
                  <span class="avatar-initial rounded bg-label-success">
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="account-heading">
                  <h5 class="mb-1">{{ statistics?.activeSubscriptions || 0 }}</h5>
                  <span class="text-muted">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-6 mb-1">Filter Subscription</h4>
          <p class="mb-0">Filter Subscription berdasarkan Customer dan Status.</p>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <CustomSelect2 v-model="filters.customerId" :options="customers || []" :get-option-label="o => o?.name ?? ''" :reduce="o => o?.id" searchable clearable placeholder="Pilih Customer" />
                </div>
                <div class="col-md-6 mb-2">
                  <CustomSelect2 v-model="filters.status" :options="statusOptions" :get-option-label="o => o.label" :reduce="o => o.value" searchable clearable placeholder="Pilih Status" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="tableControls.rows"
                  :options="rowsPerPageOptionsArray"
                  @change="handleRowsChange"
                  placeholder="Jumlah"
                  style="width: 8rem;"
                />
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  v-if="userHasRole('superadmin') || userHasPermission('create_subscription')"
                  @click="subscriptionStore.openModal()"
                  class="btn btn-primary"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Data
                </button>
                <span class="p-input-icon-left">
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari Subscription..."
                    class="w-full md:w-20rem"
                  />
                </span>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="subscriptions"
                :rows="Number(params.rows)"
                :loading="loading"
                :totalRecords="totalRecords"
                :first="params.first"
                :lazy="true"
                @page="onPage($event)"
                @sort="onSort($event)"
                responsiveLayout="scroll"
                paginatorPosition="bottom"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
              >
                <Column header="#" :sortable="false">
                  <template #body="slotProps">{{ params.first + slotProps.index + 1 }}</template>
                </Column>
                <Column field="noSubscription" header="No. Subscription" :sortable="true" class="text-nowrap">
                  <template #body="slotProps">
                    <a @click="navigateTo(`/order-process/subscription/detail/${slotProps.data.id}`)" class="text-primary" style="cursor:pointer;text-decoration:underline" :title="'View detail'">{{ slotProps.data.noSubscription || slotProps.data.no_subscription }}</a>
                  </template>
                </Column>
                <Column field="customer.name" header="Customer" :sortable="true" />
                <Column field="quotation.noQuotation" header="Quotation" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.quotation?.noQuotation || slotProps.data.quotation?.no_quotation || '-' }}</template>
                </Column>
                <Column field="iro.noIro" header="IRO" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.iro?.noIro || slotProps.data.iro?.no_iro || '-' }}</template>
                </Column>
                <Column field="status" header="Status" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getStatusBadge(slotProps.data.status).class">{{ getStatusBadge(slotProps.data.status).text }}</span>
                  </template>
                </Column>
                <Column field="contractPeriod" header="Contract Period" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.contractPeriod || slotProps.data.contract_period || '-' }} bulan</template>
                </Column>
                <Column field="targetActiveDate" header="Target Activation" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.targetActiveDate || slotProps.data.target_active_date ? new Date(slotProps.data.targetActiveDate || slotProps.data.target_active_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column field="createdAt" header="Tanggal" :sortable="true">
                  <template #body="slotProps">{{ slotProps.data.createdAt ? new Date(slotProps.data.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-' }}</template>
                </Column>
                <Column header="Actions" :exportable="false" style="min-width:9rem">
                  <template #body="slotProps">
                    <div class="dropdown d-inline-block">
                      <a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'><i class="ri-more-2-fill"></i></a>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="subscriptionStore.fetchSubscriptionForEdit(slotProps.data.id)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                        </li>
                        <li v-if="(userHasRole('superadmin') || userHasPermission('delete_subscription')) && slotProps.data.status === 'draft'">
                          <a class="dropdown-item text-danger" href="javascript:void(0)" @click="subscriptionStore.deleteSubscription(slotProps.data.id)"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo(`/order-process/subscription/detail/${slotProps.data.id}`)"><i class="ri-eye-line me-2"></i> Lihat Detail</a>
                        </li>
                      </ul>
                    </div>
                  </template>
                </Column>
              </MyDataTable>
            </div>
          </div>
        </div>
      </div>

      <Modal :id="'SubscriptionModal'" :title="modalTitle" :description="modalDescription" :validation-errors-from-parent="validationErrors" dialog-class="modal-xl">
        <template #default>
          <form @submit.prevent="subscriptionStore.saveSubscription()" novalidate>
            <div class="row">
              <div class="col">
                <ul class="nav nav-tabs" role="tablist">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#form-tabs-info" role="tab" aria-selected="true" type="button">
                      <span class="ri-information-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Informasi</span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#form-tabs-installation" role="tab" aria-selected="false" type="button">
                      <span class="ri-building-line ri-20px d-sm-none"></span>
                      <span class="d-none d-sm-block">Installation & Contact</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="tab-content pt-4">
              <!-- Tab Informasi -->
              <div class="tab-pane fade active show" id="form-tabs-info" role="tabpanel">
                <div class="row g-4">
                  <!-- Quotation Selection -->
                  <div class="col-12">
                    <div v-if="!isEditMode" class="alert alert-info mb-2">
                      <i class="ri-information-line me-2"></i>
                      Pilih Quotation yang sudah approved untuk membuat Subscription. Data akan terisi otomatis.
                    </div>
                    <label class="form-label text-muted">Quotation (approved)</label>
                    <CustomSelect2 
                      v-model="form.quotationId" 
                      :options="quotationsApproved" 
                      :get-option-label="o => o ? (o.noQuotation || o.no_quotation || '') + ' - ' + (o.customer?.name || o.customer_name || '') : ''" 
                      :reduce="o => o?.id" 
                      :disabled="isEditMode"
                      searchable 
                      clearable 
                      placeholder="Pilih Quotation" 
                      @update:modelValue="onQuotationChange" 
                    />
                    <small v-if="form.quotationId" class="text-muted d-block mt-1">
                      Based on Quotation: 
                      <a href="javascript:void(0)" @click="navigateTo(`/sales/quotation/detail/${form.quotationId}`)" class="text-primary">
                        {{ quotationNo || '-' }}
                      </a>
                    </small>
                  </div>
                </div>
                <div class="row g-4 mt-2">
                  <div class="col-md-6">
                    <label class="form-label text-muted">Customer Name</label>
                    <input type="text" :value="form.customerName" class="form-control bg-light" readonly />
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
                    <input type="text" :value="form.subscriptionServices && form.subscriptionServices.length > 0 ? formatRupiah(form.subscriptionServices[0].mrcAmount) : formatRupiah(0)" class="form-control bg-light" readonly />
                  </div>
                  <div v-if="leTechReviewInfo" class="col-md-6">
                    <label class="form-label text-muted">Status Verifikasi</label>
                    <div>
                      <span class="badge bg-label-success">
                        <i class="ri-user-line me-1"></i>
                        Verified by Legal Review ({{ leTechReviewInfo }})
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Payment Method</label>
                    <input type="text" v-model="form.paymentMethod" class="form-control" placeholder="Payment Method" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted">Term of Payment</label>
                    <input type="text" :value="form.termOfPayment" class="form-control bg-light" readonly />
                  </div>
                </div>
                <div class="row g-4 mt-2">
                  <div class="col-md-6">
                    <label class="form-label text-muted">Contract Period (Months)</label>
                    <input type="number" v-model.number="form.contractPeriod" class="form-control" min="1" placeholder="12" @input="calculateContractEndDate" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted">Target Activation Date</label>
                    <input type="date" v-model="form.targetActiveDate" class="form-control" @change="calculateContractEndDate" />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label text-muted">Contract End Date (Auto-calculated)</label>
                    <input type="text" :value="form.contractEndDate ? new Date(form.contractEndDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'" class="form-control bg-light" readonly />
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
                    <div v-if="(form.attachmentPreviews && form.attachmentPreviews.length > 0) || (form.existingAttachments && form.existingAttachments.length > 0)" class="mt-3">
                      <div v-for="(preview, idx) in (form.attachmentPreviews || [])" :key="'new-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                        <i class="ri-file-line text-primary"></i>
                        <span class="flex-grow-1 small">{{ getFileNameFromPreview(preview) }}</span>
                        <button type="button" @click="removeAttachment(idx, 'new')" class="btn btn-sm btn-text-danger p-0"><i class="ri-close-circle-line"></i></button>
                      </div>
                      <div v-for="(url, idx) in (form.existingAttachments || [])" :key="'existing-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                        <i class="ri-file-line text-success"></i>
                        <a :href="getAttachmentUrl(url)" target="_blank" rel="noopener noreferrer" class="flex-grow-1 small text-decoration-none">{{ getFileNameFromUrl(url) }}</a>
                        <button type="button" @click="removeAttachment(idx, 'existing')" class="btn btn-sm btn-text-danger p-0"><i class="ri-close-circle-line"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Installation & Contact -->
              <div class="tab-pane fade" id="form-tabs-installation" role="tabpanel">
                <div class="row g-4">
                  <!-- Installation Addresses -->
                  <div class="col-12">
                    <div v-for="(installation, index) in form.subscriptionInstallations" :key="index" class="repeater-item mb-4">
                      <div class="row g-3">
                        <div class="col-md-10">
                          <label class="form-label text-muted">Installation Address {{ form.subscriptionInstallations.length > 1 ? `#${index + 1}` : '' }}</label>
                          <textarea v-model="installation.installAddress" class="form-control" rows="3" placeholder="Full address for installation..."></textarea>
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                          <button v-if="form.subscriptionInstallations.length > 1" type="button" class="btn btn-outline-danger w-100" @click.prevent="subscriptionStore.removeInstallation(index)">
                            <i class="ri-delete-bin-line me-1"></i> Hapus
                          </button>
                        </div>
                      </div>
                      <hr class="my-4" v-if="index < form.subscriptionInstallations.length - 1">
                    </div>
                    <div class="mt-4">
                      <button type="button" class="btn btn-primary" @click.prevent="subscriptionStore.addInstallation()">
                        <i class="ri-add-line me-1"></i> Tambah Alamat Instalasi
                      </button>
                    </div>
                  </div>

                  <!-- Billing Contact -->
                  <div class="col-12">
                    <div v-for="(contact, index) in billingContacts" :key="`billing-${index}`" class="repeater-item mb-4">
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
                          <button type="button" class="btn btn-outline-danger" @click.prevent="subscriptionStore.removeContact(form.subscriptionContacts.indexOf(contact))">
                            <i class="ri-delete-bin-line me-1"></i> Hapus
                          </button>
                        </div>
                      </div>
                      <hr class="my-4" v-if="index < billingContacts.length - 1">
                    </div>
                    <div class="mt-4">
                      <button type="button" class="btn btn-primary" @click.prevent="addBillingContact()">
                        <i class="ri-add-line me-1"></i> Tambah Billing Contact
                      </button>
                    </div>
                  </div>

                  <!-- Technical Contact -->
                  <div class="col-12">
                    <div v-for="(contact, index) in technicalContacts" :key="`technical-${index}`" class="repeater-item mb-4">
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
                          <button type="button" class="btn btn-outline-danger" @click.prevent="subscriptionStore.removeContact(form.subscriptionContacts.indexOf(contact))">
                            <i class="ri-delete-bin-line me-1"></i> Hapus
                          </button>
                        </div>
                      </div>
                      <hr class="my-4" v-if="index < technicalContacts.length - 1">
                    </div>
                    <div class="mt-4">
                      <button type="button" class="btn btn-primary" @click.prevent="addTechnicalContact()">
                        <i class="ri-add-line me-1"></i> Tambah Technical Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer mt-6">
              <button type="button" class="btn btn-outline-secondary" @click="subscriptionStore.closeModal()">Tutup</button>
              <button type="submit" class="btn btn-primary ms-2" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Simpan
              </button>
            </div>
          </form>
        </template>
      </Modal>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubscriptionStore } from '~/stores/subscription'
import { useCustomerStore } from '~/stores/customer'
import { usePermissions } from '~/composables/usePermissions'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { useImageUrl } from '~/composables/useImageUrl'

const { setListTitle } = useDynamicTitle()
const subscriptionStore = useSubscriptionStore()
const customerStore = useCustomerStore()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()
const { getAttachmentUrl } = useImageUrl()

const { subscriptions, loading, totalRecords, params, form, isEditMode, showModal, validationErrors, statistics } = storeToRefs(subscriptionStore)
const { customers } = storeToRefs(customerStore)

const quotationsApproved = ref([])
const tableControls = ref({ rows: 10, search: '' })
const filters = ref({ search: '', customerId: null, status: null })
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Signed', value: 'signed' },
  { label: 'Active', value: 'active' },
  { label: 'Terminated', value: 'terminated' },
  { label: 'Expired', value: 'expired' },
]

const modalTitle = computed(() => (isEditMode.value ? 'Edit Subscription' : 'Tambah Data'))
const modalDescription = computed(() => (isEditMode.value ? 'Ubah data Subscription di bawah ini.' : 'Isi form untuk menambahkan Subscription baru.'))

const quotationNo = computed(() => {
  if (!form.value.quotationId) return ''
  const q = quotationsApproved.value.find((x) => (x.id || x) === (form.value.quotationId || form.value.quotation_id))
  return q?.noQuotation || q?.no_quotation || ''
})

const leTechReviewInfo = computed(() => {
  // Jika ada leTechReview, tampilkan info
  return form.value.leTechReviewId ? `LR-${String(form.value.leTechReviewId).padStart(3, '0')}` : null
})

const billingContacts = computed({
  get: () => form.value.subscriptionContacts?.filter(c => c.contactType === 'billing') || [],
  set: (val) => {
    const otherContacts = form.value.subscriptionContacts?.filter(c => c.contactType !== 'billing') || []
    form.value.subscriptionContacts = [...otherContacts, ...val]
  }
})

const technicalContacts = computed({
  get: () => form.value.subscriptionContacts?.filter(c => c.contactType === 'technical') || [],
  set: (val) => {
    const otherContacts = form.value.subscriptionContacts?.filter(c => c.contactType !== 'technical') || []
    form.value.subscriptionContacts = [...otherContacts, ...val]
  }
})

// Store selected quotation data for computed properties
const selectedQuotation = ref(null)

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
  if (form.value.subscriptionServices && form.value.subscriptionServices.length > 0) {
    const otcFromForm = Number(form.value.subscriptionServices[0].otcAmount) || 0
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
  const contacts = form.value.subscriptionContacts || []
  const lastContact = contacts[contacts.length - 1]
  if (lastContact) lastContact.contactType = 'billing'
}

function addTechnicalContact() {
  subscriptionStore.addContact()
  const contacts = form.value.subscriptionContacts || []
  const lastContact = contacts[contacts.length - 1]
  if (lastContact) lastContact.contactType = 'technical'
}

function calculateContractEndDate() {
  if (!form.value.contractPeriod || !form.value.targetActiveDate) {
    form.value.contractEndDate = null
    return
  }
  const startDate = new Date(form.value.targetActiveDate)
  const months = Number(form.value.contractPeriod) || 0
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + months)
  form.value.contractEndDate = endDate.toISOString().split('T')[0]
}

async function fetchQuotationsApproved() {
  const { $api } = useNuxtApp()
  try {
    const r = await fetch(`${$api.quotation()}?page=1&rows=500&status=approved&includeItems=true`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (r.ok) { const j = await r.json(); quotationsApproved.value = j.data || [] }
  } catch (e) { console.error(e) }
}

async function onQuotationChange(quotationId) {
  if (!form.value) return
  if (!quotationId) {
    form.value.customerId = null
    form.value.customerName = ''
    form.value.subscriptionServices = []
    form.value.termOfPayment = ''
    selectedQuotation.value = null
    return
  }
  const { $api } = useNuxtApp()
  try {
    // Fetch quotation dengan includeItems dan includeServices untuk mendapatkan quotationItems dan quotationServices
    const r = await fetch(`${$api.quotation()}/${quotationId}?includeItems=true&includeServices=true`, { headers: { Accept: 'application/json' }, credentials: 'include' })
    if (!r.ok) return
    const j = await r.json()
    const q = j.data || j
    
    // Simpan quotation data untuk computed properties (pastikan quotationItems ter-load)
    selectedQuotation.value = q
    
    // Debug: pastikan quotationItems ter-load
    if (!q.quotationItems && !q.quotation_items) {
      console.warn('Quotation items tidak ter-load untuk quotation:', q.id)
    }
    
    // Autofill customer
    const customerId = q.customerId ?? q.customer_id ?? q.customer?.id ?? null
    const customerName = q.customer?.name ?? q.customer_name ?? ''
    form.value.customerId = customerId
    form.value.customerName = customerName
    
    // Autofill term of payment dari quotation (payment method tidak autofill)
    form.value.termOfPayment = q.termOfPayment ?? q.term_of_payment ?? 'Net 30 Days'
    
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
      form.value.subscriptionServices = services.map((s, index) => {
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
      form.value.iroId = q.iroId ?? q.iro_id ?? q.iro?.id ?? null
    }
  } catch (e) {
    console.error('fetch quotation for Subscription autofill', e)
    selectedQuotation.value = null
  }
}

function getStatusBadge(status) {
  if (!status) return { text: '-', class: 'badge rounded-pill bg-label-light' }
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'signed': return { text: 'Signed', class: 'badge rounded-pill bg-label-info' }
    case 'active': return { text: 'Active', class: 'badge rounded-pill bg-label-success' }
    case 'terminated': return { text: 'Terminated', class: 'badge rounded-pill bg-label-warning' }
    case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
    default: return { text: status, class: 'badge rounded-pill bg-label-light' }
  }
}

const onPage = (e) => { if (e) subscriptionStore.setPagination(e) }
const handleRowsChange = (v) => { 
  const rowsValue = Number(v) || 10
  params.value.rows = rowsValue
  params.value.first = 0
  subscriptionStore.fetchSubscriptions()
}
const onSort = (e) => { if (e) subscriptionStore.setSort(e) }

const debouncedSearch = useDebounceFn(() => {
  subscriptionStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)
watch(filters, (f) => { subscriptionStore.setFilters({ customerId: f.customerId, status: f.status, search: f.search }) }, { deep: true })

let modalInstance = null
const route = useRoute()
onMounted(() => {
  subscriptionStore.fetchSubscriptions()
  subscriptionStore.fetchStatistics()
  customerStore.fetchCustomers()
  fetchQuotationsApproved()
  setListTitle('Subscription', subscriptions.value?.length ?? 0)
  tableControls.value.rows = Number(params.value.rows) || 10
  globalFilterValue.value = params.value.search || ''
  const el = document.getElementById('SubscriptionModal')
  if (el) modalInstance = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(el) : null
  const editId = Array.isArray(route.query?.edit) ? route.query.edit[0] : route.query?.edit
  if (editId) subscriptionStore.fetchSubscriptionForEdit(String(editId))
})

function onAttachmentsChange(e) {
  if (!form.value) return
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
    if (!form.value.attachments) form.value.attachments = []
    if (!form.value.attachmentPreviews) form.value.attachmentPreviews = []
    form.value.attachments.push(...validFiles)
    form.value.attachmentPreviews.push(...previews)
  }
  e.target.value = ''
}

function removeAttachment(index, type) {
  if (!form.value) return
  if (type === 'new') {
    if (form.value.attachmentPreviews?.[index]) {
      const url = form.value.attachmentPreviews[index]
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
    form.value.attachmentPreviews?.splice(index, 1)
    form.value.attachments?.splice(index, 1)
  } else {
    form.value.existingAttachments?.splice(index, 1)
  }
}

function getFileNameFromPreview(preview) {
  if (preview.startsWith('blob:')) {
    const file = form.value?.attachments?.find((_, i) => form.value?.attachmentPreviews?.[i] === preview)
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

watch(showModal, (v) => {
  if (v) {
    modalInstance?.show()
    nextTick(() => {
      // Load quotation data jika ada quotationId (untuk edit mode atau setelah pilih quotation)
      if (form.value.quotationId) {
        onQuotationChange(form.value.quotationId)
      }
      // Pastikan quotation ada di daftar jika edit mode
      if (isEditMode.value && form.value?.quotationId && !quotationsApproved.value.some((q) => (q.id || q) === (form.value.quotationId || form.value.quotation_id))) {
        const q = { id: form.value.quotationId, noQuotation: '-', customer: { id: form.value.customerId, name: form.value.customerName } }
        quotationsApproved.value = [q, ...quotationsApproved.value]
      }
      // Jika belum ada installation, tambahkan satu
      if (!form.value.subscriptionInstallations || form.value.subscriptionInstallations.length === 0) {
        subscriptionStore.addInstallation()
      }
    })
  } else {
    modalInstance?.hide()
    selectedQuotation.value = null
    // Clean up blob URLs when modal closes
    if (form.value.attachmentPreviews) {
      for (const url of form.value.attachmentPreviews) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
    }
  }
})

// Watch quotationId untuk autofill
watch(() => form.value.quotationId, (newVal) => {
  if (newVal && !isEditMode.value) {
    onQuotationChange(newVal)
  }
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Subscription',
})
</script>

<style scoped>
.repeater-item { background: #f8f9fa; border-radius: 12px; padding: 16px; border: 1px solid #e9ecef; }
</style>
