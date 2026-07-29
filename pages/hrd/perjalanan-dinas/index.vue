<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Perjalanan Dinas</h4>
      <p class="mb-6">Ajukan dan kelola perjalanan dinas pegawai (SPPD) dengan workflow approval.</p>

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

      <div v-if="!loading && !workflowConfigured" class="alert alert-warning mb-4">
        Approval workflow entitas <code>perjalanan_dinas</code> belum dikonfigurasi.
        <NuxtLink to="/admin/approval-workflows">Atur di Approval Workflows</NuxtLink>.
      </div>

      <CollapsibleFilterCard
        title="Filter Perjalanan Dinas"
        :has-active-filters="hasActiveFilters"
        :show-reset="false"
        @reset="resetFilters"
      >
        <div class="row g-4">
          <div class="col-md-6">
            <label class="form-label">Status</label>
            <select v-model.number="params.status" class="form-select" @change="reload">
              <option :value="null">Semua</option>
              <option v-for="s in STATUS_PD_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Jenis Perjalanan</label>
            <select v-model="params.jenisPerjalanan" class="form-select" @change="reload">
              <option :value="null">Semua</option>
              <option v-for="o in JENIS_PERJALANAN_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
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
            search-placeholder="Cari nomor SPPD / kota / keperluan..."
            :show-export="false"
            :export-disabled="loading"
            @update:rows="onToolbarRows"
            @update:search="(v) => { globalFilterValue = v }"
          >
            <template #add>
              <button
                v-if="userHasRole('superadmin') || userHasPermission('create_perjalanan_dinas')"
                type="button"
                class="btn btn-primary"
                @click="goToCreate"
              >
                <i class="ri-add-line me-1"></i>
                Ajukan Perjalanan Dinas
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
              <Column field="nomorSppd" header="No. SPPD" style="width: 14%">
                <template #body="{ data }">
                  <NuxtLink
                    :to="`/hrd/perjalanan-dinas/detail/${data.id}`"
                    class="fw-medium text-primary text-decoration-none"
                  >
                    {{ data.nomorSppd }}
                  </NuxtLink>
                </template>
              </Column>
              <Column header="Pegawai" style="width: 16%">
                <template #body="{ data }">{{ data.pegawai?.nmPegawai ?? '-' }}</template>
              </Column>
              <Column header="Rute" style="width: 16%">
                <template #body="{ data }">{{ data.kotaAsal }} → {{ data.kotaTujuan }}</template>
              </Column>
              <Column header="Tanggal" style="width: 14%">
                <template #body="{ data }">{{ formatDateRange(data.tanggalBerangkat, data.tanggalKembali) }}</template>
              </Column>
              <Column header="Jenis" style="width: 12%">
                <template #body="{ data }">{{ getJenisPerjalananLabel(data.jenisPerjalanan) }}</template>
              </Column>
              <Column header="Total Biaya" style="width: 12%">
                <template #body="{ data }">{{ formatRupiah(data.totalBiaya) }}</template>
              </Column>
              <Column header="Status" style="width: 12%">
                <template #body="{ data }">
                  <span :class="getStatusPdBadge(data.status).class">
                    {{ getStatusPdBadge(data.status).text }}
                  </span>
                </template>
              </Column>
              <Column header="Aksi" style="min-width: 6rem" :exportable="false">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { navigateTo } from '#app'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import Swal from 'sweetalert2'
import Column from 'primevue/column'
import Menu from 'primevue/menu'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import { usePerjalananDinasStore, type PerjalananDinasRow } from '~/stores/perjalanan-dinas'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import {
  JENIS_PERJALANAN_OPTIONS,
  STATUS_PD_OPTIONS,
  canCancelPendingPerjalananDinas,
  canDeletePerjalananDinas,
  canEditPerjalananDinas,
  canSubmitPerjalananDinas,
  formatRupiah,
  getJenisPerjalananLabel,
  getStatusPdBadge,
} from '~/constants/hrd/perjalananDinasForm'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['view_perjalanan_dinas', 'access_perjalanan_dinas'],
})

const store = usePerjalananDinasStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setListTitle } = useDynamicTitle()

const { rows, loading, totalRecords, params, workflowConfigured, stats } = storeToRefs(store)

const globalFilterValue = ref('')
const actionsMenuRef = ref<InstanceType<typeof Menu> | null>(null)
const activeRow = ref<PerjalananDinasRow | null>(null)

setListTitle('Perjalanan Dinas', 0)

const statCards = computed(() => [
  {
    label: 'Total Pengajuan',
    value: stats.value.total || 0,
    subtitle: 'SPPD tahun ini',
    icon: 'ri-file-list-3-line',
    iconClass: 'bg-label-primary',
  },
  {
    label: 'Disetujui',
    value: stats.value.approved || 0,
    subtitle: 'Perjalanan dinas disetujui',
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
    label: 'Total Biaya Disetujui',
    value: formatRupiah(stats.value.total_biaya_disetujui),
    subtitle: 'Nilai SPPD disetujui',
    icon: 'ri-money-dollar-circle-line',
    iconClass: 'bg-label-info',
  },
])

const hasActiveFilters = computed(
  () => params.value.status != null || params.value.jenisPerjalanan != null
)

function resetFilters() {
  params.value.status = null
  params.value.jenisPerjalanan = null
  reload()
}

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: any[] = [
    { label: 'Detail', icon: 'ri ri-eye-line', command: () => goToDetail(row) },
    { label: 'Cetak SPPD', icon: 'ri ri-printer-line', command: () => goToCetak(row) },
  ]
  if (canEditPerjalananDinas(row)) {
    items.push({ separator: true })
    items.push({ label: 'Edit', icon: 'ri ri-edit-box-line', command: () => goToEdit(row) })
  }
  if (canSubmitPerjalananDinas(row) && workflowConfigured.value) {
    items.push({ label: 'Ajukan Approval', icon: 'ri ri-send-plane-2-line', command: () => submit(row) })
  }
  if (canCancelPendingPerjalananDinas(row)) {
    items.push({ label: 'Batalkan', icon: 'ri ri-close-circle-line', command: () => cancelPending(row) })
  }
  if (row.status === 10 && (userHasRole('superadmin') || userHasPermission('approve_perjalanan_dinas'))) {
    items.push({ label: 'Approve', icon: 'ri ri-check-line', command: () => approve(row) })
  }
  if (row.status === 10 && (userHasRole('superadmin') || userHasPermission('reject_perjalanan_dinas'))) {
    items.push({ label: 'Tolak', icon: 'ri ri-close-line', command: () => reject(row) })
  }
  if (canDeletePerjalananDinas(row) && (userHasRole('superadmin') || userHasPermission('delete_perjalanan_dinas'))) {
    items.push({ separator: true })
    items.push({ label: 'Hapus', icon: 'ri ri-delete-bin-7-line', command: () => destroy(row) })
  }
  return items
})

function reload() {
  params.value.page = 1
  params.value.first = 0
  void store.fetchList()
}

function onToolbarRows(v: number) {
  params.value.rows = Number(v) || 10
  params.value.page = 1
  params.value.first = 0
  void store.fetchList()
}

function onPage(e: any) {
  params.value.first = e.first
  params.value.rows = e.rows
  params.value.page = Math.floor(e.first / e.rows) + 1
  void store.fetchList()
}

function onSort(e: any) {
  params.value.sortField = e.sortField
  params.value.sortOrder = e.sortOrder
  void store.fetchList()
}

const debouncedSearch = useDebounceFn(() => {
  params.value.search = globalFilterValue.value
  reload()
}, 400)
watch(globalFilterValue, () => debouncedSearch())

function toggleActions(event: MouseEvent, row: PerjalananDinasRow) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

function formatDate(v: string) {
  if (!v) return '-'
  return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateRange(a: string, b: string) {
  return `${formatDate(a)} – ${formatDate(b)}`
}

function goToCreate() {
  void navigateTo('/hrd/perjalanan-dinas/form')
}
function goToEdit(row: PerjalananDinasRow) {
  void navigateTo(`/hrd/perjalanan-dinas/form/${row.id}`)
}
function goToDetail(row: PerjalananDinasRow) {
  void navigateTo(`/hrd/perjalanan-dinas/detail/${row.id}`)
}
function goToCetak(row: PerjalananDinasRow) {
  void navigateTo({ path: '/hrd/cetak-perjalanan-dinas', query: { id: row.id } })
}

async function submit(row: PerjalananDinasRow) {
  const r = await Swal.fire({ title: 'Ajukan SPPD?', icon: 'question', showCancelButton: true })
  if (r.isConfirmed) await store.submitForApproval(row.id)
}
async function approve(row: PerjalananDinasRow) {
  const r = await Swal.fire({ title: 'Setujui SPPD?', input: 'textarea', inputLabel: 'Catatan (opsional)', showCancelButton: true })
  if (r.isConfirmed) await store.approve(row.id, r.value || undefined)
}
async function reject(row: PerjalananDinasRow) {
  const r = await Swal.fire({ title: 'Tolak SPPD', input: 'textarea', inputLabel: 'Alasan penolakan', showCancelButton: true, inputValidator: (v) => (!v?.trim() ? 'Wajib diisi' : undefined) })
  if (r.isConfirmed && r.value) await store.reject(row.id, r.value)
}
async function cancelPending(row: PerjalananDinasRow) {
  const r = await Swal.fire({ title: 'Batalkan pengajuan?', icon: 'warning', showCancelButton: true })
  if (r.isConfirmed) await store.cancelPending(row.id)
}
async function destroy(row: PerjalananDinasRow) {
  const r = await Swal.fire({ title: 'Hapus pengajuan?', icon: 'warning', showCancelButton: true })
  if (r.isConfirmed) await store.destroy(row.id)
}

onMounted(async () => {
  await Promise.all([store.fetchList(), store.fetchStats()])
})
</script>
