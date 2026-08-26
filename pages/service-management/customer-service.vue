<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">
        Workspace layanan pelanggan: daftar operasional, monitoring KPI, dan riwayat event.
      </p>

      <FinanceWorkspaceTabs
        :tabs="visibleTabs"
        :model-value="activeTab"
        @update:model-value="onTabChange"
      />

      <div
        v-if="isTabActivated('services')"
        v-show="activeTab === 'services'"
        class="pt-1"
      >
        <CustomerServiceListTab
          @open-monitoring="openMonitoringFor"
          @open-events="openEventsFor"
        />
      </div>

      <div
        v-if="isTabActivated('monitoring')"
        v-show="activeTab === 'monitoring'"
        class="pt-1"
      >
        <ServiceMonitoringTab :service-id="serviceId" :active="activeTab === 'monitoring'" />
      </div>

      <div
        v-if="isTabActivated('events')"
        v-show="activeTab === 'events'"
        class="pt-1"
      >
        <ServiceEventTab
          :service-id="serviceId"
          :active="activeTab === 'events'"
          @clear-service-id="clearServiceId"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FinanceWorkspaceTabs from '~/components/finance/FinanceWorkspaceTabs.vue'
import CustomerServiceListTab from '~/components/service-management/CustomerServiceListTab.vue'
import ServiceMonitoringTab from '~/components/service-management/ServiceMonitoringTab.vue'
import ServiceEventTab from '~/components/service-management/ServiceEventTab.vue'
import { useFinanceWorkspaceTabs } from '~/composables/useFinanceWorkspaceTabs'
import type { FinanceWorkspaceTab } from '~/types/finance/workspace'
import { useDynamicTitle } from '~/composables/useDynamicTitle'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Customer Service',
})

const route = useRoute()
const router = useRouter()
const { setListTitle } = useDynamicTitle()

const workspaceTabs: FinanceWorkspaceTab[] = [
  {
    id: 'services',
    label: 'Daftar Layanan',
    permission: ['view_service_instance'],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    permission: ['view_service_instance'],
  },
  {
    id: 'events',
    label: 'Riwayat Event',
    permission: ['view_service_instance'],
  },
]

const { activeTab, visibleTabs, isTabActivated } = useFinanceWorkspaceTabs({
  tabs: workspaceTabs,
  defaultTabId: 'services',
})

const serviceId = computed(() => {
  const raw = route.query.serviceId
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null
})

function onTabChange(tabId: string) {
  const allowed = visibleTabs.value.some((t) => t.id === tabId)
  const next = allowed ? tabId : visibleTabs.value[0]?.id || 'services'
  const query: Record<string, any> = { ...route.query, tab: next }
  if (next === 'services') delete query.serviceId
  router.replace({ query })
}

function openMonitoringFor(row: Record<string, unknown>) {
  const id = String(row.id || '')
  if (!id) return
  router.replace({
    query: { ...route.query, tab: 'monitoring', serviceId: id },
  })
}

function openEventsFor(row: Record<string, unknown>) {
  const id = String(row.id || '')
  if (!id) return
  router.replace({
    query: { ...route.query, tab: 'events', serviceId: id },
  })
}

function clearServiceId() {
  const query = { ...route.query }
  delete query.serviceId
  router.replace({ query })
}

onMounted(() => {
  setListTitle('Customer Service')
})
</script>
