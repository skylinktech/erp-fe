import { computed, ref } from 'vue'
import { apiFetch } from '~/utils/apiFetch'
import { getApiErrorMessage } from '~/utils/apiError'
import type {
  DashboardLayoutDTO,
  DashboardLayoutWidgetDTO,
  DashboardWidgetDTO,
} from '~/composables/useDashboardEngine'

export type DashboardAdminMetaDTO = {
  id: number
  code: string
  name: string
  description: string | null
  icon: string | null
  category: string | null
  isActive: boolean
  defaultLayoutId: number | null
}

export type LayoutVersionSummary = {
  id: number
  dashboardId: number
  versionNumber: number
  label: string | null
  status: 'draft' | 'published' | 'archived'
  isDefault: boolean
  publishedAt: string | null
  widgetCount?: number
}

function genInstanceKey(widgetCode: string): string {
  return `${widgetCode}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Admin Layout Builder — Fase 3.
 *
 * Berbeda dengan preferensi personal (Fase 2, auto-save setiap drag), state
 * di sini murni LOKAL sampai admin klik "Simpan Draft" — supaya admin bisa
 * bereksperimen dulu (tambah/hapus/geser widget) sebelum benar-benar
 * ter-commit ke draft resmi di server. Publish akan otomatis menyimpan draft
 * kalau ada perubahan yang belum tersimpan.
 *
 * Reuse penuh `DashboardGrid`/`DashboardWidgetHost` yang sama dengan viewer
 * (lihat props `builderMode`) — bentuk data yang dikembalikan backend untuk
 * 1 versi layout (`getVersionDetail`) memang dibuat 1:1 dengan `DashboardLayoutDTO`
 * milik viewer sejak awal supaya bisa dipakai ulang di sini.
 */
export function useDashboardLayoutBuilder() {
  const dashboard = ref<DashboardAdminMetaDTO | null>(null)
  const versions = ref<LayoutVersionSummary[]>([])
  const draftLayout = ref<DashboardLayoutDTO | null>(null)

  const loading = ref(false)
  const saving = ref(false)
  const publishing = ref(false)
  const error = ref<string | null>(null)
  const hasUnsavedChanges = ref(false)

  const currentDraftVersion = computed(
    () => versions.value.find((v) => v.status === 'draft') ?? null
  )
  const currentPublishedVersion = computed(
    () => versions.value.find((v) => v.isDefault) ?? null
  )

  async function loadDashboardMeta(dashboardId: number | string) {
    const { $api } = useNuxtApp()
    dashboard.value = await apiFetch<DashboardAdminMetaDTO>($api.dashboardShowAdmin(dashboardId))
  }

  async function loadVersions(dashboardId: number | string) {
    const { $api } = useNuxtApp()
    versions.value = await apiFetch<LayoutVersionSummary[]>($api.dashboardLayouts(dashboardId))
  }

  async function loadLayoutDetail(dashboardId: number | string, layoutId: number) {
    const { $api } = useNuxtApp()
    draftLayout.value = await apiFetch<DashboardLayoutDTO>(
      $api.dashboardLayoutDetail(dashboardId, layoutId)
    )
    hasUnsavedChanges.value = false
  }

  /**
   * Entry point halaman builder: pastikan tersedia 1 draft yang bisa diedit.
   * - Sudah ada draft → load draft itu.
   * - Belum ada draft, tapi ada versi published (default) → clone jadi draft baru.
   * - Dashboard belum punya layout sama sekali → buat draft kosong.
   */
  async function ensureDraft(dashboardId: number | string) {
    loading.value = true
    error.value = null
    try {
      await loadDashboardMeta(dashboardId)
      await loadVersions(dashboardId)

      const existingDraft = currentDraftVersion.value
      if (existingDraft) {
        await loadLayoutDetail(dashboardId, existingDraft.id)
        return
      }

      const { $api } = useNuxtApp()
      const cloneFromLayoutId = currentPublishedVersion.value?.id
      const created = await apiFetch<DashboardLayoutDTO>($api.dashboardLayoutCreate(dashboardId), {
        method: 'POST',
        body: cloneFromLayoutId ? { cloneFromLayoutId } : {},
      })

      draftLayout.value = created
      hasUnsavedChanges.value = false
      await loadVersions(dashboardId)
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal memuat draft layout')
    } finally {
      loading.value = false
    }
  }

  /** Tambah widget dari katalog ke posisi paling bawah canvas (belum tersimpan ke server). */
  function addWidget(widget: DashboardWidgetDTO) {
    if (!draftLayout.value) return

    const items = draftLayout.value.layoutWidgets
    const nextY = items.reduce((max, lw) => Math.max(max, lw.posY + lw.height), 0)
    const tempId = -(Date.now() + Math.floor(Math.random() * 1000))

    const newItem: DashboardLayoutWidgetDTO = {
      id: tempId,
      dashboardLayoutId: draftLayout.value.id,
      widgetId: widget.id,
      instanceKey: genInstanceKey(widget.code),
      posX: 0,
      posY: nextY,
      width: widget.defaultWidth,
      height: widget.defaultHeight,
      sortOrder: items.length,
      isHiddenByDefault: false,
      instanceConfig: null,
      widget,
    }

    draftLayout.value = { ...draftLayout.value, layoutWidgets: [...items, newItem] }
    hasUnsavedChanges.value = true
  }

  /** Hapus 1 instance widget dari canvas (belum tersimpan ke server). */
  function removeWidget(dashboardLayoutWidgetId: number) {
    if (!draftLayout.value) return

    draftLayout.value = {
      ...draftLayout.value,
      layoutWidgets: draftLayout.value.layoutWidgets.filter(
        (lw) => lw.id !== dashboardLayoutWidgetId
      ),
    }
    hasUnsavedChanges.value = true
  }

  /** Terapkan hasil drag & resize dari event `layout-change` DashboardGrid ke state lokal. */
  function applyPositionChanges(
    items: { dashboardLayoutWidgetId: number; posX: number; posY: number; width: number; height: number }[]
  ) {
    if (!draftLayout.value || items.length === 0) return

    const byId = new Map(items.map((item) => [item.dashboardLayoutWidgetId, item]))
    draftLayout.value = {
      ...draftLayout.value,
      layoutWidgets: draftLayout.value.layoutWidgets.map((lw) => {
        const change = byId.get(lw.id)
        if (!change) return lw
        return { ...lw, posX: change.posX, posY: change.posY, width: change.width, height: change.height }
      }),
    }
    hasUnsavedChanges.value = true
  }

  /** Simpan hasil form "Konfigurasi Widget" (instance_config + isHiddenByDefault) untuk 1 instance. */
  function updateInstanceConfig(
    dashboardLayoutWidgetId: number,
    payload: { instanceConfig: Record<string, unknown> | null; isHiddenByDefault: boolean }
  ) {
    if (!draftLayout.value) return

    draftLayout.value = {
      ...draftLayout.value,
      layoutWidgets: draftLayout.value.layoutWidgets.map((lw) =>
        lw.id === dashboardLayoutWidgetId
          ? { ...lw, instanceConfig: payload.instanceConfig, isHiddenByDefault: payload.isHiddenByDefault }
          : lw
      ),
    }
    hasUnsavedChanges.value = true
  }

  /** Kirim seluruh state canvas saat ini sebagai snapshot penuh ke backend (delete + recreate). */
  async function saveDraft(dashboardId: number | string) {
    if (!draftLayout.value) return

    saving.value = true
    error.value = null
    try {
      const { $api } = useNuxtApp()
      const items = draftLayout.value.layoutWidgets.map((lw, index) => ({
        widgetId: lw.widgetId,
        instanceKey: lw.instanceKey,
        posX: lw.posX,
        posY: lw.posY,
        width: lw.width,
        height: lw.height,
        sortOrder: index,
        isHiddenByDefault: lw.isHiddenByDefault,
        instanceConfig: lw.instanceConfig,
      }))

      draftLayout.value = await apiFetch<DashboardLayoutDTO>(
        $api.dashboardLayoutUpdateWidgets(dashboardId, draftLayout.value.id),
        { method: 'PUT', body: { items } }
      )
      hasUnsavedChanges.value = false
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal menyimpan draft layout')
      throw err
    } finally {
      saving.value = false
    }
  }

  /** Publish draft saat ini jadi versi aktif (default) dashboard. */
  async function publishDraft(dashboardId: number | string) {
    if (!draftLayout.value) return

    publishing.value = true
    error.value = null
    try {
      if (hasUnsavedChanges.value) {
        await saveDraft(dashboardId)
      }
      const { $api } = useNuxtApp()
      await apiFetch($api.dashboardLayoutPublish(dashboardId, draftLayout.value.id), {
        method: 'POST',
      })
      await loadVersions(dashboardId)
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal publish layout')
      throw err
    } finally {
      publishing.value = false
    }
  }

  /** Hapus draft saat ini (tidak bisa dilakukan pada layout published/archived). */
  async function discardDraft(dashboardId: number | string) {
    if (!draftLayout.value) return

    const { $api } = useNuxtApp()
    await apiFetch($api.dashboardLayoutDelete(dashboardId, draftLayout.value.id), {
      method: 'DELETE',
    })
    draftLayout.value = null
    hasUnsavedChanges.value = false
    await loadVersions(dashboardId)
  }

  const rollingBack = ref(false)

  /**
   * Riwayat Versi — "rollback" ke versi lama (published/archived).
   *
   * Diimplementasikan dengan me-reuse endpoint yang sudah ada, bukan endpoint
   * baru: clone versi lama itu jadi draft baru (`createDraft` dgn
   * `cloneFromLayoutId`), lalu langsung `publish()` draft itu. Ini konsisten
   * dengan alur "edit = clone jadi draft baru" yang sudah dipakai Admin
   * Layout Builder sejak Fase 3 — rollback secara konsep memang "publish
   * ulang versi lama", bukan operasi baru.
   *
   * Kalau kebetulan sedang ada draft lain yang belum di-publish (WIP admin
   * lain/sesi lain), draft itu DIHAPUS dulu — sistem ini sengaja hanya
   * mengizinkan 1 draft aktif per dashboard (lihat `currentDraftVersion`),
   * jadi rollback tidak boleh meninggalkan 2 draft sekaligus.
   */
  async function rollbackToVersion(
    dashboardId: number | string,
    targetLayoutId: number,
    targetVersionNumber: number
  ) {
    rollingBack.value = true
    error.value = null
    const { $api } = useNuxtApp()

    try {
      await loadVersions(dashboardId)

      const staleDraft = currentDraftVersion.value
      if (staleDraft) {
        await apiFetch($api.dashboardLayoutDelete(dashboardId, staleDraft.id), { method: 'DELETE' })
      }

      const newDraft = await apiFetch<DashboardLayoutDTO>($api.dashboardLayoutCreate(dashboardId), {
        method: 'POST',
        body: {
          cloneFromLayoutId: targetLayoutId,
          label: `Rollback ke v${targetVersionNumber}`,
        },
      })

      await apiFetch($api.dashboardLayoutPublish(dashboardId, newDraft.id), { method: 'POST' })

      draftLayout.value = null
      hasUnsavedChanges.value = false
      await loadVersions(dashboardId)
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal rollback ke versi ini')
      throw err
    } finally {
      rollingBack.value = false
    }
  }

  return {
    dashboard,
    versions,
    draftLayout,
    loading,
    saving,
    publishing,
    error,
    hasUnsavedChanges,
    currentDraftVersion,
    currentPublishedVersion,
    ensureDraft,
    addWidget,
    removeWidget,
    applyPositionChanges,
    updateInstanceConfig,
    saveDraft,
    publishDraft,
    discardDraft,
    loadVersions,
    rollingBack,
    rollbackToVersion,
  }
}
