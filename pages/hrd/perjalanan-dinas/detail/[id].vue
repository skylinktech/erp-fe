<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
        <div class="text-center">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3 text-muted mb-0">Memuat detail SPPD...</p>
        </div>
      </div>

      <div v-else-if="!detail" class="alert alert-danger">
        Pengajuan perjalanan dinas tidak ditemukan.
        <NuxtLink to="/hrd/perjalanan-dinas" class="alert-link ms-2">Kembali ke daftar</NuxtLink>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div class="d-flex flex-wrap align-items-center gap-3">
            <NuxtLink to="/hrd/perjalanan-dinas" class="btn btn-outline-secondary btn-sm">
              <i class="ri-arrow-left-line me-1"></i> Kembali
            </NuxtLink>
            <div>
              <h4 class="mb-0 fw-semibold">{{ detail.nomorSppd }}</h4>
              <PageBreadcrumb class="mt-1" :current-label="detail.nomorSppd" />
              <small class="text-muted">{{ formatDateTime(detail.createdAt) }}</small>
            </div>
            <span :class="getStatusPdBadge(detail.status).class">{{ getStatusPdBadge(detail.status).text }}</span>
          </div>

          <div class="btn-group">
            <button type="button" class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
              Aksi
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <a class="dropdown-item" href="javascript:void(0)" @click="goToCetak">
                <i class="ri-printer-line me-2"></i> Cetak SPPD
              </a>
              <a v-if="canEdit" class="dropdown-item" href="javascript:void(0)" @click="goToEdit">
                <i class="ri-edit-box-line me-2"></i> Edit
              </a>
              <a v-if="canSubmit" class="dropdown-item" href="javascript:void(0)" @click="submit">
                <i class="ri-send-plane-2-line me-2"></i> Ajukan Approval
              </a>
              <a v-if="canApproveAct" class="dropdown-item" href="javascript:void(0)" @click="approve">
                <i class="ri-check-line me-2"></i> Approve
              </a>
              <a v-if="canRejectAct" class="dropdown-item" href="javascript:void(0)" @click="reject">
                <i class="ri-close-line me-2"></i> Tolak
              </a>
              <a v-if="canCancelPending" class="dropdown-item" href="javascript:void(0)" @click="cancelPending">
                <i class="ri-close-circle-line me-2"></i> Batalkan
              </a>
              <div v-if="canDelete" class="dropdown-divider"></div>
              <a v-if="canDelete" class="dropdown-item text-danger" href="javascript:void(0)" @click="destroy">
                <i class="ri-delete-bin-7-line me-2"></i> Hapus
              </a>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-xl-8">
            <div class="card mb-4">
              <div class="card-header"><h6 class="mb-0">Informasi Perjalanan</h6></div>
              <div class="card-body">
                <dl class="row mb-0">
                  <dt class="col-sm-4 text-muted">Pegawai</dt>
                  <dd class="col-sm-8">{{ detail.pegawai?.nmPegawai ?? '-' }}</dd>

                  <dt class="col-sm-4 text-muted">Rute</dt>
                  <dd class="col-sm-8">
                    {{ detail.kotaAsal }} → {{ detail.kotaTujuan }}
                    <span v-if="detail.provinsiTujuan" class="text-muted">({{ detail.provinsiTujuan }})</span>
                  </dd>

                  <dt class="col-sm-4 text-muted">Jenis / Kendaraan</dt>
                  <dd class="col-sm-8">
                    {{ getJenisPerjalananLabel(detail.jenisPerjalanan) }} — {{ getKendaraanLabel(detail.kendaraan) }}
                  </dd>

                  <dt class="col-sm-4 text-muted">Tanggal</dt>
                  <dd class="col-sm-8">
                    {{ formatDateRange(detail.tanggalBerangkat, detail.tanggalKembali) }}
                    ({{ detail.lamaHari }} hari)
                  </dd>

                  <dt class="col-sm-4 text-muted">Nama Kegiatan</dt>
                  <dd class="col-sm-8">{{ detail.namaKegiatan || '-' }}</dd>

                  <dt class="col-sm-4 text-muted">Keperluan</dt>
                  <dd class="col-sm-8" style="white-space: pre-wrap">{{ detail.keperluan }}</dd>

                  <dt class="col-sm-4 text-muted">Lampiran</dt>
                  <dd class="col-sm-8">
                    <a v-if="detail.attachment" :href="detail.attachment" target="_blank" rel="noopener">Lihat lampiran</a>
                    <span v-else>-</span>
                  </dd>

                  <template v-if="detail.rejectReason">
                    <dt class="col-sm-4 text-muted">Alasan Ditolak</dt>
                    <dd class="col-sm-8 text-danger" style="white-space: pre-wrap">{{ detail.rejectReason }}</dd>
                  </template>
                </dl>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header"><h6 class="mb-0">Rincian Biaya</h6></div>
              <div class="card-body p-0">
                <table class="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <td>Uang harian ({{ formatRupiah(detail.uangHarianSatuan) }}/hari × {{ detail.lamaHari }} hari)</td>
                      <td class="text-end">{{ formatRupiah(detail.uangHarianTotal) }}</td>
                    </tr>
                    <tr><td>Biaya transport</td><td class="text-end">{{ formatRupiah(detail.biayaTransport) }}</td></tr>
                    <tr><td>Biaya akomodasi</td><td class="text-end">{{ formatRupiah(detail.biayaAkomodasi) }}</td></tr>
                    <tr><td>Biaya representasi</td><td class="text-end">{{ formatRupiah(detail.biayaRepresentasi) }}</td></tr>
                    <tr><td>Biaya lainnya</td><td class="text-end">{{ formatRupiah(detail.biayaLainnya) }}</td></tr>
                    <tr class="fw-bold">
                      <td>Total</td>
                      <td class="text-end text-primary">{{ formatRupiah(detail.totalBiaya) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="approvalRows.length" class="card mb-4">
              <div class="card-header"><h6 class="mb-0">Riwayat Persetujuan</h6></div>
              <div class="card-body">
                <ul class="list-unstyled mb-0">
                  <li v-for="log in approvalRows" :key="log.id" class="mb-3 pb-3 border-bottom">
                    <div class="fw-medium text-capitalize">{{ log.action }} — Step {{ log.stepOrder ?? log.step_order }}</div>
                    <div class="small text-muted">
                      {{ log.user?.fullName ?? log.user?.full_name ?? '-' }}
                      · {{ formatDateTime(log.createdAt ?? log.created_at) }}
                    </div>
                    <div v-if="log.remarks" class="small mt-1" style="white-space: pre-wrap">{{ log.remarks }}</div>
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="showSignatureSection" class="card">
              <div class="card-header">
                <h6 class="mb-0"><i class="ri-pen-nib-line me-1 text-primary"></i> Tanda Tangan Digital</h6>
              </div>
              <div class="card-body">
                <MultiSignatureDisplay
                  :key="'sig-' + detail.id"
                  document-type="perjalanan-dinas"
                  :document-id="String(detail.id)"
                  title="Tanda Tangan Digital"
                  :columns="4"
                  :qr-size="96"
                  :compact="true"
                />
              </div>
            </div>
          </div>

          <div class="col-xl-4">
            <div class="card">
              <div class="card-body">
                <h6 class="mb-3">Ringkasan</h6>
                <p class="mb-2 small"><strong>Diajukan:</strong> {{ formatDateTime(detail.submittedAt) || '-' }}</p>
                <p class="mb-2 small"><strong>Step approval:</strong> {{ detail.currentApprovalStep ?? '-' }}</p>
                <p class="mb-0 small"><strong>Total biaya:</strong> {{ formatRupiah(detail.totalBiaya) }}</p>

                <div
                  v-if="detail.status === 10 && (detail.currentApprovers?.length ?? 0)"
                  class="alert alert-info small mt-3 mb-0"
                >
                  <strong>Menunggu persetujuan:</strong>
                  <ul class="mb-0 ps-3 mt-1">
                    <li v-for="a in detail.currentApprovers" :key="`${a.userId}-${a.source}`">
                      {{ a.userName ?? a.user?.fullName ?? '-' }}
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo, useRoute } from '#app'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'
import { usePerjalananDinasStore } from '~/stores/perjalanan-dinas'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  canCancelPendingPerjalananDinas,
  canDeletePerjalananDinas,
  canEditPerjalananDinas,
  canSubmitPerjalananDinas,
  formatRupiah,
  getJenisPerjalananLabel,
  getKendaraanLabel,
  getStatusPdBadge,
  STATUS_PD_APPROVED,
} from '~/constants/hrd/perjalananDinasForm'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['view_perjalanan_dinas', 'show_perjalanan_dinas'],
})

const route = useRoute()
const store = usePerjalananDinasStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setDetailTitle } = useDynamicTitle()
const { detail } = storeToRefs(store)

const loading = ref(true)

const approvalRows = computed(() => {
  const logs = detail.value?.approvalLogs ?? []
  return Array.isArray(logs) ? logs : []
})

const showSignatureSection = computed(() => Number(detail.value?.status) === STATUS_PD_APPROVED)

const canEdit = computed(() => detail.value && canEditPerjalananDinas(detail.value))
const canSubmit = computed(() => detail.value && canSubmitPerjalananDinas(detail.value))
const canCancelPending = computed(() => detail.value && canCancelPendingPerjalananDinas(detail.value))
const canDelete = computed(
  () =>
    detail.value &&
    canDeletePerjalananDinas(detail.value) &&
    (userHasRole('superadmin') || userHasPermission('delete_perjalanan_dinas'))
)
const canApproveAct = computed(
  () =>
    detail.value?.status === 10 &&
    (userHasRole('superadmin') || userHasPermission('approve_perjalanan_dinas'))
)
const canRejectAct = computed(
  () =>
    detail.value?.status === 10 &&
    (userHasRole('superadmin') || userHasPermission('reject_perjalanan_dinas'))
)

function formatDate(v: string) {
  if (!v) return '-'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateRange(a: string, b: string) {
  return `${formatDate(a)} – ${formatDate(b)}`
}

function formatDateTime(v: string | null | undefined) {
  if (!v) return ''
  return new Date(v).toLocaleString('id-ID')
}

function goToEdit() {
  if (detail.value?.id) void navigateTo(`/hrd/perjalanan-dinas/form/${detail.value.id}`)
}

function goToCetak() {
  if (detail.value?.id) {
    void navigateTo({ path: '/hrd/cetak-perjalanan-dinas', query: { id: detail.value.id } })
  }
}

async function submit() {
  if (!detail.value) return
  const r = await Swal.fire({ title: 'Ajukan SPPD?', icon: 'question', showCancelButton: true })
  if (r.isConfirmed) {
    const ok = await store.submitForApproval(detail.value.id)
    if (ok) await store.fetchOne(detail.value.id)
  }
}

async function approve() {
  if (!detail.value) return
  const r = await Swal.fire({
    title: 'Setujui SPPD?',
    input: 'textarea',
    inputLabel: 'Catatan (opsional)',
    showCancelButton: true,
  })
  if (r.isConfirmed) {
    const ok = await store.approve(detail.value.id, r.value || undefined)
    if (ok) await store.fetchOne(detail.value.id)
  }
}

async function reject() {
  if (!detail.value) return
  const r = await Swal.fire({
    title: 'Tolak SPPD',
    input: 'textarea',
    inputLabel: 'Alasan penolakan',
    showCancelButton: true,
    inputValidator: (v) => (!v?.trim() ? 'Wajib diisi' : undefined),
  })
  if (r.isConfirmed && r.value) {
    const ok = await store.reject(detail.value.id, r.value)
    if (ok) await store.fetchOne(detail.value.id)
  }
}

async function cancelPending() {
  if (!detail.value) return
  const r = await Swal.fire({ title: 'Batalkan pengajuan?', icon: 'warning', showCancelButton: true })
  if (r.isConfirmed) {
    const ok = await store.cancelPending(detail.value.id)
    if (ok) await store.fetchOne(detail.value.id)
  }
}

async function destroy() {
  if (!detail.value) return
  const r = await Swal.fire({ title: 'Hapus pengajuan?', icon: 'warning', showCancelButton: true })
  if (r.isConfirmed) {
    const ok = await store.destroy(detail.value.id)
    if (ok) void navigateTo('/hrd/perjalanan-dinas')
  }
}

onMounted(async () => {
  const id = String(route.params.id || '')
  if (!UUID_RE.test(id)) {
    store.clearDetail()
    loading.value = false
    return
  }

  const row = await store.fetchOne(id)
  if (row) {
    setDetailTitle('Detail SPPD', row.nomorSppd, false)
  }
  loading.value = false
})
</script>
