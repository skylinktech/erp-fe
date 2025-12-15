import { defineStore } from 'pinia'
import type { User } from './userManagement'
import type { Permission } from './permissions'
import { useNuxtApp } from '#app'
import { useSecureStorage } from '~/composables/useSecureStorage'

// Interface untuk cached user data yang minimal
interface CachedUserData {
  id: number
  username: string
  email: string
  fullName: string
  roles: Array<{
    id: number
    name: string
    permissions: Array<{
      id: number
      name: string
    }>
  }>
  cachedAt: number
  expiresAt: number
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as null | User,
    loading: false,
    lastLoadTime: 0 as number,
    cacheExpiry: 15 * 60 * 1000, // 15 menit dalam milliseconds
  }),
  getters: {
    // Mendapatkan semua permission user dari semua role
    userPermissions: (state) => {
      if (!state.user || !state.user.roles) return []
      return state.user.roles.flatMap(role => {
        if (!role.permissions) return []
        return role.permissions.map(p => {
          if (typeof p === 'object' && p !== null && 'name' in p) {
            return (p as Permission).name
          }
          return null
        }).filter(Boolean)
      })
    },
    
    // Fungsi untuk mengecek apakah user memiliki permission tertentu
    hasPermission: (state) => (permissionName: string) => {
      if (!state.user || !state.user.roles) return false
      return state.user.roles.some(role => 
        role.permissions?.some(permission => {
          if (typeof permission === 'object' && permission !== null && 'name' in permission) {
            return (permission as Permission).name === permissionName
          }
          return false
        })
      )
    },
    
    // Fungsi untuk mengecek apakah user memiliki salah satu dari permission yang diberikan
    hasAnyPermission: (state) => (permissionNames: string[]) => {
      if (!state.user || !state.user.roles) return false
      return permissionNames.some(permissionName => 
        state.user!.roles.some(role => 
          role.permissions?.some(permission => {
            if (typeof permission === 'object' && permission !== null && 'name' in permission) {
              return (permission as Permission).name === permissionName
            }
            return false
          })
        )
      )
    }
  },
  actions: {
    setUser(user: any) {
      this.user = user
      // Simpan user data ke localStorage untuk caching dengan expiry
      if (user) {
        this.cacheUserData(user)
        this.setSensitiveData(user)
      }
    },
    
    // Method untuk cache user data dengan expiry
    cacheUserData(user: any) {
      const now = Date.now()
      const cachedData: CachedUserData = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles?.map((role: any) => ({
          id: role.id,
          name: role.name,
          permissions: role.permissions?.map((perm: any) => ({
            id: perm.id,
            name: perm.name
          })) || []
        })) || [],
        cachedAt: now,
        expiresAt: now + this.cacheExpiry
      }
      
      try {
        localStorage.setItem('user_cache', JSON.stringify(cachedData))
      } catch (error) {
        console.warn('Failed to cache user data:', error)
      }
    },
    
    // Method untuk load user data dari cache
    loadCachedUserData(): CachedUserData | null {
      try {
        const cached = localStorage.getItem('user_cache')
        if (!cached) return null
        
        const cachedData: CachedUserData = JSON.parse(cached)
        const now = Date.now()
        
        // Cek apakah cache masih valid
        if (now > cachedData.expiresAt) {
          localStorage.removeItem('user_cache')
          return null
        }
        
        return cachedData
      } catch (error) {
        console.warn('Failed to load cached user data:', error)
        localStorage.removeItem('user_cache')
        return null
      }
    },
    
    // Method untuk convert cached data ke full user object
    convertCachedToUser(cachedData: CachedUserData): User {
      return {
        id: cachedData.id,
        username: cachedData.username,
        email: cachedData.email,
        fullName: cachedData.fullName,
        roles: cachedData.roles.map(role => ({
          id: role.id,
          name: role.name,
          permissions: role.permissions.map(perm => ({
            id: perm.id,
            name: perm.name
          }))
        }))
      } as User
    },
    
    // Method untuk menyimpan data sensitif ke secure storage
    setSensitiveData(user: any) {
      const secureStorage = useSecureStorage()
      
      // Simpan data sensitif ke httpOnly cookie
      const sensitiveData = {
        userId: user.id,
        sessionId: user.sessionId || Date.now().toString(),
        lastActivity: Date.now(),
        expiresAt: Date.now() + this.cacheExpiry
      }
      
      secureStorage.setUserSession(sensitiveData)
    },
    
    // Method untuk memvalidasi session dari secure storage
    validateSession(): boolean {
      const secureStorage = useSecureStorage()
      return secureStorage.isSecureDataValid('user_session', false)
    },
    
    // Method untuk mendapatkan session data
    getSessionData() {
      const secureStorage = useSecureStorage()
      return secureStorage.getUserSession()
    },
    
    // Method untuk invalidate cache dan force refresh
    async invalidateCache() {
      localStorage.removeItem('user_cache')
      const secureStorage = useSecureStorage()
      secureStorage.clearUserSession()
      
      // Force reload user data
      this.user = null
      this.lastLoadTime = 0
      await this.loadUser()
    },
    
    // Method untuk mengecek apakah cache masih valid
    isCacheValid(): boolean {
      const cachedData = this.loadCachedUserData()
      if (!cachedData) return false
      
      const isSessionValid = this.validateSession()
      if (!isSessionValid) return false
      
      return true
    },
    
    // Method untuk refresh cache jika expired
    async refreshCacheIfNeeded() {
      if (!this.isCacheValid()) {
        await this.invalidateCache()
      }
    },
    clearUser() {
      this.user = null
      this.lastLoadTime = 0
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('user_cache')
      
      // Clear secure storage
      const secureStorage = useSecureStorage()
      secureStorage.clearUserSession()
      
      // Hapus kredensial yang tersimpan untuk remember me
      const usernameCookie = useCookie('remembered_username');
      usernameCookie.value = null;
    },
    async loadUser() {
      const token = localStorage.getItem('token')
      if (!token) return

      // Jika user sudah ada dan tidak dalam loading state, return
      if (this.user && !this.loading) return

      // Debounce: Jika baru saja load user (dalam 5 detik terakhir), skip
      const now = Date.now()
      if (this.lastLoadTime && (now - this.lastLoadTime) < 5000) {
        return
      }

      // Jika sedang loading, tunggu hingga selesai
      if (this.loading) {
        await new Promise(resolve => {
          const checkLoading = () => {
            if (!this.loading) {
              resolve(true)
            } else {
              setTimeout(checkLoading, 10)
            }
          }
          checkLoading()
        })
        return
      }

      // Coba load dari cache terlebih dahulu
      const cachedData = this.loadCachedUserData()
      if (cachedData && !this.user) {
        try {
          this.user = this.convertCachedToUser(cachedData)
          this.lastLoadTime = now
          
          // Validasi token untuk memastikan data masih valid
          const isValid = await this.validateToken()
          if (isValid) {
            return
          } else {
            // Token tidak valid, clear cache dan load ulang
            this.clearUser()
          }
        } catch (error) {
          console.warn('Failed to convert cached user data:', error)
          localStorage.removeItem('user_cache')
        }
      }

      this.loading = true
      const { $api } = useNuxtApp()

      try {
        const response = await fetch($api.me(), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        if (!response.ok) {
          throw new Error('Gagal memuat data pengguna')
        }
        
        const userData = await response.json()
        this.setUser(userData)
        this.lastLoadTime = Date.now()
      } catch (error) {
        console.error(error)
        this.clearUser()
      } finally {
        this.loading = false
      }
    },
    // Method untuk memvalidasi token tanpa mengubah user data
    async validateToken() {
      const token = localStorage.getItem('token')
      if (!token) return false

      const { $api } = useNuxtApp()

      try {
        const response = await fetch($api.me(), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        return response.ok
      } catch (error) {
        console.error('Token validation failed:', error)
        return false
      }
    },
    
    // Method untuk memastikan user data tersedia
    async ensureUserLoaded() {
      // Cek token dulu
      const token = localStorage.getItem('token')
      if (!token) {
        return null
      }
      
      if (this.user && !this.loading) {
        return this.user
      }
      
      if (this.loading) {
        await new Promise((resolve, reject) => {
          let attempts = 0
          const maxAttempts = 100 // 1 detik timeout
          const checkLoading = () => {
            if (!this.loading) {
              resolve(true)
            } else if (attempts >= maxAttempts) {
              reject(new Error('Timeout loading user data'))
            } else {
              attempts++
              setTimeout(checkLoading, 10)
            }
          }
          checkLoading()
        })
      }
      
      if (!this.user) {
        await this.loadUser()
      }
      
      return this.user
    },
  },
})