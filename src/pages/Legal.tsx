import { Link } from 'react-router-dom'
import { Header, Footer, CartDrawer } from '../components/Chrome'
import { useStore } from '../context/Store'

export function Faq() {
  const { t } = useStore()
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page legal-page">
        <p className="kicker">{t.helpKicker}</p>
        <h1>{t.faqTitle}</h1>
        <p className="muted">{t.faqSub}</p>
        <div className="faq-list">
          {t.faqItems.map((f) => (
            <details key={f.q} className="acc">
              <summary>
                {f.q}
                <span>+</span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <h2>{t.cgvTitle}</h2>
        <div className="legal-text">
          {t.cgvText.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <Link className="btn" to="/contact">
          {t.navContact}
        </Link>
      </main>
      <Footer />
    </>
  )
}

export function NotFound() {
  const { t } = useStore()
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page notfound">
        <p className="kicker">404</p>
        <h1>{t.notFoundTitle}</h1>
        <p className="muted">{t.notFoundText}</p>
        <Link className="btn" to="/">
          {t.backHome}
        </Link>
      </main>
      <Footer />
    </>
  )
}
