<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1 container-pt-5">
      <div v-if="!formReady && loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <NuxtLink
                to="/implementation/progress-tracker"
                class="text-muted small text-decoration-none"
              >
                Progress Tracker
              </NuxtLink>
              <span class="text-muted small">/</span>
              <span class="text-muted small">{{ pageTitle }}</span>
            </div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/implementation/progress-tracker" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card shadow-sm border-0">
              <div class="card-header border-0 bg-transparent py-3">
                <h5 class="card-title mb-0">Form Progress Tracker</h5>
              </div>
              <div class="card-body pt-0">
                <form @submit.prevent="handleSubmit">
                  <ul class="nav nav-tabs mb-0" role="tablist">
                    <li class="nav-item">
                      <button
                        class="nav-link active"
                        type="button"
                        data-bs-toggle="tab"
                        data-bs-target="#pt-tab-info"
                      >
                        <i class="ri-information-line me-1"></i>Informasi
                      </button>
                    </li>
                    <li class="nav-item">
                      <button
                        class="nav-link"
                        type="button"
                        data-bs-toggle="tab"
                        data-bs-target="#pt-tab-nodes"
                      >
                        <i class="ri-node-tree me-1"></i>
                        Node / Network
                        <span v-if="nodeCount" class="badge bg-primary ms-1">{{ nodeCount }}</span>
                      </button>
                    </li>
                  </ul>

                  <div class="tab-content pt-4">
                    <div id="pt-tab-info" class="tab-pane fade show active">
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Nama Project</label>
                        <div class="col-sm-9">
                          <input
                            v-model="form.name"
                            type="text"
                            class="form-control"
                            placeholder="Nama project implementation"
                            required
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Site Investment</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.siteInvestmentId"
                            :options="siteInvestments"
                            :get-option-label="siteInvestLabel"
                            :reduce="(s) => s?.id"
                            searchable
                            clearable
                            placeholder="Pilih project implementation"
                            @update:model-value="onSiteInvestChange"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Customer</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.customerId"
                            :options="customers"
                            :get-option-label="customerLabel"
                            :reduce="(c) => c?.id"
                            searchable
                            clearable
                            placeholder="Pilih customer"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Status Project</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.status"
                            :options="PROJECT_STATUS_OPTIONS"
                            :get-option-label="(o) => o.label"
                            :reduce="(o) => o.value"
                            searchable
                            clearable
                            placeholder="Pilih status"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Deskripsi</label>
                        <div class="col-sm-9">
                          <textarea
                            v-model="form.description"
                            class="form-control"
                            rows="2"
                            placeholder="Catatan tambahan project"
                          />
                        </div>
                      </div>
                    </div>

                    <div id="pt-tab-nodes" class="tab-pane fade">
                      <div class="d-flex justify-content-between align-items-center mb-4">
                        <p class="mb-0 text-muted small">
                          Daftar node/network untuk melacak progress per lokasi atau jaringan.
                        </p>
                        <button type="button" class="btn btn-sm btn-primary" @click="store.addNode()">
                          <i class="ri-add-line me-1"></i>Tambah Node
                        </button>
                      </div>

                      <div
                        v-if="!form.nodes.length"
                        class="text-center py-5 border rounded text-muted"
                      >
                        <i class="ri-node-tree fs-3 d-block mb-2"></i>
                        Belum ada node. Klik <strong>Tambah Node</strong>.
                      </div>

                      <div
                        v-for="(node, idx) in form.nodes"
                        :key="idx"
                        class="border rounded mb-3 p-3"
                      >
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <strong>Node #{{ idx + 1 }}</strong>
                          <button
                            v-if="form.nodes.length > 1"
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            @click="store.removeNode(idx)"
                          >
                            <i class="ri-delete-bin-line"></i>
                          </button>
                        </div>
                        <div class="row g-3">
                          <div class="col-md-6">
                            <label class="form-label">Kode Node</label>
                            <input
                              v-model="node.nodeCode"
                              type="text"
                              class="form-control"
                              placeholder="NODE-1"
                            />
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Nama Node / Network</label>
                            <input
                              v-model="node.name"
                              type="text"
                              class="form-control"
                              placeholder="Nama lokasi atau network"
                              required
                            />
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Network ID</label>
                            <input
                              v-model="node.networkIdentifier"
                              type="text"
                              class="form-control"
                              placeholder="Opsional — ID network eksternal"
                            />
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Pengajuan Dana (ARF)</label>
                            <CustomSelect2
                              v-model="node.arfId"
                              :options="arfs"
                              :get-option-label="arfLabel"
                              :reduce="(a) => a?.id"
                              searchable
                              clearable
                              placeholder="Pilih ARF"
                            />
                          </div>
                          <div class="col-md-12">
                            <label class="form-label">Status Awal</label>
                            <CustomSelect2
                              v-model="node.currentStatus"
                              :options="PROGRESS_TRACKER_STATUS_OPTIONS"
                              :get-option-label="(o) => o.label"
                              :reduce="(o) => o.value"
                              searchable
                              placeholder="Pilih status awal"
                            />
                          </div>
                          <div class="col-12">
                            <label class="form-label">Catatan Node</label>
                            <input
                              v-model="node.notes"
                              type="text"
                              class="form-control"
                              placeholder="Catatan untuk node ini"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <NuxtLink to="/implementation/progress-tracker" class="btn btn-outline-secondary">
                      Batal
                    </NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-xl-4 col-12">
            <FormPageSidebar
              nav-title="Modul Implementation"
              :nav-items="IMPLEMENTATION_MODULE_NAV"
              :summary-rows="summaryRows"
              summary-title="Ringkasan"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useProgressTrackerStore } from '~/stores/progress-tracker'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormPageSidebar from '~/components/form/FormPageSidebar.vue'
import { IMPLEMENTATION_MODULE_NAV } from '~/constants/implementation/formNav'
import {
  PROJECT_STATUS_OPTIONS,
  PROGRESS_TRACKER_STATUS_OPTIONS,
} from '~/constants/implementation/progressTrackerStatuses'
import { apiFetch } from '~/utils/apiFetch'
import type { FormPageSummaryRow } from '~/types/form-page'

const props = defineProps<{ editId?: string }>()

const router = useRouter()
const store = useProgressTrackerStore()
const { form, saving, loading, isEditMode } = storeToRefs(store)
const { $api } = useNuxtApp()

const formReady = ref(false)
const siteInvestments = ref<any[]>([])
const customers = ref<any[]>([])
const ARF_STATUS_APPROVED = 'approved'

const arfs = ref<any[]>([])

const pageTitle = computed(() => (isEditMode.value ? 'Edit Project' : 'Tambah Project'))
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Perbarui data project dan node/network'
    : 'Buat project baru untuk pelacakan progress implementation'
)
const nodeCount = computed(() => form.value.nodes.length)

const summaryRows = computed((): FormPageSummaryRow[] => {
  const si = siteInvestments.value.find((s) => s.id === form.value.siteInvestmentId)
  const statusLabel =
    PROJECT_STATUS_OPTIONS.find((o) => o.value === form.value.status)?.label ?? form.value.status
  return [
    { label: 'Nama', value: form.value.name || '—' },
    {
      label: 'Site Investment',
      value: si ? siteInvestLabel(si) : '—',
    },
    { label: 'Status', value: statusLabel },
    { label: 'Jumlah Node', value: String(nodeCount.value) },
  ]
})

function customerLabel(c: any) {
  if (!c) return ''
  const name = c.name || c.customer_name || c.customerName || ''
  const code = c.code || c.customer_code || c.customerCode || ''
  return code ? `${code} — ${name}` : name
}

function siteInvestLabel(s: any) {
  if (!s) return ''
  const no = s.siNumber || s.si_number || ''
  const name = s.name || ''
  return no ? `${no} — ${name}` : name || s.id
}

function arfLabel(a: any) {
  if (!a) return ''
  const no = a.requestNo || a.request_no || a.id
  return no
}

function mergeArfOptions(extra: any[]) {
  const map = new Map<number, any>()
  for (const a of arfs.value) {
    const id = Number(a?.id)
    if (id) map.set(id, a)
  }
  for (const a of extra) {
    const id = Number(a?.id)
    if (id && !map.has(id)) map.set(id, a)
  }
  arfs.value = [...map.values()].sort((a, b) =>
    String(a.requestNo || a.request_no || '').localeCompare(
      String(b.requestNo || b.request_no || ''),
      'id'
    )
  )
}

function mergeArfsFromProjectNodes() {
  const nodes = store.project?.nodes ?? []
  const linked = nodes.map((n) => n.arf).filter(Boolean) as any[]
  if (linked.length) mergeArfOptions(linked)
}

async function loadAssociations() {
  const headers = { Accept: 'application/json' }
  const [siRes, custRes, arfRes] = await Promise.all([
    fetch(`${$api.siteInvestment()}?rows=500`, { headers, credentials: 'include' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
    apiFetch($api.dataCustomer()).catch(() => []),
    fetch(`${$api.arf()}?rows=500&status=${ARF_STATUS_APPROVED}`, { headers, credentials: 'include' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
  ])
  siteInvestments.value = siRes?.data ?? []
  const custJson = Array.isArray(custRes) ? custRes : (custRes as any)?.data ?? custRes
  customers.value = Array.isArray(custJson) ? custJson : []
  arfs.value = (arfRes?.data ?? []).filter(
    (a: any) => (a.status || '').toLowerCase() === ARF_STATUS_APPROVED
  )
}

function onSiteInvestChange(id: string | null) {
  const si = siteInvestments.value.find((s) => s.id === id)
  if (si?.customerId ?? si?.customer_id) {
    form.value.customerId = si.customerId ?? si.customer_id
  }
  if (si?.siteId ?? si?.site_id) {
    form.value.siteId = si.siteId ?? si.site_id
  }
}

async function handleSubmit() {
  try {
    const id = await store.saveProject()
    if (id) {
      await router.push(`/implementation/progress-tracker/detail/${id}`)
    } else {
      await router.push('/implementation/progress-tracker')
    }
  } catch (e: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal menyimpan',
      text: e?.data?.message || e?.message || 'Periksa data form',
    })
  }
}

onMounted(async () => {
  await loadAssociations()
  if (props.editId) {
    await store.loadFormForEdit(props.editId)
    mergeArfsFromProjectNodes()
  } else {
    store.resetForm()
    if (!form.value.nodes.length) store.addNode()
  }
  formReady.value = true
})
</script>
