import { supabase } from './supabase'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/** Upload une image vers le bucket Supabase `site-images`. Retourne l'URL publique. */
export async function uploadImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Cloud non configuré.')
  if (!ACCEPTED.includes(file.type)) throw new Error('Format accepté : JPG, PNG, WebP, AVIF.')
  if (file.size > MAX_BYTES) throw new Error('Image trop lourde (max 5 Mo).')
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `uploads/${name}`
  const { error } = await supabase.storage.from('site-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw new Error("Échec de l'upload. Connectez-vous et vérifiez le bucket.")
  const { data } = supabase.storage.from('site-images').getPublicUrl(path)
  return data.publicUrl
}
