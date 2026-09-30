import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Header, Footer, CartDrawer, ProductCard } from '../components/Chrome'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'
import { pic } from '../lib/asset'

export function Home() {
  const { t } = useStore()
  const { products, addSubscriber, settings } = useAdmin()
  const content = settings.content
  const [ok, setOk] = useState(false)
  return (
    <>
      <Header />
      <CartDrawer />
      <main>
        <section className="hero">
          <img src={pic(content.hero)} alt="Essential and Simple — édition By S7ven" />
          <div className="hero-copy">
            <p className="kicker">{t.heroKicker}</p>
            <h1>
              {t.heroTitle.split('\n').map((l, i) => (
                <span key={l}>
                  {i === 1 ? <em>{l}</em> : l}
                  <br />
                </span>
              ))}
            </h1>
            <p className="lead">{t.heroSub}</p>
            <div className="cta-row">
              <Link className="btn light" to="/shop">
                <span>{t.shopNow} — $29</span>
              </Link>
              <Link className="btn ghost" to="/lookbook">
                {t.lookbook}
              </Link>
            </div>
          </div>
          <div className="hero-scroll">Scroll</div>
        </section>

        <div className="marquee" aria-hidden>
          <div className="marquee-track">
            <span>260 g heavyweight <i>◆</i> Limited edition <i>◆</i> By S7ven <i>◆</i> Essential and Simple <i>◆</i></span>
            <span>260 g heavyweight <i>◆</i> Limited edition <i>◆</i> By S7ven <i>◆</i> Essential and Simple <i>◆</i></span>
          </div>
        </div>

        <section className="section">
          <div className="section-head">
            <div>
              <span className="section-num">01 — Sélection</span>
              <h2>{t.featured}</h2>
              <p>{t.featuredSub}</p>
            </div>
            <Link className="text-link" to="/shop">
              {t.navShop} →
            </Link>
          </div>
          <div className="grid-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} slug={p.slug} />
            ))}
          </div>
        </section>

        <section className="cats">
          <Link to="/shop" className="cat">
            <img src={pic(content.catBw)} alt="" loading="lazy" />
            <div>
              <h3>{t.catBw}</h3>
              <p>{t.catBwSub}</p>
              <span className="arrow">{t.shopNow} →</span>
            </div>
          </Link>
          <Link to="/lookbook" className="cat">
            <img src={pic(content.catSeven)} alt="" loading="lazy" />
            <div>
              <h3>{t.catSeven}</h3>
              <p>{t.catSevenSub}</p>
              <span className="arrow">{t.lookbook} →</span>
            </div>
          </Link>
        </section>

        <div className="trust">
          {t.trustItems.map((x) => (
            <div key={x.b}><b>{x.b}</b>{x.s}</div>
          ))}
        </div>

        <section className="section" id="galerie">
          <div className="section-head">
            <div>
              <span className="section-num">02 — Éditorial</span>
              <h2>{t.gallery}</h2>
              <p>{t.gallerySub}</p>
            </div>
            <Link className="text-link" to="/lookbook">
              {t.lookbook} →
            </Link>
          </div>
          <div className="mosaic">
            {content.mosaic.map((src, i) => (
              <img key={`${src}-${i}`} src={pic(src)} alt="" loading="lazy" />
            ))}
          </div>
        </section>

        <section className="story-split">
          <div>
            <p className="kicker">{t.storyTitle}</p>
            <h2>{t.youDidnt}</h2>
            <p>{t.storyP1}</p>
            <p>{t.storyP2}</p>
            <Link className="text-link" to="/histoire">
              {t.navStory} →
            </Link>
          </div>
          <img src={pic(content.storySplit)} alt="" />
        </section>

        <section className="philo">
          <p className="kicker">{t.philoTitle}</p>
          <blockquote>{t.philoQuote}</blockquote>
        </section>

        <section className="fabric">
          <div>
            <span className="section-num">03 — Matière</span>
            <h2>{t.fabricTitle}</h2>
            <p className="desc">{t.fabricText}</p>
            <Link className="text-link" to="/shop">
              {t.shopNow} →
            </Link>
          </div>
          <img src={pic(content.fabric)} alt="" loading="lazy" />
        </section>

        <section className="newsletter">
          <h2>{t.dropTitle}</h2>
          <p>{t.dropSub}</p>
          {ok ? (
            <p className="thanks">{t.thanks}</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                addSubscriber(String(fd.get('email') ?? ''))
                setOk(true)
              }}
            >
              <input type="email" name="email" required placeholder={t.emailPh} />
              <button className="btn" type="submit">
                {t.subscribe}
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
