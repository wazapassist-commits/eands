import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header, Footer, CartDrawer } from '../components/Chrome'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'
import { pic } from '../lib/asset'

export function Lookbook() {
  const { t } = useStore()
  const { settings } = useAdmin()
  const shots = settings.content.gallery
  const [open, setOpen] = useState<number | null>(null)

  const step = useCallback(
    (dir: 1 | -1) => {
      setOpen((cur) =>
        cur === null ? cur : (cur + dir + shots.length) % shots.length,
      )
    },
    [shots.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page">
        <header className="page-head">
          <div>
            <p className="kicker">{t.lookbookKicker}</p>
            <h1>{t.lookbookTitle}</h1>
            <p>{t.lookbookSub}</p>
          </div>
          <Link className="btn" to="/shop">
            {t.shopNow}
          </Link>
        </header>
        <div className="look-masonry">
          {shots.map((s, i) => (
            <figure key={`${s.src}-${i}`}>
              <button type="button" onClick={() => setOpen(i)} aria-label={s.label}>
                <img src={pic(s.src)} alt={s.label} loading="lazy" />
              </button>
            </figure>
          ))}
        </div>
      </main>
      {open !== null && shots[open] && (
        <div className="lightbox" onClick={() => setOpen(null)}>
          <button
            type="button"
            className="lightbox-x"
            onClick={() => setOpen(null)}
            aria-label={t.close}
          >
            ×
          </button>
          <button
            type="button"
            className="lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}
            aria-label="←"
          >
            ‹
          </button>
          <img
            src={pic(shots[open].src)}
            alt={shots[open].label}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}
            aria-label="→"
          >
            ›
          </button>
        </div>
      )}
      <Footer />
    </>
  )
}
