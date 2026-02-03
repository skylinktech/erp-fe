<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-p-y">
      <h4 class="mb-1">Approval Workflows</h4>
      <p class="mb-6">
        Kelola konfigurasi workflow approval berjenjang untuk berbagai entitas (IRO, Quotation, Purchase Order, Sales Order).
      </p>

      <div class="row g-6 mb-6">
        <div class="col-xl-4 col-lg-6 col-md-6">
          <div class="card h-100">
            <div class="row h-100">
              <div class="col-sm-5">
                <div class="d-flex align-items-end h-100 justify-content-center">
                  <img src="/img/illustrations/add-new-role-illustration.png" class="img-fluid" alt="Add" width="70">
                </div>
              </div>
              <div class="col-sm-7">
                <div class="card-body text-sm-end text-center ps-sm-0">
                  <button @click="wfStore.openModal()" class="btn btn-primary mb-2 text-nowrap">
                    Tambah Workflow
                  </button>
                  <p class="mb-0 mt-1">Buat workflow approval baru</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-6">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="me-2">Baris:</span>
                <select v-model="wfStore.params.rows" class="form-select form-select-sm" style="width: 5rem;" @change="onRowsChange">
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
                <select v-model="wfStore.params.isActive" class="form-select form-select-sm" style="width: 8rem;" @change="load">
                  <option value="">Semua Status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
              <div class="d-flex align-items-center gap-2">
                <input
                  v-model="wfStore.params.search"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="Cari nama / entity..."
                  style="width: 12rem;"
                  @keyup.enter="load"
                >
                <button class="btn btn-sm btn-outline-primary" @click="load">
                  <i class="ri-search-line me-1"></i> Cari
                </button>
              </div>
            </div>
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
                    <td><code>{{ w.entityType }}</code></td>
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
                            <a class="dropdown-item" href="javascript:void(0)" @click="wfStore.openModal(w)">
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
            <form @submit.prevent="wfStore.saveWorkflow()">
              <div class="modal-body">
                <div v-if="wfStore.validationErrors.length" class="alert alert-danger py-2">
                  <ul class="mb-0 ps-3">
                    <li v-for="(err, i) in wfStore.validationErrors" :key="i">{{ err }}</li>
                  </ul>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nama <span class="text-danger">*</span></label>
                  <input v-model="wfStore.form.name" type="text" class="form-control" placeholder="e.g. IRO Approval Workflow" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Entity Type <span class="text-danger">*</span></label>
                  <select v-model="wfStore.form.entityType" class="form-select" required :disabled="wfStore.isEditMode">
                    <option value="">Pilih entity...</option>
                    <option v-for="opt in wfStore.entityTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <small v-if="wfStore.isEditMode" class="text-muted">Entity type tidak dapat diubah setelah dibuat</small>
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
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})

const wfStore = useApprovalWorkflowsStore()

async function load() {
  await wfStore.fetchWorkflows()
}

function onRowsChange() {
  wfStore.params.page = 1
  load()
}

onMounted(() => load())
</script>
