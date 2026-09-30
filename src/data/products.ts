import { asset } from '../lib/asset'
import type { Locale } from '../i18n'

export type Color = 'noir' | 'blanc'
export type Size = 'S' | 'M' | 'L' | 'XL'
export type Localized = Record<Locale, string>

export type Product = {
  slug: string
  price: number
  soldOut?: boolean
  limited?: boolean
  colors: Color[]
  images: string[]
  name: Localized
  tagline: Localized
  description: Localized
}

export const WHATSAPP = '14435716853'

export const products: Product[] = [
  {
    slug: 'the-figure-block',
    price: 29,
    limited: true,
    colors: ['noir', 'blanc'],
    images: [asset('/images/t1-1.jpg'), asset('/images/t1-2.jpg'), asset('/images/t1-3.jpg'), asset('/images/t1-4.jpg')],
    name: {
      fr: 'The Figure Block',
      en: 'The Figure Block',
      es: 'The Figure Block',
    },
    tagline: {
      fr: 'Édition limitée · By S7ven',
      en: 'Limited edition · By S7ven',
      es: 'Edición limitada · By S7ven',
    },
    description: {
      fr: 'Tee unisexe en coton lourd 260 g, silhouette figure composée de typographie. Un graphisme dense, lisible de près, silencieux de loin.',
      en: 'Unisex 260g heavyweight cotton tee with a figure built from type. Dense up close, quiet from a distance.',
      es: 'Camiseta unisex de algodón pesado 260 g con figura compuesta de tipografía. Un gráfico denso, legible de cerca, silencioso de lejos.',
    },
  },
  {
    slug: 'the-figure-tee',
    price: 29,
    limited: true,
    colors: ['noir', 'blanc'],
    images: [asset('/images/p2.jpg'), asset('/images/hero.jpg')],
    name: {
      fr: 'The Figure Tee',
      en: 'The Figure Tee',
      es: 'The Figure Tee',
    },
    tagline: {
      fr: 'Coton premium · coupe classique',
      en: 'Premium cotton · classic cut',
      es: 'Algodón premium · corte clásico',
    },
    description: {
      fr: 'Le motif signature : une figure minimale et le mot d’ordre essential and simple. Conçu pour le quotidien, sans bruit visuel.',
      en: 'The signature motif: a minimal figure and the line essential and simple. Made for everyday wear, without visual noise.',
      es: 'El motivo insignia: una figura minimal y el lema essential and simple. Hecha para el día a día, sin ruido visual.',
    },
  },
  {
    slug: 'the-mark',
    price: 29,
    limited: true,
    colors: ['noir', 'blanc'],
    images: [asset('/images/p3.jpg')],
    name: {
      fr: 'The Mark',
      en: 'The Mark',
      es: 'The Mark',
    },
    tagline: {
      fr: 'Monogramme ESM',
      en: 'ESM monogram',
      es: 'Monograma ESM',
    },
    description: {
      fr: 'Monogramme géométrique au cœur. Une pièce graphique, nette, pensée comme une signature plutôt qu’un logo.',
      en: 'A geometric monogram at the chest. Graphic, precise — a signature more than a logo.',
      es: 'Monograma geométrico en el pecho. Una pieza gráfica, precisa, pensada como firma más que como logo.',
    },
  },
  {
    slug: 'the-walker',
    price: 29,
    limited: true,
    colors: ['noir', 'blanc'],
    images: [asset('/images/p5.jpg'), asset('/images/p7.jpg')],
    name: {
      fr: 'The Walker',
      en: 'The Walker',
      es: 'The Walker',
    },
    tagline: {
      fr: 'By S7ven',
      en: 'By S7ven',
      es: 'By S7ven',
    },
    description: {
      fr: 'Figure en mouvement, signature By S7ven. Une édition limitée pour ceux qui avancent sans s’expliquer.',
      en: 'A figure in motion, signed By S7ven. A limited piece for those who keep walking.',
      es: 'Figura en movimiento, firmada By S7ven. Una edición limitada para quienes avanzan sin explicarse.',
    },
  },
  {
    slug: 'blank-260',
    price: 29,
    soldOut: true,
    colors: ['blanc', 'noir'],
    images: [asset('/images/p4.jpg')],
    name: {
      fr: 'Blank 260g',
      en: 'Blank 260g',
      es: 'Blank 260g',
    },
    tagline: {
      fr: 'Coton lourd, sans print',
      en: 'Heavyweight, no print',
      es: 'Pesado, sin estampado',
    },
    description: {
      fr: 'Tee uni 260 g. La base : coupe nette, tombé stable, rien d’autre. Actuellement en rupture.',
      en: '260g blank tee. The foundation: clean cut, stable drape, nothing else. Currently sold out.',
      es: 'Camiseta lisa 260 g. La base: corte limpio, caída estable, nada más. Actualmente agotada.',
    },
  },
]

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function formatPrice(n: number) {
  return `$${n.toFixed(2)}`
}
