import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    (window as any).Quill = Quill
  }
})
