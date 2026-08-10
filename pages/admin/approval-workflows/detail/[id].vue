<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-10">
      <div v-if="loading && !workflow" class="text-center py-8">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">Memuat workflow...</p>
      </div>

      <template v-else-if="workflow">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <NuxtLink to="/admin/approval-workflows" class="btn btn-outline-secondary btn-sm mb-2">
              <i class="ri-arrow-left-line me-1"></i> Kembali
            </NuxtLink>
            <h4 class="mb-1 mt-5">{{ workflow.name }}</h4>
            <p class="text-muted mb-0">
              <span class="fw-medium">{{ workflow.entity?.name || workflow.entityType }}</span>
              <code class="ms-2">{{ workflow.entity?.code || workflow.entityType }}</code>
              <span :class="workflow.isActive ? 'badge bg-success ms-2' : 'badge bg-secondary ms-2'">
                {{ workflow.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </p>
          </div>
          <button class="btn btn-primary mt-5" @click="openStepModal()">
            <i class="ri-add-line me-1"></i> Tambah Step
          </button>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Approval Steps</h5>
          </div>
          <div class="card-body">
            <p class="text-muted small mb-3">
              Urutan step menentukan alur approval. Minimal satu tipe approver (Role, Jabatan, atau User) harus diisi per step.
              Min/Max Amount opsional untuk conditional approval berdasarkan nominal.
            </p>
            <div v-if="steps.length === 0" class="text-center py-5 text-muted">
              Belum ada step. Klik "Tambah Step" untuk menambahkan.
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th style="width: 4rem;">#</th>
                    <th>Step Name</th>
                    <th>Approver (Role / Jabatan / User)</th>
                    <th>Amount Range</th>
                    <th style="min-width: 8rem;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in steps" :key="s.id">
                    <td class="fw-bold">{{ s.stepOrder }}</td>
                    <td>{{ s.stepName }}</td>
                    <td>
                      <span v-if="s.role" class="badge bg-label-primary me-1">Role: {{ s.role.name }}</span>
                      <span v-if="s.jabatan" class="badge bg-label-info me-1">Jabatan: {{ s.jabatan.nm_jabatan }}</span>
                      <span v-if="s.user" class="badge bg-label-success">User: {{ s.user.full_name || s.user.email }}</span>
                      <span v-if="!s.role && !s.jabatan && !s.user" class="text-muted">—</span>
                    </td>
                    <td>
                      <span v-if="s.minAmount != null || s.maxAmount != null">
                        {{ formatAmount(s.minAmount) }} - {{ formatAmount(s.maxAmount) }}
                      </span>
                      <span v-else class="text-muted">—</span>
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
                            <a class="dropdown-item" href="javascript:void(0)" @click="openStepModal(s)">
                              <i class="ri-edit-box-line me-2"></i> Edit
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item text-danger" href="javascript:void(0)" @click="deleteStep(s.id)">
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
          </div>
        </div>

        <!-- Modal Step -->
        <div
          v-if="showStepModal"
          class="modal fade show d-block"
          tabindex="-1"
          style="background: rgba(0,0,0,0.5);"
          @click.self="showStepModal = false"
        >
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ editingStep ? 'Edit Step' : 'Tambah Step' }}</h5>
                <button type="button" class="btn-close" @click="showStepModal = false"></button>
              </div>
              <form @submit.prevent="saveStep">
                <div class="modal-body">
                  <div v-if="stepErrors.length" class="alert alert-danger py-2">
                    <ul class="mb-0 ps-3">
                      <li v-for="(err, i) in stepErrors" :key="i">{{ err }}</li>
                    </ul>
                  </div>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Step Order <span class="text-danger">*</span></label>
                      <input v-model.number="stepForm.stepOrder" type="number" min="1" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Step Name <span class="text-danger">*</span></label>
                      <input v-model="stepForm.stepName" type="text" class="form-control" placeholder="e.g. Approval Manager" required>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Role (opsional)</label>
                      <select v-model="stepForm.roleId" class="form-select">
                        <option :value="null">— Tidak pakai role —</option>
                        <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
                      </select>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Jabatan (opsional)</label>
                      <CustomSelect2
                        v-model="stepForm.jabatanId"
                        :options="jabatans"
                        :get-option-label="(opt) => opt?.nm_jabatan || opt?.nmJabatan || opt?.name || ''"
                        :reduce="(opt) => opt?.id_jabatan ?? opt?.idJabatan ?? opt?.id"
                        :get-option-key="(opt) => String(opt?.id_jabatan ?? opt?.idJabatan ?? opt?.id ?? '')"
                        placeholder="— Tidak pakai jabatan —"
                        searchable
                        clearable
                      />
                    </div>
                    <div class="col-12">
                      <label class="form-label">User (opsional)</label>
                      <select v-model.number="stepForm.userId" class="form-select">
                        <option :value="null">— Tidak pakai user —</option>
                        <option v-for="u in usersForSelect" :key="u.id" :value="u.id">{{ getUserLabel(u) }} ({{ u.email }})</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Min Amount (opsional)</label>
                      <input v-model.number="stepForm.minAmount" type="number" min="0" step="0.01" class="form-control" placeholder="0">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Max Amount (opsional)</label>
                      <input v-model.number="stepForm.maxAmount" type="number" min="0" step="0.01" class="form-control" placeholder="Unlimited">
                    </div>
                    <div class="col-12">
                      <label class="form-label">Deskripsi (opsional)</label>
                      <textarea v-model="stepForm.description" class="form-control" rows="2"></textarea>
                    </div>
                  </div>
                  <p class="text-muted small mt-2 mb-0">
                    <strong>Catatan:</strong> Minimal satu dari Role, Jabatan, atau User harus diisi agar step valid.
                  </p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="showStepModal = false">Batal</button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    {{ saving ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!loading" class="alert alert-warning">
        Workflow tidak ditemukan. <NuxtLink to="/admin/approval-workflows">Kembali ke daftar</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import type { ApprovalWorkflowStepItem } from '~/stores/approval-workflows'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})

const route = useRoute()
const wfStore = useApprovalWorkflowsStore()
const toast = useToast()
const { $api } = useNuxtApp()

const id = computed(() => String(route.params.id || ''))
const workflow = computed(() => wfStore.workflow)
const steps = computed(() => (workflow.value?.steps || []).sort((a, b) => a.stepOrder - b.stepOrder))
const loading = ref(true)
const showStepModal = ref(false)
const editingStep = ref<ApprovalWorkflowStepItem | null>(null)
const saving = ref(false)
const stepErrors = ref<string[]>([])
const roles = ref<{ id: number; name: string }[]>([])
const jabatans = ref<{ id_jabatan: number; nm_jabatan: string }[]>([])
const users = ref<{ id: number; full_name: string; fullName: string; email: string }[]>([])

/** Users + editing step's user (jika tidak ada di list) agar dropdown edit tampil */
const usersForSelect = computed(() => {
  const list = [...users.value]
  const step = editingStep.value
  if (step?.user && stepForm.userId) {
    const u = step.user as any
    const id = u.id ?? step.userId ?? (step as any).user_id
    if (id && !list.some((x) => Number(x.id) === Number(id))) {
      list.unshift({
        id: Number(id),
        full_name: u.fullName ?? u.full_name ?? '',
        fullName: u.fullName ?? u.full_name ?? '',
        email: u.email ?? '',
      })
    }
  }
  return list
})

const stepForm = reactive({
  stepOrder: 1,
  stepName: '',
  roleId: null as number | null,
  jabatanId: null as number | null,
  userId: null as number | null,
  minAmount: null as number | null,
  maxAmount: null as number | null,
  description: '',
})

function formatAmount(val: number | null | undefined) {
  if (val == null) return '∞'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function resetStepForm() {
  stepForm.stepOrder = (steps.value.length + 1) || 1
  stepForm.stepName = ''
  stepForm.roleId = null
  stepForm.jabatanId = null
  stepForm.userId = null
  stepForm.minAmount = null
  stepForm.maxAmount = null
  stepForm.description = ''
  editingStep.value = null
  stepErrors.value = []
}

function getUserLabel(u: { full_name?: string; fullName?: string; email?: string }) {
  return u.fullName ?? u.full_name ?? u.email ?? ''
}

function openStepModal(step?: ApprovalWorkflowStepItem | null) {
  resetStepForm()
  if (step) {
    editingStep.value = step
    stepForm.stepOrder = step.stepOrder ?? (step as any).step_order ?? 1
    stepForm.stepName = step.stepName ?? (step as any).step_name ?? ''
    stepForm.roleId = step.roleId ?? (step as any).role_id ?? null
    stepForm.jabatanId = step.jabatanId ?? (step as any).jabatan_id ?? null
    stepForm.userId = step.userId ?? (step as any).user_id ?? (step.user as any)?.id ?? null
    stepForm.minAmount = step.minAmount ?? null
    stepForm.maxAmount = step.maxAmount ?? null
    stepForm.description = step.description ?? ''
  }
  showStepModal.value = true
}

async function saveStep() {
  const hasApprover = stepForm.roleId != null || stepForm.jabatanId != null || stepForm.userId != null
  if (!hasApprover) {
    stepErrors.value = ['Minimal satu approver (Role, Jabatan, atau User) harus diisi']
    return
  }
  stepErrors.value = []
  saving.value = true
  try {
    const payload = {
      workflowId: Number(id.value),
      stepOrder: stepForm.stepOrder,
      stepName: stepForm.stepName,
      roleId: stepForm.roleId,
      jabatanId: stepForm.jabatanId,
      userId: stepForm.userId,
      minAmount: stepForm.minAmount,
      maxAmount: stepForm.maxAmount,
      description: stepForm.description || null,
    }
    if (editingStep.value) {
      await wfStore.updateStep(editingStep.value.id, payload)
      toast.success({ title: 'Berhasil', message: 'Step berhasil diupdate', color: 'green', position: 'bottomRight' })
    } else {
      await wfStore.storeStep(Number(id.value), payload)
      toast.success({ title: 'Berhasil', message: 'Step berhasil ditambahkan', color: 'green', position: 'bottomRight' })
    }
    showStepModal.value = false
    await load()
  } catch (e: any) {
    const err = e?.data || e
    stepErrors.value = err?.errors ? Object.values(err.errors).flat() as string[] : [err?.message || e?.message || 'Gagal menyimpan']
  } finally {
    saving.value = false
  }
}

async function deleteStep(stepId: number) {
  const ok = await Swal.fire({
    title: 'Hapus Step?',
    text: 'Step ini akan dihapus dari workflow.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus',
  })
  if (!ok.isConfirmed) return
  try {
    await wfStore.deleteStep(stepId)
    toast.success({ title: 'Berhasil', message: 'Step berhasil dihapus', color: 'green', position: 'bottomRight' })
    await load()
  } catch (e: any) {
    toast.error({ title: 'Error', message: e?.message || 'Gagal menghapus', color: 'red', position: 'bottomRight' })
  }
}

async function loadRefs() {
  try {
    const [rolesRes, jabatanRes, usersRes] = await Promise.all([
      fetch($api.roles() + '?start=0&length=999', { credentials: 'include' }),
      fetch($api.jabatan() + '?page=1&rows=999', { credentials: 'include' }),
      fetch($api.users() + '?page=1&rows=999', { credentials: 'include' }),
    ])
    if (rolesRes.ok) {
      const r = await rolesRes.json()
      roles.value = (r.data || []).map((x: any) => ({ id: x.id, name: x.name }))
    }
    if (jabatanRes.ok) {
      const j = await jabatanRes.json()
      const arr = j.data || j || []
      jabatans.value = (Array.isArray(arr) ? arr : []).map((item: any) => ({
        id_jabatan: item.id_jabatan ?? item.idJabatan ?? item.id,
        nm_jabatan: item.nm_jabatan ?? item.nmJabatan ?? item.name ?? '',
        id: item.id ?? item.idJabatan ?? item.id_jabatan,
        nmJabatan: item.nmJabatan ?? item.nm_jabatan ?? item.name ?? '',
      }))
    }
    if (usersRes.ok) {
      const u = await usersRes.json()
      const arr = u.data ?? u.rows ?? (Array.isArray(u) ? u : [])
      const list = Array.isArray(arr) ? arr : []
      users.value = list.map((x: any) => ({
        id: x.id,
        full_name: x.fullName ?? x.full_name ?? '',
        fullName: x.fullName ?? x.full_name ?? '',
        email: x.email ?? '',
      }))
    }
  } catch (e) {
    console.error('Error loading refs for approval workflow:', e)
  }
}

async function load() {
  if (!id.value) return
  loading.value = true
  try {
    await wfStore.fetchWorkflow(id.value)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadRefs()
  await load()
})
</script>
