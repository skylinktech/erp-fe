<template>
  <div class="card shadow-sm border-0 mb-4">
    <div class="card-header border-0 bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
      <div>
        <h6 class="mb-0 fw-semibold">{{ node.name }}</h6>
        <small class="text-muted">
          {{ node.nodeCode || node.node_code }}
          <span v-if="node.networkIdentifier || node.network_identifier">
            · {{ node.networkIdentifier || node.network_identifier }}
          </span>
        </small>
      </div>
      <span :class="getProgressStatusBadge(getNodeStatus(node)).class">
        {{ getProgressStatusBadge(getNodeStatus(node)).text }}
      </span>
    </div>
    <div class="card-body pt-0">
      <div v-if="node.arf" class="mb-3 p-3 rounded bg-light">
        <div class="small text-muted mb-1">Pengajuan Dana (ARF)</div>
        <NuxtLink
          :to="`/implementation/arf/detail/${node.arf.id}`"
          class="fw-medium text-primary text-decoration-none"
        >
          {{ node.arf.requestNo || node.arf.request_no }}
        </NuxtLink>
        <span class="ms-2 badge bg-label-secondary text-capitalize">{{ node.arf.status }}</span>
      </div>

      <ProgressStatusStepper
        v-if="canEdit"
        :model-value="draftStatus"
        @update:model-value="draftStatus = $event"
      />
      <ProgressStatusStepper v-else :model-value="getNodeStatus(node)" readonly />

      <div v-if="canEdit" class="mt-3">
        <label class="form-label small">Catatan perubahan status</label>
        <textarea v-model="statusNotes" class="form-control form-control-sm" rows="2" placeholder="Opsional" />
        <label class="form-label small mt-2">Lampiran</label>
        <input
          ref="fileInput"
          type="file"
          class="form-control form-control-sm"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          @change="onFilesChange"
        />
        <p v-if="!canSaveStatus" class="text-muted small mt-2 mb-0">
          Pilih tahap status berikutnya pada step di atas, atau isi catatan / lampiran untuk menyimpan.
        </p>
        <button
          type="button"
          class="btn btn-primary btn-sm mt-2"
          :disabled="saving || !canSaveStatus"
          @click="submitStatus"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm me-1" />
          Simpan Status
        </button>
      </div>

      <div v-if="attachments.length" class="mt-4">
        <h6 class="small text-muted mb-2">Lampiran</h6>
        <ul class="list-unstyled mb-0">
          <li v-for="att in attachments" :key="att.id" class="d-flex align-items-center gap-2 mb-1">
            <a :href="attachmentUrl(att)" target="_blank" rel="noopener" class="small">
              <i class="ri-attachment-2 me-1"></i>{{ att.fileName || att.file_name }}
            </a>
            <button
              v-if="canEdit"
              type="button"
              class="btn btn-link btn-sm text-danger p-0"
              @click="removeAttachment(att.id)"
            >
              Hapus
            </button>
          </li>
        </ul>
      </div>

      <div v-if="logs.length" class="mt-4">
        <h6 class="small text-muted mb-2">Riwayat Status</h6>
        <div class="timeline-sm">
          <div v-for="log in logs" :key="log.id" class="border-start ps-3 mb-2 pb-2">
            <div class="small fw-medium">
              {{ formatLogTransition(log) }}
            </div>
            <div class="text-muted" style="font-size: 0.75rem">
              {{ formatDateTime(log.changedAt || log.changed_at) }}
              · {{ log.changedByUser?.fullName || log.changedByUser?.full_name || 'System' }}
            </div>
            <p v-if="log.notes" class="mb-0 small">{{ log.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import ProgressStatusStepper from '~/components/progress-tracker/ProgressStatusStepper.vue'
import {
  getProgressStatusBadge,
  normalizeProgressTrackerStatus,
  PROGRESS_TRACKER_STATUS_LABELS,
  type ProgressTrackerStatus,
} from '~/constants/implementation/progressTrackerStatuses'
import {
  useProgressTrackerStore,
  getNodeStatus,
  getNodeStatusLogs,
  getNodeAttachments,
  type ProgressTrackerNode,
} from '~/stores/progress-tracker'
import { usePermissions } from '~/composables/usePermissions'
import { useImageUrl } from '~/composables/useImageUrl'

const props = defineProps<{
  node: ProgressTrackerNode
  projectId: string
}>()

const emit = defineEmits<{ updated: [] }>()

const store = useProgressTrackerStore()
const { userHasRole, userHasPermission } = usePermissions()
const { getAttachmentUrl } = useImageUrl()

const draftStatus = ref<ProgressTrackerStatus>(getNodeStatus(props.node))
const statusNotes = ref('')
const pendingFiles = ref<File[]>([])
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const canEdit = computed(
  () =>
    userHasRole('superadmin') ||
    userHasPermission('edit_progress_tracker') ||
    userHasPermission('create_progress_tracker')
)

const logs = computed(() => getNodeStatusLogs(props.node))
const attachments = computed(() => getNodeAttachments(props.node))

const currentStatus = computed(() => getNodeStatus(props.node))

/** Boleh simpan jika status berubah, atau ada catatan/lampiran baru. */
const canSaveStatus = computed(() => {
  if (draftStatus.value !== currentStatus.value) return true
  if (statusNotes.value.trim()) return true
  if (pendingFiles.value.length > 0) return true
  return false
})

watch(
  () => props.node,
  (n) => {
    draftStatus.value = getNodeStatus(n)
  },
  { deep: true }
)

function attachmentUrl(att: { fileUrl?: string; file_url?: string }) {
  return getAttachmentUrl(att.fileUrl || att.file_url || '')
}

function onFilesChange(e: Event) {
  const input = e.target as HTMLInputElement
  pendingFiles.value = input.files ? Array.from(input.files) : []
}

function formatLogTransition(log: {
  fromStatus?: string | null
  from_status?: string | null
  toStatus?: string
  to_status?: string
}) {
  const from = log.fromStatus ?? log.from_status
  const to = log.toStatus ?? log.to_status
  const fromLabel = from
    ? PROGRESS_TRACKER_STATUS_LABELS[normalizeProgressTrackerStatus(from)]
    : '—'
  const toLabel = to
    ? PROGRESS_TRACKER_STATUS_LABELS[normalizeProgressTrackerStatus(to)]
    : '—'
  return `${fromLabel} → ${toLabel}`
}

async function submitStatus() {
  if (!props.node.id) return
  saving.value = true
  try {
    await store.updateNodeStatus(
      props.node.id,
      draftStatus.value,
      statusNotes.value,
      pendingFiles.value.length ? pendingFiles.value : undefined
    )
    statusNotes.value = ''
    pendingFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
    emit('updated')
  } catch (e: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: e?.data?.message || e?.message || 'Gagal memperbarui status',
    })
  } finally {
    saving.value = false
  }
}

async function removeAttachment(id: string) {
  const ok = await Swal.fire({
    title: 'Hapus lampiran?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Hapus',
  })
  if (!ok.isConfirmed) return
  await store.deleteAttachment(id)
  emit('updated')
}

function formatDateTime(v?: string) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString('id-ID')
  } catch {
    return v
  }
}
</script>
