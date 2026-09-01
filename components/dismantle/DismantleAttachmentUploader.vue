<template>
  <div v-if="modelValue" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.4)">
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload Attachment</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Tipe attachment</label>
            <select v-model="attachmentType" class="form-select">
              <option v-for="o in typeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div v-if="equipmentLines.length" class="mb-3">
            <label class="form-label">Equipment line (opsional)</label>
            <select v-model="equipmentLineId" class="form-select">
              <option value="">—</option>
              <option v-for="e in equipmentLines" :key="e.id" :value="e.id">{{ e.label }}</option>
            </select>
          </div>
          <div v-if="serviceLines.length" class="mb-3">
            <label class="form-label">Service line (opsional)</label>
            <select v-model="serviceLineId" class="form-select">
              <option value="">—</option>
              <option v-for="s in serviceLines" :key="s.id" :value="s.id">{{ s.label }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Deskripsi (opsional)</label>
            <textarea v-model="description" class="form-control" rows="2"></textarea>
          </div>
          <div
            class="border rounded p-4 text-center"
            :class="{ 'border-primary': dragging }"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
          >
            <p class="mb-2 small text-muted">PDF, JPG, PNG — maks {{ maxMb }} MB</p>
            <input
              ref="fileInput"
              type="file"
              class="d-none"
              :accept="acceptAttr"
              :capture="photoCapture"
              @change="onFileChange"
            />
            <button type="button" class="btn btn-outline-primary btn-sm" @click="fileInput?.click()">
              Pilih file
            </button>
            <div v-if="selectedFile" class="mt-3 small">
              <strong>{{ selectedFile.name }}</strong> ({{ formatAttachmentSize(selectedFile.size) }})
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="close">Batal</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!selectedFile || uploading"
            @click="submit"
          >
            <span v-if="uploading" class="spinner-border spinner-border-sm me-1"></span>
            Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DismantleAttachmentType, DismantleAttachmentUploadPayload } from '~/types/operations/dismantle'
import {
  DEFAULT_ATTACHMENT_MAX_MB,
  DISMANTLE_ATTACHMENT_TYPE_OPTIONS,
  formatAttachmentSize,
  isPhotoAttachmentType,
  validateAttachmentFileClient,
} from '~/utils/dismantleAttachmentLabels'

const props = defineProps<{
  modelValue: boolean
  requestId: string
  uploading?: boolean
  equipmentLines?: Array<{ id: string; label: string; serviceLineId?: string }>
  serviceLines?: Array<{ id: string; label: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  upload: [DismantleAttachmentUploadPayload]
}>()

const typeOptions = DISMANTLE_ATTACHMENT_TYPE_OPTIONS
const attachmentType = ref<DismantleAttachmentType>('CUSTOMER_REQUEST')
const equipmentLineId = ref('')
const serviceLineId = ref('')
const description = ref('')
const selectedFile = ref<File | null>(null)
const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const maxMb = DEFAULT_ATTACHMENT_MAX_MB

const acceptAttr = computed(() =>
  isPhotoAttachmentType(attachmentType.value) ? 'image/*' : 'application/pdf,image/jpeg,image/png'
)
const photoCapture = computed(() =>
  isPhotoAttachmentType(attachmentType.value) ? 'environment' : undefined
)

watch(attachmentType, () => {
  selectedFile.value = null
})

function close() {
  emit('update:modelValue', false)
}

function pickFile(file: File | null) {
  if (!file) return
  const err = validateAttachmentFileClient(file, maxMb)
  if (err) {
    useToast().error({ title: 'Validasi', message: err, color: 'red', position: 'bottomRight', layout: 2 })
    return
  }
  selectedFile.value = file
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  pickFile(input.files?.[0] ?? null)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  pickFile(e.dataTransfer?.files?.[0] ?? null)
}

function submit() {
  if (!selectedFile.value) return
  emit('upload', {
    file: selectedFile.value,
    attachmentType: attachmentType.value,
    equipmentLineId: equipmentLineId.value || undefined,
    serviceLineId: serviceLineId.value || undefined,
    description: description.value || undefined,
  })
}
</script>
