<template>
  <div class="external-order-card-footer d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top">
    <div class="d-flex flex-wrap align-items-center gap-2">
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        :disabled="cardBusy"
        @click="emit('open-detail')"
      >
        <i class="ri-file-list-3-line me-1" aria-hidden="true" />
        Detail Pesanan
      </button>

      <CommerceActionButton
        action="chatBuyer"
        label="Chat Pembeli"
        icon="ri-chat-3-line"
        btn-class="btn btn-sm btn-outline-secondary"
        :busy="isActionBusy('chatBuyer')"
        :disabled="cardBusy || !chat.enabled"
        :title="busyTitle(chat.reason)"
        @click="onAction('chatBuyer')"
      />

      <div class="dropdown">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary dropdown-toggle"
          data-bs-toggle="dropdown"
          data-bs-popper-config='{"strategy":"fixed"}'
          title="Cetak dokumen"
          :disabled="cardBusy"
          aria-expanded="false"
        >
          <span
            v-if="printBusy"
            class="spinner-border spinner-border-sm me-1"
            role="status"
            aria-hidden="true"
          />
          <i v-else class="ri-printer-line me-1" aria-hidden="true" />
          {{ printBusy ? 'Memuat…' : 'Cetak' }}
        </button>
        <ul class="dropdown-menu">
          <li v-for="item in printMenu" :key="item.key">
            <button
              type="button"
              class="dropdown-item"
              :disabled="cardBusy || item.disabled"
              :title="busyTitle(item.reason)"
              @click="onAction(item.key)"
            >
              <span
                v-if="isActionBusy(item.key)"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              <i v-else-if="item.icon" :class="item.icon" class="me-2" aria-hidden="true" />
              {{ isActionBusy(item.key) ? 'Memuat…' : item.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <nav
      class="order-doc-trail d-none d-md-flex flex-wrap align-items-center gap-1 flex-grow-1 justify-content-md-center"
      aria-label="Dokumen fulfillment"
    >
      <template v-for="(step, idx) in docSteps" :key="step.key">
        <button
          type="button"
          class="btn btn-sm btn-label-secondary rounded-pill px-3"
          :disabled="cardBusy || !step.enabled"
          :aria-busy="isActionBusy(step.key) ? 'true' : 'false'"
          :title="busyTitle(step.reason)"
          @click="onAction(step.key)"
        >
          <span
            v-if="isActionBusy(step.key)"
            class="spinner-border spinner-border-sm me-1"
            role="status"
            aria-hidden="true"
          />
          {{ isActionBusy(step.key) ? 'Memproses…' : step.label }}
        </button>
        <span
          v-if="idx < docSteps.length - 1"
          class="text-muted small px-1"
          aria-hidden="true"
        >›</span>
      </template>
    </nav>

    <div class="d-flex flex-wrap align-items-center gap-2 ms-md-auto">
      <div class="dropdown">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary btn-icon"
          data-bs-toggle="dropdown"
          data-bs-popper-config='{"strategy":"fixed"}'
          aria-label="Aksi lainnya"
          :disabled="cardBusy"
          aria-expanded="false"
        >
          <span
            v-if="moreBusy"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <i v-else class="ri-more-fill" aria-hidden="true" />
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li v-for="item in moreMenu" :key="item.key">
            <button
              type="button"
              class="dropdown-item"
              :class="{ 'text-danger': item.danger }"
              :disabled="cardBusy || item.disabled"
              :title="busyTitle(item.reason)"
              @click="onAction(item.key)"
            >
              <span
                v-if="isActionBusy(item.key)"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              {{ isActionBusy(item.key) ? 'Memproses…' : item.label }}
            </button>
          </li>
        </ul>
      </div>

      <CommerceActionButton
        v-if="confirm.enabled"
        action="confirmHandover"
        label="Serah Kurir"
        btn-class="btn btn-sm btn-success"
        :busy="isActionBusy('confirmHandover')"
        :disabled="cardBusy && !isActionBusy('confirmHandover') || !confirm.enabled"
        :title="busyTitle(confirm.reason)"
        @click="onAction('confirmHandover')"
      />
      <CommerceActionButton
        action="arrangeShipment"
        label="Atur Pengiriman"
        btn-class="btn btn-sm btn-primary"
        :busy="isActionBusy('arrangeShipment')"
        :disabled="cardBusy && !isActionBusy('arrangeShipment') || !arrange.enabled"
        :title="busyTitle(arrange.reason)"
        @click="onAction('arrangeShipment')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CommerceActionButton from '~/components/commerce/CommerceActionButton.vue'
import {
  resolveArrangeShipment,
  resolveChatBuyer,
  resolveConfirmHandover,
  resolveOrderDocumentSteps,
  resolveOrderMoreMenu,
  resolveOrderPrintMenu,
  type CommerceOrderActionsMap,
} from '~/utils/commerceOrderActions'

const props = defineProps<{
  actions?: CommerceOrderActionsMap | null
  /** True when any action on this order is in-flight */
  busy?: boolean
  /** Specific action key currently loading on this card */
  busyAction?: string | null
}>()

const emit = defineEmits<{
  'open-detail': []
  action: [key: string]
}>()

const cardBusy = computed(() => Boolean(props.busy))
const busyAction = computed(() => props.busyAction || null)
const chat = computed(() => resolveChatBuyer(props.actions))
const arrange = computed(() => resolveArrangeShipment(props.actions))
const confirm = computed(() => resolveConfirmHandover(props.actions))
const docSteps = computed(() => resolveOrderDocumentSteps(props.actions))
const printMenu = computed(() => resolveOrderPrintMenu(props.actions))
const moreMenu = computed(() => resolveOrderMoreMenu(props.actions))

const PRINT_KEYS = new Set([
  'printShippingLabel',
  'printPickingList',
  'printPackingList',
])

const printBusy = computed(() => Boolean(busyAction.value && PRINT_KEYS.has(busyAction.value)))
const moreBusy = computed(() =>
  Boolean(busyAction.value && moreMenu.value.some((m) => m.key === busyAction.value))
)

function isActionBusy(action: string) {
  return busyAction.value === action
}

function busyTitle(reason?: string) {
  return cardBusy.value ? 'Menunggu hasil aksi…' : reason
}

function onAction(key: string) {
  if (cardBusy.value) return
  emit('action', key)
}
</script>

<style scoped>
.order-doc-trail .btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.btn-icon {
  width: 2rem;
  height: 2rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
