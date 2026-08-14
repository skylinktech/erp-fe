declare module '#app' {
  interface PageMeta {
    hidePageHeading?: boolean
    breadcrumb?: { label: string; to?: string }[]
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    hidePageHeading?: boolean
    breadcrumb?: { label: string; to?: string }[]
    title?: string
  }
}

export {}
