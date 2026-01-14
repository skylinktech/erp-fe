/**
 * Utility function untuk backward compatibility dengan cookie-based auth
 * 
 * DEPRECATED: Function ini hanya untuk backward compatibility.
 * Untuk cookie-based auth, token TIDAK perlu diambil manual.
 * Token akan otomatis dikirim via httpOnly cookie dengan credentials: 'include'
 * 
 * @returns empty string (token otomatis terkirim via cookie)
 */
export const getToken = (): string => {
  // Return empty string karena token otomatis dikirim via httpOnly cookie
  // Code yang pakai function ini akan tetap jalan tanpa error
  return ''
}

/**
 * Check apakah user sudah login (based on cookie existence)
 * 
 * Note: Karena httpOnly cookie tidak bisa diakses dari JavaScript,
 * cara terbaik adalah dengan check user store.
 * Function ini hanya untuk backward compatibility.
 */
export const hasAuthToken = (): boolean => {
  // Untuk benar-benar check auth, gunakan userStore.user !== null
  // Function ini return true untuk backward compatibility
  return true
}
