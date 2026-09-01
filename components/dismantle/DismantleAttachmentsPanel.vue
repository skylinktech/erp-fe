<template>
  <div>
    <div v-if="requirements?.blockers?.length" class="alert alert-warning">
      <strong>Requirement attachment</strong>
      <ul class="mb-0 mt-2">
        <li v-for="(b, i) in requirements.blockers" :key="`b-${i}`">{{ b.message }}</li>
      </ul>
    </div>
    <div v-if="requirements?.warnings?.length" class="alert alert-info py-2">
      <ul class="mb-0">
        <li v-for="(w, i) in requirements.warnings" :key="`w-${i}`">{{ w.message }}</li>
      </ul>
    </div>

    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h6 class="mb-0">Attachments</h6>
      <button
        v-if="canUploadAny"
        type="button"
        class="btn btn-primary btn-sm"
        @click="showUploader = true"
      >
        <i class="ri-upload-2-line me-1"></i> Upload
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary"></div>
    </div>

    <div v-else-if="!grouped.length" class="text-center text-muted py-4 border rounded">
      Belum ada attachment.
    </div>

    <div v-else>
      <div v-for="group in grouped" :key="group.type" class="mb-4">
        <div class="fw-semibold small text-muted mb-2">{{ group.label }}</div>
        <div class="list-group">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="list-group-item"
            :class="{ 'opacity-75': item.status === 'VOIDED' }"
          >
            <div class="d-flex flex-wrap justify-content-between gap-2">
              <div>
                <div class="fw-medium">{{ item.originalFileName || '—' }}</div>
                <div class="small text-muted">
                  {{ formatAttachmentSize(item.fileSize) }} ·
                  {{ formatAttachmentTimestamp(item.uploadedAt) }} ·
                  {{ item.uploader?.fullName || item.uploader?.email || '—' }}
                </div>
                <span
                  class="badge"
                  :class="item.status === 'ACTIVE' ? 'bg-label-success' : 'bg-label-secondary'"
                >
                  {{ item.status }}
                </span>
                <span v-if="item.voidReason" class="small text-muted ms-2">Void: {{ item.voidReason }}</span>
              </div>
              <div class="d-flex gap-1 align-items-start">
                <button
                  v-if="item.capabilities?.canPreview"
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  :disabled="downloadById[item.id]"
                  @click="onPreview(item.id)"
                >
                  Preview
                </button>
                <button
                  v-if="item.capabilities?.canDownload"
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  :disabled="downloadById[item.id]"
                  @click="onDownload(item.id)"
                >
                  Download
                </button>
                <button
                  v-if="item.capabilities?.canDelete"
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="deletingAttachmentById[item.id]"
                  @click="onDelete(item.id)"
                >
                  Hapus
                </button>
                <button
                  v-if="item.capabilities?.canVoid"
                  type="button"
                  class="btn btn-outline-warning btn-sm"
                  :disabled="voidingAttachmentById[item.id]"
                  @click="onVoid(item.id)"
                >
                  Void
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DismantleAttachmentUploader
      v-model="showUploader"
      :request-id="requestId"
      :equipment-lines="equipmentLines"
      :service-lines="serviceLines"
      :uploading="uploading"
      @upload="onUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { useRequestDismantleStore } from '~/stores/request-dismantle'
import type { DismantleAttachmentItem, DismantleAttachmentUploadPayload, DismantleRequestService } from '~/types/operations/dismantle'
import {
  dismantleAttachmentTypeLabel,
  formatAttachmentSize,
  formatAttachmentTimestamp,
} from '~/utils/dismantleAttachmentLabels'

const props = defineProps<{
  requestId: string
  services?: DismantleRequestService[]
  canUploadAny?: boolean
}>()

const store = useRequestDismantleStore()
const {
  attachments,
  attachmentRequirements: requirements,
  loadingAttachments: loading,
  uploadingAttachment: uploading,
  downloadById,
  deletingAttachmentById,
  voidingAttachmentById,
} = storeToRefs(store)

const showUploader = ref(false)

const equipmentLines = computed(() =>
  (props.services ?? []).flatMap((s) =>
    (s.equipments ?? []).map((e) => ({
      id: e.id,
      label: `${e.equipmentNo || e.id} (${e.ownershipType})`,
      serviceLineId: s.id,
    }))
  )
)

const serviceLines = computed(() =>
  (props.services ?? []).map((s) => ({ id: s.id, label: s.serviceInstanceId || s.id }))
)

const grouped = computed(() => {
  const map = new Map<string, DismantleAttachmentItem[]>()
  for (const item of attachments.value) {
    const list = map.get(item.attachmentType) ?? []
    list.push(item)
    map.set(item.attachmentType, list)
  }
  return [...map.entries()].map(([type, items]) => ({
    type,
    label: dismantleAttachmentTypeLabel(type),
    items,
  }))
})

async function refresh() {
  await Promise.all([
    store.fetchAttachments(props.requestId),
    store.fetchAttachmentRequirements(props.requestId),
  ])
}

watch(
  () => props.requestId,
  (id) => {
    if (id) refresh()
  },
  { immediate: true }
)

async function onUpload(payload: DismantleAttachmentUploadPayload) {
  const ok = await store.uploadAttachment(props.requestId, payload)
  if (ok) showUploader.value = false
}

function onPreview(id: string) {
  store.downloadAttachment(props.requestId, id, true)
}

function onDownload(id: string) {
  store.downloadAttachment(props.requestId, id, false)
}

async function onDelete(id: string) {
  const confirm = await Swal.fire({
    title: 'Hapus attachment draft?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
  })
  if (!confirm.isConfirmed) return
  await store.deleteDraftAttachment(props.requestId, id)
}

async function onVoid(id: string) {
  const { value } = await Swal.fire({
    title: 'Void attachment',
    input: 'textarea',
    inputLabel: 'Alasan void (wajib)',
    inputValidator: (v) => (!v?.trim() ? 'Alasan wajib diisi' : undefined),
    showCancelButton: true,
    confirmButtonText: 'Void',
  })
  if (!value?.trim()) return
  await store.voidAttachment(props.requestId, id, value.trim())
}
</script>
