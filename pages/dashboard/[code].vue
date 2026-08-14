<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1">
        <!-- Loading -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat dashboard...</p>
          </div>
        </div>

        <!-- Not found -->
        <div v-else-if="notFound" class="alert alert-warning">
          <i class="ri-error-warning-line me-2"></i>
          Dashboard "<code>{{ code }}</code>" tidak ditemukan.
          <NuxtLink to="/dashboard" class="alert-link ms-2">Kembali ke Dashboard Utama</NuxtLink>
        </div>

        <!-- Forbidden -->
        <div v-else-if="forbidden" class="alert alert-danger">
          <i class="ri-lock-line me-2"></i>
          Anda tidak memiliki akses ke dashboard ini.
          <NuxtLink to="/dashboard" class="alert-link ms-2">Kembali ke Dashboard Utama</NuxtLink>
        </div>

        <!-- Fatal error (network / server) -->
        <div v-else-if="error" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error }}
          <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="load">Coba Lagi</button>
        </div>

        <!-- Content -->
        <template v-else-if="dashboard">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex align-items-center gap-3">
              <span v-if="dashboard.icon" class="avatar">
                <span class="avatar-initial bg-label-primary rounded-3">
                  <i :class="[dashboard.icon, 'ri-24px']"></i>
                </span>
              </span>
              <div>
                <h4 class="mb-0 fw-semibold">{{ dashboard.name }}</h4>
                <PageBreadcrumb class="mt-1" :current-label="dashboard.name" />
                <small v-if="dashboard.description" class="text-muted">{{ dashboard.description }}</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <small v-if="savingPreferences" class="text-muted">
                <span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...
              </small>
              <button
                v-if="activeLayout"
                type="button"
                class="btn btn-sm"
                :class="editMode ? 'btn-primary' : 'btn-outline-primary'"
                @click="editMode = !editMode"
              >
                <i :class="editMode ? 'ri-check-line' : 'ri-drag-move-2-line'" class="me-1"></i>
                {{ editMode ? 'Selesai Mengatur' : 'Atur Ulang Layout' }}
              </button>
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="load">
                <i class="ri-refresh-line me-1"></i> Refresh
              </button>
            </div>
          </div>

          <div v-if="editMode" class="alert alert-primary d-flex align-items-center gap-2 py-2">
            <i class="ri-information-line"></i>
            <small>Geser widget lewat ikon <i class="ri-drag-move-2-line"></i> di pojok kanan atas, atau tarik sudut kanan-bawah untuk mengubah ukuran. Perubahan tersimpan otomatis.</small>
          </div>

          <!-- Layout aktif belum tersedia (misal belum ada versi published) -->
          <div v-if="!activeLayout" class="alert alert-info">
            <i class="ri-information-line me-2"></i>
            Dashboard ini belum memiliki layout yang dipublikasikan.
          </div>

          <DashboardGrid
            v-else
            :layout="activeLayout"
            :editable="editMode"
            :dashboard-code="code"
            @layout-change="onLayoutChange"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDashboardEngine } from '~/composables/useDashboardEngine'
import type { LayoutPreferenceItem } from '~/composables/useDashboardEngine'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import DashboardGrid from '~/components/dashboard-engine/DashboardGrid.vue'
import type { LayoutChangeItem } from '~/components/dashboard-engine/DashboardGrid.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  title: 'Dashboard',
  hidePageHeading: true,
})

const route = useRoute()
const { setTitle } = useDynamicTitle()
const {
  dashboard,
  activeLayout,
  loading,
  error,
  notFound,
  forbidden,
  loadByCode,
  savingPreferences,
  savePreferencesError,
  savePreferences,
} = useDashboardEngine()

const code = computed(() => String(route.params.code))
const editMode = ref(false)

async function load() {
  await loadByCode(code.value)
  if (dashboard.value) {
    setTitle(dashboard.value.name)
  }
}

async function onLayoutChange(items: LayoutChangeItem[]) {
  const payload: LayoutPreferenceItem[] = items
  await savePreferences(code.value, payload)

  const toast = useToast()
  if (savePreferencesError.value) {
    toast.error({ title: 'Gagal Menyimpan', message: savePreferencesError.value, color: 'red' })
  }
}

onMounted(load)

// Dukung navigasi antar-dashboard (mis. dari sidebar) tanpa full page reload.
watch(code, () => {
  editMode.value = false
  load()
})
</script>
