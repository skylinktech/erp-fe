import { describe, expect, it } from 'vitest'

/**
 * PROJECT vs INTERNAL PO form field visibility / payload contract.
 */
function resolvePoFormFields(allocationScope: 'INTERNAL' | 'PROJECT') {
  if (allocationScope === 'PROJECT') {
    return {
      showProject: true,
      showDepartment: false,
      showCostCenter: false,
      showBudget: false,
      requireProject: true,
      payload: (projectId: string) => ({
        allocationScope: 'PROJECT',
        projectId,
        costCenterId: null,
        budgetId: null,
      }),
    }
  }
  return {
    showProject: false,
    showDepartment: true,
    showCostCenter: true,
    showBudget: true,
    requireProject: false,
    payload: (dept: number, cc: number, budget: number) => ({
      allocationScope: 'INTERNAL',
      departmentId: dept,
      costCenterId: cc,
      budgetId: budget,
      projectId: null,
    }),
  }
}

function selectorProjects(
  projects: Array<{ id: string; commercialStatus: string; archivedAt: string | null }>,
  mode: 'new_txn' | 'historical_gl'
) {
  if (mode === 'historical_gl') {
    return projects.filter((p) => true)
  }
  return projects.filter(
    (p) =>
      !p.archivedAt &&
      (p.commercialStatus === 'CONTRACTED' || p.commercialStatus === 'ACTIVE')
  )
}

describe('Project vs Internal PO and GL project selector', () => {
  it('PROJECT PO shows project and hides budget/CC', () => {
    const f = resolvePoFormFields('PROJECT')
    expect(f.showProject).toBe(true)
    expect(f.showBudget).toBe(false)
    expect(f.showCostCenter).toBe(false)
    expect(f.payload('p-1')).toEqual({
      allocationScope: 'PROJECT',
      projectId: 'p-1',
      costCenterId: null,
      budgetId: null,
    })
  })

  it('INTERNAL PO shows department/CC/budget', () => {
    const f = resolvePoFormFields('INTERNAL')
    expect(f.showDepartment).toBe(true)
    expect(f.showCostCenter).toBe(true)
    expect(f.showBudget).toBe(true)
    expect(f.payload(1, 2, 3).projectId).toBeNull()
  })

  it('archived projects available in historical GL but not new txn selector', () => {
    const projects = [
      { id: 'a', commercialStatus: 'CONTRACTED', archivedAt: null },
      { id: 'b', commercialStatus: 'ARCHIVED', archivedAt: '2026-01-01' },
      { id: 'c', commercialStatus: 'PRE_SALES', archivedAt: null },
    ]
    expect(selectorProjects(projects, 'new_txn').map((p) => p.id)).toEqual(['a'])
    expect(selectorProjects(projects, 'historical_gl').map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })
})
