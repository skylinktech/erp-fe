<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <NuxtLink to="/hrd/pegawai" class="text-muted small text-decoration-none">Pegawai</NuxtLink>
            <span class="text-muted small">/</span>
            <span class="text-muted small">Profil</span>
          </div>
          <h4 class="mb-1">Profil Pegawai</h4>
          <p class="mb-0 text-muted small">Ringkasan lengkap data pegawai: pribadi, keluarga, perusahaan, kontrak &amp; riwayat jabatan.</p>
        </div>
        <div class="d-flex gap-2">
          <NuxtLink to="/hrd/pegawai" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i> Kembali
          </NuxtLink>
          <NuxtLink
            v-if="pegawaiIdNum && (userHasRole('superadmin') || userHasPermission('edit_pegawai'))"
            :to="`/hrd/pegawai/form/${pegawaiIdNum}`"
            class="btn btn-primary btn-sm"
          >
            <i class="ri-edit-box-line me-1"></i> Edit
          </NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat profil pegawai…</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
        <i class="ri-error-warning-line me-2"></i>
        <div>
          <div class="fw-medium">Gagal memuat profil pegawai</div>
          <div class="small">{{ error }}</div>
        </div>
      </div>

      <PegawaiProfilePanel
        v-else-if="profile"
        :profile="profile"
        :pegawai-id="pegawaiIdNum"
        tab-id-prefix="hrd-pegawai-profile"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useNuxtApp, useRoute } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import type { PegawaiProfileResponse } from '~/types/hrd/pegawaiProfile'
import PegawaiProfilePanel from '~/components/hrd/PegawaiProfilePanel.vue'

const route = useRoute()
const { $api } = useNuxtApp()
const { userHasPermission, userHasRole } = usePermissions()
const { setDetailTitle } = useDynamicTitle()

const profile = ref<PegawaiProfileResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const pegawaiIdNum = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
})

async function loadProfile() {
  if (!pegawaiIdNum.value) {
    error.value = 'ID pegawai tidak valid'
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  try {
    const data = await apiFetch<PegawaiProfileResponse>($api.pegawaiProfile(pegawaiIdNum.value), {
      credentials: 'include',
    })
    profile.value = data
    setDetailTitle('Profil Pegawai', data?.pegawai?.nm_pegawai || `#${pegawaiIdNum.value}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal memuat profil pegawai'
    profile.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Profil Pegawai',
  description: 'Detail profil pegawai termasuk kontrak dan riwayat jabatan',
})
</script>
