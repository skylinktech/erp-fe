<template>
  <div class="verify-document-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <!-- Header -->
          <div class="text-center mb-4">
            <div class="verify-icon mb-3">
              <i class="ri-shield-check-line" style="font-size: 4rem; color: #0d6efd;"></i>
            </div>
            <h1 class="fw-bold mb-2">Verifikasi Dokumen Digital</h1>
            <p class="text-muted">
              Scan QR code atau masukkan token untuk memverifikasi keaslian dokumen
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="card shadow-sm">
            <div class="card-body text-center py-5">
              <ProgressSpinner
                style="width: 50px; height: 50px"
                strokeWidth="4"
                fill="transparent"
                animationDuration="1s"
              />
              <p class="mt-3 text-muted">Memverifikasi dokumen...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="card shadow-sm border-danger">
            <div class="card-body text-center py-5">
              <i class="ri-error-warning-line text-danger" style="font-size: 3rem;"></i>
              <h4 class="mt-3 text-danger">Verifikasi Gagal</h4>
              <p class="text-muted mb-4">{{ error }}</p>
              <button @click="retryVerification" class="btn btn-primary">
                <i class="ri-refresh-line me-2"></i>Coba Lagi
              </button>
            </div>
          </div>

          <!-- Success/Invalid State -->
          <div v-else-if="verificationResult" class="card shadow-sm" :class="verificationResult.valid ? 'border-success' : 'border-danger'">
            <div class="card-body">
              <!-- Status Badge -->
              <div class="text-center mb-4">
                <i 
                  :class="verificationResult.valid ? 'ri-checkbox-circle-fill text-success' : 'ri-close-circle-fill text-danger'" 
                  style="font-size: 4rem;"
                ></i>
                <h3 class="mt-3" :class="verificationResult.valid ? 'text-success' : 'text-danger'">
                  {{ verificationResult.valid ? 'Dokumen Valid' : 'Dokumen Tidak Valid' }}
                </h3>
                <p class="text-muted">{{ verificationResult.message }}</p>
              </div>

              <!-- Document Details (jika valid) -->
              <div v-if="verificationResult.valid && verificationResult.document" class="document-details mt-4">
                <h5 class="border-bottom pb-2 mb-3">Detail Dokumen</h5>
                
                <div class="row g-3">
                  <div class="col-12">
                    <div class="detail-item">
                      <strong>Jenis Dokumen:</strong>
                      <span class="ms-2">{{ verificationResult.document.entityTypeLabel }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.documentNumber">
                    <div class="detail-item">
                      <strong>Nomor Dokumen:</strong>
                      <span class="ms-2">{{ verificationResult.document.documentNumber }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.name">
                    <div class="detail-item">
                      <strong>Nama:</strong>
                      <span class="ms-2">{{ verificationResult.document.name }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.date">
                    <div class="detail-item">
                      <strong>Tanggal:</strong>
                      <span class="ms-2">{{ formatDate(verificationResult.document.date) }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.total">
                    <div class="detail-item">
                      <strong>Total:</strong>
                      <span class="ms-2">{{ formatRupiah(verificationResult.document.total) }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.customer">
                    <div class="detail-item">
                      <strong>Customer:</strong>
                      <span class="ms-2">{{ verificationResult.document.customer }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.vendor">
                    <div class="detail-item">
                      <strong>Vendor:</strong>
                      <span class="ms-2">{{ verificationResult.document.vendor }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.company">
                    <div class="detail-item">
                      <strong>Perusahaan:</strong>
                      <span class="ms-2">{{ verificationResult.document.company }}</span>
                    </div>
                  </div>

                  <div class="col-12" v-if="verificationResult.document.status">
                    <div class="detail-item">
                      <strong>Status:</strong>
                      <span class="ms-2 badge bg-primary">{{ verificationResult.document.status }}</span>
                    </div>
                  </div>

                  <div class="col-12 border-top pt-3 mt-2">
                    <h6 class="text-muted mb-2">Informasi Tanda Tangan Digital</h6>
                    
                    <div class="detail-item mb-2" v-if="verificationResult.document.signedAt">
                      <strong>Ditandatangani pada:</strong>
                      <span class="ms-2">{{ formatDate(verificationResult.document.signedAt) }}</span>
                    </div>

                    <div class="detail-item" v-if="verificationResult.document.createdBy || verificationResult.document.approvedBy">
                      <strong>Ditandatangani oleh:</strong>
                      <span class="ms-2">{{ verificationResult.document.approvedBy || verificationResult.document.createdBy || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="text-center mt-4 pt-3 border-top">
                <button @click="verifyAnother" class="btn btn-outline-primary me-2">
                  <i class="ri-scan-line me-2"></i>Verifikasi Dokumen Lain
                </button>
                <button v-if="verificationResult.valid" @click="printResult" class="btn btn-outline-secondary">
                  <i class="ri-printer-line me-2"></i>Cetak
                </button>
              </div>
            </div>
          </div>

          <!-- Input Token Manual (jika belum ada token) -->
          <div v-else class="card shadow-sm">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">Masukkan Token Verifikasi</h5>
              <form @submit.prevent="handleManualSubmit">
                <div class="mb-3">
                  <label for="tokenInput" class="form-label">Token</label>
                  <input
                    type="text"
                    id="tokenInput"
                    v-model="manualToken"
                    class="form-control"
                    placeholder="Masukkan token dari dokumen"
                    required
                  />
                  <small class="form-text text-muted">
                    Token biasanya berbentuk UUID (contoh: 123e4567-e89b-12d3-a456-426614174000)
                  </small>
                </div>
                <button type="submit" class="btn btn-primary w-100">
                  <i class="ri-check-line me-2"></i>Verifikasi
                </button>
              </form>
            </div>
          </div>

          <!-- Info Box -->
          <div class="alert alert-info mt-4">
            <i class="ri-information-line me-2"></i>
            <strong>Tentang Verifikasi Digital:</strong>
            Setiap dokumen yang ditandatangani secara digital memiliki QR code unik. 
            Scan QR code untuk memastikan dokumen asli dan belum dimanipulasi.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth', // Use auth layout (no sidebar/navbar untuk public page)
  middleware: [], // No auth middleware untuk public page
})

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentVerificationStore } from '~/stores/document-verification'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const verificationStore = useDocumentVerificationStore()
const { loading, error, verificationResult } = storeToRefs(verificationStore)

const manualToken = ref('')
const formatRupiah = useFormatRupiah()

// Auto verify if token in query params
onMounted(async () => {
  const token = route.query.token
  if (token) {
    try {
      await verificationStore.verifyDocument(token)
    } catch (e) {
      console.error('Verification failed:', e)
    }
  }
})

// Manual token submission
async function handleManualSubmit() {
  if (!manualToken.value) return
  
  try {
    await verificationStore.verifyDocument(manualToken.value)
    // Update URL with token
    router.push({ query: { token: manualToken.value } })
  } catch (e) {
    console.error('Manual verification failed:', e)
  }
}

// Retry verification
function retryVerification() {
  const token = route.query.token || manualToken.value
  if (token) {
    verificationStore.reset()
    verificationStore.verifyDocument(token)
  }
}

// Verify another document
function verifyAnother() {
  verificationStore.reset()
  manualToken.value = ''
  router.push({ query: {} })
}

// Print result
function printResult() {
  window.print()
}

// Format date helper
function formatDate(date) {
  return verificationStore.formatDate(date)
}
</script>

<style scoped>
.verify-document-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.card {
  border-radius: 1rem;
  border: 2px solid #e0e0e0;
}

.card.border-success {
  border-color: #28a745 !important;
}

.card.border-danger {
  border-color: #dc3545 !important;
}

.verify-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.detail-item {
  padding: 0.5rem 0;
  font-size: 14px;
}

.detail-item strong {
  color: #495057;
  min-width: 150px;
  display: inline-block;
}

.document-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

@media print {
  .verify-document-page {
    background: white !important;
  }
  
  button {
    display: none !important;
  }
  
  .alert {
    display: none !important;
  }
}
</style>
