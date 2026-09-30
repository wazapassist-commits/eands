import { Link } from 'react-router-dom'
import { Header, Footer, CartDrawer } from '../components/Chrome'
import { useStore } from '../context/Store'
import { asset } from '../lib/asset'

const shots = [
  { src: asset('/images/hero.jpg'), label: '01 — Hero' },
  { src: asset('/images/p42.jpg'), label: '02 — Studio' },
  { src: asset('/images/editorial.jpg'), label: '03 — Editorial' },
  { src: asset('/images/face.jpg'), label: '04 — Face' },
  { src: asset('/images/dos.jpg'), label: '05 — Dos' },
  { src: asset('/images/p41.jpg'), label: '06 — Noir & Blanc' },
  { src: asset('/images/p1.jpg'), label: '07 — Figure Block' },
  { src: asset('/images/p2.jpg'), label: '08 — Figure Tee' },
  { src: asset('/images/p3.jpg'), label: '09 — The Mark' },
]

export function Lookbook() {
  const { t } = useStore()
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
        <div className="look-grid">
          {shots.map((s, i) => (
            <figure key={s.src} className={i % 5 === 0 ? 'wide' : ''}>
              <img src={s.src} alt={s.label} loading="lazy" />
              <figcaption>{s.label}</figcaption>
            </figure>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
