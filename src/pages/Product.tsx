import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Header, Footer, CartDrawer, ProductCard } from '../components/Chrome'
import { ProductStory } from './Experience'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'
import { pic } from '../lib/asset'
import type { Color, Size } from '../data/products'

const sizes: Size[] = ['S', 'M', 'L', 'XL']

export function Product() {
  const { slug } = useParams()
  const { products } = useAdmin()
  const p = slug ? products.find((x) => x.slug === slug) : undefined
  const { t, locale, add } = useStore()
  const [img, setImg] = useState(0)
  const [size, setSize] = useState<Size>('M')
  const [color, setColor] = useState<Color>('noir')
  const [qty, setQty] = useState(1)
  const [open, setOpen] = useState('material')
  const [showSize, setShowSize] = useState(false)

  useEffect(() => {
    setImg(0)
    setSize('M')
    setColor('noir')
    setQty(1)
  }, [slug])

  if (!p) return <Navigate to="/shop" replace />

  const related = products.filter((x) => x.slug !== p.slug).slice(0, 4)

  return (
    <>
      <Header />
      <CartDrawer />
      <nav className="crumb" aria-label="breadcrumb">
        <Link to="/">E&amp;S</Link>
        <span>/</span>
        <Link to="/shop">{t.navShop}</Link>
        <span>/</span>
        <span className="here">{p.name[locale]}</span>
      </nav>
      <main className="product-page">
        <div className="p-gallery">
          <div className="thumbs">
            {p.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={i === img ? 'on' : ''}
                onClick={() => setImg(i)}
                aria-label={`${i + 1}`}
              >
                <img src={pic(src)} alt="" />
              </button>
            ))}
          </div>
          <div className="p-main">
            {p.limited && !p.soldOut && <span className="chip dark">{t.limited}</span>}
            {p.soldOut && <span className="chip dark">{t.soldOut}</span>}
            <img className="main-img" src={pic(p.images[img] ?? p.images[0])} alt={p.name[locale]} />
          </div>
        </div>
        <div className="p-info">
          <p className="kicker">{p.tagline[locale]}</p>
          <h1>{p.name[locale]}</h1>
          <div className="price-row">
            <p className="price">{p.soldOut ? t.soldOut : `$${p.price.toFixed(2)}`}</p>
            {!p.soldOut && <span className="taxes">{t.taxesNote}</span>}
          </div>
          <p className={`stock${p.soldOut ? ' out' : ''}`}>
            <i />
            {p.soldOut ? t.soldOut : p.limited ? `${t.limited} · ${t.inStock}` : t.inStock}
          </p>
          <p className="desc">{p.description[locale]}</p>

          <fieldset>
            <legend>
              {t.color} — {t[color]}
            </legend>
            <div className="dots">
              {p.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={t[c]}
                  title={t[c]}
                  className={`dot ${c} ${color === c ? 'on' : ''}`}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              {t.size} ·{' '}
              <button type="button" className="linkish" onClick={() => setShowSize(true)}>
                {t.sizeGuide}
              </button>
            </legend>
            <div className="sizes">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={size === s ? 'on' : ''}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="buy-row">
            <div className="qty" aria-label={t.qty}>
              <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((n) => Math.min(9, n + 1))}>+</button>
            </div>
            <button className="btn grow" disabled={p.soldOut} onClick={() => add(p, color, size, qty)}>
              {p.soldOut ? t.soldOut : `${t.add} — $${(p.price * qty).toFixed(2)}`}
            </button>
          </div>
          {!p.soldOut && p.stripeLink && (
            <a
              className="btn light grow stripe-btn"
              href={p.stripeLink}
              target="_blank"
              rel="noreferrer"
            >
              {t.payCard} — ${(p.price * qty).toFixed(2)}
            </a>
          )}

          <ul className="reassure">
            {t.reassure.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          {showSize && (
            <div className="overlay" onClick={() => setShowSize(false)}>
              <div className="size-modal" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-head">
                  <h3>{t.sizeGuide}</h3>
                  <button type="button" className="icon-btn" onClick={() => setShowSize(false)}>
                    ×
                  </button>
                </div>
                <p className="muted">{t.sizeGuideText}</p>
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>{t.sizeTh[0]}</th>
                      <th>{t.sizeTh[1]}</th>
                      <th>{t.sizeTh[2]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>96 cm</td><td>69 cm</td></tr>
                    <tr><td>M</td><td>102 cm</td><td>71 cm</td></tr>
                    <tr><td>L</td><td>108 cm</td><td>73 cm</td></tr>
                    <tr><td>XL</td><td>114 cm</td><td>75 cm</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(
            [
              ['material', t.materialItems],
              ['delivery', t.deliveryItems],
              ['style', t.styleItems],
            ] as const
          ).map(([key, items]) => (
            <div className="acc" key={key}>
              <button type="button" onClick={() => setOpen(open === key ? '' : key)}>
                {t[key]}
                <span>{open === key ? '−' : '+'}</span>
              </button>
              {open === key && (
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
      <ProductStory slug={p.slug} embedded />
      <section className="section">
        <div className="section-head">
          <div>
            <span className="section-num">04 — Suite</span>
            <h2>{t.related}</h2>
          </div>
          <Link to="/shop" className="text-link">
            {t.navShop} →
          </Link>
        </div>
        <div className="grid-4">
          {related.map((r) => (
            <ProductCard key={r.slug} slug={r.slug} />
          ))}
        </div>
      </section>
      <Footer />
    </>
  )
}
