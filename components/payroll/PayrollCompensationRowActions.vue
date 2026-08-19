<template>
  <div v-if="hasActions" class="d-flex justify-content-end payroll-row-actions">
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
import { navigateTo } from '#app'
import { computed, ref } from 'vue'
import Menu from 'primevue/menu'

const props = defineProps<{
  row: Record<string, unknown>
  returnTo?: 'config'
}>()

const store = usePayrollStore()
const { canManageCompensation } = usePayrollPermissions()
const menuRef = ref<InstanceType<typeof Menu> | null>(null)

const menuItems = computed(() => {
  if (!canManageCompensation.value) return []

  const items: Array<Record<string, unknown>> = []
  const status = String(props.row.status)
  const id = props.row.id
  const returnQuery = props.returnTo === 'config' ? '?return=config' : ''
  const returnSuffix = props.returnTo === 'config' ? '&return=config' : ''

  if (status === 'DRAFT') {
    items.push({
      label: 'Edit',
      icon: 'ri ri-edit-box-line',
      command: () => navigateTo(`/payroll/compensations/${id}/edit${returnQuery}`),
    })
  }
  if (status === 'ACTIVE') {
    items.push({
      label: 'Versi Baru',
      icon: 'ri ri-file-copy-line',
      command: () => navigateTo(`/payroll/compensations/create?from=${id}${returnSuffix}`),
    })
  }
  if (status !== 'ACTIVE') {
    if (items.length) items.push({ separator: true })
    items.push({
      label: 'Activate',
      icon: 'ri ri-checkbox-circle-line',
      command: () => store.activateCompensation(id),
    })
  }

  return items
})

const hasActions = computed(() => menuItems.value.length > 0)

function toggleMenu(event: MouseEvent) {
  menuRef.value?.toggle(event)
}
</script>
