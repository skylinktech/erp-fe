<template>
  <div class="qr-code-container" :class="containerClass">
    <div v-if="loading" class="qr-loading">
      <span>Loading QR...</span>
    </div>
    <div v-else-if="error" class="qr-error">
      <span>{{ error }}</span>
    </div>
    <div v-else class="qr-code-wrapper">
      <qrcode-vue
        :value="value"
        :size="size"
        :level="level"
        :render-as="renderAs"
        :margin="margin"
        :background="background"
        :foreground="foreground"
        class="qr-code-image"
      />
      <div v-if="showLabel" class="qr-label">
        <slot name="label">
          <span class="qr-label-text">{{ label }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  // URL atau data yang akan di-encode ke QR
  value: {
    type: String,
    required: true,
  },
  // Ukuran QR code dalam pixel
  size: {
    type: Number,
    default: 200,
  },
  // Level error correction: 'L', 'M', 'Q', 'H'
  level: {
    type: String,
    default: 'M',
    validator: (value) => ['L', 'M', 'Q', 'H'].includes(value),
  },
  // Render sebagai 'canvas' atau 'svg'
  renderAs: {
    type: String,
    default: 'canvas',
    validator: (value) => ['canvas', 'svg'].includes(value),
  },
  // Margin around QR
  margin: {
    type: Number,
    default: 1,
  },
  // Background color
  background: {
    type: String,
    default: '#ffffff',
  },
  // Foreground (QR) color
  foreground: {
    type: String,
    default: '#000000',
  },
  // Show label below QR
  showLabel: {
    type: Boolean,
    default: false,
  },
  // Label text
  label: {
    type: String,
    default: 'Scan untuk verifikasi',
  },
  // Custom container class
  containerClass: {
    type: String,
    default: '',
  },
})

const loading = ref(false)
const error = ref(null)

// Validate value on mount
onMounted(() => {
  if (!props.value || props.value.trim() === '') {
    error.value = 'QR value is required'
  }
})
</script>

<style scoped>
.qr-code-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.qr-code-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.qr-label {
  text-align: center;
  margin-top: 0.5rem;
}

.qr-label-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.qr-loading,
.qr-error {
  padding: 1rem;
  text-align: center;
  font-size: 14px;
}

.qr-error {
  color: #f13636;
}

.qr-loading {
  color: #6c757d;
}

/* Print styles */
@media print {
  .qr-code-container {
    page-break-inside: avoid;
  }
  
  .qr-label-text {
    font-size: 10px;
  }
}
</style>
