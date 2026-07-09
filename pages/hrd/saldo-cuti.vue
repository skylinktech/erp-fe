<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <h4 class="mb-1">Saldo Cuti Pegawai</h4>
      <p class="mb-6">
        Kelola jatah cuti per pegawai, tipe, dan tahun. Termasuk potongan cuti bersama dan pengajuan
        yang disetujui.
      </p>

      <div class="row g-6 mb-6">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label small text-muted">Tahun</label>
                  <select v-model.number="params.tahun" class="form-select" @change="reload">
                    <option v-for="y in tahunOptions" :key="y" :value="y">{{ y }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small text-muted">Tipe Cuti</label>
                  <select
                    v-model.number="params.cutiTypeId"
                    class="form-select"
                    @change="reload"
                  >
                    <option :value="null">Semua tipe</option>
                    <option v-for="t in cutiTypes" :key="t.id" :value="t.id">
                      {{ t.nmTipeCuti }} ({{ t.kodeCuti }})
                    </option>
                  </select>
                </div>
                <div class="col-md-6 d-flex align-items-end">
                  <p class="small text-muted mb-0">
                    <i class="ri-information-line me-1"></i>
                    Saldo cuti tahunan otomatis berkurang saat ada cuti bersama atau pengajuan
                    disetujui.
                  </p>
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
              search-placeholder="Cari pegawai..."
              :show-export="false"
              :export-disabled="loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
            >
              <template #add>
                <button
                  v-if="canCreate"
                  type="button"
                  class="btn btn-primary"
                  @click="store.openCreate()"
                >
                  <i class="ri-add-line me-1"></i>
                  Tambah Saldo Cuti
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
                <Column field="id" header="#" style="width: 5%" />
                <Column header="Pegawai" style="width: 18%">
                  <template #body="{ data }">
                    <div class="fw-medium">{{ data.pegawai?.nmPegawai || '-' }}</div>
                    <small class="text-muted">{{ data.pegawai?.nikPegawai || '-' }}</small>
                  </template>
                </Column>
                <Column header="Tipe" style="width: 12%">
                  <template #body="{ data }">
                    <span class="badge bg-label-secondary">
                      {{ data.cutiType?.kodeCuti || data.cutiType?.nmTipeCuti || '-' }}
                    </span>
                  </template>
                </Column>
                <Column field="tahun" header="Tahun" style="width: 8%" :sortable="true" />
                <Column header="Jatah" style="width: 8%">
                  <template #body="{ data }">{{ data.jatah_awal }} hari</template>
                </Column>
                <Column header="Cuti Bersama" style="width: 10%">
                  <template #body="{ data }">
                    <span v-if="data.cuti_bersama_total > 0" class="text-warning">
                      -{{ data.cuti_bersama_total }}
                    </span>
                    <span v-else class="text-muted">0</span>
                  </template>
                </Column>
                <Column header="Cuti Diambil" style="width: 10%">
                  <template #body="{ data }">
                    <span v-if="data.cuti_pengajuan_terpakai > 0">
                      -{{ data.cuti_pengajuan_terpakai }}
                    </span>
                    <span v-else class="text-muted">0</span>
                  </template>
                </Column>
                <Column header="Sisa" style="width: 8%">
                  <template #body="{ data }">
                    <strong class="text-success">{{ data.sisa_jatah_cuti }}</strong>
                  </template>
                </Column>
                <Column header="Valid Sampai" style="width: 12%">
                  <template #body="{ data }">
                    {{ formatDate(data.valid_sampai) }}
                  </template>
                </Column>
                <Column header="Aksi" style="min-width: 6rem" :exportable="false">
                  <template #body="{ data }">
                    <button
                      type="button"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
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

    <Menu ref="actionsMenuRef" :model="actionMenuItems" :popup="true" append-to="body" />

    <!-- Form modal -->
    <Modal
      id="SaldoCutiFormModal"
      :title="store.isEditMode ? 'Edit Saldo Cuti' : 'Tambah Saldo Cuti'"
      :description="
        store.isEditMode
          ? 'Sesuaikan sisa jatah dan cuti terpakai pegawai.'
          : 'Buat saldo cuti baru untuk pegawai. Pro-rata otomatis jika pegawai masuk di tengah tahun.'
      "
      :validation-errors-from-parent="store.validationErrors"
      dialog-class="modal-lg"
    >
      <form @submit.prevent="handleSave">
        <div class="row g-4">
          <div v-if="!store.isEditMode" class="col-md-6">
            <label class="form-label">Pegawai <span class="text-danger">*</span></label>
            <select v-model.number="store.form.pegawai_id" class="form-select" required>
              <option :value="null" disabled>— Pilih pegawai —</option>
              <option v-for="p in pegawaiOptions" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>
          <div v-if="!store.isEditMode" class="col-md-6">
            <label class="form-label">Tipe Cuti <span class="text-danger">*</span></label>
            <select v-model.number="store.form.cuti_type_id" class="form-select" required>
              <option :value="null" disabled>— Pilih tipe —</option>
              <option v-for="t in cutiTypes" :key="t.id" :value="t.id">
                {{ t.nmTipeCuti }} ({{ t.kodeCuti }})
              </option>
            </select>
          </div>
          <div v-if="!store.isEditMode" class="col-md-6">
            <label class="form-label">Tahun <span class="text-danger">*</span></label>
            <input
              v-model.number="store.form.tahun"
              type="number"
              class="form-control"
              min="2000"
              max="2100"
              required
              @change="syncValidSampai"
            />
          </div>
          <div v-if="!store.isEditMode" class="col-md-6 d-flex align-items-end">
            <div class="form-check">
              <input
                id="auto-prorata"
                v-model="store.form.auto_prorata"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="auto-prorata">
                Hitung jatah pro-rata otomatis
              </label>
            </div>
          </div>
          <div
            v-if="store.isEditMode || (!store.isEditMode && !store.form.auto_prorata)"
            class="col-md-6"
          >
            <label class="form-label">
              Sisa Jatah Cuti
              <span v-if="store.isEditMode" class="text-danger">*</span>
            </label>
            <input
              v-model.number="store.form.sisa_jatah_cuti"
              type="number"
              class="form-control"
              min="0"
              :required="store.isEditMode"
            />
          </div>
          <div v-if="store.isEditMode" class="col-md-6">
            <label class="form-label">Cuti Terpakai <span class="text-danger">*</span></label>
            <input
              v-model.number="store.form.cuti_terpakai"
              type="number"
              class="form-control"
              min="0"
              required
            />
          </div>
          <div v-if="!store.isEditMode" class="col-md-6">
            <label class="form-label">Cuti Terpakai (awal)</label>
            <input
              v-model.number="store.form.cuti_terpakai"
              type="number"
              class="form-control"
              min="0"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Sisa Cuti Tahun Lalu</label>
            <input
              v-model.number="store.form.sisa_cuti_tahun_lalu"
              type="number"
              class="form-control"
              min="0"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Valid Sampai</label>
            <input v-model="store.form.valid_sampai" type="date" class="form-control" />
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-6">
          <button type="button" class="btn btn-outline-secondary" @click="store.closeModal()">
            Batal
          </button>
          <button type="submit" class="btn btn-primary" :disabled="store.saving">
            <span
              v-if="store.saving"
              class="spinner-border spinner-border-sm me-1"
              role="status"
            ></span>
            Simpan
          </button>
        </div>
      </form>
    </Modal>

    <!-- Detail modal -->
    <div
      ref="detailModalEl"
      class="modal fade"
      id="saldoCutiDetailModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detail Saldo Cuti</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="detailLoading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <template v-else-if="detail">
              <dl class="row mb-4">
                <dt class="col-4 text-muted">Pegawai</dt>
                <dd class="col-8">{{ detail.pegawai?.nmPegawai || '-' }}</dd>
                <dt class="col-4 text-muted">Tipe Cuti</dt>
                <dd class="col-8">
                  {{ detail.cutiType?.nmTipeCuti || '-' }}
                  ({{ detail.cutiType?.kodeCuti || '-' }})
                </dd>
                <dt class="col-4 text-muted">Tahun</dt>
                <dd class="col-8">{{ detail.tahun }}</dd>
                <dt class="col-4 text-muted">Jatah Awal</dt>
                <dd class="col-8">{{ detail.jatah_awal }} hari</dd>
                <dt class="col-4 text-muted">Cuti Bersama</dt>
                <dd class="col-8 text-warning">-{{ detail.cuti_bersama_total }} hari</dd>
                <dt class="col-4 text-muted">Cuti Diambil</dt>
                <dd class="col-8">-{{ detail.cuti_pengajuan_terpakai }} hari</dd>
                <dt class="col-4 text-muted">Sisa</dt>
                <dd class="col-8"><strong class="text-success">{{ detail.sisa_jatah_cuti }} hari</strong></dd>
              </dl>

              <h6 v-if="(detail.breakdown?.length ?? 0) > 0" class="mb-3">Breakdown Cuti Bersama</h6>
              <div v-if="(detail.breakdown?.length ?? 0) > 0" class="table-responsive">
                <table class="table table-sm">
                  <thead class="table-light">
                    <tr>
                      <th>Event</th>
                      <th>Rentang</th>
                      <th class="text-end">Hari</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in detail.breakdown" :key="item.hr_calendar_event_id">
                      <td>{{ item.nama }}</td>
                      <td>{{ formatRangeTanggal(item.tanggal_mulai, item.tanggal_selesai) }}</td>
                      <td class="text-end text-warning">-{{ item.hari }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { Modal as BootstrapModal } from 'bootstrap'
import Menu from 'primevue/menu'
import Column from 'primevue/column'
import MyDataTable from '~/components/table/MyDataTable.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import Modal from '~/components/modal/Modal.vue'
import { useCutiBalanceStore, type CutiBalanceRow } from '~/stores/cuti-balance'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { formatRangeTanggal } from '~/constants/hrd/cutiForm'

const store = useCutiBalanceStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setListTitle } = useDynamicTitle()

const {
  rows,
  loading,
  totalRecords,
  params,
  cutiTypes,
  pegawaiOptions,
  detail,
  detailLoading,
  showModal,
  showDetailModal,
} = storeToRefs(store)

const currentYear = new Date().getFullYear()
const tahunOptions = [currentYear - 1, currentYear, currentYear + 1]
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const canCreate = computed(
  () => userHasRole('superadmin') || userHasPermission('create_saldo_cuti')
)
const canEdit = computed(() => userHasRole('superadmin') || userHasPermission('edit_saldo_cuti'))
const canDelete = computed(
  () => userHasRole('superadmin') || userHasPermission('delete_saldo_cuti')
)

setListTitle('Saldo Cuti', 0)

const actionsMenuRef = ref<InstanceType<typeof Menu> | null>(null)
const activeRow = ref<CutiBalanceRow | null>(null)
const detailModalEl = ref<HTMLDivElement | null>(null)
let detailModalInstance: BootstrapModal | null = null
let formModalInstance: BootstrapModal | null = null

const actionMenuItems = computed(() => {
  const row = activeRow.value
  if (!row) return []
  const items: any[] = [
    {
      label: 'Detail',
      icon: 'ri ri-eye-line',
      command: () => void openDetail(row),
    },
  ]
  if (canEdit.value) {
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => store.openEdit(row),
    })
  }
  if (canDelete.value) {
    items.push({ separator: true })
    items.push({
      label: 'Hapus',
      icon: 'ri ri-delete-bin-7-line',
      class: 'saldo-cuti-menu-danger',
      command: () => void store.destroy(row.id),
    })
  }
  return items
})

function toggleActions(event: MouseEvent, row: CutiBalanceRow) {
  activeRow.value = row
  nextTick(() => actionsMenuRef.value?.toggle(event))
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function syncValidSampai() {
  if (store.form.tahun) {
    store.form.valid_sampai = `${store.form.tahun}-12-31`
  }
}

function reload() {
  params.value.page = 1
  params.value.first = 0
  void store.fetchRows()
}

function onToolbarRows(v: number) {
  params.value.rows = Number(v) || 10
  reload()
}

function onPage(e: any) {
  params.value.first = e.first
  params.value.rows = e.rows
  params.value.page = Math.floor(e.first / e.rows) + 1
  void store.fetchRows()
}

function onSort(e: any) {
  params.value.sortField = e.sortField
  params.value.sortOrder = e.sortOrder
  void store.fetchRows()
}

async function handleSave() {
  await store.save()
}

async function openDetail(row: CutiBalanceRow) {
  await store.openDetail(row)
}

const debouncedSearch = useDebounceFn(() => {
  params.value.search = globalFilterValue.value
  reload()
}, 400)

watch(globalFilterValue, () => debouncedSearch())

watch(showModal, (open) => {
  if (!process.client) return
  const el = document.getElementById('SaldoCutiFormModal')
  if (!el) return
  if (!formModalInstance) formModalInstance = new BootstrapModal(el)
  if (open) formModalInstance.show()
  else formModalInstance.hide()
})

watch(showDetailModal, (open) => {
  if (!process.client || !detailModalEl.value) return
  if (!detailModalInstance) {
    detailModalInstance = new BootstrapModal(detailModalEl.value)
    detailModalEl.value.addEventListener('hidden.bs.modal', () => store.closeDetailModal())
  }
  if (open) detailModalInstance.show()
  else detailModalInstance.hide()
})

onMounted(async () => {
  await Promise.all([store.fetchCutiTypes(), store.fetchPegawaiOptions(), store.fetchRows()])
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['view_saldo_cuti', 'access_saldo_cuti'],
})
</script>

<style scoped>
.card-datatable :deep(.p-datatable .p-datatable-tbody > tr) {
  vertical-align: middle;
}

:global(.p-menu-item.saldo-cuti-menu-danger .p-menu-item-link .p-menu-item-label),
:global(.p-menu-item.saldo-cuti-menu-danger .p-menu-item-link .p-menu-item-icon) {
  color: var(--bs-danger) !important;
}
</style>
