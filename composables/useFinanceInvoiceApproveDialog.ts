import Swal from 'sweetalert2'

export type FinanceInvoiceApproveChoice = {
  remarks: string
  ttdDigital: boolean
}

/**
 * Dialog approve Finance Invoice: catatan + pilihan QR/TTD digital.
 * Return null jika dibatalkan.
 */
export async function promptFinanceInvoiceApprove(
  defaults: { ttdDigital?: boolean } = {}
): Promise<FinanceInvoiceApproveChoice | null> {
  const defaultChecked = defaults.ttdDigital !== false

  const result = await Swal.fire({
    title: 'Approve Invoice',
    html: `
      <div class="text-start">
        <label class="form-label" for="swal-fi-approve-remarks">Catatan (opsional)</label>
        <textarea
          id="swal-fi-approve-remarks"
          class="form-control"
          rows="3"
          placeholder="Tulis catatan approval jika diperlukan..."
        ></textarea>
        <div class="form-check mt-3">
          <input
            class="form-check-input"
            type="checkbox"
            id="swal-fi-approve-ttd"
            ${defaultChecked ? 'checked' : ''}
          />
          <label class="form-check-label" for="swal-fi-approve-ttd">
            Gunakan QR / TTD digital pada cetak invoice
          </label>
        </div>
        <div class="form-text">
          Jika dicentang, QR code tanda tangan digital akan tampil di halaman cetak.
          Jika tidak, area tanda tangan pada cetak dikosongkan.
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'Batal',
    focusConfirm: false,
    preConfirm: () => {
      const remarksEl = document.getElementById('swal-fi-approve-remarks') as HTMLTextAreaElement | null
      const ttdEl = document.getElementById('swal-fi-approve-ttd') as HTMLInputElement | null
      return {
        remarks: remarksEl?.value?.trim() || '',
        ttdDigital: !!ttdEl?.checked,
      } satisfies FinanceInvoiceApproveChoice
    },
  })

  if (!result.isConfirmed || !result.value) return null
  return result.value as FinanceInvoiceApproveChoice
}
