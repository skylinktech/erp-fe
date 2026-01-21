<template>
    <div class="modal fade" :id="id" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog" :class="dialogClass || 'modal-lg'" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="row">
                        <div class="text-center mb-6">
                        <h4 class="modal-title mb-2 pb-0">{{ title }}</h4>
                        <p>{{ description }}</p>
                        </div>
                        <div v-if="validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0" class="px-2 py-2 mb-2 w-90 mx-auto">
                            <h6 class="text-danger px-4 mb-2"><strong>Terdapat kesalahan validasi data:</strong></h6>
                            <ul>
                              <li v-for="(err, index) in validationErrors" :key="index">
                              {{ typeof err === 'string' ? err : (err?.message || String(err)) }}
                              </li>
                            </ul>
                        </div>
                    </div>
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Judul Modal Default'
  },
  description: {
    type: String,
    default: 'Deskripsi Modal Default'
  },
  validationErrorsFromParent: {
    type: Array,
    default: () => []
  },
  dialogClass: {
    type: String,
    default: 'modal-lg'
  }
});

// Use computed instead of ref + watch for better reactivity
// This avoids lifecycle hook issues and is more performant
const validationErrors = computed(() => {
  const errors = props.validationErrorsFromParent;
  return Array.isArray(errors) ? errors : [];
});
</script>

<style scoped>

</style>