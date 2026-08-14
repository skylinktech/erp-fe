<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 dashboard-page">
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="error && !layout" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>{{ error }}
          <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="init">Coba Lagi</button>
        </div>

        <template v-else>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div class="d-flex align-items-center gap-3">
              <NuxtLink to="/dashboard" class="btn btn-icon btn-outline-secondary btn-sm" title="Kembali ke Main">
                <i class="ri-arrow-left-line"></i>
              </NuxtLink>
              <span class="avatar">
                <span class="avatar-initial bg-label-primary rounded-3">
                  <i class="ri-settings-3-line ri-24px"></i>
                </span>
              </span>
              <div>
                <h4 class="mb-0 fw-semibold">Dashboard Settings</h4>
                <PageBreadcrumb class="mt-1" current-label="Dashboard Settings" />
                <small class="text-muted">
                  Susun widget dashboard utama — setelah disimpan, hasilnya tampil di Dashboard → Main.
                </small>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <small v-if="saving" class="text-muted">
                <span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...
              </small>
              <small v-else-if="hasUnsavedChanges" class="text-warning">
                <i class="ri-error-warning-line me-1"></i>Ada perubahan belum disimpan
              </small>
              <NuxtLink to="/dashboard" class="btn btn-outline-secondary btn-sm">
                Lihat Main
              </NuxtLink>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                :disabled="saving || !hasUnsavedChanges"
                @click="onSave"
              >
                <i class="ri-save-line me-1"></i> Simpan
              </button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

          <div class="row g-3">
            <div class="col-lg-3">
              <div class="card">
                <div class="card-header">
                  <input
                    v-model="widgetSearch"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Cari widget..."
                  />
                </div>
                <div class="card-body p-2" style="max-height: 70vh; overflow-y: auto;">
                  <div v-if="loadingCatalog" class="text-center text-muted py-3">
                    <span class="spinner-border spinner-border-sm"></span>
                  </div>
                  <div v-else-if="filteredCatalog.length === 0" class="text-center text-muted small py-3">
                    Tidak ada widget yang bisa ditambahkan.
                  </div>
                  <button
                    v-for="widget in filteredCatalog"
                    :key="widget.id"
                    type="button"
                    class="widget-catalog-item"
                    @click="addWidget(widget)"
                  >
                    <i :class="[widget.icon || 'ri-puzzle-line']"></i>
                    <div class="flex-grow-1">
                      <div class="fw-semibold small">{{ widget.title }}</div>
                      <small class="text-muted">
                        {{ widget.defaultWidth }}x{{ widget.defaultHeight }} &middot; {{ widget.widgetType }}
                      </small>
                    </div>
                    <i class="ri-add-circle-line text-primary"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="col-lg-9">
              <div class="alert alert-primary d-flex align-items-center gap-2 py-2 mb-3">
                <i class="ri-information-line"></i>
                <small>
                  Klik widget di sisi kiri untuk menambah. Geser lewat ikon <i class="ri-drag-move-2-line"></i>,
                  tarik sudut untuk mengubah ukuran, atau <i class="ri-delete-bin-line"></i> untuk menghapus.
                  Setelah "Simpan", layout ini tampil di Dashboard → Main.
                </small>
              </div>

              <DashboardGrid
                v-if="layout"
                :layout="layout"
                editable
                builder-mode
                :allow-widget-configure="false"
                :dashboard-code="dashboard?.code"
                @layout-change="applyPositionChanges"
                @widget-remove="removeWidget"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DashboardGrid from '~/components/dashboard-engine/DashboardGrid.vue'
import { usePersonalDashboard } from '~/composables/usePersonalDashboard'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  title: 'Dashboard Settings',
  hidePageHeading: true,
})

const { setTitle } = useDynamicTitle()

const {
  dashboard,
  layout,
  catalog,
  loading,
  loadingCatalog,
  saving,
  error,
  hasUnsavedChanges,
  load,
  loadCatalog,
  addWidget,
  removeWidget,
  applyPositionChanges,
  save,
} = usePersonalDashboard()

const widgetSearch = ref('')

const filteredCatalog = computed(() => {
  const term = widgetSearch.value.trim().toLowerCase()
  if (!term) return catalog.value
  return catalog.value.filter(
    (w) => w.title.toLowerCase().includes(term) || w.code.toLowerCase().includes(term)
  )
})

async function init() {
  await Promise.all([load(), loadCatalog()])
  setTitle('Dashboard Settings')
}

async function onSave() {
  const toast = useToast()
  try {
    await save()
    toast.success({
      title: 'Berhasil',
      message: 'Dashboard Settings berhasil disimpan. Layout sudah tampil di Main.',
      color: 'green',
    })
  } catch {
    toast.error({ title: 'Gagal', message: error.value || 'Gagal menyimpan dashboard', color: 'red' })
  }
}

onMounted(init)
</script>

<style scoped>
.widget-catalog-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0.25rem;
}

.widget-catalog-item:hover {
  background: var(--bs-primary-bg-subtle, rgba(0, 143, 236, 0.08));
  border-color: var(--bs-primary, #008fec);
}

.dashboard-page {
  overflow-x: clip;
}
</style>
