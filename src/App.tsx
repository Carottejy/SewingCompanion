import { useCallback, useEffect, useRef, useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import { StoreProvider, useStore } from './store'
import { Icone, NavCtx, type Ecran, type Nav, type Onglet } from './ui'
import { estNatif } from './native'
import Projets from './views/Projets'
import Catalogue from './views/Catalogue'
import PatronDetail from './views/PatronDetail'
import ProjetDetail from './views/ProjetDetail'
import Reglages from './views/Reglages'
import { PatronForm, ProjetForm } from './views/Formulaires'

const ONGLETS: { id: Onglet; label: string; icone: string }[] = [
  { id: 'projets', label: 'Projets', icone: 'projets' },
  { id: 'catalogue', label: 'Catalogue', icone: 'catalogue' },
  { id: 'mesPatrons', label: 'Mes patrons', icone: 'ciseaux' },
  { id: 'reglages', label: 'Réglages', icone: 'reglages' },
]

function Coquille() {
  const { pret } = useStore()
  const [onglet, setOnglet] = useState<Onglet>('projets')
  const [pile, setPile] = useState<Ecran[]>([])
  const [toast, setToast] = useState<string>()
  const pileRef = useRef(pile)
  useEffect(() => {
    pileRef.current = pile
  }, [pile])

  const retour = useCallback(() => setPile((p) => p.slice(0, -1)), [])
  const nav: Nav = {
    onglet,
    allerOnglet: (o) => {
      setPile([])
      setOnglet(o)
    },
    ouvrir: (e) => setPile((p) => [...p, e]),
    remplacer: (e) => setPile((p) => [...p.slice(0, -1), e]),
    retour,
    toast: (m) => {
      setToast(m)
      setTimeout(() => setToast(undefined), 2200)
    },
  }

  // bouton retour Android
  useEffect(() => {
    if (!estNatif()) return
    const h = CapApp.addListener('backButton', () => {
      if (pileRef.current.length) retour()
      else if (onglet !== 'projets') setOnglet('projets')
      else CapApp.exitApp()
    })
    return () => {
      h.then((x) => x.remove())
    }
  }, [onglet, retour])

  // touche Échap / geste retour du navigateur en mode web
  useEffect(() => {
    if (estNatif()) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('.feuille') && retour()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [retour])

  if (!pret) return <div className="chargement">Sewing Companion</div>

  const sommet = pile[pile.length - 1]

  return (
    <NavCtx.Provider value={nav}>
      {ONGLETS.map((o) => (
        <div key={o.id} className={'couche' + (onglet !== o.id || sommet ? ' cachee' : '')} aria-hidden={onglet !== o.id || !!sommet}>
          {o.id === 'projets' && <Projets />}
          {o.id === 'catalogue' && <Catalogue />}
          {o.id === 'mesPatrons' && <Catalogue seulementPerso />}
          {o.id === 'reglages' && <Reglages />}
        </div>
      ))}
      {pile.map((e, i) => (
        <div key={i + e.nom + ('id' in e ? e.id : '')} className={'couche ecran' + (i !== pile.length - 1 ? ' cachee' : '')}>
          {e.nom === 'patron' && <PatronDetail id={e.id} />}
          {e.nom === 'projet' && <ProjetDetail id={e.id} />}
          {e.nom === 'projetForm' && <ProjetForm id={e.id} ajouterPatron={e.ajouterPatron} />}
          {e.nom === 'patronForm' && <PatronForm id={e.id} />}
        </div>
      ))}
      <nav className="onglets" aria-label="Navigation principale">
        {ONGLETS.map((o) => (
          <button key={o.id} className={onglet === o.id && !sommet ? 'actif' : ''} aria-current={onglet === o.id} onClick={() => nav.allerOnglet(o.id)}>
            <Icone n={o.icone} />
            <span>{o.label}</span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </NavCtx.Provider>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Coquille />
    </StoreProvider>
  )
}
