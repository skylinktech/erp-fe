<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-1">Profile Account</h4>
          <PageBreadcrumb class="mt-1" current-label="Profile Account" />
          <p class="mb-0 text-muted small">
            Informasi akun login Anda{{ data?.pegawai_linked ? ' beserta data pegawai yang terhubung.' : '.' }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat profil akun…</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
        <i class="ri-error-warning-line me-2"></i>
        <div>
          <div class="fw-medium">Gagal memuat profil akun</div>
          <div class="small">{{ error }}</div>
        </div>
      </div>

      <template v-else-if="data">
        <!-- Account info -->
        <div class="card mb-4">
          <div class="card-header d-flex align-items-center gap-2 pt-4">
            <i class="ri-shield-user-line"></i>
            <h6 class="mb-0">Informasi Akun</h6>
            <span
              class="badge rounded-pill ms-auto"
              :class="data.account.is_active ? 'bg-label-success' : 'bg-label-secondary'"
            >
              {{ data.account.is_active ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">Username</div>
                <div class="fw-medium">{{ data.account.username || '-' }}</div>
              </div>
              <div class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">Nama Lengkap</div>
                <div class="fw-medium">{{ data.account.full_name || '-' }}</div>
              </div>
              <div class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">Email</div>
                <div class="fw-medium">{{ data.account.email || '-' }}</div>
              </div>
              <div class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">Role</div>
                <div class="d-flex flex-wrap gap-1">
                  <span
                    v-for="role in data.account.roles"
                    :key="role.id"
                    class="badge rounded-pill bg-label-primary"
                  >
                    {{ role.name }}
                  </span>
                  <span v-if="!data.account.roles?.length" class="text-muted">-</span>
                </div>
              </div>
              <div class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">Terhubung Pegawai</div>
                <div>
                  <span
                    class="badge rounded-pill"
                    :class="data.pegawai_linked ? 'bg-label-success' : 'bg-label-warning'"
                  >
                    {{ data.pegawai_linked ? 'Ya' : 'Belum terhubung' }}
                  </span>
                </div>
              </div>
              <div v-if="data.account.sso_user_id" class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">SSO User ID</div>
                <div class="fw-medium">{{ data.account.sso_user_id }}</div>
              </div>
              <div class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">Dibuat</div>
                <div class="fw-medium">{{ formatTanggalDisplay(data.account.created_at) }}</div>
              </div>
              <div class="col-md-6 col-lg-3">
                <div class="text-muted small mb-1">Diperbarui</div>
                <div class="fw-medium">{{ formatTanggalDisplay(data.account.updated_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pegawai profile (same layout as Profil Pegawai) -->
        <template v-if="data.profile">
          <div class="d-flex align-items-center gap-2 mb-3">
            <i class="ri-user-star-line text-primary"></i>
            <h5 class="mb-0">Data Pegawai Terhubung</h5>
            <NuxtLink
              v-if="canOpenHrdProfile && data.profile.pegawai?.id_pegawai"
              :to="`/hrd/pegawai/profile/${data.profile.pegawai.id_pegawai}`"
              class="btn btn-sm btn-outline-primary ms-auto"
            >
              <i class="ri-external-link-line me-1"></i> Buka di HRD
            </NuxtLink>
          </div>
          <PegawaiProfilePanel
            :profile="data.profile"
            :pegawai-id="data.profile.pegawai.id_pegawai"
            tab-id-prefix="account-profile"
          />
        </template>

        <div v-else class="alert alert-warning d-flex align-items-start" role="alert">
          <i class="ri-information-line me-2 mt-1"></i>
          <div>
            <div class="fw-medium">Akun belum terhubung dengan data pegawai</div>
            <div class="small mb-0">
              Hubungi HRD untuk menghubungkan akun ini ke profil pegawai agar data pribadi, perusahaan, kontrak, dan riwayat jabatan tampil di sini.
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useNuxtApp } from '#app'
import { apiFetch } from '~/utils/apiFetch'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { formatTanggalDisplay } from '~/constants/hrd/pegawaiForm'
import type { AccountProfileResponse } from '~/types/hrd/pegawaiProfile'
import PegawaiProfilePanel from '~/components/hrd/PegawaiProfilePanel.vue'

const { $api } = useNuxtApp()
const { userHasPermission, userHasRole } = usePermissions()
const { setDetailTitle } = useDynamicTitle()

const data = ref<AccountProfileResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const canOpenHrdProfile = computed(
  () => userHasRole('superadmin') || userHasPermission('view_pegawai')
)

async function loadAccountProfile() {
  loading.value = true
  error.value = null
  try {
    const res = await apiFetch<AccountProfileResponse>($api.meProfile(), {
      credentials: 'include',
    })
    data.value = res
    setDetailTitle(
      'Profile Account',
      res.account.full_name || res.account.username || 'My Profile'
    )
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Gagal memuat profil akun'
    data.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadAccountProfile)

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth'],
  title: 'Profile Account',
  description: 'Profil akun login dan data pegawai terhubung',
})
</script>
