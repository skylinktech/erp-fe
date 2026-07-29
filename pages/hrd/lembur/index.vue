<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Pengajuan Lembur</h4>
      <p class="mb-6">Ajukan dan kelola lembur pegawai dengan workflow approval (SPKL).</p>

      <div class="row g-6 mb-6">
        <div v-for="card in statCards" :key="card.label" class="col-xl-3 col-lg-6 col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">{{ card.label }}</p>
                <div class="avatar">
                  <span :class="['avatar-initial rounded', card.iconClass]">
                    <i :class="card.icon"></i>
                  </span>
                </div>
              </div>
              <div class="account-heading">
                <h5 class="mb-1">{{ card.value }}</h5>
                <span class="text-muted small">{{ card.subtitle }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="weeklySummary" class="alert alert-info d-flex flex-wrap gap-3 align-items-center mb-4">
        <span><strong>Kuota minggu ini:</strong> {{ formatDurasiJam(weeklySummary.total_jam_minggu) }} terpakai</span>
        <span>Sisa {{ formatDurasiJam(weeklySummary.sisa_kuota_minggu) }} dari {{ weeklySummary.max_jam_minggu }} jam</span>
      </div>

      <div v-if="!loading && !workflowConfigured" class="alert alert-warning mb-4">
        Approval workflow entitas <code>lembur</code> belum dikonfigurasi.
        <NuxtLink to="/admin/approval-workflows">Atur di Approval Workflows</NuxtLink>.
      </div>

      <CollapsibleFilterCard
        title="Filter Lembur"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <div class="row g-4">
          <div class="col-md-6">
            <label class="form-label">Status</label>
            <select v-model.number="params.status" class="form-select" @change="reload">
              <option :value="null">Semua</option>
              <option v-for="s in STATUS_LEMBUR_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Tipe Hari</label>
            <select v-model="params.tipeHari" class="form-select" @change="reload">
              <option :value="null">Semua</option>
              <option v-for="o in TIPE_HARI_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div class="col-md-6 offset-md-6 d-flex justify-content-end mt-4">
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
              <i class="ri-refresh-line me-1"></i>
              Reset Filter
            </button>
          </div>
        </div>
      </CollapsibleFilterCard>

      <div class="col-12">
        <div class="card">
          <ListPageTableHeader
            :rows="Number(params.rows)"
            :rows-options="[10, 25, 50, 100]"
            :search="globalFilterValue"
            search-placeholder="Cari alasan / pekerjaan..."
            :show-export="false"
            :export-disabled="loading"
            @update:rows="onToolbarRows"
            @update:search="(v) => { globalFilterValue = v }"
          >
            <template #add>
              <button
                v-if="userHasRole('superadmin') || userHasPermission('create_lembur')"
                type="button"
                class="btn btn-primary"
                @click="goToCreate"
              >
                <i class="ri-add-line me-1"></i>
                Ajukan Lembur
              </button>
            </template>
          </ListPageTableHeader>

          <div class="card-datatable table-responsive py-3 px-3">
            <MyDataTable
              :data="rows"
              :rows="Number(params.rows)"
              :loading="loading"
              :total-records="totalRecords"
              :first="params.first"
              :lazy="true"
              responsive-layout="scroll"
              @page="onPage"
              @sort="onSort"
            >
              <Column field="id" header="#" style="width: 5%" />
              <Column header="Pegawai" style="width: 18%">
                <template #body="{ data }">{{ data.pegawai?.nmPegawai ?? '-' }}</template>
              </Column>
              <Column header="Tanggal" style="width: 12%">
                <template #body="{ data }">{{ formatDate(data.tanggal) }}</template>
              </Column>
              <Column header="Jam" style="width: 14%">
                <template #body="{ data }">{{ formatJamRange(data.jamMulai, data.jamSelesai) }}</template>
              </Column>
              <Column header="Durasi" style="width: 10%">
                <template #body="{ data }">{{ formatDurasiJam(data.durasiJam) }}</template>
              </Column>
              <Column header="Tipe" style="width: 14%">
                <template #body="{ data }">{{ getTipeHariLabel(data.tipeHari) }}</template>
              </Column>
              <Column header="Status" style="width: 14%">
                <template #body="{ data }">
                  <span :class="getStatusLemburBadge(data.status).class">
                    {{ getStatusLemburBadge(data.status).text }}
                  </span>
                </template>
              </Column>
              <Column header="" style="width: 5%">
                <template #body="{ data }">
                  <button type="button" class="btn btn-sm btn-icon btn-text-secondary" @click="toggleActions($event, data)">
                    <i class="ri-more-2-line"></i>
                  </button>
                </template>
              </Column>
            </MyDataTable>
          </div>
        </div>
      </div>

      <Menu ref="actionsMenuRef" :model="actionMenuItems" popup />

      <!-- Detail modal -->
      <div ref="detailModalEl" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detail Lembur #{{ detail?.id }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div v-if="detailLoading" class="text-center py-4"><div class="spinner-border"></div></div>
              <template v-else-if="detail">
                <p><strong>Pegawai:</strong> {{ detail.pegawai?.nmPegawai }}</p>
                <p><strong>Tanggal:</strong> {{ formatDate(detail.tanggal) }}</p>
                <p><strong>Jam:</strong> {{ formatJamRange(detail.jamMulai, detail.jamSelesai) }}</p>
                <p><strong>Durasi:</strong> {{ formatDurasiJam(detail.durasiJam) }}</p>
                <p><strong>Tipe:</strong> {{ getTipeHariLabel(detail.tipeHari) }}</p>
                <p><strong>Pekerjaan:</strong> {{ detail.pekerjaan }}</p>
                <p><strong>Alasan:</strong> {{ detail.alasan }}</p>
                <p><strong>Status:</strong> {{ getStatusLemburBadge(detail.status).text }}</p>

                <div v-if="showLemburSignature" class="mt-4 pt-3 border-top">
                  <h6 class="mb-3"><i class="ri-pen-nib-line me-1 text-primary"></i> Tanda Tangan Digital</h6>
                  <MultiSignatureDisplay
                    :key="'sig-' + detail.id"
                    document-type="lembur"
                    :document-id="String(detail.id)"
                    title="Tanda Tangan Digital"
                    :columns="4"
                    :qr-size="96"
                    :compact="true"
                  />
                </div>
              </template>
            </div>
            <div class="modal-footer">
              <button v-if="detail?.id" type="button" class="btn btn-outline-primary me-auto" @click="goToCetakFromDetail">
                <i class="ri-printer-line me-1"></i> Cetak
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { navigateTo } from '#app'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { Modal } from 'bootstrap'
import Swal from 'sweetalert2'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import MultiSignatureDisplay from '~/components/MultiSignatureDisplay.vue'
import { useLemburStore, type LemburRow } from '~/stores/lembur'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  STATUS_LEMBUR_OPTIONS,
  STATUS_LEMBUR_APPROVED,
  TIPE_HARI_OPTIONS,
  canCancelPendingLembur,
  canDeleteLembur,
  canEditLembur,
  canSubmitLembur,
  formatDurasiJam,
  formatJamRange,
  getStatusLemburBadge,
  getTipeHariLabel,
} from '~/constants/hrd/lemburForm'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['view_lembur', 'access_lembur'],
})

const store = useLemburStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setListTitle } = useDynamicTitle()

const { rows, loading, totalRecords, params, workflowConfigured, stats, detail, detailLoading, weeklySummary } =
  storeToRefs(store)

const globalFilterValue = ref('')
const actionsMenuRef = ref<InstanceType<typeof Menu> | null>(null)
const activeRow = ref<LemburRow | null>(null)
const detailModalEl = ref<HTMLDivElement | null>(null)
let detailModal: Modal | null = null

setListTitle('Pengajuan Lembur', 0)

const statCards = computed(() => [
  {
    label: 'Total Pengajuan',
    value: stats.value.total || 0,
    subtitle: 'Pengajuan lembur tahun ini',
    icon: 'ri-file-list-3-line',
    iconClass: 'bg-label-primary',
  },
  {
    label: 'Disetujui',
    value: stats.value.approved || 0,
    subtitle: 'Lembur disetujui',
    icon: 'ri-checkbox-circle-line',
    iconClass: 'bg-label-success',
  },
  {
    label: 'Menunggu',
    value: stats.value.menunggu || 0,
    subtitle: 'Menunggu approval',
    icon: 'ri-time-line',
    iconClass: 'bg-label-warning',
  },
  {
    label: 'Jam Disetujui',
    value: formatDurasiJam(stats.value.total_jam_disetujui),
    subtitle: 'Total jam lembur disetujui',
    icon: 'ri-timer-flash-line',
    iconClass: 'bg-label-info',
  },
])

const showLemburSignature = computed(
  () => detail.value && Number(detail.value.status) === STATUS_LEMBUR_APPROVED
)

const hasActiveFilters = computed(
  () => params.value.status != null || params.value.tipeHari != null
)

function resetFilters() {
  params.value.status = null
  params.value.tipeHari = null
  reload()
}

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: any[] = [
    { label: 'Detail', icon: 'ri ri-eye-line', command: () => openDetail(row) },
    { label: 'Cetak', icon: 'ri ri-printer-line', command: () => goToCetak(row) },
  ]
  if (canEditLembur(row)) {
    items.push({ separator: true })
    items.push({ label: 'Edit', icon: 'ri ri-edit-box-line', command: () => goToEdit(row) })
  }
  if (canSubmitLembur(row) && workflowConfigured.value) {
    items.push({ label: 'Ajukan Approval', icon: 'ri ri-send-plane-2-line', command: () => submit(row) })
  }
  if (canCancelPendingLembur(row)) {
    items.push({ label: 'Batalkan', icon: 'ri ri-close-circle-line', command: () => cancelPending(row) })
  }
  if (row.status === 10 && (userHasRole('superadmin') || userHasPermission('approve_lembur'))) {
    items.push({ label: 'Approve', icon: 'ri ri-check-line', command: () => approve(row) })
  }
  if (row.status === 10 && (userHasRole('superadmin') || userHasPermission('reject_lembur'))) {
    items.push({ label: 'Tolak', icon: 'ri ri-close-line', command: () => reject(row) })
  }
  if (canDeleteLembur(row) && (userHasRole('superadmin') || userHasPermission('delete_lembur'))) {
    items.push({ separator: true })
    items.push({ label: 'Hapus', icon: 'ri ri-delete-bin-7-line', command: () => destroy(row) })
  }
  return items
})

function reload() {
  params.value.page = 1
  params.value.first = 0
  void store.fetchLemburs()
}

function onToolbarRows(v: number) {
  params.value.rows = Number(v) || 10
  params.value.page = 1
  params.value.first = 0
  void store.fetchLemburs()
}

function onPage(e: any) {
  params.value.first = e.first
  params.value.rows = e.rows
  params.value.page = Math.floor(e.first / e.rows) + 1
  void store.fetchLemburs()
}

function onSort(e: any) {
  params.value.sortField = e.sortField
  params.value.sortOrder = e.sortOrder
  void store.fetchLemburs()
}

const debouncedSearch = useDebounceFn(() => {
  params.value.search = globalFilterValue.value
  reload()
}, 400)
watch(globalFilterValue, () => debouncedSearch())

function toggleActions(event: MouseEvent, row: LemburRow) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

function formatDate(v: string) {
  if (!v) return '-'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function goToCreate() {
  void navigateTo('/hrd/lembur/form')
}
function goToEdit(row: LemburRow) {
  void navigateTo(`/hrd/lembur/form/${row.id}`)
}
function goToCetak(row: LemburRow) {
  void navigateTo({ path: '/hrd/cetak-lembur', query: { id: String(row.id) } })
}
function goToCetakFromDetail() {
  if (detail.value?.id) goToCetak(detail.value)
}

async function openDetail(row: LemburRow) {
  await store.fetchOne(row.id)
  if (!detailModal && detailModalEl.value) detailModal = new Modal(detailModalEl.value)
  detailModal?.show()
}

async function submit(row: LemburRow) {
  const r = await Swal.fire({ title: 'Ajukan lembur?', icon: 'question', showCancelButton: true })
  if (r.isConfirmed) await store.submitForApproval(row.id)
}
async function approve(row: LemburRow) {
  const r = await Swal.fire({ title: 'Setujui lembur?', input: 'textarea', inputLabel: 'Catatan (opsional)', showCancelButton: true })
  if (r.isConfirmed) await store.approve(row.id, r.value || undefined)
}
async function reject(row: LemburRow) {
  const r = await Swal.fire({ title: 'Tolak lembur', input: 'textarea', inputLabel: 'Alasan penolakan', showCancelButton: true, inputValidator: (v) => (!v?.trim() ? 'Wajib diisi' : undefined) })
  if (r.isConfirmed && r.value) await store.reject(row.id, r.value)
}
async function cancelPending(row: LemburRow) {
  const r = await Swal.fire({ title: 'Batalkan pengajuan?', icon: 'warning', showCancelButton: true })
  if (r.isConfirmed) await store.cancelPending(row.id)
}
async function destroy(row: LemburRow) {
  const r = await Swal.fire({ title: 'Hapus pengajuan?', icon: 'warning', showCancelButton: true })
  if (r.isConfirmed) await store.destroy(row.id)
}

onMounted(async () => {
  await Promise.all([store.fetchLemburs(), store.fetchStats(), store.fetchWeeklySummary()])
})
</script>
