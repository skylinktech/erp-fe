<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          
          <p class="mb-0 text-muted">Skeleton Sprint 2 — draft CN dari invoice approved</p>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label">Invoice ID (UUID) asal</label>
              <input v-model="originalInvoiceId" class="form-control" placeholder="original_invoice_id" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Alasan</label>
              <input v-model="reason" class="form-control" placeholder="Alasan credit note" />
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-primary w-100" :disabled="creating" @click="createCn">
                Buat Draft
              </button>
            </div>
          </div>

          <div v-if="store.loading" class="text-muted">Memuat...</div>
          <div v-else-if="store.error" class="text-danger">{{ store.error }}</div>
          <div v-else class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Invoice Asal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in store.items" :key="row.id">
                  <td>{{ row.noInvoice || row.no_invoice }}</td>
                  <td>{{ row.originalInvoice?.noInvoice || row.original_invoice?.no_invoice || row.originalInvoiceId }}</td>
                  <td>{{ row.total }}</td>
                  <td>{{ row.documentStatus || row.document_status }}</td>
                  <td>{{ row.date }}</td>
                </tr>
                <tr v-if="!store.items.length">
                  <td colspan="5" class="text-muted text-center">Belum ada Credit Note</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCreditNoteStore } from '~/stores/credit-notes'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'check-permission'],
  title: 'Credit Notes',
})

const store = useCreditNoteStore()
const originalInvoiceId = ref('')
const reason = ref('')
const creating = ref(false)

async function createCn() {
  if (!originalInvoiceId.value.trim()) return
  creating.value = true
  try {
    const created = await store.createFromInvoice(originalInvoiceId.value.trim(), reason.value)
    if (created) {
      originalInvoiceId.value = ''
      reason.value = ''
      await store.fetchCreditNotes()
    }
  } finally {
    creating.value = false
  }
}

onMounted(() => store.fetchCreditNotes())
</script>
