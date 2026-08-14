<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          
          <p class="mb-0 text-muted">Registry widget yang bisa dipasang ke layout dashboard mana pun.</p>
        </div>
        <div class="d-flex gap-2">
          <NuxtLink to="/admin/dashboards" class="btn btn-outline-secondary">
            <i class="ri-arrow-left-line me-1"></i> Kembali ke Dashboard
          </NuxtLink>
          <button type="button" class="btn btn-primary" @click="openCreateModal">
            <i class="ri-add-line me-1"></i> Tambah Widget
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span class="fw-semibold">Daftar Widget</span>
          <input v-model="search" type="text" class="form-control" style="max-width: 280px;" placeholder="Cari widget..." />
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Widget</th>
                <th>Component Key</th>
                <th>Tipe</th>
                <th>Default Size</th>
                <th>Status</th>
                <th style="min-width: 6rem;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4 text-muted">
                  <span class="spinner-border spinner-border-sm me-2"></span> Memuat data...
                </td>
              </tr>
              <tr v-else-if="filteredWidgets.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">Belum ada widget di katalog.</td>
              </tr>
              <tr v-for="row in filteredWidgets" :key="row.id">
                <td>{{ row.id }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i v-if="row.icon" :class="[row.icon, 'text-primary']"></i>
                    <div>
                      <div class="fw-semibold">{{ row.title }}</div>
                      <small class="text-muted"><code>{{ row.code }}</code></small>
                    </div>
                  </div>
                </td>
                <td><code>{{ row.componentKey }}</code></td>
                <td><span class="badge bg-label-info">{{ row.widgetType }}</span></td>
                <td>{{ row.defaultWidth }} x {{ row.defaultHeight }}</td>
                <td>
                  <span class="badge" :class="row.isActive ? 'bg-label-success' : 'bg-label-secondary'">
                    {{ row.isActive ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td>
                  <div class="d-inline-block">
                    <a
                      href="javascript:;"
                      class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                      data-bs-toggle="dropdown"
                    >
                      <i class="ri-more-2-fill"></i>
                    </a>
                    <ul class="dropdown-menu">
                      <li>
                        <NuxtLink :to="`/admin/dashboards/widgets/${row.id}/analytics`" class="dropdown-item">
                          <i class="ri-bar-chart-2-line me-2"></i> Lihat Analitik
                        </NuxtLink>
                      </li>
                      <li>
                        <a class="dropdown-item" href="javascript:void(0)" @click="openEditModal(row)">
                          <i class="ri-edit-box-line me-2"></i> Edit
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item text-danger" href="javascript:void(0)" @click="confirmDelete(row)">
                          <i class="ri-delete-bin-7-line me-2"></i> Nonaktifkan
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        id="WidgetFormModal"
        :title="isEditMode ? 'Edit Widget' : 'Tambah Widget'"
        description="componentKey harus terdaftar di useWidgetRegistry.ts (frontend) supaya widget bisa dirender."
        dialog-class="modal-lg"
        :validation-errors-from-parent="validationErrors"
      >
        <template #default>
          <form @submit.prevent="submitForm">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.code" :disabled="isEditMode" placeholder="mis. system_stats" />
                  <label>Code (unik, lowercase)</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.title" placeholder="Nama widget" />
                  <label>Judul Widget</label>
                </div>
              </div>
              <div class="col-md-12">
                <div class="form-floating form-floating-outline">
                  <textarea class="form-control" style="height: 70px;" v-model="form.description" placeholder="Deskripsi"></textarea>
                  <label>Deskripsi</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.componentKey" placeholder="mis. system_stats" />
                  <label>Component Key</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <select class="form-select" v-model="form.widgetType">
                    <option value="data">data</option>
                    <option value="chart">chart</option>
                    <option value="list">list</option>
                    <option value="ai">ai</option>
                    <option value="iframe">iframe</option>
                    <option value="custom">custom</option>
                  </select>
                  <label>Tipe Widget</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.icon" placeholder="mis. ri-bar-chart-line" />
                  <label>Icon</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.category" placeholder="mis. Sistem" />
                  <label>Kategori</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="number" class="form-control" v-model.number="form.defaultWidth" min="1" />
                  <label>Default Width (kolom)</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="number" class="form-control" v-model.number="form.defaultHeight" min="1" />
                  <label>Default Height (baris)</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="number" class="form-control" v-model.number="form.minWidth" min="1" />
                  <label>Min Width</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="number" class="form-control" v-model.number="form.minHeight" min="1" />
                  <label>Min Height</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="number" class="form-control" v-model.number="form.maxWidth" min="1" />
                  <label>Max Width</label>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-floating form-floating-outline">
                  <input type="number" class="form-control" v-model.number="form.maxHeight" min="1" />
                  <label>Max Height</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="number" class="form-control" v-model.number="form.refreshIntervalSeconds" min="5" />
                  <label>Refresh Interval (detik, opsional)</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-check form-switch mt-3">
                  <input type="checkbox" class="form-check-input" id="widget-is-active" v-model="form.isActive" />
                  <label class="form-check-label" for="widget-is-active">Aktif</label>
                </div>
              </div>

              <!-- Fase 3: config schema builder — dipakai Admin Layout Builder untuk
                   merender form "Konfigurasi Widget" dinamis per instance. -->
              <div class="col-12">
                <hr />
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label mb-0 fw-semibold">Config Schema (opsional)</label>
                  <button type="button" class="btn btn-sm btn-outline-primary" @click="addConfigField">
                    <i class="ri-add-line me-1"></i> Tambah Field
                  </button>
                </div>
                <p class="text-muted small">
                  Field di sini akan muncul sebagai form "Konfigurasi Widget" saat admin memasang widget ini di Layout Builder.
                </p>

                <div v-if="form.configSchema.length === 0" class="text-muted small mb-2">
                  Belum ada field kustom.
                </div>

                <div v-for="(field, index) in form.configSchema" :key="index" class="row g-2 mb-2 align-items-center">
                  <div class="col-3">
                    <input type="text" class="form-control form-control-sm" v-model="field.key" placeholder="key" />
                  </div>
                  <div class="col-3">
                    <input type="text" class="form-control form-control-sm" v-model="field.label" placeholder="Label" />
                  </div>
                  <div class="col-2">
                    <select class="form-select form-select-sm" v-model="field.type">
                      <option value="text">text</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="textarea">textarea</option>
                    </select>
                  </div>
                  <div class="col-3">
                    <input type="text" class="form-control form-control-sm" v-model="field.helpText" placeholder="Help text (opsional)" />
                  </div>
                  <div class="col-1 text-end">
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeConfigField(index)">
                      <i class="ri-close-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                Simpan
              </button>
            </div>
          </form>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Modal from '~/components/modal/Modal.vue'
import { useDashboardWidgetAdmin } from '~/composables/useDashboardAdmin'
import type { AdminWidgetRow } from '~/composables/useDashboardAdmin'
import type { DashboardWidgetConfigField } from '~/composables/useDashboardEngine'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Katalog Widget',
  description: 'Admin Katalog Widget Dashboard',
})

const { widgets, loading, fetchWidgets, createWidget, updateWidget, deleteWidget } = useDashboardWidgetAdmin()

const search = ref('')
const filteredWidgets = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return widgets.value
  return widgets.value.filter(
    (w) => w.title.toLowerCase().includes(term) || w.code.toLowerCase().includes(term)
  )
})

const isEditMode = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const validationErrors = ref<string[]>([])

function emptyForm() {
  return {
    code: '',
    title: '',
    description: '',
    componentKey: '',
    icon: '',
    category: '',
    widgetType: 'data',
    defaultWidth: 4,
    defaultHeight: 4,
    minWidth: null as number | null,
    minHeight: null as number | null,
    maxWidth: null as number | null,
    maxHeight: null as number | null,
    refreshIntervalSeconds: null as number | null,
    isActive: true,
    configSchema: [] as DashboardWidgetConfigField[],
  }
}

const form = ref(emptyForm())
let modalInstance: any = null

function getModal() {
  if (!modalInstance && typeof window !== 'undefined' && (window as any).bootstrap) {
    const el = document.getElementById('WidgetFormModal')
    if (el) modalInstance = new (window as any).bootstrap.Modal(el)
  }
  return modalInstance
}

function addConfigField() {
  form.value.configSchema.push({ key: '', label: '', type: 'text', helpText: '' })
}

function removeConfigField(index: number) {
  form.value.configSchema.splice(index, 1)
}

function openCreateModal() {
  isEditMode.value = false
  editingId.value = null
  form.value = emptyForm()
  validationErrors.value = []
  getModal()?.show()
}

function openEditModal(row: AdminWidgetRow) {
  isEditMode.value = true
  editingId.value = row.id
  form.value = {
    code: row.code,
    title: row.title,
    description: row.description || '',
    componentKey: row.componentKey,
    icon: row.icon || '',
    category: row.category || '',
    widgetType: row.widgetType,
    defaultWidth: row.defaultWidth,
    defaultHeight: row.defaultHeight,
    minWidth: row.minWidth,
    minHeight: row.minHeight,
    maxWidth: row.maxWidth,
    maxHeight: row.maxHeight,
    refreshIntervalSeconds: row.refreshIntervalSeconds,
    isActive: row.isActive,
    configSchema: row.configSchema ? JSON.parse(JSON.stringify(row.configSchema)) : [],
  }
  validationErrors.value = []
  getModal()?.show()
}

async function submitForm() {
  submitting.value = true
  validationErrors.value = []
  try {
    const cleanConfigSchema = form.value.configSchema.filter((f) => f.key.trim() && f.label.trim())
    const payload = { ...form.value, configSchema: cleanConfigSchema.length ? cleanConfigSchema : null }

    if (isEditMode.value && editingId.value) {
      const { code, ...rest } = payload
      await updateWidget(editingId.value, rest)
    } else {
      await createWidget(payload)
    }
    getModal()?.hide()
    await fetchWidgets()

    const toast = useToast()
    toast.success({ title: 'Berhasil', message: 'Widget berhasil disimpan', color: 'green' })
  } catch (err: any) {
    const messages = err?.data?.messages || err?.data?.errors
    if (Array.isArray(messages)) {
      validationErrors.value = messages
    } else {
      validationErrors.value = [err?.data?.message || err?.message || 'Gagal menyimpan widget']
    }
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(row: AdminWidgetRow) {
  if (!window.confirm(`Nonaktifkan widget "${row.title}"?`)) return

  try {
    await deleteWidget(row.id)
    await fetchWidgets()
    const toast = useToast()
    toast.success({ title: 'Berhasil', message: 'Widget berhasil dinonaktifkan', color: 'green' })
  } catch (err: any) {
    const toast = useToast()
    toast.error({ title: 'Gagal', message: err?.data?.message || 'Gagal menonaktifkan widget', color: 'red' })
  }
}

onMounted(fetchWidgets)
</script>
