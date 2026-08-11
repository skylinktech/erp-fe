<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <h4 class="mb-1">Tax Master</h4>
      <p class="mb-6">
        Konfigurasi master pajak (PPN, PPh, dll.) beserta histori tarif efektif
      </p>

      <div class="row g-6 mb-6">
        <div class="col-xl-3 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="skeleton-loader" style="height:48px"></div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <p class="mb-0">Total Master</p>
                  <span class="avatar-initial rounded bg-label-primary p-2">
                    <i class="ri-percent-line"></i>
                  </span>
                </div>
                <h5 class="mb-0">{{ statistics.total }}</h5>
              </template>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="skeleton-loader" style="height:48px"></div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <p class="mb-0">Aktif</p>
                  <span class="avatar-initial rounded bg-label-success p-2">
                    <i class="ri-checkbox-circle-line"></i>
                  </span>
                </div>
                <h5 class="mb-0 text-success">{{ statistics.active }}</h5>
              </template>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="skeleton-loader" style="height:48px"></div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <p class="mb-0">Output</p>
                  <span class="avatar-initial rounded bg-label-info p-2">
                    <i class="ri-arrow-up-circle-line"></i>
                  </span>
                </div>
                <h5 class="mb-0">{{ statistics.output }}</h5>
              </template>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-md-6">
          <div class="card">
            <div class="card-body">
              <div v-if="loadingStats" class="skeleton-loader" style="height:48px"></div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <p class="mb-0">Withholding</p>
                  <span class="avatar-initial rounded bg-label-warning p-2">
                    <i class="ri-arrow-down-circle-line"></i>
                  </span>
                </div>
                <h5 class="mb-0">{{ statistics.withholding }}</h5>
                <small class="text-muted">{{ statistics.rates }} histori tarif</small>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Tipe</label>
              <select class="form-select w-100" v-model="filterType" @change="applyTypeFilter">
                <option value="">Semua Tipe</option>
                <option value="OUTPUT">OUTPUT</option>
                <option value="WITHHOLDING">WITHHOLDING</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Status</label>
              <select class="form-select w-100" v-model="filterActive" @change="applyActiveFilter">
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="me-1">Baris:</span>
            <Dropdown
              v-model="params.rows"
              :options="rowsOptions"
              @change="handleRowsChange"
              style="width:8rem"
            />
            <button
              v-if="userHasRole('superadmin') || userHasPermission('create_tax_master')"
              class="btn btn-primary btn-sm"
              @click="openCreate"
            >
              <i class="ri-add-line me-1"></i> Tambah Tax Master
            </button>
          </div>
          <InputText
            v-model="searchQuery"
            placeholder="Cari kode, nama, account code..."
            style="width:280px"
          />
        </div>

        <div class="card-datatable table-responsive py-3 px-3">
          <MyDataTable
            :data="rows"
            :rows="Number(params.rows)"
            :loading="loading"
            :totalRecords="totalRecords"
            :first="params.first"
            :lazy="true"
            @page="onPage"
            @sort="onSort"
            responsiveLayout="scroll"
            paginatorPosition="bottom"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
          >
            <Column header="#" :sortable="false" style="width:50px">
              <template #body="slotProps">
                {{ params.first + slotProps.index + 1 }}
              </template>
            </Column>

            <Column field="code" header="Kode" :sortable="true" style="min-width:100px">
              <template #body="{ data }">
                <span class="fw-semibold">{{ data.code }}</span>
              </template>
            </Column>

            <Column field="name" header="Nama" :sortable="true" style="min-width:180px" />

            <Column field="type" header="Tipe" :sortable="true" style="min-width:120px">
              <template #body="{ data }">
                <span :class="data.type === 'OUTPUT' ? 'badge bg-label-info' : 'badge bg-label-warning'">
                  {{ data.type }}
                </span>
              </template>
            </Column>

            <Column field="calculationType" header="Perhitungan" :sortable="true" style="min-width:120px">
              <template #body="{ data }">
                {{ data.calculationType }}
              </template>
            </Column>

            <Column field="defaultRate" header="Rate Default" :sortable="true" style="min-width:120px">
              <template #body="{ data }">
                <span class="fw-semibold">{{ formatRate(data.defaultRate, data.calculationType) }}</span>
              </template>
            </Column>

            <Column field="accountCode" header="Account" :sortable="false" style="min-width:110px">
              <template #body="{ data }">
                {{ data.accountCode || '—' }}
              </template>
            </Column>

            <Column field="isActive" header="Status" :sortable="true" style="min-width:100px">
              <template #body="{ data }">
                <span :class="data.isActive ? 'badge bg-label-success' : 'badge bg-label-secondary'">
                  {{ data.isActive ? 'Aktif' : 'Nonaktif' }}
                </span>
              </template>
            </Column>

            <Column header="Tarif" :sortable="false" style="min-width:90px">
              <template #body="{ data }">
                <span class="badge bg-label-primary">{{ data.taxRates?.length || 0 }}</span>
              </template>
            </Column>

            <Column header="Aksi" :exportable="false" style="min-width:100px">
              <template #body="{ data }">
                <div class="d-inline-block dropdown">
                  <a
                    href="javascript:;"
                    class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                    data-bs-toggle="dropdown"
                  >
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li
                      v-if="userHasRole('superadmin') || userHasPermission('edit_tax_master')"
                    >
                      <a class="dropdown-item" href="javascript:void(0)" @click="openEdit(data)">
                        <i class="ri-pencil-line me-2"></i> Edit
                      </a>
                    </li>
                    <li
                      v-if="userHasRole('superadmin') || userHasPermission('delete_tax_master')"
                    >
                      <a class="dropdown-item text-danger" href="javascript:void(0)" @click="store.remove(data.id)">
                        <i class="ri-delete-bin-line me-2"></i> Hapus
                      </a>
                    </li>
                  </ul>
                </div>
              </template>
            </Column>
          </MyDataTable>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="isEdit ? 'Edit Tax Master' : 'Tambah Tax Master'"
      :style="{ width: '780px' }"
      :closable="!store.saving"
    >
      <div v-if="form" class="d-flex flex-column gap-3">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Kode <span class="text-danger">*</span></label>
            <input
              v-model="form.code"
              type="text"
              class="form-control text-uppercase"
              :disabled="store.saving"
              placeholder="PPN / PPH21"
            >
          </div>
          <div class="col-md-8">
            <label class="form-label">Nama <span class="text-danger">*</span></label>
            <input v-model="form.name" type="text" class="form-control" :disabled="store.saving">
          </div>
          <div class="col-md-4">
            <label class="form-label">Tipe <span class="text-danger">*</span></label>
            <select v-model="form.type" class="form-select" :disabled="store.saving">
              <option value="OUTPUT">OUTPUT</option>
              <option value="WITHHOLDING">WITHHOLDING</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Perhitungan <span class="text-danger">*</span></label>
            <select v-model="form.calculationType" class="form-select" :disabled="store.saving">
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="FIXED">FIXED</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Default Rate <span class="text-danger">*</span></label>
            <input
              v-model.number="form.defaultRate"
              type="number"
              step="0.0001"
              min="0"
              class="form-control"
              :disabled="store.saving"
              @input="syncDefaultRateToHistory"
            >
          </div>
          <div class="col-md-6">
            <label class="form-label">Account Code</label>
            <input v-model="form.accountCode" type="text" class="form-control" :disabled="store.saving">
          </div>
          <div class="col-md-6 d-flex align-items-end">
            <div class="form-check form-switch mb-2">
              <input id="taxMasterActive" v-model="form.isActive" class="form-check-input" type="checkbox" :disabled="store.saving">
              <label class="form-check-label" for="taxMasterActive">Aktif</label>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label">Deskripsi</label>
            <textarea v-model="form.description" class="form-control" rows="2" :disabled="store.saving"></textarea>
          </div>
        </div>

        <div class="border rounded p-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 class="mb-0">Histori Tarif</h6>
              <small class="text-muted">Satu tarif default wajib. Periode tidak boleh overlapping secara logis (from ≤ until).</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary" :disabled="store.saving" @click="addRateRow">
              <i class="ri-add-line me-1"></i> Tambah Tarif
            </button>
          </div>

          <div v-if="!form.taxRates.length" class="text-muted small">Belum ada tarif.</div>

          <div
            v-for="(rate, idx) in form.taxRates"
            :key="rate.id || `new-${idx}`"
            class="row g-2 align-items-end mb-2 pb-2 border-bottom"
          >
            <div class="col-md-2">
              <label class="form-label small">Rate</label>
              <input
                v-model.number="rate.rate"
                type="number"
                step="0.0001"
                min="0"
                class="form-control form-control-sm"
                :disabled="store.saving"
                @input="syncHistoryRateToDefault(idx)"
              >
            </div>
            <div class="col-md-3">
              <label class="form-label small">Berlaku Dari</label>
              <input v-model="rate.effectiveFrom" type="date" class="form-control form-control-sm" :disabled="store.saving">
            </div>
            <div class="col-md-3">
              <label class="form-label small">Berlaku Sampai</label>
              <input v-model="rate.effectiveUntil" type="date" class="form-control form-control-sm" :disabled="store.saving">
            </div>
            <div class="col-md-2">
              <div class="form-check mt-4">
                <input
                  :id="`rate-default-${idx}`"
                  class="form-check-input"
                  type="radio"
                  name="taxRateDefault"
                  :checked="rate.isDefault"
                  :disabled="store.saving"
                  @change="setDefaultRate(idx)"
                >
                <label class="form-check-label small" :for="`rate-default-${idx}`">Default</label>
              </div>
            </div>
            <div class="col-md-2 text-end">
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                :disabled="store.saving || form.taxRates.length <= 1"
                @click="removeRateRow(idx)"
              >
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-outline-secondary" :disabled="store.saving" @click="dialogVisible = false">
          Batal
        </button>
        <button class="btn btn-primary" :disabled="store.saving" @click="submitForm">
          <span v-if="store.saving" class="spinner-border spinner-border-sm me-1"></span>
          Simpan
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useTaxMasterStore } from '~/stores/tax-masters'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import MyDataTable from '~/components/table/MyDataTable.vue'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'

const store = useTaxMasterStore()
const { userHasRole, userHasPermission } = usePermissions()
const { setListTitle } = useDynamicTitle()

const rows = computed(() => store.rows)
const loading = computed(() => store.loading)
const loadingStats = computed(() => store.loadingStats)
const totalRecords = computed(() => store.totalRecords)
const params = computed(() => store.params)
const statistics = computed(() => store.statistics)

const rowsOptions = ref([10, 25, 50, 100])
const searchQuery = ref('')
const filterType = ref('')
const filterActive = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const form = ref(null)

const today = () => new Date().toISOString().slice(0, 10)

const blankRate = () => ({
  rate: 0,
  effectiveFrom: today(),
  effectiveUntil: '',
  isDefault: true,
})

const blankForm = () => ({
  code: '',
  name: '',
  type: 'OUTPUT',
  calculationType: 'PERCENTAGE',
  defaultRate: 0,
  accountCode: '',
  description: '',
  isActive: true,
  taxRates: [blankRate()],
})

const formatRate = (rate, calcType) => {
  const n = Number(rate ?? 0)
  if (calcType === 'FIXED') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n)
  }
  return `${n}%`
}

const openCreate = () => {
  isEdit.value = false
  editingId.value = null
  form.value = blankForm()
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEdit.value = true
  editingId.value = row.id
  form.value = {
    code: row.code,
    name: row.name,
    type: row.type,
    calculationType: row.calculationType,
    defaultRate: Number(row.defaultRate ?? 0),
    accountCode: row.accountCode || '',
    description: row.description || '',
    isActive: !!row.isActive,
    taxRates: (row.taxRates?.length ? row.taxRates : [blankRate()]).map((r) => ({
      id: r.id,
      rate: Number(r.rate ?? 0),
      effectiveFrom: r.effectiveFrom || today(),
      effectiveUntil: r.effectiveUntil || '',
      isDefault: !!r.isDefault,
    })),
  }
  if (!form.value.taxRates.some((r) => r.isDefault)) {
    form.value.taxRates[0].isDefault = true
  }
  dialogVisible.value = true
}

const addRateRow = () => {
  form.value.taxRates.push({
    rate: Number(form.value.defaultRate || 0),
    effectiveFrom: today(),
    effectiveUntil: '',
    isDefault: false,
  })
}

const removeRateRow = (idx) => {
  const wasDefault = form.value.taxRates[idx]?.isDefault
  form.value.taxRates.splice(idx, 1)
  if (wasDefault && form.value.taxRates.length) {
    form.value.taxRates[0].isDefault = true
    form.value.defaultRate = Number(form.value.taxRates[0].rate || 0)
  }
}

const setDefaultRate = (idx) => {
  form.value.taxRates.forEach((r, i) => {
    r.isDefault = i === idx
  })
  form.value.defaultRate = Number(form.value.taxRates[idx].rate || 0)
}

/** Field Default Rate harus selalu sinkron dengan baris tarif yang di-mark default. */
const syncDefaultRateToHistory = () => {
  if (!form.value?.taxRates?.length) return
  const idx = form.value.taxRates.findIndex((r) => r.isDefault)
  const target = idx >= 0 ? idx : 0
  if (!form.value.taxRates[target].isDefault) {
    form.value.taxRates.forEach((r, i) => {
      r.isDefault = i === target
    })
  }
  form.value.taxRates[target].rate = Number(form.value.defaultRate ?? 0)
}

const syncHistoryRateToDefault = (idx) => {
  if (!form.value?.taxRates?.[idx]?.isDefault) return
  form.value.defaultRate = Number(form.value.taxRates[idx].rate || 0)
}

const validateForm = () => {
  if (!form.value.code?.trim()) return 'Kode wajib diisi'
  if (!form.value.name?.trim()) return 'Nama wajib diisi'
  if (!form.value.taxRates?.length) return 'Minimal 1 tarif'
  if (!form.value.taxRates.some((r) => r.isDefault)) return 'Pilih satu tarif default'
  for (const r of form.value.taxRates) {
    if (r.rate == null || Number(r.rate) < 0) return 'Rate tidak valid'
    if (!r.effectiveFrom) return 'Tanggal berlaku dari wajib diisi'
    if (r.effectiveUntil && r.effectiveUntil < r.effectiveFrom) {
      return 'Tanggal berlaku sampai harus >= berlaku dari'
    }
  }
  return null
}

const submitForm = async () => {
  // Pastikan perubahan di field Default Rate ikut ke payload taxRates
  syncDefaultRateToHistory()

  const err = validateForm()
  if (err) {
    useToast().error({ title: 'Validasi', message: err, color: 'red', position: 'bottomRight' })
    return
  }

  const defaultRateRow = form.value.taxRates.find((r) => r.isDefault)
  const payload = {
    code: form.value.code.trim().toUpperCase(),
    name: form.value.name.trim(),
    type: form.value.type,
    calculationType: form.value.calculationType,
    defaultRate: Number(defaultRateRow?.rate ?? form.value.defaultRate),
    accountCode: form.value.accountCode?.trim() || null,
    description: form.value.description?.trim() || null,
    isActive: !!form.value.isActive,
    taxRates: form.value.taxRates.map((r) => ({
      ...(r.id ? { id: r.id } : {}),
      rate: Number(r.rate),
      effectiveFrom: r.effectiveFrom,
      effectiveUntil: r.effectiveUntil || null,
      isDefault: !!r.isDefault,
    })),
  }

  try {
    if (isEdit.value && editingId.value) {
      await store.update(editingId.value, payload)
    } else {
      await store.create(payload)
    }
    dialogVisible.value = false
  } catch {
    // toast via store
  }
}

const onPage = (event) => store.setPagination(event)
const onSort = (event) => store.setSort(event)
const handleRowsChange = (value) => {
  store.params.rows = Number(value) || 10
  store.params.first = 0
  store.fetchList()
}
const applyTypeFilter = () => store.setFilter('type', filterType.value)
const applyActiveFilter = () => store.setFilter('isActive', filterActive.value)

const debouncedSearch = useDebounceFn(() => store.setSearch(searchQuery.value), 400)
watch(searchQuery, debouncedSearch)

onMounted(async () => {
  await Promise.all([store.fetchList(), store.fetchStatistics()])
  setListTitle('Tax Master', totalRecords.value)
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Tax Master',
  description: 'Konfigurasi master pajak dan histori tarif',
})
</script>
