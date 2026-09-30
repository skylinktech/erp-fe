<template>
  <div class="dropdown text-end">
    <button
      type="button"
      class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
      data-bs-toggle="dropdown"
      data-bs-popper-config='{"strategy":"fixed"}'
      :disabled="disabled || busy"
      :aria-busy="busy ? 'true' : 'false'"
      :aria-label="busy ? busyLabel : ariaLabel"
    >
      <span
        v-if="busy"
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      />
      <i v-else class="ri-more-2-fill" aria-hidden="true" />
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="action in actions" :key="action.key">
        <button
          type="button"
          class="dropdown-item"
          :class="action.danger ? 'text-danger' : ''"
          :disabled="action.disabled || disabled || busy || action.busy"
          @click="emit('select', action.key)"
        >
          <span
            v-if="action.busy"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          <i v-else-if="action.icon" :class="action.icon" class="me-2" aria-hidden="true" />
          {{ action.busy ? busyLabel : action.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
export type CommerceRowAction = {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  danger?: boolean
  busy?: boolean
}

withDefaults(
  defineProps<{
    actions: CommerceRowAction[]
    disabled?: boolean
    busy?: boolean
    busyLabel?: string
    ariaLabel?: string
  }>(),
  {
    disabled: false,
    busy: false,
    busyLabel: 'Memproses…',
    ariaLabel: 'Aksi',
  }
)

const emit = defineEmits<{
  select: [key: string]
}>()
</script>
