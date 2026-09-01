<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <PageDescription>Kelola register dan seluruh lifecycle perangkat.</PageDescription>

      <FinanceWorkspaceTabs
        id-prefix="equipment"
        :tabs="visibleTabs"
        :model-value="activeTab"
        @update:model-value="setTab"
      />

      <div
        v-if="isTabActivated('register')"
        v-show="activeTab === 'register'"
        id="equipment-panel-register"
        role="tabpanel"
        aria-labelledby="equipment-tab-register"
        class="pt-1"
      >
        <EquipmentRegisterTab />
      </div>

      <div
        v-if="isTabActivated('inspection')"
        v-show="activeTab === 'inspection'"
        id="equipment-panel-inspection"
        role="tabpanel"
        aria-labelledby="equipment-tab-inspection"
        class="pt-1"
      >
        <EquipmentInspectionTab />
      </div>

      <div
        v-if="isTabActivated('replacement')"
        v-show="activeTab === 'replacement'"
        id="equipment-panel-replacement"
        role="tabpanel"
        aria-labelledby="equipment-tab-replacement"
        class="pt-1"
      >
        <EquipmentReplacementTab />
      </div>

      <div
        v-if="isTabActivated('repair')"
        v-show="activeTab === 'repair'"
        id="equipment-panel-repair"
        role="tabpanel"
        aria-labelledby="equipment-tab-repair"
        class="pt-1"
      >
        <EquipmentRepairTab />
      </div>

      <div
        v-if="isTabActivated('scrap')"
        v-show="activeTab === 'scrap'"
        id="equipment-panel-scrap"
        role="tabpanel"
        aria-labelledby="equipment-tab-scrap"
        class="pt-1"
      >
        <EquipmentScrapTab />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FinanceWorkspaceTabs from '~/components/finance/FinanceWorkspaceTabs.vue'
import EquipmentRegisterTab from '~/components/inventory/equipment/EquipmentRegisterTab.vue'
import EquipmentInspectionTab from '~/components/inventory/equipment/EquipmentInspectionTab.vue'
import EquipmentReplacementTab from '~/components/inventory/equipment/EquipmentReplacementTab.vue'
import EquipmentRepairTab from '~/components/inventory/equipment/EquipmentRepairTab.vue'
import EquipmentScrapTab from '~/components/inventory/equipment/EquipmentScrapTab.vue'
import { useFinanceWorkspaceTabs } from '~/composables/useFinanceWorkspaceTabs'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { EQUIPMENT_WORKSPACE_TABS } from '~/utils/inventory/lifecycleWorkspaces'
import type { FinanceWorkspaceTab } from '~/types/finance/workspace'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Equipment',
  description: 'Kelola register dan seluruh lifecycle perangkat.',
})

const { setListTitle } = useDynamicTitle()

const workspaceTabs: FinanceWorkspaceTab[] = EQUIPMENT_WORKSPACE_TABS.map((tab) => ({
  id: tab.id,
  label: tab.label,
  permission: tab.permission,
}))

const { activeTab, visibleTabs, setTab, isTabActivated } = useFinanceWorkspaceTabs({
  tabs: workspaceTabs,
  defaultTabId: 'register',
})

onMounted(() => {
  setListTitle('Equipment')
})
</script>
