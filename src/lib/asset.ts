// Préfixe les assets publics avec la base Vite (/ en dev, /eands/ en prod).
export function asset(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}
