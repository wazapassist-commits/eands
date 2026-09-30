import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  products as DEFAULT_PRODUCTS,
  WHATSAPP as DEFAULT_WA,
  type Color,
  type Product,
} from '../data/products'
import { copy } from '../i18n'
import { supabase, isCloud } from '../lib/supabase'
import { asset } from '../lib/asset'

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  createdAt: string
  name: string
  phone: string
  detail: string
  total: number
  status: OrderStatus
}

export type Settings = {
  promo: { fr: string; en: string }
  whatsapp: string
}

type Admin = {
  products: Product[]
  saveProduct: (p: Product) => void
  deleteProduct: (slug: string) => void
  toggleSoldOut: (slug: string) => void
  toggleLimited: (slug: string) => void
  resetProducts: () => void
  settings: Settings
  saveSettings: (s: Settings) => void
  subscribers: string[]
  addSubscriber: (email: string) => boolean
  removeSubscriber: (email: string) => void
  orders: Order[]
  saveOrder: (o: Order) => void
  deleteOrder: (id: string) => void
  exportAll: () => void
  importAll: (json: string) => boolean
  cloud: boolean
  cloudUser: string | null
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => void
  pushAll: () => Promise<void>
}

const Ctx = createContext<Admin | null>(null)

const K_PRODUCTS = 'eas-admin-products'
const K_SETTINGS = 'eas-admin-settings'
const K_SUBS = 'eas-subscribers'
const K_ORDERS = 'eas-orders'

export const IMAGE_LIBRARY = [
  asset('/images/face.jpg'),
  asset('/images/dos.jpg'),
  asset('/images/hero.jpg'),
  asset('/images/p42.jpg'),
  asset('/images/p41.jpg'),
  asset('/images/editorial.jpg'),
  asset('/images/look-city.png'),
  asset('/images/life-1.jpg'),
  asset('/images/life-2.jpg'),
  asset('/images/life-3.jpg'),
  asset('/images/life-4.jpg'),
  asset('/images/p1.jpg'),
  asset('/images/p1b.jpg'),
  asset('/images/p2.jpg'),
  asset('/images/p3.jpg'),
  asset('/images/p4.jpg'),
  asset('/images/p5.jpg'),
  asset('/images/p6.jpg'),
  asset('/images/p7.jpg'),
  asset('/images/t1-1.jpg'),
  asset('/images/t1-2.jpg'),
  asset('/images/t1-3.jpg'),
  asset('/images/t1-4.jpg'),
]

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* stockage plein ou indisponible */
  }
}

function defaultSettings(): Settings {
  return {
    promo: { fr: copy.fr.promo, en: copy.en.promo },
    whatsapp: DEFAULT_WA,
  }
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/* ---------- Mapping base <-> app ---------- */

type ProductRow = {
  slug: string
  price: number
  sold_out: boolean
  limited: boolean
  colors: string[]
  images: string[]
  name_fr: string
  name_en: string
  tagline_fr: string
  tagline_en: string
  desc_fr: string
  desc_en: string
  sort: number
}

type SettingsRow = { promo_fr: string; promo_en: string; whatsapp: string }

type OrderRow = {
  id: string
  created_at: string
  name: string
  phone: string
  detail: string
  total: number
  status: string
}

const toColor = (c: string): c is Color => c === 'noir' || c === 'blanc'

function fromRow(r: ProductRow): Product {
  return {
    slug: r.slug,
    price: Number(r.price) || 0,
    soldOut: !!r.sold_out,
    limited: !!r.limited,
    colors: (r.colors ?? []).filter(toColor),
    images: r.images ?? [],
    name: { fr: r.name_fr ?? '', en: r.name_en ?? '' },
    tagline: { fr: r.tagline_fr ?? '', en: r.tagline_en ?? '' },
    description: { fr: r.desc_fr ?? '', en: r.desc_en ?? '' },
  }
}

function toRow(p: Product, sort: number): ProductRow {
  return {
    slug: p.slug,
    price: p.price,
    sold_out: !!p.soldOut,
    limited: !!p.limited,
    colors: p.colors,
    images: p.images,
    name_fr: p.name.fr,
    name_en: p.name.en,
    tagline_fr: p.tagline.fr,
    tagline_en: p.tagline.en,
    desc_fr: p.description.fr,
    desc_en: p.description.en,
    sort,
  }
}

function toOrderRow(o: Order): OrderRow {
  return {
    id: o.id,
    created_at: o.createdAt,
    name: o.name,
    phone: o.phone,
    detail: o.detail,
    total: o.total,
    status: o.status,
  }
}

function fromOrderRow(r: OrderRow): Order {
  const s = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(r.status)
    ? (r.status as OrderStatus)
    : 'new'
  return {
    id: r.id,
    createdAt: r.created_at,
    name: r.name ?? '',
    phone: r.phone ?? '',
    detail: r.detail ?? '',
    total: Number(r.total) || 0,
    status: s,
  }
}

async function cloudProducts(): Promise<Product[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from('products').select('*').order('sort')
    if (error || !data) return null
    return (data as ProductRow[]).map(fromRow)
  } catch {
    return null
  }
}

async function cloudSettings(): Promise<Settings | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    if (error || !data) return null
    const r = data as SettingsRow
    return { promo: { fr: r.promo_fr, en: r.promo_en }, whatsapp: r.whatsapp }
  } catch {
    return null
  }
}

async function cloudSubscribers(): Promise<string[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from('subscribers').select('email')
    if (error || !data) return null
    return (data as { email: string }[]).map((x) => x.email)
  } catch {
    return null
  }
}

async function cloudOrders(): Promise<Order[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) return null
    return (data as OrderRow[]).map(fromOrderRow)
  } catch {
    return null
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    load<Product[]>(K_PRODUCTS, DEFAULT_PRODUCTS),
  )
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>(K_SETTINGS, defaultSettings()),
  )
  const [subscribers, setSubscribers] = useState<string[]>(() =>
    load<string[]>(K_SUBS, []),
  )
  const [orders, setOrders] = useState<Order[]>(() => load<Order[]>(K_ORDERS, []))
  const [cloudUser, setCloudUser] = useState<string | null>(null)

  useEffect(() => store(K_PRODUCTS, products), [products])
  useEffect(() => store(K_SETTINGS, settings), [settings])
  useEffect(() => store(K_SUBS, subscribers), [subscribers])
  useEffect(() => store(K_ORDERS, orders), [orders])

  // Session admin (Supabase Auth)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setCloudUser(data.session?.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      setCloudUser(session?.user?.email ?? null)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  // Lecture cloud (publique) -> fusionne avec le local
  useEffect(() => {
    if (!supabase) return
    let live = true
    ;(async () => {
      const [p, st] = await Promise.all([cloudProducts(), cloudSettings()])
      if (!live) return
      if (p && p.length > 0) setProducts(p)
      if (st) setSettings(st)
      const [su, o] = await Promise.all([cloudSubscribers(), cloudOrders()])
      if (!live) return
      if (su) setSubscribers((prev) => Array.from(new Set([...su, ...prev])))
      if (o)
        setOrders((prev) => {
          const seen = new Set(o.map((x) => x.id))
          return [...o, ...prev.filter((x) => !seen.has(x.id))]
        })
    })()
    return () => {
      live = false
    }
  }, [])

  const cloudFire = (fn: (db: SupabaseClient) => PromiseLike<unknown>) => {
    if (!supabase || !cloudUser) return
    try {
      const r = fn(supabase) as Promise<unknown>
      if (r && typeof r.catch === 'function') r.catch(() => {})
    } catch {
      /* hors-ligne : le local reste la référence */
    }
  }

  const persistProduct = (p: Product, list: Product[]) => {
    const ix = list.findIndex((x) => x.slug === p.slug)
    const sort = ix >= 0 ? ix : list.length
    setProducts((prev) => {
      const i = prev.findIndex((x) => x.slug === p.slug)
      if (i >= 0) {
        const next = [...prev]
        next[i] = p
        return next
      }
      return [...prev, p]
    })
    cloudFire((db) => db.from('products').upsert(toRow(p, sort), { onConflict: 'slug' }))
  }

  const value = useMemo<Admin>(
    () => ({
      products,
      saveProduct: (p) => persistProduct(p, products),
      deleteProduct: (slug) => {
        setProducts((prev) => prev.filter((x) => x.slug !== slug))
        cloudFire((db) => db.from('products').delete().eq('slug', slug))
      },
      toggleSoldOut: (slug) => {
        const cur = products.find((x) => x.slug === slug)
        if (cur) persistProduct({ ...cur, soldOut: !cur.soldOut }, products)
      },
      toggleLimited: (slug) => {
        const cur = products.find((x) => x.slug === slug)
        if (cur) persistProduct({ ...cur, limited: !cur.limited }, products)
      },
      resetProducts: () => {
        setProducts(DEFAULT_PRODUCTS)
        cloudFire(async (db) => {
          await db.from('products').delete().neq('slug', '')
          await db
            .from('products')
            .upsert(DEFAULT_PRODUCTS.map((p, i) => toRow(p, i)), { onConflict: 'slug' })
        })
      },
      settings,
      saveSettings: (s) => {
        setSettings(s)
        cloudFire((db) =>
          db.from('settings').upsert(
            { id: 1, promo_fr: s.promo.fr, promo_en: s.promo.en, whatsapp: s.whatsapp },
            { onConflict: 'id' },
          ),
        )
      },
      subscribers,
      addSubscriber: (email) => {
        const clean = email.trim().toLowerCase()
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return false
        if (subscribers.includes(clean)) return false
        setSubscribers((prev) => (prev.includes(clean) ? prev : [...prev, clean]))
        cloudFire((db) => db.from('subscribers').upsert({ email: clean }, { onConflict: 'email' }))
        return true
      },
      removeSubscriber: (email) => {
        setSubscribers((prev) => prev.filter((x) => x !== email))
        cloudFire((db) => db.from('subscribers').delete().eq('email', email))
      },
      orders,
      saveOrder: (o) => {
        setOrders((prev) => {
          const i = prev.findIndex((x) => x.id === o.id)
          if (i >= 0) {
            const next = [...prev]
            next[i] = o
            return next
          }
          return [o, ...prev]
        })
        cloudFire((db) => db.from('orders').upsert(toOrderRow(o), { onConflict: 'id' }))
      },
      deleteOrder: (id) => {
        setOrders((prev) => prev.filter((x) => x.id !== id))
        cloudFire((db) => db.from('orders').delete().eq('id', id))
      },
      exportAll: () => {
        const data = JSON.stringify(
          {
            products: load<Product[]>(K_PRODUCTS, DEFAULT_PRODUCTS),
            settings: load<Settings>(K_SETTINGS, defaultSettings()),
            subscribers: load<string[]>(K_SUBS, []),
            orders: load<Order[]>(K_ORDERS, []),
          },
          null,
          2,
        )
        const blob = new Blob([data], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'essential-simple-backup.json'
        a.click()
        URL.revokeObjectURL(a.href)
      },
      importAll: (json) => {
        try {
          const d = JSON.parse(json) as {
            products?: Product[]
            settings?: Settings
            subscribers?: string[]
            orders?: Order[]
          }
          if (Array.isArray(d.products)) setProducts(d.products)
          if (d.settings?.promo && d.settings?.whatsapp) setSettings(d.settings)
          if (Array.isArray(d.subscribers)) setSubscribers(d.subscribers)
          if (Array.isArray(d.orders)) setOrders(d.orders)
          return true
        } catch {
          return false
        }
      },
      cloud: isCloud,
      cloudUser,
      signIn: async (email, password) => {
        if (!supabase) return 'Cloud non configuré.'
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error ? 'Identifiants invalides.' : null
      },
      signOut: () => {
        if (supabase) void supabase.auth.signOut()
        setCloudUser(null)
      },
      pushAll: async () => {
        if (!supabase || !cloudUser) return
        await supabase
          .from('products')
          .upsert(products.map((p, i) => toRow(p, i)), { onConflict: 'slug' })
        await supabase.from('settings').upsert(
          {
            id: 1,
            promo_fr: settings.promo.fr,
            promo_en: settings.promo.en,
            whatsapp: settings.whatsapp,
          },
          { onConflict: 'id' },
        )
        if (subscribers.length > 0)
          await supabase
            .from('subscribers')
            .upsert(subscribers.map((email) => ({ email })), { onConflict: 'email' })
        if (orders.length > 0)
          await supabase
            .from('orders')
            .upsert(orders.map(toOrderRow), { onConflict: 'id' })
      },
    }),
    [products, settings, subscribers, orders, cloudUser],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAdmin() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdmin hors AdminProvider')
  return ctx
}
