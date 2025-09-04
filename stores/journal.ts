import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'

export interface JournalLine {
  id?: number
  account_id: number
  debit: number
  credit: number
  description?: string
  account?: any
}

export interface Journal {
  id?: number
  reference_number: string
  date: string
  description: string
  type: 'manual' | 'system' | 'adjustment'
  status: 'draft' | 'posted' | 'cancelled'
  total_debit: number
  total_credit: number
  notes?: string
  created_by?: number
  posted_by?: number
  posted_at?: string
  journal_lines: JournalLine[]
  created_by_user?: any
  posted_by_user?: any
}

interface JournalState {
  journals: Journal[]
  selectedJournal: Journal | null
  loading: boolean
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
      reference_number: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'manual',
      status: 'draft',
      total_debit: 0,
      total_credit: 0,
      notes: '',
      journal_lines: []
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
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: Math.floor((this.params.first / this.params.rows) + 1).toString(),
          rows: Math.floor(this.params.rows).toString(),
          sortField: this.params.sortField || '',
          sortOrder: (this.params.sortOrder || 1) > 0 ? 'asc' : 'desc',
          search: this.params.search || '',
        });

        const response = await fetch(`${$api.journalEntries()}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data jurnal.' }));
          throw new Error(errorData.message || 'Gagal memuat data jurnal.');
        }

        const result = await response.json()
        this.journals = result.data
        this.totalRecords = result.meta.total
      } catch (e: any) {
        this.error = e.message
        const toast = useToast()        
        toast.error({
          title: 'Error',
          message: `Tidak dapat memuat data jurnal: ${e.message}`,
          color: 'red',
          position: 'topRight',
        });
      } finally {
        this.loading = false
      }
    },

    async fetchAccounts() {
      const { $api } = useNuxtApp()
      try {
        const token = localStorage.getItem('token');
        const response = await fetch($api.accounts(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json()
          this.accounts = result.data
        }
      } catch (error) {
        console.error('Error fetching accounts:', error)
      }
    },

    async saveJournal() {
      this.loading = true
      this.validationErrors = [];
      const { $api } = useNuxtApp()

      try {
        const token = localStorage.getItem('token')

        const formData = new FormData()
        
        const fieldsToSend = ['reference_number', 'date', 'description', 'type', 'status', 'total_debit', 'total_credit', 'notes'];
        fieldsToSend.forEach(key => {
          const value = this.form[key as keyof typeof this.form];
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        // Handle journal lines
        if (this.form.journal_lines && Array.isArray(this.form.journal_lines)) {
          this.form.journal_lines.forEach((line, index) => {
            formData.append(`journal_lines[${index}][account_id]`, String(line.account_id));
            formData.append(`journal_lines[${index}][debit]`, String(line.debit || 0));
            formData.append(`journal_lines[${index}][credit]`, String(line.credit || 0));
            if (line.description) {
              formData.append(`journal_lines[${index}][description]`, line.description);
            }
          });
        }

        let method = 'POST';
        let url = $api.journalEntriesStore();
        if (this.isEditMode && this.form.id) {
          url = $api.journalEntriesUpdate(this.form.id);
          method = 'PUT';
        }

        const response = await fetch(url, {
          method: method,
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        })

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error('Server response tidak valid');
        }

        if (!response.ok) {
          if (response.status === 422 && result.errors) {
            this.validationErrors = Object.values(result.errors).flat();
            return;
          }
          throw new Error(result.message || 'Gagal menyimpan data jurnal');
        }
        
        this.closeModal();
        await this.fetchJournals();
        const toast = useToast()        
        toast.success({
          title: 'Success',
          message: `Jurnal berhasil ${this.isEditMode ? 'diperbarui' : 'disimpan'}.`,
          color: 'green',
          position: 'topRight',
        });

      } catch (error: any) {
        if (this.validationErrors.length === 0) {
          const toast = useToast()          
          toast.error({
            title: 'Error',
            message: error.message || 'Operasi gagal',
            color: 'red',
            position: 'topRight',
          });
        }
      } finally {
        this.loading = false
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
          const token = localStorage.getItem('token');
          const response = await fetch($api.journalEntriesDelete(id), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus jurnal.' }));
            throw new Error(errorData.message || 'Gagal menghapus jurnal.');
          }

          await this.fetchJournals();
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Jurnal berhasil dihapus.',
            color: 'green',
            position: 'topRight',
          });
        } catch (error: any) {
          const toast = useToast()          
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal menghapus jurnal',
            color: 'red',
            position: 'topRight',
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
          const token = localStorage.getItem('token');
          const response = await fetch(`${$api.journalEntries()}/post/${id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Gagal memposting jurnal.' }));
            throw new Error(errorData.message || 'Gagal memposting jurnal.');
          }

          await this.fetchJournals();
          const toast = useToast()          
          toast.success({
            title: 'Success',
            message: 'Jurnal berhasil diposting.',
            color: 'green',
            position: 'topRight',
          });
        } catch (error: any) {
          const toast = useToast()          
          toast.error({
            title: 'Error',
            message: error.message || 'Gagal memposting jurnal',
            color: 'red',
            position: 'topRight',
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
          reference_number: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          type: 'manual',
          status: 'draft',
          total_debit: 0,
          total_credit: 0,
          notes: '',
          journal_lines: []
        };
      }
      
      this.showModal = true;
      this.fetchAccounts();
    },

    closeModal() {
      this.showModal = false;
      this.isEditMode = false;
      this.form = {
        reference_number: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'manual',
        status: 'draft',
        total_debit: 0,
        total_credit: 0,
        notes: '',
        journal_lines: []
      };
      this.validationErrors = [];
    },

    addJournalLine() {
      this.form.journal_lines?.push({
        account_id: 0,
        debit: 0,
        credit: 0,
        description: ''
      });
    },

    removeJournalLine(index: number) {
      this.form.journal_lines?.splice(index, 1);
      this.calculateTotals();
    },

    calculateTotals() {
      const totalDebit = this.form.journal_lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
      const totalCredit = this.form.journal_lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
      
      this.form.total_debit = totalDebit;
      this.form.total_credit = totalCredit;
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
