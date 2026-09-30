import { Header, Footer, CartDrawer } from '../components/Chrome'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'
import { asset } from '../lib/asset'

export function Story() {
  const { t } = useStore()
  const { settings } = useAdmin()
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page story-page">
        <p className="kicker">{t.storyTitle}</p>
        <h1>{t.heroTitle.replace('\n', ' ')}</h1>
        <div className="story-wide">
          <img src={settings.content.storyWide} alt="" />
          <div>
            <p>{t.storyP1}</p>
            <p>{t.storyP2}</p>
            <blockquote>{t.philoQuote}</blockquote>
          </div>
        </div>
        <div className="mosaic">
          <img src={asset('/images/face.jpg')} alt="" loading="lazy" />
          <img src={asset('/images/dos.jpg')} alt="" loading="lazy" />
          <img src={asset('/images/p41.jpg')} alt="" loading="lazy" />
          <img src={asset('/images/p42.jpg')} alt="" loading="lazy" />
        </div>
      </main>
      <Footer />
    </>
  )
}

export function Contact() {
  const { t } = useStore()
  const { settings } = useAdmin()
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page contact-page">
        <div>
          <p className="kicker">{t.navContact}</p>
          <h1>{t.contactTitle}</h1>
          <p className="lead">{t.contactLead}</p>
          <p>
            <a href="mailto:contact@essentialandsimple.com">contact@essentialandsimple.com</a>
            <br />
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <br />
            +1 (443) 571-6853
            <br />
            Maryland, USA
          </p>
        </div>
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const body = `${fd.get('name')}\n${fd.get('email')}\n\n${fd.get('message')}`
            window.location.href = `mailto:contact@essentialandsimple.com?subject=Essential%20and%20Simple&body=${encodeURIComponent(body)}`
          }}
        >
          <label>
            {t.name}
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            {t.message}
            <textarea name="message" rows={5} required />
          </label>
          <button className="btn" type="submit">
            {t.send}
          </button>
        </form>
      </main>
      <Footer />
    </>
  )
}
