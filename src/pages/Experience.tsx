import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CartDrawer } from '../components/Chrome'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'
import { pic } from '../lib/asset'
import { products as FALLBACK_PRODUCTS } from '../data/products'

type CamKey = {
  at: number
  s: number
  ox: number
  oy: number
  flip: number
}

// Camera path synced with the 7 storyboard steps.
// Moderate zooms on mobile: max ~2.1, no macro.
const KEYS: CamKey[] = [
  { at: 0.0, s: 1.0, ox: 50, oy: 42, flip: 0 }, // 01 hero
  { at: 0.15, s: 1.55, ox: 50, oy: 55, flip: 0 }, // 02 matière
  { at: 0.3, s: 1.9, ox: 50, oy: 12, flip: 0 }, // 03 col
  { at: 0.45, s: 2.1, ox: 68, oy: 30, flip: 0 }, // 04 logo poitrine
  { at: 0.6, s: 1.05, ox: 50, oy: 45, flip: 0 }, // reset avant rotation
  { at: 0.7, s: 1.15, ox: 50, oy: 45, flip: 180 }, // 05 dos
  { at: 0.8, s: 1.9, ox: 50, oy: 52, flip: 180 }, // 06 artwork silhouette
  { at: 0.88, s: 2.0, ox: 55, oy: 80, flip: 180 }, // 06 signature
  { at: 1.0, s: 1.0, ox: 50, oy: 50, flip: 180 }, // 07 specs + CTA
]

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

function camera(p: number) {
  const c = Math.min(1, Math.max(0, p))
  let i = 0
  while (i < KEYS.length - 2 && c > KEYS[i + 1].at) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const span = b.at - a.at || 1
  const k = Math.min(1, Math.max(0, (c - a.at) / span))
  return {
    s: lerp(a.s, b.s, k),
    ox: lerp(a.ox, b.ox, k),
    oy: lerp(a.oy, b.oy, k),
    flip: lerp(a.flip, b.flip, k),
  }
}

export function ProductStory({ slug, embedded }: { slug?: string; embedded?: boolean }) {
  const { t, add } = useStore()
  const { products } = useAdmin()
  const list = products.length > 0 ? products : FALLBACK_PRODUCTS
  const product =
    (slug ? list.find((x) => x.slug === slug) : undefined) ??
    list.find((x) => x.slug === 'the-walker') ??
    list[0]
  const wrapRef = useRef<HTMLDivElement>(null)
  const [prog, setProg] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const v = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
      setProg(v)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    return () => {
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (!product) return null

  const cam = camera(prog)
  const step = Math.min(6, Math.floor(prog * 7))
  const steps = t.xpSteps

  return (
    <div className="xp" ref={wrapRef}>
      <div className="xp-stage">
        <div
          className="xp-cam"
          style={{
            transform: `rotateY(${cam.flip}deg) scale(${cam.s})`,
            transformOrigin: `${cam.ox}% ${cam.oy}%`,
          }}
        >
          <div className="xp-face">
            <img src={pic(product.images[0])} alt={`${product.name.en} — face`} />
          </div>
          <div className="xp-face xp-backface">
            <img
              src={pic(product.images[1] ?? product.images[0])}
              alt={`${product.name.en} — dos`}
            />
          </div>
        </div>

        <div className="xp-shade" />

        <header className="xp-top">
          <span>Essential <em>and</em> Simple</span>
          {!embedded && (
            <Link
              className="xp-close"
              to={slug ? `/produit/${slug}` : '/shop'}
              aria-label={t.close}
            >
              ×
            </Link>
          )}
        </header>

        {steps.map((s, i) =>
          i < 6 ? (
            <div key={s.title} className={`xp-cap${step === i ? ' on' : ''}`}>
              <p className="xp-kick">
                0{i + 1} / 07
              </p>
              <h2>{s.title}</h2>
              <p className="xp-sub">{s.sub}</p>
            </div>
          ) : null,
        )}

        {step === 0 && <p className="xp-hint">{t.xpScroll}</p>}

        <div className={`xp-specs${step === 6 ? ' on' : ''}`}>
          <p className="xp-kick">07 / 07 — {steps[6].title}</p>
          <ul>
            {t.xpSpecs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <button
            className="btn light xp-cta"
            onClick={() => add(product, product.colors[0], 'M', 1)}
          >
            {t.add} — ${product.price.toFixed(2)}
          </button>
          <Link className="xp-fiche" to={`/produit/${product.slug}`}>
            {product.name.en} →
          </Link>
        </div>

        <div className="xp-prog">
          <i style={{ transform: `scaleX(${prog})` }} />
        </div>
      </div>
    </div>
  )
}

export function Experience() {
  const { slug } = useParams()
  return (
    <>
      <ProductStory slug={slug} />
      <CartDrawer />
    </>
  )
}
