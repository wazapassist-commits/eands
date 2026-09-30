import { Link } from 'react-router-dom'
import { Header, Footer, CartDrawer } from '../components/Chrome'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'
import { pic } from '../lib/asset'

export function Lookbook() {
  const { t } = useStore()
  const { settings } = useAdmin()
  const shots = settings.content.gallery
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
            <figure key={`${s.src}-${i}`} className={i % 5 === 0 ? 'wide' : ''}>
              <img src={pic(s.src)} alt={s.label} loading="lazy" />
              <figcaption>{s.label}</figcaption>
            </figure>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
