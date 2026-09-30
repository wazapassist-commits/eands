import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { copy, type Locale } from '../i18n'
import type { Color, Product, Size } from '../data/products'
import { useAdmin } from './Admin'

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  color: Color
  size: Size
  qty: number
  image: string
}

type Store = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (typeof copy)[Locale]
  cart: CartItem[]
  cartOpen: boolean
  setCartOpen: (v: boolean) => void
  add: (p: Product, color: Color, size: Size, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  remove: (id: string) => void
  count: number
  total: number
  toast: string | null
  waCheckout: (note?: string) => void
}

const Ctx = createContext<Store | null>(null)
const KEY = 'eas-cart'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { settings } = useAdmin()
  const t = copy[locale]

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setCart(JSON.parse(raw) as CartItem[])
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart))
  }, [cart])

  const add = useCallback(
    (p: Product, color: Color, size: Size, qty = 1) => {
      if (p.soldOut) return
      const id = `${p.slug}-${color}-${size}`
      setCart((prev) => {
        const found = prev.find((i) => i.id === id)
        if (found) {
          return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i))
        }
        return [
          ...prev,
          {
            id,
            slug: p.slug,
            name: p.name[locale],
            price: p.price,
            color,
            size,
            qty,
            image: p.images[0],
          },
        ]
      })
      setCartOpen(true)
      setToast(t.added)
      window.setTimeout(() => setToast(null), 1800)
    },
    [locale, t.added],
  )

  const updateQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const count = cart.reduce((n, i) => n + i.qty, 0)
  const total = cart.reduce((n, i) => n + i.qty * i.price, 0)

  const waCheckout = useCallback(
    (note?: string) => {
      const lines = cart.map(
        (i) =>
          `• ${i.name} — ${i.size} / ${i.color} ×${i.qty} ($${i.price.toFixed(2)})`,
      )
      const text = [
        locale === 'fr'
          ? 'Bonjour, je souhaite commander :'
          : 'Hi, I would like to order:',
        '',
        ...lines,
        '',
        `Total: $${total.toFixed(2)}`,
        note ? `Note: ${note}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      window.open(
        `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`,
        '_blank',
      )
    },
    [cart, locale, total, settings.whatsapp],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      cart,
      cartOpen,
      setCartOpen,
      add,
      updateQty,
      remove,
      count,
      total,
      toast,
      waCheckout,
    }),
    [
      locale,
      t,
      cart,
      cartOpen,
      add,
      updateQty,
      remove,
      count,
      total,
      toast,
      waCheckout,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore')
  return ctx
}
