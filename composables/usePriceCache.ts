/**
 * Cache untuk product/service price API - mengurangi redundant calls saat user pilih item yang sama berulang
 * TTL 5 menit; invalidate on mutation jika diperlukan
 */

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const productPriceCache = new Map<string, CacheEntry<any>>()
const servicePriceCache = new Map<string, CacheEntry<any>>()

function getCacheKeyProduct(productId: number | string, type: string): string {
  return `product:${productId}:${type}`
}

function getCacheKeyService(serviceId: number | string, servicePlanId: number | string | null, type: string): string {
  return `service:${serviceId}:${servicePlanId ?? 'null'}:${type}`
}

function pruneExpired<T>(cache: Map<string, CacheEntry<T>>): void {
  const now = Date.now()
  for (const [k, v] of cache.entries()) {
    if (v.expiresAt < now) cache.delete(k)
  }
}

export function usePriceCache() {
  const getProductPrice = async (
    productId: number | string,
    type: string,
    fetcher: () => Promise<any>
  ): Promise<any> => {
    const key = getCacheKeyProduct(productId, type)
    pruneExpired(productPriceCache)
    const cached = productPriceCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }
    const data = await fetcher()
    productPriceCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
    return data
  }

  const getServicePrice = async (
    serviceId: number | string,
    servicePlanId: number | string | null,
    type: string,
    fetcher: () => Promise<any>
  ): Promise<any> => {
    const key = getCacheKeyService(serviceId, servicePlanId, type)
    pruneExpired(servicePriceCache)
    const cached = servicePriceCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }
    const data = await fetcher()
    servicePriceCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
    return data
  }

  const invalidateProduct = (productId: number | string, type?: string) => {
    if (type) {
      productPriceCache.delete(getCacheKeyProduct(productId, type))
    } else {
      for (const k of productPriceCache.keys()) {
        if (k.startsWith(`product:${productId}:`)) productPriceCache.delete(k)
      }
    }
  }

  const invalidateService = (serviceId: number | string, servicePlanId?: number | string | null, type?: string) => {
    if (type !== undefined) {
      servicePriceCache.delete(getCacheKeyService(serviceId, servicePlanId ?? null, type))
    } else {
      for (const k of servicePriceCache.keys()) {
        if (k.startsWith(`service:${serviceId}:`)) servicePriceCache.delete(k)
      }
    }
  }

  return {
    getProductPrice,
    getServicePrice,
    invalidateProduct,
    invalidateService,
  }
}
