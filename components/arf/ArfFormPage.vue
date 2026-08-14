<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div v-if="!formReady && loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat…</span>
        </div>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
          <div>
            <h4 class="mb-1">{{ pageTitle }}</h4>
            <PageBreadcrumb class="mt-1" :current-label="pageTitle" />
            <p class="mb-0 text-muted small">{{ pageSubtitle }}</p>
          </div>
          <NuxtLink to="/implementation/arf" class="btn btn-outline-secondary btn-sm">
            <i class="ri-arrow-left-line me-1"></i>Kembali
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div class="col-xl-8 col-12">
            <div class="card">
              <div class="card-header border-0 bg-transparent py-3">
                <h5 class="card-title mb-0">Form Advanced Request Form</h5>
              </div>
              <div class="card-body pt-0">
                <form ref="formRoot" @submit.prevent="onFormSubmit" novalidate>
                  <TabbedFormNav
                    :steps="visibleSteps"
                    :current-index="currentIndex"
                    :disabled="navigating || saving"
                    @select="goTo"
                  />

                  <div class="tab-content pt-4">
                    <div id="arf-tab-info" data-step-id="arf-tab-info" class="tab-pane fade" :class="paneClass('arf-tab-info')">
                      <div class="row mb-3">
                        <label class="col-sm-3 col-form-label">Tanggal Pengajuan</label>
                        <div class="col-sm-9">
                          <input v-model="form.requestDate" type="date" class="form-control" />
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

                    <div id="arf-tab-items" data-step-id="arf-tab-items" class="tab-pane fade" :class="paneClass('arf-tab-items')">
                      <div v-if="uiErrors.arfItems || uiErrors.description || uiErrors.quantity" class="alert alert-danger py-2 mb-3">
                        <i class="ri-error-warning-line me-1"></i>{{ uiErrors.arfItems || uiErrors.description || uiErrors.quantity }}
                      </div>
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
                            <FormLabel required>Deskripsi Kebutuhan</FormLabel>
                            <textarea
                              :value="row.description"
                              class="form-control"
                              rows="2"
                              aria-required="true"
                              @input="arfStore.updateItemField(idx, 'description', ($event.target as HTMLTextAreaElement).value)"
                            />
                          </div>
                          <div class="col-md-3">
                            <FormLabel required>Qty</FormLabel>
                            <input
                              :value="row.qty"
                              type="number"
                              min="0.01"
                              step="any"
                              class="form-control"
                              aria-required="true"
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

                    <div id="arf-tab-employees" data-step-id="arf-tab-employees" class="tab-pane fade" :class="paneClass('arf-tab-employees')">
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

                  <TabbedFormActions
                    :is-first-step="isFirstStep"
                    :is-last-step="isLastStep"
                    :loading="navigating"
                    :saving="saving"
                    cancel-href="/implementation/arf"
                    @next="next"
                    @previous="previous"
                  />
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
import TabbedFormNav from '~/components/form/TabbedFormNav.vue'
import TabbedFormActions from '~/components/form/TabbedFormActions.vue'
import FormLabel from '~/components/form/FormLabel.vue'
import { useTabbedFormNavigation } from '~/composables/useTabbedFormNavigation'
import { routeSaveFailure } from '~/utils/apiError'
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
const formRoot = ref<HTMLFormElement | null>(null)
const uiErrors = ref<Record<string, string>>({})
const formSteps = computed(() => [
  { id: 'arf-tab-info', label: 'Informasi', icon: 'ri-information-line' },
  { id: 'arf-tab-items', label: 'Item Budget', icon: 'ri-list-check', badge: itemCount.value || null },
  { id: 'arf-tab-employees', label: 'Pegawai', icon: 'ri-team-line', badge: employeeCount.value || null },
])
function validateArfStep(step: { id: string }): boolean {
  uiErrors.value = {}
  if (step.id !== 'arf-tab-items') return true
  const items = form.value?.arfItems || []
  const validItems = items.filter((i) => String(i.description || '').trim() && Number(i.qty) > 0)
  if (validItems.length < 1) {
    const hasDescNoQty = items.some((i) => String(i.description || '').trim() && !(Number(i.qty) > 0))
    const hasQtyNoDesc = items.some((i) => Number(i.qty) > 0 && !String(i.description || '').trim())
    if (hasDescNoQty) uiErrors.value.quantity = 'Quantity minimal 1.'
    else if (hasQtyNoDesc) uiErrors.value.description = 'Deskripsi wajib diisi.'
    else uiErrors.value.arfItems = 'Minimal satu item harus ditambahkan.'
  }
  return Object.keys(uiErrors.value).length === 0
}
const {
  currentIndex,
  visibleSteps,
  isFirstStep,
  isLastStep,
  navigating,
  next,
  previous,
  goTo,
  goToId,
  paneClass,
  validateAll,
} = useTabbedFormNavigation({ steps: formSteps, formRoot, validateStep: validateArfStep })
const ARF_FIELD_TABS: Record<string, string> = {
  siteInvestmentId: 'arf-tab-info',
  type: 'arf-tab-info',
  arfItems: 'arf-tab-items',
  description: 'arf-tab-items',
  quantity: 'arf-tab-items',
  arfEmployees: 'arf-tab-employees',
  pegawaiId: 'arf-tab-employees',
}

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

async function onFormSubmit() {
  if (!isLastStep.value) {
    await next()
    return
  }
  if (!(await validateAll())) return
  await handleSubmit()
}

async function handleSubmit() {
  const ok = await arfStore.saveArf()
  if (ok) {
    const id = arfStore.form.id
    if (id) await router.push(`/implementation/arf/detail/${id}`)
    else await router.push('/implementation/arf')
    return
  }
  routeSaveFailure(arfStore.validationErrors, uiErrors.value, ARF_FIELD_TABS, goToId)
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
