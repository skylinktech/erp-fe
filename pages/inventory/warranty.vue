<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <PageDescription>Kelola penilaian, klaim, dan proses RMA perangkat.</PageDescription>

      <FinanceWorkspaceTabs
        id-prefix="warranty"
        :tabs="visibleTabs"
        :model-value="activeTab"
        @update:model-value="setTab"
      />

      <div
        v-if="isTabActivated('assessments')"
        v-show="activeTab === 'assessments'"
        id="warranty-panel-assessments"
        role="tabpanel"
        aria-labelledby="warranty-tab-assessments"
        class="pt-1"
      >
        <WarrantyAssessmentsTab />
      </div>

      <div
        v-if="isTabActivated('claims')"
        v-show="activeTab === 'claims'"
        id="warranty-panel-claims"
        role="tabpanel"
        aria-labelledby="warranty-tab-claims"
        class="pt-1"
      >
        <WarrantyClaimsTab />
      </div>

      <div
        v-if="isTabActivated('rma')"
        v-show="activeTab === 'rma'"
        id="warranty-panel-rma"
        role="tabpanel"
        aria-labelledby="warranty-tab-rma"
        class="pt-1"
      >
        <WarrantyRmaTab />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FinanceWorkspaceTabs from '~/components/finance/FinanceWorkspaceTabs.vue'
import WarrantyAssessmentsTab from '~/components/inventory/warranty/WarrantyAssessmentsTab.vue'
import WarrantyClaimsTab from '~/components/inventory/warranty/WarrantyClaimsTab.vue'
import WarrantyRmaTab from '~/components/inventory/warranty/WarrantyRmaTab.vue'
import { useFinanceWorkspaceTabs } from '~/composables/useFinanceWorkspaceTabs'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { WARRANTY_WORKSPACE_TABS } from '~/utils/inventory/lifecycleWorkspaces'
import type { FinanceWorkspaceTab } from '~/types/finance/workspace'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Warranty',
  description: 'Kelola penilaian, klaim, dan proses RMA perangkat.',
})

const { setListTitle } = useDynamicTitle()

const workspaceTabs: FinanceWorkspaceTab[] = WARRANTY_WORKSPACE_TABS.map((tab) => ({
  id: tab.id,
  label: tab.label,
  permission: tab.permission,
}))

const { activeTab, visibleTabs, setTab, isTabActivated } = useFinanceWorkspaceTabs({
  tabs: workspaceTabs,
  defaultTabId: 'assessments',
})

onMounted(() => {
  setListTitle('Warranty')
})
</script>
