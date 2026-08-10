import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'
import type { User } from './userManagement'
import type { Perusahaan } from './perusahaan'
import type { Cabang } from './cabang'
import type { Product } from './product'
import type { Customer, CustomerProduct } from './customer'

/** Template default untuk kolom description quotation baru (tetap bisa diedit user). Format HTML agar tampil benar di editor dan cetak. */
export const DEFAULT_QUOTATION_DESCRIPTION = [
  '1. Harga belum termasuk pajak.',
  '2. Jangka kontrak minimum 1 tahun.',
  '3. Layanan dukungan Network Operation Center (NOC) 24 x 7 dan didukung dengan dashboard monitoring untuk pelanggan.',
  '4. Kecepatan internet akan turun menjadi 1 MBPS download dan 0.5 MBPS upload ketika kuota prioritas habis.',
  '5. Penawaran harga diatas berlaku maksimal 7 hari dari penawaran harga yang dikeluarkan.',
  '6. Siklus penagihan mengikuti waktu dari starlink yaitu per tanggal 1 - 30 disetiap bulannya.',
  '7. Pembayaran dimuka sebelum perangkat dan layanan diterima.',
].map((line) => `<p>${line}</p>`).join('')

export interface QuotationItem {
  id             : string
  quotationId    : string
  productId      : number
  quantity       : number
  price          : number
  description    : string
  subtotal       : number
  createdAt      : string
  updatedAt      : string
  product?       : Product
}

export interface QuotationServiceItem {
  id?: number
  quotationId?: string
  unitId: number
  serviceId: number
  quantity: number
  price: number
  subtotal: number
  service?: { id: number; name: string; code?: string; price?: number }
  unit?: { id: number; symbol?: string; name?: string }
  terminalKitCount?: number | null
  quotaPriority?: number | null
  newServiceLine?: number | null
  additionalData?: number | null
}

export interface QuotationDidItem {
  id?: string
  quotationId?: string
  priceListLineId?: number | null
  quantity?: number | null
  price?: number | null
  subtotal?: number | null
  isPriceOverridden?: boolean | null
  priceListLine?: { id: number; price?: number; quantity?: number; priceList?: { name?: string }; product?: { name?: string }; service?: { name?: string }; did?: { name?: string; code?: string } }
}

export interface Quotation {
  id                 : string
  noQuotation        : string
  up                 : string
  siteInvestId       : string
  customerId         : number
  siteId             : number
  costCenterId       : number
  date               : string
  validUntil         : string
  status             : string
  termsOfPayment     : string
  serviceSubtotal?   : number | string
  productSubtotal?   : number | string
  didSubtotal?       : number | string
  total              : string | number
  grandTotal?        : number | string
  discountPercent    : number | string
  taxPercent         : number | string
  hasPph             : boolean
  pphPercent         : number | string
  dpPercent          : number | string
  slaGuarantee       : boolean
  support            : boolean
  performance        : boolean
  attachment         : string | null
  description        : string
  createdAt          : string
  updatedAt          : string
  createdBy          : number | null
  approvedBy         : number | null
  rejectedBy         : number | null
  approvedAt         : string | null
  rejectedAt         : string | null
  rejectReason?      : string | null
  reject_reason?     : string | null
  currentApprovalStep? : number | null
  submittedAt?       : string | null
  approvalLogs?      : Array<{ id: number; stepOrder: number; action: string; remarks?: string; user?: { fullName?: string }; createdAt?: string }>
  currentApprovers?  : Array<{ userId: number; fullName?: string; email?: string; source?: string }>
  customer?          : Customer
  siteInvest?        : { id: string; siNumber?: string; name?: string }
  site?              : { id: number; code?: string; name?: string }
  costCenter?        : { id: number; code?: string; name?: string }
  createdByUser?     : User
  approvedByUser?    : User
  quotationItems?    : QuotationItem[]
  quotationServices? : QuotationServiceItem[]
  quotationDids?     : QuotationDidItem[]
}

interface QuotationState {
  quotations  : Quotation[]
  quotation   : Quotation | null
  loading     : boolean
  saving      : boolean
  error       : any
  totalRecords: number
  params      : {
    first      : number
    rows       : number
    sortField  : string | null
    sortOrder  : number | null
    draw       : number
    search     : string
    customerId?: number | null
    status?    : string | null
  }
  form            : any,
  isEditMode      : boolean
  showModal       : boolean
  validationErrors: any[]
  customerProducts: CustomerProduct[]
  statistics      : {
    totalQuotations   : number
    approvedQuotations: number
    pendingQuotations : number
    rejectedQuotations: number
    totalValue        : number
  }
}

export const useQuotationStore = defineStore('quotation', {
  state: (): QuotationState => ({
    quotations: [],
    quotation : null,
    loading       : true,
    saving        : false,
    error         : null,
    totalRecords  : 0,
    params        : {
        first    : 0,
        rows     : 10,
        sortField: 'created_at',
        sortOrder: 2, // 2 = descending, 1 = ascending
        draw     : 1,
        search   : '',
        customerId : null,
        status   : null,
    },
    form: {
        noQuotation: '',
        up: '',
        siteInvestId: null,
        customerId: null,
        siteId: null,
        costCenterId: null,
        date: new Date().toISOString().split('T')[0], 
        validUntil: new Date().toISOString().split('T')[0], 
        termsOfPayment: 'postpaid',
        discountPercent: 0, 
        taxPercent: 0, 
        hasPph: false,
        pphPercent: 0,
        dpPercent: 0,
        slaGuarantee: false,
        support: false,
        performance: false,
        attachment: null,
        description: '',
        status: 'draft',
        quotationItems: [],
        quotationServices: [],
        quotationDids: [],
    },
    isEditMode      : false,
    showModal       : false,
    validationErrors: [],
    customerProducts: [],
    statistics      : {
        totalQuotations   : 0,
        approvedQuotations: 0,
        pendingQuotations : 0,
        rejectedQuotations: 0,
        totalValue        : 0
    },
  }),
  actions: {
    async fetchQuotations(suppressError = false) {
      const toast     = useToast();
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const url = new URL($api.quotation())
        const params = new URLSearchParams({
            page     : Math.floor((this.params.first / this.params.rows) + 1).toString(),
            rows     : Math.floor(this.params.rows).toString(),
            sortField: this.params.sortField || '',
            sortOrder: this.params.sortOrder?.toString() || '',
            draw     : this.params.draw.toString(),
            search   : this.params.search || '',
            includeItems: 'true', // Include quotationItems with product relation
        });

        if (this.params.customerId) {
            params.append('customerId', this.params.customerId.toString());
          }
          if (this.params.status) {
            params.append('status', this.params.status);
          }

        url.search = params.toString();

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Cookie-based auth
        })

        if (!response.ok) throw new Error('Gagal mengambil data quotation')

        const result = await response.json()
        
        this.quotations = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        console.error('Gagal mengambil data quotation:', e)
        this.error = e
        
        // Hanya tampilkan notifikasi error jika tidak di-suppress (untuk preload)
        if (!suppressError) {
          toast.error({
            title: 'Error',
            message: `Tidak dapat memuat data Quotation: ${e.message}`,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          });
        }
      } finally {
        this.loading = false
      }
    },

    async saveQuotation(options?: { navigateToList?: boolean }) {
      const toast     = useToast();
        this.saving = true;
        this.validationErrors = [];
        const { $api } = useNuxtApp();
        const userStore = useUserStore();

        try {
            const formData = new FormData()

            const dataToAppend = { ...this.form };
            dataToAppend.hasPph = !!dataToAppend.hasPph;
            dataToAppend.pphPercent = dataToAppend.hasPph ? (Number(dataToAppend.pphPercent) || 0) : 0;
            delete dataToAppend.quotationItems;
            delete dataToAppend.quotationServices;
            delete dataToAppend.quotationDids;
            delete dataToAppend.customer;
            delete dataToAppend.siteInvest;
            delete dataToAppend.site;
            delete dataToAppend.costCenter;
            delete dataToAppend.createdByUser;
            delete dataToAppend.approvedByUser;
            delete dataToAppend.receivedByUser;
            delete dataToAppend.rejectedByUser;
            delete dataToAppend.attachment;
            
            // Untuk create, hapus noQuotation karena di-generate di backend
            if (!this.isEditMode) {
                delete dataToAppend.noQuotation;
            }

            // Validasi: minimal 1 item produk ATAU 1 service ATAU 1 DID (DID: from SI = priceListLineId+quantity, custom = quantity+price)
            const hasItems = (this.form.quotationItems || []).some((i: any) => i.productId && i.quantity > 0);
            const hasServices = (this.form.quotationServices || []).some((s: any) => s.serviceId && s.quantity > 0);
            const hasDids = (this.form.quotationDids || []).some((d: any) =>
                (d.priceListLineId && (Number(d.quantity) || 0) > 0) || (!d.priceListLineId && (Number(d.quantity) || 0) > 0 && (d.price != null || Number(d.price) >= 0))
            );
            if (!hasItems && !hasServices && !hasDids) {
                throw new Error('Minimal harus ada 1 item produk, service, atau DID');
            }

            if (!dataToAppend.siteInvestId) {
                throw new Error('Site Investment harus dipilih');
            }
            if (!dataToAppend.customerId) {
                throw new Error('Customer harus dipilih');
            }
            if (!dataToAppend.siteId) {
                throw new Error('Site harus dipilih');
            }
            if (!dataToAppend.costCenterId) {
                throw new Error('Cost Center harus dipilih');
            }
            if (!dataToAppend.up || dataToAppend.up.trim() === '') {
                throw new Error('Untuk Perhatian harus diisi');
            }
            if (!dataToAppend.date) {
                throw new Error('Tanggal Quotation harus diisi');
            }
            if (!dataToAppend.status) {
                throw new Error('Status harus dipilih');
            }

            Object.keys(dataToAppend).forEach(key => {
                const value = dataToAppend[key];
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, value);
                }
            });

            if (this.form.attachment instanceof File) {
                formData.append('attachment', this.form.attachment);
            }

            if (!this.isEditMode && userStore.user && userStore.user.id) {
                formData.append('createdBy', userStore.user.id.toString())
                if(this.form.status === 'approved') {
                    formData.append('approvedBy', userStore.user.id.toString())
                }
                if(this.form.status === 'rejected') {
                    formData.append('rejectedBy', userStore.user.id.toString())
                }
            }
            const validItems = (this.form.quotationItems || []).filter((item: any) => 
                item.productId && item.quantity && item.quantity > 0 && item.price != null
            );
            const validServices = (this.form.quotationServices || []).filter((s: any) => 
                s.serviceId && s.unitId && s.quantity > 0 && s.price != null
            );
            const validDids = (this.form.quotationDids || []).filter((d: any) => {
                const qty = Number(d.quantity) || 0;
                const price = d.price != null ? Number(d.price) : null;
                if (d.priceListLineId && qty > 0 && (price != null || d.subtotal != null)) return true;
                if (!d.priceListLineId && qty > 0 && (price != null || Number(d.subtotal) >= 0)) return true;
                return false;
            });

            const servicesMissingUnit = (this.form.quotationServices || []).filter((s: any) => s.serviceId && (s.unitId == null || s.unitId === ''));
            if (servicesMissingUnit.length > 0) {
                throw new Error('Unit harus dipilih untuk setiap item di tab Services.');
            }

            if (validItems.length === 0 && validServices.length === 0 && validDids.length === 0) {
                throw new Error('Minimal harus ada 1 item produk, service, atau DID yang valid');
            }

            validItems.forEach((item: any, i: number) => {
                let pid = item.productId;
                try {
                  if (pid && typeof pid === 'object') pid = (pid as any).id ?? (pid as any).productId ?? (pid as any)[0] ?? null;
                  else if (pid && typeof pid === 'string' && pid.trim().startsWith('{')) {
                    const parsed = JSON.parse(pid);
                    pid = parsed.id ?? parsed.productId ?? null;
                  }
                } catch (_e) {}
                formData.append(`quotationItems[${i}][productId]`, String((Number(pid) || pid) ?? ''));
                formData.append(`quotationItems[${i}][quantity]`, String(item.quantity));
                formData.append(`quotationItems[${i}][price]`, String(item.price));
                formData.append(`quotationItems[${i}][subtotal]`, String(item.subtotal ?? (Number(item.quantity) || 0) * (Number(item.price) || 0)));
                formData.append(`quotationItems[${i}][isPriceOverridden]`, (item.isPriceOverridden === true || item.isPriceOverridden === 'true') ? 'true' : 'false');
                if (item.description !== undefined && item.description !== null) {
                  formData.append(`quotationItems[${i}][description]`, String(item.description));
                }
            });

            validServices.forEach((s: any, i: number) => {
                const sub = Number(s.subtotal) || (Number(s.quantity) || 0) * (Number(s.price) || 0);
                formData.append(`quotationServices[${i}][unitId]`, String(s.unitId));
                formData.append(`quotationServices[${i}][serviceId]`, String(s.serviceId));
                if (s.servicePlanId !== undefined && s.servicePlanId !== null && s.servicePlanId !== '') {
                  formData.append(`quotationServices[${i}][servicePlanId]`, String(s.servicePlanId));
                }
                formData.append(`quotationServices[${i}][quantity]`, String(s.quantity));
                formData.append(`quotationServices[${i}][price]`, String(s.price));
                formData.append(`quotationServices[${i}][subtotal]`, String(sub));
                formData.append(`quotationServices[${i}][isPriceOverridden]`, (s.isPriceOverridden === true || s.isPriceOverridden === 'true') ? 'true' : 'false');
                if (s.terminalKitCount != null && s.terminalKitCount !== '') formData.append(`quotationServices[${i}][terminalKitCount]`, String(s.terminalKitCount));
                if (s.quotaPriority != null && s.quotaPriority !== '') formData.append(`quotationServices[${i}][quotaPriority]`, String(s.quotaPriority));
                if (s.newServiceLine != null && s.newServiceLine !== '') formData.append(`quotationServices[${i}][newServiceLine]`, String(s.newServiceLine));
                if (s.additionalData != null && s.additionalData !== '') formData.append(`quotationServices[${i}][additionalData]`, String(s.additionalData));
            });

            validDids.forEach((d: any, i: number) => {
                const pllId = d.priceListLineId != null && d.priceListLineId !== '' ? Number(d.priceListLineId) : null;
                const qty = d.quantity != null && d.quantity !== '' ? Number(d.quantity) : null;
                const price = d.price != null && d.price !== '' ? Number(d.price) : null;
                const sub = d.subtotal != null && d.subtotal !== '' ? Number(d.subtotal) : (qty != null && price != null ? qty * price : null);
                formData.append(`quotationDids[${i}][priceListLineId]`, pllId != null ? String(pllId) : '');
                formData.append(`quotationDids[${i}][quantity]`, qty != null ? String(qty) : '');
                formData.append(`quotationDids[${i}][price]`, price != null ? String(price) : '');
                formData.append(`quotationDids[${i}][subtotal]`, sub != null ? String(sub) : '');
                formData.append(`quotationDids[${i}][isPriceOverridden]`, d.isPriceOverridden ? '1' : '0');
            });

            const method = 'POST';
            const url = this.isEditMode ? `${$api.quotation()}/${this.form.id}` : $api.quotation();
            
            // Kirim data ke API
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'include', // Cookie-based auth
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server Error Response:', errorData);
                if (response.status === 422) {
                    this.validationErrors = errorData.errors;
                     toast.error({
                      title: 'Error',
                      message: errorData.errors.map((e: any) => e.message).join('<br>'),
                      color: 'red',
                      position: 'bottomRight',
                      layout: 2,
                    });
                } else {
                    // Tampilkan detail error jika ada
                    let errorMessage = errorData.message || 'Gagal menyimpan data quotation';
                    if (errorData.error) {
                        // errorData.error bisa berupa string atau object
                        if (typeof errorData.error === 'string') {
                            errorMessage += `\nDetail: ${errorData.error}`;
                        } else if (errorData.error.message) {
                            errorMessage += `\nDetail: ${errorData.error.message}`;
                            if (errorData.error.constraint) {
                                errorMessage += `\nConstraint: ${errorData.error.constraint}`;
                            }
                        }
                    }
                    throw new Error(errorMessage);
                }
            } else {
                this.closeModal();
                await this.fetchQuotations();
                await this.fetchStatistics(); // Refresh statistik setelah save
                toast.success({
                  title: 'Success',
                  message: `Quotation berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`,
                  color: 'green',
                  position: 'bottomRight',
                  layout: 2,
                });
                if (options?.navigateToList) {
                  await navigateTo('/sales/quotation')
                }
            }


        } catch (error: any) {
            // Clear validation errors on new general error
            this.validationErrors = [];
            console.error('Save Quotation Error:', error);
            toast.error({
              title: 'Error',
              message: error.message || 'Operasi gagal',
              color: 'red',
              position: 'bottomRight',
              layout: 2,
            });
        } finally {
            this.saving = false;
        }
    },

    async deleteQuotation(id: string) {
      const toast     = useToast();
        this.loading = true;
        const { $api } = useNuxtApp();
  
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
  
        if (!result.isConfirmed) {
            this.loading = false;
            return false;
        }
  
        try {
            const response = await fetch(`${$api.quotation()}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Cookie-based auth
            });
  
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus Quotation');
            }
  
            await this.fetchQuotations();
            await this.fetchStatistics(); // Refresh statistik setelah delete
            toast.success({
              title   : 'Success',
              message : 'Quotation berhasil dihapus.',
              color   : 'green',
              position: 'bottomRight',
              layout  : 2,
            });
            return true;
        } catch (error: any) {
            toast.error({
              title   : 'Error',
              message : error.message || 'Gagal menghapus Quotation',
              color   : 'red',
              position: 'bottomRight',
              layout  : 2,
            });
            return false;
        } finally {
            this.loading = false;
        }
      },
    
    async approveQuotation(quotationId: string, remarks?: string, skipConfirm = false) {
      const toast     = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      if (!skipConfirm) {
        const result = await Swal.fire({
          title: 'Approve Quotation',
          text: 'Apakah Anda yakin akan menyetujui quotation ini?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Ya, Approve',
          cancelButtonText: 'Batal',
        });
        if (!result.isConfirmed) {
          this.loading = false;
          return false;
        }
      }
      try {
          const response = await fetch($api.approveQuotation(quotationId), {
              method: 'PATCH',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ remarks: remarks ?? undefined }),
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Gagal mengapprove quotation' }));
              throw new Error(errorData.message || 'Gagal mengapprove quotation');
          }

          await this.fetchQuotations();
          await this.fetchStatistics(); // Refresh statistik setelah approve
          toast.success({
            title: 'Success',
            message: 'Quotation berhasil diapprove.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          });
          return true;
      } catch (error: any) {
          console.error('Error approving quotation:', error);
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal mengapprove quotation.',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          });
          return false;
      } finally {
          this.loading = false;
      }
    },

    async rejectQuotation(quotationId: string, rejectReason?: string, skipConfirm = false) {
      const toast     = useToast();
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      let reason = rejectReason;
      if (!skipConfirm && reason === undefined) {
        const result = await Swal.fire({
          title: 'Reject Quotation',
          html: `
            <p class="mb-4" style="text-align: center;">Apakah Anda yakin akan menolak Quotation ini?</p>
            <div class="swal-reject-form" style="text-align: left; max-width: 100%;">
              <label for="swal-reject-reason" class="d-block mb-2 fw-medium" style="font-size: 0.9375rem;">Alasan penolakan <span class="text-danger">*</span></label>
              <textarea id="swal-reject-reason" class="form-control" rows="4" placeholder="Masukkan alasan penolakan..." style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d9dee3; border-radius: 0.375rem; resize: vertical; font-size: 0.9375rem;" required></textarea>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Ya, Reject',
          cancelButtonText: 'Batal',
          preConfirm: () => {
            const el = document.getElementById('swal-reject-reason') as HTMLTextAreaElement
            const val = el?.value?.trim() || ''
            if (!val) {
              Swal.showValidationMessage('Alasan penolakan wajib diisi')
              return false
            }
            return val
          },
        })
        if (!result.isConfirmed || typeof result.value !== 'string') {
          this.loading = false
          return false
        }
        reason = result.value
      }
      try {
          const response = await fetch($api.rejectQuotation(quotationId), {
              method: 'PATCH',
              headers: {
                  'Content-Type' : 'application/json',
                  'Accept'       : 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ reject_reason: reason || '' }),
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Gagal mereject quotation' }));
              throw new Error(errorData.message || 'Gagal mereject quotation');
          }

          await this.fetchQuotations();
          await this.fetchStatistics(); // Refresh statistik setelah reject
          toast.success({
            title: 'Success',
            message: 'Quotation berhasil direject.',
            color: 'green',
            position: 'bottomRight',
            layout: 2,
          });

          return true;
      } catch (error: any) {
          console.error('Error rejecting quotation:', error);
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal mereject quotation.',
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          });
          return false;
      } finally {
          this.loading = false;
      }
    },

    async submitQuotation(quotationId: string) {
      const toast = useToast();
      this.error = null;
      const { $api } = useNuxtApp();
      const result = await Swal.fire({
        title: 'Submit Quotation',
        text: 'Apakah Anda yakin akan mengirim quotation ini? Status akan berubah menjadi Pending.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Submit',
        cancelButtonText: 'Batal',
      });
      if (!result.isConfirmed) return false;
      try {
        const response = await fetch($api.submitQuotation(quotationId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal submit quotation' }));
          throw new Error(errorData.message || 'Gagal submit quotation');
        }

        await this.fetchQuotations();
        await this.fetchStatistics();
        toast.success({
          title: 'Success',
          message: 'Quotation berhasil di-submit (status: pending).',
          color: 'green',
          position: 'bottomRight',
          layout: 2,
        });

        return true;
      } catch (error: any) {
        console.error('Error submit quotation:', error);
        toast.error({
          title: 'Error',
          message: error.message || 'Gagal submit quotation.',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        });
        return false;
      }
    },

    openModal(quotationData: Quotation | null = null) {
        this.isEditMode = !!quotationData;
        this.validationErrors = [];

        if (quotationData) {
            const raw = JSON.parse(JSON.stringify(quotationData));
            // Relasi: pastikan dipakai bila API pakai snake_case key
            const siteInvest = raw.siteInvest ?? raw.site_invest;
            const site = raw.site;
            const costCenter = raw.costCenter ?? raw.cost_center;
            const customer = raw.customer;
            // Normalisasi: dukung snake_case dari API ke camelCase; fallback ID dari relasi
            const formData: { [key: string]: any } = {
                ...raw,
                siteInvestId: raw.siteInvestId ?? raw.site_invest_id ?? siteInvest?.id,
                customerId: raw.customerId ?? raw.customer_id ?? customer?.id,
                siteId: raw.siteId ?? raw.site_id ?? site?.id,
                costCenterId: raw.costCenterId ?? raw.cost_center_id ?? costCenter?.id,
                quotationItems: raw.quotationItems ?? raw.quotation_items ?? [],
                quotationServices: raw.quotationServices ?? raw.quotation_services ?? [],
                quotationDids: raw.quotationDids ?? raw.quotation_dids ?? [],
                siteInvest,
                site,
                costCenter,
                customer,
                up: raw.up ?? raw.untuk_perhatian ?? '',
                description: raw.description ?? raw.deskripsi ?? '',
                hasPph: raw.hasPph ?? raw.has_pph ?? false,
                pphPercent: Number(raw.pphPercent ?? raw.pph_percent ?? 0),
            };
            // Hapus duplikat snake_case agar tidak mengganggu
            delete formData.site_invest_id;
            delete formData.customer_id;
            delete formData.site_id;
            delete formData.cost_center_id;
            delete formData.quotation_items;
            delete formData.quotation_services;
            delete formData.quotation_dids;
            delete formData.site_invest;
            delete formData.cost_center;
            if (!formData.hasPph) {
                formData.pphPercent = 0;
            }

            // Normalisasi tiap quotationItems: productId
            formData.quotationItems = (formData.quotationItems || []).map((i: any) => ({
                ...i,
                productId: Number(i.productId ?? i.product_id) || null,
                quantity: Number(i.quantity) || 0,
                price: Number(i.price) || 0,
                subtotal: Number(i.subtotal) || (Number(i.quantity) || 0) * (Number(i.price) || 0),
                description: i.description ?? null,
                isPriceOverridden: i.isPriceOverridden ?? false,
                priceReason: i.priceReason ?? '',
                product: i.product ?? undefined,
            }));
            // Normalisasi tiap quotationServices: pertahankan subtotal dari API saat edit; jangan hitung ulang kecuali tidak ada
            formData.quotationServices = (formData.quotationServices || []).map((s: any) => {
                const bt = (s.billingType ?? s.billing_type ?? 'one_time') + '';
                const qty = Number(s.quantity) || 0;
                const price = Number(s.price) || 0;
                const tk = s.terminalKitCount ?? (s.terminal_kit_count != null ? Number(s.terminal_kit_count) : null);
                const qp = s.quotaPriority ?? (s.quota_priority != null ? Number(s.quota_priority) : null);
                const nsl = s.newServiceLine ?? (s.new_service_line != null ? Number(s.new_service_line) : null);
                const ad = s.additionalData ?? (s.additional_data != null ? Number(s.additional_data) : null);
                const effectivePrice = price + (tk != null ? Number(tk) : 0) + (qp != null ? Number(qp) : 0) + (nsl != null ? Number(nsl) : 0) + (ad != null ? Number(ad) : 0);
                const fromApiSubtotal = s.subtotal != null && s.subtotal !== '' ? Number(s.subtotal) : NaN;
                const subtotal = !Number.isNaN(fromApiSubtotal) && fromApiSubtotal >= 0
                    ? fromApiSubtotal
                    : (qty * effectivePrice);
                return {
                    ...s,
                    serviceId: s.serviceId ?? s.service_id,
                    unitId: s.unitId ?? s.unit_id,
                    quantity: qty,
                    price,
                    subtotal,
                    isPriceOverridden: s.isPriceOverridden ?? s.is_price_overridden ?? false,
                    priceReason: s.priceReason ?? s.price_reason ?? '',
                    billingType: bt,
                    billing_type: bt,
                    terminalKitCount: tk != null ? Number(tk) : null,
                    quotaPriority: qp != null ? Number(qp) : null,
                    newServiceLine: nsl != null ? Number(nsl) : null,
                    additionalData: ad != null ? Number(ad) : null,
                };
            });
            // Normalisasi quotationDids (semua field opsional)
            formData.quotationDids = (formData.quotationDids || []).map((d: any) => ({
                ...d,
                priceListLineId: d.priceListLineId ?? d.price_list_line_id ?? null,
                quantity: d.quantity != null && d.quantity !== '' ? Number(d.quantity) : null,
                price: d.price != null && d.price !== '' ? Number(d.price) : null,
                subtotal: d.subtotal != null && d.subtotal !== '' ? Number(d.subtotal) : null,
                isPriceOverridden: d.isPriceOverridden ?? d.is_price_overridden ?? false,
            }));

            const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : null;
            const dateFields = ['date', 'validUntil', 'approvedAt', 'rejectedAt'];
            dateFields.forEach(field => {
                if (formData[field]) {
                    formData[field] = formatDate(formData[field]);
                }
            });

            this.form = formData;

            this.syncCustomerProductsFromFormItems();

            if (!this.form.quotationItems || this.form.quotationItems.length === 0) {
                this.form.quotationItems = [];
                this.addItem();
            }
            if (!this.form.quotationServices || this.form.quotationServices.length === 0) {
                this.form.quotationServices = [];
                this.addServiceItem();
            }
            if (!this.form.quotationDids || this.form.quotationDids.length === 0) {
                this.form.quotationDids = [];
            }
            this.form.useDidFromSiteInvest = (this.form.quotationDids.length > 0 && this.form.quotationDids.every((d: any) => d.priceListLineId)) ? true : (this.form.quotationDids.length > 0 ? false : null);
            if (this.form.quotationDids.length === 0 && this.form.useDidFromSiteInvest === false) {
                this.addDidItem(true);
            }
            this.form.attachment = null;
            if (quotationData.attachment) {
                this.form.attachmentPreview = quotationData.attachment;
            }
            if (this.form.customerId) {
                this.fetchProductsForCustomer(this.form.customerId, { merge: true });
            }
        } else {
            this.form = {
                noQuotation: '',
                up: '',
                siteInvestId: null,
                customerId: null,
                siteId: null,
                costCenterId: null,
                date: new Date().toISOString().split('T')[0], 
                validUntil: new Date().toISOString().split('T')[0], 
                termsOfPayment: 'postpaid',
                discountPercent: 0, 
                taxPercent: 0, 
                hasPph: false,
                pphPercent: 0,
                dpPercent: 0,
                slaGuarantee: false,
                support: false,
                performance: false,
                attachment: null,
                description: DEFAULT_QUOTATION_DESCRIPTION,
                status: 'draft',
                quotationItems: [],
                quotationServices: [],
                quotationDids: [],
                useDidFromSiteInvest: null,
            };
            this.addItem();
            this.addServiceItem();
        }
        this.showModal = true;
    },

    closeModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.form = {
            noQuotation: '',
            up: '',
            siteInvestId: null,
            customerId: null,
            siteId: null,
            costCenterId: null,
            date: new Date().toISOString().split('T')[0], 
            validUntil: new Date().toISOString().split('T')[0], 
            termsOfPayment: 'postpaid',
            discountPercent: 0, 
            taxPercent: 0, 
            hasPph: false,
            pphPercent: 0,
            dpPercent: 0,
            slaGuarantee: false,
            support: false,
            performance: false,
            attachment: null,
            description: '',
            status: 'draft',
            quotationItems: [],
            quotationServices: [],
            quotationDids: [],
            useDidFromSiteInvest: null,
        };
        this.validationErrors = [];
    },

    normalizeCustomerProductOption(raw: any) {
      if (!raw) return null;
      if (raw.product) {
        const p = raw.product;
        const id = Number(p.id ?? raw.productId ?? raw.id);
        if (!id) return null;
        return {
          id,
          sku: p.sku ?? raw.sku ?? '',
          name: p.name ?? raw.name ?? '',
          noInterchange: p.noInterchange ?? raw.noInterchange ?? '',
          unit: p.unit ?? raw.unit ?? undefined,
          priceSell: raw.priceSell ?? p.priceSell ?? 0,
        };
      }
      const id = Number(raw.id ?? raw.productId);
      if (!id) return null;
      return {
        id,
        sku: raw.sku ?? '',
        name: raw.name ?? '',
        noInterchange: raw.noInterchange ?? '',
        unit: raw.unit ?? undefined,
        priceSell: raw.priceSell ?? 0,
      };
    },

    mergeCustomerProductOptions(extra: any[]) {
      const map = new Map<number, CustomerProduct>();
      for (const item of this.customerProducts || []) {
        const normalized = this.normalizeCustomerProductOption(item);
        if (normalized) map.set(normalized.id, normalized);
      }
      for (const item of extra || []) {
        const normalized = this.normalizeCustomerProductOption(item);
        if (normalized) {
          const existing = map.get(normalized.id);
          map.set(normalized.id, existing ? { ...existing, ...normalized } : normalized);
        }
      }
      this.customerProducts = [...map.values()];
    },

    syncCustomerProductsFromFormItems() {
      const extras = (this.form.quotationItems || [])
        .map((item: any) => {
          const id = Number(item.productId ?? item.product_id);
          if (!id) return null;
          const p = item.product;
          return {
            id,
            sku: p?.sku ?? item.sku ?? '',
            name: p?.name ?? item.name ?? '',
            noInterchange: p?.noInterchange ?? item.noInterchange ?? '',
            unit: p?.unit ?? undefined,
            priceSell: item.price ?? p?.priceSell ?? 0,
          };
        })
        .filter(Boolean);
      if (extras.length > 0) {
        this.mergeCustomerProductOptions(extras);
      }
    },

    addItem() {
        this.form.quotationItems.push({
            productId: null, quantity: 1, price: 0,
            description: '', subtotal: 0,
            isPriceOverridden: false,
            priceReason: '',
        });
    },

    removeItem(index: number) {
        this.form.quotationItems.splice(index, 1);
    },

    addServiceItem() {
        this.form.quotationServices = this.form.quotationServices || [];
        this.form.quotationServices.push({
            unitId: null,
            serviceId: null,
            servicePlanId: null,
            quantity: 1,
            price: 0,
            subtotal: 0,
            isPriceOverridden: false,
            priceReason: '',
            terminalKitCount: null,
            quotaPriority: null,
            newServiceLine: null,
            additionalData: null,
        });
    },

    removeServiceItem(index: number) {
        this.form.quotationServices.splice(index, 1);
    },

    addDidItem(useCustom = false) {
        this.form.quotationDids = this.form.quotationDids || [];
        this.form.quotationDids.push({
            priceListLineId: null,
            quantity: 1,
            price: 0,
            subtotal: 0,
            isPriceOverridden: useCustom,
        });
    },

    setUseDidFromSiteInvest(value: boolean) {
        this.form.useDidFromSiteInvest = value;
        if (value === false) {
            this.form.quotationDids = [{
                priceListLineId: null,
                quantity: 1,
                price: 0,
                subtotal: 0,
                isPriceOverridden: true,
            }];
        }
    },

    setQuotationDidsFromSiteInvest(dids: any[]) {
        this.form.quotationDids = (dids || []).map((d: any) => {
            const pllId = d.priceListLineId ?? d.price_list_line_id ?? d.priceListLine?.id ?? d.price_list_line?.id;
            const qty = Number(d.quantity) || 1;
            const price = Number(d.price) || 0;
            const sub = Number(d.subtotal) || qty * price;
            return {
                priceListLineId: pllId != null ? Number(pllId) : null,
                quantity: qty,
                price,
                subtotal: sub,
                isPriceOverridden: !!(d.isPriceOverridden ?? d.is_price_overridden),
                priceListLine: d.priceListLine ?? d.price_list_line,
            };
        });
        if (this.form.quotationDids.length === 0) {
            this.addDidItem(false);
        }
    },

    async applySiteInvestmentPrefill(siteInvestId: string) {
      const toast = useToast();
      const { $api } = useNuxtApp();
      if (!siteInvestId || siteInvestId === 'undefined' || siteInvestId === 'null') {
        return null;
      }

      try {
        const resData = await apiFetch($api.quotationPrefillFromSiteInvestment(siteInvestId), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });

        const data = resData?.data;
        if (!data) {
          throw new Error('Data prefill tidak valid');
        }

        this.form.customerId = data.customerId ?? null;
        this.form.siteId = data.siteId ?? null;
        this.form.costCenterId = data.costCenterId ?? null;

        const items = Array.isArray(data.quotationItems) ? data.quotationItems : [];
        const services = Array.isArray(data.quotationServices) ? data.quotationServices : [];
        const dids = Array.isArray(data.quotationDids) ? data.quotationDids : [];

        this.form.quotationItems = items.map((item: any) => ({
          productId: Number(item.productId ?? item.product_id) || null,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          subtotal: Number(item.subtotal) || (Number(item.quantity) || 1) * (Number(item.price) || 0),
          description: item.description ?? '',
          isPriceOverridden: !!(item.isPriceOverridden ?? item.is_price_overridden),
          priceReason: item.priceReason ?? item.price_reason ?? '',
          product: item.product ?? null,
        }));
        if (this.form.quotationItems.length === 0) {
          this.addItem();
        }

        this.syncCustomerProductsFromFormItems();

        this.form.quotationServices = services.map((s: any) => ({
          serviceId: s.serviceId ?? s.service_id ?? null,
          servicePlanId: s.servicePlanId ?? s.service_plan_id ?? null,
          unitId: s.unitId ?? s.unit_id ?? null,
          quantity: Number(s.quantity) || 1,
          price: Number(s.price) || 0,
          subtotal: Number(s.subtotal) || (Number(s.quantity) || 1) * (Number(s.price) || 0),
          isPriceOverridden: !!(s.isPriceOverridden ?? s.is_price_overridden),
          priceReason: s.priceReason ?? s.price_reason ?? '',
          terminalKitCount: s.terminalKitCount ?? s.terminal_kit_count ?? null,
          quotaPriority: s.quotaPriority ?? s.quota_priority ?? null,
          newServiceLine: s.newServiceLine ?? s.new_service_line ?? null,
          additionalData: s.additionalData ?? s.additional_data ?? null,
        }));
        if (this.form.quotationServices.length === 0) {
          this.addServiceItem();
        }

        this.setQuotationDidsFromSiteInvest(dids);
        this.form.useDidFromSiteInvest = dids.length > 0 && dids.every((d: any) => d.priceListLineId ?? d.price_list_line_id)
          ? true
          : (dids.length > 0 ? false : null);

        if (this.form.customerId) {
          await this.fetchProductsForCustomer(this.form.customerId, { merge: true });
          this.syncCustomerProductsFromFormItems();
        }

        return data;
      } catch (error: any) {
        console.error('applySiteInvestmentPrefill error:', error);
        toast.error({
          title: 'Error',
          message: error?.message || 'Gagal memuat data dari Site Investment',
          color: 'red',
          position: 'bottomRight',
          layout: 2,
        });
        return null;
      }
    },

    removeDidItem(index: number) {
        this.form.quotationDids.splice(index, 1);
    },

    setPagination(event: any) {
        this.params.first = Number(event.first) || 0;
        this.params.rows = Number(event.rows) || 10;
        this.fetchQuotations();
    },

    setSort(event: any) {
        this.params.sortField = event.sortField;
        this.params.sortOrder = event.sortOrder;
        this.fetchQuotations();
    },
        
    setSearch(value: string) {
        this.params.search = value;
        this.params.first = 0;
        this.fetchQuotations();
    },

    setFilters(filters: { customerId?: number | null, status?: string | null, search?: string }) {
        this.params.customerId = filters.customerId;
        this.params.status = filters.status;
        this.params.search = filters.search || '';
        this.params.first = 0; // reset pagination
        this.fetchQuotations();
    },

    async getQuotationDetails(quotationId: string) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      const tryUrl = (url: string) =>
        apiFetch(url, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });
      try {
        let resData: any = null;
        try {
          resData = await tryUrl($api.getQuotationDetails(quotationId));
        } catch (e: any) {
          const status = e?.response?.status ?? e?.statusCode ?? e?.status;
          if (status === 404) {
            resData = await tryUrl(`${$api.quotation()}/${quotationId}`);
          } else {
            throw e;
          }
        }

        if (resData && resData.data) {
          this.quotation = resData.data;
        } else {
          console.error('Invalid data structure received:', resData);
          throw new Error('Struktur data tidak valid diterima dari API quotation detail.');
        }
      } catch (e: any) {
        console.error('Error in getQuotationDetails:', e);
        console.error('Error details:', {
          message: e.message,
          status: e.status,
          statusText: e.statusText,
          data: e.data
        });
        this.error = e;
      } finally {
        this.loading = false;
      }
    },

    async fetchQuotationForEdit(quotationId: string) {
      const toast     = useToast();
        this.loading = true;
        this.error = null;
        const { $api } = useNuxtApp();
        
        try {
            const resData = await apiFetch(`${$api.quotation()}/${quotationId}`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include', // Cookie-based auth (apiFetch already handles this)
            });

            if (resData && resData.data) {

                // Panggil openModal dengan data lengkap
                this.openModal(resData.data);
                
                // ✅ NEW: Fetch products untuk customer jika ada customerId
                if (resData.data.customerId) {
                    this.fetchProductsForCustomer(resData.data.customerId, { merge: true });
                }
            } else {
                console.error('Invalid data structure received:', resData);
                throw new Error('Data tidak valid diterima dari API.');
            }
        } catch (e: any) {
            console.error('Error in fetchQuotationForEdit:', e);
            this.error = e;
            toast.error({
              title: 'Error',
              message: 'Gagal mengambil data quotation untuk edit',
              color: 'red',
              position: 'bottomRight',
              layout: 2,
            });
        } finally {
            this.loading = false;
        }
    },

    async fetchProductsForCustomer(customerId: number, options?: { merge?: boolean }) {
      this.loading = true;
      this.error = null;
      const { $api } = useNuxtApp();
      if (!customerId) {
        if (options?.merge) {
          this.syncCustomerProductsFromFormItems();
        } else {
          this.customerProducts = [];
        }
        this.loading = false;
        return;
      }
      try {
        const response = await fetch($api.customer() + '/' + customerId, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })
        if (!response.ok) throw new Error('Gagal mengambil data produk untuk customer')
        const result = await response.json()
        const rawCustomerProducts = result.data?.customerProducts || []
        
        const fetched = rawCustomerProducts
          .map((item: any) => this.normalizeCustomerProductOption(item))
          .filter(Boolean) as CustomerProduct[];

        if (options?.merge) {
          this.mergeCustomerProductOptions(fetched);
          this.syncCustomerProductsFromFormItems();
        } else {
          this.customerProducts = fetched;
        }
      } catch (error) {
        console.error('Error fetching products for customer:', error)
        const toast = useToast();
        toast.error({
          title: 'Error',
          message: 'Gagal memuat produk untuk customer yang dipilih.',
          color: 'red'
        });
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch total stock quantity for a product (for quotation modal stock check).
     * Returns { quantity: number } or null on error.
     */
    async fetchProductStock(productId: number): Promise<{ quantity: number } | null> {
      if (!productId || Number(productId) <= 0) return null
      const { $api } = useNuxtApp()
      const url = `${$api.getProductStock()}?productId=${encodeURIComponent(productId)}`
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) return null
        const data = await response.json()
        return data && typeof data.quantity === 'number' ? { quantity: data.quantity } : null
      } catch {
        return null
      }
    },

    async fetchAllQuotationsForExport() {
        const toast = useToast();
        const { $api } = useNuxtApp();
        try {
            // Buat URL dengan parameter yang sama seperti filter saat ini
            const url = new URL($api.quotation());
            const params = new URLSearchParams({
                page: '1',
                rows: '10000', // Ambil semua data
                sortField: this.params.sortField || 'created_at',
                sortOrder: this.params.sortOrder?.toString() || '2',
                draw: '1',
                search: this.params.search || '',
                includeItems: 'true',
            });

            // Tambahkan filter yang aktif
            if (this.params.customerId) {
                params.append('customerId', this.params.customerId.toString());
            }
            if (this.params.status) {
                params.append('status', this.params.status);
            }

            url.search = params.toString();

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data untuk export');
            }

            const result = await response.json();
            return Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            console.error('Error fetching all quotations for export:', error);
            toast.error({
                title: 'Error',
                message: 'Gagal mengambil data untuk export',
                color: 'red',
                position: 'bottomRight',
            });
            return [];
        }
    },

    async fetchStatistics() {
        const toast = useToast();
        this.error = null;
        const { $api } = useNuxtApp();
        
        try {
            const response = await fetch($api.quotation() + '/statistics', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Cookie-based auth
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil statistik quotation');
            }

            const result = await response.json();
            this.statistics = result.data;
            
        } catch (error: any) {
            console.error('Error fetching quotation statistics:', error);
            this.error = error;
            toast.error({
                title: 'Error',
                message: 'Gagal memuat statistik quotation',
                color: 'red',
                position: 'bottomRight',
                layout: 2,
            });
        }
    },
  }
})
