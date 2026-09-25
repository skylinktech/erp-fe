<template>
  <div class="active-company-field" :class="wrapperClass">
    <label v-if="labelText" class="form-label" :for="inputId">{{ labelText }}</label>
    <input
      :id="inputId"
      type="text"
      class="form-control"
      :value="displayLabel"
      readonly
      :aria-invalid="!ready"
      :aria-describedby="hintId"
    />
    <p :id="hintId" class="form-text small mb-0" :class="ready ? 'text-muted' : 'text-warning'">
      <template v-if="ready">
        Perusahaan yang sedang aktif
        <span v-if="canSwitch">(ganti lewat pemilih perusahaan)</span>.
      </template>
      <template v-else>{{ missingMessage || 'Active Company belum tersedia.' }}</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveCompany } from '~/composables/useActiveCompany'

const props = withDefaults(
  defineProps<{
    labelText?: string
    inputId?: string
    wrapperClass?: string
  }>(),
  {
    labelText: 'Perusahaan',
    inputId: 'active-company-field',
    wrapperClass: '',
  }
)

const { label, ready, missingMessage, canSwitchCompany, ensureBootstrapped } = useActiveCompany()

const displayLabel = computed(() => label.value)
const canSwitch = computed(() => canSwitchCompany.value)
const hintId = computed(() => `${props.inputId}-hint`)

ensureBootstrapped()
</script>
