<template>
  <div
    v-if="modelValue"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5);"
    @click.self="handleClose"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ri-attachment-line me-2"></i>Edit Attachment
          </h5>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>

        <div v-if="loadingDetail" class="modal-body">
          <div class="d-flex justify-content-center align-items-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>

        <div v-else class="modal-body">
          <div class="mb-4">
            <label class="form-label fw-semibold">Attachment</label>

            <div
              v-for="(url, idx) in form.existingAttachments"
              :key="'ex-' + idx"
              class="d-flex align-items-center gap-2 mb-2 p-2 border rounded"
            >
              <i class="ri-file-line text-primary"></i>
              <a
                :href="getAttachmentUrl(url)"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-grow-1 small text-decoration-none text-truncate"
              >
                {{ getFileNameFromUrl(url) }}
              </a>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="form.existingAttachments.splice(idx, 1)"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <div
              v-for="(file, idx) in form.newFiles"
              :key="'new-' + idx"
              class="d-flex align-items-center gap-2 mb-2 p-2 border rounded border-success"
            >
              <i class="ri-file-add-line text-success"></i>
              <span class="flex-grow-1 small text-truncate">{{ file.name }}</span>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="form.newFiles.splice(idx, 1)"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <input
              type="file"
              multiple
              class="form-control form-control-sm mt-2"
              @change="onAttachmentFilesSelected"
            >
          </div>

          <div>
            <label class="form-label fw-semibold">PO Attachment</label>

            <div
              v-if="form.existingPoAttachment && !form.removePoFlag"
              class="d-flex align-items-center gap-2 mb-2 p-2 border rounded"
            >
              <i class="ri-file-line text-primary"></i>
              <a
                :href="getAttachmentUrl(form.existingPoAttachment)"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-grow-1 small text-decoration-none text-truncate"
              >
                {{ getFileNameFromUrl(form.existingPoAttachment) }}
              </a>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="removeExistingPoAttachment"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <div
              v-if="form.newPoFile"
              class="d-flex align-items-center gap-2 mb-2 p-2 border rounded border-success"
            >
              <i class="ri-file-add-line text-success"></i>
              <span class="flex-grow-1 small text-truncate">{{ form.newPoFile.name }}</span>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="form.newPoFile = null"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <input
              v-if="!form.newPoFile"
              type="file"
              class="form-control form-control-sm mt-2"
              @change="onPoFileSelected"
            >
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="handleClose">Batal</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="subscriptionStore.saving || loadingDetail"
            @click="saveAttachments"
          >
            <span
              v-if="subscriptionStore.saving"
              class="spinner-border spinner-border-sm me-1"
              role="status"
            ></span>
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { apiFetch } from '~/utils/apiFetch'
import { useNuxtApp } from '#app'
import { useImageUrl } from '~/composables/useImageUrl'
import { useSubscriptionStore, type Subscription } from '~/stores/subscription'

const props = defineProps<{
  modelValue: boolean
  subscriptionId: string | null
  subscriptionData?: Subscription | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const subscriptionStore = useSubscriptionStore()
const { $api } = useNuxtApp()
const { getAttachmentUrl } = useImageUrl()

const loadingDetail = ref(false)
const loadedSubscription = ref<Subscription | null>(null)

const form = reactive({
  existingAttachments: [] as string[],
  newFiles: [] as File[],
  existingPoAttachment: null as string | null,
  newPoFile: null as File | null,
  removePoFlag: false,
})

const currentSubscription = computed(() => loadedSubscription.value || props.subscriptionData || null)

function parseAttachments(raw: unknown): string[] {
  if (!raw || typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [raw]
  } catch {
    return [raw]
  }
}

function getFileNameFromUrl(url: string) {
  if (!url) return 'File'
  const parts = url.split('/')
  return parts[parts.length - 1] || 'File'
}

function hydrateForm(subscription: Subscription | null) {
  form.existingAttachments = parseAttachments((subscription as any)?.attachment ?? null)
  form.newFiles = []
  form.existingPoAttachment =
    (subscription as any)?.poAttachment ?? (subscription as any)?.po_attachment ?? null
  form.newPoFile = null
  form.removePoFlag = false
}

async function fetchSubscriptionForModal() {
  if (!props.subscriptionId) return
  loadingDetail.value = true
  try {
    const response = await apiFetch(`${$api.subscription()}/${props.subscriptionId}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
    loadedSubscription.value = response?.data ?? null
    hydrateForm(loadedSubscription.value)
  } finally {
    loadingDetail.value = false
  }
}

function onAttachmentFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    form.newFiles.push(...Array.from(input.files))
    input.value = ''
  }
}

function onPoFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    form.newPoFile = input.files[0]
    form.removePoFlag = false
    input.value = ''
  }
}

function removeExistingPoAttachment() {
  form.existingPoAttachment = null
  form.removePoFlag = true
}

function handleClose() {
  emit('update:modelValue', false)
}

async function saveAttachments() {
  if (!props.subscriptionId) return

  subscriptionStore.form.existingAttachments = [...form.existingAttachments]
  subscriptionStore.form.attachments = form.newFiles.length > 0 ? [...form.newFiles] : null
  subscriptionStore.form.poAttachment = form.newPoFile
  subscriptionStore.form.existingPoAttachment = form.removePoFlag ? null : form.existingPoAttachment

  const ok = await subscriptionStore.saveAttachmentsOnly(props.subscriptionId)
  if (ok) {
    emit('saved')
    emit('update:modelValue', false)
  }
}

watch(
  () => props.modelValue,
  async (opened) => {
    if (!opened) return
    loadedSubscription.value = null
    if (props.subscriptionData && ((props.subscriptionData as any).attachment !== undefined || (props.subscriptionData as any).poAttachment !== undefined || (props.subscriptionData as any).po_attachment !== undefined)) {
      hydrateForm(props.subscriptionData)
      return
    }
    await fetchSubscriptionForModal()
  }
)
</script>
