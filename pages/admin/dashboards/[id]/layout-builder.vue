<template>
  <div class="content-wrapper">
    <div class="container-fluid flex-grow-1 container-p-y">
      <!-- Loading -->
      <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <!-- Fatal error -->
      <div v-else-if="error && !draftLayout" class="alert alert-danger">
        <i class="ri-error-warning-line me-2"></i>{{ error }}
        <NuxtLink to="/admin/dashboards" class="alert-link ms-2">Kembali</NuxtLink>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div class="d-flex align-items-center gap-2">
            <NuxtLink to="/admin/dashboards" class="btn btn-icon btn-outline-secondary btn-sm">
              <i class="ri-arrow-left-line"></i>
            </NuxtLink>
            <div>
              <h4 class="mb-0 fw-semibold">{{ dashboard?.name || 'Dashboard' }}</h4>
              <PageBreadcrumb class="mt-1" :current-label="dashboard?.name || 'Dashboard'" />
              <small class="text-muted">
                Draft
                <span class="badge bg-label-warning ms-1">v{{ currentDraftVersion?.versionNumber ?? draftLayout?.versionNumber }}</span>
                <template v-if="currentPublishedVersion">
                  &middot; Versi aktif saat ini:
                  <span class="badge bg-label-success ms-1">v{{ currentPublishedVersion.versionNumber }}</span>
                </template>
                <template v-else> &middot; Dashboard ini belum pernah dipublikasikan. </template>
              </small>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <small v-if="saving" class="text-muted"><span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...</small>
            <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="rollingBack" @click="openHistoryModal">
              <i class="ri-history-line me-1"></i> Riwayat Versi
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm" :disabled="publishing || saving" @click="onDiscardDraft">
              <i class="ri-delete-bin-line me-1"></i> Hapus Draft
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm" :disabled="saving || publishing" @click="onSaveDraft">
              <i class="ri-save-line me-1"></i> Simpan Draft
            </button>
            <button type="button" class="btn btn-primary btn-sm" :disabled="publishing || saving || !hasWidgets" @click="onPublish">
              <span v-if="publishing" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="ri-rocket-line me-1"></i> Publish
            </button>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

        <div class="row g-3">
          <!-- Widget catalog picker -->
          <div class="col-lg-3">
            <div class="card">
              <div class="card-header">
                <input v-model="widgetSearch" type="text" class="form-control form-control-sm" placeholder="Cari widget..." />
              </div>
              <div class="card-body p-2" style="max-height: 70vh; overflow-y: auto;">
                <div v-if="loadingCatalog" class="text-center text-muted py-3">
                  <span class="spinner-border spinner-border-sm"></span>
                </div>
                <div v-else-if="filteredCatalog.length === 0" class="text-center text-muted small py-3">
                  Tidak ada widget ditemukan.
                </div>
                <button
                  v-for="widget in filteredCatalog"
                  :key="widget.id"
                  type="button"
                  class="widget-catalog-item"
                  @click="addWidget(widget)"
                >
                  <i :class="[widget.icon || 'ri-puzzle-line']"></i>
                  <div class="flex-grow-1">
                    <div class="fw-semibold small">{{ widget.title }}</div>
                    <small class="text-muted">{{ widget.defaultWidth }}x{{ widget.defaultHeight }} &middot; {{ widget.widgetType }}</small>
                  </div>
                  <i class="ri-add-circle-line text-primary"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Canvas -->
          <div class="col-lg-9">
            <div class="alert alert-primary d-flex align-items-center gap-2 py-2 mb-3">
              <i class="ri-information-line"></i>
              <small>
                Klik widget di sisi kiri untuk menambah ke canvas. Geser lewat ikon <i class="ri-drag-move-2-line"></i>,
                tarik sudut untuk mengubah ukuran, klik <i class="ri-settings-3-line"></i> untuk konfigurasi, atau
                <i class="ri-delete-bin-line"></i> untuk menghapus. Jangan lupa "Simpan Draft" sebelum Publish.
              </small>
            </div>

            <DashboardGrid
              v-if="draftLayout"
              :layout="draftLayout"
              editable
              builder-mode
              @layout-change="onLayoutChange"
              @widget-remove="onWidgetRemove"
              @widget-configure="onWidgetConfigure"
            />
          </div>
        </div>
      </template>

      <!-- Config modal -->
      <Modal
        id="WidgetInstanceConfigModal"
        :model-value="isConfigModalOpen"
        @close="closeConfigModal"
        title="Konfigurasi Widget"
        :description="configuringWidget?.widget?.title || ''"
      >
        <template #default>
          <div v-if="configuringWidget">
            <DashboardWidgetConfigForm
              :schema="configuringWidget.widget.configSchema"
              v-model="configFormValue"
            />
            <div class="form-check form-switch mb-3">
              <input type="checkbox" class="form-check-input" id="config-hidden-by-default" v-model="configHidden" />
              <label class="form-check-label" for="config-hidden-by-default">
                Sembunyikan widget ini secara default (user tetap bisa memunculkannya lewat personalisasi)
              </label>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeConfigModal">Tutup</button>
              <button type="button" class="btn btn-primary" @click="saveConfigModal">Simpan</button>
            </div>
          </div>
        </template>
      </Modal>

      <!-- Riwayat Versi modal -->
      <Modal
        id="VersionHistoryModal"
        :model-value="isHistoryModalOpen"
        @close="closeHistoryModal"
        title="Riwayat Versi Layout"
        description="Semua versi layout dashboard ini — draft, aktif, dan yang sudah diarsipkan."
      >
        <template #default>
          <div v-if="versions.length === 0" class="text-center text-muted py-4">
            Belum ada riwayat versi.
          </div>
          <div v-else class="list-group">
            <div
              v-for="version in sortedVersions"
              :key="version.id"
              class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
            >
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="fw-semibold">v{{ version.versionNumber }}</span>
                  <span v-if="version.isDefault" class="badge bg-label-success">Aktif</span>
                  <span v-else-if="version.status === 'draft'" class="badge bg-label-warning">Draft</span>
                  <span v-else class="badge bg-label-secondary">Diarsipkan</span>
                  <span v-if="version.label" class="text-muted small">— {{ version.label }}</span>
                </div>
                <small class="text-muted">
                  {{ version.widgetCount ?? 0 }} widget
                  <template v-if="version.publishedAt">
                    &middot; dipublikasikan {{ formatVersionDate(version.publishedAt) }}
                  </template>
                </small>
              </div>
              <button
                v-if="!version.isDefault && version.status !== 'draft'"
                type="button"
                class="btn btn-outline-primary btn-sm"
                :disabled="rollingBack"
                @click="onRollback(version)"
              >
                <span v-if="rollingBack" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="ri-arrow-go-back-line me-1"></i> Rollback ke versi ini
              </button>
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Modal from '~/components/modal/Modal.vue'
import DashboardGrid from '~/components/dashboard-engine/DashboardGrid.vue'
import type { LayoutChangeItem } from '~/components/dashboard-engine/DashboardGrid.vue'
import DashboardWidgetConfigForm from '~/components/dashboard-engine/DashboardWidgetConfigForm.vue'
import { useDashboardLayoutBuilder } from '~/composables/useDashboardLayoutBuilder'
import type { LayoutVersionSummary } from '~/composables/useDashboardLayoutBuilder'
import { useDashboardWidgetAdmin } from '~/composables/useDashboardAdmin'
import type { AdminWidgetRow } from '~/composables/useDashboardAdmin'
import type { DashboardWidgetDTO, DashboardLayoutWidgetDTO } from '~/composables/useDashboardEngine'

definePageMeta({
  hidePageHeading: true,
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Layout Builder',
  description: 'Admin Layout Builder',
})

const route = useRoute()
const dashboardId = computed(() => String(route.params.id))

const {
  dashboard,
  versions,
  draftLayout,
  loading,
  saving,
  publishing,
  error,
  currentDraftVersion,
  currentPublishedVersion,
  ensureDraft,
  addWidget: addWidgetToDraft,
  removeWidget,
  applyPositionChanges,
  updateInstanceConfig,
  saveDraft,
  publishDraft,
  discardDraft,
  loadVersions,
  rollingBack,
  rollbackToVersion,
} = useDashboardLayoutBuilder()

const { fetchActiveWidgets } = useDashboardWidgetAdmin()
const catalog = ref<AdminWidgetRow[]>([])
const loadingCatalog = ref(false)
const widgetSearch = ref('')

const filteredCatalog = computed(() => {
  const term = widgetSearch.value.trim().toLowerCase()
  if (!term) return catalog.value
  return catalog.value.filter(
    (w) => w.title.toLowerCase().includes(term) || w.code.toLowerCase().includes(term)
  )
})

const hasWidgets = computed(() => (draftLayout.value?.layoutWidgets?.length ?? 0) > 0)

async function loadCatalog() {
  loadingCatalog.value = true
  try {
    catalog.value = await fetchActiveWidgets()
  } finally {
    loadingCatalog.value = false
  }
}

function addWidget(widget: AdminWidgetRow) {
  addWidgetToDraft(widget as unknown as DashboardWidgetDTO)
}

function onLayoutChange(items: LayoutChangeItem[]) {
  applyPositionChanges(items)
}

function onWidgetRemove(dashboardLayoutWidgetId: number) {
  removeWidget(dashboardLayoutWidgetId)
}

const configuringWidget = ref<DashboardLayoutWidgetDTO | null>(null)
const configFormValue = ref<Record<string, unknown> | null>(null)
const configHidden = ref(false)
const isConfigModalOpen = ref(false)
const isHistoryModalOpen = ref(false)

function closeConfigModal() {
  isConfigModalOpen.value = false
}

function closeHistoryModal() {
  isHistoryModalOpen.value = false
}

function onWidgetConfigure(dashboardLayoutWidgetId: number) {
  const item = draftLayout.value?.layoutWidgets.find((lw) => lw.id === dashboardLayoutWidgetId)
  if (!item) return

  configuringWidget.value = item
  configFormValue.value = item.instanceConfig ? { ...item.instanceConfig } : null
  configHidden.value = item.isHiddenByDefault
  isConfigModalOpen.value = true
}

function saveConfigModal() {
  if (!configuringWidget.value) return

  updateInstanceConfig(configuringWidget.value.id, {
    instanceConfig: configFormValue.value,
    isHiddenByDefault: configHidden.value,
  })
  closeConfigModal()
}

async function onSaveDraft() {
  try {
    await saveDraft(dashboardId.value)
    const toast = useToast()
    toast.success({ title: 'Berhasil', message: 'Draft layout berhasil disimpan', color: 'green' })
  } catch (err: any) {
    const toast = useToast()
    toast.error({ title: 'Gagal', message: error.value || 'Gagal menyimpan draft', color: 'red' })
  }
}

async function onPublish() {
  if (!window.confirm('Publish layout ini sebagai versi aktif dashboard? Versi aktif sebelumnya akan diarsipkan.')) return

  try {
    await publishDraft(dashboardId.value)
    const toast = useToast()
    toast.success({ title: 'Berhasil', message: 'Layout berhasil dipublikasikan', color: 'green' })
    await ensureDraft(dashboardId.value)
  } catch (err: any) {
    const toast = useToast()
    toast.error({ title: 'Gagal', message: error.value || 'Gagal publish layout', color: 'red' })
  }
}

async function onDiscardDraft() {
  if (!window.confirm('Hapus draft ini? Semua perubahan yang belum dipublikasikan akan hilang.')) return

  try {
    await discardDraft(dashboardId.value)
    await ensureDraft(dashboardId.value)
  } catch (err: any) {
    const toast = useToast()
    toast.error({ title: 'Gagal', message: 'Gagal menghapus draft', color: 'red' })
  }
}

/** Riwayat Versi & Rollback. */
const sortedVersions = computed(() =>
  [...versions.value].sort((a, b) => b.versionNumber - a.versionNumber)
)

function formatVersionDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

async function openHistoryModal() {
  await loadVersions(dashboardId.value)
  isHistoryModalOpen.value = true
}

async function onRollback(version: LayoutVersionSummary) {
  if (
    !window.confirm(
      `Rollback ke v${version.versionNumber}? Versi ini akan dipublikasikan ulang sebagai layout aktif dashboard, dan draft yang sedang diedit (kalau ada) akan dihapus.`
    )
  ) {
    return
  }

  const toast = useToast()
  try {
    await rollbackToVersion(dashboardId.value, version.id, version.versionNumber)
    closeHistoryModal()
    toast.success({
      title: 'Berhasil',
      message: `Rollback ke v${version.versionNumber} berhasil dipublikasikan`,
      color: 'green',
    })
    await ensureDraft(dashboardId.value)
  } catch (err: any) {
    toast.error({ title: 'Gagal', message: error.value || 'Gagal rollback ke versi ini', color: 'red' })
  }
}

onMounted(async () => {
  await Promise.all([ensureDraft(dashboardId.value), loadCatalog()])
})
</script>

<style scoped>
.widget-catalog-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0.25rem;
}

.widget-catalog-item:hover {
  background: var(--bs-primary-bg-subtle, rgba(0, 143, 236, 0.08));
  border-color: var(--bs-primary, #008fec);
}
</style>
