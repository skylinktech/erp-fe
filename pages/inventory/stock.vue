<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <PageDescription>Kelola aktivitas dan pergerakan stok inventory.</PageDescription>

      <FinanceWorkspaceTabs
        id-prefix="stock"
        :tabs="visibleTabs"
        :model-value="activeTab"
        @update:model-value="setTab"
      />

      <div
        v-if="isTabActivated('overview')"
        v-show="activeTab === 'overview'"
        id="stock-panel-overview"
        role="tabpanel"
        aria-labelledby="stock-tab-overview"
        class="pt-1"
      >
        <StockOverviewTab />
      </div>

      <div
        v-if="isTabActivated('stock-in')"
        v-show="activeTab === 'stock-in'"
        id="stock-panel-stock-in"
        role="tabpanel"
        aria-labelledby="stock-tab-stock-in"
        class="pt-1"
      >
        <StockInTab />
      </div>

      <div
        v-if="isTabActivated('stock-out')"
        v-show="activeTab === 'stock-out'"
        id="stock-panel-stock-out"
        role="tabpanel"
        aria-labelledby="stock-tab-stock-out"
        class="pt-1"
      >
        <StockOutTab />
      </div>

      <div
        v-if="isTabActivated('transfer')"
        v-show="activeTab === 'transfer'"
        id="stock-panel-transfer"
        role="tabpanel"
        aria-labelledby="stock-tab-transfer"
        class="pt-1"
      >
        <StockTransferTab />
      </div>

      <div
        v-if="isTabActivated('movements')"
        v-show="activeTab === 'movements'"
        id="stock-panel-movements"
        role="tabpanel"
        aria-labelledby="stock-tab-movements"
        class="pt-1"
      >
        <StockMovementsTab />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FinanceWorkspaceTabs from '~/components/finance/FinanceWorkspaceTabs.vue'
import StockOverviewTab from '~/components/inventory/stock/StockOverviewTab.vue'
import StockInTab from '~/components/inventory/stock/StockInTab.vue'
import StockOutTab from '~/components/inventory/stock/StockOutTab.vue'
import StockTransferTab from '~/components/inventory/stock/StockTransferTab.vue'
import StockMovementsTab from '~/components/inventory/stock/StockMovementsTab.vue'
import { useFinanceWorkspaceTabs } from '~/composables/useFinanceWorkspaceTabs'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import { STOCK_WORKSPACE_TABS } from '~/utils/inventory/stockWorkspace'
import type { FinanceWorkspaceTab } from '~/types/finance/workspace'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Stock',
  description: 'Kelola aktivitas dan pergerakan stok inventory.',
  alias: ['/inventory/stok'],
})

const { setListTitle } = useDynamicTitle()

const workspaceTabs: FinanceWorkspaceTab[] = STOCK_WORKSPACE_TABS.map((tab) => ({
  id: tab.id,
  label: tab.label,
  permission: tab.permission,
}))

const { activeTab, visibleTabs, setTab, isTabActivated } = useFinanceWorkspaceTabs({
  tabs: workspaceTabs,
  defaultTabId: 'overview',
})

onMounted(() => {
  setListTitle('Stock')
})
</script>
