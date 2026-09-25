<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        Kelola format dan periode penomoran dokumen yang didukung sistem. Perubahan format hanya
        berlaku untuk nomor baru; nomor historis tetap tersimpan apa adanya.
      </p>

      <div v-if="!canView" class="alert alert-warning">
        Anda tidak memiliki izin untuk melihat Document Numbering.
      </div>

      <template v-else>
        <ListPageStatsCards :items="statItems" :loading="loading && !rules.length" />

        <CollapsibleFilterCard
          title="Filter Document Numbering"
          :has-active-filters="hasActiveFilters"
          @reset="resetFilters"
        >
          <div class="row g-4">
            <div class="col-12">
              <label class="form-label">Status</label>
              <select v-model="statusFilter" class="form-select w-100" @change="reload()">
                <option value="all">Semua</option>
                <option value="migrated">Counter (dapat diedit)</option>
                <option value="legacy">Legacy (read-only)</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </CollapsibleFilterCard>

        <div v-if="error" class="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{{ error }}</span>
          <button type="button" class="btn btn-sm btn-outline-danger" @click="reload">Coba lagi</button>
        </div>

        <div class="card">
          <ListPageTableHeader
            :rows="Number(meta.perPage)"
            :rows-options="[10, 25, 50, 100]"
            :search="search"
            search-placeholder="Cari nama dokumen atau format…"
            :show-export="false"
            :export-disabled="loading"
            @update:rows="onRowsUpdate"
            @update:search="onSearchUpdate"
          >
            <template #add>
              <button type="button" class="btn btn-outline-primary" :disabled="loading" @click="reload()">
                <i class="ri-refresh-line me-1" />
                Muat ulang
              </button>
            </template>
          </ListPageTableHeader>

          <div class="card-datatable table-responsive py-3 px-3">
            <MyDataTable
              :data="rules"
              :rows="Number(meta.perPage)"
              :loading="loading"
              :total-records="meta.total"
              :first="tableFirst"
              :lazy="true"
              responsive-layout="scroll"
              @page="onPage"
            >
              <Column field="label" header="Dokumen" style="min-width: 12rem">
                <template #body="{ data }">
                  <div class="fw-medium">{{ data.label }}</div>
                  <div class="small text-muted">{{ data.documentType }}</div>
                </template>
              </Column>
              <Column header="Contoh format" style="min-width: 12rem">
                <template #body="{ data }">
                  <code v-if="data.exampleNumber || data.nextNumber">{{ data.exampleNumber || data.nextNumber }}</code>
                  <span v-else class="text-muted">—</span>
                  <div v-if="data.previewDisclaimer" class="small text-muted">{{ data.previewDisclaimer }}</div>
                </template>
              </Column>
              <Column field="formatTemplate" header="Format" style="min-width: 14rem">
                <template #body="{ data }">
                  <code class="small">{{ data.formatTemplate }}</code>
                </template>
              </Column>
              <Column field="resetPeriod" header="Reset" style="width: 7rem">
                <template #body="{ data }">
                  <span class="text-capitalize">{{ data.resetPeriod }}</span>
                </template>
              </Column>
              <Column field="scopeType" header="Scope" style="width: 7rem">
                <template #body="{ data }">
                  <span class="text-capitalize">{{ data.scopeType }}</span>
                </template>
              </Column>
              <Column header="Status" style="width: 8rem">
                <template #body="{ data }">
                  <span :class="statusBadge(data).class">{{ statusBadge(data).text }}</span>
                </template>
              </Column>
              <Column header="Aksi" style="min-width: 6rem" :exportable="false">
                <template #body="{ data }">
                  <button
                    v-if="data.editable && canManage"
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    @click="openEdit(data)"
                  >
                    Edit
                  </button>
                  <span v-else class="small text-muted">{{ data.editable ? '—' : 'Legacy' }}</span>
                </template>
              </Column>
            </MyDataTable>
          </div>
        </div>
      </template>

      <Modal
        id="documentNumberingEditModal"
        v-model="showModal"
        :title="editing ? `Edit penomoran — ${editing.label}` : 'Edit penomoran'"
        description="Perubahan hanya berlaku untuk nomor dokumen baru. Nomor historis tidak diubah."
        dialog-class="modal-lg"
        :validation-errors="formError ? [formError] : []"
      >
        <div class="mb-3">
          <label class="form-label">Format template</label>
          <input v-model="form.formatTemplate" type="text" class="form-control" @input="onFormatInput">
          <div class="form-text">
            Token: {{ allowedTokensHint }}
          </div>
        </div>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Periode reset</label>
            <select v-model="form.resetPeriod" class="form-select">
              <option value="none">none</option>
              <option value="daily">daily</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Scope</label>
            <select v-model="form.scopeType" class="form-select">
              <option value="global">global</option>
              <option value="company">company</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Status</label>
            <select v-model="form.isActive" class="form-select">
              <option :value="true">Aktif</option>
              <option :value="false">Nonaktif</option>
            </select>
          </div>
        </div>
        <div class="mt-3">
          <label class="form-label">Pratinjau nomor berikutnya</label>
          <div v-if="previewLoading" class="text-muted small">Memuat pratinjau…</div>
          <code v-else-if="previewNumber">{{ previewNumber }}</code>
          <span v-else class="text-muted">—</span>
          <div v-if="previewDisclaimer" class="small text-muted mt-1">{{ previewDisclaimer }}</div>
        </div>
        <p v-if="editing?.notes" class="small text-muted mt-3 mb-0">{{ editing.notes }}</p>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button type="button" class="btn btn-outline-secondary" @click="closeEdit">Batal</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="saving || !form.formatTemplate"
            @click="save"
          >
            {{ saving ? 'Menyimpan…' : 'Simpan' }}
          </button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Column from 'primevue/column'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useDocumentNumberingStore, type DocumentNumberingRule } from '~/stores/document-numbering'

definePageMeta({
  title: 'Document Numbering',
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})

const store = useDocumentNumberingStore()
const { rules, meta, loading, error, saving } = storeToRefs(store)
const { userHasPermission, userHasRole } = usePermissions()

const canView = computed(
  () =>
    userHasRole('superadmin') ||
    userHasRole('admin') ||
    userHasPermission('view_document_numbering') ||
    userHasPermission('manage_document_numbering')
)
const canManage = computed(
  () => userHasRole('superadmin') || userHasRole('admin') || userHasPermission('manage_document_numbering')
)

const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const showModal = ref(false)
const editing = ref<DocumentNumberingRule | null>(null)
const form = reactive({
  formatTemplate: '',
  resetPeriod: 'monthly' as DocumentNumberingRule['resetPeriod'],
  scopeType: 'global' as DocumentNumberingRule['scopeType'],
  isActive: true,
})
const formError = ref<string | null>(null)
const previewNumber = ref<string | null>(null)
const previewDisclaimer = ref<string | null>(null)
const previewLoading = ref(false)
let previewTimer: ReturnType<typeof setTimeout> | null = null

const migratedCount = computed(() => rules.value.filter((r) => r.usesCounter).length)
const legacyCount = computed(() => rules.value.filter((r) => !r.usesCounter).length)
const allowedTokensHint = computed(() =>
  (editing.value?.allowedTokens || []).map((t) => '{' + t + '}').join(', ')
)
const tableFirst = computed(() => (meta.value.currentPage - 1) * meta.value.perPage)
const hasActiveFilters = computed(() => statusFilter.value !== 'all')

const statItems = computed(() => [
  {
    key: 'total',
    label: 'Total aturan',
    value: String(meta.value.total),
    icon: 'ri-file-list-3-line',
    iconBgClass: 'bg-label-primary',
    info: {
      title: 'Total aturan',
      description: 'Jumlah jenis dokumen yang terdaftar di Document Numbering (seluruh halaman).',
    },
  },
  {
    key: 'migrated',
    label: 'Counter (halaman ini)',
    value: String(migratedCount.value),
    subtitle: `Dari ${rules.value.length} baris yang ditampilkan`,
    icon: 'ri-checkbox-circle-line',
    iconBgClass: 'bg-label-success',
    info: {
      title: 'Counter service',
      description: 'Jenis dokumen pada halaman ini yang memakai DocumentNumberAllocator dan dapat diedit.',
    },
  },
  {
    key: 'legacy',
    label: 'Non-sequence (halaman ini)',
    value: String(legacyCount.value),
    subtitle: 'Read-only di halaman ini',
    icon: 'ri-error-warning-line',
    iconBgClass: 'bg-label-warning',
    info: {
      title: 'Legacy / non-sequence',
      description: 'Identifier non-sequence (UUID/timestamp) — tidak dapat diedit di Document Numbering.',
    },
  },
])

function statusBadge(row: DocumentNumberingRule) {
  if (!row.isActive) return { text: 'Nonaktif', class: 'badge bg-label-secondary' }
  if (row.usesCounter) return { text: 'Counter', class: 'badge bg-label-success' }
  return { text: 'Legacy', class: 'badge bg-label-warning' }
}

async function fetchCurrentPage(p = page.value) {
  page.value = p
  await store.fetchRules({
    page: p,
    perPage: meta.value.perPage,
    search: search.value,
    status: statusFilter.value,
  })
}

async function reload() {
  await fetchCurrentPage(1)
}

function resetFilters() {
  statusFilter.value = 'all'
  search.value = ''
  reload()
}

function onRowsUpdate(value: number) {
  meta.value.perPage = Number(value) || 25
  fetchCurrentPage(1).catch(() => undefined)
}

function onSearchUpdate(value: string) {
  search.value = value ?? ''
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchCurrentPage(1).catch(() => undefined)
  }, 350)
}

function onPage(event: { page?: number; first?: number; rows?: number }) {
  const nextPage = typeof event.page === 'number' ? event.page + 1 : page.value
  if (event.rows) meta.value.perPage = Number(event.rows)
  fetchCurrentPage(nextPage).catch(() => undefined)
}

function openEdit(row: DocumentNumberingRule) {
  editing.value = row
  form.formatTemplate = row.formatTemplate
  form.resetPeriod = row.resetPeriod
  form.scopeType = row.scopeType
  form.isActive = row.isActive
  formError.value = null
  showModal.value = true
  schedulePreview()
}

function closeEdit() {
  showModal.value = false
  editing.value = null
  formError.value = null
}

function onFormatInput() {
  schedulePreview()
}

function schedulePreview() {
  if (previewTimer) clearTimeout(previewTimer)
  previewTimer = setTimeout(runPreview, 350)
}

async function runPreview() {
  if (!editing.value) return
  previewLoading.value = true
  try {
    const data = await store.preview({
      documentType: editing.value.documentType,
      formatTemplate: form.formatTemplate,
      resetPeriod: form.resetPeriod,
      scopeType: form.scopeType,
    })
    previewNumber.value = data.exampleNumber || data.nextNumber
    previewDisclaimer.value = data.disclaimer || null
    formError.value = null
  } catch (e: any) {
    previewNumber.value = null
    previewDisclaimer.value = null
    formError.value = e?.data?.message || e?.message || null
  } finally {
    previewLoading.value = false
  }
}

async function save() {
  if (!editing.value) return
  formError.value = null
  try {
    await store.updateRule(editing.value.documentType, {
      formatTemplate: form.formatTemplate,
      resetPeriod: form.resetPeriod,
      scopeType: form.scopeType,
      isActive: form.isActive,
      expectedVersion: editing.value.version,
    })
    closeEdit()
    await fetchCurrentPage(page.value)
  } catch (e: any) {
    formError.value = e?.data?.message || e?.message || 'Gagal menyimpan'
  }
}

onMounted(() => {
  if (canView.value) reload().catch(() => undefined)
})
</script>
