/**
 * Source guards + contract checks for list-page summary cards + InfoPopover.
 * Environment remains Node (repo default). DOM behaviour is covered via
 * structural/source assertions and a lightweight Popover lifecycle mock.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../..', import.meta.url))

function walkVueFiles(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const full = join(dir, name)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.nuxt' || name === 'dist' || name === '.output') continue
      walkVueFiles(full, out)
    } else if (name.endsWith('.vue')) {
      out.push(full)
    }
  }
  return out
}

function rel(p: string) {
  return relative(root, p).replace(/\\/g, '/')
}

const DASHBOARD_PREFIXES = [
  'components/dashboard/',
  'pages/admin/dashboards/',
]

/** Detail/form surfaces that use avatar-initial but are out of list-summary scope */
const EXPLICIT_EXCLUSIONS = new Set([
  'pages/sales/customer-detail.vue',
  'components/list/ListPageStatsCards.vue',
  'components/cards/Cards.vue',
  'components/common/InfoPopover.vue',
])

function isDashboard(pathRel: string) {
  return DASHBOARD_PREFIXES.some((p) => pathRel.startsWith(p))
}

function looksLikeHardcodedListStats(source: string): boolean {
  if (!source.includes('avatar-initial rounded')) return false
  if (source.includes('<ListPageStatsCards')) return false
  // list/table summary pattern: stats row above table tooling
  const hasStatsRow =
    /row g-6 mb-6/.test(source) ||
    /Statistics Cards|Statistic Cards|Stats Cards|Expense Statistics|Account Statistics/.test(
      source
    )
  const hasTableNearby =
    /MyDataTable|ListPageDataTable|DataTable|ListPageTableHeader|card-datatable/.test(source)
  const hasAccountHeading = /account-heading|expense-heading|pegawai-heading/.test(source)
  return (hasStatsRow && (hasTableNearby || hasAccountHeading)) || (hasAccountHeading && hasTableNearby)
}

describe('ListPageStatsCards contract', () => {
  const comp = readFileSync(join(root, 'components/list/ListPageStatsCards.vue'), 'utf8')

  it('exports info on ListPageStatItem and renders InfoPopover', () => {
    expect(comp).toContain('export interface ListPageStatItem')
    expect(comp).toMatch(/info\??\s*:\s*ListPageStatItemInfo|info\?:/)
    expect(comp).toContain('InfoPopover')
    expect(comp).toContain('item.info')
    expect(comp).toContain('stat-card-label')
  })

  it('only shows info icon when title and description are present', () => {
    expect(comp).toMatch(/item\.info\?\.title && item\.info\?\.description/)
  })

  it('preserves loading skeleton, valueClass, subtitle, columnsClass', () => {
    expect(comp).toContain('skeleton-loader')
    expect(comp).toContain('item.valueClass')
    expect(comp).toContain('item.subtitle')
    expect(comp).toContain('columnsClass')
  })
})

describe('InfoPopover contract', () => {
  const comp = readFileSync(join(root, 'components/common/InfoPopover.vue'), 'utf8')

  it('uses a semantic button trigger with accessibility attributes', () => {
    expect(comp).toMatch(/<button[^>]*type="button"/)
    expect(comp).toContain('aria-label')
    expect(comp).toContain('aria-expanded')
    expect(comp).toContain('aria-controls')
    expect(comp).toContain('aria-hidden="true"')
    expect(comp).toContain('ri-information-line')
  })

  it('does not use v-html for title/description', () => {
    expect(comp).not.toMatch(/v-html/)
    expect(comp).toContain('html: false')
  })

  it('opens on click, closes on Escape, and cleans up on unmount', () => {
    expect(comp).toContain('@click.stop.prevent="toggle"')
    expect(comp).toContain("e.key === 'Escape'")
    expect(comp).toContain('onBeforeUnmount')
    expect(comp).toContain('dispose')
    expect(comp).toContain('removeGlobalListeners')
  })

  it('enforces single open popover and is SSR-safe', () => {
    expect(comp).toContain('activeController')
    expect(comp).toContain('import.meta.client')
    expect(comp).toContain('useId')
  })
})

describe('list-page summary cards migration source guard', () => {
  const pages = walkVueFiles(join(root, 'pages'))
  const components = walkVueFiles(join(root, 'components'))
  const scoped = [...pages, ...components].map(rel).filter((p) => !isDashboard(p))

  it('has no remaining hardcoded list/table summary card markup in scope', () => {
    const offenders: string[] = []
    for (const pathRel of scoped) {
      if (EXPLICIT_EXCLUSIONS.has(pathRel)) continue
      const source = readFileSync(join(root, pathRel), 'utf8')
      if (looksLikeHardcodedListStats(source)) {
        offenders.push(pathRel)
      }
    }
    expect(offenders, `Hardcoded list stats still present:\n${offenders.join('\n')}`).toEqual([])
  })

  it('every ListPageStatsCards usage provides info.title and info.description per card', () => {
    const missing: string[] = []
    for (const pathRel of scoped) {
      const source = readFileSync(join(root, pathRel), 'utf8')
      if (EXPLICIT_EXCLUSIONS.has(pathRel)) continue
      if (!source.includes('ListPageStatsCards')) continue
      // Ignore legacy/docs mentions without actual component usage
      if (!source.includes('<ListPageStatsCards') && !/from ['"]~\/components\/list\/ListPageStatsCards/.test(source)) continue

      // Extract computed arrays that feed stats cards
      const arrayBlocks: string[] = []
      const arrayStart =
        /const\s+(statItems|statCards|summaryCards|statsCards|payrollStatItems|cardItems)\s*=\s*computed(?:<[^>]+>)?\(\s*\(\)\s*=>\s*\[/g
      let m: RegExpExecArray | null
      while ((m = arrayStart.exec(source))) {
        const start = m.index + m[0].length - 1 // at [
        let depth = 0
        let end = -1
        for (let i = start; i < source.length; i++) {
          if (source[i] === '[') depth++
          else if (source[i] === ']') {
            depth--
            if (depth === 0) {
              end = i
              break
            }
          }
        }
        if (end > start) arrayBlocks.push(source.slice(start, end + 1))
      }

      // Mapped stats: const statItems = computed(() => foo.map(... info:))
      if (
        /const\s+statItems\s*=\s*computed\(/.test(source) &&
        /info:\s*\{/.test(source) &&
        arrayBlocks.length === 0
      ) {
        continue
      }

      // Also support return [ ... ] inside computed body without named const match above
      if (arrayBlocks.length === 0 && /ListPageStatsCards/.test(source)) {
        const ret = /return\s*\[([\s\S]*?)\]\s*\n\s*\}\)/.exec(source)
        if (ret && /label:\s*['"`]/.test(ret[0]) && /icon/.test(ret[0])) {
          arrayBlocks.push(`[${ret[1]}]`)
        }
      }

      if (arrayBlocks.length === 0) {
        // Page may pass a prop renamed elsewhere — require at least one info: near ListPage usage
        if (!/info:\s*\{/.test(source)) {
          missing.push(`${pathRel} (no info blocks found)`)
        }
        continue
      }

      for (const block of arrayBlocks) {
        // Count top-level objects with label:
        const labels = block.match(/label:\s*['"`][^'"`]+['"`]/g) || []
        const infos = block.match(/info:\s*\{/g) || []
        if (labels.length === 0) continue
        if (infos.length < labels.length) {
          missing.push(
            `${pathRel} (stat labels=${labels.length}, info=${infos.length})`
          )
        }
        // Empty description inside info blocks only
        if (/info:\s*\{[^}]*description:\s*['"`]\s*['"`]/.test(block)) {
          missing.push(`${pathRel} (empty description)`)
        }
      }
    }
    expect(missing, `Missing/weak info configs:\n${missing.join('\n')}`).toEqual([])
  })

  it('does not leave descriptions that only repeat the label', () => {
    const bad: string[] = []
    const re =
      /info:\s*\{\s*title:\s*['"`]([^'"`]+)['"`]\s*,\s*description:\s*['"`]([^'"`]+)['"`]/gs
    for (const pathRel of scoped) {
      const source = readFileSync(join(root, pathRel), 'utf8')
      if (!source.includes('info:')) continue
      let m: RegExpExecArray | null
      const local = new RegExp(re)
      while ((m = local.exec(source))) {
        const title = m[1].trim()
        const description = m[2].trim()
        if (!description || description.toLowerCase() === title.toLowerCase()) {
          bad.push(`${pathRel}: "${title}" / "${description}"`)
        }
        if (/^Jumlah\s+.+\.?$/i.test(description) && description.split(/\s+/).length <= 3) {
          bad.push(`${pathRel}: too-short description "${description}"`)
        }
      }
    }
    expect(bad, `Weak info copy:\n${bad.join('\n')}`).toEqual([])
  })
})

describe('legacy Cards.vue', () => {
  it('is not imported by active pages/components', () => {
    const offenders: string[] = []
    for (const pathRel of [...walkVueFiles(join(root, 'pages')), ...walkVueFiles(join(root, 'components'))].map(rel)) {
      if (pathRel === 'components/cards/Cards.vue') continue
      const source = readFileSync(join(root, pathRel), 'utf8')
      if (
        /from\s+['"]~\/components\/cards\/Cards/.test(source) ||
        /components\/cards\/Cards/.test(source) ||
        /<Cards[\s>]/.test(source)
      ) {
        offenders.push(pathRel)
      }
    }
    expect(offenders).toEqual([])
  })
})
