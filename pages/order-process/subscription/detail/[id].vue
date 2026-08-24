<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail Subscription...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !subscription" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/order-process/subscription" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="subscription">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/order-process/subscription" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ subscription.noSubscription || '—' }}</h4>
                <PageBreadcrumb class="mt-1" :current-label="subscription.noSubscription || '—'" />
                <small class="text-muted">{{ formatDateTime(subscription.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(subscription.status).class" class="badge">{{ getStatusBadge(subscription.status).text }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && subscription.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit Subscription
                  </a>
                  <a v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && (subscription.status === 'signed' || subscription.status === 'expired')" class="dropdown-item text-success" href="javascript:void(0)" @click="onActivate">
                    <i class="ri-checkbox-circle-line me-2"></i> Aktifkan (Set Active)
                  </a>
                  <a v-if="(userHasRole('superadmin') || userHasPermission('edit_subscription')) && (subscription.status === 'draft' || subscription.status === 'signed')" class="dropdown-item text-warning" href="javascript:void(0)" @click="onCancel">
                    <i class="ri-close-circle-line me-2"></i> Cancel Subscription
                  </a>
                  <a v-if="subscription.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/order-process/subscription?edit=' + subscription.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="onPrintSubscription">
                    <i class="ri-printer-line me-2"></i> Cetak Form Berlangganan
                  </a>
                  <a v-if="subscription.status === 'draft'" class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Process Flow -->
          <div class="card mb-4">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0">Process Flow</h5>
            </div>
            <div class="card-body px-5 pt-0 pb-4">
              <div class="d-flex flex-wrap align-items-center gap-2 process-flow">
                <NuxtLink v-if="subscription.quotation?.id" :to="'/sales/quotation/detail/' + subscription.quotation.id" class="process-pill process-pill-done text-decoration-none">
                  <i class="ri-check-line me-1"></i> Quotation{{ subscription.quotation?.noQuotation ? ' (' + subscription.quotation.noQuotation + ')' : '' }}
                </NuxtLink>
                <span v-else class="process-pill process-pill-done"><i class="ri-check-line me-1"></i> Quotation</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-active">
                  <i class="ri-file-list-3-line me-1"></i> Subscription
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Implementation</span>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Kartu: Informasi Subscription -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi Subscription
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">No. Subscription</label>
                      <p class="mb-0 fw-medium">{{ subscription.noSubscription || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="subscription.quotation">
                      <label class="form-label text-muted medium">Quotation</label>
                      <p class="mb-0 fw-medium">
                        <NuxtLink v-if="subscription.quotation?.id" :to="'/sales/quotation/detail/' + subscription.quotation.id" class="text-primary">{{ subscription.quotation?.noQuotation || '—' }}</NuxtLink>
                        <span v-else>{{ subscription.quotation?.noQuotation || '—' }}</span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Business Scheme</label>
                      <p class="mb-0 fw-medium">{{ businessSchemeLabel }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ subscription.customerName || subscription.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Contract Period</label>
                      <p class="mb-0">{{ subscription.contractPeriod ? subscription.contractPeriod + ' bulan' : '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Target Activation Date</label>
                      <p class="mb-0">{{ formatDate(subscription.targetActiveDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Contract Start Date</label>
                      <p class="mb-0">{{ formatDate(subscription.contractStartDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Contract End Date</label>
                      <p class="mb-0">{{ formatDate(subscription.contractEndDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Payment Method</label>
                      <p class="mb-0">{{ subscription.paymentMethod || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Term of Payment</label>
                      <p class="mb-0">{{ subscription.termOfPayment || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">PO Reference</label>
                      <p class="mb-0 fw-medium">{{ subscription.poReference || (subscription as any).po_reference || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="subscriptionPoAttachment">
                      <label class="form-label text-muted medium">PO Attachment</label>
                      <p class="mb-0">
                        <a :href="getAttachmentUrl(subscriptionPoAttachment)" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none">
                          <i class="ri-attachment-2 me-1"></i>{{ getFileNameFromUrl(subscriptionPoAttachment) }}
                        </a>
                      </p>
                    </div>
                    <div class="col-md-6" v-if="subscription.leTechReview">
                      <label class="form-label text-muted medium">Legal Tech Review</label>
                      <p class="mb-0 fw-medium">{{ subscription.leTechReview?.noLr || subscription.leTechReview?.no_lr || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="subscription.leTechReviewAt">
                      <label class="form-label text-muted medium">Legal Tech Review Date</label>
                      <p class="mb-0">{{ formatDateTime(subscription.leTechReviewAt) }}</p>
                    </div>
                    <template v-if="subscription.status === 'canceled'">
                      <div class="col-12 mt-3 pt-3 border-top">
                        <h6 class="text-danger mb-2"><i class="ri-close-circle-line me-1"></i> Informasi Pembatalan</h6>
                      </div>
                      <div class="col-md-6" v-if="subscription.canceledAt || subscription.canceled_at">
                        <label class="form-label text-muted medium">Tanggal Cancel</label>
                        <p class="mb-0">{{ formatDateTime(subscription.canceledAt || subscription.canceled_at) }}</p>
                      </div>
                      <div class="col-md-6" v-if="subscription.canceledByUser || subscription.canceled_by">
                        <label class="form-label text-muted medium">Canceled By</label>
                        <p class="mb-0">{{ (subscription.canceledByUser?.fullName || subscription.canceledByUser?.full_name) || subscription.canceled_by || '—' }}</p>
                      </div>
                      <div class="col-12" v-if="subscription.reasonCancel || subscription.reason_cancel">
                        <label class="form-label text-muted medium">Alasan Cancel</label>
                        <p class="mb-0">{{ subscription.reasonCancel || subscription.reason_cancel || '—' }}</p>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Service Details -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-service-line me-2 text-primary"></i>
                    Service Details
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!subscription.subscriptionServices || subscription.subscriptionServices.length === 0" class="text-muted text-center py-4">
                    Tidak ada service
                  </div>
                  <template v-else>
                    <div v-for="(service, index) in subscription.subscriptionServices" :key="service.id || 'service-' + index" class="mb-4" :class="{ 'border-bottom pb-4': index < subscription.subscriptionServices.length - 1 }">
                      <div class="row g-2">
                        <div class="col-md-6">
                          <label class="form-label text-muted medium">Service Name</label>
                          <p class="mb-0 fw-medium">{{ service.serviceName || '—' }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted medium">Service Plan</label>
                          <p class="mb-0 fw-medium">{{ service.servicePlan || '—' }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted medium">Plan Name</label>
                          <p class="mb-0">{{ service.planName || '—' }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted medium">Quantity</label>
                          <p class="mb-0">{{ service.quantity ? service.quantity + ' unit' : '—' }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted medium">Monthly Recurring (MRC)</label>
                          <p class="mb-0 fw-medium">{{ formatRupiah(service.mrcAmount || service.mrc_amount || 0) }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label text-muted medium">One Time Charge (OTC)</label>
                          <p class="mb-0 fw-medium">{{ formatRupiah(service.otcAmount || service.otc_amount || 0) }}</p>
                        </div>
                        <div class="col-md-6" v-if="service.startDate">
                          <label class="form-label text-muted medium">Start Date</label>
                          <p class="mb-0">{{ formatDate(service.startDate || service.start_date) }}</p>
                        </div>
                        <div class="col-md-6" v-if="service.endDate">
                          <label class="form-label text-muted medium">End Date</label>
                          <p class="mb-0">{{ formatDate(service.endDate || service.end_date) }}</p>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Installation Addresses -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-building-line me-2 text-primary"></i>
                    Installation Addresses
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!subscription.subscriptionInstallations || subscription.subscriptionInstallations.length === 0" class="text-muted text-center py-4">
                    Tidak ada alamat instalasi
                  </div>
                  <template v-else>
                    <div v-for="(installation, index) in subscription.subscriptionInstallations" :key="installation.id || 'installation-' + index" class="mb-4" :class="{ 'border-bottom pb-4': index < subscription.subscriptionInstallations.length - 1 }">
                      <div class="row g-2">
                        <div class="col-12">
                          <label class="form-label text-muted medium">Address #{{ index + 1 }}</label>
                          <p class="mb-0 text-break">{{ installation.installAddress || installation.install_address || '—' }}</p>
                        </div>
                        <div class="col-md-6" v-if="installation.city">
                          <label class="form-label text-muted medium">City</label>
                          <p class="mb-0">{{ installation.city }}</p>
                        </div>
                        <div class="col-md-6" v-if="installation.province">
                          <label class="form-label text-muted medium">Province</label>
                          <p class="mb-0">{{ installation.province }}</p>
                        </div>
                        <div class="col-md-6" v-if="installation.latitude && installation.longitude">
                          <label class="form-label text-muted medium">Coordinates</label>
                          <p class="mb-0">{{ installation.latitude }}, {{ installation.longitude }}</p>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Contact Persons -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Contact Persons
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!subscription.subscriptionContacts || subscription.subscriptionContacts.length === 0" class="text-muted text-center py-4">
                    Tidak ada contact person
                  </div>
                  <template v-else>
                    <!-- Billing Contacts -->
                    <div v-if="billingContacts.length > 0" class="mb-4">
                      <h6 class="text-muted mb-3">Billing Contact</h6>
                      <div v-for="(contact, index) in billingContacts" :key="contact.id || 'billing-' + index" class="mb-3" :class="{ 'border-bottom pb-3': index < billingContacts.length - 1 }">
                        <div class="row g-2">
                          <div class="col-md-6">
                            <label class="form-label text-muted medium">Name</label>
                            <p class="mb-0 fw-medium">{{ contact.name || '—' }}</p>
                          </div>
                          <div class="col-md-6" v-if="contact.department">
                            <label class="form-label text-muted medium">Department</label>
                            <p class="mb-0">{{ contact.department }}</p>
                          </div>
                          <div class="col-md-6" v-if="contact.phone">
                            <label class="form-label text-muted medium">Phone</label>
                            <p class="mb-0">{{ contact.phone }}</p>
                          </div>
                          <div class="col-md-6" v-if="contact.email">
                            <label class="form-label text-muted medium">Email</label>
                            <p class="mb-0">{{ contact.email }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Technical Contacts -->
                    <div v-if="technicalContacts.length > 0">
                      <h6 class="text-muted mb-3">Technical Contact</h6>
                      <div v-for="(contact, index) in technicalContacts" :key="contact.id || 'technical-' + index" class="mb-3" :class="{ 'border-bottom pb-3': index < technicalContacts.length - 1 }">
                        <div class="row g-2">
                          <div class="col-md-6">
                            <label class="form-label text-muted medium">Name</label>
                            <p class="mb-0 fw-medium">{{ contact.name || '—' }}</p>
                          </div>
                          <div class="col-md-6" v-if="contact.department">
                            <label class="form-label text-muted medium">Department</label>
                            <p class="mb-0">{{ contact.department }}</p>
                          </div>
                          <div class="col-md-6" v-if="contact.phone">
                            <label class="form-label text-muted medium">Phone</label>
                            <p class="mb-0">{{ contact.phone }}</p>
                          </div>
                          <div class="col-md-6" v-if="contact.email">
                            <label class="form-label text-muted medium">Email</label>
                            <p class="mb-0">{{ contact.email }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Attachments -->
              <div class="card mb-4" v-if="subscriptionAttachments && subscriptionAttachments.length > 0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-attachment-line me-2 text-primary"></i>
                    Attachments
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-for="(url, idx) in subscriptionAttachments" :key="'attachment-' + idx" class="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                    <i class="ri-file-line text-primary"></i>
                    <a :href="getAttachmentUrl(url)" target="_blank" rel="noopener noreferrer" class="flex-grow-1 small text-decoration-none">{{ getFileNameFromUrl(url) }}</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar: Ringkasan + Customer -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan Keuangan -->
              <div class="card mb-4 subscription-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan Subscription
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total MRC</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(totalMrc) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total OTC</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(totalOtc) }}</p>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Grand Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(grandTotal) }}</p>
                  </div>
                </div>
              </div>

              <!-- Informasi Customer -->
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi Customer
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Customer</label>
                    <p class="mb-0 fw-medium">{{ subscription.customerName || subscription.customer?.name || '—' }}</p>
                  </div>
                  <div v-if="subscription.customer?.phone" class="mb-3">
                    <label class="form-label text-muted mb-1">Telepon</label>
                    <p class="mb-0 fw-medium">{{ subscription.customer.phone }}</p>
                  </div>
                  <div v-if="subscription.customer?.email" class="mb-3">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ subscription.customer.email }}</p>
                  </div>
                  <div v-if="subscription.customer?.address" class="mb-3">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium text-break">{{ subscription.customer.address }}</p>
                  </div>
                  <div v-if="subscription.customer?.npwp" class="mb-0">
                    <label class="form-label text-muted mb-1">NPWP</label>
                    <p class="mb-0 fw-medium">{{ subscription.customer.npwp }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSubscriptionStore } from '~/stores/subscription'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'
import Swal from 'sweetalert2'

const route = useRoute()
const subscriptionStore = useSubscriptionStore()
const { userHasPermission, userHasRole } = usePermissions()
const formatRupiah = useFormatRupiah()
const { getAttachmentUrl } = useImageUrl()

const { subscription, loading, error } = storeToRefs(subscriptionStore)
const submitting = ref(false)

const id = computed(() => String(route.params.id || ''))

/** Quotation → Site Investment → Business Scheme (preloaded server-side). */
const businessSchemeLabel = computed(() => {
  const q = subscription.value?.quotation as any
  if (!q) return '—'
  const si = q.siteInvest ?? q.site_invest ?? null
  const scheme = si?.businessScheme ?? si?.business_scheme ?? null
  if (!scheme) return '—'
  return scheme.name || scheme.code || '—'
})

function formatDate (v: string | Date | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getStatusBadge (status: string) {
  switch (status) {
    case 'draft': return { text: 'Draft', class: 'badge rounded-pill bg-label-secondary' }
    case 'signed': return { text: 'Signed', class: 'badge rounded-pill bg-label-info' }
    case 'active': return { text: 'Active', class: 'badge rounded-pill bg-label-success' }
    case 'terminated': return { text: 'Terminated', class: 'badge rounded-pill bg-label-warning' }
    case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
    case 'canceled': return { text: 'Canceled', class: 'badge rounded-pill bg-label-danger' }
    default: return { text: status || '—', class: 'badge rounded-pill bg-label-light' }
  }
}

// Billing and Technical Contacts
const billingContacts = computed(() => {
  return (subscription.value?.subscriptionContacts || []).filter((c: any) => 
    (c.contactType || c.contact_type) === 'billing'
  )
})

const technicalContacts = computed(() => {
  return (subscription.value?.subscriptionContacts || []).filter((c: any) => 
    (c.contactType || c.contact_type) === 'technical'
  )
})

// Total MRC and OTC - align with Quotation (source of truth)
// Use quotation.serviceSubtotal / productSubtotal when available for exact match
const contractPeriod = computed(() => Number(subscription.value?.contractPeriod) || 12)

const totalMrc = computed(() => {
  const q = subscription.value?.quotation
  const fromQuo = q?.serviceSubtotal ?? q?.service_subtotal
  if (fromQuo != null && fromQuo !== '') return Number(fromQuo)
  const services = subscription.value?.subscriptionServices || []
  const period = contractPeriod.value
  return services.reduce((sum: number, s: any) => {
    const mrcMonthly = Number(s.mrcAmount || s.mrc_amount) || 0
    const qty = Number(s.quantity) || 1
    return sum + mrcMonthly * qty * period
  }, 0)
})

const totalOtc = computed(() => {
  const q = subscription.value?.quotation
  const fromQuo = q?.productSubtotal ?? q?.product_subtotal
  if (fromQuo != null && fromQuo !== '') return Number(fromQuo)
  return (subscription.value?.subscriptionServices || []).reduce((sum: number, s: any) => {
    return sum + (Number(s.otcAmount || s.otc_amount) || 0)
  }, 0)
})

// Grand Total: prefer quotation.grandTotal (source of truth)
const grandTotal = computed(() => {
  const q = subscription.value?.quotation
  if (q && (q.grandTotal != null || q.grand_total != null)) {
    return Number(q.grandTotal ?? q.grand_total) || 0
  }
  return totalMrc.value + totalOtc.value
})

const subscriptionAttachments = computed(() => {
  if (!subscription.value) return []
  const attachmentStr = (subscription.value as any).attachment ?? null
  if (!attachmentStr) return []
  try {
    const parsed = JSON.parse(attachmentStr)
    return Array.isArray(parsed) ? parsed : [attachmentStr]
  } catch (e) {
    return [attachmentStr]
  }
})

const subscriptionPoAttachment = computed(() => {
  if (!subscription.value) return null
  return (subscription.value as any).poAttachment ?? (subscription.value as any).po_attachment ?? null
})

function getFileNameFromUrl(url: string) {
  if (!url) return 'File'
  const parts = url.split('/')
  const fileName = parts[parts.length - 1]
  return fileName || 'File'
}

async function load () {
  if (!id.value) return
  try {
    await subscriptionStore.getSubscriptionDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

function onPrintSubscription () {
  if (!subscription.value?.id) return
  navigateTo({
    path: '/order-process/cetak-subscription',
    query: { id: subscription.value.id, print: 'true' },
  })
}

async function onSubmit () {
  if (!subscription.value) return
  submitting.value = true
  try {
    const ok = await subscriptionStore.submitSubscription(subscription.value.id)
    if (ok) refreshAfterAction()
  } finally {
    submitting.value = false
  }
}

async function onActivate () {
  if (!subscription.value) return
  const confirmed = await Swal.fire({
    title: 'Aktifkan Subscription',
    text: `Yakin ingin mengubah status subscription ${subscription.value.noSubscription || subscription.value.no_subscription} menjadi Active?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#00ac4f',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Aktifkan',
    cancelButtonText: 'Batal',
  })
  if (!confirmed.isConfirmed) return
  submitting.value = true
  try {
    const ok = await subscriptionStore.activateSubscription(subscription.value.id)
    if (ok) refreshAfterAction()
  } finally {
    submitting.value = false
  }
}

async function onCancel () {
  if (!subscription.value) return
  const result = await Swal.fire({
    title: 'Cancel Subscription',
    html: `<div style="text-align:left;width:100%;padding:0">
             <p style="margin:0 0 0.75rem 0">Yakin ingin membatalkan subscription <strong>${subscription.value.noSubscription || subscription.value.no_subscription}</strong>?</p>
             <label for="swal-reason-cancel-detail" style="display:block;margin-bottom:0.35rem;font-weight:500">Alasan cancel (opsional)</label>
             <textarea id="swal-reason-cancel-detail" rows="3" placeholder="Masukkan alasan cancel..." style="width:100%;box-sizing:border-box;padding:0.5rem 0.6rem;margin:0;border:1px solid #d9dee3;border-radius:0.375rem;font-size:0.9375rem;resize:vertical;min-height:4rem"></textarea>
           </div>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f13636',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Cancel',
    cancelButtonText: 'Batal',
    preConfirm: () => (document.getElementById('swal-reason-cancel-detail') as HTMLTextAreaElement)?.value?.trim() || null,
  })
  if (result.isConfirmed) {
    submitting.value = true
    try {
      const ok = await subscriptionStore.cancelSubscription(subscription.value!.id, result.value ?? null)
      if (ok) refreshAfterAction()
    } finally {
      submitting.value = false
    }
  }
}

function handleDelete () {
  if (!subscription.value) return
  subscriptionStore.deleteSubscription(subscription.value.id)
  navigateTo('/order-process/subscription')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.subscription-detail-summary .card-body {
  font-variant-numeric: tabular-nums;
}

.process-flow {
  font-size: 0.9rem;
}

.process-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.process-pill-done {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.process-pill-pending {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.process-pill-active {
  background: var(--bs-primary, #008fec);
  color: #fff;
  font-weight: 600;
}

.process-pill-inactive {
  background: #f1f5f9;
  color: #64748b;
}

.process-arrow {
  font-size: 0.85rem;
  font-weight: 600;
  user-select: none;
}
</style>
