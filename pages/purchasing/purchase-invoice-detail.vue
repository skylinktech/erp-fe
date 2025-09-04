<template>
    <div class="content-wrapper">
      <!-- Content -->
      <div class="container-xxl flex-grow-1 container-p-y">
        <div v-if="loading" class="text-center p-6">
          <ProgressSpinner 
                    style="width: 50px; height: 50px" 
                    strokeWidth="4"
                    fill="transparent"
                    animationDuration="1s"
                />
                <div class="mt-3 text-muted">Memuat data...</div>
          <p class="mt-3">Memuat detail Purchase Invoice...</p>
        </div>
        <template v-else-if="purchaseInvoice && !loading">
          <div class="row invoice-preview">
            <!-- Invoice -->
            <div class="col-xl-9 col-md-8 col-12 mb-md-0 mb-6">
              <div class="card invoice-preview-card p-sm-12 p-6">
                <div class="card-body invoice-preview-header rounded-4 p-6">
                  <div class="d-flex justify-content-between flex-xl-row flex-md-column flex-sm-row flex-column text-heading align-items-xl-center align-items-md-start align-items-sm-center flex-wrap gap-6">
                    <div>
                      <div class="d-flex svg-illustration align-items-center gap-2 mb-6">
                        <span class="app-brand-logo demo">
                          <span style="color: var(--bs-primary)">
                            <img src="~/public/img/branding/andara.png" alt="logo" width="200">
                          </span>
                        </span>
                      </div>
                      <p class="mb-1">{{ purchaseInvoice.purchaseOrder?.perusahaan?.alamatPerusahaan || 'Alamat Perusahaan' }}</p>
                      <p class="mb-1">{{ purchaseInvoice.purchaseOrder?.perusahaan?.kodePerusahaan || 'Kode Perusahaan' }}</p>
                      <p class="mb-0">{{ purchaseInvoice.purchaseOrder?.perusahaan?.npwpPerusahaan || 'NPWP Perusahaan' }}</p>
                    </div>
                    <div>
                      <div class="d-flex align-items-center gap-3 mb-6">
                        <h5 class="mb-0">Invoice Number : {{ purchaseInvoice.noInvoice }}</h5>
                        <span :class="getStatusBadgeClass(purchaseInvoice.status)">
                          {{ getStatusText(purchaseInvoice.status) }}
                        </span>
                      </div>
                      <div class="mb-1">
                        <span>Date Issues: </span>
                        <span>{{ formatDate(purchaseInvoice.paymentDate) }}</span>
                      </div>
                      <div class="mb-1">
                        <span>Due Date: </span>
                        <span>{{ formatDate(purchaseInvoice.purchaseOrder.dueDate) }}</span>
                      </div>
                      <div>
                        <span>Purchase Order: </span>
                        <span class="fw-bold">{{ purchaseInvoice.purchaseOrder?.noPo || '-' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-body py-6 px-0">
                  <div class="d-flex justify-content-between flex-wrap gap-6">
                    <div>
                      <h6>Invoice To:</h6>
                      <p class="mb-1">{{ purchaseInvoice.purchaseOrder?.up || 'UP' }}</p>
                      <p class="mb-1">{{ purchaseInvoice.vendor?.name || 'Vendor Name' }}</p>
                      <p class="mb-1">{{ purchaseInvoice.vendor?.address || 'Vendor Address' }}</p>
                      <p class="mb-1">{{ purchaseInvoice.vendor?.phone || 'Vendor Phone' }}</p>
                      <p class="mb-0">{{ purchaseInvoice.vendor?.email || 'Vendor Email' }}</p>
                    </div>
                    <div>
                      <h6>Bill To:</h6>
                      <p class="mb-1">{{ purchaseInvoice.purchaseOrder?.perusahaan?.nmPerusahaan || 'Nama Perusahaan' }}</p>
                      <p class="mb-1">{{ purchaseInvoice.purchaseOrder?.perusahaan?.alamatPerusahaan || 'Alamat Perusahaan' }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- ✅ PURCHASE INVOICE ITEMS TABLE -->
                <div class="table-responsive border rounded-4 border-bottom-0">
                  <table class="table m-0">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Delivered Qty</th>
                        <th>Subtotal</th>
                        <th>Warehouse</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in purchaseInvoice.purchaseInvoiceItems" :key="item.id">
                        <td class="text-nowrap text-heading">{{ item.product?.name || 'Product Name' }}</td>
                        <td class="text-nowrap">{{ item.description || '-' }}</td>
                        <td>{{ formatRupiah(item.price) }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ item.deliveredQty }}</td>
                        <td>{{ formatRupiah(item.subtotal) }}</td>
                        <td>{{ item.warehouse?.name || 'Warehouse' }}</td>
                        <td>
                          <span v-if="item.isReturned" class="badge bg-danger">Returned</span>
                          <span v-else class="badge bg-success">Delivered</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- ✅ PAYMENT SUMMARY -->
                <div class="table-responsive">
                  <table class="table m-0 table-borderless">
                    <tbody>
                      <tr>
                        <td class="align-top px-0 py-6">
                          <p class="mb-1">
                            <span class="me-2 fw-medium text-heading">Description:</span><br>
                            <span>{{ purchaseInvoice.description || '-' }}</span>
                          </p>
                          <span>Thanks for your business</span>
                        </td>
                        <td class="pe-0 py-6 align-top" style="min-width: 170px;">
                          <div class="d-flex flex-column align-items-end gap-1" style="min-width: 170px;">
                            <div class="d-flex w-100 justify-content-between">
                              <span class="text-end" style="min-width: 90px;">Subtotal</span>
                              <span class="mx-2">:</span>
                            </div>
                            <div class="d-flex w-100 justify-content-between">
                              <span class="text-end" style="min-width: 90px;">Discount</span>
                              <span class="mx-2">:</span>
                            </div>
                            <div class="d-flex w-100 justify-content-between">
                              <span class="text-end" style="min-width: 90px;">Tax</span>
                              <span class="mx-2">:</span>
                            </div>
                            <div class="d-flex w-100 justify-content-between border-bottom pb-2">
                              <span class="text-end" style="min-width: 90px;">Total</span>
                              <span class="mx-2">:</span>
                            </div>
                            <div class="d-flex w-100 justify-content-between">
                              <span class="text-end" style="min-width: 90px;">Paid Amount</span>
                              <span class="mx-2">:</span>
                            </div>
                            <div class="d-flex w-100 justify-content-between pt-2">
                              <span class="text-end" style="min-width: 90px;">Remaining</span>
                              <span class="mx-2">:</span>
                            </div>
                          </div>
                        </td>
                        <td class="text-end px-0 py-6 align-top" style="min-width: 170px;">
                          <div class="d-flex flex-column gap-1 align-items-end" style="min-width: 170px;">
                            <span class="fw-medium mb-1" style="color: #6c757d;">{{ formatRupiah(subtotalAmount) }}</span>
                            <span class="fw-medium mb-1" style="color: #6c757d;">
                              {{ (typeof purchaseInvoice?.discountPercent === 'number' ? purchaseInvoice.discountPercent : Number(purchaseInvoice?.discountPercent) || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',00','') }}% ({{ formatRupiah(discountAmount) }})
                            </span>
                            <span class="fw-medium mb-1" style="color: #6c757d;">
                              {{ (typeof purchaseInvoice?.taxPercent === 'number' ? purchaseInvoice.taxPercent : Number(purchaseInvoice?.taxPercent) || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',00','') }}% ({{ formatRupiah(taxAmount) }})
                            </span>
                            <span class="fw-medium mb-1 border-bottom pb-2" style="color: #6c757d;">{{ formatRupiah(purchaseInvoice?.total || 0) }}</span>
                            <span class="fw-medium mb-1 text-success" style="color: #6c757d !important;">{{ formatRupiah(purchaseInvoice?.paidAmount || 0) }}</span>
                            <span class="fw-medium mb-0 pt-2"
                                  :class="(purchaseInvoice?.remainingAmount || 0) > 0 ? 'text-danger' : 'text-success'"
                                  :style="(purchaseInvoice?.remainingAmount || 0) > 0 ? 'color:#ea5455' : 'color:#28c76f'">
                              {{ formatRupiah(purchaseInvoice?.remainingAmount || 0) }}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
  
                <hr class="mt-0 mb-6" />
                
                <!-- ✅ RELATED PURCHASE ORDER INFO -->
                <div class="card-body p-0">
                  <div class="row">
                    <div class="col-12">
                      <h6>Related Purchase Order Information:</h6>
                      <div class="row">
                        <div class="col-md-6">
                          <div class="d-flex mb-1">
                            <span class="fw-medium" style="min-width: 120px; display: inline-block;">Purchase Order</span>
                            <span class="fw-medium me-1">:</span>
                            <span>{{ purchaseInvoice.purchaseOrder?.noPo || '-' }}</span>
                          </div>
                          <div class="d-flex mb-1">
                            <span class="fw-medium" style="min-width: 120px; display: inline-block;">Status</span>
                            <span class="fw-medium me-1">:</span>
                            <span :class="getStatusBadgeClass(purchaseInvoice.purchaseOrder?.status)" style="font-size: 0.7rem;">
                              {{ getStatusText(purchaseInvoice.purchaseOrder?.status) }}
                            </span>
                          </div>
                          <div class="d-flex mb-1">
                            <span class="fw-medium" style="min-width: 120px; display: inline-block;">Order Date</span>
                            <span class="fw-medium me-1">:</span>
                            <span>{{ formatDate(purchaseInvoice.purchaseOrder?.paymentDate) }}</span>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="d-flex mb-1">
                            <span class="fw-medium" style="min-width: 120px; display: inline-block;">Company</span>
                            <span class="fw-medium me-1">:</span>
                            <span>{{ purchaseInvoice.purchaseOrder?.perusahaan?.nmPerusahaan || '-' }}</span>
                          </div>
                          <div class="d-flex mb-1">
                            <span class="fw-medium" style="min-width: 120px; display: inline-block;">Branch</span>
                            <span class="fw-medium me-1">:</span>
                            <span>{{ purchaseInvoice.purchaseOrder?.cabang?.nmCabang || '-' }}</span>
                          </div>
                          <div class="d-flex mb-1">
                            <span class="fw-medium" style="min-width: 120px; display: inline-block;">Vendor</span>
                            <span class="fw-medium me-1">:</span>
                            <span>{{ purchaseInvoice.vendor?.name || '-' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- /Invoice -->
  
            <!-- Invoice Actions -->
            <div class="col-xl-3 col-md-4 col-12 invoice-actions">
              <div class="card">
                <div class="card-body">
                  <button class="btn btn-primary d-grid w-100 mb-4" @click="printPurchaseInvoice(purchaseInvoice?.id)" :disabled="!purchaseInvoice?.id">
                    <span class="d-flex align-items-center justify-content-center text-nowrap">
                      <i class="ri-printer-line ri-16px me-2"></i>Print Invoice
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <!-- /Invoice Actions -->
          </div>
        </template>
        <div v-else-if="error" class="text-center p-6">
          <div class="alert alert-danger" role="alert">
            <h5 class="alert-heading">Terjadi Kesalahan</h5>
            <p>{{ error.message || 'Gagal memuat detail Purchase Invoice.' }}</p>
            <hr>
            <button class="btn btn-outline-secondary" @click="$router.go(-1)">
              <i class="ri-arrow-left-line me-2"></i>Kembali
            </button>
          </div>
        </div>
        <div v-else-if="!loading && !purchaseInvoice" class="text-center p-6">
          <div class="alert alert-warning" role="alert">
            <h5 class="alert-heading">Purchase Invoice Tidak Ditemukan</h5>
            <p>Purchase Invoice yang Anda cari tidak ditemukan atau telah dihapus.</p>
            <hr>
            <button class="btn btn-outline-secondary" @click="$router.go(-1)">
              <i class="ri-arrow-left-line me-2"></i>Kembali
            </button>
          </div>
        </div>
      </div>
      <!-- / Content -->
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { usePurchaseInvoiceStore } from '~/stores/purchase-invoice'
  import { storeToRefs } from 'pinia'
  import Swal from 'sweetalert2'
  import { useDynamicTitle } from '~/composables/useDynamicTitle'
  
  // Composables
  const { setDetailTitle } = useDynamicTitle()
  
  const route = useRoute()
  const router = useRouter()
  const purchaseInvoiceStore = usePurchaseInvoiceStore()
  const formatRupiah = useFormatRupiah()
  
  const { loading, purchaseInvoice, error } = storeToRefs(purchaseInvoiceStore)
  
  const invoiceId = route.query.id
  
  // ✅ COMPUTED PROPERTIES untuk calculations
  const subtotalAmount = computed(() => {
    if (!purchaseInvoice.value?.purchaseInvoiceItems) return 0
    return purchaseInvoice.value.purchaseInvoiceItems.reduce((sum, item) => sum + Number(item.subtotal), 0)
  })
  
  const discountAmount = computed(() => {
    const subtotal = subtotalAmount.value
    const discountPercent = Number(purchaseInvoice.value?.discountPercent) || 0
    return subtotal * (discountPercent / 100)
  })
  
  const taxAmount = computed(() => {
    const subtotal = subtotalAmount.value
    const discount = discountAmount.value
    const afterDiscount = subtotal - discount
    const taxPercent = Number(purchaseInvoice.value?.taxPercent) || 0
    return afterDiscount * (taxPercent / 100)
  })
  
  // ✅ HELPER FUNCTIONS
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft': return 'badge bg-secondary'
      case 'approved': return 'badge bg-primary'
      case 'partial': return 'badge bg-warning'
      case 'delivered': return 'badge bg-success'
      case 'rejected': return 'badge bg-danger'
      case 'unpaid': return 'badge bg-danger'
      case 'paid': return 'badge bg-success'
      default: return 'badge bg-light'
    }
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'DRAFT'
      case 'approved': return 'APPROVED'
      case 'partial': return 'PARTIAL'
      case 'delivered': return 'DELIVERED'
      case 'rejected': return 'REJECTED'
      case 'unpaid': return 'UNPAID'
      case 'paid': return 'PAID'
      default: return 'UNKNOWN'
    }
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  
  // ✅ ACTION METHODS
  const printPurchaseInvoice = (id) => {
    if (!id) {
      console.error('❌ No purchaseInvoiceId provided for printingPurchase InvoiceId provided for printing')
      const toast = useToast()
      toast.error('ID Purchase Invoice tidak valid untuk print.')
      return
    }
    
    router.push({
      path: '/purchasing/cetak-invoice',
      query: { id: id, print: true }
    })
  }
  
  const downloadInvoice = () => {
    // Implement PDF download logic
  }
  
  const editInvoice = () => {
    // Navigate to edit page or open modal
  }
  
  const viewPurchaseOrder = () => {
    if (purchaseInvoice.value?.purchaseOrderId) {
      router.push({
        path: '/purchasing/purchase-order-detail',
        query: { id: purchaseInvoice.value.purchaseOrderId }
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Tersedia',
        text: 'Purchase Order ID tidak tersedia.',
        confirmButtonText: 'OK'
      })
    }
  }
  
  const addPayment = () => {
    // Implement payment logic
  }
  
  // ✅ FETCH INVOICE DETAILS menggunakan store
  async function fetchInvoiceDetails() {
    const invoiceIdToFetch = Array.isArray(invoiceId) ? invoiceId[0] : invoiceId
    
    if (typeof invoiceIdToFetch === 'string' && invoiceIdToFetch.trim() !== '') {
      try {
        await purchaseInvoiceStore.fetchInvoiceDetailWithItems(invoiceIdToFetch)
      } catch (error) {
        console.error('❌ Failed to fetch invoice details:', error)
        const toast = useToast()
        toast.error(`Tidak dapat memuat detail Purchase Invoice dengan ID: ${invoiceIdToFetch}. ${error.message || 'Silakan coba lagi.'}`)
      }
    } else {
      console.error('❌ Invalid invoiceId:', invoiceIdToFetch)
      const toast = useToast()
      toast.error('ID Purchase Invoice tidak valid atau kosong.')
    }
  }
  
  onMounted(() => {
    fetchInvoiceDetails()
  })
  
  // Watch untuk update title ketika data purchaseInvoice tersedia
  watch(() => purchaseInvoice.value, (newPurchaseInvoice) => {
    if (newPurchaseInvoice && newPurchaseInvoice.noInvoice) {
      setDetailTitle('Purchase Invoice', newPurchaseInvoice.noInvoice)
    }
  }, { immediate: true })
  </script>
  
  <style scoped>
  .invoice-preview-header {
    background-color: #F2F3F4;
  }
  
  .badge {
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  }
  
  .text-success {
    color: #28c76f !important;
  }
  
  .text-danger {
    color: #ea5455 !important;
  }
  
  .text-warning {
    color: #ff9f43 !important;
  }
  
  .table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  .table td {
    vertical-align: middle;
  }
  
  /* Print styles */
  @media print {
    .invoice-actions {
      display: none !important;
    }
    
    .card {
      border: none !important;
      box-shadow: none !important;
    }
  }
  </style>