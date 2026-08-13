<template>
    <CetakDocument
      type="SALES_INVOICE"
      :document-number="salesInvoice?.noInvoice || ''"
      :status="salesInvoice?.documentStatus ?? salesInvoice?.document_status ?? salesInvoice?.status"
      :company="salesInvoice?.salesOrder?.perusahaan"
      :header-meta="headerMeta"
      :loading="loading"
      :error="error"
      :not-found="!loading && !error && !salesInvoice"
    >
    <template v-if="salesInvoice">

      <!-- Customer Information Section -->
       <div class="customer-info-section mb-6">
         <div class="row">
           <div class="col-6">
             <table class="table table-borderless customer-info-table" style="font-size: 12px;">
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap; width: 80px;">Customer</td>
                 <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ salesInvoice.customer?.name || salesInvoice.salesOrder?.customer?.name || '-' }}</td>
               </tr>
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap; vertical-align: top;">NPWP</td>
                 <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ salesInvoice.customer?.npwp || salesInvoice.salesOrder?.customer?.npwp || '-' }}</td>
               </tr>
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap;">Order Number</td>
                 <td style="font-size: 12px; width: 10px;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ salesInvoice.salesOrder?.noSo || '-' }}</td>
               </tr>
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap;">PO Number</td>
                 <td style="font-size: 12px; width: 10px;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ salesInvoice.salesOrder?.noPo || '-' }}</td>
               </tr>
             </table>
           </div>
           <div class="col-6">
             <table class="table table-borderless customer-info-table" style="font-size: 12px;">
               <tr>
                 <td class="text-start" style="font-size: 12px; vertical-align: top; white-space: nowrap; width: 80px;">Alamat</td>
                 <td style="font-size: 12px; width: 10px; vertical-align: top;">:</td>
                 <td class="text-start" style="font-size: 12px; white-space: pre-line;">{{ salesInvoice.customer?.address || salesInvoice.salesOrder?.customer?.address || '-' }}</td>
               </tr>
               <tr>
                 <td class="text-start" style="font-size: 12px; white-space: nowrap;">Attention</td>
                 <td style="font-size: 12px; width: 10px;">:</td>
                 <td class="text-start" style="font-size: 12px;">{{ salesInvoice.up || '-' }}</td>
               </tr>
             </table>
           </div>
         </div>
       </div>

      <!-- ✅ INFO SECTION -->
      <div v-if="salesInvoice.salesInvoiceItems && salesInvoice.salesInvoiceItems.length > 0" 
           class="alert alert-info d-flex align-items-center mb-4" role="alert">
        <i class="ri-information-line me-2"></i>
        <div>
          <strong>Invoice Items:</strong> Menampilkan {{ salesInvoice.salesInvoiceItems.length }} item dari Sales Invoice Items
        </div>
      </div>
      <div v-else-if="salesInvoice.salesOrder?.salesOrderItems && salesInvoice.salesOrder.salesOrderItems.length > 0" 
           class="alert alert-warning d-flex align-items-center mb-4" role="alert">
        <i class="ri-alert-line me-2"></i>
        <div>
          <strong>Fallback Mode:</strong> Menampilkan {{ salesInvoice.salesOrder.salesOrderItems.length }} item dari Sales Order (Invoice Items belum dibuat)
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
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <!-- ✅ GUNAKAN SALES INVOICE ITEMS, bukan sales order items -->
            <tr v-for="(item, index) in salesInvoice.salesInvoiceItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.product?.sku || '-' }}</td>
              <td>{{ item.product?.name || '-' }}</td>
              <td>{{ item.description || '-' }}</td>
              <td>{{ Number(item.quantity) }}</td>
              <td>{{ formatRupiah(item.price || 0) }}</td>
              <td>{{ formatRupiah(item.subtotal || 0) }}</td>
            </tr>
            <!-- ✅ FALLBACK: jika tidak ada salesInvoiceItems, tampilkan dari salesOrder -->
            <template v-if="(!salesInvoice.salesInvoiceItems || salesInvoice.salesInvoiceItems.length === 0) && salesInvoice.salesOrder?.salesOrderItems">
              <tr v-for="(item, index) in salesInvoice.salesOrder.salesOrderItems" :key="`fallback-${item.id}`">
                <td>{{ index + 1 }}</td>
                <td>{{ item.product?.sku || '-' }}</td>
                <td>{{ item.product?.name || '-' }}</td>
                <td>{{ item.description || '-' }}</td>
                <td>{{ Number(item.quantity) }}</td>
                <td>{{ Number(item.deliveredQty || item.quantity) }}</td>
              <td>{{ formatRupiah(item.price || 0) }}</td>
              <td>{{ formatRupiah(item.subtotal || 0) }}</td>
            </tr>
            </template>
            <!-- ✅ MESSAGE jika tidak ada items sama sekali -->
            <tr v-if="(!salesInvoice.salesInvoiceItems || salesInvoice.salesInvoiceItems.length === 0) && 
                      (!salesInvoice.salesOrder?.salesOrderItems || salesInvoice.salesOrder.salesOrderItems.length === 0)">
              <td colspan="8" class="text-center py-4 text-muted">
                <em>Tidak ada item untuk ditampilkan</em>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-responsive">
        <table class="table mt-2 table-borderless summary-table" style="font-size: 12px;">
          <tbody>
            <tr>
              <td colspan="2" class="px-0 pt-6 align-top" style="max-width: 320px; width: 320px; min-width: 220px;">
                <p class="mb-2">
                  <span class="fw-medium text-heading">Catatan:</span>
                </p>
                <p class="mb-0" style="white-space: pre-line; word-break: break-word; max-width: 320px; font-size: 12px;">
                  {{ salesInvoice.description }}
                </p>
              </td>
              <td colspan="4" class="px-0 pt-6 align-top">
                <div class="d-flex flex-column align-items-end">
                  <div class="mb-2 d-flex justify-content-end" style="min-width: 120px; font-size: 12px;">
                    <span class="fw-medium text-heading" style="min-width: 110px; font-size: 12px;">Subtotal</span>
                    <span class="fw-medium text-heading px-2 text-end" style="width: 30px; display: inline-block; font-size: 12px;">:</span>
                    <span class="fw-semibold text-end flex-grow-1" style="min-width: 110px; font-size: 12px;">{{ formatRupiah(calculateSubtotal()) || 0 }}</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-end" style="min-width: 120px; font-size: 12px;">
                    <span class="fw-medium text-heading" style="min-width: 110px; font-size: 12px;">DPP</span>
                    <span class="fw-medium text-heading px-2 text-end" style="width: 30px; display: inline-block; font-size: 12px;">:</span>
                    <span class="fw-semibold text-end flex-grow-1" style="min-width: 110px; font-size: 12px;">{{ formatRupiah(Number(salesInvoice.dpp) || 0) }}</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-end" style="min-width: 120px; font-size: 12px;">
                    <span class="fw-medium text-heading" style="min-width: 110px; font-size: 12px;">
                      Discount
                      <span v-if="Number(salesInvoice.discountPercent) > 0" style="font-size: 12px;">({{ Number(salesInvoice.discountPercent) }}%)</span>
                    </span>
                    <span class="fw-medium text-heading px-2 text-end" style="width: 30px; display: inline-block; font-size: 12px;">:</span>
                    <span v-if="Number(salesInvoice.discountPercent) > 0" class="fw-semibold text-end flex-grow-1" style="min-width: 110px; font-size: 12px;">-{{ formatRupiah(calculateDiscount()) || 0 }}</span>
                    <span v-else class="fw-semibold text-end flex-grow-1" style="min-width: 110px; font-size: 12px;">-</span>
                  </div>
                  <div class="mb-2 d-flex justify-content-end" style="min-width: 120px; font-size: 12px;">
                    <span class="fw-medium text-heading" style="min-width: 110px; font-size: 12px;">
                      Tax
                      <span v-if="Number(salesInvoice.taxPercent) > 0" style="font-size: 12px;">({{ Number(salesInvoice.taxPercent) }}%)</span>
                    </span>
                    <span class="fw-medium text-heading px-2 text-end" style="width: 30px; display: inline-block; font-size: 12px;">:</span>
                    <span v-if="Number(salesInvoice.taxPercent) > 0" class="fw-semibold text-end flex-grow-1" style="min-width: 110px; font-size: 12px;">{{ formatRupiah(calculateTax()) || 0 }}</span>
                    <span v-else class="fw-semibold text-end flex-grow-1" style="min-width: 110px; font-size: 12px;">-</span>
                  </div>
                  <div class="fw-bold border-top border-dark pt-2 d-flex justify-content-end" style="min-width: 120px; font-size: 12px;">
                    <span class="fw-medium text-heading" style="min-width: 110px; font-size: 12px;">Total</span>
                    <span class="fw-medium text-heading px-2 text-end" style="width: 30px; display: inline-block; font-size: 12px;">:</span>
                    <span class="fw-semibold text-end flex-grow-1" style="min-width: 110px; font-size: 12px;">{{ formatRupiah(calculateGrandTotal()) || 0 }}</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="align-top px-0 py-6">
              </td>
              <td></td>
              <td></td>
              <td class="align-top px-0 py-6" colspan="2">
                <p class="mb-1 mt-5 text-center" style="font-size: 12px;">
                  <span class="fw-medium text-heading">
                    Jakarta, 
                    {{
                      salesInvoice.date
                        ? new Date(salesInvoice.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                        : '-'
                    }}
                  </span>
                </p>
              </td>
            </tr>
            <tr>
              <td colspan="2"></td>
            </tr>
            <tr v-if="salesInvoice?.ttdDigital === true" class="text-center px-0">
              <td colspan="2">
              </td>
              <td></td>
              <td>
                <div class="ttd-container">
                  <img class="ttd-image" :src="publicPath('/img/branding/Ttd Digital-2.png')" alt="TTD Digital" style="height: 120px; object-fit: contain; display: block; margin: 0 auto;" @error="(e) => handleImageError(e, '/img/branding/logo.png')" />
                  <img class="andara-image" :src="publicPath('/img/branding/logo.png')" alt="Andara Logo" style="height: 40px; object-fit: contain; display: block; margin: -90px auto 0;" @error="(e) => handleImageError(e, '/img/branding/logo.png')" />
                </div>
              </td>
            </tr>
            <tr v-else>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2"></td>
              <td></td>
              <td colspan="4" class="text-center py-6 px-0 fw-bold" style="font-size: 12px;">
                Ronal Aurora
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    </CetakDocument>
</template>

<script setup>
  definePageMeta({
    layout: 'cetak',
  })
  import { onMounted, computed } from 'vue';
  import { useSalesInvoiceStore } from '~/stores/sales-invoice';
  import { storeToRefs } from 'pinia';
  import { useRoute } from 'vue-router';
  import { useDynamicTitle } from '~/composables/useDynamicTitle'
  import { useImageUrl } from '~/composables/useImageUrl'

  const { setDetailTitle } = useDynamicTitle()
  const { handleImageError } = useImageUrl()

  const config = useRuntimeConfig();
  const publicPath = (p) => {
    if (!p) return p;
    if (p.startsWith('http')) return p;
    const base = (config?.app?.baseURL) || '/';
    const joined = `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
    return joined;
  };
  const salesInvoiceStore = useSalesInvoiceStore();
  const route = useRoute();
  const formatRupiah = useFormatRupiah();

  const { selectedSalesInvoice: salesInvoice, loading, error } = storeToRefs(salesInvoiceStore);

  const headerMeta = computed(() => {
    if (!salesInvoice.value) return []
    return [
      { label: 'No. Invoice', value: salesInvoice.value.noInvoice || '—' },
      { label: 'Tanggal', value: salesInvoice.value.date ? new Date(salesInvoice.value.date).toLocaleDateString('id-ID') : '—' },
    ]
  })

  const calculateSubtotal = () => {
    if (!salesInvoice.value) return 0;
    
    // ✅ PRIORITAS: Gunakan salesInvoiceItems jika ada
    if (salesInvoice.value.salesInvoiceItems && salesInvoice.value.salesInvoiceItems.length > 0) {
      return salesInvoice.value.salesInvoiceItems.reduce((total, item) => {
        return total + (Number(item.subtotal) || 0);
      }, 0);
    }
    
    // ✅ FALLBACK: Gunakan salesOrderItems jika salesInvoiceItems tidak ada
    if (salesInvoice.value.salesOrder?.salesOrderItems) {
      return salesInvoice.value.salesOrder.salesOrderItems.reduce((total, item) => {
        return total + (Number(item.subtotal) || 0);
      }, 0);
    }
    
    return 0;
  };

  const calculateDiscount = () => {
    if (!salesInvoice.value || !salesInvoice.value.discountPercent) return 0;
    const subtotal = calculateSubtotal();
    return subtotal * (Number(salesInvoice.value.discountPercent) / 100);
  };

  const calculateTax = () => {
    if (!salesInvoice.value || !salesInvoice.value.taxPercent) return 0;
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const afterDiscount = subtotal - discount;
    return afterDiscount * (Number(salesInvoice.value.taxPercent) / 100);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  onMounted(async () => {
    const salesInvoiceId = route.query.id;
    if (salesInvoiceId) {
      try {
        await salesInvoiceStore.fetchSalesInvoiceById(salesInvoiceId);
        setDetailTitle('Sales Invoice', salesInvoice.value.noInvoice)
      } catch (e) {
        toast.fire('Error', e.message || 'Gagal memuat detail sales invoice.', 'error');
      }
    }
  });
</script>

<style>
  .customer-info-section {
    margin-top: 2rem;
  }

  .customer-info-section .row {
    margin: 0;
  }

  .customer-info-section .col-6 {
    padding: 0 1rem 0 0;
  }

  .customer-info-section .col-6:last-child {
    padding: 0 0 0 1rem;
  }

  @media print {
    .ttd-container .ttd-image {
      height: 90px !important;
      margin: 0 auto !important;
      display: block !important;
    }

    .ttd-container .andara-image {
      margin: -70px auto 0 !important;
      display: block !important;
      height: 40px !important;
      object-fit: contain !important;
    }

    .table-borderless td,
    .table-borderless th,
    .customer-info-table td,
    .customer-info-table th,
    .table-borderless,
    .table-borderless * {
      border: none !important;
    }
  }
</style> 