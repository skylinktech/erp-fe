<template>
  <div class="dropdown text-end">
    <button
      type="button"
      class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
      data-bs-toggle="dropdown"
      data-bs-popper-config='{"strategy":"fixed"}'
      :disabled="disabled"
      :aria-label="ariaLabel"
    >
      <i class="ri-more-2-fill" aria-hidden="true" />
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="action in actions" :key="action.key">
        <button
          type="button"
          class="dropdown-item"
          :class="action.danger ? 'text-danger' : ''"
          :disabled="action.disabled || disabled"
          @click="emit('select', action.key)"
        >
          <i v-if="action.icon" :class="action.icon" class="me-2" aria-hidden="true" />
          {{ action.label }}
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
}

withDefaults(
  defineProps<{
    actions: CommerceRowAction[]
    disabled?: boolean
    ariaLabel?: string
  }>(),
  {
    disabled: false,
    ariaLabel: 'Aksi',
  }
)

const emit = defineEmits<{
  select: [key: string]
}>()
</script>
