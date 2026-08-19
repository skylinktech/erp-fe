<template>
  <div>
    <div v-if="layout === 'buttons'" class="d-none d-md-flex flex-wrap gap-2 justify-content-md-end">
      <button
        v-for="action in visible"
        :key="action.key"
        type="button"
        class="btn btn-sm"
        :class="buttonClass(action)"
        :disabled="busy"
        :aria-label="action.label"
        @click="$emit('action', action.key)"
      >
        <span v-if="busy" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        <i v-else :class="[action.icon, 'me-1']"></i>
        {{ action.label }}
      </button>
    </div>
    <div :class="layout === 'buttons' ? 'd-md-none' : ''" class="d-inline-block payroll-run-actions">
      <div class="btn-group">
        <button
          type="button"
          class="btn btn-outline-secondary dropdown-toggle btn-sm"
          data-bs-toggle="dropdown"
          data-bs-popper-config='{"strategy":"fixed"}'
          data-bs-boundary="viewport"
          aria-expanded="false"
          aria-label="Actions"
          :disabled="busy"
        >
          Actions
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li v-for="action in visible" :key="action.key">
            <button
              type="button"
              class="dropdown-item"
              :class="{ 'text-danger': action.variant === 'danger' }"
              @click="$emit('action', action.key)"
            >
              <i :class="[action.icon, 'me-2']"></i>{{ action.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PayrollRunAction, PayrollRunActionKey } from '~/composables/usePayrollRunActions'
import type { PayrollRunSummary } from '~/types/payroll'

const props = withDefaults(
  defineProps<{
    run?: PayrollRunSummary | null
    layout?: 'buttons' | 'dropdown'
    busy?: boolean
    exclude?: PayrollRunActionKey[]
  }>(),
  { layout: 'dropdown', busy: false, exclude: () => [] }
)

defineEmits<{ action: [key: PayrollRunActionKey] }>()

const { actionsFor } = usePayrollRunActions()
const visible = computed(() => actionsFor(props.run).filter((a) => !props.exclude.includes(a.key)))

function buttonClass(action: PayrollRunAction) {
  if (action.variant === 'primary') return 'btn-primary'
  if (action.variant === 'danger') return 'btn-outline-danger'
  return 'btn-outline-secondary'
}
</script>

<style scoped>
.payroll-run-actions :deep(.dropdown-menu) {
  z-index: 1080;
}
</style>

<style>
/* Hindari dropdown Actions ter-clip oleh .table-responsive di daftar payroll runs */
.table-responsive:has(.payroll-run-actions .btn-group.show) {
  overflow: visible;
}
</style>
