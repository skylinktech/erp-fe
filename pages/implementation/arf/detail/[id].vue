<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container p-y">
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 text-muted">Memuat detail ARF...</p>
          </div>
        </div>

        <div v-else-if="error && !arf" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error?.message || 'Gagal memuat data.' }}
          <NuxtLink to="/implementation/arf" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="arf">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/implementation/arf" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <span class="text-muted">/</span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ getArfRequestNo(arf) || '—' }}</h4>
                <small class="text-muted">{{ formatDateTime(arf.createdAt) }}</small>
              </div>
              <span :class="getStatusBadge(arf).class" class="badge">{{ getStatusBadge(arf).text }}</span>
              <span class="badge bg-label-info text-capitalize">{{ arf.type }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <button
                v-if="canSubmit"
                type="button"
                class="btn btn-primary btn-sm"
                :disabled="loading"
                @click="onSubmit"
              >
                <i class="ri-send-plane-line me-1"></i>
                {{ arf.status === 'rejected' ? 'Submit Revisi' : 'Submit' }}
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                @click="toggleHeaderActions"
              >
                <i class="ri-more-2-line me-1"></i> Actions
              </button>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-xl-8">
              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Informasi ARF</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;" />
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label text-muted">No. ARF</label>
                      <p class="mb-0 fw-medium">{{ getArfRequestNo(arf) || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tanggal Pengajuan</label>
                      <p class="mb-0">{{ arf.requestDate || arf.request_date || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Tipe</label>
                      <p class="mb-0 text-capitalize">{{ arf.type || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Site Investment</label>
                      <p class="mb-0">
                        {{ arf.siteInvestment?.siNumber || arf.siteInvestment?.si_number || '—' }}
                        {{ arf.siteInvestment?.name ? ` — ${arf.siteInvestment.name}` : '' }}
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Pemohon</label>
                      <p class="mb-0">
                        {{ arf.requestedByUser?.fullName || arf.requestedByUser?.full_name || '—' }}
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Departemen</label>
                      <p class="mb-0">{{ arf.department?.nm_departemen || arf.department?.nmDepartemen || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Total (Item + Gaji)</label>
                      <p class="mb-0 fw-semibold text-primary">{{ formatRupiah(getArfTotal(arf)) }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted">Mata Uang</label>
                      <p class="mb-0">{{ arf.currency || 'IDR' }}</p>
                    </div>
                    <div
                      class="col-12"
                      v-if="arf.status === 'rejected' && (arf.rejectionReason || arf.rejectReason)"
                    >
                      <label class="form-label text-muted">Alasan Penolakan</label>
                      <p class="mb-0 text-danger text-break">{{ arf.rejectionReason || arf.rejectReason }}</p>
                    </div>
                    <div v-if="arf.notes" class="col-12 mt-2">
                      <label class="form-label text-muted">Catatan</label>
                      <p class="mb-0 text-break">{{ arf.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="employeeList.length" class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Rincian Pegawai & Gaji</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;" />
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nama Pegawai</th>
                          <th>NIK</th>
                          <th class="text-end">Nominal Gaji</th>
                          <th>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, i) in employeeList" :key="d.pegawaiId || i">
                          <td>{{ i + 1 }}</td>
                          <td>{{ d.pegawai?.nm_pegawai || d.pegawai?.nmPegawai || '—' }}</td>
                          <td>{{ d.pegawai?.nik_pegawai || d.pegawai?.nikPegawai || '—' }}</td>
                          <td class="text-end fw-bold">{{ formatRupiah(d.salaryAmount) }}</td>
                          <td>{{ d.notes || '—' }}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="3" class="text-end fw-semibold">Total Gaji</td>
                          <td class="text-end fw-bold text-primary">{{ formatRupiah(employeesTotal) }}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div class="card mb-4 shadow-sm border-0">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0">Rincian Item Budget</h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;" />
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!itemList.length" class="text-muted text-center py-4">Tidak ada item</div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Budget</th>
                          <th>Deskripsi</th>
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
                          <td>{{ d.budget?.budgetCode || d.budget?.budget_code || '—' }}</td>
                          <td>{{ d.description || '—' }}</td>
                          <td class="text-end">{{ Number(d.qty) || 0 }}</td>
                          <td>{{ d.unit || '—' }}</td>
                          <td class="text-end">{{ formatRupiah(d.unitPrice ?? d.unit_price) }}</td>
                          <td class="text-end fw-bold">{{ formatRupiah(d.subtotal) }}</td>
                          <td>{{ d.notes || '—' }}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="6" class="text-end fw-semibold">Total Item</td>
                          <td class="text-end fw-bold text-primary">{{ formatRupiah(itemsTotal) }}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4">
              <ApprovalCard
                v-if="arf.approvalLogs?.length || arf.status === 'pending'"
                :approval-logs="arf.approvalLogs"
                :current-approvers="arf.currentApprovers"
                :status="arf.status"
                entity-label="ARF"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showApproveModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve ARF</h5>
            <button type="button" class="btn-close" @click="showApproveModal = false"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="approveRemarks" class="form-control" rows="3" placeholder="Catatan approval (opsional)"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showApproveModal = false">Batal</button>
            <button type="button" class="btn btn-success" :disabled="loading" @click="onApprove">Approve</button>
          </div>
        </div>
      </div>
    </div>

    <Menu
      id="arf-detail-actions-menu"
      ref="headerActionsMenuRef"
      :model="headerActionItems"
      :popup="true"
      append-to="body"
    />

    <div v-if="showRejectModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reject ARF</h5>
            <button type="button" class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Alasan penolakan (wajib)" required></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showRejectModal = false">Batal</button>
            <button type="button" class="btn btn-danger" :disabled="loading || !rejectReason?.trim()" @click="onReject">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  useArfStore,
  getArfRequestNo,
  getArfItemsList,
  getArfEmployeesList,
  getArfItemsTotal,
  getArfEmployeesTotal,
  getArfTotal,
} from '~/stores/arf'
import { useArfApproval } from '~/composables/useArfApproval'
import { useApprovalStatus } from '~/composables/useApprovalStatus'
import { usePermissions } from '~/composables/usePermissions'
import ApprovalCard from '~/components/ApprovalCard.vue'
import Menu from 'primevue/menu'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'ARF Detail',
})

const route = useRoute()
const router = useRouter()
const arfStore = useArfStore()
const formatRupiah = useFormatRupiah()
const { arf, loading, error } = storeToRefs(arfStore)
const { canApproveArf, canRejectArf } = useArfApproval()
const { getStatusBadge } = useApprovalStatus()
const { userHasRole, userHasPermission } = usePermissions()

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const approveRemarks = ref('')
const rejectReason = ref('')
const headerActionsMenuRef = ref<InstanceType<typeof Menu> | null>(null)

const id = computed(() => route.params.id as string)
const itemList = computed(() => getArfItemsList(arf.value))
const employeeList = computed(() => getArfEmployeesList(arf.value))
const itemsTotal = computed(() => getArfItemsTotal(arf.value))
const employeesTotal = computed(() => getArfEmployeesTotal(arf.value))
const canApprove = computed(() => canApproveArf(arf.value))
const canReject = computed(() => canRejectArf(arf.value))

const canSubmit = computed(() => {
  const row = arf.value
  if (!row) return false
  return (
    (row.status === 'draft' || row.status === 'rejected') &&
    (userHasRole('superadmin') ||
      userHasPermission('edit_arf') ||
      userHasPermission('create_arf'))
  )
})

const headerActionItems = computed(() => {
  const row = arf.value
  if (!row) return []
  const items: Array<Record<string, unknown>> = []

  if (canApprove.value) {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      command: () => {
        showApproveModal.value = true
      },
    })
  }
  if (canReject.value) {
    items.push({
      label: 'Reject',
      icon: 'ri ri-close-line',
      command: () => {
        showRejectModal.value = true
      },
    })
  }
  if (row.status === 'draft' || row.status === 'rejected') {
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/implementation/arf/form/${row.id}`),
    })
  }
  items.push({
    label: 'Cetak',
    icon: 'ri ri-printer-line',
    command: () => goToCetak(),
  })
  if (row.status === 'draft') {
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'arf-menu-danger',
      command: () => onDelete(),
    })
  }

  return items
})

function toggleHeaderActions(event: MouseEvent) {
  headerActionsMenuRef.value?.toggle(event)
}

function goToCetak() {
  if (!arf.value?.id) return
  void navigateTo({ path: '/implementation/cetak-arf', query: { id: String(arf.value.id) } })
}

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

async function onSubmit() {
  if (!arf.value?.id) return
  const ok = await arfStore.submitArf(arf.value.id)
  if (ok) await arfStore.getArfDetails(arf.value.id)
}

async function onApprove() {
  if (!arf.value?.id) return
  const ok = await arfStore.approveArf(arf.value.id, approveRemarks.value)
  showApproveModal.value = false
  if (ok) await arfStore.getArfDetails(arf.value.id)
}

async function onReject() {
  if (!arf.value?.id || !rejectReason.value?.trim()) return
  const ok = await arfStore.rejectArf(arf.value.id, rejectReason.value)
  showRejectModal.value = false
  if (ok) await arfStore.getArfDetails(arf.value.id)
}

async function onDelete() {
  if (!arf.value?.id) return
  await arfStore.deleteArf(arf.value.id)
  await router.push('/implementation/arf')
}

onMounted(() => {
  if (id.value) arfStore.getArfDetails(id.value)
})
</script>

<style scoped>
:deep(.arf-menu-danger .p-menuitem-link) {
  color: var(--bs-danger) !important;
}
</style>
