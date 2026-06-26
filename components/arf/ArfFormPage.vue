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
              <NuxtLink to="/implementation/arf" class="text-muted small text-decoration-none">ARF</NuxtLink>
              <span class="text-muted small">/</span>
              <span class="text-muted small">{{ pageTitle }}</span>
            </div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/implementation/arf" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card shadow-sm border-0">
              <div class="card-header border-0 bg-transparent py-3">
                <h5 class="card-title mb-0">Form Advanced Request Form</h5>
              </div>
              <div class="card-body pt-0">
                <form @submit.prevent="handleSubmit">
                  <ul class="nav nav-tabs mb-0" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active" type="button" data-bs-toggle="tab" data-bs-target="#arf-tab-info">
                        <i class="ri-information-line me-1"></i>Informasi
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" type="button" data-bs-toggle="tab" data-bs-target="#arf-tab-items">
                        <i class="ri-list-check me-1"></i>
                        Item Budget
                        <span v-if="itemCount" class="badge bg-primary ms-1">{{ itemCount }}</span>
                      </button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" type="button" data-bs-toggle="tab" data-bs-target="#arf-tab-employees">
                        <i class="ri-team-line me-1"></i>
                        Pegawai
                        <span v-if="employeeCount" class="badge bg-primary ms-1">{{ employeeCount }}</span>
                      </button>
                    </li>
                  </ul>

                  <div class="tab-content pt-4">
                    <div id="arf-tab-info" class="tab-pane fade show active">
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Pengajuan</label>
                        <div class="col-sm-9">
                          <input v-model="form.requestDate" type="date" class="form-control" required />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tipe</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.type"
                            :options="typeOptions"
                            :get-option-label="(o) => o.label"
                            :reduce="(o) => o.value"
                            searchable
                            clearable
                            placeholder="Pilih tipe"
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
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Departemen</label>
                        <div class="col-sm-9">
                          <CustomSelect2
                            v-model="form.departmentId"
                            :options="departemens"
                            :get-option-label="(d) => d?.nm_departemen || d?.nmDepartemen || ''"
                            :reduce="(d) => d?.id"
                            searchable
                            clearable
                            placeholder="Pilih departemen"
                          />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Mata Uang</label>
                        <div class="col-sm-9">
                          <input v-model="form.currency" type="text" class="form-control" maxlength="8" />
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Catatan</label>
                        <div class="col-sm-9">
                          <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Catatan tambahan"></textarea>
                        </div>
                      </div>
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Lampiran (URL)</label>
                        <div class="col-sm-9">
                          <input v-model="form.attachment" type="text" class="form-control" placeholder="Path atau URL lampiran" />
                        </div>
                      </div>
                    </div>

                    <div id="arf-tab-items" class="tab-pane fade">
                      <div class="d-flex justify-content-between align-items-center mb-4">
                        <p class="mb-0 text-muted small">Rincian kebutuhan budget per kategori.</p>
                        <button type="button" class="btn btn-sm btn-primary" @click="arfStore.addItem()">
                          <i class="ri-add-line me-1"></i>Tambah Item
                        </button>
                      </div>

                      <div v-if="!form.arfItems.length" class="text-center py-5 border rounded text-muted">
                        <i class="ri-inbox-line fs-3 d-block mb-2"></i>
                        Belum ada item. Klik <strong>Tambah Item</strong>.
                      </div>

                      <div
                        v-for="(row, idx) in form.arfItems"
                        :key="idx"
                        class="border rounded mb-3 p-3"
                      >
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <strong>Item #{{ idx + 1 }}</strong>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="arfStore.removeItem(idx)">
                            <i class="ri-delete-bin-line"></i>
                          </button>
                        </div>
                        <div class="row g-3">
                          <div class="col-md-12">
                            <label class="form-label">Kategori Budget</label>
                            <CustomSelect2
                              :model-value="row.budgetId"
                              :options="budgets"
                              :get-option-label="budgetLabel"
                              :reduce="(b) => b?.id"
                              searchable
                              clearable
                              placeholder="Pilih budget"
                              @update:model-value="arfStore.updateItemField(idx, 'budgetId', $event)"
                            />
                          </div>
                          <div class="col-12">
                            <label class="form-label">Deskripsi Kebutuhan</label>
                            <textarea
                              :value="row.description"
                              class="form-control"
                              rows="2"
                              required
                              @input="arfStore.updateItemField(idx, 'description', ($event.target as HTMLTextAreaElement).value)"
                            />
                          </div>
                          <div class="col-md-3">
                            <label class="form-label">Qty</label>
                            <input
                              :value="row.qty"
                              type="number"
                              min="0.01"
                              step="any"
                              class="form-control"
                              @input="arfStore.updateItemField(idx, 'qty', Number(($event.target as HTMLInputElement).value))"
                            />
                          </div>
                          <div class="col-md-3">
                            <label class="form-label">Satuan</label>
                            <input
                              :value="row.unit"
                              type="text"
                              class="form-control"
                              placeholder="orang/hari/unit"
                              @input="arfStore.updateItemField(idx, 'unit', ($event.target as HTMLInputElement).value)"
                            />
                          </div>
                          <div class="col-md-3">
                            <label class="form-label">Harga Satuan</label>
                            <input
                              :value="row.unitPrice"
                              type="number"
                              min="0"
                              step="any"
                              class="form-control"
                              @input="arfStore.updateItemField(idx, 'unitPrice', Number(($event.target as HTMLInputElement).value))"
                            />
                          </div>
                          <div class="col-md-3">
                            <label class="form-label">Subtotal</label>
                            <input :value="formatRupiah(row.subtotal)" type="text" class="form-control" readonly />
                          </div>
                          <div class="col-12">
                            <label class="form-label">Catatan Item</label>
                            <input
                              :value="row.notes"
                              type="text"
                              class="form-control"
                              @input="arfStore.updateItemField(idx, 'notes', ($event.target as HTMLInputElement).value)"
                            />
                          </div>
                        </div>
                      </div>

                      <div class="text-end mt-3">
                        <span class="text-muted me-2">Total item budget:</span>
                        <strong class="text-primary fs-5">{{ formatRupiah(formItemsTotal) }}</strong>
                      </div>
                    </div>

                    <div id="arf-tab-employees" class="tab-pane fade">
                      <div class="d-flex justify-content-between align-items-center mb-4">
                        <p class="mb-0 text-muted small">Rincian pegawai freelance dan nominal gaji terkait ARF.</p>
                        <button type="button" class="btn btn-sm btn-primary" @click="arfStore.addEmployee()">
                          <i class="ri-add-line me-1"></i>Tambah Pegawai
                        </button>
                      </div>

                      <div v-if="!form.arfEmployees.length" class="text-center py-5 border rounded text-muted">
                        <i class="ri-user-line fs-3 d-block mb-2"></i>
                        Belum ada pegawai. Klik <strong>Tambah Pegawai</strong>.
                      </div>

                      <div
                        v-for="(row, idx) in form.arfEmployees"
                        :key="idx"
                        class="border rounded mb-3 p-3"
                      >
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <strong>Pegawai #{{ idx + 1 }}</strong>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="arfStore.removeEmployee(idx)">
                            <i class="ri-delete-bin-line"></i>
                          </button>
                        </div>
                        <div class="row g-3">
                          <div class="col-md-8">
                            <label class="form-label">Pegawai</label>
                            <CustomSelect2
                              :model-value="row.pegawaiId"
                              :options="pegawaiOptions"
                              :get-option-label="pegawaiLabel"
                              :reduce="getPegawaiId"
                              searchable
                              clearable
                              placeholder="Pilih pegawai"
                              @update:model-value="arfStore.updateEmployeeField(idx, 'pegawaiId', $event)"
                            />
                          </div>
                          <div class="col-md-4">
                            <label class="form-label">Nominal Gaji</label>
                            <input
                              :value="formatRupiah(row.salaryAmount)"
                              type="text"
                              inputmode="numeric"
                              class="form-control"
                              placeholder="Rp 0"
                              @input="onEmployeeSalaryInput(idx, $event)"
                            />
                          </div>
                          <div class="col-12">
                            <label class="form-label">Catatan</label>
                            <input
                              :value="row.notes"
                              type="text"
                              class="form-control"
                              placeholder="Catatan pegawai (opsional)"
                              @input="arfStore.updateEmployeeField(idx, 'notes', ($event.target as HTMLInputElement).value)"
                            />
                          </div>
                        </div>
                      </div>

                      <div class="text-end mt-3">
                        <span class="text-muted me-2">Total gaji:</span>
                        <strong class="text-primary fs-5">{{ formatRupiah(formEmployeesTotal) }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="text-end mt-3 pt-2 border-top">
                    <span class="text-muted me-2">Total keseluruhan (item + gaji):</span>
                    <strong class="text-primary fs-5">{{ formatRupiah(formGrandTotal) }}</strong>
                  </div>

                  <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <NuxtLink to="/implementation/arf" class="btn btn-outline-secondary">Batal</NuxtLink>
                    <button type="submit" class="btn btn-primary" :disabled="saving">
                      <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="col-xl-4">
            <FormPageSidebar
              nav-title="Modul Implementation"
              :nav-items="IMPLEMENTATION_MODULE_NAV"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { parseRupiahToNumber } from '~/composables/formatRupiah'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useArfStore, ARF_TYPE_OPTIONS } from '~/stores/arf'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import FormPageSidebar from '~/components/form/FormPageSidebar.vue'
import { IMPLEMENTATION_MODULE_NAV } from '~/constants/implementation/formNav'
import { apiFetch } from '~/utils/apiFetch'

const route = useRoute()
const router = useRouter()
const arfStore = useArfStore()
const formatRupiah = useFormatRupiah()
const { form, loading, saving, isEditMode } = storeToRefs(arfStore)
const formGrandTotal = computed(() => arfStore.formGrandTotal)
const formItemsTotal = computed(() => arfStore.formItemsTotal)
const formEmployeesTotal = computed(() => arfStore.formEmployeesTotal)

const formReady = ref(false)
const departemens = ref<any[]>([])
const budgets = ref<any[]>([])
/** status_pegawai: 3 = Freelance */
const PEGAWAI_STATUS_FREELANCE = 3

const pegawais = ref<any[]>([])
const siteInvestments = ref<any[]>([])
const typeOptions = ARF_TYPE_OPTIONS

const editId = computed(() => {
  const p = route.params.id
  if (!p || (Array.isArray(p) && !p[0])) return null
  const id = Array.isArray(p) ? p[0] : p
  return id && id !== 'undefined' ? id : null
})

const pageTitle = computed(() => (isEditMode.value ? 'Edit ARF' : 'Buat ARF'))
const pageSubtitle = computed(() =>
  isEditMode.value ? 'Perbarui pengajuan budget project' : 'Pengajuan budget untuk project implementation'
)
const itemCount = computed(() => form.value.arfItems.length)
const employeeCount = computed(() => form.value.arfEmployees.length)

/** Freelance + pegawai terpilih saat edit (jika bukan freelance). */
const pegawaiOptions = computed(() => {
  const map = new Map<number, Record<string, unknown>>()
  for (const p of pegawais.value) {
    const id = getPegawaiId(p)
    if (id) map.set(Number(id), p)
  }
  for (const row of form.value.arfEmployees) {
    const id = Number(row.pegawaiId)
    if (!id || map.has(id)) continue
    const p = row.pegawai
    map.set(id, {
      id_pegawai: id,
      nm_pegawai: p?.nm_pegawai ?? p?.nmPegawai ?? `Pegawai #${id}`,
      nik_pegawai: p?.nik_pegawai ?? p?.nikPegawai ?? '',
      status_pegawai: p?.status_pegawai ?? p?.statusPegawai,
    })
  }
  return [...map.values()].sort((a, b) =>
    String(a.nm_pegawai ?? a.nmPegawai ?? '').localeCompare(String(b.nm_pegawai ?? b.nmPegawai ?? ''), 'id')
  )
})

function onEmployeeSalaryInput(idx: number, event: Event) {
  const raw = (event.target as HTMLInputElement).value
  arfStore.updateEmployeeField(idx, 'salaryAmount', parseRupiahToNumber(raw))
}

function pegawaiLabel(p: any) {
  if (!p) return ''
  const name = p.nm_pegawai || p.nmPegawai || ''
  const nik = p.nik_pegawai || p.nikPegawai || ''
  return nik ? `${name} (${nik})` : name
}

function getPegawaiId(p: any) {
  if (!p) return null
  return p.id_pegawai ?? p.idPegawai ?? p.id ?? null
}

function budgetLabel(b: any) {
  if (!b) return ''
  return `${b.budgetCode || b.budget_code || ''} - ${b.budgetName || b.budget_name || ''}`
}

function siteInvestLabel(s: any) {
  if (!s) return ''
  const no = s.siNumber || s.si_number || ''
  const name = s.name || ''
  return no ? `${no} — ${name}` : name || s.id
}

async function loadAssociations() {
  const { $api } = useNuxtApp()
  const headers = { Accept: 'application/json' }
  const [deptRes, budgetRes, pegawaiRes, siRes] = await Promise.all([
    fetch($api.dataDepartemen(), { headers, credentials: 'include' })
      .then((r) => r.json())
      .catch(() => []),
    apiFetch($api.dataBudget()).catch(() => []),
    apiFetch($api.dataPegawai(PEGAWAI_STATUS_FREELANCE)).catch(() => []),
    fetch(`${$api.siteInvestment()}?rows=500`, { headers, credentials: 'include' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
  ])
  const deptJson = Array.isArray(deptRes) ? deptRes : deptRes?.data ?? deptRes
  departemens.value = Array.isArray(deptJson) ? deptJson : []
  budgets.value = Array.isArray(budgetRes) ? budgetRes : budgetRes?.data ?? []
  const pegawaiJson = Array.isArray(pegawaiRes) ? pegawaiRes : pegawaiRes?.data ?? pegawaiRes
  pegawais.value = Array.isArray(pegawaiJson) ? pegawaiJson : []
  siteInvestments.value = siRes?.data ?? []
}

async function handleSubmit() {
  const ok = await arfStore.saveArf()
  if (ok) {
    const id = arfStore.form.id
    if (id) await router.push(`/implementation/arf/detail/${id}`)
    else await router.push('/implementation/arf')
  }
}

onMounted(async () => {
  await loadAssociations()
  if (editId.value) {
    await arfStore.fetchArfForEdit(editId.value)
  } else {
    arfStore.resetForm()
    arfStore.addItem()
  }
  formReady.value = true
})
</script>
