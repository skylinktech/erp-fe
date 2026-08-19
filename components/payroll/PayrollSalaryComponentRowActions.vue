<template>
  <div v-if="canManageComponent" class="d-flex justify-content-end payroll-row-actions">
    <button
      type="button"
      class="btn btn-sm btn-text-secondary rounded-pill btn-icon"
      aria-haspopup="true"
      @click.stop="toggleMenu"
    >
      <i class="ri-more-2-fill"></i>
    </button>
    <Menu ref="menuRef" :model="menuItems" :popup="true" append-to="body" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Menu from 'primevue/menu'

const props = defineProps<{
  row: Record<string, unknown>
}>()

const emit = defineEmits<{
  edit: [row: Record<string, unknown>]
  delete: [row: Record<string, unknown>]
}>()

const { canManageComponent } = usePayrollPermissions()
const menuRef = ref<InstanceType<typeof Menu> | null>(null)

const menuItems = computed(() => {
  const items: Array<Record<string, unknown>> = [
    {
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => emit('edit', props.row),
    },
  ]
  items.push({ separator: true })
  items.push({
    label: 'Hapus',
    icon: 'ri ri-delete-bin-7-line',
    class: 'payroll-menu-danger',
    command: () => emit('delete', props.row),
  })
  return items
})

function toggleMenu(event: MouseEvent) {
  menuRef.value?.toggle(event)
}
</script>

<style scoped>
:deep(.payroll-menu-danger .p-menuitem-link) {
  color: var(--bs-danger) !important;
}
</style>
