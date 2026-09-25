import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

describe('document numbering settings page', () => {
  it('is gated by view_document_numbering and uses dedicated APIs', () => {
    const page = readFileSync(
      fileURLToPath(new URL('../../pages/settings/document-numbering/index.vue', import.meta.url)),
      'utf8'
    )
    expect(page).toContain('check-permission')
    expect(page).toContain('Document Numbering')
    expect(page).toContain('canManage')
    expect(page).toContain('preview')
    expect(page).toContain('ListPageStatsCards')
    expect(page).toContain('ListPageTableHeader')
    expect(page).toContain('CollapsibleFilterCard')
    expect(page).toContain('MyDataTable')
    expect(page).toContain("import MyDataTable from '~/components/table/MyDataTable.vue'")
    expect(page).toContain('col-12')
    expect(page).toContain('form-select w-100')
    expect(page).toContain('<Modal')
    expect(page).not.toContain('<table class="table')

    const store = readFileSync(
      fileURLToPath(new URL('../../stores/document-numbering.ts', import.meta.url)),
      'utf8'
    )
    expect(store).toContain('documentNumbering')
    expect(store).toContain('documentNumberingPreview')
    expect(store).toContain('expectedVersion')
    expect(store).toContain('apiFetch')
    expect(store).not.toContain('$axios')

    const middleware = readFileSync(
      fileURLToPath(new URL('../../middleware/check-permission.ts', import.meta.url)),
      'utf8'
    )
    expect(middleware).toContain("'/settings/document-numbering': 'view_document_numbering'")
    expect(middleware).toContain("'/settings/notification-management': 'view_notification_policy'")
  })
})
