<template>
    <div :key="routeKey">
    <CetakDocument
      type="PURCHASE_ORDER"
      :document-number="purchaseOrder?.noPo || ''"
      :status="purchaseOrder?.status"
      :company="purchaseOrder?.perusahaan"
      :header-meta="headerMeta"
      :loading="loading"
      :error="error"
      :not-found="!loading && !error && !purchaseOrder"
    >
    <template v-if="purchaseOrder">

             <!-- vendor Information Section -->
       <div class="vendor-info-section mb-6">
         <div class="row">
           <div class="col-6">
             <table class="table table-borderless vendor-info-table" style="font-size: 12px;">
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap; width: 80px;">Vendor</td>
                 <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ purchaseOrder.vendor?.name || purchaseOrder.salesOrder?.vendor?.name || '-' }}</td>
               </tr>
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap; vertical-align: top;">NPWP</td>
                 <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ purchaseOrder.vendor?.npwp || purchaseOrder.salesOrder?.vendor?.npwp || '-' }}</td>
               </tr>
             </table>
           </div>
           <div class="col-6">
             <table class="table table-borderless vendor-info-table" style="font-size: 12px;">
               <tr>
                 <td class="text-start" style="font-size: 12px; vertical-align: top; white-space: nowrap; width: 80px;">Alamat</td>
                 <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                 <td class="text-start" style="font-size: 12px; white-space: pre-line;">{{ purchaseOrder.vendor?.address || purchaseOrder.salesOrder?.vendor?.address || '-' }}</td>
               </tr>
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap;">Attention</td>
                 <td style="font-size: 12px; width: 10px;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ purchaseOrder.up || '-' }}</td>
               </tr>
             </table>
           </div>
         </div>
       </div>

      <!-- ✅ INFO SECTION -->
      <div v-if="purchaseOrder.purchaseOrderItems && purchaseOrder.purchaseOrderItems.length > 0"
           class="alert alert-info d-flex align-items-center mb-4" role="alert">
        <i class="ri-information-line me-2"></i>
        <div>
          <strong>Purchase Order Items:</strong> Menampilkan {{ purchaseOrder.purchaseOrderItems.length }} item dari Purchase Order Items
        </div>
      </div>
      <div v-else
           class="alert alert-warning d-flex align-items-center mb-4" role="alert">
        <i class="ri-alert-line me-2"></i>
        <div>
          <strong>Tidak ada item:</strong> Tidak ada item Purchase Order yang dapat ditampilkan.
        </div>
      </div>

      <div class="table-responsive border-bottom-0 rounded mb-6">
        <table class="table m-0" style="font-size: 12px;">
          <thead class="table-dark table-head-white">
            <tr>
              <th>No</th>
              <th>Part Number</th>
              <th>Produk</th>
              <th>Deskripsi</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- ✅ GUNAKAN SALES INVOICE ITEMS, bukan sales order items -->
            <tr v-for="(item, index) in purchaseOrder.purchaseOrderItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.product?.sku || '-' }}</td>
              <td>{{ item.product?.name || '-' }}</td>
              <td>{{ item.description || '-' }}</td>
              <td>{{ Number(item.quantity) }}</td>
              <td>{{ formatRupiah(item.price || 0) }}</td>
              <td>{{ formatRupiah(item.subtotal || 0) }}</td>
            </tr>
            <!-- ✅ FALLBACK: jika tidak ada purchaseOrderItems, tampilkan dari salesOrder -->
            <template v-if="(!purchaseOrder.purchaseOrderItems || purchaseOrder.purchaseOrderItems.length === 0) && purchaseOrder.salesOrder?.salesOrderItems">
              <tr v-for="(item, index) in purchaseOrder.salesOrder.salesOrderItems" :key="`fallback-${item.id}`">
                <td>{{ index + 1 }}</td>
                <td>{{ item.product?.sku || '-' }}</td>
                <td>{{ item.product?.name || '-' }}</td>
                <td>{{ item.description || '-' }}</td>
                <td>{{ Number(item.quantity) }}</td>
                <td>{{ formatRupiah(item.price || 0) }}</td>
                <td>{{ formatRupiah(item.subtotal || 0) }}</td>
              </tr>
            </template>
            <!-- ✅ MESSAGE jika tidak ada items sama sekali -->
            <tr v-if="(!purchaseOrder.purchaseOrderItems || purchaseOrder.purchaseOrderItems.length === 0) && 
                      (!purchaseOrder.salesOrder?.salesOrderItems || purchaseOrder.salesOrder.salesOrderItems.length === 0)">
              <td colspan="7" class="text-center py-4 text-muted">
                <em>Tidak ada item untuk ditampilkan</em>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-responsive table-striped">
        <table class="table mt-2 table-borderless" style="font-size: 12px;">
          <tbody>
            <tr>
              <td colspan="2" class="px-0 pt-6 align-top" style="max-width: 320px; width: 320px; min-width: 220px;">
                <p v-if="purchaseOrder.description" class="mb-2">
                  <span class="fw-medium text-heading">Catatan:</span>
                </p>
                <p v-if="purchaseOrder.description" class="mb-0" style="white-space: pre-line; word-break: break-word; max-width: 320px;">
                  {{ purchaseOrder.description }}
                </p>
              </td>
              <td colspan="4" class="px-0 pt-6 align-top">
                <div class="d-flex flex-column align-items-end">
                  <div class="mb-2 d-flex" style="min-width: 270px;">
                    <span class="fw-medium text-heading" style="min-width: 90px;">Subtotal</span>
                    <span class="fw-medium text-heading px-2" style="min-width: 10px; text-align: right;">:</span>
                    <span class="fw-semibold text-end flex-grow-1">{{ formatRupiah(calculateSubtotal()) || 0 }}</span>
                  </div>
                  <div class="mb-2 d-flex" style="min-width: 270px;">
                    <span class="fw-medium text-heading" style="min-width: 90px;">DPP</span>
                    <span class="fw-medium text-heading px-2" style="min-width: 10px; text-align: right;">:</span>
                    <span class="fw-semibold text-end flex-grow-1">{{ formatRupiah(Number(purchaseOrder.dpp) || 0) }}</span>
                  </div>
                  <div class="mb-2 d-flex" style="min-width: 270px;">
                    <span class="fw-medium text-heading" style="min-width: 90px;">
                      Discount
                      <span v-if="Number(purchaseOrder.discountPercent) > 0">({{ Number(purchaseOrder.discountPercent) }}%)</span>
                    </span>
                    <span class="fw-medium text-heading px-2" style="min-width: 10px; text-align: right;">:</span>
                    <span v-if="Number(purchaseOrder.discountPercent) > 0" class="fw-semibold text-end flex-grow-1">-{{ formatRupiah(calculateDiscount()) || 0 }}</span>
                    <span v-else class="fw-semibold text-end flex-grow-1">-</span>
                  </div>
                  <div class="mb-2 d-flex" style="min-width: 270px;">
                    <span class="fw-medium text-heading" style="min-width: 90px;">
                      Tax
                      <span v-if="Number(purchaseOrder.taxPercent) > 0">({{ Number(purchaseOrder.taxPercent) }}%)</span>
                    </span>
                    <span class="fw-medium text-heading px-2" style="min-width: 10px; text-align: right;">:</span>
                    <span v-if="Number(purchaseOrder.taxPercent) > 0" class="fw-semibold text-end flex-grow-1">{{ formatRupiah(calculateTax()) || 0 }}</span>
                    <span v-else class="fw-semibold text-end flex-grow-1">-</span>
                  </div>
                  <div class="fw-bold border-top border-dark pt-2 d-flex" style="min-width: 270px;">
                    <span class="fw-medium text-heading" style="min-width: 90px;">Total</span>
                    <span class="fw-medium text-heading px-2" style="min-width: 10px; text-align: right;">:</span>
                    <span class="fw-semibold text-end flex-grow-1">{{ formatRupiah(calculateGrandTotal()) || 0 }}</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="6" class="px-0 py-6">
                <div class="d-flex justify-content-between align-items-start" style="min-height: 120px;">
                  <!-- Left Column - Prepared By -->
                  <div class="text-center" style="width: 45%;">
                    <p class="mb-6 fw-medium text-heading" style="font-size: 12px;">
                      Prepared By:
                    </p>
                    <div v-if="isTtdDigital" class="ttd-container" style="position: relative; min-height: 120px; margin-top: -50px;">
                      <img 
                        class="ttd-image" 
                        :src="publicPath('/img/branding/Ttd Digital-1.png')" 
                        alt="TTD Digital" 
                        style="height: 180px; object-fit: contain; display: block; margin: 0 auto;" 
                        @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                      />
                      <img 
                        class="andara-image" 
                        :src="publicPath('/img/branding/logo.png')" 
                        alt="Andara Logo" 
                        style="height: 40px; object-fit: contain; position: absolute; left: 50%; transform: translateX(-50%); bottom: 90px;" 
                        @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                      />
                      <div class="mt-2 pt-6" style="border-top: 1px solid #000; display: inline-block; min-width: 150px;">
                        <p class="mb-0 fw-medium" style="font-size: 12px;">
                          {{
                            purchaseOrder.createdByUser.fullName
                              ? purchaseOrder.createdByUser.fullName
                              : '-'
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Right Column - Date -->
                  <div class="text-center" style="width: 45%;">
                    <p class="mb-6 fw-medium text-heading" style="font-size: 12px;">
                      Approved By:
                    </p>
                    <div v-if="isTtdDigital" class="ttd-container" style="position: relative; min-height: 120px;">
                      <img 
                        class="ttd-image" 
                        :src="publicPath('/img/branding/Ttd Digital-2.png')" 
                        alt="TTD Digital" 
                        style="height: 120px; object-fit: contain; display: block; margin: 0 auto;" 
                        @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                      />
                      <img 
                        class="andara-image" 
                        :src="publicPath('/img/branding/logo.png')" 
                        alt="Andara Logo" 
                        style="height: 40px; object-fit: contain; position: absolute; left: 50%; transform: translateX(-50%); bottom: 40px;" 
                        @error="(e) => handleImageError(e, '/img/default-company-logo.png')"
                      />
                    </div>
                    <div class="mt-2 pt-6" style="border-top: 1px solid #000; display: inline-block; min-width: 150px;">
                        <p class="mb-0 fw-medium" style="font-size: 12px;">
                          Ronal Aurora
                        </p>
                      </div>
                  </div>
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
  import { usePurchaseOrderStore } from '~/stores/purchaseOrder';
  import { storeToRefs } from 'pinia';
  import { useRoute } from 'vue-router';
  import { useDynamicTitle } from '~/composables/useDynamicTitle'
  import { useImageUrl } from '~/composables/useImageUrl'
  
  const { setDetailTitle } = useDynamicTitle()
  const { handleImageError } = useImageUrl()

  const config             = useRuntimeConfig();
  const purchaseOrderStore = usePurchaseOrderStore();
  const route              = useRoute();
  const formatRupiah       = useFormatRupiah();
  const toast              = useToast();

  const { purchaseOrder, loading, error } = storeToRefs(purchaseOrderStore);

  const headerMeta = computed(() => {
    if (!purchaseOrder.value) return []
    return [
      { label: 'No. PO', value: purchaseOrder.value.noPo || '—' },
      { label: 'Tanggal', value: purchaseOrder.value.date ? new Date(purchaseOrder.value.date).toLocaleDateString('id-ID') : '—' },
      { label: 'Term Of Payment', value: purchaseOrder.value.termOfPayment || '30 Hari' },
    ]
  })

  // ✅ Computed key untuk force re-render saat route berubah (hanya untuk halaman ini)
  const routeKey = computed(() => `purchase-order-${route.query.id || 'new'}`);

  // ✅ Function untuk fetch data
  const fetchData = async () => {
    const purchaseOrderId = route.query.id;
    if (!purchaseOrderId) {
      purchaseOrderStore.error = { message: 'ID Purchase Order tidak ditemukan' };
      return;
    }

    // Reset state sebelum fetch data baru
    purchaseOrderStore.purchaseOrder = null;
    purchaseOrderStore.error = null;

    try {
      await purchaseOrderStore.getPurchaseOrderDetails(purchaseOrderId);
      if (purchaseOrder.value) {
        setDetailTitle('Purchase Order', purchaseOrder.value.noPo);
      }
    } catch (e) {
      console.error('Error fetching purchase order:', e);
      toast.error({
        title: 'Gagal!',
        icon: 'ri-close-line',
        message: e.message || 'Gagal memuat detail purchase order.',
        timeout: 3000,
        position: 'bottomRight',
        layout: 2,
      });
    }
  };

  // Normalisasi nilai TTD Digital agar robust terhadap tipe data dari API (boolean/string/number)
  const isTtdDigital = computed(() => {
    const val = purchaseOrder.value?.ttdDigital;
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

  const calculateSubtotal = () => {
    if (!purchaseOrder.value) return 0;
    
    // ✅ PRIORITAS: Gunakan purchaseOrderItems jika ada
    if (purchaseOrder.value.purchaseOrderItems && purchaseOrder.value.purchaseOrderItems.length > 0) {
      return purchaseOrder.value.purchaseOrderItems.reduce((total, item) => {
        return total + (Number(item.subtotal) || 0);
      }, 0);
    }
    
    // ✅ FALLBACK: Gunakan salesOrderItems jika purchaseOrderItems tidak ada
    if (purchaseOrder.value.salesOrder?.salesOrderItems) {
      return purchaseOrder.value.salesOrder.salesOrderItems.reduce((total, item) => {
        return total + (Number(item.subtotal) || 0);
      }, 0);
    }
    
    return 0;
  };

  const calculateDiscount = () => {
    if (!purchaseOrder.value || !purchaseOrder.value.discountPercent) return 0;
    const subtotal = calculateSubtotal();
    return subtotal * (Number(purchaseOrder.value.discountPercent) / 100);
  };

  const calculateTax = () => {
    if (!purchaseOrder.value || !purchaseOrder.value.taxPercent) return 0;
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const afterDiscount = subtotal - discount;
    return afterDiscount * (Number(purchaseOrder.value.taxPercent) / 100);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
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
    purchaseOrderStore.purchaseOrder = null;
    purchaseOrderStore.error = null;
  });
</script>

<style>
  @media print {
    .table-borderless td,
    .table-borderless th,
    .customer-info-table td,
    .customer-info-table th,
    .table-borderless,
    .table-borderless * {
      border: none !important;
    }

    .d-flex.justify-content-between {
      page-break-inside: avoid !important;
    }
  }
</style> 