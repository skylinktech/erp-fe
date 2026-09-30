<template>
  <OmnichannelShell
    title="List Product Marketplace"
    subtitle="Draft publikasi + cache listing marketplace — tidak menimpa Product Master / Price List"
  >
    <div class="card mb-3 commerce-produk-filter-card">
      <div class="card-body pb-0">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 class="h5 mb-0">Product</h2>
        </div>
        <WorkspaceTabs
          id-prefix="produk-tabs"
          embedded
          :tabs="workspaceTabs"
          :model-value="activeTab"
          @update:model-value="onWorkspaceTab"
        />
      </div>

      <hr class="my-0" />

      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-lg-4">
            <label class="form-label" for="produk-q">Cari</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="ri-search-line" aria-hidden="true" /></span>
              <input
                id="produk-q"
                v-model="q"
                type="search"
                class="form-control form-control-sm"
                placeholder="Judul / seller SKU / product ID"
                @keyup.enter="applyFilters"
              />
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <label class="form-label" for="produk-shop">Toko</label>
            <select id="produk-shop" v-model="selectedShopId" class="form-select form-select-sm">
              <option value="">Semua</option>
              <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <label class="form-label" for="produk-mapped">Mapped</label>
            <select id="produk-mapped" v-model="mappedFilter" class="form-select form-select-sm">
              <option value="">Semua</option>
              <option value="mapped">Mapped</option>
              <option value="unmapped">Belum mapped</option>
            </select>
          </div>
          <div class="col-12 col-md-4 col-lg-3">
            <label class="form-label d-none d-md-block" aria-hidden="true">&nbsp;</label>
            <div class="filter-sort-actions d-flex flex-wrap gap-2">
              <CommerceActionButton
                action="reset"
                icon="ri-refresh-line"
                btn-class="btn btn-sm btn-outline-secondary filter-action-btn"
                :busy="loading"
                @click="resetFilters"
              />
              <CommerceActionButton
                action="filter"
                icon="ri-filter-3-line"
                btn-class="btn btn-sm btn-outline-secondary filter-action-btn"
                :busy="loading"
                @click="applyFilters"
              />
            </div>
          </div>
        </div>
        <p class="form-text small mb-0 mt-2">
          Draft override konten listing; sync marketplace tidak menimpa Product Master.
        </p>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger text-break mb-3">{{ error }}</div>
    <div v-if="actionMsg" class="alert alert-info small text-break mb-3">{{ actionMsg }}</div>
    <div v-if="loading && (drafts.length || listings.length)" class="text-muted small mb-2" aria-live="polite">
      Memperbarui…
    </div>
    <div v-else-if="loading" class="text-muted small mb-2">Memuat…</div>

    <!-- Drafts -->
    <div v-show="activeTab === 'drafts'" class="card mb-3">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 class="h6 mb-0">Draft listing (satu produk–satu toko)</h2>
            <p class="small text-muted mb-0">
              Judul/deskripsi/media boleh beda dari master. Sync tidak menimpa draft.
            </p>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="!selectedShopId || !companyId"
            @click="openPublishModal"
          >
            Publikasikan ke Marketplace
          </button>
        </div>

        <div v-if="!drafts.length" class="text-muted">Belum ada draft — buka dari Product Master atau tombol di atas.</div>
        <div v-else class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Job lokal</th>
                <th>Platform</th>
                <th>Dirty</th>
                <th>External ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in drafts" :key="d.id">
                <td class="text-break">
                  <div class="fw-semibold">{{ d.title }}</div>
                  <div class="small text-muted">product #{{ d.productId }}</div>
                </td>
                <td>
                  <span class="badge" :class="commerceStatusBadge(d.draftStatus)">{{ d.draftStatus }}</span>
                </td>
                <td>
                  <span class="badge" :class="commerceStatusBadge(d.platformStatus)">
                    {{ d.platformStatus || '—' }}
                  </span>
                </td>
                <td class="small">
                  <span v-if="d.contentDirty" class="badge bg-label-warning me-1">konten</span>
                  <span v-if="d.priceDirty" class="badge bg-label-warning">harga</span>
                  <span v-if="!d.contentDirty && !d.priceDirty">—</span>
                </td>
                <td class="font-monospace small">{{ d.externalProductId || '—' }}</td>
                <td class="text-nowrap text-end">
                  <CommerceRowActionsMenu
                    :busy="actions.isTargetBusy(d.id)"
                    :busy-label="actions.labelOf(actions.busyActionForTarget(d.id) || 'validate', d.id)"
                    :actions="draftRowActions(d)"
                    aria-label="Aksi draft"
                    @select="(key) => onDraftRowAction(key, d)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CommerceListPagination
          :page="draftPage"
          :per-page="draftPerPage"
          :meta="draftMeta"
          :disabled="loading"
          id-prefix="drafts"
          @update:page="onDraftPage"
          @update:per-page="onDraftPerPage"
        />
      </div>
    </div>

    <!-- Cache listings -->
    <div v-show="activeTab === 'cache'" class="card">
      <div class="card-body">
        <ExternalListingsPanel :listings="listings" title="Listing marketplace (cache)">
          <template #empty>Belum ada listing — sync produk dari Settings → Toko Terhubung.</template>
        </ExternalListingsPanel>
        <CommerceListPagination
          :page="page"
          :per-page="perPage"
          :meta="listMeta"
          :disabled="loading"
          id-prefix="listings"
          @update:page="onListPage"
          @update:per-page="onListPerPage"
        />
      </div>
    </div>

    <!-- Open draft modal -->
    <div
      v-if="showOpenDraft"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      @click.self="showOpenDraft = false"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Publikasikan ke Marketplace</h5>
            <button type="button" class="btn-close" aria-label="Tutup" @click="showOpenDraft = false" />
          </div>
          <div class="modal-body">
            <p class="small text-muted">
              Pilih toko TikTok dan Product Master. Satu draft per pasangan produk–toko.
            </p>
            <div class="mb-3">
              <label class="form-label">Toko</label>
              <select v-model="openShopId" class="form-select">
                <option value="">Pilih toko</option>
                <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Produk (SkyFlow)</label>
              <ProductSelect
                v-model="openProductId"
                :company-id="productPickerCompanyId"
                :disabled="!productPickerCompanyId || opening"
                placeholder="Cari nama / SKU produk…"
              />
              <div class="form-text small">
                Daftar dari Product Master perusahaan aktif (cari bertahap, bukan load seluruh katalog).
              </div>
            </div>
            <div v-if="openError" class="alert alert-danger small">{{ openError }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showOpenDraft = false">Batal</button>
            <CommerceActionButton
              action="openDraft"
              btn-class="btn btn-primary"
              :busy="opening"
              :disabled="!openShopId || !openProductId"
              @click="createDraft"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="showOpenDraft" class="modal-backdrop fade show" />

    <!-- Editor / preview modal -->
    <div
      v-if="editorDraft"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      @click.self="closeEditor"
    >
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Draft: {{ editorDraft.title }}</h5>
            <button type="button" class="btn-close" aria-label="Tutup" @click="closeEditor" />
          </div>
          <div class="modal-body">
            <div class="alert alert-secondary small">
              Override: judul, deskripsi, media, kategori, atribut, pengiriman.
              Mengikuti master: product/SKU/gudang. Harga: Pricing MARKETPLACE. Stok: inventory core.
            </div>
            <div class="mb-3">
              <label class="form-label">Judul</label>
              <input
                v-model="editorForm.title"
                class="form-control"
                maxlength="255"
                :minlength="TIKTOK_TITLE_MIN"
                :class="{ 'is-invalid': titleLengthInvalid }"
              />
              <div class="form-text" :class="titleLengthInvalid ? 'text-danger' : 'text-muted'">
                {{ (editorForm.title || '').trim().length }}/255 · TikTok wajib {{ TIKTOK_TITLE_MIN }}–255 karakter
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Deskripsi</label>
              <textarea v-model="editorForm.description" class="form-control" rows="4" />
            </div>
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label">Kategori TikTok (leaf)</label>
                <TikTokCategorySelect
                  v-model="editorForm.categoryId"
                  :shop-id="editorDraft?.shopId || null"
                  locale="id-ID"
                />
              </div>
              <div class="col-md-2">
                <label class="form-label">Brand ID (opsional)</label>
                <input v-model="editorForm.brandId" class="form-control font-monospace" />
              </div>
              <div class="col-md-2">
                <label class="form-label">Berat paket</label>
                <input v-model="editorForm.packageWeightValue" class="form-control" />
              </div>
              <div class="col-md-2">
                <label class="form-label">Unit berat</label>
                <select v-model="editorForm.packageWeightUnit" class="form-select">
                  <option value="KILOGRAM">KILOGRAM</option>
                  <option value="GRAM">GRAM</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <TikTokCategoryAttributesForm
                v-model="editorForm.productAttributes"
                :shop-id="editorDraft?.shopId || null"
                :category-id="editorForm.categoryId || null"
                locale="id-ID"
              />
            </div>
            <h3 class="h6">SKU / harga / stok preview</h3>
            <div class="table-responsive mb-3">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Seller SKU</th>
                    <th>Harga</th>
                    <th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(sku, idx) in editorForm.skus" :key="idx">
                    <td><input v-model="sku.sellerSku" class="form-control form-control-sm font-monospace" /></td>
                    <td><input v-model="sku.priceAmount" class="form-control form-control-sm" /></td>
                    <td><input v-model="sku.currency" class="form-control form-control-sm" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="editorDraft.lastError" class="alert alert-warning small text-break">
              {{ editorDraft.lastError }}
            </div>
            <div v-if="validationIssues.length" class="mb-3">
              <div class="fw-semibold small mb-1">Hasil validasi</div>
              <ul class="small mb-0">
                <li v-for="(iss, i) in validationIssues" :key="i">
                  <span :class="iss.severity === 'error' ? 'text-danger' : 'text-warning'">
                    [{{ iss.field }}] {{ iss.message }}
                  </span>
                </li>
              </ul>
            </div>
            <div v-if="previewData" class="border rounded p-3 small bg-light">
              <div class="fw-semibold mb-2">Preview publish</div>
              <div>
                Mode: <strong>{{ previewData.mode }}</strong>
                <span v-if="previewData.updateScope" class="ms-1">· scope {{ previewData.updateScope }}</span>
              </div>
              <div v-if="previewData.eligibleForConfirm" class="text-success">
                Eligible confirm (tanpa blocker data/implementasi)
              </div>
              <div v-else-if="previewData.dataBlockers?.length" class="text-danger">
                Blocker data:
                <ul class="mb-0">
                  <li v-for="(b, i) in previewData.dataBlockers" :key="i">[{{ b.field }}] {{ b.message }}</li>
                </ul>
              </div>
              <div v-if="previewData.liveHold" class="text-warning mt-1">
                LIVE_HOLD (izin): {{ previewData.liveHoldReason }}
              </div>
              <div v-if="previewData.contentDiff" class="mt-3">
                <div class="fw-semibold">Diff konten</div>
                <div class="row g-2 mt-1">
                  <div class="col-md-6">
                    <div class="text-muted">Deskripsi sebelum (platform)</div>
                    <pre class="small bg-white border rounded p-2 mb-0 text-break" style="white-space: pre-wrap; max-height: 12rem; overflow: auto">{{
                      previewData.contentDiff.description?.before ?? '—'
                    }}</pre>
                  </div>
                  <div class="col-md-6">
                    <div class="text-muted">Deskripsi sesudah (draft)</div>
                    <pre class="small bg-white border rounded p-2 mb-0 text-break" style="white-space: pre-wrap; max-height: 12rem; overflow: auto">{{
                      previewData.contentDiff.description?.after ?? '—'
                    }}</pre>
                  </div>
                </div>
                <div class="mt-2 text-muted">
                  Judul berubah: {{ previewData.contentDiff.title?.changed ? 'ya' : 'tidak' }}
                  · Harga/stok/varian: dipertahankan
                </div>
              </div>
              <div v-if="previewData.payloadDiff?.partialEditBody" class="mt-2">
                <div class="fw-semibold">Payload partial_edit</div>
                <pre class="small bg-white border rounded p-2 mb-0 text-break" style="white-space: pre-wrap; max-height: 10rem; overflow: auto">{{
                  JSON.stringify(previewData.payloadDiff.partialEditBody, null, 2)
                }}</pre>
              </div>
              <div v-if="previewData.payloadSummary" class="mt-2 text-muted">
                Draft v{{ previewData.payloadSummary.payloadVersion }}
                · hash {{ previewData.payloadSummary.payloadHash }}
                · external {{ previewData.payloadSummary.externalProductId || '—' }}
              </div>
            <div v-if="previewData?.matchRequired" class="alert alert-warning small mt-2">
              Listing existing ditemukan. Pilih ID terverifikasi (jangan create duplikat):
              <select v-model="linkExternalProductId" class="form-select form-select-sm mt-1">
                <option value="">— cocokkan dulu —</option>
                <option
                  v-for="c in previewData.matchHints || []"
                  :key="c.externalProductId"
                  :value="c.externalProductId"
                >
                  {{ c.externalProductId }} · {{ c.sellerSku }} · {{ c.title || '—' }}
                </option>
              </select>
            </div>
              <div v-if="previewData.pricePreview?.length" class="mt-2">
                <div class="text-muted">Harga/stok (informasional — tidak dimutasi pada CONTENT)</div>
                <div v-for="(p, i) in previewData.pricePreview" :key="i">
                  {{ p.sellerSku }} — {{ p.currency }} {{ p.priceAmount }}
                  <span v-if="p.inventoryPreview?.length" class="text-muted">
                    · stok
                    <template v-for="(inv, j) in p.inventoryPreview" :key="j">
                      WH{{ inv.warehouseId }}={{ inv.quantity }}
                    </template>
                  </span>
                </div>
              </div>
              <p class="mb-0 mt-2 text-muted">{{ previewData.note }}</p>
            </div>
          </div>
          <div class="modal-footer flex-wrap">
            <button type="button" class="btn btn-outline-secondary" @click="closeEditor">Tutup</button>
            <CommerceActionButton
              action="save"
              btn-class="btn btn-outline-primary"
              :busy="actions.isBusy('save', editorDraft.id)"
              :disabled="draftModalConflicted('save')"
              @click="saveEditor"
            />
            <CommerceActionButton
              action="validate"
              btn-class="btn btn-outline-secondary"
              :busy="actions.isBusy('validate', editorDraft.id)"
              :disabled="draftModalConflicted('validate')"
              @click="runValidate(editorDraft)"
            />
            <CommerceActionButton
              action="preview"
              btn-class="btn btn-outline-secondary"
              :busy="actions.isBusy('preview', editorDraft.id)"
              :disabled="draftModalConflicted('preview')"
              @click="runPreview(editorDraft)"
            />
            <CommerceActionButton
              action="publish"
              btn-class="btn btn-success"
              :busy="actions.isBusy('publish', editorDraft.id)"
              :disabled="!previewData || draftModalConflicted('publish')"
              @click="confirmPublish"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="editorDraft" class="modal-backdrop fade show" />
  </OmnichannelShell>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useNuxtApp, useRoute, useRouter } from '#app'
import { useActiveCompany } from '~/composables/useActiveCompany'
import { useCommerceActionBusy } from '~/composables/useCommerceActionBusy'
import { usePermissions } from '~/composables/usePermissions'
import OmnichannelShell from '~/components/commerce/OmnichannelShell.vue'
import ExternalListingsPanel from '~/components/commerce/ExternalListingsPanel.vue'
import CommerceListPagination from '~/components/commerce/CommerceListPagination.vue'
import CommerceActionButton from '~/components/commerce/CommerceActionButton.vue'
import CommerceRowActionsMenu from '~/components/commerce/CommerceRowActionsMenu.vue'
import type { CommerceRowAction } from '~/components/commerce/CommerceRowActionsMenu.vue'
import TikTokCategorySelect from '~/components/commerce/TikTokCategorySelect.vue'
import TikTokCategoryAttributesForm from '~/components/commerce/TikTokCategoryAttributesForm.vue'
import ProductSelect from '~/components/reference/ProductSelect.vue'
import WorkspaceTabs from '~/components/common/WorkspaceTabs.vue'
import { readAccessToken } from '~/utils/authCookie'
import { commerceStatusBadge } from '~/utils/commerceFormat'
import {
  clampCommercePerPage,
  COMMERCE_DEFAULT_PER_PAGE,
  normalizeCommerceMeta,
  type CommerceListMeta,
} from '~/utils/commercePagination'
import type { WorkspaceTab } from '~/types/workspaceTab'

/** TikTok market (ID/all-region) product title range — mirror BE tiktok_listing_constraints. */
const TIKTOK_TITLE_MIN = 25

definePageMeta({ middleware: ['auth', 'check-permission'] })

const { $api } = useNuxtApp() as any
const route = useRoute()
const router = useRouter()
const { companyId } = useActiveCompany()
const actions = useCommerceActionBusy({ companyId })
const { userHasPermission, userHasRole } = usePermissions()

/** Hapus draft: superadmin OR delete_commerce_omnichannel (BE assertPerm mirrors this). */
const canDeleteListingDraft = computed(
  () => userHasRole('superadmin') || userHasPermission('delete_commerce_omnichannel')
)

/** ProductSelect expects number | null — coerce Active Company id once. */
const productPickerCompanyId = computed(() => {
  const id = companyId.value
  if (id == null || id === '') return null
  const n = Number(id)
  return Number.isFinite(n) && n > 0 ? n : null
})

const shops = ref<any[]>([])
const listings = ref<any[]>([])
const drafts = ref<any[]>([])
const selectedShopId = ref(String(route.query.shopId || ''))
const mappedFilter = ref(
  route.query.mapped === '0' || route.query.mapped === 'unmapped'
    ? 'unmapped'
    : route.query.mapped === '1' || route.query.mapped === 'mapped'
      ? 'mapped'
      : ''
)
const q = ref(String(route.query.q || ''))
const activeTab = ref<'drafts' | 'cache'>(route.query.tab === 'cache' ? 'cache' : 'drafts')
const workspaceTabs = computed<WorkspaceTab[]>(() => [
  { id: 'drafts', label: 'Draft publikasi' },
  { id: 'cache', label: 'Cache marketplace' },
])

function onWorkspaceTab(id: string) {
  activeTab.value = id === 'cache' ? 'cache' : 'drafts'
  syncQuery()
}
const page = ref(Math.max(1, Number(route.query.page) || 1))
const perPage = ref(clampCommercePerPage(route.query.perPage, COMMERCE_DEFAULT_PER_PAGE))
const draftPage = ref(1)
const draftPerPage = ref(COMMERCE_DEFAULT_PER_PAGE)
const listMeta = ref(normalizeCommerceMeta(null))
const draftMeta = ref(normalizeCommerceMeta(null))
const loading = ref(false)
const error = ref('')
const actionMsg = ref('')

const showOpenDraft = ref(false)
const openShopId = ref('')
const openProductId = ref<number | null>(null)
const openError = ref('')
const opening = ref(false)

const editorDraft = ref<any | null>(null)
const editorForm = ref<any>({})
const validationIssues = ref<any[]>([])
const previewData = ref<any | null>(null)
const linkExternalProductId = ref('')

const titleLengthInvalid = computed(() => {
  const len = String(editorForm.value?.title || '').trim().length
  return len > 0 && (len < TIKTOK_TITLE_MIN || len > 255)
})

function draftModalConflicted(action: string) {
  if (!editorDraft.value?.id) return true
  return actions.isTargetBusy(editorDraft.value.id) && !actions.isBusy(action, editorDraft.value.id)
}

function draftRowActions(d: any): CommerceRowAction[] {
  const active = actions.busyActionForTarget(d.id)
  const items: CommerceRowAction[] = [
    { key: 'edit', label: 'Edit', icon: 'ri-edit-box-line', disabled: Boolean(active) },
    {
      key: 'validate',
      label: 'Validasi',
      icon: 'ri-shield-check-line',
      busy: active === 'validate',
      disabled: Boolean(active && active !== 'validate'),
    },
    {
      key: 'preview',
      label: 'Preview',
      icon: 'ri-eye-line',
      busy: active === 'preview',
      disabled: Boolean(active && active !== 'preview'),
    },
  ]
  if (d.draftStatus === 'AMBIGUOUS') {
    items.push({
      key: 'reconcile',
      label: 'Rekonsiliasi',
      icon: 'ri-refresh-line',
      busy: active === 'reconcile',
      disabled: Boolean(active && active !== 'reconcile'),
    })
  }
  if (d.externalProductId) {
    items.push({
      key: 'refresh-status',
      label: 'Refresh status',
      icon: 'ri-refresh-line',
      busy: active === 'refresh-status',
      disabled: Boolean(active && active !== 'refresh-status'),
    })
  }
  if (canDeleteListingDraft.value && d.draftStatus !== 'PUBLISHING') {
    items.push({
      key: 'delete',
      label: 'Hapus draft',
      icon: 'ri-delete-bin-line',
      danger: true,
      busy: active === 'delete',
      disabled: Boolean(active && active !== 'delete'),
    })
  }
  return items
}

function onDraftRowAction(key: string, d: any) {
  if (key === 'edit') {
    openEditor(d)
    return
  }
  if (key === 'validate') void runValidate(d)
  else if (key === 'preview') void runPreview(d)
  else if (key === 'reconcile') void runReconcile(d)
  else if (key === 'refresh-status') void runRefreshStatus(d)
  else if (key === 'delete') void runDeleteDraft(d)
}

let listingsAbort: AbortController | null = null
let draftsAbort: AbortController | null = null
let shopsAbort: AbortController | null = null
let requestGen = 0

function headers() {
  const h: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (companyId.value) {
    h['X-Company-Id'] = String(companyId.value)
    h['X-Active-Company-Id'] = String(companyId.value)
  }
  return h
}

function syncQuery() {
  const query: Record<string, string> = {}
  if (selectedShopId.value) query.shopId = selectedShopId.value
  if (mappedFilter.value) query.mapped = mappedFilter.value === 'unmapped' ? '0' : '1'
  if (q.value) query.q = q.value
  if (activeTab.value !== 'drafts') query.tab = activeTab.value
  if (page.value > 1) query.page = String(page.value)
  if (perPage.value !== COMMERCE_DEFAULT_PER_PAGE) query.perPage = String(perPage.value)
  router.replace({ query })
}

async function loadShops(gen: number) {
  if (!companyId.value) return
  shopsAbort?.abort()
  shopsAbort = new AbortController()
  const res = await fetch(
    `${$api.commerceShops()}?perusahaanId=${companyId.value}&page=1&perPage=100`,
    { headers: headers(), credentials: 'include', signal: shopsAbort.signal }
  )
  if (gen !== requestGen) return
  const json = await res.json()
  if (res.ok) shops.value = json.data || []
}

async function loadListings(gen: number) {
  if (!companyId.value) return
  listingsAbort?.abort()
  listingsAbort = new AbortController()
  const qs = new URLSearchParams({
    perusahaanId: String(companyId.value),
    page: String(page.value),
    perPage: String(perPage.value),
  })
  if (selectedShopId.value) qs.set('shopId', selectedShopId.value)
  if (mappedFilter.value) qs.set('mapped', mappedFilter.value)
  if (q.value.trim()) qs.set('q', q.value.trim())
  const res = await fetch(`${$api.commerceListings()}?${qs}`, {
    headers: headers(),
    credentials: 'include',
    signal: listingsAbort.signal,
  })
  if (gen !== requestGen) return
  const json = await res.json()
  if (!res.ok || json.success === false) {
    error.value = json.message || 'Gagal memuat listing'
    return
  }
  listings.value = json.data || []
  listMeta.value = normalizeCommerceMeta(json.meta as CommerceListMeta)
}

async function loadDrafts(gen: number) {
  if (!companyId.value) return
  draftsAbort?.abort()
  draftsAbort = new AbortController()
  const qs = new URLSearchParams({
    perusahaanId: String(companyId.value),
    page: String(draftPage.value),
    perPage: String(draftPerPage.value),
  })
  if (selectedShopId.value) qs.set('shopId', selectedShopId.value)
  if (q.value.trim()) qs.set('q', q.value.trim())
  const res = await fetch(`${$api.commerceListingDrafts()}?${qs}`, {
    headers: headers(),
    credentials: 'include',
    signal: draftsAbort.signal,
  })
  if (gen !== requestGen) return
  const json = await res.json()
  if (!res.ok || json.success === false) {
    error.value = json.message || 'Gagal memuat draft'
    return
  }
  drafts.value = json.data || []
  draftMeta.value = normalizeCommerceMeta(json.meta as CommerceListMeta)
}

async function reloadAll() {
  if (!companyId.value) return
  const gen = ++requestGen
  loading.value = true
  error.value = ''
  try {
    await loadShops(gen)
    if (gen !== requestGen) return
    // Drop stale shop filter after company switch
    if (selectedShopId.value && !shops.value.some((s) => s.id === selectedShopId.value)) {
      selectedShopId.value = ''
    }
    await Promise.all([loadListings(gen), loadDrafts(gen)])
  } catch (e: any) {
    if (e?.name === 'AbortError') return
    if (gen === requestGen) error.value = e?.message || 'Gagal memuat'
  } finally {
    if (gen === requestGen) loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  draftPage.value = 1
  syncQuery()
  reloadAll()
}

function resetFilters() {
  selectedShopId.value = ''
  mappedFilter.value = ''
  q.value = ''
  page.value = 1
  draftPage.value = 1
  syncQuery()
  reloadAll()
}

function onListPage(p: number) {
  page.value = p
  syncQuery()
  const gen = ++requestGen
  loading.value = true
  loadListings(gen).finally(() => {
    if (gen === requestGen) loading.value = false
  })
}

function onListPerPage(n: number) {
  perPage.value = clampCommercePerPage(n)
  page.value = 1
  syncQuery()
  onListPage(1)
}

function onDraftPage(p: number) {
  draftPage.value = p
  const gen = ++requestGen
  loading.value = true
  loadDrafts(gen).finally(() => {
    if (gen === requestGen) loading.value = false
  })
}

function onDraftPerPage(n: number) {
  draftPerPage.value = clampCommercePerPage(n)
  draftPage.value = 1
  onDraftPage(1)
}

async function createDraft() {
  openError.value = ''
  if (!openShopId.value || !openProductId.value) {
    openError.value = 'Pilih toko dan produk terlebih dahulu.'
    return
  }
  opening.value = true
  try {
    const res = await fetch($api.commerceListingDrafts(), {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ shopId: openShopId.value, productId: openProductId.value }),
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      openError.value = json.message || 'Gagal membuka draft'
      return
    }
    showOpenDraft.value = false
    openProductId.value = null
    activeTab.value = 'drafts'
    await reloadAll()
    openEditor(json.data)
  } catch (e: any) {
    openError.value = e?.message || 'Gagal membuka draft'
  } finally {
    opening.value = false
  }
}

function openPublishModal() {
  openError.value = ''
  openProductId.value = null
  openShopId.value = selectedShopId.value || openShopId.value || ''
  showOpenDraft.value = true
}

function openEditor(d: any) {
  void openEditorFresh(d)
}

/** Refetch draft (GET syncs MAIN_IMAGE from Product Master) then bind editor. */
async function openEditorFresh(d: any) {
  if (!d?.id) return
  editorDraft.value = d
  validationIssues.value = d.validationIssues || []
  previewData.value = null
  linkExternalProductId.value = ''
  bindEditorForm(d)
  try {
    const res = await fetch($api.commerceListingDraft(d.id), {
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json()
    if (res.ok && json.success !== false && json.data) {
      editorDraft.value = json.data
      validationIssues.value = json.data.validationIssues || []
      bindEditorForm(json.data)
    }
  } catch {
    /* keep list-row snapshot if GET fails */
  }
}

function bindEditorForm(d: any) {
  editorForm.value = {
    title: d.title || '',
    description: d.description || '',
    categoryId: d.categoryId ? String(d.categoryId) : null,
    brandId: d.brandId || '',
    packageWeightValue: d.packageWeight?.value || '0.5',
    packageWeightUnit: d.packageWeight?.unit || 'KILOGRAM',
    productAttributes: Array.isArray(d.productAttributes)
      ? d.productAttributes.map((a: any) => ({
          id: String(a.id || ''),
          values: Array.isArray(a.values)
            ? a.values.map((v: any) => ({
                id: v.id != null ? String(v.id) : undefined,
                name: String(v.name || ''),
              }))
            : [],
        }))
      : [],
    skus: (d.skus || []).map((s: any) => ({ ...s })),
  }
}

function closeEditor() {
  editorDraft.value = null
  previewData.value = null
  validationIssues.value = []
}

async function saveEditor() {
  if (!editorDraft.value) return
  actionMsg.value = ''
  await actions.run('save', editorDraft.value.id, async () => {
    const res = await fetch($api.commerceListingDraft(editorDraft.value.id), {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: editorForm.value.title,
        description: editorForm.value.description,
        categoryId: editorForm.value.categoryId || null,
        brandId: editorForm.value.brandId || null,
        productAttributes: editorForm.value.productAttributes || [],
        packageWeight: {
          value: editorForm.value.packageWeightValue,
          unit: editorForm.value.packageWeightUnit,
        },
        skus: editorForm.value.skus,
      }),
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal simpan draft'
      throw new Error(error.value)
    }
    editorDraft.value = json.data
    actionMsg.value = 'Draft disimpan (belum dipublikasikan).'
    await loadDrafts(requestGen)
  }).catch(() => {
    /* error already set */
  })
}

async function runValidate(d: any) {
  if (!d?.id) return
  actionMsg.value = ''
  await actions.run('validate', d.id, async () => {
    const res = await fetch($api.commerceListingDraftValidate(d.id), {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: '{}',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Validasi gagal'
      throw new Error(error.value)
    }
    validationIssues.value = json.data?.validation?.issues || []
    if (editorDraft.value?.id === d.id) {
      editorDraft.value = json.data.draft
    }
    actionMsg.value = json.data?.validation?.ok
      ? 'Validasi OK — siap preview/publish.'
      : 'Validasi menemukan isu — perbaiki field wajib.'
    await loadDrafts(requestGen)
  }).catch(() => {})
}

async function runPreview(d: any) {
  if (!d?.id) return
  actionMsg.value = ''
  await actions.run('preview', d.id, async () => {
    if (editorDraft.value?.id === d.id) {
      // nested save without stacking busy — saveEditor uses same target; skip if already dirty save needed
      const resSave = await fetch($api.commerceListingDraft(d.id), {
        method: 'PUT',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editorForm.value.title,
          description: editorForm.value.description,
          categoryId: editorForm.value.categoryId || null,
          brandId: editorForm.value.brandId || null,
          productAttributes: editorForm.value.productAttributes || [],
          packageWeight: {
            value: editorForm.value.packageWeightValue,
            unit: editorForm.value.packageWeightUnit,
          },
          skus: editorForm.value.skus,
        }),
      })
      const jsonSave = await resSave.json()
      if (!resSave.ok || jsonSave.success === false) {
        error.value = jsonSave.message || 'Gagal simpan sebelum preview'
        throw new Error(error.value)
      }
      editorDraft.value = jsonSave.data
    }
    const res = await fetch($api.commerceListingDraftPreview(d.id), {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: '{}',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Preview gagal'
      throw new Error(error.value)
    }
    previewData.value = json.data
    if (!editorDraft.value) openEditor(d)
    actionMsg.value = 'Preview siap — konfirmasi eksplisit untuk enqueue publish.'
  }).catch(() => {})
}

async function confirmPublish() {
  if (!editorDraft.value) return
  if (previewData.value?.matchRequired && !linkExternalProductId.value) {
    error.value = 'Pilih listing existing terverifikasi sebelum publish (hindari duplikat).'
    return
  }
  actionMsg.value = ''
  const draftId = editorDraft.value.id
  await actions.run('publish', draftId, async () => {
    const idempotencyKey = `fe-publish:${draftId}:${Date.now()}`
    const res = await fetch($api.commerceListingDraftPublish(draftId), {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      credentials: 'include',
      body: JSON.stringify({
        idempotencyKey,
        linkExternalProductId: linkExternalProductId.value || null,
      }),
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Publish gagal diantrekan'
      throw new Error(error.value)
    }
    editorDraft.value = json.data?.draft || editorDraft.value
    if (json.data?.jobId) {
      actionMsg.value = json.data?.liveHold
        ? `Dalam antrean (LIVE_HOLD, job ${json.data.jobId}) — ${json.data.draft?.lastError || 'tidak memanggil TikTok sampai allowlist aktif.'}`
        : `Dalam antrean (job ${json.data.jobId}, mode ${json.data?.mode}). Status lokal ≠ status review platform. Cek Sinkronisasi untuk hasil akhir.`
    } else {
      actionMsg.value = json.data?.liveHold
        ? `Job diantrekan (LIVE_HOLD) — ${json.data.draft?.lastError || 'tidak memanggil TikTok sampai allowlist aktif.'}`
        : `Job ${json.data?.mode} diantrekan. Status lokal ≠ status review platform.`
    }
    await loadDrafts(requestGen)
  }).catch(() => {})
}

async function runDeleteDraft(d: any) {
  if (!d?.id || !canDeleteListingDraft.value) return
  const title = d.title || d.id
  const warnMp = d.externalProductId
    ? `<br/><br/><span class="text-muted">Catatan: listing di marketplace (ID <code>${d.externalProductId}</code>) <strong>TIDAK</strong> dihapus — hanya draft lokal di ERP.</span>`
    : ''
  const Swal = (await import('sweetalert2')).default
  const result = await Swal.fire({
    title: 'Hapus draft listing?',
    html: `Hapus draft <strong>${String(title).replace(/</g, '&lt;')}</strong>?<br/>Status: <strong>${d.draftStatus || '—'}</strong>${warnMp}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#008fec',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    focusCancel: true,
  })
  if (!result.isConfirmed) return

  actionMsg.value = ''
  await actions.run('delete', d.id, async () => {
    const res = await fetch($api.commerceListingDraft(d.id), {
      method: 'DELETE',
      headers: headers(),
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Gagal menghapus draft'
      throw new Error(error.value)
    }
    if (editorDraft.value?.id === d.id) {
      editorDraft.value = null
      previewData.value = null
      validationIssues.value = []
    }
    actionMsg.value = 'Draft listing dihapus (lokal). Marketplace tidak diubah.'
    await loadDrafts(requestGen)
  }).catch(() => {})
}

async function runReconcile(d: any) {
  if (!d?.id) return
  await actions.run('reconcile', d.id, async () => {
    const res = await fetch($api.commerceListingDraftReconcile(d.id), {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: '{}',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Rekonsiliasi gagal'
      throw new Error(error.value)
    }
    actionMsg.value = json.data?.note || (json.data?.reconciled ? 'Rekonsiliasi OK' : 'Belum selesai')
    await loadDrafts(requestGen)
  }).catch(() => {})
}

async function runRefreshStatus(d: any) {
  if (!d?.id) return
  await actions.run('refresh-status', d.id, async () => {
    const res = await fetch($api.commerceListingDraftRefreshStatus(d.id), {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: '{}',
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      error.value = json.message || 'Refresh status gagal'
      throw new Error(error.value)
    }
    actionMsg.value = `Platform status: ${json.data?.draft?.platformStatus || '—'}`
    await loadDrafts(requestGen)
  }).catch(() => {})
}

watch(companyId, () => {
  actions.clearAll()
  actions.bumpRequestGen()
  selectedShopId.value = ''
  openProductId.value = null
  openShopId.value = ''
  showOpenDraft.value = false
  page.value = 1
  draftPage.value = 1
  listings.value = []
  drafts.value = []
  closeEditor()
  syncQuery()
  reloadAll()
})

watch(selectedShopId, () => {
  page.value = 1
  draftPage.value = 1
  syncQuery()
  reloadAll()
})

onMounted(() => {
  openShopId.value = selectedShopId.value
  reloadAll()
})

onBeforeUnmount(() => {
  listingsAbort?.abort()
  draftsAbort?.abort()
  shopsAbort?.abort()
  requestGen++
})
</script>

<style scoped>
.filter-sort-actions {
  align-items: stretch;
}
/* Match Vuexy .form-select-sm / Pesanan filter-action-btn metrics. */
.filter-action-btn {
  --bs-btn-padding-y: calc(0.629rem - 1px);
  --bs-btn-font-size: 0.8125rem;
  --bs-btn-line-height: 1.375;
  box-sizing: border-box;
  flex: 0 0 auto;
  align-self: stretch;
  height: auto !important;
  min-height: 0 !important;
  padding-top: calc(0.629rem - 1px) !important;
  padding-bottom: calc(0.629rem - 1px) !important;
  font-size: 0.8125rem !important;
  line-height: 1.375 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}
.commerce-produk-filter-card :deep(.workspace-tabs) {
  border-bottom: 0;
}
.commerce-produk-filter-card .form-label {
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
}
</style>
