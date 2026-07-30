import { defineAsyncComponent, h, type Component } from 'vue'

/**
 * Widget Registry — Fase 1 (static mapping).
 *
 * `component_key` (dari tabel `dashboard_widgets` di backend) di-mapping ke
 * komponen Vue lazy-loaded di sini. Widget yang didaftarkan adalah komponen
 * EXISTING yang sudah production-ready (SystemStatsCard, ActivityFeedCard,
 * ImportantNotificationsCard) — masing-masing sudah self-contained: fetch
 * data sendiri lewat store Pinia-nya, dan punya loading/error/retry sendiri.
 * Dashboard Engine tidak perlu tahu apa-apa soal cara widget mengambil data.
 *
 * Menambah widget baru ke framework = tambah 1 baris di sini + 1 baris seed
 * `dashboard_widgets` di backend. Tidak perlu ubah DashboardGrid/WidgetHost.
 *
 * Fase 2+ bisa mengganti static map ini dengan dynamic import berbasis
 * manifest/plugin registration tanpa mengubah kontrak `resolve()`/`isRegistered()`
 * di bawah, jadi halaman & komponen yang memakai registry ini tidak perlu ikut berubah.
 */
const WIDGET_COMPONENT_MAP: Record<string, () => Promise<Component>> = {
  system_stats: () => import('~/components/dashboard/SystemStatsCard.vue') as Promise<Component>,
  activity_feed: () => import('~/components/dashboard/ActivityFeedCard.vue') as Promise<Component>,
  important_notifications: () =>
    import('~/components/dashboard/ImportantNotificationsCard.vue') as Promise<Component>,
  login_activity: () => import('~/components/dashboard/LoginActivityCard.vue') as Promise<Component>,
  online_users: () => import('~/components/dashboard/OnlineUsersCard.vue') as Promise<Component>,
  total_user_login: () =>
    import('~/components/dashboard/TotalUserLoginCard.vue') as Promise<Component>,
  revenue: () => import('~/components/dashboard/RevenueCard.vue') as Promise<Component>,
}

const resolvedCache = new Map<string, Component>()

const WidgetSkeleton = defineComponentInline()

function defineComponentInline(): Component {
  return {
    name: 'DashboardWidgetSkeleton',
    render() {
      return h('div', { class: 'card h-100 dashboard-widget-skeleton', 'aria-busy': 'true' }, [
        h('div', { class: 'card-body' }, [
          h('div', { class: 'placeholder-glow' }, [
            h('span', { class: 'placeholder col-6 mb-3 d-block' }),
            h('span', { class: 'placeholder col-12 mb-2 d-block' }),
            h('span', { class: 'placeholder col-8 d-block' }),
          ]),
        ]),
      ])
    },
  }
}

export function useWidgetRegistry() {
  /** True jika component_key sudah terdaftar di registry. */
  function isRegistered(componentKey: string): boolean {
    return Boolean(WIDGET_COMPONENT_MAP[componentKey])
  }

  /**
   * Resolve component_key -> komponen Vue async (lazy-loaded per chunk).
   * Return null jika belum terdaftar — pemanggil (DashboardWidgetHost)
   * bertanggung jawab menampilkan fallback "widget belum didukung"
   * alih-alih crash.
   */
  function resolve(componentKey: string): Component | null {
    if (!WIDGET_COMPONENT_MAP[componentKey]) return null

    if (!resolvedCache.has(componentKey)) {
      resolvedCache.set(
        componentKey,
        defineAsyncComponent({
          loader: WIDGET_COMPONENT_MAP[componentKey],
          loadingComponent: WidgetSkeleton,
          delay: 150,
          timeout: 15000,
        })
      )
    }

    return resolvedCache.get(componentKey) ?? null
  }

  return { resolve, isRegistered }
}
