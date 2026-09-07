import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  mapRecipientToFeedItem,
  getNotificationNavigationPath,
} from '~/utils/notificationFeed'

describe('notification feed mapper', () => {
  it('prefers rendered snapshot over reconstructed copy', () => {
    const item = mapRecipientToFeedItem({
      id: 12,
      is_read: false,
      title: 'Site Investment disetujui',
      message: 'Site Investment SI-001 telah disetujui oleh Approver A.',
      deep_link: '/sales/site-investment/detail/abc',
      recipient_type: 'MAKER',
      contributes_to_unread_count: true,
      notification: {
        type: 'site_investment',
        event: 'approved',
        payload: { id: 'abc', siNumber: 'SI-001', createdByName: 'Staff' },
        created_at: '2026-09-02T00:00:00.000Z',
      },
    })
    expect(item.title).toBe('Site Investment disetujui')
    expect(item.subtitle).toContain('telah disetujui oleh Approver A')
    expect(getNotificationNavigationPath(item)).toBe('/sales/site-investment/detail/abc')
  })

  it('does not treat informational items as inbox increments', () => {
    const item = mapRecipientToFeedItem({
      id: 13,
      is_read: false,
      contributes_to_unread_count: false,
      notification: {
        type: 'site_investment',
        event: 'cancelled',
        payload: { id: 'abc' },
      },
    })
    expect(item.contributesToUnreadCount).toBe(false)
  })
})

describe('notification management page', () => {
  it('requires notification policy permission and talks to admin APIs', () => {
    const page = readFileSync(
      fileURLToPath(new URL('../../pages/admin/notification-management/index.vue', import.meta.url)),
      'utf8'
    )
    expect(page).toContain('check-permission')
    expect(page).toContain('Event Policies')
    expect(page).toContain('Delivery Logs')
    expect(page).toContain('Global Settings')
    expect(page).not.toContain('Recipient Rules')
    expect(page).toContain('event-policies')
    expect(page).toContain('global-settings')
    const store = readFileSync(
      fileURLToPath(new URL('../../stores/notification-management.ts', import.meta.url)),
      'utf8'
    )
    expect(store).toContain('notificationAdminPolicies')
    expect(store).toContain('notificationAdminCatalog')
    expect(store).toContain('notificationAdminDryRun')
    expect(store).toContain('notificationAdminRetry')
    expect(store).toContain('notificationAdminSettings')
    expect(store).toContain('notificationAdminHealth')
    expect(store).toContain('notificationAdminLog')
  })
})
