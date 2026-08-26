import type { FinanceWorkspaceTab } from '~/types/finance/workspace'
import { usePermissions } from '~/composables/usePermissions'

/**
 * Tab navigation synced to ?tab= query. Lazy activation; preserves other query keys.
 */
export function useFinanceWorkspaceTabs(options: {
  tabs: MaybeRefOrGetter<FinanceWorkspaceTab[]>
  defaultTabId: string
  queryKey?: string
}) {
  const route = useRoute()
  const router = useRouter()
  const { userHasPermission, userHasRole } = usePermissions()
  const queryKey = options.queryKey || 'tab'

  const activated = ref<Set<string>>(new Set())

  function canAccessTab(tab: FinanceWorkspaceTab): boolean {
    if (userHasRole('superadmin')) return true
    if (!tab.permission) return true
    const perms = Array.isArray(tab.permission) ? tab.permission : [tab.permission]
    return perms.some((p) => userHasPermission(p))
  }

  const visibleTabs = computed(() =>
    toValue(options.tabs).filter((t) => canAccessTab(t))
  )

  const firstAllowedId = computed(
    () => visibleTabs.value[0]?.id || options.defaultTabId
  )

  const activeTab = computed(() => {
    const raw = String(route.query[queryKey] || '')
    const match = visibleTabs.value.find((t) => t.id === raw)
    return match?.id || firstAllowedId.value
  })

  function setTab(tabId: string) {
    const allowed = visibleTabs.value.some((t) => t.id === tabId)
    const next = allowed ? tabId : firstAllowedId.value
    activated.value.add(next)
    const query = { ...route.query, [queryKey]: next }
    router.replace({ query })
  }

  // Ensure invalid/unauthorized tab redirects to first allowed
  watch(
    [() => route.query[queryKey], visibleTabs],
    () => {
      const raw = String(route.query[queryKey] || '')
      const allowed = visibleTabs.value.some((t) => t.id === raw)
      if (!raw || !allowed) {
        if (route.query[queryKey] !== firstAllowedId.value) {
          setTab(firstAllowedId.value)
          return
        }
      }
      activated.value.add(activeTab.value)
    },
    { immediate: true }
  )

  function isTabActivated(tabId: string) {
    return activated.value.has(tabId) || activeTab.value === tabId
  }

  return {
    activeTab,
    visibleTabs,
    setTab,
    isTabActivated,
    canAccessTab,
  }
}
