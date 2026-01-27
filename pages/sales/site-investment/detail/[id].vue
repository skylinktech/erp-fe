<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container pt-12">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail Site Investment...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !siteInvest" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error.message || 'Gagal memuat data.' }}
          <NuxtLink to="/sales/site-investment" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <!-- Content -->
        <template v-else-if="siteInvest">
          <!-- Header: Breadcrumb + Actions -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/sales/site-investment" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted align-self-center">/</span>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ siteInvest.siNumber || siteInvest.name }}</h4>
                <small class="text-muted">{{ formatDateTime(siteInvest.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(siteInvest.status).class" class="badge">{{ getStatusBadge(siteInvest.status).text }}</span>
              <span :class="getPriorityBadge(siteInvest.priority).class" class="badge">{{ getPriorityBadge(siteInvest.priority).text }}</span>
              <span v-if="siteInvest.overBudget" class="badge bg-label-warning">
                <i class="ri-alert-line me-1"></i> Over Budget
              </span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div class="btn-group" role="group">
                <button id="btnGroupDrop1" type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="d-none d-sm-block">Actions</span></button>
                <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a v-if="siteInvest.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit">
                    <i class="ri-send-plane-line me-2"></i> Submit SI
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="onApprove">
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="onReject">
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/sales/site-investment?edit=' + siteInvest.id)">
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a v-if="siteInvest.status === 'approved'" class="dropdown-item" href="javascript:void(0)" @click="onPrintSI">
                    <i class="ri-printer-line me-2"></i> Print SI
                  </a>
                  <a class="dropdown-item text-danger" href="javascript:void(0)" @click="handleDelete">
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Process Flow -->
          <div class="card mb-4 shadow-sm border-0">
            <div class="card-header border-0 bg-transparent px-5 py-4">
              <h5 class="card-title mb-0">Process Flow</h5>
            </div>
            <div class="card-body px-5 pt-0 pb-4">
              <div class="d-flex flex-wrap align-items-center gap-2 process-flow">
                <span class="process-pill process-pill-done">
                  <i class="ri-check-line me-1"></i> Site Investment{{ siteInvest.siDate ? ' (' + formatDate(siteInvest.siDate) + ')' : '' }}
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-pending">
                  <i class="ri-time-line me-1"></i> Quotation
                </span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Customer Approval</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">IRO</span>
                <span class="process-arrow text-muted">&gt;</span>
                <span class="process-pill process-pill-inactive">Implementation</span>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Kolom utama -->
            <div class="col-xl-8 col-12">
              <!-- Kartu: Informasi Umum -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi Project
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Nama Project</label>
                      <p class="mb-0 fw-medium">{{ siteInvest.name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Customer</label>
                      <p class="mb-0 fw-medium">{{ siteInvest.customer?.name || '—' }}</p>
                    </div>
                    <div class="col-md-6" v-if="siteInvest.site">
                      <label class="form-label text-muted medium">Site</label>
                      <p class="mb-0 fw-medium">{{ (siteInvest.site?.code || '') + ' - ' + (siteInvest.site?.name || '—') }}</p>
                    </div>
                    <div class="col-md-6" v-if="siteInvest.businessSchemeId">
                      <label class="form-label text-muted medium">Skema</label>
                      <p class="mb-0">
                        <span :class="getBusinessSchemeBadgeClass(siteInvest.businessSchemeId)" class="badge">
                          {{ siteInvest.businessScheme?.name || siteInvest.businessScheme?.code || '—' }}
                        </span>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Lokasi</label>
                      <p class="mb-0">{{ siteInvest.location || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Tanggal SI</label>
                      <p class="mb-0">{{ formatDate(siteInvest.siDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Estimasi Mulai</label>
                      <p class="mb-0">{{ formatDate(siteInvest.estimatedStartDate) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Estimasi Selesai</label>
                      <p class="mb-0">{{ formatDate(siteInvest.estimatedCompletionDate) }}</p>
                    </div>
                    <div class="col-md-6" v-if="siteInvest.lat || siteInvest.long">
                      <label class="form-label text-muted medium">Koordinat</label>
                      <p class="mb-0">
                        <a
                          v-if="siteInvest.lat && siteInvest.long"
                          :href="`https://www.google.com/maps?q=${siteInvest.lat},${siteInvest.long}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-primary"
                        >
                          {{ siteInvest.lat }}, {{ siteInvest.long }}
                          <i class="ri-external-link-line ms-1 medium"></i>
                        </a>
                        <span v-else>—</span>
                      </p>
                    </div>
                    <div class="col-6" v-if="siteInvest.notes">
                      <label class="form-label text-muted medium">Catatan</label>
                      <p class="mb-0 text-break">{{ siteInvest.notes }}</p>
                    </div>
                    <div class="col-12" v-if="siteInvest.attachment">
                      <label class="form-label text-muted medium">Attachment</label>
                      <a
                        :href="getAttachmentUrl(siteInvest.attachment)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                      >
                        <i :class="getFileIcon(siteInvest.attachment) + ' me-1'"></i>
                        Lihat / Unduh File
                      </a>
                      <img
                        v-if="isImageFile(siteInvest.attachment)"
                        :src="getAttachmentUrl(siteInvest.attachment)"
                        alt="Attachment"
                        class="d-block mt-2 rounded border"
                        style="max-height: 160px; max-width: 100%; object-fit: contain;"
                        @error="(e) => (e.target.style.display = 'none')"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Material -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-product-hunt-line me-2 text-primary"></i>
                    Material / Produk
                  </h5>
                  <span class="badge bg-label-primary">{{ (siteInvest.siteInvestMaterials || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(siteInvest.siteInvestMaterials || []).length" class="text-muted text-center py-4">
                    Tidak ada material
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Produk</th>
                          <th class="text-center">Qty</th>
                          <th class="text-center">Gudang</th>
                          <th class="text-end">Harga Satuan</th>
                          <th class="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(m, i) in (siteInvest.siteInvestMaterials || [])" :key="m.id || i">
                          <td>{{ m.product?.name || m.product?.sku || '—' }}</td>
                          <td class="text-center">{{ m.quantity ?? 0 }}</td>
                          <td class="text-center">{{ m.warehouse?.name || '—' }}</td>
                          <td class="text-end">{{ formatRupiah(m.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(m.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal Material: {{ formatRupiah(siteInvest.materialSubtotal) }}</p>
                  </div>
                </div>
              </div>

              <!-- Services -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-service-line me-2 text-primary"></i>
                    Managed Service
                  </h5>
                  <span class="badge bg-label-primary">{{ (siteInvest.siteInvestServices || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(siteInvest.siteInvestServices || []).length" class="text-muted text-center py-4">
                    Tidak ada service
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Unit</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(s, i) in (siteInvest.siteInvestServices || [])" :key="s.id || i">
                          <td>{{ s.service?.name || '—' }}</td>
                          <td>{{ s.unit?.symbol || s.unit?.name || '—' }}</td>
                          <td class="text-center">{{ s.quantity ?? 0 }}</td>
                          <td class="text-end">{{ formatRupiah(s.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah(s.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal Service: {{ formatRupiah(siteInvest.serviceSubtotal) }}</p>
                  </div>
                </div>
              </div>

              <!-- DID (Delivery/Installation) -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4 d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-truck-line me-2 text-primary"></i>
                    DID (Delivery / Installation)
                  </h5>
                  <span class="badge bg-label-primary">{{ (siteInvest.siteInvestDids || []).length }} item</span>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div v-if="!(siteInvest.siteInvestDids || []).length" class="text-muted text-center py-4">
                    Tidak ada DID
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>DID</th>
                          <th class="text-center">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in (siteInvest.siteInvestDids || [])" :key="d.id || i">
                          <td>{{ d.did?.code || d.did?.name || '—' }}</td>
                          <td class="text-center">{{ d.quantity ?? 1 }}</td>
                          <td class="text-end">{{ formatRupiah(d.price) }}</td>
                          <td class="text-end fw-medium">{{ formatRupiah((d.price || 0) * (d.quantity ?? 1)) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="mb-0 text-end fw-semibold mt-3">Subtotal DID: {{ formatRupiah(siteInvest.didSubtotal) }}</p>
                  </div>
                </div>
              </div>

              <!-- Budget -->
              <div class="card mb-4 shadow-sm border-0" v-if="(siteInvest.siteInvestBudgets || []).length">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-money-dollar-circle-line me-2 text-primary"></i>
                    Alokasi Budget
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Sumber Budget</th>
                          <th>Budget Holder (Penanggung Jawab)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(b, i) in (siteInvest.siteInvestBudgets || [])" :key="b.id || i">
                          <td>{{ (b.budgetSource?.budgetCode || b.budgetSource?.budget_code || '') + ' - ' + (b.budgetSource?.budgetName || b.budgetSource?.budget_name || '—') }}</td>
                          <td>{{ b.budgetHolder?.fullName || b.budgetHolder?.email || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar: Ringkasan Keuangan + Meta -->
            <div class="col-xl-4 col-12">
              <!-- Ringkasan Keuangan -->
              <div class="card mb-4 shadow-sm border-0 si-detail-summary">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-pie-chart-2-line me-2 text-primary"></i>
                    Ringkasan Investasi
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Managed Service</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(siteInvest.serviceSubtotal) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Material</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(siteInvest.materialSubtotal) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">DID</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(siteInvest.didSubtotal) }}</p>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Total Investasi</label>
                    <p class="mb-0 fw-semibold">{{ formatRupiah(siteInvest.total) }}</p>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Contingency ({{ siteInvest.contingencyPercent || 0 }}%)</label>
                    <p class="mb-0 fw-medium">{{ formatRupiah(siteInvest.contingencyAmount) }}</p>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between py-1">
                    <label class="form-label text-muted medium mb-0">Grand Total</label>
                    <p class="mb-0 fw-medium fs-5 text-primary">{{ formatRupiah(siteInvest.grandTotal) }}</p>
                  </div>
                </div>
              </div>

              <!-- Customer Information -->
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-user-line me-2 text-primary"></i>
                    Informasi Customer
                  </h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Customer</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer?.name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Telepon</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer?.phone || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Email</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer?.email || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Alamat</label>
                    <p class="mb-0 fw-medium text-break">{{ siteInvest.customer?.address || '—' }}</p>
                  </div>
                  <div v-if="siteInvest.customer?.npwp" class="mb-0">
                    <label class="form-label text-muted mb-1">NPWP</label>
                    <p class="mb-0 fw-medium">{{ siteInvest.customer.npwp }}</p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteInvestStore } from '~/stores/site-invest'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'

const route = useRoute()
const siteInvestStore = useSiteInvestStore()
const { userHasPermission, userHasRole } = usePermissions()
const { getAttachmentUrl, getFileIcon, isImageFile } = useImageUrl()
const formatRupiah = useFormatRupiah()

const { siteInvest, loading, error } = storeToRefs(siteInvestStore)

const id = computed(() => String(route.params.id || ''))

function formatDate (v: string | null | undefined) {
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
    case 'pending': return { text: 'Pending', class: 'badge rounded-pill bg-label-warning' }
    case 'approved': return { text: 'Approved', class: 'badge rounded-pill bg-label-success' }
    case 'rejected': return { text: 'Rejected', class: 'badge rounded-pill bg-label-danger' }
    case 'expired': return { text: 'Expired', class: 'badge rounded-pill bg-label-dark' }
    default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

function getPriorityBadge (priority: string) {
  switch (priority) {
    case 'low': return { text: 'Low', class: 'badge rounded-pill bg-label-info' }
    case 'medium': return { text: 'Medium', class: 'badge rounded-pill bg-label-warning' }
    case 'high': return { text: 'High', class: 'badge rounded-pill bg-label-danger' }
    default: return { text: '-', class: 'badge rounded-pill bg-label-light' }
  }
}

function getBusinessSchemeBadgeClass (businessSchemeId: number | null | undefined): string {
  switch (businessSchemeId) {
    case 1: return 'bg-label-info'
    case 2: return 'bg-label-secondary'
    case 3: return 'bg-label-primary'
    case 4: return 'bg-label-success'
    default: return 'bg-label-light'
  }
}

async function load () {
  if (!id.value) return
  try {
    await siteInvestStore.getSiteInvestDetails(id.value)
  } catch (e) {
    console.error('Detail load error:', e)
  }
}

function refreshAfterAction () {
  setTimeout(() => load(), 500)
}

async function onApprove () {
  if (!siteInvest.value) return
  await siteInvestStore.approveSiteInvest(siteInvest.value.id)
  refreshAfterAction()
}

async function onReject () {
  if (!siteInvest.value) return
  await siteInvestStore.rejectSiteInvest(siteInvest.value.id)
  refreshAfterAction()
}

async function onSubmit () {
  if (!siteInvest.value) return
  await siteInvestStore.submitSiteInvest(siteInvest.value.id)
  refreshAfterAction()
}

function handleDelete () {
  if (!siteInvest.value) return
  siteInvestStore.deleteSiteInvest(siteInvest.value.id)
  navigateTo('/sales/site-investment')
}

function onPrintSI () {
  if (!siteInvest.value?.id) return
  navigateTo({ path: '/sales/cetak-si', query: { id: siteInvest.value.id, print: 'true' } })
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})
</script>

<style scoped>
.si-detail-summary .card-body {
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
