type PurchaseOrderPdfInput = {
  noPo?: string | null
  no_po?: string | null
  date?: string | Date | null
  dueDate?: string | Date | null
  termOfPayment?: string | null
  up?: string | null
  description?: string | null
  status?: string | null
  discountPercent?: number | string | null
  taxPercent?: number | string | null
  total?: number | string | null
  vendor?: { name?: string | null; address?: string | null; phone?: string | null; email?: string | null } | null
  perusahaan?: { nmPerusahaan?: string | null; alamatPerusahaan?: string | null } | null
  department?: { nmDepartemen?: string | null; nm_departemen?: string | null } | null
  budget?: { budgetCode?: string | null; budget_code?: string | null; budgetName?: string | null; budget_name?: string | null } | null
  purchaseOrderItems?: Array<{
    product?: { name?: string | null; sku?: string | null } | null
    description?: string | null
    quantity?: number | string | null
    price?: number | string | null
    subtotal?: number | string | null
  }> | null
}

function formatDateId(value: string | Date | null | undefined): string {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return String(value)
  }
}

function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value)
  if (!Number.isFinite(num)) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_') || 'purchase-order'
}

function pickText(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (value && String(value).trim()) return String(value).trim()
  }
  return '-'
}

export async function exportPurchaseOrderPdf(po: PurchaseOrderPdfInput): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF('portrait', 'mm', 'a4')
  const noPo = pickText(po.noPo, po.no_po, 'PO')
  const items = Array.isArray(po.purchaseOrderItems) ? po.purchaseOrderItems : []

  doc.setFontSize(16)
  doc.text('Purchase Order', 14, 16)
  doc.setFontSize(10)
  doc.text(`No. PO: ${noPo}`, 14, 24)
  doc.text(`Status: ${String(po.status || '-').toUpperCase()}`, 14, 30)
  doc.text(`Tanggal: ${formatDateId(po.date)}`, 14, 36)
  doc.text(`Jatuh Tempo: ${formatDateId(po.dueDate)}`, 14, 42)
  doc.text(`Term Of Payment: ${pickText(po.termOfPayment)}`, 14, 48)

  doc.text('Vendor:', 14, 58)
  doc.text(pickText(po.vendor?.name), 14, 64)
  doc.text(pickText(po.vendor?.address), 14, 70)

  doc.text('Perusahaan:', 110, 58)
  doc.text(pickText(po.perusahaan?.nmPerusahaan), 110, 64)
  doc.text(pickText(po.perusahaan?.alamatPerusahaan), 110, 70)

  autoTable(doc, {
    startY: 78,
    head: [['No', 'Produk', 'SKU', 'Deskripsi', 'Qty', 'Harga', 'Subtotal']],
    body: items.length
      ? items.map((item, index) => [
          String(index + 1),
          pickText(item.product?.name),
          pickText(item.product?.sku),
          pickText(item.description),
          String(Math.floor(Number(item.quantity) || 0)),
          formatCurrency(item.price),
          formatCurrency(item.subtotal),
        ])
      : [['-', 'Tidak ada item', '-', '-', '-', '-', '-']],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [33, 37, 41] },
  })

  const finalY = (doc as any).lastAutoTable?.finalY ?? 90
  let y = finalY + 8

  const subtotal = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
  const discountPercent = Number(po.discountPercent) || 0
  const taxPercent = Number(po.taxPercent) || 0
  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (taxPercent / 100)
  const grandTotal = Number(po.total) || afterDiscount + taxAmount

  doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, y)
  y += 6
  doc.text(`Discount (${discountPercent}%): ${formatCurrency(discountAmount)}`, 140, y)
  y += 6
  doc.text(`Tax (${taxPercent}%): ${formatCurrency(taxAmount)}`, 140, y)
  y += 6
  doc.setFont(undefined, 'bold')
  doc.text(`Total: ${formatCurrency(grandTotal)}`, 140, y)
  doc.setFont(undefined, 'normal')

  if (po.description) {
    y += 10
    doc.text('Catatan:', 14, y)
    y += 6
    doc.text(String(po.description).slice(0, 500), 14, y, { maxWidth: 180 })
  }

  doc.save(`${sanitizeFilename(noPo)}.pdf`)
}
