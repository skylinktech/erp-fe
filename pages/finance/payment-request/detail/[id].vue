<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-muted">Memuat detail Payment Request...</p>
          </div>
        </div>

        <div v-else-if="error && !paymentRequest" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/finance/payment-request" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="paymentRequest">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/finance/payment-request" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted">/</span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ getPaymentRequestNo(paymentRequest) || '—' }}</h4>
                <PageBreadcrumb class="mt-1" :current-label="getPaymentRequestNo(paymentRequest) || '—'" />
                <small class="text-muted">{{ formatDateTime(paymentRequest.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(paymentRequest).class" class="badge">{{ getStatusBadge(paymentRequest).text }}</span>
              <span v-if="paymentRequest.priority" class="badge bg-label-secondary text-capitalize">{{ paymentRequest.priority }}</span>
            </div>
            <div class="d-flex gap-2">
              <div class="btn-group">
                <button type="button" class="btn btn-outline-secondary dropdown-toggle btn-sm" data-bs-toggle="dropdown">
                  Actions
                </button>
                <div class="dropdown-menu">
                  <a
                    v-if="canEdit"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="onSubmit"
                  >
                    <i class="ri-send-plane-line me-2"></i>
                    {{ paymentRequest.status === 'rejected' ? 'Submit Revisi' : 'Submit ke Approval' }}
                  </a>
                  <a
                    v-if="canApprove"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="showApproveModal = true"
                  >
                    <i class="ri-check-line me-2"></i> Approve
                  </a>
                  <a
                    v-if="canReject"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="showRejectModal = true"
                  >
                    <i class="ri-close-line me-2"></i> Reject
                  </a>
                  <a
                    v-if="canCreateApPayment"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="goCreateApPayment"
                  >
                    <i class="ri-bank-card-line me-2"></i> Buat AP Payment
                  </a>
                  <a
                    v-if="canEdit"
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="navigateTo('/finance/payment-request/form/' + paymentRequest.id)"
                  >
                    <i class="ri-edit-box-line me-2"></i> Edit
                  </a>
                  <a
                    class="dropdown-item"
                    href="javascript:void(0)"
                    @click="navigateTo({ path: '/finance/cetak-payment-request', query: { id: paymentRequest.id } })"
                  >
                    <i class="ri-printer-line me-2"></i> Cetak Payment Request
                  </a>
                  <a
                    v-if="canDelete"
                    class="dropdown-item text-danger"
                    href="javascript:void(0)"
                    @click="onDelete"
                  >
                    <i class="ri-delete-bin-7-line me-2"></i> Hapus
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-xl-8">
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Informasi Payment Request</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tipe Request</label>
                      <p class="mb-0 fw-medium">{{ getRequestTypeLabel(paymentRequest.requestType || paymentRequest.request_type) }}</p>
                    </div>
                    <div v-if="(paymentRequest.paymentMethod || paymentRequest.payment_method)" class="col-md-6">
                      <label class="form-label text-muted">Metode</label>
                      <p class="mb-0">{{ getPaymentMethodLabel(paymentRequest.paymentMethod || paymentRequest.payment_method) }}</p>
                    </div>
                    <div
                      v-if="paymentRequest.serviceInstance || paymentRequest.service_instance_id || paymentRequest.serviceInstanceId"
                      class="col-md-6"
                    >
                      <label class="form-label text-muted">Layanan Aktif</label>
                      <p class="mb-0 fw-medium">
                        {{
                          paymentRequest.serviceInstance?.serviceNumber ||
                          paymentRequest.serviceInstance?.service_number ||
                          '—'
                        }}
                        <span
                          v-if="paymentRequest.serviceInstance?.serviceName || paymentRequest.serviceInstance?.service_name"
                          class="text-muted fw-normal"
                        >
                          — {{ paymentRequest.serviceInstance?.serviceName || paymentRequest.serviceInstance?.service_name }}
                        </span>
                      </p>
                      <small v-if="paymentRequest.customer?.name || paymentRequest.serviceInstance?.customer?.name" class="text-muted">
                        {{ paymentRequest.customer?.name || paymentRequest.serviceInstance?.customer?.name }}
                      </small>
                    </div>
                    <div
                      v-if="paymentRequest.estimatedStartDate || paymentRequest.estimated_start_date || paymentRequest.estimatedDurationDays || paymentRequest.estimated_duration_days"
                      class="col-md-6"
                    >
                      <label class="form-label text-muted">Estimasi Durasi</label>
                      <p class="mb-0">
                        <template v-if="paymentRequest.estimatedStartDate || paymentRequest.estimated_start_date">
                          {{ String(paymentRequest.estimatedStartDate || paymentRequest.estimated_start_date).slice(0, 10) }}
                          –
                          {{ String(paymentRequest.estimatedEndDate || paymentRequest.estimated_end_date || '').slice(0, 10) }}
                        </template>
                        <span class="badge bg-label-primary ms-1">
                          {{ formatDurationDaysLabel(paymentRequest.estimatedDurationDays ?? paymentRequest.estimated_duration_days) }}
                        </span>
                      </p>
                    </div>
                    <div
                      v-if="rowRequestType !== 'project'"
                      class="col-md-12"
                    >
                      <label class="form-label text-muted">Pegawai</label>
                      <ul v-if="employeeDisplayRows.length" class="mb-0 ps-3">
                        <li
                          v-for="(emp, eIdx) in employeeDisplayRows"
                          :key="`emp-${eIdx}`"
                        >
                          {{ emp.name }}
                          <span v-if="emp.salaryLabel" class="text-muted">
                            — {{ emp.salaryLabel }}
                          </span>
                          <span v-if="emp.notes" class="text-muted">— {{ emp.notes }}</span>
                        </li>
                      </ul>
                      <p v-else class="mb-0 text-muted">—</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">No. PRQ</label>
                      <p class="mb-0 fw-medium">{{ getPaymentRequestNo(paymentRequest) || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tanggal Request</label>
                      <p class="mb-0">{{ paymentRequest.requestDate || paymentRequest.request_date || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Due Date / Jatuh Tempo</label>
                      <p class="mb-0">{{ paymentRequest.dueDate || paymentRequest.due_date || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Sumber</label>
                      <p class="mb-0">{{ getSourceTypeLabel(paymentRequest.sourceType || paymentRequest.source_type) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">No. Dokumen Sumber</label>
                      <p class="mb-0 fw-medium">{{ paymentRequest.sourceNumber || paymentRequest.source_number || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Pemohon</label>
                      <p class="mb-0">
                        {{
                          paymentRequest.requestedByUser?.fullName ||
                          paymentRequest.requestedByUser?.full_name ||
                          paymentRequest.createdByUser?.full_name ||
                          '—'
                        }}
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Departemen</label>
                      <p class="mb-0">
                        {{ paymentRequest.department?.nm_departemen || paymentRequest.department?.nmDepartemen || '—' }}
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Total Pengajuan</label>
                      <p class="mb-0 fw-semibold text-primary">{{ formatRupiah(getPaymentRequestTotal(paymentRequest)) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Mata Uang</label>
                      <p class="mb-0">{{ paymentRequest.currency || 'IDR' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Diskon</label>
                      <p class="mb-0">
                        <template v-if="Number(paymentRequest.discountPercent ?? paymentRequest.discount_percent) > 0">
                          {{ paymentRequest.discountPercent ?? paymentRequest.discount_percent }}%
                          (−{{ formatRupiah(discountAmount) }})
                        </template>
                        <template v-else>—</template>
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Pajak</label>
                      <template v-if="taxRows.length">
                        <div
                          v-for="(tax, tIdx) in taxRows"
                          :key="tax.id || `info-tax-${tIdx}`"
                          class="mb-1"
                        >
                          <span class="fw-medium">{{ tax.taxCode }} — {{ tax.taxName }}</span>
                          <span class="text-muted small ms-1">
                            ({{ tax.calculationType === 'PERCENTAGE' ? `${Number(tax.rate)}%` : formatRupiah(tax.rate) }})
                          </span>
                          <div class="small">{{ formatRupiah(tax.amount) }}</div>
                        </div>
                      </template>
                      <p v-else class="mb-0">
                        <template v-if="Number(paymentRequest.taxPercent ?? paymentRequest.tax_percent) > 0">
                          {{ paymentRequest.taxPercent ?? paymentRequest.tax_percent }}%
                          ({{ formatRupiah(taxAmount) }})
                        </template>
                        <template v-else>—</template>
                      </p>
                    </div>
                    <div
                      class="col-12"
                      v-if="paymentRequest.status === 'rejected' && (paymentRequest.rejectionReason || paymentRequest.rejectReason)"
                    >
                      <label class="form-label text-muted">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">
                        {{ paymentRequest.rejectionReason || paymentRequest.rejectReason || '—' }}
                      </p>
                    </div>
                    <div v-if="paymentRequest.purpose" class="col-12 mt-2">
                      <label class="form-label text-muted">Keperluan</label>
                      <p class="mb-0 text-break">{{ paymentRequest.purpose }}</p>
                    </div>
                    <div v-if="paymentRequest.notes" class="col-12 mt-2">
                      <label class="form-label text-muted">Catatan</label>
                      <p class="mb-0 text-break">{{ paymentRequest.notes }}</p>
                    </div>
                    <div v-if="paymentRequest.attachment" class="col-12 mt-2">
                      <label class="form-label text-muted">Attachment</label>
                      <div>
                        <a
                          :href="getAttachmentUrl(paymentRequest.attachment)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="d-inline-flex align-items-center gap-2 badge bg-label-primary text-decoration-none py-2 px-3"
                        >
                          <i :class="getFileIcon(paymentRequest.attachment) + ' me-1'"></i>
                          Lihat / Unduh File
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Informasi Penerima</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted">Nama Penerima</label>
                      <p class="mb-0">
                        {{ paymentRequest.payeeName || paymentRequest.payee_name || paymentRequest.vendor?.name || '—' }}
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Bank</label>
                      <p class="mb-0">{{ paymentRequest.bankName || paymentRequest.bank_name || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">No. Rekening</label>
                      <p class="mb-0">{{ paymentRequest.bankAccountNumber || paymentRequest.bank_account_number || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Atas Nama</label>
                      <p class="mb-0">{{ paymentRequest.bankAccountName || paymentRequest.bank_account_name || '—' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Rincian Pengajuan</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!sourceItemList.length" class="text-muted text-center py-4">Tidak ada item</div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Deskripsi</th>
                          <th class="text-end">Qty</th>
                          <th class="text-end">Nominal</th>
                          <th class="text-end">Subtotal</th>
                          <th>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in sourceItemList" :key="`src-${i}`">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.description || '-' }}</td>
                          <td class="text-end">{{ Number(d.qty) || 0 }}</td>
                          <td class="text-end">{{ formatRupiah(d.unitAmount ?? d.unit_amount) }}</td>
                          <td class="text-end fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                          <td class="text-muted small">{{ d.remarks || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div v-if="otherItemList.length" class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Biaya Lainnya</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Deskripsi</th>
                          <th class="text-end">Qty</th>
                          <th class="text-end">Nominal</th>
                          <th class="text-end">Subtotal</th>
                          <th>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in otherItemList" :key="`oth-${i}`">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.description || '-' }}</td>
                          <td class="text-end">{{ Number(d.qty) || 0 }}</td>
                          <td class="text-end">{{ formatRupiah(d.unitAmount ?? d.unit_amount) }}</td>
                          <td class="text-end fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                          <td class="text-muted small">{{ d.remarks || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4">
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Ringkasan</h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted">Jumlah item</span>
                    <span class="fw-medium">{{ sourceItemList.length }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted">Subtotal sumber</span>
                    <span class="fw-medium">{{ formatRupiah(sourceSubtotal) }}</span>
                  </div>
                  <div v-if="otherSubtotal > 0" class="d-flex justify-content-between py-1">
                    <span class="text-muted">Biaya lainnya ({{ otherItemList.length }})</span>
                    <span class="fw-medium">{{ formatRupiah(otherSubtotal) }}</span>
                  </div>
                  <div v-if="employeeSalarySubtotal > 0" class="d-flex justify-content-between py-1">
                    <span class="text-muted">Gaji pegawai</span>
                    <span class="fw-medium">{{ formatRupiah(employeeSalarySubtotal) }}</span>
                  </div>
                  <div v-if="Number(paymentRequest.discountPercent ?? paymentRequest.discount_percent) > 0" class="d-flex justify-content-between py-1">
                    <span class="text-muted">Diskon ({{ paymentRequest.discountPercent ?? paymentRequest.discount_percent }}%)</span>
                    <span class="fw-medium">−{{ formatRupiah(discountAmount) }}</span>
                  </div>
                  <div v-if="Number(paymentRequest.taxPercent ?? paymentRequest.tax_percent) > 0 || Number(paymentRequest.discountPercent ?? paymentRequest.discount_percent) > 0 || taxRows.length || otherSubtotal > 0 || employeeSalarySubtotal > 0" class="d-flex justify-content-between py-1">
                    <span class="text-muted">DPP</span>
                    <span class="fw-medium">{{ formatRupiah(dppAmount) }}</span>
                  </div>
                  <template v-if="taxRows.length">
                    <div
                      v-for="(tax, tIdx) in taxRows"
                      :key="tax.id || `sum-tax-${tIdx}`"
                      class="d-flex justify-content-between py-1"
                    >
                      <span class="text-muted">
                        {{ tax.taxCode }}
                        <template v-if="tax.calculationType === 'PERCENTAGE'">({{ Number(tax.rate) }}%)</template>
                      </span>
                      <span class="fw-medium">{{ formatRupiah(tax.amount) }}</span>
                    </div>
                  </template>
                  <div v-else-if="Number(paymentRequest.taxPercent ?? paymentRequest.tax_percent) > 0" class="d-flex justify-content-between py-1">
                    <span class="text-muted">Pajak / PPN ({{ paymentRequest.taxPercent ?? paymentRequest.tax_percent }}%)</span>
                    <span class="fw-medium">{{ formatRupiah(taxAmount) }}</span>
                  </div>
                  <hr class="my-2">
                  <div class="d-flex justify-content-between py-1">
                    <span class="text-muted fw-bold">Grand Total</span>
                    <span class="fw-bold fs-5 text-primary">{{ formatRupiah(getPaymentRequestTotal(paymentRequest)) }}</span>
                  </div>
                </div>
              </div>

              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Metadata</h5>
                </div>
                <div class="card-body px-5 pt-4 pb-4">
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Dibuat Oleh</label>
                    <p class="mb-0 fw-medium">
                      {{ paymentRequest.createdByUser?.fullName || paymentRequest.createdByUser?.full_name || '—' }}
                    </p>
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted mb-1">Tanggal Dibuat</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(paymentRequest.createdAt) }}</p>
                  </div>
                  <div v-if="paymentRequest.approvedAt" class="mb-3">
                    <label class="form-label text-muted mb-1">Disetujui Oleh</label>
                    <p class="mb-0 fw-medium">
                      {{
                        getApprovalStepJabatan(paymentRequest, 'approved') ||
                        paymentRequest.approvedByUser?.full_name ||
                        paymentRequest.approvedByUser?.fullName ||
                        '—'
                      }}
                    </p>
                  </div>
                  <div v-if="paymentRequest.approvedAt" class="mb-0">
                    <label class="form-label text-muted mb-1">Tanggal Disetujui</label>
                    <p class="mb-0 fw-medium">{{ formatDateTime(paymentRequest.approvedAt) }}</p>
                  </div>
                </div>
              </div>

              <PaymentRequestSettlementPanel
                v-if="showSettlementPanel"
                :payment-request-id="paymentRequest.id"
                :advance-amount="Number(paymentRequest.totalAmount) || 0"
                :settlement-status="paymentRequest.settlementStatus || paymentRequest.settlement_status"
                :settlements="paymentRequest.settlements || []"
                @refreshed="loadDetail"
              />

              <ApprovalCard
                :status-text="getStatusText(paymentRequest)"
                :current-step="approvalStepDisplay"
                :current-approvers="paymentRequest.currentApprovers ?? []"
                :approval-logs="paymentRequest.approvalLogs ?? paymentRequest.approval_logs ?? []"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="content-backdrop fade"></div>

    <Teleport to="body">
      <div
        v-if="showApproveModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.5);"
        @click.self="showApproveModal = false"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Approve Payment Request</h5>
              <button type="button" class="btn-close" @click="showApproveModal = false"></button>
            </div>
            <div class="modal-body">
              <label class="form-label">Catatan (opsional)</label>
              <textarea v-model="approveRemarks" class="form-control" rows="2" placeholder="Catatan approval..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showApproveModal = false">Batal</button>
              <button type="button" class="btn btn-success" @click="handleApprove">
                <i class="ri-check-line me-1"></i> Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showRejectModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.5);"
        @click.self="showRejectModal = false"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Reject Payment Request</h5>
              <button type="button" class="btn-close" @click="showRejectModal = false"></button>
            </div>
            <div class="modal-body">
              <label class="form-label">Alasan Reject <span class="text-danger">*</span></label>
              <textarea v-model="rejectRemarks" class="form-control" rows="3" placeholder="Wajib diisi..." required></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
              <button
                type="button"
                class="btn btn-danger"
                :disabled="!rejectRemarks?.trim()"
                @click="handleReject"
              >
                <i class="ri-close-line me-1"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  usePaymentRequestStore,
  getPaymentRequestNo,
  getPaymentRequestTotal,
  getPaymentRequestSourceSubtotal,
  getPaymentRequestOtherSubtotal,
  getPaymentRequestEmployeeSalarySubtotal,
  getPaymentRequestDiscountAmount,
  getPaymentRequestTaxAmount,
  getPaymentRequestTaxes,
  getPaymentRequestSourceItems,
  getPaymentRequestOtherCharges,
  getSourceTypeLabel,
  getRequestTypeLabel,
  getPaymentMethodLabel,
  formatDurationDaysLabel,
} from '~/stores/payment-request'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { usePaymentRequestApproval } from '~/composables/usePaymentRequestApproval'
import { usePermissions } from '~/composables/usePermissions'
import ApprovalCard from '~/components/ApprovalCard.vue'
import PaymentRequestSettlementPanel from '~/components/payment-request/PaymentRequestSettlementPanel.vue'
import { usePaymentRequestTabPermissions } from '~/composables/usePaymentRequestTabPermissions'
import { useImageUrl } from '~/composables/useImageUrl'

const { getAttachmentUrl, getFileIcon } = useImageUrl()

const route = useRoute()
const paymentRequestStore = usePaymentRequestStore()
const { canApprovePaymentRequest, canRejectPaymentRequest } = usePaymentRequestApproval()
const { userHasRole, userHasPermission } = usePermissions()
const { canEditType, canDeleteType, canAccessTab } = usePaymentRequestTabPermissions()
const formatRupiah = useFormatRupiah()
const { paymentRequest, loading, error } = storeToRefs(paymentRequestStore)
const { getStatusBadge, getStatusText, getApprovalStepJabatan } = useApprovalStatus()

const id = computed(() => String(route.params.id || ''))
const showApproveModal = ref(false)
const showRejectModal = ref(false)
useEscapeToClose(
  () => showApproveModal.value || showRejectModal.value,
  () => {
    showApproveModal.value = false
    showRejectModal.value = false
  }
)
const approveRemarks = ref('')
const rejectRemarks = ref('')

const rowRequestType = computed(() => {
  const row = paymentRequest.value
  return (row?.requestType || row?.request_type || 'project') as
    | 'project'
    | 'operational'
    | 'reimbursement'
})

const employeeDisplayRows = computed(() => {
  const row = paymentRequest.value
  if (!row) return [] as Array<{ name: string; salaryLabel?: string | null; notes?: string | null }>

  const rows = (row as any).employees || (row as any).paymentRequestEmployees || []
  if (Array.isArray(rows) && rows.length) {
    return rows
      .map((e: any) => {
        const name =
          e.employee?.nm_pegawai ||
          e.employee?.nmPegawai ||
          e.nm_pegawai ||
          e.nmPegawai ||
          null
        const id = e.employeeId ?? e.employee_id ?? e.employee?.id_pegawai
        const salary = Number(e.salaryAmount ?? e.salary_amount ?? 0) || 0
        return {
          name: name || (id != null ? `Pegawai #${id}` : null),
          salaryLabel: salary > 0 ? `${formatRupiah(salary)} /hari` : null,
          notes: e.notes || null,
        }
      })
      .filter((e: { name: string | null }) => !!e.name) as Array<{
        name: string
        salaryLabel?: string | null
        notes?: string | null
      }>
  }

  const legacy = row.employee
  if (legacy?.nm_pegawai || legacy?.nmPegawai) {
    return [{ name: legacy.nm_pegawai || legacy.nmPegawai || '', salaryLabel: null, notes: null }]
  }
  const legacyId = (row as any).employeeId ?? (row as any).employee_id
  if (legacyId) {
    return [{ name: `Pegawai #${legacyId}`, salaryLabel: null, notes: null }]
  }
  return []
})

const showSettlementPanel = computed(() => {
  const row = paymentRequest.value
  if (!row) return false
  const method = row.paymentMethod || row.payment_method
  const status = row.settlementStatus || row.settlement_status
  return method === 'advance' && status && status !== 'not_required'
})

async function loadDetail() {
  if (id.value) await paymentRequestStore.getPaymentRequestDetails(id.value)
}

const approvalStepDisplay = computed(() => {
  const row = paymentRequest.value
  if (!row || row.status !== 'pending') return row?.currentApprovalStep ?? null
  return row.nextApprovalStep ?? (Number(row.currentApprovalStep ?? 0) + 1)
})

const canApprove = computed(() => canApprovePaymentRequest(paymentRequest.value))
const canReject = computed(() => canRejectPaymentRequest(paymentRequest.value))
const canDelete = computed(() => {
  if (!paymentRequest.value) return false
  return paymentRequest.value.status === 'draft' && canDeleteType(rowRequestType.value)
})
const canEdit = computed(() => {
  if (!paymentRequest.value) return false
  const status = paymentRequest.value.status
  return (status === 'draft' || status === 'rejected') && canEditType(rowRequestType.value)
})
const canCreateApPayment = computed(() => {
  if (!paymentRequest.value) return false
  if (paymentRequest.value.status !== 'approved') return false
  return userHasRole('superadmin') || userHasPermission('create_ap_payment')
})
const sourceItemList = computed(() => getPaymentRequestSourceItems(paymentRequest.value))
const otherItemList = computed(() => getPaymentRequestOtherCharges(paymentRequest.value))
const sourceSubtotal = computed(() => getPaymentRequestSourceSubtotal(paymentRequest.value))
const otherSubtotal = computed(() => getPaymentRequestOtherSubtotal(paymentRequest.value))
const employeeSalarySubtotal = computed(() =>
  getPaymentRequestEmployeeSalarySubtotal(paymentRequest.value)
)
const discountAmount = computed(() => getPaymentRequestDiscountAmount(paymentRequest.value))
const taxAmount = computed(() => getPaymentRequestTaxAmount(paymentRequest.value))
const taxRows = computed(() => getPaymentRequestTaxes(paymentRequest.value))
const dppAmount = computed(() => {
  const stored = Number(paymentRequest.value?.dpp ?? 0)
  if (stored > 0) return stored
  return (
    Math.max(0, sourceSubtotal.value - discountAmount.value) +
    otherSubtotal.value +
    employeeSalarySubtotal.value
  )
})

function formatDateTime(v: string | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function load() {
  if (!id.value) return
  await paymentRequestStore.getPaymentRequestDetails(id.value)
}

async function onSubmit() {
  if (!paymentRequest.value) return
  const ok = await paymentRequestStore.submitPaymentRequest(paymentRequest.value.id, { refreshList: false })
  if (ok) await load()
}

async function handleApprove() {
  if (!paymentRequest.value) return
  showApproveModal.value = false
  const ok = await paymentRequestStore.approvePaymentRequest(
    paymentRequest.value.id,
    approveRemarks.value,
    { refreshList: false }
  )
  if (ok) await load()
  approveRemarks.value = ''
}

async function handleReject() {
  if (!paymentRequest.value || !rejectRemarks.value?.trim()) return
  showRejectModal.value = false
  const ok = await paymentRequestStore.rejectPaymentRequest(
    paymentRequest.value.id,
    rejectRemarks.value.trim(),
    { refreshList: false }
  )
  if (ok) await load()
  rejectRemarks.value = ''
}

function onDelete() {
  if (!paymentRequest.value) return
  paymentRequestStore.deletePaymentRequest(paymentRequest.value.id)
  navigateTo('/finance/payment-request')
}

function goCreateApPayment() {
  if (!paymentRequest.value) return
  navigateTo({
    path: '/finance/ap-payments',
    query: { fromPrq: paymentRequest.value.id },
  })
}

onMounted(() => load())
watch(id, () => load())

definePageMeta({
  hidePageHeading: true, layout: 'default', middleware: ['auth', 'check-permission'], title: 'Detail Payment Request' })
</script>
