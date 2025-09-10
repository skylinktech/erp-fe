<template>
    <div v-if="loading" class="text-center p-6">
      <ProgressSpinner 
        style="width: 50px; height: 50px" 
        strokeWidth="4"
        fill="transparent"
        animationDuration="1s"
      />
      <div class="mt-3 text-muted">Memuat data...</div>
    </div>
    <div v-else-if="error" class="alert alert-danger m-6">{{ error.message }}</div>
    <div v-else-if="stockTransfer" class="p-6">
      <div class="d-flex justify-content-between align-items-start align-content-center mb-6">
        <!-- Logo Section - Left -->
        <div v-if="stockTransfer.perusahaan" class="logo-section">
          <div class="d-flex svg-illustration align-content-center gap-2 mb-4">
            <span class="app-brand-logo demo">
              <img
                :src="getCompanyLogo(stockTransfer.perusahaan.logoPerusahaan)" 
                alt="logo Perusahaan" 
                style="height: 60px; max-width: 200px; object-fit: contain; cursor: pointer;" 
                @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                @click="perusahaanStore.openImageInNewTab(stockTransfer.perusahaan.logoPerusahaan)"
                @load="debugImageUrl(stockTransfer.perusahaan.logoPerusahaan)"
                title="Klik untuk melihat gambar lengkap"
              >
            </span>
          </div>
          <div class="text-start text-secondary-medium mt-6 mb-0" style="font-size: 12px; width: 220px; min-width: 220px;">
            <p class="mb-2 fw-bold text-heading" style="font-size: 14px;">
              {{ stockTransfer.perusahaan?.nmPerusahaan || '-' }}
            </p>
            <p class="mb-0">
              Alamat: {{ stockTransfer.perusahaan?.alamatPerusahaan || '-' }}
            </p>
            <p class="mb-0">
              Telepon: {{ stockTransfer.perusahaan?.tlpPerusahaan || '-' }}
            </p>
            <p class="mb-0">
              Email: {{ stockTransfer.perusahaan?.emailPerusahaan || '-' }}
            </p>
          </div>
        </div>
        
        <!-- Invoice Header - Right -->
        <div class="invoice-header text-end">
          <h2 class="mb-4 text-capitalize fw-bold">BERITA ACARA</h2>
          <table style="font-size: 12px; width: 100%;">
            <tr>
              <td style="text-align: right;">No. Stock Transfer</td>
              <td style="width: 20px;">:</td>
              <td style="width: 50%;">{{ stockTransfer.noTransfer }}</td>
            </tr>
            <tr>
              <td style="text-align: right;">Tanggal</td>
              <td style="width: 20px;">:</td>
              <td style="width: 50%;">{{ new Date(stockTransfer.date).toLocaleDateString('id-ID') }}</td>
            </tr>
          </table>
        </div>
      </div>

      <hr class="my-6" />

      <div class="d-flex justify-content-between mb-6">
        <div class="col-3">
          <h5><strong>Gudang Asal:</strong></h5>
          <p class="mb-1 fw-semibold" style="font-size: 12px;">{{ stockTransfer.fromWarehouse?.name }}</p>
          <p class="mb-0" style="font-size: 12px;">{{ stockTransfer.fromWarehouse?.address }}</p>
        </div>
        <div class="text-end col-3">
          <h5><strong>Gudang Tujuan:</strong></h5>
          <p class="mb-1 fw-semibold" style="font-size: 12px;">{{ stockTransfer.toWarehouse?.name }}</p>
          <p class="mb-0" style="font-size: 12px;">{{ stockTransfer.toWarehouse?.address }}</p>
        </div>
      </div>

      <div class="table-responsive border-bottom-0 rounded">
        <table class="table m-0">
          <thead class="table-dark table-head-white">
            <tr>
              <th style="font-size: 12px;">No</th>
              <th style="font-size: 12px;">Produk</th>
              <th style="font-size: 12px;">Jumlah</th>
              <th style="font-size: 12px;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in stockTransfer.stockTransferDetails" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.product?.name }}</td>
              <td>{{ item.quantity }} {{ item.product?.unit?.name }}</td>
              <td>{{ item.description || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-responsive mt-5">
        <table class="table m-0 table-borderless">
          <tbody>
            <tr>
              <td colspan="4" class="px-0 pt-6 align-top" style="max-width: 320px; width: 320px; min-width: 220px;">
                <p class="mb-2">
                  <span class="fw-medium text-heading">Catatan:</span>
                </p>
                <p class="mb-0" style="white-space: pre-line; word-break: break-word; max-width: 320px; font-size: 12px;">
                  {{ stockTransfer.description }}
                </p>
              </td>
            </tr>
            <tr>
              <td class="align-top px-0 py-6">
                <p class="mb-1 mt-5">
                  <span class="me-2 fw-medium text-heading">TTD Pengirim</span>
                </p>
              </td>
              <td colspan="2"></td>
              <td class="align-top px-0 py-6">
                <p class="mb-1 mt-5 text-end">
                  <span class="me-2 fw-medium text-heading">TTD Penerima</span>
                </p>
              </td>
            </tr>
            <tr>
              <td colspan="2">
              </td>
            </tr>
            <tr>
              <td colspan="2">
              </td>
            </tr>
            <tr>
              <td colspan="2">
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <span>{{ stockTransfer.transferByUser?.fullName || '-' }}</span>
              </td>
              <td colspan="2" class="text-end p-5" style="padding-right: 1em !important;">
                <span style="margin-right: 1em;">{{ stockTransfer.penerima || '-' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="alert alert-danger m-6" role="alert">
      Stock Transfer tidak ditemukan.
    </div>
</template>


<script setup>
  definePageMeta({
    layout: 'cetak',
    title: 'Cetak Stock Transfer',
    description: 'Cetak Stock Transfer',
    keywords: 'Cetak Stock Transfer, Kainnova Digital Solutions',
    author: 'Kainnova Digital Solutions',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
  })
  import { onMounted } from 'vue';
  import { useStockTransferStore } from '~/stores/stock-transfer';
  import { usePerusahaanStore } from '~/stores/perusahaan';
  import { storeToRefs } from 'pinia';
  import { useRoute } from 'vue-router';
  import Swal from 'sweetalert2';
  import { useDynamicTitle } from '~/composables/useDynamicTitle'
  import { useImageUrl } from '~/composables/useImageUrl'

  // Composables
  const { setListTitle, setFormTitle } = useDynamicTitle()
  const { getCompanyLogo, handleImageError, debugImageUrl } = useImageUrl()

  const config = useRuntimeConfig();
  const stockTransferStore = useStockTransferStore();
  const perusahaanStore = usePerusahaanStore();
  const route = useRoute();

  const { selectedStockTransfer: stockTransfer, loading, error } = storeToRefs(stockTransferStore);

  const getLogoUrl = (logoPath) => {
    if (!logoPath || typeof logoPath !== 'string') {
        return null;
    }
    if (logoPath.startsWith('http')) {
        return logoPath;
    }
    if (!config.public.apiBase) {
        return logoPath;
    }
    const origin = new URL(config.public.apiBase).origin;
    const imageUrl = `${origin}/${logoPath}`;
    return imageUrl;
};

  onMounted(async () => {
    const stockTransferId = route.query.id;
    if (stockTransferId) {
      try {
        await stockTransferStore.fetchStockTransferById(stockTransferId);
      } catch (e) {
        toast('Error', e.message || 'Gagal memuat detail stock transfer.', 'error');
      }
    }
    setListTitle('Stock Transfer', stockTransfer.value.length)
  });
</script>

<style>
  /* Layout styles */
  .logo-section {
    flex: 1;
    max-width: 50%;
  }

  .invoice-header {
    flex: 1;
    max-width: 50%;
  }

  /* Custom styles for print */
  @media print {
    .no-print {
      display: none !important;
    }
    
    /* Hide alert info when printing */
    .alert {
      display: none !important;
    }

    /* Ensure proper layout in print */
    .logo-section,
    .invoice-header {
      max-width: 50% !important;
    }

    /* Logo styling for print */
    .logo-section img {
      max-height: 60px !important;
      max-width: 200px !important;
      object-fit: contain !important;
    }

    /* Ensure logo is visible in print */
    .app-brand-logo img {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
</style> 