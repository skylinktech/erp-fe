<template>
  <div class="external-order-card-footer d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top">
    <!-- Secondary actions -->
    <div class="d-flex flex-wrap align-items-center gap-2">
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="emit('open-detail')"
      >
        <i class="ri-file-list-3-line me-1" aria-hidden="true" />
        Detail Pesanan
      </button>

      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        :disabled="!chat.enabled"
        :title="chat.reason"
        @click="onAction('chatBuyer')"
      >
        <i class="ri-chat-3-line me-1 text-success" aria-hidden="true" />
        Chat Pembeli
      </button>

      <div class="dropdown">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary dropdown-toggle"
          data-bs-toggle="dropdown"
          data-bs-popper-config='{"strategy":"fixed"}'
          title="Cetak dokumen"
          aria-expanded="false"
        >
          <i class="ri-printer-line me-1" aria-hidden="true" />
          Cetak
        </button>
        <ul class="dropdown-menu">
          <li v-for="item in printMenu" :key="item.key">
            <button
              type="button"
              class="dropdown-item"
              :disabled="item.disabled"
              :title="item.reason"
              @click="onAction(item.key)"
            >
              <i v-if="item.icon" :class="item.icon" class="me-2" aria-hidden="true" />
              {{ item.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Document workflow trail (Desty-style) -->
    <nav
      class="order-doc-trail d-none d-md-flex flex-wrap align-items-center gap-1 flex-grow-1 justify-content-md-center"
      aria-label="Dokumen fulfillment"
    >
      <template v-for="(step, idx) in docSteps" :key="step.key">
        <button
          type="button"
          class="btn btn-sm btn-label-secondary rounded-pill px-3"
          :disabled="!step.enabled"
          :title="step.reason"
          @click="onAction(step.key)"
        >
          {{ step.label }}
        </button>
        <span
          v-if="idx < docSteps.length - 1"
          class="text-muted small px-1"
          aria-hidden="true"
        >›</span>
      </template>
    </nav>

    <!-- Primary + more -->
    <div class="d-flex flex-wrap align-items-center gap-2 ms-md-auto">
      <div class="dropdown">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary btn-icon"
          data-bs-toggle="dropdown"
          data-bs-popper-config='{"strategy":"fixed"}'
          aria-label="Aksi lainnya"
          aria-expanded="false"
        >
          <i class="ri-more-fill" aria-hidden="true" />
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li v-for="item in moreMenu" :key="item.key">
            <button
              type="button"
              class="dropdown-item"
              :class="{ 'text-danger': item.danger }"
              :disabled="item.disabled"
              :title="item.reason"
              @click="onAction(item.key)"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-primary"
        :disabled="!arrange.enabled"
        :title="arrange.reason"
        @click="onAction('arrangeShipment')"
      >
        Atur Pengiriman
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  resolveArrangeShipment,
  resolveChatBuyer,
  resolveOrderDocumentSteps,
  resolveOrderMoreMenu,
  resolveOrderPrintMenu,
  type CommerceOrderActionsMap,
} from '~/utils/commerceOrderActions'

const props = defineProps<{
  actions?: CommerceOrderActionsMap | null
}>()

const emit = defineEmits<{
  'open-detail': []
  action: [key: string]
}>()

const chat = computed(() => resolveChatBuyer(props.actions))
const arrange = computed(() => resolveArrangeShipment(props.actions))
const docSteps = computed(() => resolveOrderDocumentSteps(props.actions))
const printMenu = computed(() => resolveOrderPrintMenu(props.actions))
const moreMenu = computed(() => resolveOrderMoreMenu(props.actions))

function onAction(key: string) {
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
