<template>
  <label :for="htmlFor || undefined" :class="labelClass" :id="labelId || undefined">
    <slot>{{ label }}</slot>
    <span v-if="required" class="text-danger" aria-hidden="true">&nbsp;*</span>
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    htmlFor?: string
    labelId?: string
    labelClass?: string
  }>(),
  {
    label: '',
    required: false,
    htmlFor: '',
    labelId: '',
    labelClass: 'form-label',
  }
)
</script>
