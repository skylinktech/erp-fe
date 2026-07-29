export type ActivityFeedItem = {
  id: number
  userId: number | null
  action: string
  description: string | null
  device: string | null
  ipAddress: string | null
  createdAt: string
  user: {
    id: number
    fullName: string
    email: string
    username: string | null
  } | null
}

export type ParsedActivityAction = {
  verb: 'create' | 'update' | 'delete' | 'submit' | 'approve' | 'reject' | 'other'
  entity: string
  variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  verbLabel: string
  badgeLabel: string
  icon: string
}

const ACTION_MAP = {
  create: {
    variant: 'success' as const,
    verbLabel: 'membuat',
    badgeLabel: 'Create',
    icon: 'ri-add-circle-line',
  },
  update: {
    variant: 'warning' as const,
    verbLabel: 'memperbarui',
    badgeLabel: 'Update',
    icon: 'ri-edit-line',
  },
  delete: {
    variant: 'danger' as const,
    verbLabel: 'menghapus',
    badgeLabel: 'Delete',
    icon: 'ri-delete-bin-line',
  },
  submit: {
    variant: 'info' as const,
    verbLabel: 'mengajukan',
    badgeLabel: 'Submit',
    icon: 'ri-send-plane-line',
  },
  approve: {
    variant: 'success' as const,
    verbLabel: 'menyetujui',
    badgeLabel: 'Approve',
    icon: 'ri-checkbox-circle-line',
  },
  reject: {
    variant: 'danger' as const,
    verbLabel: 'menolak',
    badgeLabel: 'Reject',
    icon: 'ri-close-circle-line',
  },
}

export function parseActivityAction(action: string): ParsedActivityAction {
  const match = action.match(/^(create|update|delete|submit|approve|reject)_(.+)$/i)

  if (!match) {
    return {
      verb: 'other',
      entity: action.replace(/_/g, ' '),
      variant: 'secondary',
      verbLabel: 'melakukan',
      badgeLabel: 'Aktivitas',
      icon: 'ri-history-line',
    }
  }

  const verb = match[1].toLowerCase() as keyof typeof ACTION_MAP
  const entity = match[2].replace(/_/g, ' ')

  return {
    verb,
    entity,
    ...ACTION_MAP[verb],
  }
}

export function formatActivityEntity(entity: string): string {
  if (!entity) return 'Data'
  return entity
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatActivityTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Baru saja'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`
  return `${Math.floor(diffInSeconds / 86400)} hari lalu`
}

export function getActivityUserName(item: ActivityFeedItem): string {
  return item.user?.fullName || item.user?.username || item.user?.email || 'Sistem'
}
