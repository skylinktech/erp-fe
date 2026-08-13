import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { normalizeFailedResponse } from '~/utils/apiError'
import { guardMakerCheckerAction, resolveCreatedBy } from '~/utils/makerChecker'

export interface JournalLine {
  id?: string
  accountId: string
  debit: number
  credit: number
  description?: string
  account?: any
}

export interface Journal {
  id?: string
  journalNumber: string
  date: string
  description: string
  status: 'draft' | 'posted' | 'reversed' | 'cancelled'
  reversalReason?: string | null
  referenceType?: string | null
  referenceId?: string | null
  createdBy?: number
  updatedBy?: number
  journalLines: JournalLine[]
  createdByUser?: any
  updatedByUser?: any
}

interface JournalState {
  journals: Journal[]
  selectedJournal: Journal | null
  loading: boolean
  loadingStats: boolean
  saving: boolean
  error: any
  totalRecords: number
  statistics: {
    total: number
    draft: number
    posted: number
    cancelled: number
    totalDebit: number
  }
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
    status: string
    startDate: string
    endDate: string
  }
  form: Partial<Journal>
  isEditMode: boolean
  showModal: boolean
  validationErrors: any[]
  journalTypes: { value: string; label: string }[]
  journalStatuses: { value: string; label: string }[]
  accounts: any[]
}

export const useJournalStore = defineStore('journal', {
  state: (): JournalState => ({
    journals: [],
    selectedJournal: null,
    loading: false,
    loadingStats: false,
    saving: false,
    error: null,
    totalRecords: 0,
    statistics: {
      total: 0,
      draft: 0,
      posted: 0,
      cancelled: 0,
      totalDebit: 0,
    },
    params: {
      first: 0,
      rows: 10,
      sortField: 'date',
      sortOrder: -1,
      search: '',
      status: '',
      startDate: '',
      endDate: '',
    },
    form: {
      journalNumber: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'draft',
      referenceType: null,
      referenceId: null,
      journalLines: []
    },
    isEditMode: false,
    showModal: false,
    validationErrors: [],
    journalTypes: [
      { value: 'manual', label: 'Manual' },
      { value: 'system', label: 'Sistem' },
      { value: 'adjustment', label: 'Penyesuaian' }
    ],
    journalStatuses: [
      { value: 'draft', label: 'Draft' },
      { value: 'posted', label: 'Posted' },
      { value: 'reversed', label: 'Reversed' },
      { value: 'cancelled', label: 'Dibatalkan' }
    ],
    accounts: []
  }),

  actions: {
    async fetchJournals() {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()
      try {
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          limit: Math.floor(this.params.rows).toString(), // Backend menggunakan 'limit', bukan 'rows'
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        });
        if (this.params.status) {
          params.set('status', this.params.status)
        }
        if (this.params.startDate) {
          params.set('startDate', this.params.startDate)
        }
        if (this.params.endDate) {
          params.set('endDate', this.params.endDate)
        }

        const response = await fetch(`${$api.journals()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data jurnal.' }));
          throw new Error(errorData?.message || 'Gagal memuat data jurnal.');
        }

        const result = await response.json()
        
        // Handle AdonisJS pagination structure
        if (result?.data && result.data?.data) {
          this.journals = result.data?.data || []
          this.totalRecords = result.data?.meta?.total || 0
        } else if (result?.data && Array.isArray(result.data)) {
          this.journals = result.data || []
          this.totalRecords = result?.meta?.total || result.data?.length || 0
        } else {
          this.journals = []
          this.totalRecords = 0
        }
      } catch (e: any) {
        console.error('Journal fetch error:', e) // Debug log
        this.error = e?.message || 'Terjadi kesalahan'
        const toast = useToast()        
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data jurnal: ${e?.message || 'Terjadi kesalahan'}`,
          color: 'red',
          position: 'bottomRight',
        });
      } finally {
        this.loading = false
      }
    },

    async fetchAccounts() {
      const { $api } = useNuxtApp()
      try {
        // Gunakan parameter yang sama seperti accountStore tetapi dengan rows yang lebih besar
        const params = new URLSearchParams({
          page: '1',
          limit: '10000', // Backend menggunakan 'limit', bukan 'rows'
          sortField: 'code',
          sortOrder: 'asc',
          search: '',
        });
        
        
        const response = await fetch(`${$api.accounts()}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include' // Cookie-based auth
        });

        
        if (response.ok) {
          const result = await response.json()
          
          // Backend mengembalikan { data: { data: [...], meta: {...} } }
          this.accounts = result?.data?.data || []
        } else {
          console.error('Accounts API error:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching accounts:', error)
      }
    },

    async saveJournal() {
      this.saving = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        // Validasi field required (status selalu draft di backend ù jangan kirim dari client)
        if (!this.form.date || !this.form.description) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Tanggal dan deskripsi wajib diisi',
            color: 'red',
            position: 'bottomRight',
          });
          this.saving = false
          return
        }

        // Validasi journal lines
        if (!this.form.journalLines || !Array.isArray(this.form.journalLines) || this.form.journalLines.length < 2) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Minimal 2 baris journal lines diperlukan',
            color: 'red',
            position: 'bottomRight',
          });
          this.saving = false
          return
        }

        // Validasi setiap journal line
        for (let i = 0; i < this.form.journalLines.length; i++) {
          const line = this.form.journalLines[i]
          if (!line.accountId) {
            const toast = useToast()
            toast.error({
              title: 'Error',
              message: `Baris ${i + 1}: Account harus dipilih`,
              color: 'red',
              position: 'bottomRight',
            });
            this.saving = false
            return
          }
        }

        // Validasi balance di frontend
        const totalDebit = this.form.journalLines.reduce((sum, line) => sum + (line.debit || 0), 0)
        const totalCredit = this.form.journalLines.reduce((sum, line) => sum + (line.credit || 0), 0)
        
        
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Total debit dan credit harus sama',
            color: 'red',
            position: 'bottomRight',
          });
          this.saving = false
          return
        }

        const formData = new FormData()
        
        // Jangan kirim `status` ù create/update selalu draft di backend; posting via /post
        const fieldsToSend = ['journalNumber', 'date', 'description', 'referenceType', 'referenceId'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });

        // Tambahkan createdBy dan updatedBy
        const userStore = useUserStore()
        if (userStore.user && userStore.user.id) {
          const userId = Number(userStore.user.id); // Convert to number as expected by backend
          
          if (this.isEditMode) {
            formData.append('updatedBy', String(userId));
            console.log('Added updatedBy:', userId);
            // Untuk edit mode, tetap kirim createdBy jika ada
            if (this.form.createdBy) {
              formData.append('createdBy', String(this.form.createdBy));
              console.log('Added createdBy (existing):', this.form.createdBy);
            }
          } else {
            formData.append('createdBy', String(userId));
            formData.append('updatedBy', String(userId)); // Backend memerlukan updatedBy untuk semua operasi
            console.log('Added createdBy and updatedBy:', userId);
          }
        } else {
          console.error('User not found or no user ID');
        }

        // Handle journal lines
        if (this.form.journalLines && Array.isArray(this.form.journalLines)) {
          console.log('Processing journal lines:', this.form.journalLines);
          this.form.journalLines.forEach((line, index) => {
            console.log(`Line ${index}:`, line);
            // Pastikan accountId tidak kosong
            if (line.accountId) {
              formData.append(`journalLines[${index}][accountId]`, String(line.accountId));
              formData.append(`journalLines[${index}][debit]`, String(line.debit || 0));
              formData.append(`journalLines[${index}][credit]`, String(line.credit || 0));
              if (line.description) {
                formData.append(`journalLines[${index}][description]`, line.description);
              }
              console.log(`Added line ${index} to FormData`);
            } else {
              console.warn(`Line ${index} has empty accountId, skipping`);
            }
          });
        } else {
          console.error('No journal lines found or not an array:', this.form.journalLines);
        }

        // Debug: Log semua formData yang akan dikirim
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }

        // Debug: Log form object untuk memastikan data lengkap
        console.log('Form object:', JSON.stringify(this.form, null, 2));

        let method = 'POST';
        let url = $api.journals();
        if (this.isEditMode && this.form.id) {
          url = `${$api.journals()}/${this.form.id}`;
          method = 'PUT';
        }
        
        console.log('Request method:', method, 'URL:', url);

        const response = await fetch(url, {
          method: method,
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Cookie-based auth
        })

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const err = await normalizeFailedResponse(
            response,
            this.isEditMode ? 'Jurnal gagal diperbarui.' : 'Jurnal gagal dibuat.'
          )
          this.validationErrors = err.fieldErrorList
          const toast = useToast()
          toast.error({
            title: err.type === 'validation' ? 'Validasi' : 'Error',
            message: err.message,
            color: 'red',
            position: 'bottomRight',
            layout: 2,
          })
          return false
        }
        
        this.closeModal();
        await Promise.all([this.fetchJournals(), this.fetchStatistics()]);
        const toast = useToast()        
        toast.success({
          title: 'Success',
          message: `Jurnal berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'bottomRight',
        });

      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          const toast = useToast()          
          toast.error({
            title: 'Error',
            message: error?.message || 'Operasi gagal',
            color: 'red',
            position: 'bottomRight',
          });
        }
      } finally {
        this.saving = false
      }
    },

    async deleteJournal(id: number) {
      const { $api } = useNuxtApp();
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data jurnal yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch(`${$api.journals()}/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Jurnal gagal dihapus.')
            throw new Error(err.message)
          }

          await Promise.all([this.fetchJournals(), this.fetchStatistics()]);
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Jurnal berhasil dihapus.',
            color: 'green',
            position: 'bottomRight',
          });
        } catch (error: any) {
          const toast = useToast()          
          toast.error({
            title: 'Error',
            message: error?.message || 'Gagal menghapus jurnal',
            color: 'red',
            position: 'bottomRight',
          });
        } finally {
          this.loading = false
        }
      }
    },

    async postJournal(id: number) {
      const { $api } = useNuxtApp();
      const journal = this.journals.find((j) => String(j.id) === String(id)) || this.selectedJournal
      if (!guardMakerCheckerAction(resolveCreatedBy(journal), 'post journal')) return

      const result = await Swal.fire({
        title: 'Post Jurnal?',
        text: "Apakah Anda yakin ingin memposting jurnal ini?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Post!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch($api.journalsPost(id), {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const err = await normalizeFailedResponse(response, 'Jurnal gagal diposting.')
            throw new Error(err.message)
          }

          await Promise.all([this.fetchJournals(), this.fetchStatistics()]);
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Jurnal berhasil diposting.',
            color: 'green',
            position: 'bottomRight',
          });
        } catch (error: any) {
          const toast = useToast()          
          toast.error({
            title: 'Error',
            message: error?.message || 'Gagal memposting jurnal',
            color: 'red',
            position: 'bottomRight',
          });
        } finally {
          this.loading = false
        }
      }
    },

    async submitJournal(id: number | string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.journalsSubmit(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Jurnal gagal disubmit.')
          throw new Error(err.message)
        }
        await this.fetchJournals()
        toast.success({
          title: 'Success',
          message: 'Jurnal di-submit untuk approval.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error?.message || 'Submit gagal',
          color: 'red',
          position: 'bottomRight',
        })
      }
    },

    async approveJournal(id: number | string, remarks?: string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.journalsApprove(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks }),
        })
        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Jurnal gagal disetujui.')
          throw new Error(err.message)
        }
        await this.fetchJournals()
        toast.success({
          title: 'Success',
          message: 'Jurnal di-approve.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error?.message || 'Approve gagal',
          color: 'red',
          position: 'bottomRight',
        })
      }
    },

    async rejectJournal(id: number | string, remarks?: string) {
      const { $api } = useNuxtApp()
      const toast = useToast()
      try {
        const response = await fetch($api.journalsReject(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ remarks: remarks || 'Rejected' }),
        })
        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Jurnal gagal ditolak.')
          throw new Error(err.message)
        }
        await this.fetchJournals()
        toast.success({
          title: 'Success',
          message: 'Jurnal di-reject.',
          color: 'green',
          position: 'bottomRight',
        })
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error?.message || 'Reject gagal',
          color: 'red',
          position: 'bottomRight',
        })
      }
    },

    async reverseJournal(id: number | string, reason?: string) {
      const { $api } = useNuxtApp();
      const toast = useToast();
      const journal = this.journals.find((j) => String(j.id) === String(id)) || this.selectedJournal
      if (!guardMakerCheckerAction(resolveCreatedBy(journal), 'reverse journal')) return false

      let reversalReason = reason;
      if (!reversalReason) {
        const result = await Swal.fire({
          title: 'Reverse Jurnal?',
          text: 'Jurnal posted hanya dapat dikoreksi melalui reversal. Masukkan alasan reverse.',
          input: 'textarea',
          inputLabel: 'Alasan reverse (wajib)',
          inputPlaceholder: 'Tulis alasan reverse...',
          inputValidator: (value) => (!value?.trim() ? 'Alasan reverse wajib diisi' : undefined),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Ya, Reverse!',
          cancelButtonText: 'Batal',
        });
        if (!result.isConfirmed) return false;
        reversalReason = String(result.value || '').trim();
      }

      try {
        const response = await fetch($api.journalsReverse(id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason: reversalReason }),
        });

        if (!response.ok) {
          const err = await normalizeFailedResponse(response, 'Jurnal gagal di-reverse.')
          throw new Error(err.message)
        }

        await Promise.all([this.fetchJournals(), this.fetchStatistics()]);
        toast.success({
          title: 'Success',
          message: 'Jurnal berhasil di-reverse.',
          color: 'green',
          position: 'bottomRight',
        });
        return true;
      } catch (error: any) {
        toast.error({
          title: 'Error',
          message: error?.message || 'Gagal mereverse jurnal',
          color: 'red',
          position: 'bottomRight',
        });
        return false;
      }
    },

    openModal(journal?: Journal) {
      this.isEditMode = !!journal;
      this.validationErrors = [];
      
      if (journal) {
        this.form = { ...journal };
      } else {
        this.form = {
          journalNumber: '', // Akan di-generate otomatis oleh backend
          date: new Date().toISOString().split('T')[0],
          description: '',
          status: 'draft',
          referenceType: null,
          referenceId: null,
          journalLines: [
            {
              accountId: '',
              debit: 0,
              credit: 0,
              description: ''
            },
            {
              accountId: '',
              debit: 0,
              credit: 0,
              description: ''
            }
          ]
        };
      }
      
      this.showModal = true;
      this.fetchAccounts();
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        journalNumber: '', // Akan di-generate otomatis oleh backend
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'draft',
        referenceType: null,
        referenceId: null,
        journalLines: [
          {
            accountId: '',
            debit: 0,
            credit: 0,
            description: ''
          },
          {
            accountId: '',
            debit: 0,
            credit: 0,
            description: ''
          }
        ]
      };
      this.validationErrors = [];
    },

    addJournalLine() {
      this.form.journalLines?.push({
        accountId: '',
        debit: 0,
        credit: 0,
        description: ''
      });
    },

    removeJournalLine(index: number) {
      this.form.journalLines?.splice(index, 1);
    },

    setPagination(event: any) {
      this.params.first = event.first;
      this.params.rows = event.rows;
      this.fetchJournals();
    },

    setSort(event: any) {
      this.params.sortField = event.sortField;
      this.params.sortOrder = event.sortOrder;
      this.fetchJournals();
    },

    setSearch(search: string) {
      this.params.search = search;
      this.params.first = 0;
      this.fetchJournals();
    },

    setFilter(key: 'status' | 'startDate' | 'endDate', value: string) {
      this.params[key] = value
      this.params.first = 0
      this.fetchJournals()
    },

    async fetchStatistics() {
      this.loadingStats = true
      const { $api } = useNuxtApp()
      try {
        // Global aggregates (Tax Master pattern) ù tidak ikut filter list
        const response = await fetch($api.journalEntriesSummary(), {
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = await response.json()
        const data = json?.data && typeof json.data === 'object' && !Array.isArray(json.data)
          ? json.data
          : json
        this.statistics = {
          total: Number(data.total ?? data.totalJournals ?? 0),
          draft: Number(data.draft ?? data.draftJournals ?? 0),
          posted: Number(data.posted ?? data.postedJournals ?? 0),
          cancelled: Number(data.cancelled ?? data.cancelledJournals ?? 0),
          totalDebit: Number(data.totalDebit ?? data.total_debit ?? 0),
        }
      } catch (error: any) {
        console.error('Error fetching journal statistics:', error)
      } finally {
        this.loadingStats = false
      }
    },
  }
})
