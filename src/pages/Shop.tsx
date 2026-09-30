import { useMemo, useState } from 'react'
import { Header, Footer, CartDrawer, ProductCard } from '../components/Chrome'
import { useStore } from '../context/Store'
import { useAdmin } from '../context/Admin'

export function Shop() {
  const { t } = useStore()
  const { products } = useAdmin()
  const [sort, setSort] = useState('default')
  const list = useMemo(() => {
    const arr = [...products]
    if (sort === 'low') arr.sort((a, b) => a.price - b.price)
    if (sort === 'high') arr.sort((a, b) => b.price - a.price)
    return arr
  }, [sort])

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="page">
        <header className="page-head">
          <div>
            <h1>{t.shopTitle}</h1>
            <p>{t.shopSub}</p>
          </div>
          <label>
            {t.sort}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">{t.sortDefault}</option>
              <option value="low">{t.sortLow}</option>
              <option value="high">{t.sortHigh}</option>
            </select>
          </label>
        </header>
        <div className="grid-4">
          {list.map((p) => (
            <ProductCard key={p.slug} slug={p.slug} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
