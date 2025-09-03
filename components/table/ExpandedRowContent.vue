<template>
  <div class="expanded-row-content bg-white">
    
    <div v-if="account?.children && account.children.length > 0">
      <h6 class="mb-3 text-secondary">
        Sub-accounts
      </h6>
      
      <ChildrenDataTable :children="account.children" />
    </div>
    
    <!-- Empty State untuk Children -->
    <div v-else class="text-center py-4">
      <div class="mb-3">
        <i class="ri-inbox-line ri-48px text-muted"></i>
      </div>
      <p class="text-muted mb-2">Tidak ada sub-akun untuk akun ini</p>
      <button 
        v-if="userHasRole('superadmin') || userHasPermission('create_account')"
        @click="openAddChildModal(account)" 
        class="btn btn-sm btn-outline-primary"
      >
        <i class="ri-add-line me-1"></i>
        Tambah Sub-akun
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePermissions } from '~/composables/usePermissions'
import ChildrenDataTable from './ChildrenDataTable.vue'

// Props
const props = defineProps({
  account: {
    type: Object,
    required: true
  }
})

// Composables
const { userHasRole, userHasPermission } = usePermissions()

// Methods
const openAddChildModal = (parentAccount) => {
  // Emit event untuk parent component
  emit('add-child', parentAccount)
}

// Emits
const emit = defineEmits(['add-child'])
</script>

<style scoped>
.expanded-row-content {
  padding-left: 3rem;
  background-color: #f8f9fa;
  border-left: 3px solid #d9d9d9;
}
</style>