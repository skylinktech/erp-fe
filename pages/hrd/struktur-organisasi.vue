<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h4 class="mb-1">Struktur Organisasi</h4>
          <p class="mb-0 text-muted">
            Hierarki pegawai berdasarkan level jabatan (Level 1 = tertinggi, Level 5 = terendah).
          </p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="loading"
            @click="onCetak"
          >
            <i class="ri-printer-line me-1"></i>
            Cetak
          </button>
          <NuxtLink
            v-if="canManageJabatan"
            to="/hrd/jabatan"
            class="btn btn-outline-primary btn-sm"
          >
            <i class="ri-briefcase-line me-1"></i>
            Kelola Jabatan & Level
          </NuxtLink>
        </div>
      </div>

      <CollapsibleFilterCard
        title="Filter Struktur Organisasi"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      >
        <FilterFieldsRow>
          <FilterField>
            <label class="form-label">Cari Pegawai</label>
            <input
              v-model="searchInput"
              type="search"
              class="form-control"
              placeholder="Nama atau NIK..."
            />
          </FilterField>
          <FilterField>
            <label class="form-label">Divisi</label>
            <select v-model.number="filters.divisi_id" class="form-select" @change="reload">
              <option :value="null">Semua divisi</option>
              <option v-for="d in divisiOptions" :key="d.id" :value="d.id">{{ d.label }}</option>
            </select>
          </FilterField>
          <FilterField>
            <label class="form-label">Departemen</label>
            <select v-model.number="filters.departemen_id" class="form-select" @change="reload">
              <option :value="null">Semua departemen</option>
              <option v-for="d in departemenOptions" :key="d.id" :value="d.id">{{ d.label }}</option>
            </select>
          </FilterField>
        </FilterFieldsRow>
      </CollapsibleFilterCard>

      <div v-if="meta" class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <p class="mb-1 text-muted small">Total Pegawai Aktif</p>
              <h4 class="mb-0">{{ meta.total_pegawai }}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <p class="mb-1 text-muted small">Total Jabatan</p>
              <h4 class="mb-0">{{ meta.total_jabatan }}</h4>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body">
              <p class="mb-1 text-muted small">Level Hierarki</p>
              <h4 class="mb-0">{{ meta.level_min }} – {{ meta.level_max }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat...</span>
        </div>
        <p class="text-muted mt-3 mb-0">Memuat struktur organisasi...</p>
      </div>

      <div v-else class="org-structure">
        <div
          v-for="levelBlock in levels"
          :key="levelBlock.level"
          class="org-level-block mb-4"
        >
          <div class="org-level-header d-flex align-items-center gap-2 mb-3">
            <span :class="['badge rounded-pill px-3 py-2', getJabatanLevelBadgeClass(levelBlock.level)]">
              Level {{ levelBlock.level }}
            </span>
            <div>
              <h6 class="mb-0">{{ ORG_LEVEL_DESCRIPTIONS[levelBlock.level] || levelBlock.label }}</h6>
              <small class="text-muted">{{ levelBlock.total_pegawai }} pegawai</small>
            </div>
          </div>

          <div v-if="!levelBlock.jabatans.length" class="text-muted small py-3 px-3 border rounded bg-light">
            Belum ada jabatan pada level ini.
          </div>

          <div v-else class="row g-3">
            <div
              v-for="jabatan in levelBlock.jabatans"
              :key="jabatan.id_jabatan"
              class="col-xl-4 col-lg-6 col-12"
            >
              <div class="card h-100 org-jabatan-card">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-0">{{ jabatan.nm_jabatan }}</h6>
                    <small class="text-muted">{{ jabatan.pegawais.length }} pegawai</small>
                  </div>
                  <span :class="['badge', getJabatanLevelBadgeClass(jabatan.level)]">
                    L{{ jabatan.level }}
                  </span>
                </div>
                <div class="card-body pt-2">
                  <div v-if="!jabatan.pegawais.length" class="text-muted small">
                    Tidak ada pegawai pada jabatan ini.
                  </div>
                  <ul v-else class="list-unstyled mb-0 org-pegawai-list">
                    <li
                      v-for="pegawai in jabatan.pegawais"
                      :key="pegawai.id_pegawai"
                      class="org-pegawai-item"
                    >
                      <NuxtLink
                        :to="`/hrd/pegawai/profile/${pegawai.id_pegawai}`"
                        class="org-pegawai-link"
                      >
                        <span class="fw-medium">{{ pegawai.nm_pegawai }}</span>
                        <small v-if="pegawai.nik_pegawai" class="d-block text-muted">
                          {{ pegawai.nik_pegawai }}
                        </small>
                        <small
                          v-if="pegawai.departemen || pegawai.divisi"
                          class="d-block text-muted"
                        >
                          <template v-if="pegawai.divisi">{{ pegawai.divisi.nama }}</template>
                          <template v-if="pegawai.divisi && pegawai.departemen"> · </template>
                          <template v-if="pegawai.departemen">{{ pegawai.departemen.nama }}</template>
                        </small>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div v-if="levelBlock.level < 5" class="org-level-connector text-center my-2">
            <i class="ri-arrow-down-line ri-24px text-muted"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useHrOrgStructureStore } from '~/stores/hr-org-structure'
import { usePermissions } from '~/composables/usePermissions'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { getJabatanLevelBadgeClass } from '~/constants/hrd/jabatan'
import { ORG_LEVEL_DESCRIPTIONS } from '~/constants/hrd/orgStructure'

const store = useHrOrgStructureStore()
const { userHasPermission, userHasRole } = usePermissions()
const { setListTitle } = useDynamicTitle()

const { data: levels, meta, loading, filters, divisiOptions, departemenOptions } =
  storeToRefs(store)

const searchInput = ref('')

const canManageJabatan = computed(
  () => userHasRole('superadmin') || userHasPermission('edit_jabatan')
)

const hasActiveFilters = computed(
  () =>
    !!searchInput.value.trim() ||
    filters.value.divisi_id != null ||
    filters.value.departemen_id != null
)

setListTitle('Struktur Organisasi', 0)

function reload() {
  void store.fetchStructure()
}

function resetFilters() {
  searchInput.value = ''
  filters.value.search = ''
  filters.value.divisi_id = null
  filters.value.departemen_id = null
  reload()
}

function onCetak() {
  const query: Record<string, string> = {}
  if (filters.value.search.trim()) query.search = filters.value.search.trim()
  if (filters.value.divisi_id) query.divisi_id = String(filters.value.divisi_id)
  if (filters.value.departemen_id) query.departemen_id = String(filters.value.departemen_id)
  void navigateTo({ path: '/hrd/cetak-struktur-organisasi', query })
}

const debouncedSearch = useDebounceFn(() => {
  filters.value.search = searchInput.value
  reload()
}, 400)

watch(searchInput, () => debouncedSearch())

onMounted(async () => {
  await Promise.all([store.fetchFilterOptions(), store.fetchStructure()])
})

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  requiredPermission: ['view_struktur_organisasi', 'access_struktur_organisasi'],
})
</script>

<style scoped>
.org-jabatan-card {
  border: 1px solid rgba(67, 89, 113, 0.12);
  transition: box-shadow 0.15s ease;
}

.org-jabatan-card:hover {
  box-shadow: 0 0.25rem 0.75rem rgba(67, 89, 113, 0.12);
}

.org-pegawai-list {
  max-height: 280px;
  overflow-y: auto;
}

.org-pegawai-item + .org-pegawai-item {
  border-top: 1px dashed rgba(67, 89, 113, 0.15);
}

.org-pegawai-link {
  display: block;
  padding: 0.65rem 0.25rem;
  color: inherit;
  text-decoration: none;
  border-radius: 0.375rem;
}

.org-pegawai-link:hover {
  background: rgba(0, 143, 236, 0.06);
  color: var(--bs-primary);
}

.org-level-header {
  padding-bottom: 0.25rem;
  border-bottom: 2px solid rgba(67, 89, 113, 0.08);
}
</style>
