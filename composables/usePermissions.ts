import { storeToRefs } from 'pinia';
import { useUserStore } from '~/stores/user';

export const usePermissions = () => {
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);

  const userHasPermission = (permissionName: string): boolean => {
    if (!user.value || !user.value.roles) {
      return false;
    }
    // Dapatkan semua nama permission dari semua role
    const permissions = user.value.roles.flatMap(role => role.permissions?.map((p: { name: string }) => p.name) || []);
    return permissions.includes(permissionName);
  };

  const userHasRole = (roleName: string): boolean => {
    return user.value?.roles?.some(role => role.name === roleName) || false;
  };

  // Method untuk memastikan user data tersedia sebelum mengecek permission
  const ensureUserLoaded = async () => {
    if (!user.value) {
      await userStore.ensureUserLoaded();
    }
    
    // Refresh cache jika diperlukan
    await userStore.refreshCacheIfNeeded();
    
    return user.value;
  };

  // Method untuk invalidate cache
  const invalidateCache = async () => {
    await userStore.invalidateCache();
  };

  // Method untuk mengecek apakah cache masih valid
  const isCacheValid = () => {
    return userStore.isCacheValid();
  };

  // Method untuk refresh cache jika diperlukan
  const refreshCacheIfNeeded = async () => {
    await userStore.refreshCacheIfNeeded();
  };

  // Method untuk mendapatkan session data
  const getSessionData = () => {
    return userStore.getSessionData();
  };

  // Method untuk mengecek apakah user memiliki permission dengan cache validation
  const userHasPermissionWithCache = async (permissionName: string): Promise<boolean> => {
    await ensureUserLoaded();
    return userHasPermission(permissionName);
  };

  // Method untuk mengecek apakah user memiliki role dengan cache validation
  const userHasRoleWithCache = async (roleName: string): Promise<boolean> => {
    await ensureUserLoaded();
    return userHasRole(roleName);
  };

  // Method untuk mengecek apakah user adalah superadmin dengan cache validation
  const isSuperadminWithCache = async (): Promise<boolean> => {
    return await userHasRoleWithCache('superadmin');
  };

  return {
    userHasPermission,
    userHasRole,
    userHasPermissionWithCache,
    userHasRoleWithCache,
    isSuperadminWithCache,
    ensureUserLoaded,
    invalidateCache,
    isCacheValid,
    refreshCacheIfNeeded,
    getSessionData,
  };
}; 