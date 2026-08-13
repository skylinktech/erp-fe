<template>
  <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
    <div>
      <NuxtLink v-if="cancelHref" :to="cancelHref" class="btn btn-outline-secondary">
        {{ cancelLabel }}
      </NuxtLink>
      <button v-else type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
        {{ cancelLabel }}
      </button>
    </div>
    <div class="d-flex flex-wrap gap-2">
      <button
        v-if="!isFirstStep"
        type="button"
        class="btn btn-outline-secondary"
        :disabled="loading || saving"
        @click="$emit('previous')"
      >
        {{ previousLabel }}
      </button>
      <button
        v-if="!isLastStep"
        type="button"
        class="btn btn-primary"
        :disabled="loading || saving"
        @click="$emit('next')"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ nextLabel }}
      </button>
      <button v-else type="submit" class="btn btn-primary" :disabled="saving || loading || submitDisabled">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isFirstStep: boolean
    isLastStep: boolean
    loading?: boolean
    saving?: boolean
    submitDisabled?: boolean
    cancelHref?: string
    cancelLabel?: string
    submitLabel?: string
    nextLabel?: string
    previousLabel?: string
  }>(),
  {
    loading: false,
    saving: false,
    submitDisabled: false,
    cancelHref: '',
    cancelLabel: 'Batal',
    submitLabel: 'Simpan',
    nextLabel: 'Selanjutnya',
    previousLabel: 'Sebelumnya',
  }
)

defineEmits<{
  next: []
  previous: []
  cancel: []
}>()
</script>
