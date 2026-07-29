<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-muted">Memuat detail Material Request...</p>
          </div>
        </div>

        <div v-else-if="error && !materialRequest" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/purchasing/material-request" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="materialRequest">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/purchasing/material-request" class="btn btn-outline-secondary btn-sm"><i class="ri-arrow-left-line me-1"></i> Kembali</NuxtLink>
              <span class="text-muted">/</span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ getMaterialRequestNo(materialRequest) || '—' }}</h4>
                <small class="text-muted">{{ formatDateTime(materialRequest.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(materialRequest).class" class="badge">{{ getStatusBadge(materialRequest).text }}</span>
              <span v-if="materialRequest.priority" class="badge bg-label-secondary text-capitalize">{{ materialRequest.priority }}</span>
            </div>
            <div class="d-flex gap-2">
              <div class="btn-group">
                <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown">Actions</button>
                <div class="dropdown-menu">
                  <a v-if="materialRequest.status === 'draft' || materialRequest.status === 'rejected'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit"><i class="ri-send-plane-line me-2"></i> {{ materialRequest.status === 'rejected' ? 'Submit Revisi' : 'Submit Material Request' }}</a>
                  <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="showApproveModal = true"><i class="ri-check-line me-2"></i> Approve</a>
                  <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="showRejectModal = true"><i class="ri-close-line me-2"></i> Reject</a>
                  <a v-if="materialRequest.status === 'draft' || materialRequest.status === 'rejected'" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/purchasing/material-request/form/' + materialRequest.id)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo({ path: '/purchasing/cetak-material-request', query: { id: materialRequest.id } })"><i class="ri-printer-line me-2"></i> Cetak Material Request</a>
                  <a class="dropdown-item text-danger" href="javascript:void(0)" @click="onDelete" v-if="materialRequest.status === 'draft'"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-xl-8">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Informasi Material Request</h5></div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6"><label class="form-label text-muted">No. MRF</label><p class="mb-0 fw-medium">{{ getMaterialRequestNo(materialRequest) || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Tanggal Request</label><p class="mb-0">{{ materialRequest.requestDate || materialRequest.request_date || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Pemohon</label><p class="mb-0">{{ materialRequest.requestedByUser?.fullName || materialRequest.requestedByUser?.full_name || materialRequest.createdByUser?.full_name || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Departemen</label><p class="mb-0">{{ materialRequest.department?.nm_departemen || materialRequest.department?.nmDepartemen || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">No. Site Investment</label><p class="mb-0">{{ siteInvestmentNo || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Proyek / Site</label><p class="mb-0">{{ siteInvestmentName || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Customer</label><p class="mb-0">{{ siteInvestmentCustomer || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Total Estimasi</label><p class="mb-0 fw-semibold text-primary">{{ formatRupiah(getMaterialRequestTotal(materialRequest)) }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Mata Uang</label><p class="mb-0">{{ materialRequest.currency || 'IDR' }}</p></div>
                    <div class="col-12" v-if="materialRequest.status === 'rejected' && (materialRequest.rejectionReason || materialRequest.rejectReason)">
                      <label class="form-label text-muted">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">{{ materialRequest.rejectionReason || materialRequest.rejectReason || '—' }}</p>
                    </div>
                    <div v-if="materialRequest.purpose" class="col-12 mt-2">
                      <label class="form-label text-muted">Keperluan</label>
                      <p class="mb-0 text-break">{{ materialRequest.purpose }}</p>
                    </div>
                    <div v-if="materialRequest.notes" class="col-12 mt-2">
                      <label class="form-label text-muted">Catatan</label>
                      <p class="mb-0 text-break">{{ materialRequest.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Daftar Item Yang Diminta</h5></div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!itemList.length" class="text-muted text-center py-4">Tidak ada item</div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nama</th>
                          <th>Spesifikasi</th>
                          <th class="text-end">Qty</th>
                          <th>Satuan</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                          <th>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in itemList" :key="d.id || i">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.productName || d.product?.name || '-' }}</td>
                          <td class="text-muted small">{{ d.specification || '—' }}</td>
                          <td class="text-end">{{ Number(d.qty ?? d.quantity) || 0 }}</td>
                          <td>{{ d.uom?.symbol || d.uom?.name || '—' }}</td>
                          <td class="text-end">{{ formatRupiah(d.estimatedPrice ?? d.estimated_price) }}</td>
                          <td class="text-end fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                          <td class="text-muted small">{{ d.remarks || d.notes || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-4">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Ringkasan</h5></div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1"><span class="text-muted">Jumlah item</span><span class="fw-medium">{{ itemList.length }}</span></div>
                  <hr class="my-2">
                  <div class="d-flex justify-content-between py-1"><span class="text-muted fw-bold">Grand Total</span><span class="fw-bold fs-5 text-primary">{{ formatRupiah(getMaterialRequestTotal(materialRequest)) }}</span></div>
                </div>
              </div>

              <div class="card mb-4 shadow-sm border-0" v-if="materialRequest.siteInvestment">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Site Investment</h5></div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">No. SI</label>
                    <p class="mb-0 fw-medium">
                      <NuxtLink
                        v-if="materialRequest.siteInvestment?.id"
                        :to="`/sales/site-investment/detail/${materialRequest.siteInvestment.id}`"
                        class="text-primary"
                      >
                        {{ siteInvestmentNo }}
                      </NuxtLink>
                      <span v-else>{{ siteInvestmentNo }}</span>
                    </p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Nama Proyek</label>
                    <p class="mb-0 fw-medium">{{ siteInvestmentName }}</p>
                  </div>
                  <div class="mb-0">
                    <label class="form-label text-muted mb-1">Customer</label>
                    <p class="mb-0 fw-medium">{{ siteInvestmentCustomer }}</p>
                  </div>
                </div>
              </div>

              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Metadata</h5></div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ materialRequest.createdByUser?.fullName || materialRequest.createdByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Dibuat</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(materialRequest.createdAt) }}</p>
                  </div>
                  <div v-if="materialRequest.approvedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(materialRequest, 'approved') || materialRequest.approvedByUser?.full_name || materialRequest.approvedByUser?.fullName || '—' }}</p>
                  </div>
                  <div v-if="materialRequest.approvedAt" class="mb-0">
                    <label class="form-label text-muted mb-1">Tanggal Disetujui</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(materialRequest.approvedAt) }}</p>
                  </div>
                </div>
              </div>

              <ApprovalCard
                :status-text="getStatusText(materialRequest)"
                :current-step="approvalStepDisplay"
                :current-approvers="materialRequest.currentApprovers ?? []"
                :approval-logs="materialRequest.approvalLogs ?? materialRequest.approval_logs ?? []"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="content-backdrop fade"></div>
  </div>

  <Teleport to="body">
    <div v-if="showApproveModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click.self="showApproveModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve Material Request</h5>
            <button type="button" class="btn-close" @click="showApproveModal = false"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Catatan (opsional)</label>
            <textarea v-model="approveRemarks" class="form-control" rows="2" placeholder="Catatan approval..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showApproveModal = false">Batal</button>
            <button type="button" class="btn btn-success" @click="handleApprove"><i class="ri-check-line me-1"></i> Approve</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="showRejectModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" @click.self="showRejectModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reject Material Request</h5>
            <button type="button" class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Alasan Reject <span class="text-danger">*</span></label>
            <textarea v-model="rejectRemarks" class="form-control" rows="3" placeholder="Wajib diisi..." required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
            <button type="button" class="btn btn-danger" :disabled="!rejectRemarks?.trim()" @click="handleReject"><i class="ri-close-line me-1"></i> Reject</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMaterialRequestStore, getMaterialRequestNo, getMaterialRequestTotal, getMaterialRequestItemsList } from '~/stores/material-request'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { useMaterialRequestApproval } from '~/composables/useMaterialRequestApproval'
import ApprovalCard from '~/components/ApprovalCard.vue'

const route = useRoute()
const materialRequestStore = useMaterialRequestStore()
const { canApproveMaterialRequest, canRejectMaterialRequest } = useMaterialRequestApproval()
const formatRupiah = useFormatRupiah()
const { materialRequest, loading, error } = storeToRefs(materialRequestStore)
const { getStatusBadge, getStatusText, getApprovalStepJabatan } = useApprovalStatus()

const id = computed(() => String(route.params.id || ''))
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const approveRemarks = ref('')
const rejectRemarks = ref('')

const approvalStepDisplay = computed(() => {
  const mrf = materialRequest.value
  if (!mrf || mrf.status !== 'pending') return mrf?.currentApprovalStep ?? null
  return mrf.nextApprovalStep ?? (Number(mrf.currentApprovalStep ?? 0) + 1)
})

const canApprove = computed(() => canApproveMaterialRequest(materialRequest.value))
const canReject = computed(() => canRejectMaterialRequest(materialRequest.value))
const itemList = computed(() => getMaterialRequestItemsList(materialRequest.value))

const siteInvestmentNo = computed(() => {
  const si = materialRequest.value?.siteInvestment
  return si?.siNumber || si?.si_number || '—'
})

const siteInvestmentName = computed(() => {
  const si = materialRequest.value?.siteInvestment
  return si?.name || si?.projectName || si?.project_name || '—'
})

const siteInvestmentCustomer = computed(() => {
  const si = materialRequest.value?.siteInvestment
  return si?.customer?.name || '—'
})

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function load () {
  if (!id.value) return
  await materialRequestStore.getMaterialRequestDetails(id.value)
}

async function onSubmit () {
  if (!materialRequest.value) return
  const ok = await materialRequestStore.submitMaterialRequest(materialRequest.value.id, { refreshList: false })
  if (ok) await load()
}

async function handleApprove () {
  if (!materialRequest.value) return
  showApproveModal.value = false
  const ok = await materialRequestStore.approveMaterialRequest(materialRequest.value.id, approveRemarks.value, { refreshList: false })
  if (ok) await load()
  approveRemarks.value = ''
}

async function handleReject () {
  if (!materialRequest.value || !rejectRemarks.value?.trim()) return
  showRejectModal.value = false
  const ok = await materialRequestStore.rejectMaterialRequest(materialRequest.value.id, rejectRemarks.value.trim(), { refreshList: false })
  if (ok) await load()
  rejectRemarks.value = ''
}

function onDelete () {
  if (!materialRequest.value) return
  materialRequestStore.deleteMaterialRequest(materialRequest.value.id)
  navigateTo('/purchasing/material-request')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'] })
</script>
