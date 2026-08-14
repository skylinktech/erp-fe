<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          
          <p class="mb-0 text-muted">Kelola dashboard, layout, dan katalog widget yang tersedia di aplikasi.</p>
        </div>
        <div class="d-flex gap-2">
          <NuxtLink to="/admin/dashboards/analytics" class="btn btn-outline-secondary">
            <i class="ri-bar-chart-2-line me-1"></i> Analytics
          </NuxtLink>
          <NuxtLink to="/admin/dashboards/widgets" class="btn btn-outline-secondary">
            <i class="ri-puzzle-line me-1"></i> Katalog Widget
          </NuxtLink>
          <button type="button" class="btn btn-primary" @click="openCreateModal">
            <i class="ri-add-line me-1"></i> Tambah Dashboard
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span class="fw-semibold">Daftar Dashboard</span>
          <input
            v-model="search"
            type="text"
            class="form-control"
            style="max-width: 280px;"
            placeholder="Cari dashboard..."
          />
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Code</th>
                <th>Kategori</th>
                <th>Layout Aktif</th>
                <th>Status</th>
                <th>Urutan</th>
                <th style="min-width: 6rem;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-4 text-muted">
                  <span class="spinner-border spinner-border-sm me-2"></span> Memuat data...
                </td>
              </tr>
              <tr v-else-if="filteredDashboards.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">Belum ada dashboard.</td>
              </tr>
              <tr v-for="row in filteredDashboards" :key="row.id">
                <td>{{ row.id }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i v-if="row.icon" :class="[row.icon, 'text-primary']"></i>
                    <div>
                      <div class="fw-semibold">{{ row.name }}</div>
                      <small v-if="row.description" class="text-muted">{{ row.description }}</small>
                    </div>
                  </div>
                </td>
                <td><code>{{ row.code }}</code></td>
                <td>{{ row.category || '-' }}</td>
                <td>
                  <span v-if="row.defaultLayoutId" class="badge bg-label-success">Ada</span>
                  <span v-else class="badge bg-label-warning">Belum ada</span>
                </td>
                <td>
                  <span class="badge" :class="row.isActive ? 'bg-label-success' : 'bg-label-secondary'">
                    {{ row.isActive ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td>{{ row.sortOrder }}</td>
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
                        <NuxtLink :to="`/admin/dashboards/${row.id}/layout-builder`" class="dropdown-item">
                          <i class="ri-layout-grid-line me-2"></i> Kelola Layout
                        </NuxtLink>
                      </li>
                      <li>
                        <NuxtLink :to="`/admin/dashboards/${row.id}/analytics`" class="dropdown-item">
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
                          <i class="ri-delete-bin-7-line me-2"></i> Hapus
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
        id="DashboardFormModal"
        :model-value="isModalOpen"
        @close="closeFormModal"
        :title="isEditMode ? 'Edit Dashboard' : 'Tambah Dashboard'"
        description="Dashboard adalah identitas stabil lintas versi layout — layout & permission menempel di sini."
        :validation-errors-from-parent="validationErrors"
      >
        <template #default>
          <form @submit.prevent="submitForm">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.code"
                    :disabled="isEditMode"
                    placeholder="mis. operasional"
                  />
                  <label>Code (unik, lowercase)</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.name" placeholder="Nama dashboard" />
                  <label>Nama Dashboard</label>
                </div>
              </div>
              <div class="col-md-12">
                <div class="form-floating form-floating-outline">
                  <textarea class="form-control" style="height: 90px;" v-model="form.description" placeholder="Deskripsi"></textarea>
                  <label>Deskripsi</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.icon" placeholder="mis. ri-dashboard-line" />
                  <label>Icon (Remix Icon class)</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control" v-model="form.category" placeholder="mis. Operasional" />
                  <label>Kategori</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-floating form-floating-outline">
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="form.sortOrder"
                    placeholder="0"
                  />
                  <label>Urutan</label>
                </div>
              </div>
              <div class="col-md-12">
                <div class="form-check form-switch">
                  <input type="checkbox" class="form-check-input" id="dashboard-is-active" v-model="form.isActive" />
                  <label class="form-check-label" for="dashboard-is-active">Aktif</label>
                </div>
              </div>
            </div>
            <div class="modal-footer mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeFormModal">Tutup</button>
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
import { useDashboardAdmin } from '~/composables/useDashboardAdmin'
import type { AdminDashboardRow } from '~/composables/useDashboardAdmin'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Dashboard Framework',
  description: 'Admin Dashboard Framework',
})

const { dashboards, loading, fetchDashboards, createDashboard, updateDashboard, deleteDashboard } =
  useDashboardAdmin()

const search = ref('')
const filteredDashboards = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return dashboards.value
  return dashboards.value.filter(
    (d) => d.name.toLowerCase().includes(term) || d.code.toLowerCase().includes(term)
  )
})

const isEditMode = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const validationErrors = ref<string[]>([])

function emptyForm() {
  return {
    code: '',
    name: '',
    description: '',
    icon: '',
    category: '',
    isActive: true,
    sortOrder: 0,
  }
}

const form = ref(emptyForm())
const isModalOpen = ref(false)

function closeFormModal() {
  isModalOpen.value = false
}

function openCreateModal() {
  isEditMode.value = false
  editingId.value = null
  form.value = emptyForm()
  validationErrors.value = []
  isModalOpen.value = true
}

function openEditModal(row: AdminDashboardRow) {
  isEditMode.value = true
  editingId.value = row.id
  form.value = {
    code: row.code,
    name: row.name,
    description: row.description || '',
    icon: row.icon || '',
    category: row.category || '',
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  }
  validationErrors.value = []
  isModalOpen.value = true
}

async function submitForm() {
  submitting.value = true
  validationErrors.value = []
  try {
    if (isEditMode.value && editingId.value) {
      const { code, ...payload } = form.value
      await updateDashboard(editingId.value, payload)
    } else {
      await createDashboard(form.value)
    }
    closeFormModal()
    await fetchDashboards()

    const toast = useToast()
    toast.success({ title: 'Berhasil', message: 'Dashboard berhasil disimpan', color: 'green' })
  } catch (err: any) {
    const messages = err?.data?.messages || err?.data?.errors
    if (Array.isArray(messages)) {
      validationErrors.value = messages
    } else {
      validationErrors.value = [err?.data?.message || err?.message || 'Gagal menyimpan dashboard']
    }
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(row: AdminDashboardRow) {
  if (!window.confirm(`Hapus dashboard "${row.name}"? Dashboard akan dinonaktifkan (soft delete).`)) return

  try {
    await deleteDashboard(row.id)
    await fetchDashboards()
    const toast = useToast()
    toast.success({ title: 'Berhasil', message: 'Dashboard berhasil dihapus', color: 'green' })
  } catch (err: any) {
    const toast = useToast()
    toast.error({ title: 'Gagal', message: err?.data?.message || 'Gagal menghapus dashboard', color: 'red' })
  }
}

onMounted(fetchDashboards)
</script>
