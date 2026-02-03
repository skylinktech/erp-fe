<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-muted">Memuat detail IRO...</p>
          </div>
        </div>

        <div v-else-if="error && !iro" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/order-process/iro" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="iro">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/order-process/iro" class="btn btn-outline-secondary btn-sm"><i class="ri-arrow-left-line me-1"></i> Kembali</NuxtLink>
              <span class="text-muted">/</span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ iro.noIro || (iro as any).no_iro || '—' }}</h4>
                <small class="text-muted">{{ formatDateTime(iro.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(iro).class" class="badge">{{ getStatusBadge(iro).text }}</span>
            </div>
          <div class="d-flex gap-2">
              <div class="btn-group">
                <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown">Actions</button>
                <div class="dropdown-menu">
                  <a v-if="iro.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit"><i class="ri-send-plane-line me-2"></i> Submit IRO</a>
                <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="onApprove"><i class="ri-check-line me-2"></i> Approve</a>
                <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="onReject"><i class="ri-close-line me-2"></i> Reject</a>
                  <a v-if="iro.status === 'draft'" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/order-process/iro?edit=' + iro.id)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                  <a class="dropdown-item text-danger" href="javascript:void(0)" @click="onDelete" v-if="iro.status === 'draft'"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-xl-8">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Informasi IRO</h5></div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6"><label class="form-label text-muted">No. IRO</label><p class="mb-0 fw-medium">{{ iro.noIro || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Customer</label><p class="mb-0 fw-medium">{{ iro.customer?.name || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Quotation</label><p class="mb-0"><NuxtLink v-if="iro.quotation?.id" :to="'/sales/quotation/detail/' + iro.quotation.id" class="text-primary">{{ iro.quotation?.noQuotation || '—' }}</NuxtLink><span v-else>{{ iro.quotation?.noQuotation || '—' }}</span></p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Site Investment</label><p class="mb-0"><NuxtLink v-if="iro.siteInvest?.id" :to="'/sales/site-investment/detail/' + iro.siteInvest.id" class="text-primary">{{ iro.siteInvest?.siNumber || iro.siteInvest?.name || '—' }}</NuxtLink><span v-else>{{ iro.siteInvest?.siNumber || '—' }}</span></p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Terms of Payment</label><p class="mb-0">{{ iro.termsOfPayment || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Dibuat oleh</label><p class="mb-0">{{ iro.createdByUser?.fullName || iro.createdByUser?.full_name || '—' }}</p></div>
                  </div>
                </div>
              </div>

              <!-- Detail Service -->
              <div v-if="detailsByType.service.length" class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Detail Service</h5></div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead><tr><th>#</th><th>Service</th><th>Service Plan</th><th class="text-center">Min. Period</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        <tr v-for="(d, i) in detailsByType.service" :key="d.id || 's-' + i">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.service?.name || d.service?.code || '-' }}</td>
                          <td>{{ d.servicePlan?.name || '-' }}</td>
                          <td class="text-center">{{ d.minimumPeriod ?? d.minimum_period ?? '12' }} bln</td>
                          <td>{{ Number(d.quantity) || 0 }}</td>
                          <td>{{ formatRupiah(d.price) }}</td>
                          <td class="fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Detail Product (Material) -->
              <div v-if="detailsByType.product.length" class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Detail Product (Material)</h5></div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        <tr v-for="(d, i) in detailsByType.product" :key="d.id || 'p-' + i">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.product?.name || d.product?.sku || '-' }}</td>
                          <td>{{ Number(d.quantity) || 0 }}</td>
                          <td>{{ formatRupiah(d.price) }}</td>
                          <td class="fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Detail DID -->
              <div v-if="detailsByType.did.length" class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Detail Delivery, Installation, Dismantle (DID)</h5></div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead><tr><th>#</th><th>DID</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        <tr v-for="(d, i) in detailsByType.did" :key="d.id || 'd-' + i">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.did?.code || d.did?.name || '-' }}</td>
                          <td>{{ Number(d.quantity) || 0 }}</td>
                          <td>{{ formatRupiah(d.price) }}</td>
                          <td class="fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-if="!iro.iroDetails?.length" class="card mb-4 shadow-sm border-0">
                <div class="card-body text-muted text-center py-5">Tidak ada item</div>
              </div>
            </div>
            <div class="col-xl-4">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Ringkasan</h5></div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1"><span class="text-muted">Material (Product)</span><span class="fw-medium">{{ formatRupiah(iro.materialSubtotal ?? 0) }}</span></div>
                  <div class="d-flex justify-content-between py-1"><span class="text-muted">Service</span><span class="fw-medium">{{ formatRupiah(computedServiceSubtotal) }}</span></div>
                  <div class="d-flex justify-content-between py-1"><span class="text-muted">DID</span><span class="fw-medium">{{ formatRupiah(iro.didSubtotal ?? 0) }}</span></div>
                  <hr class="my-2">
                  <div class="d-flex justify-content-between py-1"><span class="text-muted fw-bold">Grand Total</span><span class="fw-bold fs-5 text-primary">{{ formatRupiah(iro.grandTotal ?? 0) }}</span></div>
                </div>
              </div>

              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Approval</h5>
                </div>
                <div class="card-body px-5 pt-3 pb-4">
                  <div class="mb-3">
                    <div class="text-muted">Status</div>
                    <div class="fw-semibold">{{ getStatusBadge(iro).text }}</div>
                  </div>

                  <div class="mb-3">
                    <div class="text-muted">Step Saat Ini</div>
                    <div class="fw-semibold">{{ iro.currentApprovalStep ?? '—' }}</div>
                  </div>

                  <div v-if="(iro.currentApprovers?.length || 0) > 0" class="mb-3">
                    <div class="text-muted">Approver Saat Ini</div>
                    <ul class="mb-0 ps-3">
                      <li v-for="ap in iro.currentApprovers" :key="ap.userId">
                        {{ ap.fullName || ap.email || ap.userId }}
                        <small v-if="ap.source" class="text-muted">({{ ap.source }})</small>
                      </li>
                    </ul>
                  </div>

                  <div v-if="(iro.approvalLogs?.length || 0) > 0">
                    <div class="text-muted">Riwayat Approval</div>
                    <ul class="mb-0 ps-3">
                      <li v-for="log in iro.approvalLogs" :key="log.id">
                        {{ log.action === 'approved' ? 'Approved' : 'Rejected' }} by {{ getStepJabatanLabel(log) }} — {{ getStepLabel(log) }}
                        <div v-if="log.remarks" class="text-muted small">Catatan: {{ log.remarks }}</div>
                      </li>
                    </ul>
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
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useIroStore } from '~/stores/iro'
import { useUserStore } from '~/stores/user'
import Swal from 'sweetalert2'

const route = useRoute()
const iroStore = useIroStore()
const userStore = useUserStore()
const formatRupiah = useFormatRupiah()
const { iro, loading, error } = storeToRefs(iroStore)
const id = computed(() => String(route.params.id || ''))
const currentUserId = computed(() => userStore.user?.id ?? null)

const canApprove = computed(() => {
  if (!iro.value || iro.value.status !== 'pending') return false
  const approvers = iro.value.currentApprovers || []
  if (!currentUserId.value) return false
  return approvers.length === 0 || approvers.some((a) => a.userId === currentUserId.value)
})

const canReject = computed(() => canApprove.value)

const detailsByType = computed(() => {
  const list = iro.value?.iroDetails ?? []
  return {
    product: list.filter((d) => String(d.itemType || '').toUpperCase() === 'PRODUCT'),
    service: list.filter((d) => String(d.itemType || '').toUpperCase() === 'SERVICE'),
    did: list.filter((d) => String(d.itemType || '').toUpperCase() === 'DID'),
  }
})

const computedServiceSubtotal = computed(() => {
  const g = Number(iro.value?.grandTotal) || 0
  const m = Number(iro.value?.materialSubtotal) || 0
  const d = Number(iro.value?.didSubtotal) || 0
  return Math.max(0, g - m - d)
})

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const { getStatusBadge } = useApprovalStatus()

/** Jabatan dari step workflow (approval_workflow_steps.jabatan) — bukan jabatan user */
function getStepJabatanLabel (log: { stepOrder: number; workflow?: { steps?: Array<{ step_order?: number; stepOrder?: number; step_name?: string; stepName?: string; jabatan?: { nm_jabatan?: string; nmJabatan?: string } }> }; user?: { fullName?: string; full_name?: string; email?: string } }) {
  const steps = log.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  const nm = step?.jabatan?.nm_jabatan ?? step?.jabatan?.nmJabatan ?? ''
  if (nm) return nm
  const stepName = step?.step_name ?? step?.stepName ?? ''
  if (stepName) return stepName
  return log.user?.fullName ?? log.user?.full_name ?? log.user?.email ?? '—'
}

function getStepLabel (log: { stepOrder: number; workflow?: { steps?: Array<{ step_order?: number; stepOrder?: number; step_name?: string; stepName?: string }> } }) {
  const steps = log.workflow?.steps || []
  const step = steps.find((s) => (s.step_order ?? s.stepOrder) === log.stepOrder)
  const stepName = step?.step_name ?? step?.stepName
  return stepName || `Step ${log.stepOrder}`
}

async function load () {
  if (!id.value) return
  await iroStore.getIroDetails(id.value)
}

function refresh () { setTimeout(() => load(), 500) }

async function onSubmit () {
  if (!iro.value) return
  const ok = await iroStore.submitIro(iro.value.id)
  if (ok) refresh()
}

async function onApprove () {
  if (!iro.value) return
  const result = await Swal.fire({
    title: 'Approve IRO',
    input: 'textarea',
    inputLabel: 'Catatan (optional)',
    inputPlaceholder: 'Tulis catatan approval jika diperlukan...',
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'Batal',
  })
  if (!result.isConfirmed) return
  const ok = await iroStore.approveIro(iro.value.id, result.value || '')
  if (ok) refresh()
}

async function onReject () {
  if (!iro.value) return
  const result = await Swal.fire({
    title: 'Reject IRO',
    input: 'textarea',
    inputLabel: 'Alasan reject (wajib)',
    inputPlaceholder: 'Tulis alasan reject...',
    inputValidator: (value) => (!value ? 'Alasan reject wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Reject',
    cancelButtonText: 'Batal',
  })
  if (!result.isConfirmed) return
  const ok = await iroStore.rejectIro(iro.value.id, result.value || '')
  if (ok) refresh()
}

function onDelete () {
  if (!iro.value) return
  iroStore.deleteIro(iro.value.id)
  navigateTo('/order-process/iro')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'] })
</script>
