import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import Swal from 'sweetalert2'
import { apiFetch } from '~/utils/apiFetch'
import { normalizeApiError, toastNormalizedError } from '~/utils/apiError'
import {
  createEmptyHrCalendarForm,
  getHrCalendarColor,
  type HrCalendarEventRow,
  type HrCalendarFullCalendarEvent,
  type HrCalendarTipe,
} from '~/constants/hrd/hrCalendar'

interface HrCalendarState {
  events: HrCalendarFullCalendarEvent[]
  loading: boolean
  saving: boolean
  showModal: boolean
  isEditMode: boolean
  form: ReturnType<typeof createEmptyHrCalendarForm>
  validationErrors: string[]
  visibleRange: { start: string; end: string } | null
}

export const useHrCalendarStore = defineStore('hr-calendar', {
  state: (): HrCalendarState => ({
    events: [],
    loading: false,
    saving: false,
    showModal: false,
    isEditMode: false,
    form: createEmptyHrCalendarForm(),
    validationErrors: [],
    visibleRange: null,
  }),

  actions: {
    async fetchCalendarEvents(start: string, end: string) {
      const { $api } = useNuxtApp()
      this.loading = true
      this.visibleRange = { start, end }
      try {
        const params = new URLSearchParams({ start, end })
        const result = await apiFetch<{ events: HrCalendarFullCalendarEvent[] }>(
          `${$api.hrKalenderCalendar()}?${params.toString()}`,
          { credentials: 'include' }
        )
        this.events = result?.events ?? []
      } catch (error: any) {
        this.events = []
        useToast().error({
          title: 'Error',
          message: error.message || 'Gagal memuat kalender',
          color: 'red',
        })
      } finally {
        this.loading = false
      }
    },

    async refreshVisibleRange() {
      if (!this.visibleRange) return
      await this.fetchCalendarEvents(this.visibleRange.start, this.visibleRange.end)
    },

    openModalForDate(dateStr: string, tipe: HrCalendarTipe = 'libur_nasional') {
      this.isEditMode = false
      this.validationErrors = []
      this.form = {
        ...createEmptyHrCalendarForm(),
        tanggal_mulai: dateStr,
        tanggal_selesai: dateStr,
        tipe,
        warna: getHrCalendarColor(tipe),
      }
      this.showModal = true
    },

    openModalForEvent(event: HrCalendarFullCalendarEvent) {
      const props = event.extendedProps
      this.isEditMode = true
      this.validationErrors = []
      this.form = {
        id: props.rawId,
        nama: event.title,
        tanggal_mulai: props.tanggal_mulai,
        tanggal_selesai: props.tanggal_selesai,
        tipe: props.tipe,
        deskripsi: props.deskripsi ?? '',
        warna: props.warna ?? getHrCalendarColor(props.tipe),
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.isEditMode = false
      this.validationErrors = []
      this.form = createEmptyHrCalendarForm()
    },

    async saveEvent(): Promise<boolean> {
      const toast = useToast()
      const { $api } = useNuxtApp()
      this.saving = true
      this.validationErrors = []

      const nama = this.form.nama.trim()
      if (!nama) {
        this.validationErrors = ['Nama event wajib diisi']
        this.saving = false
        return false
      }
      if (!this.form.tanggal_mulai) {
        this.validationErrors = ['Tanggal mulai wajib diisi']
        this.saving = false
        return false
      }

      const body = {
        nama,
        tanggal_mulai: this.form.tanggal_mulai,
        tanggal_selesai: this.form.tanggal_selesai || this.form.tanggal_mulai,
        tipe: this.form.tipe,
        deskripsi: this.form.deskripsi?.trim() || null,
        warna: this.form.warna?.trim() || null,
      }

      try {
        const url =
          this.isEditMode && this.form.id
            ? $api.hrKalenderShow(this.form.id)
            : $api.hrKalender()
        const method = this.isEditMode ? 'PUT' : 'POST'

        const res = await apiFetch<{
          message?: string
          data?: HrCalendarEventRow
          cuti_bersama?: { pegawaiCount: number; totalHari: number } | null
        }>(url, {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        })

        let successMessage = this.isEditMode ? 'Event diperbarui' : 'Event ditambahkan'
        if (res?.cuti_bersama && body.tipe === 'cuti_bersama') {
          const { pegawaiCount, totalHari } = res.cuti_bersama
          successMessage += `. Cuti tahunan ${pegawaiCount} pegawai dipotong (${totalHari} hari total).`
        }

        toast.success({
          title: 'Berhasil',
          message: successMessage,
          color: 'green',
        })

        this.closeModal()
        await this.refreshVisibleRange()
        return true
      } catch (error: any) {
        const err = normalizeApiError(error, 'Event Kalender gagal disimpan.')
        this.validationErrors = err.fieldErrorList
        toastNormalizedError(err)
        return false
      } finally {
        this.saving = false
      }
    },

    async deleteEvent(id: number): Promise<boolean> {
      const { $api } = useNuxtApp()
      const result = await Swal.fire({
        title: 'Hapus event?',
        text: 'Data yang dihapus tidak dapat dikembalikan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, hapus',
        cancelButtonText: 'Batal',
      })

      if (!result.isConfirmed) return false

      try {
        await apiFetch($api.hrKalenderShow(id), {
          method: 'DELETE',
          credentials: 'include',
        })
        useToast().success({
          title: 'Berhasil',
          message: 'Event dihapus',
          color: 'green',
        })
        this.closeModal()
        await this.refreshVisibleRange()
        return true
      } catch (error: any) {
        const err = normalizeApiError(error, 'Event Kalender gagal dihapus.')
        toastNormalizedError(err)
        return false
      }
    },
  },
})

export type { HrCalendarEventRow, HrCalendarFullCalendarEvent }
