<template>
  <div class="dashboard-widget-config-form">
    <div v-if="!schema || schema.length === 0" class="text-muted small mb-3">
      <i class="ri-information-line me-1"></i>
      Widget ini tidak mendefinisikan <code>configSchema</code>, jadi tidak ada opsi kustom yang bisa diatur.
    </div>

    <div v-for="field in schema || []" :key="field.key" class="mb-3">
      <label class="form-label">{{ field.label }}</label>

      <textarea
        v-if="field.type === 'textarea'"
        class="form-control"
        rows="3"
        :placeholder="field.helpText || ''"
        v-model="localValues[field.key]"
      ></textarea>

      <div v-else-if="field.type === 'boolean'" class="form-check form-switch">
        <input
          type="checkbox"
          class="form-check-input"
          :id="`config-field-${field.key}`"
          v-model="localValues[field.key]"
        />
        <label class="form-check-label" :for="`config-field-${field.key}`">Aktif</label>
      </div>

      <input
        v-else
        :type="field.type === 'number' ? 'number' : 'text'"
        class="form-control"
        :placeholder="field.helpText || ''"
        v-model="localValues[field.key]"
      />

      <small v-if="field.helpText && field.type !== 'textarea' && field.type !== 'text' && field.type !== 'number'" class="text-muted">
        {{ field.helpText }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { DashboardWidgetConfigField } from '~/composables/useDashboardEngine'

/**
 * Fase 3 — form dinamis untuk mengisi `instance_config` 1 widget instance,
 * dibangun dari `dashboard_widgets.config_schema` (didefinisikan admin lewat
 * halaman Katalog Widget). Widget yang tidak mendefinisikan schema tetap
 * bisa dipasang di layout — cuma tidak punya opsi kustom untuk diatur di sini.
 */
const props = defineProps<{
  schema?: DashboardWidgetConfigField[] | null
  modelValue: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown> | null): void
}>()

function buildInitialValues(): Record<string, any> {
  const values: Record<string, any> = { ...(props.modelValue || {}) }
  for (const field of props.schema || []) {
    if (values[field.key] === undefined) {
      values[field.key] = field.default ?? (field.type === 'boolean' ? false : '')
    }
  }
  return values
}

const localValues = reactive<Record<string, any>>(buildInitialValues())

watch(
  localValues,
  (newValues) => {
    emit('update:modelValue', { ...newValues })
  },
  { deep: true }
)
</script>
