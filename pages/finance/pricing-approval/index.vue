<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-4">
        Kelola pengajuan penyesuaian harga dan approval pricing dalam satu workspace.
      </p>

      <FinanceWorkspaceTabs
        :tabs="visibleTabs"
        :model-value="activeTab"
        id-prefix="price-adjustment"
        @update:model-value="setTab"
      />

      <!-- Single active panel: shared store must not double-fetch -->
      <PriceAdjustmentRequestPanel
        v-if="activeTab === 'my-requests'"
        :key="'my-requests'"
        mode="my-requests"
      />
      <PriceAdjustmentRequestPanel
        v-else-if="activeTab === 'approval' && isTabActivated('approval')"
        :key="'approval'"
        mode="approval"
      />
    </div>
    <div class="content-backdrop fade"></div>
  </div>
</template>

<script setup lang="ts">
import FinanceWorkspaceTabs from '~/components/finance/FinanceWorkspaceTabs.vue'
import PriceAdjustmentRequestPanel from '~/components/price-adjustment/PriceAdjustmentRequestPanel.vue'
import { useFinanceWorkspaceTabs } from '~/composables/useFinanceWorkspaceTabs'
import { useDynamicTitle } from '~/composables/useDynamicTitle'
import type { FinanceWorkspaceTab } from '~/types/finance/workspace'

const { setListTitle } = useDynamicTitle()

/**
 * My Request: visible to anyone who can open this page (maker/requester).
 * Approval: only users with approve/reject capability (or superadmin via composable).
 */
const workspaceTabs: FinanceWorkspaceTab[] = [
  { id: 'my-requests', label: 'My Request' },
  {
    id: 'approval',
    label: 'Pricing Approval',
    permission: ['approve_price_adjustment', 'reject_price_adjustment'],
  },
]

const { activeTab, visibleTabs, setTab, isTabActivated } = useFinanceWorkspaceTabs({
  tabs: workspaceTabs,
  defaultTabId: 'my-requests',
})

watch(
  activeTab,
  (tab) => {
    setListTitle(tab === 'approval' ? 'Pricing Approval' : 'My Request')
  },
  { immediate: true }
)

definePageMeta({
  title: 'Pricing Approval',
})
</script>
