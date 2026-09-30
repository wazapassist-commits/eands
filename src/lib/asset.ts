// Préfixe les assets publics avec la base Vite (/ en dev, /eands/ en prod).
export function asset(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}

/** Résout une image stockée (brute ou absolue) pour l'hôte courant. */
export function pic(src: string | undefined): string {
  if (!src) return ''
  if (/^(https?:|data:|blob:)/.test(src)) return src
  const base = import.meta.env.BASE_URL || '/'
  const clean = src.replace(/^\//, '')
  if (clean.startsWith('images/')) return `${base}${clean}`
  return src
}

/** Normalise une image vers sa forme brute (/images/…) avant stockage. */
export function raw(src: string): string {
  if (!src) return src
  const m = src.match(/^\/(?:eands\/)?(images\/.*)$/)
  return m ? `/${m[1]}` : src
}
