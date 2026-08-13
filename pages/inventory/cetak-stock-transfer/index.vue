<template>
    <div :key="routeKey">
    <CetakDocument
      type="STOCK_TRANSFER"
      :document-number="stockTransfer?.noTransfer || ''"
      :status="stockTransfer?.status"
      :company="stockTransfer?.perusahaan"
      :header-meta="headerMeta"
      :loading="loading"
      :error="error"
      :not-found="!loading && !error && !stockTransfer"
    >
    <template v-if="stockTransfer">

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
    </template>
    </CetakDocument>
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
  import { storeToRefs } from 'pinia';
  import { useRoute } from 'vue-router';
  import { useDynamicTitle } from '~/composables/useDynamicTitle'
  import { useImageUrl } from '~/composables/useImageUrl'

  const { setListTitle } = useDynamicTitle()
  const { handleImageError } = useImageUrl()

  const config = useRuntimeConfig();
  const stockTransferStore = useStockTransferStore();
  const route = useRoute();
  const toast = useToast();

  const { selectedStockTransfer: stockTransfer, loading, error } = storeToRefs(stockTransferStore);

  const headerMeta = computed(() => {
    if (!stockTransfer.value) return []
    return [
      { label: 'No. Stock Transfer', value: stockTransfer.value.noTransfer || '—' },
      { label: 'Tanggal', value: stockTransfer.value.date ? new Date(stockTransfer.value.date).toLocaleDateString('id-ID') : '—' },
      { label: 'Penerima', value: stockTransfer.value.penerima || '—' },
    ]
  })

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
  .ttd-container {
    position: relative;
    margin: 20px 0;
  }

  .ttd-container .ttd-image {
    height: 120px;
    margin: 0 auto;
    display: block;
  }

  .ttd-container .andara-image {
    margin: -90px auto 0;
    display: block;
    height: 40px;
    object-fit: contain;
  }

  @media print {
    .ttd-container .ttd-image {
      height: 140px !important;
      margin: -25px auto !important;
    }

    .ttd-container .andara-image {
      margin: -70px auto 0 !important;
      height: 40px !important;
    }
  }
</style> 