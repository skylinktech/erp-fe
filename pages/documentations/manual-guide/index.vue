<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-12">
      <h4 class="mb-1">Dokumentasi Aplikasi</h4>
      <p class="mb-4">
        Daftar dokumentasi dan riwayat dalam bentuk timeline.
      </p>

      <!-- Card Process Flow (stepper horizontal seperti referensi) -->
      <div class="card mb-4 stepper-card">
        <div class="card-header border-0 bg-transparent px-5 py-4">
          <h5 class="card-title mb-0">Process Flow</h5>
        </div>
        <div class="card-body px-5 pt-0 pb-4 stepper-card-body">
          <template v-if="flowStepsSorted.length === 0">
            <div class="text-center py-4 text-muted">
              <i class="ri-file-list-3-line ri-48px mb-2"></i>
              <p class="mb-0">Belum ada step. Tambah dokumentasi untuk melihat alur.</p>
            </div>
          </template>
          <div v-else class="stepper-flow">
            <template v-for="(step, idx) in flowStepsSorted" :key="step.id">
              <div class="stepper-step">
                <div class="stepper-step-top">
                  <div :class="['stepper-circle', getProcessPillClass(step.type)]">
                    <i class="ri-check-line stepper-circle-icon"></i>
                  </div>
                  <div
                    v-if="idx < flowStepsSorted.length - 1"
                    class="stepper-connector"
                    :class="getProcessPillClass(step.type)"
                  />
                </div>
                <div class="stepper-step-body">
                  <div class="stepper-step-label">STEP {{ step.order ?? idx + 1 }}</div>
                  <div class="stepper-step-title">
                    <i class="ri-checkbox-circle-fill stepper-title-icon"></i>
                    <span>{{ getStepTitleForFlow(step.title) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: viewMode === 'table' }"
            href="#"
            @click.prevent="viewMode = 'table'"
          >
            <i class="ri-list-check-2 me-1"></i>
            Tabel
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: viewMode === 'timeline' }"
            href="#"
            @click.prevent="switchToTimeline"
          >
            <i class="ri-time-line me-1"></i>
            Timeline
          </a>
        </li>
      </ul>

      <!-- Tabel View -->
      <div v-show="viewMode === 'table'" class="row g-6">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div class="d-flex align-items-center me-3 mb-2 mb-md-0">
                <span class="me-2">Baris:</span>
                <Dropdown
                  v-model="params.rows"
                  :options="rowsPerPageOptionsArray"
                  @change="handleRowsChange"
                  placeholder="Jumlah"
                  style="width: 8rem"
                />
              </div>
              <div class="d-flex align-items-center gap-3">
                <button
                  v-if="userHasRole('superadmin')"
                  class="btn btn-primary"
                  @click="docStore.openModal()"
                >
                  <i class="ri-add-line me-2"></i>
                  Tambah
                </button>
                <div class="search-input-wrapper">
                  <i class="ri-search-line search-input-icon"></i>
                  <InputText
                    v-model="globalFilterValue"
                    placeholder="Cari judul atau deskripsi..."
                    class="search-input-field w-full md:w-20rem"
                  />
                </div>
              </div>
            </div>
            <div class="card-datatable table-responsive py-3 px-3">
              <MyDataTable
                ref="myDataTableRef"
                :data="docStore.items"
                :rows="params.rows"
                :loading="docStore.loading"
                :total-records="docStore.totalRecords"
                :first="params.first"
                :lazy="true"
                paginator-position="bottom"
                paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                current-page-report-template="Menampilkan {first} sampai {last} dari {totalRecords} data"
                @page="onPage($event)"
                @sort="onSort($event)"
              >
                <Column header="#" :sortable="false">
                  <template #body="slotProps">
                    {{ params.first + slotProps.index + 1 }}
                  </template>
                </Column>
                <Column field="title" header="Judul" :sortable="true" />
                <Column field="order" header="Urutan" :sortable="true" style="width: 6rem">
                  <template #body="slotProps">
                    {{ slotProps.data.order ?? 0 }}
                  </template>
                </Column>
                <Column field="description" header="Deskripsi" :sortable="false">
                  <template #body="slotProps">
                    <span class="text-truncate d-inline-block" style="max-width: 200px">
                      {{ stripHtml(slotProps.data.description) || '-' }}
                    </span>
                  </template>
                </Column>
                <Column field="type" header="Tipe" :sortable="true">
                  <template #body="slotProps">
                    <span :class="getTypeBadgeClass(slotProps.data.type)">
                      {{ slotProps.data.type || '-' }}
                    </span>
                  </template>
                </Column>
                <Column header="Dibuat oleh" :sortable="false">
                  <template #body="slotProps">
                    {{ getCreatedByName(slotProps.data) }}
                  </template>
                </Column>
                <Column header="Tanggal" :sortable="false">
                  <template #body="slotProps">
                    {{ formatDate(slotProps.data.created_at || slotProps.data.createdAt) }}
                  </template>
                </Column>
                <Column v-if="userHasRole('superadmin')" header="Actions" :exportable="false" style="min-width: 8rem">
                  <template #body="slotProps">
                    <button
                      class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon me-2"
                      @click="docStore.openModal(slotProps.data)"
                    >
                      <i class="ri-edit-box-line ri-20px"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-icon btn-text-secondary rounded-pill btn-icon"
                      @click="docStore.deleteDocumentation(slotProps.data.id)"
                    >
                      <i class="ri-delete-bin-7-line ri-20px"></i>
                    </button>
                  </template>
                </Column>
              </MyDataTable>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline View -->
      <div v-show="viewMode === 'timeline'" class="row">
        <div class="col-12">
          <div v-if="docStore.loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-2">Memuat dokumentasi...</p>
          </div>
          <div v-else-if="timelineItems.length === 0" class="text-center py-5 text-muted">
            <i class="ri-file-list-3-line ri-48px mb-3"></i>
            <p class="mb-0">Belum ada dokumentasi. Tambah dari tab Tabel.</p>
          </div>
          <div v-else class="documentation-timeline">
            <div
              v-for="(item, index) in timelineItems"
              :key="item.id"
              class="timeline-item position-relative"
            >
              <div class="timeline-line position-absolute" />
              <div
                class="timeline-marker rounded-circle flex-shrink-0 position-absolute"
                :class="getTimelineMarkerClass(item.type)"
              />
              <div class="timeline-card position-relative">
                <div class="timeline-card-icon" :class="getTimelineMarkerClass(item.type)">
                  <i class="ri-file-list-3-line"></i>
                </div>
                <div class="timeline-card-body">
                  <h6 class="timeline-card-title">{{ item.title }}</h6>
                  <div
                    v-if="item.description"
                    class="timeline-description text-body-secondary small"
                    v-html="sanitizeHtml(item.description)"
                  />
                  <div v-if="item.file_name || item.fileName" class="timeline-card-file mt-1">
                    <span class="badge bg-label-secondary py-1 px-2 rounded">
                      <i class="ri-file-pdf-line text-danger me-1"></i>
                      {{ item.file_name || item.fileName }}
                    </span>
                  </div>
                  <div class="text-muted small mt-1">
                    <i class="ri-user-line me-1"></i>
                    {{ getCreatedByName(item) }}
                  </div>
                </div>
                <div class="timeline-card-time">
                  {{ timeAgo(item.created_at || item.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <Modal
      id="DocumentationModal"
      :title="modalTitle"
      :description="modalDescription"
      :validation-errors-from-parent="docStore.validationErrors"
    >
      <template #default>
        <form @submit.prevent="docStore.saveDocumentation()">
          <div class="row g-4">
            <div class="col-12">
              <div class="form-floating form-floating-outline">
                <input
                  v-model="docStore.form.title"
                  type="text"
                  class="form-control"
                  placeholder="Judul dokumentasi"
                />
                <label>Judul</label>
              </div>
            </div>
            <div class="col-12">
              <label class="form-label">Deskripsi</label>
              <Editor
                v-model="docStore.form.description"
                editor-style="min-height: 200px"
                class="dokumentasi-description-editor"
                placeholder="Deskripsi dokumentasi (rich text)..."
              />
            </div>
            <div class="col-md-6">
              <div class="form-floating form-floating-outline">
                <input
                  v-model.number="docStore.form.order"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="0"
                />
                <label>Urutan (order)</label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating form-floating-outline">
                <select v-model="docStore.form.type" class="form-select">
                  <option value="">— Pilih tipe —</option>
                  <option value="info">Info</option>
                  <option value="release">Release</option>
                  <option value="meeting">Meeting</option>
                  <option value="update">Update</option>
                </select>
                <label>Tipe (warna timeline)</label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating form-floating-outline">
                <input
                  v-model="docStore.form.file_name"
                  type="text"
                  class="form-control"
                  placeholder="Nama file"
                />
                <label>Nama file (opsional)</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating form-floating-outline">
                <input
                  v-model="docStore.form.file_path"
                  type="text"
                  class="form-control"
                  placeholder="Path/link file"
                />
                <label>Path / link file (opsional)</label>
              </div>
            </div>
          </div>
          <div class="modal-footer mt-6">
            <button type="button" class="btn btn-outline-secondary" @click="docStore.closeModal()">
              Tutup
            </button>
            <button type="submit" class="btn btn-primary" :disabled="docStore.loading">
              <span v-if="docStore.loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Simpan
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '~/components/modal/Modal.vue'
import MyDataTable from '~/components/table/MyDataTable.vue'
import { useDocumentationStore } from '~/stores/documentation'
import type { DocumentationItem } from '~/stores/documentation'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { useDebounceFn } from '@vueuse/core'
import { usePermissions } from '~/composables/usePermissions'

const { userHasRole } = usePermissions()
const docStore = useDocumentationStore()
const { params, form, isEditMode, showModal } = storeToRefs(docStore)

const viewMode = ref<'table' | 'timeline'>('table')
const myDataTableRef = ref(null)
const globalFilterValue = ref('')
const rowsPerPageOptionsArray = ref([10, 25, 50, 100])

const modalTitle = computed(() => (isEditMode.value ? 'Edit Dokumentasi' : 'Tambah Dokumentasi'))
const modalDescription = computed(() =>
  isEditMode.value ? 'Ubah detail dokumentasi.' : 'Isi form untuk menambah dokumentasi baru.'
)

const timelineItems = computed(() => docStore.timelineItems)
const flowStepsSorted = computed(() => docStore.flowStepsSorted)

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  const tmp = typeof document !== 'undefined' ? document.createElement('div') : null
  if (tmp) {
    tmp.innerHTML = html
    return (tmp.textContent || tmp.innerText || '').trim()
  }
  return html.replace(/<[^>]*>/g, '').trim()
}

/** Sanitize HTML untuk ditampilkan di timeline (format rich text seperti di editor), aman dari XSS */
function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  if (typeof document === 'undefined') return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  const allowedTags = ['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'blockquote']
  const div = document.createElement('div')
  div.innerHTML = html
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/</g, '&lt;')
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (!allowedTags.includes(tag)) return Array.from(el.childNodes).map(walk).join('')
    let attrs = ''
    if (tag === 'a' && el.hasAttribute('href')) {
      const href = el.getAttribute('href') || '#'
      if (!href.toLowerCase().startsWith('javascript:')) attrs = ` href="${href.replace(/"/g, '&quot;')}" target="_blank" rel="noopener"`
    }
    const inner = Array.from(el.childNodes).map(walk).join('')
    if (tag === 'br') return '<br>'
    return `<${tag}${attrs}>${inner}</${tag}>`
  }
  return Array.from(div.childNodes).map(walk).join('')
}

/** Judul step untuk summary flow (opsional: buang prefix ✓ dan STEP N —) */
function getStepTitleForFlow(title: string | null | undefined): string {
  if (!title) return ''
  return title.replace(/^✓\s*/i, '').replace(/^STEP\s*\d+\s*[—–-]\s*/i, '').trim() || title
}

function getCreatedByName(item: DocumentationItem) {
  const user = item.created_by_user || item.createdByUser
  if (!user) return '-'
  return (user as any).full_name || (user as any).fullName || user.email || '-'
}

function formatDate(value: string | undefined) {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeAgo(value: string | undefined): string {
  if (!value) return ''
  const now = new Date()
  const date = new Date(value)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 60) return `${diffMin} menit lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  if (diffDay < 7) return `${diffDay} hari lalu`
  return formatDate(value)
}

/** Pill class untuk card Process Flow / stepper sesuai tipe */
function getProcessPillClass(type: string | null | undefined): string {
  if (!type) return 'process-pill-default'
  const m: Record<string, string> = {
    info: 'process-pill-info',
    release: 'process-pill-primary',
    meeting: 'process-pill-success',
    update: 'process-pill-warning',
  }
  return m[type.toLowerCase()] || 'process-pill-default'
}

/** Label tipe untuk badge stepper (Completed / Info / Release / dll) */
function getTypeLabel(type: string | null | undefined): string {
  if (!type) return '—'
  const m: Record<string, string> = {
    info: 'Info',
    release: 'Release',
    meeting: 'Meeting',
    update: 'Update',
  }
  return m[type.toLowerCase()] || type
}

/** Badge warna sesuai tipe: info=info (biru), release=primary (ungu), meeting=success (hijau), update=warning (kuning) */
function getTypeBadgeClass(type: string | null | undefined): string {
  if (!type) return 'badge bg-label-secondary'
  const m: Record<string, string> = {
    info: 'badge bg-label-info',
    release: 'badge bg-label-primary',
    meeting: 'badge bg-label-success',
    update: 'badge bg-label-warning',
  }
  return m[type.toLowerCase()] || 'badge bg-label-secondary'
}

function getTimelineMarkerClass(type: string | null | undefined): string {
  if (!type) return 'timeline-marker-primary'
  const m: Record<string, string> = {
    info: 'timeline-marker-info',
    release: 'timeline-marker-primary',
    meeting: 'timeline-marker-success',
    update: 'timeline-marker-warning',
  }
  return m[type.toLowerCase()] || 'timeline-marker-primary'
}

let modalInstance: any = null
onMounted(() => {
  docStore.fetchDocumentations()
  docStore.fetchFlowSteps()
  const modalElement = document.getElementById('DocumentationModal')
  if (modalElement && typeof bootstrap !== 'undefined') {
    modalInstance = new (window as any).bootstrap.Modal(modalElement)
  }
})

watch(showModal, (newVal) => {
  if (newVal) modalInstance?.show()
  else modalInstance?.hide()
})

const debouncedSearch = useDebounceFn(() => {
  docStore.setSearch(globalFilterValue.value)
}, 500)
watch(globalFilterValue, debouncedSearch)

function onPage(event: any) {
  docStore.setPagination(event)
}

function handleRowsChange() {
  params.value.first = 0
  docStore.fetchDocumentations()
}

function onSort(event: any) {
  docStore.setSort(event)
}

function switchToTimeline() {
  viewMode.value = 'timeline'
  if (docStore.params.rows < 50) {
    docStore.params.rows = 50
    docStore.params.first = 0
    docStore.fetchDocumentations()
  }
}

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
  title: 'Dokumentasi',
})
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 20rem;
}
.search-input-wrapper :deep(input),
.search-input-wrapper :deep(.p-inputtext) {
  padding-left: 2.25rem;
  width: 100%;
}
.search-input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #697a8d;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 1;
}

.documentation-timeline {
  position: relative;
}
.timeline-item {
  position: relative;
  margin-bottom: 1rem;
  padding-left: 28px;
}
.timeline-item:last-child {
  margin-bottom: 0;
}
.timeline-item:last-child .timeline-line {
  display: none;
}
.timeline-line {
  left: 13px;
  top: 24px;
  bottom: -1rem;
  width: 2px;
  margin-left: -1px;
  background: repeating-linear-gradient(
    to bottom,
    #e2e8f0 0,
    #e2e8f0 4px,
    transparent 4px,
    transparent 8px
  );
  border: none;
}
.timeline-marker {
  position: absolute;
  left: 6px;
  top: 20px;
  width: 14px;
  height: 14px;
  z-index: 2;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
.timeline-marker-primary {
  background-color: #008fec;
}
.timeline-marker-success {
  background-color: #00ac4f;
}
.timeline-marker-dark {
  background-color: #566a7f;
}
.timeline-marker-info {
  background-color: #27b4e0;
}
.timeline-marker-warning {
  background-color: #ffba2f;
}

/* Setiap step dalam card sendiri */
.timeline-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: none;
  border: 1px solid var(--bs-card-border-color, #e6e6e8);
  min-height: 60px;
}
.timeline-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  font-size: 1.1rem;
}
.timeline-card-icon.timeline-marker-primary {
  background-color: #008fec;
}
.timeline-card-icon.timeline-marker-success {
  background-color: #16a34a;
}
.timeline-card-icon.timeline-marker-dark {
  background-color: #566a7f;
}
.timeline-card-icon.timeline-marker-info {
  background-color: #0891b2;
}
.timeline-card-icon.timeline-marker-warning {
  background-color: #d97706;
}
.timeline-card-body {
  flex: 1;
  min-width: 0;
}
.timeline-card-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}
.timeline-card-time {
  flex-shrink: 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* Rich text di timeline: tampil seperti di editor */
.timeline-description {
  line-height: 1.5;
}
.timeline-description :deep(p) {
  margin-bottom: 0.5em;
}
.timeline-description :deep(p:last-child) {
  margin-bottom: 0;
}
.timeline-description :deep(strong),
.timeline-description :deep(b) {
  font-weight: 600;
}
.timeline-description :deep(ul),
.timeline-description :deep(ol) {
  margin: 0.25em 0;
  padding-left: 1.25em;
}
.timeline-description :deep(li) {
  margin-bottom: 0.15em;
}
.timeline-description :deep(h1),
.timeline-description :deep(h2),
.timeline-description :deep(h3),
.timeline-description :deep(h4),
.timeline-description :deep(h5),
.timeline-description :deep(h6) {
  margin: 0.5em 0 0.25em;
  font-weight: 600;
  line-height: 1.3;
}
.timeline-description :deep(a) {
  color: var(--bs-primary);
  text-decoration: underline;
}

/* Process Flow – Stepper horizontal (ukuran kecil, ikon sejajar teks) */
.stepper-flow {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  font-size: 0.8rem;
}
.stepper-step {
  flex: 1 1 0;
  min-width: 180px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  box-sizing: border-box;
  overflow: visible;
}
.stepper-step-top {
  display: flex;
  align-items: center;
  width: calc(100% + 2.25rem);
  margin-bottom: 0.65rem;
  margin-right: -2.25rem;
}
.stepper-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stepper-circle-icon {
  font-size: 0.95rem;
  color: #fff;
  line-height: 1;
  display: block;
}
.stepper-circle.process-pill-success {
  background-color: #16a34a;
}
.stepper-circle.process-pill-info {
  background-color: #0891b2;
}
.stepper-circle.process-pill-primary {
  background-color: #008fec;
}
.stepper-circle.process-pill-warning {
  background-color: #d97706;
}
.stepper-circle.process-pill-default {
  background-color: #64748b;
}
.stepper-connector {
  flex: 1;
  height: 2px;
  min-width: 16px;
  margin: 0;
}
.stepper-connector.process-pill-success {
  background-color: #16a34a;
}
.stepper-connector.process-pill-info {
  background-color: #0891b2;
}
.stepper-connector.process-pill-primary {
  background-color: #008fec;
}
.stepper-connector.process-pill-warning {
  background-color: #d97706;
}
.stepper-connector.process-pill-default {
  background-color: #e2e8f0;
}
.stepper-step-body {
  width: 100%;
  text-align: left;
  box-sizing: border-box;
}
.stepper-step-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #64748b;
  margin-bottom: 0.35rem;
}
.stepper-step-title {
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.7rem;
  color: #1e293b;
  margin-bottom: 0.4rem;
  line-height: 1.35;
  word-break: break-word;
}
.stepper-step-title .stepper-title-icon {
  font-size: 0.75rem;
  color: #16a34a;
  flex-shrink: 0;
  line-height: 1;
  display: inline-block;
  vertical-align: baseline;
  transform: translateY(0.12em);
}
.stepper-step-title span {
  line-height: 1.35;
  display: inline-block;
}
.stepper-step-badge {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.6rem;
  font-weight: 500;
  margin-top: 0.5rem;
  margin-left: 0;
}
.stepper-step-badge.process-pill-success {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}
.stepper-step-badge.process-pill-info {
  background: rgba(39, 180, 224, 0.15);
  color: #0891b2;
}
.stepper-step-badge.process-pill-primary {
  background: rgba(0, 143, 236, 0.15);
  color: #008fec;
}
.stepper-step-badge.process-pill-warning {
  background: rgba(255, 186, 47, 0.2);
  color: #b45309;
}
.stepper-step-badge.process-pill-default {
  background: rgba(100, 116, 139, 0.15);
  color: #64748b;
}
.stepper-card .card-header {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.stepper-card-body {
  padding-top: 0.25rem;
}
</style>
