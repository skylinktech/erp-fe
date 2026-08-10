<template>
  <Teleport to="body">
    <Transition name="notification-prompt-fade">
      <div
        v-if="promptVisible"
        class="notification-prompt-root"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-prompt-title"
        aria-describedby="notification-prompt-desc"
      >
        <div class="notification-prompt-card card border-0 shadow-lg">
          <div class="card-body p-4">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="notification-prompt-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                <i class="ri-notification-3-line fs-4 text-primary" aria-hidden="true"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex align-items-start justify-content-between gap-2">
                  <h6 id="notification-prompt-title" class="mb-1 fw-semibold">Aktifkan notifikasi?</h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-icon btn-text-secondary rounded-pill notification-prompt-close"
                    aria-label="Tutup"
                    :disabled="requesting"
                    @click="onLater"
                  >
                    <i class="ri-close-line"></i>
                  </button>
                </div>
                <p id="notification-prompt-desc" class="mb-0 small text-muted">
                  Dapatkan pemberitahuan langsung untuk approval, quotation, FDR, dan aktivitas penting lainnya.
                  Jika tidak diaktifkan, aplikasi tidak akan mengirim notifikasi ke perangkat Anda.
                </p>
              </div>
            </div>

            <div class="d-grid gap-2">
              <button
                type="button"
                class="btn btn-primary btn-sm"
                :disabled="requesting"
                @click="onEnable"
              >
                <span v-if="requesting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                Aktifkan Notifikasi
              </button>
              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm flex-grow-1"
                  :disabled="requesting"
                  @click="onLater"
                >
                  Nanti
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm flex-grow-1"
                  :disabled="requesting"
                  @click="onDecline"
                >
                  Tidak, terima kasih
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user'
import { useBrowserNotificationPreference } from '~/composables/useBrowserNotificationPreference'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const {
  promptVisible,
  refreshPromptVisibility,
  acceptNotifications,
  declineNotifications,
  snoozePrompt,
} = useBrowserNotificationPreference()

const requesting = ref(false)

async function onEnable() {
  requesting.value = true
  try {
    const result = await acceptNotifications()
    if (result.preference === 'enabled') {
      try {
        const toast = useToast()
        toast?.success?.({
          title: 'Notifikasi aktif',
          message: 'Anda akan menerima pemberitahuan untuk aktivitas penting.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch {
        /* ignore */
      }
    } else if (result.permission === 'denied') {
      try {
        const toast = useToast()
        toast?.info?.({
          title: 'Notifikasi dinonaktifkan',
          message: 'Izin notifikasi ditolak. Anda bisa mengaktifkannya lewat pengaturan browser.',
          color: 'blue',
          position: 'bottomRight',
        })
      } catch {
        /* ignore */
      }
    }
  } finally {
    requesting.value = false
  }
}

function onLater() {
  snoozePrompt(7)
}

function onDecline() {
  declineNotifications()
}

onMounted(() => {
  refreshPromptVisibility(!!user.value)
})

watch(user, (nextUser) => {
  refreshPromptVisibility(!!nextUser)
})
</script>

<style scoped>
.notification-prompt-root {
  position: fixed;
  top: 5.5rem;
  right: 1.25rem;
  z-index: 1095;
  width: min(22rem, calc(100vw - 2rem));
  pointer-events: auto;
}

.notification-prompt-card {
  border: 1px solid rgba(102, 108, 255, 0.18);
  background: #fff;
}

.notification-prompt-icon {
  width: 2.75rem;
  height: 2.75rem;
  background: rgba(102, 108, 255, 0.12);
}

.notification-prompt-close {
  margin-top: -0.15rem;
  margin-right: -0.35rem;
}

.notification-prompt-fade-enter-active,
.notification-prompt-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.notification-prompt-fade-enter-from,
.notification-prompt-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 575.98px) {
  .notification-prompt-root {
    top: auto;
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
  }
}
</style>
