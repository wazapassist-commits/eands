import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { StoreProvider, useStore } from './context/Store'
import { AdminProvider } from './context/Admin'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { Product } from './pages/Product'
import { Story, Contact } from './pages/Story'
import { Lookbook } from './pages/Lookbook'
import { Faq, NotFound } from './pages/Legal'
import { Experience } from './pages/Experience'
import { Admin } from './pages/Admin'

function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return <div className="toast">{toast}</div>
}

function RoutesInner() {
  const { locale } = useStore()
  useEffect(() => {
    document.title =
      locale === 'es'
        ? 'Essential and Simple — Streetwear minimalista 260 g | By S7ven'
        : locale === 'en'
          ? 'Essential and Simple — Minimalist Streetwear 260 g | By S7ven'
          : 'Essential and Simple — Streetwear minimaliste 260 g | By S7ven'
  }, [locale])
  return (
    <>
      <Toast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/produit/:slug" element={<Product />} />
        <Route path="/histoire" element={<Story />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/lookbook" element={<Lookbook />} />
        <Route path="/experience/:slug?" element={<Experience />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/aide" element={<Faq />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
  return (
    <BrowserRouter basename={basename}>
      <AdminProvider>
        <StoreProvider>
          <RoutesInner />
        </StoreProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}
