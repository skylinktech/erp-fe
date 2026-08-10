<template>
  <div class="card h-100 birthday-today-card">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h5 class="mb-1">Birthday Today</h5>
          <p class="mb-0 card-subtitle text-muted">
            <span v-if="store.loading">Memuat...</span>
            <span v-else>
              {{ store.data?.total ?? 0 }} pegawai berulang tahun hari ini
            </span>
          </p>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          :disabled="store.loading"
          title="Refresh"
          @click="refresh"
        >
          <i class="ri-refresh-line"></i>
        </button>
      </div>
    </div>

    <div class="card-body">
      <div v-if="store.loading && !store.data" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="store.error && !store.data" class="text-center py-4">
        <p class="text-danger small mb-2">{{ store.error }}</p>
        <button type="button" class="btn btn-sm btn-primary" @click="refresh">Coba Lagi</button>
      </div>

      <div v-else-if="store.isEmpty" class="text-center py-4">
        <i class="ri-cake-2-line ri-32px text-muted mb-2 d-block"></i>
        <p class="text-muted mb-0 small">Tidak ada pegawai yang berulang tahun hari ini</p>
      </div>

      <div v-else class="birthday-list">
        <button
          v-for="item in store.items"
          :key="item.idPegawai"
          type="button"
          class="birthday-item w-100 text-start"
          @click="openProfile(item)"
        >
          <div class="d-flex align-items-center gap-3">
            <div class="avatar avatar-md flex-shrink-0">
              <img
                :src="getUserAvatar(item.avatar)"
                :alt="item.nmPegawai"
                class="rounded-circle"
                @error="(e) => handleImageError(e, '/img/default-avatar.png')"
              >
            </div>

            <div class="flex-grow-1 min-w-0">
              <p class="mb-0 fw-semibold text-truncate birthday-name">{{ item.nmPegawai }}</p>
              <p class="mb-0 small text-muted text-truncate">
                {{ orgLabel(item) }}
              </p>
              <small class="text-muted">
                {{ formatBirthDate(item.tglLahir) }}
                <template v-if="item.age != null"> · {{ item.age }} th</template>
              </small>
            </div>

            <span class="avatar avatar-xs flex-shrink-0" title="Ulang tahun">
              <span class="avatar-initial rounded-circle bg-label-warning">
                <i class="ri-cake-2-line"></i>
              </span>
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useDashboardBirthdayTodayStore,
  type BirthdayTodayItem,
} from '~/stores/dashboard-birthday-today'
import { useImageUrl } from '~/composables/useImageUrl'

const store = useDashboardBirthdayTodayStore()
const router = useRouter()
const { getUserAvatar, handleImageError } = useImageUrl()
let refreshTimer: ReturnType<typeof setInterval> | null = null

const orgLabel = (item: BirthdayTodayItem) => {
  const parts = [item.departemen?.nama, item.divisi?.nama].filter(Boolean)
  return parts.length ? parts.join(' · ') : '—'
}

const formatBirthDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const refresh = async () => {
  await store.fetchBirthdays()
}

const openProfile = async (item: BirthdayTodayItem) => {
  await router.push(`/hrd/pegawai/profile/${item.idPegawai}`)
}

onMounted(async () => {
  await refresh()
  refreshTimer = setInterval(() => {
    void refresh()
  }, 300_000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.birthday-today-card {
  min-width: 0;
  overflow: hidden;
}

.birthday-today-card .card-header,
.birthday-today-card .card-body {
  min-width: 0;
}

.birthday-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 22rem;
  overflow-y: auto;
}

.birthday-item {
  border: 1px solid rgba(67, 89, 113, 0.12);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.birthday-item:hover {
  background-color: rgba(255, 171, 0, 0.06);
  border-color: rgba(255, 171, 0, 0.28);
}

.birthday-name {
  color: #566a7f;
  line-height: 1.35;
}

.birthday-item .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
