import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin, IMAGE_LIBRARY, slugify } from '../context/Admin'
import type { Order, OrderStatus, SiteContent } from '../context/Admin'
import type { Color, Product } from '../data/products'
import { uploadImage } from '../lib/storage'

const PASS_KEY = 'eas-admin-pass'
const SESSION_KEY = 'eas-admin'
const DEFAULT_PASS = 'admin123'
const COLORS: Color[] = ['noir', 'blanc']

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Nouvelle',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

type Tab = 'dash' | 'products' | 'content' | 'orders' | 'subs' | 'settings'

export function Admin() {
  const { cloud, cloudUser, signOut } = useAdmin()
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1',
  )
  if (cloud) {
    if (!cloudUser) return <CloudLogin />
    return <Panel onLogout={() => signOut()} />
  }
  if (!authed) return <Login onOk={() => setAuthed(true)} />
  return <Panel onLogout={() => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }} />
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  return (
    <div className="admin-login">
      <form
        className="admin-card"
        onSubmit={(e) => {
          e.preventDefault()
          const saved = localStorage.getItem(PASS_KEY) ?? DEFAULT_PASS
          if (pw === saved) {
            sessionStorage.setItem(SESSION_KEY, '1')
            onOk()
          } else {
            setErr(true)
          }
        }}
      >
        <p className="wordmark sm">Essential <em>and</em> Simple</p>
        <h1>Administration</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value)
            setErr(false)
          }}
          placeholder="Mot de passe"
          autoFocus
        />
        {err && <p className="admin-err">Mot de passe incorrect.</p>}
        <button className="btn" type="submit">
          Se connecter
        </button>
        <Link className="linkish" to="/">
          ← Retour au site
        </Link>
      </form>
    </div>
  )
}

function CloudLogin() {
  const { signIn } = useAdmin()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const toEmail = (v: string) =>
    v.includes('@') ? v.trim() : 'contact@essentialandsimple.com'
  return (
    <div className="admin-login">
      <form
        className="admin-card"
        onSubmit={(e) => {
          e.preventDefault()
          setBusy(true)
          setErr(null)
          signIn(toEmail(id), pw).then((error) => {
            setBusy(false)
            if (error) setErr(error)
          })
        }}
      >
        <p className="wordmark sm">Essential <em>and</em> Simple</p>
        <h1>Administration · Cloud</h1>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Pseudo ou e-mail (eands)"
          autoFocus
          required
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Mot de passe"
          required
        />
        {err && <p className="admin-err">{err}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
        <Link className="linkish" to="/">
          ← Retour au site
        </Link>
      </form>
    </div>
  )
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const { cloud, cloudUser } = useAdmin()
  const [tab, setTab] = useState<Tab>('dash')
  const tabs: { id: Tab; label: string }[] = [
    { id: 'dash', label: 'Tableau de bord' },
    { id: 'products', label: 'Produits' },
    { id: 'content', label: 'Contenus' },
    { id: 'orders', label: 'Commandes' },
    { id: 'subs', label: 'Newsletter' },
    { id: 'settings', label: 'Réglages' },
  ]
  return (
    <div className="admin">
      <aside className="admin-side">
        <p className="wordmark sm">E<em>&</em>S · Admin</p>
        <nav>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'on' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-side-foot">
          <small>{cloud ? `Cloud · ${cloudUser ?? 'hors ligne'}` : 'Mode local'}</small>
          <Link to="/">Voir le site</Link>
          <button type="button" className="linkish" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {tab === 'dash' && <Dash />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'subs' && <SubsTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}

/* ---------------- Dashboard ---------------- */

function Dash() {
  const { products, orders, subscribers } = useAdmin()
  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((n, o) => n + (Number(o.total) || 0), 0),
    [orders],
  )
  const soldOut = products.filter((p) => p.soldOut).length
  const byStatus = useMemo(() => {
    const m: Record<OrderStatus, number> = {
      new: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    orders.forEach((o) => {
      m[o.status] += 1
    })
    return m
  }, [orders])
  return (
    <div>
      <h1>Tableau de bord</h1>
      <div className="admin-cards">
        <div className="admin-card">
          <span>Chiffre estimé</span>
          <strong>${revenue.toFixed(2)}</strong>
        </div>
        <div className="admin-card">
          <span>Commandes</span>
          <strong>{orders.length}</strong>
          <small>
            {byStatus.new} nouvelle(s) · {byStatus.shipped} expédiée(s)
          </small>
        </div>
        <div className="admin-card">
          <span>Produits</span>
          <strong>{products.length}</strong>
          <small>{soldOut} épuisé(s)</small>
        </div>
        <div className="admin-card">
          <span>Abonnés newsletter</span>
          <strong>{subscribers.length}</strong>
        </div>
      </div>
      <h2>Dernières commandes</h2>
      {orders.length === 0 ? (
        <p className="muted">
          Aucune commande. Les commandes WhatsApp se suivent ici : créez-les dans
          l’onglet Commandes.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id}>
                <td>{o.name || '—'}</td>
                <td>${Number(o.total || 0).toFixed(2)}</td>
                <td>{STATUS_LABEL[o.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ---------------- Upload + sélecteur d'image ---------------- */

function UploadButton({ onDone }: { onDone: (url: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  return (
    <span className="admin-upload">
      <label className="btn light">
        {busy ? 'Envoi…' : 'Uploader'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            setBusy(true)
            setErr('')
            uploadImage(file).then(
              (url) => {
                setBusy(false)
                onDone(url)
              },
              (ex: unknown) => {
                setBusy(false)
                setErr(ex instanceof Error ? ex.message : "Échec de l'upload.")
              },
            )
          }}
        />
      </label>
      {err && <small className="admin-err">{err}</small>}
    </span>
  )
}

function ImagePick({
  label,
  value,
  onChange,
  onRemove,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  onRemove?: () => void
}) {
  const [url, setUrl] = useState('')
  const options = value && !IMAGE_LIBRARY.includes(value) ? [value, ...IMAGE_LIBRARY] : IMAGE_LIBRARY
  return (
    <div className="admin-imgpick">
      <span className="admin-imgpick-label">{label}</span>
      {value && <img className="admin-imgpick-prev" src={value} alt="" />}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Choisir —</option>
        {options.map((src) => (
          <option key={src} value={src}>
            {src.split('/').pop()}
          </option>
        ))}
      </select>
      <div className="admin-urlrow">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… (image externe)"
        />
        <button
          type="button"
          className="btn light"
          onClick={() => {
            if (url.trim()) {
              onChange(url.trim())
              setUrl('')
            }
          }}
        >
          OK
        </button>
        <UploadButton onDone={onChange} />
      </div>
      {onRemove && (
        <button type="button" className="linkish danger" onClick={onRemove}>
          Retirer ce visuel
        </button>
      )}
    </div>
  )
}

/* ---------------- Contenus du site ---------------- */

const SINGLE_SLOTS: { key: Exclude<keyof SiteContent, 'mosaic'>; label: string }[] = [
  { key: 'hero', label: 'Hero — accueil' },
  { key: 'catBw', label: 'Catégorie Noir & Blanc' },
  { key: 'catSeven', label: 'Catégorie By S7ven' },
  { key: 'storyWide', label: 'Histoire — image large' },
  { key: 'storySplit', label: 'Accueil — bloc histoire' },
  { key: 'fabric', label: 'Accueil — bloc matière' },
]

function ContentTab() {
  const { settings, saveSettings } = useAdmin()
  const [f, setF] = useState<SiteContent>({ ...settings.content, mosaic: [...settings.content.mosaic] })
  const [msg, setMsg] = useState('')
  return (
    <div>
      <div className="admin-head">
        <h1>Contenus du site</h1>
        <button
          type="button"
          className="btn"
          onClick={() => {
            saveSettings({ ...settings, content: f })
            setMsg('Contenus enregistrés — visibles immédiatement sur le site.')
          }}
        >
          Enregistrer
        </button>
      </div>
      {msg && <p className="admin-ok">{msg}</p>}
      <div className="admin-card admin-form">
        <h2>Images principales</h2>
        <div className="admin-content-grid">
          {SINGLE_SLOTS.map((s) => (
            <ImagePick
              key={s.key}
              label={s.label}
              value={f[s.key]}
              onChange={(v) => {
                setF((prev) => ({ ...prev, [s.key]: v }))
                setMsg('')
              }}
            />
          ))}
        </div>
        <h2>Mosaïque d’accueil ({f.mosaic.length})</h2>
        <div className="admin-content-grid">
          {f.mosaic.map((src, i) => (
            <ImagePick
              key={`${src}-${i}`}
              label={`Visuel ${i + 1}`}
              value={src}
              onChange={(v) => {
                setF((prev) => ({
                  ...prev,
                  mosaic: prev.mosaic.map((x, j) => (j === i ? v : x)),
                }))
                setMsg('')
              }}
              onRemove={() => {
                setF((prev) => ({ ...prev, mosaic: prev.mosaic.filter((_, j) => j !== i) }))
                setMsg('')
              }}
            />
          ))}
        </div>
        {f.mosaic.length < 6 && (
          <button
            type="button"
            className="btn light"
            onClick={() => setF((prev) => ({ ...prev, mosaic: [...prev.mosaic, ''] }))}
          >
            + Ajouter un visuel
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------- Produits ---------------- */

const blankProduct = (): Product => ({
  slug: '',
  price: 29,
  colors: ['noir', 'blanc'],
  images: [],
  name: { fr: '', en: '', es: '' },
  tagline: { fr: '', en: '', es: '' },
  description: { fr: '', en: '', es: '' },
})

function ProductsTab() {
  const { products, deleteProduct, toggleSoldOut, toggleLimited, resetProducts } =
    useAdmin()
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  return (
    <div>
      <div className="admin-head">
        <h1>Produits ({products.length})</h1>
        <div className="admin-head-btns">
          <button
            type="button"
            className="btn light"
            onClick={() => {
              if (window.confirm('Restaurer le catalogue d’origine ?')) resetProducts()
            }}
          >
            Restaurer
          </button>
          <button type="button" className="btn" onClick={() => setEditing('new')}>
            + Nouveau
          </button>
        </div>
      </div>
      {editing && (
        <ProductForm
          initial={editing === 'new' ? blankProduct() : editing}
          isNew={editing === 'new'}
          onClose={() => setEditing(null)}
        />
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Visuel</th>
            <th>Nom</th>
            <th>Prix</th>
            <th>Limited</th>
            <th>Épuisé</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug}>
              <td>
                {p.images[0] && <img className="admin-thumb" src={p.images[0]} alt="" />}
              </td>
              <td>
                <strong>{p.name.fr || p.slug}</strong>
                <small>{p.slug}</small>
              </td>
              <td>${p.price.toFixed(2)}</td>
              <td>
                <button
                  type="button"
                  className={`admin-pill${p.limited ? ' on' : ''}`}
                  onClick={() => toggleLimited(p.slug)}
                >
                  {p.limited ? 'Oui' : 'Non'}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  className={`admin-pill${p.soldOut ? ' on' : ''}`}
                  onClick={() => toggleSoldOut(p.slug)}
                >
                  {p.soldOut ? 'Oui' : 'Non'}
                </button>
              </td>
              <td className="admin-row-btns">
                <button type="button" className="linkish" onClick={() => setEditing(p)}>
                  Modifier
                </button>
                <button
                  type="button"
                  className="linkish danger"
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${p.name.fr} » ?`))
                      deleteProduct(p.slug)
                  }}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductForm({
  initial,
  isNew,
  onClose,
}: {
  initial: Product
  isNew: boolean
  onClose: () => void
}) {
  const { products, saveProduct } = useAdmin()
  const [f, setF] = useState<Product>({ ...initial })
  const [url, setUrl] = useState('')
  const [err, setErr] = useState('')
  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setF((prev) => ({ ...prev, [k]: v }))

  const save = () => {
    const slug = (f.slug || slugify(f.name.fr)).trim()
    if (!slug) return setErr('Slug manquant.')
    if (!f.name.fr) return setErr('Nom FR requis.')
    if (f.images.length === 0) return setErr('Ajoutez au moins une image.')
    if (products.some((x) => x.slug === slug && (isNew || x.slug !== initial.slug)))
      return setErr('Ce slug existe déjà.')
    saveProduct({ ...f, slug, price: Number(f.price) || 0 })
    onClose()
  }

  const move = (i: number, dir: -1 | 1) => {
    const imgs = [...f.images]
    const j = i + dir
    if (j < 0 || j >= imgs.length) return
    const [x] = imgs.splice(i, 1)
    imgs.splice(j, 0, x)
    set('images', imgs)
  }

  return (
    <div className="admin-card admin-form">
      <h2>{isNew ? 'Nouveau produit' : 'Modifier le produit'}</h2>
      <div className="admin-grid2">
        <label>
          Nom (FR)
          <input
            value={f.name.fr}
            onChange={(e) => {
              const v = e.target.value
              setF((prev) => ({
                ...prev,
                name: { ...prev.name, fr: v },
                slug: isNew && !prev.slug ? slugify(v) : prev.slug,
              }))
            }}
          />
        </label>
        <label>
          Nom (EN)
          <input
            value={f.name.en}
            onChange={(e) => setF((p) => ({ ...p, name: { ...p.name, en: e.target.value } }))}
          />
        </label>
        <label>
          Nom (ES)
          <input
            value={f.name.es}
            onChange={(e) => setF((p) => ({ ...p, name: { ...p.name, es: e.target.value } }))}
          />
        </label>
        <label>
          Slug (URL)
          <input value={f.slug} onChange={(e) => set('slug', slugify(e.target.value))} />
        </label>
        <label>
          Prix ($)
          <input
            type="number"
            min={0}
            step={0.01}
            value={f.price}
            onChange={(e) => set('price', Number(e.target.value))}
          />
        </label>
        <label>
          Accroche (FR)
          <input
            value={f.tagline.fr}
            onChange={(e) =>
              setF((p) => ({ ...p, tagline: { ...p.tagline, fr: e.target.value } }))
            }
          />
        </label>
        <label>
          Accroche (EN)
          <input
            value={f.tagline.en}
            onChange={(e) =>
              setF((p) => ({ ...p, tagline: { ...p.tagline, en: e.target.value } }))
            }
          />
        </label>
        <label>
          Accroche (ES)
          <input
            value={f.tagline.es}
            onChange={(e) =>
              setF((p) => ({ ...p, tagline: { ...p.tagline, es: e.target.value } }))
            }
          />
        </label>
      </div>
      <label>
        Description (FR)
        <textarea
          rows={3}
          value={f.description.fr}
          onChange={(e) =>
            setF((p) => ({ ...p, description: { ...p.description, fr: e.target.value } }))
          }
        />
      </label>
      <label>
        Description (EN)
        <textarea
          rows={3}
          value={f.description.en}
          onChange={(e) =>
            setF((p) => ({ ...p, description: { ...p.description, en: e.target.value } }))
          }
        />
      </label>
      <label>
        Description (ES)
        <textarea
          rows={3}
          value={f.description.es}
          onChange={(e) =>
            setF((p) => ({ ...p, description: { ...p.description, es: e.target.value } }))
          }
        />
      </label>
      <div className="admin-checks">
        <span>Couleurs :</span>
        {COLORS.map((c) => (
          <label key={c} className="admin-check">
            <input
              type="checkbox"
              checked={f.colors.includes(c)}
              onChange={() =>
                set(
                  'colors',
                  f.colors.includes(c)
                    ? f.colors.filter((x) => x !== c)
                    : [...f.colors, c],
                )
              }
            />
            {c}
          </label>
        ))}
        <label className="admin-check">
          <input
            type="checkbox"
            checked={!!f.limited}
            onChange={(e) => set('limited', e.target.checked)}
          />
          Limited
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={!!f.soldOut}
            onChange={(e) => set('soldOut', e.target.checked)}
          />
          Épuisé
        </label>
      </div>
      <p className="muted">
        Images — la première est la couverture. Cliquez ↑ ↓ pour réordonner.
      </p>
      <ul className="admin-imglist">
        {f.images.map((src, i) => (
          <li key={src + i}>
            <img src={src} alt="" />
            <span>{i === 0 ? 'Couverture' : `#${i + 1}`}</span>
            <button type="button" onClick={() => move(i, -1)}>
              ↑
            </button>
            <button type="button" onClick={() => move(i, 1)}>
              ↓
            </button>
            <button
              type="button"
              className="linkish danger"
              onClick={() => set('images', f.images.filter((_, j) => j !== i))}
            >
              Retirer
            </button>
          </li>
        ))}
      </ul>
      <div className="admin-lib">
        {IMAGE_LIBRARY.map((src) => (
          <button
            key={src}
            type="button"
            className={f.images.includes(src) ? 'on' : ''}
            onClick={() =>
              set(
                'images',
                f.images.includes(src)
                  ? f.images.filter((x) => x !== src)
                  : [...f.images, src],
              )
            }
            title={src}
          >
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <div className="admin-urlrow">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… (image externe)"
        />
        <button
          type="button"
          className="btn light"
          onClick={() => {
            if (url.trim()) {
              set('images', [...f.images, url.trim()])
              setUrl('')
            }
          }}
        >
          Ajouter
        </button>
        <UploadButton onDone={(u) => set('images', [...f.images, u])} />
      </div>
      {err && <p className="admin-err">{err}</p>}
      <div className="admin-head-btns">
        <button type="button" className="btn light" onClick={onClose}>
          Annuler
        </button>
        <button type="button" className="btn" onClick={save}>
          Enregistrer
        </button>
      </div>
    </div>
  )
}

/* ---------------- Commandes ---------------- */

const blankOrder = (): Order => ({
  id: Date.now().toString(36),
  createdAt: new Date().toISOString(),
  name: '',
  phone: '',
  detail: '',
  total: 0,
  status: 'new',
})

function OrdersTab() {
  const { orders, saveOrder, deleteOrder } = useAdmin()
  const [editing, setEditing] = useState<Order | 'new' | null>(null)
  return (
    <div>
      <div className="admin-head">
        <h1>Commandes ({orders.length})</h1>
        <button type="button" className="btn" onClick={() => setEditing('new')}>
          + Nouvelle
        </button>
      </div>
      {editing && (
        <OrderForm
          initial={editing === 'new' ? blankOrder() : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {orders.length === 0 ? (
        <p className="muted">Aucune commande pour le moment.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Détail</th>
              <th>Total</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <strong>{o.name || '—'}</strong>
                  <small>{o.phone}</small>
                </td>
                <td className="admin-wrap">{o.detail}</td>
                <td>${Number(o.total || 0).toFixed(2)}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) =>
                      saveOrder({ ...o, status: e.target.value as OrderStatus })
                    }
                  >
                    {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="admin-row-btns">
                  <button type="button" className="linkish" onClick={() => setEditing(o)}>
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="linkish danger"
                    onClick={() => {
                      if (window.confirm('Supprimer cette commande ?'))
                        deleteOrder(o.id)
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function OrderForm({ initial, onClose }: { initial: Order; onClose: () => void }) {
  const { saveOrder } = useAdmin()
  const [f, setF] = useState<Order>({ ...initial })
  return (
    <div className="admin-card admin-form">
      <h2>Commande</h2>
      <div className="admin-grid2">
        <label>
          Client
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </label>
        <label>
          Téléphone / WhatsApp
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </label>
        <label>
          Total ($)
          <input
            type="number"
            min={0}
            step={0.01}
            value={f.total}
            onChange={(e) => setF({ ...f, total: Number(e.target.value) })}
          />
        </label>
        <label>
          Statut
          <select
            value={f.status}
            onChange={(e) => setF({ ...f, status: e.target.value as OrderStatus })}
          >
            {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Détail (produits, tailles, couleurs…)
        <textarea
          rows={3}
          value={f.detail}
          onChange={(e) => setF({ ...f, detail: e.target.value })}
        />
      </label>
      <div className="admin-head-btns">
        <button type="button" className="btn light" onClick={onClose}>
          Annuler
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            saveOrder(f)
            onClose()
          }}
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}

/* ---------------- Newsletter ---------------- */

function SubsTab() {
  const { subscribers, removeSubscriber } = useAdmin()
  const csv = useMemo(() => subscribers.join('\n'), [subscribers])
  return (
    <div>
      <div className="admin-head">
        <h1>Abonnés ({subscribers.length})</h1>
        <button
          type="button"
          className="btn light"
          onClick={() => {
            const blob = new Blob([csv], { type: 'text/csv' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'abonnes-newsletter.csv'
            a.click()
            URL.revokeObjectURL(a.href)
          }}
        >
          Export CSV
        </button>
      </div>
      {subscribers.length === 0 ? (
        <p className="muted">Aucun abonné. Les inscriptions du site arrivent ici.</p>
      ) : (
        <table className="admin-table">
          <tbody>
            {subscribers.map((s) => (
              <tr key={s}>
                <td>{s}</td>
                <td className="admin-row-btns">
                  <button
                    type="button"
                    className="linkish danger"
                    onClick={() => removeSubscriber(s)}
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ---------------- Réglages ---------------- */

function SettingsTab() {
  const { settings, saveSettings, exportAll, importAll, resetProducts, cloud, pushAll } =
    useAdmin()
  const [f, setF] = useState(settings)
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [imp, setImp] = useState('')
  return (
    <div>
      <h1>Réglages</h1>
      <div className="admin-card admin-form">
        <h2>Bandeau promo</h2>
        <label>
          Texte (FR)
          <input
            value={f.promo.fr}
            onChange={(e) => setF({ ...f, promo: { ...f.promo, fr: e.target.value } })}
          />
        </label>
        <label>
          Texte (EN)
          <input
            value={f.promo.en}
            onChange={(e) => setF({ ...f, promo: { ...f.promo, en: e.target.value } })}
          />
        </label>
        <h2>WhatsApp commandes</h2>
        <label>
          Numéro (format international, sans +)
          <input
            value={f.whatsapp}
            onChange={(e) => setF({ ...f, whatsapp: e.target.value.replace(/\D/g, '') })}
          />
        </label>
        <div className="admin-head-btns">
          <button type="button" className="btn" onClick={() => {
            saveSettings(f)
            setMsg('Réglages enregistrés.')
          }}>
            Enregistrer
          </button>
        </div>
        {msg && <p className="admin-ok">{msg}</p>}
      </div>
      <div className="admin-card admin-form">
        <h2>Mot de passe admin</h2>
        <div className="admin-urlrow">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Nouveau mot de passe"
          />
          <button
            type="button"
            className="btn light"
            onClick={() => {
              if (pw.length >= 4) {
                localStorage.setItem(PASS_KEY, pw)
                setPw('')
                setMsg('Mot de passe mis à jour.')
              }
            }}
          >
            Changer
          </button>
        </div>
      </div>
      <div className="admin-card admin-form">
        <h2>Sauvegarde</h2>
        <div className="admin-head-btns">
          <button type="button" className="btn light" onClick={exportAll}>
            Exporter (JSON)
          </button>
          {cloud && (
            <button
              type="button"
              className="btn light"
              onClick={() => {
                pushAll().then(() => setMsg('Tout est synchronisé vers le cloud.'))
              }}
            >
              Tout pousser vers le cloud
            </button>
          )}
          <button
            type="button"
            className="btn light"
            onClick={() => {
              if (window.confirm('Restaurer le catalogue d’origine ?')) resetProducts()
            }}
          >
            Restaurer produits
          </button>
        </div>
        <label>
          Importer (collez un JSON exporté)
          <textarea
            rows={3}
            value={imp}
            onChange={(e) => setImp(e.target.value)}
            placeholder='{"products": […], …}'
          />
        </label>
        <div className="admin-head-btns">
          <button
            type="button"
            className="btn"
            onClick={() => setMsg(importAll(imp) ? 'Import réussi.' : 'JSON invalide.')}
          >
            Importer
          </button>
        </div>
        {msg && <p className="admin-ok">{msg}</p>}
      </div>
    </div>
  )
}
