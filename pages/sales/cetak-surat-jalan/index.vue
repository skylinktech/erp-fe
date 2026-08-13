<template>
    <div :key="routeKey">
    <CetakDocument
      type="SURAT_JALAN"
      :document-number="suratJalan?.noSuratJalan || ''"
      :status="suratJalan?.status"
      :company="suratJalan?.salesOrder?.perusahaan"
      :header-meta="headerMeta"
      :loading="loading"
      :error="error"
      :not-found="!loading && !error && !suratJalan"
    >
    <template v-if="suratJalan">

      <!-- ✅ INFO SECTION -->
      <div v-if="suratJalan.suratJalanItems && suratJalan.suratJalanItems.length > 0" 
           class="alert alert-info d-flex align-items-center mb-4" role="alert">
        <i class="ri-information-line me-2"></i>
        <div>
          <strong>Surat Jalan Items:</strong> Menampilkan {{ suratJalan.suratJalanItems.filter(item => item.statusPartial === true).length }} item dari Surat Jalan Items (status partial)
        </div>
      </div>

      <div class="table-responsive table-striped rounded">
        <table class="table m-0" style="font-size: 12px;">
          <thead class="table-dark table-head-white borderless">
            <tr>
              <th>No</th>
              <th>Part Number</th>
              <th>Produk</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            <!-- ✅ GUNAKAN SALES ORDER ITEMS dengan filter statusPartial = true -->
            <tr v-for="(item, index) in suratJalan.suratJalanItems.filter(item => item.salesOrderItem?.statusPartial === true)" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td class="text-nowrap text-heading">{{ item.product?.sku || 'Part Number' }}</td>
              <td class="text-nowrap text-heading">{{ item.product?.name || 'Product Name' }}</td>
              <td class="text-nowrap">{{ item.quantity || '0' }}</td>
            </tr>
            <!-- ✅ MESSAGE jika tidak ada items sama sekali -->
            <tr v-if="!suratJalan.suratJalanItems || suratJalan.suratJalanItems.filter(item => item.salesOrderItem?.statusPartial === true).length === 0">
              <td colspan="8" class="text-center py-4 text-muted">
                <em>Tidak ada item dengan status partial untuk ditampilkan</em>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-responsive">
        <table class="table mt-2 table-borderless" style="font-size: 12px;">
          <tbody>
            <tr v-if="suratJalan.description">
              <td colspan="2" class="px-0 pt-6 align-top" style="max-width: 320px; width: 320px; min-width: 220px;">
                <p class="mb-2">
                  <span class="fw-medium text-heading">Catatan:</span>
                </p>
                <p class="mb-0" style="white-space: pre-line; word-break: break-word; max-width: 320px;">
                  {{ suratJalan.description }}
                </p>
              </td>
            </tr>
            <tr>
              <td class="align-top py-6" style="width: 20%; min-width: 200px;">
                <div class="d-flex flex-column align-items-center justify-content-center h-100" style="margin-left: 24px;">
                  <p class="mb-1 mt-5 text-start">
                    <span class="fw-medium text-heading">
                      Yang menerima:
                    </span>
                  </p>
                  <p class="mt-10 text-start pt-10">
                    ....................
                  </p>
                </div>
              </td>
              <td style="width: 80%;"></td>
              <td class="align-top py-6" style="width: 20%; min-width: 200px;">
                <div class="d-flex flex-column align-items-center justify-content-center h-100" style="margin-right: 24px;">
                  <p class="mb-1 mt-5 text-end">
                    <span class="fw-medium text-heading">
                      Yang menyerahkan:
                    </span>
                  </p>
                  <div v-if="isTtdDigital" class="ttd-container">
                    <img 
                      class="ttd-image" 
                      :src="ttdImageSrc" 
                      alt="TTD Digital" 
                      style="height: 120px; object-fit: contain; display: block; margin: 0 auto;" 
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
                  <p class="mt-10 text-end pt-10">
                    {{ suratJalan.createdByUser?.fullName || '-' }}
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
  })
  import { onMounted, onBeforeUnmount, computed, watch } from 'vue';
  import { useSuratJalanStore } from '~/stores/surat-jalan';
  import { storeToRefs } from 'pinia';
  import { useRoute } from 'vue-router';
  import { useDynamicTitle } from '~/composables/useDynamicTitle'
  import { useImageUrl } from '~/composables/useImageUrl'

  const { setDetailTitle } = useDynamicTitle()
  const { handleImageError } = useImageUrl()

  const config          = useRuntimeConfig();
  const suratJalanStore = useSuratJalanStore();
  const route           = useRoute();
  const toast           = useToast();

  const { suratJalan, loading, error } = storeToRefs(suratJalanStore);

  const headerMeta = computed(() => {
    if (!suratJalan.value) return []
    return [
      { label: 'No. Surat Jalan', value: suratJalan.value.noSuratJalan || '—' },
      { label: 'Alamat Pengiriman', value: suratJalan.value.alamatPengiriman || '—' },
      { label: 'Tanggal', value: suratJalan.value.date ? new Date(suratJalan.value.date).toLocaleDateString('id-ID') : '—' },
      { label: 'No. Purchase Order', value: suratJalan.value.salesOrder?.noPo || '—' },
      { label: 'PIC', value: suratJalan.value.picName || '—' },
    ]
  })

  // ✅ Computed key untuk force re-render saat route berubah (hanya untuk halaman ini)
  const routeKey = computed(() => `surat-jalan-${route.query.id || 'new'}`);

  // ✅ Function untuk fetch data
  const fetchData = async () => {
    const suratJalanId = route.query.id;
    if (!suratJalanId) {
      suratJalanStore.error = { message: 'ID Surat Jalan tidak ditemukan' };
      return;
    }

    // Reset state sebelum fetch data baru
    suratJalanStore.suratJalan = null;
    suratJalanStore.error = null;

    try {
      await suratJalanStore.fetchSuratJalanDetailWithItems(suratJalanId);
      if (suratJalan.value) {
        setDetailTitle('Surat Jalan', suratJalan.value.noSuratJalan);
      }
    } catch (e) {
      console.error('Error fetching surat jalan:', e);
      toast.fire('Error', e.message || 'Gagal memuat detail surat jalan.', 'error');
    }
  };

  // Normalisasi nilai TTD Digital agar robust terhadap tipe data dari API (boolean/string/number)
  const isTtdDigital = computed(() => {
    const val = suratJalan.value?.ttdDigital;
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

  // Tentukan gambar TTD berdasarkan ID createdByUser
  const ttdImageSrc = computed(() => {
    if (!isTtdDigital.value) return null;
    const userId = suratJalan.value?.createdByUser?.id;
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
    suratJalanStore.suratJalan = null;
    suratJalanStore.error = null;
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
      height: 90px !important;
    }

    .ttd-container .andara-image {
      margin: -70px auto 0 !important;
      height: 40px !important;
    }
  }
</style> 