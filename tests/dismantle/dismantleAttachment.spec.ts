import { describe, expect, it } from 'vitest'
import { normalizeAttachment } from '~/utils/dismantleAdapter'
import {
  dismantleAttachmentErrorLabel,
  validateAttachmentFileClient,
} from '~/utils/dismantleAttachmentLabels'
import { getDismantleIdempotencyKey, clearDismantleIdempotencyKey } from '~/utils/dismantleIdempotency'

describe('dismantle attachment adapter', () => {
  it('normalizes attachment payload with capabilities', () => {
    const row = normalizeAttachment({
      id: 'a1',
      dismantle_request_id: 'r1',
      attachment_type: 'CUSTOMER_REQUEST',
      status: 'ACTIVE',
      original_file_name: 'doc.pdf',
      mime_type: 'application/pdf',
      file_size: 1024,
      capabilities: { canDownload: true, canPreview: true },
    })
    expect(row.id).toBe('a1')
    expect(row.capabilities?.canDownload).toBe(true)
  })
})

describe('dismantle attachment client validation', () => {
  it('rejects oversize file', () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' })
    expect(validateAttachmentFileClient(file, 10)).toMatch(/maksimal/)
  })

  it('maps error codes to Indonesian labels', () => {
    expect(dismantleAttachmentErrorLabel('DISMANTLE_ATTACHMENT_MIME_INVALID')).toContain('PDF')
  })
})

describe('attachment idempotency key', () => {
  it('reuses key for same intent and clears after success', () => {
    const intent = 'upload:test'
    const k1 = getDismantleIdempotencyKey(intent)
    const k2 = getDismantleIdempotencyKey(intent)
    expect(k1).toBe(k2)
    clearDismantleIdempotencyKey(intent)
    const k3 = getDismantleIdempotencyKey(intent)
    expect(k3).not.toBe(k1)
  })
})
