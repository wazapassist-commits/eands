import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'

export function Header() {
  const { t, locale, setLocale, count, setCartOpen } = useStore()
  const { settings, products } = useAdmin()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    setMenu(false)
    setSearch(false)
    window.scrollTo(0, 0)
  }, [loc.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const results = q.trim()
    ? products.filter((p) =>
        `${p.name.fr} ${p.name.en} ${p.tagline.fr}`.toLowerCase().includes(q.toLowerCase()),
      )
    : []

  return (
    <>
      <div className="promo">{locale === 'es' ? settings.promo.en : settings.promo[locale]}</div>
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <button className="icon-btn hide-desk" aria-label={t.menu} onClick={() => setMenu(true)}>
          <MenuIcon />
        </button>
        <nav className="nav-left hide-mobile">
          <NavLink to="/shop">{t.navShop}</NavLink>
          <NavLink to="/lookbook">{t.navLookbook}</NavLink>
          <NavLink to="/histoire">{t.navStory}</NavLink>
        </nav>
        <Link to="/" className="wordmark" aria-label="Essential and Simple">
          Essential <em>and</em> Simple
        </Link>
        <div className="nav-right">
          <nav className="hide-mobile">
            <NavLink to="/contact">{t.navContact}</NavLink>
          </nav>
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              className={`flag-btn${locale === 'es' ? ' on' : ''}`}
              onClick={() => setLocale('es')}
              aria-label="Español"
              title="Español"
            >
              <FlagES />
            </button>
            <button
              className={`flag-btn${locale === 'fr' ? ' on' : ''}`}
              onClick={() => setLocale('fr')}
              aria-label="Français"
              title="Français"
            >
              <FlagFR />
            </button>
            <button
              className={`flag-btn${locale === 'en' ? ' on' : ''}`}
              onClick={() => setLocale('en')}
              aria-label="English"
              title="English"
            >
              <FlagGB />
            </button>
          </div>
          <button className="icon-btn" aria-label={t.search} onClick={() => setSearch(true)}>
            <SearchIcon />
          </button>
          <button className="icon-btn bag-btn" aria-label={t.bag} onClick={() => setCartOpen(true)}>
            <BagIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
        </div>
      </header>

      {menu && (
        <div className="overlay" onClick={() => setMenu(false)}>
          <aside className="drawer left" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setMenu(false)} aria-label={t.close}>
              ×
            </button>
            <Link to="/" onClick={() => setMenu(false)}>
              {t.home}
            </Link>
            <Link to="/shop" onClick={() => setMenu(false)}>
              {t.navShop}
            </Link>
            <Link to="/lookbook" onClick={() => setMenu(false)}>
              {t.navLookbook}
            </Link>
            <Link to="/histoire" onClick={() => setMenu(false)}>
              {t.navStory}
            </Link>
            <Link to="/contact" onClick={() => setMenu(false)}>
              {t.navContact}
            </Link>
            <Link to="/aide" onClick={() => setMenu(false)}>
              {t.faqTitle}
            </Link>
          </aside>
        </div>
      )}

      {search && (
        <div className="overlay" onClick={() => setSearch(false)}>
          <div className="search-panel" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPh}
            />
            <ul>
              {q && results.length === 0 && <li className="muted">{t.noResults}</li>}
              {results.map((p) => (
                <li key={p.slug}>
                  <Link to={`/produit/${p.slug}`} onClick={() => setSearch(false)}>
                    <img src={p.images[0]} alt="" />
                    <span>
                      {p.name[locale]}
                      <small>{p.tagline[locale]}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

export function Footer() {
  const { t } = useStore()
  const { settings } = useAdmin()
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <p className="wordmark sm">Essential <em>and</em> Simple</p>
          <p className="muted">{t.footerBrand}</p>
          <p className="muted tiny">{t.allRights}</p>
        </div>
        <div>
          <h4>{t.navShop}</h4>
          <Link to="/shop">{t.navShop}</Link>
          <Link to="/lookbook">{t.navLookbook}</Link>
          <Link to="/histoire">{t.navStory}</Link>
          <Link to="/contact">{t.navContact}</Link>
        </div>
        <div>
          <h4>{t.footerHelp}</h4>
          <Link to="/aide">{t.faqTitle}</Link>
          <a href="mailto:contact@essentialandsimple.com">contact@essentialandsimple.com</a>
          <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <p>Maryland, USA — +1 (443) 571-6853</p>
        </div>
        <div>
          <h4>{t.footerFollow}</h4>
          <a href="https://www.instagram.com/essentialandsimple/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@essential.and.sim?_r=1&_t=ZS-9AA7xdWS8Qf"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
        </div>
      </div>
      <p className="copy">© {new Date().getFullYear()} Essential and Simple. {t.rights}</p>
    </footer>
  )
}

export function CartDrawer() {
  const { t, locale, cart, cartOpen, setCartOpen, updateQty, remove, total, waCheckout } =
    useStore()
  const [note, setNote] = useState('')
  if (!cartOpen) return null
  return (
    <div className="overlay" onClick={() => setCartOpen(false)}>
      <aside className="drawer right cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>{t.bag}</h2>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label={t.close}>
            ×
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="empty">
            <p>{t.emptyBag}</p>
            <Link className="btn" to="/shop" onClick={() => setCartOpen(false)}>
              {t.continue}
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((i) => (
                <li key={i.id}>
                  <img src={i.image} alt="" />
                  <div>
                    <strong>{i.name}</strong>
                    <p className="muted">
                      {i.size} · {t[i.color]}
                    </p>
                    <div className="qty">
                      <button onClick={() => updateQty(i.id, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => updateQty(i.id, i.qty + 1)}>+</button>
                    </div>
                    <button className="linkish" onClick={() => remove(i.id)}>
                      {t.remove}
                    </button>
                  </div>
                  <span>${(i.price * i.qty).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <label className="note">
              {t.note}
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </label>
            <div className="cart-foot">
              <p>
                {t.total} <strong>${total.toFixed(2)}</strong>
              </p>
              <button className="btn" onClick={() => waCheckout(note)}>
                {t.checkoutWa}
              </button>
              <p className="tiny muted">
                {locale === 'fr'
                  ? 'Paiement finalisé avec notre équipe sur WhatsApp.'
                  : locale === 'es'
                    ? 'El pago se finaliza con nuestro equipo en WhatsApp.'
                    : 'Checkout is completed with our team on WhatsApp.'}
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export function ProductCard({ slug }: { slug: string }) {
  const { t, locale } = useStore()
  const { products } = useAdmin()
  const p = products.find((x) => x.slug === slug)
  if (!p) return null
  return (
    <Link to={`/produit/${p.slug}`} className="pcard">
      <div className="pcard-img">
        {p.limited && !p.soldOut && <span className="chip dark">{t.limited}</span>}
        {p.soldOut && <span className="chip dark">{t.soldOut}</span>}
        <img src={p.images[0]} alt={p.name[locale]} loading="lazy" />
      </div>
      <div className="pcard-meta">
        <h3>{p.name[locale]}</h3>
        <span className="price">{p.soldOut ? t.soldOut : `$${p.price.toFixed(2)}`}</span>
      </div>
    </Link>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}
function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 8h12l-1 13H7L6 8z" />
      <path d="M9 8V7a3 3 0 016 0v1" />
    </svg>
  )
}
function FlagFR() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden>
      <rect width="22" height="16" rx="2" fill="#fff" />
      <rect width="7.5" height="16" rx="2" fill="#0055A4" />
      <rect x="7.5" width="7" height="16" fill="#fff" />
      <path d="M14.5 0h5.5a2 2 0 012 2v12a2 2 0 01-2 2h-5.5z" fill="#EF4135" />
    </svg>
  )
}
function FlagGB() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden>
      <rect width="22" height="16" rx="2" fill="#012169" />
      <path d="M0 0l22 16M22 0L0 16" stroke="#fff" strokeWidth="3" />
      <path d="M0 0l22 16M22 0L0 16" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M11 0v16M0 8h22" stroke="#fff" strokeWidth="4.5" />
      <path d="M11 0v16M0 8h22" stroke="#C8102E" strokeWidth="2.4" />
    </svg>
  )
}
function FlagES() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden>
      <rect width="22" height="16" rx="2" fill="#AA151B" />
      <rect y="4" width="22" height="8" fill="#F1BF00" />
    </svg>
  )
}
