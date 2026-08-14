<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <div class="d-flex flex-wrap justify-content-end align-items-start gap-2 mb-1">
        <NuxtLink to="/admin/approval-workflows" class="btn btn-sm btn-outline-secondary">
          <i class="ri-arrow-left-line me-1"></i> Kembali ke Workflows
        </NuxtLink>
      </div>
      <p class="mb-6">
        Kelola master entity type untuk approval workflow. Tambah entity baru tanpa perlu ubah kode aplikasi.
      </p>

      <div class="row g-6 mb-6">
        <div v-for="card in statCards" :key="card.label" class="col-xl-3 col-lg-6 col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">{{ card.label }}</p>
                <div class="avatar">
                  <span :class="['avatar-initial rounded', card.iconClass]">
                    <i :class="card.icon"></i>
                  </span>
                </div>
              </div>
              <div class="account-heading">
                <h5 class="mb-1">{{ card.value }}</h5>
                <span class="text-muted small">{{ card.subtitle }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <h4 class="mt-2 mb-1">Daftar Entity</h4>
          <p class="mb-4">Entity type yang dapat dikaitkan dengan workflow approval.</p>
        </div>
        <div class="col-12">
          <CollapsibleFilterCard
            title="Filter Entity"
            :has-active-filters="hasActiveFilters"
            @reset="resetFilters"
          >
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Modul</label>
                <select
                  v-model="entityStore.params.module"
                  class="form-select"
                  @change="reload"
                >
                  <option value="">Semua Modul</option>
                  <option v-for="m in moduleOptions" :key="m" :value="m">{{ m }}</option>
                </select>
              </FilterField>
              <FilterField>
                <label class="form-label">Status</label>
                <select
                  v-model="entityStore.params.activeOnly"
                  class="form-select"
                  @change="reload"
                >
                  <option value="">Semua</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </FilterField>
            </FilterFieldsRow>
          </CollapsibleFilterCard>
        </div>
        <div class="col-12">
          <div class="card">
            <ListPageTableHeader
              :rows="Number(entityStore.params.rows)"
              :rows-options="[10, 25, 50, 100]"
              :search="globalFilterValue"
              search-placeholder="Cari kode / nama entity..."
              :show-export="false"
              :export-disabled="entityStore.loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
            >
              <template #add>
                <button type="button" class="btn btn-primary" @click="entityStore.openModal()">
                  <i class="ri-add-line me-1"></i>
                  Tambah Entity
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Kode</th>
                    <th>Nama</th>
                    <th>Modul</th>
                    <th>Alias</th>
                    <th>Urutan</th>
                    <th>Status</th>
                    <th style="min-width: 6rem;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="entityStore.loading">
                    <td colspan="8" class="text-center py-4">
                      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                      <span class="ms-2">Memuat...</span>
                    </td>
                  </tr>
                  <tr v-else-if="!entityStore.entities.length">
                    <td colspan="8" class="text-center py-4 text-muted">
                      Belum ada entity. Klik "Tambah Entity" untuk membuat.
                    </td>
                  </tr>
                  <tr v-else v-for="e in entityStore.entities" :key="e.id">
                    <td>{{ e.id }}</td>
                    <td><code>{{ e.code }}</code></td>
                    <td class="fw-medium">{{ e.name }}</td>
                    <td>
                      <span v-if="e.module" class="badge bg-label-primary text-capitalize">{{ e.module }}</span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td>
                      <span v-if="e.aliases?.length">
                        <code v-for="a in e.aliases" :key="a" class="small me-1">{{ a }}</code>
                      </span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td>{{ e.sortOrder }}</td>
                    <td>
                      <span :class="e.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ e.isActive ? 'Aktif' : 'Nonaktif' }}
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
                            <a class="dropdown-item" href="javascript:void(0)" @click="entityStore.openModal(e)">
                              <i class="ri-edit-box-line me-2"></i> Edit
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="entityStore.deleteEntity(e.id)">
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
            <div
              v-if="entityStore.totalRecords > entityStore.params.rows"
              class="card-footer d-flex justify-content-between align-items-center"
            >
              <small class="text-muted">
                Menampilkan
                {{ Math.min((entityStore.params.page - 1) * entityStore.params.rows + 1, entityStore.totalRecords) }}
                -
                {{ Math.min(entityStore.params.page * entityStore.params.rows, entityStore.totalRecords) }}
                dari {{ entityStore.totalRecords }}
              </small>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-secondary"
                  :disabled="entityStore.params.page <= 1"
                  @click="entityStore.params.page--; reload()"
                >
                  Prev
                </button>
                <button
                  class="btn btn-outline-secondary"
                  :disabled="entityStore.params.page * entityStore.params.rows >= entityStore.totalRecords"
                  @click="entityStore.params.page++; reload()"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="entityStore.showModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.5);"
        @click.self="entityStore.closeModal()"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ entityStore.isEditMode ? 'Edit Entity' : 'Tambah Entity' }}</h5>
              <button type="button" class="btn-close" @click="entityStore.closeModal()"></button>
            </div>
            <form @submit.prevent="entityStore.saveEntity()">
              <div class="modal-body">
                <div v-if="entityStore.validationErrors.length" class="alert alert-danger py-2">
                  <ul class="mb-0 ps-3">
                    <li v-for="(err, i) in entityStore.validationErrors" :key="i">{{ err }}</li>
                  </ul>
                </div>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Kode <span class="text-danger">*</span></label>
                    <input
                      v-model="entityStore.form.code"
                      type="text"
                      class="form-control"
                      placeholder="e.g. purchase_order"
                      :disabled="entityStore.isEditMode"
                      required
                    >
                    <small class="text-muted">Snake_case, huruf kecil. Tidak dapat diubah setelah dibuat.</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Nama <span class="text-danger">*</span></label>
                    <input v-model="entityStore.form.name" type="text" class="form-control" placeholder="e.g. Purchase Order" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Modul</label>
                    <input v-model="entityStore.form.module" type="text" class="form-control" placeholder="e.g. procurement, sales, hr">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Urutan</label>
                    <input v-model.number="entityStore.form.sortOrder" type="number" min="0" class="form-control">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Alias (opsional)</label>
                    <input
                      v-model="entityStore.form.aliasesText"
                      type="text"
                      class="form-control"
                      placeholder="site_investment, legacy_code (pisahkan dengan koma)"
                    >
                    <small class="text-muted">Kode legacy yang masih dipakai modul bisnis.</small>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Deskripsi</label>
                    <textarea v-model="entityStore.form.description" class="form-control" rows="2"></textarea>
                  </div>
                  <div class="col-12">
                    <div class="form-check form-switch">
                      <input v-model="entityStore.form.isActive" class="form-check-input" type="checkbox" id="entityActive">
                      <label class="form-check-label" for="entityActive">Aktif</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="entityStore.closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="entityStore.loading">
                  {{ entityStore.loading ? 'Menyimpan...' : 'Simpan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'

definePageMeta({
  title: "Approval Workflow Entities",
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})

const entityStore = useApprovalWorkflowEntitiesStore()
const { stats } = storeToRefs(entityStore)
useEscapeToClose(() => entityStore.showModal, () => entityStore.closeModal())

const globalFilterValue = ref('')

const moduleOptions = ['procurement', 'sales', 'operations', 'hr', 'admin', 'legal']

const hasActiveFilters = computed(
  () => entityStore.params.module !== '' || entityStore.params.activeOnly !== ''
)

function resetFilters() {
  entityStore.params.module = ''
  entityStore.params.activeOnly = ''
  entityStore.params.page = 1
  reload()
}

const statCards = computed(() => [
  {
    label: 'Total Entity',
    value: stats.value.total || 0,
    subtitle: 'Entity terdaftar',
    icon: 'ri-node-tree',
    iconClass: 'bg-label-primary',
  },
  {
    label: 'Aktif',
    value: stats.value.aktif || 0,
    subtitle: 'Entity aktif',
    icon: 'ri-checkbox-circle-line',
    iconClass: 'bg-label-success',
  },
  {
    label: 'Nonaktif',
    value: stats.value.nonaktif || 0,
    subtitle: 'Entity nonaktif',
    icon: 'ri-close-circle-line',
    iconClass: 'bg-label-secondary',
  },
  {
    label: 'Modul',
    value: stats.value.modules || 0,
    subtitle: 'Grup modul unik',
    icon: 'ri-apps-line',
    iconClass: 'bg-label-info',
  },
])

function reload() {
  entityStore.fetchEntities()
}

function onToolbarRows(rows: number) {
  entityStore.params.rows = rows
  entityStore.params.page = 1
  reload()
}

const debouncedSearch = useDebounceFn(() => {
  entityStore.params.search = globalFilterValue.value
  entityStore.params.page = 1
  reload()
}, 400)

watch(globalFilterValue, () => debouncedSearch())

onMounted(async () => {
  await entityStore.fetchStats()
  await reload()
})
</script>
