<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex flex-wrap justify-content-end align-items-start gap-2 mb-1">
        <NuxtLink to="/admin/approval-workflow-entities" class="btn btn-sm btn-outline-primary">
          <i class="ri-node-tree me-1"></i> Kelola Entity Types
        </NuxtLink>
      </div>
      <p class="mb-6">
        Kelola konfigurasi workflow approval berjenjang untuk berbagai entitas (Purchase Order, Purchase Request, Quotation, Sales Order, Kontrak Pegawai, dll).
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
          <h4 class="mt-2 mb-1">Daftar Workflow</h4>
          <p class="mb-4">Kelola workflow approval dan langkah-langkah persetujuannya.</p>
        </div>
        <div class="col-12">
          <CollapsibleFilterCard
            title="Filter Workflow"
            :has-active-filters="hasActiveFilters"
            @reset="resetFilters"
          >
            <FilterFieldsRow>
              <FilterField>
                <label class="form-label">Status</label>
                <select
                  v-model="wfStore.params.isActive"
                  class="form-select"
                  @change="load"
                >
                  <option value="">Semua Status</option>
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
              :rows="Number(wfStore.params.rows)"
              :rows-options="[5, 10, 25, 50]"
              :search="globalFilterValue"
              search-placeholder="Cari nama / entity..."
              :show-export="false"
              :export-disabled="wfStore.loading"
              @update:rows="onToolbarRows"
              @update:search="(v) => { globalFilterValue = v }"
            >
              <template #add>
                <button type="button" class="btn btn-primary" @click="openWorkflowModal()">
                  <i class="ri-add-line me-1"></i>
                  Tambah Workflow
                </button>
              </template>
            </ListPageTableHeader>
            <div class="card-datatable table-responsive py-3 px-3">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Entity Type</th>
                    <th>Steps</th>
                    <th>Status</th>
                    <th style="min-width: 8rem;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="wfStore.loading">
                    <td colspan="6" class="text-center py-4">
                      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                      <span class="ms-2">Memuat...</span>
                    </td>
                  </tr>
                  <tr v-else-if="!wfStore.workflows.length">
                    <td colspan="6" class="text-center py-4 text-muted">
                      Belum ada workflow. Klik "Tambah Workflow" untuk membuat.
                    </td>
                  </tr>
                  <tr v-else v-for="w in wfStore.workflows" :key="w.id">
                    <td>{{ w.id }}</td>
                    <td class="fw-medium">{{ w.name }}</td>
                    <td>
                      <span class="fw-medium">{{ w.entity?.name || w.entityType }}</span>
                      <br>
                      <code class="small">{{ w.entity?.code || w.entityType }}</code>
                    </td>
                    <td>{{ (w.steps || []).length }} step</td>
                    <td>
                      <span :class="w.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ w.isActive ? 'Aktif' : 'Nonaktif' }}
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
                            <NuxtLink :to="`/admin/approval-workflows/detail/${w.id}`" class="dropdown-item">
                              <i class="ri-settings-3-line me-2"></i> Kelola Steps
                            </NuxtLink>
                          </li>
                          <li>
                            <a class="dropdown-item" href="javascript:void(0)" @click="openWorkflowModal(w)">
                              <i class="ri-edit-box-line me-2"></i> Edit
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="wfStore.deleteWorkflow(w.id)">
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
            <div v-if="wfStore.totalRecords > wfStore.params.rows" class="card-footer d-flex justify-content-between align-items-center">
              <small class="text-muted">
                Menampilkan {{ Math.min((wfStore.params.page - 1) * wfStore.params.rows + 1, wfStore.totalRecords) }} -
                {{ Math.min(wfStore.params.page * wfStore.params.rows, wfStore.totalRecords) }} dari {{ wfStore.totalRecords }}
              </small>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-secondary"
                  :disabled="wfStore.params.page <= 1"
                  @click="wfStore.params.page--; load()"
                >
                  Prev
                </button>
                <button
                  class="btn btn-outline-secondary"
                  :disabled="wfStore.params.page * wfStore.params.rows >= wfStore.totalRecords"
                  @click="wfStore.params.page++; load()"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Workflow -->
      <div
        v-if="wfStore.showModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.5);"
        @click.self="wfStore.closeModal()"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ wfStore.isEditMode ? 'Edit Workflow' : 'Tambah Workflow' }}</h5>
              <button type="button" class="btn-close" @click="wfStore.closeModal()"></button>
            </div>
            <form @submit.prevent="onSaveWorkflow">
              <div class="modal-body">
                <div v-if="wfStore.validationErrors.length" class="alert alert-danger py-2">
                  <ul class="mb-0 ps-3">
                    <li v-for="(err, i) in wfStore.validationErrors" :key="i">{{ err }}</li>
                  </ul>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nama <span class="text-danger">*</span></label>
                  <input v-model="wfStore.form.name" type="text" class="form-control" placeholder="e.g. Purchase Order Approval Workflow" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Entity Type <span class="text-danger">*</span></label>
                  <CustomSelect2
                    v-model="wfStore.form.approvalWorkflowEntityId"
                    :options="wfStore.entities"
                    :get-option-label="entityOptionLabel"
                    :get-option-key="(opt) => String(opt?.id ?? '')"
                    :reduce="(opt) => opt?.id"
                    :filter-by="filterEntityOption"
                    :loading="wfStore.entitiesLoading"
                    :disabled="wfStore.isEditMode || wfStore.entitiesLoading"
                    :is-invalid="entitySelectInvalid"
                    searchable
                    clearable
                    placeholder="Pilih entity..."
                    search-placeholder="Cari nama / code / modul..."
                    no-options-text="Tidak ada entity ditemukan"
                  >
                    <template #option="{ option }">
                      <div class="d-flex flex-column">
                        <span class="fw-medium">{{ option.name }}</span>
                        <small class="text-muted">
                          <code>{{ option.code }}</code>
                          <template v-if="option.module"> · {{ option.module }}</template>
                        </small>
                      </div>
                    </template>
                  </CustomSelect2>
                  <small v-if="wfStore.isEditMode" class="text-muted">Entity type tidak dapat diubah setelah dibuat</small>
                  <small v-else-if="wfStore.entitiesLoading" class="text-muted">Memuat daftar entity...</small>
                  <small v-else-if="!wfStore.entities.length" class="text-muted">
                    Belum ada entity aktif.
                    <NuxtLink to="/admin/approval-workflow-entities">Tambah entity</NuxtLink>
                  </small>
                  <small v-else-if="entitySelectInvalid" class="text-danger">Entity type wajib dipilih</small>
                </div>
                <div class="mb-3">
                  <label class="form-label">Deskripsi</label>
                  <textarea v-model="wfStore.form.description" class="form-control" rows="2" placeholder="Deskripsi workflow (opsional)"></textarea>
                </div>
                <div class="form-check form-switch">
                  <input v-model="wfStore.form.isActive" class="form-check-input" type="checkbox" id="wfActive">
                  <label class="form-check-label" for="wfActive">Aktif</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="wfStore.closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="wfStore.loading">
                  {{ wfStore.loading ? 'Menyimpan...' : 'Simpan' }}
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
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import type { ApprovalWorkflowEntity } from '~/stores/approval-workflows'

definePageMeta({
  title: "Approval Workflows",
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})

const wfStore = useApprovalWorkflowsStore()
const { stats } = storeToRefs(wfStore)
useEscapeToClose(() => wfStore.showModal, () => wfStore.closeModal())

const globalFilterValue = ref('')
const entitySelectInvalid = ref(false)

const hasActiveFilters = computed(() => wfStore.params.isActive !== '')

function entityOptionLabel(opt: ApprovalWorkflowEntity | null | undefined) {
  if (!opt) return ''
  return opt.module ? `${opt.name} (${opt.module})` : opt.name
}

function filterEntityOption(
  option: ApprovalWorkflowEntity,
  _label: string,
  search: string,
) {
  const q = search.toLowerCase().trim()
  if (!q) return true
  return [option.name, option.code, option.module]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q))
}

async function openWorkflowModal(data?: Parameters<typeof wfStore.openModal>[0]) {
  entitySelectInvalid.value = false
  // Refresh entity list so newly added entities appear in the select
  await wfStore.fetchEntities(true)
  wfStore.openModal(data)
}

async function onSaveWorkflow() {
  if (!wfStore.isEditMode && !wfStore.form.approvalWorkflowEntityId) {
    entitySelectInvalid.value = true
    return
  }
  entitySelectInvalid.value = false
  await wfStore.saveWorkflow()
}

watch(() => wfStore.form.approvalWorkflowEntityId, () => {
  if (wfStore.form.approvalWorkflowEntityId) entitySelectInvalid.value = false
})

function resetFilters() {
  wfStore.params.isActive = ''
  wfStore.params.page = 1
  load()
}

const statCards = computed(() => [
  {
    label: 'Total Workflow',
    value: stats.value.total || 0,
    subtitle: 'Workflow terdaftar',
    icon: 'ri-git-branch-line',
    iconClass: 'bg-label-primary',
  },
  {
    label: 'Aktif',
    value: stats.value.aktif || 0,
    subtitle: 'Workflow aktif',
    icon: 'ri-checkbox-circle-line',
    iconClass: 'bg-label-success',
  },
  {
    label: 'Nonaktif',
    value: stats.value.nonaktif || 0,
    subtitle: 'Workflow nonaktif',
    icon: 'ri-close-circle-line',
    iconClass: 'bg-label-secondary',
  },
  {
    label: 'Entity Types',
    value: stats.value.entities || 0,
    subtitle: `${stats.value.total_steps || 0} total step`,
    icon: 'ri-node-tree',
    iconClass: 'bg-label-info',
  },
])

async function load() {
  await wfStore.fetchWorkflows()
}

function onToolbarRows(rows: number) {
  wfStore.params.rows = rows
  wfStore.params.page = 1
  load()
}

const debouncedSearch = useDebounceFn(() => {
  wfStore.params.search = globalFilterValue.value
  wfStore.params.page = 1
  load()
}, 400)

watch(globalFilterValue, () => debouncedSearch())

onMounted(async () => {
  await Promise.all([wfStore.fetchEntities(), wfStore.fetchStats()])
  await load()
})
</script>
