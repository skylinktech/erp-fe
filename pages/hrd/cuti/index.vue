<template>
  <div>
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container-pt-12">
        <h4 class="mb-1">Pengajuan Cuti, Izin, Sakit</h4>
        <p class="mb-6">Kelola pengajuan cuti seluruh pegawai dengan workflow approval multi-step.</p>

        <!-- Statistics Cards -->
        <div class="row g-6 mb-6">
          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Total Pengajuan</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-primary">
                      <i class="ri-file-list-3-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.total || 0 }}</h5>
                    <span class="text-muted small">Pengajuan tahun ini</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Disetujui</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-success">
                      <i class="ri-checkbox-circle-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.approved || 0 }}</h5>
                    <span class="text-muted small">Cuti disetujui</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Menunggu</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-warning">
                      <i class="ri-time-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.menunggu || 0 }}</h5>
                    <span class="text-muted small">Menunggu approval</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-lg-6 col-md-6">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <p class="mb-0">Ditolak</p>
                  <div class="avatar">
                    <span class="avatar-initial rounded bg-label-danger">
                      <i class="ri-close-circle-line"></i>
                    </span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="account-heading">
                    <h5 class="mb-1">{{ stats.rejected || 0 }}</h5>
                    <span class="text-muted small">Cuti ditolak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saldo CT & breakdown cuti bersama -->
        <div class="row g-6 mb-6">
          <CutiBersamaBreakdownCard />
        </div>

        <!-- Workflow warning -->
        <div v-if="!loading && !workflowConfigured" class="alert alert-warning d-flex align-items-start gap-2 mb-4">
          <i class="ri-error-warning-line ri-22px"></i>
          <div>
            <strong>Approval Workflow belum dikonfigurasi.</strong>
            Pengajuan yang dibuat tidak dapat dilanjutkan ke approval sebelum
            admin meng-set workflow untuk entitas <code>cuti</code> di
            <NuxtLink to="/admin/approval-workflows">Approval Workflows</NuxtLink>.
          </div>
        </div>

        <!-- Filter card (terpisah, pola mengikuti halaman Quotation) -->
        <div class="row g-6">
          <div class="col-12">
            <h4 class="mt-2 mb-1">Filter Pengajuan</h4>
            <p class="mb-0">Saring pengajuan berdasarkan status dan tipe cuti.</p>
          </div>
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <label class="form-label small text-muted mb-1">Status</label>
                    <CustomSelect2
                      v-model="params.status"
                      :options="statusFilterOptions"
                      :get-option-label="(o: any) => o.label"
                      :reduce="(o: any) => o.value"
                      searchable
                      clearable
                      placeholder="Semua status"
                      @update:modelValue="reload"
                    />
                  </div>
                  <div class="col-md-6 mb-2">
                    <label class="form-label small text-muted mb-1">Tipe Cuti</label>
                    <CustomSelect2
                      v-model="params.cutiTypeId"
                      :options="cutiTypes"
                      :get-option-label="(o: any) => o.nmTipeCuti"
                      :reduce="(o: any) => o.id"
                      searchable
                      clearable
                      placeholder="Semua tipe"
                      @update:modelValue="reload"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="card">
              <ListPageTableHeader
                :rows="Number(params.rows)"
                :rows-options="rowsPerPageOptionsArray"
                :search="globalFilterValue"
                search-placeholder="Cari alasan..."
                :show-export="false"
                :export-disabled="loading"
                @update:rows="onCutiToolbarRows"
                @update:search="(v) => { globalFilterValue = v }"
              >
                <template #add>
                  <button
                    v-if="userHasRole('superadmin') || userHasPermission('create_cuti')"
                    type="button"
                    class="btn btn-primary"
                    @click="goToCreate"
                  >
                    <i class="ri-add-line me-1"></i>
                    Ajukan Cuti / Izin / Sakit
                  </button>
                </template>
              </ListPageTableHeader>

              <div class="card-datatable table-responsive py-3 px-3">
                <MyDataTable
                  :data="rows"
                  :rows="Number(params.rows)"
                  :loading="loading"
                  :totalRecords="totalRecords"
                  :first="params.first"
                  :lazy="true"
                  responsiveLayout="scroll"
                  paginatorPosition="bottom"
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                  currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                  @page="onPage"
                  @sort="onSort"
                >
                  <Column field="id" header="#" style="width:5%" />
                  <Column header="Pegawai" style="width:18%">
                    <template #body="{ data }">
                      <div class="fw-medium">{{ data.pegawai?.nmPegawai || '-' }}</div>
                      <small class="text-muted">#{{ data.pegawai?.idPegawai ?? data.pegawaiId }}</small>
                    </template>
                  </Column>
                  <Column header="Tipe" style="width:12%">
                    <template #body="{ data }">
                      <span class="badge bg-label-secondary">
                        {{ data.cutiType?.nmTipeCuti || '-' }}
                      </span>
                    </template>
                  </Column>
                  <Column header="Rentang" style="width:18%">
                    <template #body="{ data }">
                      <span class="text-nowrap">
                        {{ formatRangeTanggal(data.tanggalMulai, data.tanggalSelesai) }}
                      </span>
                    </template>
                  </Column>
                  <Column header="Durasi" style="width:12%">
                    <template #body="{ data }">
                      {{ formatDurasiCuti(data) }}
                    </template>
                  </Column>
                  <Column header="Status" style="width:14%">
                    <template #body="{ data }">
                      <span :class="getStatusCutiBadge(data.status).class">
                        {{ getStatusCutiBadge(data.status).text }}
                      </span>
                      <div v-if="data.rejectReason || data.alasanDitolak" class="small text-danger mt-1">
                        {{ data.rejectReason || data.alasanDitolak }}
                      </div>
                    </template>
                  </Column>
                  <Column header="Lampiran" style="width:8%">
                    <template #body="{ data }">
                      <a
                        v-if="data.attachment"
                        :href="data.attachment"
                        target="_blank"
                        rel="noopener"
                        class="btn btn-sm btn-text-secondary"
                      >
                        <i class="ri-attachment-2"></i>
                      </a>
                      <span v-else class="text-muted">-</span>
                    </template>
                  </Column>
                  <Column header="Aksi" style="min-width:6rem" :exportable="false">
                    <template #body="{ data }">
                      <button
                        type="button"
                        class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
                        aria-haspopup="true"
                        :aria-controls="`cuti-actions-menu`"
                        @click.stop="toggleActions($event, data)"
                      >
                        <i class="ri-more-2-fill"></i>
                      </button>
                    </template>
                  </Column>
                </MyDataTable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action menu (popup) — satu instance Menu yang dipakai semua row.
         Teleport ke body otomatis oleh PrimeVue, tidak akan terpotong
         oleh overflow tabel atau parent container. -->
    <Menu
      id="cuti-actions-menu"
      ref="actionsMenuRef"
      :model="actionMenuItems"
      :popup="true"
      append-to="body"
    />

    <!-- ============================================================
         Modal Detail Cuti — modal-md, gabungan info utama + timeline
         approval (kalau ada). Trigger via openDetail(row).
    ============================================================ -->
    <div
      ref="detailModalEl"
      class="modal fade"
      id="cutiDetailModal"
      tabindex="-1"
      aria-labelledby="cutiDetailModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-md modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="cutiDetailModalLabel">
              <i class="ri-file-list-3-line me-2"></i> Detail Pengajuan Cuti
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body">
            <!-- Loading state -->
            <div v-if="detailLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Memuat...</span>
              </div>
              <p class="text-muted mt-3 mb-0">Memuat detail cuti...</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="!detail" class="text-center py-5 text-muted">
              <i class="ri-error-warning-line ri-36px d-block mb-2"></i>
              Detail tidak tersedia.
            </div>

            <template v-else>
              <!-- Status banner -->
              <div class="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <div class="text-muted small">ID Pengajuan</div>
                  <div class="fw-semibold">#{{ detail.id }}</div>
                </div>
                <span :class="getStatusCutiBadge(detail.status).class">
                  {{ getStatusCutiBadge(detail.status).text }}
                </span>
              </div>

              <!-- Info utama -->
              <dl class="row mb-0">
                <dt class="col-5 text-muted fw-normal">Pegawai</dt>
                <dd class="col-7 mb-2">
                  {{ detail.pegawai?.nmPegawai || '-' }}
                  <small class="text-muted d-block">#{{ detail.pegawai?.idPegawai ?? detail.pegawaiId }}</small>
                </dd>

                <dt class="col-5 text-muted fw-normal">Tipe Cuti</dt>
                <dd class="col-7 mb-2">
                  <span class="badge bg-label-secondary">
                    {{ detail.cutiType?.nmTipeCuti || '-' }}
                  </span>
                  <span v-if="detail.cutiType?.kodeCuti" class="text-muted ms-1 small">
                    ({{ detail.cutiType.kodeCuti }})
                  </span>
                </dd>

                <dt class="col-5 text-muted fw-normal">Rentang Tanggal</dt>
                <dd class="col-7 mb-2">
                  {{ formatRangeTanggal(detail.tanggalMulai, detail.tanggalSelesai) }}
                </dd>

                <dt class="col-5 text-muted fw-normal">Durasi</dt>
                <dd class="col-7 mb-2">{{ formatDurasiCuti(detail) }}</dd>

                <template v-if="detail.isPerJam">
                  <dt class="col-5 text-muted fw-normal">Jam Mulai – Selesai</dt>
                  <dd class="col-7 mb-2">
                    {{ detail.jamMulai || '-' }} – {{ detail.jamSelesai || '-' }}
                  </dd>
                </template>

                <dt class="col-5 text-muted fw-normal">Alasan</dt>
                <dd class="col-7 mb-2" style="white-space: pre-wrap;">{{ detail.alasan || '-' }}</dd>

                <dt class="col-5 text-muted fw-normal">Lampiran</dt>
                <dd class="col-7 mb-2">
                  <a
                    v-if="detail.attachment"
                    :href="detail.attachment"
                    target="_blank"
                    rel="noopener"
                    class="link-primary"
                  >
                    <i class="ri-attachment-2 me-1"></i> Lihat lampiran
                  </a>
                  <span v-else class="text-muted">-</span>
                </dd>

                <dt class="col-5 text-muted fw-normal">Diajukan</dt>
                <dd class="col-7 mb-2">
                  {{ formatDateTime(detail.submittedAt ?? detail.createdAt) || '-' }}
                </dd>

                <template v-if="detail.rejectReason || detail.alasanDitolak">
                  <dt class="col-5 text-muted fw-normal">Alasan Penolakan</dt>
                  <dd class="col-7 mb-2 text-danger">
                    {{ detail.rejectReason || detail.alasanDitolak }}
                  </dd>
                </template>
              </dl>

              <!-- Approvers saat ini (kalau status menunggu) -->
              <div
                v-if="detail.status === 10 && (detail.currentApprovers?.length ?? 0)"
                class="alert alert-info py-2 px-3 mt-4 mb-0"
              >
                <div class="small fw-semibold mb-1">
                  <i class="ri-time-line me-1"></i> Menunggu persetujuan dari:
                </div>
                <ul class="mb-0 ps-3 small">
                  <li v-for="a in detail.currentApprovers" :key="`${a.userId}-${a.source}`">
                    {{ a.fullName }} <span class="text-muted">({{ a.email }})</span>
                  </li>
                </ul>
              </div>

              <!-- Timeline approval -->
              <div v-if="(detail.approvalLogs?.length ?? 0) > 0" class="mt-4">
                <h6 class="text-muted text-uppercase small mb-3">Riwayat Approval</h6>
                <ul class="timeline timeline-cuti mb-0">
                  <li
                    v-for="(log, idx) in detail.approvalLogs"
                    :key="log.id"
                    class="timeline-item timeline-item-transparent"
                    :class="{ 'timeline-item-last': idx === (detail.approvalLogs?.length ?? 0) - 1 }"
                  >
                    <span
                      class="timeline-indicator-advanced"
                      :class="log.action === 'approved' ? 'timeline-indicator-success' : 'timeline-indicator-danger'"
                    >
                      <i
                        :class="log.action === 'approved' ? 'ri-check-line' : 'ri-close-line'"
                        class="ri-16px"
                      ></i>
                    </span>
                    <div class="timeline-event ps-3">
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="fw-semibold">
                          Step {{ log.stepOrder }} —
                          <span :class="log.action === 'approved' ? 'text-success' : 'text-danger'">
                            {{ log.action === 'approved' ? 'Disetujui' : 'Ditolak' }}
                          </span>
                        </div>
                        <small class="text-muted">{{ formatDateTime(log.createdAt) }}</small>
                      </div>
                      <div class="text-muted small mt-1">
                        oleh {{ log.user?.fullName || `User #${log.userId}` }}
                      </div>
                      <div v-if="log.remarks" class="small mt-1" style="white-space: pre-wrap;">
                        <i class="ri-double-quotes-l text-muted me-1"></i>{{ log.remarks }}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button
              v-if="detail?.id"
              type="button"
              class="btn btn-outline-primary me-auto"
              @click="goToCetakFromDetail"
            >
              <i class="ri-printer-line me-1"></i>
              Cetak
            </button>
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, onMounted, watch } from 'vue'
import { navigateTo } from '#app'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { usePermissions } from '~/composables/usePermissions'
import { useCutiStore, type CutiRow } from '~/stores/cuti'
import {
  STATUS_CUTI_OPTIONS,
  canCancelPendingCuti,
  canDeleteCuti,
  canEditCuti,
  canSubmitCuti,
  formatDurasiCuti,
  formatRangeTanggal,
  getStatusCutiBadge,
} from '~/constants/hrd/cutiForm'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import CutiBersamaBreakdownCard from '~/components/hrd/CutiBersamaBreakdownCard.vue'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import Swal from 'sweetalert2'
import { Modal } from 'bootstrap'

const store = useCutiStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setListTitle } = useDynamicTitle()

const { rows, loading, totalRecords, params, cutiTypes, workflowConfigured, stats, detail, detailLoading } =
  storeToRefs(store)

// Filter card pakai CustomSelect2 → butuh array option (bukan langsung enum value).
const statusFilterOptions = computed(() => STATUS_CUTI_OPTIONS.map((s) => ({ value: s.value, label: s.label })))

// Modal detail
const detailModalEl = ref<HTMLDivElement | null>(null)
let detailModalInstance: Modal | null = null

/* ------------------------------------------------------------------
 * Action menu (popup) — pakai PrimeVue Menu yang di-teleport ke body.
 * Lebih robust daripada Bootstrap dropdown di dalam <td> karena tidak
 * tergantung event delegation Bootstrap dan tidak ter-clip oleh
 * .table-responsive / overflow ancestor.
 * ------------------------------------------------------------------ */
const actionsMenuRef = ref<InstanceType<typeof Menu> | null>(null)
const activeRow = ref<CutiRow | null>(null)

/** Item menu dibangun secara reactive dari activeRow + permission helpers. */
const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: any[] = []

  items.push({
    label: 'Detail',
    icon: 'ri ri-eye-line',
    command: () => openDetail(row),
  })

  items.push({
    label: 'Cetak',
    icon: 'ri ri-printer-line',
    command: () => goToCetak(row),
  })

  if (canEditCuti(row)) {
    items.push({ separator: true })
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => goToEdit(row),
    })
  }
  if (canSubmitCuti(row) && workflowConfigured.value) {
    items.push({
      label: 'Ajukan ke Approval',
      icon: 'ri ri-send-plane-2-line',
      command: () => submitForApproval(row),
    })
  }
  if (canCancelPendingCuti(row) && (userHasRole('superadmin') || userHasPermission('edit_cuti'))) {
    items.push({
      label: 'Batalkan Pengajuan',
      icon: 'ri ri-close-circle-line',
      class: 'cuti-menu-warning',
      command: () => cancelPending(row),
    })
  }
  if (row.status === 10 && (userHasRole('superadmin') || userHasPermission('approve_cuti'))) {
    items.push({
      label: 'Approve',
      icon: 'ri ri-check-line',
      class: 'cuti-menu-success',
      command: () => approve(row),
    })
  }
  if (row.status === 10 && (userHasRole('superadmin') || userHasPermission('reject_cuti'))) {
    items.push({
      label: 'Tolak',
      icon: 'ri ri-close-line',
      class: 'cuti-menu-danger',
      command: () => reject(row),
    })
  }
  if (canDeleteCuti(row) && (userHasRole('superadmin') || userHasPermission('delete_cuti'))) {
    items.push({ separator: true })
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'cuti-menu-danger',
      command: () => destroy(row),
    })
  }

  return items
})

function toggleActions(event: MouseEvent, row: CutiRow) {
  activeRow.value = row
  // Tunggu Vue update actionMenuItems sebelum buka, agar item list akurat.
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

setListTitle('Cuti, Izin, Sakit', 0)

function reload() {
  params.value.page = 1
  params.value.first = 0
  store.fetchCutis()
}

function handleRowsChange() {
  params.value.page = 1
  params.value.first = 0
  store.fetchCutis()
}

function onCutiToolbarRows(v: number) {
  params.value.rows = Number(v) || 10
  handleRowsChange()
}

function onPage(e: any) {
  params.value.first = e.first
  params.value.rows = e.rows
  params.value.page = Math.floor(e.first / e.rows) + 1
  store.fetchCutis()
}

function onSort(e: any) {
  params.value.sortField = e.sortField
  params.value.sortOrder = e.sortOrder
  store.fetchCutis()
}

const debouncedSearch = useDebounceFn(() => {
  params.value.search = globalFilterValue.value
  reload()
}, 400)

watch(globalFilterValue, () => debouncedSearch())

function goToCreate() {
  void navigateTo('/hrd/cuti/form')
}

function goToEdit(row: CutiRow) {
  void navigateTo(`/hrd/cuti/form/${row.id}`)
}

function goToCetak(row: CutiRow) {
  void navigateTo({ path: '/hrd/cetak-cuti', query: { id: String(row.id) } })
}

function goToCetakFromDetail() {
  const d = store.detail
  if (!d?.id) return
  detailModalInstance?.hide()
  void navigateTo({ path: '/hrd/cetak-cuti', query: { id: String(d.id) } })
}

/**
 * Buka modal detail cuti. Pakai data dari row sebagai placeholder
 * supaya modal langsung tampil informatif, lalu refresh dengan data
 * lengkap (approvalLogs, currentApprovers) dari endpoint show.
 */
async function openDetail(row: CutiRow) {
  store.detail = row
  if (process.client) {
    if (!detailModalInstance && detailModalEl.value) {
      detailModalInstance = new Modal(detailModalEl.value)
      detailModalEl.value.addEventListener('hidden.bs.modal', () => store.clearDetail())
    }
    detailModalInstance?.show()
  }
  await store.fetchOne(row.id)
}

/* ------------------------------------------------------------------
 * Action confirmations menggunakan SweetAlert agar konsisten dengan
 * modul lain (Quotation, dst.) — bukan native confirm/prompt browser.
 * ------------------------------------------------------------------ */

async function submitForApproval(row: CutiRow) {
  const r = await Swal.fire({
    title: 'Ajukan ke Approval',
    text: 'Kirim pengajuan cuti ini ke approval workflow? Status akan berubah menjadi Menunggu Persetujuan.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Ajukan',
    cancelButtonText: 'Batal',
  })
  if (!r.isConfirmed) return
  await store.submitForApproval(row.id)
}

async function cancelPending(row: CutiRow) {
  const r = await Swal.fire({
    title: 'Batalkan Pengajuan',
    text: 'Pengajuan yang sedang menunggu approval akan dibatalkan. Lanjutkan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e9b949',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Tutup',
  })
  if (!r.isConfirmed) return
  await store.cancelPending(row.id)
}

async function approve(row: CutiRow) {
  const r = await Swal.fire({
    title: 'Approve Pengajuan',
    html: `
      <p class="mb-3" style="text-align: center;">Setujui pengajuan cuti ini?</p>
      <div style="text-align: left; max-width: 100%;">
        <label for="swal-approve-remarks" class="d-block mb-2 fw-medium" style="font-size: 0.9375rem;">Catatan (opsional)</label>
        <textarea id="swal-approve-remarks" class="form-control" rows="3" placeholder="Tambahkan catatan untuk pengajuan ini..." style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d9dee3; border-radius: 0.375rem; resize: vertical; font-size: 0.9375rem;"></textarea>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#71dd37',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Approve',
    cancelButtonText: 'Batal',
    focusConfirm: false,
    preConfirm: () => {
      const el = document.getElementById('swal-approve-remarks') as HTMLTextAreaElement | null
      return (el?.value || '').trim()
    },
  })
  if (!r.isConfirmed) return
  const remarks = typeof r.value === 'string' && r.value.length ? r.value : undefined
  await store.approve(row.id, remarks)
}

async function reject(row: CutiRow) {
  const r = await Swal.fire({
    title: 'Tolak Pengajuan',
    html: `
      <p class="mb-3" style="text-align: center;">Tolak pengajuan cuti ini?</p>
      <div style="text-align: left; max-width: 100%;">
        <label for="swal-reject-remarks" class="d-block mb-2 fw-medium" style="font-size: 0.9375rem;">Alasan penolakan <span class="text-danger">*</span></label>
        <textarea id="swal-reject-remarks" class="form-control" rows="4" placeholder="Masukkan alasan penolakan..." style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d9dee3; border-radius: 0.375rem; resize: vertical; font-size: 0.9375rem;" required></textarea>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Tolak',
    cancelButtonText: 'Batal',
    focusConfirm: false,
    preConfirm: () => {
      const el = document.getElementById('swal-reject-remarks') as HTMLTextAreaElement | null
      const val = (el?.value || '').trim()
      if (!val) {
        Swal.showValidationMessage('Alasan penolakan wajib diisi')
        return false
      }
      return val
    },
  })
  if (!r.isConfirmed || typeof r.value !== 'string') return
  await store.reject(row.id, r.value)
}

async function destroy(row: CutiRow) {
  const r = await Swal.fire({
    title: 'Hapus Pengajuan',
    text: 'Pengajuan akan dihapus permanen dan tidak dapat dikembalikan. Lanjutkan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
  })
  if (!r.isConfirmed) return
  await store.destroy(row.id)
}

onMounted(async () => {
  // Parallel fetch — types & data table & stats card.
  const tasks: Promise<unknown>[] = [store.fetchCutis(), store.fetchStats()]
  if (!cutiTypes.value.length) tasks.push(store.fetchCutiTypes())
  await Promise.all(tasks)
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['view_cuti', 'access_cuti'],
})
</script>

<style scoped>
.card-datatable :deep(.p-datatable .p-datatable-tbody > tr) {
  vertical-align: middle;
}

/*
 * Styling untuk item PrimeVue Menu varian status (warning/success/danger).
 * Memakai :global karena Menu di-append ke body sehingga di luar scope.
 * Class structure PrimeVue v4: .p-menu-item > .p-menu-item-content >
 *   .p-menu-item-link > .p-menu-item-icon + .p-menu-item-label
 */
:global(.p-menu-item.cuti-menu-warning .p-menu-item-link .p-menu-item-label),
:global(.p-menu-item.cuti-menu-warning .p-menu-item-link .p-menu-item-icon) {
  color: var(--bs-warning) !important;
}
:global(.p-menu-item.cuti-menu-success .p-menu-item-link .p-menu-item-label),
:global(.p-menu-item.cuti-menu-success .p-menu-item-link .p-menu-item-icon) {
  color: var(--bs-success) !important;
}
:global(.p-menu-item.cuti-menu-danger .p-menu-item-link .p-menu-item-label),
:global(.p-menu-item.cuti-menu-danger .p-menu-item-link .p-menu-item-icon) {
  color: var(--bs-danger) !important;
}

/*
 * Timeline khusus untuk modal detail cuti.
 */
.timeline-cuti :deep(.timeline-event) {
  padding-bottom: 0.75rem;
}
.timeline-cuti :deep(.timeline-indicator-success) {
  color: var(--bs-success) !important;
  border-color: var(--bs-success) !important;
}
.timeline-cuti :deep(.timeline-indicator-danger) {
  color: var(--bs-danger) !important;
  border-color: var(--bs-danger) !important;
}
</style>
