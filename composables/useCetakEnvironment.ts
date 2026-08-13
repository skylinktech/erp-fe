import { type PrintOrientation, type PrintPaper } from '~/constants/print/documents'

const CETAK_PAPER_KEY = 'cetak-print-paper'
const CETAK_ORIENTATION_KEY = 'cetak-print-orientation'

export function useCetakPaper() {
  return useState<PrintPaper>(CETAK_PAPER_KEY, () => 'A4')
}

export function useCetakOrientation() {
  return useState<PrintOrientation>(CETAK_ORIENTATION_KEY, () => 'portrait')
}
