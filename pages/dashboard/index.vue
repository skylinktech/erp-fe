<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container-pt-12 dashboard-page">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h4 class="mb-0 fw-semibold">Dashboard</h4>
            <small class="text-muted">Ringkasan yang Anda susun di Settings.</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="load">
              <i class="ri-refresh-line me-1"></i> Refresh
            </button>
            <NuxtLink to="/dashboard/settings" class="btn btn-outline-primary btn-sm">
              <i class="ri-settings-3-line me-1"></i> Settings
            </NuxtLink>
          </div>
        </div>

        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 320px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted mb-0">Memuat dashboard...</p>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>{{ error }}
          <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="load">Coba Lagi</button>
        </div>

        <template v-else>
          <div v-if="!layout || !hasWidgets" class="card">
            <div class="card-body text-center py-5">
              <i class="ri-layout-grid-line ri-48px text-muted mb-3 d-block"></i>
              <h5 class="mb-2">Dashboard masih kosong</h5>
              <p class="text-muted mb-4">
                Tambahkan dan atur widget di Dashboard Settings, lalu simpan agar tampil di sini.
              </p>
              <NuxtLink to="/dashboard/settings" class="btn btn-primary">
                <i class="ri-settings-3-line me-1"></i> Buka Settings
              </NuxtLink>
            </div>
          </div>

          <DashboardGrid
            v-else
            :layout="layout"
            :dashboard-code="dashboard?.code"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import DashboardGrid from '~/components/dashboard-engine/DashboardGrid.vue'
import { usePersonalDashboard } from '~/composables/usePersonalDashboard'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  title: 'Dashboard',
})

const { setTitle } = useDynamicTitle()
const { dashboard, layout, loading, error, hasWidgets, load } = usePersonalDashboard()

onMounted(async () => {
  await load()
  setTitle('Dashboard')
})
</script>

<style scoped>
/* Cegah scroll horizontal dari kompensasi margin grid, tanpa memotong card vertikal. */
.dashboard-page {
  overflow-x: clip;
}
</style>
