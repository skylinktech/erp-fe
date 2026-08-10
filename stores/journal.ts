import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

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
  status: 'draft' | 'posted' | 'cancelled'
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
  saving: boolean
  error: any
  totalRecords: number
  params: {
    first: number
    rows: number
    sortField: string | null
    sortOrder: number | null
    search: string
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
    saving: false,
    error: null,
    totalRecords: 0,
    params: {
      first: 0,
      rows: 10,
      sortField: 'date',
      sortOrder: -1,
      search: '',
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
        // Validasi field required
        if (!this.form.journalNumber || !this.form.date || !this.form.description || !this.form.status) {
          const toast = useToast()
          toast.error({
            title: 'Error',
            message: 'Semua field wajib diisi',
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
        
        const fieldsToSend = ['journalNumber', 'date', 'description', 'status', 'referenceType', 'referenceId'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          } else {
            console.warn(`Field ${key} is null, undefined, or empty`);
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

        let result;
        try {
          result = await response.json();
          console.log('Response result:', result);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          const responseText = await response.text();
          console.error('Raw response:', responseText);
          throw new Error('Server response tidak valid');
        }

        if (!response.ok) {
          console.error('Response not OK:', response.status, result);
          if (response.status === 422 && result?.errors) {
            console.error('Validation errors:', result.errors);
            this.validationErrors = Object.values(result.errors || {}).flat();
            return;
          }
          throw new Error(result?.message || 'Gagal menyimpan data jurnal');
        }
        
        this.closeModal();
        await this.fetchJournals();
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
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus jurnal.' }));
            throw new Error(errorData?.message || 'Gagal menghapus jurnal.');
          }

          await this.fetchJournals();
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
          const response = await fetch(`${$api.journals()}/${id}/post`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include' // Cookie-based auth
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memposting jurnal.' }));
            throw new Error(errorData?.message || 'Gagal memposting jurnal.');
          }

          await this.fetchJournals();
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
    }
  }
})
