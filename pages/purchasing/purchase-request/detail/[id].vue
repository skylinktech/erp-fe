<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-muted">Memuat detail Purchase Request...</p>
          </div>
        </div>

        <div v-else-if="error && !purchaseRequest" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/purchasing/purchase-request" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="purchaseRequest">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/purchasing/purchase-request" class="btn btn-outline-secondary btn-sm"><i class="ri-arrow-left-line me-1"></i> Kembali</NuxtLink>
              <span class="text-muted">/</span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ getPurchaseRequestNo(purchaseRequest) || '—' }}</h4>
                <small class="text-muted">{{ formatDateTime(purchaseRequest.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(purchaseRequest).class" class="badge">{{ getStatusBadge(purchaseRequest).text }}</span>
              <span v-if="purchaseRequest.priority" class="badge bg-label-secondary text-capitalize">{{ purchaseRequest.priority }}</span>
            </div>
          <div class="d-flex gap-2">
              <div class="btn-group">
                <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown">Actions</button>
                <div class="dropdown-menu">
                  <a v-if="purchaseRequest.status === 'draft' || purchaseRequest.status === 'rejected'" class="dropdown-item" href="javascript:void(0)" @click="onSubmit"><i class="ri-send-plane-line me-2"></i> {{ purchaseRequest.status === 'rejected' ? 'Submit Revisi' : 'Submit Purchase Request' }}</a>
                <a v-if="canApprove" class="dropdown-item" href="javascript:void(0)" @click="showApproveModal = true"><i class="ri-check-line me-2"></i> Approve</a>
                <a v-if="canReject" class="dropdown-item" href="javascript:void(0)" @click="showRejectModal = true"><i class="ri-close-line me-2"></i> Reject</a>
                  <a v-if="purchaseRequest.status === 'draft' || purchaseRequest.status === 'rejected'" class="dropdown-item" href="javascript:void(0)" @click="navigateTo('/purchasing/purchase-request/form/' + purchaseRequest.id)"><i class="ri-edit-box-line me-2"></i> Edit</a>
                  <a class="dropdown-item" href="javascript:void(0)" @click="navigateTo({ path: '/purchasing/cetak-purchase-request', query: { id: purchaseRequest.id } })"><i class="ri-printer-line me-2"></i> Cetak Purchase Request</a>
                  <a class="dropdown-item text-danger" href="javascript:void(0)" @click="onDelete" v-if="purchaseRequest.status === 'draft'"><i class="ri-delete-bin-7-line me-2"></i> Hapus</a>
                </div>
              </div>
            </div>
          </div>

          <StockAvailabilityAlert
            v-if="showStockCheck"
            class="mb-4"
            :result="stockResult"
            :loading="stockLoading"
            :error="stockError"
            :show-create-po-button="showCreatePoButton"
            :purchase-request-id="purchaseRequest.id"
            :notify-on-sufficient="true"
          />

          <div class="row g-4">
            <div class="col-xl-8">
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Informasi Purchase Request</h5></div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6"><label class="form-label text-muted">No. PR</label><p class="mb-0 fw-medium">{{ getPurchaseRequestNo(purchaseRequest) || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Tanggal Request</label><p class="mb-0">{{ purchaseRequest.requestDate || purchaseRequest.request_date || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Pemohon</label><p class="mb-0">{{ purchaseRequest.requestedByUser?.fullName || purchaseRequest.requestedByUser?.full_name || purchaseRequest.createdByUser?.full_name || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Departemen</label><p class="mb-0">{{ purchaseRequest.department?.nm_departemen || purchaseRequest.department?.nmDepartemen || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Budget</label><p class="mb-0">{{ purchaseRequest.budget?.budgetCode || purchaseRequest.budget?.budget_code || '—' }} {{ purchaseRequest.budget?.budgetName || purchaseRequest.budget?.budget_name || '' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Gudang</label><p class="mb-0">{{ purchaseRequest.warehouse?.name || '—' }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Total Estimasi</label><p class="mb-0 fw-semibold text-primary">{{ formatRupiah(getPurchaseRequestTotal(purchaseRequest)) }}</p></div>
                    <div class="col-md-6"><label class="form-label text-muted">Mata Uang</label><p class="mb-0">{{ purchaseRequest.currency || 'IDR' }}</p></div>
                    <div class="col-12" v-if="purchaseRequest.status === 'rejected' && (purchaseRequest.rejectionReason || purchaseRequest.rejectReason)">
                      <label class="form-label text-muted">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">{{ purchaseRequest.rejectionReason || purchaseRequest.rejectReason || '—' }}</p>
                    </div>
                    <div v-if="purchaseRequest.purpose" class="col-12 mt-2">
                      <label class="form-label text-muted">Keperluan</label>
                      <p class="mb-0 text-break">{{ purchaseRequest.purpose }}</p>
                    </div>
                    <div v-if="purchaseRequest.notes" class="col-12 mt-2">
                      <label class="form-label text-muted">Catatan</label>
                      <p class="mb-0 text-break">{{ purchaseRequest.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-4">
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
                          <th>Tipe</th>
                          <th>Gudang</th>
                          <th class="text-end">Qty</th>
                          <th class="text-end">Harga</th>
                          <th class="text-end">Subtotal</th>
                          <th>Status Stok</th>
                          <th>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in itemList" :key="d.id || i">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.productName || d.product?.name || '-' }}</td>
                          <td class="text-uppercase">{{ d.productType || '-' }}</td>
                          <td>{{ d.warehouse?.name || d.warehouse?.code || '—' }}</td>
                          <td class="text-end">{{ Number(d.qty ?? d.quantity) || 0 }}</td>
                          <td class="text-end">{{ formatRupiah(d.estimatedPrice ?? d.estimated_price) }}</td>
                          <td class="text-end fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                          <td class="text-nowrap">
                            <span
                              v-if="itemStockDisplay(d).label"
                              :class="['badge', itemStockDisplay(d).badgeClass]"
                              :title="itemStockDisplay(d).title"
                            >
                              {{ itemStockDisplay(d).label }}
                            </span>
                            <span v-else class="text-muted small">{{ itemStockDisplay(d).fallback }}</span>
                          </td>
                          <td class="text-muted small">{{ d.remarks || d.notes || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-4">
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Ringkasan</h5></div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1"><span class="text-muted">Jumlah item</span><span class="fw-medium">{{ itemList.length }}</span></div>
                  <hr class="my-2">
                  <div class="d-flex justify-content-between py-1"><span class="text-muted fw-bold">Grand Total</span><span class="fw-bold fs-5 text-primary">{{ formatRupiah(getPurchaseRequestTotal(purchaseRequest)) }}</span></div>
                </div>
              </div>

              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4"><h5 class="card-title mb-0">Metadata</h5></div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">{{ purchaseRequest.createdByUser?.fullName || purchaseRequest.createdByUser?.full_name || '—' }}</p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Dibuat</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(purchaseRequest.createdAt) }}</p>
                  </div>
                  <div v-if="purchaseRequest.approvedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">{{ getApprovalStepJabatan(purchaseRequest, 'approved') || purchaseRequest.approvedByUser?.full_name || purchaseRequest.approvedByUser?.fullName || '—' }}</p>
                  </div>
                  <div v-if="purchaseRequest.approvedAt" class="mb-0">
                    <label class="form-label text-muted mb-1">Tanggal Disetujui</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(purchaseRequest.approvedAt) }}</p>
                  </div>
                </div>
              </div>

              <ApprovalCard
                :status-text="getStatusText(purchaseRequest)"
                :current-step="approvalStepDisplay"
                :current-approvers="purchaseRequest.currentApprovers ?? []"
                :approval-logs="purchaseRequest.approvalLogs ?? purchaseRequest.approval_logs ?? []"
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
            <h5 class="modal-title">Approve Purchase Request</h5>
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
            <h5 class="modal-title">Reject Purchase Request</h5>
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
import { usePurchaseRequestStore, getPurchaseRequestNo, getPurchaseRequestTotal, getPurchaseRequestItemsList } from '~/stores/purchase-request'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { usePurchaseRequestApproval } from '~/composables/usePurchaseRequestApproval'
import ApprovalCard from '~/components/ApprovalCard.vue'
import StockAvailabilityAlert from '~/components/purchasing/StockAvailabilityAlert.vue'
import { usePurchaseRequestStockAvailability } from '~/composables/usePurchaseRequestStockAvailability'
import { stockLineBadgeClass, stockLineBadgeLabel } from '~/utils/purchasing/stockAvailability'
import type { StockAvailabilityLine } from '~/types/purchasing/stock-availability'

const route = useRoute()
const purchaseRequestStore = usePurchaseRequestStore()
const { canApprovePurchaseRequest, canRejectPurchaseRequest } = usePurchaseRequestApproval()
const formatRupiah = useFormatRupiah()
const { purchaseRequest, loading, error } = storeToRefs(purchaseRequestStore)
const { getStatusBadge, getStatusText, getApprovalStepJabatan } = useApprovalStatus()

const id = computed(() => String(route.params.id || ''))
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const approveRemarks = ref('')
const rejectRemarks = ref('')

const approvalStepDisplay = computed(() => {
  const pr = purchaseRequest.value
  if (!pr || pr.status !== 'pending') return pr?.currentApprovalStep ?? null
  return pr.nextApprovalStep ?? (Number(pr.currentApprovalStep ?? 0) + 1)
})

const canApprove = computed(() => canApprovePurchaseRequest(purchaseRequest.value))

const canReject = computed(() => canRejectPurchaseRequest(purchaseRequest.value))

const itemList = computed(() => getPurchaseRequestItemsList(purchaseRequest.value))

const PR_STOCK_STATUSES = ['pending', 'approved', 'completed']

const showStockCheck = computed(() => {
  const status = String(purchaseRequest.value?.status ?? '').toLowerCase()
  return PR_STOCK_STATUSES.includes(status)
})

const { result: stockResult, loading: stockLoading, error: stockError, refresh: refreshStock } =
  usePurchaseRequestStockAvailability(id, {
    enabled: showStockCheck,
  })

const showCreatePoButton = computed(() => {
  const status = String(purchaseRequest.value?.status ?? '').toLowerCase()
  return status === 'approved' && !!stockResult.value?.hasShortage
})

function stockLineForItem(item: (typeof itemList.value)[number]): StockAvailabilityLine | null {
  if (!item || item.productType !== 'product' || !item.productId) return null
  const whId = item.warehouseId ?? item.warehouse?.id ?? purchaseRequest.value?.warehouseId ?? null
  const lines = stockResult.value?.lines ?? []
  return (
    lines.find(
      (l) =>
        Number(l.productId) === Number(item.productId) &&
        (whId == null || Number(l.warehouseId) === Number(whId))
    ) ?? null
  )
}

function itemStockDisplay(item: (typeof itemList.value)[number]) {
  if (item.productType !== 'product' || !item.productId) {
    return { label: '', fallback: 'N/A', badgeClass: '', title: undefined }
  }
  if (!showStockCheck.value) {
    return { label: '', fallback: '—', badgeClass: '', title: 'Cek stok untuk PR pending/approved' }
  }
  if (stockLoading.value) {
    return { label: 'Memuat…', fallback: '', badgeClass: 'bg-label-secondary', title: undefined }
  }
  const line = stockLineForItem(item)
  if (line) {
    const status = line.status === 'skipped' ? 'not_found' : line.status
    return {
      label: stockLineBadgeLabel(status),
      fallback: '',
      badgeClass: stockLineBadgeClass(status),
      title: line.message || undefined,
    }
  }
  return { label: '', fallback: '—', badgeClass: '', title: undefined }
}

function formatDateTime (v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function load () {
  if (!id.value) return
  await purchaseRequestStore.getPurchaseRequestDetails(id.value)
  if (showStockCheck.value) {
    refreshStock(id.value)
  }
}

async function onSubmit () {
  if (!purchaseRequest.value) return
  const ok = await purchaseRequestStore.submitPurchaseRequest(purchaseRequest.value.id)
  if (ok) await load()
}

async function handleApprove () {
  if (!purchaseRequest.value) return
  showApproveModal.value = false
  const ok = await purchaseRequestStore.approvePurchaseRequest(purchaseRequest.value.id, approveRemarks.value)
  if (ok) await load()
  approveRemarks.value = ''
}

async function handleReject () {
  if (!purchaseRequest.value || !rejectRemarks.value?.trim()) return
  showRejectModal.value = false
  const ok = await purchaseRequestStore.rejectPurchaseRequest(purchaseRequest.value.id, rejectRemarks.value.trim())
  if (ok) await load()
  rejectRemarks.value = ''
}

function onDelete () {
  if (!purchaseRequest.value) return
  purchaseRequestStore.deletePurchaseRequest(purchaseRequest.value.id)
  navigateTo('/purchasing/purchase-request')
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({ layout: 'default', middleware: ['auth', 'check-permission'] })
</script>

<style scoped>
.purchase-request-description-content.prose p { margin-bottom: 0.5em; }
.purchase-request-description-content.prose ul,
.purchase-request-description-content.prose ol { padding-left: 1.25rem; margin-bottom: 0.5em; }
.purchase-request-description-content.prose li { margin-bottom: 0.25em; }
</style>
