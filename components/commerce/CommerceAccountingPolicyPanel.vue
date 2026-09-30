<template>
  <div class="commerce-accounting-policy-panel">
    <div class="card mb-3">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div class="min-w-0">
          <h5 class="mb-0">Kebijakan Accounting Omnichannel</h5>
          <p class="mb-0 card-subtitle text-muted small mt-1">
            Menentukan kapan jurnal penjualan marketplace diproses. Perubahan hanya berlaku
            prospektif.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span v-if="!configured" class="badge bg-label-warning">Belum dikonfigurasi</span>
          <span v-else class="badge bg-label-success">Aktif v{{ policyVersion }}</span>
          <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="loading" @click="reload">
            Muat ulang
          </button>
        </div>
      </div>

      <div class="card-body mt-3">
        <div v-if="loadError" class="alert alert-warning small text-break mb-3">
          {{ loadError }}
          <button type="button" class="btn btn-link btn-sm p-0 ms-1" @click="reload">Retry</button>
        </div>

        <div v-if="!canManage" class="alert alert-secondary small mb-3">
          <i class="ri-lock-line me-1"></i>
          Hanya Finance/Admin yang dapat mengubah. Mode lihat saja.
        </div>

        <div v-if="saveNotice" class="alert alert-success small text-break mb-3">{{ saveNotice }}</div>
        <div v-if="saveError" class="alert alert-danger small text-break mb-3">{{ saveError }}</div>

        <div v-if="loading" class="text-muted small mb-3">Memuat kebijakan…</div>

        <template v-else>
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label
                class="policy-mode-card card h-100 mb-0"
                :class="{ 'policy-mode-card--active': companyMode === 'ON_ELIGIBLE_RELEASE' }"
              >
                <div class="card-body">
                  <div class="form-check mb-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="commerce-accounting-policy-mode"
                      value="ON_ELIGIBLE_RELEASE"
                      :checked="companyMode === 'ON_ELIGIBLE_RELEASE'"
                      :disabled="!canManage || saving"
                      @change="companyMode = 'ON_ELIGIBLE_RELEASE'"
                    />
                    <span class="form-check-label fw-semibold">Saat release eligible</span>
                  </div>
                  <p class="small text-muted mb-0">
                    Jurnal penjualan diproses setelah order di-release (jika snapshot valid dan syarat
                    pengakuan terpenuhi).
                  </p>
                </div>
              </label>
            </div>
            <div class="col-md-6">
              <label
                class="policy-mode-card card h-100 mb-0"
                :class="{ 'policy-mode-card--active': companyMode === 'AFTER_VERIFIED_SETTLEMENT' }"
              >
                <div class="card-body">
                  <div class="form-check mb-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="commerce-accounting-policy-mode"
                      value="AFTER_VERIFIED_SETTLEMENT"
                      :checked="companyMode === 'AFTER_VERIFIED_SETTLEMENT'"
                      :disabled="!canManage || saving"
                      @change="companyMode = 'AFTER_VERIFIED_SETTLEMENT'"
                    />
                    <span class="form-check-label fw-semibold">Setelah settlement terverifikasi</span>
                  </div>
                  <p class="small text-muted mb-0">
                    RetailSale dibentuk saat release; jurnal menunggu settlement terkait yang
                    terverifikasi. Settlement ≠ uang masuk bank.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label">Berlaku mulai</label>
              <input
                v-model="effectiveFrom"
                type="date"
                class="form-control form-control-sm"
                :disabled="!canManage || saving"
              />
            </div>
            <div class="col-md-8">
              <label class="form-label">Edit scope</label>
              <select v-model="editShopId" class="form-select form-select-sm" :disabled="!canManage || saving">
                <option value="">Default perusahaan</option>
                <option v-for="shop in shops" :key="shop.id" :value="shop.id">
                  Override: {{ shop.name }}
                </option>
              </select>
              <div class="form-text">
                Pilih toko untuk menyimpan override toko. Kosong = default perusahaan (diwarisi toko tanpa
                override).
              </div>
            </div>
          </div>

          <div class="alert alert-warning small mb-3">
            <i class="ri-alert-line me-1"></i>
            Simpan hanya berlaku untuk order berikutnya. Backlog tidak otomatis di-release/posting.
          </div>

          <div class="d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!canManage || saving || loading || !companyMode"
              @click="onSave"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              />
              {{ saving ? 'Menyimpan…' : editShopId ? 'Simpan override toko' : 'Simpan default perusahaan' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { usePermissions } from '~/composables/usePermissions'
import { readAccessToken } from '~/utils/authCookie'
import type { CommerceAccountingPolicyMode } from '~/utils/commerceAccountingStatus'

type ShopRow = { id: string; name: string; platformCode?: string; status?: string }

const { $api } = useNuxtApp() as any
const { companyId } = useActiveCompany()
const { userHasPermission, userHasRole } = usePermissions()

/** Matches BE assertPerm: manage_finance | create_journal | approve_journal (+ admin). */
const canManage = computed(
  () =>
    userHasRole('admin') ||
    userHasRole('superadmin') ||
    userHasPermission('manage_commerce_accounting_policy') ||
    userHasPermission('manage_finance') ||
    userHasPermission('create_journal') ||
    userHasPermission('approve_journal')
)

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const saveNotice = ref('')
const configured = ref(false)
const policyVersion = ref<number | null>(null)

const shops = ref<ShopRow[]>([])
const companyMode = ref<CommerceAccountingPolicyMode>('ON_ELIGIBLE_RELEASE')
const effectiveFrom = ref(new Date().toISOString().slice(0, 10))
const editShopId = ref('')

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) {
    h['X-Active-Company-Id'] = String(companyId.value)
    h['X-Company-Id'] = String(companyId.value)
  }
  return h
}

async function loadShops() {
  if (!companyId.value) return
  try {
    const qs = new URLSearchParams({ perusahaanId: String(companyId.value), page: '1', perPage: '100' })
    const res = await fetch(`${$api.commerceShops()}?${qs}`, { headers: headers(), credentials: 'include' })
    const json = await res.json().catch(() => ({}))
    shops.value = res.ok
      ? (json.data || []).filter((s: ShopRow) => String(s.status || '').toUpperCase() === 'ACTIVE')
      : []
  } catch {
    shops.value = []
  }
}

async function loadPolicy() {
  if (!companyId.value) return
  loading.value = true
  loadError.value = ''
  try {
    const qs = editShopId.value ? `shopId=${encodeURIComponent(editShopId.value)}` : ''
    const res = await fetch($api.commerceAccountingPolicyGet(qs), {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      loadError.value =
        json?.message ||
        `Kebijakan accounting belum tersedia (HTTP ${res.status}).`
      configured.value = false
      policyVersion.value = null
      return
    }
    const data = json.data || {}
    configured.value = Boolean(data.configured)
    const policy = data.policy || null
    policyVersion.value = policy?.version ?? null
    if (policy?.postingTrigger === 'AFTER_VERIFIED_SETTLEMENT') {
      companyMode.value = 'AFTER_VERIFIED_SETTLEMENT'
    } else if (policy?.postingTrigger === 'ON_ELIGIBLE_RELEASE') {
      companyMode.value = 'ON_ELIGIBLE_RELEASE'
    }
    if (policy?.effectiveFrom) {
      const raw = String(policy.effectiveFrom)
      // Prefer YYYY-MM-DD; never keep Date.toString() fragments like "Tue Sep 29"
      effectiveFrom.value = /^\d{4}-\d{2}-\d{2}/.test(raw)
        ? raw.slice(0, 10)
        : new Date(raw).toISOString().slice(0, 10)
    }
  } catch (e: any) {
    loadError.value = e?.message || 'Kebijakan accounting tidak dapat dimuat.'
  } finally {
    loading.value = false
  }
}

async function reload() {
  await Promise.all([loadShops(), loadPolicy()])
}

async function onSave() {
  if (!canManage.value || saving.value || !companyId.value || !companyMode.value) return
  saving.value = true
  saveError.value = ''
  saveNotice.value = ''
  try {
    const body = {
      postingTrigger: companyMode.value,
      effectiveFrom: /^\d{4}-\d{2}-\d{2}/.test(String(effectiveFrom.value || ''))
        ? String(effectiveFrom.value).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      shopId: editShopId.value || null,
    }
    const res = await fetch($api.commerceAccountingPolicyPut(), {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      throw new Error(json?.message || `Kebijakan gagal disimpan (HTTP ${res.status}).`)
    }
    saveNotice.value =
      'Kebijakan tersimpan untuk order berikutnya. Backlog order yang sudah ada tidak diubah.'
    await loadPolicy()
  } catch (e: any) {
    saveError.value = e?.message || 'Kebijakan accounting gagal disimpan.'
  } finally {
    saving.value = false
  }
}

watch(companyId, () => {
  if (companyId.value) void reload()
})

watch(editShopId, () => {
  void loadPolicy()
})

onMounted(() => {
  if (companyId.value) void reload()
})
</script>

<style scoped>
.policy-mode-card {
  cursor: pointer;
  border-width: 2px;
  transition: border-color 0.15s ease;
}
.policy-mode-card--active {
  border-color: var(--bs-primary, #696cff);
}
</style>
