<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="container-xxl flex-grow-1 container-p-y">
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Memuat detail Pricing...</p>
          </div>
        </div>

        <div v-else-if="error && !row" class="alert alert-danger">
          <i class="ri-error-warning-line me-2"></i>
          {{ error }}
          <NuxtLink to="/sales/pricing" class="alert-link ms-2">Kembali ke Daftar</NuxtLink>
        </div>

        <template v-else-if="row">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div class="d-flex flex-wrap align-items-center gap-3">
              <NuxtLink to="/sales/pricing" class="btn btn-outline-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Kembali
              </NuxtLink>
              <div class="d-flex flex-column">
                <h4 class="mb-0 fw-semibold">{{ row.code || '—' }}</h4>
                <PageBreadcrumb class="mt-1" :current-label="row.code || '—'" />
                <small class="text-muted">ID: {{ row.id }}</small>
              </div>
              <span :class="statusBadge(row.status).class">{{ statusBadge(row.status).text }}</span>
              <span class="badge bg-label-primary">{{ channelLabel(row.channel) }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-if="row.status === 'draft' && canCreate"
                type="button"
                class="btn btn-outline-secondary btn-sm"
                @click="navigateTo(`/sales/pricing/form/${row.id}`)"
              >
                <i class="ri-edit-box-line me-1"></i> Edit
              </button>
              <button
                v-if="canCreate"
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="showDuplicateModal = true"
              >
                <i class="ri-file-copy-line me-1"></i> Duplikat sebagai Draft
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="btn btn-outline-danger btn-sm"
                @click="confirmDelete"
              >
                <i class="ri-delete-bin-7-line me-1"></i> Hapus
              </button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger text-break mb-4">{{ error }}</div>

          <div class="row g-4">
            <div class="col-xl-8 col-12">
              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-information-line me-2 text-primary"></i>
                    Informasi Pricing
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Kode</label>
                      <p class="mb-0 fw-medium">{{ row.code || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Kanal</label>
                      <p class="mb-0">{{ channelLabel(row.channel) }}</p>
                    </div>
                    <div v-if="isMarketplace(row.channel)" class="col-md-6">
                      <label class="form-label text-muted medium">Shop Marketplace</label>
                      <p class="mb-0">
                        {{ row.shop?.name || (row.shopId ? `#${row.shopId}` : 'Belum di-assign') }}
                      </p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Mata Uang</label>
                      <p class="mb-0">{{ row.currency || 'IDR' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Perusahaan</label>
                      <p class="mb-0">{{ companyLabel }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Berlaku Dari</label>
                      <p class="mb-0">{{ dateOf(row.validFrom) || '—' }}</p>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted medium">Berlaku Sampai</label>
                      <p class="mb-0">{{ dateOf(row.validTo) || 'Terbuka' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-4">
                <div class="card-header border-0 bg-transparent px-5 py-4">
                  <h5 class="card-title mb-0 d-flex align-items-center">
                    <i class="ri-list-check me-2 text-primary"></i>
                    Baris Harga Produk
                  </h5>
                </div>
                <hr class="mx-5 my-0" style="border-width: 2px;">
                <div class="card-body px-5 pt-4 pb-5">
                  <div v-if="!(row.lines && row.lines.length)" class="text-muted text-center py-4">
                    Belum ada baris harga
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th style="width: 60px">#</th>
                          <th>SKU</th>
                          <th>Produk</th>
                          <th>Jenis</th>
                          <th>Satuan</th>
                          <th class="text-end">Harga Resmi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(ln, index) in row.lines" :key="ln.id || index">
                          <td>{{ index + 1 }}</td>
                          <td>{{ ln.product?.sku || ln.productId || '—' }}</td>
                          <td class="text-break">{{ ln.product?.name || '—' }}</td>
                          <td>
                            <span
                              v-if="ln.product?.isBundling || ln.product?.isKit"
                              class="badge bg-label-info"
                            >Bundling</span>
                            <span v-else class="badge bg-label-secondary">Satuan</span>
                          </td>
                          <td>{{ ln.unit?.name || ln.unit?.symbol || ln.unitId || '—' }}</td>
                          <td class="text-end">{{ formatMoney(ln.officialUnitPrice) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-4 col-12">
              <div class="card">
                <div class="card-header border-0 bg-transparent px-4 py-3">
                  <h6 class="mb-0">Ringkasan</h6>
                </div>
                <div class="card-body px-4 pt-0">
                  <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Status</span>
                    <span :class="statusBadge(row.status).class">{{ statusBadge(row.status).text }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Jumlah baris</span>
                    <span class="fw-medium">{{ (row.lines || []).length }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-2">
                    <span class="text-muted">Kanal</span>
                    <span class="fw-medium">{{ channelLabel(row.channel) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <PricingDuplicateModal
      :show="showDuplicateModal"
      :source-code="row?.code"
      :source-channel="row ? normalizePricingChannel(row.channel) : null"
      :busy="pricingStore.duplicating"
      :error="duplicateError"
      @cancel="showDuplicateModal = false"
      @confirm="onConfirmDuplicate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { usePricingStore } from '~/stores/pricing'
import { formatActiveCompanyLabel } from '~/utils/activeCompanyBinding'
import { readAccessToken } from '~/utils/authCookie'
import {
  normalizePricingChannel,
  pricingChannelLabel,
  type PricingChannel,
} from '~/utils/pricingChannel'
import PageBreadcrumb from '~/components/PageBreadcrumb.vue'
import PricingDuplicateModal from '~/components/pricing/PricingDuplicateModal.vue'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Detail Pricing',
})

const route = useRoute()
const { setDetailTitle } = useDynamicTitle()
const { userHasPermission, userHasRole } = usePermissions()
const { companyId, company, allowedCompanies, ensureBootstrapped } = useActiveCompany()
void ensureBootstrapped()

const loading = ref(true)
const error = ref('')
const row = ref<any | null>(null)
const pricingStore = usePricingStore()
const showDuplicateModal = ref(false)
const duplicateError = ref('')

function channelLabel(channel: string | null | undefined) {
  return pricingChannelLabel(channel)
}

function isMarketplace(channel: string | null | undefined) {
  return normalizePricingChannel(channel) === 'MARKETPLACE'
}

async function onConfirmDuplicate(targetChannel: PricingChannel) {
  if (!row.value) return
  duplicateError.value = ''
  const newId = await pricingStore.duplicateDraft(row.value.id, targetChannel, companyId.value)
  if (!newId) {
    duplicateError.value = pricingStore.error || 'Duplikasi draft gagal.'
    return
  }
  showDuplicateModal.value = false
  await navigateTo(`/sales/pricing/form/${newId}`)
}

const canCreate = computed(
  () => userHasRole('admin') || userHasRole('superadmin') || userHasPermission('create_product_price_list')
)
const canDelete = computed(() => {
  if (!row.value) return false
  if (userHasRole('superadmin')) return true
  return userHasPermission('delete_product_price_list') && row.value.status === 'draft'
})

const companyLabel = computed(() => {
  const id = row.value?.perusahaanId ?? row.value?.perusahaan_id
  if (id == null) return '—'
  for (const c of allowedCompanies.value) {
    if (c.id === Number(id)) return formatActiveCompanyLabel({ name: c.name, code: c.code }, c.id)
  }
  if (company.value && companyId.value === Number(id)) {
    return formatActiveCompanyLabel(company.value, companyId.value)
  }
  return `Perusahaan #${id}`
})

function dateOf(value: unknown) {
  return value ? String(value).slice(0, 10) : ''
}

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function statusBadge(status: string) {
  const map: Record<string, { class: string; text: string }> = {
    draft: { class: 'badge bg-label-secondary', text: 'Draft' },
    pending: { class: 'badge bg-label-warning', text: 'Pending' },
    approved: { class: 'badge bg-label-info', text: 'Approved' },
    active: { class: 'badge bg-label-success', text: 'Active' },
    inactive: { class: 'badge bg-label-danger', text: 'Inactive' },
  }
  return map[status] || { class: 'badge bg-label-secondary', text: status || '—' }
}

function headers() {
  const token = readAccessToken()
  const h: Record<string, string> = { Accept: 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) h['X-Company-Id'] = String(companyId.value)
  return h
}

async function load() {
  loading.value = true
  error.value = ''
  const id = Number(route.params.id)
  if (!id) {
    error.value = 'ID daftar harga tidak valid.'
    loading.value = false
    return
  }
  const { $api } = useNuxtApp()
  try {
    const res = await fetch(`${$api.productSellingPrices()}/${id}`, {
      headers: headers(),
      credentials: 'include',
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = payload?.message || 'Detail pricing tidak dapat dimuat.'
      row.value = null
      return
    }
    row.value = payload.data || null
    setDetailTitle('Pricing', row.value?.code || String(id))
  } catch (err: any) {
    error.value = err?.message || 'Detail pricing tidak dapat dimuat.'
    row.value = null
  } finally {
    loading.value = false
  }
}

async function confirmDelete() {
  if (!row.value) return
  const Swal = (await import('sweetalert2')).default
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Daftar harga ${row.value.code || row.value.id} akan dihapus dan tidak dapat dikembalikan.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#008fec',
    cancelButtonColor: '#f13636',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
  })
  if (!result.isConfirmed) return

  const { $api } = useNuxtApp()
  const res = await fetch(`${$api.productSellingPrices()}/${row.value.id}`, {
    method: 'DELETE',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    error.value = payload?.message || 'Daftar harga gagal dihapus.'
    return
  }
  await navigateTo('/sales/pricing')
}

onMounted(() => {
  void load()
})
</script>
