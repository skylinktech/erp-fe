/**
 * Canonical project option fetch contexts.
 * transaction → new docs; historical → GL / reports (includes archived).
 */
export function buildProjectOptionsQuery(input: {
  context: 'transaction' | 'historical'
  search?: string
  page?: number
  perPage?: number
}) {
  const qs = new URLSearchParams({
    kind: 'project',
    context: input.context,
    page: String(input.page || 1),
    perPage: String(input.perPage || 30),
  })
  if (input.search) qs.set('search', input.search)
  return qs
}

export function filterProjectsForContext(
  projects: Array<{ id: string; commercialStatus?: string; archived?: boolean; archivedAt?: string | null }>,
  context: 'transaction' | 'historical'
) {
  if (context === 'historical') return projects
  return projects.filter(
    (p) =>
      !p.archived &&
      !p.archivedAt &&
      (p.commercialStatus === 'CONTRACTED' || p.commercialStatus === 'ACTIVE')
  )
}
