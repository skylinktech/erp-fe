<template>
    <div :key="routeKey" class="cetak-wrapper">
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
            <tbody>
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
              <tr>
                <td style="text-align: right;">Penerima</td>
                <td style="width: 20px;">:</td>
                <td style="width: 50%;">{{ stockTransfer.penerima }}</td>
              </tr>
            </tbody>
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
              <th style="font-size: 12px;">Part Number</th>
              <th style="font-size: 12px;">Produk</th>
              <th style="font-size: 12px;">Jumlah</th>
              <th style="font-size: 12px;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in stockTransfer.stockTransferDetails" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.product?.sku }}</td>
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
              <td class="align-top py-6" style="width: 20%; min-width: 200px;">
                <div class="d-flex flex-column align-items-center justify-content-center h-100" style="margin-left: 24px;">
                  <p class="mb-1 mt-5 text-start">
                    <span class="fw-medium text-heading">
                      TTD Pengirim
                    </span>
                  </p>
                  <div v-if="isTtdDigital" class="ttd-container">
                    <img 
                      class="ttd-image" 
                      :src="ttdImageSrc" 
                      alt="TTD Digital" 
                      style="height: 160px; object-fit: contain; display: block; margin: 0 auto;" 
                      @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                    />
                    <img 
                      class="andara-image" 
                      :src="publicPath('/img/branding/logo.png')" 
                      alt="Andara Logo" 
                      style="height: 40px; object-fit: contain; display: block; margin: -90px auto 0;" 
                      @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                    />
                  </div>
                  <p class="text-start pt-10">
                    {{ stockTransfer.transferByUser?.fullName || '-' }}
                  </p>
                </div>
              </td>
              <td style="width: 60%;"></td>
              <td class="align-top py-6" style="width: 20%; min-width: 200px;">
                <div class="d-flex flex-column align-items-center justify-content-center h-100" style="margin-right: 24px;">
                  <p class="mb-1 mt-5 text-end">
                    <span class="fw-medium text-heading">
                      TTD Penerima
                    </span>
                  </p>
                  <p class="mt-10 text-end pt-10">
                    ....................
                  </p>
                  <p class="mt-10 text-end pt-10">
                    {{ stockTransfer.penerima || '-' }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="alert alert-danger m-6" role="alert">
      Stock Transfer tidak ditemukan.
    </div>
    </div>
</template>


<script setup>
  definePageMeta({
    layout: 'cetak',
    title: 'Cetak Stock Transfer',
    description: 'Cetak Stock Transfer',
    keywords: 'Cetak Stock Transfer, Sinergi Innovate Pratama',
    author: 'Sinergi Innovate Pratama',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
  })
  import { onMounted, onBeforeUnmount, computed, watch } from 'vue';
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
  const toast = useToast();

  const { selectedStockTransfer: stockTransfer, loading, error } = storeToRefs(stockTransferStore);

  useRegisterCetakDraftStatus(() => stockTransfer.value?.status)

  // ✅ Computed key untuk force re-render saat route berubah (hanya untuk halaman ini)
  const routeKey = computed(() => `stock-transfer-${route.query.id || 'new'}`);

  // ✅ Function untuk fetch data
  const fetchData = async () => {
    const stockTransferId = route.query.id;
    if (!stockTransferId) {
      stockTransferStore.error = { message: 'ID Stock Transfer tidak ditemukan' };
      return;
    }

    // Reset state sebelum fetch data baru
    stockTransferStore.selectedStockTransfer = null;
    stockTransferStore.error = null;

    try {
      await stockTransferStore.fetchStockTransferById(stockTransferId);
      if (stockTransfer.value) {
        setListTitle('Stock Transfer', stockTransfer.value.length || 1);
      }
    } catch (e) {
      console.error('Error fetching stock transfer:', e);
      toast.fire('Error', e.message || 'Gagal memuat detail stock transfer.', 'error');
    }
  };

  // Normalisasi nilai TTD Digital agar robust terhadap tipe data dari API (boolean/string/number)
  const isTtdDigital = computed(() => {
    const val = stockTransfer.value?.ttdDigital;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return ['true', '1', 'yes', 'y'].includes(val.toLowerCase());
    if (typeof val === 'number') return val === 1;
    return false;
  });

  // Helper untuk memastikan path sesuai base publik Nuxt (terutama saat deploy di subpath)
  const publicPath = (p) => {
    if (!p) return p;
    // Jika sudah absolute http(s) atau sudah root-relative, kembalikan apa adanya
    if (p.startsWith('http')) return p;
    // runtime base (app.baseURL) dari useRuntimeConfig().app
    const base = (config?.app?.baseURL) || '/';
    // Hindari double slash
    const joined = `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
    return joined;
  };

  // Tentukan gambar TTD berdasarkan ID transferByUser
  const ttdImageSrc = computed(() => {
    if (!isTtdDigital.value) return null;
    const userId = stockTransfer.value?.transferByUser?.id;
    // default
    let file = '/img/branding/Ttd Digital-1.png';
    if (userId === 2) file = '/img/branding/Ttd Digital-1.png';
    if (userId === 4 || userId === 9) file = '/img/branding/Ttd Digital-3.png';
    return publicPath(file);
  });

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

  // ✅ Watch route changes untuk auto-fetch saat ID berubah
  watch(() => route.query.id, (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchData();
    }
  });

  // ✅ Fetch data saat component mounted
  onMounted(() => {
    fetchData();
  });

  // ✅ Reset store saat component unmount
  onBeforeUnmount(() => {
    stockTransferStore.selectedStockTransfer = null;
    stockTransferStore.error = null;
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

  /* TTD Container styles for screen */
  .ttd-container {
    position: relative;
    margin: 20px 0;
  }

  .ttd-container .ttd-image {
    position: relative;
    height: 120px;
    z-index: 1;
    margin: 0 auto;
    display: block;
  }

  .ttd-container .andara-image {
    position: relative;
    z-index: 2;
    margin: -90px auto 0;
    display: block;
    height: 40px;
    object-fit: contain;
  }

  /* Custom styles for print */
  @media print {
    .ttd-container {
      position: relative;
    }

    .ttd-container .ttd-image {
      position: relative;
      height: 140px !important;
      z-index: 1;
      margin: -25px auto !important;
      display: block !important;
    }

    .ttd-container .andara-image {
      position: relative;
      z-index: 2;
      margin: -70px auto 0 !important;
      display: block !important;
      height: 40px !important;
      object-fit: contain !important;
    }
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